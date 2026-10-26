export const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Omnic', 'Calamitic'] as const;
export type Rarity = (typeof rarities)[number];

export const rarityColors = {
  Common: '#c39874',
  Uncommon: '#c7cbd1',
  Rare: '#ebc45c',
  Epic: '#c8a2f0',
  Legendary: '#ffab63',
  Omnic: '#f5f3ff',
  Calamitic: '#f04a65',
} as const satisfies Record<Rarity, string>;

export function isRarity(value: string | undefined): value is Rarity {
  return value !== undefined && Object.hasOwn(rarityColors, value);
}
