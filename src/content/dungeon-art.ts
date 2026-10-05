import { elements, materialRarities, type ElementId } from './activities';
import { specialtyMaterials } from './infusions';

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
  const specialty = specialtyMaterials.find((entry) => entry.id === id);
  if (specialty) return specialty.art;
  const [elementId, rarity] = id.split('-');
  const element = elements.find((entry) => entry.id === elementId);
  const index = materialRarities.findIndex((entry) => entry.toLowerCase() === rarity);
  return element && dungeonArt[element.id] ? `${element.id}-${materialArtNames[index].toLowerCase()}` : undefined;
}

export function materialName(id: string): string {
  const specialty = specialtyMaterials.find((entry) => entry.id === id);
  if (specialty) return specialty.name;
  const [elementId, rarity] = id.split('-');
  const element = elements.find((entry) => entry.id === elementId);
  const index = materialRarities.findIndex((entry) => entry.toLowerCase() === rarity);
  if (!element || index < 0 || id !== `${elementId}-${rarity}`) throw new Error(`Unknown material: ${id}.`);
  return `${materialArtNames[index]} of ${element.name}`;
}
