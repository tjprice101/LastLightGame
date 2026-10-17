import { formatStat } from '../content/combat';
import { type BattleBuffSnapshot } from '../game/battle-buffs';
import { statusIcon } from './status-icon';
import type { StatusArtId } from '../content/status-art';

export function allyBuffs(buffs: BattleBuffSnapshot, round: number): string {
  const badge = (id: string, label: string, detail: string, icon?: StatusArtId): string =>
    `<span class="battle-status-badge" data-buff="${id}" title="${detail}">${icon ? statusIcon(icon) : ''}${label}</span>`;
  return [
    buffs.shield > 0 && badge('shield', `Shield ${formatStat(buffs.shield)}`,
      'Active shield: absorbs damage before HP. Duration and refresh rules follow its originating ability or Conduit.', 'ward'),
    buffs.attackBoost && buffs.attackBoost.throughRound >= round && badge('attack',
      `Damage +${formatStat(buffs.attackBoost.fraction * 100)}% · through turn ${buffs.attackBoost.throughRound}`,
      'Active bonus to outgoing attack damage. Refreshes without stacking.', 'focus'),
    buffs.protection > 0 && badge('protection', `Next hit -${formatStat(buffs.protection * 100)}%`,
      'One charge: reduces the next direct enemy hit.', 'ward'),
    buffs.recoverThrough >= round && buffs.recoverThrough > 0 && badge('recovery',
      `Recovering · through turn ${buffs.recoverThrough}`, 'Cannot act during recovery after Last Flare.'),
  ].filter(Boolean).join('');
}
