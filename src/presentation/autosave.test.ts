// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { autosaveInterval, autosaveNoticeDuration, showAutosaveNotice, startAutosave } from './autosave';

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

describe('one-minute autosave', () => {
  it('saves only at sixty-second intervals and reports confirmed success', async () => {
    vi.useFakeTimers();
    const save = vi.fn().mockResolvedValue(true), saved = vi.fn(), failed = vi.fn();
    const stop = startAutosave(save, saved, failed);
    await vi.advanceTimersByTimeAsync(autosaveInterval - 1);
    expect(save).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(save).toHaveBeenCalledOnce();
    expect(saved).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(autosaveInterval);
    expect(save).toHaveBeenCalledTimes(2);
    stop();
    await vi.advanceTimersByTimeAsync(autosaveInterval);
    expect(save).toHaveBeenCalledTimes(2);
    expect(failed).not.toHaveBeenCalled();
  });
  it('does not overlap saves or announce skipped cycles', async () => {
    vi.useFakeTimers();
    let finish!: (result: boolean) => void;
    const save = vi.fn(() => new Promise<boolean>(resolve => { finish = resolve; }));
    const saved = vi.fn();
    const stop = startAutosave(save, saved, vi.fn());
    await vi.advanceTimersByTimeAsync(autosaveInterval * 2);
    expect(save).toHaveBeenCalledOnce();
    finish(false);
    await vi.advanceTimersByTimeAsync(0);
    expect(saved).not.toHaveBeenCalled();
    stop();
  });
  it('reports failures without a success toast and recovers next cycle', async () => {
    vi.useFakeTimers();
    const error = new Error('Storage denied');
    const save = vi.fn().mockRejectedValueOnce(error).mockResolvedValue(true);
    const saved = vi.fn(), failed = vi.fn();
    const stop = startAutosave(save, saved, failed);
    await vi.advanceTimersByTimeAsync(autosaveInterval);
    expect(failed).toHaveBeenCalledWith(error);
    expect(saved).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(autosaveInterval);
    expect(saved).toHaveBeenCalledOnce();
    stop();
  });
  it('removes the nonblocking notice within two seconds without replacing errors', async () => {
    vi.useFakeTimers();
    document.body.innerHTML = '<p id="status" role="alert">Save error</p>';
    showAutosaveNotice();
    expect(document.querySelector('.autosave-notice')?.getAttribute('role')).toBe('status');
    expect(autosaveNoticeDuration).toBeLessThanOrEqual(2000);
    await vi.advanceTimersByTimeAsync(autosaveNoticeDuration - 1);
    expect(document.querySelector('.autosave-notice')).not.toBeNull();
    await vi.advanceTimersByTimeAsync(1);
    expect(document.querySelector('.autosave-notice')).toBeNull();
    expect(document.querySelector('#status')?.textContent).toBe('Save error');
  });
});
