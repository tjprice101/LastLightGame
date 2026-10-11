// @vitest-environment jsdom
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { chooseMasterConduit } from './master-choice-dialog';
import { emptyAccount } from '../game/account';
import { masterConduits, type MasterConduitId } from '../content/master-conduits';

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
