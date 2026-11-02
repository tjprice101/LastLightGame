import { elementAccents } from '../content/dungeon-art';
import { rolePerkText } from '../content/role-perks';
import { elementResonance } from '../game/element-resonance';
import { getElement } from '../content/activities';

export function rolePerkRow(id: string, captured = false): string {
  const text = rolePerkText(id, captured);
  return text ? `<p class="role-perk">${text}</p>` : '';
}
export function resonanceBadge(roster: readonly string[]): string {
  const resonance = elementResonance(roster);
  if (!resonance) return '';
  const element = getElement(resonance.element);
  return `<p class="element-resonance" data-element="${element.id}" style="color:${elementAccents[element.id]}">${element.name} Resonance: +${resonance.skillPower * 100}% Skill Power</p>`;
}
