import { describe, expect, it } from 'vitest';
import { openingStarters as starters } from '../content/starters';
import { characterDetail, characterHub, characterInformation, characterTabs, homeHub, inventoryHub, isCharacterTab } from './hub';
import { emptyAccount } from '../game/account';
import { abilityIcons } from './ability-icon';
import { characterName } from '../content/character-art';

describe('game-specific hub layouts', () => {
  it.each([1, 2, 3, 4, 5])('blocks evolving form %i until its level cap, even with resources', (evolution) => {
    const account = emptyAccount();
    const cap = 15 * evolution + 15;
    account.characters.ember = { level: cap - 1, evolution };
    account.fractalis = Number.MAX_SAFE_INTEGER;
    for (const rarity of ['common', 'uncommon', 'rare', 'epic', 'legendary']) account.materials[`infernic-${rarity}`] = 1000;
    account.materials['heavens-evolution'] = 1000;
    const below = characterDetail(starters[0], 'upgrade-0', account);
    expect(below).toContain(`Reach Lv.${cap} to evolve.`);
    expect(below).toMatch(/data-upgrade="evolve"[^>]*data-upgrade-blocked="true"[^>]*disabled/);
    account.characters.ember.level = cap;
    expect(characterDetail(starters[0], 'upgrade-0', account)).toContain('data-upgrade-blocked="false"');
  });
  it('emphasizes stat gains and resource affordability without changing preview values', () => {
    const account = emptyAccount();
    account.characters.ember = { level: 0, evolution: 1 };
    const before = structuredClone(account);
    const level = characterDetail(starters[0], 'upgrade-1', account);
    expect(level).toContain('stat-change--increase');
    expect(level).toContain('220 &rarr;');
    expect(level).toContain('240.4</b>');
    expect(level).toContain('aria-label="Increased to');
    expect(level).toContain('resource-missing');
    account.fractalis = 10000;
    account.materials['infernic-common'] = 100;
    expect(characterDetail(starters[0], 'upgrade-1', account)).toContain('resource-sufficient');
    expect(characterDetail(starters[0], 'upgrade-0', account)).toContain('stat-change--increase');
    account.conduits = { 'vigil-core': 1 };
    account.conduitEquipment = { ember: ['vigil-core', null, null, null, null, null, null, null] };
    const equipped = characterDetail(starters[0], 'equipment', account);
    expect(equipped).toContain('class="stat-change stat-change--increase"');
    expect(equipped).toContain('Before Conduits:');
    expect(before.characters).toEqual(account.characters);
  });
  it('composes Home with left banners, a central portrait and three squad slots', () => {
    const html = homeHub(starters[0], false);
    expect(html).toContain('class="home-banner home-summon-banner"');
    expect(html).toContain('class="home-banner home-summon-banner home-special-banner"');
    expect(html).toContain('data-page="summon" data-rose-banner');
    expect(html).toContain('banners/summon-roses.png');
    expect(html).toContain('<strong>Roses Under Sunny Skies</strong><span>Special Limited Time Banner!</span>');
    expect(html).not.toContain('home-event-banner');
    expect(html).not.toContain('35 stages · Lv.80-140');
    expect(html).toContain('class="home-squad" aria-label="Current squad"');
    expect(html.match(/class="team-companion/g)).toHaveLength(3);
    expect(html.match(/team-empty/g)).toHaveLength(2);
    expect(html.indexOf('class="home-destinations"')).toBeLessThan(html.indexOf('class="hub-showcase'));
    expect(html.indexOf('class="hub-showcase')).toBeLessThan(html.indexOf('class="home-squad"'));
    expect(html).not.toContain('class="hub-rail"');
    expect(html).not.toContain('home-menu-shortcuts');
    expect(html).toContain('sanctuary-identity-plate');
    for (const page of ['squad', 'summon']) {
      expect(html).toContain(`data-page="${page}"`);
    }
  });
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
    expect(home).toContain('data-page="story"');
    expect(home).toContain('Story &rarr;');
    expect(home).toContain('Explore the world map · 150 stages');
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
    expect(characterHub(starters[0], 'upgrade-0')).toContain('+10 Null-Prismatica');
    expect(characterInformation()).toContain("Evolution requires the current form's maximum level and preserves that level");
    expect(characterInformation()).toContain('30 / 45 / 60 / 75 / 90');
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
  it.each(starters)('$name keeps Home stats inside Information and displays all stats on Overview', (starter) => {
    const home = homeHub(starter, false);
    expect(home.slice(0, home.indexOf('<dialog'))).not.toContain('Attack Damage');
    expect(home).toContain('data-information="home-information"');
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
  it.each(characterTabs)('$label opens the matching Details, Growth or Conduits section', (tab) => {
    const html = characterHub(starters[0], tab.id);
    const expected = tab.id === 'equipment' ? 'equipment' : ['upgrade-0', 'upgrade-1'].includes(tab.id) ? 'growth' : 'details';
    const sections = [...html.matchAll(/<section class="character-nav-group"[^>]*data-character-section="([^"]+)"([^>]*)>/g)];
    expect(sections).toHaveLength(3);
    expect(sections.filter(([, , attributes]) => !attributes.includes('hidden')).map(([, id]) => id)).toEqual([expected]);
    expect(html.match(/data-character-tab="/g)).toHaveLength(8);
    expect(html).toContain(`aria-labelledby="upgrade-heading"`);
  });
  it.each(starters)('$name organizes all nine destinations and its combat kit into compact categories', (starter) => {
    const hub = characterHub(starter, 'overview');
    for (const category of ['Character', 'Growth', 'Combat']) {
      expect(hub).toContain(`class="character-nav-group" aria-label="${category}"`);
    }
    expect(hub.match(/data-character-tab="/g)).toHaveLength(8);
    expect(hub.match(/aria-pressed="true"/g)).toHaveLength(2);
    expect(hub.match(/data-character-section-tab="/g)).toHaveLength(3);
    expect(hub.indexOf('class="hub-showcase"')).toBeLessThan(hub.indexOf('class="character-control-panel"'));
    expect(hub.indexOf('class="character-control-panel"')).toBeLessThan(hub.indexOf('class="hub-rail"'));
    expect(hub).toContain(`<span data-owned-title>${characterName(starter.id)}</span>`);
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
      expect(detail).not.toContain('Upgrade availability');
      expect(detail).not.toContain('Upgrade unavailable');
      expect(detail).not.toContain('disabled');
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
      expect(detail).toContain(`alt="${characterName(starter.id, evolution)} next evolution silhouette"`);
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
    expect(homeHub(starters[0], false, account)).toContain('Lv.30 · Evo.1');
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
    expect(equipment).toContain(`${characterName(starter.id)}'s Conduits`);
    expect(equipment).toContain('Master Conduit');
    expect(equipment.match(/data-conduit-slot=/g)).toHaveLength(8);
    expect(equipment).not.toContain('<h2>Materials</h2>');
    expect(characterInformation()).toContain('Each name can be equipped once per character');
    expect(equipment).not.toContain('data-information="equipment-information"');
    expect(homeHub(starter, false)).not.toContain('data-character-tab="equipment"');
  });
  it('shows fractional growth consistently on Home, Overview and upgrade previews', () => {
    const account = emptyAccount();
    const preview = characterDetail(starters[0], 'upgrade-1', account);
    for (const change of ['10 &rarr; 10.64', '38 &rarr; 41.52', '8 &rarr; 8.74']) expect(preview.replace(/<[^>]*>/g, '')).toContain(change);
    account.characters.ember = { level: 1, evolution: 1 };
    for (const html of [homeHub(starters[0], false, account), characterDetail(starters[0], 'overview', account)]) {
      for (const value of ['10.64', '41.52', '8.74']) expect(html).toContain(`<strong>${value}</strong>`);
      expect(html).not.toContain('000000000');
    }
  });
});
