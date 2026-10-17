import { describe, expect, it } from 'vitest';
import { starters } from './starters';

const expectedIdentity = [
  ['ember', 'Infernis', 5, 'Attacker', 'Infernic', 'Greatsword', '#f39b6d'],
  ['tide', 'Tizu', 5, 'Tank', 'Oceanic', 'Spear', '#79c9eb'],
  ['sprout', 'Flora', 5, 'Healer & Support', 'Botanic', 'Bow', '#a9d58a'],
  ['rosetta', 'Rosetta', 6, 'Attacker', 'Tranquilitic', 'Bow', '#eee2af'],
  ['thornia', 'Thornia', 6, 'Tank', 'Chaotic', 'Greatsword', '#bc9bef'],
  ['crinso', 'Crinso', 6, 'Attacker', 'Chaotic', 'Dual-edged sword', '#ed8bbe'],
  ['atmoso', 'Atmoso', 5, 'Attacker', 'Atmospheric', 'Wind staff', '#79d6cc'],
  ['aurora', 'Aurora', 6, 'Support', 'Tranquilitic', 'Empty-hand light casting', '#eee2af'],
  ['bliss', 'Bliss', 6, 'Attacker', 'Tranquilitic', 'Paired feather fans', '#a8ded5'],
  ['bruno', 'Bruno', 5, 'Tank', 'Botanic', 'Stone hammer', '#c7a782'],
  ['disciple', 'Disciple', 6, 'Support', 'Chaotic', 'Empty-hand psychic casting', '#c68aea'],
  ['elise', 'Elise', 5, 'Attacker', 'Atmospheric', 'Two four-point shuriken', '#b6e49a'],
  ['razor', 'Razor', 6, 'Tank', 'Chaotic', 'Night sword', '#bc9bef'],
  ['nerithe', 'Nerithe', 6, 'Attacker', 'Oceanic', 'Surveyor trident', '#54c9d4'],
  ['orvella', 'Orvella', 6, 'Tank', 'Botanic', 'Crystal mace', '#d2b59a'],
  ['vaelor', 'Vaelor', 6, 'Attacker', 'Atmospheric', 'Resonance blade', '#e6d177'],
] as const;

const elementalThemes: Record<string, readonly string[]> = {
  infernic: ['Wrath'],
  oceanic: ['Sadness'],
  atmospheric: ['Calm'],
  botanic: ['Joy', 'Life'],
  tranquilitic: ['Peace'],
  chaotic: ['Death', 'Destruction'],
};

describe('character lore revision', () => {
  it('keeps all sixteen stable character identities and gameplay-facing metadata', () => {
    expect(starters.map(({ id }) => id)).toEqual(expectedIdentity.map(([id]) => id));
    for (const [id, name, stars, role, element, weapon, color] of expectedIdentity) {
      expect(starters.find((character) => character.id === id)).toMatchObject({
        id, name, stars, role, element, weapon, color,
      });
    }
  });

  it.each(starters)('$name ties its lore to the canonical element emotion', (character) => {
    const theme = elementalThemes[character.elementId];
    const text = `${character.description} ${character.lore.story}`;
    expect(theme).toBeDefined();
    for (const word of theme ?? []) expect(text).toContain(word);
  });

  it.each(starters)('$name remains an Element-Bearer in an unresolved soul-seeking world', (character) => {
    const { description, title, lore } = character;
    expect(description).toMatch(/^An? \w+ Element-Bearer shaped in Let’s image/i);
    expect(title.trim()).not.toBe('');
    for (const value of Object.values(lore)) expect(value.trim()).not.toBe('');
    expect(lore.story).toMatch(/Let/);
    expect(lore.story).toMatch(/Rise/);
    expect(lore.story).toMatch(/Elemental-Devourers/);
    expect(lore.story).toMatch(/soul/i);
    expect(lore.story).toMatch(/neither|no one|no side|no faction|no victor|contest has no winner|still unfound|unreunited|separate and unfound|both remain unfound/i);
  });

  it('establishes the creator origins without assigning a found soul or a victor', () => {
    const stories = starters.map(({ lore }) => lore.story).join(' ');
    expect(stories).toMatch(/Let (?:created|made) Element-Bearers in his image/i);
    expect(stories).toMatch(/Rise (?:created|made) Elemental-Devourers in hers/i);
    expect(stories).toMatch(/broke convention to steal the same elements/i);
    expect(stories).toMatch(/no (?:side|faction|one|victor)|neither .* (?:found|reunited)|no victor/i);
  });
});
