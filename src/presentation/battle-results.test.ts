import { afterEach, describe, expect, it, vi } from 'vitest';
import { battleResults, encounterRewards } from './battle-results';
import { BattleView } from './battle-view';
import { act, createBattle, createDungeonBattle, createInfusionBattle, endTurn, nextWave, type BattleEvent } from '../game/battle';

afterEach(() => vi.unstubAllGlobals());
const reward = (source: string, amount: number, materials: Record<string, number> = {}): BattleEvent => ({
  kind: 'reward', source, target: '', amount, materials, critical: false, message: 'Earned loot',
});

describe('encounter result overlays', () => {
  it('aggregates all actual per-kill rewards once, independently of truncated logs and without mutating events', () => {
    const events = [reward('one', 7, { 'infernic-common': 2 }), reward('two', 9, { 'infernic-common': 1, 'heavens-weapon': 4 })];
    const before = structuredClone(events);
    const rewards = encounterRewards([...events, events[0]]);
    expect(rewards.map(({ id, amount }) => ({ id, amount }))).toEqual([
      { id: 'fractalis', amount: 16 }, { id: 'infernic-common', amount: 3 }, { id: 'heavens-weapon', amount: 4 },
    ]);
    expect(events).toEqual(before);
    const state = createDungeonBattle('infernic', 1, 1729, 'ember', { level: 105, evolution: 6 });
    state.phase = 'cleared';
    const html = battleResults(state, events);
    expect(html).toContain('Victory!');
    expect(html).toContain('+16');
    expect(html).toContain('assets/currencies/fractalis.png');
    expect(html).not.toContain('assets/materials/fractalis.png');
    expect(html).toContain('Seed of Infernic');
    expect(html).toContain('already saved');
    expect(html).toContain('data-result-continue');
    expect(html).toContain('data-result-quit');
    expect(html).toContain('data-result-dismiss');
    expect(html).not.toContain('data-result-restart');
  });

  it('shows Victory only for cleared encounters, including burn kills; never on ordinary turns', () => {
    const state = createBattle(1729, ['ember'], { ember: { level: 105, evolution: 6 } });
    expect(battleResults(state, [])).toBe('');
    state.allies[0].shatter = 100;
    state.enemies.forEach((enemy) => { enemy.hp = 1; });
    const result = act(state, 'ember', 'skill2', state.enemies[0].id);
    expect(result.state.phase).toBe('cleared');
    expect(encounterRewards(result.events)[0].amount).toBe(result.events.filter((event) => event.kind === 'reward').reduce((sum, event) => sum + event.amount, 0));
    expect(battleResults(result.state, result.events)).toContain('Next wave');
    expect(battleResults(result.state, result.events)).toContain('Health, Gauge and recovery carry');
    state.enemies.forEach((enemy) => { enemy.burn = { damage: 8, turns: 1 }; });
    const burned = endTurn(state);
    expect(burned.state.phase).toBe('cleared');
    expect(encounterRewards(burned.events)[0].amount).toBeGreaterThan(0);
  });

  it('does not offer invalid continuation at final stages and keeps defeat earnings with retry/quit options', () => {
    const finalStates = [createDungeonBattle('infernic', 35, 1, 'ember', { level: 105, evolution: 6 }),
      createInfusionBattle('abyss', 35, 1, 'ember', { level: 105, evolution: 6 })];
    for (const state of finalStates) {
      state.phase = 'cleared';
      const html = battleResults(state, []);
      expect(html).toContain('Activity complete');
      expect(html).toContain('Return to Gameplay');
      expect(html).not.toContain('data-result-continue');
    }
    const state = createBattle();
    state.phase = 'defeat';
    const html = battleResults(state, [reward('one', 8)]);
    expect(html).toContain('Defeat');
    expect(html).toContain('+8');
    expect(html).toContain('data-result-restart');
    expect(html).not.toContain('data-result-continue');
    expect(battleResults(state, [])).toContain('No enemy rewards');
  });

  it('waits for the final death/loot presentation before rendering Victory and retains rewards across actions for Adventure', async () => {
    vi.stubGlobal('document', { documentElement: { dataset: { motion: 'reduced' } } });
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    const state = createBattle(1729, ['ember'], { ember: { level: 105, evolution: 6 } });
    state.enemies.forEach((enemy) => { enemy.hp = 1; });
    const view = Object.create(BattleView.prototype);
    const session = { state, stageEvents: [], log: [], resultsVisible: false };
    Object.assign(view, { session, disposed: false, host: { setAttribute: vi.fn(), querySelectorAll: () => [], querySelector: () => null },
      render: vi.fn(), animate: vi.fn(async () => {}), focusResults: vi.fn(), showTurnCue: vi.fn(), enterEncounter: vi.fn(async () => {}) });
    const present = Reflect.get(BattleView.prototype, 'present');
    const first = act(state, 'ember', 'light', state.enemies[0].id);
    await Reflect.apply(present, view, [first]);
    expect(session.stageEvents).toEqual(first.events);
    expect(view.focusResults).not.toHaveBeenCalled();
    first.state.allies[0].spent = false;
    first.state.allies[0].shatter = 100;
    const final = act(first.state, 'ember', 'skill2', first.state.enemies[1].id);
    let finish = () => {};
    const pending = new Promise<void>((resolve) => { finish = resolve; });
    view.animate = vi.fn(() => pending);
    view.render.mockClear();
    const presentation = Reflect.apply(present, view, [final]);
    expect(view.render).not.toHaveBeenCalled();
    expect(view.busy).toBe(true);
    finish();
    await presentation;
    expect(view.render).toHaveBeenCalledOnce();
    expect(view.host.setAttribute).toHaveBeenLastCalledWith('aria-busy', 'false');
    expect(view.focusResults).toHaveBeenCalledOnce();
    expect(encounterRewards(session.stageEvents)[0].amount).toBe(
      [...first.events, ...final.events].filter((event) => event.kind === 'reward').reduce((sum, event) => sum + event.amount, 0));
    expect(session.resultsVisible).toBe(true);
    view.animate = vi.fn(async () => {});
    await Reflect.apply(present, view, [nextWave(final.state), true]);
    expect(encounterRewards(session.stageEvents)).toEqual([]);
  });
});
