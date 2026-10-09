import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { conduits } from '../content/conduits';
import { getCreature } from '../content/creatures';
import { machineEnemies } from '../content/machines';
import { infusionEncounter } from '../content/infusions';
import { emptyAccount } from '../game/account';
import { assetUrl } from './portrait';
import { conduitIcon } from './conduit-store';
import { lootArt } from './battle-loot';
import { gameplayHub } from './gameplay';
import { unitFacing } from './unit-facing';

describe('supplied machine artwork integration', () => {
  it('registers every new Conduit through the shared equipment/archive/loot resolvers', () => {
    const supplied = conduits.filter((entry) => entry.art !== null);
    const pending = conduits.filter((entry) => entry.art === null);
    expect(supplied).toHaveLength(25);
    expect(pending).toHaveLength(60);
    for (const conduit of supplied) {
      expect(conduit.art).toBe(conduit.id);
      expect(conduitIcon(conduit.id)).toContain(assetUrl(`conduits/${conduit.id}.png`));
      expect(lootArt({ id: `conduit:${conduit.id}`, art: conduit.art ?? undefined }))
        .toBe(assetUrl(`conduits/${conduit.id}.png`));
      const png = readFileSync(new URL(`../../public/assets/conduits/${conduit.id}.png`, import.meta.url));
      expect([png.readUInt32BE(16), png.readUInt32BE(20), png[25]]).toEqual([256, 256, 6]);
    }
    for (const conduit of pending) {
      expect(conduitIcon(conduit.id)).toContain('Artwork pending');
      expect(conduitIcon(conduit.id)).not.toContain('assets/conduits/');
      expect(lootArt({ id: `conduit:${conduit.id}` })).toBeUndefined();
    }
  });

  it('uses the six supplied forms and reviewed image-only facing on every stage and discovery entry', () => {
    const arts = ['fractured-watcher', 'ashwing-harrier', 'ivory-kirin', 'celestial-leviathan', 'crowned-phoenix', 'ouroboros-first-dawn'];
    const facing = ['left', 'right', 'left', 'right', 'front', 'left'];
    expect(machineEnemies.map((enemy) => enemy.art)).toEqual(arts);
    for (let stage = 1; stage <= 100; stage++) {
      const encounter = infusionEncounter('machines', stage);
      expect(encounter.enemy.art).toBe(arts[encounter.tier]);
      expect(encounter.background).toBe('machines-arena.png');
      expect(getCreature(`infusion:machines:${encounter.tier}`).art).toBe(encounter.enemy.art);
    }
    arts.forEach((art, index) => {
      expect(unitFacing(art, 'enemy')).toEqual({ facing: 'right', mirrored: facing[index] === 'left' });
      expect(unitFacing(art, 'ally')).toEqual({ facing: 'left', mirrored: facing[index] === 'right' });
    });
  });

  it('registers real activity scenery without modifying the supplied image bytes', () => {
    expect(gameplayHub(emptyAccount())).toContain(assetUrl('banners/machines-banner.png'));
    for (const [category, incoming, asset] of [
      ['banners', 'Machine Mode header.png', 'machines-banner'],
      ['backgrounds', 'Machine Mode Battle Arena.png', 'machines-arena'],
    ]) {
      const source = readFileSync(new URL(`../../Art/source/machines/${category}/${incoming}`, import.meta.url));
      const runtime = readFileSync(new URL(`../../public/assets/${category}/${asset}.png`, import.meta.url));
      expect(runtime.equals(source)).toBe(true);
    }
  });
});
