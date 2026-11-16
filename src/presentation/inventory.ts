import { plainEffect } from './effect-copy';
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
import { radiantMasterEffect } from './master-text';
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
import { catalogInformation } from './information-layout';
import { menuPager } from './menu-pagination';

export type InventoryTab = 'materials' | 'conduits';
export type InventorySection = InventoryTab;
export type InventorySections = Record<InventorySection, boolean>;
export const defaultInventorySections: Readonly<InventorySections> = { materials: true, conduits: true };
export interface InventoryFilters { query: string; type: string; rarity: string; element: string; sort: 'rarity' | 'level' | 'name' }
export const defaultInventoryFilters: Readonly<InventoryFilters> = { query: '', type: '', rarity: '', element: '', sort: 'rarity' };

function itemMetadata(name: string, type: string, rarity = '', element = '', level = 0): string {
  return `data-inventory-entry data-menu-page-item data-item-name="${escapeDialogText(name)}" data-item-type="${type}" data-item-rarity="${rarity}" data-item-level="${level}"${rarity ? ` data-rarity="${rarity}"` : ''} data-item-elements="${element}"`;
}

function inventoryInspectionTemplate(id: string, name: string, art: string, badge: string, rows: readonly [string, string][], description: string, extra = '', descriptionHtml = false): string {
  const safeName = escapeDialogText(name);
  return `<button type="button" class="inventory-inspect-trigger" data-inventory-inspect="${escapeDialogText(id)}" aria-label="Inspect ${safeName}"></button>
    <template data-inventory-inspection-template="${escapeDialogText(id)}" data-inspection-name="${safeName}">
      <div class="inventory-inspection-art">${art}</div><div class="inventory-inspection-details">
        ${badge ? `<span class="inventory-inspection-badge">${escapeDialogText(badge)}</span>` : ''}
        ${rows.some(([label]) => label === 'Level') ? `<p class="inventory-inspection-level">${escapeDialogText(rows.find(([label]) => label === 'Level')?.[1] ?? '')}<span>level</span></p>` : ''}
        <dl>${rows.map(([label, value]) => `<div><dt>${escapeDialogText(label)}</dt><dd>${escapeDialogText(value)}</dd></div>`).join('')}</dl>
        <p class="inventory-inspection-description">${descriptionHtml ? description : escapeDialogText(description)}</p>
        ${extra ? `<p class="inventory-inspection-extra">${escapeDialogText(extra)}</p>` : ''}
      </div>
    </template>`;
}

