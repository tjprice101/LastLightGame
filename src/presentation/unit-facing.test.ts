import { describe, expect, it } from 'vitest';
import { readdirSync } from 'node:fs';
import { unitFacing, unitFacingAttributes } from './unit-facing';
import { portrait } from './portrait';
import { starters } from '../content/starters';

describe('unit facing without altering source art', () => {
  it.each(['characters', 'enemies'] as const)('covers every supplied %s sprite', (category) => {
    for (const filename of readdirSync(new URL(`../../public/assets/${category}/`, import.meta.url))) {
      if (!filename.endsWith('.png')) continue;
      expect(unitFacing(filename.slice(0, -4), category === 'characters' ? 'ally' : 'enemy').facing)
        .toBe(category === 'characters' ? 'left' : 'right');
    }
  });
  it('mirrors only opposing authored directions, not already-facing or frontal art', () => {
    expect(unitFacing('infernis', 'ally').mirrored).toBe(true);
    expect(unitFacing('tizu', 'ally').mirrored).toBe(false);
    expect(unitFacing('goblin', 'enemy').mirrored).toBe(true);
    expect(unitFacing('imp', 'enemy').mirrored).toBe(false);
    expect(unitFacing('infernis-evo-6', 'ally').mirrored).toBe(false);
    expect(() => unitFacing('missing', 'enemy')).toThrow('metadata');
  });
  it.each(starters)('$name has shared left-facing metadata for all menu forms', (starter) => {
    for (let evolution = 1; evolution <= 6; evolution++) {
      expect(portrait(starter, evolution)).toContain('data-facing="left"');
    }
  });
  it.each([
    ['tizu-evo-2', 'right'], ['tizu-evo-4', 'left'], ['tizu-evo-6', 'left'],
    ['flora-evo-4', 'right'], ['flora-evo-5', 'right'],
    ['shellcap-kappa', 'right'], ['verdant-antler-regent', 'left'],
    ['petalhorn-satyr', 'left'], ['obsidian-gargoyle', 'left'], ['cinderhide-cyclops', 'left'],
    ['orchid-mantis', 'left'], ['heavens-thorns-first-light', 'left'],
    ['heavens-crimson-reckoning', 'left'], ['heavens-dawn-without-mercy', 'right'],
    ['abyss-hunger-beyond-veil', 'left'], ['abyss-worldfall-reverie', 'left'], ['abyss-night-without-end', 'left'],
    ['sparkpip', 'right'], ['coppercap-gremlin', 'left'], ['stormhorn-faun', 'left'],
    ['thunderclaw-raiju', 'left'], ['tempestwing-roc', 'left'], ['crowncoil-kirin', 'left'],
  ] as const)('uses individually reviewed gaze/weapon direction for %s', (art, source) => {
    expect(unitFacing(art, 'ally')).toEqual({ facing: 'left', mirrored: source === 'right' });
    expect(unitFacing(art, 'enemy')).toEqual({ facing: 'right', mirrored: source === 'left' });
    expect(unitFacingAttributes(art, 'enemy')).toContain(`data-mirrored="${source === 'left'}"`);
  });
});
