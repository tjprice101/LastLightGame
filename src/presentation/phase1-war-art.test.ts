import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { masterConduits } from '../content/master-conduits';
import { phase1WarArtRevisions } from '../content/phase1-war-art-revisions';
import { starters } from '../content/starters';
import { emptyAccount } from '../game/account';
import { abilityIcon } from './ability-icon';
import { masterArtUrl, masterConduitIcon, masterReward } from './master-conduits';
import { assetUrl, portraitAttributes } from './portrait';
import { unitFacing } from './unit-facing';

const ids = ['caldrex', 'solenne', 'myrthen'] as const;
const frontal = new Set(['caldrex-evo-4', 'caldrex-evo-6', 'solenne-evo-3', 'solenne-evo-5']);

describe('delivered Phase1 War artwork', () => {
  it('revisions all 45 exact exported byte streams through the deployment base', () => {
    expect(Object.keys(phase1WarArtRevisions)).toHaveLength(45);
    for (const [path, revision] of Object.entries(phase1WarArtRevisions)) {
      const bytes = readFileSync(`public/assets/${path}`);
      expect(createHash('sha256').update(bytes).digest('hex').slice(0, 16), path).toBe(revision);
      expect(assetUrl(path), path).toBe(`${import.meta.env.BASE_URL}assets/${path}?v=${revision}`);
    }
  });

  it.each(ids)('%s uses all six installed forms and four authored ability icons', id => {
    const starter = starters.find(entry => entry.id === id)!;
    for (let evolution = 1; evolution <= 6; evolution++) {
      const path = `characters/${id}${evolution === 1 ? '' : `-evo-${evolution}`}.png`;
      expect(portraitAttributes(starter, evolution).src).toBe(assetUrl(path));
      expect(portraitAttributes(starter, evolution).alt).not.toContain('pending');
      const art = path.slice('characters/'.length, -'.png'.length);
      expect(unitFacing(art, 'ally').mirrored).toBe(art === 'myrthen-evo-4');
      expect(unitFacing(art, 'enemy').mirrored).toBe(!frontal.has(art) && art !== 'myrthen-evo-4');
    }
    for (const action of ['passive', 'skill1', 'skill2', 'ultimate'] as const) {
      expect(abilityIcon(id, action)).toContain(assetUrl(`abilities/${id}-${action}.png`));
    }
    const normal = abilityIcon('ember', 'light').match(/src="([^"]+)"/)?.[1];
    expect(normal).toBeDefined();
    expect(abilityIcon(id, 'light')).toContain(`src="${normal}"`);
  });

  it('shares all nine Master icons between equipment and saved rewards without account writes', () => {
    const delivered = masterConduits.filter(entry => ids.some(id => entry.character === id));
    expect(delivered).toHaveLength(9);
    const account = { ...emptyAccount(), masterConduits: Object.fromEntries(delivered.map(entry => [entry.id, 1])) };
    const before = structuredClone(account);
    for (const entry of delivered) {
      const path = `master-conduits/${entry.id}.png`;
      expect(masterArtUrl(entry.id)).toBe(assetUrl(path));
      expect(masterConduitIcon(entry.id)).toContain(assetUrl(path));
      expect(masterReward(entry.id, account).art).toContain(assetUrl(path));
      expect(masterReward(entry.id, account).cinematic?.art).toBe(assetUrl(path));
    }
    expect(account).toEqual(before);
  });
});
