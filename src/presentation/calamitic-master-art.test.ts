import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { masterConduits } from '../content/master-conduits';
import { masterConduitArtRevisions } from '../content/master-conduit-art-revisions';
import { emptyAccount } from '../game/account';
import { inventoryView } from './inventory';
import { archives } from './archives';
import { referenceTeam } from './reference-team';
import { masterArtUrl, masterConduitIcon, masterReward } from './master-conduits';

const delivered = masterConduits.filter(entry => ['ozriel', 'ilvaris', 'kaelith'].includes(entry.character));
describe('delivered Calamitic Master artwork', () => {
  it('covers three Masters per Calamitic bearer with exact-byte shared revisions', () => {
    expect(delivered).toHaveLength(9);
    expect(Object.keys(masterConduitArtRevisions)).toHaveLength(masterConduits.length + 2);
    for (const entry of delivered) {
      const bytes = readFileSync(`public/assets/${entry.art}`);
      const revision = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
      expect(masterConduitArtRevisions[entry.id]).toBe(revision);
      expect(masterArtUrl(entry.id)).toBe(`${import.meta.env.BASE_URL}assets/${entry.art}?v=${revision}`);
    }
  });
  it.each(delivered)('uses $name on every shared equipment/ownership/reward surface without changing the account', entry => {
    const account = { ...emptyAccount(), characters: { [entry.character]: { level: 0, evolution: 1 } },
      squad: [entry.character], masterConduits: { [entry.id]: 1 }, masterEquipment: { [entry.character]: entry.id } };
    const before = structuredClone(account);
    const art = masterArtUrl(entry.id);
    for (const html of [
      masterConduitIcon(entry.id),
      inventoryView(account),
      archives(account, 'conduits'),
      referenceTeam(account, { view: 'conduits', selected: entry.character, element: '', sort: 'name' }),
      masterReward(entry.id, account).art,
    ]) {
      expect(html).toContain(art);
      expect(html).toContain(entry.name);
    }
    expect(masterReward(entry.id, account).cinematic?.art).toBe(art);
    expect(account).toEqual(before);
  });
});
