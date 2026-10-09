import { type BattleDebuffSnapshot, type Combatant } from './battle';

export function debuffSnapshot(target: Combatant): BattleDebuffSnapshot {
  if (target.hp <= 0) return { weakened: 0, weakenFraction: 0 };
  const marks = Object.entries(target.conduitMarks ?? {})
    .filter((entry): entry is [string, number] => typeof entry[1] === 'number' && Number.isInteger(entry[1]) && entry[1] > 0)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([bearerId, stacks]) => ({ bearerId, stacks }));
  const verdict = Object.entries(target.pilot?.verdictMarks ?? {})
    .filter(([, mark]) => mark.stacks > 0 && mark.turns > 0)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([bearerId, mark]) => ({ bearerId, ...mark }));
  return {
    ...(target.burn.turns > 0 ? { burn: { damage: target.burn.damage, turns: target.burn.turns } } : {}),
    weakened: target.weakened,
    weakenFraction: target.weakened > 0 ? target.weakenFraction : 0,
    ...(marks.length ? { marks } : {}),
    ...(verdict.length ? { verdict } : {}),
  };
}
