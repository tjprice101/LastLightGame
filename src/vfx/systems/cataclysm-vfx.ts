import type { BaseVFXSystem, VFXContext } from '../types';
import { releaseEnvelope, smoothstep } from '../vfx-motion';

export class CataclysmVFXSystem implements BaseVFXSystem {
  readonly id = 'cataclysm';

  private hasTriggeredApex = false;

  reset(): void {
    this.hasTriggeredApex = false;
  }

  update(ctx: VFXContext): void {
    const { t, definition, shakeCallback } = ctx;
    const apexTime = definition.chargeDuration;

    if (t >= apexTime && !this.hasTriggeredApex) {
      this.hasTriggeredApex = true;
      shakeCallback(32); // Massive screen shake for Last Flare apex
    }
  }

  renderBackground(ctx: VFXContext): void {
    const { ctx: c, t, definition, width, height } = ctx;
    const charge = smoothstep(t / definition.chargeDuration);
    const age = Math.max(0, t - definition.chargeDuration);
    const fade = 1 - smoothstep(age / (definition.impactDuration * .8));
    if (ctx.secondaryTarget) return;
    c.save();
    c.fillStyle = `rgba(3, 5, 10, ${.35 * charge * fade})`;
    c.fillRect(0, 0, width, height);
    c.restore();
  }

