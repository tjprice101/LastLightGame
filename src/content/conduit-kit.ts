import type { ActionId } from './combat';
import type { KitPilotResourceKey } from './kit-pilots';

export type OmnicTrigger = 'burn-tick' | 'burn-applied' | 'shield-absorbed' | 'shield-grown' |
  'heal' | 'critical' | 'weaken-applied' | 'direct' | 'fracture-spent' | 'resource-spent' |
  'support' | 'defense' | 'activation';
export type OmnicRecipient = 'self' | 'target' | 'injured-other' | 'injured' | 'lowest-gauge-other' | 'all-allies' |
  /** Enemy recipients, valid only for `strike` outcomes. */
  'struck' | 'attacker' | 'all-enemies';
export interface OmnicOutcome {
  kind: 'gauge' | 'heal' | 'shield' | 'cooldown' | 'burn-clock' | 'fracture' | 'boost' | 'protection' |
    /** Bonus Conduit damage: `amount` x owner Attack (Defense-mitigated) plus `ratio` x the triggering amount. */
    'strike' |
    /** Grants the owner's own kit resource charges (maximum 3). */
    'charge' |
    /** Extends the owner's existing Weaken on the triggering enemy, maximum three phases. */
    'weaken-clock';
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
  /** The owner is at or below half Health when the trigger resolves. */
  selfBelowHalf?: boolean;
  resources?: readonly KitPilotResourceKey[];
  bank?: { trigger: OmnicTrigger; maximum: number; other?: boolean };
  outcomes: readonly OmnicOutcome[];
}
export interface ConduitKitEffects {
  rule: OmnicRule;
}
