import { describe, expect, it } from 'vitest';
import { elements, materialRarities } from '../content/activities';
import { characterLevelCost, levelingMaterials, levelCost, type CharacterProgress } from '../content/progression';
import { isRoseCharacter, starters } from '../content/starters';
import { capturedLevelCost, createCreatureCopy } from './character-instances';
import { ACCOUNT_KEY, emptyAccount, levelCharacterToMaximum, maxLevelPlan, saveAccount, upgradeCharacter } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { maxLevelPreview } from '../presentation/max-level';

const boundaries = [
  [1, 0], [30, 0], [31, 1], [45, 1], [46, 2], [60, 2], [61, 3],
  [75, 3], [76, 4], [90, 4], [91, 5], [105, 5], [120, 5],
] as const;

function storage() {
  const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  let writes = 0;
  const saved: ProfileStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); writes++; },
    removeItem: key => { values.delete(key); },
  };
  return { saved, writes: () => writes };
}

function expectedMaterials(family: string, destination: number, higherTiers: number) {
  return { [`${family}-common`]: Math.ceil(destination / 30), ...Object.fromEntries(
    materialRarities.slice(1, higherTiers + 1).map(rarity => [`${family}-${rarity.toLowerCase()}`, 1])) };
}

describe('cumulative higher-rarity leveling materials', () => {
  it.each(boundaries)('requires the exact cumulative rarities at destination %i', (destination, higherTiers) => {
    for (const family of [...elements.map(element => element.id), 'rosethorn'] as const) {
      expect(levelingMaterials(family, destination)).toEqual(expectedMaterials(family, destination, higherTiers));
    }
  });

  it.each([-1, 0, 121, 1.5, NaN, Infinity])('rejects invalid destination %s', destination => {
    expect(() => levelingMaterials('infernic', destination)).toThrow('integer from 1 to 120');
  });

  it('uses destination level, not evolution, for all 16 Element-Bearers and preserves specialty surcharges', () => {
    for (const character of starters) {
      for (const [level, evolution, higherTiers] of [[29, 1, 0], [30, 2, 1], [45, 3, 2],
        [60, 4, 3], [75, 5, 4], [90, 6, 5], [104, 6, 5], [10, 6, 0]]) {
        const progress: CharacterProgress = { level, evolution };
        const family = isRoseCharacter(character.id) ? 'rosethorn' : character.elementId;
        const materials = expectedMaterials(family, level + 1, higherTiers);
        if (evolution >= 5) {
          const specialty = isRoseCharacter(character.id) ? 'rosethorn-omnic'
            : ['infernic', 'oceanic', 'atmospheric', 'botanic'].includes(character.elementId) ? 'heavens-level' : 'abyss-level';
          materials[specialty] = (materials[specialty] ?? 0) + 1;
        }
        expect(characterLevelCost(character.id, progress)).toEqual({ fractalis: 10 + 2 * (level + 1), materials });
      }
    }
    expect(() => levelCost('infernic', { level: 105, evolution: 6 })).toThrow('cap');
  });

  it('uses captured combat element or Rosethorn, through level 120, with no Element-Bearer specialty surcharge', () => {
    const copies = [createCreatureCopy('infusion:heavens:0'), createCreatureCopy('infusion:abyss:0'),
      createCreatureCopy('infusion:treasury:0'), createCreatureCopy('infusion:sanctuary:0'),
      createCreatureCopy('infusion:roses:0')];
    for (const copy of copies) {
      const family = copy.creatureId.includes('roses') ? 'rosethorn'
        : copy.creatureId.includes('abyss') ? 'chaotic' : 'tranquilitic';
      for (const [destination, higherTiers] of boundaries.filter(([destination]) => destination <= 60)) {
        expect(capturedLevelCost({ ...copy, level: destination - 1 })).toEqual({
          fractalis: 10 + 2 * destination, materials: expectedMaterials(family, destination, higherTiers),
        });
      }
      for (const level of [60, 61, 90, 120]) expect(() => capturedLevelCost({ ...copy, level })).toThrow('Maximum');
    }
  });

  it.each(['ember', 'rosetta'] as const)('spends every tier in one single-level write for %s and rejects missing Omnic without writes', kind => {
    const store = storage();
    const account = emptyAccount();
    account.characters.ember = { level: 90, evolution: 6 };
    account.characters.rosetta = { level: 90, evolution: 6 };
    account.fractalis = 1000;
    const family = kind === 'ember' ? 'infernic' : 'rosethorn';
    account.materials = { ...Object.fromEntries(materialRarities.map(rarity => [`${family}-${rarity.toLowerCase()}`, 10])),
      'heavens-level': 10 };
    account.materials[`${family}-omnic`] = 0;
    saveAccount(store.saved, account);
    const transact = () => upgradeCharacter(store.saved, kind, 'level', { level: 90, evolution: 6 });
    const raw = store.saved.getItem(ACCOUNT_KEY);
    const writes = store.writes();
    expect(() => transact()).toThrow('Not enough');
    expect(store.writes()).toBe(writes);
    expect(store.saved.getItem(ACCOUNT_KEY)).toBe(raw);
    account.materials[`${family}-omnic`] = 10;
    saveAccount(store.saved, account);
    const beforeWrites = store.writes();
    const after = transact();
    expect(store.writes()).toBe(beforeWrites + 1);
    expect(after.fractalis).toBe(808);
    expect(after.materials[`${family}-common`]).toBe(6);
    for (const rarity of materialRarities.slice(1)) {
      expect(after.materials[`${family}-${rarity.toLowerCase()}`]).toBe(kind === 'rosetta' && rarity === 'Omnic' ? 8 : 9);
    }
    expect(after.materials['heavens-level']).toBe(kind === 'ember' ? 9 : 10);
  });

  it.each([31, 46, 61, 76, 91])('Max Level stops exactly before destination %i if its new rarity is missing', destination => {
    const store = storage();
    const account = emptyAccount();
    account.fractalis = 100000;
    account.characters.ember = { level: destination - 2, evolution: 6 };
    account.materials = { ...Object.fromEntries(materialRarities.map(rarity => [`infernic-${rarity.toLowerCase()}`, 1000])),
      'heavens-level': 1000 };
    const tier = [31, 46, 61, 76, 91].indexOf(destination) + 1;
    account.materials[`infernic-${materialRarities[tier].toLowerCase()}`] = 0;
    const saved = saveAccount(store.saved, account);
    const plan = maxLevelPlan(saved, 'ember');
    expect(plan.targetLevel).toBe(destination - 1);
    const preview = maxLevelPreview(saved, 'ember');
    for (const id of Object.keys(plan.cost.materials)) expect(preview.html).toContain(id);
    const writes = store.writes();
    const result = levelCharacterToMaximum(store.saved, plan);
    expect(store.writes()).toBe(writes + 1);
    expect(result.characters.ember!.level).toBe(destination - 1);
    for (const [id, amount] of Object.entries(plan.cost.materials)) expect(result.materials[id]).toBe(saved.materials[id] - amount);
  });

  it('keeps saved levels and raw legacy holdings unchanged on reads and failed persistence', () => {
    const store = storage();
    const account = emptyAccount();
    account.characters.ember = { level: 90, evolution: 6 };
    account.fractalis = 1000;
    account.materials = { ...expectedMaterials('infernic', 91, 5), 'heavens-level': 1 };
    saveAccount(store.saved, account);
    const raw = store.saved.getItem(ACCOUNT_KEY);
    const writes = store.writes();
    const plan = maxLevelPlan(account, 'ember');
    expect(plan.targetLevel).toBe(91);
    expect(store.writes()).toBe(writes);
    store.saved.setItem = () => { throw new Error('Write denied'); };
    expect(() => levelCharacterToMaximum(store.saved, plan)).toThrow('Write denied');
    expect(store.saved.getItem(ACCOUNT_KEY)).toBe(raw);
  });
});
