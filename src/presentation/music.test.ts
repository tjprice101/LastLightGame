// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { elements } from '../content/activities';
import { createStoryBattle } from '../game/battle';
import { storyRules } from '../content/story';
import { defaultBindings } from '../game/hotkeys';
import { BattleView, type BattleSession } from './battle-view';
import { BackgroundMusic, battleMusic, defaultMusicPreferences, loadMusicPreferences, MUSIC_KEY,
  musicCrossfadeDuration, musicUrl, saveMusicPreferences, validateMusicPreferences } from './music';

const controllers: BackgroundMusic[] = [];
afterEach(() => {
  controllers.splice(0).forEach(controller => controller.dispose());
  localStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
  vi.useRealTimers();
});

function player() {
  const audio = document.createElement('audio');
  let paused = true;
  vi.spyOn(audio, 'paused', 'get').mockImplementation(() => paused);
  const play = vi.spyOn(audio, 'play').mockImplementation(() => { paused = false; return Promise.resolve(); });
  const pause = vi.spyOn(audio, 'pause').mockImplementation(() => { paused = true; });
  const load = vi.spyOn(audio, 'load').mockImplementation(() => {});
  return { audio, play, pause, load };
}

function fixture() {
  const first = player();
  const second = player();
  const report = vi.fn();
  const controller = new BackgroundMusic(first.audio, document, report, second.audio);
  controllers.push(controller);
  return { ...first, second, report, controller };
}

const gesture = () => document.dispatchEvent(new Event('pointerdown'));
const settle = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); };

describe('delivered soundtrack routing', () => {
  it('wires BattleView render/region changes and Settings reconstruction to the current track', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    const f = fixture();
    const progress = { level: 0, evolution: 1 };
    const session: BattleSession = { state: createStoryBattle(storyRules.regionStages, 17, 'ember', progress),
      progress, log: [], stageEvents: [], runId: 'music-fixture' };
    const host = document.createElement('div');
    document.body.append(host);
    const changed = (state: BattleSession['state']) => f.controller.setTrack(battleMusic(state));
    const view = new BattleView(host, session, defaultBindings, () => {}, undefined, undefined, changed);
    expect(f.audio.src).toContain('music/infernic.mp3');
    session.state = createStoryBattle(storyRules.regionStages + 1, 17, 'ember', progress);
    Reflect.apply(Reflect.get(BattleView.prototype, 'render'), view, []);
    expect(f.audio.src).toContain('music/oceanic.mp3');
    expect(f.load).toHaveBeenCalledTimes(3);
    const menu = host.querySelector<HTMLDialogElement>('#battle-menu');
    if (!menu) throw new Error('Battle menu missing.');
    menu.close = vi.fn();
    view.destroy();
    const restored = new BattleView(host, session, defaultBindings, () => {}, undefined, undefined, changed);
    expect(f.load).toHaveBeenCalledTimes(3);
    const restoredMenu = host.querySelector<HTMLDialogElement>('#battle-menu');
    if (!restoredMenu) throw new Error('Restored battle menu missing.');
    restoredMenu.close = vi.fn();
    restored.destroy();
  });

  it('maps every Story stage and all six material dungeons to the delivered shared tracks', () => {
    for (const [index, element] of elements.entries()) {
      for (let stage = index * storyRules.regionStages + 1; stage <= (index + 1) * storyRules.regionStages; stage++) {
        expect(battleMusic({ story: { storyStage: stage } })).toBe(element.id);
      }
      expect(battleMusic({ dungeon: { element: element.id, stage: 1 } })).toBe(element.id);
      expect(battleMusic({ dungeon: { element: element.id, stage: 35 } })).toBe(element.id);
      expect(musicUrl(element.id)).toBe(`${import.meta.env.BASE_URL}assets/music/${element.id}.mp3`);
    }
  });

  it('does not substitute region music into Training, War or undelivered activity modes', () => {
    expect(battleMusic({})).toBeNull();
    for (const mode of ['heavens', 'abyss', 'treasury', 'sanctuary', 'roses', 'machines'] as const) {
      expect(battleMusic({ infusion: { mode, stage: 1 } })).toBeNull();
    }
    for (const character of ['nerithe', 'orvella', 'vaelor'] as const) {
      expect(battleMusic({ war: { character, stage: 1 } })).toBeNull();
    }
    expect(() => battleMusic({ story: { storyStage: storyRules.stages + 1 } })).toThrow();
  });
});

