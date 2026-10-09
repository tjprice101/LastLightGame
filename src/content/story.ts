import { type ElementId } from './activities';
import { type Stats } from './combat';
import { elementAccents } from './dungeon-art';
import { enemyGrowth, enemyStat, stagedEnemyAttack } from './stat-growth';
import { fractalisDrop, rollDrop } from './loot-random';

export const storyRules = { regionStages: 25, stages: 150, startingLevel: 1, maximumLevel: 55 } as const;
export const storyRegions: readonly {
  element: ElementId; name: string; introduction: string; enemies: readonly string[]; boss: string; conclusion: string;
}[] = [
  { element: 'infernic', name: 'Emberwake March', introduction: 'The road begins among cooling cinders. Recover the beacons before their embers vanish.',
    enemies: ['Cinderling', 'Ashback Boar', 'Coalcrest Moth', 'Furnace Jackal'], boss: 'Kilnheart Warden',
    conclusion: 'The first beacon burns again. Beyond the ash, a tide answers its light.' },
  { element: 'oceanic', name: 'Glasswater Reach', introduction: 'Broken causeways cross a silent sea. Follow the submerged bells toward the second beacon.',
    enemies: ['Tideglass Crab', 'Foamfin Drake', 'Pearlshell Turtle', 'Current Ray'], boss: 'Deepbell Leviathan',
    conclusion: 'The bells ring above the water. Their song carries into the stormlands.' },
  { element: 'atmospheric', name: 'Stormspan Heights', introduction: 'Floating ridges drift beneath a gathering storm. Reconnect the wind bridges to reach the sky beacon.',
    enemies: ['Cloudhorn Ram', 'Staticwing Kite', 'Gusttail Lynx', 'Thundercoil Serpent'], boss: 'Tempest Crown Roc',
    conclusion: 'The sky paths steady. Beneath them, a green beacon struggles through stone.' },
  { element: 'botanic', name: 'Rootstone Wilds', introduction: 'Roots have sealed the old roads. Trace the living paths and return light to the buried garden.',
    enemies: ['Mossplate Beetle', 'Briarback Stag', 'Loamjaw Mole', 'Fernmantle Basilisk'], boss: 'Heartwood Colossus',
    conclusion: 'The garden opens its gates. A quiet procession leads toward the pale horizon.' },
  { element: 'tranquilitic', name: 'Stillhalo Vale', introduction: 'A hush lies over abandoned sanctuaries. Gather the scattered vows before silence takes the fifth beacon.',
    enemies: ['Ivoryveil Moth', 'Dewhalo Hart', 'Vowcrest Crane', 'Opalward Lion'], boss: 'Serene Oathkeeper',
    conclusion: 'The vows become a guiding chorus. Only the last fractured beacon remains.' },
  { element: 'chaotic', name: 'Riftbound Frontier', introduction: 'All restored lights converge at the broken frontier. Cross the fractures and confront the keeper of the final beacon.',
    enemies: ['Riftfang Hound', 'Splinterhide Lizard', 'Voidcrest Raven', 'Faultcoil Wyrm'], boss: 'Fracture Sovereign',
    conclusion: 'Six beacons answer one another. The world has not healed, but its roads are no longer dark.' },
];

export function storyEncounter(stage: number) {
  if (!Number.isInteger(stage) || stage < 1 || stage > storyRules.stages) throw new Error('Story stage must be from 1 to 150.');
  const regionIndex = Math.floor((stage - 1) / storyRules.regionStages);
  const region = storyRegions[regionIndex];
  const regionStage = (stage - 1) % storyRules.regionStages + 1;
  const level = Math.round(storyRules.startingLevel + (stage - 1) *
    (storyRules.maximumLevel - storyRules.startingLevel) / (storyRules.stages - 1));
  const boss = regionStage === storyRules.regionStages;
  const stats: Stats = {
    health: Math.round(enemyStat(boss ? 140 : 60, boss ? enemyGrowth.bossHealth : enemyGrowth.health, level, 1, .024) * .4),
    damage: Math.round(stagedEnemyAttack(level, boss, 1) * .5),
    defense: Math.round(enemyStat(2, boss ? enemyGrowth.bossDefense : enemyGrowth.defense, level, 1, .04) * .5),
    crit: .05, critMultiplier: 1.5, shatterCapacity: 100, elementalDamage: 0,
  };
  return { ...region, name: region.name, stage, regionIndex, regionStage, level, boss, stats,
    color: elementAccents[region.element], background: null,
    abilityMultiplier: 1.15 + (level - 1) * .003 };
}

export function storyCreature(stage: number, identity: number): { id: string; name: string } {
  const encounter = storyEncounter(stage);
  if (!Number.isInteger(identity) || identity < 0 || identity >= (encounter.boss ? 1 : 4)) throw new Error('Invalid Story enemy identity.');
  return { id: `story:${encounter.element}:${encounter.boss ? 'boss' : identity}`,
    name: encounter.boss ? storyRegions[encounter.regionIndex].boss : encounter.enemies[identity] };
}

export function storyBossBonus(stage: number) {
  const encounter = storyEncounter(stage);
  if (!encounter.boss) throw new Error('Only a regional Story boss has a first-clear bonus.');
  const numerator = 115 ** encounter.regionIndex;
  const denominator = 100 ** encounter.regionIndex;
  return { fractalis: Math.round(1000 * numerator / denominator), lycalis: Math.round(50 * numerator / denominator) };
}

export function storyMaterialLoot(stage: number) {
  const { element, level } = storyEncounter(stage);
  const growth = ((level - 1) / 54) ** 2;
  const minimum = 1 + Math.floor(2 * growth);
  const drops = [{ id: `${element}-common`, minimum, maximum: minimum * 2, chance: 1 }];
  if (level >= 23) drops.push({ id: `${element}-uncommon`, minimum, maximum: minimum * 2, chance: .25 + .55 * (level - 23) / 32 });
  return drops;
}

export function storyDrops(stage: number, random: () => number): Record<string, number> {
  return Object.fromEntries(storyMaterialLoot(stage).flatMap((drop) => {
    const amount = rollDrop(drop, random);
    return amount === undefined ? [] : [[drop.id, amount]];
  }));
}

export const storyRulesText = 'Six regions in a fixed order, 25 stages each, enemy levels 1-55. Common and Uncommon matching-element materials only; no captures. Regional bosses grant a one-time account bonus, starting at 1,000 Prismatica and 50 Null-Prismatica and growing 15% per region. Replays grant ordinary per-kill loot only. Continue restores HP and retains Gauge.';

export function storyLoot(stage: number) {
  return [{ id: 'fractalis', ...fractalisDrop(storyEncounter(stage).level) }, ...storyMaterialLoot(stage)];
}
