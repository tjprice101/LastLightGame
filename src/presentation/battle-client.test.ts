// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('./battle-screen', () => ({
  RadiantBattleView: class {
    constructor(private readonly host: HTMLElement, private readonly session: { finishEntrance(): void }) {
      this.host.innerHTML = '<section class="radiant-battle"></section>';
    }
    async finishEntrance() { this.session.finishEntrance(); }
    dispose() {}
    render() {}
  },
}));
vi.mock('../vfx/battle-effects', () => ({
  RadiantCanvasEffects: class {},
}));
vi.mock('./game-dialog', () => ({
  gameConfirm: vi.fn(async () => true),
  escapeDialogText: (value: string) => value,
}));

import { freshGame } from '../../supabase/functions/game-operation/engine';
import { releasedRadiantIds } from '../content/combat-kits';
import { createCreatureCopy } from '../game/character-instances';
import { resolveRadiantPreparation, type RadiantPreparationRequest } from '../online/battle-preparation';
import { resolveRadiantRun, type RadiantRunRequest, type RadiantRunSnapshot,
  type RadiantRunAuthority } from '../online/battle-run';
import { RadiantSession } from '../online/battle-session';
import { RadiantClient, type RadiantClientDependencies } from './battle-client';

let serial = 0;
const uuid = () => `00000000-0000-4000-8000-${(++serial).toString(16).padStart(12, '0')}`;
const clients: RadiantClient[] = [];

function fixture(authorize: () => Promise<void> = vi.fn(async () => {})) {
  const game = freshGame('radiant-client');
  game.starterId = 'ember';
  game.account.storyCompleted = 0;
  for (const id of releasedRadiantIds.slice(0, 2))
    game.account.characters[id] = { level: 0, evolution: 1, weaponRank: 0 };
  game.account.squad = ['ember'];
  const copy = createCreatureCopy('infusion:heavens:0');
  game.account.capturedCharacters = [copy];
  let snapshot: RadiantRunSnapshot = { revision: 0, state: game };
  const authority: RadiantRunAuthority = {
    capability: 'isolated-radiant-study',
    now: Date.UTC(2026, 10, 8),
    entry: () => ({ runId: uuid(), encounterSeed: 1729, chargeSeed: 7, targetSeed: 104729 }),
  };
  const transport = {
    read: vi.fn(async () => ({ revision: snapshot.revision, account: structuredClone(snapshot.state.account),
      run: structuredClone(snapshot.state.radiantStudy ?? null) })),
    prepare: vi.fn(async (request: RadiantPreparationRequest) => {
      const result = resolveRadiantPreparation(snapshot, request);
      snapshot = { revision: result.response.revision, state: result.state };
      return result.response;
    }),
    execute: vi.fn(async (request: RadiantRunRequest) => {
      const result = resolveRadiantRun(snapshot, request, authority);
      snapshot = { revision: result.response.revision, state: result.state };
      return result.response;
    }),
  };
  const initial = { revision: snapshot.revision, account: structuredClone(snapshot.state.account), run: null };
  const dependencies: RadiantClientDependencies = {
    authorize,
    read: vi.fn(async () => structuredClone(initial)),
    createSession: checkpoint => new RadiantSession(checkpoint, transport, uuid),
  };
  const host = document.createElement('main');
  document.body.append(host);
  const navigate = vi.fn();
  const client = new RadiantClient(host, vi.fn(), () => authority.now, navigate, dependencies);
  clients.push(client);
  return { client, host, dependencies, transport, navigate, copy, snapshot: () => structuredClone(snapshot) };
}

afterEach(() => {
  for (const client of clients.splice(0)) client.dispose();
  document.body.replaceChildren();
});

describe('authenticated Radiant client route', () => {
  it('does not read or render account data when authentication is unavailable', async () => {
    const state = fixture(async () => { throw new Error('Sign-in expired.'); });
    await state.client.ready();
    expect(state.dependencies.read).not.toHaveBeenCalled();
    expect(state.host.querySelector('[role="alert"]')?.textContent).toBe('Sign-in expired.');
    expect(state.host.querySelector('[data-radiant-anchor]')).toBeNull();
  });

  it('lists only unlocked activity, routes existing captured holdings, and saves manual bearer squad selection', async () => {
    const state = fixture();
    await state.client.ready();
    const activityOptions = Array.from(state.host.querySelectorAll<HTMLOptionElement>('[data-radiant-anchor] option'));
    expect(activityOptions.some(option => option.textContent?.includes('Story · Stage 1'))).toBe(true);
    expect(activityOptions.some(option => option.textContent?.includes('Story · Stage 2'))).toBe(false);

    state.host.querySelector<HTMLButtonElement>('[data-radiant-tab="holdings"]')!.click();
    expect(state.host.textContent).toContain(state.copy.instanceId);
    expect(state.host.querySelector('[data-radiant-nav="creatures"]')).not.toBeNull();
    state.host.querySelector<HTMLButtonElement>('[data-radiant-tab="prepare"]')!.click();
    const member = state.host.querySelector<HTMLSelectElement>('[aria-label="Member 2"]')!;
    member.value = releasedRadiantIds[1];
    state.host.querySelector<HTMLFormElement>('[data-radiant-squad-form]')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await vi.waitFor(() => expect(state.snapshot().state.account.squad).toEqual(['ember', releasedRadiantIds[1]]));
    await vi.waitFor(async () => expect(await state.client.beforeLeave()).toBe(true));
    expect(state.transport.prepare).toHaveBeenCalledTimes(1);
    expect(state.snapshot().state.account.capturedCharacters).toEqual([state.copy]);

    state.host.querySelector<HTMLButtonElement>('[data-radiant-nav="bearers"]')!.click();
    expect(state.navigate).toHaveBeenCalledWith('bearers');
    expect(await state.client.beforeLeave()).toBe(true);
  });

  it('enters through a saved authority receipt and commits the explicit exit', async () => {
    const state = fixture();
    await state.client.ready();
    state.host.querySelector<HTMLButtonElement>('[data-radiant-start]')!.click();
    await vi.waitFor(() => expect(state.snapshot().state.radiantStudy?.encounter).toBe(1));
    await vi.waitFor(() => expect(state.host.querySelector('.radiant-battle')).not.toBeNull());
    expect(state.transport.execute).toHaveBeenCalledTimes(1);
    expect(state.host.querySelector('.radiant-client')).toBeNull();
    expect(state.host.querySelector('.radiant-battle')).not.toBeNull();

    expect(await state.client.beforeLeave()).toBe(true);
    expect(state.snapshot().state.radiantStudy).toBeUndefined();
    expect(state.transport.execute).toHaveBeenCalledTimes(2);
  });
});
