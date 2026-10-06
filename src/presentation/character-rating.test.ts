import { describe, expect, it } from 'vitest';
import { materialRarities } from '../content/activities';
import { starters } from '../content/starters';
import { evolutionRarity } from '../content/progression';
import { characterRating, starBadge } from './character-rating';
import { characterHub, homeHub } from './hub';
import { characterRoster, squadHub, summonHub } from './roster';
import { emptyAccount } from '../game/account';

describe('fixed summon stars and evolving rarity', () => {
  it.each([1, 2, 3, 4, 5, 6])('renders exactly %s physical stars with an accessible tier label', (stars) => {
    const html = starBadge(stars);
    expect(html.match(/class="rating-star"/g)).toHaveLength(stars);
    expect(html).toContain(`star-tier-${stars}`);
    expect(html).toContain(`aria-label="${stars}-star character"`);
    expect(html).toContain('aria-hidden="true"');
  });
  it.each([0, 7, -1, 1.5, NaN])('rejects invalid stars %s', (stars) => {
    expect(() => starBadge(stars)).toThrow('stars');
  });
  it.each(starters)('$name retains five stars at every evolution and displays matching rarity', (starter) => {
    for (let evolution = 1; evolution <= 6; evolution++) {
      expect(starter.stars).toBe(5);
      expect(evolutionRarity(evolution)).toBe(materialRarities[evolution - 1]);
      const label = characterRating(starter.id, evolution);
      expect(label).toContain('5-star');
      expect(label).toContain(materialRarities[evolution - 1]);
      expect(label).toContain(`aria-label="${materialRarities[evolution - 1]} rarity"`);
      expect(label).toContain('rarity-medallion');
      const account = { ...emptyAccount(), characters: { [starter.id]: { level: 0, evolution } }, squad: [starter.id] };
      for (const html of [homeHub(starter, false, account), characterHub(starter, 'overview', account),
        characterRoster(account, starter.id), squadHub(account)]) expect(html).toContain(label);
    }
    const summon = summonHub(emptyAccount());
    expect(summon).toContain(starter.name);
    expect(summon).toContain('Common<span>5-star</span>');
    expect(summon).not.toContain('character-rating');
  });
  it.each([0, 7, -1, 1.5, NaN])('rejects invalid evolution %s', (value) => {
    expect(() => evolutionRarity(value)).toThrow('evolution');
  });
});
