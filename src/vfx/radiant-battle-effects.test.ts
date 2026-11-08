// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RadiantCanvasEffects } from './radiant-battle-effects';
import { releasedRadiantIds, radiantFlares, type RadiantLoadout } from '../content/radiant-combat';
import { createRadiantCombat, applyRadiantCombatAction } from '../game/radiant-combat';
import { radiantImpactFrames } from '../presentation/radiant-impact';
import { sharedChargeThreshold } from '../game/radiant-gauge';
import type { RadiantPlayerAction } from '../online/radiant-run';
import { VFXRenderer } from './vfx-renderer';
import { createVFXSystem, CHARACTER_PROFILES } from './vfx-registry';
import type { VFXContext } from './types';

function context(): CanvasRenderingContext2D {
  const gradient = { addColorStop: vi.fn() };
  return {
    save: vi.fn(), restore: vi.fn(), clearRect: vi.fn(), fillRect: vi.fn(), beginPath: vi.fn(),
    closePath: vi.fn(), arc: vi.fn(), ellipse: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(), bezierCurveTo: vi.fn(), strokeRect: vi.fn(), stroke: vi.fn(),
    fill: vi.fn(), translate: vi.fn(), rotate: vi.fn(), scale: vi.fn(), setTransform: vi.fn(),
    setLineDash: vi.fn(), createLinearGradient: vi.fn(() => gradient), createRadialGradient: vi.fn(() => gradient),
    drawImage: vi.fn(), globalAlpha: 1, globalCompositeOperation: 'source-over', fillStyle: '#000',
    strokeStyle: '#000', lineWidth: 1, lineCap: 'butt', lineJoin: 'miter', shadowBlur: 0, shadowColor: 'transparent', filter: 'none',
  } as unknown as CanvasRenderingContext2D;
}
let callbacks = new Map<number, FrameRequestCallback>(), serial = 0, time = 0;
const active: RadiantCanvasEffects[] = [];
function tick(milliseconds = 50) {
  time += milliseconds;
  const batch = [...callbacks.values()]; callbacks.clear();
  batch.forEach(callback => callback(time));
}
function finish() { for (let i = 0; i < 100 && callbacks.size; i++) tick(); expect(callbacks.size).toBe(0); }
function fixture(id: RadiantLoadout['starter'] = 'ember') {
  const loadout: RadiantLoadout = { id, starter: id, form: 6, level: 105, weaponRank: 0, masterId: null, ascension: {} };
  const state = createRadiantCombat([loadout], [{ id: 'enemy', stats: { hp: 1000000, attack: 100, defense: 100, recovery: 100 }, currencyBudget: 100 }], 1729);
  const host = document.createElement('div'); document.body.append(host);
  for (const unitId of [id, 'enemy']) {
    const target = document.createElement('div'); target.dataset.radiantActor = unitId;
    target.getBoundingClientRect = () => new DOMRect(100, 100, 180, 50); host.append(target);
  }
  const effects = new RadiantCanvasEffects(host); active.push(effects);
  return { state, effects, host };
}
beforeEach(() => {
  callbacks = new Map(); time = 0;
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => context());
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { callbacks.set(++serial, callback); return serial; });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => callbacks.delete(id));
  document.documentElement.dataset.battleSpeed = '1';
});
afterEach(() => { active.splice(0).forEach(effect => effect.dispose()); vi.restoreAllMocks(); vi.unstubAllGlobals(); document.body.replaceChildren(); delete document.documentElement.dataset.motion; });
describe('saved Radiant emission/bloom pilot', () => {
  it('can suppress system arena dimming without changing legacy renderer defaults', () => {
    const renderer = new VFXRenderer(context()), system = createVFXSystem('cataclysm');
    const backdrop = vi.spyOn(system, 'renderBackground');
    const definition = CHARACTER_PROFILES.ember.abilities.ultimate;
    const frame: VFXContext = { ctx: context(), width: 960, height: 540, t: .1, dt: 0, progress: .1, scale: .5,
      casterX: 200, casterY: 200, targetX: 500, targetY: 200, palette: definition.palette, definition, shakeCallback: () => {} };
    renderer.begin(960, 540, 1);
    renderer.render(system, frame, true, false); expect(backdrop).not.toHaveBeenCalled();
    renderer.render(system, frame); expect(backdrop).toHaveBeenCalledOnce();
  });
  it.each(releasedRadiantIds.map(id => ({ id })))('finishes all three tiers for $id without changing gameplay state', async ({ id }) => {
    for (const tier of ['glowing', 'lustrous', 'eternal'] as const) {
      const { effects, state } = fixture(id);
      state.gauge.members[0].charge = state.gauge.members[0].baseCost * (tier === 'glowing' ? 1 : 2);
      state.gauge.sharedUnits = tier === 'eternal' ? sharedChargeThreshold(0) : 0;
      state.bearers[0].hp = Math.round(state.bearers[0].hp / 2);
      const action: RadiantPlayerAction = { type: 'flare', bearerId: id,
        ...(radiantFlares[id][tier].target === 'one-enemy' ? { targetId: 'enemy' } : {}) };
      const before = structuredClone(state);
      const windup = effects.windup(action, state); finish(); await windup;
      const result = applyRadiantCombatAction(state, action);
      for (const frame of radiantImpactFrames(state, result.state, result.events)) {
        const pending = effects.impact(frame); finish(); await pending;
      }
      expect(state).toEqual(before);
      effects.dispose();
    }
  });
  it('pauses time during Settings, resumes without wall-clock jumps and uses live3x speed', async () => {
    const { effects, state } = fixture();
    let done = false;
    const windup = effects.windup({ type: 'normal', bearerId: 'ember', targetId: 'enemy' }, state).then(() => { done = true; });
    tick(); effects.pause(true);
    for (let i = 0; i < 20; i++) tick(1000);
    await Promise.resolve(); expect(done).toBe(false); expect(callbacks.size).toBe(1);
    effects.pause(false); document.documentElement.dataset.battleSpeed = '3';
    tick(); await Promise.resolve(); expect(done).toBe(false);
    tick(); await windup; expect(done).toBe(true); expect(callbacks.size).toBe(0);
  });
  it('Skip/cancel resolves pending work, removes scheduled callbacks and disposal removes the overlay', async () => {
    const { effects, state } = fixture();
    const pending = effects.windup({ type: 'normal', bearerId: 'ember', targetId: 'enemy' }, state);
    expect(document.querySelector('.radiant-vfx-canvas')).not.toBeNull();
    effects.cancel(); await pending; expect(callbacks.size).toBe(0);
    effects.dispose(); expect(document.querySelector('.radiant-vfx-canvas')).toBeNull();
  });
  it('resize ends only the current visual and reduced motion schedules no new frames', async () => {
    const { effects, state } = fixture();
    const pending = effects.windup({ type: 'normal', bearerId: 'ember', targetId: 'enemy' }, state);
    window.dispatchEvent(new Event('resize')); await pending; expect(callbacks.size).toBe(0);
    document.documentElement.dataset.motion = 'reduced';
    await effects.windup({ type: 'defense', bearerId: 'ember' }, state);
    expect(callbacks.size).toBe(0);
    delete document.documentElement.dataset.motion;
  });
  it('render failures reject rather than resolve successfully and never leave an animation frame running', async () => {
    const { effects, state, host } = fixture();
    const output = context();
    // A fresh instance receives this failing emission context.
    effects.dispose();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => output);
    output.createRadialGradient = () => { throw new Error('Emission failed'); };
    const broken = new RadiantCanvasEffects(host); active.push(broken);
    const pending = broken.windup({ type: 'defense', bearerId: 'ember' }, state);
    tick();
    await expect(pending).rejects.toThrow('Emission failed');
    expect(callbacks.size).toBe(0);
  });
});
