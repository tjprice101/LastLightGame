import { type Account } from '../game/account';
import { conduits, conduitEffect } from '../content/conduits';
import { mechanicalComponentIcon } from './mechanical-component-icon';
import { currencyIcon } from './currency-icon';
import { conduitIcon, conduitRarity } from './conduit-store';
import { materialArt, materialName } from '../content/dungeon-art';
import { assetUrl } from './portrait';
import { information } from './information';
import './inventory.css';

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
  return `<section class="inventory-hub" aria-label="Inventory holdings">
    <div class="inventory-introduction"><button class="text-button" data-page="conduit-upgrade">Conduit Upgrade &rarr;</button>
    ${information('inventory-information', 'Inventory', '<p>Inventory lists saved currencies and owned materials and Conduit counts. Tab counts show distinct owned item types, not the sum of stack quantities. Only positive stacks appear.</p><p>Materials are earned in elemental dungeons, Heaven, Abyss and Passion of Crimson Roses. Common Conduits are purchased in the Store; higher tiers drop in Awaken the Machines, with an additional Legendary bonus possible on banners. Equipment and creature copies are managed in Character; galleries are in Collections. One owned Conduit unlocks it for all characters; equipping does not consume it. Each character may equip at most four Omnic, matching their combat element.</p>')}</div>
    <div class="inventory-currencies">${(['fractalis', 'lycalis'] as const).map((id) => `<article class="inventory-currency" aria-label="${id === 'fractalis' ? 'Prismatica' : 'Null-Prismatica'} balance">
      ${currencyIcon(id)}<div><strong>${account ? account[id] : 'Unavailable'}</strong>
      <span>${id === 'fractalis' ? 'Prismatica' : 'Null-Prismatica'}</span></div></article>`).join('')}
      <article class="inventory-currency" aria-label="Broken Mechanical Components balance">${mechanicalComponentIcon()}<div><strong>${account ? account.mechanicalComponents ?? 0 : 'Unavailable'}</strong><span>Broken Mechanical Components</span></div></article></div>
    ${!account ? '<p role="alert">Currency inventory unavailable. Check the save error.</p>' : ''}
    <div class="inventory-tabs" role="tablist" aria-label="Inventory categories">${(['materials', 'conduits'] as const).map((tab) =>
      `<button type="button" role="tab" id="inventory-tab-${tab}" data-inventory-tab="${tab}" aria-controls="inventory-panel-${tab}" aria-selected="${tab === selected}" tabindex="${tab === selected ? 0 : -1}">${tab === 'materials' ? 'Materials' : 'Conduits'} &middot; ${account ? tab === 'materials' ? materials.length : ownedConduits.length : 'Unavailable'}</button>`).join('')}</div>
    <section class="inventory-panel" role="tabpanel" id="inventory-panel-materials" aria-labelledby="inventory-tab-materials" tabindex="0" ${selected !== 'materials' ? 'hidden' : ''}>
    ${!account ? '<p role="alert">Material inventory unavailable. Check the save error.</p>' : materials.length
      ? `<ul class="inventory-item-grid">${materials.map(([id, amount]) => {
        const art = materialArt(id);
        return `<li class="inventory-item" data-inventory-material="${id}"><div class="inventory-item-art">${art ? `<img src="${assetUrl(`materials/${art}.png`)}" alt="" aria-hidden="true" width="256" height="256" loading="lazy">` : '<span>Artwork pending</span>'}</div>
          <strong>${materialName(id)}</strong><span class="inventory-quantity">Owned ${amount}</span></li>`;
      }).join('')}</ul>` : empty('materials')}</section>
    <section class="inventory-panel" role="tabpanel" id="inventory-panel-conduits" aria-labelledby="inventory-tab-conduits" tabindex="0" ${selected !== 'conduits' ? 'hidden' : ''}>
    ${!account ? '<p role="alert">Conduit inventory unavailable. Check the save error.</p>' : ownedConduits.length
      ? `<ul class="inventory-item-grid">${ownedConduits.map((conduit) => `<li class="inventory-item" data-inventory-conduit="${conduit.id}">
        <div class="inventory-item-art">${conduitIcon(conduit.id, account?.conduitUpgrades?.[conduit.id])}</div><strong>${conduit.name}</strong>${conduitRarity(conduit.id)}<small>${conduitEffect(conduit, account?.conduitUpgrades?.[conduit.id])}</small><span class="inventory-quantity">Owned ${account?.conduits?.[conduit.id]}</span></li>`).join('')}</ul>`
      : empty('conduits')}</section>
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
