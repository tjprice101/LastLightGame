import { enemies, enemyIds, formatStat } from './combat';
import { elements, getElement, dungeonStageCount, infusionModes, currencyModes, eventModes, machineModes, type ElementId, type InfusionModeId } from './activities';
import { machineConduitLoot, type MachineLootFocus } from './machines';
import type { ConduitId } from './conduits';
import { masterChest } from './master-conduits';
import { machineComponentDrop } from './mechanical-components';
import { dungeonEncounter, dungeonVariants, materialLoot } from './dungeons';
import { infusionEncounter, infusionLoot, infusionElements, enemyCaptureAllowed, enemyCaptureChance } from './infusions';
import { stagedLycalisOdds } from './loot-random';
import { activityPrismaticaDrop } from './prismatica';
import { storyEncounter, storyCreature, storyRules, storyLoot } from './story';
import { elementEmotions, machineOrigin } from './world-lore';
import { calamityBossLore, calamityIntro, enemyLineLore, enemyLore } from './enemy-lore';
import { calamityActivities, calamityChest, calamityTierScaling, isCalamityTier, type CalamityActivityId } from './calamity';
import { calamityBossArt } from './calamity-art';
import { gatesOfOblivionRules, oblivionConstructAtStage, oblivionEncounter, oblivionLoot } from './gates-of-oblivion';

export interface Creature {
  id: string;
  name: string;
  art?: string;
  area: string;
  element: ElementId;
  dungeonElement?: ElementId;
  mode?: InfusionModeId;
  story?: true;
  calamity?: CalamityActivityId;
  oblivion?: true;
  lore?: string;
  stages: number[];
}

function catalog(): Creature[] {
  const result: Creature[] = enemyIds.map((id) => ({ id: `adventure:${id}`, name: enemies[id].name,
    art: enemies[id].art, element: enemies[id].element, area: 'Training', stages: [] }));
  for (let stage = 1; stage <= storyRules.stages; stage++) {
    const encounter = storyEncounter(stage);
    for (let identity = 0; identity < (encounter.boss ? 1 : 4); identity++) {
      const creature = storyCreature(stage, identity);
      const existing = result.find((entry) => entry.id === creature.id);
      if (existing) existing.stages.push(stage);
      else result.push({ ...creature, element: encounter.element, area: encounter.name, story: true, stages: [stage] });
    }
  }
  for (const element of elements) {
    for (let stage = 1; stage <= dungeonStageCount; stage++) {
      for (const variant of dungeonVariants(element.id, stage)) {
        const id = variant.creatureId;
        const entry = result.find((creature) => creature.id === id);
        if (entry) entry.stages.push(stage);
        else result.push({ id, name: variant.enemy.name, art: variant.enemy.art, area: element.dungeon,
          element: element.id, dungeonElement: element.id, stages: [stage] });
      }
    }
  }
  for (const definition of [...infusionModes, ...currencyModes, ...eventModes, ...machineModes]) {
    const mode = definition.id;
    for (let stage = 1; stage <= definition.stages; stage++) {
      const encounter = infusionEncounter(mode, stage);
      const id = `infusion:${mode}:${encounter.tier}`;
      const entry = result.find((creature) => creature.id === id);
      if (entry) entry.stages.push(stage);
      else result.push({ id, name: encounter.enemy.name, art: encounter.enemy.art,
        area: encounter.name, element: encounter.enemy.element, mode, stages: [stage] });
    }
  }
  for (let stage = 1; stage <= gatesOfOblivionRules.stages; stage++) {
    const construct = oblivionConstructAtStage(stage);
    const id = construct.id;
    const existing = result.find(creature => creature.id === id);
    if (existing) { if (!existing.stages.includes(stage)) existing.stages.push(stage); }
    else result.push({ id, name: construct.name, area: gatesOfOblivionRules.name, element: construct.element,
      oblivion: true, lore: construct.lore, stages: [stage] });
  }
  for (const activity of calamityActivities) {
    result.push({ id: `calamity:${activity.id}`, name: activity.boss, area: `${activity.name} · Calamity`,
      art: calamityBossArt[activity.id], element: activity.element, calamity: activity.id, stages: [1, 2, 3] });
  }
  return result;
}

export const creatures: readonly Creature[] = catalog();
export function getCreature(id: string): Creature {
  const creature = creatures.find((entry) => entry.id === id);
  if (!creature) throw new Error(`Unknown glossary Elemental-Devourer: ${id}.`);
  return creature;
}

