// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { emptyAccount } from '../game/account';
import { starters } from '../content/starters';
import { archives } from './archives';
import { gameplayHub } from './gameplay';
import { characterHub, characterInformation, characterTabs, inventoryHub } from './hub';
import { summonHub } from './roster';
import { bracketReferences } from './reference-text';
import { conduitStore } from './conduit-store';
import { conduitUpgradeMenu } from './conduit-upgrade';

const plain = (text?: string | null): string => (text ?? '').replace(/<span class="element-label"[^>]*><img[^>]*>(\[[^\]]+\])<\/span>/g, '$1').replace(/\[([^[\]]+)\]/g, '$1');

describe('shared menu information', () => {
  it('keeps purchase help brief without restating prices or explaining visible controls', () => {
    const account = { ...emptyAccount(), calamityClears: { machines: 1 } };
    for (const rarity of ['', 'Calamitic']) {
      const host = document.createElement('div');
      host.innerHTML = conduitStore(account, undefined, rarity);
      const text = plain(host.querySelector('#store-information .information-content')?.textContent);
      expect(text).toContain('Unlock once, equip across your Squad');
      expect(text.trim().split(/\s+/).length).toBeLessThanOrEqual(30);
      expect(text).not.toMatch(/Purchase with|Equip them in|bought once|each name equips/);
      if (rarity) expect(text).toContain('ordinary slots, with no rarity limit');
      else expect(text).toContain('Extra copies give no benefit');
    }
  });
  it('keeps shared help paragraphs short and preserves non-obvious equipment restrictions', () => {
    const host = document.createElement('div');
    for (const html of [characterInformation(), inventoryHub(emptyAccount()), conduitUpgradeMenu(emptyAccount())]) {
      host.innerHTML = html;
      for (const paragraph of Array.from(host.querySelectorAll('.information-content p'))) {
        expect(plain(paragraph.textContent).trim().split(/\s+/).length).toBeLessThanOrEqual(65);
      }
    }
    const rules = plain(characterInformation());
    for (const text of ['at most four Omnic', "matching the wearer's Element", 'Masters cannot be upgraded', 'next run', "can't be sold or consumed"]) {
      expect(rules).toContain(text);
    }
  });
  it('keeps progression and equipment rules in one Character dialog', () => {
    const rules = characterInformation();
    expect(rules.match(/data-information=/g)).toHaveLength(1);
    expect(rules).toContain('Evolving requires max level and keeps it');
    expect(rules).toContain('never evolve');
    expect(rules).toContain('No duplicate names on the same member');
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
    expect(plain(html)).toContain('guaranteed 1 per enemy at Stage 1 (Lv.65)');
    expect(plain(html)).toContain('the final boss gives 25 guaranteed.');
    expect(plain(html)).toContain('stage 25 final boss gives 24,300-48,600');
    expect(plain(html)).toContain('Staged activities: HP restores; Elemental Gauge carries over.');
    const disclosures = html.match(/<details\b[^>]*>/g) ?? [];
    expect(disclosures.filter(tag => tag !== '<details class="conduit-lore-disclosure">')).toEqual(['<details class="story-prologue">']);
    expect(html.match(/data-information="machine-loot-focus"/g)).toHaveLength(1);
    expect(plain(html)).toContain('<details class="story-prologue">');
  });
  it('gives Inventory a single Information dialog without mixing stores or galleries into holdings', () => {
    const html = inventoryHub(emptyAccount());
    expect(html.match(/data-information=/g)).toHaveLength(1);
    expect(plain(html)).toContain('data-information="inventory-information"');
    expect(plain(html)).toContain('Common: Conduit Store');
    expect(plain(html)).toContain('Rare, Legendary and Omnic: Awaken the Machines');
    expect(plain(html)).toContain('Unlock once, equip across your Squad');
    expect(plain(html)).toContain('Counts show distinct item types');
    for (const term of ['Attack Action', 'Bonus Strike', 'Direct Damage', 'Shield', 'Enemy Turn', 'Round', 'Battle']) expect(html).toContain(`<dt>${term}</dt>`);
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
      expect(plain(html)).toContain(plain(bracketReferences(starter.description, false)));
    }
    expect(rules).not.toContain('<details');
    const disclosures = html.match(/<details\b[^>]*>/g) ?? [];
    expect(disclosures.length).toBeGreaterThan(0);
    expect(disclosures.every(tag => tag === '<details class="conduit-lore-disclosure">')).toBe(true);
  });
  it('keeps summon rules visible inside Rates & Information, without nested disclosures', () => {
    const html = summonHub(emptyAccount());
    expect(plain(html)).toContain('<section class="summon-rules">');
    expect(plain(html)).toContain('Rates & Information');
    expect(html).not.toContain('<details');
  });
});
