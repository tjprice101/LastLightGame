// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { emptyAccount } from '../game/account';
import { getStarter, starters } from '../content/starters';
import { characterEvolutionCost, characterLevelCost, characterLevelCap } from '../content/progression';
import { materialName } from '../content/dungeon-art';
import { referenceTeam } from './reference-team';
import { updateCharacterTab } from './hub';
import { celebrateUpgrade } from './upgrade-celebration';
import { presentUpgrade } from './upgrade-result';
import { presentReward } from './reward-screen';
import { reducedMotion } from './settings';
import { bindInformation } from './information';

vi.mock('./reward-screen', () => ({ presentReward: vi.fn().mockResolvedValue(undefined) }));
vi.mock('./settings', () => ({ reducedMotion: vi.fn(() => false) }));
afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
  vi.mocked(reducedMotion).mockReturnValue(false);
  document.body.replaceChildren();
});

describe('reference Team upgrade presentation', () => {
  it('switches sub-menus in place and shows ability details only in their dialog', () => {
    const account = emptyAccount();
    account.characters.tide = { level: 0, evolution: 1 };
    account.squad = ['tide'];
    const host = document.createElement('main');
    host.innerHTML = referenceTeam(account, { view: 'detail', selected: 'tide', element: '', sort: 'level' });
    document.body.append(host);
    bindInformation(host);
    const header = host.querySelector('.ref-character-header');
    const portrait = header?.querySelector('img');
    const navigation = host.querySelector('.ref-character-submenus');
    const button = host.querySelector<HTMLButtonElement>('[data-information="character-tide-skill1"]')!;
    const dialog = host.querySelector<HTMLDialogElement>('#character-tide-skill1')!;
    dialog.showModal = vi.fn(() => dialog.setAttribute('open', ''));
    dialog.close = vi.fn(() => dialog.removeAttribute('open'));
    expect(button.textContent).not.toContain('Shatter Gauge');
    button.click();
    expect(dialog.showModal).toHaveBeenCalledOnce();
    expect(dialog.textContent).toContain('Costs 25 Shatter Gauge');
    expect(dialog.querySelector('[data-close-information]')?.getAttribute('aria-label')).toBe('Close Skill 1 details');
    expect(dialog.querySelector('[data-close-information]')?.textContent).toBe('×');
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(dialog.close).toHaveBeenCalledOnce();
    updateCharacterTab(host, getStarter('tide'), 'equipment', account);
    expect(host.querySelector('.ref-character-header')).toBe(header);
    expect(header?.querySelector('img')).toBe(portrait);
    expect(host.querySelector('.ref-character-submenus')).toBe(navigation);
    expect(host.querySelectorAll('[data-conduit-slot]')).toHaveLength(8);
    expect(host.querySelector('[data-master-equipment]')).not.toBeNull();
    expect(host.querySelector('[data-character-tab="equipment"]')?.getAttribute('aria-pressed')).toBe('true');
  });

  it.each(starters)('$name shows exact level and evolution costs for every nonfinal form without changing the account', starter => {
    for (let evolution = 1; evolution <= 5; evolution++) {
      const account = emptyAccount();
      const progress = { level: characterLevelCap(evolution) - 1, evolution };
      account.characters[starter.id] = progress;
      account.squad = [starter.id];
      account.fractalis = Number.MAX_SAFE_INTEGER;
      const before = structuredClone(account);
      for (const [tab, cost] of [
        ['upgrade-1', characterLevelCost(starter.id, progress)],
        ['upgrade-0', characterEvolutionCost(starter.id, progress)],
      ] as const) {
        const host = document.createElement('div');
        host.innerHTML = referenceTeam(account, { view: 'detail', selected: starter.id, element: '', sort: 'level', tab });
        const resources = host.querySelector('.upgrade-resources')!;
        expect(resources.textContent).toContain(`${Number.MAX_SAFE_INTEGER} / ${cost.fractalis}`);
        for (const [id, amount] of Object.entries(cost.materials)) {
          const row = Array.from(resources.querySelectorAll('li')).find(row => row.querySelector('strong')?.textContent === materialName(id));
          expect(row?.querySelector('span')?.textContent).toBe(`0 / ${amount}`);
        }
        expect(host.querySelectorAll('.upgrade-stat-preview > span')).toHaveLength(7);
        expect(host.querySelector('.upgrade-benefits details')?.hasAttribute('open')).toBe(false);
      }
      expect(account).toEqual(before);
    }
  });
  it.each(['level', 'evolve'] as const)('plays %s celebration and then the saved stat reveal on the real Team markup', async kind => {
    vi.useFakeTimers();
    const before = emptyAccount();
    before.characters.ember = { level: kind === 'level' ? 12 : 30, evolution: 1 };
    before.squad = ['ember'];
    const after = structuredClone(before);
    after.characters.ember = kind === 'level' ? { level: 13, evolution: 1 } : { level: 30, evolution: 2 };
    const host = document.createElement('main');
    host.innerHTML = referenceTeam(before, { view: 'detail', selected: 'ember', element: '', sort: 'level' });
    document.body.append(host);
    expect(host.querySelector('.character-hub')).toBeNull();
    const portrait = host.querySelector('.hub-showcase .hub-portrait')!;
    const image = portrait.querySelector('img');
    updateCharacterTab(host, getStarter('ember'), 'overview', after);
    expect(portrait.querySelector('img')).toBe(image);
    celebrateUpgrade(host, getStarter('ember'), kind, after.characters.ember);
    expect(portrait.classList.contains(`celebrating-${kind}`)).toBe(true);
    expect(portrait.querySelector('.upgrade-aura-ring')).not.toBeNull();
    expect(portrait.querySelectorAll('.upgrade-spark')).toHaveLength(kind === 'level' ? 6 : 12);
    await presentUpgrade(before, after, 'ember', kind);
    expect(presentReward).toHaveBeenCalledOnce();
    const reveal = vi.mocked(presentReward).mock.calls[0][0];
    expect(reveal.details).toContain('Stat changes');
    expect(reveal.art).toContain('upgrade-result-portrait');
    vi.runAllTimers();
    expect(portrait.querySelector('.upgrade-celebration')).toBeNull();
    expect(portrait.classList.contains(`celebrating-${kind}`)).toBe(false);
  });

  it('keeps reduced-motion feedback on the reference portrait', () => {
    vi.useFakeTimers();
    vi.mocked(reducedMotion).mockReturnValue(true);
    const account = emptyAccount();
    account.characters.ember = { level: 1, evolution: 1 };
    account.squad = ['ember'];
    const host = document.createElement('main');
    host.innerHTML = referenceTeam(account, { view: 'detail', selected: 'ember', element: '', sort: 'level' });
    celebrateUpgrade(host, getStarter('ember'), 'level', account.characters.ember);
    expect(host.querySelector('.celebration-reduced')?.textContent).toContain('Level up');
    vi.runAllTimers();
  });
});
