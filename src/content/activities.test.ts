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
  it('scales all 50 dungeon stages linearly from 10 to 100, capped at stage 45', () => {
    const levels = Array.from({ length: 50 }, (_, index) => elementalEnemyLevel(index + 1));
    expect(levels[0]).toBe(10);
    expect(levels[43]).toBe(98);
    expect(levels.slice(44)).toEqual([100, 100, 100, 100, 100, 100]);
    for (let stage = 1; stage <= 50; stage++) {
      expect(levels[stage - 1]).toBe(Math.round(10 + (Math.min(stage, 45) - 1) * 90 / 44));
      if (stage > 1) expect(levels[stage - 1]).toBeGreaterThanOrEqual(levels[stage - 2]);
    }
    for (const invalid of [0, 51, -1, 1.5, NaN, Infinity]) expect(() => elementalEnemyLevel(invalid)).toThrow('1 to 50');
  });
  it('partitions infusion eligibility exactly with no duplicated or missing elements', () => {
    expect(elements.filter((element) => element.infusion === 'heavens').map((element) => element.id)).toEqual([
      'infernic', 'aquatic', 'tectonic', 'efflorescent', 'atmospheric',
    ]);
    expect(elements.filter((element) => element.infusion === 'abyss').map((element) => element.id)).toEqual([
      'voltaic', 'luminous', 'ominous', 'tranquilitic', 'chaotic',
    ]);
    expect(infusionModes.map((mode) => [mode.stages, mode.startingLevel, mode.enemyTiers])).toEqual([[25, 80, 4], [25, 80, 4]]);
  });
  it('uses approved adjacent-rarity recipes for every element without defined quantities', () => {
    expect(evolutionRecipes.map((recipe) => recipe.rarities)).toEqual([
      ['Common'], ['Common', 'Uncommon'], ['Uncommon', 'Rare'], ['Rare', 'Epic'],
    ]);
    for (const element of elements) for (let from = 1; from <= 4; from++) {
      const result = evolutionRequirement(element.id, from);
      expect(result.dungeon).toBe(element.dungeon);
      expect(result.infusion).toBe(element.infusion);
      expect(result.requiresFractalis).toBe(true);
      expect(result.requiresInfusableEnemies).toBe(true);
      expect(result.quantitiesDefined).toBe(false);
      expect(result.to).toBe(from + 1);
    }
    for (const invalid of [0, 5, 1.5, NaN]) expect(() => evolutionRequirement('infernic', invalid)).toThrow('1 to 4');
  });
  it('renders all activities by type, gates unavailable modes, and previews starter recipes', () => {
    const markup = gameplayHub();
    for (const element of elements) expect(markup).toContain(element.dungeon);
    for (const mode of infusionModes) expect(markup).toContain(mode.name);
    expect(markup.match(/disabled>Dungeon not playable yet/g)).toHaveLength(10);
    expect(markup.match(/disabled>Infusion mode not playable yet/g)).toHaveLength(2);
    expect(markup).toContain('data-page="battle"');
    expect(markup).toContain('data-page="story"');
    expect(markup).toContain('data-page="events"');
    for (const starter of starters) {
      const detail = characterDetail(starter, 'upgrade-0');
      expect(detail).toContain('Evo.4 to Evo.5');
      expect(detail).toContain('Rare + Epic');
      expect(detail).toContain('Soar into the Heavens');
      expect(detail).toContain('No evolution resources have been granted or spent');
    }
  });
});
