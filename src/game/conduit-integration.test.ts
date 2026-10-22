import { describe, expect, it, vi } from 'vitest';

// Historical rules4 contract; Phase 0 numerical coverage lives in the phase-zero suites.
vi.mock('../content/phase-zero-stats', async importOriginal => ({
  ...await importOriginal<typeof import('../content/phase-zero-stats')>(),
  phaseZeroStatsReady: false,
}));
import { resolveFighter, type ActionId } from '../content/combat';
import { conduitBuffs, conduits, type ConduitId, type ConduitSlots } from '../content/conduits';
import { starters, type StarterId } from '../content/starters';
import { createCreatureCopy, resolveCapturedFighter } from './character-instances';
import { act, createBattle, endTurn, withMasterLoadouts, type BattleState } from './battle';
import { conduitIncoming, gear } from './conduit-runtime';

function encounter(character: StarterId, ids: ConduitId[] = [], level = 5) {
  const slots: ConduitSlots = [...ids, ...Array<null>(8 - ids.length).fill(null)];
  const state = createBattle(1729, [character, ...starters.filter(entry => entry.id !== character).slice(0, 2).map(entry => entry.id)],
    {}, { [character]: slots }, [], Object.fromEntries(ids.map(id => [id, level])));
  for (const unit of [...state.allies, ...state.enemies]) {
    Object.assign(unit.stats, { health: 10000, damage: 100, defense: 0, crit: 0, critMultiplier: 1.5, shatterCapacity: 500 });
    unit.hp = 10000; unit.shatter = 200;
  }
  return state;
}

function use(state: BattleState, action: ActionId = 'light', target = state.enemies[0].id) {
  return act(state, state.allies[0].id, action, target);
}

function ready(state: BattleState) {
  state.allies[0].spent = false;
  return state;
}

