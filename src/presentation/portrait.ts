import { type Starter } from '../content/starters';
import { characterArt } from '../content/character-art';
import { unitFacingAttributes } from './unit-facing';

export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}assets/${path}`;
}

export function portraitAttributes(starter: Starter, evolution = 1): { src: string; alt: string } {
  const form = characterArt(starter.id, evolution);
  return {
    src: assetUrl(`characters/${form.art}.png`),
    alt: `${starter.name}, ${starter.element.toLowerCase()} Element-Bearer with a ${starter.weapon.toLowerCase()}${evolution > 1 ? ` / ${form.title}` : ''}`,
  };
}

export function portrait(starter: Starter, evolution = 1): string {
  const { src, alt } = portraitAttributes(starter, evolution);
  return `<span class="character-idle" data-character="${starter.id}"><img src="${src}" alt="${alt}" ${unitFacingAttributes(characterArt(starter.id, evolution).art, 'ally')} width="960" height="960" /></span>`;
}
