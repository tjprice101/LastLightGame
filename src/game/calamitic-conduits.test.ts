import { describe, expect, it } from 'vitest';
import { calamiticConduits, calamiticEffect, calamiticPower, type CalamiticConduitId } from '../content/calamitic-conduits';
import { conduitEffect, conduitEquipReason, conduitUpgradeCost, conduits, getConduit, validateConduitSlots, type ConduitId } from '../content/conduits';
import { elements } from '../content/activities';
import { starters } from '../content/starters';
import { act, actionUnavailable, createBattle, endTurn, nextWave, type BattleEvent } from './battle';
import { afterCalamiticAction, calamiticShieldBypass, calamiticSiegeBonus, deferCalamiticDamage, settleCalamiticDebt } from './calamitic-conduits';
import { conduitIncoming, gear, generatedStrike } from './conduit-runtime';
import { createCreatureCopy } from './character-instances';

function fixture(id: CalamiticConduitId, level = 0, enabled = true) {
  const state = createBattle(1729, ['ember', 'tide', 'sprout'], undefined,
    { ember: [enabled ? id : null, null, null, null, null, null, null, null] }, [], { [id]: level });
  for (const unit of [...state.allies, ...state.enemies]) {
    Object.assign(unit.stats, { health: 10000, damage: 100, defense: 100, crit: 0, shatterCapacity: 500 });
    unit.hp = 10000; unit.shatter = 200;
  }
  const events: BattleEvent[] = [];
  return { state, owner: state.allies[0], enemy: state.enemies[0], events };
}

