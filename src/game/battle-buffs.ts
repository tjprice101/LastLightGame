import type { Combatant } from './battle';

export interface BattleBuffSnapshot {
  shield: number;
  defending: boolean;
  recoverThrough: number;
  attackBoost?: { fraction: number; throughRound: number };
  protection: number;
}

export function buffSnapshot(unit: Combatant): BattleBuffSnapshot {
  if (unit.hp <= 0) return { shield: 0, defending: false, recoverThrough: 0, protection: 0 };
  return {
    shield: unit.shield, defending: unit.defending, recoverThrough: unit.recoverThrough,
    ...(unit.attackBoost ? { attackBoost: { fraction: unit.attackBoost.fraction, throughRound: unit.attackBoost.throughRound } } : {}),
    protection: unit.omnicProtection ?? 0,
  };
}
