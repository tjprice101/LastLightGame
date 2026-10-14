import type { BaseVFXSystem, VFXContext } from '../types';
import { releaseEnvelope, smoothstep } from '../vfx-motion';

interface RefractedBeam {
  angle: number;
  length: number;
  color: string;
  width: number;
}

export class BeamVFXSystem implements BaseVFXSystem {
  readonly id = 'beam';

  private refractedBeams: RefractedBeam[] = [];
  private hasTriggeredImpact = false;

  reset(): void {
    this.refractedBeams = [];
    this.hasTriggeredImpact = false;
  }

  update(ctx: VFXContext): void {
    const { t, definition, shakeCallback, palette } = ctx;
    const impactTime = definition.chargeDuration;

    if (t >= impactTime && !this.hasTriggeredImpact) {
      this.hasTriggeredImpact = true;
      shakeCallback(definition.tier === 'skill2' ? 14 : 10);

      // Generate prismatic refracted sub-beams splitting at target
      const beamCount = definition.tier === 'skill2' ? 8 : 5;
      const rainbowColors = [
        `rgb(255, 100, 100)`,
        `rgb(255, 180, 50)`,
        `rgb(255, 255, 100)`,
        `rgb(100, 255, 150)`,
        `rgb(80, 200, 255)`,
        `rgb(150, 100, 255)`,
        `rgb(255, 100, 200)`,
        `rgb(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b})`,
      ];

      for (let i = 0; i < beamCount; i++) {
        const spread = (i - (beamCount - 1) / 2) * 0.35 + (Math.random() - 0.5) * 0.15;
        this.refractedBeams.push({
          angle: spread,
          length: 90 + Math.random() * 80,
          color: rainbowColors[i % rainbowColors.length],
          width: 3 + Math.random() * 4,
        });
      }
    }
  }

  render(ctx: VFXContext): void {
    const { ctx: c, t, definition, casterX, casterY, targetX, targetY, palette } = ctx;
    const impactTime = definition.chargeDuration;
    const isCharging = t < impactTime;
    const isFiring = t >= impactTime && t < impactTime + 0.6;

    c.save();

    // 1. Orbital Optical Focusing Prisms around Caster
    if (isCharging) {
      const chargeProg = smoothstep(t / impactTime);
      c.save();
      c.globalCompositeOperation = 'screen';
      c.translate(casterX, casterY);

      const numPrisms = 6;
      const orbitRadius = 45 * (1 - chargeProg * 0.45);
      const orbitSpeed = t * 12;

      for (let i = 0; i < numPrisms; i++) {
        const angle = orbitSpeed + (i * Math.PI * 2) / numPrisms;
        const px = Math.cos(angle) * orbitRadius;
        const py = Math.sin(angle) * orbitRadius;

        // Draw diamond crystal prism
        c.save();
        c.translate(px, py);
        c.rotate(angle + Math.PI * 0.25);
        c.fillStyle = `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${0.4 + chargeProg * 0.55})`;
        c.fillRect(-4, -4, 8, 8);

        // Ray connecting prism to central focal point
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(-px, -py);
        c.lineWidth = 1.5;
        c.strokeStyle = `rgba(255, 255, 255, ${0.3 + chargeProg * 0.6})`;
        c.stroke();
        c.restore();
      }

      // Searing focal core at center
      const coreSize = (10 + chargeProg * 18);
      const coreGrad = c.createRadialGradient(0, 0, 0, 0, 0, coreSize);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.5, `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, 0.9)`);
      coreGrad.addColorStop(1, 'transparent');
      c.fillStyle = coreGrad;
      c.beginPath();
      c.arc(0, 0, coreSize, 0, Math.PI * 2);
      c.fill();

      c.restore();
    }

