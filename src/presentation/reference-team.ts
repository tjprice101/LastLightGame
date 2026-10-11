import { elements, isCurrencyMode } from '../content/activities';
import { getStarter, isStarterId, type StarterId } from '../content/starters';
import { characterName } from '../content/character-art';
import { characterLevelCap, evolutionRarity } from '../content/progression';
import { formatStat, shatterGauge } from '../content/combat';
import { ownedCharacters, ownedProgress, equippedSquad, characterProtection, creatureSaleOffer, isSellableCreatureMode, type Account } from '../game/account';
import { saleControls } from './creature-sale';
import { getCreature } from '../content/creatures';
import { capturedProgress, capturedLevelCost, resolveCapturedFighter } from '../game/character-instances';
import { portrait } from './portrait';
import { ownedCompanion } from './owned-companion';
import { characterDetail, stats, referenceEquipment } from './hub';
import { squadHub } from './roster';
import { itemShowcase } from './item-showcase';
import { materialName } from '../content/dungeon-art';
import { information } from './information';
import { conduitSummary, filledConduitSlots } from './conduit-loadout';
import { conduitSlotCount } from '../content/conduits';

export type ReferenceTeamView = 'detail' | 'bearers' | 'creatures' | 'capture' | 'formation' | 'conduits' | 'capture-conduits';
export interface ReferenceTeamState {
  view: ReferenceTeamView;
  selected: StarterId;
  capture?: string;
  element: string;
  sort: 'level' | 'name' | 'element';
  tab?: string;
}

export function referenceTeamSidebar(account: Account, state: ReferenceTeamState): string {
  const squad = equippedSquad(account);
  return `<aside class="ref-team-sidebar">
    <section class="ref-panel"><header class="ref-panel-heading">Squad · ${squad.length} of 3</header>
      ${Array.from({ length: 3 }, (_, index) => {
        const id = squad[index];
        if (!id) return '<button class="ref-member-row ref-empty-row" data-team-view="formation">+ Choose a member</button>';
        const member = ownedCompanion(account, id);
        const active = isStarterId(id) ? state.view === 'detail' && state.selected === id : state.view === 'capture' && state.capture === id;
        return `<div class="ref-member-line"><button class="ref-member-row ${active ? 'is-selected' : ''}" data-reference-member="${id}" ${isStarterId(id) ? `data-team-detail="${id}"` : `data-team-capture-detail="${id}"`}>
          <span class="ref-thumb">${member.art}</span><span><b>${member.name}</b><small>${index ? 'Member' : 'Leader'}</small></span></button>
          ${index ? `<button class="ref-chip" data-make-leader="${id}" aria-label="Make ${member.name} the leader">♛ Lead</button>` : ''}</div>`;
      }).join('')}
    </section>
    <section class="ref-panel ref-collection-sidebar"><header class="ref-panel-heading">Collection</header>
      <button class="ref-member-row ${state.view === 'detail' || state.view === 'bearers' ? 'is-selected' : ''}" data-team-view="bearers"><span class="ref-thumb ref-count">${ownedCharacters(account).length}</span><span><b>Element-Bearers</b><small>${ownedCharacters(account).length} owned · view all</small></span></button>
      <button class="ref-member-row ${state.view === 'creatures' || state.view === 'capture' ? 'is-selected' : ''}" data-team-view="creatures"><span class="ref-thumb ref-count">${account.capturedCharacters?.length ?? 0}</span><span><b>Captured Elemental-Devourers</b><small>${account.capturedCharacters?.length ?? 0} captured · view all</small></span></button>
    </section>
  </aside>`;
}

