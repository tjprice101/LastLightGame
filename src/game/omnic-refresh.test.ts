import { describe, expect, it } from 'vitest';
import { applyConduitBuffs, resolveFighter, type Stats } from '../content/combat';
import { conduits, type ConduitId, type ConduitSlots } from '../content/conduits';
import { isMasterConduitId, masterConduits } from '../content/master-conduits';
import { omnicStatBonuses, type OmnicStat } from '../content/omnic-conduit-stats';
import { phaseZeroUpgradedAbility } from '../content/phase-zero-conduit-upgrades';
import { phaseZeroStatLabels } from '../content/phase-zero-stats';
import { act, createBattle, createStoryBattle, nextStage, nextWave, withMasterLoadouts, type BattleState } from './battle';
import { afterConduitBurn, afterConduitHpLoss, effectiveDefense, finishConduitAction, initializeConduits,
  prepareConduitAction, recordConduitHit, refreshConduitStats } from './conduit-runtime';
import { nativePrimaryHit, nativeTurnStart } from './native-kits';

const base: Stats = { health: 1000, damage: 100, defense: 100, crit: 0, critMultiplier: 1.5,
  elementalDamage: 100, shatterCapacity: 200, skillPower: 1, skillDuration: 0, skillEfficiency: 0, gaugeGain: 1 };
const slots = (...ids: ConduitId[]): ConduitSlots => [...ids, ...Array<null>(8 - ids.length).fill(null)];
function fixture(): BattleState {
  const state = createBattle(1729, ['ember', 'tide', 'sprout']);
  for (const unit of state.allies) {
    unit.stats = { ...base }; unit.hp = 1000; unit.shatter = 100;
  }
  for (const unit of state.enemies) {
    unit.hp = unit.stats.health = 100000; unit.stats.defense = 0;
  }
  return state;
}
const entries = [...conduits.filter(entry => entry.rarity === 'Omnic'), ...masterConduits];
const additive = new Set<OmnicStat>(['crit', 'skillPower', 'skillEfficiency', 'gaugeGain']);

