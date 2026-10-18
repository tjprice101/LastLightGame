import { type ElementId } from './activities';
import { type Stats } from './combat';
import { elementAccents } from './dungeon-art';
import { storyStageLayout } from './activities';
import { enemyCombatStats } from './stat-growth';
import { rollDrop, storyEnemyFractalisDrop } from './loot-random';
import { bossLootMultiplier, bossLootRange } from './final-boss-loot';
import { storyRegionArt } from './story-art';
import { enemyAbilityMultiplier } from './enemy-skills';

export const storyRules = { regionStages: storyStageLayout.regionStages, stages: storyStageLayout.stages, startingLevel: 1, maximumLevel: 55 } as const;
/** Paid on every Story stage clear, including replays (D-340). */
export const storyCompletionReward = { fractalis: 150, lycalis: 2 } as const;

/** Maps a clear count saved on the old six-region 25-stage layout to the 18-stage layout. Partial regions round down. */
export function migrateLegacyStoryCompleted(completed: number): number {
  if (!Number.isSafeInteger(completed) || completed < 0 || completed > storyStageLayout.legacyStages) throw new Error('Invalid saved Story progress.');
  const region = Math.floor(completed / storyStageLayout.legacyRegionStages);
  const within = completed % storyStageLayout.legacyRegionStages;
  return region * storyRules.regionStages + Math.floor(within * storyRules.regionStages / storyStageLayout.legacyRegionStages);
}
export const storyRegions: readonly {
  element: ElementId; name: string; introduction: string; enemies: readonly string[]; boss: string; conclusion: string;
}[] = [
  { element: 'infernic', name: 'Emberwake March', introduction: 'The search for Let\'s soul begins among cooling cinders. Rise\'s seekers wield the same Infernic Wrath. Restore the first beacon to reopen the road.',
    enemies: ['Cinderling', 'Ashback Boar', 'Coalcrest Moth', 'Furnace Jackal'], boss: 'Kilnheart Warden',
    conclusion: 'The first beacon burns again. Let\'s soul remains unfound; the road leads onward toward Oceanic Sadness.' },
  { element: 'oceanic', name: 'Glasswater Reach', introduction: 'Oceanic Sadness echoes across the broken causeways of Glasswater. Follow the submerged bells toward the second beacon while Rise\'s seekers scour the same shores.',
    enemies: ['Tideglass Crab', 'Foamfin Drake', 'Pearlshell Turtle', 'Current Ray'], boss: 'Deepbell Leviathan',
    conclusion: 'The bells ring above the water. The search continues beyond these grieving shores, toward Atmospheric Calm.' },
  { element: 'atmospheric', name: 'Stormspan Heights', introduction: 'Let named Atmospheric for Calm, even where its winds become a storm. Reconnect the sky bridges as Rise\'s Elemental-Devourers search the floating ridges.',
    enemies: ['Cloudhorn Ram', 'Staticwing Kite', 'Gusttail Lynx', 'Thundercoil Serpent'], boss: 'Tempest Crown Roc',
    conclusion: 'The sky paths steady without deciding the creators\' contest. Below, Botanic Joy and Life point toward the next road.' },
  { element: 'botanic', name: 'Rootstone Wilds', introduction: 'Botanic carries Let\'s Joy and Life. Trace the living paths through sealed roads; Rise\'s seekers have stolen this power too and roam the buried garden.',
    enemies: ['Mossplate Beetle', 'Briarback Stag', 'Loamjaw Mole', 'Fernmantle Basilisk'], boss: 'Heartwood Colossus',
    conclusion: 'The garden opens its gates. Neither creator\'s soul is here; a quiet procession leads toward Tranquilitic Peace.' },
  { element: 'tranquilitic', name: 'Stillhalo Vale', introduction: 'Tranquilitic Peace rests over abandoned sanctuaries. Gather the scattered vows to restore the fifth beacon, remembering that Rise\'s creations can wield Peace as well.',
    enemies: ['Ivoryveil Moth', 'Dewhalo Hart', 'Vowcrest Crane', 'Opalward Lion'], boss: 'Serene Oathkeeper',
    conclusion: 'The vows become a guiding chorus. The search leads to the final route, where Chaotic Death and Destruction have fractured the frontier.' },
  { element: 'chaotic', name: 'Riftbound Frontier', introduction: 'Let named Chaotic for Death and Destruction; it is not exclusive to Rise or her Nothingness. Cross the fractures and confront her seekers at the final beacon.',
    enemies: ['Riftfang Hound', 'Splinterhide Lizard', 'Voidcrest Raven', 'Faultcoil Wyrm'], boss: 'Fracture Sovereign',
    conclusion: 'Six beacons answer one another and the roads reopen. Neither Let\'s nor Rise\'s soul has been found. Both factions continue their search beyond the frontier.' },
];

