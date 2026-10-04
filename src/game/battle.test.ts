import { describe, expect, it } from 'vitest';
import { enemies, fighters, type ActionId } from '../content/combat';
import { starters } from '../content/starters';
import { act, actionUnavailable, createBattle, damageAmount, endTurn, nextWave, type BattleState } from './battle';

function controlled(): BattleState {
  const state = createBattle(12345, ['ember', 'tide', 'sprout']);
  state.allies.forEach((unit) => { unit.shatter = 100; });
  for (const unit of [...state.allies, ...state.enemies]) unit.stats.crit = 0;
  for (const enemy of state.enemies) { enemy.hp = 2000; enemy.stats.health = 2000; }
  return state;
}
function use(state: BattleState, id: string, action: ActionId): BattleState {
  return act(state, id, action, state.enemies[0].id).state;
}

describe('Adventure damage and turns', () => {
  it('uses flat defense, rounding before reduction, 150% crits, and a one-damage floor', () => {
    expect(damageAmount(38, 1, 5, false)).toBe(33);
    expect(damageAmount(38, 1.8, 5, false)).toBe(63);
    expect(damageAmount(38, 1, 5, true)).toBe(52);
    expect(damageAmount(1, 1, 500, false)).toBe(1);
    expect(() => damageAmount(-1, 1, 0, false)).toThrow('Invalid damage');
    expect(() => damageAmount(NaN, 1, 0, false)).toThrow('Invalid damage');
  });
  it('allows one action per character, including support, without mutating inputs', () => {
    const state = controlled();
    const original = structuredClone(state);
    const result = act(state, 'ember', 'light', state.enemies[0].id);
    expect(state).toEqual(original);
    expect(result.state.enemies[0].hp).toBe(1967);
    expect(() => use(result.state, 'ember', 'skill1')).toThrow('already acted');
    const supported = use(result.state, 'tide', 'skill2');
    expect(() => use(supported, 'tide', 'light')).toThrow('already acted');
    expect(supported.allies[2].spent).toBe(false);
  });
  it('Last Flare blocks exactly the next full turn', () => {
    let state = use(controlled(), 'ember', 'ultimate');
    expect(state.round).toBe(1);
    expect(state.allies[0].recoverThrough).toBe(2);
    state = endTurn(state).state;
    expect(state.round).toBe(2);
    for (const actionId of ['light', 'heavy', 'skill1', 'skill2', 'ultimate'] as const) {
      expect(actionUnavailable(state, state.allies[0], actionId)).toContain('Recovering');
      expect(() => use(state, 'ember', actionId)).toThrow('Recovering');
    }
    state = endTurn(state).state;
    expect(state.round).toBe(3);
    expect(actionUnavailable(state, state.allies[0], 'light')).toBeNull();
  });
  it('skills do not cause recovery; cooldown expires on its exact round', () => {
    let state = use(controlled(), 'ember', 'skill1');
    state = endTurn(state).state;
    expect(actionUnavailable(state, state.allies[0], 'light')).toBeNull();
    expect(actionUnavailable(state, state.allies[0], 'skill1')).toBe('Ready on turn 3.');
    state = endTurn(state).state;
    expect(actionUnavailable(state, state.allies[0], 'skill1')).toBeNull();
  });
  it.each(['light', 'heavy', 'skill1', 'skill2'] as const)('%s allows attacking on the very next turn', (action) => {
    const acted = use(controlled(), 'ember', action);
    expect(acted.allies[0].recoverThrough).toBe(0);
    const next = endTurn(acted).state;
    expect(next.round).toBe(2);
    expect(actionUnavailable(next, next.allies[0], 'light')).toBeNull();
    expect(() => use(next, 'ember', 'light')).not.toThrow();
  });
  it('rejects invalid targets, defeated actors, and out-of-phase actions without changing state', () => {
    const state = controlled();
    const snapshot = structuredClone(state);
    expect(() => act(state, 'ember', 'light', 'missing')).toThrow('living enemy');
    expect(state).toEqual(snapshot);
    state.allies[0].hp = 0;
    expect(() => use(state, 'ember', 'light')).toThrow('defeated');
    state.phase = 'cleared';
    expect(() => endTurn(state)).toThrow();
    expect(() => use(state, 'tide', 'light')).toThrow('not accepting');
  });
  it('is deterministic for an identical seed/state/action sequence', () => {
    const a = act(createBattle(76), 'ember', 'light', 'enemy-1-0');
    const b = act(createBattle(76), 'ember', 'light', 'enemy-1-0');
    expect(a).toEqual(b);
    expect(endTurn(a.state)).toEqual(endTurn(b.state));
  });
  it('crit chance zero never crits, and one always crits', () => {
    const state = controlled();
    state.allies[0].stats.crit = 1;
    const critical = act(state, 'ember', 'light', state.enemies[0].id);
    expect(critical.events.find((entry) => entry.kind === 'damage')?.critical).toBe(true);
    expect(critical.state.enemies[0].hp).toBe(1948);
    state.allies[0].stats.crit = 0;
    expect(act(state, 'ember', 'light', state.enemies[0].id).events.find((entry) => entry.kind === 'damage')?.critical).toBe(false);
  });
});