function bearerGrid(account: Account, state: ReferenceTeamState): string {
  const ids = ownedCharacters(account);
  const squad = equippedSquad(account);
  const list = ids.filter(id => !state.element || getStarter(id).elementId === state.element).sort((a, b) =>
    state.sort === 'level' ? ownedProgress(account, b).level - ownedProgress(account, a).level || getStarter(a).name.localeCompare(getStarter(b).name)
      : state.sort === 'element' ? getStarter(a).elementId.localeCompare(getStarter(b).elementId) || getStarter(a).name.localeCompare(getStarter(b).name)
        : getStarter(a).name.localeCompare(getStarter(b).name));
  return `<section class="ref-panel ref-team-collection"><header class="ref-panel-heading">Element-Bearers · ${list.length} of ${ids.length}</header>
    <div class="ref-roster-toolbar"><nav class="ref-segment" aria-label="Filter owned Element-Bearers"><button data-team-element="" aria-pressed="${!state.element}">All</button>${elements.filter(element => ids.some(id => getStarter(id).elementId === element.id)).map(element => `<button data-team-element="${element.id}" aria-pressed="${state.element === element.id}">${element.name}</button>`).join('')}</nav>
    <label>Sort by <select data-team-sort data-native-select aria-label="Sort owned Element-Bearers"><option value="level" ${state.sort === 'level' ? 'selected' : ''}>Level</option><option value="name" ${state.sort === 'name' ? 'selected' : ''}>Name</option><option value="element" ${state.sort === 'element' ? 'selected' : ''}>Element</option></select></label></div>
    <div class="ref-scroll"><div class="ref-bearer-grid">${list.map(id => {
      const starter = getStarter(id);
      const progress = ownedProgress(account, id);
      const position = squad.indexOf(id);
      return `<button class="ref-collection-card" data-team-detail="${id}"><span class="ref-card-art">${portrait(starter, progress.evolution)}</span><span class="ref-card-caption"><b>${starter.name}</b><small>★${starter.stars} · ${starter.element} · Lv.${progress.level}</small>${position >= 0 ? `<span class="ref-chip ref-white">${position === 0 ? 'Leader' : 'In squad'}</span>` : ''}</span></button>`;
    }).join('')}<button class="ref-collection-card ref-add-card" data-page="summon">+ Summon more</button></div></div></section>`;
}

function captureGrid(account: Account): string {
  const copies = account.capturedCharacters ?? [];
  return `<section class="ref-panel ref-team-collection"><header class="ref-panel-heading">Captured Elemental-Devourers · ${copies.length}<span>Lock the ones you want to keep. Storage has no limit.</span></header>
    ${copies.length ? `<div class="ref-scroll"><div class="ref-capture-grid">${copies.map((copy, index) => {
      const member = ownedCompanion(account, copy.instanceId);
      const protection = characterProtection(account, copy.instanceId);
      const position = equippedSquad(account).indexOf(copy.instanceId);
      const progress = capturedProgress(copy);
      return `<article class="ref-collection-card"><button class="ref-card-art" data-team-capture-detail="${copy.instanceId}" aria-label="Open ${member.name}, copy ${index + 1}">${member.art}</button><div class="ref-card-caption"><b>${member.name}</b><small>★${progress.tier + 1} · ${member.element} · Lv.${progress.level} · Copy ${index + 1}</small>${position >= 0 ? `<span class="ref-chip ref-white">${position === 0 ? 'Leader' : 'In squad'}</span>` : ''}<button class="ref-chip ${protection.locked ? 'ref-white' : ''}" data-character-lock="${copy.instanceId}" data-lock-value="${!protection.locked}" aria-pressed="${protection.locked}">${protection.locked ? 'Locked' : 'Lock'}</button></div></article>`;
    }).join('')}</div></div>` : '<div class="ref-empty"><b>No captured Elemental-Devourers yet</b><p>Defeat eligible enemies in Heaven, Abyss, Crownfall Treasury, Rosethorn Sanctuary or Passion of Crimson Roses.</p><button class="ref-button ref-outline" data-page="gameplay">Go to Play</button></div>'}
    <p id="character-lock-result" role="status"></p></section>`;
}

