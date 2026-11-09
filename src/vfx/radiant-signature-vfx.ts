import { characterChoreography, characterSignaturePath } from '../presentation/battle-effects';
import type { RadiantBearerId } from '../content/radiant-combat';
import type { AbilityTier, BaseVFXSystem, ColorStop, VFXContext } from './types';
import { smoothstep } from './vfx-motion';
import { radiantMotifMotions, radiantMotifPaths, radiantMotifPlacement, radiantMotifSequences } from './radiant-cinematic-motifs';

export interface RadiantSignatureFrame {
  x: number;
  y: number;
  radius: number;
  progress: number;
  tier: AbilityTier;
  phase: 'charge' | 'impact' | 'status';
  color: ColorStop;
  secondaryColor: ColorStop;
}
export const radiantSignatureLayers: Record<AbilityTier, number> = { light: 0, skill1: 1, skill2: 2, ultimate: 3 };

export function radiantStatusCueSystem(): BaseVFXSystem {
  return {
    id: 'radiant-status-cue', reset: () => {}, update: () => {},
    render: context => {
      const { ctx, targetX, targetY, scale, progress, palette } = context;
      const radius = 45 * scale * (.6 + smoothstep(progress) * .8);
      ctx.strokeStyle = `rgba(${palette.mid.r},${palette.mid.g},${palette.mid.b},.6)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(targetX, targetY, radius, 0, Math.PI * 2); ctx.stroke();
    },
  };
}

/** One authored identity path per caster; no random geometry or persistent
 * particle state. Glyphs are painted into emission, not supplied artwork. */
export class RadiantSignatureVFX {
  private readonly path: Path2D;
  private readonly motifs: readonly Path2D[];
  constructor(readonly bearer: RadiantBearerId) {
    this.path = new Path2D(characterSignaturePath(bearer));
    this.motifs = radiantMotifSequences[bearer].map(motif => new Path2D(radiantMotifPaths[motif]));
  }
  render(context: CanvasRenderingContext2D, frame: RadiantSignatureFrame): void {
    const { x, y, radius, progress: p, tier, phase, color, secondaryColor } = frame;
    if (p <= 0 || p >= 1) return;
    const layers = phase === 'status' ? 0 : radiantSignatureLayers[tier];
    const reveal = smoothstep(p / .3);
    const fade = smoothstep((1 - p) / .32);
    const expansion = phase === 'charge' ? .7 + reveal * .3 : .65 + smoothstep(p) * .5;
    const motion = characterChoreography[this.bearer].motion;
    // Keep weapons/architectural glyphs upright; only orbit/caster motifs turn.
    const rotation = motion === 'cast' ? (phase === 'charge' ? -1 : 1) * p * .35 :
      motion === 'twin' ? Math.sin(p * Math.PI) * .12 : 0;
    context.save();
    try {
      context.translate(x, y);
      context.rotate(rotation);
      context.scale(radius * expansion / 50, radius * expansion / 50);
      context.globalAlpha *= reveal * fade * (phase === 'status' ? .45 : .75);
      context.strokeStyle = `rgb(${color.r},${color.g},${color.b})`;
      context.lineCap = 'round'; context.lineJoin = 'round';
      // Wide colored stroke under a narrow white core creates finite light filaments.
      context.save();
      try {
        context.translate(-50, -50);
        context.lineWidth = 3.4;
        context.stroke(this.path);
        context.strokeStyle = 'rgba(255,255,255,.85)';
        context.lineWidth = 1;
        context.stroke(this.path);
      } finally {
        context.restore();
      }
      for (let layer = 0; layer < layers; layer++) {
        const ring = 57 + layer * 12;
        const orbit = (layer % 2 ? -1 : 1) * p * .8;
        const accent = layer % 2 === 0 ? secondaryColor : color;
        const opacity = layer % 2 === 0 ? .4 : .5;
        context.strokeStyle = `rgba(${accent.r},${accent.g},${accent.b},${opacity})`;
        context.lineWidth = 1.5;
        const segments = 3 + layer;
        for (let segment = 0; segment < segments; segment++) {
          const angle = segment * Math.PI * 2 / segments + orbit;
          context.beginPath(); context.arc(0, 0, ring, angle, angle + Math.PI * 1.2 / segments); context.stroke();
          const px = Math.cos(angle) * ring, py = Math.sin(angle) * ring;
          context.beginPath(); context.moveTo(px, py - 3); context.lineTo(px + 3, py);
          context.lineTo(px, py + 3); context.lineTo(px - 3, py); context.closePath(); context.stroke();
        }
        const count = 2 + layer;
        for (let index = 0; index < count; index++) {
          const [motifX, motifY, motifRotation] = radiantMotifPlacement(radiantMotifMotions[this.bearer],
            index, count, layer, ring, phase === 'charge' ? p : smoothstep(p), phase === 'charge');
          context.save();
          try {
            context.translate(motifX, motifY);
            context.rotate(motifRotation);
            context.scale(.3, .3);
            context.translate(-50, -50);
            context.strokeStyle = `rgba(${accent.r},${accent.g},${accent.b},.8)`;
            context.lineWidth = 6;
            context.stroke(this.motifs[layer]);
            context.strokeStyle = 'rgba(255,255,255,.7)';
            context.lineWidth = 2;
            context.stroke(this.motifs[layer]);
          } finally {
            context.restore();
          }
        }
      }
    } finally {
      context.restore();
    }
  }
}

export function withRadiantSignature(system: BaseVFXSystem, signature: RadiantSignatureVFX,
  phase: 'impact' | 'status'): BaseVFXSystem {
  return {
    id: system.id,
    reset: () => system.reset(),
    update: context => system.update(context),
    render: context => {
      signature.render(context.ctx, signatureFrame(context, phase));
      system.render(context);
    },
    renderOptical: context => system.renderOptical?.(context),
  };
}
function signatureFrame(context: VFXContext, phase: 'impact' | 'status'): RadiantSignatureFrame {
  return { x: context.targetX, y: context.targetY, radius: 70 * context.scale,
    progress: context.progress, tier: context.definition.tier, phase,
    color: context.palette.mid, secondaryColor: context.palette.spectral };
}
