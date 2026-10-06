import { getStarter, isStarterId, type StarterId } from '../content/starters';
import { ownedCharacters, ownedProgress, creatureSaleOffer, type Account } from '../game/account';
import { isCurrencyMode } from '../content/activities';
import { portrait } from './portrait';
import { characterRole } from './character-role';
import { characterRating } from './character-rating';
import { currencyIcon } from './currency-icon';
import { formatStat } from '../content/combat';
import './roster.css';
import { characterProtection } from '../game/account';
import { getCreature } from '../content/creatures';
import { elementLabel } from './element-label';
import { assetUrl } from './portrait';
import { ownedCharacterInstances } from '../game/account';
import { ownedCompanion, capturedRating } from './owned-companion';
import { capturedProgress, capturedLevelCost, resolveCapturedFighter } from '../game/character-instances';
import { conduits, conduitSlotCount, type ConduitSlots } from '../content/conduits';
import { materialName } from '../content/dungeon-art';
import { standardBanner, standardBannerPool, bannerPercent, bannerPityLimits, validateBannerPity } from '../content/standard-banner';
import { evolutionRarity } from '../content/progression';

function lockControl(account: Account, id: string): string {
  const protection = characterProtection(account, id);
  return `<button class="text-button" data-character-lock="${id}" data-lock-value="${!protection.locked}" aria-pressed="${protection.locked}">${protection.locked ? 'Unlock' : 'Lock'} ${isStarterId(id) ? 'Element-Bearer' : 'creature'}</button>
    <small>${protection.locked ? 'Locked / Protected from consumption' : protection.inSquad ? 'In squad / Automatically protected' : 'Unlocked / Not in squad'}</small>`;
}

export function characterCopyManagement(account: Account | null): string {
  if (!account) return '<p role="alert">Character copy management unavailable. Resolve the save error.</p>';
  const copies = account.capturedCharacters ?? [];
  return `<section class="character-copy-management"><h2>Character protection</h2><p>Lock characters you want to keep. Squad members are automatically protected even when unlocked. Captured copies have separate slots; storage has no capacity limit.</p>
    <div class="archive-grid">${ownedCharacters(account).map((id) => `<article class="archive-card"><h3>${getStarter(id).name}</h3>${lockControl(account, id)}</article>`).join('')}</div>
    <h3>Captured creatures / ${copies.length}</h3>${copies.length ? `<div class="archive-grid">${copies.map((copy, index) => {
      const creature = getCreature(copy.creatureId);
      const progress = capturedProgress(copy);
      const kit = resolveCapturedFighter(copy, account.conduitEquipment?.[copy.instanceId]);
      const cost = progress.level < 120 ? capturedLevelCost(copy) : null;
      const sale = creature.mode && isCurrencyMode(creature.mode) ? creatureSaleOffer(account, copy.instanceId) : null;
      const slots: ConduitSlots = account.conduitEquipment?.[copy.instanceId] ?? Array.from({ length: conduitSlotCount }, () => null);
      return `<article class="archive-card" data-captured-copy="${copy.instanceId}"><div class="archive-portrait">${creature.art ? `<img src="${assetUrl(`enemies/${creature.art}.png`)}" alt="${creature.name}" width="960" height="960">` : '<span>Artwork pending</span>'}</div>
        <h3>${creature.name}</h3>${elementLabel(creature.element)}${capturedRating(creature.id)}<p>Owned copy ${index + 1} / Lv.${progress.level} / Fixed form</p>${lockControl(account, copy.instanceId)}
        <p>HP ${formatStat(kit.stats.health)} / Attack ${formatStat(kit.stats.damage)} / Defense ${formatStat(kit.stats.defense)}</p>
        <details><summary>Retained abilities</summary>${progress.skills.map((skill) => `<p>${skill.name}: ${formatStat(skill.multiplier * 100)}% Attack / ${skill.every}-turn cooldown / ${skill.action}</p>`).join('')}</details>
        <button class="primary-button" data-level-capture="${copy.instanceId}" data-expected-level="${progress.level}" ${!cost || account.fractalis < cost.fractalis || Object.entries(cost.materials).some(([id, amount]) => (account.materials[id] ?? 0) < amount) ? 'disabled' : ''}>${cost ? `Level up / ${cost.fractalis} Fractalis` : 'Maximum level 120'}</button>
        <p class="quiet">${cost ? `Requires ${Object.entries(cost.materials).map(([id, amount]) => `${amount} ${materialName(id)}`).join(', ')}. ` : ''}Cannot evolve.</p>
        ${sale ? `<button class="text-button" data-sell-creature="${copy.instanceId}" ${sale.reasons.length ? 'disabled' : ''}>Sell copy / ${sale.fractalis.toLocaleString('en-US')} Fractalis${sale.lycalis ? ` + ${sale.lycalis} Lycalis` : ''}</button><p class="quiet">${sale.reasons.length ? `Sale protected: ${sale.reasons.join(', ')}` : 'Permanent sale. Fixed-form value; leveling does not change the price.'}</p>` : ''}
        <details><summary>Conduits / Eight ordinary slots</summary>${slots.map((equipped, slot) => `<label>Slot ${slot + 1}<select data-capture-conduit="${copy.instanceId}" data-capture-slot="${slot}"><option value="">Empty</option>${conduits.filter((conduit) => (account.conduits?.[conduit.id] ?? 0) > 0).map((conduit) => `<option value="${conduit.id}" ${equipped === conduit.id ? 'selected' : ''} ${slots.some((id, other) => other !== slot && id === conduit.id) ? 'disabled' : ''}>${conduit.name}</option>`).join('')}</select></label>`).join('')}<p>Master slot reserved. Changes apply to your next run.</p></details>
        <button class="text-button" data-page="squad">Equip in Squad &rarr;</button></article>`;
    }).join('')}</div>` : '<p>No captured creatures yet. Defeat Heaven, Abyss, Crownfall Treasury or Rosethorn Sanctuary enemies for a20% chance per kill.</p>'}
    <p id="character-lock-result" role="status"></p></section>`;
}

