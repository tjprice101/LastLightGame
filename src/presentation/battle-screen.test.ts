// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { freshGame } from '../../supabase/functions/game-operation/engine';
import { resolveRadiantRun, type FrozenRadiantRun, type RadiantRunRequest, type RadiantRunResponse, type RadiantRunSnapshot } from '../online/battle-run';
import type { EnemyActionCue } from '../vfx/enemy-cues';
import { RadiantSession } from '../online/battle-session';
import type { RadiantPlayerAction } from '../online/battle-run';
import { releasedRadiantIds, type RadiantBearerId } from '../content/combat-kits';
import { characterArt } from '../content/character-art';
import { compactPortraitRevisions } from '../content/compact-portrait-revisions';
import { RadiantBattleView, type RadiantBattleEffects } from './battle-screen';
import { applyMotion } from './settings';
import { radiantReadout, type RadiantImpactFrame } from './battle-impact-frames';
import * as dialogs from './game-dialog';
import type { RadiantMasterId } from '../content/combat-kits';
import type { RadiantCombatState } from '../game/combat-engine';
import type { Activity } from '../online/server-game';

let serial = 0;
const uuid = () => `00000000-0000-4000-8000-${(++serial).toString(16).padStart(12, '0')}`;
const disposed: RadiantBattleView[] = [];
function fixture(count: number | RadiantBearerId[] = 3, form = 6, effects?: RadiantBattleEffects, stage = 25, onExit?: () => void,
  masterId?: RadiantMasterId, charged = false, setup?: (state: RadiantCombatState, run: FrozenRadiantRun) => void, activity?: Activity) {
  const state = freshGame('battle-surface'); state.starterId = 'ember';
  state.account.storyCompleted = stage - 1;
  if (activity?.kind === 'dungeon') state.account.dungeonStages[activity.element] = activity.stage;
  state.account.squad = Array.isArray(count) ? count : releasedRadiantIds.slice(0, count);
  for (const id of state.account.squad) state.account.characters[id as keyof typeof state.account.characters] =
    { level: form === 1 ? 30 : 105, evolution: form, weaponRank: 0 };
  if (masterId) {
    state.account.masterConduits = { [masterId]: 1 };
    state.account.masterEquipment = { [masterId.split('-')[1]]: masterId };
  }
  const authority = { capability: 'isolated-radiant-study' as const, now: Date.UTC(2026, 10, 8),
    entry: () => ({ runId: uuid(), encounterSeed: 1729, chargeSeed: 7, targetSeed: 104729 }) };
  const entered = resolveRadiantRun({ revision: 0, state }, { requestId: uuid(), expectedRevision: 0,
    runId: null, encounter: null, operation: { kind: 'start', activity: activity ?? { kind: 'story', stage },
      calibration: 'authored-control' } }, authority);
  if (charged) for (const member of entered.state.radiantStudy!.state.gauge.members) member.charge = member.baseCost;
  setup?.(entered.state.radiantStudy!.state, entered.state.radiantStudy!);
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
  const acts = vi.spyOn(session, 'act');
  return { view, session, host, transport, settings, acts };
}
function controls(host: HTMLElement, selector: string) { return host.querySelector<HTMLButtonElement>(selector)!; }
function action(host: HTMLElement, bearerId: string) {
  return controls(host, `[data-radiant-actor="${bearerId}"]`);
}
/** Plays the encounter on the device, then waits for its one authority settle. */
async function clear(view: RadiantBattleView, session: RadiantSession) {
  for (let turn = 0; turn < 40 && session.view().run!.state.phase === 'player'; turn++) await view.act('normal');
  expect(session.view().run!.state.phase).toBe('victory');
  await vi.waitFor(() => expect(session.view().saved.run!.state.phase).toBe('victory'));
  await vi.waitFor(() => expect(session.view().busy).toBe(false));
}
afterEach(() => {
  for (const view of disposed.splice(0)) view.dispose();
  document.body.replaceChildren(); document.documentElement.dataset.motion = 'system';
  document.documentElement.dataset.battleSpeed = '1';
  vi.restoreAllMocks();
});
describe('device-run three-member Radiant battle surface', () => {
  it('keeps the arena and complete squad in one viewport layout, with results outside its sizing', () => {
    const { host } = fixture();
    const layout = host.querySelector('.radiant-battle-layout')!;
    expect(Array.from(layout.children).map(child => child.className)).toEqual([
      'radiant-field', 'radiant-enemy-banner', 'radiant-squad', 'radiant-battle-footer',
    ]);
    expect(host.querySelector('.radiant-battle-heading')).toBeNull();
    expect(host.querySelector('.radiant-field .radiant-hud [data-radiant-settings]')!.getAttribute('aria-label')).toBe('Settings');
    expect(layout.querySelectorAll('.radiant-member')).toHaveLength(3);
    expect(layout.querySelectorAll('.radiant-frozen-stats dd')).toHaveLength(9);
    const endTurn = controls(host, '[data-radiant-end-turn]');
    expect(endTurn.textContent).toBe('End Turn'); expect(endTurn.getAttribute('aria-keyshortcuts')).toBe('E');
    expect(host.querySelector('.radiant-hud [data-radiant-haul-amount]')!.textContent).toBe('0');
    expect(host.querySelector('[data-radiant-results]')!.parentElement).toBe(layout.parentElement);
    expect(layout.querySelector('[data-radiant-results]')).toBeNull();
    const skip = controls(host, '[data-radiant-skip]');
    expect(skip.closest('.radiant-hud-tools')).not.toBeNull();
    expect(skip.disabled).toBe(true);
    expect(skip.hidden).toBe(false);
    expect(skip.textContent).toBe('');
    expect(host.querySelector('[data-radiant-gesture-status]')!.classList.contains('radiant-visually-hidden')).toBe(true);
    expect(host.querySelector('[data-radiant-status-timing]')).toBeNull();
  });
  it('grounds six actual enemies and three allies while keeping one selected enemy readout', async () => {
    const { view, host, session, transport, acts } = fixture(3, 6, undefined, 34, undefined, undefined, false,
      undefined, { kind: 'dungeon', element: 'infernic', stage: 34 });
    applyMotion('reduced'); await view.finishEntrance();
    const enemies = Array.from(host.querySelectorAll<HTMLButtonElement>('[data-radiant-target]'));
    const allies = Array.from(host.querySelectorAll<HTMLElement>('.radiant-allies [data-radiant-field-unit]'));
    expect(enemies).toHaveLength(6);
    expect(allies).toHaveLength(3);
    expect(enemies.every(enemy => enemy.style.getPropertyValue('--formation-x'))).toBe(true);
    expect(new Set(enemies.map(enemy => enemy.style.getPropertyValue('--formation-y'))).size).toBeGreaterThan(1);
    expect(host.querySelectorAll('.radiant-enemy .radiant-health')).toHaveLength(0);
    expect(host.querySelector('.radiant-enemy-banner .radiant-target-strip')).not.toBeNull();
    expect(host.querySelector('.radiant-field .radiant-target-strip')).toBeNull();
    expect(host.querySelectorAll('[data-radiant-target-detail]')).toHaveLength(6);
    expect(Array.from(host.querySelectorAll<HTMLElement>('[data-radiant-target-detail]')).every(detail => detail.tabIndex === 0)).toBe(true);
    expect(host.querySelectorAll('[data-radiant-target-detail]:not([hidden])')).toHaveLength(1);
    const target = session.view().run!.state.enemies[2].id;
    enemies[2].click();
    expect(enemies[2].getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelector<HTMLElement>(`[data-radiant-target-detail="${target}"]`)!.hidden).toBe(false);
    const positions = enemies.map(enemy => enemy.getAttribute('style'));
    await view.act('normal', 'ember');
    expect(acts.mock.calls.at(-1)?.[0]).toEqual({ type: 'normal', bearerId: 'ember', targetId: target });
    expect(transport.execute).not.toHaveBeenCalled();
    expect(enemies.map(enemy => enemy.getAttribute('style'))).toEqual(positions);
  });

  it('switches the focused target when the selected enemy is defeated without moving the others', async () => {
    const { view, host, session } = fixture(2, 6, undefined, 1);
    applyMotion('reduced'); await view.finishEntrance();
    const enemies = Array.from(host.querySelectorAll<HTMLButtonElement>('[data-radiant-target]'));
    const positions = enemies.map(enemy => enemy.getAttribute('style'));
    await view.act('normal', 'ember');
    expect(session.view().run!.state.enemies[0].hp).toBe(0);
    expect(enemies[0].disabled).toBe(true);
    expect(enemies[1].getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelectorAll('[data-radiant-target-detail]:not([hidden])')).toHaveLength(1);
    expect(enemies.map(enemy => enemy.getAttribute('style'))).toEqual(positions);
  });

  it('does not show an enemy impact for a support-only Convergent Light after changing targets', async () => {
    let releaseWindup!: () => void;
    const effects = {
      windup: vi.fn(() => new Promise<void>(resolve => { releaseWindup = resolve; })),
      impact: vi.fn(() => Promise.resolve()),
      cancel: vi.fn(),
    };
    const { view, host, session } = fixture(2, 6, effects, 1, undefined, undefined, true);
    await view.finishEntrance();
    const [oldTarget, nextTarget] = session.view().run!.state.enemies.map(enemy => enemy.id);
    const oldDetail = host.querySelector<HTMLElement>(`[data-radiant-target-detail="${oldTarget}"]`)!;
    const nextDetail = host.querySelector<HTMLElement>(`[data-radiant-target-detail="${nextTarget}"]`)!;
    const flare = view.act('flare', 'tide');
    await vi.waitFor(() => expect(effects.windup).toHaveBeenCalledTimes(1));
    controls(host, `[data-radiant-target="${nextTarget}"]`).click();
    expect(oldDetail.hidden).toBe(true);
    expect(nextDetail.hidden).toBe(false);
    expect(nextDetail.textContent).not.toContain('Resolving impact');
    releaseWindup();
    await flare;
  });

  it('keeps a defeated target visible through its saved impact while another member may target the survivor', async () => {
    let windup!: () => void, impact!: () => void, target = '', blockedImpact = false;
    const effects = {
      windup: vi.fn(() => new Promise<void>(resolve => { windup = resolve; })),
      impact: vi.fn((frame: RadiantImpactFrame) => {
        if (frame.readout.units[target].hp !== 0 || blockedImpact) return Promise.resolve();
        blockedImpact = true;
        return new Promise<void>(resolve => { impact = resolve; });
      }),
      cancel: vi.fn(),
    };
    const { view, host, session } = fixture(2, 6, effects, 1);
    await view.finishEntrance();
    target = session.view().run!.state.enemies[0].id;
    const survivor = session.view().run!.state.enemies[1].id;
    const oldDetail = host.querySelector<HTMLElement>(`[data-radiant-target-detail="${target}"]`)!;
    const newDetail = host.querySelector<HTMLElement>(`[data-radiant-target-detail="${survivor}"]`)!;
    const oldHP = oldDetail.querySelector('[data-hp]')!.textContent;
    const pending = view.act('normal', 'ember');
    await vi.waitFor(() => expect(effects.windup).toHaveBeenCalledTimes(1));
    expect(session.view().run!.state.enemies[0].hp).toBe(0);
    expect(oldDetail.hidden).toBe(false);
    expect(oldDetail.querySelector('[data-hp]')!.textContent).toBe(oldHP);
    expect(oldDetail.textContent).not.toContain('Resolving impact');
    expect(newDetail.hidden).toBe(true);
    expect(host.querySelectorAll('[data-radiant-target-detail]:not([hidden])')).toHaveLength(1);
    expect(controls(host, '[data-radiant-skip]').disabled).toBe(false);
    expect(action(host, 'ember').closest('.radiant-member')!.classList.contains('has-acted')).toBe(true);
    expect(action(host, 'tide').disabled).toBe(false);
    windup();
    await vi.waitFor(() => expect(impact).toBeTypeOf('function'));
    expect(oldDetail.hidden).toBe(false);
    expect(oldDetail.querySelector('[data-hp]')!.textContent).toContain('HP 0 /');
    impact();
    await pending;
    expect(oldDetail.hidden).toBe(true);
    expect(newDetail.hidden).toBe(false);
    expect(controls(host, '[data-radiant-skip]').disabled).toBe(true);
  });

  it('marks only used portraits as acted and restores them on the next round', async () => {
    const { view, host } = fixture(2, 6, undefined, 25);
    applyMotion('reduced'); await view.finishEntrance();
    const ember = action(host, 'ember').closest('.radiant-member')!;
    const tide = action(host, 'tide').closest('.radiant-member')!;
    await view.act('normal', 'ember');
    expect(ember.classList.contains('has-acted')).toBe(true);
    expect(tide.classList.contains('has-acted')).toBe(false);
    expect(action(host, 'ember').disabled).toBe(true);
    expect(action(host, 'tide').disabled).toBe(false);
    controls(host, '[data-radiant-end-turn]').click();
    await vi.waitFor(() => expect(host.querySelector('[data-radiant-round]')!.textContent).toBe('Round 2'));
    expect(ember.classList.contains('has-acted')).toBe(false);
    expect(tide.classList.contains('has-acted')).toBe(false);
    expect(action(host, 'ember').disabled).toBe(false);
    expect(action(host, 'tide').disabled).toBe(false);
  });
  it('resolves rapid portrait taps instantly on the device, in tap order, with no network request', async () => {
    const ids = releasedRadiantIds.slice(0, 3);
    let releaseWindup!: () => void;
    const effects = {
      windup: vi.fn(() => new Promise<void>(resolve => { releaseWindup = resolve; })),
      impact: vi.fn(async () => {}),
      cancel: vi.fn(),
    };
    const { view, host, session, transport, acts } = fixture(ids, 6, effects, 120);
    applyMotion('reduced'); await view.finishEntrance(); applyMotion('system');
    for (const id of ids) action(host, id).click();
    await vi.waitFor(() => expect(effects.windup).toHaveBeenCalledOnce());
    await vi.waitFor(() => expect(acts).toHaveBeenCalledTimes(ids.length));
    expect(acts.mock.calls.map(([turn]) => 'bearerId' in turn ? turn.bearerId : 'end-turn')).toEqual(ids);
    expect(transport.execute).not.toHaveBeenCalled();
    expect(session.view().saved.revision).toBe(1);
    expect(session.view().run?.state.gauge.members.every(member => member.charge > 0)).toBe(true);
    releaseWindup();
  });

  it.each([
    [0, '0%', '0%', false],
    [50, '50%', '0%', false],
    [100, '100%', '0%', false],
    [100.1, '100%', '.1%', true],
    [150, '100%', '50%', true],
    [200, '100%', '100%', true],
  ] as const)('layers %s personal charge over one continuous energy track', async (charge, first, second, secondLayer) => {
    const { view, host } = fixture(1, 6, undefined, 25, undefined, undefined, false,
      state => { state.gauge.members[0].charge = charge; });
    applyMotion('reduced'); await view.finishEntrance();
    const energy = host.querySelector<HTMLElement>('[data-radiant-energy="ember"]')!;
    expect(energy.querySelectorAll('.radiant-energy-track')).toHaveLength(1);
    expect(energy.querySelector('[data-energy-layer="1"]')!.getAttribute('style')).toContain(`width: ${first}`);
    const overlay = energy.querySelector<HTMLElement>('[data-energy-layer="2"]')!;
    if (charge === 100.1) expect(parseFloat(overlay.style.width)).toBeCloseTo(.1);
    else expect(overlay.style.width).toBe(second);
    expect(energy.classList.contains('has-second-layer')).toBe(secondLayer);
    expect(energy.classList.contains('is-flowing')).toBe(charge > 0);
    expect(energy.querySelectorAll('meter.radiant-visually-hidden')).toHaveLength(2);
    expect(energy.querySelector<HTMLMeterElement>('[data-layer="2"]')!.value).toBeCloseTo(Math.max(0, charge - 100));
  });
  it('renders three stable per-form face controls, four stats, personal layers and exact Luminosity', async () => {
    const { view, host, session } = fixture(); applyMotion('reduced'); await view.finishEntrance();
    expect(host.querySelectorAll('[data-radiant-actor]')).toHaveLength(3);
    expect(host.querySelectorAll('.compact-portrait img')).toHaveLength(3);
    for (const id of releasedRadiantIds.slice(0, 3)) {
      const art = characterArt(id, 6).art;
      const image = host.querySelector<HTMLImageElement>(`.compact-portrait[data-character="${id}"] img`)!;
      expect(image.getAttribute('src')).toContain(`character-faces/${art}.png?v=${compactPortraitRevisions[art]}`);
      expect(image.alt).not.toContain('pending');
    }
    expect(host.querySelectorAll('[data-radiant-charge]')).toHaveLength(6);
    expect(host.querySelectorAll('[data-radiant-reference]')).toHaveLength(0);
    expect(host.querySelectorAll('[data-radiant-menu], [data-radiant-action], [data-radiant-member-actions]')).toHaveLength(0);
    expect(host.textContent).not.toContain('Kit');
    expect(host.querySelectorAll('.radiant-allies .radiant-ally-art')).toHaveLength(3);
    expect(host.querySelectorAll('.radiant-field [data-radiant-art]')).toHaveLength(5);
    expect(host.querySelectorAll('.radiant-allies .compact-portrait')).toHaveLength(0);
    expect(host.querySelector('.radiant-squad .radiant-ally-art')).toBeNull();
    expect(host.textContent).not.toMatch(/Critical|Shatter Damage|Elemental Damage/);
    expect(host.querySelector('[data-radiant-shared]')).toBeNull();
    expect(host.querySelectorAll('.radiant-member-head.radiant-visually-hidden, .radiant-member-foot.radiant-visually-hidden')).toHaveLength(6);
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
    const savedCharge = session.view().run!.state.gauge.members[0].charge;
    expect(host.querySelector('[data-radiant-charge-text="ember"]')!.textContent).toBe(`${savedCharge} / 200 Luminosity`);
    expect(parseFloat(host.querySelector<HTMLElement>('[data-radiant-energy="ember"] [data-energy-layer="1"]')!.style.width))
      .toBeCloseTo(Math.min(savedCharge, 100));
  });
  it('renders no shared meter and exposes the full personal Luminosity capacity accessibly', async () => {
    const { view, host } = fixture(1, 6, undefined, 25, undefined, undefined, false,
      state => { state.gauge.members[0].charge = 150; });
    applyMotion('reduced'); await view.finishEntrance();
    expect(host.querySelector('[data-radiant-shared-energy]')).toBeNull();
    expect(host.querySelector('[data-radiant-shared]')).toBeNull();
    expect(host.querySelector('[data-radiant-charge-text="ember"]')!.textContent).toBe('150 / 200 Luminosity');
  });
  it('retains a defeated member’s stored charge without animating it', async () => {
    const { view, host } = fixture(2, 6, undefined, 25, undefined, undefined, false, state => {
      state.bearers[0].hp = 0; state.gauge.members[0].living = false; state.gauge.members[0].charge = 150;
    });
    applyMotion('reduced'); await view.finishEntrance();
    const energy = host.querySelector<HTMLElement>('[data-radiant-energy="ember"]')!;
    expect(energy.classList.contains('is-flowing')).toBe(false);
    expect(energy.querySelector<HTMLElement>('[data-energy-layer="2"]')!.style.width).toBe('50%');
  });
  it('portrait tap resolves exactly one Normal Attack for that member with no selection step', async () => {
    const { view, session, host, transport, acts } = fixture(); applyMotion('reduced'); await view.finishEntrance();
    controls(host, '[data-radiant-actor="tide"]').click();
    await vi.waitFor(() => expect(session.view().run!.state.acted).toContain('tide'));
    expect(acts).toHaveBeenCalledTimes(1);
    expect(acts.mock.calls[0][0]).toEqual({ type: 'normal', bearerId: 'tide', targetId: 'story-25-0' });
    expect(transport.execute).not.toHaveBeenCalled();
    expect(host.querySelector('[data-radiant-field-unit="tide"]')).not.toBeNull();
    expect(host.querySelector('[data-radiant-card].is-selected, [data-radiant-actor][aria-pressed]')).toBeNull();
  });
  it('shows every saved teammate share and preserves static feedback under Reduce motion', async () => {
    const { view, session, host } = fixture(['ember', 'caldrex', 'tide']); applyMotion('reduced'); await view.finishEntrance();
    await view.act('normal');
    const run = session.view().run!;
    const drops = run.journal.events.filter(event => event.type === 'gauge-drop' && event.bearerId === 'ember');
    const total = drops.reduce((sum, event) => sum + (event.type === 'gauge-drop' ? event.amount : 0), 0);
    expect(total).toBeGreaterThan(0);
    for (const member of run.state.gauge.members.slice(1)) {
      expect(member.charge).toBe(member.elementId === run.state.gauge.members[0].elementId ? total / 10 : 0);
      expect(host.querySelector(`[data-radiant-charge-text="${member.id}"]`)!.textContent)
        .toBe(`${member.charge} / ${member.baseCost * 2} Luminosity`);
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
      const { view, session, host } = fixture(['ember', 'caldrex']); await view.finishEntrance();
      const enemyId = session.view().run!.state.enemies[0].id;
      const enemy = host.querySelector<HTMLElement>(`[data-radiant-art="${enemyId}"]`)!;
      vi.spyOn(enemy, 'getBoundingClientRect').mockReturnValue(new DOMRect(100, 50, 0, 0));
      const ids = session.view().run!.state.gauge.members.map(member => member.id);
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
  it.each([1, 3])('paces each enemy action with one D-491 telegraph, its impact and aftermath at %ix speed', async speed => {
    const original = Object.getOwnPropertyDescriptor(Element.prototype, 'animate');
    const animations: { target: Element; frames: Keyframe[]; duration: number; animation: Animation }[] = [];
    Object.defineProperty(Element.prototype, 'animate', { configurable: true, value: function (
      this: Element, frames: Keyframe[], options: KeyframeAnimationOptions,
    ): Animation {
      const animation: Partial<Animation> = { playbackRate: 1, playState: 'finished',
        finished: Promise.resolve().then(() => animation as Animation), cancel() {}, pause() {}, play() {} };
      animations.push({ target: this, frames, duration: Number(options.duration), animation: animation as Animation });
      return animation as Animation;
    } });
    try {
      document.documentElement.dataset.battleSpeed = String(speed);
      const { view, session } = fixture(1, 1); await view.finishEntrance();
      animations.length = 0;
      const enemyIds = new Set(session.view().run!.state.enemies.map(enemy => enemy.id));
      await view.act('normal');
      // Round 1 schedules no skill, so every Story Devourer plays a plain Attack: 250 + 100 + 200 + 100 ms.
      const poses = animations.flatMap((entry, index) => entry.duration === 650 &&
        enemyIds.has(entry.target.getAttribute('data-radiant-art') ?? '') &&
        entry.frames.some(frame => frame.transform === 'translateX(-24.0px) scale(1.05)') ? [index] : []);
      expect(poses.length).toBeGreaterThan(0);
      // One telegraph per enemy action, never one per hit frame.
      const posed = poses.map(index => animations[index].target.getAttribute('data-radiant-art'));
      expect(new Set(posed).size).toBe(posed.length);
      const pose = poses[0];
      // Without the GPU layer the wind-up and travel beats are held by a speed-scaled pause.
      expect(animations[pose + 1]).toMatchObject({ duration: 350, frames: [] });
      expect(animations.slice(pose + 1).some(entry => entry.duration === 100 && entry.frames.length === 0)).toBe(true);
      expect(animations[pose].animation.playbackRate).toBe(speed);
      expect(animations[pose + 1].animation.playbackRate).toBe(speed);
      // A plain Attack names nothing: no skill pill and no boss band.
      expect(document.querySelector('.radiant-enemy-callout, .cutin-enemy-special')).toBeNull();
    } finally {
      if (original) Object.defineProperty(Element.prototype, 'animate', original);
      else Reflect.deleteProperty(Element.prototype, 'animate');
    }
  });
  /** D-491: the Story 120 regional boss (Lv.55) uses Last Ruin every 6 rounds; the encounter opens on round 6. */
  const lastRuinRound = (state: RadiantCombatState) => { state.round = 6; };
  const ruinName = (run: FrozenRadiantRun) => run.enemies[0].skills.find(skill => skill.action === 'ultimate')!.name;
  /** Records effect-layer nodes added under `host` (they are removed again when they finish). */
  function addedNodes(host: HTMLElement, selector: string): { texts: string[]; stop(): void } {
    const texts: string[] = [];
    const observer = new MutationObserver(records => {
      for (const record of records) for (const node of Array.from(record.addedNodes))
        if (node instanceof HTMLElement && node.matches(selector)) texts.push(node.textContent ?? '');
    });
    observer.observe(host, { childList: true, subtree: true });
    return { texts, stop: () => observer.disconnect() };
  }
  it('warns before the turn, then plays a boss special with one telegraph, a 30% dim and its callout band (D-491)', async () => {
    const screens: unknown[] = [], cues: EnemyActionCue[] = [];
    const effects: RadiantBattleEffects = { windup: vi.fn(async () => {}), impact: vi.fn(async () => {}),
      screen: cue => { screens.push(cue); }, enemyWindup: vi.fn(async (cue: EnemyActionCue) => { cues.push(cue); }), cancel: vi.fn() };
    const { view, host, session } = fixture(3, 6, effects, 120, undefined, undefined, false, lastRuinRound);
    await view.finishEntrance();
    const [charging, ...others] = session.view().run!.enemies.map(enemy => enemy.id);
    const ruin = ruinName(session.view().run!);
    expect(ruin).toMatch(/^Last Ruin: /);
    const marker = host.querySelector<HTMLElement>(`[data-radiant-charging="${charging}"]`)!;
    expect(marker.hidden).toBe(false);
    expect(marker.dataset.tier).toBe('special');
    expect(marker.textContent).toContain('Last Ruin');
    expect(host.querySelector(`[data-radiant-target="${charging}"]`)!.getAttribute('aria-label')).toContain(`Charging ${ruin} this turn`);
    expect(host.querySelector(`[data-radiant-charging-detail="${charging}"]`)!.textContent).toBe(`Charging ${ruin} this turn.`);
    for (const id of others) expect(host.querySelector<HTMLElement>(`[data-radiant-charging="${id}"]`)!.hidden).toBe(true);
    const bands = addedNodes(host, '.cutin-enemy-special');
    controls(host, '[data-radiant-end-turn]').click();
    await vi.waitFor(() => expect(host.querySelector('[data-radiant-round]')!.textContent).toBe('Round 7'));
    bands.stop();
    const special = cues.filter(cue => cue.enemyId === charging);
    expect(special).toHaveLength(1);
    expect(special[0]).toMatchObject({ tier: 'special', skillName: ruin, family: 'devourer' });
    expect(new Set(cues.map(cue => cue.enemyId)).size).toBe(cues.length);
    expect(screens).toContainEqual(expect.objectContaining({ dim: expect.objectContaining({ alpha: .3 }) }));
    expect(screens.some(cue => (cue as { flash?: string }).flash === 'full')).toBe(false);
    expect(bands.texts.some(text => text.includes('BOSS SPECIAL') && text.includes(ruin))).toBe(true);
    // Round 7 schedules a Strike only, so the marker stays hidden after the enemy phase.
    expect(marker.hidden).toBe(true);
  });
  it('names a boss special statically under Reduce motion (D-491)', async () => {
    const { view, host, session } = fixture(3, 6, undefined, 120, undefined, undefined, false, lastRuinRound);
    applyMotion('reduced'); await view.finishEntrance();
    const pills = addedNodes(host, '.radiant-enemy-callout.is-static');
    controls(host, '[data-radiant-end-turn]').click();
    await vi.waitFor(() => expect(host.querySelector('[data-radiant-round]')!.textContent).toBe('Round 7'));
    pills.stop();
    expect(pills.texts).toEqual([ruinName(session.view().run!)]);
    expect(host.querySelector('.cutin-enemy-special')).toBeNull();
  });
  it('surfaces a missing Gauge recipient without losing the resolved action', async () => {
    const { view, session, host, acts } = fixture(['ember', 'caldrex']); await view.finishEntrance();
    host.querySelector('[data-radiant-unit="caldrex"] .radiant-face')!.remove();
    await expect(view.act('normal')).rejects.toThrow('Gauge-drop recipient is missing');
    expect(acts).toHaveBeenCalledTimes(1); expect(session.view().run!.state.acted).toEqual(['ember']);
    expect(session.view().run!.state.gauge.members[1].charge).toBeGreaterThan(0);
    expect(host.querySelector('[data-radiant-error]')!.textContent).toContain('Gauge-drop recipient is missing');
  });
  it('clicking anywhere on a member card resolves its Normal Attack', async () => {
    const { view, session, host, transport, acts } = fixture(); applyMotion('reduced'); await view.finishEntrance();
    host.querySelector<HTMLElement>('[data-radiant-card][data-radiant-unit="tide"] .radiant-frozen-stats dd')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await vi.waitFor(() => expect(session.view().run!.state.acted).toContain('tide'));
    expect(acts).toHaveBeenCalledTimes(1);
    expect(acts.mock.calls[0][0]).toEqual({ type: 'normal', bearerId: 'tide', targetId: 'story-25-0' });
    host.querySelector<HTMLElement>('[data-radiant-card][data-radiant-unit="tide"] [data-radiant-charge-text]')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await Promise.resolve();
    expect(acts).toHaveBeenCalledTimes(1);
    expect(transport.execute).not.toHaveBeenCalled();
  });
  it('a held upward portrait release casts one Convergent Light and suppresses its compatibility click', async () => {
    const { view, session, host, transport, acts } = fixture(3, 6, undefined, 25, undefined, undefined, true);
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
    await vi.waitFor(() => expect(session.view().run!.state.acted).toContain('tide'));
    expect(acts).toHaveBeenCalledTimes(1);
    expect(acts.mock.calls[0][0]).toEqual({ type: 'flare', bearerId: 'tide' });
    expect(transport.execute).not.toHaveBeenCalled();
  });
  it('form1 has one personal layer and released forms use reviewed face art', async () => {
    const { view, host } = fixture(3, 1); applyMotion('reduced'); await view.finishEntrance();
    expect(host.querySelectorAll('[data-radiant-charge]')).toHaveLength(3);
    expect(host.querySelectorAll('[data-energy-layer="1"]')).toHaveLength(3);
    expect(host.querySelectorAll('[data-energy-layer="2"]')).toHaveLength(0);
    expect(host.querySelector('.radiant-shared')).toBeNull();
    expect(host.querySelector<HTMLImageElement>(`[data-character="${releasedRadiantIds[2]}"] img`)!.alt).not.toContain('pending');
    expect(host.querySelector<HTMLImageElement>('[data-character="ember"] img')!.alt).not.toContain('pending');
  });
  it('keeps old HP while the windup plays, then shows the resolved impact before visuals finish, with no save', async () => {
    let windup!: () => void, impact!: () => void;
    const frames: RadiantImpactFrame[] = [];
    const effects = { windup: vi.fn(() => new Promise<void>(resolve => { windup = resolve; })),
      impact: vi.fn((frame: RadiantImpactFrame) => { frames.push(frame);
        return frames.length === 1 ? new Promise<void>(resolve => { impact = resolve; }) : Promise.resolve(); }),
      cancel: vi.fn() };
    const { view, host, session, transport } = fixture(3, 6, effects);
    await view.finishEntrance();
    const target = session.view().run!.state.enemies[0].id;
    const readout = host.querySelector<HTMLElement>(`[data-radiant-target-detail="${target}"]`)!;
    const enemyHP = readout.querySelector('[data-hp]')!.textContent;
    const pending = view.act('normal');
    await vi.waitFor(() => expect(effects.windup).toHaveBeenCalledTimes(1));
    expect(readout.querySelector('[data-hp]')!.textContent).toBe(enemyHP);
    expect(session.view().run!.state.enemies[0].hp).toBeLessThan(session.view().saved.run!.state.enemies[0].hp);
    expect(session.view().saved.revision).toBe(1); expect(transport.execute).not.toHaveBeenCalled();
    windup(); await vi.waitFor(() => expect(effects.impact).toHaveBeenCalledTimes(1));
    expect(readout.querySelector('[data-hp]')!.textContent).not.toBe(enemyHP);
    expect(action(host, 'tide').disabled).toBe(false);
    impact(); await pending;
    expect(session.view().presentation).toBeNull(); expect(host.getAttribute('aria-busy')).toBe('false');
  });
  it('starts another member presentation while the previous member is still winding up (flurry)', async () => {
    const windups: (() => void)[] = [];
    const effects = { windup: vi.fn(() => new Promise<void>(resolve => { windups.push(resolve); })),
      impact: vi.fn(async () => {}), cancel: vi.fn() };
    const { view, session, transport, host, acts } = fixture(3, 6, effects);
    await view.finishEntrance();

    const first = view.act('normal');
    await vi.waitFor(() => expect(windups).toHaveLength(1));
    expect(acts).toHaveBeenCalledTimes(1);
    expect(action(host, 'tide').disabled).toBe(false);
    expect(host.querySelector('[data-radiant-status]')?.textContent).toBe('');

    const second = view.act('normal');
    await vi.waitFor(() => expect(acts).toHaveBeenCalledTimes(2));
    // Only an encounter-ending action sends a request: the one settle.
    expect(transport.execute.mock.calls.every(([request]) => request.operation.kind === 'settle')).toBe(true);
    expect(session.view().run!.state.acted).toEqual(['ember', 'tide']);
    // Overlapping presentations: the second windup starts without waiting for the first.
    await vi.waitFor(() => expect(windups).toHaveLength(2));

    // The newer action finishes first; the older one's late frame must not rewind the readout.
    windups[1]();
    await second;
    const latest = session.view().run!;
    const target = latest.state.enemies[0];
    const expected = radiantReadout(latest.state).units[target.id];
    const hp = host.querySelector(`[data-radiant-health="${target.id}"] [data-hp]`)!;
    windups[0]();
    await first;
    expect(hp.textContent).toBe(`HP ${expected.hp} / ${expected.maximum}`);
    expect(session.view().presentation).toBeNull();
    await vi.waitFor(() => expect(session.view().busy).toBe(false));
    expect(session.view().saved.revision).toBe(1 + transport.execute.mock.calls.length);
  });
  it('holds the enemy phase until every overlapping member presentation has finished', async () => {
    const windups: (() => void)[] = [];
    const impacts: (RadiantPlayerAction | null | undefined)[] = [];
    const effects = { windup: vi.fn(() => new Promise<void>(resolve => { windups.push(resolve); })),
      impact: vi.fn(async (_frame: RadiantImpactFrame, action?: RadiantPlayerAction | null) => { impacts.push(action); }),
      cancel: vi.fn() };
    const { view, session } = fixture(2, 1, effects); await view.finishEntrance();
    const first = view.act('normal');
    await vi.waitFor(() => expect(windups).toHaveLength(1));
    const second = view.act('normal');
    await vi.waitFor(() => expect(windups).toHaveLength(2));
    expect(session.view().run!.state.round).toBe(2);
    // The round-completing member's own hit plays at once; the enemy phase waits for the first member.
    windups[1]();
    await vi.waitFor(() => expect(impacts.length).toBeGreaterThan(0));
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(impacts.every(action => action)).toBe(true);
    windups[0]();
    await Promise.all([first, second]);
    expect(impacts.some(action => action === null)).toBe(true);
    expect(impacts.findIndex(action => action === null)).toBeGreaterThan(impacts.findIndex(action => action?.bearerId === 'ember'));
  });
  it('streams exact damage numbers, pours Prismatica into the Haul and cycles battle speed', async () => {
    const original = Object.getOwnPropertyDescriptor(Element.prototype, 'animate');
    const numbers: string[] = [], motes: string[] = [];
    Object.defineProperty(Element.prototype, 'animate', { configurable: true, value: function (this: Element): Animation {
      if (this instanceof HTMLElement && this.classList.contains('radiant-number')) numbers.push(this.textContent ?? '');
      if (this instanceof HTMLElement && this.classList.contains('radiant-prism-mote')) motes.push(this.className);
      const animation: Partial<Animation> = { playbackRate: 1, playState: 'finished',
        finished: Promise.resolve().then(() => animation as Animation), cancel() {}, pause() {}, play() {} };
      return animation as Animation;
    } });
    try {
      const { view, session, host } = fixture(); await view.finishEntrance();
      const enemy = session.view().run!.state.enemies[0];
      const before = enemy.hp;
      await view.act('normal');
      const after = session.view().run!.state.enemies.find(unit => unit.id === enemy.id)!.hp;
      expect(numbers.some(text => text.endsWith((before - after).toLocaleString('en-US')))).toBe(true);
      const haul = session.view().haul;
      if (haul > 0) expect(motes.length).toBeGreaterThan(0);
      expect(host.querySelector('[data-radiant-haul-amount]')!.textContent).toBe(haul.toLocaleString('en-US'));
      expect(host.querySelector('.radiant-number')).toBeNull();
      const speed = controls(host, '[data-radiant-speed]');
      expect(speed.textContent).toBe('1x');
      speed.click();
      expect(document.documentElement.dataset.battleSpeed).toBe('2');
      expect(speed.textContent).toBe('2x');
      expect(speed.getAttribute('aria-label')).toBe('Battle speed 2x. Activate for 3x.');
      speed.click(); speed.click();
      expect(speed.textContent).toBe('1x');
    } finally {
      if (original) Object.defineProperty(Element.prototype, 'animate', original);
      else Reflect.deleteProperty(Element.prototype, 'animate');
    }
  });
  it('allows a teammate to cast newly shared charge during the previous windup', async () => {
    const windups: (() => void)[] = [];
    const effects = { windup: vi.fn(() => new Promise<void>(resolve => { windups.push(resolve); })),
      impact: vi.fn(async () => {}), cancel: vi.fn() };
    const { view, session, host, acts } = fixture(['ember', 'caldrex'], 6, effects, 25, undefined, undefined, false, state => {
      const caldrex = state.gauge.members.find(member => member.id === 'caldrex')!;
      caldrex.charge = caldrex.baseCost - 1;
    });
    await view.finishEntrance();
    const caldrexBefore = session.view().run!.state.gauge.members.find(member => member.id === 'caldrex')!;
    const first = view.act('normal');
    await vi.waitFor(() => expect(windups).toHaveLength(1));
    const savedTide = session.view().run!.state.gauge.members.find(member => member.id === 'caldrex')!;
    expect(savedTide.charge).toBeGreaterThanOrEqual(savedTide.baseCost);
    expect(host.querySelector('[data-radiant-charge-text="caldrex"]')!.textContent)
      .toBe(`${caldrexBefore.charge} / ${caldrexBefore.baseCost * 2} Luminosity`);
    const caldrexLiquid = host.querySelector<HTMLElement>('[data-radiant-energy="caldrex"] [data-energy-layer="1"]')!;
    expect(parseFloat(caldrexLiquid.style.width)).toBeCloseTo(caldrexBefore.charge / caldrexBefore.baseCost * 100);
    expect(action(host, 'caldrex').disabled).toBe(false);
    expect(host.querySelector('[data-radiant-readiness="caldrex"]')!.textContent).toBe('Sparkling Convergent Light ready');
    const second = view.act('flare');
    await vi.waitFor(() => expect(acts).toHaveBeenCalledTimes(2));
    expect(acts.mock.calls[1][0]).toMatchObject({ type: 'flare', bearerId: 'caldrex' });
    windups[0]();
    await vi.waitFor(() => expect(windups).toHaveLength(2));
    windups[1]();
    await Promise.all([first, second]);
    const remainingCharge = session.view().run!.state.gauge.members.find(member => member.id === 'caldrex')!.charge;
    expect(parseFloat(caldrexLiquid.style.width)).toBeCloseTo(remainingCharge / caldrexBefore.baseCost * 100);
    expect(remainingCharge).toBeLessThan(caldrexBefore.charge);
    expect(host.querySelector<HTMLElement>('[data-radiant-energy="caldrex"] [data-energy-layer="2"]')!.style.width).toBe('0%');
  });
  it('Skip settles queued actions to the latest resolved state without replaying stale impacts', async () => {
    const windups: (() => void)[] = [];
    const effects = { windup: vi.fn(() => new Promise<void>(resolve => { windups.push(resolve); })),
      impact: vi.fn(async () => {}), cancel: vi.fn() };
    const { view, session, host, acts } = fixture(3, 6, effects);
    await view.finishEntrance();

    const first = view.act('normal');
    await vi.waitFor(() => expect(windups).toHaveLength(1));
    const second = view.act('normal');
    await vi.waitFor(() => expect(acts).toHaveBeenCalledTimes(2));
    const latest = session.view().run!;
    const target = latest.state.enemies[0];
    const expected = radiantReadout(latest.state).units[target.id];
    view.skip();
    const hp = host.querySelector(`[data-radiant-health="${target.id}"] [data-hp]`)!;
    expect(hp.textContent).toBe(`HP ${expected.hp} / ${expected.maximum}`);
    expect(latest.state.acted).toEqual(['ember', 'tide']);

    await Promise.all([first, second]);
    windups.forEach(release => release());
    await Promise.resolve();
    expect(hp.textContent).toBe(`HP ${expected.hp} / ${expected.maximum}`);
    // Both overlapping windups had started; Skip cancelled them without replaying impacts.
    expect(effects.windup).toHaveBeenCalledTimes(2);
    expect(effects.impact).not.toHaveBeenCalled();
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
    const { view, host } = fixture(3, 6, effects); await view.finishEntrance();
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
    const { view, host, session, transport, acts } = fixture(3, 6, effects); await view.finishEntrance();
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
    expect(acts).toHaveBeenCalledTimes(1);
    expect(action(host, 'tide').disabled).toBe(false);
    const second = view.act('normal');
    await vi.waitFor(() => expect(acts).toHaveBeenCalledTimes(2));
    expect(transport.execute.mock.calls.every(([request]) => request.operation.kind === 'settle')).toBe(true);
    view.skip();
    expect(cancelFrame).toHaveBeenCalledWith(1);
    await Promise.all([first, second]);
    expect(scroller.scrollTop).toBe(760);
    scroller.scrollTop = 520;
    callbacks[0](performance.now());
    await Promise.resolve();
    expect(scroller.scrollTop).toBe(520);
    // Only the second (already revealed) overlapping action reached its windup before Skip.
    expect(effects.windup).toHaveBeenCalledTimes(1);
    expect(effects.impact).not.toHaveBeenCalled();
    expect(session.view().presentation).toBeNull();
    expect(session.view().run!.state.acted).toEqual(['ember', 'tide']);
  });
  it('cancels a pending automatic reveal frame when the battle is disposed', async () => {
    const callbacks: FrameRequestCallback[] = [];
    const effects = { windup: vi.fn(async () => {}), impact: vi.fn(async () => {}), cancel: vi.fn() };
    const { view, host } = fixture(3, 6, effects); await view.finishEntrance();
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
    const { view, host } = fixture(3, 6, effects); await view.finishEntrance();
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
    const { view, session, host, acts } = fixture(3, 6, effects); await view.finishEntrance();
    const old = view.act('normal'); await vi.waitFor(() => expect(releases).toHaveLength(1));
    view.skip(); expect(session.view().presentation).toBeNull();
    const next = view.act('normal'); await vi.waitFor(() => expect(releases).toHaveLength(2));
    releases[0](); await old;
    expect(acts).toHaveBeenCalledTimes(2);
    expect(session.view().presentation).toBeNull();
    expect(host.querySelector('[data-radiant-error]')!.textContent).toBe('');
    releases[1](); await next; expect(session.view().presentation).toBeNull();
  });
  it('Settings locks controls without a new request and Reduce motion settles saved effects immediately', async () => {
    let release!: () => void;
    const effects = { windup: vi.fn(() => new Promise<void>(resolve => { release = resolve; })),
      impact: vi.fn(async () => {}), cancel: vi.fn(), pause: vi.fn() };
    const { view, session, host, transport, settings } = fixture(3, 6, effects); await view.finishEntrance();
    controls(host, '[data-radiant-settings]').click();
    expect(settings).toHaveBeenCalledTimes(1); expect(session.view().settingsOpen).toBe(true);
    expect(host.querySelector('.radiant-battle')!.classList.contains('is-settings-open')).toBe(true);
    expect(action(host, 'ember').disabled).toBe(true);
    expect(transport.execute).not.toHaveBeenCalled();
    session.setSettings(false); view.render();
    expect(host.querySelector('.radiant-battle')!.classList.contains('is-settings-open')).toBe(false);
    const pending = view.act('normal'); await vi.waitFor(() => expect(effects.windup).toHaveBeenCalled());
    applyMotion('reduced');
    expect(effects.cancel).toHaveBeenCalled(); expect(session.view().presentation).toBeNull();
    release(); await pending; expect(effects.impact).not.toHaveBeenCalled();
  });
  it('a lost settle acknowledgement exposes an exact retry and never celebrates before the save', async () => {
    const { view, host, session, transport } = fixture(); applyMotion('reduced'); await view.finishEntrance();
    const execute = transport.execute.getMockImplementation()!;
    transport.execute.mockImplementationOnce(async request => { await execute(request); throw new Error('Lost reply'); });
    for (let turn = 0; turn < 40 && session.view().run!.state.phase === 'player'; turn++) await view.act('normal');
    await vi.waitFor(() => expect(session.view().pending?.operation.kind).toBe('settle'));
    await vi.waitFor(() => expect(session.view().busy).toBe(false));
    expect(transport.execute).toHaveBeenCalledTimes(1);
    expect(session.view().saved.revision).toBe(1);
    const results = host.querySelector<HTMLElement>('[data-radiant-results]')!;
    expect(results.hidden).toBe(true);
    expect(host.querySelector('[data-radiant-error]')!.textContent).toContain('not acknowledged');
    expect(host.querySelector('[data-radiant-haul-state]')!.textContent).toBe('Not saved yet');
    expect(controls(host, '[data-radiant-retry]').hidden).toBe(false);
    const request = session.view().pending!;
    await view.retry(); expect(transport.execute.mock.calls.at(-1)![0]).toEqual(request);
    expect(session.view().saved.revision).toBe(2);
    expect(results.hidden).toBe(false);
    expect(host.querySelector('[data-radiant-haul-state]')!.textContent).toBe('Saved');
  });
  it('sends exactly one settle at victory and shows the result only after its acknowledgement', async () => {
    const { view, host, session, transport } = fixture(); applyMotion('reduced'); await view.finishEntrance();
    const execute = transport.execute.getMockImplementation()!;
    let save!: () => void;
    transport.execute.mockImplementationOnce(async request => { await new Promise<void>(resolve => { save = resolve; }); return execute(request); });
    for (let turn = 0; turn < 40 && session.view().run!.state.phase === 'player'; turn++) await view.act('normal');
    expect(session.view().run!.state.phase).toBe('victory');
    const haul = session.view().haul;
    expect(haul).toBeGreaterThan(0);
    expect(host.querySelector('[data-radiant-haul-amount]')!.textContent).toBe(haul.toLocaleString('en-US'));
    await vi.waitFor(() => expect(transport.execute).toHaveBeenCalledTimes(1));
    expect(transport.execute.mock.calls[0][0].operation.kind).toBe('settle');
    expect(host.querySelector<HTMLElement>('[data-radiant-results]')!.hidden).toBe(true);
    expect(host.querySelector('[data-radiant-status]')!.textContent).toBe('Saving encounter…');
    expect(host.querySelector('[data-radiant-haul-state]')!.textContent).toBe('Saving…');
    save();
    await vi.waitFor(() => expect(host.querySelector<HTMLElement>('[data-radiant-results]')!.hidden).toBe(false));
    expect(transport.execute).toHaveBeenCalledTimes(1);
    expect(session.view().saved.run!.state.phase).toBe('victory');
    expect(host.querySelector('[data-radiant-haul-amount]')!.textContent).toBe(haul.toLocaleString('en-US'));
  });
  it('End Turn skips members who have not acted and plays the enemy phase without a request', async () => {
    const { view, host, session, transport, acts } = fixture(); applyMotion('reduced'); await view.finishEntrance();
    await view.act('normal', 'ember');
    const round = session.view().run!.state.round;
    controls(host, '[data-radiant-end-turn]').click();
    expect(acts.mock.calls.at(-1)![0]).toEqual({ type: 'end-turn' });
    await vi.waitFor(() => expect(host.querySelector('[data-radiant-round]')!.textContent).toBe(`Round ${round + 1}`));
    expect(transport.execute).not.toHaveBeenCalled();
    expect(session.view().run!.state.acted).toEqual([]);
    expect(action(host, 'ember').disabled).toBe(false);
    action(host, 'tide').dispatchEvent(new KeyboardEvent('keydown', { key: 'e', bubbles: true, cancelable: true }));
    expect(acts.mock.calls.at(-1)![0]).toEqual({ type: 'end-turn' });
  });
  it('a resumed device log restores the live encounter after reconstruction', async () => {
    const items = new Map<string, string>();
    const storage = { getItem: (key: string) => items.get(key) ?? null,
      setItem: (key: string, value: string) => { items.set(key, value); }, removeItem: (key: string) => { items.delete(key); } };
    const { session, transport } = fixture(); applyMotion('reduced');
    const logged = new RadiantSession(session.view().saved, transport, uuid, storage);
    logged.finishEntrance();
    logged.act({ type: 'normal', bearerId: 'ember', targetId: logged.view().run!.state.enemies[0].id });
    const resumed = new RadiantSession(logged.view().saved, transport, uuid, storage);
    const host = document.createElement('div'); document.body.append(host);
    const view = new RadiantBattleView(host, resumed, vi.fn()); disposed.push(view);
    await view.finishEntrance();
    expect(resumed.view().run!.state.acted).toEqual(['ember']);
    expect(action(host, 'ember').disabled).toBe(true);
    expect(action(host, 'tide').disabled).toBe(false);
    expect(transport.execute).not.toHaveBeenCalled();
  });
  it('disposing during saved presentation cancels effects and prevents late DOM updates', async () => {
    let release!: () => void;
    const effects = { windup: vi.fn(() => new Promise<void>(resolve => { release = resolve; })),
      impact: vi.fn(async () => {}), cancel: vi.fn() };
    const { view, host, session } = fixture(3, 6, effects); await view.finishEntrance();
    const pending = view.act('normal'); await vi.waitFor(() => expect(effects.windup).toHaveBeenCalled());
    view.dispose(); release(); await pending;
    expect(host.children).toHaveLength(0); expect(effects.impact).not.toHaveBeenCalled();
    expect(session.view().run!.state.acted).toEqual(['ember']);
  });
  it('saved results dismiss/reopen and Settings preserve the same receipt and sheet without new requests', async () => {
    const { view, session, host, transport } = fixture(); applyMotion('reduced'); await view.finishEntrance();
    await clear(view, session);
    const results = host.querySelector<HTMLElement>('[data-radiant-results]')!;
    const sheet = results.firstElementChild, before = session.view().saved;
    expect(results.hidden).toBe(false); expect(document.activeElement).toBe(host.querySelector('[data-radiant-result-heading]'));
    const requests = transport.execute.mock.calls.length;
    expect(host.querySelector<HTMLElement>('.radiant-battle-layout')!.inert).toBe(true);
    const buttons = Array.from(results.querySelectorAll<HTMLButtonElement>('button'));
    buttons.at(-1)!.focus();
    buttons.at(-1)!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(buttons[0]);
    buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));
    expect(document.activeElement).toBe(buttons.at(-1));
    buttons.at(-1)!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(results.hidden).toBe(true);
    expect(host.querySelector<HTMLElement>('.radiant-battle-layout')!.inert).toBe(false);
    controls(host, '[data-radiant-results-show]').click();
    controls(host, '[data-radiant-result-dismiss]').click();
    expect(results.hidden).toBe(true); expect(document.activeElement).toBe(controls(host, '[data-radiant-results-show]'));
    controls(host, '[data-radiant-results-show]').click(); expect(results.hidden).toBe(false);
    controls(host, '[data-radiant-settings]').click(); expect(results.hidden).toBe(true);
    session.setSettings(false); view.render();
    expect(results.firstElementChild).toBe(sheet); expect(results.hidden).toBe(false);
    expect(transport.execute).toHaveBeenCalledTimes(requests); expect(session.view().saved).toEqual(before);
  });
  it('reveals defeat feedback only after its saved impacts, without a victory celebration', async () => {
    let release!: () => void;
    const effects = { windup: vi.fn(() => new Promise<void>(resolve => { release = resolve; })),
      impact: vi.fn(async () => {}), cancel: vi.fn() };
    const { view, session, host } = fixture(1, 1, effects, 34, undefined, undefined, false,
      state => { state.bearers[0].hp = 1; }, { kind: 'dungeon', element: 'infernic', stage: 34 });
    await view.finishEntrance();
    const pending = view.act('normal');
    await vi.waitFor(() => expect(session.view().run!.state.phase).toBe('defeat'));
    expect(host.querySelector<HTMLElement>('[data-radiant-results]')!.hidden).toBe(true);
    await vi.waitFor(() => expect(session.view().saved.run!.state.phase).toBe('defeat'));
    expect(host.querySelector<HTMLElement>('[data-radiant-results]')!.hidden).toBe(true);
    release(); await pending;
    const results = host.querySelector<HTMLElement>('[data-radiant-results]')!;
    await vi.waitFor(() => expect(results.hidden).toBe(false));
    expect(results.querySelector('[data-outcome="defeat"]')).not.toBeNull();
    expect(results.querySelector('.radiant-result-aura[aria-hidden="true"]')).not.toBeNull();
    expect(results.querySelector('.rarity-feedback')).toBeNull();
    expect(results.querySelector('.luster-sheen')).toBeNull();
    const crumble = results.querySelector<HTMLElement>('.radiant-result-intro[data-outcome="defeat"]')!;
    expect(crumble.textContent).toBe('Defeat...');
    crumble.click(); expect(results.querySelector('.radiant-result-intro')).toBeNull();
    expect(results.querySelector('.luster-sheen, .rarity-feedback')).toBeNull();
    expect(results.textContent).toContain('Your squad fell. Rewards from defeated enemies are saved.');
    expect(document.activeElement).toBe(results.querySelector('[data-radiant-result-heading]'));
    expect(results.querySelector('[data-radiant-transition="retry"]')).not.toBeNull();
    expect(results.querySelector('[data-radiant-transition="continue"]')).toBeNull();
  });
  it('Continue rebuilds only after save, freezes loadouts, resets encounter totals and keeps final stages terminal', async () => {
    const { view, session, host, transport } = fixture(); applyMotion('reduced'); await view.finishEntrance();
    await clear(view, session);
    const before = session.view().run!, oldImage = host.querySelector('.radiant-enemy-art');
    const execute = transport.execute.getMockImplementation()!;
    let save!: () => void;
    transport.execute.mockImplementationOnce(async request => { await new Promise<void>(resolve => { save = resolve; }); return execute(request); });
    const pending = view.transition('continue');
    expect(host.querySelector('.radiant-enemy-art')).toBe(oldImage);
    expect(session.view().run!.encounter).toBe(before.encounter);
    expect(controls(host, '[data-radiant-transition="retry"]').disabled).toBe(true);
    save(); await pending;
    const next = session.view();
    expect(next.saved.run!.encounter).toBe(before.encounter + 1);
    expect(next.saved.run!.state.bearers.map(unit => unit.loadout)).toEqual(before.initial.bearers.map(unit => unit.loadout));
    expect(next.saved.run!.journal.events).toEqual([]); expect(next.entrancePending).toBe(false);
    expect(next.presentation).toBeNull(); expect(host.querySelector('.radiant-enemy-art')).not.toBe(oldImage);
    expect(host.querySelector<HTMLElement>('[data-radiant-results]')!.hidden).toBe(true);
    const final = fixture(3, 6, undefined, 120); await final.view.finishEntrance(); await clear(final.view, final.session);
    expect(final.host.querySelector('[data-radiant-transition="continue"]')).toBeNull();
    expect(final.host.textContent).toContain('Activity complete');
  });
  it('Replay and lost exit acknowledgements retain earned rewards and retry the exact saved request once', async () => {
    const exited = vi.fn(), { view, session, host, transport } = fixture(3, 6, undefined, 25, exited);
    applyMotion('reduced'); await view.finishEntrance(); await clear(view, session);
    const banked = session.view().saved.account.fractalis, journal = session.view().run!.journal;
    await view.transition('retry');
    expect(session.view().saved.account.fractalis).toBe(banked);
    expect(session.view().run!.journal).toEqual(journal);
    await clear(view, session);
    expect(session.view().saved.account.fractalis).toBe(banked);
    const execute = transport.execute.getMockImplementation()!;
    transport.execute.mockImplementationOnce(async request => { await execute(request); throw new Error('Exit reply lost'); });
    await expect(view.transition('exit')).rejects.toThrow('Exit reply lost');
    expect(exited).not.toHaveBeenCalled(); expect(host.children.length).toBeGreaterThan(0);
    const pending = session.view().pending!;
    await view.retry();
    expect(transport.execute.mock.calls.at(-1)![0]).toEqual(pending);
    expect(exited).toHaveBeenCalledTimes(1); expect(session.view().run).toBeNull();
    expect(session.view().saved.account.fractalis).toBe(banked); expect(host.children).toHaveLength(0);
  });
  it('celebrates a live victory once with exact saved amounts, never on reopen, Settings close or restore', async () => {
    const effects = { windup: vi.fn(async () => {}), impact: vi.fn(async () => {}), cancel: vi.fn() };
    const { view, session, host } = fixture(3, 6, effects); await view.finishEntrance();
    await clear(view, session);
    const results = host.querySelector<HTMLElement>('[data-radiant-results]')!;
    const sheet = results.querySelector<HTMLElement>('.radiant-results')!;
    expect(results.hidden).toBe(false);
    const intro = results.querySelector<HTMLElement>('.radiant-result-intro[data-outcome="victory"]')!;
    expect(intro.textContent).toBe('Win!!'); expect(intro.getAttribute('aria-hidden')).toBe('true');
    expect(results.classList.contains('is-result-intro')).toBe(true);
    expect(sheet.querySelector('.luster-sheen')).toBeNull();
    expect(document.activeElement).toBe(sheet.querySelector('[data-radiant-result-heading]'));
    sheet.querySelector('[data-radiant-result-heading]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(results.querySelector('.radiant-result-intro')).toBeNull(); expect(results.hidden).toBe(false);
    expect(results.classList.contains('is-result-intro')).toBe(false);
    expect(sheet.querySelector('.luster-sheen')).not.toBeNull();
    expect(sheet.querySelector('.battle-result-rewards ul')?.classList.contains('luster-stagger') ?? true).toBe(true);
    expect(sheet.querySelector('.radiant-result-identity')!.textContent).toContain('Story · Stage 25');
    controls(host, '[data-radiant-result-dismiss]').click();
    expect(sheet.querySelector('.luster-sheen')).toBeNull();
    for (const amount of Array.from(sheet.querySelectorAll('.battle-result-rewards li > strong'))) expect(amount.textContent).toMatch(/^\+\d/);
    controls(host, '[data-radiant-results-show]').click();
    expect(sheet.querySelector('.luster-sheen')).toBeNull();
    controls(host, '[data-radiant-settings]').click(); session.setSettings(false); view.render();
    expect(sheet.querySelector('.luster-sheen')).toBeNull();
    const checkpoint = session.view().saved; view.dispose();
    const restoredHost = document.createElement('div'); document.body.append(restoredHost);
    const restored = new RadiantBattleView(restoredHost, new RadiantSession(checkpoint, { read: vi.fn(), execute: vi.fn() } as never, uuid), vi.fn(), effects);
    disposed.push(restored); await restored.finishEntrance();
    expect(restoredHost.querySelector<HTMLElement>('[data-radiant-results]')!.hidden).toBe(false);
    expect(restoredHost.querySelector('.luster-sheen, .luster-stagger, .rarity-feedback, .radiant-result-intro')).toBeNull();
  });
  it('victory sheet waits for saved impact completion and Skip prevents late duplicate results', async () => {
    let release!: () => void;
    const effects = { windup: vi.fn(async () => {}), impact: vi.fn(async () => {}), cancel: vi.fn() };
    const { view, session, host } = fixture(3, 6, effects); await view.finishEntrance();
    // This authored fixture has two targets; the first Normal defeats one.
    await view.act('normal');
    effects.windup.mockImplementationOnce(() => new Promise<void>(resolve => { release = resolve; }));
    const pending = view.act('normal');
    await vi.waitFor(() => expect(session.view().run!.state.phase).toBe('victory'));
    await vi.waitFor(() => expect(session.view().saved.run!.state.phase).toBe('victory'));
    await vi.waitFor(() => expect(session.view().busy).toBe(false));
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
    const exited = vi.fn(), { view, session, host, transport } = fixture(3, 6, undefined, 25, exited);
    applyMotion('reduced'); await view.finishEntrance();
    let choose!: (value: boolean) => void;
    const confirm = vi.spyOn(dialogs, 'gameConfirm').mockImplementation(() => new Promise(resolve => { choose = resolve; }));
    const saved = session.view().saved;
    expect(host.querySelector('.radiant-field .radiant-hud [data-radiant-leave]')!.textContent).toBe('Exit');
    controls(host, '[data-radiant-leave]').click();
    expect(session.view().settingsOpen).toBe(true);
    expect(action(host, 'ember').disabled).toBe(true);
    expect(transport.execute).not.toHaveBeenCalled();
    choose(false); await vi.waitFor(() => expect(session.view().settingsOpen).toBe(false));
    expect(session.view().saved).toEqual(saved); expect(exited).not.toHaveBeenCalled();
    confirm.mockResolvedValueOnce(true);
    controls(host, '[data-radiant-leave]').click();
    await vi.waitFor(() => expect(exited).toHaveBeenCalledTimes(1));
    expect(transport.execute).toHaveBeenCalledTimes(1);
    expect(transport.execute.mock.calls[0][0].operation.kind).toBe('exit');
    expect(session.view().run).toBeNull();
  });
  it('right click opens the skill fan (D-479) without spending an action; Escape closes it and returns focus', async () => {
    const { view, session, host, transport, acts } = fixture(); applyMotion('reduced'); await view.finishEntrance();
    const card = host.querySelector<HTMLElement>('[data-radiant-card][data-radiant-unit="ember"] .radiant-frozen-stats dd')!;
    const menu = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 });
    card.dispatchEvent(menu);
    expect(menu.defaultPrevented).toBe(true);
    const fan = host.querySelector<HTMLElement>('[data-radiant-fan="ember"]')!;
    expect(fan.hidden).toBe(false);
    expect(Array.from(fan.querySelectorAll<HTMLElement>('[data-radiant-skill]')).map(choice => choice.dataset.radiantSkill))
      .toEqual(['1', '2', 'flare']);
    expect(fan.textContent).toContain('Cinder Cleave');
    expect(fan.querySelector('[data-radiant-skill="1"] [data-radiant-skill-text]')!.textContent).toBe(
      '4-hit Infernic attack on one enemy (260%), adds Burn (25% Attack per turn, 3 turns).');
    expect(document.activeElement?.closest('[data-radiant-fan]')).toBe(fan);
    (document.activeElement as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(fan.hidden).toBe(true);
    expect(document.activeElement).toBe(action(host, 'ember'));
    await Promise.resolve();
    expect(acts).not.toHaveBeenCalled();
    expect(session.view().run!.state.acted).toEqual([]);
    expect(transport.execute).not.toHaveBeenCalled();
  });
  it('D opens the fan and a ready Skill 1 casts on the current target from the device', async () => {
    const { view, session, host, transport, acts } = fixture(3, 6, undefined, 25, undefined, undefined, true);
    applyMotion('reduced'); await view.finishEntrance();
    const ember = action(host, 'ember');
    ember.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', bubbles: true, cancelable: true }));
    const skill = host.querySelector<HTMLButtonElement>('[data-radiant-fan="ember"] [data-radiant-skill="1"]')!;
    expect(skill.getAttribute('aria-disabled')).toBe('false');
    expect(skill.querySelector('[data-radiant-skill-cost]')!.textContent).toBe('25');
    skill.click();
    await vi.waitFor(() => expect(session.view().run!.state.acted).toContain('ember'));
    expect(acts.mock.calls[0][0]).toEqual({ type: 'skill', bearerId: 'ember', slot: 1, targetId: 'story-25-0' });
    expect(host.querySelector<HTMLElement>('[data-radiant-fan="ember"]')!.hidden).toBe(true);
    expect(transport.execute).not.toHaveBeenCalled();
  });
  it('an ally-only skill sends no target, and an unaffordable skill is explained and never sent', async () => {
    const charged = fixture(3, 6, undefined, 25, undefined, undefined, true);
    applyMotion('reduced'); await charged.view.finishEntrance();
    await charged.view.act('skill', 'tide', 2);
    expect(charged.acts.mock.calls[0][0]).toEqual({ type: 'skill', bearerId: 'tide', slot: 2 });
    const empty = fixture(); await empty.view.finishEntrance();
    empty.host.querySelector<HTMLElement>('[data-radiant-card][data-radiant-unit="ember"] .radiant-frozen-stats dd')!
      .dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }));
    const skill = empty.host.querySelector<HTMLButtonElement>('[data-radiant-fan="ember"] [data-radiant-skill="2"]')!;
    expect(skill.getAttribute('aria-disabled')).toBe('true');
    skill.click();
    await Promise.resolve();
    expect(empty.acts).not.toHaveBeenCalled();
    expect(empty.host.querySelector('[data-radiant-gesture-status]')!.textContent).toBe('Skill 2 needs 40 Luminosity; no action spent.');
  });
  it('shows signature counters on the owner card and marks on the enemy that holds them', async () => {
    // Form 1 keeps Gilded Thorn Guard below the Stage 25 enemy's Health, so the trap stays on a living enemy.
    const { view, host } = fixture(['thornia', 'razor', 'tide'], 1, undefined, 25, undefined, undefined, true);
    applyMotion('reduced'); await view.finishEntrance();
    expect(host.querySelector('[data-radiant-signatures="razor"]')!.textContent).toBe('Wounds 0');
    expect(host.querySelector('[data-radiant-signatures="thornia"]')!.textContent).toBe('Thorn Traps 0');
    await view.act('skill', 'thornia', 1);
    await vi.waitFor(() => expect(host.querySelector('[data-radiant-signatures="thornia"]')!.textContent).toBe('Thorn Traps 1'));
    expect(host.querySelector('[data-radiant-target-detail="story-25-0"] [data-radiant-effects]')!.textContent)
      .toContain('Thorn Trap · 3 charges · 3 turns');
  });
  it.each(['master-tide-3', 'master-sprout-2'] as const)('keeps %s support Convergent Light ally-targeted without a retired generated strike', async masterId => {
    const { view, host, acts } = fixture(3, 6, undefined, 25, undefined, masterId, true);
    applyMotion('reduced'); await view.finishEntrance();
    const bearer = masterId.includes('tide') ? 'tide' : 'sprout';
    await view.act('flare', bearer);
    expect(acts.mock.calls.at(-1)![0]).toEqual({ type: 'flare', bearerId: bearer });
    expect(host.querySelector('[data-radiant-error]')!.textContent).toBe('');
  });
});
describe('Battle Spectacle beats and screen tools (D-483 R2/R6, D-484)', () => {
  function spectacleEffects() {
    return { windup: vi.fn(async () => {}), impact: vi.fn(async () => {}), screen: vi.fn(), idle: vi.fn(async () => {}),
      cancel: vi.fn() };
  }
  it('times a Normal Attack with its tier beats and lands every hit inside the impact beat', async () => {
    const effects = spectacleEffects();
    const { view } = fixture(3, 6, effects); await view.finishEntrance();
    await view.act('normal', 'ember');
    const beats = (effects.windup.mock.calls[0] as unknown[])[2] as { tier: string; total: number };
    expect(beats).toMatchObject({ tier: 'normal', total: 450 });
    const hits = (effects.impact.mock.calls as unknown[][]).filter(call => call[1] && call[3]);
    expect(hits.length).toBeGreaterThan(0);
    for (const call of hits) expect((call[3] as { tier: string }).tier).toBe('normal');
    // Normal Attack: no flash, no hit-stop freeze, no dim.
    expect(effects.screen).not.toHaveBeenCalled();
    expect(effects.idle).toHaveBeenCalled();
  });
  it('gives Skill 2 a soft flash and hit-stop on its first hit only', async () => {
    const effects = spectacleEffects();
    const { view } = fixture(3, 6, effects, 25, undefined, undefined, true); await view.finishEntrance();
    await view.act('skill', 'ember', 2);
    const cues = effects.screen.mock.calls.map(call => (call as unknown[])[0]);
    expect(cues).toEqual([{ freeze: 60 }, { flash: 'soft' }]);
    const beats = (effects.windup.mock.calls[0] as unknown[])[2] as { tier: string; hits: number; hitInterval: number };
    expect(beats.tier).toBe('skill2');
    expect(beats.hitInterval * beats.hits).toBeCloseTo(450);
  });
  it('dims the field for a Convergent Light and saves the full flash for its finisher', async () => {
    const effects = spectacleEffects();
    const { view } = fixture(3, 6, effects, 25, undefined, undefined, true); await view.finishEntrance();
    await view.act('flare', 'ember');
    const cues = effects.screen.mock.calls.map(call => (call as unknown[])[0] as Record<string, unknown>);
    expect(cues[0]).toMatchObject({ dim: { alpha: .3 } });
    expect(cues.filter(cue => cue.flash === 'full')).toHaveLength(1);
    // D-490: the Sparkling finisher's hit-stop is 70 ms (Glimmering 90, Ultimate 120).
    expect(cues.filter(cue => cue.freeze === 70)).toHaveLength(1);
    const player = (effects.impact.mock.calls as unknown[][]).filter(call => call[1] && call[3]);
    expect(player.filter(call => call[4] === true)).toHaveLength(1);
    const finisher = player.find(call => call[4] === true)![0] as RadiantImpactFrame;
    expect(finisher.events.some(event => event.type === 'damage')).toBe(true);
  });
  it('runs the Convergent Light hits on the D-490 cadence: indexed hits, one gather before the finisher, one combo total', async () => {
    const effects = { ...spectacleEffects(), gather: vi.fn(async () => {}) };
    const { view, host } = fixture(3, 6, effects, 25, undefined, undefined, true); await view.finishEntrance();
    const plates: HTMLElement[] = [];
    const observer = new MutationObserver(records => { for (const record of records) for (const node of Array.from(record.addedNodes))
      if (node instanceof HTMLElement && node.classList.contains('radiant-combo')) plates.push(node); });
    observer.observe(host, { childList: true, subtree: true });
    await view.act('flare', 'ember');
    await Promise.resolve();
    observer.disconnect();
    const player = (effects.impact.mock.calls as unknown[][]).filter(call => call[1] && call[3]);
    const beats = player[0][3] as { slots: number[]; gather: number; impact: number; finisherAt: number };
    expect(player.map(call => call[5])).toEqual(player.map((_, index) => index));
    expect(beats.slots.reduce((sum, slot) => sum + slot, 0) + beats.gather).toBeCloseTo(beats.impact);
    expect(effects.gather).toHaveBeenCalledTimes(1);
    const finisherCall = effects.impact.mock.calls.findIndex(call => (call as unknown[])[4] === true);
    expect(effects.gather.mock.invocationCallOrder[0]).toBeLessThan(effects.impact.mock.invocationCallOrder[finisherCall]);
    expect((effects.gather.mock.calls[0] as unknown[])[3]).toBe(beats);
    // The combo plate counts the Convergent Light's own damaging hits and ends on their exact total.
    const flareHits = player.map(call => (call[0] as RadiantImpactFrame).events.reduce((sum, event) => sum +
      (event.type === 'damage' && event.source.kind === 'flare' ? event.healthLoss + event.absorbed : 0), 0)).filter(amount => amount > 0);
    expect(plates).toHaveLength(1);
    expect(plates[0].classList.contains('is-final')).toBe(true);
    expect(plates[0].querySelector('.radiant-combo-count')!.textContent).toBe(String(flareHits.length));
    expect(plates[0].querySelector('.radiant-combo-total')!.textContent)
      .toBe(flareHits.reduce((sum, amount) => sum + amount, 0).toLocaleString('en-US'));
    expect(host.querySelector('.radiant-combo')).toBeNull();
  });
  it('gives a support Convergent Light a soft finisher flash with no hit-stop and no combo plate', async () => {
    const effects = spectacleEffects();
    const { view, host } = fixture(['tide', 'ember', 'sprout'], 6, effects, 25, undefined, undefined, true); await view.finishEntrance();
    await view.act('flare', 'tide');
    const cues = effects.screen.mock.calls.map(call => (call as unknown[])[0] as Record<string, unknown>);
    expect(cues.some(cue => cue.freeze)).toBe(false);
    expect(cues.filter(cue => cue.flash === 'full')).toHaveLength(0);
    expect(cues.filter(cue => cue.flash === 'soft')).toHaveLength(1);
    expect(host.querySelector('.radiant-combo')).toBeNull();
  });
  it('shows one static element ring and the number per impact under Reduce motion, gone within 200 ms', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      const { view, host } = fixture(); applyMotion('reduced'); await view.finishEntrance();
      await view.act('normal', 'ember');
      const ring = host.querySelector<HTMLElement>('.radiant-static-ring');
      expect(ring).not.toBeNull();
      expect(ring!.style.getPropertyValue('--ring')).toBe('#ff8a5c');
      expect(host.querySelector('.radiant-number.is-static')).not.toBeNull();
      expect(host.querySelector('.radiant-orb')).toBeNull();
      await vi.advanceTimersByTimeAsync(200);
      expect(host.querySelector('.radiant-static-ring, .radiant-number')).toBeNull();
    } finally { vi.useRealTimers(); }
  });
  it('shows one static combo total for a Convergent Light under Reduce motion and no cut-in', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      const { view, host } = fixture(3, 6, undefined, 25, undefined, undefined, true); applyMotion('reduced'); await view.finishEntrance();
      await view.act('flare', 'ember');
      expect(host.querySelectorAll('.radiant-combo.is-static.is-final')).toHaveLength(1);
      expect(host.querySelector('.portrait-cutin')).toBeNull();
      await vi.advanceTimersByTimeAsync(200);
      expect(host.querySelector('.radiant-combo')).toBeNull();
    } finally { vi.useRealTimers(); }
  });
});
