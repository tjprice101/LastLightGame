// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RadiantImpactFrame } from '../presentation/battle-impact-frames';
import type { RadiantCombatState } from '../game/combat-engine';
import type { RadiantPlayerAction } from '../online/battle-run';
import { beatPlan, enemyBeatPlan } from './spectacle-timing';
import type { EnemyActionCue } from './enemy-cues';
import { bearerElementStyle } from './bearer-signatures';

function host(): HTMLElement {
  const element = document.createElement('div');
  element.innerHTML = `<div class="radiant-field"><div data-radiant-art="ember"><img></div>
    <div data-radiant-art="tide"><img></div><div data-radiant-art="e1"><img></div><div data-radiant-art="e2"><img></div></div>
    <div class="radiant-fx-layer"></div>`;
  const boxes: Record<string, DOMRect> = { ember: new DOMRect(800, 300, 160, 200), tide: new DOMRect(980, 300, 160, 200),
    e1: new DOMRect(100, 250, 220, 260), e2: new DOMRect(350, 250, 220, 260) };
  for (const art of Array.from(element.querySelectorAll<HTMLElement>('[data-radiant-art]'))) {
    const img = art.querySelector('img')!;
    vi.spyOn(img, 'getBoundingClientRect').mockReturnValue(boxes[art.dataset.radiantArt!]);
  }
  document.body.append(element);
  return element;
}
const state = {
  bearers: [{ loadout: { id: 'ember', starter: 'ember' }, hp: 100 }, { loadout: { id: 'tide', starter: 'tide' }, hp: 100 }],
  enemies: [{ id: 'e1', hp: 100, elementId: 'oceanic' }, { id: 'e2', hp: 100, elementId: 'oceanic' }],
} as unknown as RadiantCombatState;
function hit(targetId: string, source: object = { kind: 'normal', bearerId: 'ember' }): RadiantImpactFrame {
  return { events: [{ type: 'damage', source, targetId, origin: 'direct', offered: 10, absorbed: 0, healthLoss: 10, shields: [] }],
    readout: {}, statuses: {} } as unknown as RadiantImpactFrame;
}
const normal: RadiantPlayerAction = { type: 'normal', bearerId: 'ember', targetId: 'e1' };

afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.resetModules(); vi.doUnmock('phaser'); vi.doUnmock('./spectacle-scene');
  document.body.replaceChildren(); });

describe('GpuBattleEffects without WebGL (owner choice: static rings)', () => {
  beforeEach(() => { vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null); });

  it('shows one static element ring per impacted unit for 200 ms and keeps the hit slot', async () => {
    vi.useFakeTimers();
    const { GpuBattleEffects } = await import('./gpu-effects');
    const element = host();
    const effects = new GpuBattleEffects(element);
    await vi.advanceTimersByTimeAsync(0);
    let resolved = false;
    const beats = beatPlan('normal', null, 1);
    void effects.impact(hit('e1'), normal, state, beats).then(() => { resolved = true; });
    const ring = element.querySelector<HTMLElement>('.radiant-static-ring')!;
    expect(ring).not.toBeNull();
    expect(ring.style.getPropertyValue('--ring')).toBe('#ff8a5c');
    expect(ring.style.left).toBe('210px'); // centred on the struck enemy
    await vi.advanceTimersByTimeAsync(149);
    expect(resolved).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(resolved).toBe(true);
    await vi.advanceTimersByTimeAsync(60);
    expect(element.querySelector('.radiant-static-ring')).toBeNull();
  });
  it('waits the wind-up and travel beats, and cancel ends waits and rings at once', async () => {
    vi.useFakeTimers();
    const { GpuBattleEffects } = await import('./gpu-effects');
    const element = host();
    const effects = new GpuBattleEffects(element);
    let wound = false;
    void effects.windup(normal, state, beatPlan('skill2', null, 1)).then(() => { wound = true; });
    await vi.advanceTimersByTimeAsync(499);
    expect(wound).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(wound).toBe(true);
    let landed = false;
    void effects.impact(hit('e1'), normal, state, beatPlan('skill2', null, 1)).then(() => { landed = true; });
    expect(element.querySelector('.radiant-static-ring')).not.toBeNull();
    effects.cancel();
    await vi.advanceTimersByTimeAsync(0);
    expect(landed).toBe(true);
    expect(element.querySelector('.radiant-static-ring')).toBeNull();
    effects.dispose(); effects.dispose();
  });
});

