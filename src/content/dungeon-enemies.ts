import { type ElementId } from './activities';
import { dungeonArt } from './dungeon-art';

export interface DungeonEnemy { name: string; art?: string; ability?: string }

function supplied(element: ElementId): readonly DungeonEnemy[] {
  const pack = dungeonArt[element];
  if (!pack) throw new Error(`Expected supplied dungeon art: ${element}.`);
  return pack.enemies;
}

function pending(names: readonly string[]): readonly DungeonEnemy[] {
  return names.map((name) => ({ name }));
}

export const dungeonEnemies: Record<ElementId, readonly DungeonEnemy[]> = {
  infernic: supplied('infernic'),
  aquatic: supplied('aquatic'),
  efflorescent: supplied('efflorescent'),
  tectonic: pending(['Pebblekin', 'Claycap Kobold', 'Flintback Armadillo', 'Quartzhorn Ram',
    'Geode Cyclops', 'Pillarwing Gargoyle', 'Crownfault Behemoth', 'Atlas of the Crystal Summit']),
  voltaic: supplied('voltaic'),
  atmospheric: pending(['Puffling', 'Reedcap Sylph', 'Gustfeather Harpy', 'Cloudhorn Ibex',
    'Zephyrcoil Drake', 'Cyclonewing Griffin', 'Crownwind Roc', 'Regent of the Unbroken Sky']),
  luminous: pending(['Glimmerkin', 'Lanterncap Brownie', 'Prismback Tortoise', 'Dawncrest Guardian',
    'Opalwing Griffin', 'Sunmirror Oracle', 'Crownray Kirin', 'Sovereign of the Sevenfold Dawn']),
  ominous: pending(['Duskmote', 'Veilcap Imp', 'Gloomtail Cat', 'Hollowmantle Sentinel',
    'Umbrasilk Weaver', 'Moonless Gargoyle', 'Eclipse Antler Regent', 'Monarch of the Silent Eclipse']),
  tranquilitic: supplied('tranquilitic'),
  chaotic: pending(['Riftpip', 'Shardcap Gremlin', 'Nullshell Scarab', 'Paradox Sentinel',
    'Fracturecoil Drake', 'Riftwing Chimera', 'Crownvoid Behemoth', 'Sovereign of the Impossible Ruin']),
};

export const dungeonStrikes: Record<ElementId, string> = {
  infernic: 'Furnace Strike', aquatic: 'Tidal Strike', efflorescent: 'Thorn Strike',
  tectonic: 'Faultline Strike', voltaic: 'Thunder Strike', atmospheric: 'Gale Strike',
  luminous: 'Radiant Strike', ominous: 'Umbral Strike', tranquilitic: 'Concord Strike',
  chaotic: 'Rift Strike',
};
