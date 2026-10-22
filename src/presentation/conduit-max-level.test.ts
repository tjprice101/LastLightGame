// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ACCOUNT_KEY, conduitMaxLevelPlan, emptyAccount, loadAccount, saveAccount, type Account, type ConduitMaxLevelPlan } from '../game/account';
import { SAVE_KEY, type ProfileStorage } from '../game/profile';
import { bindConduitUpgrades, conduitUpgradeMenu, updateConduitUpgradeMenu } from './conduit-upgrade';
import { gameConfirm } from './game-dialog';
import { presentReward } from './reward-screen';

vi.mock('./game-dialog', async original => ({
  ...await original<typeof import('./game-dialog')>(), gameConfirm: vi.fn(),
}));
vi.mock('./reward-screen', () => ({ presentReward: vi.fn() }));
beforeEach(() => { vi.mocked(gameConfirm).mockReset().mockResolvedValue(true); vi.mocked(presentReward).mockReset().mockResolvedValue(undefined); });
afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); });

function fixture(components = 829, online?: (plan: ConduitMaxLevelPlan) => Promise<ReturnType<typeof emptyAccount>>) {
  const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  const storage: ProfileStorage = { getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); }, removeItem: key => { values.delete(key); } };
  let account: Account = { ...emptyAccount(), characters: { ember: { level: 0, evolution: 1 } },
    conduits: { 'vigil-core': 2 }, mechanicalComponents: components };
  account = saveAccount(storage, account);
  const host = document.createElement('div');
  host.innerHTML = conduitUpgradeMenu(account, 'vigil-core');
  document.body.append(host);
  const error = vi.fn();
  const single = online ? vi.fn() : undefined;
  const refresh = vi.fn(updated => {
    account = updated;
    updateConduitUpgradeMenu(host, account);
    bind();
  });
  const bind = () => bindConduitUpgrades(host, storage, refresh, error, single, online);
  bind();
  const maximum = () => host.querySelector<HTMLButtonElement>('[data-max-conduit]')!;
  const click = async () => { maximum().click(); await vi.waitFor(() => expect(refresh.mock.calls.length + error.mock.calls.length).toBeGreaterThan(0)); };
  return { host, storage, maximum, click, refresh, error, single, bind };
}

