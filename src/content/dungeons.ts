import { elements, elementalEnemyLevel, elementalDungeonRules, getElement, type ElementId } from './activities';
import { dungeonArt, legacyDungeonArt, elementAccents } from './dungeon-art';
import { type Stats } from './combat';
import { legacyDungeonEnemies, legacyDungeonStrikes, type DungeonEnemy } from './dungeon-enemies';
import { elementSources, type LegacyElementId } from './element-migration';
import { rollDrop, type ScaledDrop } from './loot-random';
import { enemyCombatStats } from './stat-growth';
import { enemyAbilityMultiplier } from './enemy-skills';
import { bossLootMultiplier } from './final-boss-loot';
import { materialLevelBrackets, materialRarities, type MaterialRarity } from './material-drops';
export { materialRarities, type MaterialRarity } from './material-drops';

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

/** D-357: each bracket opens on the first floor whose enemy level reaches that rarity's drop level. */
export const materialBrackets: readonly { level: number; firstStage: number; ranges: Partial<Record<MaterialRarity, readonly [number, number]>> }[] =
  materialLevelBrackets.map(({ level, ranges }) => {
    const firstStage = Array.from({ length: elementalDungeonRules.stages }, (_, stage) => stage + 1).find(stage => elementalEnemyLevel(stage) >= level) ?? 1;
    return { level, firstStage, ranges };
  });

export function materialBracket(stage: number) {
  elementalEnemyLevel(stage);
  return [...materialBrackets].reverse().find(bracket => stage >= bracket.firstStage)!;
}

export function materialLoot(element: ElementId, stage: number): (ScaledDrop & { id: string })[] {
  getElement(element);
  const { ranges } = materialBracket(stage);
  const multiplier = bossLootMultiplier({ dungeon: { stage } });
  return materialRarities.flatMap(rarity => {
    const range = ranges[rarity];
    if (!range) return [];
    const retained = .9 - .6 * (stage - 1) / (elementalDungeonRules.stages - 1);
    return [{ id: `${element}-${rarity}`, minimum: Math.max(1, Math.round(range[0] * multiplier * retained)),
      maximum: Math.max(1, Math.round(range[1] * multiplier * retained)), chance: 1 }];
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
