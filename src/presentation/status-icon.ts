import { statusArt, type StatusArtId } from '../content/status-art';
import { assetUrl } from './portrait';

export function statusIcon(id: StatusArtId): string {
  const source = statusArt[id];
  return `<img class="status-icon" data-status-art="${id}" src="${source.startsWith('data:') ? source : assetUrl(source)}" alt="" aria-hidden="true" width="256" height="256" />`;
}
