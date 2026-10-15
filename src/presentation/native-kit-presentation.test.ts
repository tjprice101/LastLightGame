// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nativeIdentities, nativeIdentityIds } from '../content/native-identities';
import { resolveFighter, type ActionId } from '../content/combat';
import type { StarterId } from '../content/starters';
import { createBattle, type BattleEvent } from '../game/battle';
import { BattleView, createSession, type BattleAuthority } from './battle-view';
import { allyTargetCandidates, allyTargetHint, nativeIdentityReference, nativeStateReadout, needsAllyTarget } from './native-kit-presentation';
import { nativeMechanicCue } from './battle-effects';
import { attackEffectTargets, healthSnapshot } from './battle-health';
import { gestureGuide, updateGestureGuide } from './gesture-guide';
import { kitResource } from './ability-status';
import { unitReadout } from './unit-readout';
import { createCreatureCopy } from '../game/character-instances';

const nativeHelpers = vi.hoisted(() => ({
  nativeReadout: vi.fn((): { label: string; value: string; description: string }[] => []),
  nativeForecast: vi.fn((): string[] => []),
}));
vi.mock('../game/native-kits', async importOriginal => ({
  ...await importOriginal<typeof import('../game/native-kits')>(), ...nativeHelpers,
}));
vi.mock('./settings', () => ({ reducedMotion: () => true }));
vi.mock('../vfx/battle-vfx-runner', () => ({ BattleVFXRunner: class { destroy() {} } }));

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true, value: function (this: HTMLDialogElement) { this.open = true; },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true, value: function (this: HTMLDialogElement) {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    },
  });
  Object.defineProperty(Element.prototype, 'animate', {
    configurable: true, value: () => ({ finished: Promise.resolve(), playbackRate: 1, cancel: vi.fn() }),
  });
  nativeHelpers.nativeReadout.mockReturnValue([]);
  nativeHelpers.nativeForecast.mockReturnValue([]);
});

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
  Reflect.deleteProperty(Element.prototype, 'animate');
});

function fixture(id: StarterId, action: ActionId = 'skill2', solo = false, offline = false) {
  const ids = solo ? [id] : [id, 'ember', 'sprout'].filter((value, index, all) => all.indexOf(value) === index);
  const progress = Object.fromEntries(ids.map(value => [value, { level: 10, evolution: 1 }]));
  const session = createSession(id, { level: 10, evolution: 1 }, undefined, { ids, progress });
  session.entrancePending = false;
  session.state.allies.forEach(unit => {
    unit.kit = resolveFighter(unit.definitionId as StarterId, { level: 10, evolution: 1 });
    unit.shatter = 100;
  });
  const host = document.createElement('div');
  document.body.append(host);
  const response = { session: { ...session }, result: { state: session.state, events: [] } };
  const authority: BattleAuthority = {
    action: vi.fn(async () => response), endTurn: vi.fn(), nextStage: vi.fn(), nextWave: vi.fn(), retry: vi.fn(),
  };
  const commit = vi.fn();
  const view = new BattleView(host, session, { nextAlly: 'KeyC', nextTarget: 'KeyT' }, commit, undefined, offline ? undefined : authority);
  const open = () => {
    host.querySelector<HTMLButtonElement>('#open-battle-menu')!.click();
    host.querySelector<HTMLButtonElement>(`[data-action="${action}"]`)!.click();
  };
  const pick = (targetId: string) => document.querySelector<HTMLButtonElement>(`.native-ally-picker button[value="${targetId}"]`)!.click();
  return { session, host, view, authority, commit, open, pick };
}

function pointer(button: HTMLElement, type: string, x: number, y = 100) {
  const event = new MouseEvent(type, { bubbles: true, button: 0, clientX: x, clientY: y });
  Object.defineProperties(event, { pointerId: { value: 1 }, isPrimary: { value: true } });
  button.dispatchEvent(event);
}

