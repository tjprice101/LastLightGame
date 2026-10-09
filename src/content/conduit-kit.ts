import type { ActionId } from './combat';

export interface ConduitKitEffects {
  damage?: { actions: readonly ActionId[]; bonus: number; condition?: 'burning' | 'weakened' | 'shielded' }[];
  healing?: number;
  healingBelowHalf?: number;
  shield?: number;
  burn?: number;
  weaken?: number;
  normalGauge?: number;
  defenseGauge?: number;
  defenseReduction?: number;
  healGauge?: number;
  shieldGauge?: number;
  criticalDamage?: number;
  ultimateBurnBonus?: number;
  shieldRecipientGauge?: number;
  criticalCooldown?: number;
  healedSkillCharge?: number;
  defenseTeamShield?: number;
  weakenedSkillGauge?: number;
  ultimatePierce?: number;
}
