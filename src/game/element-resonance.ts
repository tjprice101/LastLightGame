import { getStarter, isStarterId } from '../content/starters';
import type { ElementId } from '../content/activities';

export interface ElementResonance { element: ElementId; skillPower: .25 | .75 }
export function elementResonance(roster: readonly string[]): ElementResonance | null {
  const counts = new Map<ElementId, number>();
  for (const id of roster) {
    if (!isStarterId(id)) continue;
    const element = getStarter(id).elementId;
    counts.set(element, (counts.get(element) ?? 0) + 1);
  }
  for (const [element, count] of counts) {
    if (count === 3) return { element, skillPower: .75 };
    if (count === 2) return { element, skillPower: .25 };
  }
  return null;
}
