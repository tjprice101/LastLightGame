import { elements, type ElementId } from './activities';

export const elementWeaknesses: Record<ElementId, ElementId> = {
  infernic: 'oceanic',
  oceanic: 'botanic',
  botanic: 'atmospheric',
  atmospheric: 'infernic',
  tranquilitic: 'chaotic',
  chaotic: 'tranquilitic',
};

export function isCombatElement(value: unknown): value is ElementId {
  return elements.some(element => element.id === value);
}

export function elementDamageMultiplier(attacker: ElementId | null, defender: ElementId | null): number {
  if (attacker === null || defender === null) return 1;
  if (elementWeaknesses[defender] === attacker) return 1.5;
  return elementWeaknesses[attacker] === defender ? .75 : 1;
}
