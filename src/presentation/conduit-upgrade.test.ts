import { afterEach, describe, expect, it, vi } from 'vitest';
import { emptyAccount, loadAccount, saveAccount, ACCOUNT_KEY } from '../game/account';
import { SAVE_KEY, type ProfileStorage } from '../game/profile';
import { conduitUpgradeMenu, bindConduitUpgrades } from './conduit-upgrade';
import { conduitIcon, conduitStore } from './conduit-store';
import { inventoryView } from './inventory';
import { characterDetail, homeHub } from './hub';
import { archives } from './archives';
import { characterCopyManagement } from './roster';
import { createCreatureCopy } from '../game/character-instances';
import { getStarter } from '../content/starters';
import { creatureGlossary } from './creature-glossary';
import { sanctuaryHeader, isMenuPage } from './sanctuary';
import { lootItems, lootArt } from './battle-loot';
import { battleResults, encounterRewards } from './battle-results';
import { createInfusionBattle, type BattleEvent } from '../game/battle';
import { gameConfirm } from './game-dialog';
import { presentReward } from './reward-screen';

vi.mock('./game-dialog', async (importOriginal) => ({
  ...await importOriginal<typeof import('./game-dialog')>(), gameConfirm: vi.fn(),
}));
vi.mock('./reward-screen', () => ({ presentReward: vi.fn().mockResolvedValue(undefined) }));

afterEach(() => vi.unstubAllGlobals());
function wallet() {
  return { ...emptyAccount(), characters: { ember: { level: 0, evolution: 1 } },
    conduits: { 'vigil-core': 2, 'worldbreaker-drive': 1 }, conduitUpgrades: { 'worldbreaker-drive': 4 },
    mechanicalComponents: 250 };
}

