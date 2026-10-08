import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { elements, materialRarities } from './activities';
import { dungeonArt, elementAccents, materialArtNames } from './dungeon-art';
import { gameplayHub } from '../presentation/gameplay';
import { characterDetail } from '../presentation/hub';
import { starters } from './starters';
import { dungeonEncounter } from './dungeons';
import { dungeonEnemies, dungeonStrikes } from './dungeon-enemies';
import { getCreature } from './creatures';
import { unitFacingAttributes } from '../presentation/unit-facing';

describe('supplied elemental dungeon artwork', () => {
  it('assigns an element-specific accent to every canonical dungeon', () => {
    expect(Object.keys(elementAccents)).toHaveLength(10);
    for (const element of elements) expect(elementAccents[element.id]).toMatch(/^#[a-f0-9]{6}$/);
    expect(new Set(Object.values(elementAccents)).size).toBe(10);
  });
  it.each(['infernic', 'aquatic', 'efflorescent', 'tranquilitic', 'voltaic', 'luminous', 'tectonic', 'chaotic', 'atmospheric', 'ominous'] as const)('%s references existing banners, arenas, enemies and six materials', (id) => {
    const art = dungeonArt[id];
    if (!art) throw new Error('Supplied art manifest is missing.');
    const paths = [
      `banners/${art.slug}.png`, `backgrounds/${art.slug}.png`,
      ...art.enemies.map((enemy) => `enemies/${enemy.art}.png`),
      ...materialArtNames.map((name) => `materials/${id}-${name.toLowerCase()}.png`),
    ];
    const html = gameplayHub();
    for (const path of paths) {
      expect(existsSync(resolve('public', 'assets', path))).toBe(true);
    }
    expect(art.enemies).toHaveLength(id === 'infernic' ? 10 : 8);
    expect(materialArtNames).toHaveLength(materialRarities.length);
    expect(html).toContain(`banners/${art.slug}.png`);
    expect(html).toContain(`data-dungeon="${id}"`);
    expect(html).not.toContain('Dungeon not playable yet');
    expect(html).not.toContain('dungeon-art-preview');
    expect(html).not.toContain('dungeon-enemy-gallery');
    for (const name of materialArtNames) expect(html).toContain(`materials/${id}-${name.toLowerCase()}.png`);
    expect(html).toContain('Rewards across stages');
  });
  it('shows all supplied dungeon/mode banners while preserving unavailable-save gating', () => {
    const html = gameplayHub();
    expect(html.match(/class="dungeon-banner"/g)).toHaveLength(16);
    expect(html).toContain('banners/machines-banner.png');
    expect(html).toContain('banners/roses-banner.png');
    const dungeons = html.slice(html.indexOf('id="gameplay-dungeons"'), html.indexOf('id="gameplay-infusion"'));
    expect(dungeons).not.toContain('banner-pending" aria-hidden="true">Artwork pending');
    expect(Object.keys(dungeonArt)).toHaveLength(elements.length);
    expect(gameplayHub(null)).not.toContain('data-dungeon="');
    expect(gameplayHub(null)).toContain('resolve the save error');
  });
  it('keeps a future art-pending pack playable without requesting missing assets', () => {
    const supplied = dungeonArt.ominous;
    if (!supplied) throw new Error('Valley art manifest is missing.');
    delete dungeonArt.ominous;
    try {
      const html = gameplayHub();
      expect(html).toContain('data-dungeon="ominous"');
      expect(html).toContain('banner-pending" aria-hidden="true">Artwork pending');
      expect(html).not.toContain('banners/valley-of-solitude.png');
      expect(html).not.toContain('materials/ominous-');
      expect(dungeonEncounter('ominous', 35).background).toBeNull();
    } finally { dungeonArt.ominous = supplied; }
  });
  it('shows only the required own-element materials in evolution', () => {
    expect(characterDetail(starters[0], 'upgrade-0')).toContain('materials/infernic-seed.png');
    expect(characterDetail(starters[1], 'upgrade-0')).toContain('materials/aquatic-seed.png');
    expect(characterDetail(starters[1], 'upgrade-0')).not.toContain('materials/aquatic-soul.png');
    expect(characterDetail(starters[2], 'upgrade-0')).not.toContain('materials/aquatic-');
    expect(characterDetail(starters[0], 'upgrade-0')).toContain('0 ~ 15');
  });
  it.each(['luminous', 'tectonic', 'chaotic', 'atmospheric', 'ominous'] as const)('wires every %s stage and stable discovery entry without changing enemy order or abilities', (element) => {
    const art = dungeonArt[element];
    if (!art) throw new Error('Supplied art manifest is missing.');
    expect(art.enemies.map((enemy) => enemy.name)).toEqual(dungeonEnemies[element].map((enemy) => enemy.name));
    for (let stage = 1; stage <= 35; stage++) {
      const encounter = dungeonEncounter(element, stage);
      const expected = art.enemies[Math.floor((stage - 1) * 8 / 35)];
      expect(encounter.enemy).toEqual(expected);
      expect(encounter.background).toBe(`${art.slug}.png`);
      expect(encounter.ability).toBe(dungeonStrikes[element]);
      expect(getCreature(`dungeon:${element}:${encounter.tier}`).art).toBe(expected.art);
      expect(unitFacingAttributes(expected.art, 'enemy')).toContain('data-facing="right"');
    }
  });
});
