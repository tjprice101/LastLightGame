import { type BattleEvent, type Combatant } from '../game/battle';

export function healthAfterEvent(hp: number, maximum: number, event: BattleEvent): number {
  if (event.kind === 'damage') return Math.max(0, hp - event.amount);
  if (event.kind === 'heal') return Math.min(maximum, hp + event.amount);
  return hp;
}

export function healthSnapshot(units: readonly Combatant[]): Map<string, number> {
  return new Map(units.map((unit) => [unit.id, unit.hp]));
}

export function impactEvents(events: readonly BattleEvent[], attackIndex: number): number[] {
  const attack = events[attackIndex];
  if (attack.kind !== 'attack') throw new Error('Impact group must begin with an attack.');
  const indices: number[] = [];
  for (let index = attackIndex + 1; index < events.length; index++) {
    const event = events[index];
    if (event.kind === 'attack' || event.kind === 'turn' || event.periodic) break;
    if (event.source === attack.source && (event.kind === 'damage' || event.kind === 'heal' || event.kind === 'shield' || (event.kind === 'status' && (event.debuffs || event.buffs) && event.target !== attack.source))) indices.push(index);
  }

  return indices;
}

export function attackEffectTargets(attack: BattleEvent, impacts: readonly BattleEvent[],
  units: readonly Combatant[], health: ReadonlyMap<string, number>): string[] {
  if (attack.kind !== 'attack') throw new Error('Effect targets require an attack.');
  const source = units.find(unit => unit.id === attack.source);
  if (!source) throw new Error('Effect source is missing.');
  const targets = new Set(impacts.map(event => event.target));
  const ability = attack.action && attack.action !== 'light'
    ? source.kit?.abilities[attack.action] : undefined;
  if (ability && ability.targets !== 'one-ally' && (ability.targets === 'all-allies' || ability.strength.shield !== undefined ||
      ability.strength.healing !== undefined || ability.strength.attackBoostFraction !== undefined)) {
    for (const unit of units) {
      if (unit.side === source.side && (health.get(unit.id) ?? 0) > 0) targets.add(unit.id);
    }
  }
  if (!targets.size) targets.add(attack.target);
  return [...targets].filter(id => (health.get(id) ?? 0) > 0);
}
