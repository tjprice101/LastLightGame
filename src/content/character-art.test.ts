import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { characterArt, evolutionTitles } from './character-art';
import { starters } from './starters';
import { characterGrowth, evolutionCost, levelCost } from './progression';
import { emptyAccount } from '../game/account';
import { characterHub, homeHub } from '../presentation/hub';
import { portrait } from '../presentation/portrait';
import { createBattle } from '../game/battle';

describe('six-form character artwork', () => {
  it.each(starters)('$name maps all six forms to real assets across portraits, Home, Character and battle state', (starter) => {
    expect(evolutionTitles[starter.id]).toHaveLength(characterGrowth.forms);
    for (let evolution = 1; evolution <= characterGrowth.forms; evolution++) {
      const form = characterArt(starter.id, evolution);
      expect(existsSync(resolve('public', 'assets', 'characters', `${form.art}.png`))).toBe(true);
      const account = emptyAccount();
      account.characters[starter.id] = { level: 0, evolution };
      expect(portrait(starter, evolution)).toContain(`characters/${form.art}.png`);
      expect(portrait(starter, evolution)).toContain(`class="character-idle" data-character="${starter.id}"`);
      expect(homeHub(starter, false, account)).toContain(`characters/${form.art}.png`);
      expect(characterHub(starter, 'overview', account)).toContain(`characters/${form.art}.png`);
      const battle = createBattle(1729, [starter.id], { [starter.id]: { level: 0, evolution } });
      expect(battle.allies[0].evolution).toBe(evolution);
      if (evolution > 1) expect(portrait(starter, evolution)).toContain(form.title);
    }
    for (const invalid of [0, 7, 1.5, NaN]) expect(() => characterArt(starter.id, invalid)).toThrow();
  });
  it.each(starters)('$name has the exact approved Evo.6 recipe and fourth-band Seed leveling', (starter) => {
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
