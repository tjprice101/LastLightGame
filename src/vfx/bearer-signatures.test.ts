import { describe, expect, it } from 'vitest';
import { burstKinds, elementStyle, type BurstKind, type ElementStyle } from './element-styles';
import { bearerElementStyle, bearerSignatures, signatureParticleShare } from './bearer-signatures';
import { radiantBearerKits } from '../content/combat-kits';
import { spectacleTextures, type SpectacleTexture } from './vfx-textures';

const ids = Object.keys(bearerSignatures);
const count = (style: ElementStyle, kind: BurstKind) => style.sparks[kind].reduce((sum, preset) => sum + preset.count, 0);
const styleOf = (id: string) => bearerElementStyle(id, radiantBearerKits[id as keyof typeof radiantBearerKits].elementId);
function texturesOf(id: string): SpectacleTexture[] {
  const sig = bearerSignatures[id];
  return [
    ...Object.values(sig.layers ?? {}).flat().map(layer => layer.texture),
    ...Object.values(sig.sparks ?? {}).flat().map(preset => preset.texture),
    ...(sig.travel ? [sig.travel.texture, ...(sig.travel.kind === 'orb' ? [sig.travel.trail] : [])] : []),
    ...(sig.overlay ? [sig.overlay] : []), ...(sig.sigil ? [sig.sigil] : []), ...(sig.pulse ? [sig.pulse] : []),
    ...(sig.motes ?? []).map(mote => mote.texture),
  ];
}

describe('Bearer signature layers (D-486, Spectacle step 4)', () => {
  it('covers batches 1 to 4: all thirty-two bearers across all six elements', () => {
    expect(ids.sort()).toEqual(['asteriel', 'atmoso', 'aurora', 'bliss', 'bruno', 'caevren', 'caldrex', 'crinso', 'disciple', 'elise', 'ember', 'ilvaris', 'ilyss', 'kaelith', 'maerion', 'myrthen', 'neralis', 'nerithe', 'orvella', 'ozriel', 'razor', 'rosetta', 'serapha', 'seravelle', 'solenne', 'sprout', 'thornia', 'tide', 'vaelor', 'varkhel', 'velmira', 'vespera']);
    expect(new Set(ids.map(id => radiantBearerKits[id as keyof typeof radiantBearerKits].elementId)).size).toBe(6);
  });
  it('uses only textures the GPU layer loads', () => {
    const loaded = new Set<string>(spectacleTextures);
    for (const id of ids) for (const texture of texturesOf(id)) expect(loaded.has(texture), `${id}: ${texture}`).toBe(true);
  });
  it('leaves Normal Attack, enemy and status looks on the element base', () => {
    for (const id of ids) {
      const base = elementStyle(radiantBearerKits[id as keyof typeof radiantBearerKits].elementId);
      for (const kind of ['normal', 'enemy', 'status'] as const) {
        expect(styleOf(id).layers[kind], `${id} ${kind}`).toEqual(base.layers[kind]);
        expect(styleOf(id).sparks[kind], `${id} ${kind}`).toEqual(base.sparks[kind]);
      }
    }
  });
  it('adds signature layers from Skill 1 and escalates with the tier', () => {
    for (const id of ids) {
      const base = elementStyle(radiantBearerKits[id as keyof typeof radiantBearerKits].elementId);
      const added = (kind: BurstKind) => styleOf(id).layers[kind].length - base.layers[kind].length;
      expect(added('skill1'), id).toBeGreaterThan(0);
      expect(added('skill2'), id).toBeGreaterThanOrEqual(added('skill1'));
      expect(added('finisher'), id).toBeGreaterThanOrEqual(added('skill2'));
    }
  });
  it('keeps every burst kind present and adds particles within the budget share', () => {
    for (const id of ids) {
      const base = elementStyle(radiantBearerKits[id as keyof typeof radiantBearerKits].elementId);
      for (const kind of burstKinds) {
        expect(styleOf(id).layers[kind].length, `${id} ${kind}`).toBeGreaterThan(0);
        const extra = count(styleOf(id), kind) - count(base, kind);
        expect(extra, `${id} ${kind}`).toBeLessThanOrEqual(Math.ceil(count(base, kind) * signatureParticleShare));
      }
    }
  });
  it('keeps the element palette and falls back to the base for bearers without a signature', () => {
    for (const id of ids) expect(styleOf(id).palette).toEqual(elementStyle(radiantBearerKits[id as keyof typeof radiantBearerKits].elementId).palette);
    expect(bearerElementStyle('not-a-bearer', 'oceanic')).toBe(elementStyle('oceanic'));
    expect(bearerElementStyle(null, null)).toBe(elementStyle(null));
  });
  it('makes each signature distinct from its element base', () => {
    for (const id of ids) {
      const merged = styleOf(id);
      const base = elementStyle(radiantBearerKits[id as keyof typeof radiantBearerKits].elementId);
      expect(merged.layers.skill2.map(l => l.texture).join()).not.toBe(base.layers.skill2.map(l => l.texture).join());
    }
  });
});
