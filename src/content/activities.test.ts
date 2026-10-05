import { describe, expect, it } from 'vitest';
import { elements, elementalMaterials, elementalEnemyLevel, evolutionRequirement, evolutionRecipes, infusionModes, materialRarities } from './activities';
import { starters } from './starters';
import { gameplayHub } from '../presentation/gameplay';
import { characterDetail } from '../presentation/hub';

describe('activity and progression framework', () => {
  it('maps all ten canonical elements to their exact dungeons in owner order', () => {
    expect(elements.map((element) => element.name)).toEqual([
      'Infernic', 'Aquatic', 'Tectonic', 'Efflorescent', 'Voltaic', 'Atmospheric', 'Luminous', 'Ominous', 'Tranquilitic', 'Chaotic',
    ]);
    expect(elements.map((element) => element.dungeon)).toEqual([
      'Flaming Depths', 'Oceanic Valley', 'Precipice of the Earth', 'Garden of Beauty', 'Galvanic Field',
      'Sky-bound Rift', 'Lustrous River', 'Valley of Solitude', 'City of Heaven', 'Ruins of Chaos',
    ]);
    expect(new Set(elements.map((element) => element.id)).size).toBe(10);
    expect(starters.map((starter) => starter.elementId)).toEqual(['infernic', 'aquatic', 'efflorescent']);
    expect(starters.map((starter) => starter.id)).toEqual(['ember', 'tide', 'sprout']);
  });
  it('defines sixty distinct elemental materials without inventing inventory or rates', () => {
    expect(materialRarities).toEqual(['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Omnic']);
    expect(elementalMaterials).toHaveLength(60);
    expect(new Set(elementalMaterials.map((material) => material.id)).size).toBe(60);
    for (const element of elements) {
      expect(elementalMaterials.filter((material) => material.elementId === element.id).map((material) => material.rarity)).toEqual(materialRarities);
    }
  });
  it('scales all 35 dungeon stages linearly from 10 to 120', () => {
    const levels = Array.from({ length: 35 }, (_, index) => elementalEnemyLevel(index + 1));
    expect(levels[0]).toBe(10);
    expect(levels[34]).toBe(120);
    for (let stage = 1; stage <= 35; stage++) {
      expect(levels[stage - 1]).toBe(Math.round(10 + (stage - 1) * 110 / 34));
      if (stage > 1) expect(levels[stage - 1]).toBeGreaterThanOrEqual(levels[stage - 2]);
    }
    for (const invalid of [0, 36, -1, 1.5, NaN, Infinity]) expect(() => elementalEnemyLevel(invalid)).toThrow('1 to 35');
  });
  it('partitions infusion eligibility exactly with no duplicated or missing elements', () => {
    expect(elements.filter((element) => element.infusion === 'heavens').map((element) => element.id)).toEqual([
      'infernic', 'aquatic', 'tectonic', 'efflorescent', 'atmospheric',
    ]);
    expect(elements.filter((element) => element.infusion === 'abyss').map((element) => element.id)).toEqual([
      'voltaic', 'luminous', 'ominous', 'tranquilitic', 'chaotic',
    ]);
    expect(infusionModes.map((mode) => [mode.stages, mode.startingLevel, mode.enemyTiers])).toEqual([[35, 80, 6], [35, 80, 6]]);
  });
  it('uses approved adjacent-rarity recipes with first-pass costs and deferred creature consumption', () => {
    expect(evolutionRecipes.map((recipe) => recipe.rarities)).toEqual([
      ['Common'], ['Common', 'Uncommon'], ['Uncommon', 'Rare'], ['Rare', 'Epic'], ['Epic', 'Legendary'],
    ]);
    for (const element of elements) for (let from = 1; from <= 5; from++) {
      const result = evolutionRequirement(element.id, from);
      expect(result.dungeon).toBe(element.dungeon);
      expect(result.infusion).toBe(element.infusion);
      expect(result.requiresFractalis).toBe(true);
      expect(result.requiresInfusableEnemies).toBe(false);
      expect(result.quantitiesDefined).toBe(true);
      expect(result.to).toBe(from + 1);
    }
    for (const invalid of [0, 6, 1.5, NaN]) expect(() => evolutionRequirement('infernic', invalid)).toThrow('1 to 5');
  });
  it('renders all activities by type, gates unavailable modes, and previews starter recipes', () => {
    const markup = gameplayHub();
    for (const element of elements) expect(markup).toContain(element.dungeon);
    for (const mode of infusionModes) expect(markup).toContain(mode.name);
    expect(markup).not.toContain('Dungeon not playable yet');
    expect(markup.match(/data-dungeon="/g)).toHaveLength(10);
    expect(markup.match(/35 stages \/ Enemy levels 10-120/g)).toHaveLength(10);
    expect(markup.match(/data-infusion="/g)).toHaveLength(2);
    expect(markup).toContain('data-page="battle"');
    expect(markup).toContain('data-page="story"');
    expect(markup).toContain('data-page="events"');
    for (const starter of starters) {
      const detail = characterDetail(starter, 'upgrade-0');
      expect(detail).toContain('Evo.1');
      expect(detail).toContain('Reach Lv.30');
      expect(detail).toContain(`Seed of ${elements.find((element) => element.id === starter.elementId)?.name}`);
      expect(detail).not.toContain('Costs unset');
    }
  });
});
