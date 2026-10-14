import type { VFXContext, BaseVFXSystem, VFXArchetype, AbilityVFXDefinition, CharacterVFXProfile } from './types';
import { CHARACTER_PROFILES, createVFXSystem } from './vfx-registry';
import { VFXRenderer } from './vfx-renderer';
import { advanceVFX, releaseEnvelope } from './vfx-motion';

export interface MasterVFXConfig {
  bloomIntensity: number;
  bloomRadius: number;
  lensGlowIntensity: number;
  flareStreakLength: number;
  sparkCountMultiplier: number;
  smokeDensityMultiplier: number;
  chromaticDispersion: number;
  enableOpticalFlares: boolean;
  enablePostBloom: boolean;
  enableScreenDistortion: boolean;
  enableFloorReflections: boolean;
  enableCameraShake: boolean;
  playbackSpeed: number;
  loop: boolean;
  renderArenaBackdrop: boolean;
}

export const DEFAULT_MASTER_CONFIG: MasterVFXConfig = {
  bloomIntensity: 1.25,
  bloomRadius: 28,
  lensGlowIntensity: 1.15,
  flareStreakLength: 1.3,
  sparkCountMultiplier: 1.0,
  smokeDensityMultiplier: 1.0,
  chromaticDispersion: 2.5,
  enableOpticalFlares: true,
  enablePostBloom: true,
  enableScreenDistortion: true,
  enableFloorReflections: true,
  enableCameraShake: true,
  playbackSpeed: 1.0,
  loop: true,
  renderArenaBackdrop: true,
};

