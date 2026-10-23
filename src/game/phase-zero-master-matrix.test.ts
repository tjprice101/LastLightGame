import { describe, expect, it, vi } from 'vitest';
import { masterConduits, type MasterConduitId } from '../content/master-conduits';
import { nativeBalance } from '../content/native-balance';
import { act, createBattle, type BattleState, type BattleEvent } from './battle';
import type { ActionId } from '../content/combat';
import {
  afterConduitBurn, conduitActionCost, conduitHitModifiers, conduitIncoming, effectiveDefense,
  expireNativeShields, gear, initializeConduits, nativeGauge,
  nativeShield, nativeTargetDefense, prepareConduitAction,
} from './conduit-runtime';
import {
  nativeAfterAction, nativeEnemyCompleted, nativeIncomingMultiplier, nativePhaseEnd, nativePrimaryHit,
  nativeRouteDamage, nativeTurnStart,
} from './native-kits';

vi.mock('../content/phase-zero-stats', async original => ({
  ...await original<typeof import('../content/phase-zero-stats')>(), phaseZeroStatsReady: true,
}));

type Check = (state: BattleState, equipped: boolean) => void;
const cast = (state: BattleState, action: ActionId, ally = false) =>
  act(state, state.allies[0].id, action, ally ? state.allies[1].id : state.enemies[0].id).state;
const next = (state: BattleState, action: ActionId = 'skill1') =>
  prepareConduitAction(state, state.allies[1], action, 25, false);
const modifiers = (state: BattleState) => conduitHitModifiers(state, state.allies[1], state.enemies[0], next(state), false);
const cost = (state: BattleState) => conduitActionCost(state.allies[1], 'skill1', state, 100);
const wound = (state: BattleState) => { for (const ally of state.allies.slice(1)) ally.hp = 100; };
const shieldLayers = (state: BattleState, target = 1) => state.allies[target].conduitRuntime?.layers ?? [];

