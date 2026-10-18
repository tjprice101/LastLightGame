import { describe, expect, it } from 'vitest';
import { createBattle, createDungeonBattle, createInfusionBattle, endTurn } from '../game/battle';
import { attackFlair, attackEffectMarkup, attackPose, characterChoreography } from './battle-effects';
import { starters } from '../content/starters';
import { infusionModeStageCount } from '../content/activities';

describe('progressive cinematic attack flair', () => {
  it('gives all 16 characters authored signatures and distinct weapon/casting choreography', () => {
    expect(Object.keys(characterChoreography)).toHaveLength(starters.length);
    expect(new Set(Object.values(characterChoreography).map(profile => profile.signature)).size).toBe(16);
    for (const { id } of starters) {
      const unit = createBattle(1, [id]).allies[0];
      const before = structuredClone(unit);
      const flair = attackFlair(unit, 'skill1');
      expect(flair.signature).toBe(characterChoreography[id].signature);
      expect(attackEffectMarkup(flair)).toContain('<path d=');
      expect(unit).toEqual(before);
    }
    const poses = new Set(starters.map(({ id }) =>
      attackPose(attackFlair(createBattle(1, [id]).allies[0], 'light'), 100, 20, false)));
    expect(poses.size).toBe(7);
    const caster = attackFlair(createBattle(1, ['disciple']).allies[0], 'skill1');
    expect(attackPose(caster, 100, 20, false)).toContain('translateY');
    const archer = attackFlair(createBattle(1, ['sprout']).allies[0], 'light');
    expect(attackPose(archer, 100, 20, false)).toContain('translate(-18px');
  });

  it('keeps every evolution visibly increasing even at level 140 and bounds all ornament layers', () => {
    for (const { id } of starters) {
      const unit = createBattle(1, [id]).allies[0];
      let previous = -1;
      for (let evolution = 1; evolution <= 6; evolution++) {
        const flair = attackFlair({ ...unit, level: 140, evolution }, 'ultimate');
        expect(flair.power).toBeGreaterThan(previous);
        previous = flair.power;
        expect(flair.crowns).toBeLessThanOrEqual(6);
        expect(flair.arcs).toBeLessThanOrEqual(8);
        const markup = attackEffectMarkup(flair);
        expect(markup.match(/class="flair-signature"/g)).toHaveLength(flair.crowns);
        expect(markup.match(/class="flair-arc"/g)).toHaveLength(flair.arcs);
      }
      const base = attackFlair(unit, 'light');
      const final = attackFlair({ ...unit, level: 105, evolution: 6 }, 'ultimate');
      expect(final.crowns).toBeGreaterThan(base.crowns);
      expect(final.arcs).toBeGreaterThan(base.arcs);
      expect(final.windup).toBeGreaterThan(base.windup);
    }
  });
  it('increases actual layer counts and scale with level and evolution, without changing combat', () => {
    const actor = createBattle().allies[0];
    const original = structuredClone(actor);
    const base = attackFlair(actor, 'light');
    let previous = base.power;
    for (let level = 0; level <= 105; level++) {
      const flair = attackFlair({ ...actor, level }, 'light');
      expect(flair.power).toBeGreaterThanOrEqual(previous);
      previous = flair.power;
    }
    for (let evolution = 1; evolution < 6; evolution++) expect(
      attackFlair({ ...actor, level: 90, evolution: evolution + 1 }, 'light').power
    ).toBeGreaterThan(attackFlair({ ...actor, level: 90, evolution }, 'light').power);
    const final = attackFlair({ ...actor, level: 105, evolution: 6 }, 'ultimate');
    expect(final.power).toBe(1);
    expect(final.sparks).toBe(32);
    expect(final.rings).toBe(5);
    expect(final.rays).toBe(12);
    expect(final.size).toBeGreaterThan(base.size * 2);
    const markup = attackEffectMarkup(final);
    expect(markup.match(/class="flair-spark"/g)).toHaveLength(final.sparks);
    expect(markup.match(/class="flair-ring"/g)).toHaveLength(final.rings);
    expect(actor).toEqual(original);
  });

  it('uses live enemy levels and intensifies scheduled abilities with mode-specific flair', () => {
    const early = createDungeonBattle('infernic', 1, 1729, 'ember', { level: 0, evolution: 1 }).enemies[0];
    const final = createDungeonBattle('infernic', 35, 1729, 'ember', { level: 105, evolution: 6 }).enemies[0];
    expect(attackFlair(final, 'light').power).toBe(1);
    expect(attackFlair(final, 'light').sparks).toBeGreaterThan(attackFlair(early, 'light').sparks);
    for (const [mode, family] of [['heavens', 'radiant'], ['abyss', 'void']] as const) {
      const state = createInfusionBattle(mode, infusionModeStageCount, 1729, 'ember', { level: 105, evolution: 6 });
      state.round = 2;
      const event = endTurn(state).events.find((event) => event.kind === 'attack');
      expect(event?.enhancedAttack).toBe(true);
      const enemy = state.enemies[0];
      const normal = attackFlair(enemy, 'light');
      const skill = attackFlair(enemy, 'light', event?.enhancedAttack);
      expect(skill.family).toBe(family);
      expect(skill.sparks).toBeGreaterThan(normal.sparks);
      expect(skill.duration).toBeGreaterThan(normal.duration);
    }
  });

  it('has distinct starter effects and bounded work at the largest supported levels', () => {
    for (const [id, family] of [['ember', 'flame'], ['tide', 'tide'], ['sprout', 'bloom']] as const) {
      const unit = createBattle(1, [id]).allies[0];
      expect(attackFlair(unit, 'skill1').family).toBe(family);
    }
    const enemy = createBattle().enemies[0];
    expect(attackFlair({ ...enemy, level: 10000 }, 'ultimate').sparks).toBe(32);
    expect(() => attackFlair({ ...enemy, level: NaN }, 'light')).toThrow('valid combatant');
  });
});