function inventoryInspectionDialog(): string {
  return `<dialog class="information-modal inventory-inspection" id="inventory-item-inspection" aria-labelledby="inventory-inspection-heading">
    <header class="drawer-heading"><h2 id="inventory-inspection-heading" tabindex="-1"></h2><button type="button" class="drawer-close" data-close-information aria-label="Close item details">&times;</button></header>
    <div class="inventory-inspection-content" aria-live="polite"></div>
    <nav class="inventory-inspection-nav" aria-label="Owned item details">
      <button type="button" data-inventory-inspection-step="-1" aria-label="Previous item">&lsaquo;</button>
      <span data-inventory-inspection-count aria-live="polite"></span>
      <button type="button" data-inventory-inspection-step="1" aria-label="Next item">&rsaquo;</button>
    </nav>
  </dialog>`;
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
    { id: 'masters', title: 'Masters & chests', summary: 'Sources and selection', content: `<p>${masterChest.name}s: ${masterChest.chance * 100}% from the stage ${machineStageCount} Machines boss; two guaranteed in each Calamity EX+3 chest.</p><p>Choose any unowned released Master, even for an unowned Element-Bearer. Masters are character-specific and cannot be upgraded.</p><p>Each changes its bearer's Health, Attack, Defense or Recovery and strengthens one ability. Without a Master, stats are unchanged. Chests stay unopened once you own all ${masterConduits.length}.</p>` },
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
      ${catalogInformation({ name: chest.name, art: `<div class="inventory-item-art">${calamityChestIcon(tier)}</div>`, owned: count })}
      <div class="inventory-item-actions">${information(`inventory-${id}-loot`, 'Calamity chest · View Loot', calamityLoot(activity, tier), 'View Loot')}
      <button type="button" class="primary-button" data-open-calamity-chest="${id}">Open</button></div></li>`;
  }).join('') + ((account?.masterChests ?? 0) > 0 ? `<li class="inventory-item" data-inventory-chest="${masterChest.id}" ${itemMetadata(masterChest.name, 'chests')}>
    ${catalogInformation({ name: masterChest.name, art: `<div class="inventory-item-art">${masterChestIcon()}</div>`, owned: account?.masterChests, effects: ['Choose one unowned Omnic Master. Equip it in Team.'] })}
    <div class="inventory-item-actions">${information('inventory-chest-details', masterChest.name, catalogInformation({ name: masterChest.name, art: masterChestIcon(), effects: ['Choose one unowned Omnic Master. Equip it in Team.'], acquisition: `Final Awaken the Machines boss: ${masterChest.chance * 100}% per defeat. Each Calamity EX+3 chest: two. Extra chests stay unopened once you own every Master.` }), 'Details')}
    <button type="button" class="primary-button" data-open-master-chest aria-label="Open ${masterChest.name} · Choose a Master" ${ownedMasters.length === masterConduits.length ? 'disabled' : ''}>Open</button></div></li>` : '');
  const ordinaryMaterials = materials.filter(([id]) => !isCalamiticMaterialId(id));
  const calamiticMaterialItems = materials.filter(([id]) => isCalamiticMaterialId(id));
  const renderMaterials = (items: typeof materials) => items.map(([id, amount]) => {
    const art = materialArt(id);
    const name = materialName(id);
    const rarity = materialRarities.find(value => id.includes(value.toLowerCase())) ?? '';
    const element = elements.find(value => id.startsWith(`${value.infusion}-`));
    const inspectionRows: [string, string][] = [['Type', isCalamiticMaterialId(id) ? 'Calamitic material' : 'Material'], ['Owned', amount.toLocaleString('en-US')]];
    if (rarity) inspectionRows.splice(1, 0, ['Rarity', rarity]);
    if (element) inspectionRows.splice(1, 0, ['Element', element.name]);
    return `<li class="inventory-item" data-inventory-material="${id}" ${materialMetadata(id)}>${catalogInformation({ name, art: `<div class="inventory-item-art">${art ? `<img src="${assetUrl(`materials/${art}.png`)}" alt="" aria-hidden="true" width="256" height="256" loading="lazy">` : '<span>Artwork pending</span>'}</div>`, owned: amount })}
      ${inventoryInspectionTemplate(`material:${id}`, name, art ? `<img src="${assetUrl(`materials/${art}.png`)}" alt="">` : '<span>Artwork pending</span>', rarity || 'Material', inspectionRows, materialDescription(id))}</li>`;
  }).join('');
  const componentDescription = "Upgrades ordinary Conduits up to +5; Conduit Upgrade shows costs. Masters can't be upgraded.";
  const masterItems = ownedMasters.map(entry => {
    const bearer = getStarter(entry.character);
    const equipped = account?.masterEquipment?.[entry.character] === entry.id;
    const effect = plainEffect(escapeDialogText(radiantMasterEffect(entry.id)));
    return `<li class="inventory-item" ${conduitElementTheme(bearer.elementId)} data-inventory-master="${entry.id}" ${itemMetadata(`${entry.name} ${bearer.name}`, 'masters', entry.rarity, bearer.elementId)}>${equipped ? '<span class="inventory-equipped-badge">Equipped</span>' : ''}${catalogInformation({ name: entry.name, art: `<div class="inventory-item-art">${masterConduitIcon(entry.id)}</div>`, metadata: `<span class="conduit-identity-badges"><small>Omnic Master · ${bearer.name}</small>${conduitElementLabel(bearer.elementId)}</span>`, owned: 1 })}
      ${inventoryInspectionTemplate(`master:${entry.id}`, entry.name, masterConduitIcon(entry.id), 'Omnic Master', [['Rarity', entry.rarity], ['Equipped', equipped ? `Equipped by ${bearer.name}` : 'Not equipped'], ['Owned', '1']], effect, `${bearer.name} only · Cannot be upgraded. ${entry.lore}`, true)}</li>`;
  }).join('');
  const conduitItems = ownedConduits.map(conduit => {
    const level = account?.conduitUpgrades?.[conduit.id] ?? 0;
    const amount = account?.conduits?.[conduit.id] ?? 0;
    const equipped = Object.values(account?.conduitEquipment ?? {}).some(slots => slots?.includes(conduit.id));
    const effect = plainEffect(escapeDialogText(conduitEffect(conduit, level)));
    return `<li class="inventory-item" ${omnicTheme(conduit.id)} data-inventory-conduit="${conduit.id}" ${itemMetadata(conduit.name, 'conduits', conduit.rarity, conduit.element ?? '', level)}>${equipped ? '<span class="inventory-equipped-badge">Equipped</span>' : ''}
      ${catalogInformation({ name: conduit.name, art: `<div class="inventory-item-art">${conduitIcon(conduit.id, level)}</div>`, metadata: `<span class="conduit-identity-badges">${conduitRarity(conduit.id)}</span>${conduitElement(conduit.id)}`, owned: amount })}
      ${inventoryInspectionTemplate(`conduit:${conduit.id}`, conduit.name, conduitIcon(conduit.id, level), conduit.rarity,
        [['Rarity', conduit.rarity], ['Level', `${level} / 5`], ['Equipped', equipped ? 'Equipped' : 'Not equipped'], ['Owned', amount.toLocaleString('en-US')]],
        effect, `${conduit.lore} Equip in Team; equipping does not consume a copy.`, true)}</li>`;
  }).join('');
  const empty = (tab: InventoryTab) => `<div class="inventory-empty-slots" aria-hidden="true">${'<i></i>'.repeat(14)}</div>
    <div class="inventory-empty"><h3>${tab === 'materials' ? 'No resources yet' : 'No Conduits owned yet'}</h3></div>`;
  return `<section class="inventory-hub ref-screen ref-inventory" aria-label="Inventory holdings" data-inventory-active-tab="${selected}">
    <div class="inventory-introduction">
    ${inventoryInformation()}</div>
    <div class="inventory-currencies">${(['fractalis', 'lycalis'] as const).map((id) => `<article class="inventory-currency ref-panel" aria-label="${id === 'fractalis' ? 'Prismatica' : 'Null-Prismatica'} balance">
      ${currencyIcon(id)}<div><strong>${account ? account[id] : 'Unavailable'}</strong>
      <span>${id === 'fractalis' ? 'Prismatica' : 'Null-Prismatica'}</span></div></article>`).join('')}
      <article class="inventory-currency ref-panel" aria-label="Calamitic Tokens balance">${currencyIcon('calamitic-tokens')}<div><strong>${account ? (account.calamiticTokens ?? 0) : 'Unavailable'}</strong><span>Calamitic Tokens</span></div></article></div>
    ${!account ? '<p role="alert">Currency inventory unavailable. Check the save error.</p>' : ''}
    <div class="inventory-tools" role="search" aria-label="Find owned items">
      <label class="inventory-search">Search items<input type="search" data-inventory-query placeholder="Search item names" value="${escapeDialogText(filters.query)}" ${!account ? 'disabled' : ''}></label>
      <label class="inventory-type-filter">Item type<select data-inventory-filter="type" ${!account ? 'disabled' : ''}>${[
        ['', 'All types'], ['materials', 'Materials'], ['calamitic', 'Calamitic materials'], ['conduits', 'Conduits'], ['masters', 'Master Conduits'], ['chests', 'Chests'], ['components', 'Components'],
      ].map(([value, text]) => `<option value="${value}" ${filters.type === value ? 'selected' : ''}>${text}</option>`).join('')}</select></label>
      <label class="inventory-sort-filter">Sort by<select data-inventory-sort ${!account ? 'disabled' : ''}>${[
        ['rarity', 'Rarity (highest first)'], ['level', 'Upgrade level (highest first)'], ['name', 'Name (A–Z)'],
      ].map(([value, text]) => `<option value="${value}" ${filters.sort === value ? 'selected' : ''}>${text}</option>`).join('')}</select></label>
      ${([
        ['rarity', 'Rarity', [['', 'All rarities'], ...materialRarities.map(rarity => [rarity, rarity]), ['Calamitic', 'Calamitic'], ['none', 'No rarity']]],
        ['element', 'Element', [['', 'All elements'], ...elements.map(element => [element.id, element.name]), ['none', 'No element']]],
      ] as const).map(([key, label, options]) => `<label class="inventory-filter-source inventory-${key}-select">${label}<select data-inventory-filter="${key}" aria-label="${label}" ${!account ? 'disabled' : ''}>${options.map(([value, text]) => `<option value="${value}" ${filters[key] === value ? 'selected' : ''}>${text}</option>`).join('')}</select></label>`).join('')}
      <button type="button" class="text-button" data-inventory-clear ${!account ? 'disabled' : ''}>Clear</button>
    </div>
    <nav class="inventory-filter-chips inventory-element-filters" data-inventory-chip-set="element" aria-label="Filter by element">${([
      ['', 'All', 'all'], ...elements.map(element => [element.id, element.name, element.id] as const), ['none', 'Shared', 'shared'] as const,
    ] as const).map(([value, label, icon]) => `<button type="button" data-inventory-chip="element" data-inventory-value="${value}" aria-pressed="${filters.element === value || (!filters.element && value === '')}">${icon === 'all' ? '<span aria-hidden="true">•</span>' : icon === 'shared' ? '<span aria-hidden="true">◇</span>' : `<span class="inventory-element-dot" data-element="${icon}" aria-hidden="true"></span>`}${label}</button>`).join('')}</nav>
    <nav class="inventory-filter-chips inventory-rarity-filters" data-inventory-chip-set="rarity" aria-label="Filter by rarity">${([
      ['', 'All'], ...materialRarities.map(value => [value, value] as const), ['Calamitic', 'Calamitic'] as const,
    ] as const).map(([value, label]) => `<button type="button" data-inventory-chip="rarity" data-inventory-value="${value}" aria-pressed="${filters.rarity === value || (!filters.rarity && value === '')}"><span class="rarity-chip-dot" data-rarity="${label}" aria-hidden="true"></span>${label}</button>`).join('')}</nav>
    <p class="inventory-results" data-inventory-results role="status" ${!account ? 'hidden' : ''}></p>
    <div class="inventory-tabs" role="tablist" aria-label="Inventory sections">${([
      ['materials', 'Resources &amp; Items', account ? resourceCount : 'Unavailable'],
      ['conduits', 'Conduits', account ? ownedConduits.length + ownedMasters.length : 'Unavailable'],
    ] as const).map(([tab, label, count]) => `<button type="button" role="tab" id="inventory-tab-${tab}" class="inventory-tab" data-inventory-tab="${tab}" aria-controls="inventory-panel-${tab}" aria-selected="${selected === tab}" tabindex="${selected === tab ? 0 : -1}">${label} · ${count}</button>`).join('')}</div>
    <section class="inventory-panel ref-panel" id="inventory-panel-materials" role="tabpanel" aria-labelledby="inventory-tab-materials" data-inventory-section="materials" data-menu-page-size="24" ${selected === 'materials' ? '' : 'hidden'}>
    <div class="ref-scroll">
    ${!account ? '<p role="alert">Resource inventory unavailable. Check the save error.</p>' : resourceCount
      ? `<ul class="inventory-item-grid">${chestItems}${components > 0 ? `<li class="inventory-item" data-inventory-resource="${mechanicalComponents.id}" ${itemMetadata(mechanicalComponents.name, 'components')}>
        ${catalogInformation({ name: mechanicalComponents.name, art: `<div class="inventory-item-art">${mechanicalComponentIcon()}</div>`, owned: components })}
        ${inventoryInspectionTemplate('resource:mechanical-components', mechanicalComponents.name, mechanicalComponentIcon(), 'Resource', [['Type', 'Component'], ['Owned', components.toLocaleString('en-US')]], componentDescription, machineComponentRulesText)}</li>` : ''}${renderMaterials(ordinaryMaterials)}${renderMaterials(calamiticMaterialItems)}</ul>` : empty('materials')}</div>
    ${account && resourceCount ? menuPager('Inventory resources') : ''}</section>
    <section class="inventory-panel ref-panel" id="inventory-panel-conduits" role="tabpanel" aria-labelledby="inventory-tab-conduits" data-inventory-section="conduits" data-menu-page-size="32" ${selected === 'conduits' ? '' : 'hidden'}>
    <div class="ref-scroll">
    ${!account ? '<p role="alert">Conduit inventory unavailable. Check the save error.</p>' : ownedConduits.length + ownedMasters.length
      ? `<ul class="inventory-item-grid">${conduitItems}${masterItems}</ul>`
      : empty('conduits')}</div>      ${account && ownedConduits.length + ownedMasters.length ? menuPager('Owned Conduits') : ''}</section>
      ${inventoryInspectionDialog()}
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
  const sort = host.querySelector<HTMLSelectElement>('[data-inventory-sort]');
  if (!sort || (sort.value !== 'rarity' && sort.value !== 'level' && sort.value !== 'name')) throw new Error('Inventory sort is missing or invalid.');
  state.sort = sort.value;
  return state;
}

