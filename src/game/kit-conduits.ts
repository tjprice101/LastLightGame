import { getConduit } from '../content/conduits';
import type { OmnicOutcome, OmnicRecipient, OmnicRule, OmnicTrigger } from '../content/conduit-kit';
import type { ActionId } from '../content/combat';
import type { KitPilotResourceKey } from '../content/kit-pilots';
import type { BattleEvent, BattleState, Combatant } from './battle';
import { debuffSnapshot } from './battle-debuffs';

export interface OmnicMemory {
  bank?: number;
  bankRound?: number;
  usedRound?: number;
}
export interface OmnicContext {
  trigger: OmnicTrigger;
  action?: ActionId;
  target?: Combatant;
  amount?: number;
  beforeHp?: number;
  ownBurn?: boolean;
  ownWeaken?: boolean;
  lethal?: boolean;
  resource?: KitPilotResourceKey;
  hpDamage?: number;
}
function recipient(state: BattleState, owner: Combatant, target: Combatant | undefined, choice: OmnicRecipient = 'self'): Combatant | undefined {
  if (choice === 'self') return owner.hp > 0 ? owner : undefined;
  if (choice === 'target') return target?.side === 'ally' && target.hp > 0 ? target : undefined;
  const eligible = state.allies.filter((unit) => unit.hp > 0 && (choice === 'injured' || unit.id !== owner.id));
  return eligible.sort((a, b) => choice === 'lowest-gauge-other'
    ? a.shatter - b.shatter : a.hp / a.stats.health - b.hp / b.stats.health)[0];
}
function status(events: BattleEvent[], owner: Combatant, target: Combatant, name: string, amount: number): void {
  events.push({ kind: 'status', source: owner.id, target: target.id, amount, critical: false,
    message: `${owner.name}: ${name}.`, debuffs: debuffSnapshot(target) });
}
function applyOutcome(state: BattleState, owner: Combatant, context: OmnicContext, outcome: OmnicOutcome,
  scale: number, name: string, events: BattleEvent[]): boolean {
  const target = recipient(state, owner, context.target, outcome.recipient);
  if (outcome.kind === 'burn-clock') {
    const enemy = context.target;
    if (!enemy || enemy.hp <= 0 || enemy.burn.turns <= 0 || enemy.burn.sourceId !== owner.id) return false;
    const next = Math.min(3, enemy.burn.turns + outcome.amount);
    if (next <= enemy.burn.turns) return false;
    enemy.burn.turns = next;
    status(events, owner, enemy, `${name} extends existing Burn to ${next} phases`, outcome.amount);
    return true;
  }
  if (outcome.kind === 'fracture') {
    const enemy = context.target;
    if (!enemy || enemy.hp <= 0 || enemy.weakened <= 0 || enemy.weakenSourceId !== owner.id) return false;
    const marks = enemy.conduitMarks?.[owner.id] ?? 0;
    if (marks >= 2) return false;
    enemy.conduitMarks = { ...enemy.conduitMarks, [owner.id]: Math.min(2, marks + outcome.amount) };
    status(events, owner, enemy, `${name} places a personal Fracture Mark`, 1);
    return true;
  }
  if (!target) return false;
  const triggerAmount = context.trigger === 'resource-spent' ? (context.amount ?? 0) * owner.stats.health
    : context.hpDamage ?? context.amount ?? 0;
  if (outcome.kind === 'heal' || outcome.kind === 'shield') {
    const desired = Math.max(0, Math.round(Math.min(
      owner.stats.health * outcome.amount + triggerAmount * (outcome.ratio ?? 0),
      outcome.cap === undefined ? Infinity : owner.stats.health * outcome.cap) * scale));
    const amount = outcome.kind === 'heal' ? Math.min(target.stats.health - target.hp, desired) : Math.max(0, desired - target.shield);
    if (amount <= 0) return false;
    if (outcome.kind === 'heal') target.hp += amount;
    else {
      target.shield += amount;
      delete target.pilot?.authoredShieldSourceId;
    }
    events.push({ kind: outcome.kind, source: owner.id, target: target.id, amount, critical: false,
      message: `${owner.name}: ${name} ${outcome.kind === 'heal' ? 'restores' : 'wards'} ${target.name} for ${amount} (Conduit; not authored).`,
      ...(outcome.kind === 'shield' ? { shieldRemaining: target.shield } : {}) });
    return true;
  }
  if (outcome.kind === 'gauge') {
    const desired = (outcome.amount + (context.amount ?? 0) * (outcome.ratio ?? 0)) * scale;
    const amount = Math.min(target.stats.shatterCapacity - target.shatter, desired);
    if (amount <= 0) return false;
    target.shatter += amount;
    status(events, owner, target, `${name} returns ${amount} Gauge to ${target.name}`, amount);
    return true;
  }
  if (outcome.kind === 'cooldown') {
    const available = (['skill1', 'skill2'] as const).filter((action) =>
      !!target.kit && !target.kit.unavailableActions?.includes(action) && target.readyRound[action] > state.round + 1)
      .sort((a, b) => target.readyRound[b] - target.readyRound[a]);
    const selected = outcome.bothSkills ? available : available.slice(0, 1);
    if (!selected.length) return false;
    for (const action of selected) target.readyRound[action] = Math.max(state.round + 1, target.readyRound[action] - outcome.amount);
    status(events, owner, target, `${name} reindexes ${target.name}'s skill cooldown (never before next round)`, outcome.amount);
    return true;
  }
  if (outcome.kind === 'boost') {
    const prior = target.attackBoost && target.attackBoost.throughRound >= state.round ? target.attackBoost.fraction : 0;
    if (prior >= outcome.amount) return false;
    target.attackBoost = { fraction: outcome.amount, throughRound: state.round + 1, sourceId: owner.id, origin: 'conduit' };
    status(events, owner, target, `${name} lends ${outcome.amount * 100}% Attack through next round`, outcome.amount * 100);
    return true;
  }
  if (outcome.kind === 'protection') {
    if ((target.omnicProtection ?? 0) >= outcome.amount) return false;
    target.omnicProtection = outcome.amount;
    status(events, owner, target, `${name} primes one ${outcome.amount * 100}% direct-hit protection`, outcome.amount * 100);
    return true;
  }
  return false;
}
function qualifies(owner: Combatant, rule: OmnicRule, context: OmnicContext): boolean {
  return (!rule.actions || !!context.action && rule.actions.includes(context.action)) &&
    (!rule.other || !!context.target && context.target.id !== owner.id) &&
    (!rule.belowHalf || !!context.target && (context.beforeHp ?? context.target.hp) <= context.target.stats.health / 2) &&
    (!rule.ownBurn || context.ownBurn === true) && (!rule.ownWeaken || context.ownWeaken === true) &&
    (!rule.lethal || context.lethal === true) &&
    (!rule.resources || !!context.resource && rule.resources.includes(context.resource));
}