describe('Shatter Gauge', () => {
  it('starts every character at zero and keeps gauges independent', () => {
    const state = createBattle(1729, ['ember', 'tide', 'sprout']);
    expect(state.allies.map((unit) => unit.shatter)).toEqual([0, 0, 0]);
    const after = use(state, 'ember', 'light');
    expect(after.allies.map((unit) => unit.shatter)).toEqual([20, 0, 0]);
    expect(state.allies.map((unit) => unit.shatter)).toEqual([0, 0, 0]);
  });
  it.each([
    ['light', 20], ['heavy', 30],
  ] as const)('%s gains exactly %i, capped at 100', (action, gain) => {
    const state = createBattle();
    expect(use(state, 'ember', action).allies[0].shatter).toBe(gain);
    state.allies[0].shatter = 95;
    expect(use(state, 'ember', action).allies[0].shatter).toBe(100);
    state.allies[0].shatter = 100;
    expect(use(state, 'ember', action).allies[0].shatter).toBe(100);
  });
  it.each(starters)('$name spends the exact cost for every ability, including support, with no skill gain', (starter) => {
    for (const [action, cost] of [['skill1', 25], ['skill2', 40], ['ultimate', 100]] as const) {
      const state = controlled();
      const actor = state.allies.find((unit) => unit.id === starter.id);
      if (!actor) throw new Error('Test actor is missing.');
      actor.shatter = cost - 1;
      const snapshot = structuredClone(state);
      expect(actionUnavailable(state, actor, action)).toBe(`Requires ${cost} Shatter Gauge.`);
      expect(() => use(state, starter.id, action)).toThrow(`Requires ${cost} Shatter Gauge.`);
      expect(state).toEqual(snapshot);
      actor.shatter = cost;
      expect(use(state, starter.id, action).allies.find((unit) => unit.id === starter.id)?.shatter).toBe(0);
      actor.shatter = 100;
      expect(use(state, starter.id, action).allies.find((unit) => unit.id === starter.id)?.shatter).toBe(100 - cost);
    }
  });
  it.each([0, 1000])('gains 10 per incoming hit even with %i shield, only for the targeted character', (shield) => {
    const state = createBattle(12345, ['ember', 'tide', 'sprout']);
    state.allies.forEach((unit) => { unit.shield = shield; });
    const snapshot = structuredClone(state);
    const result = endTurn(state);
    for (const ally of result.state.allies) {
      const hits = result.events.filter((entry) => entry.kind === 'attack' && entry.target === ally.id).length;
      expect(ally.shatter).toBe(hits * 10);
    }
    expect(result.state.allies.reduce((total, unit) => total + unit.shatter, 0)).toBe(30);
    expect(state).toEqual(snapshot);
  });
  it('caps incoming gains, includes lethal hits, and does not gain from passive healing or burn', () => {
    const state = createBattle(12345, ['ember', 'tide', 'sprout']);
    state.allies.forEach((unit) => { unit.shatter = 95; unit.hp = 1; });
    state.enemies.forEach((unit) => { unit.stats.damage = 10000; });
    const result = endTurn(state);
    expect(result.state.allies.map((unit) => unit.shatter)).toEqual([100, 100, 100]);
    expect(result.state.allies.map((unit) => unit.hp)).toEqual([0, 0, 0]);
    const burning = createBattle(1729, ['ember', 'tide', 'sprout']);
    burning.enemies.forEach((unit) => { unit.hp = 1; unit.burn = { damage: 8, turns: 1 }; });
    const clear = endTurn(burning).state;
    expect(clear.phase).toBe('cleared');
    expect(clear.allies.map((unit) => unit.shatter)).toEqual([0, 0, 0]);
    expect(clear.enemies.map((unit) => unit.shatter)).toEqual([0, 0, 0]);
    clear.allies[0].shatter = 55;
    clear.allies[0].hp = 100;
    const next = nextWave(clear).state;
    expect(next.allies[0].hp).toBe(111);
    expect(next.allies.map((unit) => unit.shatter)).toEqual([55, 0, 0]);
  });
});

