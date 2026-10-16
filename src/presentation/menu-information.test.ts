import { describe, expect, it } from 'vitest';
import { emptyAccount } from '../game/account';
import { starters } from '../content/starters';
import { archives } from './archives';
import { gameplayHub } from './gameplay';
import { characterHub, characterInformation, characterTabs, inventoryHub } from './hub';
import { summonHub } from './roster';

const plain = (text?: string | null): string => (text ?? '').replace(/\[([^[\]]+)\]/g, '$1');

describe('shared menu information', () => {
  it('keeps progression and equipment rules in one Character dialog', () => {
    const rules = characterInformation();
    expect(rules.match(/data-information=/g)).toHaveLength(1);
    expect(rules).toContain('preserves that level');
    expect(rules).toContain('cannot evolve');
    expect(rules).toContain('Each name can be equipped once per character');
    for (const tab of characterTabs) {
      const html = characterHub(starters[0], tab.id);
      expect(html).not.toContain('data-information=');
      expect(plain(html)).toContain('<details class="character-kit-navigation">');
    }
  });
  it('shares Gameplay rules without repeating dialogs on each activity', () => {
    const html = gameplayHub(emptyAccount());
    expect(html.match(/data-information="gameplay-information"/g)).toHaveLength(1);
    expect(plain(html)).toContain('data-information="story-prologue-information"');
    expect(plain(html)).toContain('data-information="gameplay-information"');
    expect(plain(html)).toContain('a 50% chance of 1 at Lv.65');
    expect(plain(html)).toContain('The final boss gives 25 instead, at the same 80% chance.');
    expect(plain(html)).toContain('stage 25 final boss awards 24,300-48,600');
    expect(plain(html)).toContain('Choose Continue when ready.');
    expect(html.match(/<details/g)).toHaveLength(1);
    expect(plain(html)).toContain('<details class="story-prologue">');
  });
  it('gives Inventory a single Information dialog without mixing stores or galleries into holdings', () => {
    const html = inventoryHub(emptyAccount());
    expect(html.match(/data-information=/g)).toHaveLength(1);
    expect(plain(html)).toContain('data-information="inventory-information"');
    expect(plain(html)).toContain('Common Conduits are purchased in the Store');
    expect(plain(html)).toContain('higher tiers drop in Awaken the Machines');
    expect(plain(html)).toContain('at most four ordinary Omnic Conduits, all matching their combat element');
    expect(plain(html)).toContain('Panel counts show distinct owned item types');
    expect(html).not.toMatch(/data-page="(?:stores|collections)"/);
    expect(html).not.toContain('Visit Conduit Store');
  });
  it('keeps Collections rules separate from unique form kits', () => {
    const html = archives(emptyAccount());
    const rules = html.match(/<dialog[^>]+id="collections-information"[\s\S]*?<\/dialog>/)?.[0];
    expect(rules).toBeDefined();
    expect(html.match(/data-information="collections-information"/g)).toHaveLength(1);
    for (const starter of starters) {
      expect(rules).not.toContain(starter.description);
      expect(plain(html)).toContain(starter.description);
    }
    expect(html).not.toContain('<details');
  });
  it('keeps summon rules visible inside Rates & Information, without nested disclosures', () => {
    const html = summonHub(emptyAccount());
    expect(plain(html)).toContain('<section class="summon-rules">');
    expect(plain(html)).toContain('Rates & Information');
    expect(html).not.toContain('<details');
  });
});
