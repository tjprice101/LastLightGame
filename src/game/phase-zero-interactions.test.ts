import { describe, expect, it, vi } from 'vitest';
import { act, createBattle, damageAmount, type BattleState, type BattleEvent } from './battle';
import { applyConduitBuffs, type ActionId } from '../content/combat';
import type { ConduitId, ConduitSlots } from '../content/conduits';
import type { MasterConduitId } from '../content/master-conduits';
import type { StarterId } from '../content/starters';
import { nativeBalance } from '../content/native-balance';
import {
  conduitActionCost, conduitCriticalBonus, conduitHitModifiers, conduitIncoming, effectiveDefense,
  expireNativeShields, initializeConduits, nativeGauge, nativeShield, prepareConduitAction,
} from './conduit-runtime';
import { nativeEnemyCompleted, nativeIncomingMultiplier, nativePhaseEnd, nativeRouteDamage } from './native-kits';

vi.mock('../content/phase-zero-stats', async original => ({
  ...await original<typeof import('../content/phase-zero-stats')>(), phaseZeroStatsReady: true,
}));

function fixture(roster: StarterId[] = ['ember', 'tide', 'sprout']): BattleState {
  const state = createBattle(1729, roster);
  for (const unit of [...state.allies, ...state.enemies]) {
    unit.stats = { ...unit.stats, health: 1000, damage: 100, defense: 100, crit: 0, critMultiplier: 1.5,
      shatterCapacity: 200, skillPower: 1, skillDuration: 0, skillEfficiency: 0, gaugeGain: 1 };
    unit.hp = 1000; unit.shatter = 100;
  }
  for (const enemy of state.enemies) { enemy.hp = 100000; enemy.stats.health = 100000; enemy.stats.defense = 0; }
  initializeConduits(state);
  return state;
}
const slots = (...ids: ConduitId[]): ConduitSlots => [...ids, ...Array<null>(8 - ids.length).fill(null)];
const hitModifiers = (state: BattleState, action: ActionId = 'skill1') => conduitHitModifiers(state, state.allies[1],
  state.enemies[0], prepareConduitAction(state, state.allies[1], action, 25, false), false);

