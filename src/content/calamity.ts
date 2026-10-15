import { elements, materialRarities, type ElementId } from './activities';
import { conduits, type ConduitId } from './conduits';
import type { Stats } from './combat';
import type { EnemySkill } from './enemy-skills';
import { enemyCombatStats } from './stat-growth';
import { roseMaterials } from './roses';

export type CalamityActivityId = ElementId | 'treasury' | 'sanctuary' | 'heavens' | 'abyss' | 'machines' | 'roses';
export type CalamityTier = 1 | 2 | 3;
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
    bundles: [3, 5, 7][tier - 1], masterChests: tier === 3 ? 2 : 0 };
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
    const pool = elements.filter(element => element.infusion === activity);
    return [
      { label: activity === 'heavens' ? 'Crown of the Scarlet Oath' : 'Heart of the Shattered Void',
        id: `${activity}-evolution`, kind: 'material', weight: 35, min: 5, max: 10 },
      { label: activity === 'heavens' ? 'Chalice of the Undying Dawn' : 'Hourglass of Endless Wrath',
        id: `${activity}-level`, kind: 'material', weight: 35, min: 10, max: 20 },
      ...pool.flatMap(element => (['Epic', 'Legendary', 'Omnic'] as const).map((rarity, index) => ({
        label: `${element.name} ${rarity} Material`, id: `${element.id}-${rarity.toLowerCase()}`,
        kind: 'material' as const, weight: [15, 10, 5][index] / pool.length,
        min: [10, 6, 3][index], max: [20, 12, 6][index],
      }))),
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
  masterChests: number;
}
export function rollCalamityChest(activity: CalamityActivityId, tier: CalamityTier, roll: () => number): CalamityOpening {
  const chest = calamityChest(activity, tier);
  const reward: CalamityOpening = { id: chest.id, name: chest.name, fractalis: chest.fractalis,
    lycalis: chest.lycalis, masterChests: chest.masterChests, materials: {}, conduits: {}, mechanicalComponents: 0 };
  const table = calamityLootTable(activity);
  const random = () => {
    const value = roll();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('Calamity loot roll must be in [0, 1).');
    return value;
  };
  const totalWeight = table.reduce((sum, row) => sum + row.weight, 0);
  for (let bundle = 0; bundle < chest.bundles; bundle++) {
    let pick = random() * totalWeight;
    const row = table.find(entry => { pick -= entry.weight; return pick < 0; }) ?? table[table.length - 1];
    const amount = row.min + Math.floor(random() * (row.max - row.min + 1));
    if (row.kind === 'fractalis' || row.kind === 'lycalis') reward[row.kind] += amount;
    else if (row.kind === 'components') reward.mechanicalComponents += amount;
    else if (row.kind === 'material' && row.id) reward.materials[row.id] = (reward.materials[row.id] ?? 0) + amount;
    else if (row.kind === 'conduit' && row.id) {
      const id = conduits.find(conduit => conduit.id === row.id)?.id;
      if (!id) throw new Error('Unknown Calamity Conduit reward.');
      reward.conduits[id] = (reward.conduits[id] ?? 0) + amount;
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
    description: 'Vaultbreaker every 3 phases; Crown Collapse replaces it every 6. Defend before phase 6 and burst between collapses.' },
  sanctuary: { strike: 'White Pyre', every: 2, multiplier: 1.3, ruin: 'Reliquary Descent', ruinEvery: 5, ruinMultiplier: 1.9,
    shieldEvery: 3, shieldFraction: .025, description: 'White Pyre every 2 phases, Descent every 5. Refreshes a 2.5% max-HP barrier every 3 phases before attacking; break it with focused damage.' },
  heavens: { strike: 'Scarlet Volley', every: 2, multiplier: 1.25, ruin: 'Heavenfall', ruinEvery: 7, ruinMultiplier: 2.2,
    hits: 3, description: 'Every attack splits its total into 3 impacts on one target. Volley every 2 phases; Heavenfall every 7. Layer shields before volleys.' },
  abyss: { strike: 'Nullmaw Hunt', every: 3, multiplier: 1.4, ruin: 'Starless Pursuit', ruinEvery: 5, ruinMultiplier: 2,
    targeting: 'lowest', description: 'Always targets the lowest current HP fraction (taunt can redirect). Hunt every 3 phases, Pursuit every 5. Protect and heal the weakest member.' },
  machines: { strike: 'Prototype Discharge', every: 4, multiplier: 2, ruin: 'Catastrophe Cascade', ruinEvery: 8, ruinMultiplier: 2.7,
    description: 'Normal attacks while charging. Discharge every 4 phases, Cascade every 8. Spend the charge window building shields and saving Defense.' },
  roses: { strike: 'Thorn Requiem', every: 2, multiplier: 1.4, ruin: 'Final Scarlet Bloom', ruinEvery: 6, ruinMultiplier: 2.1,
    healEvery: 4, healFraction: .015, description: 'Requiem every 2 phases, Final Bloom every 6. Restores 1.5% max HP every 4 phases before attacking; maintain damage through restoration windows.' },
  infernic: { strike: 'Cinder Torrent', every: 2, multiplier: 1.6, ruin: 'Ashcrown Eruption', ruinEvery: 5, ruinMultiplier: 2.3,
    description: 'Torrent every 2 phases and Eruption every 5 create sustained direct pressure. Weaken and regular healing are more reliable than waiting for a single burst.' },
  oceanic: { strike: 'White Wake', every: 3, multiplier: 1.55, ruin: 'Leviathan Breach', ruinEvery: 6, ruinMultiplier: 2.2,
    shieldEvery: 4, shieldFraction: .04, description: 'Wake every 3 phases, Breach every 6. Refreshes a 4% max-HP barrier every 4 phases. Save damage for barrier breaks.' },
  atmospheric: { strike: 'Riftstorm Talons', every: 3, multiplier: 1.7, ruin: 'Sky Fracture', ruinEvery: 7, ruinMultiplier: 2.3,
    hits: 4, description: 'Every attack splits its total into 4 impacts on one target. Talons every 3 phases, Sky Fracture every 7. Plan mitigation before the announced storm cadence.' },
  botanic: { strike: 'Pallid Thorns', every: 3, multiplier: 1.3, ruin: 'Root Cathedral', ruinEvery: 8, ruinMultiplier: 2.1,
    healEvery: 3, healFraction: .025, description: 'Thorns every 3 phases, Cathedral every 8. Restores 2.5% max HP every 3 phases; sustained damage must exceed restoration.' },
  tranquilitic: { strike: 'Meridian Sweep', every: 4, multiplier: 1.6, ruin: 'Silent Convergence', ruinEvery: 7, ruinMultiplier: 2.2,
    shieldEvery: 2, shieldFraction: .02, description: 'Refreshes a 2% max-HP barrier on even phases. Sweep every 4 phases, Convergence every 7. Burst during odd-phase openings.' },
  chaotic: { strike: 'Fractal Disjunction', every: 2, multiplier: 1.35, ruin: 'Scarlet Unmaking', ruinEvery: 5, ruinMultiplier: 2.1,
    targeting: 'highest', description: 'Always targets the highest current HP fraction (taunt can redirect). Disjunction every 2 phases, Unmaking every 5. Spread mitigation instead of relying on one wounded tank.' },
};
export function calamityEncounter(activity: CalamityActivityId, tier: CalamityTier) {
  const definition = calamityActivity(activity);
  if (!isCalamityTier(tier)) throw new Error('Invalid Calamity tier.');
  const level = [145, 160, 185][tier - 1];
  const stats: Stats = enemyCombatStats(level, true);
  const pattern = calamityPatterns[activity];
  const skills: EnemySkill[] = [
    { name: pattern.strike, multiplier: pattern.multiplier, every: pattern.every, action: 'skill1' },
    { name: pattern.ruin, multiplier: pattern.ruinMultiplier, every: pattern.ruinEvery, action: 'ultimate' },
  ];
  return { name: definition.boss, level, element: definition.element, stats, skills, description: pattern.description };
}
export const calamityBuildGuidance = 'Exponential enemy growth creates intentional difficulty walls. Build target: a complementary squad with eight +5 Conduits per member, including four matching-element Omnic Conduits, and a suitable Master. Any legal squad may attempt it; full equipment is not a guaranteed victory.';

export function calamityWarning(activity: CalamityActivityId, tier: CalamityTier): string {
  const encounter = calamityEncounter(activity, tier);
  return `Calamity EX+${tier} - Level ${encounter.level} boss. ${calamityBuildGuidance} One boss. Victory awards one ${calamityChest(activity, tier).name}; no ordinary drops or captures. Free entry; no defeat penalty. ${encounter.description}`;
}
