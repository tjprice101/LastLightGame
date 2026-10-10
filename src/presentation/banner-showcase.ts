import { getSummonBanner, type SummonBannerId } from '../content/summon-banners';
import { getStarter, isStarterId } from '../content/starters';
import { characterName } from '../content/character-art';
import { portrait } from './portrait';
import { elementLabel } from './element-label';
import { information } from './information';
import './banner-showcase.css';

export function bannerShowcase(id: SummonBannerId): string {
  const banner = getSummonBanner(id);
  const characters = banner.pool().filter((entry) =>
    entry.kind === 'character' && (entry.stars === 5 || entry.stars === 6));
  return `<div class="banner-showcase-control">${information(`banner-showcase-${id}`, `${banner.name} · Showcase`,
    `<p>Base forms of the 5-star and 6-star Element-Bearers available from this banner.</p>
    <ul class="banner-showcase-grid">${characters.map((entry) => {
      if (!isStarterId(entry.id)) throw new Error('Banner showcase character definition is missing.');
      const character = getStarter(entry.id);
      return `<li data-showcase-character="${character.id}">
        <div class="banner-showcase-portrait">${portrait(character, 1)}</div>
        <h3>${characterName(character.id, 1)}</h3>${elementLabel(character.elementId)}
        <span>${entry.stars}-star Element-Bearer</span></li>`;
    }).join('')}</ul>`, 'Showcase')}</div>`;
}
