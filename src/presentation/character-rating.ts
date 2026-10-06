import { getStarter, type StarterId } from '../content/starters';
import { evolutionRarity } from '../content/progression';
import './character-rating.css';

export function starBadge(stars: number, subject: 'character' | 'creature' = 'character'): string {
  if (!Number.isInteger(stars) || stars < 1 || stars > 6) throw new Error('Character stars must be an integer from 1 to 6.');
  return `<span class="star-badge star-tier-${stars}" role="img" aria-label="${stars}-star ${subject}"><span class="rating-stars" aria-hidden="true">${Array.from({ length: stars }, () =>
    '<span class="rating-star"><span class="star-face"></span><span class="star-shine"></span></span>').join('')}</span></span>`;
}

export function characterRating(id: StarterId, evolution = 1): string {
  const rarity = evolutionRarity(evolution);
  return `<span class="character-rating" data-character-rating="${id}">${starBadge(getStarter(id).stars)}<span class="rarity-badge rarity-${rarity.toLowerCase()}" role="img" aria-label="${rarity} rarity"><span class="rarity-medallion" aria-hidden="true"><span>${evolution}</span></span><span class="rarity-label" aria-hidden="true">${rarity}</span></span></span>`;
}
