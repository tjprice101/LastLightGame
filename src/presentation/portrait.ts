import { type Starter } from '../content/starters';

export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}assets/${path}`;
}

export function portrait(starter: Starter): string {
  return `<img src="${assetUrl(`characters/${starter.art}.png`)}" alt="${starter.name}, ${starter.element.toLowerCase()} companion with a ${starter.weapon.toLowerCase()}" width="960" height="720" />`;
}
