import { getElement, type ElementId } from '../content/activities';
import { assetUrl } from './portrait';
import './element-label.css';
import { elementAssetIds } from '../content/element-migration';

export function elementLabel(id: ElementId): string {
  const element = getElement(id);
  return `<span class="element-label" data-element="${id}"><img class="element-emblem" src="${assetUrl(`elements/${elementAssetIds[id]}.png`)}" alt="" aria-hidden="true" width="256" height="256">${element.name} <span>(${element.affinity})</span></span>`;
}
