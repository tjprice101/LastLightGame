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
    if (event.source === attack.source && (event.kind === 'damage' || event.kind === 'heal' || event.kind === 'shield' || (event.kind === 'status' && event.debuffs && event.target !== attack.source))) indices.push(index);
  }
  return indices;
}
