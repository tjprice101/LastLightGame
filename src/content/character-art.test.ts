import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { characterArt, characterName, evolutionTitles } from './character-art';
import { starters, openingStarters } from './starters';
import { characterGrowth, evolutionCost, levelCost } from './progression';
import { emptyAccount } from '../game/account';
import { characterHub, homeHub } from '../presentation/hub';
import { portrait } from '../presentation/portrait';
import { createBattle } from '../game/battle';

describe('six-form character artwork', () => {
  it('uses the owner-delivered Evo.1 titles without changing other forms or stable art IDs', () => {
    expect(characterName('rosetta', 1)).toBe('Gilded Rose, Rosetta');
    expect(characterName('thornia', 1)).toBe('Burdened by Thorns, Thornia');
    expect(characterArt('rosetta', 1).art).toBe('rosetta');
    expect(characterArt('thornia', 1).art).toBe('thornia');
    expect(characterName('rosetta', 2)).toBe('Gilded Vow, Rosetta');
    expect(characterName('thornia', 2)).toBe('Gilded Squire, Thornia');
    expect(characterName('crinso', 1)).toBe('Rosebound Page, Crinso');
  });
  it.each(starters)('$name maps all six forms to real assets across portraits, Home, Character and battle state', (starter) => {
    expect(evolutionTitles[starter.id]).toHaveLength(characterGrowth.forms);
    for (let evolution = 1; evolution <= characterGrowth.forms; evolution++) {
      const form = characterArt(starter.id, evolution);
      const name = `${form.title}, ${starter.name}`;
      expect(characterName(starter.id, evolution)).toBe(name);
      expect(existsSync(resolve('public', 'assets', 'characters', `${form.art}.png`))).toBe(true);
      const account = emptyAccount();
      account.characters[starter.id] = { level: 0, evolution };
      expect(portrait(starter, evolution)).toContain(`characters/${form.art}.png`);
      expect(portrait(starter, evolution)).toContain(`class="character-idle" data-character="${starter.id}"`);
      expect(homeHub(starter, false, account)).toContain(`characters/${form.art}.png`);
      expect(characterHub(starter, 'overview', account)).toContain(`characters/${form.art}.png`);
      const battle = createBattle(1729, [starter.id], { [starter.id]: { level: 0, evolution } });
      expect(battle.allies[0].evolution).toBe(evolution);
      expect(battle.allies[0].name).toBe(name);
      expect(homeHub(starter, false, account)).toContain(`<h2 aria-label="${name}">`);
      expect(homeHub(starter, false, account)).toContain(`class="form-prefix">${form.title}</small>`);
      expect(characterHub(starter, 'overview', account)).toContain(`<span data-owned-title>${name}</span>`);
      expect(portrait(starter, evolution)).toContain(`alt="${name},`);
      if (evolution > 1) expect(portrait(starter, evolution)).toContain(form.title);
    }
    for (const invalid of [0, 7, 1.5, NaN]) expect(() => characterArt(starter.id, invalid)).toThrow();
    for (const invalid of [0, 7, 1.5, NaN]) expect(() => characterName(starter.id, invalid)).toThrow();
  });
  it.each(openingStarters)('$name has the exact approved Evo.6 recipe and fourth-band Seed leveling', (starter) => {
    expect(evolutionCost(starter.elementId, { level: 90, evolution: 5 })).toEqual({
      fractalis: 4800,
      materials: { [`${starter.elementId}-epic`]: 25, [`${starter.elementId}-legendary`]: 10, 'heavens-evolution': 10 },
    });
    expect(levelCost(starter.elementId, { level: 90, evolution: 6 })).toEqual({
      fractalis: 192, materials: { [`${starter.elementId}-common`]: 4, 'heavens-level': 1 },
    });
    expect(characterHub(starter, 'upgrade-0', { ...emptyAccount(), characters: { [starter.id]: { level: 90, evolution: 5 } } })).toContain('NEXT');
  });
});
