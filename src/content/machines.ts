import { infusionStageCount, validateMachineStage } from './activities';
import { conduits, type ConduitId } from './conduits';
import { lootRoll } from './loot-random';
import { machineComponentRulesText } from './mechanical-components';
import { masterRulesText } from './master-conduits';
import { machineOrigin } from './world-lore';

export const machineRules = { stages: infusionStageCount('machines'), omnicStage: 75, rareChance: .08, legendaryChance: .035, omnicChance: .01, bannerBonusChance: .005 } as const;
const machinePools = {
  Rare: conduits.filter((conduit) => conduit.rarity === 'Rare'),
  Legendary: conduits.filter((conduit) => conduit.rarity === 'Legendary'),
  Omnic: conduits.filter((conduit) => conduit.rarity === 'Omnic'),
} as const;
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

export function machineConduitLoot(stage: number, owned: Partial<Record<ConduitId, number>> = {}) {
  validateMachineStage(stage);
  return (['Rare', 'Legendary', 'Omnic'] as const).filter(rarity => rarity !== 'Omnic' || stage >= machineRules.omnicStage).flatMap((rarity) => {
    const pool = machinePools[rarity];
    const remaining = pool.filter((conduit) => !(owned[conduit.id] ?? 0)).length;
    const chance = rarity === 'Rare' ? machineRules.rareChance : rarity === 'Legendary' ? machineRules.legendaryChance : machineRules.omnicChance;
    return pool.map((conduit) => ({ id: conduit.id, minimum: 1, maximum: 1,
      chance: (owned[conduit.id] ?? 0) > 0 || !remaining ? 0 : chance / remaining,
      note: `Independent ${rarity} tier roll, then equal choice among unowned Conduits in that tier. Owned names have 0% chance; a complete tier awards no Conduit or replacement. Bosses use the same odds.` }));
  });
}

function rollTier(pool: readonly { id: ConduitId }[], chance: number, random: () => number): ConduitId | undefined {
  if (lootRoll(random) >= chance) return undefined;
  // Keep the independent stream aligned even when a completed tier awards nothing.
  const choice = lootRoll(random);
  return pool.length ? pool[Math.floor(choice * pool.length)].id : undefined;
}

export function machineConduitDrops(stage: number, random: () => number, owned: Partial<Record<ConduitId, number>> = {}): Partial<Record<ConduitId, number>> {
  validateMachineStage(stage);
  const drops: Partial<Record<ConduitId, number>> = {};
  for (const [pool, chance] of [[machinePools.Rare, machineRules.rareChance], [machinePools.Legendary, machineRules.legendaryChance],
    [machinePools.Omnic, stage >= machineRules.omnicStage ? machineRules.omnicChance : 0]] as const) {
    if (!chance) continue;
    const id = rollTier(pool.filter((conduit) => !(owned[conduit.id] ?? 0)), chance, random);
    if (id) drops[id] = 1;
  }
  return drops;
}

export function bannerConduitBonus(random: () => number): ConduitId | undefined {
  return rollTier(bannerPool, machineRules.bannerBonusChance, random);
}

export const machineRulesText = `<p>${machineOrigin}</p>
  <p>${machineRules.stages} stages, Lv.10-120, with a boss every fifth stage. Each enemy drops Prismatica and can drop an unowned Conduit: Rare 8%, Legendary 3.5%, and Omnic 1% from stage ${machineRules.omnicStage}.</p>
  <p>Each rarity has a separate drop chance, so several can drop together. Unowned names within a rarity are equally likely: ${machinePools.Rare.length} Rare, ${machinePools.Legendary.length} Legendary and ${machinePools.Omnic.length} Omnic in total. If you own every name in a rarity, that rarity gives no reward. Bosses use the same chances. Common Conduits are sold in the Store, not dropped here.</p>
  <p>${machineComponentRulesText} No captures, evolution materials or Null-Prismatica.</p>
  <p>One copy unlocks an ordinary Conduit for all characters. Use components to upgrade it up to +5 for your whole account; Details shows the effect at each level. Each character has eight ordinary slots and can equip up to four matching-element Omnic Conduits.</p>
  <p>${masterRulesText}</p>`;
