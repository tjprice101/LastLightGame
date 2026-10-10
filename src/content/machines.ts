import { infusionStageCount, validateMachineStage } from './activities';
import { conduits, type ConduitId } from './conduits';
import { lootRoll } from './loot-random';
import { machineComponentRulesText } from './mechanical-components';

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

export function machineConduitLoot(stage: number) {
  validateMachineStage(stage);
  return [
    ...machinePools.Rare.map((conduit) => ({ id: conduit.id, minimum: 1, maximum: 1,
      chance: machineRules.rareChance / machinePools.Rare.length,
      note: 'Independent Rare tier roll, then equal choice within the tier; bosses use the same odds.' })),
    ...machinePools.Legendary.map((conduit) => ({ id: conduit.id, minimum: 1, maximum: 1,
      chance: machineRules.legendaryChance / machinePools.Legendary.length,
      note: 'Independent Legendary tier roll, then equal choice within the tier; bosses use the same odds.' })),
    ...(stage >= machineRules.omnicStage ? machinePools.Omnic.map((conduit) => ({ id: conduit.id, minimum: 1, maximum: 1,
      chance: machineRules.omnicChance / machinePools.Omnic.length,
      note: 'Independent Omnic tier roll, then equal choice within the tier; bosses use the same odds.' })) : []),
  ];
}

function rollTier(pool: readonly { id: ConduitId }[], chance: number, random: () => number): ConduitId | undefined {
  if (lootRoll(random) >= chance) return undefined;
  if (!pool.length) throw new Error('Conduit reward pool is empty.');
  return pool[Math.floor(lootRoll(random) * pool.length)].id;
}

export function machineConduitDrops(stage: number, random: () => number): Partial<Record<ConduitId, number>> {
  validateMachineStage(stage);
  const drops: Partial<Record<ConduitId, number>> = {};
  for (const [pool, chance] of [[machinePools.Rare, machineRules.rareChance], [machinePools.Legendary, machineRules.legendaryChance],
    [machinePools.Omnic, stage >= machineRules.omnicStage ? machineRules.omnicChance : 0]] as const) {
    if (!chance) continue;
    const id = rollTier(pool, chance, random);
    if (id) drops[id] = 1;
  }
  return drops;
}

export function bannerConduitBonus(random: () => number): ConduitId | undefined {
  return rollTier(bannerPool, machineRules.bannerBonusChance, random);
}

export const machineRulesText = `<p>${machineRules.stages} stages · Lv.10-120 · Boss every fifth stage. Each defeated enemy grants ordinary Prismatica and independently rolls Rare Conduits at 8%, Legendary at 3.5%, and Omnic at 1% from stage ${machineRules.omnicStage} onward. A successful tier roll awards one equally chosen Conduit: ${machinePools.Rare.length} Rare, ${machinePools.Legendary.length} Legendary or ${machinePools.Omnic.length} element-specific Omnic. Multiple tiers may drop together; bosses use the same odds. All Common Conduits are Store-only and have no machine drop roll. ${machineComponentRulesText} No captures, evolution materials, Null-Prismatica or clear bonus.</p><p>One owned copy unlocks its name for every character. Each name can be upgraded account-wide five times using only components, adding 50% of the original stat modifiers each time, including penalties (3.5 times at +5). Kit effects and special mechanics are unchanged by upgrades. Up to four Omnic Conduits may occupy the eight ordinary slots; each must match that character's combat element. Master remains reserved.</p>`;
