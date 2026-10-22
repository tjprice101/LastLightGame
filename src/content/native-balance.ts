export const nativeBalance = {
  skillDamageScale: 1.6,
  lastFlare: { damage: 3, support: 1.5 },
  damageOverTime: { levelsPerBonus: 30 },
  flora: { seed: .5, empoweredSeed: .975, immediateHeal: .75 },
  tizu: { shelter: .45, oceanMemory: .525 },
} as const;

export function damageOverTimeLevelMultiplier(level: number): number {
  if (!Number.isSafeInteger(level) || level < 0) throw new Error('Invalid damage-over-time source level.');
  return 1 + level / nativeBalance.damageOverTime.levelsPerBonus;
}
