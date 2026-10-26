import { creatureBatchSaleOffer, creatureSaleOffer, type Account } from '../game/account';
import { saleLabel } from './creature-sale';
import { capturedRarity } from './owned-companion';
import { rarityFeedback } from './rarity-feedback';
import { escapeDialogText } from './game-dialog';
import './creature-bulk-sale.css';

export function bulkSaleControls(): string {
  return `<section class="creature-bulk-sale" aria-label="Multi-select sale">
    <div class="creature-bulk-actions"><button class="text-button" data-bulk-sale-toggle aria-pressed="false">Multi-select sell</button>
      <button class="text-button" data-bulk-sale-all hidden>Select available</button>
      <button class="text-button" data-bulk-sale-clear hidden>Clear selection</button>
      <button class="primary-button" data-bulk-sale-confirm hidden disabled>Review sale</button></div>
    <p data-bulk-sale-summary role="status" hidden></p></section>`;
}

export function bulkSaleCopy(account: Account, id: string): string {
  const sale = creatureSaleOffer(account, id);
  const index = (account.capturedCharacters ?? []).findIndex(copy => copy.instanceId === id) + 1;
  return `<div class="creature-bulk-copy" data-bulk-sale-copy hidden>
    <label class="creature-bulk-check"><input type="checkbox" data-bulk-sale-id="${id}" aria-label="Select copy ${index} for sale" ${sale.reasons.length ? 'disabled' : ''}>
      <span>${sale.reasons.length ? `Protected: ${sale.reasons.join(', ')}` : 'Select for sale'}</span></label>
    <label data-bulk-payout-label hidden>Payout for this copy
      <select data-bulk-sale-payout="${id}" data-native-select ${sale.reasons.length ? 'disabled' : ''}>
        ${sale.options.map(option => `<option value="${option.id}">${escapeDialogText(saleLabel(option))}</option>`).join('')}
      </select></label></div>`;
}

export function bindCreatureBulkSale(host: HTMLElement, account: Account,
  sell: (selections: { id: string; saleOption: string }[]) => Promise<void>,
  error: (error: unknown) => void): void {
  const toolbar = host.querySelector<HTMLElement>('.creature-bulk-sale');
  if (!toolbar) return;
  const collection = toolbar.parentElement!;
  const toggle = toolbar.querySelector<HTMLButtonElement>('[data-bulk-sale-toggle]')!;
  const confirm = toolbar.querySelector<HTMLButtonElement>('[data-bulk-sale-confirm]')!;
  const summary = toolbar.querySelector<HTMLElement>('[data-bulk-sale-summary]')!;
  const all = toolbar.querySelector<HTMLButtonElement>('[data-bulk-sale-all]')!;
  const clear = toolbar.querySelector<HTMLButtonElement>('[data-bulk-sale-clear]')!;
  const boxes = Array.from(collection.querySelectorAll<HTMLInputElement>('[data-bulk-sale-id]'));
  const protectedBoxes = new Set(boxes.filter(box => box.disabled));
  let active = false;
  let busy = false;
  const selections = (): { id: string; saleOption: string }[] => boxes.filter(box => box.checked).map(box => {
    const select = box.closest('[data-bulk-sale-copy]')!.querySelector<HTMLSelectElement>('[data-bulk-sale-payout]')!;
    return { id: box.dataset.bulkSaleId!, saleOption: select.value };
  });
  const refresh = (): void => {
    for (const box of boxes) {
      box.disabled = busy || protectedBoxes.has(box);
      const copy = box.closest<HTMLElement>('[data-bulk-sale-copy]')!;
      copy.hidden = !active;
      copy.querySelector<HTMLElement>('[data-bulk-payout-label]')!.hidden = !box.checked;
      copy.querySelector<HTMLSelectElement>('[data-bulk-sale-payout]')!.disabled = busy || !box.checked || protectedBoxes.has(box);
      box.closest('.ref-collection-card')?.classList.toggle('is-sale-selected', box.checked);
    }
    all.hidden = clear.hidden = confirm.hidden = summary.hidden = !active;
    const chosen = selections();
    confirm.disabled = busy || !chosen.length;
    confirm.textContent = `Review sale${chosen.length ? ` (${chosen.length})` : ''}`;
    clear.disabled = busy || !chosen.length;
    all.disabled = busy || !boxes.some(box => !box.disabled && !box.checked);
    toggle.disabled = busy;
    toggle.textContent = active ? 'Cancel multi-select' : 'Multi-select sell';
    toggle.setAttribute('aria-pressed', String(active));
    summary.textContent = chosen.length
      ? `${chosen.length} selected · ${saleLabel(creatureBatchSaleOffer(account, chosen))}`
      : 'Choose copies to sell. Locked, squad-assigned and equipped copies are protected. Choose a payout separately for each selected copy.';
  };
  const guarded = (action: () => void): void => {
    if (busy) return;
    try { action(); refresh(); } catch (cause) { error(cause); }
  };
  toggle.addEventListener('click', () => guarded(() => { active = !active; if (!active) boxes.forEach(box => { box.checked = false; }); }));
  all.addEventListener('click', () => guarded(() => { boxes.forEach(box => { if (!box.disabled) box.checked = true; }); rarityFeedback(toolbar, 'Omnic'); }));
  clear.addEventListener('click', () => guarded(() => boxes.forEach(box => { box.checked = false; })));
  for (const box of boxes) {
    box.addEventListener('change', () => guarded(() => {
      if (box.checked) {
        const copy = account.capturedCharacters?.find(copy => copy.instanceId === box.dataset.bulkSaleId);
        if (!copy) throw new Error('Selected Elemental-Devourer is no longer owned.');
        rarityFeedback(box.closest<HTMLElement>('.ref-collection-card')!, capturedRarity(copy.creatureId));
      }
    }));
    box.closest('[data-bulk-sale-copy]')!.querySelector('[data-bulk-sale-payout]')!.addEventListener('change', () => guarded(() => {}));
  }
  collection.addEventListener('click', event => {
    if (!active || busy || !(event.target instanceof Element)) return;
    const art = event.target.closest('[data-team-capture-detail]');
    const box = art?.closest('.ref-collection-card')?.querySelector<HTMLInputElement>('[data-bulk-sale-id]');
    if (!box) return;
    event.preventDefault();
    event.stopPropagation();
    if (!box.disabled) {
      box.checked = !box.checked;
      box.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, { capture: true });
  confirm.addEventListener('click', async () => {
    if (busy || !selections().length) return;
    busy = true;
    toolbar.setAttribute('aria-busy', 'true');
    try {
      refresh();
      await sell(selections());
    } catch (cause) { error(cause); }
    finally { busy = false; toolbar.removeAttribute('aria-busy'); if (toolbar.isConnected) refresh(); }
  });
}
