import { type BattleState, type Combatant } from '../game/battle';
import { characterLevelCap } from '../content/progression';
import { isStarterId } from '../content/starters';
import { enemies } from '../content/combat';
import { getCreature } from '../content/creatures';

const characterScales = [1, 1.08, 1.16, 1.3, 1.5, 1.65] as const;

const artworkSizes: readonly (readonly [number, readonly string[]])[] = [
  [.65, [
    'ashling', 'budling', 'duskmote', 'gleamstone-slime', 'hushbud', 'imp',
    'pebblefin-sprig', 'puffling', 'riftpip', 'rosethorn-wisp', 'sparkpip',
    'story-infernic-0', 'story-infernic-2', 'story-botanic-0', 'story-tranquilitic-0',
  ]],
  [.85, [
    'abyss-wraththorn-slime', 'bellcap-keeper', 'claycap-kobold', 'coalcap-kobold',
    'coppercap-gremlin', 'diadem-of-daybreak-gleamstone-slime', 'glimmerkin',
    'gloomtail-cat', 'goblin', 'heavens-dawnthorn-slime', 'lanterncap-brownie',
    'mosscap-brownie', 'pebblekin', 'reedcap-sylph', 'roselius', 'shardcap-gremlin',
    'shellcap-kappa', 'veilcap-imp', 'votive-of-first-bloom-rosethorn-wisp',
    'story-atmospheric-1', 'story-atmospheric-2', 'story-botanic-2',
    'story-chaotic-1', 'story-chaotic-2', 'story-oceanic-0', 'story-oceanic-3',
    'story-tranquilitic-2',
  ]],
  [1, [
    'abyss-starless-murmur', 'ashwing-harrier', 'coilback-scarab', 'coralcrest-nereid',
    'emberhorn-faun', 'fractured-watcher', 'furnace-salamander', 'gustfeather-harpy',
    'heavens-scarlet-benediction', 'hollowmantle-sentinel',
    'laurel-of-the-sacred-flame-rosethorn-wisp', 'nullshell-scarab',
    'petalhorn-satyr', 'roselius-golden-thorns', 'scepter-of-radiance-gleamstone-slime',
    'story-atmospheric-0', 'story-chaotic-0', 'story-infernic-3', 'story-oceanic-2',
  ]],
  [1.25, [
    'abyss-ruins-awakening', 'brasshorn-minotaur', 'brineclaw-sentinel',
    'cinderhide-cyclops', 'cloudhorn-ibex', 'dawncrest-guardian', 'flintback-armadillo',
    'geode-cyclops', 'glasswake-kelpie', 'heavens-gilded-reproach',
    'lotusback-tortoise', 'moonbloom-dryad', 'moonless-gargoyle', 'obsidian-gargoyle',
    'orchid-mantis', 'paradox-sentinel', 'pillarwing-gargoyle', 'porcelain-crane',
    'prismback-tortoise', 'pyrewing-harpy', 'quartzhorn-ram', 'rock-golem',
    'roselius-crimson-bloom', 'regalia-of-the-sun-gleamstone-slime',
    'seraph-of-the-rose-pyre-rosethorn-wisp', 'stormhorn-faun', 'thornshell-beetle',
    'thunderclaw-raiju', 'umbrasilk-weaver', 'story-botanic-1', 'story-chaotic-3',
    'story-infernic-1', 'story-oceanic-1', 'story-tranquilitic-1', 'story-tranquilitic-3',
  ]],
  [1.5, [
    'abyss-hunger-beyond-veil', 'abyssbell-oracle', 'concord-lion', 'cyclonewing-griffin',
    'eclipse-antler-regent', 'fracturecoil-drake', 'heavens-thorns-first-light',
    'ivory-kirin', 'magma-wyrm-knight', 'opalwing-griffin', 'riftwing-chimera',
    'roselius-seraph-passion', 'sovereign-of-the-gilded-vault-gleamstone-slime',
    'sovereign-of-the-hallowed-garden-rosethorn-wisp', 'stillbell-oracle',
    'sunmirror-oracle', 'tempestwing-roc', 'verdant-antler-regent', 'zephyrcoil-drake',
    'story-atmospheric-3', 'story-botanic-3', 'story-tranquilitic-boss',
  ]],
  [1.75, [
    'calamity-boss-treasury', 'calamity-boss-sanctuary', 'calamity-boss-heavens',
    'calamity-boss-abyss', 'calamity-boss-machines', 'calamity-boss-infernic',
    'calamity-boss-oceanic', 'calamity-boss-atmospheric', 'calamity-boss-botanic',
    'calamity-boss-tranquilitic', 'calamity-boss-chaotic',
    'calamity-boss-roses',
    'abyss-night-without-end', 'abyss-worldfall-reverie', 'atlas-of-the-crystal-summit',
    'celestial-leviathan', 'crowncoil-kirin', 'crowned-phoenix', 'crownfault-behemoth',
    'crownray-kirin', 'crownvoid-behemoth', 'crownwind-roc',
    'empress-of-the-thousand-blooms', 'harmonywing-kirin', 'heavens-crimson-reckoning',
    'heavens-dawn-without-mercy', 'last-furnace-ifrit', 'monarch-of-the-silent-eclipse',
    'ouroboros-first-dawn', 'pearlscale-leviathan', 'regent-of-the-unbroken-sky',
    'roselius-garden-eternity', 'roselius-living-rose',
    'sovereign-of-the-endless-tide', 'sovereign-of-the-impossible-ruin',
    'sovereign-of-the-living-storm', 'sovereign-of-the-sevenfold-dawn',
    'sovereign-of-the-unbroken-accord', 'the-crown-beyond-dawn-gleamstone-slime',
    'the-flame-beyond-eternity-rosethorn-wisp', 'story-atmospheric-boss',
    'story-botanic-boss', 'story-chaotic-boss', 'story-infernic-boss', 'story-oceanic-boss',
  ]],
];

export const enemyArtworkScales: ReadonlyMap<string, number> = new Map(
  artworkSizes.flatMap(([scale, arts]) => arts.map(art => [art, scale] as const)),
);

export function battleArtScale(_state: BattleState, unit: Combatant): number {
  if (isStarterId(unit.definitionId) && !unit.captured &&
      (unit.side === 'ally' || unit.evolution !== undefined)) {
    const evolution = unit.evolution ?? 1;
    characterLevelCap(evolution);
    return characterScales[evolution - 1];
  }
  const art = unit.definitionId.startsWith('calamity:') ? getCreature(unit.definitionId).art
    : unit.color ? unit.art
    : unit.definitionId === 'goblin' || unit.definitionId === 'imp' || unit.definitionId === 'golem'
      ? enemies[unit.definitionId].art : unit.art;
  if (!art) return 1;
  const scale = enemyArtworkScales.get(art);
  if (scale === undefined) throw new Error(`Battle artwork size is missing: ${art}.`);
  return scale;
}
