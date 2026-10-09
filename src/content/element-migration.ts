export const legacyElementIds = [
  'infernic', 'aquatic', 'tectonic', 'efflorescent', 'voltaic',
  'atmospheric', 'luminous', 'ominous', 'tranquilitic', 'chaotic',
] as const;
export type LegacyElementId = (typeof legacyElementIds)[number];
export const elementMigration = {
  infernic: 'infernic', aquatic: 'oceanic', tectonic: 'botanic',
  efflorescent: 'botanic', voltaic: 'atmospheric', atmospheric: 'atmospheric',
  luminous: 'tranquilitic', ominous: 'chaotic', tranquilitic: 'tranquilitic', chaotic: 'chaotic',
} as const;
export type CanonicalElementId = (typeof elementMigration)[LegacyElementId];

export function isLegacyElement(value: unknown): value is LegacyElementId {
  return legacyElementIds.some((id) => id === value);
}

export function canonicalElement(value: string): CanonicalElementId {
  if (value === 'oceanic' || value === 'botanic') return value;
  if (!isLegacyElement(value)) throw new Error(`Unknown element: ${value}.`);
  return elementMigration[value];
}

export const elementSources = {
  infernic: ['infernic'], oceanic: ['aquatic'],
  atmospheric: ['atmospheric', 'voltaic'], botanic: ['efflorescent', 'tectonic'],
  tranquilitic: ['tranquilitic', 'luminous'], chaotic: ['chaotic', 'ominous'],
} as const satisfies Record<CanonicalElementId, readonly LegacyElementId[]>;

export const elementAssetIds = {
  infernic: 'infernic', oceanic: 'aquatic', atmospheric: 'atmospheric',
  botanic: 'efflorescent', tranquilitic: 'tranquilitic', chaotic: 'chaotic',
} as const satisfies Record<CanonicalElementId, LegacyElementId>;
