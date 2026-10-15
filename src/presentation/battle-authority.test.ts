import { describe, expect, it, vi } from 'vitest';
import * as battle from '../game/battle';
import { BattleView, createSession, type BattleAuthority, type BattleAuthorityResponse } from './battle-view';

function authorityView(authority: BattleAuthority) {
  const session = createSession('ember');
  const announcement = { textContent: '' };
  const host = { setAttribute: vi.fn(), querySelectorAll: () => [], querySelector: () => announcement };
  const view = Object.create(BattleView.prototype);
  const present = vi.fn(async (response: BattleAuthorityResponse) => { Object.assign(session, response.session); });
  Object.assign(view, { host, session, authority, actorId: 'ember', targetId: session.state.enemies[0].id,
    busy: false, disposed: false, dragging: false, commitRewards: vi.fn(),
    presentAuthoritative: present, render: vi.fn(), error: vi.fn() });
  return { view, session, present };
}

function transport(action: BattleAuthority['action']): BattleAuthority {
  return { action, endTurn: vi.fn(), nextStage: vi.fn(), nextWave: vi.fn(), retry: vi.fn() };
}

describe('server-authoritative battle presentation', () => {
  it('awaits the server without local combat or rewards, then presents only its committed result', async () => {
    let finish!: (response: BattleAuthorityResponse) => void;
    const action = vi.fn(() => new Promise<BattleAuthorityResponse>((resolve) => { finish = resolve; }));
    const { view, session, present } = authorityView(transport(action));
    const before = structuredClone(session);
    const simulate = vi.spyOn(battle, 'actAndAdvanceTurn');
    try {
      Reflect.apply(Reflect.get(BattleView.prototype, 'command'), view, ['light']);
      expect(action).toHaveBeenCalledWith('ember', 'light', before.state.enemies[0].id);
      expect(simulate).not.toHaveBeenCalled();
      expect(view.commitRewards).not.toHaveBeenCalled();
      expect(present).not.toHaveBeenCalled();
      expect(view.host.querySelector().textContent).toContain('Waiting for the server');
      expect(session).toEqual(before);
      const committed = structuredClone(session);
      committed.state.enemies[0].hp = 1;
      const result = { state: committed.state, events: [] };
      finish({ session: committed, result });
      await vi.waitFor(() => expect(present).toHaveBeenCalledWith({ session: committed, result }, result));
      expect(session.state.enemies[0].hp).toBe(1);
    } finally { simulate.mockRestore(); }
  });

  it('preserves the previous state and unlocks controls when the server rejects an action', async () => {
    const { view, session, present } = authorityView(transport(vi.fn(async () => { throw new Error('Server rejected action'); })));
    const before = structuredClone(session);
    await Reflect.apply(Reflect.get(BattleView.prototype, 'authoritativeCommand'), view, ['skill1']);
    expect(session).toEqual(before);
    expect(present).not.toHaveBeenCalled();
    expect(view.commitRewards).not.toHaveBeenCalled();
    expect(view.error).toHaveBeenCalledWith('Server rejected action');
    expect(view.busy).toBe(false);
  });

  it('does not automatically simulate unavailable turns in an online run', () => {
    const { view } = authorityView(transport(vi.fn()));
    const advance = vi.spyOn(battle, 'advanceUnavailableTurns');
    try {
      Reflect.apply(Reflect.get(BattleView.prototype, 'advanceIdleTurn'), view, []);
      expect(advance).not.toHaveBeenCalled();
    } finally { advance.mockRestore(); }
  });
});
