import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { elements, materialRarities } from './activities';
import { dungeonArt, elementAccents, materialArtNames } from './dungeon-art';
import { gameplayHub } from '../presentation/gameplay';
import { characterDetail } from '../presentation/hub';
import { starters } from './starters';

describe('supplied elemental dungeon artwork', () => {
  it('assigns an element-specific accent to every canonical dungeon', () => {
    expect(Object.keys(elementAccents)).toHaveLength(10);
    for (const element of elements) expect(elementAccents[element.id]).toMatch(/^#[a-f0-9]{6}$/);
    expect(new Set(Object.values(elementAccents)).size).toBe(10);
  });
  it.each(['infernic', 'aquatic', 'efflorescent', 'tranquilitic', 'voltaic'] as const)('%s references existing banners, arenas, enemies and six materials', (id) => {
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
    expect(html).not.toContain('materials/');
    const element = elements.find((entry) => entry.id === id);
    expect(html).toContain(`Drops ${element?.name} materials used for enhancing characters and other items`);
  });
  it('keeps five art-pending dungeons playable without requesting missing banners', () => {
    const html = gameplayHub();
    expect(html.match(/class="dungeon-banner"/g)).toHaveLength(7);
    expect(html.match(/BANNER ART COMING LATER/g)).toHaveLength(5);
    for (const element of elements.filter((entry) => !dungeonArt[entry.id])) {
      expect(html).toContain(`data-dungeon="${element.id}"`);
      expect(html).not.toContain(`banners/${element.id}.png`);
    }
    expect(gameplayHub(null)).not.toContain('data-dungeon="');
    expect(gameplayHub(null)).toContain('resolve the save error');
  });
  it('shows only the required own-element materials in evolution', () => {
    expect(characterDetail(starters[0], 'upgrade-0')).toContain('materials/infernic-seed.png');
    expect(characterDetail(starters[1], 'upgrade-0')).toContain('materials/aquatic-seed.png');
    expect(characterDetail(starters[1], 'upgrade-0')).not.toContain('materials/aquatic-soul.png');
    expect(characterDetail(starters[2], 'upgrade-0')).not.toContain('materials/aquatic-');
    expect(characterDetail(starters[0], 'upgrade-0')).toContain('0 / 15');
  });
});
