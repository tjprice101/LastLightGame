import { elements, materialRarities, type ElementId } from './activities';
import { specialtyMaterials } from './infusions';
import { roseMaterials } from './roses';

export const elementAccents: Record<ElementId, string> = {
  infernic: '#fa8d63', aquatic: '#76c8f4', tectonic: '#d4ad7c', efflorescent: '#93d7a2',
  voltaic: '#f2d873', atmospheric: '#91ddd1', luminous: '#eee2af', ominous: '#bc9bef',
  tranquilitic: '#edb3d5', chaotic: '#ed8bbe',
};

export interface DungeonArt {
  slug: string;
  enemies: readonly { name: string; art: string; ability?: string }[];
}

export const dungeonArt: Partial<Record<ElementId, DungeonArt>> = {
  ominous: {
    slug: 'valley-of-solitude',
    enemies: [
      { name: 'Duskmote', art: 'duskmote' },
      { name: 'Veilcap Imp', art: 'veilcap-imp' },
      { name: 'Gloomtail Cat', art: 'gloomtail-cat' },
      { name: 'Hollowmantle Sentinel', art: 'hollowmantle-sentinel' },
      { name: 'Umbrasilk Weaver', art: 'umbrasilk-weaver' },
      { name: 'Moonless Gargoyle', art: 'moonless-gargoyle' },
      { name: 'Eclipse Antler Regent', art: 'eclipse-antler-regent' },
      { name: 'Monarch of the Silent Eclipse', art: 'monarch-of-the-silent-eclipse' },
    ],
  },
  atmospheric: {
    slug: 'sky-bound-rift',
    enemies: [
      { name: 'Puffling', art: 'puffling' },
      { name: 'Reedcap Sylph', art: 'reedcap-sylph' },
      { name: 'Gustfeather Harpy', art: 'gustfeather-harpy' },
      { name: 'Cloudhorn Ibex', art: 'cloudhorn-ibex' },
      { name: 'Zephyrcoil Drake', art: 'zephyrcoil-drake' },
      { name: 'Cyclonewing Griffin', art: 'cyclonewing-griffin' },
      { name: 'Crownwind Roc', art: 'crownwind-roc' },
      { name: 'Regent of the Unbroken Sky', art: 'regent-of-the-unbroken-sky' },
    ],
  },
  chaotic: {
    slug: 'ruins-of-chaos',
    enemies: [
      { name: 'Riftpip', art: 'riftpip' },
      { name: 'Shardcap Gremlin', art: 'shardcap-gremlin' },
      { name: 'Nullshell Scarab', art: 'nullshell-scarab' },
      { name: 'Paradox Sentinel', art: 'paradox-sentinel' },
      { name: 'Fracturecoil Drake', art: 'fracturecoil-drake' },
      { name: 'Riftwing Chimera', art: 'riftwing-chimera' },
      { name: 'Crownvoid Behemoth', art: 'crownvoid-behemoth' },
      { name: 'Sovereign of the Impossible Ruin', art: 'sovereign-of-the-impossible-ruin' },
    ],
  },
  tectonic: {
    slug: 'precipice-of-the-earth',
    enemies: [
      { name: 'Pebblekin', art: 'pebblekin' },
      { name: 'Claycap Kobold', art: 'claycap-kobold' },
      { name: 'Flintback Armadillo', art: 'flintback-armadillo' },
      { name: 'Quartzhorn Ram', art: 'quartzhorn-ram' },
      { name: 'Geode Cyclops', art: 'geode-cyclops' },
      { name: 'Pillarwing Gargoyle', art: 'pillarwing-gargoyle' },
      { name: 'Crownfault Behemoth', art: 'crownfault-behemoth' },
      { name: 'Atlas of the Crystal Summit', art: 'atlas-of-the-crystal-summit' },
    ],
  },
  luminous: {
    slug: 'lustrous-river',
    enemies: [
      { name: 'Glimmerkin', art: 'glimmerkin' },
      { name: 'Lanterncap Brownie', art: 'lanterncap-brownie' },
      { name: 'Prismback Tortoise', art: 'prismback-tortoise' },
      { name: 'Dawncrest Guardian', art: 'dawncrest-guardian' },
      { name: 'Opalwing Griffin', art: 'opalwing-griffin' },
      { name: 'Sunmirror Oracle', art: 'sunmirror-oracle' },
      { name: 'Crownray Kirin', art: 'crownray-kirin' },
      { name: 'Sovereign of the Sevenfold Dawn', art: 'sovereign-of-the-sevenfold-dawn' },
    ],
  },
  voltaic: {
    slug: 'galvanic-field',
    enemies: [
      { name: 'Sparkpip', art: 'sparkpip', ability: 'Twig Spark' },
      { name: 'Coppercap Gremlin', art: 'coppercap-gremlin', ability: 'Copper Chime Surge' },
      { name: 'Coilback Scarab', art: 'coilback-scarab', ability: 'Coil Discharge' },
      { name: 'Stormhorn Faun', art: 'stormhorn-faun', ability: 'Stormhorn Arc' },
      { name: 'Thunderclaw Raiju', art: 'thunderclaw-raiju', ability: 'Thunderclaw Rend' },
      { name: 'Tempestwing Roc', art: 'tempestwing-roc', ability: 'Tempest Wingstrike' },
      { name: 'Crowncoil Kirin', art: 'crowncoil-kirin', ability: 'Crowncoil Judgment' },
      { name: 'Sovereign of the Living Storm', art: 'sovereign-of-the-living-storm', ability: 'Living Storm' },
    ],
  },
  tranquilitic: {
    slug: 'city-of-heaven',
    enemies: [
      { name: 'Hushbud', art: 'hushbud', ability: 'Quiet Chime' },
      { name: 'Bellcap Keeper', art: 'bellcap-keeper', ability: 'Bellward Resonance' },
      { name: 'Lotusback Tortoise', art: 'lotusback-tortoise', ability: 'Lotus Shell Crush' },
      { name: 'Porcelain Crane', art: 'porcelain-crane', ability: 'Porcelain Wingstorm' },
      { name: 'Concord Lion', art: 'concord-lion', ability: 'Concord Fang' },
      { name: 'Stillbell Oracle', art: 'stillbell-oracle', ability: 'Stillbell Mandala' },
      { name: 'Harmonywing Kirin', art: 'harmonywing-kirin', ability: 'Harmony Hornfall' },
      { name: 'Sovereign of the Unbroken Accord', art: 'sovereign-of-the-unbroken-accord', ability: 'Unbroken Accord' },
    ],
  },
  efflorescent: {
    slug: 'garden-of-beauty',
    enemies: [
      { name: 'Budling', art: 'budling' }, { name: 'Mosscap Brownie', art: 'mosscap-brownie' },
      { name: 'Thornshell Beetle', art: 'thornshell-beetle' }, { name: 'Petalhorn Satyr', art: 'petalhorn-satyr' },
      { name: 'Orchid Mantis', art: 'orchid-mantis' }, { name: 'Moonbloom Dryad', art: 'moonbloom-dryad' },
      { name: 'Verdant Antler Regent', art: 'verdant-antler-regent' },
      { name: 'Empress of the Thousand Blooms', art: 'empress-of-the-thousand-blooms' },
    ],
  },
  infernic: {
    slug: 'flaming-depths',
    enemies: [
      { name: 'Ashling', art: 'ashling' }, { name: 'Coalcap Kobold', art: 'coalcap-kobold' },
      { name: 'Emberhorn Faun', art: 'emberhorn-faun' }, { name: 'Furnace Salamander', art: 'furnace-salamander' },
      { name: 'Cinderhide Cyclops', art: 'cinderhide-cyclops' }, { name: 'Obsidian Gargoyle', art: 'obsidian-gargoyle' },
      { name: 'Brasshorn Minotaur', art: 'brasshorn-minotaur' }, { name: 'Pyrewing Harpy', art: 'pyrewing-harpy' },
      { name: 'Magma Wyrm Knight', art: 'magma-wyrm-knight' }, { name: 'Ifrit of the Last Furnace', art: 'last-furnace-ifrit' },
    ],
  },
  aquatic: {
    slug: 'oceanic-valley',
    enemies: [
      { name: 'Pebblefin Sprig', art: 'pebblefin-sprig' }, { name: 'Shellcap Kappa', art: 'shellcap-kappa' },
      { name: 'Brineclaw Sentinel', art: 'brineclaw-sentinel' }, { name: 'Coralcrest Nereid', art: 'coralcrest-nereid' },
      { name: 'Glasswake Kelpie', art: 'glasswake-kelpie' }, { name: 'Abyssbell Oracle', art: 'abyssbell-oracle' },
      { name: 'Pearlscale Leviathan', art: 'pearlscale-leviathan' },
      { name: 'Sovereign of the Endless Tide', art: 'sovereign-of-the-endless-tide' },
    ],
  },
};

