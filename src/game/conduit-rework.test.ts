import { describe, expect, it } from 'vitest';
import { applyConduitBuffs, resolveFighter } from '../content/combat';
import type { ConduitId, ConduitSlots } from '../content/conduits';
import { infusionStageCount } from '../content/activities';
import { createCreatureCopy } from './character-instances';
import { act, actionGaugeCost, actionUnavailable, createBattle, createCalamityBattle, createDungeonBattle,
  createInfusionBattle, createStoryBattle, createWarBattle, endTurn, nextWave, roll, type BattleState } from './battle';
import { applyConduitBurn, applyConduitWeaken, conduitIncoming, effectiveDefense, generatedShield, gear,
  initializeConduits, nativeGauge, nativeShield, prepareConduitAction, refreshConduitStats } from './conduit-runtime';
import { freshGame, resolveOperation } from '../../supabase/functions/game-operation/engine';
import { conduitStatusReadout } from '../presentation/conduit-status';

const slots = (...ids: ConduitId[]): ConduitSlots => [...ids, ...Array<null>(8 - ids.length).fill(null)];
function fixture(ids: ConduitId[] = [], level = 0): BattleState {
  const state = createBattle(1729, ['ember', 'tide']);
  for (const ally of state.allies) {
    ally.stats = { health: 1000, defense: 100, damage: 100, crit: 0, critMultiplier: 1.5,
      shatterCapacity: 200, elementalDamage: 1, skillPower: 1, skillDuration: 0, skillEfficiency: 0, gaugeGain: 1 };
    ally.hp = 1000;
    ally.shatter = 100;
  }
  state.allies[0].conduits = slots(...ids);
  state.conduitUpgrades = Object.fromEntries(ids.map(id => [id, level]));
  applyConduitBuffs(state.allies[0].stats, state.allies[0].conduits, state.conduitUpgrades);
  state.allies[0].hp = state.allies[0].stats.health;
  for (const enemy of state.enemies) {
    enemy.stats.health = enemy.hp = 1000000;
    enemy.stats.damage = 1;
    enemy.stats.crit = enemy.stats.defense = 0;
  }
  initializeConduits(state);
  return state;
}

