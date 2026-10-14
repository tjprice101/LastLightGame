import type { BaseVFXSystem, VFXContext } from '../types';
import { releaseEnvelope, smoothstep } from '../vfx-motion';

interface SlashParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface FissureCrack {
  x: number;
  y: number;
  angle: number;
  length: number;
  branches: { x: number; y: number; angle: number; length: number }[];
}

export class SlashVFXSystem implements BaseVFXSystem {
  readonly id = 'slash';

  private particles: SlashParticle[] = [];
  private fissureCracks: FissureCrack[] = [];
  private hasTriggeredImpact = false;

  reset(): void {
    this.particles = [];
    this.fissureCracks = [];
    this.hasTriggeredImpact = false;
  }

  update(ctx: VFXContext): void {
    const { t, dt, definition, casterX, casterY, targetX, targetY, shakeCallback, palette } = ctx;
    const impactTime = definition.chargeDuration;

    // Trigger impact shockwave and fissure at impact
    if (t >= impactTime && !this.hasTriggeredImpact) {
      this.hasTriggeredImpact = true;
      shakeCallback(definition.tier === 'ultimate' ? 24 : definition.tier === 'skill2' ? 16 : 10);

      // Create ground fissure cracks radiating from impact
      const numCracks = definition.tier === 'skill2' ? 6 : 4;
      for (let i = 0; i < numCracks; i++) {
        const baseAngle = (i / numCracks) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const mainLen = (40 + Math.random() * 50) * (definition.tier === 'skill2' ? 1.4 : 1.0);
        const branches = [];
        const numBranches = 2 + Math.floor(Math.random() * 2);
        for (let b = 0; b < numBranches; b++) {
          const branchProg = 0.3 + b * 0.35;
          const bx = targetX + Math.cos(baseAngle) * mainLen * branchProg;
          const by = targetY + Math.sin(baseAngle) * mainLen * branchProg;
          const bAngle = baseAngle + (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.4);
          branches.push({ x: bx, y: by, angle: bAngle, length: 15 + Math.random() * 25 });
        }
        this.fissureCracks.push({
          x: targetX,
          y: targetY,
          angle: baseAngle,
          length: mainLen,
          branches,
        });
      }

      // Burst spark debris
      const count = definition.tier === 'skill2' ? 65 : 45;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 100 + Math.random() * 320;
        this.particles.push({
          x: targetX,
          y: targetY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 60,
          life: 0,
          maxLife: 0.3 + Math.random() * 0.4,
          size: 2 + Math.random() * 3.5,
          color: Math.random() > 0.4
            ? `rgb(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b})`
            : `rgb(${palette.core.r}, ${palette.core.g}, ${palette.core.b})`,
        });
      }
    }

