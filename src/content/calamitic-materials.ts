import type { Rarity } from './rarity';

const materialCatalog = [
  { id: 'calamity-common', name: 'Seed of Calamity', rarity: 'Common' },
  { id: 'calamity-uncommon', name: 'Bud of Calamity', rarity: 'Uncommon' },
  { id: 'calamity-rare', name: 'Bloom of Calamity', rarity: 'Rare' },
  { id: 'calamity-epic', name: 'Crest of Calamity', rarity: 'Epic' },
  { id: 'calamity-legendary', name: 'Heart of Calamity', rarity: 'Legendary' },
  { id: 'calamity-omnic', name: 'Soul of Calamity', rarity: 'Omnic' },
  { id: 'fragment-of-rise', name: 'Fragment of Rise', rarity: 'Calamitic' },
  { id: 'feather-severed-dawn', name: 'Feather of the Severed Dawn', rarity: 'Calamitic', source: 'Soar to Heaven Calamity chests' },
  { id: 'splinter-unmade-night', name: 'Splinter of the Unmade Night', rarity: 'Calamitic', source: 'Delve into the Abyss Calamity chests' },
  { id: 'shard-of-calamity', name: 'Shard of Calamity', rarity: 'Calamitic' },
] as const satisfies readonly { id: string; name: string; rarity: Rarity; source?: string }[];

export const calamiticMaterials = materialCatalog as readonly (typeof materialCatalog[number] & { source?: string })[];

export type CalamiticMaterialId = (typeof calamiticMaterials)[number]['id'];
export function isCalamiticMaterialId(id: string): id is CalamiticMaterialId {
  return calamiticMaterials.some((material) => material.id === id);
}
export function getCalamiticMaterial(id: string) {
  const material = calamiticMaterials.find((entry) => entry.id === id);
  if (!material) throw new Error(`Unknown Calamitic material: ${id}.`);
  return material;
}
