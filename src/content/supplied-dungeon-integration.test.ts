import { describe, expect, it } from 'vitest';
import { dungeonArt, materialArt } from './dungeon-art';
import { dungeonEncounter, materialDrops, materialLoot } from './dungeons';
import { createDungeonBattle, endTurn } from '../game/battle';
import { creatures, creatureLoot } from './creatures';
import { unitFacing } from '../presentation/unit-facing';

describe.each([
  { title: 'City of Heaven', element: 'tranquilitic', slug: 'city-of-heaven', ultimate: 'Unbroken Accord' },
  { title: 'Galvanic Field', element: 'voltaic', slug: 'galvanic-field', ultimate: 'Living Storm' },
] as const)('$title integration', ({ element, slug, ultimate }) => {
  it('uses all eight supplied enemies in order with unique skills through all 35 stages', () => {
    const pack = dungeonArt[element]!;
    expect(pack.enemies).toHaveLength(8);
    expect(new Set(pack.enemies.map((enemy) => enemy.ability)).size).toBe(8);
    const seen = new Set<string>();
    for (let stage = 1; stage <= 35; stage++) {
      const encounter = dungeonEncounter(element, stage);
      const state = createDungeonBattle(element, stage, 1729, 'ember', { level: 105, evolution: 6 });
      expect(encounter.background).toBe(`${slug}.png`);
      expect(encounter.ability).toBe(pack.enemies[encounter.tier].ability);
      seen.add(encounter.enemy.art!);
      for (const enemy of state.enemies) {
        expect(enemy.art).toBe(encounter.enemy.art);
        expect(enemy.enemySkills?.[0].name).toBe(encounter.ability);
        expect(enemy.enemySkills).toHaveLength(encounter.level < 50 ? 1 : 2);
        expect(unitFacing(enemy.art!, 'enemy').facing).toBe('right');
      }
    }
    expect([...seen]).toEqual(pack.enemies.map((enemy) => enemy.art));
  });

  it('executes the Sovereign boss ultimate as one stronger named attack', () => {
    const state = createDungeonBattle(element, 35, 1729, 'ember', { level: 105, evolution: 6 });
    state.round = 6;
    const skills = state.enemies[0].enemySkills!;
    expect(skills[1].action).toBe('ultimate');
    expect(skills[1].multiplier).toBeGreaterThan(skills[0].multiplier);
    const attacks = endTurn(state).events.filter((event) => event.kind === 'attack');
    expect(attacks).toHaveLength(1);
    expect(attacks[0]).toMatchObject({ action: 'ultimate', abilityName: `Last Ruin: ${ultimate}`, enhancedAttack: true });
  });

  it('registers matching material icons and stage-specific glossary drop chances', () => {
    const catalog = creatures.filter((creature) => creature.element === element);
    expect(catalog).toHaveLength(8);
    for (const creature of catalog) {
      expect(creature.art).toBeDefined();
      for (const stage of creature.stages) {
        const loot = creatureLoot(creature, stage);
        expect(loot[0]).toMatchObject({ id: 'fractalis', chance: 1 });
        expect(loot[1]).toMatchObject({ id: `${element}-common`, chance: 1 });
        expect(loot.slice(1)).toEqual(materialLoot(element, stage));
        for (const drop of loot.filter((entry) => entry.id !== 'fractalis')) {
          expect(materialArt(drop.id)?.startsWith(`${element}-`)).toBe(true);
        }
        expect(Object.keys(materialDrops(element, stage, () => 0)).every((key) => key.startsWith(`${element}-`))).toBe(true);
      }
    }
  });
});
