import { describe, expect, it, vi } from 'vitest';
import { emptyAccount } from '../game/account';
import { createBattle } from '../game/battle';
import { openingStarters } from '../content/starters';
import { elements } from '../content/activities';
import { conduits } from '../content/conduits';
import { defaultBindings } from '../game/hotkeys';
import { homeHub, characterHub } from './hub';
import { gameplayHub } from './gameplay';
import { roseEvent } from './rose-event';
import { summonHub, squadHub } from './roster';
import { archives } from './archives';
import { settingsPanel } from './settings-panel';
import { conduitStore } from './conduit-store';
import { conduitUpgradeMenu } from './conduit-upgrade';
import { machineComponentRulesText } from '../content/mechanical-components';
import { battleResults } from './battle-results';
import { unitReadout } from './unit-readout';
import { inventoryView } from './inventory';
import { itemShowcase } from './item-showcase';
import { sanctuaryHeader } from './sanctuary';
import { loadAccount, ACCOUNT_KEY, summonCharacter } from '../game/account';
import { SAVE_KEY } from '../game/profile';

const textContent = (markup: string) => markup.replace(/<[^>]*>/g, ' ');

describe('visible UI copy', () => {
  it('keeps redundant instructions and implementation notes off primary screens without hiding decision-critical data', () => {
    const account = emptyAccount();
    account.characters.ember = { level: 0, evolution: 1 };
    account.squad = ['ember'];
    account.fractalis = 10000;
    account.lycalis = 100;
    account.conduits = { 'vigil-core': 1 };
    const before = structuredClone(account);
    const primary = (html: string) => html.replace(/<dialog\b[^>]*>[\s\S]*?<\/dialog>/g, '');
    const inventory = primary(inventoryView(account));
    expect(inventory).not.toContain('Your currencies, materials and Conduits.');
    expect(inventory).not.toContain('Earn materials in');
    expect(inventory).not.toContain('Main currency');
    expect(inventory).not.toContain('Premium currency');
    expect(inventory).toContain('No materials yet');
    expect(inventory).toContain('Broken Mechanical Components');
    expect(inventory).toContain('data-page="conduit-upgrade"');
    expect(inventory).toContain('data-page="gameplay"');
    const store = primary(conduitStore(account));
    expect(store).not.toContain('Purchase requires confirmation.');
    expect(store).not.toContain('Mechanical drive');
    expect(store).toContain('+5% Health');
    expect(store).toContain('data-buy-conduit="vigil-core"');
    expect(store).toContain('Prismatica');
    const upgrades = primary(conduitUpgradeMenu(account));
    expect(upgrades).not.toContain('Restore your mechanisms');
    expect(upgrades).toContain('Not enough Broken Mechanical Components.');
    expect(upgrades).toContain('Current');
    expect(upgrades).toContain('Next · +1');
    const gameplay = gameplayHub(account);
    expect(primary(gameplay)).not.toContain(machineComponentRulesText);
    expect(gameplay).toContain(machineComponentRulesText);
    expect(primary(gameplay)).toContain('Rare 8% · Legendary 3.5% · Omnic 1% from stage 75');
    expect(primary(gameplay)).not.toContain('no battles or rewards yet');
    expect(primary(squadHub(account))).not.toContain('Save to apply changes.');
    expect(primary(squadHub(account))).toContain('Save squad');
    const summon = primary(summonHub(account));
    expect(summon).not.toContain('You will confirm before spending.');
    expect(summon).toContain('Drop rates');
    expect(summon).toContain('Pity guarantees');
    expect(summon).toContain('Cost 10');
    expect(primary(sanctuaryHeader('inventory', 10000, 100))).not.toContain('Prelude 0.1');
    expect(primary(sanctuaryHeader('inventory', 10000, 100))).not.toContain('Each Adventure entry starts a new run.');
    expect(account).toEqual(before);
  });
  it('renames both currencies without changing legacy balances, assets or rejected draw behavior', () => {
    const account = emptyAccount();
    account.fractalis = Number.MAX_SAFE_INTEGER;
    account.lycalis = 9;
    account.characters.ember = { level: 0, evolution: 1 };
    const saved = JSON.stringify(account);
    const storage = {
      getItem: vi.fn((key: string) => key === ACCOUNT_KEY ? saved
        : key === SAVE_KEY ? JSON.stringify({ version: 1, starterId: 'ember' }) : null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    expect(loadAccount(storage).fractalis).toBe(Number.MAX_SAFE_INTEGER);
    expect(loadAccount(storage).lycalis).toBe(9);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(() => summonCharacter(storage, () => 0)).toThrow('10 Null-Prismatica');
    expect(storage.setItem).not.toHaveBeenCalled();
    const surfaces = [
      sanctuaryHeader('home', account.fractalis, account.lycalis),
      inventoryView(account),
      homeHub(openingStarters[0], false, account),
      characterHub(openingStarters[0], 'upgrade-0', account),
      conduitStore(account), gameplayHub(account), roseEvent(account),
      summonHub(account, 'standard'), summonHub(account, 'roses'),
      itemShowcase([{ id: 'fractalis', amount: 12 }, { id: 'lycalis', amount: 2 }], 'Currencies'),
    ];
    for (const html of surfaces) {
      expect(textContent(html)).not.toMatch(/\b(?:Fractalis|Lycalis|Lysalis)\b/i);
      expect(html).not.toMatch(/(?:aria-label|title)="[^"]*(?:Fractalis|Lycalis|Lysalis)/i);
    }
    const header = surfaces[0];
    expect(header).toContain('Prismatica');
    expect(header).toContain('Null-Prismatica');
    expect(header).toContain(`id="fractalis-balance">${Number.MAX_SAFE_INTEGER}`);
    expect(header).toContain('id="lycalis-balance">9');
    expect(header).toContain('currencies/fractalis.png');
    expect(header).toContain('currencies/lycalis.png');
    expect(inventoryView(account)).toContain('aria-label="Null-Prismatica balance"');
  });
  it('uses spaced slashes for counts and middle dots for labels, never tildes', () => {
    const account = emptyAccount();
    account.characters.ember = { level: 0, evolution: 1 };
    account.squad = ['ember'];
    const battle = createBattle();
    battle.phase = 'cleared';
    const surfaces = [
      homeHub(openingStarters[0], false, account),
      characterHub(openingStarters[0], 'overview', account),
      gameplayHub(account), roseEvent(account), squadHub(account),
      summonHub(account, 'standard'), summonHub(account, 'roses'),
      archives(account), settingsPanel('system', defaultBindings, 1),
      conduitStore(account), battleResults(battle, []),
      ...battle.allies.map((unit) => unitReadout(unit)),
      ...elements.map((element) => element.affinity),
      ...conduits.map((conduit) => conduit.effect),
    ];
    for (const markup of surfaces) {
      const text = textContent(markup);
      expect(text).not.toContain('~');
      expect(text).not.toMatch(/\S\/|\/\S/);
      expect(text).not.toMatch(/\b(?:levels?|forms?|stage|quantities|separate|Rare|Legendary|Omnic)\d/i);
    }
    expect(textContent(characterHub(openingStarters[0], 'upgrade-1', account))).toMatch(/Owned \/ Required/);
    expect(textContent(squadHub(account))).toContain('1 / 3 slots filled');
    expect(textContent(characterHub(openingStarters[0], 'overview', account))).toContain('Lv.0 · Evo.1');
  });
  it('fixes the exact event caption and preserves numeric values and asset paths', () => {
    const html = roseEvent(emptyAccount());
    expect(html).toContain('35 stages · Enemy levels 80-140');
    expect(html).toContain('banners/roses-banner.png');
    expect(unitReadout(createBattle().allies[0])).toContain('HP 220 / 220');
  });
});
