import type { Stats } from './combat';

export const phaseZeroStatsReady: boolean = true;

export const phaseZeroStatDefaults = {
  skillPower: 1,
  skillDuration: 0,
  skillEfficiency: 0,
  gaugeGain: 1,
} as const;

export type ResolvedStats = Stats & Record<keyof typeof phaseZeroStatDefaults, number>;

export function normalizeStats<T extends Stats>(stats: T): T & ResolvedStats {
  return {
    ...stats,
    skillPower: stats.skillPower ?? phaseZeroStatDefaults.skillPower,
    skillDuration: stats.skillDuration ?? phaseZeroStatDefaults.skillDuration,
    skillEfficiency: stats.skillEfficiency ?? phaseZeroStatDefaults.skillEfficiency,
    gaugeGain: stats.gaugeGain ?? phaseZeroStatDefaults.gaugeGain,
  };
}

export const phaseZeroStatLabels = {
  health: 'Health',
  defense: 'Defense',
  damage: 'Direct Attack',
  critMultiplier: 'Critical Damage Multiplier',
  crit: 'Critical Rate',
  skillPower: 'Skill Power',
  skillDuration: 'Skill Duration',
  skillEfficiency: 'Skill Efficiency',
  shatterCapacity: 'Elemental Gauge Capacity',
  gaugeGain: 'Elemental Gauge Gain',
} as const;
export type PhaseZeroStatKey = keyof typeof phaseZeroStatLabels;
export const phaseZeroStatKeys = Object.keys(phaseZeroStatLabels) as PhaseZeroStatKey[];

export function statDisplayUnit(key: keyof Stats): '%' | 'x' | '' {
  return key === 'crit' || key === 'skillPower' || key === 'skillEfficiency' || key === 'gaugeGain'
    ? '%' : key === 'critMultiplier' ? 'x' : '';
}
