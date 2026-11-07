import { referencedEffect } from './effect-copy';
import { type Account } from '../game/account';
import { conduits, conduitEffect } from '../content/conduits';
import { mechanicalComponentIcon } from './mechanical-component-icon';
import { currencyIcon } from './currency-icon';
import { conduitIcon, conduitRarity } from './conduit-store';
import { conduitElement, conduitElementLabel, conduitElementTheme, omnicTheme } from './conduit-element';
import { materialArt, materialName } from '../content/dungeon-art';
import { assetUrl } from './portrait';
import { information, informationTopics } from './information';
import './inventory.css';
import { masterChest, masterConduits as allMasters } from '../content/master-conduits';
import { characterReleased, materialReleased } from '../content/release-visibility';
const masterConduits = allMasters.filter(master => characterReleased(master.character));
import { masterChestIcon, masterConduitIcon } from './master-conduits';
import { getStarter } from '../content/starters';
import { specialtyMaterials } from '../content/infusions';
import { roseMaterials } from '../content/roses';
import { calamiticMaterials, isCalamiticMaterialId } from '../content/calamitic-materials';
import { elementalMaterials, elements, materialRarities, machineStageCount } from '../content/activities';
import { escapeDialogText } from './game-dialog';
import { mechanicalComponents, machineComponentRulesText } from '../content/mechanical-components';
import { calamityChest, parseCalamityChestId } from '../content/calamity';
import { calamityLoot, calamityChestIcon } from './calamity';
import { conduitGlossary } from '../content/conduit-glossary';

export type InventoryTab = 'materials' | 'conduits';
export type InventorySection = InventoryTab;
export type InventorySections = Record<InventorySection, boolean>;
export const defaultInventorySections: Readonly<InventorySections> = { materials: true, conduits: true };
export interface InventoryFilters { query: string; type: string; rarity: string; element: string }
export const defaultInventoryFilters: Readonly<InventoryFilters> = { query: '', type: '', rarity: '', element: '' };

function itemMetadata(name: string, type: string, rarity = '', element = ''): string {
  return `data-inventory-entry data-item-name="${escapeDialogText(name)}" data-item-type="${type}" data-item-rarity="${rarity}"${rarity ? ` data-rarity="${rarity}"` : ''} data-item-elements="${element}"`;
}

function materialMetadata(id: string): string {
  const calamitic = calamiticMaterials.find(entry => entry.id === id);
  const ordinary = elementalMaterials.find(entry => entry.id === id);
  const rose = roseMaterials.find(entry => entry.id === id);
  const specialty = specialtyMaterials.find(entry => entry.id === id);
  return itemMetadata(materialName(id), calamitic ? 'calamitic' : 'materials', calamitic?.rarity ?? ordinary?.rarity ?? rose?.rarity ?? '',
    ordinary?.elementId ?? (specialty ? elements.filter(element => id.startsWith(`${element.infusion}-`)).map(element => element.id).join(' ') : ''));
}

function inventoryInformation(): string {
  return information('inventory-information', 'Inventory', informationTopics('inventory-help', [
    { id: 'holdings', title: 'Finding items', summary: 'Counts and shared items', content: '<p>Counts show distinct item types, not total quantities. The "No element" filter shows items shared by several elements.</p>' },
    { id: 'materials', title: 'Materials', summary: 'Sources and banner bundles', content: '<p>Earned in Story, elemental dungeons, Heaven, Abyss and Passion of Crimson Roses.</p><p>Summon bundles contain Common, Uncommon or Rare materials: one random element on Standard, Rosethorn on Roses. Duplicate Element-Bearers give larger Rare bundles.</p>' },
    { id: 'conduits', title: 'Conduits', summary: 'Where to get them', content: '<p>Common: Conduit Store. Rare, Legendary and Omnic: Awaken the Machines. Summons can also award a Legendary bonus.</p><p>Unlock once, equip across your squad. Upgrade with Broken Mechanical Components.</p>' },
    { id: 'conduit-terms', title: 'Conduit terms', summary: 'Words used in Conduit effects', content: `<dl class="conduit-glossary">${conduitGlossary.map(entry => `<dt>${entry.term}</dt><dd>${entry.definition}</dd>`).join('')}</dl>` },
    { id: 'masters', title: 'Masters & chests', summary: 'Sources and selection', content: `<p>${masterChest.name}s: ` + masterChest.chance * 100 + '% from the stage ' + machineStageCount + ' Machines boss; two guaranteed in each Calamity EX+3 chest.</p><p>Choose any unowned released Master, even for an unowned Element-Bearer. Masters are character-specific and cannot be upgraded. Chests stay unopened once you own all ' + masterConduits.length + '.</p>' },
  ]));
}
export function isInventoryTab(value: unknown): value is InventoryTab {
  return value === 'materials' || value === 'conduits';
}

