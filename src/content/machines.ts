import { infusionStageCount, previousMachineStageCount, validateMachineStage } from './activities';
import { conduits, getConduit, isConduitId, type ConduitId } from './conduits';
import { lootRoll } from './loot-random';
import { machineComponentRulesText } from './mechanical-components';
import { masterRulesText } from './master-conduits';
import { machineOrigin } from './world-lore';

/** D-380: floor the former stage56/75 threshold onto the 35-stage layout. */
export const machineRules = { stages: infusionStageCount('machines'), omnicStage: Math.floor(56 * infusionStageCount('machines') / previousMachineStageCount),
  startingChance: .05, rareChance: .35, legendaryChance: .20, omnicChance: .15, bannerBonusChance: .005 } as const;
const machinePools = {
  Rare: conduits.filter((conduit) => conduit.rarity === 'Rare'),
  Legendary: conduits.filter((conduit) => conduit.rarity === 'Legendary'),
  Omnic: conduits.filter((conduit) => conduit.rarity === 'Omnic'),
} as const;
export const machineFocusRarities = ['Rare', 'Legendary', 'Omnic'] as const;
export type MachineFocusRarity = typeof machineFocusRarities[number];
export function machineConduitChance(stage: number, rarity: MachineFocusRarity): number {
  validateMachineStage(stage);
  const firstStage = rarity === 'Omnic' ? machineRules.omnicStage : 1;
  if (stage < firstStage) return 0;
  const maximum = rarity === 'Rare' ? machineRules.rareChance :
    rarity === 'Legendary' ? machineRules.legendaryChance : machineRules.omnicChance;
  return machineRules.startingChance + (maximum - machineRules.startingChance) *
    (stage - firstStage) / (machineRules.stages - firstStage);
}
export const machineDropRatesText = `Rare 5%-35% and Legendary 5%-20% from stage 1; Omnic 5%-15% from stage ${machineRules.omnicStage}. Each rate grows linearly to stage ${machineRules.stages}.`;
export type MachineLootFocus = Partial<Record<MachineFocusRarity, ConduitId>>;
export function isMachineFocusRarity(value: unknown): value is MachineFocusRarity {
  return machineFocusRarities.some(rarity => rarity === value);
}
export function validateMachineLootFocus(value: unknown): MachineLootFocus {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error('Invalid saved Machines loot focus.');
  const focus: MachineLootFocus = {};
  for (const [rarity, id] of Object.entries(value)) {
    if (!isMachineFocusRarity(rarity) || !isConduitId(id) || getConduit(id).rarity !== rarity)
      throw new Error('Choose a Rare, Legendary or Omnic Conduit of the matching rarity for Focus Loot.');
    focus[rarity] = id;
  }
  return focus;
}
const bannerConduitIds = ['worldbreaker-drive', 'immortal-vessel', 'citadel-spine', 'astral-prism', 'judgment-lens'] as const;
const bannerPool = conduits.filter((conduit) => bannerConduitIds.some((id) => conduit.id === id));

export function isBannerConduitEligible(id: ConduitId): boolean {
  return bannerConduitIds.some((eligible) => eligible === id);
}

export const machineEnemies = [
  { name: 'Fractured Watcher', art: 'fractured-watcher', element: 'botanic', skill: 'Broken Array', theme: 'black-and-white cracked spherical sentry with three crooked legs and fractured sensor petals' },
  { name: 'Ashwing Harrier', art: 'ashwing-harrier', element: 'atmospheric', skill: 'Rustwind Sweep', theme: 'black-and-white mechanical griffin, silver repaired feathers and unfolding turbine wings' },
  { name: 'Ivory Kirin', art: 'ivory-kirin', element: 'tranquilitic', skill: 'Merciful Circuit', theme: 'ivory mechanical kirin, silver antlers, opal joints and first wing vanes' },
  { name: 'Celestial Leviathan', art: 'celestial-leviathan', element: 'oceanic', skill: 'Tidal Reboot', theme: 'compact sapphire-and-ivory mechanical leviathan, four fin wings and interlocking tide rings' },
  { name: 'Crowned Phoenix', art: 'crowned-phoenix', element: 'infernic', skill: 'Sunforge Rebirth', theme: 'crimson-and-ivory mechanized phoenix, eight magnificent blade-feather wings and platinum crown' },
  { name: 'Ouroboros of the First Dawn', art: 'ouroboros-first-dawn', element: 'chaotic', skill: 'Genesis Overdrive', theme: 'compact opal-and-ivory mechanized celestial dragon coiled around a restored core, sixteen magnificent vaned wings and prismatic regalia' },
] as const;

