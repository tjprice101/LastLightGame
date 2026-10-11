import { type Account } from '../game/account';
import { conduits, conduitEffect } from '../content/conduits';
import { mechanicalComponentIcon } from './mechanical-component-icon';
import { currencyIcon } from './currency-icon';
import { conduitIcon, conduitRarity } from './conduit-store';
import { materialArt, materialName } from '../content/dungeon-art';
import { assetUrl } from './portrait';
import { information } from './information';
import './inventory.css';
import { masterChest, masterConduits, masterRulesText } from '../content/master-conduits';
import { masterChestIcon, masterConduitIcon } from './master-conduits';
import { getStarter } from '../content/starters';

export type InventoryTab = 'materials' | 'conduits';
export function isInventoryTab(value: unknown): value is InventoryTab {
  return value === 'materials' || value === 'conduits';
}

export function inventoryView(account: Account | null, selected: InventoryTab = 'materials'): string {
  const materials = Object.entries(account?.materials ?? {}).filter(([, amount]) => amount > 0);
  const ownedConduits = conduits.filter((conduit) => (account?.conduits?.[conduit.id] ?? 0) > 0);
  const empty = (tab: InventoryTab) => `<div class="inventory-empty-slots" aria-hidden="true">${'<i></i>'.repeat(14)}</div>
    <div class="inventory-empty"><h3>${tab === 'materials' ? 'No materials yet' : 'No Conduits owned yet'}</h3>
    <button type="button" class="text-button" data-page="${tab === 'materials' ? 'gameplay' : 'conduit-store'}">${tab === 'materials' ? 'Go to dungeons &rarr;' : 'Visit Conduit Store &rarr;'}</button></div>`;
  return `<section class="inventory-hub ref-screen ref-inventory" aria-label="Inventory holdings">
    <div class="inventory-introduction">
    ${information('inventory-information', 'Inventory', `<p>Inventory lists saved currencies and owned materials and Conduit counts. Panel counts show distinct owned item types, not the sum of stack quantities. Only positive stacks appear.</p><p>Materials are earned in Story, elemental dungeons, Heaven, Abyss and Passion of Crimson Roses. Summon banners also award Common, Uncommon and Rare material bundles instead of Elemental-Devourers; Standard uses all six elements and Roses uses Rosethorn materials. Duplicate Element-Bearers convert into larger Rare bundles. Common Conduits are purchased in the Store; higher tiers drop in Awaken the Machines, with an additional Legendary bonus possible on banners. Equipment and Elemental-Devourer copies are managed in Team; galleries are in Collections. One owned ordinary Conduit unlocks it for all characters; equipping does not consume it. Each character can equip at most four ordinary Omnic Conduits, all matching their combat element.</p><p>${masterRulesText}</p>`)}</div>
    <div class="inventory-currencies">${(['fractalis', 'lycalis'] as const).map((id) => `<article class="inventory-currency ref-panel" aria-label="${id === 'fractalis' ? 'Prismatica' : 'Null-Prismatica'} balance">
      ${currencyIcon(id)}<div><strong>${account ? account[id] : 'Unavailable'}</strong>
      <span>${id === 'fractalis' ? 'Prismatica' : 'Null-Prismatica'}</span></div></article>`).join('')}
      </div>
    ${!account ? '<p role="alert">Currency inventory unavailable. Check the save error.</p>' : ''}
    <section class="inventory-panel ref-panel inventory-masters" aria-label="Master Conduits and chests">
      <header class="ref-panel-heading">Masters · ${masterConduits.filter(entry => account?.masterConduits?.[entry.id] === 1).length} / 48</header>
      <article class="inventory-item"><strong>${masterChest.name}</strong>${masterChestIcon()}
        <span>Owned ${account?.masterChests ?? 0}</span><p>${masterChest.description}</p>
        <button class="primary-button" data-open-master-chest ${!account || (account.masterChests ?? 0) < 1 || masterConduits.every(entry => account.masterConduits?.[entry.id] === 1) ? 'disabled' : ''}>Open chest · Choose a Master</button>
        <small>Final Awaken the Machines boss only · 1% per defeat. When all Masters are owned, extra chests stay unopened.</small></article>
      <ul class="inventory-item-grid">${masterConduits.filter(entry => account?.masterConduits?.[entry.id] === 1).map(entry => `<li class="inventory-item">${masterConduitIcon(entry.id)}<strong>${entry.name}</strong>
        <small>Omnic Master · ${getStarter(entry.character).name}</small><p>${entry.effect}</p><button class="text-button" data-page="character">Equip in Team</button></li>`).join('')}</ul>
    </section>
    <section class="inventory-panel ref-panel" id="inventory-panel-materials" aria-label="Owned materials">
    <header class="ref-panel-heading">Materials · ${account ? materials.length : 'Unavailable'}</header><div class="ref-scroll">
    ${!account ? '<p role="alert">Material inventory unavailable. Check the save error.</p>' : materials.length
      ? `<ul class="inventory-item-grid">${materials.map(([id, amount]) => {
        const art = materialArt(id);
        return `<li class="inventory-item" data-inventory-material="${id}"><div class="inventory-item-art">${art ? `<img src="${assetUrl(`materials/${art}.png`)}" alt="" aria-hidden="true" width="256" height="256" loading="lazy">` : '<span>Artwork pending</span>'}</div>
          <strong>${materialName(id)}</strong><span class="inventory-quantity">Owned ${amount}</span></li>`;
      }).join('')}</ul>` : empty('materials')}</div></section>
    <section class="inventory-panel ref-panel" id="inventory-panel-conduits" aria-label="Owned Conduits">
    <header class="ref-panel-heading">Conduits · ${account ? ownedConduits.length : 'Unavailable'}<span><button class="ref-link" data-page="conduit-upgrade">Upgrade</button><button class="ref-link" data-page="conduit-store">Store</button></span></header>
    <p class="ref-component-count">${mechanicalComponentIcon()}<span>${account ? account.mechanicalComponents ?? 0 : 'Unavailable'} Broken Mechanical Components</span></p><div class="ref-scroll">
    ${!account ? '<p role="alert">Conduit inventory unavailable. Check the save error.</p>' : ownedConduits.length
      ? `<ul class="inventory-item-grid">${ownedConduits.map((conduit) => `<li class="inventory-item" data-inventory-conduit="${conduit.id}">
        <div class="inventory-item-art">${conduitIcon(conduit.id, account?.conduitUpgrades?.[conduit.id])}</div><strong>${conduit.name}</strong>${conduitRarity(conduit.id)}<small>${conduitEffect(conduit, account?.conduitUpgrades?.[conduit.id])}</small><span class="inventory-quantity">Owned ${account?.conduits?.[conduit.id]}</span></li>`).join('')}</ul>`
      : empty('conduits')}</div></section>
  </section>`;
}

export function bindInventory(host: HTMLElement, onSelect: (tab: InventoryTab) => void): void {
  const tabs = Array.from(host.querySelectorAll<HTMLButtonElement>('[data-inventory-tab]'));
  const select = (button: HTMLButtonElement, focus: boolean) => {
    const tab = button.dataset.inventoryTab;
    if (!isInventoryTab(tab)) throw new Error('Unknown Inventory category.');
    for (const candidate of tabs) {
      candidate.setAttribute('aria-selected', String(candidate === button));
      candidate.tabIndex = candidate === button ? 0 : -1;
      const panel = host.querySelector<HTMLElement>(`#${candidate.getAttribute('aria-controls')}`);
      if (!panel) throw new Error('Inventory category panel is missing.');
      panel.hidden = candidate !== button;
    }
    onSelect(tab);
    if (focus) button.focus();
  };
  tabs.forEach((button, index) => {
    button.addEventListener('click', () => select(button, false));
    button.addEventListener('keydown', (event) => {
      const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (!offset && event.key !== 'Home' && event.key !== 'End') return;
      event.preventDefault();
      const destination = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + offset + tabs.length) % tabs.length;
      select(tabs[destination], true);
    });
  });
}