describe('Calamitic universal equipment', () => {
  it('adds five unique universal identities above Omnic, with more expensive upgrades and no Omnic slot limit', () => {
    expect(calamiticConduits).toHaveLength(5);
    expect(new Set(calamiticConduits.map(entry => entry.id)).size).toBe(5);
    for (const design of calamiticConduits) {
      const entry = getConduit(design.id);
      expect(entry).toMatchObject({ rarity: 'Calamitic', element: null, art: entry.id, price: null, buffs: [] });
      expect(entry.lore).not.toContain('shared prototype');
      for (const element of elements) expect(conduitEquipReason(entry, element.id, Array(8).fill(null), 0)).toBeNull();
      expect([0, 1, 2, 3, 4].map(level => conduitUpgradeCost(entry, level))).toEqual([10000, 20000, 40000, 70000, 100000]);
      for (let level = 0; level <= 5; level++) expect(conduitEffect(entry, level)).toBe(calamiticEffect(design.id, level));
      expect(conduitUpgradeCost(entry, 5)).toBe(140000);
    }
    const ids: (ConduitId | null)[] = [...calamiticConduits.map(entry => entry.id), null, null, null];
    expect(validateConduitSlots(ids)).toEqual(ids);
    expect(() => validateConduitSlots([...ids.slice(0, 7), ids[0]])).toThrow('once');
    const omnic = conduits.filter(entry => entry.rarity === 'Omnic' && entry.element === 'infernic').slice(0, 4).map(entry => entry.id);
    expect(omnic).toHaveLength(4);
    const mixed = [...omnic, ...ids.slice(0, 4)];
    expect(validateConduitSlots(mixed)).toEqual(mixed);
    const fiveOmnic = conduits.filter(entry => entry.rarity === 'Omnic').slice(0, 5).map(entry => entry.id);
    expect(validateConduitSlots([...fiveOmnic, ...ids.slice(0, 3)])).toEqual([...fiveOmnic, ...ids.slice(0, 3)]);
  });

  for (const level of [0, 1, 2, 3, 4, 5]) for (const enabled of [false, true]) {
    it(`scales Orrery storage/release at +${level}, equipped=${enabled}`, () => {
      const { state, owner, enemy, events } = fixture('calamitic-world-eater-orrery', level, enabled);
      const seed = state.seed;
      conduitIncoming(state, enemy, state.allies[1], 100, false, false, events);
      const reserve = enabled ? 100 * calamiticPower(level, .4, .8) : 0;
      expect(gear(owner).numbers.calamiticOrrery ?? 0).toBeCloseTo(reserve);
      afterCalamiticAction(state, owner, 'defend', events);
      expect(gear(owner).numbers.calamiticOrrery ?? 0).toBe(0);
      expect(enemy.hp).toBe(10000 - (enabled ? Math.max(1, Math.round(reserve / 2)) : 0));
      generatedStrike(state, owner, enemy, 20, events);
      expect(gear(owner).numbers.calamiticOrrery ?? 0).toBe(0);
      expect(state.seed).toBe(seed);
    });

    it(`defers exact post-shield HP damage at +${level}, equipped=${enabled}`, () => {
      const { state, owner, enemy, events } = fixture('calamitic-causality-funeral-engine', level, enabled);
      owner.shield = 30;
      conduitIncoming(state, enemy, owner, 130, false, false, events);
      const debt = enabled ? Math.floor(100 * calamiticPower(level, .4, .6)) : 0;
      expect(owner.hp).toBe(9900 + debt);
      expect(gear(owner).numbers.calamiticDebt ?? 0).toBe(debt);
      owner.shield = 500;
      state.round = 2;
      settleCalamiticDebt(state, events);
      expect(owner.hp).toBe(9900);
      expect(owner.shield).toBe(500);
      settleCalamiticDebt(state, events);
      expect(owner.hp).toBe(9900);
      expect(gear(owner).numbers.calamiticDebt).toBeUndefined();
    });

    it(`splits shield pressure without extra RNG at +${level}, equipped=${enabled}`, () => {
      const { state, owner, enemy } = fixture('calamitic-horizon-cleaving-godpress', level, enabled);
      enemy.shield = 100000;
      expect(calamiticShieldBypass(state, owner)).toBe(enabled ? calamiticPower(level, .4, .6) : 0);
      expect(calamiticSiegeBonus(state, owner, enemy)).toBe(enabled ? calamiticPower(level, .3, .6) : 0);
      const control = structuredClone(state);
      control.allies[0].conduits = Array(8).fill(null);
      const result = act(state, owner.id, 'light', enemy.id);
      const baseline = act(control, owner.id, 'light', enemy.id);
      expect(result.state.seed).toBe(baseline.state.seed);
      const hpLoss = enemy.hp - result.state.enemies[0].hp;
      expect(hpLoss > 0).toBe(enabled);
      const totalDamage = enemy.shield - result.state.enemies[0].shield + hpLoss;
      expect(hpLoss).toBe(enabled ? Math.floor(totalDamage * calamiticPower(level, .4, .6)) : 0);
      expect(result.state.enemies[0].shield < enemy.shield).toBe(true);
      enemy.shield = 0;
      expect(calamiticSiegeBonus(state, owner, enemy)).toBe(0);
    });

    it(`repays a borrowed turn with scaled Gauge at +${level}, equipped=${enabled}`, () => {
      const { state, owner, enemy } = fixture('calamitic-throne-borrowed-tomorrows', level, enabled);
      const defense = act(state, owner.id, 'defend', enemy.id);
      expect(defense.state.allies[0].spent).toBe(!enabled);
      if (!enabled) return;
      expect(actionUnavailable(defense.state, defense.state.allies[0], 'ultimate')).toContain('borrowed');
      expect(actionUnavailable(defense.state, defense.state.allies[0], 'defend')).toContain('borrowed');
      const borrowed = act(defense.state, owner.id, 'light', enemy.id);
      const plain = structuredClone(defense.state);
      plain.allies[0].conduits = Array(8).fill(null);
      delete gear(plain.allies[0]).numbers.calamiticThroneArmed;
      const baseline = act(plain, owner.id, 'light', enemy.id);
      expect(borrowed.state.allies[0].shatter - baseline.state.allies[0].shatter).toBeCloseTo(calamiticPower(level, 10, 30));
      expect(borrowed.state.allies[0].spent).toBe(true);
      const next = endTurn(borrowed.state).state;
      expect(actionUnavailable(next, next.allies[0], 'light')).toContain('owed');
      const later = endTurn(next).state;
      expect(actionUnavailable(later, later.allies[0], 'light')).toBeNull();
      const tooSoon = act(later, owner.id, 'defend', later.enemies[0].id);
      expect(tooSoon.state.allies[0].spent).toBe(false);
    });

    it(`settles three distinct actions once at +${level}, equipped=${enabled}`, () => {
      const { state, owner, events } = fixture('calamitic-cathedral-final-equation', level, enabled);
      afterCalamiticAction(state, owner, 'light', events);
      afterCalamiticAction(state, owner, 'light', events);
      afterCalamiticAction(state, owner, 'skill1', events);
      expect(state.enemies.map(enemy => enemy.hp)).toEqual([10000, 10000, 10000]);
      afterCalamiticAction(state, owner, 'defend', events);
      const loss = enabled ? Math.max(1, Math.round(100 * calamiticPower(level, 1.2, 2.4) / 3 / 2)) : 0;
      expect(state.enemies.map(enemy => enemy.hp)).toEqual([10000 - loss, 10000 - loss, 10000 - loss]);
      expect(gear(owner).numbers.calamiticEquation ?? 0).toBe(0);
      expect(events.filter(event => event.kind === 'damage').every(event => event.origin === 'conduit')).toBe(true);
    });
  }

  it('stores uncapped Orrery reserves independently for multiple wearers and ignores self-costs', () => {
    const { state, owner, enemy, events } = fixture('calamitic-world-eater-orrery', 5);
    state.allies[2].conduits = [...owner.conduits!];
    conduitIncoming(state, enemy, state.allies[1], 9000, false, false, events);
    expect(gear(owner).numbers.calamiticOrrery).toBe(7200);
    expect(gear(state.allies[2]).numbers.calamiticOrrery).toBe(7200);
    owner.hp -= 1;
    expect(gear(owner).numbers.calamiticOrrery).toBe(7200);
  });

  it('extrapolates deferred damage beyond the incoming hit without creating healing', () => {
    const { state, owner, events } = fixture('calamitic-causality-funeral-engine', 20);
    expect(deferCalamiticDamage(state, owner, 100, events)).toBe(0);
    expect(gear(owner).numbers.calamiticDebt).toBe(120);
    owner.hp = 100;
    state.round = 2;
    settleCalamiticDebt(state, events);
    expect(owner.hp).toBe(0);
  });

  it('defers uncapped damage, retains debt through reconstruction and permits lethal settlement', () => {
    const { state, owner, enemy, events } = fixture('calamitic-causality-funeral-engine', 5);
    owner.stats.health = owner.hp = 1000;
    conduitIncoming(state, enemy, owner, 600, false, false, events);
    conduitIncoming(state, enemy, owner, 600, false, false, events);
    expect(gear(owner).numbers.calamiticDebt).toBe(720);
    const restored = structuredClone(state);
    restored.round = 2;
    restored.allies[0].shield = 999999;
    gear(restored.allies[0]).numbers.stasisProtectedRound = 2;
    restored.allies[0].hp = 500;
    settleCalamiticDebt(restored, events);
    expect(restored.allies[0].hp).toBe(0);
    expect(restored.allies[0].shield).toBe(999999);
    expect(gear(restored.allies[0]).numbers.calamiticDebt).toBeUndefined();
  });

  it('does not take tomorrow when no borrowed action is chosen, or bypass recovery', () => {
    const { state, owner, enemy } = fixture('calamitic-throne-borrowed-tomorrows');
    const defended = act(state, owner.id, 'defend', enemy.id).state;
    const next = endTurn(defended).state;
    expect(actionUnavailable(next, next.allies[0], 'light')).toBeNull();
    next.allies[0].recoverThrough = next.round;
    expect(actionUnavailable(next, next.allies[0], 'defend')).toContain('Recovering');
  });

  it('awards real kills from a defensive discharge, once, and resets new encounters', () => {
    const { state, owner } = fixture('calamitic-cathedral-final-equation', 5);
    gear(owner).numbers.calamiticEquation = 1 | 4;
    state.enemies.forEach(enemy => { enemy.hp = 1; enemy.stats.defense = 0; });
    const result = act(state, owner.id, 'defend', state.enemies[0].id);
    expect(result.state.phase).toBe('cleared');
    expect(result.events.filter(event => event.kind === 'reward')).toHaveLength(3);
    expect(gear(result.state.allies[0]).numbers.calamiticEquation).toBe(0);
    const next = nextWave(result.state).state;
    expect(gear(next.allies[0]).numbers.calamiticEquation).toBeUndefined();
  });

  it('is legal for every Element-Bearer and captured copies, without creating native abilities', () => {
    const ids = calamiticConduits.map(entry => entry.id);
    const slots: (ConduitId | null)[] = [...ids, null, null, null];
    for (const starter of starters) {
      const state = createBattle(17, [starter.id], undefined, { [starter.id]: slots });
      expect(state.allies[0].conduits).toEqual(slots);
    }
    const copy = createCreatureCopy('infusion:heavens:0');
    const captured = createBattle(17, [copy.instanceId], undefined, { [copy.instanceId]: slots }, [copy]);
    expect(captured.allies[0].conduits).toEqual(slots);
    expect(captured.allies[0].kit?.nativeIdentity).toBeFalsy();
    captured.allies[0].shatter = 100;
    captured.enemies[0].shield = 100000;
    expect(act(captured, copy.instanceId, 'light', captured.enemies[0].id).state.enemies[0].hp).toBeLessThan(captured.enemies[0].hp);
  });
});
