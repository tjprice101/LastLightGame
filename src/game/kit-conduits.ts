import { getConduit } from '../content/conduits';
import type { OmnicOutcome, OmnicRecipient, OmnicRule, OmnicTrigger } from '../content/conduit-kit';
import type { ActionId } from '../content/combat';
import type { KitPilotResourceKey } from '../content/kit-pilots';
import type { BattleEvent, BattleState, Combatant } from './battle';
import { debuffSnapshot } from './battle-debuffs';
import { buffSnapshot } from './battle-buffs';
import { getMasterConduit, validateMasterCharacter } from '../content/master-conduits';
import { kitPilotDescriptions } from '../content/kit-pilots';
import { formatStat } from '../content/combat';

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
  /** Enemy whose direct hit triggered `shield-absorbed`. */
  attacker?: Combatant;
}
const enemyRecipients: readonly OmnicRecipient[] = ['struck', 'attacker', 'all-enemies'];
function recipient(state: BattleState, owner: Combatant, target: Combatant | undefined, choice: OmnicRecipient = 'self'): Combatant | undefined {
  if (enemyRecipients.includes(choice) || choice === 'all-allies') return undefined;
  if (choice === 'self') return owner.hp > 0 ? owner : undefined;
  if (choice === 'target') return target?.side === 'ally' && target.hp > 0 ? target : undefined;
  const eligible = state.allies.filter((unit) => unit.hp > 0 && (choice === 'injured' || unit.id !== owner.id));
  return eligible.sort((a, b) => choice === 'lowest-gauge-other'
    ? a.shatter - b.shatter : a.hp / a.stats.health - b.hp / b.stats.health)[0];
}
function status(events: BattleEvent[], owner: Combatant, target: Combatant, name: string, amount: number): void {
  events.push({ kind: 'status', source: owner.id, target: target.id, amount, critical: false,
    message: `${owner.name}: ${name}.`, debuffs: debuffSnapshot(target),
    ...(target.side === 'ally' ? { buffs: buffSnapshot(target) } : {}) });
}
function applyOutcome(state: BattleState, owner: Combatant, context: OmnicContext, outcome: OmnicOutcome,
  scale: number, name: string, events: BattleEvent[], resolved?: { target: Combatant | undefined }): boolean {
  if (outcome.recipient === 'all-allies' && !resolved) {
    let any = false;
    for (const ally of state.allies.filter((unit) => unit.hp > 0)) {
      any = applyOutcome(state, owner, context, outcome, scale, name, events, { target: ally }) || any;
    }
    return any;
  }
  if (outcome.kind === 'strike') return strike(state, owner, context, outcome, scale, name, events);
  if (outcome.kind === 'charge') {
    const resource = owner.kit?.pilot ? kitPilotDescriptions[owner.kit.pilot].resource : undefined;
    if (!resource || owner.captured) return false;
    const current = owner.pilot?.[resource.key] ?? 0;
    const next = Math.min(3, current + Math.round(outcome.amount * scale));
    if (next <= current) return false;
    owner.pilot = { ...owner.pilot, [resource.key]: next };
    status(events, owner, owner, `${name} grants ${next - current} ${resource.label} (${next}/3)`, next - current);
    return true;
  }
  if (outcome.kind === 'weaken-clock') {
    const enemy = context.target;
    if (!enemy || enemy.side !== 'enemy' || enemy.hp <= 0 || enemy.weakened <= 0 || enemy.weakenSourceId !== owner.id) return false;
    const next = Math.min(3, enemy.weakened + outcome.amount);
    if (next <= enemy.weakened) return false;
    enemy.weakened = next;
    status(events, owner, enemy, `${name} extends existing Weaken to ${next} enemy phases`, outcome.amount);
    return true;
  }
  const target = resolved ? resolved.target : recipient(state, owner, context.target, outcome.recipient);
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
    const gained = Math.min(2 - marks, outcome.amount);
    enemy.conduitMarks = { ...enemy.conduitMarks, [owner.id]: marks + gained };
    status(events, owner, enemy, `${name} places ${gained} personal Fracture Mark${gained === 1 ? '' : 's'}`, gained);
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
      message: `${owner.name}: ${name} ${outcome.kind === 'heal' ? 'restores' : 'wards'} ${target.name} for ${amount} (Conduit effect).`,
      buffs: buffSnapshot(target),
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
    const rounds = Math.round(outcome.amount * scale);
    for (const action of selected) target.readyRound[action] = Math.max(state.round + 1, target.readyRound[action] - rounds);
    status(events, owner, target, `${name} reindexes ${target.name}'s skill cooldown (never before next round)`, outcome.amount);
    return true;
  }
  if (outcome.kind === 'boost') {
    const prior = target.attackBoost && target.attackBoost.throughRound >= state.round ? target.attackBoost.fraction : 0;
    const offered = Math.min(.65, Math.round(outcome.amount * scale * 1000) / 1000);
    const fraction = Math.max(prior, offered);
    const throughRound = Math.max(target.attackBoost?.throughRound ?? 0, state.round + 1);
    if (prior === fraction && target.attackBoost?.throughRound === throughRound) return false;
    target.attackBoost = { fraction, throughRound,
      sourceId: prior > offered ? target.attackBoost?.sourceId : owner.id,
      origin: prior > offered ? target.attackBoost?.origin : 'conduit' };
    status(events, owner, target, `${name} lends ${formatStat(fraction * 100)}% Attack through next round`, fraction * 100);
    return true;
  }
  if (outcome.kind === 'protection') {
    const amount = Math.min(.6, Math.round(outcome.amount * scale * 1000) / 1000);
    if ((target.omnicProtection ?? 0) >= amount) return false;
    target.omnicProtection = amount;
    status(events, owner, target, `${name} primes one ${formatStat(amount * 100)}% direct-hit protection`, amount * 100);
    return true;
  }
  return false;
}
/** Fixed Conduit damage; never critical, never rolls RNG and never re-triggers Conduit rules. */
function strike(state: BattleState, owner: Combatant, context: OmnicContext, outcome: OmnicOutcome,
  scale: number, name: string, events: BattleEvent[]): boolean {
  // Defense resolves before the action's defeat bookkeeping, so it may never deal damage.
  if (context.trigger === 'defense') return false;
  const choice = outcome.recipient ?? 'struck';
  const enemies = choice === 'all-enemies' ? state.enemies.filter((unit) => unit.hp > 0)
    : [choice === 'attacker' ? context.attacker : context.target]
      .filter((unit): unit is Combatant => !!unit && unit.side === 'enemy' && unit.hp > 0);
  const echo = context.trigger === 'resource-spent' ? 0 : (context.hpDamage ?? context.amount ?? 0) * (outcome.ratio ?? 0);
  let dealt = false;
  for (const enemy of enemies) {
    const base = owner.stats.damage;
    const mitigation = base > 0 ? base / (base + enemy.stats.defense) : 0;
    const raw = base * outcome.amount * mitigation + echo;
    if (raw <= 0) continue;
    const amount = Math.max(1, Math.round(Math.min(raw, outcome.cap === undefined ? Infinity : base * outcome.cap) * scale));
    const absorbed = Math.min(enemy.shield, amount);
    enemy.shield -= absorbed;
    const loss = Math.min(enemy.hp, amount - absorbed);
    enemy.hp -= loss;
    if (enemy.hp === 0) {
      delete enemy.conduitMarks;
      delete enemy.pilot;
    }
    events.push({ kind: 'damage', source: owner.id, target: enemy.id, amount: loss, critical: false,
      message: `${enemy.name}: ${formatStat(loss)} damage from ${name} (Conduit strike)${absorbed ? `, ${formatStat(absorbed)} shield absorbed` : ''}${enemy.hp === 0 ? ' - defeated' : ''}.`,
      shieldRemaining: enemy.shield, debuffs: debuffSnapshot(enemy) });
    dealt = true;
  }
  return dealt;
}
function qualifies(owner: Combatant, rule: OmnicRule, context: OmnicContext): boolean {
  return (!rule.actions || !!context.action && rule.actions.includes(context.action)) &&
    (!rule.other || !!context.target && context.target.id !== owner.id) &&
    (!rule.belowHalf || !!context.target && (context.beforeHp ?? context.target.hp) <= context.target.stats.health / 2) &&
    (!rule.ownBurn || context.ownBurn === true) && (!rule.ownWeaken || context.ownWeaken === true) &&
    (!rule.lethal || context.lethal === true) &&
    (!rule.selfBelowHalf || owner.hp <= owner.stats.health / 2) &&
    (!rule.resources || !!context.resource && rule.resources.includes(context.resource));
}

