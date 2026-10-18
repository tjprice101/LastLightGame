// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkForUpdate, currentBuild, resetUpdateCheckForTests } from './update-check';

HTMLDialogElement.prototype.showModal ??= function showModal(this: HTMLDialogElement) { this.open = true; };
HTMLDialogElement.prototype.close ??= function close(this: HTMLDialogElement) { this.open = false; };

const deployed = (build: string) => vi.fn(async () => new Response(JSON.stringify({ build }), { status: 200 })) as unknown as typeof fetch;

describe('update prompt (D-339)', () => {
  afterEach(() => {
    document.querySelectorAll('dialog').forEach((dialog) => dialog.remove());
    resetUpdateCheckForTests();
  });
  it('ignores the current build and failed requests', async () => {
    expect(await checkForUpdate({ fetcher: deployed(currentBuild), force: true })).toBe(false);
    const failing = vi.fn(async () => new Response('', { status: 404 })) as unknown as typeof fetch;
    expect(await checkForUpdate({ fetcher: failing, force: true })).toBe(false);
    const offline = vi.fn(async () => { throw new Error('offline'); }) as unknown as typeof fetch;
    expect(await checkForUpdate({ fetcher: offline, force: true })).toBe(false);
    expect(document.querySelector('dialog')).toBeNull();
  });
  it('blocks with a refresh-only in-game dialog when a newer build is deployed', async () => {
    const reload = vi.fn();
    const fetcher = deployed('newer-build');
    expect(await checkForUpdate({ fetcher, reload, force: true })).toBe(true);
    const url = String((fetcher as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]);
    expect(url).toContain('version.json');
    const dialog = document.querySelector<HTMLDialogElement>('dialog.update-dialog')!;
    expect(dialog.textContent).toContain('Update available');
    expect(dialog.querySelectorAll('button')).toHaveLength(1);
    const cancel = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancel);
    expect(cancel.defaultPrevented).toBe(true);
    dialog.querySelector('form')!.requestSubmit(dialog.querySelector('button'));
    expect(reload).toHaveBeenCalledOnce();
    expect(await checkForUpdate({ fetcher, force: true })).toBe(true);
    expect(document.querySelectorAll('dialog.update-dialog')).toHaveLength(1);
  });
  it('waits until battle ends, then prompts on the next screen change without refetching', async () => {
    const fetcher = deployed('newer-build');
    expect(await checkForUpdate({ fetcher, blocked: () => true, force: true })).toBe(false);
    expect(document.querySelector('dialog')).toBeNull();
    expect(await checkForUpdate({ fetcher, blocked: () => false })).toBe(true);
    expect((fetcher as unknown as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(1);
  });
  it('throttles routine checks', async () => {
    const fetcher = deployed(currentBuild);
    await checkForUpdate({ fetcher, now: () => 100_000 });
    await checkForUpdate({ fetcher, now: () => 110_000 });
    expect((fetcher as unknown as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(1);
    await checkForUpdate({ fetcher, now: () => 140_000 });
    expect((fetcher as unknown as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(2);
  });
});
