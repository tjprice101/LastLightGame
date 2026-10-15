import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { calamityActivities } from './calamity';
import { calamityBossArt, calamityChestArt, calamityArenaArt } from './calamity-art';
import { calamityArtRevisions } from './calamity-art-revisions';
import { getCreature } from './creatures';
import { assetUrl } from '../presentation/portrait';

describe('delivered Calamity artwork', () => {
  it('has all twelve boss cutouts and three tier-shared chests and arenas', () => {
    expect(Object.keys(calamityBossArt)).toHaveLength(12);
    expect(calamityBossArt.roses).toBe('calamity-boss-roses');
    expect(new Set(Object.values(calamityChestArt)).size).toBe(3);
    expect(new Set(Object.values(calamityArenaArt)).size).toBe(3);
    for (const activity of calamityActivities) {
      expect(getCreature(`calamity:${activity.id}`).art).toBe(calamityBossArt[activity.id]);
    }
  });

  it('resolves all eighteen installed files with exact byte revisions and deployment-base URLs', () => {
    const paths = [
      ...Object.values(calamityBossArt).map(art => `enemies/${art}.png`),
      ...Object.values(calamityChestArt).map(art => `items/${art}.png`),
      ...Object.values(calamityArenaArt).map(art => `backgrounds/${art}`),
    ];
    expect(paths.sort()).toEqual(Object.keys(calamityArtRevisions).sort());
    for (const path of paths) {
      const bytes = readFileSync(join(process.cwd(), 'public', 'assets', ...path.split('/')));
      const revision = createHash('sha256').update(bytes).digest('hex').slice(0, 12);
      expect(calamityArtRevisions[path]).toBe(revision);
      expect(assetUrl(path)).toBe(`${import.meta.env.BASE_URL}assets/${path}?v=${revision}`);
    }
  });
});