describe('native ally targeting', () => {
  it.each([
    ['tide', 'skill2'], ['bruno', 'skill2'], ['disciple', 'skill1'], ['disciple', 'skill2'],
  ] as const)('requires a recipient before %s %s dispatches from Battle menu', async (id, action) => {
    const f = fixture(id, action);
    try {
      const enemyTarget = f.host.querySelector('.battle-footer-target small')!.textContent;
      f.open();
      expect(document.querySelector<HTMLDialogElement>('.native-ally-picker')?.open).toBe(true);
      expect(f.authority.action).not.toHaveBeenCalled();
      expect(document.querySelector('.native-ally-picker')?.textContent).toContain('Enemy target is unchanged');
      expect(f.host.querySelector('[data-action="' + action + '"]')?.textContent).toContain('Choose');
      f.pick('ember');
      await vi.waitFor(() => expect(f.authority.action).toHaveBeenCalledExactlyOnceWith(id, action, 'ember'));
      expect(f.commit).not.toHaveBeenCalled();
      expect(f.host.querySelector('.battle-footer-target small')!.textContent).toBe(enemyTarget);
    } finally { f.view.destroy(); }
  });

  it.each(['cancel', 'escape', 'destroy'])('cancels via %s without spending or contacting authority', async mode => {
    const f = fixture('tide');
    try {
      const before = structuredClone(f.session.state);
      f.open();
      if (mode === 'cancel') f.pick('');
      else if (mode === 'escape') document.querySelector('.native-ally-picker')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      else f.view.destroy();
      await Promise.resolve();
      expect(f.authority.action).not.toHaveBeenCalled();
      expect(f.commit).not.toHaveBeenCalled();
      expect(f.session.state).toEqual(before);
      expect(document.querySelector('.native-ally-picker')).toBeNull();
      if (mode !== 'destroy') expect(document.activeElement).toBe(f.host.querySelector('[data-unit="tide"]'));
    } finally { f.view.destroy(); }
  });

  it('excludes self and defeated allies for Cover, but explicitly offers self in solo', async () => {
    const f = fixture('bruno');
    try {
      f.session.state.allies.find(unit => unit.id === 'sprout')!.hp = 0;
      f.open();
      const choices = document.querySelectorAll('.native-ally-choices button');
      expect(Array.from(choices).map(button => (button as HTMLButtonElement).value)).toEqual(['ember']);
      f.pick('');
      await Promise.resolve();
    } finally { f.view.destroy(); f.host.remove(); }
    const solo = fixture('bruno', 'skill2', true);
    try {
      solo.open();
      expect(document.querySelector('.native-ally-choices')?.textContent).toContain('Self');
      solo.pick('bruno');
      await vi.waitFor(() => expect(solo.authority.action).toHaveBeenCalledExactlyOnceWith('bruno', 'skill2', 'bruno'));
    } finally { solo.view.destroy(); }
  });

  it('routes held gestures through the same picker and ignores concurrent commands', async () => {
    const f = fixture('disciple', 'skill1');
    try {
      const button = f.host.querySelector<HTMLButtonElement>('[data-unit="disciple"]')!;
      button.setPointerCapture = vi.fn();
      button.hasPointerCapture = () => true;
      button.releasePointerCapture = vi.fn();
      pointer(button, 'pointerdown', 100);
      pointer(button, 'pointermove', 60);
      expect(f.host.querySelector('.gesture-status')?.textContent).toContain('Release to choose recipient');
      pointer(button, 'pointerup', 60);
      button.click();
      expect(document.querySelector('.native-ally-picker')).not.toBeNull();
      pointer(button, 'pointerdown', 100);
      expect(f.host.querySelector('.gesture-choice')).toBeNull();
      f.host.querySelector<HTMLButtonElement>('[data-action="light"]')!.click();
      expect(f.authority.action).not.toHaveBeenCalled();
      f.pick('sprout');
      await vi.waitFor(() => expect(f.authority.action).toHaveBeenCalledExactlyOnceWith('disciple', 'skill1', 'sprout'));
    } finally { f.view.destroy(); }
  });

  it('does not apply ally targeting to captured or historical kits', () => {
    const state = createBattle(1);
    const actor = state.allies[0];
    actor.kit = resolveFighter('tide', { level: 0, evolution: 1 });
    actor.kit.nativeIdentity = undefined;
    expect(needsAllyTarget(actor, 'skill2')).toBe(false);
    expect(allyTargetCandidates(state, actor, 'skill2')).toEqual([]);
    actor.kit.nativeIdentity = true;
    const captured = { ...actor, captured: createCreatureCopy('infusion:heavens:0') };
    expect(needsAllyTarget(captured, 'skill2')).toBe(false);
    expect(allyTargetCandidates(state, captured, 'skill2')).toEqual([]);
  });

  it('commits one local action only after selection without changing the enemy target', async () => {
    const f = fixture('tide', 'skill2', false, true);
    try {
      const enemyTarget = f.host.querySelector('.battle-footer-target small')!.textContent;
      f.open();
      expect(f.commit).not.toHaveBeenCalled();
      expect(f.session.state.allies[0].shatter).toBe(100);
      f.pick('ember');
      await vi.waitFor(() => expect(f.commit).toHaveBeenCalledOnce());
      expect(f.session.state.allies[0].shatter).toBe(60);
      expect(f.session.state.allies[0].spent).toBe(true);
      expect(f.session.state.allies.find(ally => ally.id === 'ember')!.shield).toBeGreaterThan(0);
      expect(f.session.state.allies.find(ally => ally.id === 'sprout')!.shield).toBe(0);
      expect(f.host.querySelector('.battle-footer-target small')!.textContent).toBe(enemyTarget);
      expect(f.authority.action).not.toHaveBeenCalled();
    } finally { f.view.destroy(); }
  });
});