describe('solo starter battles', () => {
  it('starts fresh runs at wave and enemy level 1 without assigning a saved character level', () => {
    const state = createBattle(12345);
    expect(state.wave).toBe(1);
    expect(state.enemies.map((enemy) => enemy.level)).toEqual([1, 1, 1]);
    expect(state.allies[0].level).toBeNull();
    state.phase = 'cleared';
    state.enemies.forEach((enemy) => { enemy.hp = 0; });
    const advanced = nextWave(state).state;
    expect(advanced.wave).toBe(2);
    expect(createBattle(12345).wave).toBe(1);
    expect(createBattle(12345).enemies.map((enemy) => enemy.level)).toEqual([1, 1, 1]);
  });
  it('uses base-relative linear HP/attack, +1 defense and +1 level every wave, not compound growth', () => {
    let state = createBattle(12345);
    for (let wave = 1; wave <= 20; wave++) {
      expect(state.wave).toBe(wave);
      for (const unit of state.enemies) {
        if (unit.definitionId !== 'goblin' && unit.definitionId !== 'imp' && unit.definitionId !== 'golem') {
          throw new Error('Unexpected enemy definition.');
        }
        const base = enemies[unit.definitionId].stats;
        expect(unit.level).toBe(wave);
        expect(unit.stats.health).toBe(Math.round(base.health + base.health * 0.12 * (wave - 1)));
        expect(unit.hp).toBe(unit.stats.health);
        expect(unit.stats.damage).toBe(Math.round(base.damage + base.damage * 0.12 * (wave - 1)));
        expect(unit.stats.defense).toBe(base.defense + wave - 1);
        expect(unit.stats.crit).toBe(base.crit);
      }
      state.phase = 'cleared';
      state.enemies.forEach((enemy) => { enemy.hp = 0; });
      state = nextWave(state).state;
    }
  });
  it('defaults to one fire character, not a practice team', () => {
    expect(createBattle().allies.map((unit) => unit.definitionId)).toEqual(['ember']);
  });
  it.each(starters)('$name starts alone with the correct stats and working kit', ({ id }) => {
    const state = createBattle(12345, [id]);
    expect(state.allies).toHaveLength(1);
    expect(state.allies[0].id).toBe(id);
    expect(state.allies[0].shatter).toBe(0);
    expect(state.allies[0].stats.defense).toBe(fighters[id].stats.defense + (id === 'tide' ? 8 : 0));
    const acted = use(state, id, 'light');
    const next = endTurn(acted).state;
    expect(next.allies).toHaveLength(1);
    expect(next.allies[0].shatter).toBe(50);
    for (const action of ['skill1', 'skill2', 'ultimate'] as const) {
      const ready = createBattle(12345, [id]);
      ready.allies[0].shatter = 100;
      expect(() => use(ready, id, action)).not.toThrow();
    }
    next.enemies.forEach((unit) => { unit.hp = 0; });
    next.phase = 'cleared';
    expect(nextWave(next).state.allies.map((unit) => unit.id)).toEqual([id]);
  });
  it('rejects empty or duplicate battle rosters explicitly', () => {
    expect(() => createBattle(1, [])).toThrow('distinct valid starters');
    expect(() => createBattle(1, ['ember', 'ember'])).toThrow('distinct valid starters');
  });
});

