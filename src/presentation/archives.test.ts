import { describe, expect, it } from 'vitest';
import { archives } from './archives';
import { emptyAccount } from '../game/account';
import { conduits } from '../content/conduits';
import { elements } from '../content/activities';
import { starters } from '../content/starters';
import { characterArt } from '../content/character-art';
import { sanctuaryHeader, sanctuaryNavigation, isMenuPage } from './sanctuary';
import { homeHub, inventoryHub, characterHub } from './hub';
import { elementLabel } from './element-label';

describe('unified Archives', () => {
  it('groups the three galleries with banner headers and one visible default panel', () => {
    const html = archives(emptyAccount());
    expect(html.match(/data-archive-gallery=/g)).toHaveLength(3);
    expect(html.match(/class="archive-banner /g)).toHaveLength(3);
    expect(html).toContain('id="archive-characters" class="archive-panel" aria-labelledby="archive-characters-heading" >');
    expect(html).toContain('id="archive-conduits" class="archive-panel" aria-labelledby="archive-conduits-heading" hidden');
    expect(html).toContain('id="archive-creatures" class="archive-panel" aria-labelledby="archive-creatures-heading" hidden');
    expect(archives(emptyAccount(), 'creatures')).toContain('id="archive-creatures" class="archive-panel" aria-labelledby="archive-creatures-heading" >');
  });

  it('previews all characters without granting ownership and shows real owned forms and effective stats', () => {
    const account = emptyAccount();
    account.characters.ember = { level: 0, evolution: 2, weaponRank: 0 };
    account.conduits = { 'vigil-core': 1 };
    account.conduitEquipment = { ember: ['vigil-core', null, null, null, null, null, null, null] };
    const before = structuredClone(account);
    const html = archives(account);
    for (const starter of starters) expect(html).toContain(`data-archive-character="${starter.id}"`);
    expect(html).toContain('Owned / Lv.0 / Evo.2');
    expect(html).toContain('Not owned / Silhouette');
    expect(html.match(/data-archive-character=/g)).toHaveLength(42);
    expect(html.match(/archive-form-revealed/g)).toHaveLength(2);
    expect(html.match(/archive-form-locked/g)).toHaveLength(40);
    for (const starter of starters) for (let evolution = 1; evolution <= 6; evolution++) {
      expect(html).toContain(`data-archive-character="${starter.id}" data-form="${evolution}"`);
      expect(html).toContain(characterArt(starter.id, evolution).title);
    }
    expect(html).toContain(characterArt('ember', 2).title);
    expect(html).toContain('aria-label="Uncommon rarity"');
    expect(html).toContain('aria-label="5-star character"');
    expect(html).toContain('<dd>334.95</dd>');
    expect(html).toContain('Current combat kit');
    expect(account).toEqual(before);
  });

  it('catalogs every Common Conduit with supplied artwork, effects and saved counts', () => {
    const account = emptyAccount();
    account.conduits = { 'bastion-lock': 3 };
    const html = archives(account, 'conduits');
    for (const conduit of conduits) {
      expect(html).toContain(`data-archive-conduit="${conduit.id}"`);
      expect(html).toContain(conduit.effect);
    }
    expect(html).toContain('Owned 3');
    expect(html).not.toContain('Artwork pending');
    for (const conduit of conduits) expect(html).toContain(`assets/conduits/${conduit.id}.png`);
    const fullArchive = archives(account);
    for (const gallery of ['characters', 'conduits', 'creatures']) {
      expect(fullArchive).toContain(`assets/banners/archive-${gallery}.png`);
    }
  });

  it('retains discovery locks and explicitly reports unavailable saves', () => {
    const locked = archives(emptyAccount(), 'creatures');
    expect(locked).not.toContain('<h2>Goblin</h2>');
    expect(locked.slice(locked.indexOf('id="archive-creatures"'))).not.toContain('data-element="chaotic"');
    const account = emptyAccount();
    account.creatures['adventure:goblin'] = { defeated: false };
    const revealed = archives(account, 'creatures');
    expect(revealed).toContain('<h2>Goblin</h2>');
    expect(revealed).toContain('data-element="efflorescent"');
    expect(revealed).not.toContain('Drop pool and chances');
    const unavailable = archives(null);
    expect(unavailable).toContain('Ownership unavailable');
    expect(unavailable).toContain('Creature discoveries unavailable');
    expect(unavailable).not.toContain('Owned 0');
    expect(unavailable).not.toContain('Not owned / Silhouette');
    expect(unavailable.match(/archive-form-locked/g)).toHaveLength(42);
    expect(unavailable).not.toContain('archive-form-revealed');
  });

  it('routes Home, Inventory and Character through Archives and retains the old glossary route', () => {
    expect(isMenuPage('archives')).toBe(true);
    expect(isMenuPage('glossary')).toBe(true);
    expect(sanctuaryHeader('archives', 0)).toContain('Archives');
    expect(sanctuaryHeader('glossary', 0)).toContain('Archives');
    expect(sanctuaryNavigation('archives')).toContain('data-page="inventory" aria-current="page"');
    for (const html of [homeHub(starters[0], false), inventoryHub(), characterHub(starters[0], 'overview')]) {
      expect(html).toContain('data-page="archives"');
    }
    expect(elementLabel('tranquilitic')).toContain('Tranquilitic <span>(Peace)</span>');
    expect(elementLabel('tranquilitic')).toContain('assets/elements/tranquilitic.png');
    for (const element of elements) {
      expect(elementLabel(element.id)).toContain(`assets/elements/${element.id}.png`);
      expect(elementLabel(element.id)).toContain(element.name);
    }
  });
});