export function characterRoster(account: Account | null, selected: StarterId): string {
  if (!account) return '<p role="alert">Character roster unavailable. Resolve the save error.</p>';
  return `<nav class="owned-roster" aria-label="Owned Element-Bearers">${ownedCharacters(account).map((id) => {
    const character = getStarter(id);
    const progress = ownedProgress(account, id);
    return `<button class="roster-character" data-owned-character="${id}" aria-pressed="${selected === id}" style="--element:${character.color}">
      ${portrait(character, progress.evolution)}<span><strong>${character.name}</strong>${characterRole(id)}${characterRating(id, progress.evolution)}<small>Lv.${progress.level} / Evo.${progress.evolution}</small></span></button>`;
  }).join('')}<button class="roster-summon" data-page="summon">Summon an Element-Bearer &rarr;</button></nav>`;
}

export function squadHub(account: Account | null): string {
  if (!account) return '<p role="alert">Squad unavailable. Resolve the save error.</p>';
  const owned = ownedCharacterInstances(account);
  const savedSquad = account.squad ?? [];
  const squad = savedSquad.length && savedSquad.every((id) => owned.includes(id)) ? savedSquad : owned.slice(0, 1);
  return `<section class="squad-hub"><p class="eyebrow">YOUR BATTLE TEAM</p><h2>One leader. Up to two squad members.</h2>
    <p>Choose any Owned Element-Bearer or captured creature to lead. Every squad member joins Adventure, elemental dungeons, Heaven and Abyss with their own stats, Gauge and actions.</p>
    <form id="squad-form"><div class="squad-slots">${[0, 1, 2].map((index) => {
      const id = squad[index];
      const character = id ? ownedCompanion(account, id) : null;
      return `<section class="squad-slot"><h3>${index === 0 ? 'Leader' : `Squad member ${index}`}</h3>
        <div class="squad-portrait">${character ? character.art : '<span class="empty-squad-slot" aria-hidden="true">+</span>'}</div>
        ${character ? `<strong>${character.label}</strong>${character.rating}<small>${character.progress}</small>` : '<strong>Empty slot</strong><small>Optional squad member</small>'}
        <label for="squad-${index}">${index === 0 ? 'Choose leader' : `Choose squad member ${index}`}</label>
        <select id="squad-${index}" name="slot-${index}">${index ? `<option value="" ${!id ? 'selected' : ''}>Empty slot</option>` : ''}
          ${!index && !owned.length ? '<option value="" selected disabled>No owned squad members</option>' : ''}
          ${owned.map((option) => `<option value="${option}" ${id === option ? 'selected' : ''}>${ownedCompanion(account, option).label}</option>`).join('')}</select></section>`;
    }).join('')}</div><p class="quiet">Use each character at most once. At least one member is required. Changes apply to your next run.</p>
      <button class="primary-button" type="submit" ${owned.length ? '' : 'disabled'}>Save squad</button><p id="squad-result" role="status"></p></form>
    <h3>Owned Element-Bearers / ${ownedCharacters(account).length}</h3>${characterRoster(account, isStarterId(squad[0]) ? squad[0] : 'ember')}
    <p>Captured creatures / ${account.capturedCharacters?.length ?? 0}. Manage their copies in Character.</p>
    <p class="quiet">Summoned Element-Bearers start unequipped. Add them above when you are ready.</p></section>`;
}

