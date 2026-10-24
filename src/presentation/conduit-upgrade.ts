import { conduits, getConduit, isConduitId, conduitEffect, conduitUpgradeCap, conduitUpgradeCost, conduitUpgradeCosts, conduitUpgradeRarityMultipliers, type ConduitId } from '../content/conduits';
import { upgradeConduit, conduitMaxLevelPlan, upgradeConduitToMaximum, type ConduitMaxLevelPlan, type Account } from '../game/account';
import { type ProfileStorage } from '../game/profile';
import { conduitIcon, conduitRarity } from './conduit-store';
import { mechanicalComponentIcon } from './mechanical-component-icon';
import { information } from './information';
import './conduit-upgrade.css';
import { machineComponentRulesText } from '../content/mechanical-components';
import { gameConfirm } from './game-dialog';
import { presentReward } from './reward-screen';
import { conduitReward } from './conduit-presentation';
import { referencedEffect as readableEffect } from './effect-copy';
import { phaseZeroStatsReady } from '../content/phase-zero-stats';

const pageSize = 6;
interface CatalogState { query: string; rarity: string; status: string; sort: string; page: number }
type OwnedEntry = { id: ConduitId; copies: number; level: number };
const catalogStates = new WeakMap<HTMLElement, CatalogState>();
const boundCatalogs = new WeakSet<HTMLElement>();
const boundUpgrades = new WeakSet<HTMLButtonElement>();
const pendingUpgrades = new WeakSet<HTMLElement>();
const initialState = (): CatalogState => ({ query: '', rarity: '', status: '', sort: 'name', page: 0 });
const escapeAttribute = (value: string): string => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function catalogPage(entries: OwnedEntry[], components: number, selected: string | undefined, state: CatalogState): string {
  const filtered = entries.filter(entry => {
    const conduit = getConduit(entry.id);
    const cost = conduitUpgradeCost(conduit, entry.level);
    return conduit.name.toLowerCase().includes(state.query.trim().toLowerCase())
      && (!state.rarity || conduit.rarity === state.rarity)
      && (!state.status || (state.status === 'maximum' ? cost === null
        : state.status === 'available' ? cost !== null && components >= cost : cost !== null));
  }).sort((a, b) => {
    const first = getConduit(a.id), second = getConduit(b.id);
    const rarities = ['Common', 'Rare', 'Legendary', 'Omnic', 'Calamitic'];
    const delta = state.sort === 'rarity' ? rarities.indexOf(second.rarity) - rarities.indexOf(first.rarity)
      : state.sort === 'level' ? b.level - a.level : 0;
    return delta || first.name.localeCompare(second.name) || a.id.localeCompare(b.id);
  });
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  state.page = Math.max(0, Math.min(state.page, pages - 1));
  const start = state.page * pageSize;
  return `<div class="ref-upgrade-catalog-grid" aria-label="Owned Conduits to upgrade">${filtered.slice(start, start + pageSize).map(entry => {
    const conduit = getConduit(entry.id);
    return `<button type="button" class="ref-member-row ${entry.id === selected ? 'is-selected' : ''}" aria-pressed="${entry.id === selected}" data-select-upgrade-conduit="${entry.id}"><span class="ref-thumb">${conduitIcon(entry.id, entry.level)}</span><span><b>${conduit.name}</b><small>${conduit.rarity} · +${entry.level} / ${conduitUpgradeCap}</small><small>Owned ${entry.copies}</small></span></button>`;
  }).join('') || '<p class="ref-upgrade-no-matches">No matching owned Conduits. Adjust your filters.</p>'}</div>
    <nav class="ref-upgrade-pagination" aria-label="Owned Conduit pages"><button type="button" data-upgrade-page="-1" aria-label="Previous owned Conduit page" ${state.page === 0 ? 'disabled' : ''}>←</button><span role="status">${filtered.length ? `${start + 1}–${Math.min(start + pageSize, filtered.length)} of ${filtered.length}` : '0 of 0'} · Page ${state.page + 1} / ${pages}</span><button type="button" data-upgrade-page="1" aria-label="Next owned Conduit page" ${state.page + 1 === pages ? 'disabled' : ''}>→</button></nav>`;
}

