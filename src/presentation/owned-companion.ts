import { getStarter, isStarterId } from '../content/starters';
import { getCreature } from '../content/creatures';
import { type Account, ownedProgress } from '../game/account';
import { capturedProgress } from '../game/character-instances';
import { portrait, assetUrl } from './portrait';
import { characterRating, starBadge } from './character-rating';
import { materialRarities, getElement } from '../content/activities';
import { elementAccents } from '../content/dungeon-art';

export function capturedRating(creatureId: string): string {
  const creature = getCreature(creatureId);
  const tier = Number(creatureId.split(':').at(-1));
  if (!creature.mode || !Number.isInteger(tier) || tier < 0 || tier > 5) throw new Error('Invalid captured creature form.');
  const rarity = materialRarities[tier];
  return `<span class="character-rating">${starBadge(tier + 1, 'creature')}<span class="rarity-badge rarity-${rarity.toLowerCase()}" role="img" aria-label="${rarity} rarity"><span class="rarity-medallion" aria-hidden="true"><span>${tier + 1}</span></span><span class="rarity-label" aria-hidden="true">${rarity}</span></span></span>`;
}
export function ownedCompanion(account: Account, id: string) {
  if (isStarterId(id)) {
    if (!account.characters[id]) throw new Error('Choose an Owned Element-Bearer.');
    const starter = getStarter(id);
    const progress = ownedProgress(account, id);
    return { name: starter.name, label: starter.name, color: starter.color, element: starter.element, level: progress.level, art: portrait(starter, progress.evolution),
      rating: characterRating(id, progress.evolution), progress: `Lv.${progress.level} / Evo.${progress.evolution}` };
  }
  const copy = account.capturedCharacters?.find((entry) => entry.instanceId === id);
  if (!copy) throw new Error('Choose an owned captured copy.');
  const creature = getCreature(copy.creatureId);
  const index = (account.capturedCharacters ?? []).findIndex((entry) => entry.instanceId === id) + 1;
  const level = capturedProgress(copy).level;
  const element = getElement(creature.element);
  return { name: creature.name, label: `${creature.name} / Copy ${index}`, color: elementAccents[creature.element], element: element.name, level,
    art: creature.art ? `<img src="${assetUrl(`enemies/${creature.art}.png`)}" alt="${creature.name}" width="960" height="960">` : '<span>Artwork pending</span>',
    rating: capturedRating(creature.id), progress: `Lv.${level} / Fixed form / Copy ${index}` };
}
