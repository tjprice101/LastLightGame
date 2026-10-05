import { getStarter, type StarterId } from '../content/starters';
import { ownedCharacters, equippedSquad, ownedProgress, summonPool, summonCost, type Account } from '../game/account';
import { portrait } from './portrait';
import { characterRole } from './character-role';
import { currencyIcon } from './currency-icon';
import { elementalReveal } from './reveal';
import { formatStat } from '../content/combat';
import './roster.css';

export function characterRoster(account: Account | null, selected: StarterId): string {
  if (!account) return '<p role="alert">Character roster unavailable. Resolve the save error.</p>';
  return `<nav class="owned-roster" aria-label="Owned characters">${ownedCharacters(account).map((id) => {
    const character = getStarter(id);
    const progress = ownedProgress(account, id);
    return `<button class="roster-character" data-owned-character="${id}" aria-pressed="${selected === id}" style="--element:${character.color}">
      ${portrait(character, progress.evolution)}<span><strong>${character.name}</strong>${characterRole(id)}<small>Lv.${progress.level} / Evo.${progress.evolution}</small></span></button>`;
  }).join('')}<button class="roster-summon" data-page="summon">Summon a companion &rarr;</button></nav>`;
}

export function squadHub(account: Account | null): string {
  if (!account) return '<p role="alert">Squad unavailable. Resolve the save error.</p>';
  const squad = equippedSquad(account);
  const owned = ownedCharacters(account);
  return `<section class="squad-hub"><p class="eyebrow">YOUR BATTLE TEAM</p><h2>One leader. Up to two companions.</h2>
    <p>Choose any owned character to lead. Every equipped companion joins Adventure, elemental dungeons, Heaven and Abyss with their own stats, Gauge and actions.</p>
    <form id="squad-form"><div class="squad-slots">${[0, 1, 2].map((index) => {
      const id = squad[index];
      const character = id ? getStarter(id) : null;
      return `<section class="squad-slot"><h3>${index === 0 ? 'Leader' : `Companion ${index}`}</h3>
        <div class="squad-portrait">${character ? portrait(character, ownedProgress(account, character.id).evolution) : '<span class="empty-squad-slot" aria-hidden="true">+</span>'}</div>
        ${character ? `<strong>${character.name}</strong>${characterRole(character.id)}<small>Lv.${ownedProgress(account, character.id).level} / Evo.${ownedProgress(account, character.id).evolution}</small>` : '<strong>Empty slot</strong><small>Optional companion</small>'}
        <label for="squad-${index}">${index === 0 ? 'Choose leader' : `Choose companion ${index}`}</label>
        <select id="squad-${index}" name="slot-${index}">${index ? `<option value="" ${!id ? 'selected' : ''}>Empty slot</option>` : ''}
          ${owned.map((option) => `<option value="${option}" ${id === option ? 'selected' : ''}>${getStarter(option).name}</option>`).join('')}</select></section>`;
    }).join('')}</div><p class="quiet">Use each character at most once. At least one member is required. Changes apply to your next run.</p>
      <button class="primary-button" type="submit">Save squad</button><p id="squad-result" role="status"></p></form>
    <h3>Owned companions / ${owned.length}</h3>${characterRoster(account, squad[0])}
    <p class="quiet">Summoned companions start unequipped. Add them above when you are ready.</p></section>`;
}

export function summonHub(account: Account | null, revealed?: StarterId): string {
  if (!account) return '<p role="alert">Summoning unavailable. Resolve the save error.</p>';
  const pool = summonPool(account);
  return `<section class="summon-hub"><p class="eyebrow">THE COMPANION PORTAL</p><h2>A new light answers</h2>
    <p>Spend ${summonCost} Lycalis to summon one unowned companion. Equal odds within the remaining pool. No duplicates.</p>
    <p class="currency-reward">${currencyIcon('lycalis')}<span>Owned ${account.lycalis} / Cost ${summonCost}</span></p>
    ${revealed ? `<section class="summon-reveal" role="status" style="--element:${getStarter(revealed).color}">
      <div class="summon-portrait">${portrait(getStarter(revealed), 1)}${elementalReveal(getStarter(revealed))}</div>
      <p class="eyebrow">NEW COMPANION / SAVED</p><h3>${getStarter(revealed).name}</h3>${characterRole(revealed)}
      <p>${getStarter(revealed).lore.awakening}</p><button class="primary-button" data-page="squad">Equip in Squad</button></section>` : ''}
    <div class="summon-pool">${pool.map((id) => `<article><div class="summon-portrait">${portrait(getStarter(id), 1)}</div>
      <h3>${getStarter(id).name}</h3>${characterRole(id)}<p>${formatStat(100 / pool.length)}% chance</p></article>`).join('')}</div>
    <button id="summon-character" class="primary-button" ${!pool.length || account.lycalis < summonCost ? 'disabled' : ''}>${pool.length ? `Summon / ${summonCost} Lycalis` : 'All companions owned'}</button>
    <p class="quiet">${!pool.length ? 'Collection complete. Summoning is disabled; no currency will be spent.' : account.lycalis < summonCost ? 'Not enough Lycalis. Your first Fracture awards 10 Lycalis once per account.' : 'New companions start at Lv.0, Evolution 1 and weapon rank 0. Equip them in Squad.'}</p>
    <p class="quiet">Current Lycalis income is the one-time First Fracture reward. No purchases, duplicate rewards or additional currency sources are implemented.</p></section>`;
}