// Each callback asserts a numerical native behavior both with and without its named Master.
const checks: Record<MasterConduitId, Check> = {
  'master-ember-1': (state, equipped) => {
    wound(state);
    afterConduitBurn(state, state.allies[0], state.enemies[0], 100, []);
    afterConduitBurn(state, state.allies[0], state.enemies[1], 100, []);
    nativePhaseEnd(state, []);
    expect(state.allies[1].hp).toBe(equipped ? 150 : 100);
    expect(state.allies[2].hp).toBe(100);
    nativePhaseEnd(state, []);
    expect(state.allies[1].hp).toBe(equipped ? 150 : 100);
  },
  'master-ember-2': (state, equipped) => {
    const owner = state.allies[0];
    owner.native = { burns: Object.fromEntries(state.enemies.map(enemy => [enemy.id, { turns: 3, damage: 10 }])) };
    for (const enemy of state.enemies) enemy.burn = { turns: 3, damage: 10, sourceId: owner.id, origin: 'native' };
    const result = cast(state, 'skill2');
    expect(result.allies[1].shatter).toBe(100);
    for (const burn of Object.values(result.allies[0].native!.burns!)) expect(burn.turns).toBe(1);
    const flare = cast(state, 'ultimate');
    expect(flare.enemies.filter(enemy => enemy.hp < 100000)).toHaveLength(equipped ? 1 : state.enemies.length);
    expect(flare.allies[0].stats).toMatchObject({ health: equipped ? 1550 : 1000,
      defense: equipped ? 165 : 100, skillPower: equipped ? 1.4 : 1 });
  },
  'master-ember-3': (state, equipped) => {
    const result = cast(state, 'ultimate');
    expect(modifiers(result).skillPowerBonus).toBeCloseTo(equipped ? .4 : 0);
    expect(modifiers(result).skillPowerBonus).toBe(0);
  },
  'master-tide-1': (state, equipped) => {
    nativeShield(state, state.allies[0], state.allies[1], 10, []);
    expect(effectiveDefense(state, state.allies[1])).toBe(100);
    expect(state.allies[0].stats.defense).toBe(equipped ? 180 : 100);
    expect(state.allies[0].stats.skillPower).toBe(equipped ? 1.45 : 1);
    expect(conduitActionCost(state.allies[0], 'skill1', state, 100)).toBe(equipped ? 65 : 100);
    conduitIncoming(state, state.enemies[0], state.allies[1], 100, false, false, []);
    expect(state.allies[1].hp).toBe(910);
    nativeShield(state, state.allies[0], state.allies[1], 10, []);
    conduitIncoming(state, state.enemies[0], state.allies[1], 100, false, false, []);
    expect(state.allies[1].hp).toBe(820);
  },
  'master-tide-2': (state, equipped) => {
    const wrong = cast(state, 'ultimate');
    expect(cost(wrong)).toBe(100);
    const result = cast(state, 'skill2', true);
    expect(result.allies[1].shield).toBeCloseTo(1000 * nativeBalance.tizu.shelter * (equipped ? 1.5 : 1));
    expect(cost(result)).toBe(equipped ? 75 : 100);
    next(result);
    expect(cost(result)).toBe(100);
  },
  'master-tide-3': (state, equipped) => {
    nativeShield(state, state.allies[0], state.allies[1], 100, []);
    state.enemies[0].weakened = 1;
    state.enemies[0].weakenSourceId = state.allies[0].id;
    expect(modifiers(state).pierce).toBe(equipped ? .25 : 0);
    expireNativeShields(state, []);
    state.allies[1].shield = 0;
    expect(modifiers(state).pierce).toBe(0);
  },
  'master-sprout-1': (state, equipped) => {
    state.allies[0].native = { seeds: { [state.allies[1].id]: { fraction: .1, dueRound: 1, empowered: true } } };
    nativeTurnStart(state, []);
    expect(cost(state)).toBe(equipped ? 85 : 100);
    expect(next(state).skillPower).toBe(equipped ? 1.25 : 1);
    expect(cost(state)).toBe(100);
    expect(next(state).skillPower).toBe(1);
  },
  'master-sprout-2': (state, equipped) => {
    state.allies[1].hp = 100;
    const result = cast(state, 'skill1'), seeds = result.allies[0].native!.seeds!;
    expect(Object.keys(seeds)).toHaveLength(equipped ? 3 : 1);
    expect(seeds[result.allies[1].id].fraction).toBeCloseTo(nativeBalance.flora.seed * (equipped ? 1.45 : 1));
  },
  'master-sprout-3': (state, equipped) => {
    state.allies[2].hp = 0;
    const result = cast(state, 'ultimate');
    expect(effectiveDefense(result, result.allies[1])).toBe(equipped ? 125 : 100);
    expect(result.allies[2].hp).toBe(equipped ? 350 : 0);
    if (equipped) {
      expect(result.allies[2].shatter).toBe(0);
      expect(result.allies[0].native?.seeds?.[result.allies[2].id]).toBeUndefined();
    }
  },
  'master-atmoso-1': (state, equipped) => {
    state.allies[0].native = { cyclone: { gusts: 8, phases: 2, contributors: {}, skillPower: 1 } };
    const result = cast(state, 'skill1');
    expect(result.allies[1].shatter).toBe(equipped ? 136 : 100);
    expect(result.allies[0].native?.cyclone).toBeUndefined();
  },
  'master-atmoso-2': (state, equipped) => {
    state.allies[0].native = { cyclone: { gusts: 6, phases: 2, contributors: {}, skillPower: 1 } };
    const result = cast(state, 'skill1');
    const shield = equipped ? Math.min(150, Math.round(state.enemies.length * 125 * .3)) : 0;
    expect(result.allies.map(ally => ally.shield)).toEqual([shield, shield, shield]);
    expect(shieldLayers(result).every(layer => !layer.native)).toBe(true);
    expireNativeShields(result, []);
    expect(result.allies[1].shield).toBe(0);
  },
  'master-atmoso-3': (state, equipped) => {
    state.allies[0].native = { cyclone: { gusts: 0, phases: 2, contributors: {} } };
    nativeAfterAction(state, state.allies[1], 'light', undefined, []);
    expect(state.allies[0].native.cyclone!.gusts).toBe(1);
    state.allies[1].shatter = 0;
    nativeGauge(state, state.allies[1], 20, []);
    expect(state.allies[1].shatter).toBe(equipped ? 26 : 20);
    state.round = 3;
    nativeGauge(state, state.allies[1], 20, []);
    expect(state.allies[1].shatter).toBe(equipped ? 46 : 40);
  },
  'master-aurora-1': (state, equipped) => {
    const result = cast(state, 'skill1'), enemy = result.enemies[0];
    result.allies[1].hp = 100;
    expect(nativeTargetDefense(result, enemy)).toBe(equipped ? 75 : 100);
    nativeIncomingMultiplier(result, enemy, result.allies[1], 'skill1', []);
    nativeEnemyCompleted(result, enemy, true, []);
    expect(result.allies[1].shield).toBe(equipped ? 263 : 0);
    expect(nativeTargetDefense(result, enemy)).toBe(100);
    expect(shieldLayers(result).every(layer => !layer.native)).toBe(true);
  },
  'master-aurora-2': (state, equipped) => {
    const result = cast(state, 'ultimate');
    expect(result.enemies[0].conduitRuntime?.numbers.judgmentThrough).toBeUndefined();
    expect(nativeIncomingMultiplier(result, result.enemies[0], result.allies[1], 'skill1', [])).toBe(equipped ? 0 : 1);
    nativePhaseEnd(result, []);
    expect(result.allies[1].shatter).toBe(equipped ? 116 : 100);
  },
  'master-aurora-3': (state, equipped) => {
    wound(state);
    const result = cast(state, 'skill1');
    nativeIncomingMultiplier(result, result.enemies[0], result.allies[1], 'skill1', []);
    expect(result.allies[1].hp).toBe(equipped ? 180 : 100);
    expect(result.allies[2].hp).toBe(equipped ? 180 : 100);
    nativeIncomingMultiplier(result, result.enemies[0], result.allies[2], 'skill1', []);
    expect(result.allies[1].hp).toBe(equipped ? 180 : 100);
  },
  'master-bliss-1': (state, equipped) => {
    const result = cast(state, 'skill2');
    expect(result.allies[1].attackBoost?.fraction).toBeCloseTo(equipped ? .17 : .1);
    expect(result.allies[1].shield).toBe(equipped ? 102 : 0);
    state.allies[1].spent = state.allies[2].spent = true;
    const closing = cast(state, 'skill2');
    expect(closing.allies[1].shield).toBe(equipped ? 102 : 60);
    expect(closing.allies[1].attackBoost?.fraction ?? 0).toBeCloseTo(equipped ? .17 : 0);
  },
  'master-bliss-2': (state, equipped) => {
    const result = cast(state, 'skill1');
    expect(next(result, 'light').criticalBonus).toBe(equipped ? .25 : 0);
    expect(next(result, 'light').criticalBonus).toBe(0);
    wound(state);
    state.allies[1].spent = state.allies[2].spent = true;
    const closing = cast(state, 'skill1');
    expect(closing.allies[1].hp).toBe(160);
    expect(closing.allies[2].hp).toBe(equipped ? 160 : 100);
  },
  'master-bliss-3': (state, equipped) => {
    state.allies[1].spent = state.allies[2].spent = true;
    const wrong = cast(state, 'skill2');
    expect(cost(wrong)).toBe(100);
    const result = cast(state, 'ultimate');
    expect(cost(result)).toBe(equipped ? 75 : 100);
    expect(next(result).skillDuration).toBe(equipped ? 1 : 0);
    expect(cost(result)).toBe(100);
  },
  'master-bruno-1': (state, equipped) => {
    const result = cast(state, 'skill2', true), [owner, recipient] = result.allies;
    expect(effectiveDefense(result, owner)).toBe(equipped ? 195 : 100);
    nativeRouteDamage(result, result.enemies[0], recipient, 100, [], () => {});
    expect(next(result).skillPower).toBe(equipped ? 1.3 : 1);
    expect(next(result).skillPower).toBe(1);
  },
  'master-bruno-2': (state, equipped) => {
    const result = cast(state, 'ultimate');
    expect(result.allies[0].shield).toBe(equipped ? 618.75 : 300);
    result.allies[1].shatter = 0;
    nativeGauge(result, result.allies[1], 20, []);
    expect(result.allies[1].shatter).toBe(equipped ? 25 : 20);
  },
  'master-bruno-3': (state, equipped) => {
    const result = cast(state, 'skill1');
    expect(nativeTargetDefense(result, result.enemies[0])).toBe(equipped ? 75 : 100);
    result.allies[0].native = { cover: { fraction: .5, targets: [result.allies[1].id], throughPhase: 1 } };
    expect(modifiers(result).attack).toBe(equipped ? 125 : 100);
    result.round = 3;
    expect(nativeTargetDefense(result, result.enemies[0])).toBe(100);
    expect(modifiers(result).attack).toBe(100);
  },
  'master-disciple-1': (state, equipped) => {
    const result = act(state, state.allies[0].id, 'skill2', state.allies[2].id).state, recipient = result.allies[2];
    const instruction = recipient.native!.instruction!;
    expect(instruction.throughRound).toBe(equipped ? 4 : 2);
    nativeAfterAction(result, recipient, 'light', instruction, []);
    expect(!!recipient.native?.instruction).toBe(equipped);
    if (equipped) {
      nativeAfterAction(result, recipient, 'skill2', instruction, []);
      expect(recipient.native?.instruction).toBeUndefined();
    }
  },
  'master-disciple-2': (state, equipped) => {
    const result = cast(state, 'ultimate'), recipient = result.allies[1];
    nativeAfterAction(result, recipient, 'skill1', recipient.native?.instruction, []);
    expect(result.allies[2].shatter).toBe(equipped ? 120 : 100);
    nativeAfterAction(result, recipient, 'skill1', undefined, []);
    expect(result.allies[2].shatter).toBe(equipped ? 120 : 100);
  },
  'master-disciple-3': (state, equipped) => {
    const result = cast(state, 'skill1', true);
    expect(next(result, 'light').criticalBonus).toBe(equipped ? .3 : 0);
    expect(next(result, 'light').criticalDamageBonus).toBe(equipped ? .4 : 0);
  },
  'master-elise-1': (state, equipped) => {
    state.allies[0].native = { blades: [state.enemies[0].id, state.enemies[0].id] };
    expect(nativeTargetDefense(state, state.enemies[0])).toBe(equipped ? 70 : 100);
    const result = cast(state, 'skill2');
    expect(nativeTargetDefense(result, result.enemies[0])).toBe(100);
  },
  'master-elise-2': (state, equipped) => {
    const result = cast(state, 'skill1');
    const ctx = next(result);
    expect(conduitHitModifiers(result, result.allies[1], result.enemies[0], ctx, false).skillPowerBonus).toBe(equipped ? .35 : 0);
    expect(conduitHitModifiers(result, result.allies[1], result.enemies[0], ctx, false).skillPowerBonus).toBe(equipped ? .35 : 0);
    expect(modifiers(result).skillPowerBonus).toBe(0);
  },
  'master-elise-3': (state, equipped) => {
    state.allies[0].native = { blades: [state.enemies[0].id, state.enemies[0].id] };
    const result = cast(state, 'skill2'), ctx = next(result, 'light');
    expect(ctx.criticalBonus).toBe(equipped ? .15 : 0);
    expect(ctx.criticalDamageBonus).toBe(equipped ? .4 : 0);
    expect(next(result, 'light').criticalDamageBonus).toBe(0);
  },
  'master-razor-1': (state, equipped) => {
    wound(state);
    state.allies[0].native = { wounds: 1000 };
    const wrong = cast(state, 'skill1');
    expect(wrong.allies[1].hp).toBe(100);
    const result = cast(state, 'ultimate');
    expect(result.allies[1].hp).toBe(equipped ? 250 : 100);
    expect(result.allies[2].hp).toBe(equipped ? 250 : 100);
  },
  'master-razor-2': (state, equipped) => {
    state.allies[0].native = { bastion: { throughPhase: 1, loss: 500 } };
    nativePhaseEnd(state, []);
    expect(state.allies[0].shield).toBe(500);
    expect(state.allies[1].shield).toBe(equipped ? 200 : 0);
    expect(shieldLayers(state).every(layer => !layer.native)).toBe(true);
  },
  'master-razor-3': (state, equipped) => {
    state.allies[0].native = { wounds: 10 };
    const wrong = cast(state, 'ultimate');
    expect(next(wrong, 'light').criticalBonus).toBe(0);
    const result = cast(state, 'skill1');
    expect(next(result, 'light').criticalBonus).toBe(equipped ? .3 : 0);
    expect(next(result, 'light').criticalBonus).toBe(0);
  },
  'master-rosetta-1': (state, equipped) => {
    const [owner, first, second] = state.allies, target = state.enemies[0];
    owner.native = { quarry: { target: target.id, round: 1, contributors: [] } };
    nativePrimaryHit(state, first, target, true, []);
    nativePrimaryHit(state, first, target, true, []);
    expect(first.shatter).toBe(equipped ? 124 : 100);
    nativePrimaryHit(state, second, target, true, []);
    expect(first.shield).toBe(80);
    expect(second.shield).toBe(80);
    expect(first.shatter).toBe(equipped ? 124 : 100);
    expect(second.shatter).toBe(equipped ? 124 : 100);
    nativePrimaryHit(state, owner, target, true, []);
    expect(owner.shatter).toBe(equipped ? 148 : 100);
    expect(first.shatter).toBe(equipped ? 148 : 100);
  },
  'master-rosetta-2': (state, equipped) => {
    wound(state);
    state.allies[0].native = { quarry: { target: state.enemies[0].id, round: 1, contributors: [state.allies[1].id] } };
    const result = cast(state, 'ultimate');
    // Rosetta becomes the second contributor: native 15% heal plus the independent Master heal.
    expect(result.allies[1].hp).toBe(equipped ? 330 : 250);
    expect(result.allies[2].hp).toBe(100);
    expect(cost(result)).toBe(equipped ? 80 : 100);
  },
  'master-rosetta-3': (state, equipped) => {
    state.allies[0].native = { quarry: { target: state.enemies[0].id, round: 1, contributors: [] } };
    const wrong = cast(state, 'ultimate');
    expect(modifiers(wrong).skillPowerBonus).toBe(0);
    const result = cast(state, 'skill2');
    expect(modifiers(result).skillPowerBonus).toBe(equipped ? .35 : 0);
    expect(modifiers(result).skillPowerBonus).toBe(0);
  },
  'master-thornia-1': (state, equipped) => {
    const result = cast(state, 'skill1');
    nativeEnemyCompleted(result, result.enemies[0], true, []);
    expect(nativeTargetDefense(result, result.enemies[0])).toBe(equipped ? 80 : 100);
    result.round = 3;
    expect(nativeTargetDefense(result, result.enemies[0])).toBe(100);
  },
  'master-thornia-2': (state, equipped) => {
    const result = cast(state, 'ultimate');
    const enemy = result.enemies[0], recipient = result.allies[1];
    const events: BattleEvent[] = [{ kind: 'damage', source: enemy.id, target: recipient.id, amount: 1, critical: false, message: 'hit' }];
    nativeEnemyCompleted(result, enemy, true, events);
    expect(recipient.shield).toBe(equipped ? 120 : 0);
    expect(shieldLayers(result).every(layer => !layer.native)).toBe(true);
    nativeEnemyCompleted(result, enemy, true, events);
    expect(recipient.shield).toBe(equipped ? 120 : 0);
  },
  'master-thornia-3': (state, equipped) => {
    const result = cast(state, 'skill1');
    const [owner, recipient] = result.allies, enemy = result.enemies[0];
    conduitIncoming(result, enemy, recipient, 100, false, false, []);
    expect(recipient.hp).toBe(equipped ? 915 : 900);
    nativeEnemyCompleted(result, enemy, true, []);
    expect(prepareConduitAction(result, owner, 'skill1', 25, false).skillPower).toBe(equipped ? 1.65 : 1);
    expect(prepareConduitAction(result, owner, 'skill1', 25, false).skillPower).toBe(equipped ? 1.45 : 1);
  },
  'master-crinso-1': (state, equipped) => {
    state.allies[0].native = { combo: 9 };
    const result = cast(state, 'ultimate');
    expect(next(result, 'light').criticalDamageBonus).toBe(equipped ? .6 : 0);
    expect(next(result, 'light').criticalDamageBonus).toBe(0);
  },
  'master-crinso-2': (state, equipped) => {
    wound(state);
    state.allies[0].native = { edge: 'crimson', combo: 1 };
    const result = cast(state, 'skill1');
    expect(result.allies[1].shield).toBe(equipped ? 120 : 0);
    expect(shieldLayers(result).every(layer => !layer.native)).toBe(true);
    expireNativeShields(result, []);
    expect(result.allies[1].shield).toBe(0);
  },
  'master-crinso-3': (state, equipped) => {
    wound(state);
    state.allies[0].native = { edge: 'crimson', combo: 0 };
    const result = cast(state, 'skill1');
    expect(result.allies[1].hp).toBe(equipped ? 180 : 100);
    expect(result.allies[2].hp).toBe(100);
    state.allies[0].hp = 100;
    state.allies[0].native.combo = 2;
    const third = cast(state, 'skill1');
    expect(third.allies.map(ally => ally.hp)).toEqual(equipped ? [180, 180, 180] : [100, 100, 100]);
  },
  'master-nerithe-1': (state, equipped) => {
    state.allies[0].native = { survey: { target: state.enemies[0].id, points: 8 } };
    gear(state.enemies[0]).owners.chart = state.allies[0].id;
    expect(modifiers(state).pierce).toBe(equipped ? .4 : 0);
    expect(state.allies[0].native.survey!.points).toBe(8);
    const moved = act(state, state.allies[0].id, 'skill2', state.enemies[1].id).state;
    expect(modifiers(moved).pierce).toBe(0);
    expect(conduitHitModifiers(moved, moved.allies[1], moved.enemies[1], next(moved), false).pierce).toBe(equipped ? .4 : 0);
  },
  'master-nerithe-2': (state, equipped) => {
    state.allies[0].native = { survey: { target: state.enemies[1].id, points: 2 } };
    const result = cast(state, 'skill2');
    expect(result.allies[0].native?.survey?.target).toBe(state.enemies[0].id);
    expect(result.enemies.every(enemy => enemy.hp < state.enemies.find(prior => prior.id === enemy.id)!.hp)).toBe(true);
    expect(modifiers(result).skillPowerBonus).toBe(equipped ? .4 : 0);
    expect(modifiers(result).skillPowerBonus).toBe(0);
  },
  'master-nerithe-3': (state, equipped) => {
    state.allies[0].native = { survey: { target: state.enemies[0].id, points: 7 } };
    const wrong = cast(state, 'skill1');
    expect(wrong.allies[1].shatter).toBe(100);
    const result = cast(state, 'ultimate');
    expect(result.allies[1].shatter).toBe(equipped ? 140 : 100);
    expect(result.allies[0].recoverThrough).toBe(2);
  },
  'master-orvella-1': (state, equipped) => {
    state.allies[0].native = { foundation: { durability: 500, maximum: 500, throughPhase: 3 } };
    const result = cast(state, 'ultimate');
    expect(result.allies[0].native?.foundation?.durability ?? 0).toBe(equipped ? 200 : 0);
    expect(cost(result)).toBe(equipped ? 80 : 100);
  },
  'master-orvella-2': (state, equipped) => {
    wound(state);
    state.allies[0].native = { foundation: { durability: 500, maximum: 500, throughPhase: 3 } };
    nativeRouteDamage(state, state.enemies[0], state.allies[1], 1000, [], () => {});
    expect(state.allies[1].hp).toBe(100);
    state.round++;
    nativeTurnStart(state, []);
    expect(state.allies[1].hp).toBe(equipped ? 127 : 100);
    expect(state.allies[2].hp).toBe(equipped ? 127 : 100);
  },
  'master-orvella-3': (state, equipped) => {
    state.allies[0].native = { foundation: { durability: 500, maximum: 500, throughPhase: 3 } };
    expect(effectiveDefense(state, state.allies[1])).toBe(equipped ? 125 : 100);
    const result = cast(state, 'skill1');
    expect(result.allies[0].native?.foundation?.durability).toBe(equipped ? 662 : 580);
    expect(prepareConduitAction(state, state.allies[0], 'skill1', 25, false).skillPower).toBe(1);
  },
  'master-vaelor-1': (state, equipped) => {
    state.allies[0].native = { beat: 2 };
    const result = cast(state, 'ultimate');
    expect(next(result).skillPower).toBe(equipped ? 1.6 : 1);
    expect(next(result).skillPower).toBe(1);
  },
  'master-vaelor-2': (state, equipped) => {
    state.allies[0].native = { beat: 1 };
    const result = cast(state, 'skill2');
    expect(result.allies[1].attackBoost?.fraction ?? 0).toBe(equipped ? .2 : 0);
    result.allies[1].shatter = 0;
    nativeGauge(result, result.allies[1], 20, []);
    expect(result.allies[1].shatter).toBe(equipped ? 24 : 20);
    state.allies[0].stats.skillPower = 1.5;
    state.allies[0].stats.skillDuration = 2;
    if (state.allies[0].conduitRuntime?.statBase) {
      state.allies[0].conduitRuntime.statBase.skillPower = 1.5;
      state.allies[0].conduitRuntime.statBase.skillDuration = 2;
    }
    const powered = cast(state, 'skill2');
    expect(powered.allies[1].attackBoost?.fraction ?? 0).toBeCloseTo(equipped ? .3 : 0);
    if (equipped) {
      expect(powered.allies[1].attackBoost?.throughRound).toBe(4);
      powered.round = 4;
      powered.allies[1].shatter = 0;
      nativeGauge(powered, powered.allies[1], 20, []);
      expect(powered.allies[1].shatter).toBe(24);
    }
  },
  'master-vaelor-3': (state, equipped) => {
    state.allies[0].native = { beat: 0 };
    const tune = cast(state, 'light');
    expect(next(tune, 'light').criticalBonus).toBe(equipped ? .25 : 0);
    state.allies[0].native.beat = 2;
    const crescendo = cast(state, 'light');
    expect(next(crescendo, 'light').criticalDamageBonus).toBe(equipped ? .4 : 0);
  },
};

describe('48-entry Master behavior matrix', () => {
  it('has exactly one concrete behavior scenario per installed Master', () => {
    expect(Object.keys(checks).sort()).toEqual(masterConduits.map(entry => entry.id).sort());
  });
  for (const entry of masterConduits) describe(entry.id, () => {
    it.each([false, true])('checks equipped=%s against its absent baseline', equipped => {
      const roster = [entry.character, ...(['ember', 'tide', 'sprout'] as const)
        .filter(id => id !== entry.character).slice(0, 2)];
      const state = createBattle(1729, roster);
      for (const unit of [...state.allies, ...state.enemies]) {
        unit.stats = { ...unit.stats, health: 1000, damage: 100, defense: 100, crit: 0, critMultiplier: 1.5,
          shatterCapacity: 200, skillPower: 1, skillDuration: 0, skillEfficiency: 0, gaugeGain: 1 };
        unit.hp = 1000; unit.shatter = 100;
      }
      for (const enemy of state.enemies) { enemy.hp = 100000; enemy.stats.health = 100000; }
      if (equipped) state.allies[0].masterConduit = entry.id;
      initializeConduits(state);
      checks[entry.id](state, equipped);
    });
  });
});
