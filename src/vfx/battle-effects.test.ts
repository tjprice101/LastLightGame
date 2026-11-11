// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { radiantVisualDefinition, RadiantCanvasEffects } from './battle-effects';
import { releasedRadiantIds, radiantFlares, type RadiantLoadout } from '../content/combat-kits';
import { createRadiantCombat, applyRadiantCombatAction } from '../game/combat-engine';
import { radiantImpactFrames } from '../presentation/battle-impact-frames';
import { sharedChargeThreshold } from '../game/combat-gauge';
import type { RadiantPlayerAction } from '../online/battle-run';
import { VFXRenderer } from './vfx-renderer';
import { createVFXSystem, CHARACTER_PROFILES } from './vfx-registry';
import type { VFXContext } from './types';
import { RadiantSignatureVFX, radiantSignatureLayers, withRadiantSignature, radiantStatusCueSystem } from './signature-vfx';
import { radiantMotifMotions, radiantMotifPaths, radiantMotifPlacement, radiantMotifSequences,
  radiantMotionPaths } from './cinematic-motifs';
import { characterSignaturePath } from '../presentation/battle-effects';

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
function fixture(id: RadiantLoadout['starter'] = 'ember', squad: RadiantLoadout['starter'][] = [id]) {
  const loadouts: RadiantLoadout[] = squad.map(id => ({ id, starter: id, form: 6, level: 105, weaponRank: 0, masterId: null, ascension: {} }));
  const state = createRadiantCombat(loadouts, [{ id: 'enemy', stats: { hp: 1000000, attack: 100, defense: 100, recovery: 100 }, currencyBudget: 100 }], 1729);
  const host = document.createElement('div'); document.body.append(host);
  for (const unitId of [...squad, 'enemy']) {
    const target = document.createElement('div'); target.dataset.radiantArt = unitId;
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
  vi.stubGlobal('Path2D', class { constructor(readonly path: string) {} });
  document.documentElement.dataset.battleSpeed = '1';
});
afterEach(() => { active.splice(0).forEach(effect => effect.dispose()); vi.restoreAllMocks(); vi.unstubAllGlobals(); document.body.replaceChildren(); delete document.documentElement.dataset.motion; });
describe('saved Radiant signature choreography', () => {
  it('reuses the output surface between effects and resizes it only when the viewport changes', async () => {
    const { effects, state } = fixture();
    const canvas = document.querySelector<HTMLCanvasElement>('.radiant-vfx-canvas')!;
    const widths = vi.spyOn(canvas, 'width', 'set'), heights = vi.spyOn(canvas, 'height', 'set');
    const action: RadiantPlayerAction = { type: 'normal', bearerId: 'ember', targetId: 'enemy' };
    const first = effects.windup(action, state); finish(); await first;
    expect(widths).toHaveBeenCalledTimes(1); expect(heights).toHaveBeenCalledTimes(1);
    const second = effects.windup(action, state); finish(); await second;
    expect(widths).toHaveBeenCalledTimes(1); expect(heights).toHaveBeenCalledTimes(1);
    vi.stubGlobal('innerWidth', innerWidth + 100);
    const resized = effects.windup(action, state); finish(); await resized;
    expect(widths).toHaveBeenCalledTimes(2); expect(heights).toHaveBeenCalledTimes(2);
  });
  it.each([
    ['maerion', [53, 103, 217], [166, 78, 241]], ['caevren', [49, 91, 209], [151, 75, 250]],
    ['vespera', [66, 107, 224], [189, 88, 239]], ['ilyss', [49, 95, 224], [195, 75, 233]],
    ['asteriel', [40, 95, 215], [171, 77, 239]], ['serapha', [71, 116, 223], [181, 104, 245]],
    ['neralis', [20, 184, 228], [231, 170, 73]], ['varkhel', [241, 103, 36], [161, 77, 216]],
    ['seravelle', [241, 103, 42], [255, 206, 88]], ['velmira', [176, 67, 215], [233, 164, 60]],
    ['solenne', [185, 164, 216], [238, 241, 255]],
    ['ozriel', [221, 57, 80], [255, 240, 242]], ['ilvaris', [216, 55, 85], [255, 240, 242]],
    ['kaelith', [199, 42, 77], [255, 240, 242]],
  ] as const)('uses the authored Radiant primary and accent for %s on every tier', (id, primary, secondary) => {
    for (const tier of ['light', 'skill1', 'skill2', 'ultimate'] as const) {
      const palette = radiantVisualDefinition(id, tier).palette;
      expect([palette.mid.r, palette.mid.g, palette.mid.b]).toEqual(primary);
      expect([palette.spectral.r, palette.spectral.g, palette.spectral.b]).toEqual(secondary);
      expect(palette.id).toBe(id);
    }
  });
  it.each([
    ['neralis', ['volley', 'beam', 'vortex', 'mandala']],
    ['varkhel', ['slam', 'slash', 'vortex', 'cataclysm']],
    ['seravelle', ['volley', 'slash', 'beam', 'mandala']],
    ['velmira', ['slash', 'vortex', 'volley', 'cataclysm']],
    ['ozriel', ['slam', 'beam', 'vortex', 'mandala']],
    ['ilvaris', ['beam', 'mandala', 'volley', 'cataclysm']],
    ['kaelith', ['slash', 'beam', 'slam', 'vortex']],
  ] as const)('uses a complete authored four-tier choreography for %s', (id, archetypes) => {
    const definitions = (['light', 'skill1', 'skill2', 'ultimate'] as const)
      .map(tier => radiantVisualDefinition(id, tier));
    expect(definitions.map(definition => definition.archetype)).toEqual(archetypes);
    expect(new Set(archetypes).size).toBe(4);
    expect(definitions.every(definition => !definition.description.includes('pilot'))).toBe(true);
  });
  it('does not mutate the legacy Moon palette while deriving the Radiant palette', () => {
    const original = structuredClone(CHARACTER_PROFILES.maerion.abilities.skill1.palette);
    radiantVisualDefinition('maerion', 'skill1');
    expect(CHARACTER_PROFILES.maerion.abilities.skill1.palette).toEqual(original);
  });
  it('gives each released bearer a distinct progressive three-motif sequence', () => {
    expect(Object.keys(radiantMotifSequences).sort()).toEqual([...releasedRadiantIds].sort());
    expect(Object.keys(radiantMotifMotions).sort()).toEqual([...releasedRadiantIds].sort());
    const sequences = releasedRadiantIds.map(id => radiantMotifSequences[id].join('/'));
    expect(new Set(sequences).size).toBe(32);
    expect(new Set(Object.values(radiantMotifMotions)).size).toBe(9);
    expect(new Set(Object.values(radiantMotionPaths)).size).toBe(9);
    for (const id of releasedRadiantIds) {
      expect(new Set(radiantMotifSequences[id]).size).toBe(3);
      for (const motif of radiantMotifSequences[id]) expect(radiantMotifPaths[motif]).toMatch(/^M/);
      expect(radiantMotionPaths[radiantMotifMotions[id]]).toMatch(/^M/);
    }
  });
  it('keeps every authored motif motion finite, bounded and moving in charge and impact', () => {
    for (const motion of new Set(Object.values(radiantMotifMotions))) {
      for (const charging of [true, false]) {
        for (let layer = 0; layer < 3; layer++) {
          const count = 2 + layer;
          for (let index = 0; index < count; index++) {
            const samples = [.1, .5, .9].map(progress =>
              radiantMotifPlacement(motion, index, count, layer, 81, progress, charging));
            expect(new Set(samples.map(sample => sample.join(','))).size).toBe(3);
            for (const [x, y, rotation] of samples) {
              expect([x, y, rotation].every(Number.isFinite)).toBe(true);
              expect(Math.abs(x)).toBeLessThan(122);
              expect(Math.abs(y)).toBeLessThan(122);
            }
          }
        }
      }
    }
  });
  it('uses all32 distinct authored identity paths without constructing one per animation frame', () => {
    const paths = new Set<string>();
    for (const id of releasedRadiantIds) {
      const output = context(), signature = new RadiantSignatureVFX(id);
      paths.add(characterSignaturePath(id));
      signature.render(output, { x: 30, y: 40, radius: 20, progress: .4, tier: 'skill1', phase: 'charge',
        color: { r: 100, g: 200, b: 240, a: 1 }, secondaryColor: { r: 180, g: 80, b: 240, a: 1 } });
      const path = vi.mocked(output.stroke).mock.calls[0][0];
      for (let frame = 0; frame < 10; frame++)
        signature.render(output, { x: 30, y: 40, radius: 20, progress: .4, tier: 'skill1', phase: 'charge',
          color: { r: 100, g: 200, b: 240, a: 1 }, secondaryColor: { r: 180, g: 80, b: 240, a: 1 } });
      expect(vi.mocked(output.stroke).mock.calls.filter(call => call[0] === path)).toHaveLength(22);
      expect(output.translate).toHaveBeenCalledWith(-50, -50);
    }
    expect(paths.size).toBe(32);
  });
  it('reuses and animates each cinematic architecture across sampled frames', () => {
    for (const motion of new Set(Object.values(radiantMotifMotions))) {
      const id = releasedRadiantIds.find(candidate => radiantMotifMotions[candidate] === motion);
      if (!id) throw new Error(`Missing bearer for ${motion}.`);
      const signature = new RadiantSignatureVFX(id);
      const rotations: number[] = [];
      let architecture: Path2D | undefined;
      for (const progress of [.2, .5, .8]) {
        const output = context();
        signature.render(output, { x: 0, y: 0, radius: 25, progress, tier: 'ultimate', phase: 'impact',
          color: { r: 100, g: 200, b: 240, a: 1 }, secondaryColor: { r: 180, g: 80, b: 240, a: 1 } });
        const paths = vi.mocked(output.stroke).mock.calls.filter(call => call[0] !== undefined);
        architecture ??= paths[2][0];
        expect(architecture).toBeDefined();
        expect(paths.slice(2, 8).every(call => call[0] === architecture)).toBe(true);
        rotations.push(vi.mocked(output.rotate).mock.calls[1][0]);
      }
      expect(new Set(rotations).size).toBe(3);
    }
  });
  it('increases exact bounded tier architecture and gives statuses no celebration satellites', () => {
    expect(radiantSignatureLayers).toEqual({ light: 0, skill1: 1, skill2: 2, ultimate: 3 });
    const signature = new RadiantSignatureVFX('tide');
    for (const [tier, arcs, motifs, paths] of
      [['light', 0, 0, 1], ['skill1', 3, 2, 2], ['skill2', 7, 5, 3], ['ultimate', 12, 9, 4]] as const) {
      const output = context();
      signature.render(output, { x: 0, y: 0, radius: 25, progress: .4, tier, phase: 'impact',
        color: { r: 100, g: 200, b: 240, a: 1 }, secondaryColor: { r: 180, g: 80, b: 240, a: 1 } });
      expect(output.arc).toHaveBeenCalledTimes(arcs);
      expect(vi.mocked(output.arc).mock.calls.every(call => call[2] <= 81)).toBe(true);
      const pathStrokes = vi.mocked(output.stroke).mock.calls.filter(call => call[0] !== undefined);
      const layers = radiantSignatureLayers[tier];
      expect(pathStrokes).toHaveLength(2 + motifs * 2 + layers * 2);
      expect(new Set(pathStrokes.map(call => call[0])).size).toBe(paths + (layers ? 1 : 0));
      expect(output.save).toHaveBeenCalledTimes(2 + motifs + layers);
      expect(output.restore).toHaveBeenCalledTimes(2 + motifs + layers);
    }
    const output = context();
    signature.render(output, { x: 0, y: 0, radius: 25, progress: .4, tier: 'ultimate', phase: 'status',
      color: { r: 100, g: 200, b: 240, a: 1 }, secondaryColor: { r: 180, g: 80, b: 240, a: 1 } });
    expect(output.arc).not.toHaveBeenCalled(); expect(output.globalAlpha).toBeCloseTo(.45);
  });
  it('paints the secondary identity color on progressive motifs without changing status cues', () => {
    const signature = new RadiantSignatureVFX('maerion'), output = context();
    const colors: string[] = [];
    vi.mocked(output.stroke).mockImplementation(() => { colors.push(String(output.strokeStyle)); });
    const frame = { x: 0, y: 0, radius: 25, progress: .4,
      color: { r: 40, g: 90, b: 210, a: 1 }, secondaryColor: { r: 180, g: 80, b: 240, a: 1 } };
    for (const tier of ['skill1', 'skill2', 'ultimate'] as const) {
      colors.length = 0;
      signature.render(output, { ...frame, tier, phase: 'impact' });
      expect(colors.filter(color => color.endsWith(',.8)')).slice(0, 2))
        .toEqual(['rgba(180,80,240,.8)', 'rgba(180,80,240,.8)']);
    }
    colors.length = 0;
    signature.render(output, { ...frame, tier: 'ultimate', phase: 'status' });
    expect(colors).not.toContain('rgba(180,80,240,.8)');
  });
  it('reveals then fades to zero, preserves the base system and omits background rendering', () => {
    const signature = new RadiantSignatureVFX('ember'), output = context();
    const frame = { x: 0, y: 0, radius: 25, tier: 'ultimate' as const, phase: 'impact' as const,
      color: { r: 255, g: 80, b: 20, a: 1 }, secondaryColor: { r: 255, g: 200, b: 80, a: 1 } };
    signature.render(output, { ...frame, progress: 0 });
    signature.render(output, { ...frame, progress: 1 });
    expect(output.stroke).not.toHaveBeenCalled();
    const samples = [.05, .4, .95].map(progress => {
      const output = context(); signature.render(output, { ...frame, progress }); return output.globalAlpha;
    });
    expect(samples[0]).toBeLessThan(samples[1]); expect(samples[2]).toBeLessThan(samples[1] * .1);
    const base = createVFXSystem('slash'), wrapper = withRadiantSignature(base, signature, 'impact');
    const reset = vi.spyOn(base, 'reset'), update = vi.spyOn(base, 'update'), render = vi.spyOn(base, 'render');
    const definition = CHARACTER_PROFILES.ember.abilities.skill1;
    const ctx: VFXContext = { ctx: output, width: 960, height: 540, t: .1, dt: .01, progress: .1,
      scale: .5, casterX: 100, casterY: 100, targetX: 200, targetY: 200, palette: definition.palette,
      definition, shakeCallback: () => {} };
    wrapper.reset(); wrapper.update(ctx); wrapper.render(ctx);
    expect(reset).toHaveBeenCalledOnce(); expect(update).toHaveBeenCalledWith(ctx); expect(render).toHaveBeenCalledWith(ctx);
    expect(wrapper.renderBackground).toBeUndefined();
  });
  it('bounds status rings to local art instead of borrowing the full mandala particle architecture', () => {
    const system = radiantStatusCueSystem(), output = context(), definition = CHARACTER_PROFILES.tide.abilities.skill2;
    const frame: VFXContext = { ctx: output, width: 960, height: 540, t: .1, dt: .01, progress: .5,
      scale: .375, casterX: 100, casterY: 100, targetX: 200, targetY: 200, palette: definition.palette,
      definition, shakeCallback: vi.fn() };
    const before = structuredClone({ ...frame, ctx: undefined, shakeCallback: undefined });
    system.update(frame); system.render(frame);
    expect(output.arc).toHaveBeenCalledOnce();
    expect(vi.mocked(output.arc).mock.calls[0][2]).toBeLessThanOrEqual(24);
    expect(output.fillRect).not.toHaveBeenCalled(); expect(frame.shakeCallback).not.toHaveBeenCalled();
    expect(system.renderOptical).toBeUndefined();
    expect({ ...frame, ctx: undefined, shakeCallback: undefined }).toEqual(before);
  });
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
  it('scroll cancels the stale anchor visual without leaking queued work', async () => {
    const { effects, state } = fixture();
    const pending = effects.windup({ type: 'normal', bearerId: 'ember', targetId: 'enemy' }, state);
    document.dispatchEvent(new Event('scroll', { bubbles: false }));
    await pending; expect(callbacks.size).toBe(0);
  });
  it('renders actual buff-only Flare status packets as small source-owned cues after charge, not offensive impacts', async () => {
    const { effects, state } = fixture('seravelle');
    state.gauge.members[0].charge = state.gauge.members[0].baseCost;
    const action: RadiantPlayerAction = { type: 'flare', bearerId: 'seravelle' };
    const owners: string[] = [], original = RadiantSignatureVFX.prototype.render;
    const render = vi.spyOn(RadiantSignatureVFX.prototype, 'render').mockImplementation(function (this: RadiantSignatureVFX, context, frame) {
      owners.push(this.bearer); original.call(this, context, frame);
    });
    const windup = effects.windup(action, state); finish(); await windup;
    render.mockClear(); owners.length = 0;
    const result = applyRadiantCombatAction(state, action);
    const statuses = result.events.filter(event => event.type === 'status');
    expect(statuses.some(event => event.status === 'attack-buff' && event.source.kind === 'flare')).toBe(true);
    for (const frame of radiantImpactFrames(state, result.state, result.events)) {
      const pending = effects.impact(frame); finish(); await pending;
    }
    expect(render).toHaveBeenCalled();
    expect(render.mock.calls.every(call => call[1].phase === 'status')).toBe(true);
    expect(owners.every(owner => owner === 'seravelle')).toBe(true);
    expect(render.mock.calls.every(call => call[1].radius <= 27)).toBe(true);
    expect(callbacks.size).toBe(0);
  });
  it('carries Maerion\'s blue and purple identity through charge and saved healing impacts', async () => {
    const { effects, state } = fixture('maerion');
    state.gauge.members[0].charge = state.gauge.members[0].baseCost;
    state.bearers[0].hp = Math.round(state.bearers[0].hp / 2);
    const action: RadiantPlayerAction = { type: 'flare', bearerId: 'maerion' };
    const render = vi.spyOn(RadiantSignatureVFX.prototype, 'render');
    const windup = effects.windup(action, state); finish(); await windup;
    const result = applyRadiantCombatAction(state, action);
    for (const frame of radiantImpactFrames(state, result.state, result.events)) {
      const pending = effects.impact(frame); finish(); await pending;
    }
    const samples = render.mock.calls.map(call => call[1]);
    expect(samples.some(sample => sample.phase === 'charge')).toBe(true);
    expect(samples.some(sample => sample.phase === 'impact')).toBe(true);
    for (const sample of samples) {
      expect([sample.color.r, sample.color.g, sample.color.b]).toEqual([53, 103, 217]);
      expect([sample.secondaryColor.r, sample.secondaryColor.g, sample.secondaryColor.b]).toEqual([166, 78, 241]);
    }
  });
  it('keeps native passive statuses local without replaying the acting bearer signature', async () => {
    const { effects, state } = fixture('ilvaris');
    state.bearers[0].hp = Math.round(state.bearers[0].hp / 2);
    const action: RadiantPlayerAction = { type: 'normal', bearerId: 'ilvaris', targetId: 'enemy' };
    const windup = effects.windup(action, state); finish(); await windup;
    const render = vi.spyOn(RadiantSignatureVFX.prototype, 'render');
    const result = applyRadiantCombatAction(state, action);
    const frames = radiantImpactFrames(state, result.state, result.events).filter(frame =>
      frame.events.some(event => event.type === 'status' && event.source.kind === 'passive'));
    expect(frames.length).toBeGreaterThan(0);
    for (const frame of frames) { const pending = effects.impact(frame); finish(); await pending; }
    expect(render).not.toHaveBeenCalled();
  });
  it('does not animate ineffective healing and rejects a missing source rather than substituting neutral light', async () => {
    const { effects, state } = fixture('seravelle');
    state.gauge.members[0].charge = state.gauge.members[0].baseCost;
    const action: RadiantPlayerAction = { type: 'flare', bearerId: 'seravelle' };
    const windup = effects.windup(action, state); finish(); await windup;
    const result = applyRadiantCombatAction(state, action);
    const frames = radiantImpactFrames(state, result.state, result.events);
    const healing = frames.find(frame => frame.events.some(event => event.type === 'heal' && event.effective === 0));
    expect(healing).toBeDefined();
    await effects.impact({ ...healing!, events: healing!.events.filter(event => event.type === 'heal') });
    expect(callbacks.size).toBe(0);
    const status = frames.find(frame => frame.events.some(event => event.type === 'status'));
    expect(status).toBeDefined();
    const invalid = structuredClone(status!);
    for (const event of invalid.events) if (event.type === 'status') event.source = { kind: 'flare', bearerId: 'missing' };
    await expect(effects.impact(invalid)).rejects.toThrow('owner is missing');
    expect(callbacks.size).toBe(0);
  });
  it('plays six effective heals with their attached saved statuses in one target-bounded frame', async () => {
    const { effects, state } = fixture('seravelle', ['seravelle', 'ember', 'tide', 'sprout', 'rosetta', 'thornia']);
    state.gauge.members[0].charge = state.gauge.members[0].baseCost;
    for (const bearer of state.bearers) bearer.hp = Math.round(bearer.hp / 2);
    const before = structuredClone(state), action: RadiantPlayerAction = { type: 'flare', bearerId: 'seravelle' };
    const windup = effects.windup(action, state); finish(); await windup;
    const result = applyRadiantCombatAction(state, action), frames = radiantImpactFrames(state, result.state, result.events);
    expect(frames.some(frame => frame.events.filter(event => event.type === 'heal' || event.type === 'status').length > 6)).toBe(true);
    for (const frame of frames) { const pending = effects.impact(frame); finish(); await pending; }
    expect(callbacks.size).toBe(0); expect(state).toEqual(before);
  });
  it('stops rendering expired status cues while longer saved impact effects continue', async () => {
    const { effects, state } = fixture('seravelle', ['seravelle', 'ember', 'tide', 'sprout', 'rosetta', 'thornia']);
    state.gauge.members[0].charge = state.gauge.members[0].baseCost;
    for (const bearer of state.bearers) bearer.hp = Math.round(bearer.hp / 2);
    const action: RadiantPlayerAction = { type: 'flare', bearerId: 'seravelle' };
    const windup = effects.windup(action, state); finish(); await windup;
    const result = applyRadiantCombatAction(state, action);
    const frame = radiantImpactFrames(state, result.state, result.events).find(value =>
      value.events.some(event => event.type === 'heal' && event.effective > 0) &&
      value.events.some(event => event.type === 'status' && event.remaining > 0));
    expect(frame).toBeDefined();
    const render = vi.spyOn(VFXRenderer.prototype, 'render');
    const pending = effects.impact(frame!);
    for (let i = 0; i < 10; i++) tick();
    const statusCalls = render.mock.calls.filter(call => call[0].id === 'radiant-status-cue').length;
    const allCalls = render.mock.calls.length;
    expect(statusCalls).toBeGreaterThan(0);
    for (let i = 0; i < 5; i++) tick();
    expect(render.mock.calls.filter(call => call[0].id === 'radiant-status-cue')).toHaveLength(statusCalls);
    expect(render.mock.calls.length).toBeGreaterThan(allCalls);
    finish(); await pending;
  });
  it('opts Radiant slash impacts into batched fissure shadows', async () => {
    const { effects, state } = fixture();
    const action: RadiantPlayerAction = { type: 'normal', bearerId: 'ember', targetId: 'enemy' };
    const windup = effects.windup(action, state); finish(); await windup;
    const result = applyRadiantCombatAction(state, action);
    const frame = radiantImpactFrames(state, result.state, result.events).find(value =>
      value.events.some(event => event.type === 'damage' && event.healthLoss > 0));
    expect(frame).toBeDefined();
    const render = vi.spyOn(VFXRenderer.prototype, 'render');
    const pending = effects.impact(frame!); finish(); await pending;
    const slashCalls = render.mock.calls.filter(call => call[0].id === 'slash');
    expect(slashCalls.length).toBeGreaterThan(0);
    expect(slashCalls.every(call => call[1].batchFissureShadows === true)).toBe(true);
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
