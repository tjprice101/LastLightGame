import { statusArt, type StatusArtId } from '../content/status-art';
import { assetUrl } from './portrait';

export function statusIcon(id: StatusArtId): string {
  return `<img class="status-icon" data-status-art="${id}" src="${assetUrl(statusArt[id])}" alt="" aria-hidden="true" width="256" height="256" />`;
}
