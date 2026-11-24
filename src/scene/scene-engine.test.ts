// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fadeLevel, rgbFromHex, SceneEngine, SceneMotion, sceneFadeMs, sceneMinScale, sceneQuality, sceneSlowFrameLimit,
  type ScenePalette } from './scene-engine';

const palette: ScenePalette = { deep: [0, 0, 0], mid: [.1, .1, .2], accent: [1, .8, .4] };
const other: ScenePalette = { ...palette, accent: [.4, .8, 1] };

describe('SceneMotion', () => {
  it('a kick decays to rest and is capped', () => {
    const motion = new SceneMotion();
    motion.kick(.9); motion.kick(.9);
    expect(motion.pulse).toBe(1.5);
    motion.advance(.1);
    expect(motion.pulse).toBeCloseTo(1.5 * Math.exp(-.32));
    for (let index = 0; index < 60; index++) motion.advance(.1);
    expect(motion.pulse).toBe(0);
  });
  it('intensity and the pointer ease toward their targets', () => {
    const motion = new SceneMotion();
    motion.targetIntensity = .35; motion.pointerTarget[0] = 1;
    motion.advance(.1);
    expect(motion.intensity).toBeCloseTo(.07);
    expect(motion.pointer[0]).toBeCloseTo(.2);
    for (let index = 0; index < 80; index++) motion.advance(.1);
    expect(motion.intensity).toBeCloseTo(.35);
  });
  it('does not move on a frozen clock, and settles at rest with motion off', () => {
    const motion = new SceneMotion();
    motion.kick(1); motion.targetIntensity = .35; motion.pointerTarget[1] = -1;
    motion.advance(0);
    expect(motion.pulse).toBe(1);
    expect(motion.seconds).toBe(0);
    motion.settle();
    expect([motion.pulse, motion.intensity, motion.pointer[1]]).toEqual([0, .35, 0]);
  });
  it('wraps time so precision holds', () => {
    const motion = new SceneMotion();
    motion.seconds = 3599.95;
    motion.advance(.1);
    expect(motion.seconds).toBeLessThan(1);
  });
});

describe('helpers', () => {
  it('fadeLevel eases from 0 to 1', () => {
    expect(fadeLevel(-5)).toBe(0);
    expect(fadeLevel(sceneFadeMs / 2)).toBeCloseTo(.5);
    expect(fadeLevel(sceneFadeMs * 2)).toBe(1);
    expect(fadeLevel(sceneFadeMs / 4)).toBeLessThan(.25);
  });
  it('rgbFromHex reads #rrggbb', () => {
    expect(rgbFromHex('#ff8000')).toEqual([1, 128 / 255, 0]);
  });
  it('low quality is cheaper, not a different look', () => {
    expect(sceneQuality.low.scale).toBeLessThan(sceneQuality.high.scale);
    expect(sceneQuality.low.octaves).toBeLessThan(sceneQuality.high.octaves);
  });
});

/** A WebGL stand-in that records draws; a scene whose source contains a `broken` marker fails to compile. */
function fakeGl(broken: string[] = []) {
  const draws: { fade: number; accent: number[] }[] = [];
  let fade = 1, accent: number[] = [];
  const gl = {
    VERTEX_SHADER: 1, FRAGMENT_SHADER: 2, COMPILE_STATUS: 3, LINK_STATUS: 4, ARRAY_BUFFER: 5, STATIC_DRAW: 6, FLOAT: 7, BLEND: 8,
    SRC_ALPHA: 9, ONE_MINUS_SRC_ALPHA: 10, TRIANGLES: 11,
    createBuffer: () => ({}), bindBuffer() {}, bufferData() {}, enableVertexAttribArray() {}, vertexAttribPointer() {}, enable() {}, blendFunc() {},
    createShader: () => ({ ok: true }),
    shaderSource(shader: { ok: boolean }, text: string) { shader.ok = !broken.some(marker => text.includes(marker)); },
    compileShader() {}, getShaderParameter: (shader: { ok: boolean }) => shader.ok, getShaderInfoLog: () => 'failed',
    createProgram: () => ({}), attachShader() {}, bindAttribLocation() {}, linkProgram() {}, getProgramParameter: () => true, getProgramInfoLog: () => '',
    getUniformLocation: (_program: object, name: string) => name, isContextLost: () => false, getExtension: () => null, getParameter: () => null,
    useProgram() {}, viewport() {}, uniform2f() {},
    uniform1f(name: string, value: number) { if (name === 'uFade') fade = value; },
    uniform3fv(name: string, value: number[]) { if (name === 'uC3') accent = [...value]; },
    drawArrays() { draws.push({ fade, accent }); },
  };
  return { gl, draws };
}

