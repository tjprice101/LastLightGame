import { type summonCharacter } from '../game/account';
import { getStarter, isStarterId } from '../content/starters';
import { getCreature } from '../content/creatures';
import { getSummonBanner, type SummonBannerId } from '../content/summon-banners';
import { characterName } from '../content/character-art';
import { characterRating } from './character-rating';
import { ownedCompanion } from './owned-companion';
import { portrait } from './portrait';
import { elementLabel } from './element-label';
import { getConduit } from '../content/conduits';
import { conduitIcon, conduitRarity } from './conduit-store';
import { escapeDialogText } from './game-dialog';
import { type RewardPresentation } from './reward-screen';

export type SummonResult = ReturnType<typeof summonCharacter>;

export function summonReward(result: SummonResult, bannerId: SummonBannerId): RewardPresentation {
  const banner = getSummonBanner(bannerId);
  const entry = result.entry;
  let reward: RewardPresentation;
  if (result.copy) {
    if (result.duplicate && (entry.kind !== 'character' || !isStarterId(entry.id))) throw new Error('Converted Element-Bearer definition is missing.');
    const conversion = result.duplicate && isStarterId(entry.id)
      ? `<p>${escapeDialogText(characterName(entry.id))} is already owned. Received this creature instead.</p>` : '';
    const member = ownedCompanion(result.account, result.copy.instanceId);
    const creature = getCreature(result.copy.creatureId);
    reward = { title: result.duplicate ? 'Duplicate converted' : 'Creature summoned', name: member.name,
      art: member.art, accent: member.color, animationLabel: 'Calling through the Light',
      details: `${member.rating}${elementLabel(creature.element)}<p>Captured creature ~ Lv.${member.level}</p>${conversion}` };
  } else {
    if (entry.kind !== 'character' || !isStarterId(entry.id)) throw new Error('Summoned Element-Bearer definition is missing.');
    const character = getStarter(entry.id);
    reward = { title: 'Element-Bearer summoned', name: characterName(character.id, 1),
      art: portrait(character, 1), accent: character.color, animationLabel: 'Calling through the Light',
      details: `${characterRating(character.id, 1)}${elementLabel(character.elementId)}<p>New Element-Bearer ~ Lv.0 ~ Evo.1</p>` };
  }
  reward.details += `<p>${escapeDialogText(banner.name)} ~ ${banner.cost} Null-Prismatica spent</p>`;
  if (result.guarantee !== 'none') {
    const guarantee = result.guarantee === 'highest-star' ? 'Highest-star character'
      : result.guarantee === 'unowned-highest-star' ? 'Unowned highest-star character'
        : result.guarantee === 'all-owned-highest-star' ? 'Highest-star character ~ All already owned' : null;
    if (!guarantee) throw new Error('Unknown summon guarantee.');
    reward.details += `<p>Pity guarantee: ${guarantee}</p>`;
  }
  if (result.bonusConduit) {
    const bonus = getConduit(result.bonusConduit);
    reward.details += `<section aria-label="Bonus reward"><h3>Bonus Conduit</h3>${conduitIcon(bonus.id, result.account.conduitUpgrades?.[bonus.id])}
      <p>${escapeDialogText(bonus.name)} ${conduitRarity(bonus.id)}</p><p>Not auto-equipped</p></section>`;
  }
  return reward;
}
