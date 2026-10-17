import { type Account } from '../game/account';
import { conduits, conduitEffect } from '../content/conduits';
import { mechanicalComponentIcon } from './mechanical-component-icon';
import { currencyIcon } from './currency-icon';
import { conduitIcon, conduitRarity } from './conduit-store';
import { materialArt, materialName } from '../content/dungeon-art';
import { assetUrl } from './portrait';
import { information, informationTopics } from './information';
import './inventory.css';
import { masterChest, masterConduits } from '../content/master-conduits';
import { masterChestIcon, masterConduitIcon } from './master-conduits';
import { getStarter } from '../content/starters';
import { specialtyMaterials } from '../content/infusions';
import { roseMaterials } from '../content/roses';
import { elementalMaterials, elements, materialRarities } from '../content/activities';
import { escapeDialogText } from './game-dialog';
import { mechanicalComponents, machineComponentRulesText } from '../content/mechanical-components';
import { calamityChest, parseCalamityChestId } from '../content/calamity';
import { calamityLoot, calamityChestIcon } from './calamity';
import { conduitGlossary } from '../content/conduit-glossary';

export type InventoryTab = 'materials' | 'conduits';
export type InventorySection = InventoryTab | 'masters';
export type InventorySections = Record<InventorySection, boolean>;
export const defaultInventorySections: Readonly<InventorySections> = { masters: true, materials: true, conduits: true };
export interface InventoryFilters { query: string; type: string; rarity: string; element: string }
export const defaultInventoryFilters: Readonly<InventoryFilters> = { query: '', type: '', rarity: '', element: '' };

function itemMetadata(name: string, type: string, rarity = '', element = ''): string {
  return `data-inventory-entry data-item-name="${escapeDialogText(name)}" data-item-type="${type}" data-item-rarity="${rarity}" data-item-elements="${element}"`;
}

function materialMetadata(id: string): string {
  const ordinary = elementalMaterials.find(entry => entry.id === id);
  const rose = roseMaterials.find(entry => entry.id === id);
  const specialty = specialtyMaterials.find(entry => entry.id === id);
  return itemMetadata(materialName(id), 'materials', ordinary?.rarity ?? rose?.rarity ?? '',
    ordinary?.elementId ?? (specialty ? elements.filter(element => id.startsWith(`${element.infusion}-`)).map(element => element.id).join(' ') : ''));
}

function inventoryInformation(): string {
  return information('inventory-information', 'Inventory', informationTopics('inventory-help', [
    { id: 'holdings', title: 'Finding items', summary: 'Search, filters and quantities', content: '<p>Search by name or filter by item type, rarity and element. Clear resets the filters.</p><p>Panel counts show distinct owned item types, not total quantities. Details explains each item.</p><p>No element shows items without an element, including materials used by several elements.</p>' },
    { id: 'materials', title: 'Materials', summary: 'Sources and banner bundles', content: '<p>Earn materials in Story, elemental dungeons, Heaven, Abyss and Passion of Crimson Roses.</p><p>Summons award Common, Uncommon or Rare material bundles instead of Devourers. Standard uses all six elements; Roses uses Rosethorn materials. Duplicate Element-Bearers convert into larger Rare bundles.</p><p>Check Level and Evolution for exact costs. Equipment and captured copies are managed in Team; galleries are in Collections.</p>' },
    { id: 'conduits', title: 'Conduits', summary: 'Acquisition and equipment', content: '<p>Common Conduits are purchased in the Store; higher tiers drop in Awaken the Machines. Banners can also award a Legendary bonus.</p><p>One owned copy unlocks an ordinary Conduit for all characters. Equipping never consumes it.</p><p>Omnic Conduits must match the wearer’s combat element. Broken Mechanical Components fund ordinary Conduit upgrades.</p>' },
    { id: 'conduit-terms', title: 'Conduit terms', summary: 'Words used in Conduit effects', content: `<dl class="conduit-glossary">${conduitGlossary.map(entry => `<dt>${entry.term}</dt><dd>${entry.definition}</dd>`).join('')}</dl>` },
    { id: 'masters', title: 'Masters & chests', summary: 'Opening chests and choosing a Master', content: '<p>The final Machines boss (stage 100) has a separate 1% Cosmic Grand Master Chest drop chance. Every Calamity EX+3 chest contains two guaranteed Cosmic Grand Master Chests.</p><p>Open a Calamity chest to receive its rewards. View Loot shows the guaranteed contents and chances for random rewards.</p><p>Open a Master chest to choose one unowned Omnic Master, even for an Element-Bearer you do not own yet. Opening uses one chest but does not equip the Master. Extra chests stay unopened once you own all 48 Masters.</p><p>A Master equips only to its named bearer, in a separate slot. It uses no ordinary slots or copies and cannot be upgraded. Check Details for its effect and limits.</p>' },
  ]));
}
export function isInventoryTab(value: unknown): value is InventoryTab {
  return value === 'materials' || value === 'conduits';
}

