import { type Starter, isStarterId } from '../content/starters';
import { characterName } from '../content/character-art';
import { evolutionRarity } from '../content/progression';
import { resolveFighter, formatStat } from '../content/combat';
import { storyEncounter, storyRegions } from '../content/story';
import { equippedSquad, ownedProgress, unlockedStoryStage, type Account } from '../game/account';
import { capturedProgress, resolveCapturedFighter } from '../game/character-instances';
import { ownedCompanion } from './owned-companion';
import { assetUrl, portrait } from './portrait';

export function referenceHome(starter: Starter, account: Account | null): string {
  if (!account) return '<p role="alert">Home unavailable. Resolve the account error.</p>';
  const squad = equippedSquad(account);
  const id = squad[0];
  const member = ownedCompanion(account, id);
  const copy = !isStarterId(id) ? account.capturedCharacters?.find(entry => entry.instanceId === id) : undefined;
  const progress = isStarterId(id) ? ownedProgress(account, id) : undefined;
  const stats = copy ? resolveCapturedFighter(copy, account.conduitEquipment?.[id], account.conduitUpgrades).stats
    : resolveFighter(starter.id, progress, account.conduitEquipment?.[id], account.conduitUpgrades).stats;
  const completed = account.storyCompleted ?? 0;
  const encounter = storyEncounter(unlockedStoryStage(account));
  const region = storyRegions.find(entry => entry.element === encounter.element);
  const displayName = isStarterId(id) ? starter.name : member.name;
  const prefix = isStarterId(id) ? characterName(id, progress?.evolution).split(', ')[0] : 'Captured Elemental-Devourer';
  const stars = copy ? capturedProgress(copy).tier + 1 : starter.stars;
  const rarity = evolutionRarity(copy ? capturedProgress(copy).tier + 1 : progress?.evolution ?? 1);
  return `<div class="ref-screen ref-home">
    <section class="ref-panel ref-home-leader"><button class="ref-home-art" ${isStarterId(id) ? `data-team-detail="${id}"` : `data-team-capture-detail="${id}"`} aria-label="Open ${member.name}">${isStarterId(id) ? portrait(starter, progress?.evolution) : member.art}</button>
      <div class="ref-home-identity"><p>${prefix} · ${member.element}${isStarterId(id) ? ` · ${starter.weapon}` : ''}</p><h2>${displayName}</h2>
        <div class="ref-tags"><span class="ref-stars" aria-label="${stars}-star ${copy ? 'Elemental-Devourer' : 'Element-Bearer'}">${'★'.repeat(stars)}</span>${isStarterId(id) ? `<span class="ref-chip">${starter.role}</span>` : ''}<span class="ref-chip">${rarity}</span><span class="ref-chip">Lv.${member.level}${progress ? ` · Evo.${progress.evolution}` : ''}</span></div>
        <div class="ref-stat-strip">${([['Health', stats.health], ['Attack', stats.damage], ['Defense', stats.defense]] as const).map(([name, value]) => `<div><small>${name}</small><b>${formatStat(value)}</b></div>`).join('')}</div>
      </div></section>
    <button class="ref-panel ref-home-story" data-page="story">${encounter.background ? `<img class="ref-home-story-arena" src="${assetUrl(`backgrounds/${encounter.background}`)}" alt="" draggable="false" />` : ''}<span class="ref-panel-heading">${completed === 0 ? 'Story' : 'Continue story'}</span><span><strong>${completed === 150 ? 'Story complete' : region?.name ?? encounter.name}</strong><small>${completed < 150 ? `Stage ${encounter.regionStage} · Enemies Lv.${encounter.level} · ` : ''}${completed} / 150 stages cleared</small><small>Drops Prismatica and Common/Uncommon materials.</small></span><span class="ref-go" aria-hidden="true">→</span></button>
    <div class="ref-home-shops"><button class="ref-panel ref-home-shop" data-page="stores"><span class="ref-panel-heading">Market</span><span><b>Exchange · Cosmetics · Conduits</b><small>Spend your currencies</small></span><span class="ref-shop-arrow">→</span></button>
      <button class="ref-panel ref-home-shop" data-page="inventory"><span class="ref-panel-heading">Inventory</span><span><b>${account.fractalis.toLocaleString('en-US')} Prismatica</b><small>${Object.values(account.materials).filter(amount => amount > 0).length} materials · ${Object.values(account.conduits ?? {}).filter(amount => amount > 0).length} Conduits</small></span><span class="ref-shop-arrow">→</span></button></div>
  </div>`;
}