export function creatureLore(creature: Creature): string {
  getCreature(creature.id);
  const stolen = `${getElement(creature.element).name} ${elementEmotions[creature.element]}`;
  if (creature.oblivion) return `${creature.name}: ${creature.lore!} Like every Elemental-Devourer, it is Rise's creation, seeking her soul with stolen ${stolen}.`;
  if (creature.calamity) {
    const unique = calamityBossLore[creature.calamity];
    if (!unique?.includes(creature.name)) throw new Error(`Missing authored Calamity lore for ${creature.id}.`);
    const intro = calamityIntro([calamityTierScaling[1].level, calamityTierScaling[2].level, calamityTierScaling[3].level]);
    if (creature.calamity === 'machines') return `${intro} ${unique} ${machineOrigin}`;
    return `${intro} ${unique} Like every Elemental-Devourer, it is Rise's creation, seeking her soul with stolen ${stolen}.`;
  }
  if (creature.mode) {
    const line = enemyLineLore[creature.mode];
    if (!line) throw new Error(`Missing authored line lore for ${creature.id}.`);
    if (creature.mode === 'machines') return `${line} ${machineOrigin} This model is ${creature.name}.`;
    return `${line} This form is ${creature.name}. Like the rest of its line, it is Rise's creation, seeking her soul with stolen ${stolen}.`;
  }
  const authored = enemyLore[creature.id];
  if (!authored?.includes(creature.name)) throw new Error(`Missing authored lore for ${creature.id}.`);
  return `${authored} It is Rise's creation, seeking her soul with stolen ${stolen}.`;
}

export interface CreatureLoot { id: string; minimum: number; maximum: number; chance: number; note?: string }
export function creatureLoot(creature: Creature, stage?: number, ownedConduits?: Partial<Record<ConduitId, number>>, focus?: MachineLootFocus): CreatureLoot[] {
  getCreature(creature.id);
  if (creature.stages.length && (stage === undefined || !creature.stages.includes(stage))) throw new Error('Choose a stage where this Elemental-Devourer appears.');
  if (creature.oblivion) {
    if (stage === undefined) throw new Error('Choose a Gates of Oblivion floor.');
    return oblivionLoot(stage, oblivionEncounter(stage).boss);
  }
  if (creature.calamity) {
    if (!isCalamityTier(stage)) throw new Error('Choose a Calamity EX tier.');
    return [{ id: calamityChest(creature.calamity, stage).id, minimum: 1, maximum: 1, chance: 1,
      note: 'Exactly one chest per victory. Open later in Inventory. No ordinary rewards, captures or 5x multiplier.' }];
  }
  if (creature.story && stage !== undefined) {
    return storyLoot(stage);
  }
  if (!creature.stages.length && stage !== undefined && (!Number.isInteger(stage) || stage < 1 || stage > 120)) throw new Error('Choose a Training enemy level from 1 to 120.');
  const level = creature.dungeonElement && stage !== undefined ? dungeonEncounter(creature.dungeonElement, stage).level
    : creature.mode && stage !== undefined ? infusionEncounter(creature.mode, stage).level : stage ?? 1;
  const loot: CreatureLoot[] = [{ id: 'fractalis', ...activityPrismaticaDrop(
    creature.dungeonElement && stage !== undefined ? { dungeon: { stage } }
      : creature.mode && stage !== undefined ? { infusion: { mode: creature.mode, stage } } : {}, level) }];
  if (creature.mode && enemyCaptureAllowed(creature.mode, level)) loot.push({
    id: `capture:${creature.id}`, minimum: 1, maximum: 1, chance: enemyCaptureChance,
    note: 'A separate 50% chance per defeated enemy to obtain one playable copy of this exact form. Copies join at a maximum of Lv.60 and retain their form and skills. Duplicates are allowed.',
  });
  if (creature.mode === 'treasury') return loot;
  if (creature.mode === 'machines' && stage !== undefined) return [...loot, machineComponentDrop(stage), ...machineConduitLoot(stage, ownedConduits, focus),
    ...(stage === masterChest.stage ? [{ id: masterChest.id, minimum: 1, maximum: 1, chance: masterChest.chance,
      note: 'Final boss only. Choose an unowned Master in Inventory.' }] : [])];
  if (creature.dungeonElement && stage !== undefined) {
    loot.push(...materialLoot(creature.dungeonElement, stage));
  } else if (creature.mode && stage !== undefined) {
    const pool = infusionLoot(creature.mode, stage);
    const odds = creature.mode === 'roses' ? [] : stagedLycalisOdds(creature.mode, level, stage);
    loot.push(...odds.filter((outcome) => outcome.amount > 0).map((outcome) => ({
      id: 'lycalis', minimum: outcome.amount, maximum: outcome.amount, chance: outcome.chance,
      note: `Each defeated enemy has one chance to award Null-Prismatica, separate from its other drops. The rows are alternative amounts, not extra rolls: at most one amount is awarded (mutually exclusive). Chance of none: ${formatStat(odds[0].chance * 100)}%. Ordinary enemies and bosses use the same odds.`,
    })));
    loot.push(...pool.specialties);
    const eligibleElements = infusionElements(creature.mode);
    for (const drop of pool.bonuses) for (const element of eligibleElements) loot.push({
      id: `${element.id}-${drop.rarity}`, minimum: drop.minimum, maximum: drop.maximum, chance: drop.chance / eligibleElements.length,
      note: `${formatStat(drop.chance * 100)}% ${drop.rarity} roll, then one of ${eligibleElements.length} mode-associated elements equally; only one element per rarity roll.`,
    });
  }
  return loot;
}
