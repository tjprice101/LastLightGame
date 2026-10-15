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

export const machineRulesText = `<p>${machineOrigin}</p><p>${machineRules.stages} stages · Lv.10-120 · Boss every fifth stage. Each defeated enemy grants ordinary Prismatica and independently rolls Rare Conduits at 8%, Legendary at 3.5%, and Omnic at 1% from stage ${machineRules.omnicStage} onward. A successful tier roll awards one equally chosen unowned Conduit from that rarity's catalog: ${machinePools.Rare.length} Rare, ${machinePools.Legendary.length} Legendary or ${machinePools.Omnic.length} element-specific Omnic. Already-owned names cannot drop. If every name in the rolled rarity is owned, no Conduit or replacement reward is granted. Multiple tiers may drop together; bosses use the same odds. All Common Conduits are Store-only and have no machine drop roll. ${machineComponentRulesText} No captures, evolution materials, Null-Prismatica or clear bonus.</p><p>One owned ordinary copy unlocks its name for every character. Each ordinary name can be upgraded account-wide five times using only components, adding 50% of the original stat modifiers each time, including penalties (3.5 times at +5). Kit effects and special mechanics are unchanged by upgrades. Up to four ordinary Omnic Conduits may occupy the eight ordinary slots; each must match that character's combat element.</p><p>${masterRulesText}</p>`;
