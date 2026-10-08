import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { unitFacing, unitFacingAttributes } from './unit-facing';
import { portrait } from './portrait';
import { openingStarters as starters } from '../content/starters';

describe('unit facing without altering source art', () => {
  it('uses the individually reviewed directions for every refreshed character form on both sides', () => {
    const settings: Record<string, { source_facing: 'left' | 'right' | 'front' }> = JSON.parse(
      readFileSync(new URL('../../Art/character-refresh-settings.json', import.meta.url), 'utf8'));
    expect(Object.keys(settings)).toHaveLength(60);
    for (const [art, { source_facing: source }] of Object.entries(settings)) {
      expect(unitFacing(art, 'ally')).toEqual({ facing: 'left', mirrored: source === 'right' });
      expect(unitFacing(art, 'enemy')).toEqual({ facing: 'right', mirrored: source === 'left' });
      expect(unitFacingAttributes(art, 'ally')).toContain(`data-mirrored="${source === 'right'}"`);
    }
  });
  it.each(['characters', 'enemies'] as const)('covers every supplied %s sprite', (category) => {
    for (const filename of readdirSync(new URL(`../../public/assets/${category}/`, import.meta.url))) {
      if (!filename.endsWith('.png')) continue;
      expect(unitFacing(filename.slice(0, -4), category === 'characters' ? 'ally' : 'enemy').facing)
        .toBe(category === 'characters' ? 'left' : 'right');
    }
  });
  it('shares all18 replacement starter directions across menus and both battle sides', () => {
    const settings: Record<string, { source_facing: 'left' | 'right' | 'front' }> = JSON.parse(
      readFileSync(new URL('../../Art/starter-refresh-settings.json', import.meta.url), 'utf8'));
    expect(Object.keys(settings)).toHaveLength(18);
    for (const [art, { source_facing: source }] of Object.entries(settings)) {
      expect(unitFacing(art, 'ally')).toEqual({ facing: 'left', mirrored: source === 'right' });
      expect(unitFacing(art, 'enemy')).toEqual({ facing: 'right', mirrored: source === 'left' });
    }
  });
  it('mirrors only opposing authored directions, not already-facing or frontal art', () => {
    expect(unitFacing('infernis', 'ally').mirrored).toBe(false);
    expect(unitFacing('tizu', 'ally').mirrored).toBe(true);
    expect(unitFacing('goblin', 'enemy').mirrored).toBe(true);
    expect(unitFacing('imp', 'enemy').mirrored).toBe(false);
    expect(unitFacing('tizu-evo-5', 'ally').mirrored).toBe(false);
    expect(() => unitFacing('missing', 'enemy')).toThrow('metadata');
  });
  it.each(starters)('$name has shared left-facing metadata for all menu forms', (starter) => {
    for (let evolution = 1; evolution <= 6; evolution++) {
      expect(portrait(starter, evolution)).toContain('data-facing="left"');
    }
  });
  it.each([
    ['tizu-evo-2', 'left'], ['tizu-evo-4', 'left'], ['tizu-evo-6', 'left'],
    ['flora-evo-4', 'left'], ['flora-evo-5', 'right'],
    ['shellcap-kappa', 'right'], ['verdant-antler-regent', 'left'],
    ['petalhorn-satyr', 'left'], ['obsidian-gargoyle', 'left'], ['cinderhide-cyclops', 'left'],
    ['orchid-mantis', 'left'], ['heavens-thorns-first-light', 'left'],
    ['heavens-crimson-reckoning', 'left'], ['heavens-dawn-without-mercy', 'right'],
    ['abyss-hunger-beyond-veil', 'left'], ['abyss-worldfall-reverie', 'left'], ['abyss-night-without-end', 'left'],
    ['sparkpip', 'right'], ['coppercap-gremlin', 'left'], ['stormhorn-faun', 'left'],
    ['thunderclaw-raiju', 'left'], ['tempestwing-roc', 'left'], ['crowncoil-kirin', 'left'],
    ['glimmerkin', 'right'], ['lanterncap-brownie', 'right'], ['prismback-tortoise', 'right'],
    ['dawncrest-guardian', 'left'], ['opalwing-griffin', 'left'], ['sunmirror-oracle', 'left'],
    ['crownray-kirin', 'left'], ['sovereign-of-the-sevenfold-dawn', 'right'],
    ['pebblekin', 'left'], ['claycap-kobold', 'right'], ['flintback-armadillo', 'left'],
    ['quartzhorn-ram', 'left'], ['geode-cyclops', 'left'], ['pillarwing-gargoyle', 'left'],
    ['crownfault-behemoth', 'front'], ['atlas-of-the-crystal-summit', 'front'],
    ['riftpip', 'right'], ['shardcap-gremlin', 'left'], ['nullshell-scarab', 'left'],
    ['paradox-sentinel', 'left'], ['fracturecoil-drake', 'left'], ['riftwing-chimera', 'left'],
    ['crownvoid-behemoth', 'front'], ['sovereign-of-the-impossible-ruin', 'front'],
    ['puffling', 'left'], ['reedcap-sylph', 'right'], ['gustfeather-harpy', 'left'],
    ['cloudhorn-ibex', 'left'], ['zephyrcoil-drake', 'left'], ['cyclonewing-griffin', 'left'],
    ['crownwind-roc', 'front'], ['regent-of-the-unbroken-sky', 'left'],
    ['duskmote', 'right'], ['veilcap-imp', 'left'], ['gloomtail-cat', 'right'],
    ['hollowmantle-sentinel', 'left'], ['umbrasilk-weaver', 'front'], ['moonless-gargoyle', 'left'],
    ['eclipse-antler-regent', 'left'], ['monarch-of-the-silent-eclipse', 'front'],
  ] as const)('uses individually reviewed gaze/weapon direction for %s', (art, source) => {
    expect(unitFacing(art, 'ally')).toEqual({ facing: 'left', mirrored: source === 'right' });
    expect(unitFacing(art, 'enemy')).toEqual({ facing: 'right', mirrored: source === 'left' });
    expect(unitFacingAttributes(art, 'enemy')).toContain(`data-mirrored="${source === 'left'}"`);
  });
  it.each([
    'gleamstone-slime', 'diadem-of-daybreak-gleamstone-slime',
    'scepter-of-radiance-gleamstone-slime', 'regalia-of-the-sun-gleamstone-slime',
    'sovereign-of-the-gilded-vault-gleamstone-slime', 'the-crown-beyond-dawn-gleamstone-slime',
    'rosethorn-wisp', 'votive-of-first-bloom-rosethorn-wisp',
    'laurel-of-the-sacred-flame-rosethorn-wisp', 'seraph-of-the-rose-pyre-rosethorn-wisp',
    'sovereign-of-the-hallowed-garden-rosethorn-wisp', 'the-flame-beyond-eternity-rosethorn-wisp',
  ])('keeps supplied currency-mode cutout facing metadata for %s', (art) => {
    expect(unitFacing(art, 'enemy')).toEqual({ facing: 'right', mirrored: false });
  });
});
