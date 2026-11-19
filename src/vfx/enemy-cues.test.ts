import { describe, expect, it } from 'vitest';
import { enemySkills, scheduledEnemySkill } from '../content/enemy-skills';
import { calamityEncounter, calamityPatterns } from '../content/calamity';
import { radiantPressureEnemyAction } from '../game/enemy-pressure';
import type { RadiantCombatState } from '../game/combat-engine';
import type { RadiantPressureEnemy } from '../game/enemy-pressure-encounters';
import { chargingSpecial, enemyActionCue, enemyBursts, enemyFamily, type EnemyCueSource } from './enemy-cues';
import { elementStyles } from './element-styles';
import { bearerElementStyle } from './bearer-signatures';
import { enemyBeatPlan, enemyScreenTools, enemyTiers, screenTools, spectacleBeatTable } from './spectacle-timing';

const boss: EnemyCueSource = { id: 'e1', identity: 'story:infernic:boss', elementId: 'infernic', category: 'boss',
  skills: enemySkills(60, true, 'Ember Wyrm Strike', 1.5) };
const grunt: EnemyCueSource = { id: 'e2', identity: 'story:oceanic:2', elementId: 'oceanic', category: 'ordinary',
  skills: enemySkills(60, false, 'Tide Imp Strike', 1.4) };
const calamity: EnemyCueSource = { id: 'e3', identity: 'calamity:treasury', elementId: 'botanic', category: 'calamity',
  skills: calamityEncounter('treasury', 1).skills, pattern: calamityPatterns.treasury };

