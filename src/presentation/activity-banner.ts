import { assetUrl } from './portrait';

export function activityBanner(name: string, path: string | null, alt = `${name} banner`, lazy = false): string {
  return `<div class="activity-banner">${path
    ? `<img class="dungeon-banner" src="${assetUrl(path)}" alt="${alt}" width="1904" height="640"${lazy ? ' loading="lazy"' : ''}>`
    : '<div class="dungeon-banner banner-pending" aria-hidden="true">Artwork pending</div>'}<h3>${name}</h3></div>`;
}