function materialDescription(id: string): string {
  materialName(id);
  if (id.endsWith('-weapon') && specialtyMaterials.some(material => material.id === id)) {
    return 'Weapon material. No current use.';
  }
  if (id.endsWith('-level') && specialtyMaterials.some(material => material.id === id)) {
    return 'Levels matching Element-Bearers in Legendary and Omnic forms.';
  }
  if (id.endsWith('-evolution') && specialtyMaterials.some(material => material.id === id)) {
    return 'Evolves matching Element-Bearers into late forms.';
  }
  if (isCalamiticMaterialId(id)) {
    const source = calamiticMaterials.find(material => material.id === id)?.source;
    return source ? `Levels and evolves Calamitic Element-Bearers. Found in ${source}.` : 'Calamitic material.';
  }
  if (roseMaterials.some(material => material.id === id)) {
    return 'Levels and evolves Rosetta, Thornia and Crinso.';
  }
  return 'Levels and evolves matching Element-Bearers.';
}

export function inventoryView(account: Account | null, selected: InventoryTab = 'materials', sections: Readonly<InventorySections> = defaultInventorySections, filters: Readonly<InventoryFilters> = defaultInventoryFilters): string {
  const materials = Object.entries(account?.materials ?? {}).filter(([id, amount]) => amount > 0 && materialReleased(id));
  const components = account?.mechanicalComponents ?? 0;
  const calamityChests = Object.entries(account?.calamityChests ?? {}).filter(([, count]) => count > 0);
  const resourceCount = materials.length + (components > 0 ? 1 : 0) + calamityChests.length + ((account?.masterChests ?? 0) > 0 ? 1 : 0);
  const ownedConduits = conduits.filter((conduit) => (account?.conduits?.[conduit.id] ?? 0) > 0);
  const ownedMasters = masterConduits.filter(entry => account?.masterConduits?.[entry.id] === 1);
  const chestItems = calamityChests.map(([id, count]) => {
    const { activity, tier } = parseCalamityChestId(id);
    const chest = calamityChest(activity, tier);
    return `<li class="inventory-item" data-inventory-chest="${id}" ${itemMetadata(chest.name, 'chests')}>
      <div class="inventory-item-art">${calamityChestIcon(tier)}</div>
      <strong>${escapeDialogText(chest.name)}</strong><span class="inventory-quantity">Owned ${count}</span>
      <div class="inventory-item-actions">${information(`inventory-${id}-loot`, 'Calamity chest · View Loot', calamityLoot(activity, tier), 'View Loot')}
      <button type="button" class="primary-button" data-open-calamity-chest="${id}">Open</button></div></li>`;
  }).join('') + ((account?.masterChests ?? 0) > 0 ? `<li class="inventory-item" data-inventory-chest="${masterChest.id}" ${itemMetadata(masterChest.name, 'chests')}>
    <div class="inventory-item-art">${masterChestIcon()}</div>
    <strong>${masterChest.name}</strong><span class="inventory-quantity">Owned ${account?.masterChests}</span>
    <div class="inventory-item-actions">${information('inventory-chest-details', masterChest.name, `<div class="inventory-detail-art">${masterChestIcon()}</div><p>Choose one unowned Omnic Master. Equip it in Team.</p><p>Final Awaken the Machines boss: ${masterChest.chance * 100}% per defeat. Each Calamity EX+3 chest: two. Extra chests stay unopened once you own every Master.</p>`, 'Details')}
    <button type="button" class="primary-button" data-open-master-chest aria-label="Open ${masterChest.name} · Choose a Master" ${ownedMasters.length === masterConduits.length ? 'disabled' : ''}>Open</button></div></li>` : '');
  const ordinaryMaterials = materials.filter(([id]) => !isCalamiticMaterialId(id));
  const calamiticMaterialItems = materials.filter(([id]) => isCalamiticMaterialId(id));
  const renderMaterials = (items: typeof materials) => items.map(([id, amount]) => {
    const art = materialArt(id);
    return `<li class="inventory-item" data-inventory-material="${id}" ${materialMetadata(id)}><div class="inventory-item-art">${art ? `<img src="${assetUrl(`materials/${art}.png`)}" alt="" aria-hidden="true" width="256" height="256" loading="lazy">` : '<span>Artwork pending</span>'}</div>
      <strong>${materialName(id)}</strong><span class="inventory-quantity">Owned ${amount}</span>
      ${information(`inventory-${id}-details`, materialName(id), `<p>Owned ${amount}</p><p>${materialDescription(id)}</p>`, 'Details')}</li>`;
  }).join('');
  const masterItems = ownedMasters.map(entry => `<li class="inventory-item" ${conduitElementTheme(getStarter(entry.character).elementId)} data-inventory-master="${entry.id}" ${itemMetadata(`${entry.name} ${getStarter(entry.character).name}`, 'masters', entry.rarity, getStarter(entry.character).elementId)}><div class="inventory-item-art">${masterConduitIcon(entry.id)}</div><strong>${entry.name}</strong>
    <span class="conduit-identity-badges"><small>Omnic Master · ${getStarter(entry.character).name}</small>${conduitElementLabel(getStarter(entry.character).elementId)}</span><span class="inventory-quantity">Owned 1</span>
    ${information(`inventory-${entry.id}-details`, entry.name, `<div class="inventory-detail-art">${masterConduitIcon(entry.id)}</div>${conduitElementLabel(getStarter(entry.character).elementId)}<p>Omnic Master for ${getStarter(entry.character).name}.</p><h3>Effect</h3><p>${referencedEffect(entry.effect)}</p><p>Always active while equipped to its named Element-Bearer. No upgrades; generated Conduit effects cannot trigger it. Existing caps, skill costs and recovery still apply.</p><h3>Origin</h3><p>${entry.lore}</p>`, 'Details')}</li>`).join('');
  const empty = (tab: InventoryTab) => `<div class="inventory-empty-slots" aria-hidden="true">${'<i></i>'.repeat(14)}</div>
    <div class="inventory-empty"><h3>${tab === 'materials' ? 'No resources yet' : 'No Conduits owned yet'}</h3></div>`;
  return `<section class="inventory-hub ref-screen ref-inventory" aria-label="Inventory holdings">
    <div class="inventory-introduction">
    ${inventoryInformation()}</div>
    <div class="inventory-currencies">${(['fractalis', 'lycalis'] as const).map((id) => `<article class="inventory-currency ref-panel" aria-label="${id === 'fractalis' ? 'Prismatica' : 'Null-Prismatica'} balance">
      ${currencyIcon(id)}<div><strong>${account ? account[id] : 'Unavailable'}</strong>
      <span>${id === 'fractalis' ? 'Prismatica' : 'Null-Prismatica'}</span></div></article>`).join('')}
      <article class="inventory-currency ref-panel" aria-label="Calamitic Tokens balance">${currencyIcon('calamitic-tokens')}<div><strong>${account ? (account.calamiticTokens ?? 0) : 'Unavailable'}</strong><span>Calamitic Tokens</span></div></article></div>
    ${!account ? '<p role="alert">Currency inventory unavailable. Check the save error.</p>' : ''}
    <div class="inventory-tools" role="search" aria-label="Find owned items">
      <label class="inventory-search">Search items<input type="search" data-inventory-query placeholder="Search item names" value="${escapeDialogText(filters.query)}" ${!account ? 'disabled' : ''}></label>
      ${([
        ['type', 'Item type', [['', 'All types'], ['materials', 'Materials'], ['calamitic', 'Calamitic materials'], ['conduits', 'Conduits'], ['masters', 'Master Conduits'], ['chests', 'Chests'], ['components', 'Components']]],
        ['rarity', 'Rarity', [['', 'All rarities'], ...materialRarities.map(rarity => [rarity, rarity]), ['Calamitic', 'Calamitic'], ['none', 'No rarity']]],
        ['element', 'Element', [['', 'All elements'], ...elements.map(element => [element.id, element.name]), ['none', 'No element']]],
      ] as const).map(([key, label, options]) => `<label>${label}<select data-inventory-filter="${key}" ${!account ? 'disabled' : ''}>${options.map(([value, text]) => `<option value="${value}" ${filters[key] === value ? 'selected' : ''}>${text}</option>`).join('')}</select></label>`).join('')}
      <button type="button" class="text-button" data-inventory-clear ${!account ? 'disabled' : ''}>Clear</button>
    </div>
    <p class="inventory-results" data-inventory-results role="status" ${!account ? 'hidden' : ''}></p>
    <div class="inventory-tabs" role="tablist" aria-label="Inventory sections">${([
      ['materials', 'Resources &amp; Items', account ? resourceCount : 'Unavailable'],
      ['conduits', 'Conduits', account ? ownedConduits.length + ownedMasters.length : 'Unavailable'],
    ] as const).map(([tab, label, count]) => `<button type="button" role="tab" id="inventory-tab-${tab}" class="inventory-tab" data-inventory-tab="${tab}" aria-controls="inventory-panel-${tab}" aria-selected="${selected === tab}" tabindex="${selected === tab ? 0 : -1}">${label} · ${count}</button>`).join('')}</div>
    <section class="inventory-panel ref-panel" id="inventory-panel-materials" role="tabpanel" aria-labelledby="inventory-tab-materials" data-inventory-section="materials" ${selected === 'materials' ? '' : 'hidden'}>
    <div class="ref-scroll">
    ${!account ? '<p role="alert">Resource inventory unavailable. Check the save error.</p>' : resourceCount
      ? `<ul class="inventory-item-grid">${chestItems}${components > 0 ? `<li class="inventory-item" data-inventory-resource="${mechanicalComponents.id}" ${itemMetadata(mechanicalComponents.name, 'components')}>
        <div class="inventory-item-art">${mechanicalComponentIcon()}</div><strong>${mechanicalComponents.name}</strong><span class="inventory-quantity">Owned ${components}</span>
        ${information('inventory-components-details', mechanicalComponents.name, `<div class="inventory-detail-art">${mechanicalComponentIcon()}</div><p>Owned ${components}</p><h3>Use</h3><p>Upgrades ordinary Conduits up to +5; Conduit Upgrade shows costs. Masters can't be upgraded.</p><h3>Source</h3><p>${machineComponentRulesText}</p>`, 'Details')}</li>` : ''}${ordinaryMaterials.length ? `<li class="inventory-group-heading" aria-hidden="true">Materials</li>${renderMaterials(ordinaryMaterials)}` : ''}${calamiticMaterialItems.length ? `<li class="inventory-group-heading calamitic-material-group" data-rarity="Calamitic">Calamitic Materials</li>${renderMaterials(calamiticMaterialItems)}` : ''}</ul>` : empty('materials')}</div></section>
    <section class="inventory-panel ref-panel" id="inventory-panel-conduits" role="tabpanel" aria-labelledby="inventory-tab-conduits" data-inventory-section="conduits" ${selected === 'conduits' ? '' : 'hidden'}>
    <div class="ref-scroll">
    ${!account ? '<p role="alert">Conduit inventory unavailable. Check the save error.</p>' : ownedConduits.length + ownedMasters.length
      ? `<ul class="inventory-item-grid">${ownedConduits.map((conduit) => `<li class="inventory-item" ${omnicTheme(conduit.id)} data-inventory-conduit="${conduit.id}" ${itemMetadata(conduit.name, 'conduits', conduit.rarity, conduit.element ?? '')}>
        <div class="inventory-item-art">${conduitIcon(conduit.id, account?.conduitUpgrades?.[conduit.id])}</div><strong>${conduit.name}</strong><span class="conduit-identity-badges">${conduitRarity(conduit.id)}</span><span class="inventory-quantity">Owned ${account?.conduits?.[conduit.id]}</span>
        ${information(`inventory-${conduit.id}-details`, conduit.name, `<div class="inventory-detail-art">${conduitIcon(conduit.id, account?.conduitUpgrades?.[conduit.id])}</div>${conduitElement(conduit.id)}<p>${conduit.rarity} Conduit · Upgrade +${account?.conduitUpgrades?.[conduit.id] ?? 0} of 5</p><h3>Effect</h3><p>${referencedEffect(conduitEffect(conduit, account?.conduitUpgrades?.[conduit.id]))}</p><p>Shown values include the saved upgrade level.</p><h3>Background</h3><p>${conduit.lore}</p><p>Owned ${account?.conduits?.[conduit.id]}. Equipping does not consume a copy; manage equipment in Team.</p>`, 'Details')}</li>`).join('')}${masterItems}</ul>`
      : empty('conduits')}</div></section>
  </section>`;
}

export function inventorySections(host: HTMLElement): InventorySections {
  const state = { ...defaultInventorySections };
  host.querySelectorAll<HTMLElement>('[data-inventory-section]').forEach(panel => {
    const section = panel.dataset.inventorySection;
    if (!isInventoryTab(section)) throw new Error('Unknown Inventory category.');
    state[section] = !panel.hidden;
  });
  return state;
}

export function inventoryFilters(host: HTMLElement): InventoryFilters {
  const query = host.querySelector<HTMLInputElement>('[data-inventory-query]');
  if (!query) throw new Error('Inventory search is missing.');
  const state = { ...defaultInventoryFilters, query: query.value };
  for (const key of ['type', 'rarity', 'element'] as const) {
    const control = host.querySelector<HTMLSelectElement>(`[data-inventory-filter="${key}"]`);
    if (!control) throw new Error('Inventory filter is missing.');
    state[key] = control.value;
  }
  return state;
}

export function bindInventory(host: HTMLElement, onSelect: (tab: InventoryTab) => void, onToggle?: (state: InventorySections) => void, onFilter?: (state: InventoryFilters) => void): void {
  if (!host.querySelector('.inventory-hub')) return;
  const tabs = Array.from(host.querySelectorAll<HTMLButtonElement>('[data-inventory-tab]'));
  const select = (tab: InventoryTab, focus = false): void => {
    for (const button of tabs) {
      const active = button.dataset.inventoryTab === tab;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      if (active && focus) button.focus({ preventScroll: true });
    }
    host.querySelectorAll<HTMLElement>('[data-inventory-section]').forEach(panel => { panel.hidden = panel.dataset.inventorySection !== tab; });
    onSelect(tab);
    onToggle?.(inventorySections(host));
  };
  const current = (): InventoryTab => {
    const tab = tabs.find(button => button.getAttribute('aria-selected') === 'true')?.dataset.inventoryTab;
    return isInventoryTab(tab) ? tab : 'materials';
  };
  const update = (): void => {
    const state = inventoryFilters(host);
    const query = state.query.trim().toLowerCase();
    const active = Boolean(query || state.type || state.rarity || state.element);
    const items = Array.from(host.querySelectorAll<HTMLElement>('[data-inventory-entry]'));
    for (const item of items) {
      const data = item.dataset;
      item.hidden = !(data.itemName?.toLowerCase().includes(query)
        && (!state.type || data.itemType === state.type || (state.type === 'conduits' && data.itemType === 'masters'))
        && (!state.rarity || (state.rarity === 'none' ? !data.itemRarity : data.itemRarity === state.rarity))
        && (!state.element || (state.element === 'none' ? !data.itemElements : data.itemElements?.split(' ').includes(state.element))));
    }
    const visibleIn = (tab: InventoryTab): number => Array.from(host.querySelectorAll<HTMLElement>(`[data-inventory-section="${tab}"] [data-inventory-entry]`)).filter(item => !item.hidden).length;
    const wanted: InventoryTab | null = state.type === 'conduits' || state.type === 'masters' ? 'conduits' : state.type ? 'materials' : null;
    if (wanted && wanted !== current()) select(wanted);
    else if (active && !visibleIn(current())) {
      const other: InventoryTab = current() === 'materials' ? 'conduits' : 'materials';
      if (visibleIn(other)) select(other);
    }
    const count = items.filter(item => !item.hidden).length;
    const result = host.querySelector<HTMLElement>('[data-inventory-results]');
    if (!result) throw new Error('Inventory results status is missing.');
    result.textContent = count ? `${count} of ${items.length} owned item types${active ? ' match' : ''}.`
      : active ? 'No owned items match. Change your search or filters.' : 'No owned items yet.';
    onFilter?.(state);
  };
  host.querySelector('[data-inventory-query]')?.addEventListener('input', update);
  host.querySelectorAll('[data-inventory-filter]').forEach(control => control.addEventListener('change', update));
  host.querySelector('[data-inventory-clear]')?.addEventListener('click', () => {
    const query = host.querySelector<HTMLInputElement>('[data-inventory-query]')!;
    query.value = '';
    host.querySelectorAll<HTMLSelectElement>('[data-inventory-filter]').forEach(control => { control.value = ''; });
    update();
    query.focus({ preventScroll: true });
  });
  update();
  tabs.forEach((button, index) => {
    button.addEventListener('click', () => {
      const tab = button.dataset.inventoryTab;
      if (!isInventoryTab(tab)) throw new Error('Unknown Inventory category.');
      if (tab !== current()) select(tab);
    });
    button.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const tab = tabs[(index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length].dataset.inventoryTab;
      if (isInventoryTab(tab)) select(tab, true);
    });
  });
}