describe('device-only music preferences', () => {
  it('loads defaults without writing and saves separately from account/settings', () => {
    expect(loadMusicPreferences(localStorage)).toEqual(defaultMusicPreferences);
    expect(localStorage.length).toBe(0);
    localStorage.setItem('last-light.wallet', 'untouched');
    saveMusicPreferences(localStorage, { volume: 72, muted: true });
    expect(loadMusicPreferences(localStorage)).toEqual({ volume: 72, muted: true });
    expect(localStorage.getItem('last-light.wallet')).toBe('untouched');
  });

  it.each([null, {}, { volume: -1, muted: false }, { volume: 101, muted: false },
    { volume: 35.5, muted: false }, { volume: '35', muted: false }, { volume: 35, muted: 'false' }])(
    'rejects malformed preferences %j', (value) => {
      expect(() => validateMusicPreferences(value)).toThrow();
      localStorage.setItem(MUSIC_KEY, JSON.stringify(value));
      expect(() => loadMusicPreferences(localStorage)).toThrow();
    });

  it('surfaces denied storage rather than claiming a save', () => {
    const denied = { getItem: () => { throw new Error('Denied'); }, setItem: () => { throw new Error('Denied'); }, removeItem: () => {} };
    expect(() => loadMusicPreferences(denied)).toThrow('Denied');
    expect(() => saveMusicPreferences(denied, defaultMusicPreferences)).toThrow('Denied');
  });
});

