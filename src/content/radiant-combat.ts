import type { FlareTier } from '../game/radiant-gauge';

export type RadiantStarter = 'infernis' | 'tizu' | 'flora';
export type RadiantAttunement = 'equinox' | 'corona' | 'aegis' | 'solstice' | 'prism';
export interface RadiantStats { hp: number; attack: number; defense: number; recovery: number }
export interface RadiantLoadout {
  id: string;
  starter: RadiantStarter;
  level: number;
  form: number;
  masterId: RadiantMasterId | null;
  weaponRank: number;
  ascended: boolean;
  imbue: number;
}
export const radiantAttunements: Record<RadiantAttunement, RadiantStats> = {
  equinox: { hp: 1, attack: 1, defense: 1, recovery: 1 },
  corona: { hp: .9, attack: 1.25, defense: 1, recovery: 1 },
  aegis: { hp: 1, attack: .9, defense: 1.35, recovery: 1 },
  solstice: { hp: 1.25, attack: .9, defense: 1, recovery: 1 },
  prism: { hp: 1, attack: 1, defense: .9, recovery: 1.3 },
};
export const radiantStarterKits = {
  infernis: {
    base: { hp: 240, attack: 60, defense: 16, recovery: 28 },
    baseCost: 30, passive: 'Banked Cinder', leader: 'Hearthbound Oath',
    leaderStat: 'attack', leaderBonus: .15,
  },
  tizu: {
    base: { hp: 300, attack: 44, defense: 22, recovery: 34 },
    baseCost: 25, passive: 'Tideglass Return', leader: 'Harbor Covenant',
    leaderStat: 'defense', leaderBonus: .2,
  },
  flora: {
    base: { hp: 220, attack: 46, defense: 14, recovery: 65 },
    baseCost: 20, passive: 'Dawnseed', leader: 'Garden Covenant',
    leaderStat: 'recovery', leaderBonus: .15,
  },
} as const;

export interface RadiantFlareOffer {
  name: string;
  damage: number;
  burn: number;
  burnPhases: number;
  shieldDefense: number;
  shieldHP: number;
  reduction: number;
  reductionPhases: number;
  heal: number;
  renewal: number;
  renewalRounds: number;
}
function offer(name: string, values: Partial<Omit<RadiantFlareOffer, 'name'>>): RadiantFlareOffer {
  return { name, damage: 0, burn: 0, burnPhases: 0, shieldDefense: 0, shieldHP: 0,
    reduction: 0, reductionPhases: 0, heal: 0, renewal: 0, renewalRounds: 0, ...values };
}
// Every tier preserves the same target set and signature. Shield offers use the
// owner's unlimited-until-broken contract, not the superseded draft cap.
export const radiantFlares: Record<RadiantStarter, Record<FlareTier, RadiantFlareOffer>> = {
  infernis: {
    glowing: offer('Cinderwake', { damage: 1.4, burn: .12, burnPhases: 2 }),
    lustrous: offer('Cinderwake Ascendant', { damage: 2, burn: .16, burnPhases: 2 }),
    eternal: offer('Cinderwake Everlasting', { damage: 3, burn: .2, burnPhases: 3 }),
  },
  tizu: {
    glowing: offer('Tideglass Shelter', { shieldDefense: .9, shieldHP: .05 }),
    lustrous: offer('Tideglass Dominion', { shieldDefense: 1.3, shieldHP: .07,
      reduction: .15, reductionPhases: 1 }),
    eternal: offer('Tideglass Eternity', { shieldDefense: 1.8, shieldHP: .1,
      reduction: .25, reductionPhases: 2 }),
  },
  flora: {
    glowing: offer('Dawnseed Renewal', { heal: .8, renewal: .15, renewalRounds: 2 }),
    lustrous: offer('Dawnseed Flourishing', { heal: 1.1, renewal: .2, renewalRounds: 2 }),
    eternal: offer('Dawnseed Perennial', { heal: 1.8, renewal: .3, renewalRounds: 3 }),
  },
};
export const radiantMasters = {
  'master-ember-1': { starter: 'infernis', attunement: 'corona', effect: 'longer-burn' },
  'master-ember-2': { starter: 'infernis', attunement: 'corona', effect: 'flare-damage' },
  'master-ember-3': { starter: 'infernis', attunement: 'solstice', effect: 'self-shield' },
  'master-tide-1': { starter: 'tizu', attunement: 'aegis', effect: 'flare-shield' },
  // Expiry extension is obsolete: this fixed Master adds eight percentage points
  // of recipient maxHP to each native Shield instead.
  'master-tide-2': { starter: 'tizu', attunement: 'solstice', effect: 'deep-shield' },
  'master-tide-3': { starter: 'tizu', attunement: 'corona', effect: 'tide-strike' },
  'master-sprout-1': { starter: 'flora', attunement: 'prism', effect: 'flare-heal' },
  'master-sprout-2': { starter: 'flora', attunement: 'corona', effect: 'sprout-strike' },
  'master-sprout-3': { starter: 'flora', attunement: 'solstice', effect: 'longer-renewal' },
} as const;
export type RadiantMasterId = keyof typeof radiantMasters;

export function validateRadiantStats(stats: RadiantStats): void {
  if (!stats || Object.keys(stats).length !== 4 ||
      !['hp', 'attack', 'defense', 'recovery'].every(key => {
        const value = stats[key as keyof RadiantStats];
        return Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER;
      }) || stats.hp < 1 || stats.attack <= 0)
    throw new Error('Invalid radiant four-stat snapshot.');
}
export function validateRadiantLoadout(loadout: RadiantLoadout): void {
  if (!loadout || typeof loadout.id !== 'string' || !loadout.id ||
      !Object.hasOwn(radiantStarterKits, loadout.starter) ||
      !Number.isSafeInteger(loadout.level) || loadout.level < 0 || loadout.level > 115 ||
      !Number.isSafeInteger(loadout.form) || loadout.form < 1 || loadout.form > 6 ||
      !Number.isSafeInteger(loadout.weaponRank) || loadout.weaponRank < 0 ||
      !Number.isSafeInteger(loadout.imbue) || loadout.imbue < 0 || loadout.imbue > 3 ||
      typeof loadout.ascended !== 'boolean')
    throw new Error('Invalid radiant starter loadout.');
  if (loadout.masterId !== null && (!Object.hasOwn(radiantMasters, loadout.masterId) ||
      radiantMasters[loadout.masterId].starter !== loadout.starter))
    throw new Error('Radiant Master does not match this bearer.');
}
export function radiantAttunement(loadout: RadiantLoadout): RadiantAttunement {
  validateRadiantLoadout(loadout);
  return loadout.masterId === null ? 'equinox' : radiantMasters[loadout.masterId].attunement;
}
export function resolveRadiantStarterStats(loadout: RadiantLoadout): RadiantStats {
  validateRadiantLoadout(loadout);
  const growth = 1 + .15 * loadout.level + 1.5 * (loadout.form - 1);
  const base = radiantStarterKits[loadout.starter].base;
  const profile = radiantAttunements[radiantAttunement(loadout)];
  const ascension = loadout.ascended ? 1.5 : 1;
  const stats = {
    hp: base.hp * growth * profile.hp * ascension,
    attack: base.attack * growth * (1 + .02 * loadout.weaponRank) * profile.attack * ascension,
    defense: base.defense * growth ** .7 * profile.defense * ascension,
    recovery: base.recovery * growth * profile.recovery * ascension,
  };
  validateRadiantStats(stats);
  return stats;
}