/** Invoked only for actual authored/native outcomes, never recursively for generated outcomes. */
export function resolveOmnicInteraction(state: BattleState, owner: Combatant, context: OmnicContext, events: BattleEvent[]): void {
  if (owner.side !== 'ally' || owner.hp <= 0 || context.trigger !== 'defense' && (context.amount ?? 0) <= 0) return;
  for (const id of owner.conduits ?? []) {
    if (!id) continue;
    const conduit = getConduit(id);
    if (!('kitEffects' in conduit)) continue;
    const rule: OmnicRule = conduit.kitEffects.rule;
    const memory = owner.omnicMemory?.[id] ?? {};
    const remember = (): void => { (owner.omnicMemory ??= {})[id] = memory; };
    if (rule.bank?.trigger === context.trigger && (!rule.bank.other || !!context.target && context.target.id !== owner.id) && memory.bankRound !== state.round) {
      if ((memory.bank ?? 0) < rule.bank.maximum) {
        memory.bank = Math.min(rule.bank.maximum, (memory.bank ?? 0) + 1);
        memory.bankRound = state.round;
        remember();
        status(events, owner, owner, `${conduit.name} stores a reserve (${memory.bank}/${rule.bank.maximum})`, memory.bank);
      }
    }
    if (rule.trigger !== context.trigger || memory.usedRound === state.round || !qualifies(owner, rule, context)) continue;
    const scale = rule.bank ? Math.min(rule.bank.maximum, Math.max(0, memory.bank ?? 0)) : 1;
    if (scale <= 0) continue;
    let effective = false;
    for (const outcome of rule.outcomes) effective = applyOutcome(state, owner, context, outcome, scale, conduit.name, events) || effective;
    if (effective) {
      memory.usedRound = state.round;
      if (rule.bank) memory.bank = 0;
      remember();
    }
  }
}
