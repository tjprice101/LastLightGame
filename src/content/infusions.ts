import { elements, infusionModes, currencyModes, eventModes, machineModes, isCurrencyMode, infusionStageCount, getElement, type ElementId, type InfusionModeId } from './activities';
import { machineEnemies } from './machines';
import { type Stats } from './combat';
import { lootRoll, rollDrop, scaledDrop } from './loot-random';
import { enemyGrowth, enemyStat, stagedEnemyAttack } from './stat-growth';
import { roseMaterials, roseMaterialUnlocks, roseFinalChances, roseSaleQuantities, roseFormStages } from './roses';

export function isInfusionMode(value: unknown): value is InfusionModeId {
  return [...infusionModes, ...currencyModes, ...eventModes, ...machineModes].some((entry) => entry.id === value);
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
  treasury: [
    ['Gleamstone Slime', 'gleamstone-slime'],
    ['Diadem of Daybreak, Gleamstone Slime', 'diadem-of-daybreak-gleamstone-slime'],
    ['Scepter of Radiance, Gleamstone Slime', 'scepter-of-radiance-gleamstone-slime'],
    ['Regalia of the Sun, Gleamstone Slime', 'regalia-of-the-sun-gleamstone-slime'],
    ['Sovereign of the Gilded Vault, Gleamstone Slime', 'sovereign-of-the-gilded-vault-gleamstone-slime'],
    ['The Crown Beyond Dawn, Gleamstone Slime', 'the-crown-beyond-dawn-gleamstone-slime'],
  ],
  sanctuary: [
    ['Rosethorn Wisp', 'rosethorn-wisp'],
    ['Votive of First Bloom, Rosethorn Wisp', 'votive-of-first-bloom-rosethorn-wisp'],
    ['Laurel of the Sacred Flame, Rosethorn Wisp', 'laurel-of-the-sacred-flame-rosethorn-wisp'],
    ['Seraph of the Rose Pyre, Rosethorn Wisp', 'seraph-of-the-rose-pyre-rosethorn-wisp'],
    ['Sovereign of the Hallowed Garden, Rosethorn Wisp', 'sovereign-of-the-hallowed-garden-rosethorn-wisp'],
    ['The Flame Beyond Eternity, Rosethorn Wisp', 'the-flame-beyond-eternity-rosethorn-wisp'],
  ],
  roses: [
    ['Roselius', 'roselius'],
    ['Votive of Golden Thorns, Roselius', 'roselius-golden-thorns'],
    ['Knight of the Crimson Bloom, Roselius', 'roselius-crimson-bloom'],
    ['Seraph of Passion, Roselius', 'roselius-seraph-passion'],
    ['Sovereign of the Living Rose, Roselius', 'roselius-living-rose'],
    ['The Garden Beyond Eternity, Roselius', 'roselius-garden-eternity'],
  ],
  machines: machineEnemies.map((enemy) => [enemy.name, enemy.art] as const),
} as const;
export const infusionEnemyElements = { heavens: 'tranquilitic', abyss: 'chaotic', treasury: 'tranquilitic', sanctuary: 'tranquilitic', roses: 'tranquilitic', machines: 'botanic' } as const satisfies Record<InfusionModeId, ElementId>;
export function infusionEnemyStats(level: number, boss: boolean): Stats {
  if (!Number.isInteger(level) || level < 80 || level > 120) throw new Error('Infusion enemy level must be from 80 to 120.');
  return creatureEnemyStats(level, boss);
}
export function treasuryEnemyStats(level: number, boss: boolean): Stats {
  if (!Number.isInteger(level) || level < 50 || level > 120) throw new Error('Treasury creature level must be from 50 to 120.');
  return creatureEnemyStats(level, boss);
}
export const treasurySalePrices = [1000, 3000, 10000, 30000, 100000, 300000] as const;
export const sanctuarySalePrices = [
  { fractalis: 100, lycalis: 1 }, { fractalis: 300, lycalis: 2 },
  { fractalis: 1000, lycalis: 3 }, { fractalis: 3000, lycalis: 5 },
  { fractalis: 10000, lycalis: 7 }, { fractalis: 30000, lycalis: 10 },
] as const;
export function creatureSaleValue(mode: InfusionModeId, tier: number) {
  if (!Number.isInteger(tier) || tier < 0 || tier > 5) throw new Error('Invalid creature sale tier.');
  if (mode === 'treasury') return { fractalis: treasurySalePrices[tier], lycalis: 0, materials: {} as Record<string, number> };
  if (mode === 'sanctuary') return { ...sanctuarySalePrices[tier], materials: {} as Record<string, number> };
  if (mode === 'roses') return { fractalis: 0, lycalis: 0, materials: { [roseMaterials[tier].id]: roseSaleQuantities[tier] } };
  throw new Error('This creature mode does not support sales.');
}
export function sanctuaryEnemyStats(level: number, boss: boolean): Stats {
  if (!Number.isInteger(level) || level < 65 || level > 120) throw new Error('Sanctuary creature level must be from 65 to 120.');
  return creatureEnemyStats(level, boss);
}
export function roseEnemyStats(level: number, boss: boolean): Stats {
  if (!Number.isInteger(level) || level < 80 || level > 140) throw new Error('Roselius enemy level must be from 80 to 140.');
  return creatureEnemyStats(level, boss, 140);
}
function creatureEnemyStats(level: number, boss: boolean, maximumLevel = 120): Stats {
  return {
    health: enemyStat(boss ? 110 : 55, boss ? enemyGrowth.bossHealth : enemyGrowth.health, level, 10, .036, maximumLevel),
    damage: stagedEnemyAttack(level, boss, 10, maximumLevel),
    defense: enemyStat(2, boss ? enemyGrowth.bossDefense : enemyGrowth.defense, level, 10, .08, maximumLevel),
    crit: .12, critMultiplier: 1.5, shatterCapacity: 100, elementalDamage: 0 };
}
export function infusionEncounter(mode: InfusionModeId, stage: number) {
  const stages = infusionStageCount(mode);
  if (!isInfusionMode(mode) || !Number.isInteger(stage) || stage < 1 || stage > stages) throw new Error(`Infusion stage must be an integer from 1 to ${stages}.`);
  const tier = mode === 'roses' ? roseFormStages.filter((first) => stage >= first).length - 1 : Math.min(5, Math.floor((stage - 1) * 6 / stages));
  const definition = [...infusionModes, ...currencyModes, ...eventModes, ...machineModes].find((entry) => entry.id === mode);
  if (!definition) throw new Error('Unknown staged creature mode.');
  const startingLevel = definition.startingLevel;
  const level = Math.round(startingLevel + (stage - 1) * ((mode === 'roses' ? 140 : 120) - startingLevel) / (stages - 1));
  const boss = stage % 5 === 0;
  const stats = mode === 'treasury' ? treasuryEnemyStats(level, boss)
    : mode === 'sanctuary' ? sanctuaryEnemyStats(level, boss) : mode === 'roses' ? roseEnemyStats(level, boss) : mode === 'machines' ? creatureEnemyStats(level, boss) : infusionEnemyStats(level, boss);
  const [name, art] = infusionEnemies[mode][tier];
  return { name: definition.name, stage, level, boss, stats, tier, forms: 6,
    enemy: { name, art, element: mode === 'machines' ? machineEnemies[tier].element : infusionEnemyElements[mode] }, color: mode === 'machines' ? '#dddddd' : mode === 'heavens' ? '#ff6565' : mode === 'abyss' ? '#f464d4' : mode === 'sanctuary' ? '#e7a7bf' : mode === 'roses' ? '#d36b7d' : '#eed78b', background: `${mode}-arena.png`,
    ability: mode === 'machines' ? machineEnemies[tier].skill : mode === 'heavens' ? 'Scarlet Judgment' : mode === 'abyss' ? 'Cosmic Wrath' : mode === 'sanctuary' ? 'Hallowed Rosefire' : mode === 'roses' ? 'Golden Thorn Benediction' : 'Sovereign Facet', abilityMultiplier: 1.2 + (stage - 1) / (stages - 1) * (mode === 'roses' ? .65 : 24 * .016) };
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
  if (isCurrencyMode(mode) || mode === 'machines') return { specialties: [], bonuses: [] };
  if (mode === 'roses') return {
    specialties: roseMaterials.flatMap((material, tier) => {
      const drop = scaledDrop(level, 80, roseMaterialUnlocks[tier], tier === 0 ? 1 : roseFinalChances[tier] / 2, roseFinalChances[tier], 3, 140);
      return drop ? [{ id: material.id, ...drop }] : [];
    }), bonuses: [],
  };
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
    if (amount === undefined && entry.chance === 1) throw new Error('Guaranteed specialty material did not drop.');
    if (amount !== undefined) drops[entry.id] = amount;
  }
  for (const entry of bonuses) {
    const amount = rollDrop(entry, random);
    if (amount !== undefined) drops[`${eligibleElements[Math.floor(lootRoll(random) * eligibleElements.length)].id}-${entry.rarity}`] = amount;
  }
  return drops;
}
