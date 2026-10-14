import type { AbilityTier, VFXContext } from './types';
import { createVFXSystem, getVFXProfileForCombatant } from './vfx-registry';
import { VFXRenderer } from './vfx-renderer';
import { advanceVFX } from './vfx-motion';

export class BattleVFXRunner {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderer: VFXRenderer;
  private currentAnimationId: number | null = null;
  private activeAbortController: AbortController | null = null;
  private activeResolver: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('BattleVFXRunner: Could not get 2D canvas context');
    this.ctx = ctx;
    this.renderer = new VFXRenderer(ctx);
  }

  public syncCanvasSize(): { width: number; height: number; dpr: number } {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    if (![width, height].every(value => Number.isFinite(value) && value > 0)) {
      throw new Error('Battle VFX canvas has no visible area.');
    }

    if (this.canvas.width !== Math.round(width * dpr) || this.canvas.height !== Math.round(height * dpr)) {
      this.canvas.width = Math.round(width * dpr);
      this.canvas.height = Math.round(height * dpr);
    }
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    return { width, height, dpr };
  }

  public clear(): void {
    if (this.currentAnimationId !== null) {
      cancelAnimationFrame(this.currentAnimationId);
      this.currentAnimationId = null;
    }
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }
    if (this.activeResolver) {
      const res = this.activeResolver;
      this.activeResolver = null;
      res();
    }
    this.clearCanvas();
  }

  private clearCanvas(): void {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  public playAttackVFX(options: {
    combatantId: string;
    element?: string;
    action: string;
    sourceArtRect: DOMRect;
    targets: readonly { artRect: DOMRect; support: boolean }[];
    speedMultiplier?: number;
    onImpact?: () => void | Promise<void>;
  }): Promise<void> {
    this.clear();

    const {
      combatantId,
      element,
      action,
      sourceArtRect,
      targets,
      speedMultiplier = 1,
      onImpact,
    } = options;
    if (!Number.isFinite(speedMultiplier) || speedMultiplier <= 0) {
      throw new Error('Battle VFX speed must be positive.');
    }
    if (!targets.length) throw new Error('Battle VFX requires an affected target.');
    for (const rect of [sourceArtRect, ...targets.map(target => target.artRect)]) {
      if (![rect.left, rect.top, rect.width, rect.height].every(Number.isFinite) || rect.width <= 0 || rect.height <= 0) {
        throw new Error('Battle VFX artwork anchors have no visible area.');
      }
    }

    const tier: AbilityTier =
      action === 'ultimate' ? 'ultimate' :
      action === 'skill2' ? 'skill2' :
      action === 'skill1' ? 'skill1' : 'light';

    const profile = getVFXProfileForCombatant(combatantId, element);
    const ability = profile.abilities[tier];

    const abortCtrl = new AbortController();
    this.activeAbortController = abortCtrl;

    return new Promise<void>((resolve, reject) => {
      const { width, height, dpr } = this.syncCanvasSize();
      const canvasRect = this.canvas.getBoundingClientRect();
      this.activeResolver = resolve;

      const casterX = sourceArtRect.left + sourceArtRect.width / 2 - canvasRect.left;
      const casterY = sourceArtRect.top + sourceArtRect.height / 2 - canvasRect.top;

      let currentTime = 0;
      let lastTimestamp = performance.now();
      let hasTriggeredImpact = false;
      let impactFinished: Promise<void> = Promise.resolve();
      const fail = (error: unknown): void => {
        if (this.activeAbortController === abortCtrl) {
          this.activeResolver = null;
          this.clear();
        }
        reject(error);
      };

      const duration = ability.duration;
      const chargeDuration = ability.chargeDuration;

      const effects = targets.map(({ artRect, support }, index) => {
        const targetX = artRect.left + artRect.width / 2 - canvasRect.left;
        const targetY = artRect.top + artRect.height / 2 - canvasRect.top;
        const system = createVFXSystem(ability.archetype);
        system.reset();
        const context: VFXContext = {
          ctx: this.ctx,
          width,
          height,
          t: 0,
          dt: 1 / 60,
          progress: 0,
          scale: Math.min(width / 960, height / 540) * (tier === 'ultimate' ? 1.15 : 1.0),
          palette: ability.palette,
          definition: ability,
          targetX,
          targetY,
          casterX: support ? targetX : casterX,
          casterY: support ? targetY : casterY,
          secondaryTarget: index > 0,
          shakeCallback: () => {},
        };
        return { system, context };
      });

      const step = (timestamp: number) => {
        if (abortCtrl.signal.aborted) {
          resolve();
          return;
        }

        try {
          const deltaSec = Math.max(0, Math.min((timestamp - lastTimestamp) / 1000, 0.1)) * speedMultiplier;
          lastTimestamp = timestamp;
          currentTime += deltaSec;

          if (currentTime >= chargeDuration && !hasTriggeredImpact) {
            hasTriggeredImpact = true;
            impactFinished = Promise.resolve(onImpact?.());
            void impactFinished.catch(fail);
          }

          this.clearCanvas();
          this.renderer.begin(width, height, dpr);

          for (const { system, context } of effects) {
            advanceVFX(system, context, Math.min(currentTime, duration));
            this.renderer.render(system, context);
          }
          this.renderer.composite(width, height);

          if (currentTime >= duration) {
            this.clearCanvas();
            this.currentAnimationId = null;
            this.activeAbortController = null;
            if (this.activeResolver) {
              this.activeResolver = null;
              void impactFinished.then(resolve, reject);
            }
          } else {
            this.currentAnimationId = requestAnimationFrame(step);
          }
        } catch (error) {
          fail(error);
        }
      };

      this.currentAnimationId = requestAnimationFrame(step);
    });
  }

  public destroy(): void {
    this.clear();
  }
}