function ownedEntries(account: Account | null): OwnedEntry[] {
  return conduits.filter(conduit => (account?.conduits?.[conduit.id] ?? 0) > 0)
    .map(conduit => ({ id: conduit.id, copies: account!.conduits![conduit.id]!, level: account?.conduitUpgrades?.[conduit.id] ?? 0 }));
}

function upgradeStatEffect(id: ConduitId, level: number): string {
  const conduit = getConduit(id);
  const effect = conduitEffect(conduit, level);
  return readableEffect(effect);
}

export function conduitUpgradeMenu(account: Account | null, selected?: string): string {
  return renderConduitUpgradeMenu(account, selected, initialState());
}

function renderConduitUpgradeMenu(account: Account | null, selected: string | undefined, state: CatalogState): string {
  const owned = conduits.filter((conduit) => (account?.conduits?.[conduit.id] ?? 0) > 0);
  const choice = owned.find(entry => entry.id === selected) ?? owned[0];
  const entries = ownedEntries(account);
  const costInformation = Object.entries(conduitUpgradeRarityMultipliers).map(([rarity, multiplier]) =>
    `<p>${rarity}: ${conduitUpgradeCosts.map((cost) => cost * multiplier).join(' / ')} components for +1 through +5.</p>`).join('')
    + '<p>Max Level previews the highest affordable upgrade and its total cost.</p>';
  return `<section class="conduit-upgrade-menu ref-screen ref-conduit-upgrade" data-upgrade-owned="${escapeAttribute(JSON.stringify(entries))}" data-upgrade-components="${account?.mechanicalComponents ?? 0}">
    <nav class="ref-market-tabs"><button aria-current="page">Conduit Upgrade</button><button data-page="conduit-store">Conduit Store →</button></nav>
    <aside class="ref-panel ref-upgrade-owned"><header class="ref-panel-heading">Owned · ${owned.length}</header>
      <div class="ref-upgrade-tools"><label class="ref-upgrade-search"><span class="ref-sr-only">Search owned Conduits</span><input type="search" data-upgrade-search placeholder="Search Conduits…" value="${escapeAttribute(state.query)}"></label>
      <label class="ref-upgrade-sort"><span class="ref-sr-only">Sort owned Conduits</span><select data-upgrade-sort>${[['name', 'Name A–Z'], ['rarity', 'Rarity highest'], ['level', 'Upgrade highest']].map(([value, label]) => `<option value="${value}" ${state.sort === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label></div>
      <div class="ref-upgrade-filters">
      <div class="ref-upgrade-chips" role="group" aria-label="Filter owned Conduits by rarity">${[['', 'All'], ...['Common', 'Rare', 'Legendary', 'Omnic', 'Calamitic'].map(rarity => [rarity, rarity])].map(([value, label]) => `<button type="button" data-upgrade-rarity-chip="${value}" aria-pressed="${state.rarity === value}">${label}</button>`).join('')}</div>
      <select hidden data-native-select data-upgrade-rarity aria-label="Rarity"><option value="">All rarities</option>${['Common', 'Rare', 'Legendary', 'Omnic', 'Calamitic'].map(rarity => `<option ${state.rarity === rarity ? 'selected' : ''}>${rarity}</option>`).join('')}</select>
      <div class="ref-upgrade-chips" role="group" aria-label="Filter owned Conduits by upgrade status">${[['', 'All'], ['available', 'Can upgrade'], ['unfinished', 'Below maximum'], ['maximum', 'Maximum +5']].map(([value, label]) => `<button type="button" data-upgrade-status-chip="${value}" aria-pressed="${state.status === value}">${label}</button>`).join('')}</div>
      <select hidden data-native-select data-upgrade-status aria-label="Status">${[['', 'All statuses'], ['available', 'Can upgrade'], ['unfinished', 'Below maximum'], ['maximum', 'Maximum +5']].map(([value, label]) => `<option value="${value}" ${state.status === value ? 'selected' : ''}>${label}</option>`).join('')}</select></div>
      <div class="ref-upgrade-catalog">${catalogPage(entries, account?.mechanicalComponents ?? 0, choice?.id, state)}</div></aside>
    ${account && choice ? (() => {
      const level = account.conduitUpgrades?.[choice.id] ?? 0;
      const cost = conduitUpgradeCost(choice, level);
      const affordable = cost !== null && (account.mechanicalComponents ?? 0) >= cost;
      const maximum = conduitMaxLevelPlan(account, choice.id);
      return `<section class="ref-panel ref-upgrade-detail" data-upgrade-card="${choice.id}"><div class="ref-upgrade-identity"><div class="ref-store-hero">${conduitIcon(choice.id, level)}</div><div>${choice.mechanic && !phaseZeroStatsReady ? `<div class="ref-upgrade-special">${information('conduit-upgrade-special-effect', `${choice.name} · Special effect`, `<p>${choice.effect}</p><p>Upgrades scale only the stat modifiers, not this effect.</p>`, 'Special effect · unchanged')}</div>` : ''}<h2>${choice.name}</h2>${conduitRarity(choice.id)}<p>Upgrade +${level} / ${conduitUpgradeCap} · Owned ${account.conduits?.[choice.id]}</p><div class="ref-pips" aria-hidden="true">${Array.from({ length: conduitUpgradeCap }, (_, index) => `<i class="${index < level ? 'is-filled' : ''}"></i>`).join('')}</div></div></div>
      <section class="conduit-upgrade-values"><div><h4>Current · +${level}</h4><p>${upgradeStatEffect(choice.id, level)}</p></div><span aria-hidden="true">→</span><div>${cost !== null ? `<h4>Next · +${level + 1}</h4><p>${upgradeStatEffect(choice.id, level + 1)}</p>` : '<h4>Maximum · +5</h4><p>Maximum upgrade reached.</p>'}</div></section>
      <header class="ref-panel-heading">Effect by upgrade${choice.mechanic ? '<span>Special effect unchanged</span>' : ''}</header><div class="ref-effect-progression">${Array.from({ length: conduitUpgradeCap + 1 }, (_, upgrade) => `<article class="${upgrade === level ? 'is-current' : ''}" ${upgrade === level ? 'aria-current="step"' : ''}><small>+${upgrade}${upgrade === level ? ' · Current' : ''}</small><p>${upgradeStatEffect(choice.id, upgrade)}</p></article>`).join('')}</div>
      <aside class="ref-panel ref-upgrade-resources"><header class="ref-panel-heading">Required resources</header><article class="component-balance">${mechanicalComponentIcon()}<div><strong id="mechanical-components-balance">${account.mechanicalComponents ?? 0}</strong><span>Broken Mechanical Components</span></div></article>
      <p class="conduit-upgrade-cost">${cost === null ? 'No further upgrades' : `${cost} Broken Mechanical Components required`}</p>${cost === null ? '<p>Maximum upgrade reached.</p>' : `<meter min="0" max="${cost}" value="${Math.min(account.mechanicalComponents ?? 0, cost)}" aria-label="Components towards upgrade"></meter>`}
      <footer><button class="primary-button" type="button" data-upgrade-conduit="${choice.id}" data-expected-upgrade="${level}" ${affordable ? '' : 'disabled'}>${cost === null ? 'Maximum upgrade +5' : `Upgrade to +${level + 1} · ${cost} components`}</button>
      <button class="primary-button" type="button" data-upgrade-conduit="${choice.id}" data-max-conduit data-expected-upgrade="${level}" data-target-upgrade="${maximum.targetLevel}" data-total-cost="${maximum.cost}" ${maximum.targetLevel > level ? '' : 'disabled'}>Max Level${maximum.targetLevel > level ? ` · +${maximum.targetLevel} · ${maximum.cost} components` : ''}</button>
      ${cost !== null && !affordable ? '<p class="quiet">Not enough Broken Mechanical Components.</p>' : ''}<button class="ref-link" data-page="gameplay" data-machine-activity>Earn components →</button></footer></aside></section>`;
    })() : `<section class="ref-panel ref-empty"><p ${account ? '' : 'role="alert"'}>${account ? 'No owned Conduits to upgrade.' : 'Conduit upgrades unavailable. Resolve the save error.'}</p><button class="ref-link" data-page="conduit-store">Open Conduit Store →</button></section>`}
    <div class="ref-upgrade-information">
    ${information('conduit-upgrade-information', 'Conduit upgrades', `<p>Upgrades apply account-wide, up to +5. No copies consumed.</p><p>${phaseZeroStatsReady ? 'Each level adds 10% of the base benefit; +5 gives 1.5x. Penalties, thresholds, costs, fixed caps and whole-turn Duration do not scale.' : "Each level adds 50% of base stat modifiers; +5 gives 3.5x. Legendary penalties grow too; Omnic special mechanics stay fixed."}</p><h3>Component costs</h3>${costInformation}<p>${machineComponentRulesText}</p><p>Upgrade changes apply to the next run.</p>`)}
    <p id="conduit-upgrade-result" role="status" tabindex="-1"></p>
  </div></section>`;
}

export function bindConduitUpgrades(host: HTMLElement, storage: ProfileStorage,
  refresh: (account: Account) => void, reportError: (message: string) => void,
  performUpgrade?: (id: ConduitId, level: number) => Promise<Account>,
  performMaximum?: (expected: ConduitMaxLevelPlan) => Promise<Account>): void {
  bindUpgradeCatalog(host);
  host.querySelectorAll<HTMLButtonElement>('[data-upgrade-conduit]').forEach((button) => {
    if (boundUpgrades.has(button)) return;
    boundUpgrades.add(button);
    button.addEventListener('click', async () => {
      if (button.disabled || pendingUpgrades.has(host)) return;
      pendingUpgrades.add(host);
      let saved = false;
      try {
        const id = button.dataset.upgradeConduit;
        if (!isConduitId(id)) throw new Error('Unknown Conduit.');
        const level = Number(button.dataset.expectedUpgrade);
        const conduit = getConduit(id);
        const maximum = button.dataset.maxConduit !== undefined;
        const targetLevel = maximum ? Number(button.dataset.targetUpgrade) : level + 1;
        const cost = maximum ? Number(button.dataset.totalCost) : conduitUpgradeCost(conduit, level);
        if (cost === null) throw new Error('This Conduit is already fully upgraded.');
        if (!Number.isSafeInteger(cost) || cost <= 0 || !Number.isInteger(targetLevel) || targetLevel <= level || targetLevel > conduitUpgradeCap) throw new Error('Invalid Conduit upgrade preview.');
        if (!await gameConfirm(`Spend ${cost} Broken Mechanical Components to upgrade ${conduit.name} from +${level} to +${targetLevel} account-wide? Current: ${readableEffect(conduitEffect(conduit, level), false).replace(/\.$/, '')}. ${maximum ? 'Target' : 'Next'}: ${readableEffect(conduitEffect(conduit, targetLevel), false).replace(/\.$/, '')}. Penalties also grow. No copies or other currency are spent.${maximum ? ' This is the highest affordable level, up to +5.' : ''}`, { title: maximum ? 'Max Level Conduit' : 'Upgrade Conduit', confirmLabel: maximum ? 'Max Level' : 'Upgrade' })) return;
        const plan: ConduitMaxLevelPlan = { id, currentLevel: level, targetLevel, cost };
        if (maximum && performUpgrade && !performMaximum) throw new Error('Online Conduit Max Level is unavailable.');
        const account = maximum
          ? performMaximum ? await performMaximum(plan) : upgradeConduitToMaximum(storage, plan)
          : performUpgrade ? await performUpgrade(id, level) : upgradeConduit(storage, id, level);
        saved = true;
        refresh(account);
        const status = host.querySelector<HTMLElement>('#conduit-upgrade-result');
        if (!status) throw new Error('Conduit upgrade status is missing.');
        status.textContent = `${conduit.name} upgraded to +${targetLevel}. ${cost} Broken Mechanical Components spent. Applies account-wide to new runs.`;
        await presentReward(conduitReward(id, account, 'Conduit upgraded', `${cost} Broken Mechanical Components spent`));
        const next = host.querySelector<HTMLButtonElement>(`[data-upgrade-conduit="${id}"]${maximum ? '[data-max-conduit]' : ':not([data-max-conduit])'}`);
        if (next && !next.disabled) next.focus({ preventScroll: true });
        else status.focus({ preventScroll: true });
      } catch (error) {
        console.error('Conduit upgrade rejected', error);
        reportError(`${saved ? 'Conduit upgrade is saved, but its presentation could not complete.' : 'Conduit upgrade was not completed.'} ${error instanceof Error ? error.message : String(error)}`);
      } finally { pendingUpgrades.delete(host); }
    });
  });
}

export function updateConduitUpgradeMenu(host: HTMLElement, account: Account | null, selected?: string): void {
  const current = host.querySelector<HTMLElement>('.ref-conduit-upgrade');
  if (!current) throw new Error('Conduit Upgrade is missing.');
  const template = document.createElement('template');
  const state = catalogStates.get(current) ?? initialState();
  catalogStates.set(current, state);
  template.innerHTML = renderConduitUpgradeMenu(account, selected ?? current.querySelector<HTMLElement>('[data-upgrade-card]')?.dataset.upgradeCard, state);
  const next = template.content;
  const nextScreen = next.querySelector<HTMLElement>('.ref-conduit-upgrade')!;
  current.dataset.upgradeOwned = nextScreen.dataset.upgradeOwned;
  current.dataset.upgradeComponents = nextScreen.dataset.upgradeComponents;
  const chosen = next.querySelector<HTMLElement>('[data-upgrade-card]')?.dataset.upgradeCard;
  const heading = current.querySelector('.ref-upgrade-owned > .ref-panel-heading');
  if (heading) heading.textContent = `Owned · ${ownedEntries(account).length}`;
  updateCatalog(current, chosen, state);
  const panel = current.querySelector<HTMLElement>('.ref-upgrade-detail, .ref-empty');
  const updated = next.querySelector<HTMLElement>('.ref-upgrade-detail, .ref-empty');
  if (!panel || !updated) throw new Error('Conduit Upgrade panels are missing.');
  const resource = panel.querySelector('.ref-upgrade-resources');
  const earnComponents = resource?.querySelector('[data-machine-activity]');
  const active = document.activeElement;
  const focusedAction = active instanceof HTMLElement && panel.contains(active)
    ? active.hasAttribute('data-max-conduit') ? 'maximum' : active.hasAttribute('data-upgrade-conduit') ? 'upgrade' : active.hasAttribute('data-machine-activity') ? 'earn' : undefined
    : undefined;
  panel.className = updated.className;
  if (updated.dataset.upgradeCard) panel.dataset.upgradeCard = updated.dataset.upgradeCard;
  else delete panel.dataset.upgradeCard;
  panel.replaceChildren(...Array.from(updated.childNodes));
  const nextResource = panel.querySelector('.ref-upgrade-resources');
  if (resource && nextResource) {
    resource.replaceChildren(...Array.from(nextResource.childNodes));
    nextResource.replaceWith(resource);
    if (earnComponents) resource.querySelector('[data-machine-activity]')?.replaceWith(earnComponents);
  }
  if (focusedAction) {
    const target = panel.querySelector<HTMLButtonElement>(focusedAction === 'maximum' ? '[data-max-conduit]' : focusedAction === 'upgrade' ? '[data-upgrade-conduit]:not([data-max-conduit])' : '[data-machine-activity]');
    if (target && !target.disabled) target.focus({ preventScroll: true });
    else current.querySelector<HTMLElement>('#conduit-upgrade-result')?.focus({ preventScroll: true });
  }
}

function updateCatalog(screen: HTMLElement, selected: string | undefined, state: CatalogState): void {
  const catalog = screen.querySelector<HTMLElement>('.ref-upgrade-catalog');
  if (!catalog) throw new Error('Conduit Upgrade catalog is missing.');
  const template = document.createElement('template');
  template.innerHTML = catalogPage(JSON.parse(screen.dataset.upgradeOwned ?? '[]') as OwnedEntry[],
    Number(screen.dataset.upgradeComponents ?? 0), selected, state);
  const grid = catalog.querySelector('.ref-upgrade-catalog-grid')!;
  const nextGrid = template.content.querySelector('.ref-upgrade-catalog-grid')!;
  const existing = new Map(Array.from(grid.querySelectorAll<HTMLElement>('[data-select-upgrade-conduit]'))
    .map(card => [card.dataset.selectUpgradeConduit, card]));
  const active = document.activeElement;
  const nodes = Array.from(nextGrid.childNodes).map(node => {
    if (!(node instanceof HTMLElement)) return node;
    const card = existing.get(node.dataset.selectUpgradeConduit);
    if (!card) return node;
    card.className = node.className;
    card.setAttribute('aria-pressed', node.getAttribute('aria-pressed') ?? 'false');
    if (card.querySelector('.conduit-icon-frame')?.getAttribute('data-conduit-upgrade')
      !== node.querySelector('.conduit-icon-frame')?.getAttribute('data-conduit-upgrade')) {
      card.querySelector('.ref-thumb')?.replaceChildren(...Array.from(node.querySelector('.ref-thumb')!.childNodes));
    }
    card.querySelectorAll('small').forEach((small, index) => { small.textContent = node.querySelectorAll('small')[index]?.textContent ?? ''; });
    return card;
  });
  grid.replaceChildren(...nodes);
  if (active instanceof HTMLElement && grid.contains(active)) active.focus({ preventScroll: true });
  else if (active instanceof HTMLElement && [...existing.values()].includes(active)) {
    screen.querySelector<HTMLElement>('[data-upgrade-search]')?.focus({ preventScroll: true });
  }
  const pagination = catalog.querySelector('.ref-upgrade-pagination')!;
  const nextPagination = template.content.querySelector('.ref-upgrade-pagination')!;
  pagination.querySelector('span')!.textContent = nextPagination.querySelector('span')!.textContent;
  pagination.querySelectorAll<HTMLButtonElement>('button').forEach((button, index) => {
    button.disabled = nextPagination.querySelectorAll<HTMLButtonElement>('button')[index].disabled;
  });
}

function bindUpgradeCatalog(host: HTMLElement): void {
  const screen = host.querySelector<HTMLElement>('.ref-conduit-upgrade');
  if (!screen || boundCatalogs.has(screen)) return;
  boundCatalogs.add(screen);
  const state = catalogStates.get(screen) ?? initialState();
  catalogStates.set(screen, state);
  const refreshCatalog = () => {
    screen.querySelectorAll<HTMLButtonElement>('[data-upgrade-rarity-chip], [data-upgrade-status-chip]').forEach(button => {
      const rarity = button.dataset.upgradeRarityChip;
      button.setAttribute('aria-pressed', String(rarity !== undefined ? state.rarity === rarity : state.status === button.dataset.upgradeStatusChip));
    });
    updateCatalog(screen, screen.querySelector<HTMLElement>('[data-upgrade-card]')?.dataset.upgradeCard, state);
  };
  screen.querySelector<HTMLInputElement>('[data-upgrade-search]')?.addEventListener('input', event => {
    state.query = (event.currentTarget as HTMLInputElement).value;
    state.page = 0;
    refreshCatalog();
  });
  for (const [selector, key] of [['[data-upgrade-rarity]', 'rarity'], ['[data-upgrade-status]', 'status'], ['[data-upgrade-sort]', 'sort']] as const) {
    screen.querySelector<HTMLSelectElement>(selector)?.addEventListener('change', event => {
      state[key] = (event.currentTarget as HTMLSelectElement).value;
      state.page = 0;
      refreshCatalog();
    });
  }
  screen.querySelectorAll<HTMLButtonElement>('[data-upgrade-rarity-chip], [data-upgrade-status-chip]').forEach(button => button.addEventListener('click', () => {
    const rarity = button.dataset.upgradeRarityChip;
    const control = screen.querySelector<HTMLSelectElement>(rarity !== undefined ? '[data-upgrade-rarity]' : '[data-upgrade-status]')!;
    control.value = rarity ?? button.dataset.upgradeStatusChip ?? '';
    control.dispatchEvent(new Event('change', { bubbles: true }));
  }));
  screen.querySelectorAll<HTMLButtonElement>('[data-upgrade-page]').forEach(button => button.addEventListener('click', () => {
    if (button.disabled) return;
    state.page += Number(button.dataset.upgradePage);
    refreshCatalog();
  }));
}