export function summonHub(account: Account | null): string {
  if (!account) return '<p role="alert">Summoning unavailable. Resolve the save error.</p>';
  const pool = standardBannerPool();
  const pity = validateBannerPity(account.bannerPity?.standard ?? { highestStar: 0, unownedHighestStar: 0 });
  return `<section class="summon-hub" data-banner="${standardBanner.id}"><p class="eyebrow">SUMMON</p><h2>${standardBanner.name}</h2>
    <div class="summon-banner-art ${standardBanner.artwork.path ? '' : 'art-pending'}" aria-label="${standardBanner.name} artwork">
      ${standardBanner.artwork.path ? `<img src="${assetUrl(standardBanner.artwork.path)}" alt="${standardBanner.artwork.alt}" width="1456" height="816">`
        : '<div class="summon-banner-placeholder"><span class="eyebrow">OMNIC ART DIRECTION / 16:9</span><strong>Standard Banner</strong><span>Banner artwork pending</span></div>'}</div>
    <p>Single draw: ${standardBanner.cost} Lycalis. Confirm before spending.</p>
    <p class="currency-reward">${currencyIcon('lycalis')}<span>Owned ${account.lycalis} / Cost ${standardBanner.cost}</span></p>
    <p id="summon-result" role="status"></p>
    <section class="banner-pity" aria-label="Banner pity"><h3>Pity guarantees</h3>
      <dl class="summon-pity-progress"><div><dt>Highest-star character</dt><dd>${pity.highestStar} / ${bannerPityLimits.highestStar}</dd></div>
      <div><dt>Unowned highest-star character</dt><dd>${pity.unownedHighestStar} / ${bannerPityLimits.unownedHighestStar}</dd></div></dl></section>
    <h3>Drop rates</h3><p class="quiet" id="banner-rate-note">Base odds outside pity guarantees. Rarity is the awarded form, not the banner artwork. Rates rounded to six decimal places.</p>
    <table class="summon-drop-table" aria-describedby="banner-rate-note"><caption>${standardBanner.name} outcomes</caption>
      <thead><tr><th scope="col">Name</th><th scope="col">Rarity / Stars</th><th scope="col">Rate</th></tr></thead>
      <tbody>${[...pool].sort((a, b) => b.stars - a.stars).map((entry) => {
        const name = entry.kind === 'character' ? getStarter(entry.id).name : getCreature(entry.id).name;
        const rarity = evolutionRarity(entry.kind === 'character' ? 1 : entry.stars);
        return `<tr data-banner-entry="${entry.id}"><th scope="row">${name}</th><td>${rarity}<span>${entry.stars}-star</span></td><td>${bannerPercent(entry.chance)} per draw</td></tr>`;
      }).join('')}</tbody></table>
    <button id="summon-character" class="primary-button" ${account.lycalis < standardBanner.cost ? 'disabled' : ''} aria-describedby="banner-cost-note">Summon / ${standardBanner.cost} Lycalis</button>
    <p id="banner-cost-note" class="quiet">${account.lycalis < standardBanner.cost ? 'Not enough Lycalis.' : 'Rewards save immediately and start unequipped. Creature results are separate playable copies.'}</p>
    <details class="summon-rules"><summary>Pity, tier totals and reward rules</summary>
      <p>Guaranteed on pull ${bannerPityLimits.highestStar} without a highest-star character. Any highest-star character resets this counter. Guaranteed on pull ${bannerPityLimits.unownedHighestStar} without a new highest-star character. A new highest-star character resets this counter.</p>
      <p>Counters are independent and belong to this banner. The 500 guarantee takes priority if both are due; eligible guaranteed characters have equal odds. If all highest-star characters are owned, the 500 guarantee awards a highest-star result using the normal duplicate reward and resets both counters. Current highest tier: 5-star; becomes 6-star only when those characters join the pool.</p>
      <p>Only successful saved draws advance pity. Menu visits, rejected draws and failed saves never count.</p>
      <p>An already-owned Element-Bearer grants the highest-rarity crowned slime: The Crown Beyond Dawn, Gleamstone Slime / Omnic / 6-star / Lv.50. It is not a6-star EB banner entry. Creature draws create independent copies at the first authored stage level of that form. No duplicate EB copy or multi-draw.</p>
    <h3>Base odds / Outside pity guarantees</h3><ul>${[1, 2, 3, 5].map((stars) => {
      const tier = pool.filter((entry) => entry.stars === stars);
      return `<li>${stars}-star tier: ${bannerPercent(tier.reduce((sum, entry) => sum + entry.chance, 0))} / ${tier.length} entries, equal within tier</li>`;
    }).join('')}</ul>
    <p class="quiet">Guaranteed pulls replace base odds with 100% in the eligible highest-star subset. Percentages below are rounded to six decimal places. 4-star and 6-star EB entries are not authored and are not in this pool. When 6-star EBs exist, that tier receives its own 0.1% total; remaining creature weights adjust. Future currency-mode creatures join their 1/2/3-star tiers only after definitions exist. Ownership does not alter base odds.</p>
    <p class="quiet">Lycalis income: one-time First Fracture reward and chance-based 1-3 drops per Heaven/Abyss kill. No payments.</p></details></section>`;
}