describe('Conduit Upgrade and account-aware icons', () => {
  it('shows owned names only, current/next drawbacks, exact costs, components-only rules and accessible levels', () => {
    const account = wallet();
    const html = conduitUpgradeMenu(account);
    expect(html.match(/data-upgrade-card=/g)).toHaveLength(2);
    expect(html).toContain('data-expected-upgrade="4"');
    expect(html).toContain('+255% Attack, -30% Health');
    expect(html).toContain('+297.5% Attack, -35% Health');
    expect(html).toContain('Upgrade to +5 · 1000 components');
    expect(html).toMatch(/data-upgrade-conduit="worldbreaker-drive"[^>]+disabled/);
    account.mechanicalComponents = 1000;
    expect(conduitUpgradeMenu(account)).not.toMatch(/data-upgrade-conduit="worldbreaker-drive"[^>]+disabled/);
    for (const row of ['Common: 25 / 50 / 100 / 175 / 250',
      'Rare: 50 / 100 / 200 / 350 / 500', 'Legendary: 100 / 200 / 400 / 700 / 1000',
      'Omnic: 5000 / 10000 / 20000 / 35000 / 50000']) expect(html).toContain(row);
    expect(html).toContain('3.5 times their original values');
    expect(html).toContain('Legendary penalties grow too');
    expect(html).toContain('id="mechanical-components-balance">250');
    expect(html).toContain('data-machine-activity');
    expect(html).not.toContain('artwork pending');
    expect(html).toContain('currencies/mechanical-components.png');
    expect(conduitIcon('worldbreaker-drive', 4)).toContain('aria-label="Worldbreaker Drive · Upgrade +4 of 5"');
    expect(conduitIcon('worldbreaker-drive', 4)).toContain('class="conduit-upgrade-meter" data-upgrade-level="4" aria-hidden="true"');
    for (const level of [-1, 6, 1.5, NaN]) expect(() => conduitIcon('vigil-core', level)).toThrow();
  });
  it('disables unaffordable/final upgrades and distinguishes empty from unavailable holdings', () => {
    const account = wallet();
    account.mechanicalComponents = 24;
    account.conduitUpgrades['worldbreaker-drive'] = 5;
    const html = conduitUpgradeMenu(account);
    expect(html).toMatch(/data-upgrade-conduit="vigil-core"[^>]+disabled/);
    expect(html).toMatch(/data-upgrade-conduit="worldbreaker-drive"[^>]+disabled/);
    expect(html).toContain('Maximum upgrade +5');
    expect(html).toContain('Not enough Broken Mechanical Components');
    expect(conduitUpgradeMenu(emptyAccount())).toContain('No owned Conduits to upgrade');
    expect(conduitUpgradeMenu(null)).toContain('role="alert"');
    expect(conduitUpgradeMenu(null)).not.toContain('No owned Conduits to upgrade');
  });
  it('keeps markers and scaled effects/stats consistent in Inventory, Archives, starter/captured gear and Store', () => {
    const account = wallet();
    account.conduitUpgrades['worldbreaker-drive'] = 5;
    const slots = ['worldbreaker-drive', null, null, null, null, null, null, null] as const;
    const copy = createCreatureCopy('infusion:heavens:0', 1, 80);
    const equipped = { ...account, capturedCharacters: [copy], conduitEquipment: { ember: [...slots], [copy.instanceId]: [...slots] },
      conduitUpgrades: { ...account.conduitUpgrades, 'vigil-core': 3 } };
    const before = structuredClone(equipped);
    for (const html of [inventoryView(equipped, 'conduits'), archives(equipped, 'conduits'),
      characterDetail(getStarter('ember'), 'equipment', equipped), characterCopyManagement(equipped, 'all')]) {
      expect(html).toContain('data-conduit-upgrade="5"');
      expect(html).toContain('+297.5% Attack, -35% Health');
      expect(html).toContain('data-page="conduit-upgrade"');
    }
    expect(conduitStore(equipped)).toContain('+12.5% Health');
    expect(homeHub(getStarter('ember'), false, equipped)).toContain('143');
    expect(equipped).toEqual(before);
    expect(isMenuPage('conduit-upgrade')).toBe(true);
    expect(sanctuaryHeader('home', 0, 0)).toContain('data-page="conduit-upgrade"');
  });
  it('shows the stage component loot only after defeat and uses saved icon levels in machine loot tables', () => {
    const account = wallet();
    account.creatures['infusion:machines:0'] = { defeated: false };
    expect(creatureGlossary(account)).not.toContain('Broken Mechanical Components');
    account.creatures['infusion:machines:0'].defeated = true;
    const html = creatureGlossary(account);
    expect(html).toContain('Broken Mechanical Components');
    expect(html).toContain('<td>1-1</td><td>25%</td>');
    expect(html).toContain('currencies/mechanical-components.png');
  });
  it('includes actual component stacks and snapshotted Conduit levels in loot/results without extra awards', () => {
    const reward: BattleEvent = { kind: 'reward', source: 'enemy', target: '', amount: 20, critical: false, message: 'Reward',
      mechanicalComponents: 5, conduits: { 'worldbreaker-drive': 1 }, conduitUpgrades: { 'worldbreaker-drive': 4 } };
    expect(lootItems(reward)).toContainEqual({ id: 'mechanical-components', name: 'Broken Mechanical Components', amount: 5, color: '#ffffff' });
    expect(lootArt({ id: 'mechanical-components' })).toContain('currencies/mechanical-components.png');
    expect(inventoryView(wallet())).toContain('currencies/mechanical-components.png');
    expect(lootItems(reward).find((item) => item.id === 'conduit:worldbreaker-drive')?.upgradeLevel).toBe(4);
    expect(encounterRewards([reward, reward]).find((item) => item.id === 'mechanical-components')?.amount).toBe(5);
    const state = createInfusionBattle('machines', 35, 1, 'ember', { level: 0, evolution: 1 });
    state.phase = 'cleared';
    const html = battleResults(state, [reward]);
    expect(html).toContain('Broken Mechanical Components');
    expect(html).toContain('data-conduit-upgrade="4"');
    expect(html).toContain('currencies/mechanical-components.png');
  });
});

