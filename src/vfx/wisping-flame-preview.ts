import './vfx-preview.css';
import { MasterVFXEngine } from './master-vfx-engine';
import { CHARACTER_PROFILES } from './vfx-registry';
import type { AbilityTier, VFXArchetype } from './types';

// Archetype styling metadata
const ARCHETYPE_META: Record<VFXArchetype, { name: string; color: string; icon: string }> = {
  slash: { name: 'Slash & Fissure Engine', color: '#f97316', icon: '⚔️' },
  beam: { name: 'Prismatic Laser Engine', color: '#38bdf8', icon: '💎' },
  mandala: { name: 'Sacred Mandala Engine', color: '#ec4899', icon: '💮' },
  slam: { name: 'Tectonic Slam Engine', color: '#eab308', icon: '🌋' },
  vortex: { name: 'Vortex Singularity Engine', color: '#8b5cf6', icon: '🌌' },
  volley: { name: 'Volley & Ballistics Engine', color: '#10b981', icon: '⚡' },
  cataclysm: { name: 'Cinematic Cataclysm Engine', color: '#ef4444', icon: '💥' },
};

function init() {
  const canvas = document.getElementById('vfx-canvas') as HTMLCanvasElement;
  if (!canvas) throw new Error('VFX Canvas element not found');

  // Initialize Master VFX Engine
  const engine = new MasterVFXEngine(canvas, 'ember', 'skill1');

  // Handle Canvas Resizing
  function handleResize() {
    engine.resizeCanvas();
  }
  window.addEventListener('resize', handleResize);
  handleResize();

  canvas.addEventListener('mousedown', () => {
    engine.restart();
    updatePlayButtonUI();
  });

  // UI Control Elements
  const playPauseBtn = document.getElementById('btn-play-pause') as HTMLButtonElement;
  const replayBtn = document.getElementById('btn-replay') as HTMLButtonElement;
  const scrubber = document.getElementById('timeline-scrubber') as HTMLInputElement;
  const timeDisplay = document.getElementById('time-display') as HTMLSpanElement;
  const phasePill = document.getElementById('phase-pill') as HTMLSpanElement;
  const loopToggle = document.getElementById('btn-loop-toggle') as HTMLButtonElement;

  const fpsLabel = document.getElementById('telemetry-fps') as HTMLElement;
  const particleCountLabel = document.getElementById('telemetry-particles') as HTMLElement;
  const frameTimeLabel = document.getElementById('telemetry-frametime') as HTMLElement;

  function updatePlayButtonUI() {
    playPauseBtn.innerHTML = '<span>⏸ Pause</span>';
  }

  playPauseBtn.addEventListener('click', () => {
    const isPlaying = engine.togglePlay();
    playPauseBtn.innerHTML = isPlaying ? '<span>⏸ Pause</span>' : '<span>▶ Play</span>';
  });

  replayBtn.addEventListener('click', () => {
    engine.restart();
    updatePlayButtonUI();
  });

  loopToggle.addEventListener('click', () => {
    engine.config.loop = !engine.config.loop;
    loopToggle.classList.toggle('active', engine.config.loop);
    loopToggle.textContent = engine.config.loop ? '🔁 Loop: On' : '➡️ Loop: Off';
  });

  scrubber.addEventListener('input', () => {
    const val = parseFloat(scrubber.value);
    engine.scrub(val / 100);
    playPauseBtn.innerHTML = '<span>▶ Play</span>';
  });

  // Speed selectors
  const speedBtns = document.querySelectorAll<HTMLButtonElement>('.speed-btn');
  speedBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      speedBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      engine.config.playbackSpeed = parseFloat(btn.dataset.speed || '1.0');
    });
  });

  // Character & Ability Selectors
  const characterSelect = document.getElementById('vfx-character-select') as HTMLSelectElement | null;
  const abilityButtonsContainer = document.getElementById('vfx-ability-buttons');
  const abilityTitle = document.getElementById('vfx-ability-title');
  const archetypeBadge = document.getElementById('vfx-archetype-badge');
  const abilityDetails = document.getElementById('vfx-ability-details');
  const abilityDesc = document.getElementById('vfx-ability-desc');

  const abilityTiers: { id: AbilityTier; label: string }[] = [
    { id: 'light', label: 'Normal' },
    { id: 'skill1', label: 'Skill 1' },
    { id: 'skill2', label: 'Skill 2' },
    { id: 'ultimate', label: 'Last Flare' },
  ];

  let currentTier: AbilityTier = 'skill1';

  function updateAbilityHUD() {
    const profile = engine.getProfile();
    const ability = engine.getAbility();
    const archetype = ability.archetype;
    const archMeta = ARCHETYPE_META[archetype] || ARCHETYPE_META.slash;

    if (abilityTitle) {
      abilityTitle.textContent = ability.name;
    }
    if (archetypeBadge) {
      archetypeBadge.textContent = `${archMeta.icon} ${archMeta.name}`;
      archetypeBadge.style.background = archMeta.color;
    }
    if (abilityDetails) {
      abilityDetails.textContent = `${profile.characterName} (${profile.element}) · Weapon: ${profile.weapon} · System: ${ability.archetype.toUpperCase()}`;
    }
    if (abilityDesc) {
      abilityDesc.textContent = ability.description;
    }

    // Refresh ability buttons
    if (abilityButtonsContainer) {
      const buttons = abilityButtonsContainer.querySelectorAll('button');
      buttons.forEach((b) => {
        const isCurrent = b.dataset.tier === currentTier;
        b.style.background = isCurrent ? '#2563eb' : '#1e293b';
        b.style.borderColor = isCurrent ? '#60a5fa' : '#475569';
        b.style.color = '#fff';
      });
    }

    // Refresh palette cards
    document.querySelectorAll('.palette-card').forEach((c) => {
      const palCard = c as HTMLElement;
      palCard.classList.toggle('selected', palCard.dataset.palId === ability.palette.id);
    });
  }

  if (characterSelect) {
    Object.values(CHARACTER_PROFILES).forEach((profile) => {
      const opt = document.createElement('option');
      opt.value = profile.characterId;
      opt.textContent = `${profile.characterName} (${profile.element} · ${profile.weapon})`;
      characterSelect.appendChild(opt);
    });
    characterSelect.value = engine.getProfile().characterId;

    characterSelect.addEventListener('change', () => {
      engine.setCharacter(characterSelect.value);
      engine.restart();
      updatePlayButtonUI();
      updateAbilityHUD();
    });
  }

  if (abilityButtonsContainer) {
    abilityTiers.forEach((tier) => {
      const btn = document.createElement('button');
      btn.dataset.tier = tier.id;
      btn.textContent = tier.label;
      btn.style.cssText = 'min-height: 34px; padding: 4px 8px; font-size: 11px; font-weight: 600; border-radius: 4px; border: 1px solid #475569; cursor: pointer; transition: all 0.15s ease;';
      btn.addEventListener('click', () => {
        currentTier = tier.id;
        engine.setAbility(tier.id);
        engine.restart();
        updatePlayButtonUI();
        updateAbilityHUD();
      });
      abilityButtonsContainer.appendChild(btn);
    });
  }

  updateAbilityHUD();

  // Palettes Grid
  const paletteContainer = document.getElementById('palette-container');
  if (paletteContainer) {
    Object.values(CHARACTER_PROFILES).forEach((prof) => {
      const pal = prof.abilities.ultimate.palette;
      const card = document.createElement('div');
      card.className = `palette-card ${engine.getAbility().palette.id === pal.id ? 'selected' : ''}`;
      card.dataset.palId = pal.id;
      card.innerHTML = `
        <div class="palette-info">
          <span class="palette-name">${pal.name}</span>
        </div>
        <div class="palette-preview-bar">
          <div class="palette-color-block" style="background: rgb(${pal.core.r}, ${pal.core.g}, ${pal.core.b})"></div>
          <div class="palette-color-block" style="background: rgb(${pal.inner.r}, ${pal.inner.g}, ${pal.inner.b})"></div>
          <div class="palette-color-block" style="background: rgb(${pal.mid.r}, ${pal.mid.g}, ${pal.mid.b})"></div>
          <div class="palette-color-block" style="background: rgb(${pal.outer.r}, ${pal.outer.g}, ${pal.outer.b})"></div>
          <div class="palette-color-block" style="background: rgb(${pal.spectral.r}, ${pal.spectral.g}, ${pal.spectral.b})"></div>
        </div>
      `;
      card.addEventListener('click', () => {
        if (characterSelect) {
          characterSelect.value = prof.characterId;
          engine.setCharacter(prof.characterId);
          engine.restart();
          updatePlayButtonUI();
          updateAbilityHUD();
        }
      });
      paletteContainer.appendChild(card);
    });
  }

  // Layer Checkboxes
  const layerInputs = document.querySelectorAll<HTMLInputElement>('input[data-layer]');
  layerInputs.forEach((input) => {
    const layer = input.dataset.layer;
    if (layer === 'bloom') {
      input.checked = engine.config.enablePostBloom;
      input.addEventListener('change', () => { engine.config.enablePostBloom = input.checked; });
    } else if (layer === 'anamorphicGlare') {
      input.checked = engine.config.enableOpticalFlares;
      input.addEventListener('change', () => { engine.config.enableOpticalFlares = input.checked; });
    } else if (layer === 'groundGlow') {
      input.checked = engine.config.enableFloorReflections;
      input.addEventListener('change', () => { engine.config.enableFloorReflections = input.checked; });
    } else if (layer === 'cameraShake') {
      input.checked = engine.config.enableCameraShake;
      input.addEventListener('change', () => { engine.config.enableCameraShake = input.checked; });
    }
  });

  // Telemetry and Progress
  let frameCount = 0;
  let lastFpsTime = performance.now();
  let currentFps = 60;

  engine.onProgress((progress, time, total) => {
    scrubber.value = (progress * 100).toFixed(1);
    timeDisplay.textContent = `${time.toFixed(2)}s / ${total.toFixed(2)}s`;

    const ability = engine.getAbility();
    if (time < ability.chargeDuration) {
      phasePill.textContent = 'Gathering & Invocation';
      phasePill.style.color = '#ffb833';
    } else if (time < ability.chargeDuration + ability.impactDuration) {
      phasePill.textContent = 'Apex Cataclysm Strike';
      phasePill.style.color = '#ff3366';
    } else {
      phasePill.textContent = 'Decay & Ambient Dispersion';
      phasePill.style.color = '#38bdf8';
    }

    // Telemetry updates
    frameCount++;
    const now = performance.now();
    if (now - lastFpsTime >= 500) {
      currentFps = Math.round((frameCount * 1000) / (now - lastFpsTime));
      frameCount = 0;
      lastFpsTime = now;
      fpsLabel.textContent = `${currentFps} FPS`;
      frameTimeLabel.textContent = `${(1000 / Math.max(1, currentFps)).toFixed(1)}ms`;
    }

    const mult = ability.tier === 'ultimate' ? 680 : ability.tier === 'skill2' ? 340 : 180;
    particleCountLabel.textContent = `${Math.round(mult * (0.5 + 0.5 * Math.sin(progress * Math.PI)))} PARTICLES`;
  });

  // Start engine
  engine.start();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
