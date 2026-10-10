import { describe, expect, it } from 'vitest';
import { archives } from './archives';
import { emptyAccount } from '../game/account';
import { conduits } from '../content/conduits';
import { elements } from '../content/activities';
import { starters } from '../content/starters';
import { characterArt } from '../content/character-art';
import { sanctuaryHeader, sanctuaryContext, isMenuPage } from './sanctuary';
import { inventoryHub, characterHub } from './hub';
import { elementLabel } from './element-label';
import { elementAssetIds } from '../content/element-migration';

describe('unified Archives', () => {
  it('disables native image drag previews so locked art cannot reveal its colored drag ghost', () => {
    const html = archives(emptyAccount());
    const images = html.match(/<img\b[^>]*src="[^"]*\/(?:characters|enemies|conduits)\/[^"]*"[^>]*>/g) ?? [];
    expect(images.length).toBeGreaterThan(0);
    for (const image of images) expect(image).toContain('draggable="false"');
  });
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
    expect(html).toContain('Current form · Lv.0');
    expect(html).toContain('<p class="archive-ownership">Not owned</p>');
    expect(html).toContain('<p class="archive-ownership">Reached form</p>');
    expect(html).toContain('<p class="archive-ownership">Evolution not reached</p>');
    expect(html).toContain('Level 0 preview');
    expect(html).not.toMatch(/ \/ (Silhouette|Art locked|Art revealed|Loot locked|Loot revealed|Includes equipped Conduits)/);
    expect(html).not.toContain('Current saved stats');
    expect(html.match(/data-archive-character=/g)).toHaveLength(126);
    expect(html.match(/archive-form-revealed/g)).toHaveLength(2);
    expect(html.match(/archive-form-locked/g)).toHaveLength(124);
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

  it('catalogs every Conduit with supplied or honestly pending artwork, effects and saved counts', () => {
    const account = emptyAccount();
    account.conduits = { 'bastion-lock': 3 };
    const html = archives(account, 'conduits');
    for (const conduit of conduits) {
      expect(html).toContain(`data-archive-conduit="${conduit.id}"`);
      expect(html).toContain(`class="archive-card ${conduit.id === 'bastion-lock' ? 'archive-conduit-revealed' : 'archive-conduit-locked'}" data-archive-conduit="${conduit.id}"`);
      expect(html).toContain(conduit.effect);
    }
    expect(html).toContain('Owned 3');
    const conduitsSection = html.slice(html.indexOf('id="archive-conduits"'), html.indexOf('id="archive-creatures"'));
    expect(conduitsSection.match(/Artwork pending/g)).toHaveLength(25);
    for (const conduit of conduits) {
      if (conduit.art) expect(html).toContain(`assets/conduits/${conduit.art}.png`);
      else expect(html).not.toContain(`assets/conduits/${conduit.id}.png`);
    }
    const fullArchive = archives(account);
    for (const gallery of ['characters', 'conduits', 'creatures']) {
      expect(fullArchive).toContain(`assets/banners/archive-${gallery}.png`);
    }
  });

  it('keeps unowned and unavailable Conduit art silhouetted without changing holdings', () => {
    for (const account of [emptyAccount(), { ...emptyAccount(), conduits: { 'vigil-core': 0 } }, null]) {
      const before = structuredClone(account);
      const html = archives(account, 'conduits');
      expect(html.match(/class="archive-card archive-conduit-locked"/g)).toHaveLength(conduits.length);
      expect(html).not.toContain('archive-conduit-revealed');
      expect(html).toContain('unowned Conduits remain silhouettes');
      if (!account) expect(html).toContain('Ownership unavailable');
      expect(account).toEqual(before);
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
    expect(revealed).toContain('data-element="botanic"');
    expect(revealed).not.toContain('Drop pool and chances');
    const unavailable = archives(null);
    expect(unavailable).toContain('Ownership unavailable');
    expect(unavailable).toContain('Creature discoveries unavailable');
    expect(unavailable).not.toContain('Owned 0');
    expect(unavailable).not.toContain('<p class="archive-ownership">Not owned</p>');
    expect(unavailable).not.toContain('Art locked');
    expect(unavailable.match(/archive-form-locked/g)).toHaveLength(126);
    expect(unavailable).not.toContain('archive-form-revealed');
  });

  it('routes galleries through Collections instead of Inventory and retains legacy aliases', () => {
    expect(isMenuPage('archives')).toBe(true);
    expect(isMenuPage('glossary')).toBe(true);
    expect(sanctuaryHeader('archives', 0)).toContain('Archives');
    expect(sanctuaryHeader('glossary', 0)).toContain('Archives');
    expect(isMenuPage('collections')).toBe(true);
    expect(sanctuaryContext('archives')).toBe('');
    expect(sanctuaryHeader('archives', 0)).toContain('data-menu-back');
    expect(archives(emptyAccount(), 'conduits')).not.toContain('Recovered ancient-war mechanism');
    expect(sanctuaryHeader('home', 0)).toContain('data-page="collections"');
    expect(sanctuaryContext('inventory') + inventoryHub()).not.toContain('data-page="archives"');
    expect(characterHub(starters[0], 'overview')).not.toContain('data-page="archives"');
    expect(elementLabel('tranquilitic')).toContain('Tranquilitic <span>(Peace)</span>');
    expect(elementLabel('tranquilitic')).toContain('assets/elements/tranquilitic.png');
    for (const element of elements) {
      expect(elementLabel(element.id)).toContain(`assets/elements/${elementAssetIds[element.id]}.png`);
      expect(elementLabel(element.id)).toContain(element.name);
    }
  });
});