describe('upgrade confirmation and failure UI', () => {
  function fixture() {
    const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
    const storage: ProfileStorage = { getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => { values.set(key, value); }, removeItem: (key) => { values.delete(key); } };
    saveAccount(storage, { ...loadAccount(storage), conduits: { 'vigil-core': 1 }, mechanicalComponents: 25 });
    let click = () => {};
    const status = { textContent: '', focus: vi.fn() };
    const button = { dataset: { upgradeConduit: 'vigil-core', expectedUpgrade: '0' }, disabled: false,
      addEventListener: (_event: string, handler: () => void) => { click = handler; }, focus: vi.fn() };
    const host = { querySelectorAll: () => [button], querySelector: (selector: string) => selector === '#conduit-upgrade-result' ? status : null };
    const refresh = vi.fn();
    const error = vi.fn();
    Reflect.apply(bindConduitUpgrades, null, [host, storage, refresh, error]);
    return { storage, click: () => click(), refresh, error, status, button };
  }
  it('cancellation never spends or refreshes, while confirmed upgrades update status and focus', async () => {
    vi.mocked(gameConfirm).mockResolvedValue(false);
    const f = fixture();
    const before = f.storage.getItem(ACCOUNT_KEY);
    await f.click();
    expect(f.storage.getItem(ACCOUNT_KEY)).toBe(before);
    expect(f.refresh).not.toHaveBeenCalled();
    vi.mocked(gameConfirm).mockResolvedValue(true);
    await f.click();
    expect(loadAccount(f.storage).conduitUpgrades).toEqual({ 'vigil-core': 1 });
    expect(loadAccount(f.storage).mechanicalComponents).toBe(0);
    expect(f.refresh).toHaveBeenCalledTimes(1);
    expect(f.status.textContent).toContain('Vigil Core upgraded to +1');
    expect(f.status.focus).toHaveBeenCalled();
  });
  it('reports failed writes/stale second clicks without a success refresh or partial award', async () => {
    vi.mocked(gameConfirm).mockResolvedValue(true);
    const f = fixture();
    const before = f.storage.getItem(ACCOUNT_KEY);
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const write = vi.spyOn(f.storage, 'setItem').mockImplementation(() => { throw new Error('Write failed'); });
    await f.click();
    expect(f.storage.getItem(ACCOUNT_KEY)).toBe(before);
    expect(f.refresh).not.toHaveBeenCalled();
    expect(f.error).toHaveBeenCalledWith(expect.stringContaining('Write failed'));
    write.mockRestore();
    await f.click();
    const success = f.storage.getItem(ACCOUNT_KEY);
    await f.click();
    expect(f.error).toHaveBeenLastCalledWith(expect.stringContaining('changed'));
    expect(f.storage.getItem(ACCOUNT_KEY)).toBe(success);
    expect(f.refresh).toHaveBeenCalledTimes(1);
    log.mockRestore();
  });
  it('uses the Legendary rarity cost in confirmation, spending and saved-success text', async () => {
    vi.mocked(gameConfirm).mockClear().mockResolvedValue(true);
    const f = fixture();
    saveAccount(f.storage, { ...loadAccount(f.storage), conduits: { 'worldbreaker-drive': 1 },
      mechanicalComponents: 100 });
    f.button.dataset.upgradeConduit = 'worldbreaker-drive';
    await f.click();
    expect(gameConfirm).toHaveBeenCalledWith(expect.stringContaining('Spend 100 Broken Mechanical Components'), { title: 'Upgrade Conduit', confirmLabel: 'Upgrade' });
    expect(loadAccount(f.storage).mechanicalComponents).toBe(0);
    expect(loadAccount(f.storage).conduitUpgrades).toEqual({ 'worldbreaker-drive': 1 });
    expect(f.status.textContent).toContain('100 Broken Mechanical Components spent');
    expect(f.error).not.toHaveBeenCalled();
  });
  it('distinguishes presentation failures after a successful save from rejected upgrades', async () => {
    vi.mocked(gameConfirm).mockResolvedValue(true);
    vi.mocked(presentReward).mockRejectedValueOnce(new Error('Presentation unavailable'));
    const f = fixture();
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    await f.click();
    expect(loadAccount(f.storage).conduitUpgrades).toEqual({ 'vigil-core': 1 });
    expect(loadAccount(f.storage).mechanicalComponents).toBe(0);
    expect(f.error).toHaveBeenCalledWith(expect.stringContaining('upgrade is saved'));
    expect(f.error).not.toHaveBeenCalledWith(expect.stringContaining('was not completed'));
    log.mockRestore();
  });
});
