import { type ActionId } from '../content/combat';
import { type KitPilotState } from '../content/kit-pilots';
import { type BattleEvent, type BattleState, type Combatant } from './battle';
import { debuffSnapshot } from './battle-debuffs';

function charges(unit: Combatant): KitPilotState {
  return unit.pilot ??= {};
}

function status(events: BattleEvent[], source: Combatant, target: Combatant, message: string): void {
  events.push({ kind: 'status', source: source.id, target: target.id, amount: 0, critical: false, message, debuffs: debuffSnapshot(target) });
}

export function pilotOutgoingBonus(actor: Combatant, action: ActionId, events: BattleEvent[]): number {
  if (actor.kit?.pilot !== 'ember-seals' || (action !== 'skill2' && action !== 'ultimate')) return 0;
  const seals = Math.min(3, charges(actor).emberSeals ?? 0);
  charges(actor).emberSeals = 0;
  if (seals > 0) status(events, actor, actor, `${actor.name} spends ${seals} Ember Seals.`);
  return seals * (action === 'ultimate' ? .12 : .08);
}

export function pilotPrepareStarter(actor: Combatant, action: ActionId, events: BattleEvent[]): {
  damage: number; weaken: number; shield: number; healing: number;
} {
  const bonus = { damage: 0, weaken: 0, shield: 0, healing: 1 };
  if (actor.kit?.pilot === 'shelter' && (action === 'skill1' || action === 'ultimate')) {
    const count = Math.min(3, actor.pilot?.tideStacks ?? 0);
    if (count > 0) {
      charges(actor).tideStacks = 0;
      if (action === 'skill1') bonus.weaken = count * .05;
      else bonus.shield = actor.stats.health * count * .05;
      status(events, actor, actor, `${actor.name} spends ${count} Tide stacks.`);
    }
  } else if (actor.kit?.pilot === 'bloom' && (action === 'skill1' || action === 'ultimate')) {
    const count = Math.min(3, actor.pilot?.blooms ?? 0);
    if (count > 0) {
      charges(actor).blooms = 0;
      if (action === 'skill1') bonus.damage = count * .1;
      else bonus.healing += count * .15;
      status(events, actor, actor, `${actor.name} spends ${count} Blooms.`);
    }
  }
  return bonus;
}

export function pilotEffectiveHeal(state: BattleState, owner: Combatant, amount: number, events: BattleEvent[]): void {
  if (owner.hp <= 0 || owner.kit?.pilot !== 'bloom' || amount <= 0 || owner.pilot?.bloomRound === state.round) return;
  const current = charges(owner);
  current.bloomRound = state.round;
  if ((current.blooms ?? 0) >= 3) return;
  current.blooms = (current.blooms ?? 0) + 1;
  status(events, owner, owner, `${owner.name} gains a Bloom (${current.blooms}/3).`);
}

export function pilotShieldAbsorbed(state: BattleState, sourceId: string | undefined, amount: number, events: BattleEvent[]): void {
  if (amount <= 0) return;
  const owner = state.allies.find((ally) => ally.id === sourceId && ally.hp > 0 && ally.kit?.pilot === 'shelter');
  if (!owner || owner.pilot?.tideRound === state.round) return;
  const current = charges(owner);
  current.tideRound = state.round;
  if ((current.tideStacks ?? 0) >= 3) return;
  current.tideStacks = (current.tideStacks ?? 0) + 1;
  status(events, owner, owner, `${owner.name} gains a Tide stack (${current.tideStacks}/3).`);
}

export function pilotBurnDamage(state: BattleState, owner: Combatant, amount: number, events: BattleEvent[]): void {
  if (owner.hp <= 0 || owner.kit?.pilot !== 'ember-seals' || amount <= 0) return;
  const current = charges(owner);
  if (current.emberRound === state.round) return;
  current.emberRound = state.round;
  current.emberSeals = Math.min(3, (current.emberSeals ?? 0) + 1);
  status(events, owner, owner, `${owner.name} gains an Ember Seal (${current.emberSeals}/3).`);
}

export function pilotVerdictHit(actor: Combatant, target: Combatant, action: ActionId, events: BattleEvent[]): void {
  if (actor.kit?.pilot !== 'verdict' || action !== 'skill1' || target.hp <= 0) return;
  const marks = charges(target).verdictMarks ??= {};
  marks[actor.id] = { stacks: Math.min(2, (marks[actor.id]?.stacks ?? 0) + 1), turns: 2 };
  status(events, actor, target, `${actor.name} applies Verdict Mark (${marks[actor.id].stacks}/2).`);
}

