import type { ActionId } from '../content/combat';
import { actionUnavailable, actAndAdvanceTurn, endTurn, type BattleState, type Combatant } from './battle';

export function benchmarkTarget(state: BattleState, actor: Combatant, action: ActionId): string {
  if (action !== 'light' && action !== 'defend' && actor.kit?.abilities[action].targets === 'one-ally') {
    const exclude = actor.kit.abilities[action].excludeSelf && state.allies.filter(unit => unit.hp > 0).length > 1;
    const candidates = state.allies.filter(unit => unit.hp > 0 && (!exclude || unit.id !== actor.id));
    if (actor.definitionId === 'disciple' && action === 'skill1')
      return [...candidates].sort((a, b) => Number(a.spent) - Number(b.spent) || b.stats.damage - a.stats.damage)[0].id;
    return [...candidates].sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0].id;
  }
  const enemy = state.enemies.find(unit => unit.hp > 0);
  if (!enemy) throw new Error('Benchmark has no living target.');
  return enemy.id;
}

export function benchmarkPriorities(state: BattleState, actor: Combatant): ActionId[] {
  const injured = state.allies.some(unit => unit.hp > 0 && unit.hp < unit.stats.health * .9);
  const target = state.enemies.find(unit => unit.hp > 0);
  switch (actor.definitionId) {
    case 'ember':
      if (state.enemies.filter(unit => unit.hp > 0).length > 1) return ['ultimate', 'skill2', 'skill1', 'light'];
      return target && (actor.native?.burns?.[target.id]?.turns ?? 0) > 0
        ? ['ultimate', 'light', 'skill2'] : ['ultimate', 'skill1', 'light'];
    case 'tide':
      if (actor.masterConduit === 'master-tide-3') return (target?.weakened ?? 0) <= 0
        ? ['skill1', 'light'] : actor.hp < actor.stats.health * .75 ? ['skill2', 'ultimate', 'light'] : ['ultimate', 'light'];
      return state.round % 2 === 0 && (target?.weakened ?? 0) === 0
        ? ['ultimate', 'skill1', 'light'] : ['ultimate', 'light'];
    case 'sprout': {
      const pending = Object.keys(actor.native?.seeds ?? {}).length > 0;
      return state.allies.some(unit => unit.hp <= 0) && actor.masterConduit === 'master-sprout-3'
        ? ['ultimate', 'skill2', 'light']
        : injured ? pending ? ['ultimate', 'skill2', 'light'] : ['skill2', 'light'] : ['skill1', 'light'];
    }
    case 'thornia': {
      const trap = target && actor.native?.traps?.[target.id];
      return !trap || trap.charges <= 0 || trap.throughPhase < state.round
        ? ['ultimate', 'skill1', 'light'] : ['ultimate', 'skill2', 'light'];
    }
    case 'crinso': return ['ultimate', actor.native?.edge === 'gold' ? 'skill2' : 'skill1', 'light'];
    case 'atmoso': return actor.native?.cyclone ? ['ultimate', 'light'] : ['skill2', 'skill1', 'light'];
    case 'elise': return actor.native?.blades?.every(id => id !== null) ? ['ultimate', 'skill2', 'light'] : ['ultimate', 'skill1', 'light'];
    case 'bruno': return injured && state.allies.length > 1 ? ['skill2', 'skill1', 'light'] : ['skill1', 'light'];
    case 'disciple': return injured ? ['ultimate', 'skill2', 'skill1', 'light'] : ['ultimate', 'skill1', 'light'];
    case 'aurora': return state.round % 6 === 0 ? ['ultimate', 'skill1', 'light'] : state.round % 2 === 0 ? ['skill1', 'light'] : ['skill2', 'light'];
    case 'razor': return ['ultimate', 'skill1', 'light'];
    case 'rosetta': return actor.native?.quarry ? ['ultimate', 'skill2', 'light'] : ['skill1', 'light'];
    case 'nerithe': return ['ultimate', 'skill1', 'light'];
    case 'orvella': return actor.native?.foundation ? ['skill1', 'light'] : ['skill2', 'light'];
    case 'vaelor': return actor.native?.beat === 2 ? ['ultimate', 'skill1', 'light'] : actor.native?.beat === 1 ? ['skill2', 'light'] : ['skill1', 'light'];
    default: return ['ultimate', 'skill1', 'skill2', 'light'];
  }
}

export function playNativeBenchmark(initial: BattleState, steps = 1800): BattleState {
  let state = initial;
  for (let step = 0; state.phase === 'player' && step < steps; step++) {
    const ready = state.allies.filter(unit => unit.hp > 0 && !actionUnavailable(state, unit, 'light'));
    const actor = ready.find(unit => unit.definitionId !== 'rosetta' || !unit.native?.quarry) ?? ready[0];
    if (!actor) { state = endTurn(state).state; continue; }
    const action = benchmarkPriorities(state, actor).find(id => !actionUnavailable(state, actor, id));
    if (!action) throw new Error('Benchmark has no legal action.');
    state = actAndAdvanceTurn(state, actor.id, action, benchmarkTarget(state, actor, action)).state;
  }
  return state;
}
