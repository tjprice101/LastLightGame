import { describe, expect, it } from 'vitest';
import { starters } from '../content/starters';
import { characterDetail, characterHub, characterTabs, homeHub, inventoryHub, isCharacterTab } from './hub';
import { emptyAccount } from '../game/account';
import { abilityIcons } from './ability-icon';

describe('game-specific hub layouts', () => {
  it('retains exact endgame stats and large inventory counts without abbreviated values', () => {
    const account = emptyAccount();
    account.characters.ember = { level: 105, evolution: 6 };
    account.fractalis = Number.MAX_SAFE_INTEGER;
    account.lycalis = Number.MAX_SAFE_INTEGER;
    account.materials = { 'infernic-common': Number.MAX_SAFE_INTEGER };
    for (const html of [homeHub(starters[0], false, account), characterDetail(starters[0], 'overview', account)]) {
      expect(html).toContain('<strong>100787.57</strong>');
      expect(html).toContain('<strong>17408.76</strong>');
      expect(html).toContain('<strong>728.94</strong>');
    }
    expect(inventoryHub(account).match(/9007199254740991/g)).toHaveLength(3);
  });
  it.each(starters)('$name uses its real art, stats, passive, and ability costs', (starter) => {
    const home = homeHub(starter, false);
    expect(home).toContain(`characters/${starter.art}.png`);
    expect(home).toContain(starter.name);
    expect(home).toContain('data-page="battle"');
    expect(home).toContain('Adventure &rarr;');
    expect(home).toContain('Start at wave 1');
    expect(home).not.toContain('Free Battle');
    expect(home).toContain('data-page="squad"');
    expect(home).toContain('data-page="summon"');
    const overview = characterHub(starter, 'overview');
    expect(overview).toContain('Costs 25 Shatter Gauge');
    expect(overview).toContain('Costs 40 Shatter Gauge');
    expect(overview).toContain('Costs 100 Shatter Gauge');
    if (starter.id === 'tide') expect(home).toContain('<strong>24</strong>');
  });
  it('offers overview, seven upgrade areas, and inventory with real progression costs', () => {
    expect(characterTabs).toHaveLength(8);
    for (const tab of characterTabs) {
      expect(isCharacterTab(tab.id)).toBe(true);
      expect(characterHub(starters[0], tab.id)).toContain(`>${tab.label}</h2>`);
    }
    expect(isCharacterTab('missing')).toBe(false);
    expect(() => characterHub(starters[0], 'missing')).toThrow('Unknown');
    expect(characterHub(starters[0], 'upgrade-0')).toContain('+10 Lycalis');
    expect(characterHub(starters[0], 'upgrade-0')).toContain('Preserve your level');
    expect(characterHub(starters[0], 'upgrade-0')).toContain('30 / 45 / 60 / 75 / 90');
    expect(characterHub(starters[0], 'upgrade-0')).toContain('disabled>Evolve');
    expect(characterHub(starters[0], 'upgrade-0')).not.toContain('Costs unset');
    const inventory = characterHub(starters[0], 'equipment');
    expect(inventory.match(/data-conduit-slot=/g)).toHaveLength(8);
    expect(inventory).toContain('Master Conduit');
    expect(homeHub(starters[0], true)).toContain(starters[0].lore.awakening);
  });
  it.each(starters)('$name uses icons in existing shortcuts without an extra ability strip', (starter) => {
    for (const html of [characterHub(starter, 'overview')]) {
      expect(html).not.toContain('companion-kit');
      const icons = abilityIcons[starter.id];
      for (const [tab, asset] of [
        ['upgrade-3', icons.passive], ['upgrade-4', icons.skill1],
        ['upgrade-5', icons.skill2], ['upgrade-6', icons.ultimate],
      ]) {
        const button = html.match(new RegExp(`<button[^>]*data-character-tab="${tab}"[^>]*>[\\s\\S]*?</button>`))?.[0];
        expect(button).toBeDefined();
        expect(button).toContain(`abilities/${asset}.png`);
      }
    }
    const home = homeHub(starter, false);
    expect(home).not.toContain('passive-summary');
    expect(home).not.toContain('assets/abilities/');
    for (const id of ['upgrade-3', 'upgrade-4', 'upgrade-5', 'upgrade-6']) {
      expect(home).not.toContain(`data-character-tab="${id}"`);
    }
    expect(home).not.toContain('hub-dock');
    expect(home).not.toContain('data-character-tab=');
    expect(home).not.toContain('Costs 25 Shatter Gauge');
  });
  it.each(starters)('$name displays all seven character stats on Home and Overview', (starter) => {
    for (const html of [homeHub(starter, false), characterDetail(starter, 'overview')]) {
      for (const label of ['Shatter capacity', 'Health', 'Defense', 'Attack Damage', 'Critical Rate', 'Critical Damage', 'Elemental Damage']) {
        expect(html).toContain(label);
      }
      expect(html).toContain('1.5x');
    }
  });

  it('renders tab details independently without replacing the character or navigation', () => {
    for (const starter of starters) {
      for (const tab of characterTabs) {
        const detail = characterDetail(starter, tab.id);
        expect(detail).toContain(`>${tab.label}</h2>`);
        if (tab.id !== 'upgrade-0') expect(detail).not.toContain('assets/characters/');
        expect(detail).not.toContain('hub-showcase');
        expect(detail).not.toContain('data-character-tab');
        expect(characterHub(starter, tab.id)).toContain(detail);
      }
    }
    expect(() => characterDetail(starters[0], 'invalid')).toThrow('Unknown');
  });
  it.each(starters)('$name organizes all nine destinations and its combat kit into compact categories', (starter) => {
    const hub = characterHub(starter, 'overview');
    for (const category of ['Character', 'Growth', 'Combat']) {
      expect(hub).toContain(`class="character-nav-group" aria-label="${category}"`);
    }
    expect(hub.match(/data-character-tab="/g)).toHaveLength(8);
    expect(hub.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(hub).toContain('class="character-form-title" data-owned-title');
    const overview = characterDetail(starter, 'overview');
    for (const heading of ['Survival', 'Offense', 'Resource', 'Abilities &amp; passive']) {
      expect(overview).toContain(`>${heading}</h3>`);
    }
    expect(overview.match(/class="hub-ability"/g)).toHaveLength(4);
    for (const id of ['upgrade-0', 'upgrade-1']) {
      const detail = characterDetail(starter, id);
      expect(detail).toContain('class="character-upgrade-grid"');
      expect(detail).toContain('Required resources');
      expect(detail).toContain('Owned / Required');
      expect(detail.match(/id="upgrade-result"/g)).toHaveLength(1);
      expect(detail.match(/<span><small>/g)).toHaveLength(7);
    }
    expect(isCharacterTab('upgrade-2')).toBe(false);
    expect(() => characterDetail(starter, 'upgrade-2')).toThrow('Unknown character upgrade area');
    expect(characterHub(starter, 'overview')).not.toContain('Weapon upgrade');
    for (const id of ['upgrade-3', 'upgrade-4', 'upgrade-5', 'upgrade-6']) {
      const detail = characterDetail(starter, id);
      expect(detail).toContain('Current effect');
      expect(detail).toContain('Upgrade availability');
      expect(detail).toContain('disabled>Upgrade unavailable');
      expect(detail).not.toContain('Costs unset');
    }
    expect(characterDetail(starter, 'equipment')).toContain('Master slot');
    expect(characterDetail(starter, 'equipment')).toContain('Conduit slots');
  });
  it.each(starters)('$name previews only the next form as a silhouette, without revealing its title', (starter) => {
    for (let evolution = 1; evolution < 6; evolution++) {
      const account = emptyAccount();
      account.characters[starter.id] = { level: 0, evolution };
      const detail = characterDetail(starter, 'upgrade-0', account);
      expect(detail).toContain('class="evolution-silhouette"');
      expect(detail).toContain(`characters/${starter.art}-evo-${evolution + 1}.png`);
      expect(detail).toContain(`alt="${starter.name} next evolution silhouette"`);
      expect(detail).toContain('width="150" height="150"');
      expect(detail.match(/<img[^>]*characters\//g)).toHaveLength(1);
      expect(characterDetail(starter, 'upgrade-1', account)).not.toContain('evolution-silhouette');
    }
    const final = { ...emptyAccount(), characters: { [starter.id]: { level: 105, evolution: 6 } } };
    expect(characterDetail(starter, 'upgrade-0', final)).not.toContain('evolution-silhouette');
  });
  it('renders funded upgrades, scaled combat descriptions, final caps and real inventory', () => {
    const account = emptyAccount();
    account.fractalis = 500;
    account.materials['infernic-common'] = 20;
    account.characters.ember = { level: 30, evolution: 1 };
    const evolve = characterDetail(starters[0], 'upgrade-0', account);
    expect(evolve).toMatch(/data-upgrade="evolve"[^>]*data-upgrade-blocked="false"[^>]*>Evolve/);
    expect(evolve).toContain('20 / 15');
    expect(evolve).toContain('500 / 300');
    expect(evolve).not.toContain('PREVIEW');
    expect(evolve).not.toContain('Materials coming later');
    expect(characterDetail(starters[0], 'upgrade-1', account)).toContain('Level cap reached');
    expect(characterDetail(starters[0], 'overview', account)).toContain('174.4% damage');
    expect(homeHub(starters[0], false, account)).toContain('Lv.30 / Evo.1');
    account.characters.ember = { level: 105, evolution: 6 };
    expect(characterDetail(starters[0], 'upgrade-0', account)).toContain('Final evolution reached');
    expect(characterDetail(starters[0], 'upgrade-1', account)).toContain('Maximum level reached');
    for (const tab of ['upgrade-0', 'upgrade-1']) {
      expect(characterDetail(starters[0], tab, account)).toContain('id="upgrade-result" role="status"');
    }
    expect(inventoryHub(account)).toContain('Seed of Infernic');
    expect(characterDetail(starters[0], 'upgrade-0', null)).toContain('Progression unavailable');
  });
  it.each(starters)('$name owns its equipment menu separately from material inventory', (starter) => {
    const equipment = characterDetail(starter, 'equipment');
    expect(equipment).toContain(`data-character-equipment="${starter.id}"`);
    expect(equipment).toContain(`${starter.name}'s stats`);
    expect(equipment).toContain('Master Conduit');
    expect(equipment.match(/data-conduit-slot=/g)).toHaveLength(8);
    expect(equipment).not.toContain('<h2>Materials</h2>');
    expect(equipment).toContain('each name can be equipped once per character');
    expect(homeHub(starter, false)).not.toContain('data-character-tab="equipment"');
  });
  it('shows fractional growth consistently on Home, Overview and upgrade previews', () => {
    const account = emptyAccount();
    const preview = characterDetail(starters[0], 'upgrade-1', account);
    for (const change of ['10 &rarr; 10.64', '38 &rarr; 41.52', '8 &rarr; 8.74']) expect(preview).toContain(change);
    account.characters.ember = { level: 1, evolution: 1 };
    for (const html of [homeHub(starters[0], false, account), characterDetail(starters[0], 'overview', account)]) {
      for (const value of ['10.64', '41.52', '8.74']) expect(html).toContain(`<strong>${value}</strong>`);
      expect(html).not.toContain('000000000');
    }
  });
});
