interface SelectionControl {
  select: HTMLSelectElement;
  button: HTMLButtonElement;
  label: string;
  labels: HTMLLabelElement[];
  wasHidden: boolean;
}

export function bindSelectionPanels(host: HTMLElement): () => void {
  const controls = new Map<HTMLSelectElement, SelectionControl>();
  let sequence = 0;
  let active: SelectionControl | null = null;
  const dialog = document.createElement('dialog');
  dialog.className = 'information-modal selection-modal';
  dialog.setAttribute('aria-labelledby', 'selection-panel-heading');
  document.body.append(dialog);
  const restore = (control: SelectionControl): void => {
    delete control.select.dataset.selectionSource;
    control.select.hidden = control.wasHidden;
    control.labels.forEach((label) => {
      if (label.htmlFor === control.button.id) label.htmlFor = control.select.id;
    });
    control.button.remove();
  };
  const refresh = (): void => {
    if (active && (!host.contains(active.select) || active.select.disabled) && dialog.open) dialog.close();
    for (const [select, control] of controls) {
      if (!host.contains(select)) {
        restore(control);
        controls.delete(select);
        continue;
      }
      const text = select.selectedOptions[0]?.textContent ?? 'Select';
      if (control.button.textContent !== text) control.button.textContent = text;
      control.button.setAttribute('aria-label', `${control.label}: ${text}`);
      if (control.button.disabled !== select.disabled) control.button.disabled = select.disabled;
    }
    host.querySelectorAll<HTMLSelectElement>('select:not([data-selection-source]):not([data-native-select])').forEach((select) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'selection-trigger';
      button.id = `selection-trigger-${++sequence}`;
      button.setAttribute('aria-haspopup', 'dialog');
      const labels = Array.from(select.labels ?? []);
      const label = select.getAttribute('aria-label') ??
        labels.map((entry) => Array.from(entry.childNodes).filter((node) => node.nodeType === Node.TEXT_NODE).map((node) => node.textContent).join('').trim()).join(' · ');
      button.setAttribute('aria-label', `${label || 'Select option'}: ${select.selectedOptions[0]?.textContent ?? 'Select'}`);
      if (select.hasAttribute('aria-describedby')) button.setAttribute('aria-describedby', select.getAttribute('aria-describedby')!);
      button.textContent = select.selectedOptions[0]?.textContent ?? 'Select';
      button.disabled = select.disabled;
      const wasHidden = select.hidden;
      select.dataset.selectionSource = 'true';
      select.hidden = true;
      select.before(button);
      const linkedLabels = labels.filter((entry) => entry.htmlFor === select.id && select.id);
      linkedLabels.forEach((entry) => { entry.htmlFor = button.id; });
      const control = { select, button, label: label || 'Select option', labels: linkedLabels, wasHidden };
      controls.set(select, control);
      button.addEventListener('click', () => {
        active = control;
        dialog.replaceChildren();
        const heading = document.createElement('h2');
        heading.id = 'selection-panel-heading';
        heading.textContent = label || 'Select option';
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'drawer-close';
        close.setAttribute('aria-label', 'Close selection');
        close.textContent = '\u00d7';
        close.addEventListener('click', () => dialog.close());
        const header = document.createElement('header');
        header.className = 'drawer-heading';
        header.append(heading, close);
        const choices = document.createElement('div');
        choices.className = 'selection-options';
        choices.tabIndex = 0;
        choices.setAttribute('aria-label', `${control.label} choices`);
        let masterDetails: HTMLElement | null = null;
        if (select.hasAttribute('data-master-equipment')) {
          const intro = document.createElement('p');
          intro.className = 'master-selection-intro';
          intro.textContent = 'Choose a Master for this Element-Bearer. View Details to inspect its full effect and lore. It equips only after the saved selection succeeds.';
          choices.append(intro);
          masterDetails = document.createElement('section');
          masterDetails.className = 'master-selection-details';
          masterDetails.id = `master-selection-details-${++sequence}`;
          masterDetails.setAttribute('aria-live', 'polite');
        }
        Array.from(select.options).forEach((option, index) => {
          const choice = document.createElement('button');
          choice.type = 'button';
          choice.className = 'selection-option';
          const text = document.createElement('span');
          text.textContent = option.textContent;
          if (select.hasAttribute('data-master-equipment') && isMasterConduitId(option.value)) {
            const art = document.createElement('span');
            art.className = 'selection-option-art';
            art.innerHTML = masterConduitIcon(option.value);
            art.querySelector('img')?.setAttribute('alt', '');
            choice.classList.add('selection-option-with-art');
            choice.append(art);
            text.insertAdjacentHTML('beforeend', conduitElementLabel(getStarter(getMasterConduit(option.value).character).elementId));
          }
          if ((select.hasAttribute('data-conduit-slot') || select.hasAttribute('data-capture-conduit')) && isConduitId(option.value)) {
            const badge = createConduitElement(option.value);
            if (badge) text.append(badge);
          }
          if (select.hasAttribute('data-profile-icon-picker') && isStarterId(option.value)) {
            const art = document.createElement('span');
            art.className = 'selection-option-art';
            art.innerHTML = portrait(getStarter(option.value));
            art.querySelector('img')?.setAttribute('alt', '');
            choice.classList.add('selection-option-with-art');
            choice.append(art);
          }
          choice.append(text);
          const lootSource = stageLootSourceOf(select);
          let row: HTMLElement = choice;
          if (masterDetails && isMasterConduitId(option.value)) {
            const masterId = option.value;
            row = document.createElement('div');
            row.className = 'selection-option-row selection-option-row--master';
            row.append(choice);
            const detailsButton = document.createElement('button');
            detailsButton.type = 'button';
            detailsButton.className = 'master-selection-view-details';
            detailsButton.textContent = 'View Details';
            detailsButton.setAttribute('aria-label', `View Details for ${getMasterConduit(masterId).name}`);
            detailsButton.setAttribute('aria-controls', masterDetails.id);
            detailsButton.setAttribute('aria-expanded', 'false');
            detailsButton.addEventListener('click', () => {
              if (!host.contains(select) || select.disabled || !select.options[index] ||
                  select.options[index] !== option || option.disabled) return;
              choices.querySelectorAll<HTMLButtonElement>('.master-selection-view-details').forEach(button =>
                button.setAttribute('aria-expanded', String(button === detailsButton)));
              masterDetails!.innerHTML = `<h3>Master for ${getStarter(getMasterConduit(masterId).character).name}</h3>${masterReference(masterId)}`;
              masterDetails!.hidden = false;
            });
            row.append(detailsButton);
          } else if (lootSource) {
            row = document.createElement('div');
            row.className = 'selection-option-row';
            row.append(choice);
            row.insertAdjacentHTML('beforeend', stageLootButton(lootSource, Number(option.value), `Detailed Loot for stage ${option.textContent ?? option.value}`));
          }
          choice.disabled = option.disabled || (option.parentElement instanceof HTMLOptGroupElement && option.parentElement.disabled);
          choice.setAttribute('aria-pressed', String(option.selected));
          choice.addEventListener('click', () => {
            if (!host.contains(select) || select.disabled || select.options[index] !== option || option.disabled ||
                (option.parentElement instanceof HTMLOptGroupElement && option.parentElement.disabled)) {
              console.error('Selection is no longer available.');
              let error = dialog.querySelector<HTMLElement>('[role="alert"]');
              if (!error) {
                error = document.createElement('p');
                error.setAttribute('role', 'alert');
                dialog.append(error);
              }
              error.textContent = 'Selection changed. Close and reopen this panel.';
              return;
            }
            select.selectedIndex = index;
            dialog.close();
            select.dispatchEvent(new Event('input', { bubbles: true }));
            select.dispatchEvent(new Event('change', { bubbles: true }));
            refresh();
          });
          choices.append(row);
        });
        if (masterDetails) {
          const selected = select.selectedOptions[0];
          if (selected && isMasterConduitId(selected.value)) {
            masterDetails.innerHTML = `<h3>Currently equipped Master</h3>${masterReference(selected.value)}`;
          } else {
            masterDetails.innerHTML = '<h3>Master details</h3><p>Select an owned Master and use View Details to review its effect before equipping.</p>';
          }
          choices.append(masterDetails);
        }
        dialog.append(header, choices);
        button.focus({ preventScroll: true });
        dialog.showModal();
        choices.querySelector<HTMLButtonElement>('[aria-pressed="true"]:not(:disabled)')?.focus({ preventScroll: true });
      });
    });
  };
  dialog.addEventListener('close', () => {
    if (active && host.contains(active.button)) active.button.focus({ preventScroll: true });
    active = null;
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      dialog.close();
    }
  });
  const observer = new MutationObserver(refresh);
  observer.observe(host, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'selected'] });
  host.addEventListener('change', refresh);
  const reset = (): void => { queueMicrotask(refresh); };
  host.addEventListener('reset', reset);
  refresh();
  return () => {
    observer.disconnect();
    host.removeEventListener('change', refresh);
    host.removeEventListener('reset', reset);
    if (dialog.open) dialog.close();
    dialog.remove();
    controls.forEach(restore);
    controls.clear();
  };
}
import { getMasterConduit, isMasterConduitId } from '../content/master-conduits';
import { masterConduitIcon, masterReference } from './master-conduits';
import { getStarter, isStarterId } from '../content/starters';
import { portrait } from './portrait';
import { stageLootButton, stageLootSourceOf } from './stage-loot';
import { conduitElementLabel, createConduitElement } from './conduit-element';
import { isConduitId } from '../content/conduits';
import './master-selection.css';
