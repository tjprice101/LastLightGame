import type { ElementId } from './activities';
import { enemyCombatStats } from './stat-growth';
import { enemyAbilityMultiplier } from './enemy-skills';
import { linearMaterialRange, type MaterialRarity } from './material-drops';
import { furtherMaterialRewardRange } from './loot-random';
import { rollDrop, type ScaledDrop } from './loot-random';
import { activityPrismaticaDrop } from './prismatica';

export const gatesOfOblivionRules = {
  id: 'oblivion', name: 'Gates of Oblivion', stages: 25, startingLevel: 140, maximumLevel: 180,
  fragmentUnlockStage: 20, fragmentChance: .1,
} as const;

export const oblivionConstructs = [
  { id: 'oblivion:shardling-acolyte', name: 'Shardling Acolyte', element: 'infernic', skill: 'Calamity Seed: Shardfall', secondSkill: 'Cinder of the First Break', lore: 'Shardling Acolytes collect splinters from Rise’s first failed gate and fit them into a single cutting edge. Their ledger records which breach each shard came from.' },
  { id: 'oblivion:glassbound-sentry', name: 'Glassbound Sentry', element: 'tranquilitic', skill: 'Calamity Pane: Stillward', secondSkill: 'The Window That Will Not Close', lore: 'The Glassbound Sentry stands at sealed archways and replace any cracked pane before the next watch. Their glass bears the names of the rooms Rise ordered them to keep empty.' },
  { id: 'oblivion:oblivion-lantern-wraith', name: 'Oblivion Lantern-Wraith', element: 'atmospheric', skill: 'Calamity Lantern: Last Signal', secondSkill: 'Wind Across the Unlit Hall', lore: 'The Oblivion Lantern-Wraith carries a lamp that marks a route back from the gate. The light points toward the last place its missing patrol reported, not toward the way out.' },
  { id: 'oblivion:fracture-hound', name: 'Fracture Hound', element: 'chaotic', skill: 'Calamity Maw: Faultline Pursuit', secondSkill: 'The Crack Beneath the Trail', lore: 'Fracture Hounds follow stress lines through stone instead of scent. Their tracks end wherever the floor has split, even when the quarry escaped above ground.' },
  { id: 'oblivion:unmade-choir-drone', name: 'Unmade Choir Drone', element: 'oceanic', skill: 'Calamity Chorus: Drowned Measure', secondSkill: 'A Note Below the Floodline', lore: 'Choir Drones keep time for a song whose score was erased before its final measure. Their water-filled resonators still sound the missing beat at every crossing.' },
  { id: 'oblivion:crimson-gearwyrm', name: 'Crimson Gearwyrm', element: 'botanic', skill: 'Calamity Coil: Red Harvest', secondSkill: 'Thorns Between the Teeth', lore: 'Crimson Gearwyrms wind living roots through their turning joints to stop the machinery from seizing. The roots are cut back after each patrol and grow in again by morning.' },
  { id: 'oblivion:husk-seraph-of-rise', name: 'Husk-Seraph of Rise', element: 'tranquilitic', skill: 'Calamity Wing: Empty Benediction', secondSkill: 'The Feather That Remembers', lore: 'Husk-Seraphs carry blank nameplates where Rise’s attendants once recorded their posts. Each still visits the same abandoned station at the start of its watch.' },
  { id: 'oblivion:annihilation-colossus-fragment', name: 'Annihilation Colossus Fragment', element: 'infernic', skill: 'Calamity Fist: Final Measure', secondSkill: 'A City in One Footstep', lore: 'This Colossus fragment was cut from a larger construct after it blocked a passage by standing across it. Its engraved route map stops at the wall it was built to demolish.' },
  { id: 'oblivion:fatebreaker-warden', name: 'Fatebreaker Warden', element: 'chaotic', skill: 'Calamity Edict: Thread Severance', secondSkill: 'No Record of the Next Step', lore: 'Fatebreaker Wardens carry a register of predicted arrivals and strike through every entry that proves wrong. The newest page is always left blank for the challenger.' },
  { id: 'oblivion:gatekeeper-of-oblivion', name: 'Gatekeeper of Oblivion', element: 'oceanic', skill: 'Calamity Lock: Oblivion’s Verdict', secondSkill: 'The Gate Beyond the Last Key', lore: 'The Gatekeeper has kept the final threshold closed through every recorded shift. Its key is fused into the lock, and the hinge pins have never moved.' },
] as const satisfies readonly { id: string; name: string; element: ElementId; skill: string; secondSkill: string; lore: string }[];

