import { getStarter, type StarterId } from '../content/starters';
import { characterRarity, rarityRank } from '../content/progression';
import { assetUrl } from './portrait';
import './character-rating.css';
import './rarity-feedback.css';

export function starBadge(stars: number, subject: 'character' | 'creature' = 'character'): string {
  if (!Number.isInteger(stars) || stars < 1 || stars > 7) throw new Error('Character stars must be an integer from 1 to 7.');
  return `<span class="star-badge star-tier-${stars}" role="img" aria-label="${stars}-star ${subject === 'creature' ? 'Elemental-Devourer' : subject}"><span class="rating-stars" aria-hidden="true">${Array.from({ length: stars }, () =>
    '<span class="rating-star"><span class="star-face"></span><span class="star-shine"></span></span>').join('')}</span></span>`;
}

export function characterRating(id: StarterId, evolution = 1, riseBlessed = false): string {
  const rarity = characterRarity(id, evolution);
  return `<span class="character-rating" data-character-rating="${id}">${starBadge(getStarter(id).stars)}<span class="rarity-badge rarity-${rarity.toLowerCase()}" data-rarity="${rarity}" role="img" aria-label="${rarity} rarity"><span class="rarity-medallion" aria-hidden="true"><span>${rarityRank(rarity)}</span></span><span class="rarity-label" aria-hidden="true">${rarity}</span></span>${riseBlessed ? '<span class="rise-blessed-badge" role="img" aria-label="Rise-blessed"><img src="' + assetUrl('items/rise-blessed-emblem.png') + '" alt="" width="32" height="32" draggable="false" /></span>' : ''}</span></span>`;
}
