import { formatStat } from '../content/combat';
import { type BattleDebuffSnapshot, type Combatant } from '../game/battle';
import { debuffSnapshot } from '../game/battle-debuffs';
import { escapeDialogText } from './game-dialog';

export type EnemyDebuffs = BattleDebuffSnapshot;

export function enemyDebuffs(unit: EnemyDebuffs, owners: readonly Pick<Combatant, 'id' | 'name'>[] = []): string {
  const labels: { id: string; text: string }[] = [];
  if (unit.burn && unit.burn.turns > 0 && unit.burn.damage > 0) {
    labels.push({ id: 'burn', text: `Burn ${formatStat(unit.burn.damage)} ~ ${unit.burn.turns} enemy phase${unit.burn.turns === 1 ? '' : 's'}` });
  }
  if (unit.weakened > 0 && unit.weakenFraction > 0) {
    labels.push({ id: 'weaken', text: `Weaken -${formatStat(unit.weakenFraction * 100)}% Attack ~ ${unit.weakened} attack${unit.weakened === 1 ? '' : 's'}` });
  }
  const ownerName = (id: string): string => owners.find((owner) => owner.id === id)?.name ?? id;
  for (const mark of unit.marks ?? []) {
    if (mark.stacks > 0) labels.push({ id: 'fracture', text: `Fracture Mark ${mark.stacks}/2 ~ ${ownerName(mark.bearerId)}` });
  }
  for (const mark of unit.verdict ?? []) {
    if (mark.stacks > 0 && mark.turns > 0) labels.push({ id: 'verdict', text: `Verdict Mark ${mark.stacks}/2 ~ ${ownerName(mark.bearerId)} ~ ${mark.turns} enemy phase${mark.turns === 1 ? '' : 's'}` });
  }
  return labels.map(({ id, text }) => `<span class="battle-status-badge" data-debuff="${id}">${escapeDialogText(text)}</span>`).join('');
}

export function enemyStatusReadout(unit: Combatant, owners: readonly Combatant[] = []): string {
  return `<span class="battle-debuffs">${enemyDebuffs(debuffSnapshot(unit), owners)}</span>`;
}
