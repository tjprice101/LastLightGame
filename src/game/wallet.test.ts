import { describe, expect, it } from 'vitest';
import { act, createBattle, endTurn, type BattleResult } from './battle';
import { loadFractalis, saveBattleRewards, WALLET_KEY } from './wallet';
import { type ProfileStorage } from './profile';

function storage(): ProfileStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
}

function kill(seed = 1): BattleResult {
  const state = createBattle(seed);
  state.enemies[0].hp = 1;
  return act(state, 'ember', 'light', state.enemies[0].id);
}

describe('enemy Prismatica drops', () => {
  it('awards inclusive integer 5-10 drops with reproducible independent reward randomness', () => {
    const amounts = new Set<number>();
    for (let seed = 1; seed <= 100; seed++) {
      const result = kill(seed * 10007);
      const drops = result.events.filter((event) => event.kind === 'reward');
      expect(drops).toHaveLength(1);
      expect(Number.isInteger(drops[0].amount)).toBe(true);
      expect(drops[0].amount).toBeGreaterThanOrEqual(5);
      expect(drops[0].amount).toBeLessThanOrEqual(10);
      amounts.add(drops[0].amount);
    }
    expect([...amounts].sort((a, b) => a - b)).toEqual([5, 6, 7, 8, 9, 10]);
    expect(kill(12345)).toEqual(kill(12345));
    const state = createBattle(12345);
    const ordinary = act(state, 'ember', 'light', state.enemies[0].id);
    expect(ordinary.events.some((event) => event.kind === 'reward')).toBe(false);
    expect(ordinary.state.seed).toBe(kill(12345).state.seed);
  });
  it('awards every ultimate/burn kill once, never dead enemies or defeated allies', () => {
    const state = createBattle();
    state.allies[0].shatter = 100;
    state.enemies.forEach((enemy) => { enemy.hp = 1; });
    const result = act(state, 'ember', 'ultimate', state.enemies[0].id);
    expect(result.events.filter((event) => event.kind === 'reward')).toHaveLength(3);
    const burning = createBattle();
    burning.enemies[0].hp = 1;
    burning.enemies[0].burn = { damage: 8, turns: 1 };
    const burned = endTurn(burning);
    expect(burned.events.filter((event) => event.kind === 'reward')).toHaveLength(1);
    expect(endTurn(burned.state).events.some((event) => event.kind === 'reward')).toBe(false);
    const death = createBattle();
    death.allies[0].hp = 1;
    expect(endTurn(death).events.some((event) => event.kind === 'reward')).toBe(false);
  });
});

describe('local Prismatica wallet', () => {
  it('starts at zero and persists accumulated rewards across battle restarts', () => {
    const saved = storage();
    expect(loadFractalis(saved)).toBe(0);
    const result = kill();
    const amount = result.events.find((event) => event.kind === 'reward')?.amount;
    expect(saveBattleRewards(saved, result)).toBe(amount);
    expect(loadFractalis(saved)).toBe(amount);
    const next = kill(2);
    const extra = next.events.find((event) => event.kind === 'reward')?.amount;
    expect(saveBattleRewards(saved, next)).toBe((amount ?? 0) + (extra ?? 0));
    const balance = loadFractalis(saved);
    expect(saveBattleRewards(saved, endTurn(createBattle()))).toBe(balance);
  });
  it.each(['{', '{}', '{"version":2,"fractalis":5}', '{"version":1,"fractalis":-1}', '{"version":1,"fractalis":1.5}'])('preserves invalid wallet %s', (raw) => {
    const saved = storage();
    saved.setItem(WALLET_KEY, raw);
    expect(() => saveBattleRewards(saved, kill())).toThrow();
    expect(saved.getItem(WALLET_KEY)).toBe(raw);
  });
  it('rejects overflow and failed writes without changing the balance', () => {
    const saved = storage();
    saved.setItem(WALLET_KEY, JSON.stringify({ version: 1, fractalis: Number.MAX_SAFE_INTEGER }));
    expect(() => saveBattleRewards(saved, kill())).toThrow('maximum');
    expect(loadFractalis(saved)).toBe(Number.MAX_SAFE_INTEGER);
    saved.setItem(WALLET_KEY, '{"version":1,"fractalis":0}');
    saved.setItem = () => { throw new Error('Storage denied'); };
    expect(() => saveBattleRewards(saved, kill())).toThrow('Storage denied');
    expect(loadFractalis(saved)).toBe(0);
  });
});
