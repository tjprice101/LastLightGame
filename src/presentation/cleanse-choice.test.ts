// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createCleanseChoicePicker } from './cleanse-choice';
import { gameDialogPending } from './game-dialog';
import { BattleView } from './battle-view';
import { createBattle } from '../game/battle';

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function(this: HTMLDialogElement) { this.open = true; });
  HTMLDialogElement.prototype.close = vi.fn(function(this: HTMLDialogElement) { this.open = false; this.dispatchEvent(new Event('close')); });
});
afterEach(() => { document.body.innerHTML = ''; });
describe('chosen cleanse dialog', () => {
  it('opens the choice only after an ally is chosen and only with both statuses', () => {
    for (const both of [false, true]) {
      const state = createBattle(1729, ['ilyss', 'ember']);
      state.allies[0].shatter = 100;
      state.allies[1].burn = { damage: 1, turns: 2 };
      state.allies[1].weakened = both ? 2 : 0;
      const view = Object.create(BattleView.prototype);
      const choose = vi.fn(), send = vi.fn(), chooseAlly = vi.fn();
      Object.assign(view, { session: { state }, actorId: 'ilyss', targetId: state.enemies[0].id,
        busy: false, disposed: false, dragging: false, authority: {}, chooseCleanse: choose,
        authoritativeCommand: send, chooseAlly });
      Reflect.apply(Reflect.get(BattleView.prototype, 'command'), view, ['skill2']);
      expect(chooseAlly).toHaveBeenCalledOnce();
      expect(choose).not.toHaveBeenCalled();
      Reflect.apply(Reflect.get(BattleView.prototype, 'command'), view, ['skill2', 'ember']);
      if (both) {
        expect(choose).toHaveBeenCalledWith(state.allies[0], 'ember');
        expect(send).not.toHaveBeenCalled();
      } else {
        expect(choose).not.toHaveBeenCalled();
        expect(send).toHaveBeenCalledWith('skill2', 'ember', undefined);
      }
    }
  });
  it.each(['burn', 'weaken'] as const)('returns explicit %s and restores focus', async choice => {
    const previous = document.createElement('button');
    document.body.append(previous);
    previous.focus();
    const picker = createCleanseChoicePicker();
    const dialog = document.querySelector('dialog')!;
    expect(dialog.getAttribute('aria-label')).toBe('Choose a status to remove');
    const button = dialog.querySelector<HTMLButtonElement>(`button[value="${choice}"]`)!;
    dialog.querySelector('form')!.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true, submitter: button }));
    expect(await picker.result).toBe(choice);
    expect(document.activeElement).toBe(previous);
    expect(gameDialogPending()).toBe(false);
  });
  it.each(['cancel', 'escape', 'dispose'])('cancels via %s without local combat, authority writes or presentation', async method => {
    const state = createBattle(1729, ['ilyss', 'ember']);
    state.allies[0].shatter = 100;
    state.allies[1].burn = { damage: 1, turns: 2 };
    state.allies[1].weakened = 2;
    const before = structuredClone(state);
    const view = Object.create(BattleView.prototype);
    const command = vi.fn(), save = vi.fn();
    Object.assign(view, { session: { state }, actorId: 'ilyss', disposed: false, command,
      authority: { action: save }, commitRewards: save, error: vi.fn() });
    const pending = Reflect.apply(Reflect.get(BattleView.prototype, 'chooseCleanse'), view, [state.allies[0], 'ember']);
    const dialog = document.querySelector('dialog')!;
    if (method === 'dispose') Reflect.get(view, 'cleansePicker').cancel();
    else if (method === 'escape') dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    else dialog.querySelector('form')!.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true,
      submitter: dialog.querySelector<HTMLButtonElement>('button[value="cancel"]')! }));
    await pending;
    expect(command).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
    expect(state).toEqual(before);
    expect(document.querySelector('dialog')).toBeNull();
  });
});