describe('SceneEngine', () => {
  let frames: FrameRequestCallback[] = [], now = 0, motionAllowed = true;
  const step = (ms: number) => { now += ms; const due = frames; frames = []; for (const frame of due) frame(now); };
  function engine(broken: string[] = [], onFail = vi.fn()) {
    const { gl, draws } = fakeGl(broken);
    const canvas = document.createElement('canvas');
    Object.defineProperty(canvas, 'clientWidth', { value: 800 });
    Object.defineProperty(canvas, 'clientHeight', { value: 600 });
    canvas.getContext = (() => gl) as unknown as HTMLCanvasElement['getContext'];
    return { scene: new SceneEngine(canvas, { quality: 'high', motionAllowed: () => motionAllowed, onFail }), draws, canvas, onFail };
  }
  beforeEach(() => {
    frames = []; now = 1000; motionAllowed = true;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frames.push(callback); return frames.length; });
    vi.stubGlobal('cancelAnimationFrame', () => { frames = []; });
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

  it('does nothing until it is active, then draws at most 30 frames a second', () => {
    const { scene, draws, canvas } = engine();
    scene.setScene('sanctuary', palette);
    expect(frames).toHaveLength(0);
    scene.setActive(true);
    step(16);
    expect(draws).toHaveLength(1);
    expect(canvas.width).toBe(Math.floor(800 * sceneQuality.high.scale));
    step(16);
    expect(draws).toHaveLength(1);
    step(17);
    expect(draws).toHaveLength(2);
    scene.setActive(false);
    step(100);
    expect(draws).toHaveLength(2);
  });
  it('cross-fades to a new scene with two draws, then returns to one', () => {
    const { scene, draws } = engine();
    scene.setActive(true);
    scene.setScene('sanctuary', palette);
    step(40);
    scene.setScene('astral', other);
    step(40);
    expect(draws.slice(-2).map(draw => draw.accent)).toEqual([palette.accent, other.accent]);
    expect(draws.at(-2)!.fade).toBe(1);
    expect(draws.at(-1)!.fade).toBeGreaterThan(0);
    expect(draws.at(-1)!.fade).toBeLessThan(.1);
    step(sceneFadeMs);
    const before = draws.length;
    step(40);
    expect(draws.length).toBe(before + 1);
    expect(draws.at(-1)).toEqual({ fade: 1, accent: other.accent });
  });
  it('showing the same scene and palette again changes nothing', () => {
    const { scene, draws } = engine();
    scene.setActive(true);
    scene.setScene('vault', palette);
    step(40);
    scene.setScene('vault', { ...palette });
    step(40);
    expect(draws).toHaveLength(2);
    expect(draws.every(draw => draw.fade === 1)).toBe(true);
  });
  it('with motion off it draws one still frame per change, with no crossfade and no pulse', () => {
    motionAllowed = false;
    const { scene, draws } = engine();
    scene.setActive(true);
    scene.setScene('sanctuary', palette);
    step(40); step(40); step(40);
    expect(draws).toHaveLength(1);
    scene.kick(1);
    expect(scene.motion.pulse).toBe(0);
    scene.setScene('astral', other);
    step(40); step(40);
    expect(draws).toHaveLength(2);
    expect(draws[1]).toEqual({ fade: 1, accent: other.accent });
    motionAllowed = true;
    scene.refresh();
    step(40); step(40);
    expect(draws.length).toBeGreaterThan(3);
  });
  it('a scene that cannot compile falls back to one that can', () => {
    const { scene, onFail } = engine(['dash(turn * 24.']);
    scene.setActive(true);
    scene.setScene('astral', palette);
    expect(scene.sceneId).toBe('sanctuary');
    expect([...scene.failed]).toEqual(['astral']);
    expect(onFail).not.toHaveBeenCalled();
  });
  it('reports failure once when no scene compiles', () => {
    const { scene, onFail, draws } = engine(['vec3 scene']);
    scene.setActive(true);
    scene.setScene('sanctuary', palette);
    scene.setScene('astral', palette);
    step(40);
    expect(onFail).toHaveBeenCalledTimes(1);
    expect(scene.supported).toBe(false);
    expect(draws).toHaveLength(0);
  });
  it('sustained slow frames lower the resolution step by step, then hold a still frame', () => {
    const { scene, draws } = engine();
    scene.setActive(true);
    scene.setScene('sanctuary', palette);
    step(16);
    for (let index = 0; index <= sceneSlowFrameLimit; index++) step(80);
    expect(scene.resolutionScale).toBeCloseTo(sceneQuality.high.scale - .15);
    for (let index = 0; index < sceneSlowFrameLimit * 8 && !scene.still; index++) step(80);
    expect(scene.resolutionScale).toBe(sceneMinScale);
    expect(scene.still).toBe(true);
    const held = draws.length;
    step(80); step(80); step(80);
    expect(draws.length).toBe(held + 1);
  });
  it('is unsupported without WebGL', () => {
    const canvas = document.createElement('canvas');
    canvas.getContext = (() => null) as unknown as HTMLCanvasElement['getContext'];
    const scene = new SceneEngine(canvas, { quality: 'low', motionAllowed: () => true });
    expect(scene.supported).toBe(false);
    scene.setScene('sanctuary', palette);
    scene.setActive(true);
    expect(frames).toHaveLength(0);
  });
});