/** Invoked only for actual authored/native outcomes, never recursively for generated outcomes. */
export function resolveOmnicInteraction(state: BattleState, owner: Combatant, context: OmnicContext, events: BattleEvent[]): void {
  if (owner.side !== 'ally' || owner.hp <= 0 || context.trigger !== 'defense' && (context.amount ?? 0) <= 0) return;
  const interactions: { id: string; name: string; rule: OmnicRule }[] = [];
  for (const id of owner.conduits ?? []) {
    if (id) {
      const conduit = getConduit(id);
      if ('kitEffects' in conduit) interactions.push({ id, name: conduit.name, rule: conduit.kitEffects.rule });
    }
  }
  if (owner.masterConduit) {
    if (owner.captured) throw new Error('Captured Elemental-Devourers cannot equip character Master Conduits.');
    validateMasterCharacter(owner.masterConduit, owner.definitionId);
    interactions.push(getMasterConduit(owner.masterConduit));
  }
  for (const conduit of interactions) {
    const { id, rule } = conduit;
    const isMaster = owner.masterConduit === id;
    const memory = owner.omnicMemory?.[id] ?? {};
    const remember = (): void => { (owner.omnicMemory ??= {})[id] = memory; };
    if (rule.bank?.trigger === context.trigger && (!rule.bank.other || !!context.target && context.target.id !== owner.id) && (isMaster || memory.bankRound !== state.round)) {
      if ((memory.bank ?? 0) < rule.bank.maximum) {
        memory.bank = Math.min(rule.bank.maximum, (memory.bank ?? 0) + 1);
        if (!isMaster) memory.bankRound = state.round;
        remember();
        status(events, owner, owner, `${conduit.name} stores ${owner.masterConduit === id ? 'Astral Reserve' : 'a reserve'} (${memory.bank}/${rule.bank.maximum})`, memory.bank);
      }
    }
    if (rule.trigger !== context.trigger || !isMaster && memory.usedRound === state.round || !qualifies(owner, rule, context)) continue;
    const scale = rule.bank ? Math.min(rule.bank.maximum, Math.max(0, memory.bank ?? 0)) : 1;
    if (scale <= 0) continue;
    let effective = false;
    const selected = new Map<OmnicRecipient, { target: Combatant | undefined }>();
    if (owner.masterConduit === id) {
      for (const outcome of rule.outcomes) {
        const choice = outcome.recipient ?? 'self';
        if (choice === 'all-allies' || enemyRecipients.includes(choice)) continue;
        if (!selected.has(choice)) selected.set(choice, { target: recipient(state, owner, context.target, choice) });
      }
    }
    for (const outcome of rule.outcomes) effective = applyOutcome(state, owner, context, outcome, scale, conduit.name, events,
      selected.get(outcome.recipient ?? 'self')) || effective;
    if (effective) {
      if (!isMaster) memory.usedRound = state.round;
      if (rule.bank) memory.bank = 0;
      remember();
    }
  }
}
