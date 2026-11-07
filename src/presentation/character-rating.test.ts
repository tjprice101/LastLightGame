import { describe, expect, it } from 'vitest';
import { materialRarities } from '../content/activities';
import { starters, isRoseCharacter } from '../content/starters';
import { characterRarity, displayEvolution, evolutionRarity } from '../content/progression';
import { isCalamiticCharacter } from '../content/calamitic-characters';
import { characterRating, starBadge } from './character-rating';
import { characterHub, homeHub } from './hub';
import { characterRoster, squadHub, summonHub } from './roster';
import { emptyAccount } from '../game/account';
import { isWarCharacter } from '../content/war-characters';
import { moonSunshadeEvents } from '../content/moon-sunshade-events';
import { characterReleased } from '../content/release-visibility';

describe('fixed summon stars and evolving rarity', () => {
  it.each([1, 2, 3, 4, 5, 6, 7])('renders exactly %s physical stars with an accessible tier label', (stars) => {
    const html = starBadge(stars);
    expect(html.match(/class="rating-star"/g)).toHaveLength(stars);
    expect(html).toContain(`star-tier-${stars}`);
    expect(html).toContain(`aria-label="${stars}-star character"`);
    expect(html).toContain('aria-hidden="true"');
  });
  it.each([0, 8, -1, 1.5, NaN])('rejects invalid stars %s', (stars) => {
    expect(() => starBadge(stars)).toThrow('stars');
  });
  it.each(starters)('$name retains its authored stars at every evolution and displays matching rarity', (starter) => {
    for (let evolution = 1; evolution <= 6; evolution++) {
      expect(evolutionRarity(evolution)).toBe(materialRarities[evolution - 1]);
      const rarity = characterRarity(starter.id, evolution);
      const label = characterRating(starter.id, evolution);
      expect(label).toContain(`${starter.stars}-star`);
      expect(label).toContain(rarity);
      expect(label).toContain(`aria-label="${rarity} rarity"`);
      expect(label).toContain(`<span class="rarity-medallion" aria-hidden="true"><span>${displayEvolution(starter.id, evolution)}</span>`);
      const account = { ...emptyAccount(), characters: { [starter.id]: { level: 0, evolution } }, squad: [starter.id] };
      for (const html of [homeHub(starter, false, account), characterHub(starter, 'overview', account),
        characterRoster(account, starter.id), squadHub(account)]) expect(html).toContain(label);
    }
    const event = moonSunshadeEvents.find(event => event.characters.some(id => id === starter.id));
    const summon = summonHub(emptyAccount(), event?.bannerId ?? (isRoseCharacter(starter.id) ? 'roses' : 'standard'));
    if (!characterReleased(starter.id) || isWarCharacter(starter.id) || isCalamiticCharacter(starter.id)) expect(summon).not.toContain(starter.name);
    else {
      expect(summon).toContain(starter.name);
      expect(summon).toContain(`Common<span>${starter.stars}-star</span>`);
    }
    const rates = summon.slice(summon.indexOf('<table'), summon.indexOf('</table>'));
    expect(rates).not.toContain('character-rating');
  });
  it.each([0, 7, -1, 1.5, NaN])('rejects invalid evolution %s', (value) => {
    expect(() => evolutionRarity(value)).toThrow('evolution');
  });
});
