import { materialRarities, type ElementId } from './activities';
import { conduits, type ConduitId } from './conduits';
import type { Stats } from './combat';
import type { EnemySkill } from './enemy-skills';
import { enemyCombatStats } from './stat-growth';
import { roseMaterials } from './roses';
import { enemyCaptureAllowed, isInfusionMode } from './infusions';

export type CalamityActivityId = ElementId | 'treasury' | 'sanctuary' | 'heavens' | 'abyss' | 'machines' | 'roses';
export type CalamityTier = 1 | 2 | 3;
export const calamityTierScaling = {
  1: { level: 145, statMultiplier: 1.03 },
  2: { level: 160, statMultiplier: .98 },
  3: { level: 170, statMultiplier: 1 },
} as const satisfies Record<CalamityTier, { level: number; statMultiplier: number }>;
export const calamityActivities = [
  { id: 'treasury', name: 'Crownfall Treasury', boss: 'Crown of the Ruined Vault', element: 'tranquilitic' },
  { id: 'sanctuary', name: 'Rosethorn Sanctuary', boss: 'White Pyre Hierophant', element: 'tranquilitic' },
  { id: 'heavens', name: 'Soar to Heaven', boss: 'Heavenfall Seraph', element: 'tranquilitic' },
  { id: 'abyss', name: 'Delve into the Abyss', boss: 'Abyssal Nullmaw', element: 'chaotic' },
  { id: 'machines', name: 'Awaken the Machines', boss: 'Catastrophe Prime', element: 'chaotic' },
  { id: 'roses', name: 'Passion of Crimson Roses', boss: 'The Last Scarlet Bloom', element: 'tranquilitic' },
  { id: 'infernic', name: 'Flaming Depths', boss: 'Ashcrown Cataclysm', element: 'infernic' },
  { id: 'oceanic', name: 'Oceanic Valley', boss: 'Leviathan of the White Wake', element: 'oceanic' },
  { id: 'atmospheric', name: 'Sky-bound Rift', boss: 'Riftstorm Harbinger', element: 'atmospheric' },
  { id: 'botanic', name: 'Garden of Beauty', boss: 'Pallid Root Sovereign', element: 'botanic' },
  { id: 'tranquilitic', name: 'City of Heaven', boss: 'Silent Meridian', element: 'tranquilitic' },
  { id: 'chaotic', name: 'Ruins of Chaos', boss: 'The Scarlet Unmaking', element: 'chaotic' },
] as const satisfies readonly { id: CalamityActivityId; name: string; boss: string; element: ElementId }[];

export function isCalamityActivityId(value: unknown): value is CalamityActivityId {
  return calamityActivities.some(activity => activity.id === value);
}
export function isCalamityTier(value: unknown): value is CalamityTier { return value === 1 || value === 2 || value === 3; }
export function calamityActivity(id: CalamityActivityId) {
  const activity = calamityActivities.find(entry => entry.id === id);
  if (!activity) throw new Error('Unknown Calamity activity.');
  return activity;
}
export function calamityChestId(activity: CalamityActivityId, tier: CalamityTier): string {
  calamityActivity(activity);
  if (!isCalamityTier(tier)) throw new Error('Invalid Calamity tier.');
  return `calamity:${activity}:${tier}`;
}
export function parseCalamityChestId(id: string): { activity: CalamityActivityId; tier: CalamityTier } {
  const match = /^calamity:([a-z]+):([123])$/.exec(id);
  const tier = match ? Number(match[2]) : 0;
  if (!match || !isCalamityActivityId(match[1]) || !isCalamityTier(tier)) throw new Error('Invalid Calamity chest identity.');
  return { activity: match[1], tier };
}
export function calamityChest(activity: CalamityActivityId, tier: CalamityTier) {
  const id = calamityChestId(activity, tier);
  const title = ['Slayer', 'Master', 'Omnipotent'][tier - 1];
  return { id, name: `${calamityActivity(activity).name} EX+${title} Chest`,
    fractalis: [100_000, 250_000, 500_000][tier - 1], lycalis: [50, 70, 100][tier - 1],
    calamiticTokens: [1, 3, 8][tier - 1], bundles: [3, 5, 7][tier - 1], masterChests: activity === 'machines' && tier === 3 ? 2 : 0,
    devourerCopies: isInfusionMode(activity) && enemyCaptureAllowed(activity, 120)
      ? { creatureId: `infusion:${activity}:5`, amount: tier } : null,
    componentRange: activity === 'machines' ? { min: [3_000, 5_000, 10_000][tier - 1], max: [6_000, 8_000, 12_000][tier - 1] } : null };
}

