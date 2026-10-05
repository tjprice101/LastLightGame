import { describe, expect, it } from 'vitest';
import { currencyArt, currencyIcon } from './currency-icon';
import { sanctuaryHeader, sanctuaryPages } from './sanctuary';
import { characterDetail, inventoryHub } from './hub';
import { starters } from '../content/starters';
import { emptyAccount } from '../game/account';
import { lootArt, lootItems } from './battle-loot';
import { creatureGlossary } from './creature-glossary';
import { creatures } from '../content/creatures';

describe('supplied currency artwork', () => {
  it.each(['fractalis', 'lycalis'] as const)('resolves %s and retains accessible balance text on every menu', (id) => {
    expect(currencyArt(id)).toContain(`assets/currencies/${id}.png`);
    expect(currencyIcon(id)).toContain('alt="" aria-hidden="true" width="48" height="48"');
    for (const page of sanctuaryPages) {
      const html = sanctuaryHeader(page, 123, 10);
      expect(html).toContain(currencyIcon(id));
      expect(html).toContain(`id="${id}-balance">${id === 'fractalis' ? 123 : 10}`);
    }
    expect(inventoryHub(emptyAccount())).toContain(currencyIcon(id));
  });

  it('uses supplied icons for costs and the existing First Fracture reward', () => {
    for (const tab of ['upgrade-0', 'upgrade-1', 'upgrade-2']) {
      expect(characterDetail(starters[0], tab)).toContain(currencyIcon('fractalis'));
    }
    expect(characterDetail(starters[0], 'upgrade-0')).toContain(currencyIcon('lycalis'));
    const account = emptyAccount();
    account.firstFracture = true;
    expect(characterDetail(starters[0], 'upgrade-0', account)).not.toContain(currencyIcon('lycalis'));
  });

  it('shows the coin only in revealed glossary drop pools', () => {
    const account = emptyAccount();
    expect(creatureGlossary(account)).not.toContain(currencyIcon('fractalis'));
    account.creatures[creatures[0].id] = { defeated: true };
    expect(creatureGlossary(account)).toContain(currencyIcon('fractalis'));
    expect(creatureGlossary(account)).not.toContain(currencyIcon('lycalis'));
  });

  it('resolves currency separately from materials without changing rewards or adding premium drops', () => {
    const items = lootItems({ kind: 'reward', source: 'enemy', target: '', amount: 7,
      critical: false, message: 'Loot', materials: { 'infernic-common': 2 } });
    expect(items.map(({ id, amount }) => [id, amount])).toEqual([['fractalis', 7], ['infernic-common', 2]]);
    expect(lootArt(items[0])).toBe(currencyArt('fractalis'));
    expect(lootArt(items[1])).toContain('assets/materials/infernic-seed.png');
    expect(lootArt({ id: 'unknown' })).toBeUndefined();
  });
});
