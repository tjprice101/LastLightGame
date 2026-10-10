import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { storyRegionArt, storyWorldMap } from './story-art';
import { storyArtRevisions } from './story-art-revisions';
import { storyCreature, storyEncounter, storyRegions } from './story';
import { getCreature } from './creatures';
import { createStoryBattle, nextStage } from '../game/battle';
import { unitFacing } from '../presentation/unit-facing';
import { assetUrl } from '../presentation/portrait';
import { storyCampaign } from '../presentation/story';
import { emptyAccount } from '../game/account';
import { creatureGlossary } from '../presentation/creature-glossary';
import { archives } from '../presentation/archives';

const progress = { level: 0, evolution: 1 };

describe('delivered Story art integration', () => {
  it('has all delivered30 creatures,6 arenas and the preserved map with byte-derived URLs', () => {
    expect(Object.keys(storyRegionArt)).toHaveLength(6);
    expect(storyRegionArt.infernic?.boss).toBe('story-infernic-boss');
    const paths = [`backgrounds/${storyWorldMap}`];
    for (const region of storyRegions) {
      const art = storyRegionArt[region.element];
      if (!art) continue;
      paths.push(`backgrounds/${art.background}`, ...[...art.enemies, art.boss].map((id) => `enemies/${id}.png`));
    }
    expect(paths).toHaveLength(37);
    expect(new Set(paths).size).toBe(37);
    expect(Object.keys(storyArtRevisions).sort()).toEqual([...paths].sort());
    for (const path of paths) {
      expect(existsSync(`public/assets/${path}`)).toBe(true);
      const hash = createHash('sha256').update(readFileSync(`public/assets/${path}`)).digest('hex').slice(0, 16);
      expect(storyArtRevisions[path]).toBe(hash);
      expect(assetUrl(path)).toContain(`assets/${path}?v=${hash}`);
    }
  });

  it('shares exact art with all150 stage spawns and stable glossary identities without changing RNG', () => {
    for (let stage = 1; stage <= 150; stage++) {
      const encounter = storyEncounter(stage);
      expect(Boolean(encounter.background)).toBe(true);
      for (let index = 0; index < (encounter.boss ? 1 : 4); index++) {
        const creature = storyCreature(stage, index);
        expect(Boolean(creature.art)).toBe(true);
        expect(getCreature(creature.id).art).toBe(creature.art);
        if (creature.art) expect(unitFacing(creature.art, 'enemy').facing).toBe('right');
      }
      const state = createStoryBattle(stage, 7, 'ember', progress);
      expect(state.seed).toBe(7);
      for (const enemy of state.enemies) {
        expect(enemy.art).toBe(getCreature(enemy.creatureId!).art);
        expect(enemy.name).toBe(getCreature(enemy.creatureId!).name);
      }
    }
    const state = createStoryBattle(49, 7, 'ember', progress);
    state.phase = 'cleared';
    const next = nextStage(state, progress).state;
    expect(next.enemies[0].art).toBe('story-oceanic-boss');
    expect(next.enemies[0].creatureId).toBe('story:oceanic:boss');
  });

  it('uses the delivered art in discovery-gated galleries without granting discoveries', () => {
    const account = emptyAccount();
    const creature = storyCreature(150, 0);
    const unseen = creatureGlossary(account);
    expect(unseen).toContain(`enemies/${creature.art}.png?v=`);
    expect(unseen).toContain('undiscovered');
    expect(account.creatures).toEqual({});
    account.creatures[creature.id] = { defeated: false };
    const seen = creatureGlossary(account);
    expect(seen).toContain(creature.name);
    const archive = archives(account, 'creatures');
    expect(archive).toContain(`enemies/${creature.art}.png?v=`);
    expect(archive).toContain(creature.name);
    expect(account.creatures[creature.id].defeated).toBe(false);
  });

  it('keeps six accessible region controls and stage locks separate from uncropped map art', () => {
    const account = emptyAccount();
    const html = storyCampaign(account, 'ember');
    expect(html).toContain(`backgrounds/${storyWorldMap}?v=`);
    expect(html.match(/data-story-region=/g)).toHaveLength(6);
    expect(html.match(/data-story-stage=/g)).toHaveLength(150);
    expect(html).not.toContain('Enemies and regional scenery: artwork pending');
    expect(html).toContain('aria-controls="story-region-1"');
    expect(html).toContain('data-story-stage="26" disabled');
    expect(html).toContain('alt="Six-beacon Story world map');
    const css = readFileSync('src/presentation/story.css', 'utf8');
    expect(css).toContain('.story-map-art img { display: block; width: 100%; height: auto; }');
  });
});
