import { elementalEffectDescription } from '../content/elemental-effects';
import { formatStat } from '../content/combat';
import { type BattleDebuffSnapshot, type Combatant } from '../game/battle';
import { debuffSnapshot } from '../game/battle-debuffs';
import { escapeDialogText } from './game-dialog';
import { statusIcon } from './status-icon';

export type EnemyDebuffs = BattleDebuffSnapshot;

export function enemyDebuffs(unit: EnemyDebuffs, owners: readonly Pick<Combatant, 'id' | 'name'>[] = []): string {
  const labels: { id: string; text: string; effect?: BattleDebuffSnapshot['elementalEffects'] extends (infer T)[] | undefined ? T : never }[] = [];
  const effect = (kind: string) => unit.elementalEffects?.find((entry) => entry.kind === kind);
  if (unit.burn && unit.burn.turns > 0 && unit.burn.damage > 0) {
    labels.push({ id: 'burn', text: `Burn ${formatStat(unit.burn.damage)} · ${unit.burn.turns} enemy phase${unit.burn.turns === 1 ? '' : 's'}`, effect: effect('burn') });
  }
  if (unit.weakened > 0 && unit.weakenFraction > 0) {
    labels.push({ id: 'weaken', text: `Weaken -${formatStat(unit.weakenFraction * 100)}% Attack · ${unit.weakened} attack${unit.weakened === 1 ? '' : 's'}`, effect: effect('weaken') });
  }
  const ownerName = (id: string): string => owners.find((owner) => owner.id === id)?.name ?? id;
  for (const mark of unit.marks ?? []) {
    if (mark.stacks > 0) labels.push({ id: 'fracture', text: `Fracture Mark ${mark.stacks}/2 · ${ownerName(mark.bearerId)}`, effect: effect('fracture') });
  }
  return labels.map(({ id, text, effect: tag }) => `<span class="battle-status-badge" data-debuff="${id}"${tag
    ? ` data-effect-family="${tag.family}" data-effect-kind="${tag.kind}" data-effect-origin="${tag.origin}" data-effect-source="${tag.source}" title="${elementalEffectDescription(tag)}"` : ''}>${statusIcon(id === 'burn' ? 'burn' : 'suppression')}${escapeDialogText(text)}</span>`).join('');
}

export function enemyStatusReadout(unit: Combatant, owners: readonly Combatant[] = []): string {
  return `<span class="battle-debuffs">${enemyDebuffs(debuffSnapshot(unit), owners)}</span>`;
}
