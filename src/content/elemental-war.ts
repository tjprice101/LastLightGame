import { enemyCombatStats } from './stat-growth';
import { getStarter } from './starters';
import { characterArt, characterName } from './character-art';
import { warFighters, type WarCharacterId } from './war-characters';
import { enemyAbilityMultiplier, enemySkills } from './enemy-skills';
import { bossLootMultiplier } from './final-boss-loot';
import { rollDrop } from './loot-random';
import { activityPrismaticaDrop } from './prismatica';
import { warStageCount } from './activities';

export { isWarCharacter, type WarCharacterId } from './war-characters';
export { warStageCount } from './activities';
export const warRulesText = 'Ten free stages, Lv.90-140, one boss each. Prismatica grows linearly from 1,500-2,500 to 30,000-45,000, without a final-boss multiplier. Null-Prismatica: 30% chance of 1, rising to 60% of 25, retaining its final 5x quantity boost. Every final boss clear guarantees recruitment at Lv.0, Evo.1 of its Element-Bearer; an owned result becomes 100 Null-Prismatica. No pity, materials or captures. HP resets between stages; Gauge carries over.';
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
  const stats = enemyCombatStats(level, true);
  const kit = warFighters[character];
  const skills = enemySkills(level, true, kit.abilities.skill1.name, enemyAbilityMultiplier(level));
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
  const multiplier = bossLootMultiplier({ war: { stage } });
  return { fractalis: activityPrismaticaDrop({ war: { stage } }, 140),
    lycalis: { chance: .3 + .3 * t, quantity: Math.round(1 + 4 * t) * multiplier },
    recruitmentChance: stage === warStageCount ? 1 : 0 };
}

export function rollWarRewards(stage: number, currencyRandom: () => number, premiumRandom: () => number,
  recruitmentRandom: () => number) {
  const loot = warLoot(stage);
  const roll = (random: () => number) => {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('Invalid Elemental War reward roll.');
    return value;
  };
  const amount = rollDrop({ ...loot.fractalis, chance: 1 }, currencyRandom);
  if (amount === undefined) throw new Error('Guaranteed Elemental War currency did not drop.');
  return {
    amount,
    lycalis: roll(premiumRandom) < loot.lycalis.chance ? loot.lycalis.quantity : 0,
    recruitment: stage === warStageCount && roll(recruitmentRandom) < loot.recruitmentChance,
  };
}
