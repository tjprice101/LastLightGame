// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { freshGame } from '../../supabase/functions/game-operation/engine';
import { resolveRadiantRun, type RadiantRunRequest, type RadiantRunResponse, type RadiantRunSnapshot } from '../online/radiant-run';
import { RadiantSession } from '../online/radiant-session';
import { releasedRadiantIds } from '../content/radiant-combat';
import { characterArt } from '../content/character-art';
import { compactPortraitRevisions } from '../content/compact-portrait-revisions';
import { RadiantBattleView, type RadiantBattleEffects } from './radiant-battle-view';
import { applyMotion } from './settings';
import { radiantReadout, type RadiantImpactFrame } from './radiant-impact';
import * as dialogs from './game-dialog';
import type { RadiantMasterId } from '../content/radiant-combat';
import type { RadiantCombatState } from '../game/radiant-combat';

let serial = 0;
const uuid = () => `00000000-0000-4000-8000-${(++serial).toString(16).padStart(12, '0')}`;
const disposed: RadiantBattleView[] = [];
function fixture(count = 6, form = 6, effects?: RadiantBattleEffects, stage = 25, onExit?: () => void,
  masterId?: RadiantMasterId, charged = false, setup?: (state: RadiantCombatState) => void) {
  const state = freshGame('battle-surface'); state.starterId = 'ember';
  state.account.storyCompleted = stage - 1;
  state.account.squad = releasedRadiantIds.slice(0, count);
  for (const id of state.account.squad) state.account.characters[id as keyof typeof state.account.characters] =
    { level: form === 1 ? 30 : 105, evolution: form, weaponRank: 0 };
  if (masterId) {
    state.account.masterConduits = { [masterId]: 1 };
    state.account.masterEquipment = { [masterId.split('-')[1]]: masterId };
  }
  const authority = { capability: 'isolated-radiant-study' as const, now: Date.UTC(2026, 10, 8),
    entry: () => ({ runId: uuid(), encounterSeed: 1729, chargeSeed: 7, targetSeed: 104729 }) };
  const entered = resolveRadiantRun({ revision: 0, state }, { requestId: uuid(), expectedRevision: 0,
    runId: null, encounter: null, operation: { kind: 'start', activity: { kind: 'story', stage },
      calibration: 'authored-control' } }, authority);
  if (charged) for (const member of entered.state.radiantStudy!.state.gauge.members) member.charge = member.baseCost;
  setup?.(entered.state.radiantStudy!.state);
  let snapshot: RadiantRunSnapshot = { revision: 1, state: entered.state };
  const receipts = new Map<string, RadiantRunResponse>();
  const transport = { read: vi.fn(async () => ({ revision: snapshot.revision, account: snapshot.state.account,
    run: snapshot.state.radiantStudy ?? null })), execute: vi.fn(async (request: RadiantRunRequest) => {
    const cached = receipts.get(request.requestId);
    if (cached) return structuredClone(cached);
    const result = resolveRadiantRun(snapshot, request, authority);
    snapshot = { revision: result.response.revision, state: result.state };
    receipts.set(request.requestId, structuredClone(result.response)); return result.response;
  }) };
  const session = new RadiantSession({ revision: 1, account: snapshot.state.account,
    run: snapshot.state.radiantStudy! }, transport, uuid);
  const host = document.createElement('div'); document.body.append(host);
  const settings = vi.fn();
  const view = new RadiantBattleView(host, session, settings, effects, onExit); disposed.push(view);
  return { view, session, host, transport, settings };
}
function controls(host: HTMLElement, selector: string) { return host.querySelector<HTMLButtonElement>(selector)!; }
async function clear(view: RadiantBattleView, session: RadiantSession) {
  for (let turn = 0; turn < 40 && session.view().saved.run!.state.phase === 'player'; turn++) await view.act('normal');
  expect(session.view().saved.run!.state.phase).toBe('victory');
}
afterEach(() => {
  for (const view of disposed.splice(0)) view.dispose();
  document.body.replaceChildren(); document.documentElement.dataset.motion = 'system';
  document.documentElement.dataset.battleSpeed = '1';
  vi.restoreAllMocks();
});
describe('saved six-member Radiant battle surface', () => {
  it('renders six stable per-form face controls, four stats, two personal layers and exact shared charge', async () => {
    const { view, host, session } = fixture(); applyMotion('reduced'); await view.finishEntrance();
    expect(host.querySelectorAll('[data-radiant-actor]')).toHaveLength(6);
    expect(host.querySelectorAll('.compact-portrait img')).toHaveLength(6);
    for (const id of releasedRadiantIds.slice(0, 6)) {
      const art = characterArt(id, 6).art;
      const image = host.querySelector<HTMLImageElement>(`.compact-portrait[data-character="${id}"] img`)!;
      expect(image.getAttribute('src')).toContain(`character-faces/${art}.png?v=${compactPortraitRevisions[art]}`);
      expect(image.alt).not.toContain('pending');
    }
    expect(host.querySelectorAll('[data-radiant-charge]')).toHaveLength(12);
    expect(host.querySelectorAll('[data-radiant-reference]')).toHaveLength(6);
    expect(host.querySelectorAll('.radiant-allies .radiant-ally-art')).toHaveLength(6);
    expect(host.querySelectorAll('.radiant-field [data-radiant-art]')).toHaveLength(8);
    expect(host.querySelectorAll('.radiant-allies .compact-portrait')).toHaveLength(0);
    expect(host.querySelector('.radiant-squad .radiant-ally-art')).toBeNull();
    expect(host.textContent).not.toMatch(/Critical|Shatter|Elemental Damage/);
    expect(host.querySelector('[data-radiant-shared-text]')!.textContent).toBe('0 / 100');
    expect(host.querySelector<HTMLMeterElement>('[data-radiant-shared]')!.max).toBe(100);
    expect(host.getAttribute('aria-busy')).toBe('false');
    const image = host.querySelector('.compact-portrait img');
    const enemyImage = host.querySelector('.radiant-enemy-art');
    const scenery = host.querySelector('.radiant-arena-art');
    const ally = host.querySelector('.radiant-ally-art');
    expect(enemyImage).not.toBeNull(); expect(scenery).not.toBeNull();
    await view.act('normal');
    expect(host.querySelector('.compact-portrait img')).toBe(image);
    expect(host.querySelector('.radiant-enemy-art')).toBe(enemyImage);
    expect(host.querySelector('.radiant-arena-art')).toBe(scenery);
    expect(host.querySelector('.radiant-ally-art')).toBe(ally);
    expect(session.view().presentation).toBeNull();
    const savedCharge = session.view().saved.run!.state.gauge.members[0].charge;
    expect(host.querySelector('[data-radiant-charge-text="ember"]')!.textContent).toBe(`${savedCharge} / 60 charge`);
  });
  it('portrait tap saves exactly one Normal Attack for that member while selection remains a non-spending alternative', async () => {
    const { view, session, host, transport } = fixture(); applyMotion('reduced'); await view.finishEntrance();
    controls(host, '[data-radiant-select="sprout"]').click();
    expect(transport.execute).not.toHaveBeenCalled();
    controls(host, '[data-radiant-actor="tide"]').click();
    await vi.waitFor(() => expect(session.view().presentation).toBeNull());
    expect(transport.execute).toHaveBeenCalledTimes(1);
    expect(transport.execute.mock.calls[0][0].operation).toEqual({ kind: 'action',
      action: { type: 'normal', bearerId: 'tide', targetId: 'story-25-0' } });
    expect(host.querySelector('[data-radiant-field-unit="tide"]')).not.toBeNull();
  });
  it('shows every saved teammate share and preserves static feedback under Reduce motion', async () => {
    const { view, session, host } = fixture(); applyMotion('reduced'); await view.finishEntrance();
    await view.act('normal');
    const run = session.view().saved.run!;
    const drops = session.view().events.filter(event => event.type === 'gauge-drop' && event.bearerId === 'ember');
    const total = drops.reduce((sum, event) => sum + (event.type === 'gauge-drop' ? event.amount : 0), 0);
    expect(total).toBeGreaterThan(0);
    for (const member of run.state.gauge.members.slice(1)) {
      expect(member.charge).toBe(total / 10);
      expect(host.querySelector(`[data-radiant-charge-text="${member.id}"]`)!.textContent)
        .toBe(`${member.charge} / ${member.baseCost * 2} charge`);
    }
    expect(host.querySelector('.radiant-orb')).toBeNull();
  });
  it('animates saved Gauge drops from the struck enemy to every recipient', async () => {
    const original = Object.getOwnPropertyDescriptor(Element.prototype, 'animate');
    const orbs: { left: string; top: string; end: string }[] = [];
    Object.defineProperty(Element.prototype, 'animate', { configurable: true, value: function (
      this: Element, frames: Keyframe[] | PropertyIndexedKeyframes,
    ): Animation {
      if (this instanceof HTMLElement && this.classList.contains('radiant-orb') && Array.isArray(frames))
        orbs.push({ left: this.style.left, top: this.style.top, end: String(frames.at(-1)?.transform) });
      const animation: Partial<Animation> = { playbackRate: 1, playState: 'finished',
        finished: Promise.resolve().then(() => animation as Animation), cancel() {}, pause() {}, play() {} };
      return animation as Animation;
    } });
    try {
      const { view, session, host } = fixture(); await view.finishEntrance();
      const enemyId = session.view().saved.run!.state.enemies[0].id;
      const enemy = host.querySelector<HTMLElement>(`[data-radiant-art="${enemyId}"]`)!;
      vi.spyOn(enemy, 'getBoundingClientRect').mockReturnValue(new DOMRect(100, 50, 0, 0));
      const ids = session.view().saved.run!.state.gauge.members.map(member => member.id);
      ids.forEach((id, index) => {
        const face = host.querySelector<HTMLElement>(`[data-radiant-unit="${id}"] .radiant-face`)!;
        vi.spyOn(face, 'getBoundingClientRect').mockReturnValue(new DOMRect(400 + index * 80, 500, 0, 0));
      });
      await view.act('normal');
      expect(orbs.length).toBeGreaterThanOrEqual(ids.length);
      expect(orbs.every(orb => orb.left === '100px' && orb.top === '50px')).toBe(true);
      for (let index = 0; index < ids.length; index++)
        expect(orbs.some(orb => orb.end === `translate(${300 + index * 80}px, 450px) scale(0.45)`)).toBe(true);
    } finally {
      if (original) Object.defineProperty(Element.prototype, 'animate', original);
      else Reflect.deleteProperty(Element.prototype, 'animate');
    }
  });
  it('surfaces a missing Gauge recipient without losing the saved action', async () => {
    const { view, session, host } = fixture(); await view.finishEntrance();
    host.querySelector('[data-radiant-unit="tide"] .radiant-face')!.remove();
    await expect(view.act('normal')).rejects.toThrow('Gauge-drop recipient is missing');
    expect(session.view().saved.revision).toBe(2);
    expect(session.view().saved.run!.state.gauge.members[1].charge).toBeGreaterThan(0);
    expect(host.querySelector('[data-radiant-error]')!.textContent).toContain('Gauge-drop recipient is missing');
  });
  it('updates the visible Guard row from each saved status impact, including round expiry', async () => {
    const { view, host } = fixture(2); applyMotion('reduced'); await view.finishEntrance();
    await view.act('defense');
    expect(host.querySelector('[data-radiant-health="ember"] [data-radiant-effect="guard"]')).not.toBeNull();
    await view.act('normal');
    expect(host.querySelector('[data-radiant-health="ember"] [data-radiant-effect="guard"]')).toBeNull();
  });
  it('a held upward portrait release sends one saved Flare and suppresses its compatibility click', async () => {
    const { view, session, host, transport } = fixture(6, 6, undefined, 25, undefined, undefined, true);
    applyMotion('reduced'); await view.finishEntrance();
    vi.useFakeTimers();
    const button = controls(host, '[data-radiant-actor="tide"]');
    const pointer = (type: string, y: number) => {
      const event = new Event(type, { bubbles: true, cancelable: true });
      Object.assign(event, { button: 0, isPrimary: true, pointerId: 1, clientX: 50, clientY: y });
      button.dispatchEvent(event);
    };
    pointer('pointerdown', 100); vi.advanceTimersByTime(350); pointer('pointerup', 50); button.click();
    vi.useRealTimers();
    await vi.waitFor(() => expect(session.view().presentation).toBeNull());
    expect(transport.execute).toHaveBeenCalledTimes(1);
    expect(transport.execute.mock.calls[0][0].operation).toEqual({ kind: 'action', action: { type: 'flare', bearerId: 'tide' } });
  });
  it('form1 has one layer, no shared meter, and released forms use reviewed face art', async () => {
    const { view, host } = fixture(6, 1); applyMotion('reduced'); await view.finishEntrance();
    expect(host.querySelectorAll('[data-radiant-charge]')).toHaveLength(6);
    expect(host.querySelector<HTMLElement>('.radiant-shared')!.hidden).toBe(true);
    expect(host.querySelector<HTMLImageElement>('[data-character="rosetta"] img')!.alt).not.toContain('pending');
    expect(host.querySelector<HTMLImageElement>('[data-character="ember"] img')!.alt).not.toContain('pending');
  });
  it('keeps old HP while save and windup are pending, then shows the saved impact before visuals finish', async () => {
    let windup!: () => void, impact!: () => void;
    const frames: RadiantImpactFrame[] = [];
    const effects = { windup: vi.fn(() => new Promise<void>(resolve => { windup = resolve; })),
      impact: vi.fn((frame: RadiantImpactFrame) => { frames.push(frame);
        return frames.length === 1 ? new Promise<void>(resolve => { impact = resolve; }) : Promise.resolve(); }),
      cancel: vi.fn() };
    const { view, host, session, transport } = fixture(6, 6, effects);
    await view.finishEntrance();
    const execute = transport.execute.getMockImplementation()!;
    let save!: () => void;
    transport.execute.mockImplementationOnce(async request => {
      await new Promise<void>(resolve => { save = resolve; }); return execute(request);
    });
    const enemyHP = host.querySelector('.radiant-enemy [data-hp]')!.textContent;
    const pending = view.act('normal');
    expect(host.querySelector('.radiant-enemy [data-hp]')!.textContent).toBe(enemyHP);
    expect(effects.windup).not.toHaveBeenCalled(); expect(host.getAttribute('aria-busy')).toBe('true');
    save(); await vi.waitFor(() => expect(effects.windup).toHaveBeenCalledTimes(1));
    expect(host.querySelector('.radiant-enemy [data-hp]')!.textContent).toBe(enemyHP);
    expect(session.view().saved.revision).toBe(2);
    windup(); await vi.waitFor(() => expect(effects.impact).toHaveBeenCalledTimes(1));
    expect(host.querySelector('.radiant-enemy [data-hp]')!.textContent).not.toBe(enemyHP);
    expect(controls(host, '[data-radiant-action="normal"]').disabled).toBe(false);
    impact(); await pending;
    expect(session.view().presentation).toBeNull(); expect(host.getAttribute('aria-busy')).toBe('false');
  });
  it('saves another member action while the previous member is still winding up', async () => {
    const windups: (() => void)[] = [];
    const effects = { windup: vi.fn(() => new Promise<void>(resolve => { windups.push(resolve); })),
      impact: vi.fn(async () => {}), cancel: vi.fn() };
    const { view, session, transport, host } = fixture(6, 6, effects);
    await view.finishEntrance();

    const first = view.act('normal');
    await vi.waitFor(() => expect(windups).toHaveLength(1));
    expect(session.view().saved.revision).toBe(2);
    expect(controls(host, '[data-radiant-action="normal"]').disabled).toBe(false);
    expect(host.querySelector('[data-radiant-status]')?.textContent).toContain('other members can act');

    const second = view.act('normal');
    await vi.waitFor(() => expect(session.view().saved.revision).toBe(3));
    expect(transport.execute).toHaveBeenCalledTimes(2);
    expect(session.view().saved.run!.state.acted).toEqual(['ember', 'tide']);
    expect(windups).toHaveLength(1);

    windups[0]();
    await vi.waitFor(() => expect(windups).toHaveLength(2));
    windups[1]();
    await Promise.all([first, second]);
    expect(session.view().presentation).toBeNull();
    expect(session.view().saved.revision).toBe(3);
  });
  it('allows a teammate to cast newly shared saved charge during the previous windup', async () => {
    const windups: (() => void)[] = [];
    const effects = { windup: vi.fn(() => new Promise<void>(resolve => { windups.push(resolve); })),
      impact: vi.fn(async () => {}), cancel: vi.fn() };
    const { view, session, host, transport } = fixture(6, 6, effects, 25, undefined, undefined, false, state => {
      const tide = state.gauge.members.find(member => member.id === 'tide')!;
      tide.charge = tide.baseCost - 2;
    });
    await view.finishEntrance();
    const tideBefore = session.view().saved.run!.state.gauge.members.find(member => member.id === 'tide')!;
    const first = view.act('normal');
    await vi.waitFor(() => expect(windups).toHaveLength(1));
    const savedTide = session.view().saved.run!.state.gauge.members.find(member => member.id === 'tide')!;
    expect(savedTide.charge).toBeGreaterThanOrEqual(savedTide.baseCost);
    expect(host.querySelector('[data-radiant-charge-text="tide"]')!.textContent)
      .toBe(`${tideBefore.charge} / ${tideBefore.baseCost * 2} charge`);
    expect(controls(host, '[data-radiant-action="flare"]').disabled).toBe(false);
    expect(controls(host, '[data-radiant-action="flare"]').textContent).toBe('Glowing Flare');
    const second = view.act('flare');
    await vi.waitFor(() => expect(session.view().saved.revision).toBe(3));
    expect(transport.execute.mock.calls[1][0].operation).toMatchObject({
      kind: 'action', action: { type: 'flare', bearerId: 'tide' },
    });
    windups[0]();
    await vi.waitFor(() => expect(windups).toHaveLength(2));
    windups[1]();
    await Promise.all([first, second]);
  });
  it('Skip settles queued actions to the latest saved state without replaying stale impacts', async () => {
    const windups: (() => void)[] = [];
    const effects = { windup: vi.fn(() => new Promise<void>(resolve => { windups.push(resolve); })),
      impact: vi.fn(async () => {}), cancel: vi.fn() };
    const { view, session, host } = fixture(6, 6, effects);
    await view.finishEntrance();

    const first = view.act('normal');
    await vi.waitFor(() => expect(windups).toHaveLength(1));
    const second = view.act('normal');
    await vi.waitFor(() => expect(session.view().saved.revision).toBe(3));
    const latest = session.view().saved.run!;
    const target = latest.state.enemies[0];
    const expected = radiantReadout(latest.state).units[target.id];
    view.skip();
    const hp = host.querySelector(`[data-radiant-health="${target.id}"] [data-hp]`)!;
    expect(hp.textContent).toBe(`HP ${expected.hp} / ${expected.maximum}`);
    expect(latest.state.acted).toEqual(['ember', 'tide']);

    await Promise.all([first, second]);
    windups[0]();
    await Promise.resolve();
    expect(hp.textContent).toBe(`HP ${expected.hp} / ${expected.maximum}`);
    expect(effects.windup).toHaveBeenCalledTimes(1);
  });
  it('reveals an offscreen battlefield for saved action effects and restores the portrait scroll position', async () => {
    const scroller = document.createElement('div');
    scroller.style.overflowY = 'auto';
    Object.defineProperties(scroller, { scrollHeight: { value: 1600 }, clientHeight: { value: 800 } });
    document.body.append(scroller);
    scroller.scrollTop = 760;
    let scrollDelivered = false;
    const onScroll = () => { scrollDelivered = true; };
    window.addEventListener('scroll', onScroll, { capture: true, once: true });
    let field!: HTMLElement;
    const effects = { windup: vi.fn(async () => {
      expect(field.getBoundingClientRect().top).toBe(100);
      expect(scrollDelivered).toBe(true);
    }), impact: vi.fn(async () => {}), cancel: vi.fn() };
    const { view, host } = fixture(6, 6, effects); await view.finishEntrance();
    scroller.append(host);
    field = host.querySelector<HTMLElement>('.radiant-field')!;
    let fieldTop = -160;
    vi.spyOn(field, 'getBoundingClientRect').mockImplementation(() => new DOMRect(0, fieldTop, 400, 400));
    const scrollIntoView = vi.fn(() => {
      fieldTop = 100; scroller.scrollTop = 420;
      window.requestAnimationFrame(() => window.dispatchEvent(new Event('scroll')));
    });
    Object.defineProperty(field, 'scrollIntoView', { configurable: true, value: scrollIntoView });

    await view.act('normal');

    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'center', inline: 'nearest', behavior: 'instant' });
    expect(effects.windup).toHaveBeenCalledTimes(1);
    expect(scroller.scrollTop).toBe(760);
    window.removeEventListener('scroll', onScroll, true);
  });
  it('keeps saved controls available and honors Skip while an automatic reveal waits for its scroll event', async () => {
    const callbacks: FrameRequestCallback[] = [];
    const effects = { windup: vi.fn(async () => {}), impact: vi.fn(async () => {}), cancel: vi.fn() };
    const { view, host, session, transport } = fixture(6, 6, effects); await view.finishEntrance();
    const scroller = document.createElement('div');
    scroller.style.overflowY = 'auto';
    Object.defineProperties(scroller, { scrollHeight: { value: 1600 }, clientHeight: { value: 800 } });
    document.body.append(scroller); scroller.append(host); scroller.scrollTop = 760;
    const field = host.querySelector<HTMLElement>('.radiant-field')!;
    let fieldTop = -160;
    vi.spyOn(field, 'getBoundingClientRect').mockImplementation(() => new DOMRect(0, fieldTop, 400, 400));
    Object.defineProperty(field, 'scrollIntoView', { configurable: true, value: () => { fieldTop = 100; scroller.scrollTop = 420; } });
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => { callbacks.push(callback); return callbacks.length; });
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    const first = view.act('normal');
    await vi.waitFor(() => expect(callbacks).toHaveLength(1));
    expect(session.view().saved.revision).toBe(2);
    expect(controls(host, '[data-radiant-action="normal"]').disabled).toBe(false);
    const second = view.act('normal');
    await vi.waitFor(() => expect(session.view().saved.revision).toBe(3));
    expect(transport.execute).toHaveBeenCalledTimes(2);
    view.skip();
    expect(cancelFrame).toHaveBeenCalledWith(1);
    await Promise.all([first, second]);
    expect(scroller.scrollTop).toBe(760);
    scroller.scrollTop = 520;
    callbacks[0](performance.now());
    await Promise.resolve();
    expect(scroller.scrollTop).toBe(520);
    expect(effects.windup).not.toHaveBeenCalled();
    expect(effects.impact).not.toHaveBeenCalled();
    expect(session.view().presentation).toBeNull();
    expect(session.view().saved.run!.state.acted).toEqual(['ember', 'tide']);
  });
  it('cancels a pending automatic reveal frame when the battle is disposed', async () => {
    const callbacks: FrameRequestCallback[] = [];
    const effects = { windup: vi.fn(async () => {}), impact: vi.fn(async () => {}), cancel: vi.fn() };
    const { view, host } = fixture(6, 6, effects); await view.finishEntrance();
    const scroller = document.createElement('div');
    scroller.style.overflowY = 'auto';
    Object.defineProperties(scroller, { scrollHeight: { value: 1600 }, clientHeight: { value: 800 } });
    document.body.append(scroller); scroller.append(host); scroller.scrollTop = 760;
    const field = host.querySelector<HTMLElement>('.radiant-field')!;
    vi.spyOn(field, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, -160, 400, 400));
    Object.defineProperty(field, 'scrollIntoView', { configurable: true, value: () => { scroller.scrollTop = 420; } });
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => { callbacks.push(callback); return callbacks.length; });
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    const pending = view.act('normal');
    await vi.waitFor(() => expect(callbacks).toHaveLength(1));
    view.dispose();
    expect(cancelFrame).toHaveBeenCalledWith(1);
    await pending;
    scroller.scrollTop = 520;
    callbacks[0](performance.now());
    await Promise.resolve();
    expect(scroller.scrollTop).toBe(520);
    expect(effects.windup).not.toHaveBeenCalled();
    expect(effects.impact).not.toHaveBeenCalled();
  });
  it('keeps the original viewport under Reduce motion when the battlefield is offscreen', async () => {
    const effects = { windup: vi.fn(async () => {}), impact: vi.fn(async () => {}), cancel: vi.fn() };
    const { view, host } = fixture(6, 6, effects); await view.finishEntrance();
    const field = host.querySelector<HTMLElement>('.radiant-field')!;
    vi.spyOn(field, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, -160, 400, 400));
    const scrollIntoView = vi.fn();
    Object.defineProperty(field, 'scrollIntoView', { configurable: true, value: scrollIntoView });
    applyMotion('reduced');

    await view.act('normal');

    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(effects.windup).not.toHaveBeenCalled();
  });
  it('Skip settles exactly once and late old visuals cannot overwrite a newer action', async () => {
    const releases: (() => void)[] = [];
    const effects = { windup: vi.fn(() => {
      const cancelled = releases.length === 0;
      return new Promise<void>(resolve => { releases.push(resolve); }).then(() => {
        if (cancelled) throw new DOMException('Old windup cancelled.', 'AbortError');
      });
    }),
      impact: vi.fn(async () => {}), cancel: vi.fn() };
    const { view, session, host } = fixture(6, 6, effects); await view.finishEntrance();
    const old = view.act('normal'); await vi.waitFor(() => expect(releases).toHaveLength(1));
    view.skip(); expect(session.view().presentation).toBeNull();
    const next = view.act('normal'); await vi.waitFor(() => expect(releases).toHaveLength(2));
    releases[0](); await old;
    expect(session.view().saved.revision).toBe(3);
    expect(session.view().presentation).toBeNull();
    expect(host.querySelector('[data-radiant-error]')!.textContent).toBe('');
    releases[1](); await next; expect(session.view().presentation).toBeNull();
  });
  it('Settings locks controls without a new request and Reduce motion settles saved effects immediately', async () => {
    let release!: () => void;
    const effects = { windup: vi.fn(() => new Promise<void>(resolve => { release = resolve; })),
      impact: vi.fn(async () => {}), cancel: vi.fn(), pause: vi.fn() };
    const { view, session, host, transport, settings } = fixture(6, 6, effects); await view.finishEntrance();
    controls(host, '[data-radiant-settings]').click();
    expect(settings).toHaveBeenCalledTimes(1); expect(session.view().settingsOpen).toBe(true);
    expect(controls(host, '[data-radiant-action="normal"]').disabled).toBe(true);
    expect(transport.execute).not.toHaveBeenCalled();
    session.setSettings(false); view.render();
    const pending = view.act('normal'); await vi.waitFor(() => expect(effects.windup).toHaveBeenCalled());
    applyMotion('reduced');
    expect(effects.cancel).toHaveBeenCalled(); expect(session.view().presentation).toBeNull();
    release(); await pending; expect(effects.impact).not.toHaveBeenCalled();
  });
  it('lost acknowledgements expose an exact action retry and never celebrate a failure', async () => {
    const effects = { windup: vi.fn(async () => {}), impact: vi.fn(async () => {}), cancel: vi.fn() };
    const { view, host, session, transport } = fixture(6, 6, effects); await view.finishEntrance();
    const execute = transport.execute.getMockImplementation()!;
    transport.execute.mockImplementationOnce(async request => { await execute(request); throw new Error('Lost reply'); });
    await expect(view.act('normal')).rejects.toThrow('Lost reply');
    expect(effects.windup).not.toHaveBeenCalled(); expect(session.view().presentation).toBeNull();
    expect(controls(host, '[data-radiant-retry]').hidden).toBe(false);
    const request = session.view().pending!;
    await view.retry(); expect(transport.execute.mock.calls.at(-1)![0]).toEqual(request);
    expect(session.view().saved.revision).toBe(2); expect(effects.windup).toHaveBeenCalledTimes(1);
  });
  it('disposing during saved presentation cancels effects and prevents late DOM updates', async () => {
    let release!: () => void;
    const effects = { windup: vi.fn(() => new Promise<void>(resolve => { release = resolve; })),
      impact: vi.fn(async () => {}), cancel: vi.fn() };
    const { view, host, session } = fixture(6, 6, effects); await view.finishEntrance();
    const pending = view.act('normal'); await vi.waitFor(() => expect(effects.windup).toHaveBeenCalled());
    view.dispose(); release(); await pending;
    expect(host.children).toHaveLength(0); expect(effects.impact).not.toHaveBeenCalled();
    expect(session.view().saved.revision).toBe(2);
  });
  it('saved results dismiss/reopen and Settings preserve the same receipt and sheet without new requests', async () => {
    const { view, session, host, transport } = fixture(); applyMotion('reduced'); await view.finishEntrance();
    await clear(view, session);
    const results = host.querySelector<HTMLElement>('[data-radiant-results]')!;
    const sheet = results.firstElementChild, before = session.view().saved;
    expect(results.hidden).toBe(false); expect(document.activeElement).toBe(host.querySelector('[data-radiant-result-heading]'));
    const requests = transport.execute.mock.calls.length;
    controls(host, '[data-radiant-result-dismiss]').click();
    expect(results.hidden).toBe(true); expect(document.activeElement).toBe(controls(host, '[data-radiant-results-show]'));
    controls(host, '[data-radiant-results-show]').click(); expect(results.hidden).toBe(false);
    controls(host, '[data-radiant-settings]').click(); expect(results.hidden).toBe(true);
    session.setSettings(false); view.render();
    expect(results.firstElementChild).toBe(sheet); expect(results.hidden).toBe(false);
    expect(transport.execute).toHaveBeenCalledTimes(requests); expect(session.view().saved).toEqual(before);
  });
  it('Continue rebuilds only after save, freezes loadouts, resets encounter totals and keeps final stages terminal', async () => {
    const { view, session, host, transport } = fixture(); applyMotion('reduced'); await view.finishEntrance();
    await clear(view, session);
    const before = session.view().saved.run!, oldImage = host.querySelector('.radiant-enemy-art');
    const execute = transport.execute.getMockImplementation()!;
    let save!: () => void;
    transport.execute.mockImplementationOnce(async request => { await new Promise<void>(resolve => { save = resolve; }); return execute(request); });
    const pending = view.transition('continue');
    expect(host.querySelector('.radiant-enemy-art')).toBe(oldImage);
    expect(session.view().saved.run!.encounter).toBe(before.encounter);
    expect(controls(host, '[data-radiant-transition="retry"]').disabled).toBe(true);
    save(); await pending;
    const next = session.view();
    expect(next.saved.run!.encounter).toBe(before.encounter + 1);
    expect(next.saved.run!.state.bearers.map(unit => unit.loadout)).toEqual(before.initial.bearers.map(unit => unit.loadout));
    expect(next.saved.run!.journal.events).toEqual([]); expect(next.entrancePending).toBe(false);
    expect(next.presentation).toBeNull(); expect(host.querySelector('.radiant-enemy-art')).not.toBe(oldImage);
    expect(host.querySelector<HTMLElement>('[data-radiant-results]')!.hidden).toBe(true);
    const final = fixture(6, 6, undefined, 120); await final.view.finishEntrance(); await clear(final.view, final.session);
    expect(final.host.querySelector('[data-radiant-transition="continue"]')).toBeNull();
    expect(final.host.textContent).toContain('Activity complete');
  });
  it('Replay and lost exit acknowledgements retain earned rewards and retry the exact saved request once', async () => {
    const exited = vi.fn(), { view, session, host, transport } = fixture(6, 6, undefined, 25, exited);
    applyMotion('reduced'); await view.finishEntrance(); await clear(view, session);
    const banked = session.view().saved.account.fractalis, journal = session.view().saved.run!.journal;
    await view.transition('retry');
    expect(session.view().saved.account.fractalis).toBe(banked);
    expect(session.view().saved.run!.journal).toEqual(journal);
    await clear(view, session);
    expect(session.view().saved.account.fractalis).toBe(banked);
    const execute = transport.execute.getMockImplementation()!;
    transport.execute.mockImplementationOnce(async request => { await execute(request); throw new Error('Exit reply lost'); });
    await expect(view.transition('exit')).rejects.toThrow('Exit reply lost');
    expect(exited).not.toHaveBeenCalled(); expect(host.children.length).toBeGreaterThan(0);
    const pending = session.view().pending!;
    await view.retry();
    expect(transport.execute.mock.calls.at(-1)![0]).toEqual(pending);
    expect(exited).toHaveBeenCalledTimes(1); expect(session.view().saved.run).toBeNull();
    expect(session.view().saved.account.fractalis).toBe(banked); expect(host.children).toHaveLength(0);
  });
  it('victory sheet waits for saved impact completion and Skip prevents late duplicate results', async () => {
    let release!: () => void;
    const effects = { windup: vi.fn(async () => {}), impact: vi.fn(async () => {}), cancel: vi.fn() };
    const { view, session, host } = fixture(6, 6, effects); await view.finishEntrance();
    // This authored fixture has two targets; the first Normal defeats one.
    await view.act('normal');
    effects.windup.mockImplementationOnce(() => new Promise<void>(resolve => { release = resolve; }));
    const pending = view.act('normal');
    await vi.waitFor(() => expect(session.view().saved.run!.state.phase).toBe('victory'));
    expect(host.querySelector<HTMLElement>('[data-radiant-results]')!.hidden).toBe(true);
    expect(host.querySelector('[data-radiant-result-heading]')).toBeNull();
    view.skip();
    expect(host.querySelector<HTMLElement>('[data-radiant-results]')!.hidden).toBe(false);
    const heading = host.querySelector('[data-radiant-result-heading]');
    release(); await pending;
    expect(host.querySelector('[data-radiant-result-heading]')).toBe(heading);
    expect(host.querySelectorAll('[data-radiant-result-heading]')).toHaveLength(1);
    expect(session.view().presentation).toBeNull();
  });
  it('restored terminal checkpoint shows durable totals without replaying any combat visuals', async () => {
    const original = fixture(); applyMotion('reduced'); await original.view.finishEntrance(); await clear(original.view, original.session);
    const checkpoint = original.session.view().saved;
    original.view.dispose();
    const session = new RadiantSession(checkpoint, original.transport, uuid);
    const effects = { windup: vi.fn(async () => {}), impact: vi.fn(async () => {}), cancel: vi.fn() };
    const view = new RadiantBattleView(original.host, session, vi.fn(), effects); disposed.push(view);
    await view.finishEntrance();
    expect(original.host.querySelector<HTMLElement>('[data-radiant-results]')!.hidden).toBe(false);
    expect(original.host.textContent).toContain('Saved encounter rewards');
    expect(effects.windup).not.toHaveBeenCalled(); expect(effects.impact).not.toHaveBeenCalled();
    expect(session.view().saved).toEqual(checkpoint);
  });
  it('mid-battle exit confirmation locks actions, cancellation saves nothing, acceptance exits once', async () => {
    const exited = vi.fn(), { view, session, host, transport } = fixture(6, 6, undefined, 25, exited);
    applyMotion('reduced'); await view.finishEntrance();
    let choose!: (value: boolean) => void;
    const confirm = vi.spyOn(dialogs, 'gameConfirm').mockImplementation(() => new Promise(resolve => { choose = resolve; }));
    const saved = session.view().saved;
    controls(host, '[data-radiant-leave]').click();
    expect(session.view().settingsOpen).toBe(true);
    expect(controls(host, '[data-radiant-action="normal"]').disabled).toBe(true);
    expect(transport.execute).not.toHaveBeenCalled();
    choose(false); await vi.waitFor(() => expect(session.view().settingsOpen).toBe(false));
    expect(session.view().saved).toEqual(saved); expect(exited).not.toHaveBeenCalled();
    confirm.mockResolvedValueOnce(true);
    controls(host, '[data-radiant-leave]').click();
    await vi.waitFor(() => expect(exited).toHaveBeenCalledTimes(1));
    expect(transport.execute).toHaveBeenCalledTimes(1);
    expect(transport.execute.mock.calls[0][0].operation.kind).toBe('exit');
    expect(session.view().saved.run).toBeNull();
  });
  it('opens exact frozen mechanics in a contained reference dialog, preserving focus and input locks', async () => {
    const { view, session, host, transport } = fixture(); applyMotion('reduced'); await view.finishEntrance();
    const create = dialogs.createGameDialog;
    vi.spyOn(dialogs, 'createGameDialog').mockImplementation(title => {
      const result = create(title);
      result.dialog.showModal = () => result.dialog.setAttribute('open', '');
      result.dialog.close = () => { result.dialog.removeAttribute('open'); result.dialog.dispatchEvent(new Event('close')); };
      return result;
    });
    const button = controls(host, '[data-radiant-reference="ember"]'); button.focus(); button.click();
    const dialog = document.querySelector<HTMLDialogElement>('.radiant-reference-dialog')!;
    expect(dialog.open).toBe(true); expect(dialog.querySelectorAll('dl dt')).toHaveLength(4);
    expect(dialog.querySelectorAll('[data-radiant-reference-tier]')).toHaveLength(3);
    expect(dialog.textContent).toContain('140% caster Attack');
    expect(dialog.textContent).toContain('First consumes all Infernis-owned Burns');
    expect(dialog.textContent).toContain('No Master equipped');
    expect(session.view().settingsOpen).toBe(true); expect(transport.execute).not.toHaveBeenCalled();
    expect(controls(host, '[data-radiant-action="normal"]').disabled).toBe(true);
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(document.querySelector('dialog')).toBeNull(); expect(session.view().settingsOpen).toBe(false);
    expect(document.activeElement).toBe(button); expect(controls(host, '[data-radiant-action="normal"]').disabled).toBe(false);
  });
  it.each(['master-tide-3', 'master-sprout-2'] as const)('sends selected-enemy Flare target required by %s, preserving authored healing/shield targets', async masterId => {
    const { view, host, transport } = fixture(3, 6, undefined, 25, undefined, masterId, true);
    applyMotion('reduced'); await view.finishEntrance();
    const bearer = masterId.includes('tide') ? 'tide' : 'sprout';
    controls(host, `[data-radiant-select="${bearer}"]`).click();
    await view.act('flare');
    const action = transport.execute.mock.calls.at(-1)![0].operation;
    expect(action.kind).toBe('action');
    if (action.kind !== 'action') throw new Error('Expected Flare action.');
    expect(action.action).toMatchObject({ type: 'flare', bearerId: bearer, targetId: expect.any(String) });
    expect(host.querySelector('[data-radiant-error]')!.textContent).toBe('');
  });
});
