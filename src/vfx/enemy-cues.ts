/**
 * Enemy attack cues (D-491, Spectacle step 6). Pure presentation data: which tier an enemy
 * action is, which attack family draws it, and the pre-turn charging warning. Read from the
 * frozen run's enemy definitions and the round only; never touches combat state, RNG or rewards.
 *
 * The round stays fixed from the player phase through the enemy phase (it advances in
 * `finish-enemy-phase`), so the warning shown during the player phase names exactly the skill
 * `radiantPressureEnemyAction` schedules with `scheduledEnemySkill(skills, state.round)`.
 */
import { scheduledEnemySkill, type EnemySkill } from '../content/enemy-skills';
import type { BurstKind } from './element-styles';
import type { EnemyTier } from './spectacle-timing';

/** Devourers pounce with a claw cut; Constructs brace and fire; War forms fight as their corrupted bearer;
 * Calamity bosses rise heavily and follow their authored volley patterns. */
export type EnemyFamily = 'devourer' | 'construct' | 'war' | 'calamity';
/** The enemy fields a cue needs (a subset of `RadiantPressureEnemy`). */
export interface EnemyCueSource {
  id: string;
  identity: string;
  elementId: string;
  category: 'ordinary' | 'boss' | 'calamity';
  skills: readonly EnemySkill[];
  pattern?: { hits?: number };
}
export interface EnemyActionCue {
  enemyId: string;
  tier: EnemyTier;
  /** The scheduled skill's name; null for a plain Attack. */
  skillName: string | null;
  family: EnemyFamily;
  /** War forms: the corrupted bearer's starter id, whose signature layer they use from Strike up. */
  starter: string | null;
  elementId: string;
}

const tierOf: Record<EnemySkill['action'], EnemyTier> = { skill1: 'strike', skill2: 'overdrive', ultimate: 'special' };

/** Family from the enemy's identity; unknown identities fall back to Devourer. */
export function enemyFamily(identity: string, category: EnemyCueSource['category']): { family: EnemyFamily; starter: string | null } {
  const war = /^war:([a-z0-9-]+):/.exec(identity);
  if (war) return { family: 'war', starter: war[1] };
  if (category === 'calamity' || identity.startsWith('calamity:')) return { family: 'calamity', starter: null };
  if (identity.startsWith('oblivion:') || identity.startsWith('infusion:machines:')) return { family: 'construct', starter: null };
  return { family: 'devourer', starter: null };
}

/** The cue for this enemy's action in the enemy phase of `round`. */
export function enemyActionCue(enemy: EnemyCueSource, round: number): EnemyActionCue {
  const skill = Number.isInteger(round) && round >= 1 ? scheduledEnemySkill(enemy.skills, round) : undefined;
  return { enemyId: enemy.id, tier: skill ? tierOf[skill.action] : 'attack', skillName: skill?.name ?? null,
    ...enemyFamily(enemy.identity, enemy.category), elementId: enemy.elementId };
}

export interface ChargingSpecial {
  tier: Extract<EnemyTier, 'overdrive' | 'special'>;
  /** Full skill name, e.g. "Last Ruin: Ember Wyrm Strike" or "Crown Collapse". */
  name: string;
  /** Short visible tag: "Overdrive", "Last Ruin", or a Calamity ruin's own name. */
  tag: string;
  /** Accessible label; never names a target (targets are chosen in the enemy phase). */
  label: string;
}
/** E4 pre-turn warning (owner, D-491): only Overdrive and boss specials, never plain Attacks or Strikes. */
export function chargingSpecial(enemy: EnemyCueSource, round: number): ChargingSpecial | null {
  const cue = enemyActionCue(enemy, round);
  if ((cue.tier !== 'overdrive' && cue.tier !== 'special') || !cue.skillName) return null;
  const split = cue.skillName.indexOf(':');
  const tag = split > 0 ? cue.skillName.slice(0, split) : cue.skillName;
  return { tier: cue.tier, name: cue.skillName, tag, label: `Charging ${cue.skillName} this turn` };
}

/**
 * Impact burst per tier (E3): Attack, Strike and Overdrive stay smaller than a player Skill 1
 * (D-485 owner rule); the boss special reaches player Skill 2 size, never larger.
 */
export const enemyBursts: Record<EnemyTier, { kind: Extract<BurstKind, 'enemy' | 'skill1' | 'skill2'>; intensity: number }> = {
  attack: { kind: 'enemy', intensity: 1 },
  strike: { kind: 'skill1', intensity: .8 },
  overdrive: { kind: 'skill1', intensity: .92 },
  special: { kind: 'skill2', intensity: 1 },
};
/** Wind-up glow, sigil and travel weight per tier (player tiers use 0 / .35 / .65 / 1). */
export const enemyPower: Record<EnemyTier, number> = { attack: 0, strike: .3, overdrive: .5, special: .65 };