function captureDetail(account: Account, id: string): string {
  const copy = account.capturedCharacters?.find(entry => entry.instanceId === id);
  if (!copy) throw new Error('Choose an owned captured Elemental-Devourer.');
  const creature = getCreature(copy.creatureId);
  const member = ownedCompanion(account, id);
  const progress = capturedProgress(copy);
  const kit = resolveCapturedFighter(copy, account.conduitEquipment?.[id], account.conduitUpgrades);
  const protection = characterProtection(account, id);
  const squad = equippedSquad(account);
  const index = (account.capturedCharacters ?? []).indexOf(copy) + 1;
  const cost = progress.level < 120 ? capturedLevelCost(copy) : null;
  const missing = cost ? Object.entries(cost.materials).filter(([key, amount]) => (account.materials[key] ?? 0) < amount) : [];
  const canLevel = cost && account.fractalis >= cost.fractalis && !missing.length;
  const sale = isSellableCreatureMode(creature.mode) ? creatureSaleOffer(account, id) : null;
  return `<section class="ref-team-detail ref-capture-detail" data-captured-copy="${id}">
    <header class="ref-panel ref-character-header"><div class="ref-character-portrait">${member.art}</div>
      <div class="ref-character-identity"><p>${member.element} · Captured Elemental-Devourer · Copy ${index}</p><h2>${creature.name}</h2>
        <div class="ref-tags"><span class="ref-stars" aria-label="${progress.tier + 1}-star Elemental-Devourer">${'★'.repeat(progress.tier + 1)}</span><span class="ref-chip">${evolutionRarity(progress.tier + 1)}</span></div>
        <div class="ref-character-progress"><div>Level ${formatStat(progress.level)} / 120<div class="ref-bar"><i style="width:${progress.level / 120 * 100}%"></i></div></div><div>Fixed form · Cannot evolve</div></div></div>
      <div class="ref-character-header-actions"><button class="ref-link" data-team-view="creatures">← All captured Elemental-Devourers</button>
        ${squad[0] === id ? '<span class="ref-chip ref-white">Squad leader</span>' : squad.includes(id) ? `<button class="ref-chip" data-make-leader="${id}">♛ Make leader</button>` : '<button class="ref-chip" data-team-view="formation">Add to squad</button>'}
        <button class="ref-chip" data-character-lock="${id}" data-lock-value="${!protection.locked}" aria-pressed="${protection.locked}">${protection.locked ? 'Unlock' : 'Lock'} Elemental-Devourer</button></div>
    </header>
    <section class="hub-detail ref-character-panels" aria-label="Elemental-Devourer details and upgrades"><div class="character-detail-content"><div class="mono-character-quad">
      <section class="character-category mono-character-stats"><h3>Stats</h3>${stats(copy, undefined, false, account.conduitEquipment?.[id], account.conduitUpgrades)}</section>
      <section class="character-category character-combat"><h3>Skills</h3><div class="ref-ability-buttons">${(['skill1', 'skill2', 'ultimate'] as const).map(action => {
        const ability = kit.abilities[action];
        const label = action === 'skill1' ? 'Skill 1' : action === 'skill2' ? 'Skill 2' : 'Last Flare';
        const unavailable = kit.unavailableActions?.includes(action);
        return information(`creature-${id}-${action}`, unavailable ? label : ability.name,
          `<article class="hub-ability"><h3>${unavailable ? label : ability.name}</h3><p>${ability.description}</p>${unavailable ? '<p>This slot is unavailable for this Elemental-Devourer.</p>' : `<p class="hub-cost">${label} · Costs ${shatterGauge.costs[action]} Shatter Gauge · ${ability.cooldown}-turn cooldown.</p>`}</article>`, `${label} details`,
          `<span><strong>${unavailable ? label : ability.name}</strong><small>${label} · ${unavailable ? 'Unavailable · ' : ''}View details</small></span>`);
      }).join('')}</div></section>
      <section class="character-category mono-character-growth"><h3>Growth &amp; sale</h3><div class="mono-growth-options"><article><h4>Level up</h4>
        ${cost ? itemShowcase([{ id: 'fractalis', amount: cost.fractalis }, ...Object.entries(cost.materials).map(([key, amount]) => ({ id: key, amount }))], 'Level cost') : '<p class="ref-growth-summary">Maximum level 120</p>'}
        ${cost ? `<button class="primary-button" data-level-capture="${id}" data-expected-level="${progress.level}" ${canLevel ? '' : 'disabled'}>Level up</button>` : ''}
        <button class="text-button" data-max-level="${id}" ${cost ? '' : 'disabled'}>Max Level</button>
        ${cost && !canLevel ? `<p class="ref-growth-summary">${account.fractalis < cost.fractalis ? 'Not enough Prismatica. ' : ''}${missing.map(([key, amount]) => `Need ${amount} ${materialName(key)}; owned ${account.materials[key] ?? 0}.`).join(' ')}</p>` : ''}</article>
        <article><h4>${sale ? 'Sell copy' : 'Fixed form'}</h4>${sale ? saleControls(sale, id) : '<p class="ref-growth-summary">This Elemental-Devourer cannot be sold or evolved.</p>'}</article></div><p id="character-lock-result" role="status"></p></section>
      ${conduitSummary(id, account)}
    </div></div></section></section>`;
}

