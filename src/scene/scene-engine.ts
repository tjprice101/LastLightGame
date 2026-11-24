/**
 * Living scene engine (D-496): draws one scene shader (scene-glsl.ts) full-canvas with plain WebGL 1.
 * One draw per frame, two while cross-fading. Programs compile on first use and are cached.
 * Presentation only: no gameplay value, no gameplay RNG.
 *
 * Costs are bounded: 30 frames a second, a reduced internal resolution, sleep while inactive or while
 * the tab is hidden, and a slow-frame guard that lowers resolution and finally holds a still frame.
 * With motion off it draws one still frame per change.
 */
import { sceneFragment, sceneIds, sceneUniforms, sceneVertex, type SceneId } from './scene-glsl';

export type Rgb = readonly [number, number, number];
/** The three colours a scene may use. */
export interface ScenePalette { deep: Rgb; mid: Rgb; accent: Rgb }
export type SceneQuality = 'high' | 'low';

export function rgbFromHex(hex: string): Rgb {
  const value = parseInt(hex.replace('#', ''), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}
function samePalette(a: ScenePalette, b: ScenePalette): boolean {
  return (['deep', 'mid', 'accent'] as const).every(key => a[key].every((value, index) => value === b[key][index]));
}

export const sceneFadeMs = 1400;
export const sceneFrameMs = 1000 / 30;
/** Internal resolution as a fraction of CSS pixels times device pixel ratio (capped), and noise octaves. */
export const sceneQuality: Readonly<Record<SceneQuality, { scale: number; octaves: number }>> = {
  high: { scale: .75, octaves: 5 },
  low: { scale: .5, octaves: 3 },
};
export const sceneMaxPixelRatio = 1.5;
export const sceneMinScale = .35;
/** This many slow frames (net of fast ones) lowers the resolution one step. */
export const sceneSlowFrameMs = 50;
export const sceneSlowFrameLimit = 12;

/** The eased values behind the uniforms. Phaser-free and DOM-free so it can be tested directly. */
export class SceneMotion {
  pulse = 0;
  intensity = 0;
  targetIntensity = 0;
  seconds = 0;
  readonly pointer: [number, number] = [0, 0];
  readonly pointerTarget: [number, number] = [0, 0];

  /** An action landed: the scene breathes, then settles. */
  kick(amount = .35): void { this.pulse = Math.min(1.5, this.pulse + Math.max(0, amount)); }
  advance(seconds: number): void {
    if (seconds <= 0) return;
    const ease = Math.min(1, seconds * 2);
    // Wrapped so float precision holds through long sessions.
    this.seconds = (this.seconds + seconds) % 3600;
    this.pulse *= Math.exp(-seconds * 3.2);
    if (this.pulse < .001) this.pulse = 0;
    this.intensity += (this.targetIntensity - this.intensity) * ease;
    this.pointer[0] += (this.pointerTarget[0] - this.pointer[0]) * ease;
    this.pointer[1] += (this.pointerTarget[1] - this.pointer[1]) * ease;
  }
  /** Motion off: everything sits at its resting value. */
  settle(): void {
    this.pulse = 0;
    this.intensity = this.targetIntensity;
    this.pointer[0] = 0; this.pointer[1] = 0;
  }
}

/** Smoothstep-eased crossfade progress, 0 to 1. */
export function fadeLevel(elapsedMs: number, fadeMs = sceneFadeMs): number {
  const t = Math.min(1, Math.max(0, elapsedMs / Math.max(1, fadeMs)));
  return t * t * (3 - 2 * t);
}

interface Program { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> }
interface Shown { id: SceneId; palette: ScenePalette }

export interface SceneEngineOptions {
  quality: SceneQuality;
  /** False under Reduce motion: one still frame per change. */
  motionAllowed: () => boolean;
  /** Called once if the engine can no longer draw (context lost for good, or no scene compiles). */
  onFail?: () => void;
}

export class SceneEngine {
  readonly motion = new SceneMotion();
  /** Scenes whose shader failed to compile or link on this device. */
  readonly failed = new Set<SceneId>();
  private gl: WebGLRenderingContext | null;
  private buffer: WebGLBuffer | null = null;
  private programs = new Map<SceneId, Program>();
  private current: Shown | null = null;
  private previous: Shown | null = null;
  private fadeStart = 0;
  private scale: number;
  private active = false;
  private stilled = false;
  private raf = 0;
  private lastFrame = 0;
  private lastDraw = 0;
  private slowFrames = 0;
  private dead = false;

  constructor(private readonly canvas: HTMLCanvasElement, private readonly options: SceneEngineOptions) {
    this.scale = sceneQuality[options.quality].scale;
    this.gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false }) as WebGLRenderingContext | null;
    if (!this.gl) return;
    this.prepare();
    canvas.addEventListener('webglcontextlost', this.contextLost);
    canvas.addEventListener('webglcontextrestored', this.contextRestored);
    document.addEventListener('visibilitychange', this.wake);
    window.addEventListener('resize', this.refresh);
    window.addEventListener('pointermove', this.pointerMove, { passive: true });
  }

  get supported(): boolean { return !!this.gl && !this.dead; }
  /** The GPU's name, when the browser exposes it (used to keep software rendering on the fallback). */
  get renderer(): string | null {
    const gl = this.gl;
    const info = gl?.getExtension('WEBGL_debug_renderer_info');
    return gl && info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : null;
  }
  get sceneId(): SceneId | null { return this.current?.id ?? null; }
  /** Internal resolution scale after any slow-frame steps. */
  get resolutionScale(): number { return this.scale; }
  /** True once the slow-frame guard has given up animating on this device. */
  get still(): boolean { return this.stilled; }

  /** Shows a scene, cross-fading from the one before. A scene that cannot compile falls back to the first that can. */
  setScene(id: SceneId, palette: ScenePalette): void {
    if (!this.supported) return;
    const usable = this.program(id) ? id : sceneIds.find(other => this.program(other)) ?? null;
    if (!usable) { this.fail(); return; }
    if (this.current && this.current.id === usable && samePalette(this.current.palette, palette)) return;
    const animated = this.animated;
    this.previous = animated ? this.current : null;
    this.current = { id: usable, palette };
    this.fadeStart = performance.now();
    this.wake();
  }
  setIntensity(value: number): void {
    this.motion.targetIntensity = Math.min(1, Math.max(0, value));
    this.wake();
  }
  kick(amount?: number): void {
    if (!this.animated) return;
    this.motion.kick(amount);
  }
  /** Inactive scenes do no work at all (battle owns the GPU; a hidden backdrop has nothing to show). */
  setActive(active: boolean): void {
    if (this.active === active) return;
    this.active = active;
    if (active) this.wake(); else cancelAnimationFrame(this.raf);
  }
  /** Redraws after a resize or a motion-setting change. */
  readonly refresh = (): void => { this.wake(); };

  dispose(): void {
    this.active = false;
    cancelAnimationFrame(this.raf);
    this.canvas.removeEventListener('webglcontextlost', this.contextLost);
    this.canvas.removeEventListener('webglcontextrestored', this.contextRestored);
    document.removeEventListener('visibilitychange', this.wake);
    window.removeEventListener('resize', this.refresh);
    window.removeEventListener('pointermove', this.pointerMove);
    this.gl?.getExtension('WEBGL_lose_context')?.loseContext();
    this.gl = null;
  }

  private get animated(): boolean { return !this.stilled && this.options.motionAllowed(); }

  private prepare(): void {
    const gl = this.gl;
    if (!gl) return;
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    // One oversized triangle covers the canvas.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }
  private readonly contextLost = (event: Event): void => {
    event.preventDefault();
    cancelAnimationFrame(this.raf);
    this.programs.clear();
  };
  private readonly contextRestored = (): void => { this.prepare(); this.wake(); };
  private readonly pointerMove = (event: PointerEvent): void => {
    this.motion.pointerTarget[0] = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
    this.motion.pointerTarget[1] = -((event.clientY / Math.max(1, window.innerHeight)) * 2 - 1);
  };
  private fail(): void {
    if (this.dead) return;
    this.dead = true;
    cancelAnimationFrame(this.raf);
    this.options.onFail?.();
  }

  private program(id: SceneId): Program | null {
    const gl = this.gl;
    if (!gl || this.failed.has(id)) return null;
    const cached = this.programs.get(id);
    if (cached) return cached;
    const vertex = this.compile(gl.VERTEX_SHADER, sceneVertex), fragment = this.compile(gl.FRAGMENT_SHADER, sceneFragment(id));
    const program = vertex && fragment ? gl.createProgram() : null;
    if (!vertex || !fragment || !program) { this.failed.add(id); return null; }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.bindAttribLocation(program, 0, 'aPos');
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS) && !gl.isContextLost()) {
      console.error(`Scene "${id}" could not link; another scene is shown instead.`, gl.getProgramInfoLog(program));
      this.failed.add(id);
      return null;
    }
    const uniforms: Program['uniforms'] = {};
    for (const name of sceneUniforms) uniforms[name] = gl.getUniformLocation(program, name);
    const built = { program, uniforms };
    this.programs.set(id, built);
    return built;
  }
  private compile(type: number, source: string): WebGLShader | null {
    const gl = this.gl;
    const shader = gl?.createShader(type);
    if (!gl || !shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) || gl.isContextLost()) return shader;
    console.error('A scene shader could not compile; another scene is shown instead.', gl.getShaderInfoLog(shader));
    return null;
  }

  /** Starts the loop if there is something to animate; otherwise draws one still frame. */
  private readonly wake = (): void => {
    cancelAnimationFrame(this.raf);
    if (!this.supported || !this.active || !this.current || document.hidden) return;
    this.lastFrame = 0;
    this.raf = requestAnimationFrame(this.frame);
  };
  private readonly frame = (now: number): void => {
    if (!this.supported || !this.active || document.hidden) return;
    if (!this.animated) {
      this.motion.settle();
      this.previous = null;
      this.draw(now, 1);
      return;
    }
    const sinceFrame = this.lastFrame ? now - this.lastFrame : 0;
    this.lastFrame = now;
    this.watchPace(sinceFrame);
    // 30 frames a second: skip display frames that arrive early.
    if (now - this.lastDraw >= sceneFrameMs - 4) {
      this.motion.advance(Math.min(.1, (now - this.lastDraw) / 1000));
      const fade = this.previous ? fadeLevel(now - this.fadeStart) : 1;
      if (fade >= 1) this.previous = null;
      this.draw(now, fade);
    }
    this.raf = requestAnimationFrame(this.frame);
  };
  /** Slow-frame guard: lower the resolution a step at a time, then hold a still frame. */
  private watchPace(sinceFrame: number): void {
    if (sinceFrame <= 0 || sinceFrame > 1000) return;
    this.slowFrames = sinceFrame > sceneSlowFrameMs ? this.slowFrames + 1 : Math.max(0, this.slowFrames - 1);
    if (this.slowFrames < sceneSlowFrameLimit) return;
    this.slowFrames = 0;
    if (this.scale > sceneMinScale) this.scale = Math.max(sceneMinScale, this.scale - .15);
    else this.stilled = true;
  }

  private resize(): void {
    const ratio = Math.min(window.devicePixelRatio || 1, sceneMaxPixelRatio) * this.scale;
    const width = Math.max(1, Math.floor(this.canvas.clientWidth * ratio));
    const height = Math.max(1, Math.floor(this.canvas.clientHeight * ratio));
    if (this.canvas.width !== width) this.canvas.width = width;
    if (this.canvas.height !== height) this.canvas.height = height;
  }
  private draw(now: number, fade: number): void {
    const gl = this.gl;
    if (!gl || !this.current || gl.isContextLost()) return;
    this.lastDraw = now;
    this.resize();
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    if (this.previous && fade < 1) this.drawScene(this.previous, 1);
    this.drawScene(this.current, this.previous ? fade : 1);
  }
  private drawScene(shown: Shown, alpha: number): void {
    const gl = this.gl, built = this.program(shown.id);
    if (!gl || !built) return;
    const { uniforms } = built, motion = this.motion;
    gl.useProgram(built.program);
    gl.uniform2f(uniforms.uRes, this.canvas.width, this.canvas.height);
    gl.uniform1f(uniforms.uTime, motion.seconds);
    gl.uniform1f(uniforms.uPulse, motion.pulse);
    gl.uniform1f(uniforms.uIntensity, motion.intensity);
    gl.uniform2f(uniforms.uPointer, motion.pointer[0], motion.pointer[1]);
    gl.uniform1f(uniforms.uFade, alpha);
    gl.uniform1f(uniforms.uOctaves, sceneQuality[this.options.quality].octaves);
    gl.uniform3fv(uniforms.uC1, shown.palette.deep as unknown as number[]);
    gl.uniform3fv(uniforms.uC2, shown.palette.mid as unknown as number[]);
    gl.uniform3fv(uniforms.uC3, shown.palette.accent as unknown as number[]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
