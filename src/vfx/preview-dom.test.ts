// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function createMockContext2D(): CanvasRenderingContext2D {
  const dummyGrad = {
    addColorStop: vi.fn(),
  };

  return {
    save: vi.fn(),
    restore: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    rect: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    setTransform: vi.fn(),
    setLineDash: vi.fn(),
    createLinearGradient: vi.fn(() => dummyGrad),
    createRadialGradient: vi.fn(() => dummyGrad),
    drawImage: vi.fn(),
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    shadowBlur: 0,
    shadowColor: 'transparent',
  } as unknown as CanvasRenderingContext2D;
}

describe('VFX Preview Studio DOM & Script Lifecycle', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => createMockContext2D());
    vi.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({
      left: 0, top: 0, right: 960, bottom: 540, width: 960, height: 540, x: 0, y: 0, toJSON: () => {},
    }));
  });

  it('matches all DOM IDs expected by wisping-flame-preview.ts in vfx-preview.html', () => {
    const htmlPath = resolve(__dirname, '../../vfx-preview.html');
    const html = readFileSync(htmlPath, 'utf-8');
    document.documentElement.innerHTML = html;

    const expectedIds = [
      'vfx-canvas',
      'btn-play-pause',
      'btn-replay',
      'timeline-scrubber',
      'time-display',
      'phase-pill',
      'btn-loop-toggle',
      'telemetry-fps',
      'telemetry-particles',
      'telemetry-frametime',
      'vfx-character-select',
      'vfx-ability-buttons',
      'vfx-ability-title',
      'vfx-archetype-badge',
      'vfx-ability-details',
      'vfx-ability-desc',
      'palette-container',
    ];

    for (const id of expectedIds) {
      const el = document.getElementById(id);
      expect(el, `Expected element #${id} in vfx-preview.html`).not.toBeNull();
    }
  });

  it('imports and runs all 16 character profiles through the preview HUD', async () => {
    const htmlPath = resolve(__dirname, '../../vfx-preview.html');
    const html = readFileSync(htmlPath, 'utf-8');
    document.documentElement.innerHTML = html;

    const { CHARACTER_PROFILES } = await import('./vfx-registry');
    const { MasterVFXEngine } = await import('./master-vfx-engine');

    const canvas = document.getElementById('vfx-canvas') as HTMLCanvasElement;
    expect(canvas).toBeDefined();

    const engine = new MasterVFXEngine(canvas, 'ember', 'skill1');

    for (const profile of Object.values(CHARACTER_PROFILES)) {
      engine.setCharacter(profile.characterId);
      expect(engine.getProfile().characterId).toBe(profile.characterId);

      for (const tier of ['light', 'skill1', 'skill2', 'ultimate'] as const) {
        engine.setAbility(tier);
        expect(engine.getAbility().tier).toBe(tier);
        // Scrub through start, apex, end
        engine.scrub(0);
        engine.scrub(0.5);
        engine.scrub(1.0);
      }
    }

    engine.destroy();
  });
});
