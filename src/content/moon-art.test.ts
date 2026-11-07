import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { characterArt } from './character-art';
import { getStarter } from './starters';
import { moonCharacters, sunshadeCharacters } from './moon-sunshade-characters';
import { moonArtRevisions } from './moon-art-revisions';
import { materialArt } from './dungeon-art';
import { newEventDefinition, newEventMaterialIds, newEventWindowActive } from './moon-sunshade-events';
import { infusionEncounter } from './infusions';
import { moonBanner, sunshadeBanner } from './moon-sunshade-banners';
import { assetUrl, portraitAttributes, characterFacing } from '../presentation/portrait';
import { abilityIcon } from '../presentation/ability-icon';
import { masterArtUrl } from '../presentation/master-conduits';
import { statusArt } from './status-art';
import { unitFacing } from '../presentation/unit-facing';
import { moonEvent } from '../presentation/rose-event';
import { emptyAccount } from '../game/account';
import { getCreature } from './creatures';

describe('reviewed Moon delivery on shared runtime surfaces', () => {
  it('versions exactly104 source exports by bytes', () => {
    expect(Object.keys(moonArtRevisions)).toHaveLength(104);
    for (const [path, revision] of Object.entries(moonArtRevisions)) {
      expect(createHash('sha256').update(readFileSync(`public/assets/${path}`)).digest('hex').slice(0, 16)).toBe(revision);
      expect(assetUrl(path)).toBe(`${import.meta.env.BASE_URL}assets/${path}?v=${revision}`);
    }
  });

  it.each(moonCharacters)('$name shares reviewed forms, ability art and three Master images', character => {
    for (let evolution = 1; evolution <= 6; evolution++) {
      const form = characterArt(character.id, evolution);
      expect(form.available).toBe(true);
      expect(portraitAttributes(getStarter(character.id), evolution).src).toBe(assetUrl(`characters/${form.art}.png`));
      expect(characterFacing(character.id, evolution).facing).toBe('left');
    }
    for (const action of ['passive', 'skill1', 'skill2', 'ultimate'] as const) {
      expect(abilityIcon(character.id, action)).toContain(assetUrl(`abilities/${character.id}-${action}.png`));
    }
    expect(abilityIcon(character.id, 'light')).toContain('universal-normal-attack');
    for (const slot of [1, 2, 3] as const) {
      expect(masterArtUrl(`master-${character.id}-${slot}`)).toBe(assetUrl(`master-conduits/master-${character.id}-${slot}.png`));
    }
  });

  it('shares six enemy forms and six material identities during the approved Moon launch', () => {
    for (let stage = 1; stage <= 35; stage++) {
      const encounter = infusionEncounter('moon', stage);
      const art = `moon-vesperwing-${encounter.tier + 1}`;
      expect(encounter.enemy.art).toBe(art);
      expect(encounter.background).toBe('moon-arena.png');
      expect(unitFacing(art, 'enemy').facing).toBe('right');
      expect(getCreature(`infusion:moon:${encounter.tier}`).art).toBe(art);
    }
    newEventMaterialIds('moon').forEach((id, index) => {
      expect(materialArt(id)).toBe(`moonwake-${['seed', 'bud', 'bloom', 'crest', 'heart', 'soul'][index]}`);
    });
    expect(moonBanner.artwork.path).toBe(newEventDefinition('moon').bannerArt);
    expect(moonBanner.artwork.alt).not.toContain('pending');
    const now = Date.parse('2026-11-08T00:00:00Z');
    expect(newEventWindowActive('moon', now)).toBe(true);
    const html = moonEvent(emptyAccount(), { online: true, now });
    expect(html).toContain(assetUrl('banners/moon-header.png'));
    expect(html).not.toContain('Event entry unavailable');
    expect(html).toContain('data-infusion="moon"');
    expect(html).not.toContain('Artwork pending');
  });

  it('installs exactly11 Moon status identities and leaves Sunshade pending', () => {
    expect(Object.keys(statusArt).filter(id => id.startsWith('moon-'))).toHaveLength(11);
    for (const character of sunshadeCharacters) {
      expect(characterArt(character.id).available).toBe(false);
      expect(abilityIcon(character.id, 'skill1')).toBe('');
      expect(masterArtUrl(`master-${character.id}-1`)).toContain('data:image/svg+xml');
    }
    expect(sunshadeBanner.artwork.path).toBeNull();
    expect(newEventDefinition('sunshade').arenaArt).toBeNull();
  });
});