describe('Conduit Max Level control', () => {
  it('shows exact highest affordable target/total and disables empty or capped previews', () => {
    const f = fixture(174);
    expect(f.maximum().textContent).toBe('Max Level · +2 · 75 components');
    expect(f.maximum().disabled).toBe(false);
    expect(f.host.querySelector('[data-upgrade-conduit]:not([data-max-conduit])')).not.toBeNull();
    updateConduitUpgradeMenu(f.host, { ...emptyAccount(), conduits: { 'vigil-core': 1 }, mechanicalComponents: 24 });
    expect(f.maximum().disabled).toBe(true);
    updateConduitUpgradeMenu(f.host, { ...emptyAccount(), conduits: { 'vigil-core': 1 },
      mechanicalComponents: 100000, conduitUpgrades: { 'vigil-core': 5 } });
    expect(f.maximum().disabled).toBe(true);
    expect(conduitUpgradeMenu(null)).not.toContain('data-max-conduit');
    expect(conduitUpgradeMenu(emptyAccount())).not.toContain('data-max-conduit');
  });
  it('confirms current/target effects and total spending, saves once and presents the actual saved final level', async () => {
    const f = fixture();
    const write = vi.spyOn(f.storage, 'setItem');
    f.bind();
    await f.click();
    expect(gameConfirm).toHaveBeenCalledTimes(1);
    expect(gameConfirm).toHaveBeenCalledWith(expect.stringContaining('Spend 600 Broken Mechanical Components'), { title: 'Max Level Conduit', confirmLabel: 'Max Level' });
    expect(gameConfirm).toHaveBeenCalledWith(expect.stringContaining('from +0 to +5'), expect.anything());
    expect(gameConfirm).toHaveBeenCalledWith(expect.stringContaining('Current: +35% [Health]. Target: +52.5% [Health].'), expect.anything());
    expect(write).toHaveBeenCalledTimes(1);
    expect(loadAccount(f.storage)).toMatchObject({ mechanicalComponents: 229, conduitUpgrades: { 'vigil-core': 5 }, conduits: { 'vigil-core': 2 } });
    expect(f.refresh).toHaveBeenCalledTimes(1);
    expect(f.host.querySelector('#conduit-upgrade-result')?.textContent).toContain('upgraded to +5. 600');
    expect(presentReward).toHaveBeenCalledWith(expect.objectContaining({ details: expect.stringContaining('Upgrade +5') }));
    await vi.waitFor(() => expect(document.activeElement).toBe(f.host.querySelector('#conduit-upgrade-result')));
    expect(f.maximum().disabled).toBe(true);
  });
  it('cancels without spending and blocks simultaneous single/max clicks while confirmation is pending', async () => {
    const f = fixture();
    let cancel!: (result: boolean) => void;
    vi.mocked(gameConfirm).mockImplementation(() => new Promise(resolve => { cancel = resolve; }));
    const raw = f.storage.getItem(ACCOUNT_KEY);
    f.maximum().click();
    f.maximum().click();
    f.host.querySelector<HTMLButtonElement>('[data-upgrade-conduit]:not([data-max-conduit])')!.click();
    expect(gameConfirm).toHaveBeenCalledTimes(1);
    cancel(false);
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(f.storage.getItem(ACCOUNT_KEY)).toBe(raw);
    expect(f.refresh).not.toHaveBeenCalled();
    expect(presentReward).not.toHaveBeenCalled();
    expect(f.error).not.toHaveBeenCalled();
  });
  it.each(['stale', 'write'] as const)('reports %s failures with no partial spending or success presentation', async failure => {
    const f = fixture();
    if (failure === 'stale') saveAccount(f.storage, { ...loadAccount(f.storage), mechanicalComponents: 25 });
    else vi.spyOn(f.storage, 'setItem').mockImplementation(() => { throw new Error('Write denied'); });
    const raw = f.storage.getItem(ACCOUNT_KEY);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await f.click();
    expect(f.error).toHaveBeenCalledWith(expect.stringContaining(failure === 'stale' ? 'preview changed' : 'Write denied'));
    expect(f.storage.getItem(ACCOUNT_KEY)).toBe(raw);
    expect(f.refresh).not.toHaveBeenCalled();
    expect(presentReward).not.toHaveBeenCalled();
  });
  it('sends one authoritative Max Level operation with no offline or per-level writes', async () => {
    const result = { ...emptyAccount(), conduits: { 'vigil-core': 2 }, mechanicalComponents: 229, conduitUpgrades: { 'vigil-core': 5 } };
    const online = vi.fn().mockResolvedValue(result);
    const f = fixture(829, online);
    const expected = conduitMaxLevelPlan(loadAccount(f.storage), 'vigil-core');
    const raw = f.storage.getItem(ACCOUNT_KEY);
    await f.click();
    expect(online).toHaveBeenCalledExactlyOnceWith(expected);
    expect(f.single).not.toHaveBeenCalled();
    expect(f.storage.getItem(ACCOUNT_KEY)).toBe(raw);
    expect(f.error).not.toHaveBeenCalled();
  });
  it('distinguishes a saved upgrade from a subsequent presentation failure', async () => {
    const f = fixture();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(presentReward).mockRejectedValueOnce(new Error('Display failed'));
    await f.click();
    await vi.waitFor(() => expect(f.error).toHaveBeenCalledWith(expect.stringContaining('upgrade is saved')));
    expect(loadAccount(f.storage).conduitUpgrades?.['vigil-core']).toBe(5);
  });
});
