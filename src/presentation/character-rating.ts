import { getStarter, type StarterId } from '../content/starters';
import { characterRarity } from '../content/progression';
import './character-rating.css';
import './rarity-feedback.css';

export function starBadge(stars: number, subject: 'character' | 'creature' = 'character'): string {
  if (!Number.isInteger(stars) || stars < 1 || stars > 7) throw new Error('Character stars must be an integer from 1 to 7.');
  return `<span class="star-badge star-tier-${stars}" role="img" aria-label="${stars}-star ${subject === 'creature' ? 'Elemental-Devourer' : subject}"><span class="rating-stars" aria-hidden="true">${Array.from({ length: stars }, () =>
    '<span class="rating-star"><span class="star-face"></span><span class="star-shine"></span></span>').join('')}</span></span>`;
}

export function characterRating(id: StarterId, evolution = 1, riseBlessed = false): string {
  const rarity = characterRarity(id, evolution);
  return `<span class="character-rating" data-character-rating="${id}">${starBadge(getStarter(id).stars)}<span class="rarity-badge rarity-${rarity.toLowerCase()}" data-rarity="${rarity}" role="img" aria-label="${rarity} rarity"><span class="rarity-medallion" aria-hidden="true"><span>${evolution}</span></span><span class="rarity-label" aria-hidden="true">${rarity}</span></span>${riseBlessed ? '<span class="rise-blessed-badge" role="img" aria-label="Rise-blessed"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 1 19 7 26 4 25 11 31 14 26 18 29 25 21 24 16 31 12 24 4 27 6 19 1 15 8 11 7 4 14 7Z"/><path d="M8 19 10 12 14 16 16 10 19 16 23 12 24 20 20 23 12 23Z"/><path d="M12 19h8v4h-8z"/></svg></span>' : ''}</span></span>`;
}
