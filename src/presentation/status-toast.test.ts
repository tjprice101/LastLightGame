// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { showStatusToast, toastTone } from './status-toast';

describe('shared status toast', () => {
  afterEach(() => vi.useRealTimers());

  it('classifies real game messages by outcome', () => {
    expect(toastTone('Elemental-Devourer was not sold. Choose an owned captured Elemental-Devourer.')).toBe('error');
    expect(toastTone('Sale protected: Locked.')).toBe('error');
    expect(toastTone('5 Ember Seed purchased and saved.')).toBe('success');
    expect(toastTone('Infernis leveled up.')).toBe('success');
    expect(toastTone('Conduit purchased and saved, but its presentation could not complete. Check Inventory.')).toBe('error');
    expect(toastTone('Friends is coming later. No units or currency have been changed.')).toBe('info');
    expect(toastTone('Debug profile active. All gameplay content is unlocked in memory only.')).toBe('success');
  });

  it('renders a toned, dismissible toast that keeps the exact message text', () => {
    const status = document.createElement('p');
    status.id = 'status';
    status.setAttribute('role', 'alert');
    document.body.append(status);
    showStatusToast(status, 'Elemental-Devourer was not sold. Locked.');
    expect(status.dataset.toastTone).toBe('error');
    expect(status.querySelector('.status-toast-message')?.textContent).toBe('Elemental-Devourer was not sold. Locked.');
    expect(status.querySelector('strong')?.textContent).toBe('Action not completed');
    status.querySelector<HTMLButtonElement>('.status-toast-close')!.click();
    expect(status.textContent).toBe('');
    expect(status.dataset.toastTone).toBeUndefined();
  });

  it('auto-dismisses unless persistent, and a newer message replaces the old timer', () => {
    vi.useFakeTimers();
    const status = document.createElement('p');
    document.body.append(status);
    showStatusToast(status, 'Infernis leveled up.');
    vi.advanceTimersByTime(3000);
    showStatusToast(status, 'Squad was not changed. Choose an owned character.');
    vi.advanceTimersByTime(3000);
    expect(status.textContent).toContain('Squad was not changed');
    vi.advanceTimersByTime(7000);
    expect(status.textContent).toBe('');
    showStatusToast(status, 'The previous online operation has not been confirmed.', { persistent: true });
    vi.advanceTimersByTime(60_000);
    expect(status.textContent).toContain('not been confirmed');
  });
});