export const materialArtNames = ['Seed', 'Bloom', 'Shard', 'Crest', 'Heart', 'Soul'] as const;

export function materialArt(id: string): string | undefined {
  materialName(id);
  if (roseMaterials.some((material) => material.id === id)) return id;
  const specialty = specialtyMaterials.find((entry) => entry.id === id);
  if (specialty) return specialty.art;
  const [elementId, rarity] = id.split('-');
  const element = elements.find((entry) => entry.id === elementId);
  const index = materialRarities.findIndex((entry) => entry.toLowerCase() === rarity);
  return element && dungeonArt[element.id] ? `${element.id}-${materialArtNames[index].toLowerCase()}` : undefined;
}

export function materialName(id: string): string {
  const rose = roseMaterials.find((material) => material.id === id);
  if (rose) return rose.name;
  const specialty = specialtyMaterials.find((entry) => entry.id === id);
  if (specialty) return specialty.name;
  const [elementId, rarity] = id.split('-');
  const element = elements.find((entry) => entry.id === elementId);
  const index = materialRarities.findIndex((entry) => entry.toLowerCase() === rarity);
  if (!element || index < 0 || id !== `${elementId}-${rarity}`) throw new Error(`Unknown material: ${id}.`);
  return `${materialArtNames[index]} of ${element.name}`;
}