describe('Phase 0 cross-effect rules', () => {
  it('Atlas and Leviathan count one enemy Attack Action, not each damage impact', () => {
    const atlas = fixture(), [owner, recipient] = atlas.allies;
    owner.conduits = slots('tectonic-atlas-bastion');
    recipient.shatter = 0;
    const taunt = act(atlas, owner.id, 'light', atlas.enemies[0].id).state;
    for (let i = 0; i < 3; i++) conduitIncoming(taunt, taunt.enemies[0], taunt.allies[0], 1, false, true, []);
    expect(taunt.allies[1].shatter).toBe(8);
    const leviathan = fixture(), [source, holder] = leviathan.allies;
    source.conduits = slots('aquatic-leviathan-pump');
    holder.shatter = 0;
    nativeShield(leviathan, source, holder, 100, []);
    for (let i = 0; i < 3; i++) conduitIncoming(leviathan, leviathan.enemies[0], holder, 1, false, true, []);
    expect(holder.shatter).toBe(3 * 10 + 10);
    delete leviathan.enemies[0].native;
    conduitIncoming(leviathan, leviathan.enemies[0], holder, 1, false, true, []);
    expect(holder.shatter).toBe(4 * 10 + 20);
  });
  it('adds conditional Defense, Direct Attack and Critical Damage to the pre-equipment base', () => {
    const state = fixture();
    const [owner, ally] = state.allies;
    owner.conduits = slots('firstlight-cam');
    ally.conduits = slots('bastion-lock', 'siegebound-drive', 'precision-escapement', 'judgment-lens');
    applyConduitBuffs(ally.stats, ally.conduits);
    ally.attackBoost = { fraction: .2, throughRound: 1 };
    expect(effectiveDefense(state, ally)).toBeCloseTo(160);
    const ctx = prepareConduitAction(state, ally, 'skill1', 25, false);
    const modifiers = conduitHitModifiers(state, ally, state.enemies[0], ctx, true);
    expect(modifiers.attack).toBeCloseTo(150);
    expect(ally.stats.critMultiplier * (1 + modifiers.criticalDamageBonus!)).toBeCloseTo(1.5 * 1.6);
    const result = act(state, ally.id, 'skill1', state.enemies[0].id);
    expect(result.events.find(event => event.kind === 'damage' && event.source === ally.id)?.amount)
      .toBe(damageAmount(150, 1.5 * nativeBalance.skillDamageScale, 0, false));
    ally.stats.damage = ally.stats.defense = ally.stats.critMultiplier = 0;
    const zero = conduitHitModifiers(state, ally, state.enemies[0], ctx, true);
    expect(zero.attack).toBe(0);
    expect(zero.criticalDamageBonus).toBe(0);
    expect(effectiveDefense(state, ally)).toBe(0);
  });

  it.each(['firstlight-cam', 'citadel-spine', 'infernic-pyre-census', 'tectonic-faultkeeper-loom',
    'chaotic-paradox-spindle', 'calamitic-cathedral-final-equation'] as const)(
    '%s has the same recipient aura with one or two living sources and loses it when all die', id => {
      const state = fixture(), [first, recipient, second] = state.allies;
      first.conduits = slots(id);
      first.recoverThrough = second.recoverThrough = 1;
      second.element = first.element;
      recipient.hp = 100;
      const read = () => {
        const ctx = prepareConduitAction(state, recipient, 'skill1', 25, false);
        return { defense: effectiveDefense(state, recipient), attack: conduitHitModifiers(state, recipient, state.enemies[0], ctx, false).attack,
          power: ctx.skillPower, cost: conduitActionCost(recipient, 'skill1', state, 100) };
      };
      const one = read();
      second.conduits = slots(id);
      expect(read()).toEqual(one);
      first.hp = 0;
      expect(read()).toEqual(one);
      second.hp = 0;
      const none = read();
      expect(none).toEqual({ defense: 100, attack: 100, power: 1, cost: 100 });
      expect(one).not.toEqual(none);
    },
  );

  it('pools native enemy Defense reductions once, clamps at 50%, then clamps skill ignore at 75%', () => {
    const state = fixture(['aurora', 'elise', 'ember']), [aurora, elise, actor] = state.allies, target = state.enemies[0];
    target.stats.defense = 100;
    aurora.masterConduit = 'master-aurora-1';
    aurora.native = { seals: { [target.id]: { fraction: .4, throughPhase: 2 } } };
    elise.masterConduit = 'master-elise-1';
    elise.native = { blades: [target.id, target.id] };
    actor.conduits = slots('spearwheel-engine', 'calamitic-horizon-cleaving-godpress', 'ominous-eclipse-mantle');
    state.conduitUpgrades = { 'spearwheel-engine': 5, 'calamitic-horizon-cleaving-godpress': 5, 'ominous-eclipse-mantle': 5 };
    target.weakened = 1; target.weakenSourceId = actor.id;
    expect(effectiveDefense(state, target)).toBe(100);
    expect(conduitHitModifiers(state, actor, target, prepareConduitAction(state, actor, 'skill1', 25, false), false).pierce).toBe(.75);
    const result = act(state, actor.id, 'skill1', target.id);
    const expected = damageAmount(100, 1.6 * nativeBalance.skillDamageScale, 50 * .25, false);
    expect(result.events.find(event => event.kind === 'damage' && event.source === actor.id)?.amount).toBe(expected);
  });

  it('duplicate native Wards use the strongest protection, one Gauge receipt, and stop when their owners die', () => {
    const state = fixture(['aurora', 'tide', 'ember']), [first, second, recipient] = state.allies;
    second.definitionId = first.definitionId;
    second.kit = structuredClone(first.kit);
    for (const source of [first, second]) source.masterConduit = 'master-aurora-2';
    first.native = { ultimateWardThrough: 2, ultimateWardReduction: .3 };
    second.native = { ultimateWardThrough: 2, ultimateWardReduction: .6 };
    expect(nativeIncomingMultiplier(state, state.enemies[0], recipient, 'skill1', [])).toBe(.4);
    nativePhaseEnd(state, []);
    expect(recipient.shatter).toBe(116);
    first.hp = second.hp = 0;
    expect(nativeIncomingMultiplier(state, state.enemies[1], recipient, 'skill1', [])).toBe(1);
    nativePhaseEnd(state, []);
    expect(recipient.shatter).toBe(116);
  });

  it('overlapping Foundations absorb once from the strongest surviving durability pool', () => {
    const state = fixture(['orvella', 'tide', 'ember']), [first, second, recipient] = state.allies;
    second.definitionId = first.definitionId;
    second.kit = structuredClone(first.kit);
    first.native = { foundation: { durability: 100, maximum: 100, throughPhase: 2 } };
    second.native = { foundation: { durability: 200, maximum: 200, throughPhase: 2 } };
    expect(nativeRouteDamage(state, state.enemies[0], recipient, 100, [], () => {})).toBe(80);
    expect(first.native.foundation?.durability).toBe(100);
    expect(second.native.foundation?.durability).toBe(180);
  });

  it.each(['skill2', 'ultimate'] as const)('Recall %s applies target modifiers consistently to all manual packets and records each once', action => {
    const state = fixture(['elise', 'tide', 'ember']), [elise, healer] = state.allies, target = state.enemies[0];
    elise.conduits = slots('spearwheel-engine', 'ominous-eclipse-mantle', 'calamitic-world-eater-orrery');
    elise.stats.skillPower = 1.5;
    target.stats.defense = 100;
    target.weakened = 2; target.weakenFraction = .25; target.weakenSourceId = healer.id;
    elise.native = { blades: [target.id, target.id] };
    healer.hp = 100;
    const result = act(state, elise.id, action, target.id);
    const recalls = result.events.filter(event => event.kind === 'damage' && event.nativeKind === 'recall');
    expect(recalls.map(event => event.amount)).toEqual([.9, .9, .6].map(coefficient =>
      damageAmount(100, coefficient * 1.7 * (action === 'ultimate' ? 3 : 1), 55, false)));
    const total = result.events.filter(event => event.kind === 'damage' && event.origin === 'native')
      .reduce((sum, event) => sum + event.amount + (event.shieldAbsorbed ?? 0), 0);
    expect(result.state.allies[1].hp).toBe(100 + Math.round(total * .1));
    expect(result.events.filter(event => event.kind === 'heal' && event.origin === 'conduit' &&
      event.target === healer.id)).toHaveLength(1);
  });

  it('Revenge and stored detonation receive skill pierce, but stored Burn never receives Skill Power twice', () => {
    const razor = fixture(['razor', 'tide', 'ember']);
    razor.allies[0].native = { wounds: 100 };
    razor.allies[0].stats.skillPower = 1.5;
    razor.allies[0].conduits = slots('spearwheel-engine');
    razor.enemies[0].stats.defense = 100;
    const revenge = act(razor, razor.allies[0].id, 'skill1', razor.enemies[0].id);
    expect(revenge.events.find(event => event.nativeKind === 'revenge')?.amount).toBe(damageAmount(150, 1, 90, false));
    const ember = fixture(), target = ember.enemies[0], owner = ember.allies[0];
    owner.stats.skillPower = 2;
    owner.native = { burns: { [target.id]: { damage: 50, turns: 3 } } };
    const detonation = act(ember, owner.id, 'skill2', target.id);
    expect(detonation.events.find(event => event.nativeKind === 'detonation')?.amount).toBe(100);
  });
});