export function machineConduitLoot(stage: number, owned: Partial<Record<ConduitId, number>> = {}, focus: MachineLootFocus = {}) {
  validateMachineStage(stage);
  validateMachineLootFocus(focus);
  return (['Rare', 'Legendary', 'Omnic'] as const).filter(rarity => rarity !== 'Omnic' || stage >= machineRules.omnicStage).flatMap((rarity) => {
    const pool = machinePools[rarity];
    const remaining = pool.filter((conduit) => !(owned[conduit.id] ?? 0)).length;
    const chance = machineConduitChance(stage, rarity);
    const selected = focus[rarity];
    const focused = selected && !(owned[selected] ?? 0) ? selected : undefined;
    return pool.map((conduit) => ({ id: conduit.id, minimum: 1, maximum: 1,
      chance: (owned[conduit.id] ?? 0) > 0 || !remaining ? 0 : focused ? conduit.id === focused ? chance : 0 : chance / remaining,
      note: 'Baseline rates ignore ownership and focus. Each rarity rolls separately. Actual drops are unowned only: your focus, or an equal random choice. Fully owned rarities drop nothing.' }));
  });
}

function rollTier(pool: readonly { id: ConduitId }[], chance: number, random: () => number): ConduitId | undefined {
  if (lootRoll(random) >= chance) return undefined;
  // Keep the independent stream aligned even when a completed tier awards nothing.
  const choice = lootRoll(random);
  return pool.length ? pool[Math.floor(choice * pool.length)].id : undefined;
}

export function machineConduitDrops(stage: number, random: () => number, owned: Partial<Record<ConduitId, number>> = {}, focus: MachineLootFocus = {}): Partial<Record<ConduitId, number>> {
  validateMachineStage(stage);
  validateMachineLootFocus(focus);
  const drops: Partial<Record<ConduitId, number>> = {};
  for (const rarity of machineFocusRarities) {
    const pool = machinePools[rarity], chance = machineConduitChance(stage, rarity);
    if (!chance) continue;
    const id = rollTier(pool.filter((conduit) => !(owned[conduit.id] ?? 0)), chance, random);
    if (id) {
      const rarity = getConduit(id).rarity;
      const selected = isMachineFocusRarity(rarity) ? focus[rarity] : undefined;
      drops[selected && !(owned[selected] ?? 0) ? selected : id] = 1;
    }
  }
  return drops;
}

export function bannerConduitBonus(random: () => number): ConduitId | undefined {
  return rollTier(bannerPool, machineRules.bannerBonusChance, random);
}

export const machineRulesText = `<p>${machineOrigin}</p>
  <p>${machineRules.stages} stages, Lv.10-120. Bosses every fifth stage.</p>
  <p>${machineDropRatesText}</p>
  <p>Rarities roll independently, so one enemy can drop multiple Conduits. Each roll chooses an unowned Conduit equally; a completed rarity drops nothing. Focus Loot replaces the random choice with your selection, without changing the odds. Getting that Conduit clears its focus.</p>
  <p>Enemies also drop Prismatica. ${machineComponentRulesText} No captures, evolution materials or Null-Prismatica.</p>
  <p>${masterRulesText}</p>`;
