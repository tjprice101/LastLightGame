import type { BaseVFXSystem, VFXContext } from '../types';
import { releaseEnvelope, smoothstep } from '../vfx-motion';

interface ProjectileItem {
  id: number;
  launchDelay: number;
  duration: number;
  curveFactor: number;
  x: number;
  y: number;
  hasHit: boolean;
  tail: { x: number; y: number }[];
}

function flightPoint(projectile: ProjectileItem, progress: number, ctx: VFXContext): { x: number; y: number } {
  const p = Math.max(0, Math.min(1, progress));
  const arc = Math.sin(p * Math.PI);
  return {
    x: ctx.casterX + (ctx.targetX - ctx.casterX) * p + arc * projectile.curveFactor * .4,
    y: ctx.casterY + (ctx.targetY - ctx.casterY) * p - arc * (80 + Math.abs(projectile.curveFactor)),
  };
}

export class VolleyVFXSystem implements BaseVFXSystem {
  readonly id = 'volley';

  private projectiles: ProjectileItem[] = [];
  private impactSparks: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] = [];

  reset(): void {
    this.projectiles = [];
    this.impactSparks = [];
  }

  update(ctx: VFXContext): void {
    const { t, dt, definition, casterX, casterY, targetX, targetY, shakeCallback, palette } = ctx;

    // Initialize volley projectiles if empty
    if (this.projectiles.length === 0) {
      const count = definition.tier === 'light' ? 1 : definition.tier === 'skill2' ? 6 : 4;
      const flightDuration = Math.min(.42, definition.chargeDuration);
      for (let i = 0; i < count; i++) {
        this.projectiles.push({
          id: i,
          launchDelay: definition.chargeDuration - flightDuration + i * .075,
          duration: flightDuration,
          curveFactor: (i - (count - 1) / 2) * 55,
          x: casterX,
          y: casterY,
          hasHit: false,
          tail: [],
        });
      }
    }

    // Update projectile flight
    for (const p of this.projectiles) {
      if (t < p.launchDelay) continue;
      const flightTime = t - p.launchDelay;
      const prog = Math.min(1.0, flightTime / p.duration);

      if (prog < 1.0) {
        const point = flightPoint(p, prog, ctx);
        p.x = point.x;
        p.y = point.y;
        p.tail = Array.from({ length: 12 }, (_, index) =>
          flightPoint(p, (flightTime - index * .012) / p.duration, ctx));
      } else if (!p.hasHit) {
        p.hasHit = true;
        p.x = targetX;
        p.y = targetY;
        shakeCallback(6);

        // Spawn impact sparks
        for (let s = 0; s < 12; s++) {
          const a = Math.random() * Math.PI * 2;
          const spd = 60 + Math.random() * 160;
          this.impactSparks.push({
            x: targetX,
            y: targetY,
            vx: Math.cos(a) * spd,
            vy: Math.sin(a) * spd,
            life: 0,
            color: Math.random() > 0.5
              ? `rgb(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b})`
              : '#ffffff',
          });
        }
      }
    }

    // Update sparks
    for (let i = this.impactSparks.length - 1; i >= 0; i--) {
      const s = this.impactSparks[i];
      s.life += dt;
      if (s.life >= 0.35) {
        this.impactSparks.splice(i, 1);
        continue;
      }
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 180 * dt;
    }
  }

  render(ctx: VFXContext): void {
    const { ctx: c, t, palette } = ctx;

    c.save();
    c.globalCompositeOperation = 'screen';

    // 1. Render Projectiles and Tails
    for (const p of this.projectiles) {
      if (t < p.launchDelay || t > p.launchDelay + p.duration + .13) continue;
      c.save();
      c.globalAlpha *= smoothstep((t - p.launchDelay) / .04) *
        (1 - smoothstep((t - p.launchDelay - p.duration) / .13));

      // Projectile tail
      if (p.tail.length > 1) {
        for (let i = 1; i < p.tail.length; i++) {
          c.beginPath();
          c.moveTo(p.tail[i - 1].x, p.tail[i - 1].y);
          c.lineTo(p.tail[i].x, p.tail[i].y);
          c.lineWidth = 4 * (1 - i / p.tail.length);
          c.strokeStyle = `rgba(${palette.mid.r}, ${palette.mid.g}, ${palette.mid.b}, ${.85 * (1 - i / p.tail.length)})`;
          c.lineCap = 'round';
          c.stroke();
        }
      }

      // Projectile head diamond / star
      c.save();
      c.translate(p.x, p.y);
      c.rotate(t * 18);

      c.fillStyle = '#ffffff';
      c.fillRect(-4, -4, 8, 8);

      const glow = c.createRadialGradient(0, 0, 0, 0, 0, 16);
      glow.addColorStop(0, '#ffffff');
      glow.addColorStop(0.5, `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, 0.85)`);
      glow.addColorStop(1, 'transparent');
      c.fillStyle = glow;
      c.beginPath();
      c.arc(0, 0, 16, 0, Math.PI * 2);
      c.fill();
      c.restore();
      c.restore();
    }

    // 2. Render Impact Sparks
    for (const s of this.impactSparks) {
      const alpha = Math.max(0, 1 - s.life / 0.35);
      c.fillStyle = s.color;
      c.globalAlpha = alpha;
      c.beginPath();
      c.arc(s.x, s.y, 2.5 * alpha, 0, Math.PI * 2);
      c.fill();
    }

    c.restore();
  }

  renderOptical(ctx: VFXContext): void {
    const { ctx: c, t, targetX, targetY, palette } = ctx;

    // Flash on active impacts
    const intensity = Math.min(1, this.projectiles.reduce((sum, p) =>
      sum + releaseEnvelope(t - p.launchDelay - p.duration, .38), 0));
    if (!intensity) return;

    c.save();
    c.globalCompositeOperation = 'screen';
    c.globalAlpha *= intensity;

    const bloom = c.createRadialGradient(targetX, targetY, 0, targetX, targetY, 70);
    bloom.addColorStop(0, '#ffffff');
    bloom.addColorStop(0.5, `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, 0.5)`);
    bloom.addColorStop(1, 'transparent');
    c.fillStyle = bloom;
    c.beginPath();
    c.arc(targetX, targetY, 70, 0, Math.PI * 2);
    c.fill();

    c.restore();
  }
}
