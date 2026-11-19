import { describe, expect, it } from 'vitest';
import { elements } from '../content/activities';
import { burstKinds, elementStyle, elementStyles, type ElementStyle } from './element-styles';
import { elementTints, neutralTint } from './spectacle-timing';
import { spectacleTextures, type SpectacleTexture } from './vfx-textures';

const styles = Object.values(elementStyles);
const elementSets = elements.map(element => elementStyles[element.id]);
const largest = (style: ElementStyle, kind: (typeof burstKinds)[number]) => Math.max(...style.layers[kind].map(layer => layer.size));
const particles = (style: ElementStyle, kind: (typeof burstKinds)[number]) =>
  style.sparks[kind].reduce((sum, preset) => sum + preset.count, 0);
function texturesOf(style: ElementStyle): SpectacleTexture[] {
  return [
    ...burstKinds.flatMap(kind => [...style.layers[kind].map(layer => layer.texture), ...style.sparks[kind].map(preset => preset.texture)]),
    style.travel.texture, ...(style.travel.kind === 'orb' ? [style.travel.trail] : []), style.pulse,
    ...(style.overlay ? [style.overlay] : []), ...(style.sigil ? [style.sigil] : []), ...style.motes.map(mote => mote.texture),
  ];
}

describe('Element base sets (D-485, Spectacle step 3)', () => {
  it('defines all six elements plus neutral, each with every burst kind', () => {
    expect(Object.keys(elementStyles).sort()).toEqual([...elements.map(element => element.id), 'neutral'].sort());
    for (const style of styles) for (const kind of burstKinds) {
      expect(style.layers[kind].length, `${style.id} ${kind}`).toBeGreaterThan(0);
      expect(style.sparks[kind].length, `${style.id} ${kind}`).toBeGreaterThan(0);
    }
  });
  it('uses only textures the GPU layer loads', () => {
    const loaded = new Set<string>(spectacleTextures);
    for (const style of styles) for (const texture of texturesOf(style)) expect(loaded.has(texture), `${style.id}: ${texture}`).toBe(true);
  });
  it('loads only textures some set (or a shared primitive) draws, within the 50-texture budget', () => {
    const shared = ['beams/streak', 'trails/trail-basic', 'glow/point-bloom', 'glow/radial-bloom', 'glow/soft-glow',
      // D-490 Convergent Light primitives (gather, pillar, lens flare).
      'glow/lens-flare', 'glow/star-flare', 'impacts/vortex-rings', 'impacts/impact-ellipse'];
    const used = new Set<string>([...styles.flatMap(texturesOf), ...shared]);
    expect(spectacleTextures.filter(texture => !used.has(texture))).toEqual([]);
    expect(spectacleTextures.length).toBeLessThanOrEqual(50);
  });
  it('gives each element a three-tone palette whose main tone is its HUD accent', () => {
    for (const style of elementSets) {
      const { core, main, edge } = style.palette;
      expect(new Set([core, main, edge]).size, style.id).toBe(3);
      expect(main, style.id).toBe(elementTints[style.id]);
      expect(style.ramp).toBe(true);
    }
    expect(elementStyles.neutral.palette.main).toBe(neutralTint);
    expect(elementStyles.neutral.ramp).toBe(false);
  });
  it('gives each element its own shapes: ring, burst, travel and particles', () => {
    for (const pick of [
      (style: ElementStyle) => style.layers.normal[1].texture,
      (style: ElementStyle) => style.layers.skill1[1].texture,
      (style: ElementStyle) => `${style.travel.kind}:${style.travel.texture}`,
      (style: ElementStyle) => style.sparks.skill1.map(preset => `${preset.texture}:${preset.gravity}`).join('|'),
    ]) expect(new Set(elementSets.map(pick)).size).toBe(6);
  });
  it('escalates by tier: particles never drop and the finisher is the largest, layered burst', () => {
    for (const style of styles) {
      const order = ['normal', 'skill1', 'skill2', 'finisher'] as const;
      for (let index = 1; index < order.length; index++) {
        expect(particles(style, order[index]), `${style.id} ${order[index]}`).toBeGreaterThanOrEqual(particles(style, order[index - 1]));
        expect(largest(style, order[index]), `${style.id} ${order[index]}`).toBeGreaterThan(largest(style, order[index - 1]));
      }
      // Each Convergent Light hit is at least Skill 2 sized.
      expect(largest(style, 'flare')).toBeGreaterThanOrEqual(largest(style, 'skill2'));
      for (const kind of burstKinds) expect(style.layers.finisher.length).toBeGreaterThanOrEqual(style.layers[kind].length);
    }
  });
  it('keeps enemy impacts smaller than a player Skill 1 (telegraphs are Step 6)', () => {
    for (const style of styles) {
      expect(largest(style, 'enemy'), style.id).toBeLessThan(largest(style, 'skill1'));
      expect(particles(style, 'enemy'), style.id).toBeLessThan(particles(style, 'skill1'));
    }
  });
  it('lifts support and status particles for every element', () => {
    for (const style of styles) for (const kind of ['support', 'status'] as const)
      for (const preset of style.sparks[kind]) expect(preset.gravity ?? 0, `${style.id} ${kind}`).toBeLessThan(0);
  });
  it('resolves unknown or missing elements to neutral', () => {
    expect(elementStyle('botanic').id).toBe('botanic');
    expect(elementStyle(null).id).toBe('neutral');
    expect(elementStyle('toString').id).toBe('neutral');
  });
});
