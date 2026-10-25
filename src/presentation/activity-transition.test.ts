// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { activityLoadingDelay, activityTransitionPending, transitionActivity, waitForActivityTransition } from './activity-transition';

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

function fixture() {
  vi.useFakeTimers();
  document.body.innerHTML = '<main id="app"><h1 tabindex="-1">Page</h1><img src="slow.png"></main>';
  return document.querySelector<HTMLElement>('#app')!;
}

describe('instant activity navigation', () => {
  it('renders synchronously without fades, loading screens or artwork waits', async () => {
    const root = fixture();
    const enter = vi.fn(() => { root.querySelector('h1')!.textContent = 'Inventory'; });
    const transition = transitionActivity(enter);
    expect(enter).toHaveBeenCalledOnce();
    expect(root.textContent).toBe('Inventory');
    expect(document.querySelector('.activity-transition')).toBeNull();
    await transition;
    expect(document.activeElement).toBe(root.querySelector('h1'));
    expect(root.inert).toBeFalsy();
    expect(activityTransitionPending()).toBe(false);
    await vi.advanceTimersByTimeAsync(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not flash a loading indicator for fast asynchronous setup', async () => {
    fixture();
    let finish!: () => void;
    const transition = transitionActivity(() => new Promise<void>(resolve => { finish = resolve; }));
    await vi.advanceTimersByTimeAsync(activityLoadingDelay - 1);
    expect(document.querySelector('[role="status"]')).toBeNull();
    finish();
    await transition;
    await vi.runAllTimersAsync();
    expect(document.querySelector('.activity-transition')).toBeNull();
  });

  it('shows only delayed status for real pending work and removes it immediately on completion', async () => {
    const root = fixture();
    let finish!: () => void;
    const transition = transitionActivity(() => new Promise<void>(resolve => { finish = resolve; }));
    expect(activityTransitionPending()).toBe(true);
    expect(waitForActivityTransition()).toBe(transition);
    expect(root.inert).toBe(true);
    await vi.advanceTimersByTimeAsync(activityLoadingDelay);
    expect(document.querySelector('[role="status"]')?.textContent).toBe('Loading\u2026');
    finish();
    await transition;
    expect(root.inert).toBeFalsy();
    expect(document.querySelector('.activity-transition')).toBeNull();
    await vi.advanceTimersByTimeAsync(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('deduplicates entry, including synchronous reentrant calls', async () => {
    fixture();
    const second = vi.fn();
    let nested: Promise<void> | undefined;
    const transition = transitionActivity(() => { nested = transitionActivity(second); });
    expect(nested).toBe(transition);
    expect(transitionActivity(second)).toBe(transition);
    await transition;
    expect(second).not.toHaveBeenCalled();
  });

  it.each([false, true])('restores the prior inert state %s after failed rendering', async previous => {
    const root = fixture();
    root.inert = previous;
    await expect(transitionActivity(() => { throw new Error('Entry rejected'); })).rejects.toThrow('Entry rejected');
    expect(root.inert).toBe(previous);
    expect(activityTransitionPending()).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    await transitionActivity(() => {});
  });

  it('propagates delayed setup failure and removes its status without navigating again', async () => {
    const root = fixture();
    let fail!: (error: Error) => void;
    const transition = transitionActivity(() => new Promise<void>((_, reject) => { fail = reject; }));
    const rejection = expect(transition).rejects.toThrow('Network failed');
    await vi.advanceTimersByTimeAsync(activityLoadingDelay);
    fail(new Error('Network failed'));
    await rejection;
    expect(root.inert).toBeFalsy();
    expect(document.querySelector('.activity-transition')).toBeNull();
    expect(activityTransitionPending()).toBe(false);
  });

  it('reports a missing application root', async () => {
    fixture().remove();
    await expect(transitionActivity(() => {})).rejects.toThrow('Activity root is missing.');
    expect(activityTransitionPending()).toBe(false);
  });
});
