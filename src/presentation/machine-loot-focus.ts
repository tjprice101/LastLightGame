import { conduits, isConduitId, type ConduitId } from '../content/conduits';
import { isMachineFocusRarity, machineFocusRarities, machineRules, type MachineFocusRarity } from '../content/machines';
import type { Account } from '../game/account';
import { conduitDetails, conduitIcon } from './conduit-store';
import { information } from './information';
import './machine-loot-focus.css';

function focusChoices(account: Account | null, selected: MachineFocusRarity = 'Rare'): string {
  return `<nav class="machine-focus-tabs" aria-label="Focus rarity">${machineFocusRarities.map(rarity =>
    `<button type="button" data-focus-tier="${rarity}" aria-pressed="${rarity === selected}">${rarity}</button>`).join('')}</nav>
    ${machineFocusRarities.map(rarity => {
      const focus = account?.machineLootFocus?.[rarity];
      const active = focus && !(account?.conduits?.[focus] ?? 0) ? conduits.find(entry => entry.id === focus) : undefined;
      return `<section data-focus-panel="${rarity}" ${rarity === selected ? '' : 'hidden'}>
        <h3>${rarity} focus</h3><p>Focused: <strong>${active?.name ?? 'None - general unowned pool'}</strong></p>
        <button type="button" data-clear-loot-focus="${rarity}" ${!account || !active ? 'disabled' : ''}>Clear ${rarity} focus</button>
        <ul class="machine-focus-grid">${conduits.filter(entry => entry.rarity === rarity).map(entry => {
          const owned = (account?.conduits?.[entry.id] ?? 0) > 0;
          return `<li>${conduitIcon(entry.id, account?.conduitUpgrades?.[entry.id])}<h4>${entry.name}</h4>
            ${information(`focus-details-${entry.id}`, entry.name, conduitDetails(entry.id, account?.conduitUpgrades?.[entry.id]), 'Details')}
            <button type="button" data-focus-conduit="${entry.id}" data-focus-rarity="${rarity}" aria-pressed="${entry.id === active?.id}"
              ${!account || owned || entry.id === active?.id ? 'disabled' : ''}>${owned ? 'Owned' : entry.id === active?.id ? 'Focused' : 'Focus'}</button></li>`;
        }).join('')}</ul></section>`;
    }).join('')}`;
}

export function machineLootFocus(account: Account | null): string {
  return information('machine-loot-focus', 'Focus Loot', `
    <p>Choose one unowned Conduit per rarity. The next Machines drop of that rarity awards your choice.
    Rates stay Rare 8%, Legendary 3.5%, Omnic 1% from stage ${machineRules.omnicStage}.
    Obtaining the chosen Conduit from any source clears only that rarity's focus and restores its general unowned pool.
    Master Conduits cannot be focused.</p>
    ${!account ? '<p role="alert">Loot focus unavailable. Check the save error.</p>' : ''}
    <div class="machine-focus-body">${focusChoices(account)}</div>
    <p class="machine-focus-status" role="status"></p>`, 'Focus Loot');
}

export function bindMachineLootFocus(host: HTMLElement,
  save: (rarity: MachineFocusRarity, id: ConduitId | null) => Promise<Account>,
  onError: (error: unknown) => void): void {
  const dialog = host.querySelector<HTMLDialogElement>('#machine-loot-focus');
  if (!dialog) return;
  let busy = false;
  dialog.addEventListener('click', async event => {
    if (!(event.target instanceof Element)) return;
    const tab = event.target.closest<HTMLButtonElement>('[data-focus-tier]');
    if (tab && !busy) {
      dialog.querySelectorAll<HTMLButtonElement>('[data-focus-tier]').forEach(button =>
        button.setAttribute('aria-pressed', String(button === tab)));
      dialog.querySelectorAll<HTMLElement>('[data-focus-panel]').forEach(panel => { panel.hidden = panel.dataset.focusPanel !== tab.dataset.focusTier; });
      return;
    }
    const button = event.target.closest<HTMLButtonElement>('[data-focus-conduit], [data-clear-loot-focus]');
    if (!button || busy || button.disabled) return;
    const rarity = button.dataset.focusRarity ?? button.dataset.clearLootFocus;
    const id = button.dataset.focusConduit;
    const status = dialog.querySelector<HTMLElement>('.machine-focus-status')!;
    const body = dialog.querySelector<HTMLElement>('.machine-focus-body')!;
    busy = true;
    const scroll = dialog.querySelector('.information-content')?.scrollTop ?? 0;
    const controls = Array.from(body.querySelectorAll<HTMLButtonElement>('button'));
    const disabled = controls.map(control => control.disabled);
    controls.forEach(control => { control.disabled = true; });
    body.setAttribute('aria-busy', 'true');
    try {
      if (!isMachineFocusRarity(rarity) || id !== undefined && !isConduitId(id)) throw new Error('Choose a valid Machines loot focus.');
      const account = await save(rarity, id ?? null);
      body.innerHTML = focusChoices(account, rarity);
      status.textContent = `${rarity} focus ${id ? 'saved' : 'cleared'}. Drop rates are unchanged.`;
      const content = dialog.querySelector('.information-content');
      if (content) content.scrollTop = scroll;
      body.querySelector<HTMLButtonElement>(`[data-focus-tier="${rarity}"]`)?.focus({ preventScroll: true });
    } catch (error) {
      controls.forEach((control, index) => { control.disabled = disabled[index]; });
      status.textContent = 'Loot focus could not be confirmed. Retry the same selection.';
      button.focus({ preventScroll: true });
      onError(error);
    } finally {
      body.removeAttribute('aria-busy');
      busy = false;
    }
  });
}
