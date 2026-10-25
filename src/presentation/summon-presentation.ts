import { multiSummonCount, type summonCharacter, type SummonDraw } from '../game/account';
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
import { summonRevealTier, type RewardPresentation } from './reward-screen';
import { materialArt, materialName } from '../content/dungeon-art';
import { assetUrl } from './portrait';
import { bannerMaterialDefinition, bannerDuplicateMaterialAmount } from '../content/banner-materials';

export type SummonResult = ReturnType<typeof summonCharacter>;

export function summonTenReward(account: SummonResult['account'], draws: readonly SummonDraw[], bannerId: SummonBannerId): RewardPresentation {
  if (draws.length !== multiSummonCount) throw new Error('A 10-pull receipt must contain ten saved draws.');
  const banner = getSummonBanner(bannerId);
  const rewards = draws.map(draw => ({ draw, reward: summonReward({ account, ...draw }, bannerId) }));
  const characters = draws.filter(draw => draw.entry.kind === 'character' && !draw.duplicate).length;
  const bonuses = draws.filter(draw => draw.bonusConduit).length;
  const tier = summonRevealTier(Math.max(...draws.map(drawStars)));
  return {
    tier,
    title: '10-Pull summoned', name: `${multiSummonCount} results`,
    art: `<ol class="summon-ten-grid">${rewards.map(({ draw, reward }) => `<li class="summon-ten-result${draw.entry.kind === 'character' && !draw.duplicate ? ' is-character' : ''}${summonRevealTier(drawStars(draw)) ? ` is-${summonRevealTier(drawStars(draw))}` : ''}">
      <div class="summon-ten-art">${reward.art}</div><b>${escapeDialogText(reward.name)}</b><small>${escapeDialogText(reward.title)}${draw.guarantee !== 'none' ? ' · Pity' : ''}${draw.bonusConduit ? ' · Bonus Conduit' : ''}</small></li>`).join('')}</ol>`,
    accent: '#f4f4f5', animationLabel: 'Calling through the Light',
    details: `<p>${characters ? `${characters} new Element-Bearer${characters === 1 ? '' : 's'}` : 'No new Element-Bearers'}${bonuses ? ` · ${bonuses} bonus Conduit${bonuses === 1 ? '' : 's'} (not auto-equipped)` : ''}</p>
      <p>${escapeDialogText(banner.name)} · ${banner.cost * multiSummonCount} Null-Prismatica spent</p>`,
    savedLabel: 'All ten rewards saved',
  };
}

/** Star value of what was pulled; a duplicate 5/6-star still earns its tier's reveal before converting. */
function drawStars(draw: Pick<SummonDraw, 'entry'>): number {
  return draw.entry.kind === 'character' ? draw.entry.stars : 0;
}

export function summonReward(result: SummonResult, bannerId: SummonBannerId): RewardPresentation {
  const banner = getSummonBanner(bannerId);
  const entry = result.entry;
  let reward: RewardPresentation;
  if (result.materials) {
    const materials = result.materials;
    const tier = bannerMaterialDefinition(materials.id);
    if (!Number.isSafeInteger(materials.amount) || materials.amount <= 0) throw new Error('Summoned material definition is missing.');
    if (result.duplicate && (entry.kind !== 'character' || !isStarterId(entry.id))) throw new Error('Converted Element-Bearer definition is missing.');
    if (result.duplicate ? tier.rarity !== 'Rare' || materials.amount !== bannerDuplicateMaterialAmount
      : entry.kind !== 'material' || entry.id !== materials.id || entry.amount !== materials.amount || materials.amount !== tier.amount) {
      throw new Error('Summoned material receipt does not match its outcome.');
    }
    reward = { title: result.duplicate ? 'Duplicate converted' : 'Materials summoned',
      name: `${materials.amount} ${materialName(materials.id)}`,
      art: materialArt(materials.id) ? `<img src="${assetUrl(`materials/${materialArt(materials.id)}.png`)}" alt="${escapeDialogText(materialName(materials.id))}" width="256" height="256">`
        : '<span class="art-pending">Material artwork pending</span>', accent: '#f4f4f5', animationLabel: 'Calling through the Light',
      details: `<p>${tier.rarity} material bundle · ${materials.amount} received</p>${result.duplicate && isStarterId(entry.id) ? `<p>${escapeDialogText(characterName(entry.id))} is already owned. Received Rare materials instead.</p>` : ''}` };
  } else if (result.copy) {
    if (result.duplicate && (entry.kind !== 'character' || !isStarterId(entry.id))) throw new Error('Converted Element-Bearer definition is missing.');
    const conversion = result.duplicate && isStarterId(entry.id)
      ? `<p>${escapeDialogText(characterName(entry.id))} is already owned. Received this Elemental-Devourer instead.</p>` : '';
    const member = ownedCompanion(result.account, result.copy.instanceId);
    const creature = getCreature(result.copy.creatureId);
    reward = { title: result.duplicate ? 'Duplicate converted' : 'Elemental-Devourer summoned', name: member.name,
      art: member.art, accent: member.color, animationLabel: 'Calling through the Light',
      details: `${member.rating}${elementLabel(creature.element)}<p>Captured Elemental-Devourer · Lv.${member.level}</p>${conversion}` };
  } else {
    if (entry.kind !== 'character' || !isStarterId(entry.id)) throw new Error('Summoned Element-Bearer definition is missing.');
    const character = getStarter(entry.id);
    reward = { title: 'Element-Bearer summoned', name: characterName(character.id, 1),
      art: portrait(character, 1), accent: character.color, animationLabel: 'Calling through the Light',
      details: `${characterRating(character.id, 1)}${elementLabel(character.elementId)}<p>New Element-Bearer · Lv.0 · Evo.1</p>` };
  }
  reward.tier = summonRevealTier(drawStars(result));
  reward.details += `<p>${escapeDialogText(banner.name)} · ${banner.cost} Null-Prismatica spent</p>`;
  if (result.guarantee !== 'none') {
    const guarantee = result.guarantee === 'unowned-character' ? 'Unowned Element-Bearer'
      : result.guarantee === 'all-owned-character' ? 'Element-Bearer · All already owned'
      : result.guarantee === 'highest-star' ? 'Highest-star character'
      : result.guarantee === 'unowned-highest-star' ? 'Unowned highest-star character'
        : result.guarantee === 'all-owned-highest-star' ? 'Highest-star character · All already owned' : null;
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
