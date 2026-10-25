import { getElement, type ElementId } from '../content/activities';
import { getConduit, type ConduitId } from '../content/conduits';
import { elementAccents } from '../content/dungeon-art';
import './conduit-element.css';

export function conduitElementTheme(element: ElementId): string {
  return `data-conduit-element="${element}" style="--conduit-element-accent:${elementAccents[element]}"`;
}

export function conduitElementLabel(element: ElementId): string {
  return `<strong class="conduit-element-label" ${conduitElementTheme(element)}>${getElement(element).name}</strong>`;
}

export function conduitElement(id: ConduitId): string {
  const conduit = getConduit(id);
  return conduit.rarity === 'Omnic' && conduit.element ? conduitElementLabel(conduit.element) : '';
}

export function createConduitElement(id: ConduitId): HTMLElement | null {
  const conduit = getConduit(id);
  if (conduit.rarity !== 'Omnic' || !conduit.element) return null;
  const label = document.createElement('strong');
  label.className = 'conduit-element-label';
  label.dataset.conduitElement = conduit.element;
  label.style.setProperty('--conduit-element-accent', elementAccents[conduit.element]);
  label.textContent = getElement(conduit.element).name;
  return label;
}

export function omnicTheme(id: ConduitId): string {
  const conduit = getConduit(id);
  return conduit.rarity === 'Omnic' && conduit.element ? conduitElementTheme(conduit.element) : '';
}