function sortInventoryItems(host: HTMLElement, sort: InventoryFilters['sort']): void {
  const rarityRank: Record<string, number> = Object.fromEntries([...materialRarities, 'Calamitic'].map((rarity, index) => [rarity, index]));
  const groups = new Set(Array.from(host.querySelectorAll<HTMLElement>('[data-inventory-entry]'), item => item.parentElement).filter((parent): parent is HTMLElement => parent !== null));
  for (const group of groups) {
    const items = Array.from(group.querySelectorAll<HTMLElement>(':scope > [data-inventory-entry]'));
    items.sort((a, b) => {
      const byRarity = (rarityRank[b.dataset.itemRarity ?? ''] ?? -1) - (rarityRank[a.dataset.itemRarity ?? ''] ?? -1);
      const byLevel = Number(b.dataset.itemLevel ?? 0) - Number(a.dataset.itemLevel ?? 0);
      const byName = (a.dataset.itemName ?? '').localeCompare(b.dataset.itemName ?? '');
      return sort === 'name' ? byName : sort === 'level' ? byLevel || byRarity || byName : byRarity || byLevel || byName;
    });
    items.forEach(item => group.append(item));
  }
}

export function bindInventory(host: HTMLElement, onSelect: (tab: InventoryTab) => void, onToggle?: (state: InventorySections) => void, onFilter?: (state: InventoryFilters) => void): void {
  if (!host.querySelector('.inventory-hub')) return;
  const inventory = host.querySelector<HTMLElement>('.inventory-hub')!;
  const tabs = Array.from(host.querySelectorAll<HTMLButtonElement>('[data-inventory-tab]'));
  const select = (tab: InventoryTab, focus = false): void => {
    for (const button of tabs) {
      const active = button.dataset.inventoryTab === tab;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      if (active && focus) button.focus({ preventScroll: true });
    }
    host.querySelectorAll<HTMLElement>('[data-inventory-section]').forEach(panel => { panel.hidden = panel.dataset.inventorySection !== tab; });
    inventory.dataset.inventoryActiveTab = tab;
    host.querySelectorAll<HTMLElement>('[data-inventory-chip-set]').forEach(set => {
      set.hidden = set.dataset.inventoryChipSet !== (tab === 'materials' ? 'element' : 'rarity');
    });
    onSelect(tab);
    onToggle?.(inventorySections(host));
  };
  const current = (): InventoryTab => {
    const tab = tabs.find(button => button.getAttribute('aria-selected') === 'true')?.dataset.inventoryTab;
    return isInventoryTab(tab) ? tab : 'materials';
  };
  const inspectionDialog = host.querySelector<HTMLDialogElement>('#inventory-item-inspection');
  if (!inspectionDialog) throw new Error('Inventory item inspection is missing.');
  const inspectionContent = inspectionDialog.querySelector<HTMLElement>('.inventory-inspection-content');
  const inspectionTitle = inspectionDialog.querySelector<HTMLElement>('#inventory-inspection-heading');
  const inspectionCount = inspectionDialog.querySelector<HTMLElement>('[data-inventory-inspection-count]');
  const inspectionSteps = Array.from(inspectionDialog.querySelectorAll<HTMLButtonElement>('[data-inventory-inspection-step]'));
  if (!inspectionContent || !inspectionTitle || !inspectionCount || inspectionSteps.length !== 2) throw new Error('Inventory item inspection controls are missing.');
  let inspectionItems: HTMLElement[] = [];
  let inspectionIndex = -1;
  const showInspection = (index: number, open: boolean): void => {
    const item = inspectionItems[index];
    if (!item) throw new Error('Inventory item selection is unavailable.');
    const template = item.querySelector<HTMLTemplateElement>('template[data-inventory-inspection-template]');
    if (!template) throw new Error('Inventory item details are missing.');
    inspectionIndex = index;
    inspectionTitle.textContent = template.dataset.inspectionName ?? '';
    inspectionContent.replaceChildren(template.content.cloneNode(true));
    inspectionCount.textContent = `${index + 1} / ${inspectionItems.length}`;
    inspectionSteps.forEach(button => { button.disabled = inspectionItems.length < 2; });
    if (open && !inspectionDialog.open) {
      inspectionDialog.showModal();
      inspectionTitle.focus({ preventScroll: true });
    }
  };
  host.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const trigger = event.target.closest<HTMLButtonElement>('[data-inventory-inspect]');
    if (trigger) {
      const panel = trigger.closest<HTMLElement>('[data-inventory-section]');
      const selectedItem = trigger.closest<HTMLElement>('[data-inventory-entry]');
      if (!panel || !selectedItem) throw new Error('Inventory item location is missing.');
      inspectionItems = Array.from(panel.querySelectorAll<HTMLElement>('[data-inventory-entry]'))
        .filter(item => item.dataset.menuFiltered !== 'true' && item.querySelector('[data-inventory-inspect]'));
      const index = inspectionItems.indexOf(selectedItem);
      if (index < 0) throw new Error('Inventory item is not in the current results.');
      showInspection(index, true);
      return;
    }
    const step = event.target.closest<HTMLButtonElement>('[data-inventory-inspection-step]');
    if (!step || !inspectionDialog.open || inspectionItems.length < 2) return;
    const direction = Number(step.dataset.inventoryInspectionStep);
    if (direction !== -1 && direction !== 1) throw new Error('Invalid inventory inspection direction.');
    showInspection((inspectionIndex + direction + inspectionItems.length) % inspectionItems.length, false);
  });
  const update = (): void => {
    const state = inventoryFilters(host);
    const query = state.query.trim().toLowerCase();
    const active = Boolean(query || state.type || state.rarity || state.element);
    const items = Array.from(host.querySelectorAll<HTMLElement>('[data-inventory-entry]'));
    for (const item of items) {
      const data = item.dataset;
      const hidden = !(data.itemName?.toLowerCase().includes(query)
        && (!state.type || data.itemType === state.type || (state.type === 'conduits' && data.itemType === 'masters'))
        && (!state.rarity || (state.rarity === 'none' ? !data.itemRarity : data.itemRarity === state.rarity))
        && (!state.element || (state.element === 'none' ? !data.itemElements : data.itemElements?.split(' ').includes(state.element))));
      item.dataset.menuFiltered = String(hidden);
      item.hidden = hidden;
    }
    sortInventoryItems(host, state.sort);
    host.querySelectorAll<HTMLElement>('[data-inventory-section][data-menu-page-size]')
      .forEach(panel => panel.dispatchEvent(new Event('menu-list-filtered')));
    const visibleIn = (tab: InventoryTab): number => Array.from(host.querySelectorAll<HTMLElement>(`[data-inventory-section="${tab}"] [data-inventory-entry]`)).filter(item => !item.hidden).length;
    const wanted: InventoryTab | null = state.type === 'conduits' || state.type === 'masters' ? 'conduits' : state.type ? 'materials' : null;
    if (wanted && wanted !== current()) select(wanted);
    else if (active && !visibleIn(current())) {
      const other: InventoryTab = current() === 'materials' ? 'conduits' : 'materials';
      if (visibleIn(other)) select(other);
    }
    const count = items.filter(item => item.dataset.menuFiltered !== 'true').length;
    const result = host.querySelector<HTMLElement>('[data-inventory-results]');
    if (!result) throw new Error('Inventory results status is missing.');
    result.textContent = count ? `${count} of ${items.length} owned item types${active ? ' match' : ''}.`
      : active ? 'No owned items match. Change your search or filters.' : '';
    inventory.dataset.inventoryActiveTab = current();
    host.querySelectorAll<HTMLButtonElement>('[data-inventory-chip]').forEach(button => {
      const key = button.dataset.inventoryChip;
      if (key !== 'element' && key !== 'rarity') throw new Error('Unknown Inventory filter chip.');
      const value = state[key];
      button.setAttribute('aria-pressed', String(button.dataset.inventoryValue === value || (!value && !button.dataset.inventoryValue)));
    });
    host.querySelectorAll<HTMLElement>('[data-inventory-chip-set]').forEach(set => {
      set.hidden = set.dataset.inventoryChipSet !== (current() === 'materials' ? 'element' : 'rarity');
    });
    // With nothing owned, the panel's own empty heading already says so; an unavailable save shows its alert instead.
    const unavailable = host.querySelector<HTMLInputElement>('[data-inventory-query]')?.disabled ?? false;
    result.hidden = unavailable || (!count && !active);
    onFilter?.(state);
  };
  host.querySelector('[data-inventory-query]')?.addEventListener('input', update);
  host.querySelectorAll('[data-inventory-filter]').forEach(control => control.addEventListener('change', update));
  host.querySelector('[data-inventory-sort]')?.addEventListener('change', update);
  host.querySelectorAll<HTMLButtonElement>('[data-inventory-chip]').forEach(button => {
    button.addEventListener('click', () => {
      const key = button.dataset.inventoryChip;
      if (key !== 'element' && key !== 'rarity') throw new Error('Unknown Inventory filter chip.');
      const control = host.querySelector<HTMLSelectElement>(`[data-inventory-filter="${key}"]`);
      if (!control) throw new Error('Inventory filter is missing.');
      control.value = button.dataset.inventoryValue ?? '';
      control.dispatchEvent(new Event('change'));
    });
  });
  host.querySelector('[data-inventory-clear]')?.addEventListener('click', () => {
    const query = host.querySelector<HTMLInputElement>('[data-inventory-query]')!;
    query.value = '';
    host.querySelectorAll<HTMLSelectElement>('[data-inventory-filter]').forEach(control => { control.value = ''; });
    const sort = host.querySelector<HTMLSelectElement>('[data-inventory-sort]');
    if (!sort) throw new Error('Inventory sort is missing.');
    sort.value = 'rarity';
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
