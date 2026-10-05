import { elements, elementalEnemyLevel, elementalDungeonRules, getElement, type ElementId } from './activities';
import { dungeonArt, elementAccents } from './dungeon-art';
import { type Stats } from './combat';
import { dungeonEnemies, dungeonStrikes, type DungeonEnemy } from './dungeon-enemies';
import { scaledDrop, rollDrop } from './loot-random';
import { enemyGrowth, enemyStat } from './stat-growth';

export const playableDungeons = elements.map((element) => element.id);
export type PlayableDungeon = (typeof playableDungeons)[number];
export function isPlayableDungeon(value: unknown): value is PlayableDungeon {
  return playableDungeons.some((element) => element === value);
}

export function dungeonEncounter(element: PlayableDungeon, stage: number) {
  if (!isPlayableDungeon(element)) throw new Error('Dungeon is not playable.');
  const level = elementalEnemyLevel(stage);
  const art = dungeonArt[element];
  const pack: readonly DungeonEnemy[] = art?.enemies ?? dungeonEnemies[element];
  if (!pack.length) throw new Error(`Dungeon enemy lineup is missing: ${element}.`);
  const tier = Math.min(pack.length - 1, Math.floor((stage - 1) * pack.length / elementalDungeonRules.stages));
  const boss = stage % 5 === 0;
  const stats: Stats = {
    health: enemyStat(boss ? 110 : 55, boss ? enemyGrowth.bossHealth : enemyGrowth.health, level, 10, .024),
    damage: enemyStat(boss ? 13 : 8, boss ? enemyGrowth.bossDamage : enemyGrowth.damage, level, 10, .024),
    defense: enemyStat(2, boss ? enemyGrowth.bossDefense : enemyGrowth.defense, level, 10, .08),
    crit: Math.min(0.25, 0.05 + (level - 10) * 0.002),
    critMultiplier: 1.5, shatterCapacity: 100, elementalDamage: 0,
  };
  return {
    name: getElement(element).dungeon, level, stage, boss, stats, tier, forms: pack.length,
    enemy: pack[tier], color: elementAccents[element],
    background: art ? `${art.slug}.png` : null,
    ability: pack[tier].ability ?? dungeonStrikes[element],
    abilityMultiplier: 1.2 + (stage - 1) / (elementalDungeonRules.stages - 1) * 49 * 0.012,
  };
}

export const materialDropTable = [
  { rarity: 'uncommon', level: 23, chance: .25, finalChance: .98, quantity: 3 },
  { rarity: 'rare', level: 48, chance: .12, finalChance: .90, quantity: 3 },
  { rarity: 'epic', level: 73, chance: .06, finalChance: .80, quantity: 3 },
  { rarity: 'legendary', level: 98, chance: .025, finalChance: .60, quantity: 3 },
  { rarity: 'omnic', level: 120, chance: .01, finalChance: .35, quantity: 3 },
] as const;

export function materialLoot(element: ElementId, stage: number) {
  getElement(element);
  const level = elementalEnemyLevel(stage);
  const common = scaledDrop(level, 10, 10, 1, 1, 3);
  if (!common) throw new Error('Common material loot is missing.');
  const loot = [{ id: `${element}-common`, ...common }];
  for (const entry of materialDropTable) {
    const drop = scaledDrop(level, 10, entry.level, entry.chance, entry.finalChance, entry.quantity);
    if (drop) loot.push({ id: `${element}-${entry.rarity}`, ...drop });
  }
  return loot;
}

export function materialDrops(element: ElementId, stage: number, random: () => number): Record<string, number> {
  const drops: Record<string, number> = {};
  for (const entry of materialLoot(element, stage)) {
    const amount = rollDrop(entry, random);
    if (amount !== undefined) drops[entry.id] = amount;
  }
  return drops;
}
