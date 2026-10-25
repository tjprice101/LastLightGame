// @vitest-environment jsdom
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { chooseMasterConduit } from './master-choice-dialog';
import { emptyAccount } from '../game/account';
import { masterConduits, type MasterConduitId } from '../content/master-conduits';
import { starters } from '../content/starters';
import { getElement } from '../content/activities';
import { elementAccents } from '../content/dungeon-art';

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; } });
  document.body.innerHTML = '<button id="opener">Open chest</button>';
  document.getElementById('opener')!.focus();
});
afterEach(() => {
  document.body.innerHTML = '';
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
  vi.restoreAllMocks(); vi.unstubAllGlobals();
});

describe('React Master chest choice', () => {
  it('shows the canonical bold element and theme for every future-character Master option without saving', async () => {
    const account = { ...emptyAccount(), masterChests: 1 };
    const before = structuredClone(account);
    const write = vi.spyOn(Storage.prototype, 'setItem');
    let result!: Promise<MasterConduitId | null>;
    await act(async () => { result = chooseMasterConduit(account); });
    const select = document.querySelector('select')!;
    for (const starter of starters) {
      await act(async () => { select.value = starter.id; select.dispatchEvent(new Event('change', { bubbles: true })); });
      const cards = document.querySelectorAll<HTMLElement>('.ll-master-option');
      expect(cards).toHaveLength(3);
      cards.forEach(card => {
        expect(card.dataset.conduitElement).toBe(starter.elementId);
        expect(card.style.getPropertyValue('--conduit-element-accent')).toBe(elementAccents[starter.elementId]);
        expect(card.querySelector('strong.conduit-element-label')?.textContent).toBe(getElement(starter.elementId).name);
        expect(card.textContent).toContain('Omnic Master');
      });
    }
    await act(async () => { document.querySelector('dialog')!.dispatchEvent(new Event('cancel', { cancelable: true })); });
    expect(await result).toBeNull();
    expect(write).not.toHaveBeenCalled();
    expect(account).toEqual(before);
  });

  it('allows a future-character choice with exact rules, then cleans up and restores focus without saving', async () => {
    const account = { ...emptyAccount(), masterChests: 2, masterConduits: { 'master-ember-1': 1 } };
    const write = vi.spyOn(Storage.prototype, 'setItem');
    let result!: Promise<MasterConduitId | null>;
    await act(async () => { result = chooseMasterConduit(account); });
    expect(document.querySelectorAll('.ll-master-option')).toHaveLength(3);
    expect(document.querySelector<HTMLButtonElement>('.ll-master-option')!.disabled).toBe(true);
    const select = document.querySelector('select')!;
    await act(async () => { select.value = 'nerithe'; select.dispatchEvent(new Event('change', { bubbles: true })); });
    expect(document.querySelector('dialog')?.textContent).toContain('Shoreless Meridian Worldchart');
    await act(async () => document.querySelector<HTMLButtonElement>('.ll-master-option')!.click());
    const confirm = Array.from(document.querySelectorAll('button')).find(button => button.textContent === 'Choose Master')!;
    expect(confirm.disabled).toBe(false);
    await act(async () => confirm.click());
    expect(await result).toBe('master-nerithe-1');
    expect(document.querySelector('dialog')).toBeNull();
    expect(document.activeElement?.id).toBe('opener');
    expect(account.masterChests).toBe(2);
    expect(write).not.toHaveBeenCalled();
  });
  it('cancels with Escape and preserves all chests when every Master is already owned', async () => {
    const account = { ...emptyAccount(), masterChests: 5,
      masterConduits: Object.fromEntries(masterConduits.map(entry => [entry.id, 1])) };
    let result!: Promise<MasterConduitId | null>;
    await act(async () => { result = chooseMasterConduit(account); });
    expect(Array.from(document.querySelectorAll<HTMLButtonElement>('.ll-master-option')).every(button => button.disabled)).toBe(true);
    expect(Array.from(document.querySelectorAll('button')).find(button => button.textContent === 'Choose Master')?.disabled).toBe(true);
    await act(async () => { document.querySelector('dialog')!.dispatchEvent(new Event('cancel', { cancelable: true })); });
    expect(await result).toBeNull();
    expect(account.masterChests).toBe(5);
    expect(document.activeElement?.id).toBe('opener');
  });
});
