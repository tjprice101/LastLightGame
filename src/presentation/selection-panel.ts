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
    host.querySelectorAll<HTMLSelectElement>('select:not([data-selection-source])').forEach((select) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'selection-trigger';
      button.id = `selection-trigger-${++sequence}`;
      button.setAttribute('aria-haspopup', 'dialog');
      const labels = Array.from(select.labels ?? []);
      const label = select.getAttribute('aria-label') ??
        labels.map((entry) => Array.from(entry.childNodes).filter((node) => node.nodeType === Node.TEXT_NODE).map((node) => node.textContent).join('').trim()).join(' ~ ');
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
        Array.from(select.options).forEach((option, index) => {
          const choice = document.createElement('button');
          choice.type = 'button';
          choice.className = 'selection-option';
          choice.textContent = option.textContent;
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
          choices.append(choice);
        });
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