describe('D-382 replacement interactions', () => {
  it.each([0, 1, 2, 3, 4, 5])('uses every listed static benefit at +%i without retired penalties', level => {
    const m = 1 + level * .1;
    const common = fixture(['bastion-lock', 'crosspin-governor', 'fieldbrace-coupler', 'fracture-reservoir',
      'parallax-relay', 'prism-splinter-socket', 'reserve-torque-crank', 'siegebound-drive'], level).allies[0].stats;
    expect(common.health).toBeCloseTo(1000 * (1 + .5 * m));
    expect(common.defense).toBeCloseTo(100 * (1 + .35 * m));
    expect(common.damage).toBeCloseTo(100 * (1 + .35 * m));
    expect(common.crit).toBeCloseTo(.25 * m);
    expect(common.skillPower).toBeCloseTo(1 + .65 * m);
    expect(common.skillEfficiency).toBeCloseTo(.1 * m);
    expect(common.gaugeGain).toBeCloseTo(1 + .175 * m);
    expect(common.shatterCapacity).toBeCloseTo(200 * (1 + .65 * m));
    const rare = fixture(['aegis-capacitor', 'coilfeed-ratchet', 'falcon-sight', 'hammerbalance-link',
      'resonance-crucible', 'wardglass-transformer'], level).allies[0].stats;
    expect(rare.health).toBeCloseTo(1000 * (1 + 1.7 * m));
    expect(rare.defense).toBeCloseTo(100 * (.65 + 1.5 * m));
    expect(rare.damage).toBeCloseTo(100 * (1 + .85 * m));
    expect(rare.crit).toBeCloseTo(.33 * m);
    expect(rare.critMultiplier).toBeCloseTo(1.5 * (1 + .5 * m));
    expect(rare.skillPower).toBeCloseTo(1 + .08 * m);
    expect(rare.skillEfficiency).toBeCloseTo(.08 * m);
    expect(rare.skillDuration).toBe(1);
    const high = fixture(['astral-prism', 'citadel-spine', 'immortal-vessel',
      'calamitic-horizon-cleaving-godpress', 'calamitic-throne-borrowed-tomorrows'], level).allies[0].stats;
    expect(high.health).toBeCloseTo(1000 * (1 + 3.45 * m));
    expect(high.defense).toBeCloseTo(100 * (1 + 1.95 * m));
    expect(high.damage).toBeCloseTo(100 * (1 + .75 * m));
    expect(high.crit).toBeCloseTo(.3 * m);
    expect(high.critMultiplier).toBeCloseTo(1.5 * (1 + .25 * m));
    expect(high.gaugeGain).toBeCloseTo(1 + .07 * m);
  });

  it.each([199, 200, 399, 400, 20000, 1000000])('Glassroot uses complete 200 maximum Health steps at %i', health => {
    const stats = { ...resolveFighter('ember').stats, health };
    applyConduitBuffs(stats, slots('glassroot-gimbal', 'vigil-core'));
    expect(stats.health).toBe(health * 2);
    expect(stats.skillPower).toBeCloseTo(1 + Math.floor(health * 2 / 200) * .05);
  });

  it('does not globally cap stacked Skill Duration, but retains status-specific Weaken limits', () => {
    const state = fixture(['calamitic-world-eater-orrery', 'resonance-crucible', 'opal-indexer']);
    const owner = state.allies[0], target = state.enemies[0];
    const ctx = prepareConduitAction(state, owner, 'skill1', 25, false);
    expect(owner.stats.skillDuration).toBe(4);
    expect(ctx.skillDuration).toBe(5);
    expect(ctx.skillPower).toBe(1.75);
    expect(ctx.debuffPowerBonus).toBe(1.25);
    expect(applyConduitBurn(state, owner, target, 100, ctx)).toBe(300);
    applyConduitWeaken(state, owner, target, .3, [], 'skill1', 2, ctx);
    expect(target.weakenFraction).toBe(.5);
    expect(target.weakened).toBe(6);
    const result = act(state, owner.id, 'skill1', target.id);
    expect(result.state.enemies[0].burn.turns).toBe(8);
    const control = fixture(['resonance-crucible', 'opal-indexer']);
    const normal = act(control, owner.id, 'skill1', control.enemies[0].id);
    expect(result.events.find(event => event.kind === 'damage')?.amount)
      .toBe(normal.events.find(event => event.kind === 'damage')?.amount);
  });

  it('Nullsong consumes exactly one combat roll per skill cast, never per target or on rejected actions', () => {
    for (const seed of [1, 1729, 12345, 0xffffffff]) {
      const state = fixture(['nullsong-transmission'], 5);
      state.seed = seed;
      const expected = structuredClone(state);
      const positive = roll(expected) < .5;
      const ctx = prepareConduitAction(state, state.allies[0], 'skill2', 40, true);
      expect(ctx.skillPower).toBeCloseTo(positive ? 2.125 : .25);
      expect(state.seed).toBe(expected.seed);
      expect(ctx.nativeAll).toBe(true);
      const next = prepareConduitAction(state, state.allies[0], 'light', 0, false);
      expect(next.skillPower).toBe(1);
      expect(state.seed).toBe(expected.seed);
      state.allies[0].spent = true;
      const before = structuredClone(state);
      expect(() => act(state, 'ember', 'skill1', state.enemies[0].id)).toThrow('already acted');
      expect(state).toEqual(before);
    }
  });

  it('Funeral Engine removes captured Last Flare cooldown and recovery, but never Gauge floors or action limits', () => {
    const copy = createCreatureCopy('infusion:abyss:5', infusionStageCount('abyss'));
    const state = createBattle(1729, [copy.instanceId, 'ember'], {}, {
      [copy.instanceId]: slots('calamitic-causality-funeral-engine'),
    }, [copy]);
    const owner = state.allies[0];
    owner.shatter = 100;
    owner.recoverThrough = owner.readyRound.ultimate = 99;
    expect(actionUnavailable(state, owner, 'ultimate')).toBeNull();
    expect(actionGaugeCost(owner, 'ultimate', state)).toBe(70);
    expect(actionGaugeCost(owner, 'skill1', state)).toBe(13);
    for (const enemy of state.enemies) enemy.hp = enemy.stats.health = 1000000;
    const result = act(state, owner.id, 'ultimate', state.enemies[0].id);
    expect(result.state.allies[0].readyRound.ultimate).toBe(99);
    expect(actionUnavailable(result.state, result.state.allies[0], 'skill1')).toContain('already acted');
    result.state.allies[0].spent = false;
    expect(actionUnavailable(result.state, result.state.allies[0], 'skill1')).toBeNull();
  });

  it('Horizon Health does not grant free healing when Gauge toggles; Glassroot tracks the changed maximum', () => {
    const state = fixture(['horizon-heartcase', 'glassroot-gimbal', 'vigil-core']);
    const owner = state.allies[0];
    expect(owner.stats.health).toBe(2000);
    owner.shatter = 0;
    refreshConduitStats(state);
    expect(owner.stats.health).toBe(2200);
    expect(owner.stats.skillPower).toBeCloseTo(1.55);
    expect(owner.hp).toBe(2000);
    owner.hp = 1500;
    owner.shatter = 100;
    owner.spent = true;
    refreshConduitStats(state);
    expect(owner.stats.health).toBe(2000);
    expect(owner.hp).toBe(1500);
    expect(effectiveDefense(state, owner)).toBe(100);
    owner.shatter = 0;
    refreshConduitStats(state);
    expect(owner.hp).toBe(1500);
    expect(owner.stats.skillPower).toBeCloseTo(1.55);
    state.phase = 'cleared';
    const continued = nextWave(state).state;
    expect(continued.allies[0].hp).toBeLessThanOrEqual(1500);
    expect(continued.allies[0].stats.health).toBe(2200);
  });

  it('Horizon ignores stale cooldown/recovery with Funeral and updates when incoming Gauge restores castability', () => {
    const state = fixture(['horizon-heartcase', 'calamitic-causality-funeral-engine']);
    const owner = state.allies[0];
    owner.recoverThrough = owner.readyRound.ultimate = 99;
    refreshConduitStats(state);
    expect(owner.stats.health).toBe(1000);
    owner.shatter = 65;
    refreshConduitStats(state);
    expect(owner.stats.health).toBe(1200);
    owner.hp = 1200;
    conduitIncoming(state, state.enemies[0], owner, 10000, false, false, []);
    expect(owner.shatter).toBe(75);
    expect(owner.hp).toBe(0);
    expect(owner.stats.health).toBe(1000);
  });

  it('Starvein includes defeated Squad Members and scales recipient Gauge Gain exactly once', () => {
    const state = fixture(['starvein-conductor', 'prism-splinter-socket']);
    const [owner, other] = state.allies;
    other.hp = 0;
    owner.shatter = 0;
    nativeGauge(state, owner, 100, []);
    expect(owner.shatter).toBe(118);
    expect(actionGaugeCost(owner, 'skill1', state)).toBe(16);
    other.element = owner.element;
    owner.shatter = 0;
    nativeGauge(state, owner, 100, []);
    expect(owner.shatter).toBe(108);
    expect(actionGaugeCost(owner, 'skill1', state)).toBe(24);
  });

  it('Pale protects existing Shields from any source and leaves unshielded overflow unprotected', () => {
    for (const native of [false, true]) {
      const state = fixture(['pale-bulwark-diadem']);
      const [owner, source] = state.allies;
      if (native) nativeShield(state, source, owner, 100, []);
      else generatedShield(source, owner, 100, []);
      conduitIncoming(state, state.enemies[0], owner, 300, false, false, []);
      expect(owner.hp).toBe(900);
      expect(owner.shield).toBe(0);
      conduitIncoming(state, state.enemies[0], owner, 100, false, false, []);
      expect(owner.hp).toBe(800);
    }
  });

  it('Pale preserves Tizu sole-owner full-block credit without treating mixed Shields as his alone', () => {
    for (const mixed of [false, true]) {
      const state = fixture(['pale-bulwark-diadem']);
      const [recipient, tizu] = state.allies;
      recipient.shatter = 0;
      nativeShield(state, tizu, recipient, 100, []);
      if (mixed) generatedShield(recipient, recipient, 100, [], true);
      conduitIncoming(state, state.enemies[0], recipient, mixed ? 300 : 150, false, false, []);
      expect(recipient.hp).toBe(1000);
      expect(recipient.shatter).toBe(mixed ? 10 : 18);
    }
  });

  it('Stasis protection survives serialization, does not prevent next-turn actions, and has a visible penalty clock', () => {
    const state = fixture(['stasis-reliquary']);
    state.allies[0].shield = 1;
    conduitIncoming(state, state.enemies[0], state.allies[0], 100, false, false, []);
    expect(conduitStatusReadout(state.allies[0], 1)).toContain('Prevents all further damage');
    const restored: BattleState = JSON.parse(JSON.stringify(state));
    conduitIncoming(restored, restored.enemies[1], restored.allies[0], 100000, true, true, []);
    expect(restored.allies[0].hp).toBe(1000);
    const next = endTurn(restored).state;
    expect(next.round).toBe(2);
    expect(actionUnavailable(next, next.allies[0], 'light')).toBeNull();
    expect(conduitStatusReadout(next.allies[0], 2)).toContain('Take 25% more damage from enemy [Attack Actions]');
  });

  it('Pale and Stasis also protect the wearer when intercepting native Cover damage', () => {
    const state = fixture(['pale-bulwark-diadem', 'stasis-reliquary']);
    const [owner, recipient] = state.allies;
    owner.native = { cover: { targets: [recipient.id], fraction: .5, throughPhase: 1 } };
    owner.shield = 50;
    conduitIncoming(state, state.enemies[0], recipient, 400, false, false, []);
    expect(owner.hp).toBe(1000);
    expect(owner.shield).toBe(0);
    conduitIncoming(state, state.enemies[1], recipient, 400, false, false, []);
    expect(owner.hp).toBe(1000);
  });
});

