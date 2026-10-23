import { calamiticPower, type CalamiticConduitId } from '../content/calamitic-conduits';
import type { ActionId } from '../content/combat';
import type { BattleEvent, BattleState, Combatant } from './battle';
import { equipped, gear, generatedGauge, generatedStrike } from './conduit-runtime';
import { phaseZeroStatsReady } from '../content/phase-zero-stats';

function power(state: BattleState, owner: Combatant, id: CalamiticConduitId, base: number, maximum: number): number {
  return calamiticPower(state.conduitUpgrades?.[id] ?? 0, base, maximum);
}

function status(owner: Combatant, amount: number, message: string, events: BattleEvent[]): void {
  events.push({ kind: 'status', source: owner.id, target: owner.id, amount, critical: false, origin: 'conduit', message });
}

export function calamiticActionReason(state: BattleState, owner: Combatant, action: ActionId): string | null {
  const n = owner.conduitRuntime?.numbers;
  if (phaseZeroStatsReady) {
    return n?.calamiticThroneExtra === state.round && action !== 'skill1' && action !== 'skill2'
      ? 'The Throne grants one ordinary skill action this turn.' : null;
  }
  if (n?.calamiticThroneSkip === state.round) return 'Tomorrow is owed to the Throne; cannot act this turn.';
  if (n?.calamiticThroneArmed === state.round && (action === 'ultimate' || action === 'light')) {
    return 'The borrowed action must be an available ordinary skill.';
  }

  return null;
}

export function calamiticExtraActionAvailable(state: BattleState, owner: Combatant, action: ActionId): boolean {
  return phaseZeroStatsReady && (action === 'skill1' || action === 'skill2') &&
    owner.conduitRuntime?.numbers.calamiticThroneExtra === state.round &&
    owner.conduitRuntime?.numbers.extraActionSpent !== state.round &&
    owner.recoverThrough < state.round && owner.hp > 0;
}

export function calamiticNoLastFlareRecovery(owner: Combatant): boolean {
  return phaseZeroStatsReady && equipped(owner, 'calamitic-causality-funeral-engine');
}

export function calamiticSkillPowerBonus(_state: BattleState): number {
  return 0;
}

export function calamiticSkillEfficiencyBonus(_state: BattleState): number {
  return 0;
}

export function prepareCalamiticAction(state: BattleState, owner: Combatant, action: ActionId): boolean {
  if (phaseZeroStatsReady) {
    if (owner.conduitRuntime?.numbers.calamiticThroneExtra !== state.round) return false;
    delete gear(owner).numbers.calamiticThroneExtra;
    gear(owner).numbers.calamiticThroneSpent = state.round;
    gear(owner).numbers.extraActionSpent = state.round;
    return false;
  }
  if (!equipped(owner, 'calamitic-throne-borrowed-tomorrows')) return false;
  const n = gear(owner).numbers;
  if (n.calamiticThroneArmed === state.round && action !== 'light') {
    delete n.calamiticThroneArmed;
    n.calamiticThroneSkip = state.round + 1;
    n.calamiticThroneGrant = state.round;
    return false;
  }
  if (action === 'light' && n.calamiticThroneUsed !== state.round && n.calamiticThroneSkip !== state.round + 1) {
    n.calamiticThroneArmed = state.round;
    n.calamiticThroneUsed = state.round;
    return true;
  }
  return false;
}

export function afterCalamiticAction(state: BattleState, owner: Combatant, action: ActionId, events: BattleEvent[], _skillDamage = 0): void {
  if (owner.hp <= 0) return;
  if (phaseZeroStatsReady) {
    if (equipped(owner, 'calamitic-throne-borrowed-tomorrows') && action === 'ultimate' &&
        gear(owner).numbers.extraActionSpent !== state.round) {
      for (const ally of state.allies) {
        if (ally.id === owner.id || ally.hp <= 0 || !ally.spent || ally.recoverThrough >= state.round) continue;
        const n = gear(ally).numbers;
        if (n.extraActionGranted === state.round || n.extraActionSpent === state.round) continue;
        n.extraActionGranted = state.round;
        n.calamiticThroneGranted = state.round;
        n.calamiticThroneExtra = state.round;
        status(owner, 1, `${ally.name} may take one additional Skill 1 or Skill 2 this turn.`, events);
      }
    }
    return;
  }
  const n = gear(owner).numbers;
  if (n.calamiticThroneArmed === state.round && action === 'light') {
    status(owner, 1, `${owner.name} may borrow one ordinary skill; using it costs the next player turn.`, events);
  }
  if (n.calamiticThroneGrant === state.round) {
    delete n.calamiticThroneGrant;
    generatedGauge(owner, owner, power(state, owner, 'calamitic-throne-borrowed-tomorrows', 10, 30), events);
    status(owner, state.round + 1, `${owner.name} borrowed tomorrow and cannot act on turn ${state.round + 1}.`, events);
  }
  if (action === 'light' && equipped(owner, 'calamitic-world-eater-orrery') && (n.calamiticOrrery ?? 0) > 0) {
    const reserve = n.calamiticOrrery;
    n.calamiticOrrery = 0;
    const target = state.enemies.filter(enemy => enemy.hp > 0).sort((a, b) => b.hp - a.hp)[0];
    status(owner, reserve, `${owner.name}'s World-Eater's Orrery releases ${Math.round(reserve)} stored force.`, events);
    generatedStrike(state, owner, target, reserve, events, false);
  }
  if (equipped(owner, 'calamitic-cathedral-final-equation')) {
    const bit = 1 << (['light', 'skill1', 'skill2', 'ultimate'] as const).indexOf(action);
    const previous = n.calamiticEquation ?? 0;
    const mask = previous & bit ? bit : previous | bit;
    const count = mask.toString(2).replace(/0/g, '').length;
    n.calamiticEquation = count === 3 ? 0 : mask;
    status(owner, count, `${owner.name}'s Final Equation: ${count} / 3 different actions${count === 3 ? '  Edischarge' : ''}.`, events);
    if (count === 3) {
      const targets = state.enemies.filter(enemy => enemy.hp > 0);
      const offer = owner.stats.damage * power(state, owner, 'calamitic-cathedral-final-equation', 1.2, 2.4);
      for (const target of targets) generatedStrike(state, owner, target, offer / targets.length, events, false);
    }
  }
}