describe('background music lifecycle', () => {
  it('crossfades over exactly 1600ms, starts only after playback succeeds, and releases the outgoing deck', async () => {
    vi.useFakeTimers();
    const f = fixture();
    f.controller.setTrack('main-theme');
    gesture();
    await settle();
    f.audio.currentTime = 35;
    let ready = () => {};
    f.second.play.mockImplementationOnce(() => new Promise<void>((resolve) => { ready = resolve; }));
    f.controller.setTrack('infernic');
    await vi.advanceTimersByTimeAsync(800);
    expect(f.audio.volume).toBe(.35);
    expect(f.second.audio.volume).toBe(0);
    expect(f.audio.paused).toBe(false);
    ready();
    await settle();
    expect(musicCrossfadeDuration).toBe(1600);
    await vi.advanceTimersByTimeAsync(800);
    expect(f.audio.volume).toBeCloseTo(.175);
    expect(f.second.audio.volume).toBeCloseTo(.175);
    expect(f.audio.currentTime).toBe(35);
    f.controller.configure({ volume: 60, muted: false });
    expect(f.audio.volume).toBeCloseTo(.3);
    expect(f.second.audio.volume).toBeCloseTo(.3);
    await vi.advanceTimersByTimeAsync(800);
    expect(f.audio.paused).toBe(true);
    expect(f.audio.hasAttribute('src')).toBe(false);
    expect(f.second.audio.volume).toBe(.6);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('fades to silence for undelivered modes instead of cutting the outgoing song', async () => {
    vi.useFakeTimers();
    const f = fixture();
    f.controller.setTrack('infernic');
    gesture();
    await settle();
    f.controller.setTrack(null);
    expect(f.audio.paused).toBe(false);
    await vi.advanceTimersByTimeAsync(800);
    expect(f.audio.volume).toBeCloseTo(.175);
    await vi.advanceTimersByTimeAsync(800);
    expect(f.audio.paused).toBe(true);
    expect(f.audio.hasAttribute('src')).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('keeps rapid replacements bounded to two decks with no stale fade or playback', async () => {
    vi.useFakeTimers();
    const f = fixture();
    f.controller.setTrack('infernic');
    gesture();
    await settle();
    f.controller.setTrack('oceanic');
    await settle();
    await vi.advanceTimersByTimeAsync(400);
    f.controller.setTrack('chaotic');
    await settle();
    expect(vi.getTimerCount()).toBe(1);
    expect(f.audio.src).toContain('chaotic.mp3');
    expect(f.second.audio.volume).toBeCloseTo(.0875);
    await vi.advanceTimersByTimeAsync(1600);
    expect(f.audio.volume).toBe(.35);
    expect(f.second.audio.paused).toBe(true);
    expect(f.second.audio.hasAttribute('src')).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(['mute', 'hidden', 'dispose'] as const)('cleans up an active crossfade immediately on %s', async (reason) => {
    vi.useFakeTimers();
    const f = fixture();
    f.controller.setTrack('main-theme');
    gesture();
    await settle();
    f.controller.setTrack('botanic');
    await settle();
    await vi.advanceTimersByTimeAsync(400);
    if (reason === 'mute') f.controller.configure({ volume: 35, muted: true });
    if (reason === 'hidden') {
      vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
      document.dispatchEvent(new Event('visibilitychange'));
    }
    if (reason === 'dispose') f.controller.dispose();
    expect(f.audio.paused).toBe(true);
    expect(f.second.audio.paused).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(2000);
    expect(f.audio.paused).toBe(true);
    expect(f.second.audio.paused).toBe(true);
  });

  it('retains the outgoing song when incoming playback fails and crossfades on retry', async () => {
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const f = fixture();
    f.controller.setTrack('main-theme');
    gesture();
    await settle();
    f.second.play.mockRejectedValueOnce(new Error('Decode failed'));
    f.controller.setTrack('oceanic');
    await settle();
    expect(f.report).toHaveBeenCalledWith(expect.stringContaining('could not play'));
    expect(f.audio.paused).toBe(false);
    expect(f.audio.volume).toBe(.35);
    expect(vi.getTimerCount()).toBe(0);
    gesture();
    await settle();
    await vi.advanceTimersByTimeAsync(1600);
    expect(f.audio.paused).toBe(true);
    expect(f.second.audio.volume).toBe(.35);
  });

  it('cancels the envelope on an incoming media failure mid-fade and keeps the previous song audible', async () => {
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const f = fixture();
    f.controller.setTrack('main-theme');
    gesture();
    await settle();
    f.controller.setTrack('chaotic');
    await settle();
    await vi.advanceTimersByTimeAsync(800);
    f.second.audio.dispatchEvent(new Event('error'));
    expect(f.report).toHaveBeenCalledWith(expect.stringContaining('Music could not load (chaotic)'));
    expect(f.audio.volume).toBe(.35);
    expect(f.audio.paused).toBe(false);
    expect(f.second.audio.volume).toBe(0);
    expect(f.second.audio.paused).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('supports accessible clicks even when a control stops event propagation', async () => {
    const f = fixture();
    f.controller.setTrack('main-theme');
    const button = document.createElement('button');
    button.addEventListener('click', event => event.stopPropagation());
    document.body.append(button);
    button.click();
    await settle();
    expect(f.play).toHaveBeenCalledOnce();
  });

  it('waits for interaction, loops and preserves the same track through Settings/Continue', async () => {
    const f = fixture();
    f.controller.setTrack('main-theme');
    expect(f.play).not.toHaveBeenCalled();
    gesture();
    await settle();
    expect(f.play).toHaveBeenCalledOnce();
    expect(f.audio.loop).toBe(true);
    expect(f.audio.volume).toBe(.35);
    f.controller.setTrack('main-theme');
    expect(f.load).toHaveBeenCalledOnce();
    f.controller.setTrack('infernic');
    await settle();
    expect(f.audio.paused).toBe(false);
    expect(f.second.play).toHaveBeenCalledOnce();
    expect(f.second.audio.src).toContain('music/infernic.mp3');
  });

  it('pauses for mute, zero volume and hidden tabs, then resumes the same position', async () => {
    const f = fixture();
    f.controller.setTrack('oceanic');
    gesture();
    await settle();
    f.audio.currentTime = 27;
    f.controller.configure({ volume: 60, muted: true });
    expect(f.audio.paused).toBe(true);
    f.controller.configure({ volume: 0, muted: false });
    expect(f.audio.paused).toBe(true);
    f.controller.configure({ volume: 60, muted: false });
    await settle();
    expect(f.audio.volume).toBe(.6);
    expect(f.audio.currentTime).toBe(27);
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(f.audio.paused).toBe(true);
    gesture();
    expect(f.audio.paused).toBe(true);
    hidden.mockReturnValue(false);
    document.dispatchEvent(new Event('visibilitychange'));
    await settle();
    expect(f.audio.paused).toBe(false);
    expect(f.load).toHaveBeenCalledOnce();
  });

  it('retries browser autoplay restrictions on the next gesture without treating them as asset failures', async () => {
    const f = fixture();
    f.play.mockRejectedValueOnce(new DOMException('Gesture required', 'NotAllowedError'));
    f.controller.setTrack('main-theme');
    gesture();
    await settle();
    expect(f.report).not.toHaveBeenCalled();
    gesture();
    await settle();
    expect(f.play).toHaveBeenCalledTimes(2);
  });

  it('reports real playback and media failures explicitly', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const f = fixture();
    f.play.mockRejectedValueOnce(new Error('Decode failed'));
    f.controller.setTrack('chaotic');
    gesture();
    await settle();
    expect(f.report).toHaveBeenCalledWith(expect.stringContaining('Music could not play'));
    f.audio.dispatchEvent(new Event('error'));
    expect(f.report).toHaveBeenCalledWith(expect.stringContaining('Music could not load (chaotic)'));
  });

  it('ignores superseded play rejections and removes listeners on disposal', async () => {
    const f = fixture();
    let rejectPlay: (reason: Error) => void = () => {};
    f.play.mockImplementationOnce(() => new Promise<void>((_, reject) => { rejectPlay = reject; }));
    f.controller.setTrack('infernic');
    gesture();
    f.controller.setTrack('botanic');
    rejectPlay(new Error('Old request interrupted'));
    await settle();
    expect(f.report).not.toHaveBeenCalled();
    f.controller.dispose();
    const count = f.play.mock.calls.length;
    gesture();
    document.dispatchEvent(new Event('visibilitychange'));
    f.audio.dispatchEvent(new Event('error'));
    expect(f.play).toHaveBeenCalledTimes(count);
    expect(f.audio.hasAttribute('src')).toBe(false);
  });
});