export type OblivionConstruct = (typeof oblivionConstructs)[number];
export const oblivionArenaArt = 'oblivion-arena.png';
export const oblivionBannerArt = 'banners/oblivion-banner.png';
export function oblivionConstructArt(construct: { id: string }): string {
  return `oblivion-${construct.id.slice('oblivion:'.length)}`;
}
export const oblivionMaterialRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'omnic'] as const satisfies readonly MaterialRarity[];
export const oblivionMaterialUnlockFloors = [1, 1, 4, 9, 14, 19] as const;
export const oblivionMaterialIds = ['calamity-common', 'calamity-uncommon', 'calamity-rare', 'calamity-epic', 'calamity-legendary', 'calamity-omnic'] as const;

export function isOblivionStage(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 1 && (value as number) <= gatesOfOblivionRules.stages;
}

export function oblivionEnemyLevel(stage: number): number {
  if (!isOblivionStage(stage)) throw new Error(`Gates of Oblivion floor must be an integer from 1 to ${gatesOfOblivionRules.stages}.`);
  return Math.round(gatesOfOblivionRules.startingLevel + (stage - 1) *
    (gatesOfOblivionRules.maximumLevel - gatesOfOblivionRules.startingLevel) / (gatesOfOblivionRules.stages - 1));
}

export function oblivionConstructAtStage(stage: number): OblivionConstruct {
  if (!isOblivionStage(stage)) throw new Error(`Gates of Oblivion floor must be an integer from 1 to ${gatesOfOblivionRules.stages}.`);
  if (stage === gatesOfOblivionRules.stages) return oblivionConstructs[oblivionConstructs.length - 1];
  const index = Math.min(oblivionConstructs.length - 2,
    Math.floor((stage - 1) * (oblivionConstructs.length - 1) / (gatesOfOblivionRules.stages - 1)));
  return oblivionConstructs[index];
}

export function oblivionEncounter(stage: number) {
  const construct = oblivionConstructAtStage(stage);
  const level = oblivionEnemyLevel(stage);
  const boss = stage % 5 === 0;
  return { name: gatesOfOblivionRules.name, stage, level, boss, construct,
    stats: enemyCombatStats(level, boss), abilityMultiplier: enemyAbilityMultiplier(level) };
}

export function oblivionMaterialLoot(stage: number): (ScaledDrop & { id: string })[] {
  if (!isOblivionStage(stage)) throw new Error('Invalid Gates of Oblivion floor.');
  return oblivionMaterialRarities.flatMap((rarity, index) => {
    const firstStage = oblivionMaterialUnlockFloors[index];
    if (stage < firstStage) return [];
    return [{ id: oblivionMaterialIds[index], ...furtherMaterialRewardRange(linearMaterialRange(rarity, stage, firstStage, gatesOfOblivionRules.stages)) }];
  });
}

export function oblivionFragmentDrop(stage: number, boss = oblivionEncounter(stage).boss): ScaledDrop | undefined {
  if (!isOblivionStage(stage)) throw new Error('Invalid Gates of Oblivion floor.');
  if (stage < gatesOfOblivionRules.fragmentUnlockStage) return undefined;
  return { minimum: 1, maximum: 1, chance: boss ? 1 : gatesOfOblivionRules.fragmentChance };
}

export function oblivionLoot(stage: number, boss = oblivionEncounter(stage).boss) {
  const level = oblivionEnemyLevel(stage);
  const fragment = oblivionFragmentDrop(stage, boss);
  return [
    { id: 'fractalis', ...activityPrismaticaDrop({ oblivion: { stage } }, level) },
    ...oblivionMaterialLoot(stage),
    ...(fragment ? [{ id: 'fragment-of-rise', ...fragment,
      ...(boss ? { note: 'Guaranteed once per defeated boss on Floors 20 and 25.' }
        : { note: 'A separate 10% roll per defeated Elemental-Devourer on floors 20-25.' }) }] : []),
  ];
}

export function oblivionMaterialDrops(stage: number, random: () => number): Record<string, number> {
  const drops: Record<string, number> = {};
  for (const entry of oblivionMaterialLoot(stage)) {
    const amount = rollDrop(entry, random);
    if (amount !== undefined) drops[entry.id] = amount;
  }
  return drops;
}
