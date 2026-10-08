import { infusionStageCount, validateMachineStage } from './activities';
import { lootRoll } from './loot-random';

export const mechanicalComponents = {
  id: 'mechanical-components',
  name: 'Broken Mechanical Components',
  art: null,
  firstChance: .25,
  finalChance: 1,
  firstQuantity: 1,
  finalQuantity: 100,
} as const;

export function machineComponentDrop(stage: number) {
  validateMachineStage(stage);
  const progress = (stage - 1) / (infusionStageCount('machines') - 1);
  const quantity = Math.round(mechanicalComponents.firstQuantity +
    (mechanicalComponents.finalQuantity - mechanicalComponents.firstQuantity) * progress ** 2);
  return { id: mechanicalComponents.id, minimum: quantity, maximum: quantity,
    chance: mechanicalComponents.firstChance + (mechanicalComponents.finalChance - mechanicalComponents.firstChance) * progress,
    note: 'One independent roll per defeated machine; ordinary enemies and bosses use the same odds. Used only for Conduit upgrades.' };
}

export const machineComponentRulesText = `Broken Mechanical Components have a separate per-kill roll: ${mechanicalComponents.firstChance * 100}% chance of ${mechanicalComponents.firstQuantity} at stage 1, rising linearly to ${mechanicalComponents.finalChance * 100}% chance of ${mechanicalComponents.finalQuantity} at stage ${infusionStageCount('machines')}. Quantity grows quadratically by stage and is rounded; ordinary enemies and bosses use the same odds.`;

export function rollMachineComponents(stage: number, random: () => number): number {
  const drop = machineComponentDrop(stage);
  return lootRoll(random) < drop.chance ? drop.minimum : 0;
}