export function calamiticShieldBypass(state: BattleState, owner: Combatant, action: ActionId = 'light'): number {
  if (phaseZeroStatsReady) return calamiticSkillShieldBypass(state, owner, action);
  return equipped(owner, 'calamitic-horizon-cleaving-godpress')
    ? power(state, owner, 'calamitic-horizon-cleaving-godpress', .4, .6) : 0;
}

export function calamiticSiegeBonus(state: BattleState, owner: Combatant, target: Combatant): number {
  return !phaseZeroStatsReady && target.shield > 0 && equipped(owner, 'calamitic-horizon-cleaving-godpress')
    ? power(state, owner, 'calamitic-horizon-cleaving-godpress', .3, .6) : 0;
}

export function calamiticSkillDefenseIgnore(state: BattleState, owner: Combatant, action: ActionId): number {
  return phaseZeroStatsReady && action !== 'light' && equipped(owner, 'calamitic-horizon-cleaving-godpress')
    ? power(state, owner, 'calamitic-horizon-cleaving-godpress', .55, .825) : 0;
}

export function calamiticSkillShieldBypass(_state: BattleState, _owner: Combatant, _action: ActionId): number {
  return 0;
}

export function deferCalamiticDamage(state: BattleState, owner: Combatant, offered: number, events: BattleEvent[]): number {
  if (phaseZeroStatsReady) return offered;
  if (offered <= 0 || !equipped(owner, 'calamitic-causality-funeral-engine')) return offered;
  const n = gear(owner).numbers;
  const deferredOffer = offered * power(state, owner, 'calamitic-causality-funeral-engine', .4, .6);
  const deferred = Math.floor(deferredOffer + Number.EPSILON * Math.max(1, Math.abs(deferredOffer)));
  if (deferred <= 0) return offered;
  n.calamiticDebt = (n.calamiticDebt ?? 0) + deferred;
  n.calamiticDebtDue = state.round + 1;
  status(owner, deferred, `${owner.name}'s Funeral Engine defers ${deferred} HP damage until Enemy Turn ${state.round + 1}.`, events);
  return Math.max(0, offered - deferred);
}

export function bankCalamiticDamage(state: BattleState, loss: number): void {
  if (phaseZeroStatsReady) return;
  if (loss <= 0) return;
  for (const owner of state.allies.filter(ally => ally.hp > 0 && equipped(ally, 'calamitic-world-eater-orrery'))) {
    const n = gear(owner).numbers;
    n.calamiticOrrery = (n.calamiticOrrery ?? 0) + loss * power(state, owner, 'calamitic-world-eater-orrery', .4, .8);
  }
}

export function settleCalamiticDebt(state: BattleState, events: BattleEvent[]): void {
  if (phaseZeroStatsReady) return;
  for (const owner of state.allies) {
    const n = owner.conduitRuntime?.numbers;
    if (!n || !n.calamiticDebt || n.calamiticDebtDue > state.round) continue;
    const debt = n.calamiticDebt;
    delete n.calamiticDebt;
    delete n.calamiticDebtDue;
    if (owner.hp <= 0) continue;
    const loss = Math.min(owner.hp, debt);
    owner.hp -= loss;
    events.push({ kind: 'damage', source: owner.id, target: owner.id, amount: loss, critical: false,
      origin: 'conduit', periodic: true, shieldRemaining: owner.shield,
      message: `${owner.name} pays ${loss} HP to the Funeral Engine${owner.hp === 0 ? '  Edefeated' : ''}.` });
  }
}
