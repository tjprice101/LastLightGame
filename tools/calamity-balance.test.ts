import { describe, expect, it } from 'vitest';
import { balanceBuilds, balanceGear, balanceSeeds } from './calamity-balance';
import { surveySquads, makeBattle, measureBattle, progressAt } from './battle-survey';
import { calamityActivities, calamityEncounter } from '../src/content/calamity';
import { enemyCombatStats } from '../src/content/stat-growth';
import { validateConduitElement, validateConduitSlots } from '../src/content/conduits';
import { getStarter } from '../src/content/starters';
import { createCalamityBattle, withMasterLoadouts } from '../src/game/battle';

describe('Calamity tuning and simulation integrity', () => {
  it('scales exactly the three intended enemy stats and preserves tier ordering across all bosses', () => {
    for (const { id } of calamityActivities) for (const tier of [1, 2, 3] as const) {
      const encounter = calamityEncounter(id, tier);
      const level = [145, 160, 170][tier - 1], factor = [1.03, .98, 1][tier - 1];
      const expected = enemyCombatStats(level, true);
      for (const stat of ['health', 'damage', 'defense'] as const) {
        expected[stat] = Math.round(expected[stat] * factor);
        if (tier !== 1) expect(encounter.stats[stat]).toBeGreaterThan(calamityEncounter(id, tier === 3 ? 2 : 1).stats[stat]);
      }
      expect(encounter.level).toBe(level);
      expect(encounter.stats).toEqual(expected);
    }
  });

  it('uses legal gear, unchanged playable levels and real upgraded Glassroot/Stasis combinations', () => {
    for (const squad of surveySquads) for (const build of balanceBuilds) {
      const gear = balanceGear(squad.roster, build);
      for (const id of squad.roster) {
        const slots = validateConduitSlots(gear.equipment[id]);
        expect(() => validateConduitElement(slots, getStarter(id).elementId)).not.toThrow();
        if (build === 'glassroot-stasis') {
          expect(slots).toContain('glassroot-gimbal');
          expect(slots).toContain('stasis-reliquary');
          expect(gear.upgrades['glassroot-gimbal']).toBe(5);
          expect(gear.upgrades['stasis-reliquary']).toBe(5);
          expect(gear.masters[id]).toBeTruthy();
        }
      }
    }
  });

  it('handles Calamitic extra actions even when the native rotation prefers an unavailable Normal Attack', () => {
    const state = makeBattle({ kind: 'calamity', activity: 'treasury', tier: 1 },
      ['ember', 'tide', 'sprout'], 105, 'calamitic5', 1);
    expect(() => measureBattle(state)).not.toThrow();
  });

  it.each(calamityActivities)('$id EX3 is clearable with the same legal complementary squad across multiple seeds', ({ id }) => {
    const roster = ['bliss', 'razor', 'aurora'] as const;
    const gear = balanceGear([...roster], 'glassroot-stasis');
    const progress = progressAt(105), team = Object.fromEntries(roster.map(member => [member, progress]));
    for (const seed of balanceSeeds) {
      const state = withMasterLoadouts(createCalamityBattle(id, 3, seed, roster[0], progress, roster,
        team, gear.equipment, [], gear.upgrades), gear.masters);
      expect(state.enemies[0].level).toBe(170);
      expect(state.allies.map(ally => ally.level)).toEqual([105, 105, 105]);
      expect(measureBattle(state).result.outcome, `${id} seed ${seed}`).toBe('win');
    }
  });
});
