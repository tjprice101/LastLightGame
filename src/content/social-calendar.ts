export interface SocialReward {
  fractalis: number;
  lycalis: number;
  materials: Record<string, number>;
  streakPremium?: number;
}

/** Display preview only. The database independently calculates and authorizes each saved award. */
export function attendanceReward(day: number, streak: number): SocialReward {
  if (!Number.isSafeInteger(day) || day < 1 || day > 31 || !Number.isSafeInteger(streak) || streak < 1) {
    throw new Error('Invalid attendance ordinal.');
  }
  let premium = day % 5 === 0 ? 10 : 0;
  premium = ({ 15: 20, 25: 30, 28: 40, 30: 50, 31: 60 } as Record<number, number>)[day] ?? premium;
  const streakPremium = streak % 7 ? 0 : streak % 28 === 0 ? 30 : streak % 14 === 0 ? 20 : 10;
  return { fractalis: 1000 + 500 * (day - 1), lycalis: premium + streakPremium, materials: {}, streakPremium };
}