describe('generated Master Shield provenance', () => {
  const cases: { master: MasterConduitId; character: StarterId; action?: ActionId;
    setup: (state: BattleState) => void; followup?: (state: BattleState) => void; amount: number }[] = [
    { master: 'master-atmoso-2', character: 'atmoso', action: 'skill1', amount: 150,
      setup: state => { state.allies[0].native = { cyclone: { gusts: 6, phases: 2, contributors: {} } }; } },
    { master: 'master-aurora-1', character: 'aurora', action: 'skill1', amount: 150,
      setup: state => { state.allies[1].hp = 100; },
      followup: state => {
        nativeIncomingMultiplier(state, state.enemies[0], state.allies[1], 'skill1', []);
        nativeEnemyCompleted(state, state.enemies[0], true, []);
      } },
    { master: 'master-thornia-2', character: 'thornia', action: 'ultimate', amount: 120,
      setup: () => {},
      followup: state => {
        const events: BattleEvent[] = [{ kind: 'damage', source: state.enemies[0].id,
          target: state.allies[1].id, amount: 1, critical: false, message: 'hit' }];
        nativeEnemyCompleted(state, state.enemies[0], true, events);
      } },
    { master: 'master-razor-2', character: 'razor', amount: 150,
      setup: state => { state.allies[0].native = { bastion: { throughPhase: 1, loss: 500 } }; },
      followup: state => { nativePhaseEnd(state, []); } },
    { master: 'master-crinso-2', character: 'crinso', action: 'skill1', amount: 120,
      setup: state => { state.allies[0].native = { edge: 'crimson', combo: 0 }; state.allies[1].hp = 100; } },
  ];
  it.each(cases)('$master follow-up cannot trigger source-Shield stats, extra Shields, reflection or native Gauge', entry => {
    const state = fixture([entry.character, 'tide', 'ember']), [owner] = state.allies;
    owner.masterConduit = entry.master;
    owner.stats.skillPower = 2;
    owner.conduits = slots('aegis-capacitor', 'aegis-return-spring', 'pale-bulwark-diadem', 'aquatic-leviathan-pump',
      'tidebound-reflector', 'oceanic-shared-tide-pump');
    entry.setup(state);
    const result = entry.action ? act(state, owner.id, entry.action, state.enemies[0].id).state : state;
    entry.followup?.(result);
    const recipient = result.allies[1];
    expect(recipient.shield).toBe(entry.amount);
    expect(recipient.conduitRuntime?.layers?.every(layer => !layer.native)).toBe(true);
    expect(effectiveDefense(result, result.allies[0])).toBe(100);
    expect(conduitCriticalBonus(result, recipient, result.enemies[0])).toBe(0);
    expect(prepareConduitAction(result, recipient, 'skill1', 25, false).skillPower).toBe(1);
    const gauge = result.allies[0].shatter;
    const enemyHp = result.enemies[1].hp;
    conduitIncoming(result, result.enemies[1], recipient, 1, false, false, []);
    expect(result.allies[0].shatter).toBe(gauge);
    expect(result.enemies[1].hp).toBe(enemyHp);
    expireNativeShields(result, []);
    expect(recipient.shield).toBe(0);
  });
});
