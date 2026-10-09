import { getConduit } from '../content/conduits';
import type { ConduitKitEffects } from '../content/conduit-kit';
import type { ActionId } from '../content/combat';
import type { BattleEvent, BattleState, Combatant } from './battle';

export function kitEffects(actor: Combatant): readonly ConduitKitEffects[] {
  return (actor.conduits ?? []).flatMap((id) => {
    if (id === null) return [];
    const conduit = getConduit(id);
    return 'kitEffects' in conduit ? [conduit.kitEffects] : [];
  });
}

export function kitSum(actor: Combatant, key: Exclude<keyof ConduitKitEffects, 'damage'>): number {
  return kitEffects(actor).reduce((sum, effects) => sum + (effects[key] ?? 0), 0);
}

export function kitHealingMultiplier(actor: Combatant): number {
  const bonus = kitSum(actor, 'healing') + (actor.hp <= actor.stats.health / 2 ? kitSum(actor, 'healingBelowHalf') : 0);
  return 1 + Math.min(.75, bonus);
}

export function kitDamageBonus(actor: Combatant, target: Combatant, action: ActionId): number {
  return kitEffects(actor).reduce((bonus, effects) => bonus + (effects.damage ?? []).reduce((sum, rule) => {
    const applies = rule.actions.includes(action) && (!rule.condition ||
      rule.condition === 'burning' && target.burn.turns > 0 ||
      rule.condition === 'weakened' && target.weakened > 0 ||
      rule.condition === 'shielded' && actor.shield > 0);
    return sum + (applies ? rule.bonus : 0);
  }, 0), 0);
}

export function kitActivationBonus(state: BattleState, actor: Combatant, action: ActionId, support: boolean, events: BattleEvent[]): number {
  let bonus = action === 'ultimate' ? Math.min(.18, state.enemies.filter((enemy) => enemy.hp > 0 && enemy.burn.turns > 0).length * kitSum(actor, 'ultimateBurnBonus')) : 0;
  if (!support && (action === 'skill1' || action === 'skill2') && actor.conduitCharges?.graftCovenant) {
    bonus += kitSum(actor, 'healedSkillCharge');
    delete actor.conduitCharges.graftCovenant;
    events.push({ kind: 'status', source: actor.id, target: actor.id, amount: 15, critical: false,
      message: `${actor.name} spends Graft Covenant: this damaging skill gains +15% outgoing damage.` });
  }
  return bonus;
}

export interface KitActivationResult {
  gauges: { target: Combatant; amount: number }[];
}

export function kitAfterActivation(state: BattleState, actor: Combatant, action: ActionId, hitWeakened: boolean, events: BattleEvent[]): KitActivationResult {
  const gauges: KitActivationResult['gauges'] = [];
  const own = events.filter((entry) => entry.source === actor.id);
  const healed = own.some((entry) => entry.kind === 'heal' && entry.amount > 0);
  const shielded = own.filter((entry) => entry.kind === 'shield' && entry.amount > 0);
  const add = (target: Combatant, amount: number): void => {
    if (amount > 0 && target.hp > 0) gauges.push({ target, amount });
  };
  if (healed) add(actor, kitSum(actor, 'healGauge'));
  if (shielded.length) add(actor, kitSum(actor, 'shieldGauge'));
  for (const id of new Set(shielded.map((entry) => entry.target))) {
    const recipient = state.allies.find((ally) => ally.id === id);
    if (recipient) add(recipient, kitSum(actor, 'shieldRecipientGauge'));
  }
  const skill = action === 'skill1' || action === 'skill2';
  const hit = own.some((entry) => entry.kind === 'damage' && !entry.periodic && state.enemies.some((enemy) => enemy.id === entry.target));
  if (skill && hit && hitWeakened) add(actor, kitSum(actor, 'weakenedSkillGauge'));
  if (skill && hit && own.some((entry) => entry.kind === 'damage' && !entry.periodic && entry.critical) &&
      kitSum(actor, 'criticalCooldown') > 0 && actor.conduitCharges?.kitCooldownRound !== state.round) {
    const previous = actor.readyRound[action];
    actor.readyRound[action] = Math.min(previous, Math.max(state.round + 1, previous - Math.min(1, kitSum(actor, 'criticalCooldown'))));
    if (actor.readyRound[action] < previous) {
      actor.conduitCharges = { ...actor.conduitCharges, kitCooldownRound: state.round };
      events.push({ kind: 'status', source: actor.id, target: actor.id, amount: 1, critical: false,
        message: `${actor.name}'s Storm Clock shortens this skill's cooldown by one turn (once per round; never before next round).` });
    }
  }
  if (kitSum(actor, 'healedSkillCharge') > 0 && own.some((entry) => entry.kind === 'heal' && entry.amount > 0 && entry.target !== actor.id)) {
    actor.conduitCharges = { ...actor.conduitCharges, graftCovenant: true };
    events.push({ kind: 'status', source: actor.id, target: actor.id, amount: 15, critical: false,
      message: `${actor.name} primes Graft Covenant: next damaging ordinary skill gains +15% outgoing damage (refresh; one charge).` });
  }
  return { gauges };
}
