// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { emptyAccount, type Account } from '../game/account';
import { bindSquadPreview, squadHub } from './roster';

afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

function setup() {
  const capturedId = 'capture:00000000-0000-4000-8000-000000000001';
  const account: Account = {
    ...emptyAccount(),
    characters: { tide: { level: 0, evolution: 1 }, ember: { level: 5, evolution: 1 } },
    squad: ['tide', 'ember', capturedId],
    capturedCharacters: [{ instanceId: capturedId, creatureId: 'infusion:treasury:0', locked: false }],
  };
  const host = document.createElement('main');
  host.innerHTML = squadHub(account);
  document.body.append(host);
  const dialog = host.querySelector<HTMLDialogElement>('#squad-picker')!;
  dialog.showModal = vi.fn(() => { dialog.open = true; });
  dialog.close = vi.fn(() => { dialog.open = false; dialog.dispatchEvent(new Event('close')); });
  bindSquadPreview(host, account);
  return { host, dialog, account, capturedId };
}

describe('squad member picker', () => {
  it('leaves legacy captured members out of the draft and explains the replacement', () => {
    const { host } = setup();
    const cards = host.querySelectorAll<HTMLElement>('.squad-slot .squad-card-copy');
    expect(cards[0].querySelector('small')?.textContent).toContain('Lv.0');
    expect(cards[1].querySelector('small')?.textContent).toContain('Lv.5');
    expect(cards[2].textContent).toContain('Optional squad member');
    expect(host.querySelector('.squad-replaced')?.textContent).toContain('captured Elemental-Devourers');
  });

  it('lists only acquired Element-Bearers and filters them by text without changing the saved squad', () => {
    const { host, dialog, account, capturedId } = setup();
    const before = structuredClone(account);
    host.querySelector<HTMLButtonElement>('[data-squad-open="0"]')!.click();
    expect(dialog.querySelector('[data-squad-filter="creatures"]')).toBeNull();
    const picks = Array.from(dialog.querySelectorAll<HTMLButtonElement>('[data-squad-pick]')).map(card => card.dataset.squadPick);
    expect(picks).not.toContain(capturedId);
    expect(picks).toEqual(expect.arrayContaining(['tide', 'ember']));
    const search = dialog.querySelector<HTMLInputElement>('[data-squad-search-input]')!;
    search.value = 'gleamstone';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    expect(Array.from(dialog.querySelectorAll<HTMLButtonElement>('[data-squad-pick]')).every(card => card.hidden)).toBe(true);
    expect(dialog.querySelector<HTMLElement>('[data-squad-picker-empty]')!.hidden).toBe(false);
    expect(account).toEqual(before);
  });
  it('closes on Escape, restores the initiating control and leaves the draft unchanged', () => {
    const { host, dialog, account } = setup();
    const before = structuredClone(account);
    const trigger = host.querySelector<HTMLButtonElement>('[data-squad-open="1"]')!;
    trigger.click();
    expect(dialog.open).toBe(true);
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
    expect(host.querySelector<HTMLSelectElement>('select[name="slot-1"]')!.value).toBe('ember');
    expect(account).toEqual(before);
  });
});
