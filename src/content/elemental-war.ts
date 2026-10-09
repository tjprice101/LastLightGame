import { enemyGrowth, enemyStat } from './stat-growth';
import { getStarter } from './starters';
import { characterArt, characterName } from './character-art';
import { warFighters, type WarCharacterId } from './war-characters';
import { enemySkills } from './enemy-skills';

export { isWarCharacter, type WarCharacterId } from './war-characters';
export const warStageCount = 10;
export const warRulesText = 'Ten free, sequential stages at enemy levels 90-140; one boss per stage. Guaranteed Prismatica grows from 1,500-2,500 to 5,000-8,000. Independent Null-Prismatica chance grows from 30% of 1 to 60% of 5. Only the final boss has a 1% recruitment chance: a new Element-Bearer starts at Lv.0 ~ Evo.1, unequipped; an already-owned result converts to 100 Null-Prismatica. No pity, materials, creature captures or clear bonus. Continue is manual; HP resets and Gauge carries over. Final-stage replay is available from Gameplay. Settings retains the encounter. Playable evolution caps are unchanged.';
export const elementalWars = [
  { character: 'nerithe', name: 'The Sea Without a Shore', element: 'oceanic' },
  { character: 'orvella', name: 'The Throne Beneath the World', element: 'botanic' },
  { character: 'vaelor', name: 'The Sky\'s Final Chord', element: 'atmospheric' },
] as const;

export function warEncounter(character: WarCharacterId, stage: number) {
  const mode = elementalWars.find((entry) => entry.character === character);
  if (!mode || !Number.isInteger(stage) || stage < 1 || stage > warStageCount) throw new Error('Invalid Elemental War stage.');
  const level = Math.round(90 + 50 * (stage - 1) / 9);
  const evolution = Math.min(6, stage === 10 ? 6 : Math.ceil(stage / 2));
  const starter = getStarter(character);
  const stats = {
    health: enemyStat(110, enemyGrowth.bossHealth, level, 10, .036, 140),
    damage: enemyStat(13, enemyGrowth.bossDamage, level, 10, .036, 140),
    defense: enemyStat(2, enemyGrowth.bossDefense, level, 10, .08, 140),
  };
  const kit = warFighters[character];
  const skills = enemySkills(level, true, kit.abilities.skill1.name, 1.55);
  const ultimate = skills.find((skill) => skill.action === 'ultimate');
  if (!ultimate) throw new Error('Elemental War boss ultimate is missing.');
  ultimate.name = kit.abilities.ultimate.name;
  return { ...mode, stage, level, evolution, tier: evolution - 1, forms: 6, boss: true,
    enemyName: characterName(character, evolution), art: characterArt(character, evolution).art,
    color: starter.color, stats, skills, background: `elemental-war-${character}-arena.png`,
    banner: `elemental-war-${character}-banner.png` };
}

export function warLoot(stage: number) {
  warEncounter('orvella', stage);
  const t = (stage - 1) / 9;
  return { fractalis: { minimum: Math.round(1500 + 3500 * t * t), maximum: Math.round(2500 + 5500 * t * t) },
    lycalis: { chance: .3 + .3 * t, quantity: Math.round(1 + 4 * t) },
    recruitmentChance: stage === warStageCount ? .01 : 0 };
}

export function rollWarRewards(stage: number, currencyRandom: () => number, premiumRandom: () => number,
  recruitmentRandom: () => number) {
  const loot = warLoot(stage);
  const roll = (random: () => number) => {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('Invalid Elemental War reward roll.');
    return value;
  };
  return {
    amount: loot.fractalis.minimum + Math.floor(roll(currencyRandom) * (loot.fractalis.maximum - loot.fractalis.minimum + 1)),
    lycalis: roll(premiumRandom) < loot.lycalis.chance ? loot.lycalis.quantity : 0,
    recruitment: stage === warStageCount && roll(recruitmentRandom) < loot.recruitmentChance,
  };
}
