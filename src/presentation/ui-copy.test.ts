import { describe, expect, it, vi } from 'vitest';
import { emptyAccount } from '../game/account';
import { createBattle } from '../game/battle';
import { openingStarters, starters } from '../content/starters';
import { elements } from '../content/activities';
import { machineRules } from '../content/machines';
import { conduits, conduitEffect, getConduit } from '../content/conduits';
import { readableEffect, referencedEffect } from './effect-copy';
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
import { elementLabel } from './element-label';
import { referenceHome } from './reference-home';
import { referenceTeam } from './reference-team';
import { portrait } from './portrait';
import { onlineStores } from './online-store-profile';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const plain = (text?: string | null): string => (text ?? '').replace(/\[([^[\]]+)\]/g, '$1');

const textContent = (markup: string) => markup.replace(/<[^>]*>/g, ' ');

describe('visible UI copy', () => {
  it('uses player-facing language in activity, loot, Inventory and summon descriptions', () => {
    const account = emptyAccount();
    for (const html of [gameplayHub(account), roseEvent(account), inventoryView(account), summonHub(account)]) {
      const text = textContent(html);
      expect(text).not.toMatch(/\bauthored\b|\batomically\b|independent weighted bundle rolls|linear interpolation|intentional difficulty walls|base quantity rounds|verified final-clear receipt/i);
    }
    expect(gameplayHub(account)).toContain('The boss drops nothing else.');
    expect(plain(gameplayHub(account))).toContain('Every Machine drops Broken Mechanical Components');
  });
  it('never uses affinity aliases in element filters or presentation data sources', () => {
    const account = emptyAccount();
    account.characters = Object.fromEntries(starters.map(starter => [starter.id, { level: 0, evolution: 1 }]));
    account.squad = ['ember'];
    const team = referenceTeam(account, { view: 'bearers', selected: 'ember', element: '', sort: 'level' });
    const archive = archives(account);
    for (const element of elements) {
      expect(team).toContain(`data-team-element="${element.id}" aria-pressed="false">${element.name}</button>`);
      expect(archive).toContain(`<option value="${element.id}">${element.name}</option>`);
      expect(onlineStores(account, null, 'materials', element.id)).toContain(`Common ${element.name} upgrade material.`);
    }
    function check(directory: string): void {
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) check(path);
        else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')) {
          expect(readFileSync(path, 'utf8'), path).not.toMatch(/\.affinity\b/);
        }
      }
    }
    check(join(process.cwd(), 'src', 'presentation'));
  });
  it('uses canonical element names without affinity suffixes on labels, portraits and menu screens', () => {
    const account = emptyAccount();
    account.characters = Object.fromEntries(starters.map(starter => [starter.id, { level: 0, evolution: 1 }]));
    account.squad = ['ember'];
    const suffix = /\((?:peace|fire|water|wind|nature|dark matter & energy)\)/i;
    for (const starter of starters) {
      expect(starter.element).toBe(elements.find(element => element.id === starter.elementId)?.name);
      expect(portrait(starter)).not.toMatch(suffix);
      expect(characterHub(starter, 'overview', account)).not.toMatch(suffix);
      expect(referenceHome(starter, { ...account, squad: [starter.id] })).not.toMatch(suffix);
    }
    for (const element of elements) {
      expect(elementLabel(element.id)).toContain(`${element.name}</span>`);
      expect(elementLabel(element.id)).not.toMatch(suffix);
    }
    for (const markup of [archives(account), gameplayHub(account), squadHub(account),
      summonHub(account, 'standard'), summonHub(account, 'roses'),
      referenceTeam(account, { view: 'bearers', selected: 'ember', element: '', sort: 'level' })]) {
      expect(markup).not.toMatch(suffix);
    }
  });
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
    expect(inventory).toContain('No resources yet');
    expect(inventory).not.toContain('data-inventory-resource="mechanical-components"');
    expect(inventory).not.toContain('data-page=');
    const store = primary(conduitStore(account));
    expect(store).not.toContain('Purchase requires confirmation.');
    expect(store).not.toContain('Mechanical drive');
    expect(store).toContain(referencedEffect(conduitEffect(getConduit('vigil-core'))));
    expect(store).toContain('data-buy-conduit="vigil-core"');
    expect(store).toContain('Prismatica');
    const upgrades = primary(conduitUpgradeMenu(account));
    expect(upgrades).not.toContain('Restore your mechanisms');
    expect(upgrades).toContain('Not enough Broken Mechanical Components.');
    expect(upgrades).toContain('Current');
    expect(upgrades).toContain('Next · +1');
    const gameplay = gameplayHub(account);
    expect(primary(gameplay)).not.toContain(machineComponentRulesText);
    expect(plain(gameplay)).toContain(plain(machineComponentRulesText));
    expect(primary(gameplay)).toContain(`Rare 8% \u00b7 Legendary 3.5% \u00b7 Omnic 1% from stage ${machineRules.omnicStage}`);
    expect(primary(gameplay)).not.toContain('no battles or rewards yet');
    expect(primary(squadHub(account))).not.toContain('Save to apply changes.');
    expect(primary(squadHub(account))).toContain('Save squad');
    const summon = primary(summonHub(account));
    expect(summon).not.toContain('You will confirm before spending.');
    expect(summon).not.toContain('Drop rates');
    expect(summon).toContain('Rates & Information');
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
      ...conduits.map((conduit) => readableEffect(conduit.effect)),
    ];
    for (const markup of surfaces) {
      const text = textContent(markup);
      expect(text).not.toContain('~');
      // Preserve the approved literal mitigation formula; prose alternatives and counts still require spacing.
      const prose = text.replaceAll('`D/(D + enemy Defense)`', '');
      expect(prose, prose.match(/.{0,35}(?:\S\/|\/\S).{0,35}/g)?.join('\n')).not.toMatch(/\S\/|\/\S/);
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
