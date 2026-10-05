import { elements, dungeonStageCount, getElement, type ElementId, type InfusionModeId } from './activities';
import { type Stats } from './combat';
import { lootRoll, rollDrop, scaledDrop } from './loot-random';
import { enemyGrowth, enemyStat } from './stat-growth';

export function isInfusionMode(value: unknown): value is InfusionModeId {
  return value === 'heavens' || value === 'abyss';
}
export function infusionElements(mode: InfusionModeId) {
  if (!isInfusionMode(mode)) throw new Error('Unknown infusion mode.');
  return elements.filter((element) => element.infusion === mode);
}
export const specialtyMaterials = [
  { id: 'heavens-weapon', name: 'Dawnsteel of Judgment', art: 'heavens-dawnsteel-of-judgment' },
  { id: 'heavens-evolution', name: 'Crown of the Scarlet Oath', art: 'heavens-crown-scarlet-oath' },
  { id: 'heavens-level', name: 'Chalice of the Undying Dawn', art: 'heavens-chalice-undying-dawn' },
  { id: 'abyss-weapon', name: 'Voidfang of Ruin', art: 'abyss-voidfang-of-ruin' },
  { id: 'abyss-evolution', name: 'Heart of the Shattered Void', art: 'abyss-heart-shattered-void' },
  { id: 'abyss-level', name: 'Hourglass of Endless Wrath', art: 'abyss-hourglass-endless-wrath' },
] as const;
export function specialtyId(element: ElementId, purpose: 'weapon' | 'evolution' | 'level'): string {
  return `${getElement(element).infusion}-${purpose}`;
}
export const infusionEnemies = {
  heavens: [
    ['Dawnthorn Slime', 'heavens-dawnthorn-slime'],
    ['Scarlet Benediction, Dawnthorn Slime', 'heavens-scarlet-benediction'],
    ['Gilded Reproach, Dawnthorn Slime', 'heavens-gilded-reproach'],
    ['Thorns of the First Light, Dawnthorn Slime', 'heavens-thorns-first-light'],
    ['Crimson Reckoning, Dawnthorn Slime', 'heavens-crimson-reckoning'],
    ['The Dawn Without Mercy, Dawnthorn Slime', 'heavens-dawn-without-mercy'],
  ],
  abyss: [
    ['Wraththorn Slime', 'abyss-wraththorn-slime'],
    ['Starless Murmur, Wraththorn Slime', 'abyss-starless-murmur'],
    ["Ruin's Awakening, Wraththorn Slime", 'abyss-ruins-awakening'],
    ['Hunger Beyond the Veil, Wraththorn Slime', 'abyss-hunger-beyond-veil'],
    ['Worldfall Reverie, Wraththorn Slime', 'abyss-worldfall-reverie'],
    ['The Night Without End, Wraththorn Slime', 'abyss-night-without-end'],
  ],
} as const;
export function infusionEncounter(mode: InfusionModeId, stage: number) {
  if (!isInfusionMode(mode) || !Number.isInteger(stage) || stage < 1 || stage > dungeonStageCount) throw new Error(`Infusion stage must be an integer from 1 to ${dungeonStageCount}.`);
  const tier = Math.min(5, Math.floor((stage - 1) * 6 / dungeonStageCount));
  const level = Math.round(80 + (stage - 1) * 40 / (dungeonStageCount - 1));
  const boss = stage % 5 === 0;
  const stats: Stats = {
    health: enemyStat(boss ? 110 : 55, boss ? enemyGrowth.bossHealth : enemyGrowth.health, level, 10, .036),
    damage: enemyStat(boss ? 13 : 8, boss ? enemyGrowth.bossDamage : enemyGrowth.damage, level, 10, .036),
    defense: enemyStat(2, boss ? enemyGrowth.bossDefense : enemyGrowth.defense, level, 10, .08),
    crit: .12, critMultiplier: 1.5, shatterCapacity: 100, elementalDamage: 0 };
  const [name, art] = infusionEnemies[mode][tier];
  return { name: mode === 'heavens' ? 'Soar to Heaven' : 'Delve into the Abyss', stage, level, boss, stats, tier, forms: 6,
    enemy: { name, art }, color: mode === 'heavens' ? '#ff6565' : '#f464d4', background: `${mode}-arena.png`,
    ability: mode === 'heavens' ? 'Scarlet Judgment' : 'Cosmic Wrath', abilityMultiplier: 1.2 + (stage - 1) / (dungeonStageCount - 1) * 24 * .016 };
}
export const infusionDropTable = [
  { rarity: 'epic', level: 80, chance: .15, finalChance: .85, quantity: 3 },
  { rarity: 'legendary', level: 100, chance: .06, finalChance: .65, quantity: 3 },
  { rarity: 'omnic', level: 115, chance: .02, finalChance: .40, quantity: 3 },
] as const;
export const specialtyDropTable = [
  { purpose: 'weapon', level: 80, quantity: 3 },
  { purpose: 'evolution', level: 93, quantity: 3 },
  { purpose: 'level', level: 100, quantity: 3 },
] as const;
export function infusionLoot(mode: InfusionModeId, stage: number) {
  const { level } = infusionEncounter(mode, stage);
  const specialties = specialtyDropTable.flatMap((entry) => {
    const drop = scaledDrop(level, 80, entry.level, 1, 1, entry.quantity);
    return drop ? [{ id: `${mode}-${entry.purpose}`, ...drop }] : [];
  });
  const bonuses = infusionDropTable.flatMap((entry) => {
    const drop = scaledDrop(level, 80, entry.level, entry.chance, entry.finalChance, entry.quantity);
    return drop ? [{ rarity: entry.rarity, ...drop }] : [];
  });
  return { specialties, bonuses };
}

export function infusionDrops(mode: InfusionModeId, stage: number, random: () => number): Record<string, number> {
  const { specialties, bonuses } = infusionLoot(mode, stage);
  const eligibleElements = infusionElements(mode);
  const drops: Record<string, number> = {};
  for (const entry of specialties) {
    const amount = rollDrop(entry, random);
    if (amount === undefined) throw new Error('Guaranteed specialty material did not drop.');
    drops[entry.id] = amount;
  }
  for (const entry of bonuses) {
    const amount = rollDrop(entry, random);
    if (amount !== undefined) drops[`${eligibleElements[Math.floor(lootRoll(random) * eligibleElements.length)].id}-${entry.rarity}`] = amount;
  }
  return drops;
}