describe('D-382 activity and authority boundaries', () => {
  const progress = { level: 0, evolution: 1 };
  const equipment = { ember: slots('breach-pendulum') };
  const entries = [
    () => createBattle(1729, ['ember'], {}, equipment),
    () => createDungeonBattle('infernic', 1, 1729, 'ember', progress, ['ember'], {}, equipment),
    () => createStoryBattle(25, 1729, 'ember', progress, ['ember'], {}, equipment),
    () => createWarBattle('nerithe', 1, 1729, 'ember', progress, ['ember'], {}, equipment),
    () => createCalamityBattle('treasury', 1, 1729, 'ember', progress, ['ember'], {}, equipment),
    ...(['heavens', 'abyss', 'treasury', 'sanctuary', 'machines', 'roses'] as const).map(mode =>
      () => createInfusionBattle(mode, infusionStageCount(mode), 1729, 'ember', progress, ['ember'], {}, equipment)),
  ];
  it.each(entries.map((create, index) => ({ create, index })))('Breach applies once to the actual enemies in constructor $index', ({ create }) => {
    const state = create();
    const reduced = state.enemies.map(enemy => enemy.stats.defense);
    initializeConduits(state);
    expect(state.enemies.map(enemy => enemy.stats.defense)).toEqual(reduced);
    expect(state.enemies.every(enemy => gear(enemy).numbers.breachApplied === 1)).toBe(true);
  });

  it('matches authoritative random-cast results and preserves frozen upgrades', () => {
    const entropy = { seed: () => 1729, random: () => .9, uuid: () => '00000000-0000-4000-8000-000000000001' };
    let game = resolveOperation(freshGame('rework-parity'), { kind: 'bootstrap', starterId: 'ember' }, entropy).game;
    game.account.characters.tide = progress;
    game.account.squad = ['ember', 'tide'];
    game.account.conduits = { 'nullsong-transmission': 1, 'calamitic-world-eater-orrery': 1 };
    game.account.conduitUpgrades = { 'nullsong-transmission': 5 };
    game.account.conduitEquipment = { ember: slots('nullsong-transmission', 'calamitic-world-eater-orrery') };
    game = resolveOperation(game, { kind: 'enter', activity: { kind: 'training' } }, entropy).game;
    const session = game.run!.session;
    session.state.allies[0].shatter = 100;
    for (const enemy of session.state.enemies) enemy.hp = enemy.stats.health = 1000000;
    const operation = { kind: 'act' as const, runId: session.runId, actorId: 'ember',
      action: 'skill1' as const, targetId: session.state.enemies[0].id };
    const expected = act(session.state, 'ember', 'skill1', operation.targetId);
    const before = structuredClone(game);
    const actual = resolveOperation(game, operation, entropy);
    expect(actual.response.result).toEqual(expected);
    expect(actual.game.run!.session.state.enemies[0].burn).toEqual(expected.state.enemies[0].burn);
    expect(actual.game.run!.session.state.conduitUpgrades?.['nullsong-transmission']).toBe(5);
    expect(game).toEqual(before);
  });
});