describe('native identities and state widgets', () => {
  it.each(nativeIdentityIds)('explains %s role and loop without retired charge instructions', id => {
    const state = createBattle(1, [id]);
    const actor = state.allies[0];
    actor.kit = resolveFighter(id, { level: 0, evolution: 1 });
    expect(nativeIdentityReference(actor)).toContain(nativeIdentities[id].role.replace(/&/g, '&amp;'));
    const summary = kitResource(actor.kit, id);
    expect(summary).toContain(nativeIdentities[id].playLoop);
    expect(summary).not.toContain('Up to 3 charges');
  });

  it('renders actual readout and forecasts in field and reference; no widgets for empty state', () => {
    const state = createBattle(1);
    const actor = state.allies[0];
    actor.kit = resolveFighter('ember', { level: 0, evolution: 1 });
    expect(nativeStateReadout(state, actor)).toBe('');
    nativeHelpers.nativeReadout.mockReturnValue([{ label: 'Personal Burn', value: 'Goblin: 2 phases', description: '25 damage per enemy phase <stored>' }]);
    nativeHelpers.nativeForecast.mockReturnValue(['Goblin: <special> due phase 3']);
    for (const compact of [true, false]) {
      const html = unitReadout(actor, compact, state.allies, state.round, state);
      expect(html).toContain('Goblin: 2 phases');
      expect(html).toContain('&lt;stored&gt;');
      expect(html).toContain('due phase 3');
      expect(html).not.toContain('charges');
    }
    actor.hp = 0;
    expect(nativeStateReadout(state, actor)).toBe('');
  });

  it('keeps one-ally shield VFX on the selected recipient rather than implying a team shield', () => {
    const state = createBattle(1, ['tide', 'ember', 'sprout']);
    const actor = state.allies[0];
    actor.kit = resolveFighter('tide', { level: 0, evolution: 1 });
    const event = { kind: 'attack', source: 'tide', target: 'ember', action: 'skill2', amount: 0, message: '' } as BattleEvent;
    expect(attackEffectTargets(event, [], state.allies, healthSnapshot(state.allies))).toEqual(['ember']);
    expect(allyTargetHint(actor, 'skill2')).toContain('next enemy phase');
    const guide = document.createElement('span');
    guide.innerHTML = gestureGuide(state, actor);
    updateGestureGuide(guide, state, actor, 'skill2');
    expect(guide.textContent).toContain('Choose ally');
  });
});

describe('mechanics-specific native cues', () => {
  it.each(['burn', 'detonation', 'cyclone', 'recall', 'revenge', 'trap', 'demolition', 'redirect'] as const)(
    'identifies %s follow-ups without implying another primary action', nativeKind => {
      const state = createBattle(1);
      const actor = state.allies[0];
      actor.kit = resolveFighter('ember', { level: 0, evolution: 1 });
      const event = { kind: 'damage', source: actor.id, target: 'enemy-1-0', amount: 2, message: '', origin: 'native', nativeKind } as BattleEvent;
      expect(nativeMechanicCue(actor, event)?.label).toBeTruthy();
      expect(nativeMechanicCue(actor, { ...event, origin: 'conduit' })).toBeNull();
    });

  it('distinguishes Gold and Crimson in text, not only color', () => {
    const actor = createBattle(1, ['crinso']).allies[0];
    actor.kit = resolveFighter('crinso', { level: 0, evolution: 1 });
    const event = { kind: 'attack', source: actor.id, target: 'enemy-1-0', amount: 0, message: '', action: 'skill1' } as BattleEvent;
    expect(nativeMechanicCue(actor, event)?.label).toBe('Gold edge');
    expect(nativeMechanicCue(actor, { ...event, action: 'skill2' })?.label).toBe('Crimson edge');
  });

  it('shows typed native interception even when the hostile attacker remains the damage source', () => {
    const enemy = createBattle(1).enemies[0];
    const event = { kind: 'damage', source: enemy.id, target: 'bruno', amount: 5, message: '',
      origin: 'native', nativeKind: 'redirect' } as BattleEvent;
    expect(nativeMechanicCue(enemy, event)?.label).toBe('Cover interception');
    expect(nativeMechanicCue(enemy, { ...event, origin: 'conduit' })).toBeNull();
  });
});
