import { calamityActivities, calamityEncounter, type CalamityTier } from '../src/content/calamity';
import { enemyCombatStats } from '../src/content/stat-growth';
import { getStarter } from '../src/content/starters';
import { validateConduitElement, validateConduitSlots } from '../src/content/conduits';
import { createCalamityBattle, withMasterLoadouts } from '../src/game/battle';
import { loadout, measureBattle, progressAt, surveySquads, type Outcome, type Policy } from './battle-survey';

export const balanceSeeds = [1, 1729, 104729];
export const balanceBuilds = ['bare', 'mixed0', 'mixed5', 'master5', 'glassroot-stasis', 'calamitic5'] as const;
export type BalanceBuild = typeof balanceBuilds[number];
export type BalanceVariant = 'previous' | 'candidate' | 'current';
export const balanceLimits = { rounds: 100, decisions: 1800 };

export function balanceGear(roster: typeof surveySquads[number]['roster'], build: BalanceBuild) {
  const gear = loadout(roster, build === 'glassroot-stasis' ? 'master5' : build);
  if (build === 'glassroot-stasis') {
    for (const id of roster) {
      const slots = gear.equipment[id]!;
      slots[2] = 'glassroot-gimbal';
      slots[3] = 'stasis-reliquary';
      for (const piece of slots) if (piece) gear.upgrades[piece] = 5;
    }
  }
  for (const id of roster)
    validateConduitElement(validateConduitSlots(gear.equipment[id]), getStarter(id).elementId);
  return gear;
}

export interface CalamityBalanceRow extends Outcome {
  variant: BalanceVariant;
  squad: string;
  build: BalanceBuild;
  activity: typeof calamityActivities[number]['id'];
  tier: CalamityTier;
  seed: number;
  policy: Policy;
  enemyLevel: number;
}

export function runCalamityBalance(variant: BalanceVariant, emit: (row: CalamityBalanceRow) => void): number {
  let count = 0;
  for (const squad of surveySquads) for (const build of balanceBuilds) {
    const gear = balanceGear(squad.roster, build);
    const progress = progressAt(105), team = Object.fromEntries(squad.roster.map(id => [id, progress]));
    for (const { id: activity } of calamityActivities) for (const tier of [1, 2, 3] as const)
      for (const seed of balanceSeeds) {
        // A second rotation tests whether results depend on the native-aware pilot.
        const policies: Policy[] = build === 'calamitic5' || build === 'glassroot-stasis'
          ? ['native', 'flare-first'] : ['native'];
        for (const policy of policies) {
          const state = withMasterLoadouts(createCalamityBattle(activity, tier, seed, squad.roster[0],
            progress, squad.roster, team, gear.equipment, [], gear.upgrades), gear.masters);
          const enemy = state.enemies[0];
          if (variant !== 'current') {
            const level = (variant === 'previous' ? [145, 160, 185] : [145, 160, 170])[tier - 1];
            const factor = variant === 'previous' ? 1 : [1.03, .98, 1][tier - 1];
            enemy.level = level;
            enemy.stats = enemyCombatStats(level, true);
            for (const stat of ['health', 'damage', 'defense'] as const)
              enemy.stats[stat] = Math.round(enemy.stats[stat] * factor);
            enemy.hp = enemy.stats.health;
          } else if (enemy.level !== calamityEncounter(activity, tier).level) {
            throw new Error('Simulation did not spawn the current Calamity definition.');
          }
          emit({ ...measureBattle(state, policy, balanceLimits).result, variant, squad: squad.name,
            build, activity, tier, seed, policy, enemyLevel: enemy.level! });
          count++;
        }
      }
  }
  return count;
}
