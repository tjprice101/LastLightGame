import type { ActionId } from './combat';
import type { KitPilotResourceKey } from './kit-pilots';

export type OmnicTrigger = 'burn-tick' | 'burn-applied' | 'shield-absorbed' | 'shield-grown' |
  'heal' | 'critical' | 'weaken-applied' | 'direct' | 'fracture-spent' | 'resource-spent' |
  'support' | 'defense';
export type OmnicRecipient = 'self' | 'target' | 'injured-other' | 'injured' | 'lowest-gauge-other';
export interface OmnicOutcome {
  kind: 'gauge' | 'heal' | 'shield' | 'cooldown' | 'burn-clock' | 'fracture' | 'boost' | 'protection';
  recipient?: OmnicRecipient;
  amount: number;
  /** HP-relative ceiling, independent of account Conduit upgrades. */
  cap?: number;
  /** Actual triggering amount coefficient (damage, healing, absorption or resource count). */
  ratio?: number;
  bothSkills?: boolean;
}
export interface OmnicRule {
  trigger: OmnicTrigger;
  actions?: readonly ActionId[];
  other?: boolean;
  belowHalf?: boolean;
  ownBurn?: boolean;
  ownWeaken?: boolean;
  lethal?: boolean;
  resources?: readonly KitPilotResourceKey[];
  bank?: { trigger: OmnicTrigger; maximum: number; other?: boolean };
  outcomes: readonly OmnicOutcome[];
}
export interface ConduitKitEffects {
  rule: OmnicRule;
}