    // Update active particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 220 * dt; // gravity
      p.vx *= Math.pow(.96, dt * 60);
    }
  }

  render(ctx: VFXContext): void {
    const { ctx: c, t, definition, casterX, casterY, targetX, targetY, palette } = ctx;
    const impactTime = definition.chargeDuration;
    const isCharge = t < impactTime;
    const isSlashActive = t >= impactTime && t < impactTime + 0.45;

    c.save();

    // 1. Ground Fissure Cracks (Glowing Molten / Void Rifts)
    if (this.fissureCracks.length > 0) {
      const fissureAge = Math.max(0, t - impactTime);
      const fissureAlpha = Math.max(0, 1.0 - fissureAge / 1.2);
      if (fissureAlpha > 0) {
        c.save();
        c.globalCompositeOperation = 'screen';
        c.lineWidth = 3.5;
        c.strokeStyle = `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${fissureAlpha * 0.85})`;
        c.shadowColor = `rgb(${palette.mid.r}, ${palette.mid.g}, ${palette.mid.b})`;
        c.shadowBlur = 12;

        for (const crack of this.fissureCracks) {
          c.beginPath();
          c.moveTo(crack.x, crack.y);
          const endX = crack.x + Math.cos(crack.angle) * crack.length;
          const endY = crack.y + Math.sin(crack.angle) * crack.length;
          c.lineTo(endX, endY);
          c.stroke();

          for (const branch of crack.branches) {
            c.beginPath();
            c.moveTo(branch.x, branch.y);
            c.lineTo(branch.x + Math.cos(branch.angle) * branch.length, branch.y + Math.sin(branch.angle) * branch.length);
            c.stroke();
          }
        }
        c.restore();
      }
    }

    // 2. Windup Energy Gathering Crescent on Caster
    if (isCharge) {
      const chargeProg = smoothstep(t / impactTime);
      c.save();
      c.globalCompositeOperation = 'screen';
      c.translate(casterX, casterY);

      const radius = 25 + chargeProg * 35;
      const startAngle = -Math.PI * 0.75;
      const endAngle = startAngle + chargeProg * Math.PI * 1.5;

      c.beginPath();
      c.arc(0, 0, radius, startAngle, endAngle);
      c.lineWidth = 5 * chargeProg;
      c.strokeStyle = `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${0.8 * chargeProg})`;
      c.stroke();

      // Blade tip gleam
      const tipX = Math.cos(endAngle) * radius;
      const tipY = Math.sin(endAngle) * radius;
      const gleam = c.createRadialGradient(tipX, tipY, 0, tipX, tipY, 18);
      gleam.addColorStop(0, '#ffffff');
      gleam.addColorStop(0.4, `rgba(${palette.core.r}, ${palette.core.g}, ${palette.core.b}, 0.9)`);
      gleam.addColorStop(1, 'transparent');
      c.fillStyle = gleam;
      c.beginPath();
      c.arc(tipX, tipY, 18, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    // 3. Dynamic Kinetic Blade Slash Wave at Target
    if (isSlashActive) {
      const slashProg = (t - impactTime) / 0.45;
      const intensity = releaseEnvelope(t - impactTime, .45, .025);
      c.save();
      c.globalCompositeOperation = 'screen';
      c.globalAlpha *= intensity;
      c.translate(targetX, targetY);

      const slashAngle = definition.tier === 'skill2' ? 0.15 : -0.65;
      c.rotate(slashAngle);

      // Main curved crescent sweep
      const sweepRadius = 110 * (1 + slashProg * 0.4);
      const arcLength = Math.PI * 0.85;
      const sweep = smoothstep(slashProg * 2.5);
      const arcStart = -arcLength * .7 + sweep * .35;
      const arcEnd = arcStart + arcLength * Math.max(.04, sweep);

      // Outer plasma blade
      c.beginPath();
      c.arc(0, 0, sweepRadius, arcStart, arcEnd);
      c.lineWidth = Math.max(1, (18 - slashProg * 14) * (definition.tier === 'skill2' ? 1.4 : 1.0));
      c.strokeStyle = `rgba(${palette.mid.r}, ${palette.mid.g}, ${palette.mid.b}, ${Math.max(0, 1 - slashProg)})`;
      c.lineCap = 'round';
      c.stroke();

      // Searing sharp white-hot blade cutting edge
      c.beginPath();
      c.arc(0, 0, sweepRadius, arcStart, arcEnd);
      c.lineWidth = Math.max(1, 4.5 * (1 - slashProg));
      c.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, 1 - slashProg * 0.85)})`;
      c.stroke();

      // Secondary Opposing Blade for Skill 2 (Dual / Cross Slash)
      if (definition.tier === 'skill2') {
        c.rotate(Math.PI * 0.55);
        c.beginPath();
        c.arc(0, 0, sweepRadius * 0.9, arcStart, arcEnd);
        c.lineWidth = Math.max(1, 14 * (1 - slashProg));
        c.strokeStyle = `rgba(${palette.spectral.r}, ${palette.spectral.g}, ${palette.spectral.b}, ${Math.max(0, 1 - slashProg)})`;
        c.stroke();

        c.beginPath();
        c.arc(0, 0, sweepRadius * 0.9, arcStart, arcEnd);
        c.lineWidth = Math.max(1, 3.5 * (1 - slashProg));
        c.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, 1 - slashProg)})`;
        c.stroke();
      }

      c.restore();
    }

    // 4. Sparks & Molten Splatter
    if (this.particles.length > 0) {
      c.save();
      c.globalCompositeOperation = 'screen';
      for (const p of this.particles) {
        const alpha = Math.max(0, 1 - p.life / p.maxLife);
        c.fillStyle = p.color;
        c.globalAlpha = alpha;
        c.beginPath();
        c.arc(p.x, p.y, p.size * (1 - p.life / p.maxLife * 0.5), 0, Math.PI * 2);
        c.fill();
      }
      c.restore();
    }

    c.restore();
  }

  renderOptical(ctx: VFXContext): void {
    const { ctx: c, t, definition, targetX, targetY, palette } = ctx;
    const impactTime = definition.chargeDuration;
    if (t < impactTime || t > impactTime + 0.4) return;

    const prog = (t - impactTime) / 0.4;
    const intensity = releaseEnvelope(t - impactTime, .4);

    c.save();
    c.globalCompositeOperation = 'screen';

    // Horizontal cutting glare flash
    const streakW = 420 * intensity;
    const streakH = 6 * intensity;
    const grad = c.createLinearGradient(targetX - streakW * 0.5, targetY, targetX + streakW * 0.5, targetY);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.3, `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${0.5 * intensity})`);
    grad.addColorStop(0.5, `rgba(255, 255, 255, ${0.95 * intensity})`);
    grad.addColorStop(0.7, `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${0.5 * intensity})`);
    grad.addColorStop(1, 'transparent');

    c.fillStyle = grad;
    c.beginPath();
    c.ellipse(targetX, targetY, streakW * 0.5, streakH, -0.4, 0, Math.PI * 2);
    c.fill();

    // Impact core bloom
    const bloom = c.createRadialGradient(targetX, targetY, 0, targetX, targetY, 90 * intensity);
    bloom.addColorStop(0, `rgba(255, 255, 255, ${0.9 * intensity})`);
    bloom.addColorStop(0.4, `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${0.6 * intensity})`);
    bloom.addColorStop(1, 'transparent');
    c.fillStyle = bloom;
    c.beginPath();
    c.arc(targetX, targetY, 90 * intensity, 0, Math.PI * 2);
    c.fill();

    c.restore();
  }
}