    // 2. High-Intensity Piercing Laser Beam from Caster to Target
    if (isFiring) {
      const fireProg = (t - impactTime) / 0.6;
      const intensity = releaseEnvelope(t - impactTime, .6, .03);

      const dx = targetX - casterX;
      const dy = targetY - casterY;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      c.save();
      c.globalCompositeOperation = 'screen';
      c.translate(casterX, casterY);
      c.rotate(angle);

      // Outer laser aura envelope
      const auraHeight = (38 * intensity) * (definition.tier === 'skill2' ? 1.4 : 1.0);
      const auraGrad = c.createLinearGradient(0, -auraHeight, 0, auraHeight);
      auraGrad.addColorStop(0, 'transparent');
      auraGrad.addColorStop(0.3, `rgba(${palette.outer.r}, ${palette.outer.g}, ${palette.outer.b}, ${0.5 * intensity})`);
      auraGrad.addColorStop(0.5, `rgba(${palette.mid.r}, ${palette.mid.g}, ${palette.mid.b}, ${0.85 * intensity})`);
      auraGrad.addColorStop(0.7, `rgba(${palette.outer.r}, ${palette.outer.g}, ${palette.outer.b}, ${0.5 * intensity})`);
      auraGrad.addColorStop(1, 'transparent');
      c.fillStyle = auraGrad;
      c.fillRect(0, -auraHeight * 0.5, dist, auraHeight);

      // Core white-hot laser filament
      const coreHeight = Math.max(1, 10 * intensity);
      c.fillStyle = `rgba(255, 255, 255, ${0.98 * intensity})`;
      c.fillRect(0, -coreHeight * 0.5, dist, coreHeight);

      // Concentric sonic / photon pulse rings traveling along the beam
      const ringCount = 8;
      for (let r = 0; r < ringCount; r++) {
        const ringProg = ((t * 2.5 + r / ringCount) % 1);
        const rx = ringProg * dist;
        c.beginPath();
        c.ellipse(rx, 0, 4, 18 * intensity, 0, 0, Math.PI * 2);
        c.strokeStyle = `rgba(255, 255, 255, ${0.6 * Math.sin(ringProg * Math.PI) * intensity})`;
        c.lineWidth = 2;
        c.stroke();
      }

      c.restore();

      // 3. Prismatic Refracted Sub-Beams at Target
      if (this.refractedBeams.length > 0) {
        c.save();
        c.globalCompositeOperation = 'screen';
        c.translate(targetX, targetY);

        for (const beam of this.refractedBeams) {
          const beamLen = beam.length * (0.5 + 0.5 * intensity);
          c.save();
          c.rotate(angle + beam.angle);
          c.beginPath();
          c.moveTo(0, 0);
          c.lineTo(beamLen, 0);
          c.lineWidth = beam.width * intensity;
          c.strokeStyle = beam.color;
          c.globalAlpha *= intensity;
          c.lineCap = 'round';
          c.shadowColor = beam.color;
          c.shadowBlur = 10;
          c.stroke();
          c.restore();
        }
        c.restore();
      }
    }

    c.restore();
  }

  renderOptical(ctx: VFXContext): void {
    const { ctx: c, t, definition, targetX, targetY, casterX, casterY, palette } = ctx;
    const impactTime = definition.chargeDuration;
    if (t < impactTime || t > impactTime + 0.55) return;

    const prog = (t - impactTime) / 0.55;
    const intensity = releaseEnvelope(t - impactTime, .55);

    c.save();
    c.globalCompositeOperation = 'screen';

    // Anamorphic horizontal glare streak across target
    const streakW = 580 * intensity;
    const streakH = 5 * intensity;
    const grad = c.createLinearGradient(targetX - streakW * 0.5, targetY, targetX + streakW * 0.5, targetY);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.2, `rgba(${palette.spectral.r}, ${palette.spectral.g}, ${palette.spectral.b}, ${0.4 * intensity})`);
    grad.addColorStop(0.5, `rgba(255, 255, 255, ${0.98 * intensity})`);
    grad.addColorStop(0.8, `rgba(${palette.spectral.r}, ${palette.spectral.g}, ${palette.spectral.b}, ${0.4 * intensity})`);
    grad.addColorStop(1, 'transparent');
    c.fillStyle = grad;
    c.beginPath();
    c.ellipse(targetX, targetY, streakW * 0.5, streakH, 0, 0, Math.PI * 2);
    c.fill();

    // 6-Point Crystal Starburst at Target Impact
    const spikes = 6;
    const spikeLen = 80 * intensity;
    for (let i = 0; i < spikes; i++) {
      const a = (i / spikes) * Math.PI * 2 + (t * 0.8);
      const ex = targetX + Math.cos(a) * spikeLen;
      const ey = targetY + Math.sin(a) * spikeLen;
      c.beginPath();
      c.moveTo(targetX, targetY);
      c.lineTo(ex, ey);
      c.strokeStyle = `rgba(255, 255, 255, ${0.8 * intensity})`;
      c.lineWidth = 1.5;
      c.stroke();
    }

    c.restore();
  }
}
