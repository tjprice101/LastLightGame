// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { catalogInformation, informationSheet, offerInformation } from './information-layout';
import { radiantCharacterLoadout, radiantCharacterSheet } from './character-combat';
import { radiantBearerKits } from '../content/combat-kits';
import { emptyAccount } from '../game/account';

describe('shared information templates', () => {
  it('escapes content labels and preserves ordered sections and trusted effect markup', () => {
    document.body.innerHTML = informationSheet([{ title: '<name>', kind: '"kind', content: '<p>Exact effect</p>' }]);
    expect(document.querySelector('h3')?.textContent).toBe('<name>');
    expect(document.querySelector('section')?.dataset.infoSection).toBe('"kind');
    expect(document.querySelector('p')?.textContent).toBe('Exact effect');
    expect(document.querySelector('name')).toBeNull();
  });
  it('shows only applicable item fields, with exact owned counts and collapsed lore', () => {
    document.body.innerHTML = catalogInformation({ name: '<material>', art: '<span>Artwork pending</span>', owned: Number.MAX_SAFE_INTEGER, effects: ['<strong>16%</strong> Attack'], lore: '<lore>' });
    expect(document.querySelector('h3')?.textContent).toBe('<material>');
    expect(document.querySelector('.info-number')?.textContent).toBe('Owned 9007199254740991');
    expect(document.querySelector('.info-effects strong')?.textContent).toBe('16%');
    expect(document.querySelector('details')?.open).toBe(false);
    expect(document.querySelector('details p')?.textContent).toBe('<lore>');
    expect(document.querySelector('.info-acquisition')).toBeNull();
    expect(document.body.textContent).not.toContain('stars');
    expect(document.body.textContent).not.toContain('Level');
  });
  it('omits empty artwork rather than reserving a blank image column on receipts', () => {
    document.body.innerHTML = catalogInformation({ name: 'Receipt', art: '', effects: ['Saved reward'] });
    expect(document.querySelector('.info-item-art')).toBeNull();
    expect(document.querySelectorAll('.info-effects li')).toHaveLength(1);
  });
  it('preserves specialized saved breakdowns without treating metadata as an effect bullet', () => {
    document.body.innerHTML = catalogInformation({ name: 'Saved receipt', art: '', details: '<p>Saved outcome</p><ul class="saved-loot"><li>2 materials</li></ul>' });
    expect(document.querySelector('.info-details p')?.textContent).toBe('Saved outcome');
    expect(document.querySelector('.saved-loot li')?.textContent).toBe('2 materials');
    expect(document.querySelector('.info-effects')).toBeNull();
  });
  it('keeps prices and owned counts in separate columns, with one action and its reason', () => {
    document.body.innerHTML = offerInformation({ name: 'Offer', art: 'Pending', summary: '<p>Exact effect</p>', owned: Number.MAX_SAFE_INTEGER, price: '<span>10 Prismatica + 2 Null-Prismatica</span>', action: '<button disabled>Buy</button>', reason: 'Not enough currency.' });
    expect(document.querySelectorAll('button')).toHaveLength(1);
    expect(document.querySelector('button')?.disabled).toBe(true);
    expect(document.querySelector('.info-offer-owned')?.textContent).toContain('9,007,199,254,740,991');
    expect(document.querySelector('.info-price')?.textContent).toBe('10 Prismatica + 2 Null-Prismatica');
    expect(document.querySelector('[role="note"]')?.textContent).toBe('Not enough currency.');
  });
  it('keeps every released kit on the same reading path, including complete locked tiers', () => {
    for (const starter of Object.keys(radiantBearerKits)) {
      const resolved = radiantCharacterLoadout(null, starter, { level: 0, evolution: 1 });
      expect(resolved).not.toBeNull();
      document.body.innerHTML = radiantCharacterSheet(resolved!.loadout);
      expect(Array.from(document.querySelectorAll('[data-info-section]')).map(section => section.getAttribute('data-info-section')))
        .toEqual(['profile', 'stats', 'leader', 'flares', 'passive', 'equipment']);
      expect(document.querySelectorAll('[data-radiant-stat]')).toHaveLength(4);
      expect(document.querySelectorAll('[data-radiant-flare]')).toHaveLength(3);
      expect(document.querySelectorAll('[data-radiant-flare].is-locked')).toHaveLength(2);
      for (const tier of Array.from(document.querySelectorAll('[data-radiant-flare]'))) {
        expect(tier.querySelector('.info-effects li')).not.toBeNull();
        expect(tier.textContent).toContain('Target:');
        expect(tier.textContent).toContain('Costs');
        expect(tier.textContent).toMatch(/(?:Locked|Unlocked) · Rank \d+\+ and Evo\.\d+/);
      }
    }
  });
  it('reads owned loadouts without mutating account data', () => {
    const account = emptyAccount();
    account.characters.ember = { level: 0, evolution: 1 };
    const before = structuredClone(account);
    const resolved = radiantCharacterLoadout(account, 'ember');
    radiantCharacterSheet(resolved!.loadout);
    expect(account).toEqual(before);
  });
});
