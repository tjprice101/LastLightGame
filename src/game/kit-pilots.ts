import { type ElementalEffectTag } from '../content/elemental-effects';
import { type ActionId } from '../content/combat';
import { kitPilotDescriptions, type KitPilot, type KitPilotResourceKey, type KitPilotState } from '../content/kit-pilots';
import { type BattleEvent, type BattleState, type Combatant } from './battle';
import { debuffSnapshot } from './battle-debuffs';

function charges(unit: Combatant): KitPilotState {
  return unit.pilot ??= {};
}

function status(events: BattleEvent[], source: Combatant, target: Combatant, message: string, effect?: ElementalEffectTag): void {
  events.push({
    kind: 'status', source: source.id, target: target.id, amount: 0, critical: false, message,
    debuffs: debuffSnapshot(target), ...(effect ? { elementalEffect: effect } : {}),
  });
}

function nativeOwner(actor: Combatant): boolean {
  return actor.side === 'ally' && actor.hp > 0 && !actor.captured;
}

type RoundKey = 'emberRound' | 'wardRound' | 'bloomRound' | 'roseGraceRound' | 'thornAegisRound' | 'dualityRound';

function resourceLabel(key: KitPilotResourceKey): string {
  return Object.values(kitPilotDescriptions).find((description) => description.resource?.key === key)?.resource?.label ?? key;
}

function resourceEffect(owner: Combatant): ElementalEffectTag | undefined {
  return owner.kit?.pilot ? kitPilotDescriptions[owner.kit.pilot].resource?.effect : undefined;
}

function gainResource(owner: Combatant, key: KitPilotResourceKey, events: BattleEvent[], roundKey?: RoundKey, round?: number): void {
  if (!nativeOwner(owner)) return;
  const current = charges(owner);
  if (roundKey) {
    if (current[roundKey] === round) return;
    current[roundKey] = round;
  }
  if ((current[key] ?? 0) >= 3) return;
  current[key] = (current[key] ?? 0) + 1;
  const label = resourceLabel(key);
  status(events, owner, owner, `${owner.name} gains ${label} (${current[key]}/3).`, resourceEffect(owner));
}

function spendResource(actor: Combatant, key: KitPilotResourceKey, events: BattleEvent[]): number {
  if (!nativeOwner(actor)) return 0;
  const count = Math.min(3, Math.max(0, actor.pilot?.[key] ?? 0));
  if (count <= 0) return 0;
  charges(actor)[key] = 0;
  const label = resourceLabel(key);
  status(events, actor, actor, `${actor.name} spends ${count} ${label}.`, resourceEffect(actor));
  return count;
}

const outgoingResources: Partial<Record<KitPilot, {
  key: KitPilotResourceKey; skill?: 'skill1' | 'skill2'; ordinary: number; ultimate?: number;
}>> = {
  ember: { key: 'ember', skill: 'skill2', ordinary: .08, ultimate: .12 },
  'rose-duality': { key: 'duality', skill: 'skill1', ordinary: .08, ultimate: .12 },
  'rose-grace': { key: 'roseGrace', ordinary: 0, ultimate: .1 },
  tempest: { key: 'tempest', ordinary: .08, ultimate: .12 },
};

export function pilotOutgoingBonus(actor: Combatant, action: ActionId, events: BattleEvent[]): number {
  const rule = actor.kit?.pilot ? outgoingResources[actor.kit.pilot] : undefined;
  if (!rule) return 0;
  const skill = actor.definitionId === 'atmoso' || actor.definitionId === 'elise' ? 'skill1'
    : actor.definitionId === 'vaelor' ? 'skill2' : rule.skill;
  if (!(action === skill || (action === 'ultimate' && rule.ultimate !== undefined))) return 0;
  return spendResource(actor, rule.key, events) * (action === 'ultimate' ? rule.ultimate ?? 0 : rule.ordinary);
}

export function pilotPrepareStarter(actor: Combatant, action: ActionId, events: BattleEvent[]): {
  damage: number; weaken: number; shield: number; healing: number;
} {
  const bonus = { damage: 0, weaken: 0, shield: 0, healing: 1 };
  if (!nativeOwner(actor)) return bonus;
  if (actor.kit?.pilot === 'ward' && (action === 'skill1' || action === 'ultimate')) {
    const count = spendResource(actor, 'ward', events);
    if (action === 'skill1') bonus.weaken = count * .05;
    else bonus.shield = actor.stats.health * count * .05;
  } else if (actor.kit?.pilot === 'bloom' && (action === 'skill1' || action === 'ultimate')) {
    const count = spendResource(actor, 'bloom', events);
    if (actor.definitionId === 'sprout') {
      if (action === 'skill1') bonus.damage = count * .1;
      else bonus.healing += count * .15;
    } else if (actor.definitionId === 'bliss') {
      if (action === 'skill1') bonus.damage = count * .08;
      else bonus.shield = actor.stats.health * count * .05;
    }
  } else if (actor.kit?.pilot === 'rose-grace' && action === 'skill1') {
    bonus.weaken = spendResource(actor, 'roseGrace', events) * .05;
  } else if (actor.kit?.pilot === 'thorn-aegis' && (action === 'skill2' || action === 'ultimate')) {
    const count = spendResource(actor, 'thornAegis', events);
    if (action === 'skill2') bonus.weaken = count * .05;
    else bonus.shield = actor.stats.health * count * .05;
  }
  return bonus;
}

export function pilotEffectiveHeal(state: BattleState, owner: Combatant, target: Combatant, amount: number, events: BattleEvent[]): void {
  if (amount <= 0 || !nativeOwner(owner)) return;
  if (owner.kit?.pilot === 'bloom' && (owner.definitionId !== 'bliss' || target.id !== owner.id)) {
    gainResource(owner, 'bloom', events, 'bloomRound', state.round);
  }
  if (owner.kit?.pilot === 'rose-grace') gainResource(owner, 'roseGrace', events, 'roseGraceRound', state.round);
}

export function pilotAuthoredShieldAbsorbed(state: BattleState, sourceId: string | undefined, amount: number, events: BattleEvent[]): void {
  if (amount <= 0 || !sourceId) return;
  const owner = state.allies.find((ally) => ally.id === sourceId);
  if (!owner || !nativeOwner(owner)) return;
  if (owner.kit?.pilot === 'ward') gainResource(owner, 'ward', events, 'wardRound', state.round);
  if (owner.kit?.pilot === 'thorn-aegis') gainResource(owner, 'thornAegis', events, 'thornAegisRound', state.round);
}

export function pilotBurnDamage(state: BattleState, owner: Combatant, amount: number, events: BattleEvent[]): void {
  if (amount <= 0 || !nativeOwner(owner)) return;
  if (owner.kit?.pilot === 'ember') gainResource(owner, 'ember', events, 'emberRound', state.round);
  if (owner.kit?.pilot === 'rose-duality') gainResource(owner, 'duality', events, 'dualityRound', state.round);
}

export function pilotAfterDirectActivation(actor: Combatant, action: ActionId, events: BattleEvent[], effectiveCritical = false): void {
  if (actor.kit?.pilot === 'tempest' && effectiveCritical &&
      (action === 'light' || action === 'skill1' || action === 'skill2')) {
    gainResource(actor, 'tempest', events);
  }
}
