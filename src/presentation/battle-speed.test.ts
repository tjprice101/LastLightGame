import { afterEach, describe, expect, it, vi } from 'vitest';
import { type ProfileStorage } from '../game/profile';
import { BattleView } from './battle-view';
import { createBattle } from '../game/battle';
import { applyBattleSpeed, battleSpeed, BATTLE_SPEED_KEY, loadBattleSpeed, parseBattleSpeed, saveBattleSpeed } from './battle-speed';

afterEach(() => vi.unstubAllGlobals());

function storage(): ProfileStorage {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => { data.set(key, value); },
    removeItem: (key) => { data.delete(key); },
  };
}

function browser() {
  const dataset: Record<string, string> = {};
  const style = { setProperty: vi.fn() };
  const dispatchEvent = vi.fn();
  vi.stubGlobal('document', { documentElement: { dataset, style } });
  vi.stubGlobal('window', { dispatchEvent });
  return { dataset, style, dispatchEvent };
}

describe('battle animation speed', () => {
  it('defaults to 1x for existing saves and persists each supported speed independently', () => {
    const save = storage();
    save.setItem('last-light.settings', 'reduced');
    expect(loadBattleSpeed(save)).toBe(1);
    for (const speed of [1, 2, 3] as const) {
      saveBattleSpeed(save, speed);
      expect(loadBattleSpeed(save)).toBe(speed);
    }
    expect(save.getItem('last-light.settings')).toBe('reduced');
  });

  it.each(['0', '4', '2.5', '', '02', 'NaN', '{}'])('rejects unsupported/corrupt speed %s', (value) => {
    expect(() => parseBattleSpeed(value)).toThrow('Battle speed must');
    const save = storage();
    save.setItem(BATTLE_SPEED_KEY, value);
    expect(() => loadBattleSpeed(save)).toThrow('Battle speed must');
  });

  it('surfaces failed storage reads/writes', () => {
    const save: ProfileStorage = {
      getItem: () => { throw new Error('Read failed'); },
      setItem: () => { throw new Error('Write failed'); },
      removeItem: () => {},
    };
    expect(() => loadBattleSpeed(save)).toThrow('Read failed');
    expect(() => saveBattleSpeed(save, 2)).toThrow('Write failed');
  });

  it.each([1, 2, 3] as const)('applies %ix to CSS and broadcasts live changes', (speed) => {
    const f = browser();
    expect(battleSpeed()).toBe(1);
    applyBattleSpeed(speed);
    expect(battleSpeed()).toBe(speed);
    expect(f.style.setProperty).toHaveBeenCalledWith('--battle-speed', String(speed));
    expect(f.dispatchEvent.mock.calls[0][0].type).toBe('last-light-battle-speed-change');
  });

  it.each([1, 2, 3] as const)('plays every sequence duration at exactly %ix and cleans up', async (speed) => {
    browser();
    applyBattleSpeed(speed);
    for (const duration of [180, 280, 440, 650, 850, 1100, 1200, 1849]) {
      const animation = { playbackRate: 1, finished: Promise.resolve(), cancel: vi.fn() };
      const element = { animate: vi.fn(() => animation) };
      const view = Object.create(BattleView.prototype);
      Object.assign(view, { animations: new Set() });
      await Reflect.apply(Reflect.get(BattleView.prototype, 'play'), view, [element, [], duration]);
      expect(element.animate).toHaveBeenCalledWith([], { duration, easing: 'ease-out' });
      expect(duration / animation.playbackRate).toBe(duration / speed);
      expect(animation.cancel).toHaveBeenCalledOnce();
      expect(view.animations.size).toBe(0);
    }
  });

  it('updates in-flight animations without restarting or resolving the sequence early', async () => {
    browser();
    let finish = () => {};
    const animation = { playbackRate: 1, finished: new Promise<void>((resolve) => { finish = resolve; }), cancel: vi.fn(), updatePlaybackRate: vi.fn() };
    const element = { animate: vi.fn(() => animation) };
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    const events = new EventTarget();
    vi.stubGlobal('window', events);
    Object.assign(document, { addEventListener: vi.fn(), removeEventListener: vi.fn() });
    const menu = { addEventListener: vi.fn(), close: vi.fn() };
    const host = { querySelector: (selector: string) => selector === '#battle-menu' ? menu : null, querySelectorAll: () => [], innerHTML: '' };
    const session = { state: createBattle(1729, ['ember']), log: [], stageEvents: [], progress: { level: 0, evolution: 1 } };
    const view = Reflect.construct(BattleView, [host, session, { nextAlly: 'KeyC', nextTarget: 'KeyT' }, () => {}]);
    let settled = false;
    const presentation = Reflect.apply(Reflect.get(BattleView.prototype, 'play'), view, [element, [], 1200]) as Promise<void>;
    const playing = presentation.then(() => { settled = true; });
    applyBattleSpeed(3);
    expect(animation.updatePlaybackRate).toHaveBeenCalledWith(3);
    expect(element.animate).toHaveBeenCalledOnce();
    expect(settled).toBe(false);
    finish();
    await playing;
    expect(settled).toBe(true);
    view.destroy();
    animation.updatePlaybackRate.mockClear();
    Reflect.get(view, 'animations').add(animation);
    applyBattleSpeed(2);
    expect(animation.updatePlaybackRate).not.toHaveBeenCalled();
  });
});
