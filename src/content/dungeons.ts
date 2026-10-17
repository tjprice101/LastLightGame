import { elements, elementalEnemyLevel, elementalDungeonRules, getElement, type ElementId } from './activities';
import { dungeonArt, legacyDungeonArt, elementAccents } from './dungeon-art';
import { type Stats } from './combat';
import { legacyDungeonEnemies, legacyDungeonStrikes, type DungeonEnemy } from './dungeon-enemies';
import { elementSources, type LegacyElementId } from './element-migration';
import { rollDrop } from './loot-random';
import { enemyCombatStats } from './stat-growth';
import { enemyAbilityMultiplier } from './enemy-skills';
import { bossLootMultiplier, bossLootRange } from './final-boss-loot';

export const playableDungeons = elements.map((element) => element.id);
export type PlayableDungeon = (typeof playableDungeons)[number];
export function isPlayableDungeon(value: unknown): value is PlayableDungeon {
  return playableDungeons.some((element) => element === value);
}

export function dungeonVariants(element: PlayableDungeon, stage: number) {
  if (!isPlayableDungeon(element)) throw new Error('Dungeon is not playable.');
  elementalEnemyLevel(stage);
  return elementSources[element].map((source: LegacyElementId) => {
    const art = legacyDungeonArt[source];
    const pack: readonly DungeonEnemy[] = art?.enemies ?? legacyDungeonEnemies[source];
    if (!pack.length) throw new Error(`Dungeon enemy lineup is missing: ${source}.`);
    const tier = Math.min(pack.length - 1, Math.floor((stage - 1) * pack.length / elementalDungeonRules.stages));
    return { source, tier, forms: pack.length, enemy: pack[tier],
      creatureId: `dungeon:${source}:${tier}`, ability: pack[tier].ability ?? legacyDungeonStrikes[source] };
  });
}

export function dungeonEncounter(element: PlayableDungeon, stage: number, family = 0) {
  if (!isPlayableDungeon(element)) throw new Error('Dungeon is not playable.');
  const level = elementalEnemyLevel(stage);
  const art = dungeonArt[element];
  const variants = dungeonVariants(element, stage);
  if (!Number.isInteger(family) || family < 0 || family >= variants.length) throw new Error('Invalid dungeon enemy family.');
  const variant = variants[family];
  const boss = stage % 5 === 0;
  const stats: Stats = enemyCombatStats(level, boss);
  return {
    name: getElement(element).dungeon, level, stage, boss, stats, ...variant,
    color: elementAccents[element],
    background: art ? `${art.slug}.png` : null,
    abilityMultiplier: enemyAbilityMultiplier(level),
  };
}

export const materialRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'omnic'] as const;
export type MaterialRarity = (typeof materialRarities)[number];

/** Guaranteed per-kill material ranges. Each bracket adds the next rarity and raises every lower one. */
export const materialBrackets: readonly { firstStage: number; ranges: Partial<Record<MaterialRarity, readonly [number, number]>> }[] = [
  { firstStage: 1, ranges: { common: [4, 5] } },
  { firstStage: 6, ranges: { common: [8, 10], uncommon: [2, 3] } },
  { firstStage: 12, ranges: { common: [12, 15], uncommon: [5, 6], rare: [2, 3] } },
  { firstStage: 18, ranges: { common: [16, 20], uncommon: [8, 10], rare: [5, 6], epic: [2, 3] } },
  { firstStage: 24, ranges: { common: [20, 25], uncommon: [12, 15], rare: [8, 10], epic: [5, 6], legendary: [2, 3] } },
  { firstStage: 30, ranges: { common: [25, 30], uncommon: [16, 20], rare: [12, 15], epic: [8, 10], legendary: [5, 6], omnic: [2, 3] } },
];

export function materialBracket(stage: number) {
  elementalEnemyLevel(stage);
  return [...materialBrackets].reverse().find(bracket => stage >= bracket.firstStage)!;
}

export function materialLoot(element: ElementId, stage: number) {
  getElement(element);
  const { ranges } = materialBracket(stage);
  const multiplier = bossLootMultiplier({ dungeon: { stage } });
  return materialRarities.flatMap(rarity => {
    const range = ranges[rarity];
    return range ? [bossLootRange({ id: `${element}-${rarity}`, minimum: range[0], maximum: range[1], chance: 1 }, multiplier)] : [];
  });
}

export function materialDrops(element: ElementId, stage: number, random: () => number): Record<string, number> {
  const drops: Record<string, number> = {};
  for (const entry of materialLoot(element, stage)) {
    const amount = rollDrop(entry, random);
    if (amount !== undefined) drops[entry.id] = amount;
  }
  return drops;
}