describe('D-383 complete Omnic and Master refresh', () => {
  it('covers exactly 45 ordinary Omnics and 48 named Masters', () => {
    expect(entries).toHaveLength(93);
    expect(new Set(entries.map(entry => entry.id)).size).toBe(93);
  });

  for (const entry of entries) it(`${entry.id} applies every personal and living-squad stat at its supported upgrades`, () => {
    for (const level of isMasterConduitId(entry.id) ? [0] : [0, 1, 2, 3, 4, 5]) {
      const state = fixture(), owner = state.allies[0];
      if (isMasterConduitId(entry.id)) owner.masterConduit = entry.id;
      else {
        owner.conduits = slots(entry.id);
        state.conduitUpgrades = { [entry.id]: level };
        applyConduitBuffs(owner.stats, owner.conduits, state.conduitUpgrades);
      }
      initializeConduits(state);
      const own = omnicStatBonuses(entry.id), squad = omnicStatBonuses(entry.id, true);
      for (const stat of new Set([...Object.keys(own), ...Object.keys(squad)]) as Set<OmnicStat>) {
        const fraction = ((own[stat] ?? 0) + (squad[stat] ?? 0)) * (1 + level * .1);
        const initial = base[stat] ?? 0;
        const expected = additive.has(stat) ? initial + fraction : initial * (1 + fraction);
        expect(owner.stats[stat], `${entry.id} ${stat} +${level}`).toBeCloseTo(stat === 'skillEfficiency' ? Math.min(.5, expected) : expected);
        if (squad[stat]) {
          const amount = squad[stat]! * (1 + level * .1);
          expect(state.allies[1].stats[stat]).toBeCloseTo(additive.has(stat) ? initial + amount : initial * (1 + amount));
        }
        expect(phaseZeroUpgradedAbility(entry.id, level)).toContain(`[${phaseZeroStatLabels[stat]}]`);
      }
    }
  });

  it('adds Master stats once regardless of the number of occupied ordinary slots, using one raw-base pool', () => {
    for (const equipment of [slots(), slots('bastion-lock'), slots('bastion-lock', 'aquatic-leviathan-pump')]) {
      const result = { ...base };
      applyConduitBuffs(result, equipment, {}, 'master-tide-1');
      const defense = 100 * (1 + .8 + (equipment.includes('bastion-lock') ? .35 : 0) +
        (equipment.includes('aquatic-leviathan-pump') ? .45 : 0));
      expect(result.defense).toBeCloseTo(defense);
      expect(result.skillPower).toBeCloseTo(1.45 + (equipment.includes('bastion-lock') ? .25 : 0));
      expect(result.skillEfficiency).toBe(.35);
    }
    expect(() => resolveFighter('ember', undefined, undefined, undefined, 'master-tide-1')).toThrow();
  });

  it('matches personal Master preview stats with frozen battle stats', () => {
    const equipment = slots('bastion-lock', 'aquatic-leviathan-pump');
    const preview = resolveFighter('tide', undefined, equipment, {}, 'master-tide-1');
    const state = withMasterLoadouts(createBattle(1729, ['tide'], undefined, { tide: equipment }), { tide: 'master-tide-1' });
    expect(state.allies[0].stats).toEqual(preview.stats);
  });

  it('stacks three living wearers, removes each lost source and never heals or resurrects during refresh', () => {
    const state = fixture();
    for (const unit of state.allies) unit.conduits = slots('chaotic-ouroboros-core');
    initializeConduits(state);
    expect(state.allies.map(unit => unit.stats.health)).toEqual([2650, 2650, 2650]);
    state.allies[0].hp = 0; state.allies[1].hp = 2500;
    refreshConduitStats(state);
    expect(state.allies[1].stats.health).toBe(2100);
    expect(state.allies[1].hp).toBe(2100);
    expect(state.allies[0].hp).toBe(0);
    state.allies[0].hp = 1;
    refreshConduitStats(state);
    expect(state.allies[1].stats.health).toBe(2650);
    expect(state.allies[1].hp).toBe(2100);
    expect(state.allies[0].hp).toBe(1);
    const resumed = structuredClone(state);
    refreshConduitStats(resumed);
    expect(resumed).toEqual(state);
    resumed.phase = 'cleared';
    const next = nextWave(resumed);
    expect(next.state.allies[1].stats.health).toBe(2650);
  });

  it('recomputes Glassroot from aura Health without compounding or free healing', () => {
    const state = fixture(), [source, recipient] = state.allies;
    source.conduits = slots('tension-governor');
    recipient.conduits = slots('glassroot-gimbal');
    applyConduitBuffs(recipient.stats, recipient.conduits);
    initializeConduits(state);
    expect(recipient.stats.skillPower).toBeCloseTo(1.35);
    recipient.hp = 100;
    source.hp = 0;
    refreshConduitStats(state);
    expect(recipient.stats.skillPower).toBeCloseTo(1.25);
    source.hp = 1;
    refreshConduitStats(state);
    expect(recipient.stats.skillPower).toBeCloseTo(1.35);
    expect(recipient.hp).toBe(100);
  });

  it('revives at the stated percentage of restored aura Health without healing other members', () => {
    const state = fixture(), [owner, recipient] = state.allies;
    owner.conduits = slots('infernic-phoenix-reactor');
    initializeConduits(state);
    recipient.hp = 100;
    owner.hp = 0;
    refreshConduitStats(state);
    expect(owner.stats.health).toBe(1000);
    afterConduitHpLoss(state, owner, []);
    expect(owner.stats.health).toBe(1550);
    expect(owner.hp).toBe(543);
    expect(recipient.hp).toBe(100);
  });

  it('preserves Gauge above the unequipped capacity when continuing with a capacity Master', () => {
    const progress = { level: 0, evolution: 1 };
    const state = withMasterLoadouts(createStoryBattle(1, 1729, 'orvella', progress), { orvella: 'master-orvella-1' });
    state.allies[0].shatter = state.allies[0].stats.shatterCapacity;
    state.phase = 'cleared';
    const next = nextStage(state, progress).state;
    expect(next.allies[0].masterConduit).toBe('master-orvella-1');
    expect(next.allies[0].shatter).toBe(state.allies[0].shatter);
    expect(next.allies[0].stats.shatterCapacity).toBe(state.allies[0].stats.shatterCapacity);
  });

  it('counts defeated captured Oceanic members for Clearwater and living elements for Pyre', () => {
    const state = fixture(), [owner, captured] = state.allies;
    owner.conduits = slots('clearwater-manifold');
    captured.id = 'capture:oceanic'; captured.definitionId = 'captured'; captured.element = 'oceanic'; captured.hp = 0;
    initializeConduits(state);
    expect(owner.stats.skillPower).toBeCloseTo(1.35);
    captured.element = 'botanic';
    refreshConduitStats(state);
    expect(owner.stats.skillPower).toBe(1);
  });

  it('stacks Phoenix healing for separate native ticks and wearers, excluding copied/generated damage', () => {
    const state = fixture(), [first, second, recipient] = state.allies, target = state.enemies[0];
    first.conduits = second.conduits = slots('emberlife-kiln');
    initializeConduits(state);
    for (const unit of state.allies) unit.hp = 100;
    target.burn = { damage: 10, turns: 3, sourceId: first.id, origin: 'native' };
    afterConduitBurn(state, first, target, 10, []);
    expect(recipient.hp).toBe(260);
    afterConduitBurn(state, first, state.enemies[1], 10, []);
    expect(recipient.hp).toBe(420);
    expect(prepareConduitAction(state, recipient, 'light', 0, false).skillPower).toBe(1);
    expect(recipient.stats.damage).toBe(400);
    target.burn.origin = 'conduit';
    afterConduitBurn(state, first, target, 10, []);
    expect(recipient.hp).toBe(420);
    target.burn.turns = 0;
    refreshConduitStats(state);
    expect(recipient.stats.damage).toBe(100);
  });

  it('consumes Dawn +200% Direct Damage once for the complete next Attack Action', () => {
    const state = fixture(), owner = state.allies[0], target = state.enemies[0];
    owner.conduits = slots('luminous-dawn-witness-array');
    initializeConduits(state);
    const missed = prepareConduitAction(state, owner, 'light', 0, false);
    recordConduitHit(missed, target, 10, false, 1.5);
    finishConduitAction(state, owner, missed, []);
    const boosted = prepareConduitAction(state, owner, 'skill1', 25, true);
    expect(boosted.bonus).toBe(2);
    expect(boosted.criticalDamageBonus).toBe(.3);
    expect(prepareConduitAction(state, owner, 'light', 0, false).bonus).toBe(0);
  });

  it('settles Seeds in frozen squad order when persistent JSON object keys are reordered', () => {
    const state = fixture(), owner = state.allies[2];
    owner.conduits = slots('efflorescent-worldtree-heart');
    applyConduitBuffs(owner.stats, owner.conduits);
    owner.native = { seeds: Object.fromEntries(state.allies.map(unit =>
      [unit.id, { dueRound: 1, fraction: .2, empowered: true }])) };
    initializeConduits(state);
    for (const unit of state.allies) unit.hp = unit.stats.health - 1;
    const restored = structuredClone(state), restoredOwner = restored.allies[2];
    restoredOwner.native!.seeds = Object.fromEntries(Object.entries(restoredOwner.native!.seeds!).reverse());
    const expected: import('./battle').BattleEvent[] = [], actual: import('./battle').BattleEvent[] = [];
    nativeTurnStart(state, expected);
    nativeTurnStart(restored, actual);
    expect(expected.filter(event => event.kind === 'shield').map(event => event.target)).toEqual(state.allies.map(unit => unit.id));
    expect(actual).toEqual(expected);
    expect(restored).toEqual(state);
  });

  it('counts every effective Quarry impact, ignores ineffective hits, and pays each completed pair', () => {
    const state = fixture(), owner = state.allies[0], target = state.enemies[0];
    owner.masterConduit = 'master-rosetta-1';
    owner.native = { quarry: { target: target.id, round: 1, contributors: [] } };
    initializeConduits(state);
    nativePrimaryHit(state, owner, target, false, [], 4);
    expect(state.allies[1].shatter).toBe(100);
    nativePrimaryHit(state, owner, target, true, [], 5);
    expect(state.allies[1].shatter).toBe(148);
    expect(owner.native.quarry?.hits).toBe(1);
    owner.native.quarry = { target: state.enemies[1].id, round: 1, contributors: [] };
    nativePrimaryHit(state, owner, state.enemies[1], true, []);
    expect(state.allies[1].shatter).toBe(148);
  });

  it('Ward Loom stacks Shield-skill Power from any Shield origin, and Ruinselect tracks revival', () => {
    const state = fixture(), [first, recipient, second] = state.allies;
    first.conduits = second.conduits = slots('ward-stitch-spool');
    recipient.conduits = slots('ruinselect-prism');
    initializeConduits(state);
    recipient.shield = 10;
    expect(prepareConduitAction(state, recipient, 'skill2', 40, false).skillPower).toBeCloseTo(1.6);
    first.hp = 0;
    expect(prepareConduitAction(state, recipient, 'skill2', 40, false).skillPower).toBeCloseTo(1.85);
    expect(effectiveDefense(state, recipient)).toBe(120);
    first.hp = 1;
    refreshConduitStats(state);
    expect(recipient.stats.skillPower).toBe(1);
  });

  it('focuses real Infernis Last Flare packets and Burn on the selected enemy, not the whole field', () => {
    const state = withMasterLoadouts(fixture(), { ember: 'master-ember-2' });
    const result = act(state, state.allies[0].id, 'ultimate', state.enemies[1].id);
    expect(result.state.enemies.map(unit => unit.burn.turns > 0)).toEqual([false, true, false]);
    const damageTargets = new Set(result.events.filter(event => event.kind === 'damage').map(event => event.target));
    expect([...damageTargets]).toEqual([state.enemies[1].id]);
    expect(result.state.allies[0].stats.skillPower).toBe(1.4);
  });
});
