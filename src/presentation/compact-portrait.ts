import { type Starter } from '../content/starters';
import { characterArt, characterName } from '../content/character-art';
import { compactPortraitRevisions } from '../content/compact-portrait-revisions';
import { assetUrl, characterFacingAttributes } from './portrait';

const pendingFace = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="32" fill="#171717" stroke="#999"/><text x="256" y="270" text-anchor="middle" fill="#ddd" font-size="30" font-family="Georgia">Face portrait pending</text></svg>')}`;

export function compactPortraitAttributes(starter: Starter, evolution = 1, riseBlessed = false): {
  src: string; alt: string; width: number; height: number; available: boolean;
} {
  const form = characterArt(starter.id, evolution);
  const available = form.available && Object.hasOwn(compactPortraitRevisions, form.art);
  return {
    src: available ? assetUrl(`character-faces/${form.art}.png`) : pendingFace,
    alt: `${characterName(starter.id, evolution, riseBlessed)}, face portrait${available ? '' : '; face portrait pending'}`,
    width: 512, height: 512, available,
  };
}

export function compactPortrait(
  starter: Starter, evolution = 1, options: { revealed?: boolean; riseBlessed?: boolean } = {},
): string {
  const { src, alt, available } = compactPortraitAttributes(starter, evolution, options.riseBlessed);
  const unreached = options.revealed === false;
  const label = unreached ? `Unreached form; ${alt}` : alt;
  const facing = available ? characterFacingAttributes(starter.id, evolution) : 'data-facing="front" data-mirrored="false"';
  return `<span class="compact-portrait${unreached ? ' unreached-character-art' : ''}" data-character="${starter.id}"><img draggable="false" src="${src}" alt="${label}" ${facing} width="512" height="512" /></span>`;
}