export interface CalamityLootRow {
  label: string;
  weight: number;
  min: number;
  max: number;
  kind: 'fractalis' | 'lycalis' | 'material' | 'conduit' | 'components';
  id?: string;
}
function materialRows(ids: readonly { id: string; name: string }[]): CalamityLootRow[] {
  return ids.map((material, index) => ({ label: material.name, id: material.id, kind: 'material',
    weight: [10, 15, 25, 25, 15, 10][index], min: [30, 20, 15, 10, 6, 3][index], max: [60, 40, 30, 20, 12, 6][index] }));
}
export function calamityLootTable(activity: CalamityActivityId): CalamityLootRow[] {
  calamityActivity(activity);
  if (activity === 'treasury') return [
    { label: 'Prismatica cache', kind: 'fractalis', weight: 70, min: 25_000, max: 50_000 },
    { label: 'Prismatica vault', kind: 'fractalis', weight: 25, min: 75_000, max: 100_000 },
    { label: 'Prismatica crown reserve', kind: 'fractalis', weight: 5, min: 200_000, max: 250_000 },
  ];
  if (activity === 'sanctuary') return [
    { label: 'Null-Prismatica cache', kind: 'lycalis', weight: 70, min: 5, max: 10 },
    { label: 'Null-Prismatica reliquary', kind: 'lycalis', weight: 25, min: 15, max: 25 },
    { label: 'Null-Prismatica pyre reserve', kind: 'lycalis', weight: 5, min: 40, max: 50 },
  ];
  if (activity === 'machines') return [
    { label: 'Broken Mechanical Components', kind: 'components', weight: 60, min: 100, max: 200 },
    ...(['Rare', 'Legendary', 'Omnic'] as const).flatMap((rarity, index) => {
      const pool = conduits.filter(conduit => conduit.rarity === rarity);
      return pool.map(conduit => ({ label: conduit.name, kind: 'conduit' as const, id: conduit.id,
        weight: [20, 15, 5][index] / pool.length, min: 1, max: 1 }));
    }),
  ];
  if (activity === 'roses') return materialRows(roseMaterials);
  if (activity === 'heavens' || activity === 'abyss') {
    return [
      { label: activity === 'heavens' ? 'Crown of the Scarlet Oath' : 'Heart of the Shattered Void',
        id: `${activity}-evolution`, kind: 'material', weight: 50, min: 5, max: 10 },
      { label: activity === 'heavens' ? 'Chalice of the Undying Dawn' : 'Hourglass of Endless Wrath',
        id: `${activity}-level`, kind: 'material', weight: 50, min: 10, max: 20 },
    ];
  }
  return materialRows(materialRarities.map(rarity => ({
    id: `${activity}-${rarity.toLowerCase()}`, name: `${calamityActivity(activity).name} ${rarity} Material`,
  })));
}
export interface CalamityOpening {
  id: string;
  name: string;
  fractalis: number;
  lycalis: number;
  materials: Record<string, number>;
  conduits: Partial<Record<ConduitId, number>>;
  mechanicalComponents: number;
  calamiticTokens: number;
  masterChests: number;
  roseliusCopies?: number;
  devourerCopies?: { creatureId: string; amount: number } | null;
}
export function rollCalamityChest(activity: CalamityActivityId, tier: CalamityTier, roll: () => number,
  owned: Readonly<Partial<Record<ConduitId, number>>> = {}): CalamityOpening {
  const chest = calamityChest(activity, tier);
  const reward: CalamityOpening = { id: chest.id, name: chest.name, fractalis: chest.fractalis,
    lycalis: chest.lycalis, calamiticTokens: chest.calamiticTokens, masterChests: chest.masterChests,
    materials: {}, conduits: {}, mechanicalComponents: 0, devourerCopies: chest.devourerCopies };
  const table = calamityLootTable(activity);
  const random = () => {
    const value = roll();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('Calamity loot roll must be in [0, 1).');
    return value;
  };
  const totalWeight = table.reduce((sum, row) => sum + row.weight, 0);
  const components = (value: number): number => {
    if (!chest.componentRange) throw new Error('Calamity component range is missing.');
    return chest.componentRange.min + Math.floor(value * (chest.componentRange.max - chest.componentRange.min + 1));
  };
  if (chest.componentRange) reward.mechanicalComponents = components(random());
  for (let bundle = 0; bundle < chest.bundles; bundle++) {
    let pick = random() * totalWeight;
    const row = table.find(entry => { pick -= entry.weight; return pick < 0; }) ?? table[table.length - 1];
    const quantityRoll = random();
    const amount = row.min + Math.floor(quantityRoll * (row.max - row.min + 1));
    if (row.kind === 'fractalis' || row.kind === 'lycalis') reward[row.kind] += amount;
    else if (row.kind === 'components') reward.mechanicalComponents += amount;
    else if (row.kind === 'material' && row.id) reward.materials[row.id] = (reward.materials[row.id] ?? 0) + amount;
    else if (row.kind === 'conduit' && row.id) {
      const selected = conduits.find(conduit => conduit.id === row.id);
      if (!selected) throw new Error('Unknown Calamity Conduit reward.');
      const pool = conduits.filter(conduit => conduit.rarity === selected.rarity
        && (owned[conduit.id] ?? 0) === 0 && (reward.conduits[conduit.id] ?? 0) === 0);
      if (pool.length) reward.conduits[pool[Math.floor(quantityRoll * pool.length)].id] = 1;
      else reward.mechanicalComponents += components(quantityRoll);
    } else throw new Error('Malformed Calamity loot row.');
  }
  return reward;
}