export function storyEncounter(stage: number) {
  if (!Number.isInteger(stage) || stage < 1 || stage > storyRules.stages) throw new Error(`Story stage must be from 1 to ${storyRules.stages}.`);
  const regionIndex = Math.floor((stage - 1) / storyRules.regionStages);
  const region = storyRegions[regionIndex];
  const regionStage = (stage - 1) % storyRules.regionStages + 1;
  const level = Math.round(storyRules.startingLevel + (stage - 1) *
    (storyRules.maximumLevel - storyRules.startingLevel) / (storyRules.stages - 1));
  const boss = regionStage === storyRules.regionStages;
  const stats: Stats = enemyCombatStats(level, boss);
  return { ...region, name: region.name, stage, regionIndex, regionStage, level, boss, stats,
    color: elementAccents[region.element], background: storyRegionArt[region.element]?.background ?? null,
    abilityMultiplier: enemyAbilityMultiplier(level) };
}

export function storyCreature(stage: number, identity: number): { id: string; name: string; art?: string } {
  const encounter = storyEncounter(stage);
  if (!Number.isInteger(identity) || identity < 0 || identity >= (encounter.boss ? 1 : 4)) throw new Error('Invalid Story enemy identity.');
  const art = storyRegionArt[encounter.element];
  return { ...(art ? { art: encounter.boss ? art.boss : art.enemies[identity] } : {}),
    id: `story:${encounter.element}:${encounter.boss ? 'boss' : identity}`,
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
  const drops = [
    { id: `${element}-common`, minimum, maximum: minimum * 2, chance: 1 },
    { id: `${element}-uncommon`, minimum, maximum: minimum * 2, chance: .25 + .55 * (level - 1) / 54 },
  ];
  return drops.map(drop => bossLootRange(drop, bossLootMultiplier({ story: { storyStage: stage } })));
}

export function storyDrops(stage: number, random: () => number): Record<string, number> {
  return Object.fromEntries(storyMaterialLoot(stage).flatMap((drop) => {
    const amount = rollDrop(drop, random);
    return amount === undefined ? [] : [[drop.id, amount]];
  }));
}

export const storyRulesText = `Six regions with 18 stages each, at enemy levels 1-55. Every stage clear, including replays, pays 150 Prismatica and 2 Null-Prismatica. Enemies drop Common and Uncommon materials that match their region. No captures. Each regional boss gives a first-clear bonus, starting at 1,000 Prismatica and 50 Null-Prismatica and increasing 15% per region. Ordinary enemy Prismatica drops rise from 8-16 at Lv.1 to 170-340 at Lv.55. Regional bosses give 5x the base Prismatica line (base 5-10 at Lv.1 to 113-226 at Lv.55) and 5x materials on every clear; first-clear bonuses do not multiply or repeat. Continue restores HP and keeps your Gauge.`;

export function storyLoot(stage: number) {
  const encounter = storyEncounter(stage);
  return [bossLootRange({ id: 'fractalis', ...storyEnemyFractalisDrop(encounter.level, encounter.boss) },
    bossLootMultiplier({ story: { storyStage: stage } })), ...storyMaterialLoot(stage)];
}
