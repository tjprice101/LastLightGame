import { describe, expect, it } from 'vitest';
import { starters } from '../content/starters';
import { characterHub, characterTabs, homeHub, isCharacterTab } from './hub';

describe('game-specific hub layouts', () => {
  it.each(starters)('$name uses its real art, stats, passive, and ability costs', (starter) => {
    const home = homeHub(starter, false);
    expect(home).toContain(`characters/${starter.art}.png`);
    expect(home).toContain(starter.name);
    expect(home).toContain('data-page="battle"');
    expect(home).toContain('Adventure &rarr;');
    expect(home).toContain('Start at wave 1');
    expect(home).not.toContain('Free Battle');
    expect(home).toContain('data-feature="Squad"');
    expect(home).toContain('data-feature="Summon"');
    const overview = characterHub(starter, 'overview');
    expect(overview).toContain('Costs 25 Shatter Gauge');
    expect(overview).toContain('Costs 40 Shatter Gauge');
    expect(overview).toContain('Costs 100 Shatter Gauge');
    if (starter.id === 'tide') expect(home).toContain('<strong>24</strong>');
  });
  it('offers overview, seven upgrade areas, and inventory without fake transactions', () => {
    expect(characterTabs).toHaveLength(9);
    for (const tab of characterTabs) {
      expect(isCharacterTab(tab.id)).toBe(true);
      expect(characterHub(starters[0], tab.id)).toContain(`>${tab.label}</h2>`);
    }
    expect(isCharacterTab('missing')).toBe(false);
    expect(() => characterHub(starters[0], 'missing')).toThrow('Unknown');
    expect(characterHub(starters[0], 'upgrade-0')).toContain('+10 Lycalis');
    expect(characterHub(starters[0], 'upgrade-0')).toContain('reset to level 0');
    expect(characterHub(starters[0], 'upgrade-0')).toContain('disabled>Upgrade unavailable');
    const inventory = characterHub(starters[0], 'inventory');
    expect(inventory.match(/class="artifact-slot"/g)).toHaveLength(8);
    expect(inventory).toContain('Master relic');
    expect(homeHub(starters[0], true)).toContain(starters[0].lore.awakening);
  });
});
