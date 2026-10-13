// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { emptyAccount } from '../game/account';
import { chooseProfilePicture } from './profile-picture-browser';

describe('profile picture collection', () => {
  afterEach(() => { document.body.innerHTML = ''; vi.restoreAllMocks(); });
  const setup = () => {
    HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    };
    const account = emptyAccount();
    account.characters.ember = { level: 105, evolution: 6 };
    return account;
  };
  it('shows muted locked artwork and supports filters, selection, use and focus restoration', async () => {
    const account = setup();
    document.body.innerHTML = '<button id="browse">Browse</button>';
    const browse = document.querySelector<HTMLButtonElement>('#browse')!;
    browse.focus();
    const result = chooseProfilePicture(account, 'ember');
    expect(document.querySelectorAll('[data-picture]')).toHaveLength(33);
    expect(document.querySelectorAll('[data-picture] > .picture-tile-art')).toHaveLength(33);
    for (const tile of Array.from(document.querySelectorAll('[data-picture]'))) {
      expect(tile.querySelector(':scope > b')).not.toBeNull();
      expect(tile.querySelector(':scope > small')).not.toBeNull();
    }
    expect(document.querySelector('[data-picture="profile:tide:omnic"] .picture-locked-art img')).not.toBeNull();
    expect(document.querySelector('[data-picture="profile:ember:base"] .picture-locked-art')).toBeNull();
    document.querySelector<HTMLButtonElement>('[data-picture-filter="unlocked"]')!.click();
    expect(document.querySelectorAll('[data-picture]:not([hidden])')).toHaveLength(3);
    document.querySelector<HTMLButtonElement>('[data-picture="profile:ember:omnic"]')!.click();
    const use = document.querySelector<HTMLButtonElement>('[data-dialog-value="use"]')!;
    expect(use.disabled).toBe(false);
    document.querySelector('form')!.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true, submitter: use }));
    expect(await result).toBe('profile:ember:omnic');
    expect(document.querySelector('dialog')).toBeNull();
    expect(document.activeElement).toBe(browse);
  });
  it('keeps locked selection unusable and Escape cancels without changing account', async () => {
    const account = setup(), before = structuredClone(account);
    const result = chooseProfilePicture(account, 'neutral');
    document.querySelector<HTMLButtonElement>('[data-picture="profile:tide:omnic"]')!.click();
    expect(document.querySelector<HTMLButtonElement>('[data-dialog-value="use"]')!.disabled).toBe(true);
    expect(document.querySelector('.picture-preview-art .picture-locked-art img')).not.toBeNull();
    expect(document.querySelectorAll('.picture-use-avatar .picture-locked-art')).toHaveLength(3);
    expect(document.querySelector('.picture-preview-art .picture-lock')?.textContent).toBe('Locked');
    document.querySelector('dialog')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(await result).toBeNull();
    expect(account).toEqual(before);
  });
  it('organizes real categories, counts search results and navigates the filtered collection', async () => {
    const result = chooseProfilePicture(setup(), 'neutral');
    expect(document.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe('3');
    expect(document.querySelector('[data-dialog-value="use"]')?.textContent).toBe('Currently in use');
    expect(document.querySelector<HTMLButtonElement>('[data-dialog-value="use"]')!.disabled).toBe(true);
    document.querySelector<HTMLButtonElement>('[data-picture-category="omnic"]')!.click();
    expect(document.querySelectorAll('[data-picture]:not([hidden])')).toHaveLength(16);
    expect(document.querySelector<HTMLElement>('[data-picture-group="default"]')!.hidden).toBe(true);
    document.querySelector<HTMLButtonElement>('[data-picture-filter="unlocked"]')!.click();
    expect(document.querySelector('[data-picture-showing]')?.textContent).toBe('Showing 1 of 33 pictures');
    const search = document.querySelector<HTMLInputElement>('[data-picture-search]')!;
    search.value = 'not a character';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    expect(document.querySelector<HTMLElement>('[data-picture-empty]')!.hidden).toBe(false);
    expect(document.querySelector<HTMLButtonElement>('[data-picture-step="1"]')!.disabled).toBe(true);
    search.value = '';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector<HTMLButtonElement>('[data-picture-category="characters"]')!.click();
    document.querySelector<HTMLButtonElement>('[data-picture-step="1"]')!.click();
    expect(document.querySelector('[data-picture="profile:ember:base"]')?.getAttribute('aria-pressed')).toBe('true');
    expect(document.activeElement).toBe(document.querySelector('[data-picture-step="1"]'));
    document.querySelector<HTMLButtonElement>('[data-picture-step="-1"]')!.click();
    expect(document.querySelector('[data-picture="profile:ember:omnic"]')?.getAttribute('aria-pressed')).toBe('true');
    document.querySelector('dialog')!.dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(await result).toBeNull();
  });
  it('does not save the already applied picture even when a use submit is dispatched', async () => {
    const result = chooseProfilePicture(setup(), 'ember');
    const use = document.querySelector<HTMLButtonElement>('[data-dialog-value="use"]')!;
    use.form!.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true, submitter: use }));
    expect(await result).toBeNull();
  });
});
