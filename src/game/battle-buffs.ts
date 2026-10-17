import type { Combatant } from './battle';

export interface BattleBuffSnapshot {
  shield: number;
  recoverThrough: number;
  attackBoost?: { fraction: number; throughRound: number };
  protection: number;
}

export function buffSnapshot(unit: Combatant): BattleBuffSnapshot {
  if (unit.hp <= 0) return { shield: 0, recoverThrough: 0, protection: 0 };
  return {
    shield: unit.shield, recoverThrough: unit.recoverThrough,
    ...(unit.attackBoost ? { attackBoost: { fraction: unit.attackBoost.fraction, throughRound: unit.attackBoost.throughRound } } : {}),
    protection: unit.omnicProtection ?? 0,
  };
}
