import type { BaseVFXSystem, VFXContext } from '../types';
import { releaseEnvelope, smoothstep } from '../vfx-motion';

interface PetalNode {
  angle: number;
  dist: number;
  size: number;
  rotation: number;
  bloomScale: number;
}

export class MandalaVFXSystem implements BaseVFXSystem {
  readonly id = 'mandala';

  private nodes: PetalNode[] = [];
  private hasTriggeredImpact = false;

  reset(): void {
    this.nodes = [];
    this.hasTriggeredImpact = false;
  }

  update(ctx: VFXContext): void {
    const { t, definition, targetX, targetY, shakeCallback } = ctx;
    const impactTime = definition.chargeDuration;

    // Initialize sacred geometry nodes if not done
    if (this.nodes.length === 0) {
      const petals = definition.tier === 'skill2' ? 12 : 8;
      for (let i = 0; i < petals; i++) {
        const angle = (i / petals) * Math.PI * 2;
        this.nodes.push({
          angle,
          dist: 65,
          size: 18,
          rotation: angle,
          bloomScale: 0,
        });
      }
    }

    if (t >= impactTime && !this.hasTriggeredImpact) {
      this.hasTriggeredImpact = true;
      shakeCallback(definition.tier === 'skill2' ? 15 : 9);
    }
  }

  render(ctx: VFXContext): void {
    const { ctx: c, t, definition, targetX, targetY, palette } = ctx;
    const impactTime = definition.chargeDuration;
    const isUnfolding = t < impactTime + .4;
    const isDetonating = t >= impactTime && t < impactTime + 0.65;

    c.save();
    c.globalCompositeOperation = 'screen';
    c.translate(targetX, targetY);

    if (isUnfolding) {
      const prog = smoothstep(t / impactTime);
      const rot = t * 1.5;
      c.save();
      c.globalAlpha *= 1 - smoothstep((t - impactTime) / .4);

      // 1. Concentric Sacred Geometry Rings
      c.save();
      c.rotate(rot);

      // Outer ring with runic notches
      c.beginPath();
      c.arc(0, 0, 75 * prog, 0, Math.PI * 2);
      c.lineWidth = 2;
      c.strokeStyle = `rgba(${palette.mid.r}, ${palette.mid.g}, ${palette.mid.b}, ${0.7 * prog})`;
      c.stroke();

      // Interlocking inner polygons
      const sides = 6;
      c.beginPath();
      for (let i = 0; i < sides; i++) {
        const a = (i / sides) * Math.PI * 2;
        const x = Math.cos(a) * (50 * prog);
        const y = Math.sin(a) * (50 * prog);
        if (i === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.closePath();
      c.strokeStyle = `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${0.5 * prog})`;
      c.stroke();
      c.restore();

      // 2. Blooming Petals / Feathers / Glyphs
      for (let i = 0; i < this.nodes.length; i++) {
        const node = this.nodes[i];
        const currentDist = node.dist * prog + Math.max(0, t - impactTime) * 90;
        const currentAngle = node.angle + rot * 0.5;
        const px = Math.cos(currentAngle) * currentDist;
        const py = Math.sin(currentAngle) * currentDist;

        c.save();
        c.translate(px, py);
        c.rotate(currentAngle + Math.PI / 2);

        // Draw elegant petal / feather quill shape
        c.beginPath();
        c.moveTo(0, -node.size * prog);
        c.quadraticCurveTo(node.size * 0.6 * prog, 0, 0, node.size * prog);
        c.quadraticCurveTo(-node.size * 0.6 * prog, 0, 0, -node.size * prog);

        const petalGrad = c.createLinearGradient(0, -node.size * prog, 0, node.size * prog);
        petalGrad.addColorStop(0, '#ffffff');
        petalGrad.addColorStop(0.4, `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, 0.8)`);
        petalGrad.addColorStop(1, `rgba(${palette.outer.r}, ${palette.outer.g}, ${palette.outer.b}, 0.2)`);
        c.fillStyle = petalGrad;
        c.fill();

        c.strokeStyle = `rgba(255, 255, 255, ${0.8 * prog})`;
        c.lineWidth = 1.2;
        c.stroke();
        c.restore();
      }

      // Glowing central nucleus
      const coreR = (12 + prog * 16);
      const coreG = c.createRadialGradient(0, 0, 0, 0, 0, coreR);
      coreG.addColorStop(0, '#ffffff');
      coreG.addColorStop(0.5, `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, 0.9)`);
      coreG.addColorStop(1, 'transparent');
      c.fillStyle = coreG;
      c.beginPath();
      c.arc(0, 0, coreR, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    if (isDetonating) {
      const detProg = (t - impactTime) / 0.65;
      const intensity = releaseEnvelope(t - impactTime, .65);

      // Expanding mandala shockwave ring
      const radius = 75 + (1 - (1 - detProg) ** 3) * 140;
      c.beginPath();
      c.arc(0, 0, radius, 0, Math.PI * 2);
      c.lineWidth = 4 * intensity;
      c.strokeStyle = `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${intensity})`;
      c.stroke();

      // Radial needles / quills flying outwards
      const needleCount = this.nodes.length * 2;
      for (let i = 0; i < needleCount; i++) {
        const a = (i / needleCount) * Math.PI * 2;
        const innerD = (50 + detProg * 120);
        const outerD = innerD + 25 * intensity;
        c.beginPath();
        c.moveTo(Math.cos(a) * innerD, Math.sin(a) * innerD);
        c.lineTo(Math.cos(a) * outerD, Math.sin(a) * outerD);
        c.lineWidth = 2.5 * intensity;
        c.strokeStyle = i % 2 === 0 ? '#ffffff' : `rgb(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b})`;
        c.stroke();
      }
    }

    c.restore();
  }

  renderOptical(ctx: VFXContext): void {
    const { ctx: c, t, definition, targetX, targetY, palette } = ctx;
    const impactTime = definition.chargeDuration;
    if (t < impactTime || t > impactTime + 0.5) return;

    const prog = (t - impactTime) / 0.5;
    const intensity = releaseEnvelope(t - impactTime, .5);

    c.save();
    c.globalCompositeOperation = 'screen';

    // Sacred geometric diamond glare burst
    const starSize = 85 * intensity;
    c.save();
    c.translate(targetX, targetY);
    c.rotate(t * 0.4);

    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const ex = Math.cos(a) * starSize;
      const ey = Math.sin(a) * starSize;
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(ex, ey);
      c.lineWidth = 2.5 * intensity;
      c.strokeStyle = `rgba(255, 255, 255, ${0.9 * intensity})`;
      c.stroke();
    }
    c.restore();

    // Soft celestial bloom
    const bloom = c.createRadialGradient(targetX, targetY, 0, targetX, targetY, 130 * intensity);
    bloom.addColorStop(0, `rgba(255, 255, 255, ${0.5 * intensity})`);
    bloom.addColorStop(0.3, `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${0.3 * intensity})`);
    bloom.addColorStop(0.7, `rgba(${palette.mid.r}, ${palette.mid.g}, ${palette.mid.b}, ${0.1 * intensity})`);
    bloom.addColorStop(1, 'transparent');
    c.fillStyle = bloom;
    c.beginPath();
    c.arc(targetX, targetY, 130 * intensity, 0, Math.PI * 2);
    c.fill();

    c.restore();
  }
}
