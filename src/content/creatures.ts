import { enemies, enemyIds, formatStat } from './combat';
import { elements, dungeonStageCount, type ElementId, type InfusionModeId } from './activities';
import { dungeonEncounter, materialLoot } from './dungeons';
import { infusionEncounter, infusionLoot, infusionElements } from './infusions';
import { fractalisDrop } from './loot-random';

export interface Creature {
  id: string;
  name: string;
  art?: string;
  area: string;
  element?: ElementId;
  mode?: InfusionModeId;
  stages: number[];
}

function catalog(): Creature[] {
  const result: Creature[] = enemyIds.map((id) => ({ id: `adventure:${id}`, name: enemies[id].name,
    art: enemies[id].art, area: 'Adventure', stages: [] }));
  for (const element of elements) {
    for (let stage = 1; stage <= dungeonStageCount; stage++) {
      const encounter = dungeonEncounter(element.id, stage);
      const id = `dungeon:${element.id}:${encounter.tier}`;
      const entry = result.find((creature) => creature.id === id);
      if (entry) entry.stages.push(stage);
      else result.push({ id, name: encounter.enemy.name, art: encounter.enemy.art, area: element.dungeon,
        element: element.id, stages: [stage] });
    }
  }
  for (const mode of ['heavens', 'abyss'] as const) {
    for (let stage = 1; stage <= dungeonStageCount; stage++) {
      const encounter = infusionEncounter(mode, stage);
      const id = `infusion:${mode}:${encounter.tier}`;
      const entry = result.find((creature) => creature.id === id);
      if (entry) entry.stages.push(stage);
      else result.push({ id, name: encounter.enemy.name, art: encounter.enemy.art,
        area: encounter.name, mode, stages: [stage] });
    }
  }
  return result;
}

export const creatures: readonly Creature[] = catalog();
export function getCreature(id: string): Creature {
  const creature = creatures.find((entry) => entry.id === id);
  if (!creature) throw new Error(`Unknown glossary creature: ${id}.`);
  return creature;
}

export interface CreatureLoot { id: string; minimum: number; maximum: number; chance: number; note?: string }
export function creatureLoot(creature: Creature, stage?: number): CreatureLoot[] {
  getCreature(creature.id);
  if (creature.stages.length && (stage === undefined || !creature.stages.includes(stage))) throw new Error('Choose a stage where this creature appears.');
  if (!creature.stages.length && stage !== undefined && (!Number.isInteger(stage) || stage < 1 || stage > 120)) throw new Error('Choose an Adventure enemy level from 1 to 120.');
  const level = creature.element && stage !== undefined ? dungeonEncounter(creature.element, stage).level
    : creature.mode && stage !== undefined ? infusionEncounter(creature.mode, stage).level : stage ?? 1;
  const loot: CreatureLoot[] = [{ id: 'fractalis', ...fractalisDrop(level) }];
  if (creature.element && stage !== undefined) {
    loot.push(...materialLoot(creature.element, stage));
  } else if (creature.mode && stage !== undefined) {
    const pool = infusionLoot(creature.mode, stage);
    loot.push(...pool.specialties);
    const eligibleElements = infusionElements(creature.mode);
    for (const drop of pool.bonuses) for (const element of eligibleElements) loot.push({
      id: `${element.id}-${drop.rarity}`, minimum: drop.minimum, maximum: drop.maximum, chance: drop.chance / eligibleElements.length,
      note: `${formatStat(drop.chance * 100)}% ${drop.rarity} roll, then one of ${eligibleElements.length} mode-associated elements equally; only one element per rarity roll.`,
    });
  }
  return loot;
}
