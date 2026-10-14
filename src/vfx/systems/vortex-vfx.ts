import type { BaseVFXSystem, VFXContext } from '../types';
import { releaseEnvelope, smoothstep } from '../vfx-motion';

interface VortexMote {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  alpha: number;
}

export class VortexVFXSystem implements BaseVFXSystem {
  readonly id = 'vortex';

  private motes: VortexMote[] = [];
  private hasTriggeredImpact = false;

  reset(): void {
    this.motes = [];
    this.hasTriggeredImpact = false;
  }

  update(ctx: VFXContext): void {
    const { t, dt, definition, shakeCallback } = ctx;
    const impactTime = definition.chargeDuration;

    if (this.motes.length === 0) {
      const count = 35;
      for (let i = 0; i < count; i++) {
        this.motes.push({
          angle: Math.random() * Math.PI * 2,
          radius: 30 + Math.random() * 95,
          speed: 4 + Math.random() * 8,
          size: 2 + Math.random() * 3.5,
          alpha: 0.3 + Math.random() * 0.7,
        });
      }
    }

    if (t >= impactTime && !this.hasTriggeredImpact) {
      this.hasTriggeredImpact = true;
      shakeCallback(definition.tier === 'skill2' ? 18 : 12);
    }

    // Spin and suck motes inward
    for (const m of this.motes) {
      m.angle += m.speed * dt;
      m.radius -= 15 * dt;
      if (m.radius < 12) {
        m.radius = 110 + Math.random() * 20;
      }
    }
  }

  render(ctx: VFXContext): void {
    const { ctx: c, t, definition, targetX, targetY, palette } = ctx;
    const impactTime = definition.chargeDuration;
    const isVortexActive = t < impactTime + 1;

    c.save();
    c.translate(targetX, targetY);

    if (isVortexActive) {
      const age = t - impactTime;
      const intensity = age < 0 ? .35 * smoothstep(t / impactTime)
        : (.35 + .65 * smoothstep(age / .09)) * (1 - smoothstep(age));

      // 1. Inward Swirling Spiral Arms
      c.save();
      c.globalCompositeOperation = 'screen';
      const arms = 3;
      const baseRot = t * 3.5;

      for (let a = 0; a < arms; a++) {
        const armAngle = baseRot + (a * Math.PI * 2) / arms;
        c.beginPath();
        for (let r = 15; r <= 100; r += 5) {
          const theta = armAngle + (r / 20);
          const x = Math.cos(theta) * r;
          const y = Math.sin(theta) * (r * 0.55); // perspective tilt
          if (r === 15) c.moveTo(x, y);
          else c.lineTo(x, y);
        }
        c.lineWidth = 4 * intensity;
        c.strokeStyle = `rgba(${palette.mid.r}, ${palette.mid.g}, ${palette.mid.b}, ${0.8 * intensity})`;
        c.stroke();
      }
      c.restore();

      // 2. Gravitational Core / Storm Eye (Dark Singularity with Blazing Event Horizon)
      c.save();
      const coreRadius = (16 + Math.sin(t * 6) * 2) * intensity;

      // Outer glowing accretion disk
      const diskGrad = c.createRadialGradient(0, 0, coreRadius * 0.8, 0, 0, coreRadius * 2.5);
      diskGrad.addColorStop(0, '#ffffff');
      diskGrad.addColorStop(0.35, `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${0.9 * intensity})`);
      diskGrad.addColorStop(0.7, `rgba(${palette.outer.r}, ${palette.outer.g}, ${palette.outer.b}, ${0.5 * intensity})`);
      diskGrad.addColorStop(1, 'transparent');
      c.fillStyle = diskGrad;
      c.beginPath();
      c.ellipse(0, 0, coreRadius * 2.5, coreRadius * 1.4, 0, 0, Math.PI * 2);
      c.fill();

      // Black void core
      c.fillStyle = '#050308';
      c.beginPath();
      c.arc(0, 0, coreRadius, 0, Math.PI * 2);
      c.fill();

      // Core event horizon rim
      c.lineWidth = 2.5;
      c.strokeStyle = `rgba(255, 255, 255, ${0.95 * intensity})`;
      c.stroke();
      c.restore();

      // 3. Orbiting Motes & Debris
      c.save();
      c.globalCompositeOperation = 'screen';
      for (const m of this.motes) {
        const x = Math.cos(m.angle) * m.radius;
        const y = Math.sin(m.angle) * (m.radius * 0.55);
        const edgeFade = smoothstep((m.radius - 12) / 18) * smoothstep((130 - m.radius) / 20);
        c.fillStyle = `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${m.alpha * intensity * edgeFade})`;
        c.beginPath();
        c.arc(x, y, m.size, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();
    }

    c.restore();
  }

  renderOptical(ctx: VFXContext): void {
    const { ctx: c, t, definition, targetX, targetY, palette } = ctx;
    const impactTime = definition.chargeDuration;
    if (t < impactTime || t > impactTime + 0.7) return;

    const prog = (t - impactTime) / 0.7;
    const intensity = releaseEnvelope(t - impactTime, .7, .12);

    c.save();
    c.globalCompositeOperation = 'screen';

    // Rotating accretion glare rays
    c.save();
    c.translate(targetX, targetY);
    c.rotate(-t * 2);

    const rayCount = 4;
    const rayLen = 95 * intensity;
    for (let i = 0; i < rayCount; i++) {
      const a = (i / rayCount) * Math.PI * 2;
      const x = Math.cos(a) * rayLen;
      const y = Math.sin(a) * (rayLen * 0.5);
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(x, y);
      c.lineWidth = 3 * intensity;
      c.strokeStyle = `rgba(255, 255, 255, ${0.85 * intensity})`;
      c.stroke();
    }
    c.restore();

    // Singularity atmospheric bloom
    const bloom = c.createRadialGradient(targetX, targetY, 0, targetX, targetY, 140 * intensity);
    bloom.addColorStop(0, `rgba(255, 255, 255, ${0.8 * intensity})`);
    bloom.addColorStop(0.4, `rgba(${palette.mid.r}, ${palette.mid.g}, ${palette.mid.b}, ${0.5 * intensity})`);
    bloom.addColorStop(1, 'transparent');
    c.fillStyle = bloom;
    c.beginPath();
    c.arc(targetX, targetY, 140 * intensity, 0, Math.PI * 2);
    c.fill();

    c.restore();
  }
}
