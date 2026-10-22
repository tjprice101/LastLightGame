import { type Stats } from '../content/combat';
import { normalizeStats, phaseZeroStatKeys, phaseZeroStatLabels, phaseZeroStatsReady, statDisplayUnit } from '../content/phase-zero-stats';
import { statChange } from './stat-change';

export const displayStatLabels = {
  ...phaseZeroStatLabels,
  ...(phaseZeroStatsReady ? {} : {
    damage: 'Attack', crit: 'Critical Rate', critMultiplier: 'Critical Damage',
  }),
  elementalDamage: 'Elemental Damage',
};
export type DisplayStatKey = keyof typeof displayStatLabels;
export const displayStatKeys: readonly DisplayStatKey[] = phaseZeroStatsReady ? phaseZeroStatKeys
  : ['health', 'defense', 'damage', 'crit', 'critMultiplier', 'shatterCapacity', 'elementalDamage'];

export function statPreview(before: Stats, after: Stats, row: 'span' | 'div' = 'span',
  labels: Partial<Record<DisplayStatKey, string>> = {}): string {
  const from = normalizeStats(before);
  const to = normalizeStats(after);
  return displayStatKeys.map(key => {
    const change = statChange(from[key], to[key], statDisplayUnit(key));
    return `<${row}><small>${labels[key] ?? displayStatLabels[key]}</small>${row === 'span' ? `<strong>${change}</strong>` : change}</${row}>`;
  }).join('');
}