describe('Enemy attack cues (D-491, Spectacle step 6)', () => {
  it('maps the scheduled skill to a tier and names it', () => {
    // Boss: Strike every 2 rounds, Last Ruin every 6 (it wins over the Strike on round 6).
    expect(enemyActionCue(boss, 1)).toMatchObject({ tier: 'attack', skillName: null });
    expect(enemyActionCue(boss, 2)).toMatchObject({ tier: 'strike', skillName: 'Ember Wyrm Strike' });
    expect(enemyActionCue(boss, 6)).toMatchObject({ tier: 'special', skillName: 'Last Ruin: Ember Wyrm Strike' });
    // Ordinary: Strike every 3, Overdrive every 5.
    expect(enemyActionCue(grunt, 3).tier).toBe('strike');
    expect(enemyActionCue(grunt, 5)).toMatchObject({ tier: 'overdrive', skillName: 'Overdrive: Tide Imp Strike' });
    expect(enemyActionCue(grunt, 15).tier).toBe('overdrive');
    // Calamity: authored names.
    expect(enemyActionCue(calamity, 3)).toMatchObject({ tier: 'strike', skillName: 'Vaultbreaker', family: 'calamity' });
    expect(enemyActionCue(calamity, 6)).toMatchObject({ tier: 'special', skillName: 'Crown Collapse' });
  });
  it('matches the coefficient the engine schedules for that round', () => {
    const state = (round: number) => ({ round,
      bearers: [{ hp: 10, stats: { hp: 10 }, loadout: { id: 'b1', starter: 'ember' } }],
      enemies: [{ id: 'e1', stats: { hp: 100 } }, { id: 'e2', stats: { hp: 100 } }, { id: 'e3', stats: { hp: 100 } }],
    }) as unknown as RadiantCombatState;
    for (const enemy of [boss, grunt, calamity]) for (let round = 1; round <= 42; round++) {
      const action = radiantPressureEnemyAction(state(round), enemy as unknown as RadiantPressureEnemy, () => .5);
      const cue = enemyActionCue(enemy, round);
      const skill = enemy.skills.find(entry => entry.name === cue.skillName);
      expect(action.coefficient, `${enemy.id} round ${round}`).toBe(skill?.multiplier ?? 1);
      expect(cue.skillName).toBe(scheduledEnemySkill(enemy.skills, round)?.name ?? null);
    }
  });
  it('derives four families from the identity, with a Devourer fallback', () => {
    expect(enemyFamily('war:nerithe:6', 'boss')).toEqual({ family: 'war', starter: 'nerithe' });
    expect(enemyFamily('calamity:abyss', 'calamity').family).toBe('calamity');
    expect(enemyFamily('oblivion:glassbound-sentry', 'ordinary').family).toBe('construct');
    expect(enemyFamily('infusion:machines:3', 'ordinary').family).toBe('construct');
    for (const identity of ['story:botanic:1', 'adventure:slime', 'infusion:roses:2', 'dungeon-something', 'unknown'])
      expect(enemyFamily(identity, 'ordinary').family, identity).toBe('devourer');
  });
  it('warns before the turn only for Overdrive and boss specials, never naming a target', () => {
    expect(chargingSpecial(boss, 2)).toBeNull();
    expect(chargingSpecial(boss, 1)).toBeNull();
    expect(chargingSpecial(boss, 6)).toEqual({ tier: 'special', name: 'Last Ruin: Ember Wyrm Strike', tag: 'Last Ruin',
      label: 'Charging Last Ruin: Ember Wyrm Strike this turn' });
    expect(chargingSpecial(grunt, 5)).toMatchObject({ tier: 'overdrive', tag: 'Overdrive' });
    expect(chargingSpecial(calamity, 6)).toMatchObject({ tag: 'Crown Collapse', label: 'Charging Crown Collapse this turn' });
  });
  it('escalates enemy timing by tier and keeps the special below a Sparkling Convergent Light', () => {
    const totals = enemyTiers.map(tier => enemyBeatPlan(tier, 1).total);
    for (let index = 1; index < totals.length; index++) expect(totals[index]).toBeGreaterThan(totals[index - 1]);
    expect(totals).toEqual([650, 850, 1100, 1600]);
    // Owner (D-491): about 1.6 s at Skill 2 weight. Below Convergent Light means weight: a soft flash, never the full
    // flash, and no heavier shake or hit-stop than a Sparkling finisher.
    expect(totals.at(-1)!).toBeLessThanOrEqual(spectacleBeatTable.flare.glimmering.reduce((sum, value) => sum + value, 0));
    const sparkling = screenTools('flare', 'sparkling');
    expect(enemyScreenTools('special').shake).toBeLessThanOrEqual(sparkling.shake);
    expect(enemyScreenTools('special').hitStop).toBeLessThanOrEqual(sparkling.hitStop);
    for (const tier of enemyTiers) for (const hits of [1, 3, 4]) {
      const plan = enemyBeatPlan(tier, hits);
      expect(plan.slots).toHaveLength(hits);
      expect(plan.slots.reduce((sum, slot) => sum + slot, 0)).toBeCloseTo(plan.impact, 6);
    }
    expect(enemyScreenTools('special')).toMatchObject({ dim: .3, flash: 'soft' });
    for (const tier of enemyTiers) {
      expect(enemyScreenTools(tier).flash).not.toBe('full');
      expect(enemyScreenTools(tier).shake).toBeLessThanOrEqual(screenTools('skill2', null).shake + 1);
    }
  });
  it('keeps Attack, Strike and Overdrive bursts smaller than a player Skill 1 and the special no larger than Skill 2', () => {
    const largest = (layers: { size: number }[]) => Math.max(...layers.map(layer => layer.size));
    const styles = [...Object.values(elementStyles), bearerElementStyle('nerithe', 'oceanic'), bearerElementStyle('caldrex', 'infernic')];
    for (const style of styles) {
      const skill1 = largest(style.layers.skill1), skill2 = largest(style.layers.skill2);
      for (const tier of ['attack', 'strike', 'overdrive'] as const) {
        const burst = enemyBursts[tier];
        expect(largest(style.layers[burst.kind]) * burst.intensity, `${style.id} ${tier}`).toBeLessThan(skill1);
      }
      const special = enemyBursts.special;
      expect(largest(style.layers[special.kind]) * special.intensity, style.id).toBeLessThanOrEqual(skill2);
    }
  });
});