describe('starter abilities and passives', () => {
  it('Infernis passive activates at exactly half health, not above', () => {
    const state = controlled();
    state.allies[0].hp = 111;
    expect(use(state, 'ember', 'light').enemies[0].hp).toBe(1967);
    state.allies[0].hp = 110;
    expect(use(state, 'ember', 'light').enemies[0].hp).toBe(1959);
  });
  it('Cinder Cleave burns for exactly two enemy phases', () => {
    let state = use(controlled(), 'ember', 'skill1');
    expect(state.enemies[0].hp).toBe(1944);
    state = endTurn(state).state;
    expect(state.enemies[0].hp).toBe(1936);
    expect(state.enemies[0].burn.turns).toBe(1);
    state = endTurn(state).state;
    expect(state.enemies[0].hp).toBe(1928);
    expect(state.enemies[0].burn.turns).toBe(0);
    expect(endTurn(state).state.enemies[0].hp).toBe(1928);
  });
  it('Flame Arc and Dawnfire hit every enemy', () => {
    const state = controlled();
    expect(use(state, 'ember', 'skill2').enemies.map((unit) => unit.hp)).toEqual([1963, 1961, 1973]);
    expect(use(state, 'ember', 'ultimate').enemies.map((unit) => unit.hp)).toEqual([1899, 1897, 1909]);
  });
  it('Tizu passive adds eight defense and Undertow weakens two attacks', () => {
    let state = controlled();
    expect(state.allies[1].stats.defense).toBe(fighters.tide.stats.defense + 8);
    state = use(state, 'tide', 'skill1');
    expect(state.enemies[0].hp).toBe(1960);
    expect(state.enemies[0].weakened).toBe(2);
    state = endTurn(state).state;
    expect(state.enemies[0].weakened).toBe(1);
    state = endTurn(state).state;
    expect(state.enemies[0].weakened).toBe(0);
  });
  it('Tidal Shelter refreshes shields; Ocean Memory damages all and gives 35 shields', () => {
    const state = controlled();
    state.allies[0].shield = 30;
    expect(use(state, 'tide', 'skill2').allies.map((unit) => unit.shield)).toEqual([30, 25, 25]);
    const ultimate = use(state, 'tide', 'ultimate');
    expect(ultimate.allies.map((unit) => unit.shield)).toEqual([35, 35, 35]);
    expect(ultimate.enemies.map((unit) => unit.hp)).toEqual([1939, 1937, 1949]);
  });
  it('Undertow applies the 25% attack reduction before defense', () => {
    const state = controlled();
    state.enemies[1].hp = 0;
    state.enemies[2].hp = 0;
    state.enemies[0].weakened = 2;
    const result = endTurn(state);
    const hit = result.events.find((entry) => entry.kind === 'damage' && entry.source === state.enemies[0].id);
    expect(hit).toBeDefined();
    const target = state.allies.find((unit) => unit.id === hit?.target);
    expect(target).toBeDefined();
    expect(hit?.amount).toBe(Math.max(1, 17 - (target?.stats.defense ?? 0)));
  });
  it('shields absorb damage before health', () => {
    const state = controlled();
    state.allies.forEach((ally) => { ally.shield = 1000; });
    const after = endTurn(state).state;
    expect(after.allies.map((unit) => unit.hp)).toEqual(state.allies.map((unit) => unit.hp));
    expect(after.allies.reduce((sum, unit) => sum + unit.shield, 0)).toBeLessThan(3000);
  });
  it('Flores heals living allies at the start of the turn and does not revive', () => {
    const state = controlled();
    state.enemies.forEach((unit) => { unit.hp = 0; });
    state.allies[0].hp = 100;
    state.allies[1].hp = 0;
    state.phase = 'cleared';
    const after = nextWave(state).state;
    expect(after.allies.map((unit) => unit.hp)).toEqual([111, 0, 190]);
    state.allies[2].hp = 0;
    expect(nextWave(state).state.allies[0].hp).toBe(100);
  });
  it('Briar Shot gains exactly 20 percentage points critical chance', () => {
    const state = controlled();
    // Seed 12345 has a first roll above 0.2, so this remains noncritical.
    expect(use(state, 'sprout', 'skill1').enemies[0].hp).toBe(1957);
    state.seed = 1; // First roll is below 0.2: only the skill's bonus can crit.
    const result = act(state, 'sprout', 'skill1', state.enemies[0].id);
    expect(result.events.find((entry) => entry.kind === 'damage')?.critical).toBe(true);
    expect(result.state.enemies[0].hp).toBe(1933);
  });
  it('Renewal and Worldseed heal, respect caps, do not revive, and ultimate damages all', () => {
    const state = controlled();
    state.allies[0].hp = 100;
    state.allies[1].hp = 0;
    const support = use(state, 'sprout', 'skill2');
    expect(support.allies.map((unit) => unit.hp)).toEqual([130, 0, 190]);
    const ultimate = use(state, 'sprout', 'ultimate');
    expect(ultimate.allies.map((unit) => unit.hp)).toEqual([155, 0, 190]);
    expect(ultimate.enemies.map((unit) => unit.hp)).toEqual([1947, 1945, 1957]);
  });
  it.each(starters)('$name has two implemented abilities and a consistently named ultimate', (starter) => {
    expect(fighters[starter.id].abilities.ultimate.name).toMatch(/^Last Flare: .+/);
    expect(use(controlled(), starter.id, 'skill1').allies.find((unit) => unit.id === starter.id)?.spent).toBe(true);
    expect(use(controlled(), starter.id, 'skill2').allies.find((unit) => unit.id === starter.id)?.spent).toBe(true);
    expect(use(controlled(), starter.id, 'ultimate').allies.find((unit) => unit.id === starter.id)?.recoverThrough).toBe(2);
  });
});