export class MasterVFXEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderer: VFXRenderer;
  private simulationTime = 0;
  
  public config: MasterVFXConfig = { ...DEFAULT_MASTER_CONFIG };
  private activeProfile: CharacterVFXProfile;
  private activeAbilityTier: 'light' | 'skill1' | 'skill2' | 'ultimate' = 'skill1';
  private activeSystem: BaseVFXSystem;
  
  private currentTime = 0;
  private isPlaying = true;
  private lastTimestamp = 0;
  private animationFrameId: number | null = null;
  
  // Camera shake state
  private shakeIntensity = 0;
  private shakeDecay = 0.9;
  private shakeOffsetX = 0;
  private shakeOffsetY = 0;
  
  private onProgressCallbacks: ((progress: number, time: number, total: number) => void)[] = [];

  constructor(canvas: HTMLCanvasElement, characterId = 'ember', abilityTier: 'light' | 'skill1' | 'skill2' | 'ultimate' = 'skill1') {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('Could not acquire 2D context from canvas');
    this.ctx = ctx;

    this.renderer = new VFXRenderer(ctx);

    this.activeProfile = CHARACTER_PROFILES[characterId] || CHARACTER_PROFILES.ember;
    this.activeAbilityTier = abilityTier;
    const ability = this.getAbility();
    this.activeSystem = createVFXSystem(ability.archetype);
    
    this.resizeCanvas();
    this.initCurrentAbility();
  }

  public resizeCanvas(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(rect.width || 960, 320);
    const height = Math.max(rect.height || 540, 240);

    if (this.canvas.width !== width * dpr || this.canvas.height !== height * dpr) {
      this.canvas.width = width * dpr;
      this.canvas.height = height * dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    }
  }

  public setCharacter(characterId: string): void {
    if (CHARACTER_PROFILES[characterId]) {
      this.activeProfile = CHARACTER_PROFILES[characterId];
      this.initCurrentAbility();
    }
  }

  public setAbility(tier: 'light' | 'skill1' | 'skill2' | 'ultimate'): void {
    this.activeAbilityTier = tier;
    this.initCurrentAbility();
  }

  public getProfile(): CharacterVFXProfile {
    return this.activeProfile;
  }

  public getAbility(): AbilityVFXDefinition {
    return this.activeProfile.abilities[this.activeAbilityTier];
  }

  public getArchetype(): VFXArchetype {
    return this.getAbility().archetype;
  }

  public initCurrentAbility(): void {
    const ability = this.getAbility();
    this.activeSystem = createVFXSystem(ability.archetype);
    this.currentTime = 0;
    this.simulationTime = 0;
    this.shakeIntensity = 0;
    this.activeSystem.reset();
  }

  public play(): void {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.lastTimestamp = performance.now();
      this.tick(this.lastTimestamp);
    }
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public togglePlay(): boolean {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  public restart(): void {
    this.initCurrentAbility();
    this.play();
  }

  public scrub(normalizedProgress: number): void {
    this.pause();
    const ability = this.getAbility();
    this.currentTime = Math.max(0, Math.min(1, normalizedProgress)) * ability.duration;
    this.simulationTime = 0;
    this.activeSystem.reset();
    this.shakeOffsetX = this.shakeOffsetY = this.shakeIntensity = 0;
    this.renderFrame();
  }

  public onProgress(cb: (progress: number, time: number, total: number) => void): void {
    this.onProgressCallbacks.push(cb);
  }

  public start(): void {
    this.isPlaying = true;
    this.lastTimestamp = performance.now();
    this.tick(this.lastTimestamp);
  }

  public destroy(): void {
    this.pause();
    this.onProgressCallbacks = [];
  }

  private tick = (timestamp: number): void => {
    if (!this.isPlaying) return;

    if (!this.lastTimestamp) this.lastTimestamp = timestamp;
    const deltaMs = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    const dt = Math.min(deltaMs / 1000, 0.1) * this.config.playbackSpeed;
    const ability = this.getAbility();

    this.currentTime += dt;

    // Check impact moment for screen shake and flash
    const prevT = this.currentTime - dt;
    if (prevT < ability.chargeDuration && this.currentTime >= ability.chargeDuration) {
      this.triggerImpactEffects(ability);
    }

    if (this.currentTime >= ability.duration) {
      if (this.config.loop) {
        this.currentTime = 0;
        this.simulationTime = 0;
        this.activeSystem.reset();
      } else {
        this.currentTime = ability.duration;
        this.pause();
      }
    }

    this.updateCameraShake(dt);
    this.renderFrame();

    const progress = ability.duration > 0 ? this.currentTime / ability.duration : 0;
    for (const cb of this.onProgressCallbacks) {
      cb(progress, this.currentTime, ability.duration);
    }

    if (this.isPlaying) {
      this.animationFrameId = requestAnimationFrame(this.tick);
    }
  };

  private triggerImpactEffects(ability: AbilityVFXDefinition): void {
    const mult = ability.tier === 'ultimate' ? 1.8 : ability.tier === 'skill2' ? 1.2 : ability.tier === 'skill1' ? 1.0 : 0.6;
    this.shakeIntensity = 4 * mult;
  }

  private updateCameraShake(dt: number): void {
    if (!this.config.enableCameraShake) {
      this.shakeOffsetX = this.shakeOffsetY = this.shakeIntensity = 0;
      return;
    }
    if (this.shakeIntensity > 0.05) {
      this.shakeOffsetX = Math.sin(this.currentTime * 43) * this.shakeIntensity;
      this.shakeOffsetY = Math.sin(this.currentTime * 37 + .8) * this.shakeIntensity * .6;
      this.shakeIntensity *= Math.pow(this.shakeDecay, dt * 60);
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
      this.shakeIntensity = 0;
    }

  }

  private renderFrame(): void {
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || (this.canvas.width / (window.devicePixelRatio || 1));
    const height = rect.height || (this.canvas.height / (window.devicePixelRatio || 1));

    const ctx = this.ctx;
    ctx.save();

    // Clear frame
    ctx.clearRect(0, 0, width, height);

    // Apply Camera Shake
    ctx.translate(this.shakeOffsetX, this.shakeOffsetY);

    // Draw dark atmospheric backdrop if enabled (studio preview)
    if (this.config.renderArenaBackdrop) {
      this.drawArenaBackdrop(ctx, width, height);
    }

    // Construct VFX context
    const ability = this.getAbility();
    const vfxContext: VFXContext = {
      ctx,
      width,
      height,
      t: this.simulationTime,
      dt: 0,
      progress: ability.duration > 0 ? Math.min(1, this.currentTime / ability.duration) : 0,
      scale: Math.min(width / 960, height / 540) * (ability.tier === 'ultimate' ? 1.15 : 1.0),
      palette: ability.palette,
      definition: ability,
      targetX: width * 0.58,
      targetY: height * 0.58,
      casterX: width * 0.22,
      casterY: height * 0.65,
      shakeCallback: (mag: number) => {
        this.shakeIntensity = Math.max(this.shakeIntensity, Math.min(7, mag * .2));
      },
    };

    // Update simulation
    advanceVFX(this.activeSystem, vfxContext, this.currentTime);
    this.simulationTime = vfxContext.t;

    // 1. Draw Background / Ground Lighting / Reflection
    if (this.config.enableFloorReflections) {
      this.renderFloorReflection(vfxContext);
    }

    // 2. Render Core Archetype System
    this.renderer.begin(width, height, Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.render(this.activeSystem, vfxContext, this.config.enableOpticalFlares);
    this.renderer.composite(width, height, {
      enabled: this.config.enablePostBloom,
      intensity: this.config.bloomIntensity,
      radius: this.config.bloomRadius,
    });

    // 4. Post-pass: Screen bloom & optical flare overlays
    if (this.config.enableOpticalFlares && this.config.flareStreakLength > 0.2) {
      this.renderOpticalPass(vfxContext);
    }

    // 5. Chromatic Edge Vignette
    this.renderEdgeVignette(width, height);

    ctx.restore();
  }

  private drawArenaBackdrop(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();
    // 1. Deep atmospheric dark radial gradient
    const bgGrad = ctx.createRadialGradient(width * 0.5, height * 0.45, 10, width * 0.5, height * 0.45, Math.max(width, height) * 0.75);
    bgGrad.addColorStop(0, '#0d1527');
    bgGrad.addColorStop(0.5, '#070b14');
    bgGrad.addColorStop(1, '#020306');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Horizon and Perspective Ground Grid
    const horizonY = height * 0.5;
    const groundGrad = ctx.createLinearGradient(0, horizonY, 0, height);
    groundGrad.addColorStop(0, 'rgba(15, 23, 42, 0.1)');
    groundGrad.addColorStop(1, 'rgba(30, 41, 59, 0.5)');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, horizonY, width, height - horizonY);

    // Perspective Grid Lines
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.2)';
    ctx.lineWidth = 1;
    const vanishX = width * 0.5;
    const count = 16;
    for (let i = 0; i <= count; i++) {
      const bx = (width / count) * i;
      ctx.beginPath();
      ctx.moveTo(vanishX, horizonY);
      ctx.lineTo(bx, height);
      ctx.stroke();
    }
    for (let j = 1; j <= 6; j++) {
      const py = horizonY + (height - horizonY) * Math.pow(j / 6, 2);
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
      ctx.stroke();
    }

    // Caster & Target Reticle Floor Rings
    const casterX = width * 0.22;
    const casterY = height * 0.65;
    const targetX = width * 0.58;
    const targetY = height * 0.58;

    ctx.beginPath();
    ctx.ellipse(casterX, casterY + 28, 48, 14, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(targetX, targetY + 28, 62, 18, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  private renderFloorReflection(ctxObj: VFXContext): void {
    const { ctx, width, height, targetX, targetY, palette, progress } = ctxObj;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const groundY = targetY + 30 * ctxObj.scale;
    const pulse = Math.sin(progress * Math.PI) ** 2;
    const grad = ctx.createRadialGradient(targetX, groundY, 10, targetX, groundY, 260 * ctxObj.scale);
    grad.addColorStop(0, `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${0.35 * pulse * this.config.bloomIntensity})`);
    grad.addColorStop(0.5, `rgba(${palette.mid.r}, ${palette.mid.g}, ${palette.mid.b}, ${0.15 * pulse})`);
    grad.addColorStop(1, 'transparent');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(targetX, groundY, 260 * ctxObj.scale, 70 * ctxObj.scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderOpticalPass(ctxObj: VFXContext): void {
    const { ctx, width, targetX, targetY, palette, t, definition } = ctxObj;
    const peakFactor = releaseEnvelope(t - definition.chargeDuration, Math.min(.7, definition.impactDuration));
    if (!peakFactor) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const streakLength = width * 0.45 * this.config.flareStreakLength * peakFactor;
    const streakHeight = 4 * this.config.lensGlowIntensity * peakFactor;

    // Horizontal Anamorphic Streak
    const streakGrad = ctx.createLinearGradient(targetX - streakLength, targetY, targetX + streakLength, targetY);
    streakGrad.addColorStop(0, 'transparent');
    streakGrad.addColorStop(0.3, `rgba(${palette.mid.r}, ${palette.mid.g}, ${palette.mid.b}, ${0.4 * peakFactor})`);
    streakGrad.addColorStop(0.5, `rgba(${palette.core.r}, ${palette.core.g}, ${palette.core.b}, ${0.9 * peakFactor})`);
    streakGrad.addColorStop(0.7, `rgba(${palette.mid.r}, ${palette.mid.g}, ${palette.mid.b}, ${0.4 * peakFactor})`);
    streakGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = streakGrad;
    ctx.fillRect(targetX - streakLength, targetY - streakHeight, streakLength * 2, streakHeight * 2);

    // Diffraction Cross Star
    const starSize = 110 * ctxObj.scale * peakFactor;
    for (const angle of [0, Math.PI * 0.5]) {
      ctx.save();
      ctx.translate(targetX, targetY);
      ctx.rotate(angle);
      const crossGrad = ctx.createLinearGradient(-starSize, 0, starSize, 0);
      crossGrad.addColorStop(0, 'transparent');
      crossGrad.addColorStop(0.5, `rgba(${palette.core.r}, ${palette.core.g}, ${palette.core.b}, ${0.85 * peakFactor})`);
      crossGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = crossGrad;
      ctx.fillRect(-starSize, -2, starSize * 2, 4);
      ctx.restore();
    }

    ctx.restore();
  }

  private renderEdgeVignette(width: number, height: number): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';

    const radius = Math.max(width, height) * 0.72;
    const vigGrad = ctx.createRadialGradient(width / 2, height / 2, radius * 0.4, width / 2, height / 2, radius);
    vigGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    vigGrad.addColorStop(0.8, 'rgba(240, 240, 245, 0.95)');
    vigGrad.addColorStop(1, 'rgba(15, 12, 22, 0.65)');

    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}
