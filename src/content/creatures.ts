import { enemies, enemyIds, formatStat } from './combat';
import { elements, dungeonStageCount, infusionModes, currencyModes, eventModes, machineModes, type ElementId, type InfusionModeId } from './activities';
import { machineConduitLoot } from './machines';
import { machineComponentDrop } from './mechanical-components';
import { dungeonEncounter, materialLoot } from './dungeons';
import { infusionEncounter, infusionLoot, infusionElements } from './infusions';
import { fractalisDrop, treasuryFractalisDrop, stagedLycalisOdds } from './loot-random';

export interface Creature {
  id: string;
  name: string;
  art?: string;
  area: string;
  element: ElementId;
  dungeonElement?: ElementId;
  mode?: InfusionModeId;
  stages: number[];
}

function catalog(): Creature[] {
  const result: Creature[] = enemyIds.map((id) => ({ id: `adventure:${id}`, name: enemies[id].name,
    art: enemies[id].art, element: enemies[id].element, area: 'Adventure', stages: [] }));
  for (const element of elements) {
    for (let stage = 1; stage <= dungeonStageCount; stage++) {
      const encounter = dungeonEncounter(element.id, stage);
      const id = `dungeon:${element.id}:${encounter.tier}`;
      const entry = result.find((creature) => creature.id === id);
      if (entry) entry.stages.push(stage);
      else result.push({ id, name: encounter.enemy.name, art: encounter.enemy.art, area: element.dungeon,
        element: element.id, dungeonElement: element.id, stages: [stage] });
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
  const level = creature.dungeonElement && stage !== undefined ? dungeonEncounter(creature.dungeonElement, stage).level
    : creature.mode && stage !== undefined ? infusionEncounter(creature.mode, stage).level : stage ?? 1;
  const loot: CreatureLoot[] = [{ id: 'fractalis', ...(creature.mode === 'treasury' ? treasuryFractalisDrop(level) : fractalisDrop(level, creature.mode === 'roses' ? 140 : 120)) }];
  if (creature.mode === 'treasury') return loot;
  if (creature.mode === 'machines' && stage !== undefined) return [...loot, machineComponentDrop(stage), ...machineConduitLoot(stage)];
  if (creature.dungeonElement && stage !== undefined) {
    loot.push(...materialLoot(creature.dungeonElement, stage));
  } else if (creature.mode && stage !== undefined) {
    const pool = infusionLoot(creature.mode, stage);
    const odds = creature.mode === 'roses' ? [] : stagedLycalisOdds(creature.mode, level);
    loot.push(...odds.filter((outcome) => outcome.amount > 0).map((outcome) => ({
      id: 'lycalis', minimum: outcome.amount, maximum: outcome.amount, chance: outcome.chance,
      note: `One independent Null-Prismatica roll per kill; outcomes are mutually exclusive. No Null-Prismatica: ${formatStat(odds[0].chance * 100)}%. Ordinary enemies and bosses use the same odds.`,
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
