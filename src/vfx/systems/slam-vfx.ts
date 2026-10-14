import type { BaseVFXSystem, VFXContext } from '../types';
import { releaseEnvelope, smoothstep } from '../vfx-motion';

interface BasaltSpire {
  x: number;
  y: number;
  width: number;
  height: number;
  tilt: number;
  growth: number;
}

interface BoulderChunk {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vRot: number;
  life: number;
  maxLife: number;
}

export class SlamVFXSystem implements BaseVFXSystem {
  readonly id = 'slam';

  private spires: BasaltSpire[] = [];
  private boulders: BoulderChunk[] = [];
  private hasTriggeredImpact = false;

  reset(): void {
    this.spires = [];
    this.boulders = [];
    this.hasTriggeredImpact = false;
  }

  update(ctx: VFXContext): void {
    const { t, dt, definition, targetX, targetY, shakeCallback, palette } = ctx;
    const impactTime = definition.chargeDuration;

    if (t >= impactTime && !this.hasTriggeredImpact) {
      this.hasTriggeredImpact = true;
      shakeCallback(definition.tier === 'skill2' ? 22 : 16);

      // Generate basalt / stone spires erupting from ground
      const spireCount = definition.tier === 'skill2' ? 7 : 5;
      for (let i = 0; i < spireCount; i++) {
        const offset = (i - (spireCount - 1) / 2) * 28 + (Math.random() - 0.5) * 10;
        this.spires.push({
          x: targetX + offset,
          y: targetY + 25,
          width: 14 + Math.random() * 10,
          height: 60 + Math.random() * 50,
          tilt: (Math.random() - 0.5) * 0.35,
          growth: 0,
        });
      }

      // Spawn flying stone boulder chunks
      const chunkCount = 20;
      for (let i = 0; i < chunkCount; i++) {
        const angle = -Math.PI * 0.8 + Math.random() * Math.PI * 0.6;
        const speed = 140 + Math.random() * 260;
        this.boulders.push({
          x: targetX + (Math.random() - 0.5) * 20,
          y: targetY + 15,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 4 + Math.random() * 6,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 12,
          life: 0,
          maxLife: 0.6 + Math.random() * 0.4,
        });
      }
    }

    // Grow spires
    if (this.spires.length > 0) {
      const spireAge = t - impactTime;
      for (const s of this.spires) {
        s.growth = smoothstep(spireAge / .2);
      }
    }

    // Update boulder physics
    for (let i = this.boulders.length - 1; i >= 0; i--) {
      const b = this.boulders[i];
      b.life += dt;
      if (b.life >= b.maxLife) {
        this.boulders.splice(i, 1);
        continue;
      }
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.vy += 450 * dt; // heavy gravity
      b.rotation += b.vRot * dt;
    }
  }

  render(ctx: VFXContext): void {
    const { ctx: c, t, definition, targetX, targetY, casterX, casterY, palette } = ctx;
    const impactTime = definition.chargeDuration;
    const isCharging = t < impactTime;

    c.save();

    // 1. Vaulting Hammer Leap Trajectory
    if (isCharging) {
      const prog = smoothstep(t / impactTime);
      const heightArc = -Math.sin(prog * Math.PI) * 140;
      const hammerX = casterX + (targetX - casterX) * prog;
      const hammerY = casterY + (targetY - casterY) * prog + heightArc;

      c.save();
      c.globalCompositeOperation = 'screen';
      c.translate(hammerX, hammerY);

      // Trailing kinetic comet glow
      const glow = c.createRadialGradient(0, 0, 0, 0, 0, 32);
      glow.addColorStop(0, '#ffffff');
      glow.addColorStop(0.4, `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, 0.8)`);
      glow.addColorStop(1, 'transparent');
      c.fillStyle = glow;
      c.beginPath();
      c.arc(0, 0, 32, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    // 2. Basalt / Tectonic Spire Eruptions at Target
    if (this.spires.length > 0) {
      const spireAge = t - impactTime;
      const alpha = Math.max(0, 1.0 - spireAge / 1.5);
      if (alpha > 0) {
        c.save();
        for (const s of this.spires) {
          const curH = s.height * s.growth;
          c.save();
          c.translate(s.x, s.y);
          c.rotate(s.tilt);

          // Dark basalt stone pillar
          c.beginPath();
          c.moveTo(-s.width * 0.5, 0);
          c.lineTo(-s.width * 0.35, -curH);
          c.lineTo(0, -curH - 12 * s.growth);
          c.lineTo(s.width * 0.35, -curH);
          c.lineTo(s.width * 0.5, 0);
          c.closePath();

          c.fillStyle = `rgba(35, 30, 28, ${alpha})`;
          c.fill();
          c.strokeStyle = `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${alpha * 0.75})`;
          c.lineWidth = 1.5;
          c.stroke();

          // Molten / Runic veins running up the stone
          c.beginPath();
          c.moveTo(0, 0);
          c.lineTo(s.width * 0.15, -curH * 0.5);
          c.lineTo(-s.width * 0.1, -curH * 0.85);
          c.strokeStyle = `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${alpha * 0.9})`;
          c.lineWidth = 2;
          c.stroke();

          c.restore();
        }
        c.restore();
      }
    }

    // 3. Flying Boulders
    if (this.boulders.length > 0) {
      c.save();
      for (const b of this.boulders) {
        const bAlpha = Math.max(0, 1 - b.life / b.maxLife);
        c.save();
        c.translate(b.x, b.y);
        c.rotate(b.rotation);
        c.fillStyle = `rgba(45, 38, 35, ${bAlpha})`;
        c.fillRect(-b.size * 0.5, -b.size * 0.5, b.size, b.size);
        c.strokeStyle = `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${bAlpha * 0.8})`;
        c.lineWidth = 1;
        c.strokeRect(-b.size * 0.5, -b.size * 0.5, b.size, b.size);
        c.restore();
      }
      c.restore();
    }

    c.restore();
  }

  renderOptical(ctx: VFXContext): void {
    const { ctx: c, t, definition, targetX, targetY, palette } = ctx;
    const impactTime = definition.chargeDuration;
    if (t < impactTime || t > impactTime + 0.55) return;

    const prog = (t - impactTime) / 0.55;
    const intensity = releaseEnvelope(t - impactTime, .55);

    c.save();
    c.globalCompositeOperation = 'screen';

    // Massive ground shockwave ring
    const radius = (20 + prog * 180);
    c.beginPath();
    c.ellipse(targetX, targetY + 20, radius, radius * 0.38, 0, 0, Math.PI * 2);
    c.lineWidth = 5 * intensity;
    c.strokeStyle = `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${intensity * 0.9})`;
    c.stroke();

    // Intense ground impact flash
    const flash = c.createRadialGradient(targetX, targetY + 15, 0, targetX, targetY + 15, 80 * intensity);
    flash.addColorStop(0, '#ffffff');
    flash.addColorStop(0.5, `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${0.8 * intensity})`);
    flash.addColorStop(1, 'transparent');
    c.fillStyle = flash;
    c.beginPath();
    c.arc(targetX, targetY + 15, 80 * intensity, 0, Math.PI * 2);
    c.fill();

    c.restore();
  }
}