export function pilotPrepareVerdict(state: BattleState, actor: Combatant, action: ActionId, events: BattleEvent[]): void {
  if (actor.kit?.pilot !== 'verdict' || action !== 'skill2') return;
  let spent = 0;
  for (const enemy of state.enemies) {
    const mark = enemy.pilot?.verdictMarks?.[actor.id];
    if (enemy.hp <= 0 || !mark) continue;
    spent += mark.stacks;
    delete enemy.pilot?.verdictMarks?.[actor.id];
    status(events, actor, enemy, `${actor.name} spends ${mark.stacks} Verdict Marks.`);
  }
  if (spent === 0) return;
  for (const ally of state.allies.filter((unit) => unit.hp > 0)) {
    const previous = charges(ally).precision;
    charges(ally).precision = { points: Math.max(previous && previous.throughRound >= state.round ? previous.points : 0, Math.min(.1, spent * .05)), throughRound: state.round + 1 };
    status(events, actor, ally, `${ally.name} gains Precision through the next player turn.`);
  }
}

export function pilotCriticalBonus(actor: Combatant, round: number): number {
  const precision = actor.pilot?.precision;
  return precision && precision.throughRound >= round ? precision.points : 0;
}

export function pilotAfterAbility(actor: Combatant, action: ActionId, allies: readonly Combatant[], events: BattleEvent[], start: number): void {
  const resolved = events.slice(start);
  if (actor.kit?.pilot === 'restoration' && resolved.some((event) => event.kind === 'heal' && event.source === actor.id && event.target !== actor.id && event.amount > 0)) {
    charges(actor).restorativeCharges = Math.min(3, (charges(actor).restorativeCharges ?? 0) + 1);
    status(events, actor, actor, `${actor.name} gains a Restorative Charge (${charges(actor).restorativeCharges}/3).`);
  }
  if (actor.kit?.pilot === 'shelter' && action !== 'light' && action !== 'defend') {
    for (const event of resolved) if (event.kind === 'shield' && event.source === actor.id && event.amount > 0) {
      const target = allies.find((unit) => unit.id === event.target);
      if (target) charges(target).shelterSourceId = actor.id;
    }
  }
}

export function pilotUltimateShield(actor: Combatant, action: ActionId, events: BattleEvent[]): number {
  if (actor.kit?.pilot !== 'restoration' || action !== 'ultimate') return 0;
  const count = Math.min(3, charges(actor).restorativeCharges ?? 0);
  charges(actor).restorativeCharges = 0;
  if (count > 0) status(events, actor, actor, `${actor.name} spends ${count} Restorative Charges.`);
  return actor.stats.health * .05 * count;
}

export function pilotIncomingMultiplier(state: BattleState, target: Combatant, events: BattleEvent[]): number {
  const ward = target.pilot?.shelterWard;
  if (!ward) return 1;
  delete target.pilot?.shelterWard;
  const source = state.allies.find((unit) => unit.id === ward.sourceId && unit.hp > 0);
  if (!source) return 1;
  status(events, source, target, `${target.name} consumes Shelter Charge.`);
  return 1 - ward.fraction;
}

export function pilotNewTurn(state: BattleState, events: BattleEvent[]): void {
  for (const unit of [...state.allies, ...state.enemies]) {
    const current = unit.pilot;
    if (!current) continue;
    if (current.precision && current.precision.throughRound < state.round) delete current.precision;
    if (unit.side === 'enemy') {
      const before = Object.keys(current.verdictMarks ?? {}).length;
      for (const [owner, mark] of Object.entries(current.verdictMarks ?? {})) {
        mark.turns -= 1;
        if (unit.hp <= 0 || mark.turns <= 0) delete current.verdictMarks?.[owner];
      }
      if (before > 0) status(events, unit, unit, `${unit.name}'s Verdict Marks advance one enemy phase.`);
    } else if (unit.hp > 0 && unit.shield > 0 && current.shelterSourceId) {
      const source = state.allies.find((ally) => ally.id === current.shelterSourceId && ally.hp > 0 && ally.kit?.pilot === 'shelter');
      if (source) {
        current.shelterWard = { sourceId: source.id, fraction: .1 };
        status(events, source, unit, `${unit.name} gains Shelter Charge.`);
      }
    }
    if (current.shelterSourceId && unit.shield <= 0) delete current.shelterSourceId;
  }
}