function materialDescription(id: string): string {
  materialName(id);
  if (id.endsWith('-weapon') && specialtyMaterials.some(material => material.id === id)) {
    return 'A specialty weapon material retained in your inventory. Weapon upgrading is currently unavailable; this material is not spent by Level or Evolution.';
  }
  if (id.endsWith('-level') && specialtyMaterials.some(material => material.id === id)) {
    return 'A specialty leveling material used by matching Element-Bearers in their Legendary and Omnic forms. Check Level for the exact amount required.';
  }
  if (id.endsWith('-evolution') && specialtyMaterials.some(material => material.id === id)) {
    return 'A specialty evolution material used by matching Element-Bearers for their late-form evolutions. Check Evolution for the exact amount required.';
  }
  if (roseMaterials.some(material => material.id === id)) {
    return 'A Rosethorn progression material for Rosetta, Thornia and Crinso. Their Level and Evolution previews show which tiers and quantities each upgrade uses.';
  }
  return 'An elemental progression material. Matching Level and Evolution recipes show the required tier and quantity before you spend it.';
}

export function inventoryView(account: Account | null, selected: InventoryTab = 'materials', sections: Readonly<InventorySections> = defaultInventorySections, filters: Readonly<InventoryFilters> = defaultInventoryFilters): string {
  const materials = Object.entries(account?.materials ?? {}).filter(([, amount]) => amount > 0);
  const components = account?.mechanicalComponents ?? 0;
  const calamityChests = Object.entries(account?.calamityChests ?? {}).filter(([, count]) => count > 0);
  const resourceCount = materials.length + (components > 0 ? 1 : 0);
  const ownedConduits = conduits.filter((conduit) => (account?.conduits?.[conduit.id] ?? 0) > 0);
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
        ['type', 'Item type', [['', 'All types'], ['materials', 'Materials'], ['conduits', 'Conduits'], ['masters', 'Master Conduits'], ['chests', 'Chests'], ['components', 'Components']]],
        ['rarity', 'Rarity', [['', 'All rarities'], ...materialRarities.map(rarity => [rarity, rarity]), ['Calamitic', 'Calamitic'], ['none', 'No rarity']]],
        ['element', 'Element', [['', 'All elements'], ...elements.map(element => [element.id, element.name]), ['none', 'No element']]],
      ] as const).map(([key, label, options]) => `<label>${label}<select data-inventory-filter="${key}" ${!account ? 'disabled' : ''}>${options.map(([value, text]) => `<option value="${value}" ${filters[key] === value ? 'selected' : ''}>${text}</option>`).join('')}</select></label>`).join('')}
      <button type="button" class="text-button" data-inventory-clear ${!account ? 'disabled' : ''}>Clear</button>
    </div>
    <p class="inventory-results" data-inventory-results role="status" ${!account ? 'hidden' : ''}></p>
    <details class="inventory-panel ref-panel inventory-masters" data-inventory-section="masters" ${sections.masters ? 'open' : ''}>
      <summary class="ref-panel-heading">Master Conduits &amp; Chests · ${account ? masterConduits.filter(entry => account.masterConduits?.[entry.id] === 1).length : 'Unavailable'} / ${masterConduits.length}</summary>
      ${!account ? '<p role="alert">Master inventory unavailable. Check the save error.</p>' : ''}
      <ul class="inventory-item-grid">${calamityChests.map(([id, count]) => {
        const { activity, tier } = parseCalamityChestId(id);
        const chest = calamityChest(activity, tier);
        return `<li class="inventory-item" data-inventory-chest="${id}" ${itemMetadata(chest.name, 'chests')}>
          <div class="inventory-item-art">${calamityChestIcon(tier)}</div>
          <strong>${escapeDialogText(chest.name)}</strong><span class="inventory-quantity">Owned ${count}</span>
          ${information(`inventory-${id}-loot`, chest.name, calamityLoot(activity, tier), 'View Loot')}
          <button type="button" class="primary-button" data-open-calamity-chest="${id}">Open one chest</button></li>`;
      }).join('')}${(account?.masterChests ?? 0) > 0 ? `<li class="inventory-item" data-inventory-chest="${masterChest.id}" ${itemMetadata(masterChest.name, 'chests')}>
        <button type="button" class="inventory-item-art inventory-chest-control" data-open-master-chest aria-label="Open ${masterChest.name} · Choose a Master" ${masterConduits.every(entry => account?.masterConduits?.[entry.id] === 1) ? 'disabled' : ''}>${masterChestIcon()}</button>
        <strong>${masterChest.name}</strong><small>Consumable chest</small>
        <span class="inventory-quantity">Owned ${account?.masterChests}</span>
        ${information('inventory-chest-details', masterChest.name, `<div class="inventory-detail-art">${masterChestIcon()}</div><p>A choice chest for one unowned Omnic Master.</p><p>Each opening consumes one chest and unlocks your chosen unowned Master; it does not equip the reward.</p><p>Final Awaken the Machines boss: 1% chance per defeat. Every Calamity EX+3 chest: two guaranteed Master chests. When all Masters are owned, extra chests stay unopened.</p>`, 'Details')}</li>` : ''}${masterConduits.filter(entry => account?.masterConduits?.[entry.id] === 1).map(entry => `<li class="inventory-item" data-inventory-master="${entry.id}" ${itemMetadata(`${entry.name} ${getStarter(entry.character).name}`, 'masters', entry.rarity, getStarter(entry.character).elementId)}><div class="inventory-item-art">${masterConduitIcon(entry.id)}</div><strong>${entry.name}</strong>
        <small>Omnic Master · ${getStarter(entry.character).name}</small><span class="inventory-quantity">Owned 1</span>
        ${information(`inventory-${entry.id}-details`, entry.name, `<div class="inventory-detail-art">${masterConduitIcon(entry.id)}</div><p>Omnic Master for ${getStarter(entry.character).name}.</p><h3>Effect</h3><p>${entry.effect}</p><p>Always active while equipped to its named Element-Bearer. No upgrades; generated Conduit effects cannot trigger it. Existing caps, skill costs and recovery still apply.</p><h3>Origin</h3><p>${entry.lore}</p>`, 'Details')}</li>`).join('')}</ul>
      ${account && !calamityChests.length && !(account.masterChests ?? 0) && !masterConduits.some(entry => account.masterConduits?.[entry.id] === 1) ? '<p class="inventory-empty">No Master Conduits or chests owned yet.</p>' : ''}
    </details>
    <details class="inventory-panel ref-panel" id="inventory-panel-materials" data-inventory-section="materials" ${sections.materials ? 'open' : ''}>
    <summary class="ref-panel-heading">Resources · ${account ? resourceCount : 'Unavailable'}</summary><div class="ref-scroll">
    ${!account ? '<p role="alert">Resource inventory unavailable. Check the save error.</p>' : resourceCount
      ? `<ul class="inventory-item-grid">${components > 0 ? `<li class="inventory-item" data-inventory-resource="${mechanicalComponents.id}" ${itemMetadata(mechanicalComponents.name, 'components')}>
        <div class="inventory-item-art">${mechanicalComponentIcon()}</div><strong>${mechanicalComponents.name}</strong><span class="inventory-quantity">Owned ${components}</span>
        ${information('inventory-components-details', mechanicalComponents.name, `<div class="inventory-detail-art">${mechanicalComponentIcon()}</div><p>Owned ${components}</p><h3>Use</h3><p>Spend these resources to upgrade ordinary Conduits, up to +5. Masters cannot be upgraded. Check Conduit Upgrade for each exact cost.</p><h3>Source</h3><p>${machineComponentRulesText}</p>`, 'Details')}</li>` : ''}${materials.map(([id, amount]) => {
        const art = materialArt(id);
        return `<li class="inventory-item" data-inventory-material="${id}" ${materialMetadata(id)}><div class="inventory-item-art">${art ? `<img src="${assetUrl(`materials/${art}.png`)}" alt="" aria-hidden="true" width="256" height="256" loading="lazy">` : '<span>Artwork pending</span>'}</div>
          <strong>${materialName(id)}</strong><span class="inventory-quantity">Owned ${amount}</span>
          ${information(`inventory-${id}-details`, materialName(id), `<p>Owned ${amount}</p><p>${materialDescription(id)}</p>`, 'Details')}</li>`;
      }).join('')}</ul>` : empty('materials')}</div></details>
    <details class="inventory-panel ref-panel" id="inventory-panel-conduits" data-inventory-section="conduits" ${sections.conduits ? 'open' : ''}>
    <summary class="ref-panel-heading">Conduits · ${account ? ownedConduits.length : 'Unavailable'}</summary>
    <div class="ref-scroll">
    ${!account ? '<p role="alert">Conduit inventory unavailable. Check the save error.</p>' : ownedConduits.length
      ? `<ul class="inventory-item-grid">${ownedConduits.map((conduit) => `<li class="inventory-item" data-inventory-conduit="${conduit.id}" ${itemMetadata(conduit.name, 'conduits', conduit.rarity, conduit.element ?? '')}>
        <div class="inventory-item-art">${conduitIcon(conduit.id, account?.conduitUpgrades?.[conduit.id])}</div><strong>${conduit.name}</strong>${conduitRarity(conduit.id)}<span class="inventory-quantity">Owned ${account?.conduits?.[conduit.id]}</span>
        ${information(`inventory-${conduit.id}-details`, conduit.name, `<div class="inventory-detail-art">${conduitIcon(conduit.id, account?.conduitUpgrades?.[conduit.id])}</div><p>${conduit.rarity} Conduit · Upgrade +${account?.conduitUpgrades?.[conduit.id] ?? 0} of 5</p><h3>Effect</h3><p>${conduitEffect(conduit, account?.conduitUpgrades?.[conduit.id])}</p><p>Ordinary upgrades scale each effect as specified, including its stated caps and thresholds.</p><h3>Background</h3><p>${conduit.lore}</p><p>Owned ${account?.conduits?.[conduit.id]}. Equipping does not consume a copy; manage equipment in Team.</p>`, 'Details')}</li>`).join('')}</ul>`
      : empty('conduits')}</div></details>
  </section>`;
}

export function inventorySections(host: HTMLElement): InventorySections {
  const state = { ...defaultInventorySections };
  host.querySelectorAll<HTMLDetailsElement>('[data-inventory-section]').forEach(panel => {
    const section = panel.dataset.inventorySection;
    if (section !== 'masters' && !isInventoryTab(section)) throw new Error('Unknown Inventory category.');
    state[section] = panel.open;
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
  const update = (): void => {
    const state = inventoryFilters(host);
    const query = state.query.trim().toLowerCase();
    const active = Boolean(query || state.type || state.rarity || state.element);
    const items = Array.from(host.querySelectorAll<HTMLElement>('[data-inventory-entry]'));
    for (const item of items) {
      const data = item.dataset;
      item.hidden = !(data.itemName?.toLowerCase().includes(query)
        && (!state.type || data.itemType === state.type)
        && (!state.rarity || (state.rarity === 'none' ? !data.itemRarity : data.itemRarity === state.rarity))
        && (!state.element || (state.element === 'none' ? !data.itemElements : data.itemElements?.split(' ').includes(state.element))));
    }
    host.querySelectorAll<HTMLElement>('[data-inventory-section]').forEach(panel => {
      panel.hidden = active && !panel.querySelector('[role="alert"]')
        && !Array.from(panel.querySelectorAll<HTMLElement>('[data-inventory-entry]')).some(item => !item.hidden);
    });
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
  host.querySelectorAll<HTMLDetailsElement>('[data-inventory-section]').forEach(panel => {
    panel.addEventListener('toggle', () => {
      const section = panel.dataset.inventorySection;
      if (section !== 'masters' && !isInventoryTab(section)) throw new Error('Unknown Inventory category.');
      if (panel.open && isInventoryTab(section)) onSelect(section);
      onToggle?.(inventorySections(host));
    });
  });
}
