import type { BaseVFXSystem, VFXContext } from './types';
import { effectOpacity } from './vfx-motion';

export interface BloomSettings {
  enabled: boolean;
  intensity: number;
  radius: number;
}

export const DEFAULT_BLOOM: BloomSettings = { enabled: true, intensity: 1.15, radius: 24 };

export class VFXRenderer {
  private readonly layer = document.createElement('canvas');
  private readonly glows = [document.createElement('canvas'), document.createElement('canvas')];
  private readonly layerContext: CanvasRenderingContext2D;
  private readonly glowContexts: CanvasRenderingContext2D[];

  constructor(private readonly output: CanvasRenderingContext2D) {
    const layer = this.layer.getContext('2d');
    if (!layer) throw new Error('Could not initialize VFX emission surface.');
    this.layerContext = layer;
    this.glowContexts = this.glows.map(canvas => {
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not initialize VFX bloom surface.');
      return context;
    });
  }

  begin(width: number, height: number, dpr: number): CanvasRenderingContext2D {
    const pixelWidth = Math.round(width * dpr);
    const pixelHeight = Math.round(height * dpr);
    if (this.layer.width !== pixelWidth || this.layer.height !== pixelHeight) {
      this.layer.width = pixelWidth;
      this.layer.height = pixelHeight;
    }
    this.layerContext.setTransform(1, 0, 0, 1, 0, 0);
    this.layerContext.clearRect(0, 0, pixelWidth, pixelHeight);
    this.layerContext.setTransform(dpr, 0, 0, dpr, 0, 0);
    return this.layerContext;
  }

  render(system: BaseVFXSystem, context: VFXContext, optical = true): void {
    const opacity = effectOpacity(context.t, context.definition.duration);
    this.output.save();
    try {
      this.output.globalAlpha = opacity;
      system.renderBackground?.({ ...context, ctx: this.output });
    } finally {
      this.output.restore();
    }
    this.layerContext.save();
    try {
      this.layerContext.globalAlpha = opacity;
      const layerContext = { ...context, ctx: this.layerContext };
      system.render(layerContext);
      if (optical) system.renderOptical?.(layerContext);
    } finally {
      this.layerContext.restore();
    }
  }

  composite(width: number, height: number, settings: BloomSettings = DEFAULT_BLOOM): void {
    this.output.save();
    try {
      if (settings.enabled && settings.intensity > 0 && settings.radius > 0) {
        // Bloom only the effect layer, never scenery, portraits or arena dimming.
        this.output.globalCompositeOperation = 'screen';
        for (const [index, [resolution, spread, strength]] of [[.5, .35, .6], [.25, 1, .3]].entries()) {
          const glow = this.glows[index];
          const glowContext = this.glowContexts[index];
          const w = Math.max(1, Math.ceil(width * resolution));
          const h = Math.max(1, Math.ceil(height * resolution));
          if (glow.width !== w || glow.height !== h) {
            glow.width = w;
            glow.height = h;
          }
          glowContext.clearRect(0, 0, w, h);
          glowContext.filter = `brightness(1.1) contrast(1.2) blur(${settings.radius * spread * resolution}px)`;
          glowContext.drawImage(this.layer, 0, 0, w, h);
          glowContext.filter = 'none';
          this.output.globalAlpha = Math.min(1, strength * settings.intensity);
          this.output.drawImage(glow, 0, 0, width, height);
        }
      }
      this.output.globalAlpha = 1;
      this.output.globalCompositeOperation = 'source-over';
      this.output.drawImage(this.layer, 0, 0, width, height);
    } finally {
      this.output.restore();
    }
  }
}
