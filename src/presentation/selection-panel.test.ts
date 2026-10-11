// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindSelectionPanels } from './selection-panel';

afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

describe('scrollable selection panels', () => {
  function setup() {
    const host = document.createElement('main');
    host.innerHTML = `<label for="conduit">Conduit slot</label><select id="conduit">
      ${Array.from({ length: 85 }, (_, index) => `<option value="${index}" ${index === 1 ? 'disabled' : ''}>Conduit ${index}</option>`).join('')}
      </select>`;
    document.body.append(host);
    const dispose = bindSelectionPanels(host);
    const trigger = host.querySelector<HTMLButtonElement>('.selection-trigger')!;
    const dialog = document.querySelector<HTMLDialogElement>('.selection-modal')!;
    dialog.showModal = vi.fn(() => { dialog.open = true; });
    dialog.close = vi.fn(() => {
      dialog.open = false;
      dialog.dispatchEvent(new Event('close'));
    });
    trigger.click();
    return { host, trigger, dialog, dispose };
  }

  it('keeps all choices in the focusable scroll region and selects the last option once', () => {
    const { host, dialog, dispose } = setup();
    const region = dialog.querySelector<HTMLElement>('.selection-options')!;
    expect(region.tabIndex).toBe(0);
    expect(region.getAttribute('aria-label')).toBe('Conduit slot choices');
    expect(region.querySelectorAll('button')).toHaveLength(85);
    const change = vi.fn();
    host.addEventListener('change', change);
    region.querySelector<HTMLButtonElement>('button:last-child')!.click();
    expect(host.querySelector('select')?.value).toBe('84');
    expect(change).toHaveBeenCalledTimes(1);
    expect(dialog.open).toBe(false);
    dispose();
  });

  it('preserves disabled choices and returns focus on Escape without changing selection', () => {
    const { host, dialog, trigger, dispose } = setup();
    const disabled = dialog.querySelector<HTMLButtonElement>('.selection-option:disabled')!;
    disabled.click();
    expect(host.querySelector('select')?.value).toBe('0');
    expect(dialog.open).toBe(true);
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
    expect(host.querySelector('select')?.value).toBe('0');
    dispose();
    expect(document.querySelector('.selection-modal')).toBeNull();
  });

  it('shows canonical Master artwork and preserves the backing selection transaction', () => {
    const host = document.createElement('main');
    host.innerHTML = '<select data-master-equipment="ember" aria-label="Master Conduit"><option value="">No Master equipped</option><option value="master-ember-1">Helios Pyre Cathedral · Omnic Master</option></select>';
    document.body.append(host);
    const dispose = bindSelectionPanels(host);
    const dialog = document.querySelector<HTMLDialogElement>('.selection-modal')!;
    dialog.showModal = vi.fn(() => { dialog.open = true; });
    dialog.close = vi.fn(() => { dialog.open = false; dialog.dispatchEvent(new Event('close')); });
    host.querySelector<HTMLButtonElement>('.selection-trigger')!.click();
    const options = dialog.querySelectorAll<HTMLButtonElement>('.selection-option');
    expect(options[0].querySelector('img')).toBeNull();
    expect(options[1].querySelector('img')?.getAttribute('src')).toContain('master');
    expect(options[1].textContent).toContain('Helios Pyre Cathedral');
    const change = vi.fn();
    host.addEventListener('change', change);
    options[1].click();
    expect(host.querySelector('select')?.value).toBe('master-ember-1');
    expect(change).toHaveBeenCalledTimes(1);
    dispose();
  });
});
