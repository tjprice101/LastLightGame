import { describe, expect, it } from 'vitest';
import { emptyAccount } from '../game/account';
import { starters } from '../content/starters';
import { archives } from './archives';
import { gameplayHub } from './gameplay';
import { characterHub, characterInformation, characterTabs, inventoryHub } from './hub';
import { summonHub } from './roster';

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
      expect(html).toContain('<details class="character-kit-navigation">');
    }
  });
  it('shares Gameplay rules without repeating dialogs on each activity', () => {
    const html = gameplayHub(emptyAccount());
    expect(html.match(/data-information=/g)).toHaveLength(1);
    expect(html).toContain('data-information="gameplay-information"');
    expect(html).toContain('50% of 1 at Lv.65 to 80% of 5 at Lv.120');
    expect(html).toContain('100-200 Prismatica at Lv.65 to 1,000-2,000 at Lv.120');
    expect(html).toContain('Continue is manual.');
    expect(html).not.toContain('<details');
  });
  it('gives Inventory a single Information dialog without mixing stores or galleries into holdings', () => {
    const html = inventoryHub(emptyAccount());
    expect(html.match(/data-information=/g)).toHaveLength(1);
    expect(html).toContain('data-information="inventory-information"');
    expect(html).toContain('Common Conduits are purchased in the Store');
    expect(html).toContain('higher tiers drop in Awaken the Machines');
    expect(html).toContain('at most four Omnic, matching their combat element');
    expect(html).not.toMatch(/data-page="(?:stores|collections)"/);
    expect(html).toContain('Visit Conduit Store');
  });
  it('keeps Collections rules separate from unique form kits', () => {
    const html = archives(emptyAccount());
    expect(html.match(/data-information="collections-information"/g)).toHaveLength(1);
    for (const starter of starters) {
      expect(html.split(starter.description)).toHaveLength(2);
    }
    expect(html).not.toContain('<details');
  });
  it('keeps summon rules visible inside Rates & Information, without nested disclosures', () => {
    const html = summonHub(emptyAccount());
    expect(html).toContain('<section class="summon-rules">');
    expect(html).toContain('Rates & Information');
    expect(html).not.toContain('<details');
  });
});
