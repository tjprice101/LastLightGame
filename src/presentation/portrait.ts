import { type Starter, type StarterId } from '../content/starters';
import { characterArt, characterName } from '../content/character-art';
import { unitFacing } from './unit-facing';
import { characterArtRevisions } from '../content/character-art-revisions';

export function assetUrl(path: string): string {
  const url = `${import.meta.env.BASE_URL}assets/${path}`;
  const character = /^characters\/([^/]+)\.png$/.exec(path);
  const revision = character ? characterArtRevisions[character[1]] : undefined;
  return revision ? `${url}?v=${revision}` : url;
}

export function portraitAttributes(starter: Starter, evolution = 1): { src: string; alt: string } {
  const form = characterArt(starter.id, evolution);
  const attributes = {
    src: form.available ? assetUrl(`characters/${form.art}.png`) : `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 960"><rect x="180" y="180" width="600" height="600" rx="100" fill="#171717" stroke="#999"/><text x="480" y="500" text-anchor="middle" fill="#ddd" font-size="54" font-family="Georgia">Artwork pending</text></svg>')}`,
    alt: `${characterName(starter.id, evolution)}, ${starter.element.toLowerCase()} Element-Bearer with a ${starter.weapon.toLowerCase()}`,
  };
  return { ...attributes, alt: `${attributes.alt}${form.available ? '' : '; artwork pending'}` };
}

export function portrait(starter: Starter, evolution = 1): string {
  const { src, alt } = portraitAttributes(starter, evolution);
  return `<span class="character-idle" data-character="${starter.id}"><img src="${src}" alt="${alt}" ${characterFacingAttributes(starter.id, evolution)} width="960" height="960" /></span>`;
}

export function characterFacing(id: StarterId, evolution = 1) {
  const form = characterArt(id, evolution);
  return form.available ? unitFacing(form.art, 'ally') : { facing: 'left' as const, mirrored: false };
}

export function characterFacingAttributes(id: StarterId, evolution = 1): string {
  const { facing, mirrored } = characterFacing(id, evolution);
  return `data-facing="${facing}" data-mirrored="${mirrored}"`;
}