describe('GpuBattleEffects on the GPU layer', () => {
  const scene = {
    ready: true, stats: {}, onReady: null as null | (() => void), onActivity: null,
    attach: vi.fn(), setPaused: vi.fn(), shareFlashGovernor: vi.fn(), freeze: vi.fn(), chargeAura: vi.fn(), projectile: vi.fn(), slash: vi.fn(),
    pulse: vi.fn(), burst: vi.fn(), flash: vi.fn(), dim: vi.fn(), cancelAll: vi.fn(),
    converge: vi.fn(), pillar: vi.fn(), shockwave: vi.fn(), lensFlare: vi.fn(), focus: vi.fn(),
    edgeBloom: vi.fn(), godRays: vi.fn(), critFlash: vi.fn(), veil: vi.fn(),
    wait: vi.fn(() => Promise.resolve()), idle: vi.fn(() => Promise.resolve()),
  };
  beforeEach(() => {
    for (const value of Object.values(scene)) if (vi.isMockFunction(value)) value.mockClear();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as RenderingContext);
    vi.doMock('./spectacle-scene', () => ({ SpectacleScene: class { constructor() { return scene; } } }));
    vi.doMock('phaser', () => ({ default: { WEBGL: 2, Scale: { RESIZE: 3 },
      Game: class { loop = { sleep: vi.fn(), wake: vi.fn() }; constructor() { queueMicrotask(() => scene.onReady?.()); } } } }));
  });
  async function mounted() {
    const { GpuBattleEffects } = await import('./gpu-effects');
    const element = host();
    const effects = new GpuBattleEffects(element);
    await vi.waitFor(() => expect(scene.attach).toHaveBeenCalled());
    return { effects, element };
  }
  it('mounts one pointer-transparent layer and attaches it to this battle field', async () => {
    const { element } = await mounted();
    const layer = document.querySelector<HTMLElement>('.radiant-gpu-layer')!;
    expect(layer.getAttribute('aria-hidden')).toBe('true');
    const field = (scene.attach.mock.calls.at(-1)![0] as () => HTMLElement)();
    expect(field).toBe(element.querySelector('.radiant-field'));
  });
  it('gathers light at the caster, then cuts (melee) or fires (ranged) during travel', async () => {
    const { effects } = await mounted();
    const beats = beatPlan('skill1', null, 1);
    await effects.windup(normal, state, beats);
    expect(scene.chargeAura).toHaveBeenCalledWith({ x: 880, y: 400 }, 200, expect.objectContaining({ id: 'infernic' }), 0);
    expect(scene.chargeAura.mock.calls[0][2].palette.main).toBe(0xff8a5c);
    expect(scene.wait).toHaveBeenNthCalledWith(1, 200);
    expect(scene.wait).toHaveBeenNthCalledWith(2, 150);
    // Infernis (ember) is a melee kit: a slash across the selected enemy, no projectile.
    expect(scene.slash).toHaveBeenCalledTimes(1);
    expect(scene.slash.mock.calls[0][0]).toEqual({ x: 210, y: 380 });
    expect(scene.projectile).not.toHaveBeenCalled();
  });
  it('picks burst kinds by tier and saves the finisher for the last Convergent Light hit', async () => {
    const { effects } = await mounted();
    const flare: RadiantPlayerAction = { type: 'flare', bearerId: 'ember' };
    const beats = beatPlan('flare', 'ultimate', 12);
    const flareHit = (id: string) => hit(id, { kind: 'flare', bearerId: 'ember' });
    await effects.impact(flareHit('e1'), flare, state, beats, false, 0);
    await effects.impact(flareHit('e1'), flare, state, beats, true, 11);
    await effects.impact(hit('e1', { kind: 'enemy', enemyId: 'e2' }), null, state);
    expect(scene.burst.mock.calls.map(call => call[1])).toEqual(['flare', 'finisher', 'enemy']);
    // D-490: each hit waits its own cadence slot and grows; the finisher is the largest.
    expect(scene.wait).toHaveBeenNthCalledWith(1, beats.slots[0]);
    expect(scene.wait).toHaveBeenNthCalledWith(2, beats.slots[11]);
    expect(scene.burst.mock.calls.map(call => call[4])).toEqual([1, 1.35, 1]);
    // The finisher set lands once: a pillar and lens flare on the target and one field shockwave.
    expect(scene.pillar).toHaveBeenCalledTimes(1);
    expect(scene.lensFlare).toHaveBeenCalledTimes(1);
    expect(scene.shockwave).toHaveBeenCalledTimes(1);
    // Player hits use the caster's element base set; enemy hits use the attacker's element (D-485).
    expect(scene.burst.mock.calls[0][2].id).toBe('infernic');
    expect(scene.burst.mock.calls[2][2].id).toBe('oceanic');
    expect(scene.burst.mock.calls[2][2].palette.main).toBe(0x6cc4ff);
  });
  it('grows Convergent Light hits through the run and gathers light on every target before the finisher (D-490)', async () => {
    const { effects } = await mounted();
    const flare: RadiantPlayerAction = { type: 'flare', bearerId: 'ember' };
    const beats = beatPlan('flare', 'glimmering', 8);
    for (let index = 0; index < 7; index++)
      await effects.impact(hit('e1', { kind: 'flare', bearerId: 'ember' }), flare, state, beats, false, index);
    const sizes = scene.burst.mock.calls.map(call => call[4] as number);
    for (let index = 1; index < sizes.length; index++) expect(sizes[index]).toBeGreaterThan(sizes[index - 1]);
    expect(scene.pillar).not.toHaveBeenCalled();
    await effects.gather(flare, state, ['e1', 'e2'], beats);
    expect(scene.converge).toHaveBeenCalledTimes(2);
    expect(scene.converge.mock.calls[0][1]).toBe(beats.gather);
    expect(scene.focus).toHaveBeenCalledWith(.08, beats.gather, beats.aftermath);
    expect(scene.wait).toHaveBeenLastCalledWith(beats.gather);
  });
  it('falls back to the neutral set for an enemy without an element and a support pulse in the caster element', async () => {
    const { effects } = await mounted();
    const plain = { ...state, enemies: [{ id: 'e1', hp: 100 }, { id: 'e2', hp: 100 }] } as unknown as RadiantCombatState;
    await effects.impact(hit('e1', { kind: 'enemy', enemyId: 'e2' }), null, plain);
    expect(scene.burst.mock.calls.at(-1)![2].id).toBe('neutral');
    const tideSkill: RadiantPlayerAction = { type: 'normal', bearerId: 'tide', targetId: 'e1' };
    await effects.windup(tideSkill, state, beatPlan('normal', null, 1));
    expect(scene.chargeAura.mock.calls.at(-1)![2].id).toBe('oceanic');
  });
  it('telegraphs enemy actions by family and escalates enemy bursts by tier (D-491)', async () => {
    const { effects } = await mounted();
    const cue = (over: Partial<EnemyActionCue>): EnemyActionCue => ({ enemyId: 'e1', tier: 'attack', skillName: null,
      family: 'devourer', starter: null, elementId: 'oceanic', ...over });
    // Devourer Strike: motes gather into the enemy with a sigil (power .3), then a claw cut across the struck bearer.
    await effects.enemyWindup(cue({ tier: 'strike' }), ['ember'], enemyBeatPlan('strike', 1));
    expect(scene.chargeAura).toHaveBeenLastCalledWith({ x: 210, y: 380 }, 300, expect.objectContaining({ id: 'oceanic' }), .3);
    expect(scene.wait).toHaveBeenNthCalledWith(1, 300);
    expect(scene.wait).toHaveBeenNthCalledWith(2, 150);
    expect(scene.slash).toHaveBeenCalledTimes(1);
    expect(scene.slash.mock.calls[0][0]).toEqual({ x: 880, y: 400 });
    // Constructs fire; a War form's Strike and up use its bearer's signature layer.
    await effects.enemyWindup(cue({ family: 'construct' }), ['ember'], enemyBeatPlan('attack', 1));
    expect(scene.projectile).toHaveBeenCalledTimes(1);
    await effects.enemyWindup(cue({ family: 'war', starter: 'nerithe', tier: 'special' }), ['ember'], enemyBeatPlan('special', 1));
    expect(scene.chargeAura.mock.calls.at(-1)![2]).toEqual(bearerElementStyle('nerithe', 'oceanic'));
    await effects.enemyWindup(cue({ family: 'war', starter: 'nerithe' }), ['ember'], enemyBeatPlan('attack', 1));
    expect(scene.chargeAura.mock.calls.at(-1)![2].id).toBe('oceanic');
    expect(scene.chargeAura.mock.calls.at(-1)![2]).not.toEqual(bearerElementStyle('nerithe', 'oceanic'));
    // Bursts: Attack keeps the enemy size; Strike and Overdrive are scaled-down Skill 1; the special is Skill 2.
    scene.burst.mockClear();
    const struck = hit('ember', { kind: 'enemy', enemyId: 'e1' });
    for (const tier of ['attack', 'strike', 'overdrive', 'special'] as const)
      await effects.impact(struck, null, state, enemyBeatPlan(tier, 2), false, 1, cue({ tier }));
    expect(scene.burst.mock.calls.map(call => [call[1], call[4]])).toEqual([['enemy', 1], ['skill1', .8], ['skill1', .92], ['skill2', 1]]);
    expect(scene.wait).toHaveBeenLastCalledWith(enemyBeatPlan('special', 2).slots[1]);
    // A cue for another enemy never restyles this packet.
    await effects.impact(hit('ember', { kind: 'enemy', enemyId: 'e2' }), null, state, enemyBeatPlan('special', 1), false, 0, cue({ tier: 'special' }));
    expect(scene.burst.mock.calls.at(-1)![1]).toBe('enemy');
  });
  describe('shader kit light per beat (D-494 step 3)', () => {
    const skill = (slot: 1 | 2): RadiantPlayerAction => ({ type: 'skill', bearerId: 'ember', slot, targetId: 'e1' } as RadiantPlayerAction);
    const skillHit = (id: string, slot: 1 | 2) => hit(id, { kind: 'skill', bearerId: 'ember', slot });
    it('Skill 1 lays the caster element veil on its first hit only, with no edge bloom', async () => {
      const { effects } = await mounted();
      const { beatLight } = await import('./gpu-effects');
      const beats = beatPlan('skill1', null, 2);
      await effects.impact(skillHit('e1', 1), skill(1), state, beats, false, 0);
      await effects.impact(skillHit('e1', 1), skill(1), state, beats, false, 1);
      expect(scene.veil).toHaveBeenCalledTimes(1);
      expect(scene.veil.mock.calls[0][0]).toMatchObject({ at: { x: 210, y: 380 }, mode: 'infernic', radius: 220 * beatLight.veil.skill1.size,
        ms: beatLight.veil.skill1.ms, palette: expect.objectContaining({ main: 0xff8a5c }) });
      expect(scene.edgeBloom).not.toHaveBeenCalled();
      expect(scene.godRays).not.toHaveBeenCalled();
    });
    it('Skill 2 adds a soft edge bloom in the caster element and a larger veil on each target', async () => {
      const { effects } = await mounted();
      const { beatLight } = await import('./gpu-effects');
      const frame = { ...skillHit('e1', 2), events: [...skillHit('e1', 2).events, ...skillHit('e2', 2).events] } as RadiantImpactFrame;
      await effects.impact(frame, skill(2), state, beatPlan('skill2', null, 1), false, 0);
      expect(scene.veil).toHaveBeenCalledTimes(2);
      expect(scene.veil.mock.calls[0][0].radius).toBe(220 * beatLight.veil.skill2.size);
      expect(scene.edgeBloom).toHaveBeenCalledOnce();
      expect(scene.edgeBloom.mock.calls[0][0]).toMatchObject({ strength: 'soft', color: 0xff8a5c });
    });
    it('Convergent Light: god rays rise through the gather; the finisher adds edge bloom by tier', async () => {
      const { effects } = await mounted();
      const flare: RadiantPlayerAction = { type: 'flare', bearerId: 'ember' };
      const flareHit = hit('e1', { kind: 'flare', bearerId: 'ember' });
      const expected = { sparkling: ['soft', undefined], glimmering: ['full', 'field'], ultimate: ['full', 'screen'] } as const;
      for (const tier of ['sparkling', 'glimmering', 'ultimate'] as const) {
        scene.edgeBloom.mockClear(); scene.godRays.mockClear();
        const beats = beatPlan('flare', tier, 4, 3);
        await effects.impact(flareHit, flare, state, beats, false, 0);
        expect(scene.edgeBloom).not.toHaveBeenCalled();
        await effects.gather(flare, state, ['e1', 'e2'], beats);
        expect(scene.godRays).toHaveBeenCalledOnce();
        // Centred between the two targets, rising for exactly the gather.
        expect(scene.godRays.mock.calls[0][0]).toMatchObject({ at: { x: 335, y: 380 }, attackMs: beats.gather, color: 0xff8a5c });
        await effects.impact(flareHit, flare, state, beats, true, 3);
        expect(scene.godRays).toHaveBeenCalledOnce();
        expect(scene.edgeBloom).toHaveBeenCalledOnce();
        const [strength, area] = expected[tier];
        expect(scene.edgeBloom.mock.calls[0][0].strength).toBe(strength);
        if (area) expect(scene.edgeBloom.mock.calls[0][0].area).toBe(area);
      }
      // A first-hit finisher has no gather: the god rays rise with the finisher itself.
      scene.godRays.mockClear();
      await effects.impact(flareHit, flare, state, beatPlan('flare', 'sparkling', 1, 0), true, 0);
      expect(scene.godRays).toHaveBeenCalledOnce();
      expect(scene.godRays.mock.calls[0][0].attackMs).toBe(90);
    });
    it('a critical hit adds the chromatic ring, wider for an Elemental Crit', async () => {
      const { effects } = await mounted();
      const crit = (critical: string) => {
        const frame = hit('e1');
        (frame.events[0] as { critical?: string }).critical = critical;
        return frame;
      };
      await effects.impact(crit('critical'), normal, state, beatPlan('normal', null, 1));
      await effects.impact(crit('elemental'), normal, state, beatPlan('normal', null, 1));
      expect(scene.critFlash).toHaveBeenCalledTimes(2);
      expect(scene.critFlash.mock.calls[1][0].radius).toBeGreaterThan(scene.critFlash.mock.calls[0][0].radius);
      expect(scene.critFlash.mock.calls[0][0].color).toBe(0xff8a5c);
      expect(scene.veil).not.toHaveBeenCalled();
    });
    it('a boss special opens with a soft edge bloom in its element; lesser enemy tiers do not', async () => {
      const { effects } = await mounted();
      const cue = (tier: EnemyActionCue['tier']): EnemyActionCue => ({ enemyId: 'e1', tier, skillName: 'Ruin', family: 'calamity',
        starter: null, elementId: 'oceanic' });
      const struck = hit('ember', { kind: 'enemy', enemyId: 'e1' });
      await effects.impact(struck, null, state, enemyBeatPlan('overdrive', 1), false, 0, cue('overdrive'));
      expect(scene.edgeBloom).not.toHaveBeenCalled();
      await effects.impact(struck, null, state, enemyBeatPlan('special', 2), false, 0, cue('special'));
      await effects.impact(struck, null, state, enemyBeatPlan('special', 2), false, 1, cue('special'));
      expect(scene.edgeBloom).toHaveBeenCalledOnce();
      expect(scene.edgeBloom.mock.calls[0][0]).toMatchObject({ strength: 'soft', color: 0x6cc4ff });
    });
    it('caps point overlays to the battlefield so a large boss box cannot push light onto the HUD', async () => {
      const { effects, element } = await mounted();
      const { beatLight } = await import('./gpu-effects');
      vi.spyOn(element.querySelector('.radiant-field')!, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 1200, 300));
      await effects.impact(skillHit('e1', 2), skill(2), state, beatPlan('skill2', null, 1), false, 0);
      expect(scene.veil.mock.calls[0][0].radius).toBe(300 * beatLight.cap.veil);
    });
    it('a Conduit callout pulses a small ring in its element at the pill', async () => {
      const { effects } = await mounted();
      effects.calloutPulse({ x: 900, y: 320 }, 'oceanic');
      expect(scene.pulse).toHaveBeenCalledWith({ x: 900, y: 320 }, expect.any(Number), expect.objectContaining({ id: 'oceanic' }), expect.any(Number));
    });
  });
  it('routes screen cues through the flash governor and passes hit-stop to the GPU clocks', async () => {
    const { effects } = await mounted();
    effects.screen({ dim: { alpha: .55, inMs: 350, holdMs: 1750, outMs: 300 } });
    expect(scene.dim).toHaveBeenCalledWith(.55, 350, 1750, 300);
    for (let index = 0; index < 4; index++) effects.screen({ flash: 'full' });
    expect(scene.flash.mock.calls.map(call => call[0])).toEqual(['full', 'full', 'full', 'soft']);
    effects.screen({ freeze: 90 });
    expect(scene.freeze).toHaveBeenCalledWith(90);
  });
  it('pauses with Settings and cancels every live effect on Skip', async () => {
    const { effects } = await mounted();
    effects.pause(true);
    expect(scene.setPaused).toHaveBeenLastCalledWith(true);
    effects.cancel();
    expect(scene.cancelAll).toHaveBeenCalled();
    effects.dispose();
    expect(scene.attach).toHaveBeenLastCalledWith(null);
    expect(document.querySelector<HTMLElement>('.radiant-gpu-layer')!.style.visibility).toBe('hidden');
  });
});
