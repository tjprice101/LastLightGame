import type { CalamityActivityId, CalamityTier } from './calamity';

export const calamityBossArt: Readonly<Partial<Record<CalamityActivityId, string>>> = {
  treasury: 'calamity-boss-treasury',
  sanctuary: 'calamity-boss-sanctuary',
  heavens: 'calamity-boss-heavens',
  abyss: 'calamity-boss-abyss',
  machines: 'calamity-boss-machines',
  infernic: 'calamity-boss-infernic',
  oceanic: 'calamity-boss-oceanic',
  atmospheric: 'calamity-boss-atmospheric',
  botanic: 'calamity-boss-botanic',
  tranquilitic: 'calamity-boss-tranquilitic',
  chaotic: 'calamity-boss-chaotic',
};

export const calamityChestArt: Readonly<Record<CalamityTier, string>> = {
  1: 'calamity-chest-slayer',
  2: 'calamity-chest-master',
  3: 'calamity-chest-omnipotent',
};

export const calamityArenaArt: Readonly<Record<CalamityTier, string>> = {
  1: 'calamity-arena-ex-1.png',
  2: 'calamity-arena-ex-2.png',
  3: 'calamity-arena-ex-3.png',
};