interface CalamityPattern {
  strike: string;
  every: number;
  multiplier: number;
  ruin: string;
  ruinEvery: number;
  ruinMultiplier: number;
  description: string;
  shieldEvery?: number;
  shieldFraction?: number;
  healEvery?: number;
  healFraction?: number;
  hits?: number;
  targeting?: 'lowest' | 'highest';
}
export const calamityPatterns: Record<CalamityActivityId, CalamityPattern> = {
  treasury: { strike: 'Vaultbreaker', every: 3, multiplier: 1.5, ruin: 'Crown Collapse', ruinEvery: 6, ruinMultiplier: 2.4,
    description: 'Uses Vaultbreaker every 3 enemy turns. Crown Collapse replaces it every 6 turns.' },
  sanctuary: { strike: 'White Pyre', every: 2, multiplier: 1.3, ruin: 'Reliquary Descent', ruinEvery: 5, ruinMultiplier: 1.9,
    shieldEvery: 3, shieldFraction: .025, description: 'Uses White Pyre every 2 enemy turns and Reliquary Descent every 5. Before attacking every 3 turns, refreshes a shield worth 2.5% of its max HP.' },
  heavens: { strike: 'Scarlet Volley', every: 2, multiplier: 1.25, ruin: 'Heavenfall', ruinEvery: 7, ruinMultiplier: 2.2,
    hits: 3, description: 'Each attack hits one target 3 times, splitting its damage across the hits. Uses Scarlet Volley every 2 enemy turns and Heavenfall every 7.' },
  abyss: { strike: 'Nullmaw Hunt', every: 3, multiplier: 1.4, ruin: 'Starless Pursuit', ruinEvery: 5, ruinMultiplier: 2,
    targeting: 'lowest', description: 'Targets the ally with the lowest percentage of HP remaining, unless taunted. Uses Nullmaw Hunt every 3 enemy turns and Starless Pursuit every 5.' },
  machines: { strike: 'Prototype Discharge', every: 4, multiplier: 2, ruin: 'Catastrophe Cascade', ruinEvery: 8, ruinMultiplier: 2.7,
    description: 'Uses Prototype Discharge every 4 enemy turns. Catastrophe Cascade replaces it every 8. Uses Normal Attacks between skills.' },
  roses: { strike: 'Thorn Requiem', every: 2, multiplier: 1.4, ruin: 'Final Scarlet Bloom', ruinEvery: 6, ruinMultiplier: 2.1,
    healEvery: 4, healFraction: .015, description: 'Uses Thorn Requiem every 2 enemy turns and Final Scarlet Bloom every 6. Heals 1.5% of its max HP before attacking every 4 turns.' },
  infernic: { strike: 'Cinder Torrent', every: 2, multiplier: 1.6, ruin: 'Ashcrown Eruption', ruinEvery: 5, ruinMultiplier: 2.3,
    description: 'Uses Cinder Torrent every 2 enemy turns and Ashcrown Eruption every 5.' },
  oceanic: { strike: 'White Wake', every: 3, multiplier: 1.55, ruin: 'Leviathan Breach', ruinEvery: 6, ruinMultiplier: 2.2,
    shieldEvery: 4, shieldFraction: .04, description: 'Uses White Wake every 3 enemy turns and Leviathan Breach every 6. Before attacking every 4 turns, refreshes a shield worth 4% of its max HP.' },
  atmospheric: { strike: 'Riftstorm Talons', every: 3, multiplier: 1.7, ruin: 'Sky Fracture', ruinEvery: 7, ruinMultiplier: 2.3,
    hits: 4, description: 'Each attack hits one target 4 times, splitting its damage across the hits. Uses Riftstorm Talons every 3 enemy turns and Sky Fracture every 7.' },
  botanic: { strike: 'Pallid Thorns', every: 3, multiplier: 1.3, ruin: 'Root Cathedral', ruinEvery: 8, ruinMultiplier: 2.1,
    healEvery: 3, healFraction: .025, description: 'Uses Pallid Thorns every 3 enemy turns and Root Cathedral every 8. Heals 2.5% of its max HP before attacking every 3 turns.' },
  tranquilitic: { strike: 'Meridian Sweep', every: 4, multiplier: 1.6, ruin: 'Silent Convergence', ruinEvery: 7, ruinMultiplier: 2.2,
    shieldEvery: 2, shieldFraction: .02, description: 'Before attacking every 2 enemy turns, refreshes a shield worth 2% of its max HP. Uses Meridian Sweep every 4 turns and Silent Convergence every 7.' },
  chaotic: { strike: 'Fractal Disjunction', every: 2, multiplier: 1.35, ruin: 'Scarlet Unmaking', ruinEvery: 5, ruinMultiplier: 2.1,
    targeting: 'highest', description: 'Targets the ally with the highest percentage of HP remaining, unless taunted. Uses Fractal Disjunction every 2 enemy turns and Scarlet Unmaking every 5.' },
};
export function calamityEncounter(activity: CalamityActivityId, tier: CalamityTier) {
  const definition = calamityActivity(activity);
  if (!isCalamityTier(tier)) throw new Error('Invalid Calamity tier.');
  const { level, statMultiplier } = calamityTierScaling[tier];
  const stats: Stats = enemyCombatStats(level, true);
  for (const stat of ['health', 'damage', 'defense'] as const)
    stats[stat] = Math.round(stats[stat] * statMultiplier);
  const pattern = calamityPatterns[activity];
  const skills: EnemySkill[] = [
    { name: pattern.strike, multiplier: pattern.multiplier, every: pattern.every, action: 'skill1' },
    { name: pattern.ruin, multiplier: pattern.ruinMultiplier, every: pattern.ruinEvery, action: 'ultimate' },
  ];
  return { name: definition.boss, level, element: definition.element, stats, skills, description: pattern.description };
}
export function calamityWarning(activity: CalamityActivityId, tier: CalamityTier): string {
  const encounter = calamityEncounter(activity, tier);
  return `${encounter.name} - Calamity EX+${tier}, Lv.${encounter.level}. Victory earns one ${calamityChest(activity, tier).name}. No other drops or captures. Entry is free, and losing costs nothing. ${encounter.description}`;
}
