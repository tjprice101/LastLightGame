import { getCreature } from '../content/creatures';
import { storyEncounter } from '../content/story';
import { dungeonEncounter } from '../content/dungeons';
import { infusionEncounter } from '../content/infusions';
import { warEncounter, isWarCharacter } from '../content/elemental-war';
import { characterArt } from '../content/character-art';
import { calamityArenaArt } from '../content/calamity-art';
import { oblivionArenaArt } from '../content/gates-of-oblivion';
import type { FrozenRadiantRun } from '../online/radiant-run';
import { assetUrl } from './portrait';
import { unitFacingAttributes } from './unit-facing';
import { escapeDialogText as escape } from './game-dialog';
import type { Activity } from '../online/server-game';

export function radiantEnemyArt(enemy: FrozenRadiantRun['enemies'][number]): string {
  if (enemy.identity.startsWith('war:')) {
    const [, character, form] = enemy.identity.split(':');
    if (!isWarCharacter(character) || !/^[1-6]$/.test(form) || enemy.identity !== `war:${character}:${form}`)
      throw new Error('Invalid Radiant Elemental War portrait identity.');
    const art = characterArt(character, Number(form));
    return art.available ? `<img class="radiant-enemy-art" draggable="false" loading="eager"
      src="${assetUrl(`characters/${art.art}.png`)}" alt="${escape(enemy.name)}"
      ${unitFacingAttributes(art.art, 'enemy')} width="960" height="960">` : pending(enemy.name);
  }
  const creature = getCreature(enemy.identity);
  return creature.art
    ? `<img class="radiant-enemy-art${creature.calamity ? ' calamity-boss-contrast' : ''}" draggable="false" loading="eager"
        src="${assetUrl(`enemies/${creature.art}.png`)}" alt="${escape(enemy.name)}"
        ${unitFacingAttributes(creature.art, 'enemy')} width="960" height="960">`
    : pending(enemy.name);
}
function pending(name: string): string {
  return `<span class="radiant-art-pending" role="img" aria-label="${escape(name)}; artwork pending">Artwork pending</span>`;
}
export function radiantArenaArt(activity: Activity): string {
  let background: string | null | undefined, name: string;
  switch (activity.kind) {
    case 'training': background = 'grassy-field.png'; name = 'Training'; break;
    case 'story': ({ background, name } = storyEncounter(activity.stage)); break;
    case 'dungeon': ({ background, name } = dungeonEncounter(activity.element, activity.stage)); break;
    case 'infusion': ({ background, name } = infusionEncounter(activity.mode, activity.stage)); break;
    case 'war': ({ background, name } = warEncounter(activity.character, activity.stage)); break;
    case 'calamity': background = calamityArenaArt[activity.tier]; name = 'Calamity'; break;
    case 'oblivion': background = oblivionArenaArt; name = 'Gates of Oblivion'; break;
  }
  return background ? `<img class="radiant-arena-art" loading="eager" draggable="false"
    src="${assetUrl(`backgrounds/${background}`)}" alt="${escape(name)} battle scenery" width="1456" height="816">`
    : `<div class="radiant-arena-pending" role="img" aria-label="${escape(name)}; scenery pending"></div>`;
}