describe('equipped Conduit battle integration audit', () => {
  it.each([0, 1, 2, 3, 4, 5])('applies every catalog stat bonus to native and captured fighters at +%i', level => {
    for (const entry of conduits) {
      const character = starters.find(unit => unit.elementId === entry.element)?.id ?? 'ember';
      const slots: ConduitSlots = [entry.id, null, null, null, null, null, null, null];
      const copy = createCreatureCopy(entry.element === 'chaotic' ? 'infusion:abyss:0' : 'infusion:heavens:0');
      const creatureCharacter = createBattle(1729, [copy.instanceId], {}, {}, [copy]).allies[0];
      const kits = [
        { base: resolveFighter(character), equipped: resolveFighter(character, undefined, slots, { [entry.id]: level }) },
        ...(!entry.element || entry.element === creatureCharacter.element ? [{
          base: resolveCapturedFighter(copy), equipped: resolveCapturedFighter(copy, slots, { [entry.id]: level }),
        }] : []),
      ];
      for (const pair of kits) {
        const expected = { ...pair.base.stats };
        for (const buff of conduitBuffs(entry, level)) {
          expected[buff.stat] = buff.kind === 'percent' ? expected[buff.stat] * (1 + buff.amount / 100)
            : buff.kind === 'percentage-points' ? Math.max(0, expected[buff.stat] + buff.amount / 100)
              : expected[buff.stat] + buff.amount;
        }
        expect(pair.equipped.stats, entry.id).toEqual(expected);
      }
    }
  });

  it('does not let equipment slot order change combined Critical Rate bonuses and penalties', () => {
    for (const character of ['ember', 'bruno'] as const) {
      const first: ConduitSlots = ['citadel-spine', 'astral-prism', null, null, null, null, null, null];
      const second: ConduitSlots = ['astral-prism', 'citadel-spine', null, null, null, null, null, null];
      const upgrades = { 'citadel-spine': 5, 'astral-prism': 5 };
      const base = resolveFighter(character);
      const expected = Math.max(0, base.stats.crit + .7 - .21);
      expect(resolveFighter(character, undefined, first, upgrades).stats.crit).toBeCloseTo(expected);
      expect(resolveFighter(character, undefined, second, upgrades).stats.crit).toBeCloseTo(expected);
    }
  });

  it.each([false, true])('applies Falcon Sight critical damage to actual Normal Attacks (captured=%s)', captured => {
    let state = encounter('ember', ['falcon-sight']);
    if (captured) {
      const copy = createCreatureCopy('infusion:heavens:0');
      const unit = createBattle(1729, [copy.instanceId], {}, {
        [copy.instanceId]: ['falcon-sight', null, null, null, null, null, null, null],
      }, [copy], { 'falcon-sight': 5 }).allies[0];
      unit.stats = { ...state.allies[0].stats }; unit.hp = 10000; unit.shatter = 200;
      state.allies[0] = unit;
    }
    for (let index = 0; index < 2; index++) state = use(ready(state)).state;
    const result = use(ready(state));
    expect(result.events.find(event => event.kind === 'damage' && event.source === state.allies[0].id))
      .toMatchObject({ critical: true, amount: 180 });
  });

  it.each([0, 1, 2, 3, 4, 5])('spends all accumulated Tailwinds on the discounted skill at +%i', level => {
    let state = encounter('atmoso', ['atmospheric-skythread-rudder'], level);
    state = use(state).state;
    state = use(ready(state)).state;
    expect(gear(state.allies[0]).numbers.tailwind).toBe(2);
    const before = state.allies[0].shatter;
    const result = use(ready(state), 'skill1');
    expect(result.state.allies[0].shatter).toBe(before - Math.max(1, 25 - 2 * (10 + level * 2)));
    expect(gear(result.state.allies[0]).numbers.tailwind ?? 0).toBe(0);
    expect(use(ready(result.state), 'skill1').state.allies[0].shatter)
      .toBe(result.state.allies[0].shatter - 25);
  });

  it.each([0, 1, 2, 3, 4, 5])('keeps Iris extensions in Infernis stored Burn through the next Enemy Turn at +%i', level => {
    let state = encounter('ember', ['flare-focusing-iris'], level);
    state = use(state, 'skill1').state;
    state = use(ready(state), 'skill2').state;
    const id = state.enemies[0].id;
    const remaining = 1 + 2 * (level < 3 ? 1 : 2);
    expect(state.enemies[0].burn.turns).toBe(remaining);
    expect(state.allies[0].native?.burns?.[id]?.turns).toBe(remaining);
    state = endTurn(state).state;
    expect(state.enemies[0].burn.turns).toBe(remaining - 1);
    expect(state.allies[0].native?.burns?.[id]?.turns).toBe(remaining - 1);
  });

  it('consumes a real stored Burn phase for each Tempered Strike, not just its displayed snapshot', () => {
    let state = encounter('ember', ['tempered-strike-link']);
    state = use(state, 'skill1').state;
    state = use(ready(state)).state;
    const id = state.enemies[0].id;
    expect(state.enemies[0].burn.turns).toBe(2);
    expect(state.allies[0].native?.burns?.[id]?.turns).toBe(2);
    state = endTurn(state).state;
    expect(state.allies[0].native?.burns?.[id]?.turns).toBe(1);
  });

  it('resets Cinder Testament streak when a weaker Burn refresh keeps the stronger tick', () => {
    let state = encounter('ember', ['infernic-cinder-testament']);
    state = use(state, 'ultimate').state;
    state = endTurn(state).state;
    state = endTurn(state).state;
    expect(gear(state.enemies[0]).numbers['cinder:ember']).toBe(2);
    state = use(state, 'skill1').state;
    expect(state.enemies[0].burn.damage).toBe(135);
    expect(gear(state.enemies[0]).numbers['cinder:ember']).toBe(0);
    const result = endTurn(state);
    expect(result.events.find(event => event.kind === 'damage' && event.nativeKind === 'burn')?.amount).toBe(135);
  });

  it('applies Eclipse Mantle Defense pierce and Weaken consumption on Normal Attack', () => {
    const state = encounter('razor', ['ominous-eclipse-mantle']);
    const target = state.enemies[0];
    target.stats.defense = 100;
    target.weakened = 2; target.weakenFraction = .25; target.weakenSourceId = state.allies[0].id;
    target.weakenOrigin = 'native';
    const result = use(state);
    expect(result.events.find(event => event.kind === 'damage')).toMatchObject({ amount: 71 });
    expect(result.state.enemies[0].weakened).toBe(1);
  });

  it('lets another ally Normal Attack trigger Charted Bonus Strikes', () => {
    let state = withMasterLoadouts(encounter('nerithe'), { nerithe: 'master-nerithe-1' });
    state = use(state).state;
    const ally = state.allies[1];
    const target = state.enemies[0];
    const result = act(state, ally.id, 'light', state.enemies[1].id);
    expect(result.events.some(event => event.kind === 'damage' && event.origin === 'conduit' && event.target === target.id)).toBe(true);
    expect(result.state.enemies[0].hp).toBe(target.hp - 40);
    expect(gear(result.state.enemies[0]).owners.chart).toBeUndefined();
  });

  it.each([false, true])('applies Atmoso Master Normal Attack targeting and scale without multiplying Gauge (equipped=%s)', equipped => {
    let state = encounter('atmoso');
    if (equipped) state = withMasterLoadouts(state, { atmoso: 'master-atmoso-1' });
    const result = use(state);
    const hits = result.events.filter(event => event.kind === 'damage' && event.source === 'atmoso');
    expect(hits.map(event => event.amount)).toEqual(equipped ? [70, 70, 70] : [100]);
    expect(new Set(hits.map(event => event.target)).size).toBe(equipped ? 3 : 1);
    expect(result.state.allies[0].shatter).toBe(220);
    expect(result.state.allies[0].native?.cyclone).toBeUndefined();
  });

  it('parries only the first enemy skill per Enemy Turn with Midnight Bastion', () => {
    let state = withMasterLoadouts(encounter('razor'), { razor: 'master-razor-1' });
    state.allies = [state.allies[0]];
    for (const enemy of state.enemies) {
      enemy.enemySkills = [{ action: 'skill1', name: 'Audit skill', every: 1, multiplier: 1 }];
    }
    state = use(state).state;
    const result = endTurn(state);
    expect(result.events.filter(event => event.kind === 'damage' && event.target === 'razor').map(event => event.amount))
      .toEqual([50, 100, 100]);
  });

  it('keeps the first-skill parry for all its impacts, without carrying it to a later activation', () => {
    const state = withMasterLoadouts(encounter('razor'), { razor: 'master-razor-1' });
    const owner = state.allies[0], enemy = state.enemies[0];
    gear(owner).numbers.normalRound = state.round;
    for (let hit = 0; hit < 3; hit++) conduitIncoming(state, enemy, owner, 100, false, true, []);
    expect(owner.hp).toBe(9850);
    delete enemy.native;
    conduitIncoming(state, enemy, owner, 100, false, true, []);
    expect(owner.hp).toBe(9750);
    state.round++;
    gear(owner).numbers.normalRound = state.round;
    delete enemy.native;
    conduitIncoming(state, enemy, owner, 100, false, true, []);
    expect(owner.hp).toBe(9700);
  });

  it.each([100, 2000])('gives Bruno a Defense-scaled Master Shield with the approved HP floor (Defense=%i)', defense => {
    const state = withMasterLoadouts(encounter('bruno'), { bruno: 'master-bruno-2' });
    state.allies[0].stats.defense = defense;
    const result = use(state, 'ultimate');
    expect(result.state.allies[0].shield).toBe(Math.max(2000, defense * 2) * 1.5);
    expect(result.state.allies[0].native?.cover?.fraction).toBeCloseTo(.6);
    expect(result.state.allies[0].native?.cover?.throughPhase).toBe(2);
  });
});
