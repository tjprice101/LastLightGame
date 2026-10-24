import { infusionStageCount, validateMachineStage } from './activities';
import { lootRoll } from './loot-random';
import { bossLootMultiplier } from './final-boss-loot';

export const mechanicalComponents = {
  id: 'mechanical-components',
  name: 'Broken Mechanical Components',
  art: null,
  firstChance: 1,
  finalChance: 1,
  firstQuantity: 3,
  finalQuantity: 125,
} as const;

export function machineComponentDrop(stage: number) {
  validateMachineStage(stage);
  const progress = (stage - 1) / (infusionStageCount('machines') - 1);
  const quantity = Math.round(mechanicalComponents.firstQuantity +
    (mechanicalComponents.finalQuantity - mechanicalComponents.firstQuantity) * progress) *
    bossLootMultiplier({ infusion: { mode: 'machines', stage } });
  return { id: mechanicalComponents.id, minimum: quantity, maximum: quantity,
    chance: mechanicalComponents.firstChance + (mechanicalComponents.finalChance - mechanicalComponents.firstChance) * progress,
    note: 'Components upgrade Conduits. Final-boss amounts already include the 5x bonus.' };
}

export const machineComponentRulesText = `Every Machine drops Broken Mechanical Components: ${mechanicalComponents.firstQuantity} at stage 1, rising to ${mechanicalComponents.finalQuantity} at stage ${infusionStageCount('machines')}; the final boss drops ${mechanicalComponents.finalQuantity * 5}.`;

export function rollMachineComponents(stage: number, random: () => number): number {
  const drop = machineComponentDrop(stage);
  return lootRoll(random) < drop.chance ? drop.minimum : 0;
}
