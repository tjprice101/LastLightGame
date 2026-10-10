import { type BattleDebuffSnapshot, type Combatant } from './battle';
import type { ElementalEffectTag } from '../content/elemental-effects';

export function debuffSnapshot(target: Combatant): BattleDebuffSnapshot {
  if (target.hp <= 0) return { weakened: 0, weakenFraction: 0 };
  const marks = Object.entries(target.conduitMarks ?? {})
    .filter((entry): entry is [string, number] => typeof entry[1] === 'number' && Number.isInteger(entry[1]) && entry[1] > 0)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([bearerId, stacks]) => ({ bearerId, stacks }));
  const elementalEffects: ElementalEffectTag[] = [];
  if (target.burn.turns > 0) {
    elementalEffects.push({
      family: 'burn', kind: 'burn', origin: target.burn.origin ?? 'native', source: 'living-self-authored-burn',
    });
  }
  if (target.weakened > 0) elementalEffects.push({
    family: 'suppression', kind: 'weaken', origin: target.weakenOrigin ?? 'native', source: 'authored-weaken',
  });
  if (marks.length) elementalEffects.push({
    family: 'suppression', kind: 'fracture', origin: 'conduit', source: 'conduit-fracture-mark',
  });
  return {
    ...(target.burn.turns > 0 ? { burn: { damage: target.burn.damage, turns: target.burn.turns } } : {}),
    weakened: target.weakened,
    weakenFraction: target.weakened > 0 ? target.weakenFraction : 0,
    ...(marks.length ? { marks } : {}),
    ...(elementalEffects.length ? { elementalEffects } : {}),
  };
}