/** Dedicated full-page Conduit loadout (the mock-up's "Open full conduit view"), without the Team sidebar or character header. */
function conduitPage(account: Account, state: ReferenceTeamState): string {
  let panel: string;
  if (state.view === 'capture-conduits') {
    const copy = account.capturedCharacters?.find(entry => entry.instanceId === state.capture);
    if (!copy) throw new Error('Choose an owned captured Elemental-Devourer.');
    const creature = getCreature(copy.creatureId);
    panel = `<div class="character-detail-content ref-organized-detail"><div class="ref-equipment-workspace">${referenceEquipment(copy.instanceId, creature.name, creature.element, account)}</div></div>`;
  } else {
    if (!account.characters[state.selected]) throw new Error('Choose an owned Element-Bearer.');
    panel = characterDetail(getStarter(state.selected), 'equipment', account, true);
  }
  return `<div class="ref-screen ref-team ref-conduit-page"><section class="ref-team-detail ref-loadout-page">
    <section class="hub-detail ref-character-panels" aria-label="Conduit loadout">${panel}</section></section></div>`;
}

export function referenceTeam(account: Account | null, state: ReferenceTeamState): string {
  if (!account) return '<p role="alert">Team unavailable. Resolve the account error.</p>';
  let content: string;
  if (state.view === 'bearers') content = bearerGrid(account, state);
  else if (state.view === 'creatures') content = captureGrid(account);
  else if (state.view === 'formation') content = `<section class="ref-panel ref-scroll ref-formation">${squadHub(account)}</section>`;
  else if (state.view === 'conduits' || state.view === 'capture-conduits') return conduitPage(account, state);
  else if (state.view === 'capture') {
    const copy = account.capturedCharacters?.find(entry => entry.instanceId === state.capture);
    if (!copy) throw new Error('Choose an owned captured Elemental-Devourer.');
    content = captureDetail(account, copy.instanceId);
  } else {
    if (!account.characters[state.selected]) throw new Error('Choose an owned Element-Bearer.');
    const starter = getStarter(state.selected);
    const progress = ownedProgress(account, state.selected);
    const squad = equippedSquad(account);
    const title = characterName(state.selected, progress.evolution).split(', ')[0];
    const cap = characterLevelCap(progress.evolution);
    content = `<section class="ref-team-detail">
      <header class="ref-panel ref-character-header hub-showcase"><div class="ref-character-portrait hub-portrait">${portrait(starter, progress.evolution)}</div>
        <div class="ref-character-identity"><p data-reference-prefix>${title} · ${starter.element} · ${starter.weapon}</p><h2 data-reference-name>${starter.name}</h2>
          <div class="ref-tags"><span class="ref-stars" aria-label="${starter.stars}-star Element-Bearer">${'★'.repeat(starter.stars)}</span><span class="ref-chip">${starter.role}</span><span class="ref-chip" data-reference-rarity>${evolutionRarity(progress.evolution)}</span></div>
          <div class="ref-character-progress"><div>Level <span data-reference-level>${formatStat(progress.level)} / ${cap}</span><div class="ref-bar"><i style="width:${progress.level / cap * 100}%"></i></div></div>
          <div><span data-reference-evolution>Evolution ${progress.evolution} / 6</span><div class="ref-pips">${Array.from({ length: 6 }, (_, index) => `<i class="${index < progress.evolution ? 'is-filled' : ''}"></i>`).join('')}</div></div></div>
          <span data-owned-progress class="ref-sr-only">Lv.${progress.level} · Evo.${progress.evolution}</span></div>
        <div class="ref-character-header-actions"><button class="ref-link" data-team-view="bearers">← All Element-Bearers · ${ownedCharacters(account).length}</button><button type="button" class="ref-chip" data-open-loadout>Conduits · <span data-conduit-count>${filledConduitSlots(starter.id, account)}/${conduitSlotCount}</span></button>${squad[0] === starter.id ? '<span class="ref-chip ref-white">Squad leader</span>' : squad.includes(starter.id) ? `<button class="ref-chip" data-make-leader="${starter.id}">♛ Make leader</button>` : '<button class="ref-chip" data-team-view="formation">Add to squad</button>'}</div>
      </header><nav class="ref-character-submenus" aria-label="Character sub-menus">${[
        ['overview', 'Stats & Skills'], ['upgrade-1', 'Level'], ['upgrade-0', 'Evolution'], ['equipment', 'Conduits'],
      ].map(([tab, label]) => `<button type="button" data-character-tab="${tab}" aria-pressed="${tab === (state.tab ?? 'overview')}">${label}</button>`).join('')}</nav>
      <section class="hub-detail ref-character-panels" aria-label="Character details and upgrades">${characterDetail(starter, state.tab ?? 'overview', account, true)}</section></section>`;
  }
  return `<div class="ref-screen ref-team">${referenceTeamSidebar(account, state)}${content}</div>`;
}