  render(ctx: VFXContext): void {
    const { ctx: c, t, definition, targetX, targetY, casterX, casterY, palette, width, height } = ctx;
    const apexTime = definition.chargeDuration;
    const isCharging = t < apexTime;
    const charId = ctx.definition.palette.id;
    const chargeProg = isCharging ? smoothstep(t / apexTime) : 1;
    const apexProg = isCharging ? 0 : Math.min(1, (t - apexTime) / definition.impactDuration);
    const release = smoothstep((t - apexTime) / .24);
    const apexIntensity = isCharging ? chargeProg * 0.7
      : (.7 + .3 * smoothstep((t - apexTime) / .07)) * Math.pow(Math.max(0, 1 - apexProg), 1.4);

    c.save();

    // 2. Character-Specific Ultimate Geometry & Phenomena
    c.save();
    c.globalCompositeOperation = 'screen';
    c.globalAlpha *= apexIntensity;

    // A. INFERNIS: Volcanic Caldera & Soaring Magma Spires
    if (charId === 'ember') {
      c.save();
      c.translate(targetX, targetY);
      if (isCharging || t < apexTime + .3) {
        // Ground caldera fissure opening
        c.beginPath();
        c.ellipse(0, 30, 140 * chargeProg, 50 * chargeProg, 0, 0, Math.PI * 2);
        c.fillStyle = `rgba(255, 90, 15, ${0.2 * chargeProg * (1 - release)})`;
        c.fill();
        c.strokeStyle = '#ffffff';
        c.lineWidth = 2 * chargeProg;
        c.stroke();
      }
      if (!isCharging) {
        // Triple magma spires erupting skyward
        for (const offset of [-60, 0, 60]) {
          const spireH = Math.min(height * .65, 260) * smoothstep((t - apexTime) / .14) * (1 - apexProg * 0.35);
          const spireW = (50 - Math.abs(offset) * 0.3) * apexIntensity;
          const pGrad = c.createLinearGradient(offset, 30, offset, 30 - spireH);
          pGrad.addColorStop(0, '#ffffff');
          pGrad.addColorStop(0.3, `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${0.95 * apexIntensity})`);
          pGrad.addColorStop(0.7, `rgba(${palette.outer.r}, ${palette.outer.g}, ${palette.outer.b}, ${0.65 * apexIntensity})`);
          pGrad.addColorStop(1, 'transparent');
          c.fillStyle = pGrad;
          const sway = Math.sin(t * 5 + offset * .07) * spireW * .8;
          c.beginPath();
          c.moveTo(offset - spireW * .5, 30);
          c.bezierCurveTo(offset - spireW, 30 - spireH * .35,
            offset + sway - spireW * .6, 30 - spireH * .7, offset + sway, 30 - spireH);
          c.bezierCurveTo(offset + sway + spireW * .3, 30 - spireH * .6,
            offset + spireW * .7, 30 - spireH * .25, offset + spireW * .5, 30);
          c.closePath();
          c.fill();
          c.beginPath();
          c.moveTo(offset, 30);
          c.bezierCurveTo(offset - sway * .3, 30 - spireH * .25,
            offset + sway, 30 - spireH * .6, offset + sway, 30 - spireH * .85);
          c.lineWidth = 3 * apexIntensity;
          c.strokeStyle = `rgba(255, 240, 180, ${.8 * apexIntensity})`;
          c.stroke();
        }
      }
      c.restore();
    }

    // B. TIZU: Ocean Leviathan Tsunami & Hydro Vortex
    else if (charId === 'tide') {
      c.save();
      if (isCharging || t < apexTime + .24) {
        c.save();
        c.globalAlpha *= 1 - release;
        c.translate(targetX, targetY);
        // Swirling water vortex gathering
        for (let r = 0; r < 3; r++) {
          const rad = (40 + r * 35) * chargeProg;
          c.beginPath();
          c.arc(0, 15, rad, t * 4 + r, t * 4 + r + Math.PI * 1.4);
          c.lineWidth = 4 * chargeProg;
          c.strokeStyle = `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${0.8 * chargeProg})`;
          c.stroke();
        }
        c.restore();
      }
      if (!isCharging) {
        c.globalAlpha *= release;
        const waveX = casterX + (targetX - casterX) * smoothstep(apexProg * 1.4);
        const waveH = 160 * Math.sin(Math.min(1, apexProg) * Math.PI);
        // Giant tsunami wall crashing
        c.beginPath();
        c.moveTo(waveX - 220, targetY + 45);
        c.quadraticCurveTo(waveX, targetY - waveH, waveX + 220, targetY + 45);
        c.lineWidth = 40 * apexIntensity;
        c.strokeStyle = `rgba(${palette.mid.r}, ${palette.mid.g}, ${palette.mid.b}, ${0.85 * apexIntensity})`;
        c.stroke();
        // Foam crest
        c.beginPath();
        c.moveTo(waveX - 190, targetY + 38);
        c.quadraticCurveTo(waveX, targetY - waveH - 12, waveX + 190, targetY + 38);
        c.lineWidth = 10 * apexIntensity;
        c.strokeStyle = `rgba(255, 255, 255, ${0.95 * apexIntensity})`;
        c.stroke();
      }
      c.restore();
    }

    // C. FLORA: Sacred World Tree & Cascading Emerald Blossoms
    else if (charId === 'sprout') {
      c.save();
      c.translate(targetX, targetY + 35);
      const treeGrowth = isCharging ? chargeProg * 0.6 : 0.6 + apexProg * 0.4;
      const trunkH = 140 * treeGrowth;
      // Radiant trunk
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(0, -trunkH);
      c.lineWidth = 8 * apexIntensity;
      c.strokeStyle = `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${0.9 * apexIntensity})`;
      c.stroke();
      for (let branch = 0; branch < 6; branch++) {
        const side = branch % 2 === 0 ? 1 : -1;
        const rootY = -trunkH * (.25 + Math.floor(branch / 2) * .22);
        const spread = (60 - Math.floor(branch / 2) * 12) * treeGrowth;
        const endX = side * spread;
        const endY = rootY - 35 * treeGrowth + Math.sin(t * 2 + branch) * 6;
        c.beginPath();
        c.moveTo(0, rootY);
        c.quadraticCurveTo(endX * .65, rootY, endX, endY);
        c.lineWidth = 3 * apexIntensity;
        c.stroke();
        for (let leaf = 0; leaf < 3; leaf++) {
          const drift = isCharging ? 0 : release * (leaf * 9 + 10);
          c.beginPath();
          c.ellipse(endX + side * leaf * 9 + Math.sin(t * 2 + leaf) * drift * .3,
            endY + leaf * 6 + drift, 3 * apexIntensity, 7 * apexIntensity, side * .6, 0, Math.PI * 2);
          c.fillStyle = `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${.75 * apexIntensity})`;
          c.fill();
        }
      }
      // Tree canopy glow
      const canopyR = 100 * treeGrowth;
      const canopyGrad = c.createRadialGradient(0, -trunkH, 0, 0, -trunkH, canopyR);
      canopyGrad.addColorStop(0, `rgba(255, 255, 235, ${.4 * apexIntensity})`);
      canopyGrad.addColorStop(0.4, `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${0.3 * apexIntensity})`);
      canopyGrad.addColorStop(0.8, `rgba(${palette.mid.r}, ${palette.mid.g}, ${palette.mid.b}, ${0.1 * apexIntensity})`);
      canopyGrad.addColorStop(1, 'transparent');
      c.fillStyle = canopyGrad;
      c.beginPath();
      c.arc(0, -trunkH, canopyR, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    // D. ATMOSO: Typhoon Vortex & Hurricane Wind-Shear
    else if (charId === 'atmoso') {
      c.save();
      c.translate(targetX, targetY);
      const rot = t * 6;
      for (let arm = 0; arm < 4; arm++) {
        const armAngle = rot + (arm / 4) * Math.PI * 2;
        const armLen = isCharging ? 60 * chargeProg : 60 + release * 80 + apexProg * 70;
        c.beginPath();
        c.moveTo(0, 0);
        c.quadraticCurveTo(Math.cos(armAngle + 0.5) * armLen * 0.6, Math.sin(armAngle + 0.5) * armLen * 0.6, Math.cos(armAngle) * armLen, Math.sin(armAngle) * armLen);
        c.lineWidth = (4 + 4 * release) * apexIntensity;
        c.strokeStyle = `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${0.85 * apexIntensity})`;
        c.stroke();
        c.beginPath();
        c.moveTo(Math.cos(armAngle - .2) * armLen * .22, Math.sin(armAngle - .2) * armLen * .22);
        c.quadraticCurveTo(Math.cos(armAngle + .8) * armLen * .8,
          Math.sin(armAngle + .8) * armLen * .8,
          Math.cos(armAngle + .2) * armLen * 1.1, Math.sin(armAngle + .2) * armLen * 1.1);
        c.lineWidth = 1.5 * apexIntensity;
        c.strokeStyle = `rgba(${palette.spectral.r}, ${palette.spectral.g}, ${palette.spectral.b}, ${.6 * apexIntensity})`;
        c.stroke();
      }
      c.restore();
    }

    // E. AURORA: Prismatic Star Collapse & Supernova Starburst
    else if (charId === 'aurora') {
      c.save();
      c.translate(targetX, targetY);
      if (isCharging) {
        const rad = 150 * (1 - chargeProg * 0.85);
        c.beginPath();
        c.arc(0, 0, rad, 0, Math.PI * 2);
        c.strokeStyle = '#ffffff';
        c.lineWidth = 3;
        c.stroke();
      } else {
        const burstR = 22.5 + apexProg * Math.min(width * .65, 360);
        c.beginPath();
        c.arc(0, 0, burstR, 0, Math.PI * 2);
        c.lineWidth = 8 * apexIntensity;
        c.strokeStyle = `rgba(255, 255, 255, ${apexIntensity})`;
        c.stroke();
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const len = apexProg * (width * 0.5);
          c.beginPath();
          c.moveTo(0, 0);
          c.lineTo(Math.cos(a) * len, Math.sin(a) * len);
          c.lineWidth = 4 * apexIntensity;
          c.strokeStyle = i % 2 === 0 ? '#ffffff' : `rgb(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b})`;
          c.stroke();
        }
      }
      c.restore();
    }

    // F. BLISS: Seraphic Archangel Quill Mandala
    else if (charId === 'bliss') {
      c.save();
      c.translate(targetX, targetY);
      const featherCount = 12;
      const rot = t * 1.5;
      for (let i = 0; i < featherCount; i++) {
        const a = rot + (i / featherCount) * Math.PI * 2;
        const dist = isCharging ? 40 * chargeProg : 40 + release * 20 + apexProg * 120;
        c.save();
        c.translate(Math.cos(a) * dist, Math.sin(a) * dist);
        c.rotate(a + Math.PI / 2);
        c.beginPath();
        c.ellipse(0, 0, 8 * apexIntensity, 36 * apexIntensity, 0, 0, Math.PI * 2);
        c.fillStyle = `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${0.85 * apexIntensity})`;
        c.fill();
        c.strokeStyle = '#ffffff';
        c.lineWidth = 1.5;
        c.stroke();
        c.restore();
      }
      c.restore();
    }

    // G. BRUNO: Tectonic Fault Crust Rupture & Boulder Monoliths
    else if (charId === 'bruno') {
      c.save();
      c.translate(targetX, targetY + 30);
      if (isCharging) {
        c.beginPath();
        c.arc(0, 0, 80 * chargeProg, 0, Math.PI * 2);
        c.lineWidth = 4 * chargeProg;
        c.strokeStyle = `rgba(255, 140, 30, ${0.7 * chargeProg})`;
        c.stroke();
      } else {
        // Vaulting stone spires
        for (let s = -2; s <= 2; s++) {
          const spireH = (110 - Math.abs(s) * 20) * smoothstep((t - apexTime) / .12) * (1 - apexProg * 0.4);
          const spireW = 28 * apexIntensity;
          c.save();
          c.translate(s * 36, 0);
          c.beginPath();
          c.moveTo(-spireW * 0.5, 0);
          c.lineTo(-spireW * 0.2, -spireH);
          c.lineTo(0, -spireH - 15);
          c.lineTo(spireW * 0.2, -spireH);
          c.lineTo(spireW * 0.5, 0);
          c.closePath();
          c.fillStyle = `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${0.9 * apexIntensity})`;
          c.fill();
          c.strokeStyle = '#ffffff';
          c.lineWidth = 2;
          c.stroke();
          c.restore();
        }
      }
      c.restore();
    }

    // H. DISCIPLE: Cosmic Astral Eye & Reality Fracture Seam
    else if (charId === 'disciple') {
      c.save();
      c.translate(targetX, targetY);
      const eyeR = isCharging ? 40 * chargeProg : 40 + release * 25 + apexProg * 26;
      // Outer diamond iris
      c.beginPath();
      c.moveTo(0, -eyeR);
      c.lineTo(eyeR * 1.6, 0);
      c.lineTo(0, eyeR);
      c.lineTo(-eyeR * 1.6, 0);
      c.closePath();
      c.lineWidth = 4 * apexIntensity;
      c.strokeStyle = `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${0.9 * apexIntensity})`;
      c.stroke();
      // Center pupil void
      c.beginPath();
      c.arc(0, 0, eyeR * 0.18, 0, Math.PI * 2);
      c.fillStyle = '#ffffff';
      c.fill();
      for (let orbit = 0; orbit < 3; orbit++) {
        c.beginPath();
        c.ellipse(0, 0, eyeR * (1.2 + orbit * .25), eyeR * .35,
          t * (.3 + orbit * .15) + orbit * Math.PI / 3, 0, Math.PI * 2);
        c.lineWidth = 1.5 * apexIntensity;
        c.strokeStyle = `rgba(${palette.spectral.r}, ${palette.spectral.g}, ${palette.spectral.b}, ${.6 * apexIntensity})`;
        c.stroke();
      }
      c.restore();
    }

    // I. ELISE: Thunder God Plasma Hex-Array
    else if (charId === 'elise') {
      c.save();
      c.translate(targetX, targetY);
      const hexR = isCharging ? 50 * chargeProg : 50 + release * 70 + apexProg * 72;
      // Rotating electric hexagon
      c.beginPath();
      for (let v = 0; v < 6; v++) {
        const a = t * 3 + (v / 6) * Math.PI * 2;
        const hx = Math.cos(a) * hexR;
        const hy = Math.sin(a) * hexR;
        if (v === 0) c.moveTo(hx, hy);
        else c.lineTo(hx, hy);
      }
      c.closePath();
      c.lineWidth = 5 * apexIntensity;
      c.strokeStyle = `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${0.95 * apexIntensity})`;
      c.stroke();
      // Lightning spear strike
      if (!isCharging) {
        c.beginPath();
        const boltHeight = Math.min(height * .65, 280) * smoothstep((t - apexTime) / .07);
        c.moveTo(0, -boltHeight);
        for (let segment = 1; segment <= 10; segment++) {
          const fraction = segment / 10;
          c.lineTo(Math.sin(segment * 2.4 + t * 9) * 11 * Math.sin(fraction * Math.PI),
            -boltHeight + (boltHeight + 20) * fraction);
        }
        c.lineWidth = 5 * apexIntensity;
        c.strokeStyle = '#ffffff';
        c.stroke();
      }
      c.restore();
    }

    // J. RAZOR: Event Horizon Black Hole & Accretion Ring
    else if (charId === 'razor') {
      c.save();
      c.translate(targetX, targetY);
      const holeR = isCharging ? 30 * chargeProg : 30 + release * 25;
      // Spinning accretion disk
      for (let ring = 0; ring < 3; ring++) {
        const rR = (holeR + 25 + ring * 25) * (isCharging ? chargeProg : 1 + apexProg * 0.5);
        c.beginPath();
        c.arc(0, 0, rR, t * 5 + ring, t * 5 + ring + Math.PI * 1.5);
        c.lineWidth = 6 * apexIntensity;
        c.strokeStyle = `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${0.85 * apexIntensity})`;
        c.stroke();
      }
      // Pure black core void
      c.beginPath();
      c.arc(0, 0, holeR, 0, Math.PI * 2);
      c.fillStyle = '#05020c';
      c.fill();
      c.strokeStyle = '#ffffff';
      c.lineWidth = 2 * apexIntensity;
      c.stroke();
      c.restore();
    }

    // K. ROSETTA: Solar Rose Celestial Mandala
    else if (charId === 'rosetta') {
      c.save();
      c.translate(targetX, targetY);
      const roseLayers = 3;
      for (let l = 0; l < roseLayers; l++) {
        const pCount = 8 + l * 2;
        const layerR = (35 + l * 30) * (isCharging ? chargeProg : 1 + apexProg * 0.5);
        const rot = t * (l % 2 === 0 ? 1.2 : -1.2);
        for (let p = 0; p < pCount; p++) {
          const a = rot + (p / pCount) * Math.PI * 2;
          c.save();
          c.translate(Math.cos(a) * layerR, Math.sin(a) * layerR);
          c.rotate(a + Math.PI / 2);
          c.beginPath();
          c.ellipse(0, 0, 10 * apexIntensity, 24 * apexIntensity, 0, 0, Math.PI * 2);
          c.fillStyle = `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${0.85 * apexIntensity})`;
          c.fill();
          c.strokeStyle = '#ffffff';
          c.lineWidth = 1.5;
          c.stroke();
          c.restore();
        }
      }
      c.restore();
    }

    // L. THORNIA: Midnight Bramble Obsidian Forest
    else if (charId === 'thornia') {
      c.save();
      c.translate(targetX, targetY + 30);
      const spikeCount = 7;
      for (let i = 0; i < spikeCount; i++) {
        const offset = (i - (spikeCount - 1) / 2) * 35;
        const spikeH = (120 - Math.abs(offset) * 0.4) * (isCharging ? chargeProg : 1 - apexProg * 0.4);
        c.save();
        c.translate(offset, 0);
        c.rotate((offset / 150) * 0.35);
        c.beginPath();
        c.moveTo(-10 * apexIntensity, 0);
        c.lineTo(0, -spikeH);
        c.lineTo(10 * apexIntensity, 0);
        c.closePath();
        c.fillStyle = `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${0.9 * apexIntensity})`;
        c.fill();
        c.strokeStyle = '#ffffff';
        c.lineWidth = 1.5;
        c.stroke();
        c.restore();
      }
      c.restore();
    }

    // M. CRINSO: Dual Chaos Yin-Yang Wheel of Fire & Lightning
    else if (charId === 'crinso') {
      c.save();
      c.translate(targetX, targetY);
      const wheelR = isCharging ? 40 * chargeProg : 40 + release * 70 + apexProg * 44;
      const rot = t * 5;
      // Flame crescent (gold)
      c.beginPath();
      c.arc(0, 0, wheelR, rot, rot + Math.PI);
      c.lineWidth = 12 * apexIntensity;
      c.strokeStyle = `rgba(255, 190, 40, ${0.9 * apexIntensity})`;
      c.stroke();
      for (let arm = 0; arm < 2; arm++) {
        c.beginPath();
        const angle = rot + arm * Math.PI;
        c.moveTo(Math.cos(angle) * wheelR, Math.sin(angle) * wheelR);
        c.bezierCurveTo(Math.cos(angle + 1) * wheelR * .8, Math.sin(angle + 1) * wheelR * .8,
          Math.cos(angle + 2) * wheelR * .35, Math.sin(angle + 2) * wheelR * .35, 0, 0);
        c.lineWidth = 3 * apexIntensity;
        c.strokeStyle = arm === 0 ? '#ffe6a0' : '#ff778e';
        c.stroke();
      }
      // Lightning crescent (crimson)
      c.beginPath();
      c.arc(0, 0, wheelR, rot + Math.PI, rot + Math.PI * 2);
      c.lineWidth = 12 * apexIntensity;
      c.strokeStyle = `rgba(255, 30, 60, ${0.9 * apexIntensity})`;
      c.stroke();
      c.restore();
    }

    // N. NERITHE: Abyssal Trench Maelstrom & Cavitation Drills
    else if (charId === 'nerithe') {
      c.save();
      c.translate(targetX, targetY);
      const trenchR = isCharging ? 35 * chargeProg : 35 + release * 55 + apexProg * 45;
      for (let ring = 0; ring < 4; ring++) {
        const r = trenchR * (0.4 + ring * 0.25);
        c.beginPath();
        c.ellipse(0, 20, r, r * 0.4, 0, 0, Math.PI * 2);
        c.lineWidth = 5 * apexIntensity;
        c.strokeStyle = `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${0.85 * apexIntensity})`;
        c.stroke();
      }
      for (let stream = 0; stream < 3; stream++) {
        c.beginPath();
        for (let point = 0; point <= 24; point++) {
          const fraction = point / 24;
          const angle = t * 3 + stream * Math.PI * 2 / 3 + fraction * Math.PI * 2;
          const radius = trenchR * (1 - fraction * .75);
          const x = Math.cos(angle) * radius;
          const y = 20 + Math.sin(angle) * radius * .4 - fraction * 70 * chargeProg;
          if (point === 0) c.moveTo(x, y);
          else c.lineTo(x, y);
        }
        c.lineWidth = 2 * apexIntensity;
        c.strokeStyle = `rgba(${palette.spectral.r}, ${palette.spectral.g}, ${palette.spectral.b}, ${.65 * apexIntensity})`;
        c.stroke();
      }
      c.restore();
    }

    // O. ORVELLA: Adamantine Citadel Fortress & Bastion Barrier
    else if (charId === 'orvella') {
      c.save();
      c.translate(targetX, targetY + 25);
      const fortW = 180 * (isCharging ? chargeProg : 1);
      const fortH = 90 * (isCharging ? chargeProg : 1);
      c.beginPath();
      c.moveTo(-fortW * .5, 0);
      c.lineTo(-fortW * .5, -fortH * .65);
      c.quadraticCurveTo(0, -fortH * 1.4, fortW * .5, -fortH * .65);
      c.lineTo(fortW * .5, 0);
      c.quadraticCurveTo(0, fortH * .25, -fortW * .5, 0);
      c.closePath();
      c.lineWidth = 6 * apexIntensity;
      c.strokeStyle = `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${0.9 * apexIntensity})`;
      c.stroke();
      c.fillStyle = `rgba(${palette.mid.r}, ${palette.mid.g}, ${palette.mid.b}, ${0.1 * apexIntensity})`;
      c.fill();
      for (let rib = -2; rib <= 2; rib++) {
        const x = rib * fortW * .18;
        const sway = Math.sin(t * 1.5 + rib) * 4 * release;
        c.beginPath();
        c.moveTo(x, 0);
        c.quadraticCurveTo(x + sway, -fortH * .45, x * .8, -fortH * (1 - Math.abs(rib) * .1));
        c.lineWidth = 2 * apexIntensity;
        c.stroke();
        c.beginPath();
        c.moveTo(x - 5, -fortH * .3);
        c.lineTo(x, -fortH * .4);
        c.lineTo(x + 5, -fortH * .3);
        c.stroke();
      }
      c.restore();
    }

    // P. VAELOR: Harmonic Acoustic Resonance Cascade
    else if (charId === 'vaelor') {
      c.save();
      c.translate(targetX, targetY);
      const waveCount = 5;
      for (let w = 0; w < waveCount; w++) {
        const wR = isCharging ? (30 + w * 20) * chargeProg
          : 30 + w * 20 + (30 + w * 10) * release + apexProg * 180;
        c.beginPath();
        c.arc(0, 0, wR, 0, Math.PI * 2);
        c.lineWidth = 3.5 * apexIntensity;
        c.strokeStyle = w % 2 === 0 ? '#ffffff' : `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${0.85 * apexIntensity})`;
        c.stroke();
      }
      c.restore();
    }

    c.restore();
    c.restore();
  }

  renderOptical(ctx: VFXContext): void {
    const { ctx: c, t, definition, targetX, targetY, palette } = ctx;
    const apexTime = definition.chargeDuration;
    if (t < apexTime || t > apexTime + 0.8) return;

    const prog = (t - apexTime) / 0.8;
    const intensity = releaseEnvelope(t - apexTime, .8);

    c.save();
    c.globalCompositeOperation = 'screen';

    // Full screen anamorphic flash streak
    const streakW = Math.min(ctx.width * .8, 540) * intensity;
    const streakH = 4 * intensity;
    const grad = c.createLinearGradient(targetX - streakW * 0.5, targetY, targetX + streakW * 0.5, targetY);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.3, `rgba(${palette.spectral.r}, ${palette.spectral.g}, ${palette.spectral.b}, ${0.5 * intensity})`);
    grad.addColorStop(0.5, `rgba(255, 255, 255, ${0.98 * intensity})`);
    grad.addColorStop(0.7, `rgba(${palette.spectral.r}, ${palette.spectral.g}, ${palette.spectral.b}, ${0.5 * intensity})`);
    grad.addColorStop(1, 'transparent');

    c.fillStyle = grad;
    c.beginPath();
    c.ellipse(targetX, targetY, streakW * 0.5, streakH, 0, 0, Math.PI * 2);
    c.fill();

    // Screen-filling optical radiant bloom
    const radius = 85 + prog * 45;
    const bloom = c.createRadialGradient(targetX, targetY, 0, targetX, targetY, radius);
    bloom.addColorStop(0, `rgba(255, 255, 255, ${.55 * intensity})`);
    bloom.addColorStop(0.25, `rgba(${palette.inner.r}, ${palette.inner.g}, ${palette.inner.b}, ${0.3 * intensity})`);
    bloom.addColorStop(0.6, `rgba(${palette.mid.r}, ${palette.mid.g}, ${palette.mid.b}, ${0.1 * intensity})`);
    bloom.addColorStop(1, 'transparent');
    c.fillStyle = bloom;
    c.beginPath();
    c.arc(targetX, targetY, radius, 0, Math.PI * 2);
    c.fill();

    c.restore();
  }
}
