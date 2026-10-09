import { describe, expect, it } from 'vitest';
import { dungeonArt, legacyDungeonArt, materialArt } from './dungeon-art';
import { dungeonEncounter, dungeonVariants, materialDrops, materialLoot } from './dungeons';
import { elementAssetIds, elementSources } from './element-migration';
import { createDungeonBattle, endTurn } from '../game/battle';
import { creatures, creatureLoot } from './creatures';
import { unitFacing } from '../presentation/unit-facing';

describe.each([
  { title: 'City of Heaven', element: 'tranquilitic', source: 'tranquilitic', ultimate: 'Unbroken Accord' },
  { title: 'Galvanic Field', element: 'atmospheric', source: 'voltaic', ultimate: 'Living Storm' },
] as const)('$title integration', ({ element, source, ultimate }) => {
  it('uses all eight supplied enemies in order with unique skills through all 35 stages', () => {
    const pack = legacyDungeonArt[source]!;
    expect(pack.enemies).toHaveLength(8);
    expect(new Set(pack.enemies.map((enemy) => enemy.ability)).size).toBe(8);
    const seen = new Set<string>();
    for (let stage = 1; stage <= 35; stage++) {
      const encounter = dungeonEncounter(element, stage, elementSources[element].findIndex((id) => id === source));
      const state = createDungeonBattle(element, stage, 1729, 'ember', { level: 105, evolution: 6 });
      expect(encounter.background).toBe(dungeonArt[element] ? `${dungeonArt[element]!.slug}.png` : undefined);
      expect(encounter.ability).toBe(pack.enemies[encounter.tier].ability);
      seen.add(encounter.enemy.art!);
      for (const enemy of state.enemies) {
        const variant = dungeonVariants(element, stage).find((entry) => entry.creatureId === enemy.creatureId)!;
        expect(enemy.art).toBe(variant.enemy.art);
        expect(enemy.enemySkills?.[0].name).toBe(variant.ability);
        expect(enemy.enemySkills).toHaveLength(encounter.level < 50 ? 1 : 2);
        expect(unitFacing(enemy.art!, 'enemy').facing).toBe('right');
      }
    }
    expect([...seen]).toEqual(pack.enemies.map((enemy) => enemy.art));
  });

  it('executes the Sovereign boss ultimate as one stronger named attack', () => {
    const state = Array.from({ length: 100 }, (_, seed) => createDungeonBattle(element, 35, ((seed + 1) * 2654435761) >>> 0, 'ember', { level: 105, evolution: 6 }))
      .find((battle) => battle.enemies[0].creatureId === `dungeon:${source}:7`)!;
    expect(state).toBeDefined();
    state.round = 6;
    const skills = state.enemies[0].enemySkills!;
    expect(skills[1].action).toBe('ultimate');
    expect(skills[1].multiplier).toBeGreaterThan(skills[0].multiplier);
    const attacks = endTurn(state).events.filter((event) => event.kind === 'attack');
    expect(attacks).toHaveLength(1);
    expect(attacks[0]).toMatchObject({ action: 'ultimate', abilityName: `Last Ruin: ${ultimate}`, enhancedAttack: true });
  });

  it('registers matching material icons and stage-specific glossary drop chances', () => {
    const catalog = creatures.filter((creature) => creature.id.startsWith(`dungeon:${source}:`));
    expect(catalog).toHaveLength(8);
    for (const creature of catalog) {
      expect(creature.art).toBeDefined();
      for (const stage of creature.stages) {
        const loot = creatureLoot(creature, stage);
        expect(loot[0]).toMatchObject({ id: 'fractalis', chance: 1 });
        expect(loot[1]).toMatchObject({ id: `${element}-common`, chance: 1 });
        expect(loot.slice(1)).toEqual(materialLoot(element, stage));
        for (const drop of loot.filter((entry) => entry.id !== 'fractalis')) {
          if (dungeonArt[element]) expect(materialArt(drop.id)?.startsWith(`${elementAssetIds[element]}-`)).toBe(true);
          else expect(materialArt(drop.id)).toBeUndefined();
        }
        expect(Object.keys(materialDrops(element, stage, () => 0)).every((key) => key.startsWith(`${element}-`))).toBe(true);
      }
    }
  });
});
