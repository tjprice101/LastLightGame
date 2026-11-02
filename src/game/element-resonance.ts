import { getStarter, isStarterId } from '../content/starters';
import type { ElementId } from '../content/activities';

/** Two same-element Element-Bearers: +15% Health. Three: +25% Health and +5% Skill Power. */
export interface ElementResonance { element: ElementId; health: .15 | .25; skillPower: 0 | .05 }
export function elementResonance(roster: readonly string[]): ElementResonance | null {
  const counts = new Map<ElementId, number>();
  for (const id of roster) {
    if (!isStarterId(id)) continue;
    const element = getStarter(id).elementId;
    counts.set(element, (counts.get(element) ?? 0) + 1);
  }
  for (const [element, count] of counts) {
    if (count === 3) return { element, health: .25, skillPower: .05 };
    if (count === 2) return { element, health: .15, skillPower: 0 };
  }
  return null;
}

export function resonanceText(resonance: ElementResonance): string {
  return `+${Math.round(resonance.health * 100)}% Health${resonance.skillPower ? `, +${Math.round(resonance.skillPower * 100)}% Skill Power` : ''}`;
}
