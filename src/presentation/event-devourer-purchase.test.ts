// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { eventDevourers } from '../content/event-devourers';
import { emptyAccount, type Account } from '../game/account';
import { createCreatureCopy } from '../game/character-instances';
import { bindEventDevourerPurchases, presentSavedEventDevourer } from './event-devourer-purchase';
import { gameConfirm, gameDialogPending } from './game-dialog';
import { presentReward } from './reward-screen';
import { shopHost } from './shop-host';

vi.mock('./game-dialog', async importOriginal => ({
  ...await importOriginal<typeof import('./game-dialog')>(),
  gameConfirm: vi.fn(),
  gameDialogPending: vi.fn(),
}));
vi.mock('./reward-screen', () => ({ presentReward: vi.fn() }));

beforeEach(() => {
  vi.mocked(gameConfirm).mockResolvedValue(true);
  vi.mocked(gameDialogPending).mockReturnValue(false);
  vi.mocked(presentReward).mockResolvedValue(undefined);
});
afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

function fixture(ownsBearer = false) {
  const product = eventDevourers[0];
  const initial = emptyAccount();
  if (ownsBearer) initial.characters.rosetta = { level: 0, evolution: 1 };
  initial.fractalis = product.price;
  const copy = createCreatureCopy(product.id);
  const saved: Account = { ...structuredClone(initial), fractalis: 0, capturedCharacters: [copy] };
  const root = document.createElement('div');
  root.innerHTML = `${shopHost('nimra')}<button data-buy-event-devourer="${product.id}"><span>Buy</span></button>`;
  document.body.append(root);
  const purchase = vi.fn<(id: string) => Promise<Account>>().mockResolvedValue(saved);
  const refresh = vi.fn();
  const report = vi.fn();
  const online = vi.fn(() => true);
  bindEventDevourerPurchases(root, { online, account: () => initial, purchase, refresh, report,
    errorMessage: error => error instanceof Error ? error.message : String(error) });
  return { root, product, initial, saved, purchase, refresh, report, online,
    click: () => root.querySelector<HTMLElement>('[data-buy-event-devourer] span')!.click(),
    line: () => root.querySelector('[data-shop-line]')!.textContent };
}

describe('Event Elemental-Devourer purchase routing', () => {
  it('warns without an associated bearer and waits for the saved result before feedback', async () => {
    const f = fixture();
    let finish!: (account: Account) => void;
    f.purchase.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    f.click();
    await vi.waitFor(() => expect(f.purchase).toHaveBeenCalledWith(f.product.id));
    expect(gameConfirm).toHaveBeenCalledWith(expect.stringContaining('Rosetta'), { title: 'Event warning', confirmLabel: 'Purchase' });
    expect(f.line()).not.toContain('safely in your collection');
    expect(f.report).not.toHaveBeenCalled();
    expect(presentReward).not.toHaveBeenCalled();
    f.click();
    expect(f.purchase).toHaveBeenCalledTimes(1);
    finish(f.saved);
    await vi.waitFor(() => expect(presentReward).toHaveBeenCalledTimes(1));
    expect(f.refresh).toHaveBeenCalledTimes(1);
    expect(f.line()).toContain('safely in your collection');
    expect(f.report).toHaveBeenCalledWith(expect.stringContaining('purchased and saved'), 'success');
    expect(f.initial.fractalis).toBe(f.product.price);
    expect(f.saved.squad).toEqual(f.initial.squad);
  });

  it('cancels without spending and does not issue the ownership warning when a bearer is owned', async () => {
    const f = fixture(true);
    vi.mocked(gameConfirm).mockResolvedValue(false);
    f.click();
    await vi.waitFor(() => expect(gameConfirm).toHaveBeenCalled());
    expect(gameConfirm).toHaveBeenCalledWith(expect.not.stringContaining('Their event materials'), {
      title: 'Event Elemental-Devourers', confirmLabel: 'Purchase',
    });
    expect(f.purchase).not.toHaveBeenCalled();
    expect(f.line()).toContain('while you decide');
    expect(f.report).not.toHaveBeenCalled();
  });

  it('surfaces offline and ambiguous failures without success-shaped dialogue or a reward', async () => {
    const f = fixture();
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    f.online.mockReturnValue(false);
    f.click();
    await vi.waitFor(() => expect(f.report).toHaveBeenCalledWith(expect.stringContaining('Sign in online')));
    expect(f.purchase).not.toHaveBeenCalled();
    f.online.mockReturnValue(true);
    f.purchase.mockRejectedValueOnce(new Error('Server outcome is not yet confirmed. Retry.'));
    f.click();
    await vi.waitFor(() => expect(f.report).toHaveBeenLastCalledWith(expect.stringContaining('not yet confirmed')));
    expect(f.report).not.toHaveBeenCalledWith(expect.anything(), 'success');
    expect(f.line()).not.toContain('safely in your collection');
    expect(presentReward).not.toHaveBeenCalled();
    log.mockRestore();
  });

  it('reports a presentation failure as occurring after the confirmed save', async () => {
    const f = fixture();
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(presentReward).mockRejectedValueOnce(new Error('Reveal unavailable'));
    f.click();
    await vi.waitFor(() => expect(f.report).toHaveBeenLastCalledWith(expect.stringContaining('Purchase saved, but')));
    expect(f.purchase).toHaveBeenCalledTimes(1);
    expect(f.report).toHaveBeenLastCalledWith(expect.stringContaining('Reveal unavailable'));
    expect(f.line()).toContain('safely in your collection');
    log.mockRestore();
  });

  it('reveals only a new copy when a pending purchase is confirmed on retry', async () => {
    const f = fixture();
    const existing = createCreatureCopy(f.product.id);
    const before = new Set([existing.instanceId]);
    await expect(presentSavedEventDevourer(f.root, f.product.id, { ...f.initial, capturedCharacters: [existing] }, before, f.report))
      .rejects.toThrow('could not be displayed');
    expect(f.report).not.toHaveBeenCalled();
    expect(presentReward).not.toHaveBeenCalled();
    await presentSavedEventDevourer(f.root, f.product.id, {
      ...f.saved, capturedCharacters: [existing, ...f.saved.capturedCharacters!],
    }, before, f.report);
    expect(f.report).toHaveBeenCalledWith(expect.stringContaining('purchased and saved'), 'success');
    expect(presentReward).toHaveBeenCalledTimes(1);
    expect(f.purchase).not.toHaveBeenCalled();
  });
});