describe('wave lifecycle', () => {
  it('a heavy wave clear carries its gauge without blocking the next wave', () => {
    const state = createBattle();
    state.enemies.forEach((unit) => { unit.hp = 0; });
    state.enemies[0].hp = 1;
    const cleared = use(state, 'ember', 'heavy');
    expect(cleared.phase).toBe('cleared');
    const next = nextWave(cleared).state;
    expect(next.allies[0].shatter).toBe(30);
    expect(next.allies[0].recoverThrough).toBe(0);
    expect(actionUnavailable(next, next.allies[0], 'heavy')).toBeNull();
  });
  it('advances only after a clear, scales enemies, and carries recovery into the next wave', () => {
    const state = createBattle(1);
    expect(() => nextWave(state)).toThrow('Defeat this wave');
    state.enemies.forEach((unit) => { unit.hp = 1; });
    state.allies[0].shatter = 100;
    const cleared = use(state, 'ember', 'ultimate');
    expect(cleared.phase).toBe('cleared');
    const next = nextWave(cleared).state;
    expect(next.wave).toBe(2);
    expect(next.round).toBe(2);
    expect(next.enemies.map((unit) => unit.definitionId)).toEqual(['goblin', 'imp', 'golem']);
    expect(next.enemies[0].stats.health).toBe(123);
    expect(actionUnavailable(next, next.allies[0], 'light')).toContain('Recovering');
    expect(next.allies[0].shatter).toBe(0);
  });
  it('burn killing the last enemy clears the wave without that enemy attacking', () => {
    const state = controlled();
    state.enemies.forEach((unit) => { unit.hp = 0; });
    state.enemies[0].hp = 5;
    state.enemies[0].burn = { damage: 8, turns: 1 };
    const result = endTurn(state);
    expect(result.state.phase).toBe('cleared');
    expect(result.events.some((entry) => entry.kind === 'attack')).toBe(false);
  });
  it('defeat is terminal and damage cannot reduce health below zero', () => {
    const state = controlled();
    state.allies.forEach((unit) => { unit.hp = 1; });
    state.enemies.forEach((unit) => { unit.stats.damage = 10000; });
    const defeated = endTurn(state).state;
    expect(defeated.phase).toBe('defeat');
    expect(defeated.allies.map((unit) => unit.hp)).toEqual([0, 0, 0]);
    expect(() => nextWave(defeated)).toThrow();
  });
});
