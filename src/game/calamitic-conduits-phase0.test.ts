// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';

vi.mock('../content/phase-zero-stats', async importOriginal => ({
  ...await importOriginal<typeof import('../content/phase-zero-stats')>(),
  phaseZeroStatsReady: true,
}));

import { approvedConduitAbility } from '../content/phase-zero-conduit-catalog';
import { applyPhaseZeroStaticBonuses } from '../content/phase-zero-conduit-stats';
import { calamiticConduits, calamiticPower } from '../content/calamitic-conduits';
import { legacyConduitEffect, conduitEquipReason, conduits, normalizeLegacyCalamiticSlots,
  validateConduitSlots, type ConduitId, type ConduitSlots } from '../content/conduits';
import { resolveFighter } from '../content/combat';
import { ACCOUNT_KEY, emptyAccount, equipConduit, loadAccount, purchaseConduit,
  saveAccount, validateAccount, type Account } from './account';
import { act, createBattle, type BattleEvent, type BattleState } from './battle';
import { afterCalamiticMark } from './calamitic-conduits';
import { conduitActionCost, conduitIncoming, gear, initializeConduits,
  prepareConduitAction } from './conduit-runtime';
import { nativeDamageTakenMultiplier } from './native-kits';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { conduitLoadout } from '../presentation/conduit-loadout';
import { freshGame, resolveOperation } from '../../supabase/functions/game-operation/engine';

const phaseFour = [
  'calamitic-bulwark-of-the-last-horizon',
  'calamitic-reliquary-of-unending-mercy',
  'calamitic-aegis-engine-of-severed-fate',
  'calamitic-monolith-of-the-unmoved-star',
  'calamitic-heartforge-of-the-sunless-dawn',
  'calamitic-ruinmark-censer',
  'calamitic-choir-array-of-branded-stars',
  'calamitic-throne-of-the-lone-apostate',
  'calamitic-worldbreaker-cannonade',
] as const satisfies readonly ConduitId[];
const maxValues: Record<(typeof phaseFour)[number], number[]> = {
  'calamitic-bulwark-of-the-last-horizon': [300, 300, 25],
  'calamitic-reliquary-of-unending-mercy': [125, 35],
  'calamitic-aegis-engine-of-severed-fate': [55, 75],
  'calamitic-monolith-of-the-unmoved-star': [500, 15],
  'calamitic-heartforge-of-the-sunless-dawn': [500, 25],
  'calamitic-ruinmark-censer': [15, 75, 60],
  'calamitic-choir-array-of-branded-stars': [50, 10, 70],
  'calamitic-throne-of-the-lone-apostate': [250, 250, 125],
  'calamitic-worldbreaker-cannonade': [250],
};

function slotsWith(...ids: ConduitId[]): ConduitSlots {
  return [...ids, ...Array<null>(8 - ids.length).fill(null)];
}
function battle(roster: string[], equipment: Record<string, ConduitSlots>, upgrades: Partial<Record<ConduitId, number>> = {}): BattleState {
  const state = createBattle(1729, roster, undefined, equipment, [], upgrades);
  initializeConduits(state);
  return state;
}
function testStorage() {
  const values = new Map<string, string>([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  let writes = 0;
  const storage: ProfileStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { writes++; values.set(key, value); },
    removeItem: key => { values.delete(key); },
  };
  return { storage, values, writes: () => writes };
}
function ownedCalamitics(ids: readonly ConduitId[]): Account {
  const account = emptyAccount();
  account.characters.ember = { level: 0, evolution: 1 };
  account.conduits = Object.fromEntries(ids.map(id => [id, 1]));
  return account;
}

for (const id of phaseFour) describe(`D-435 approved values: ${id}`, () => {
  it('has no effect when absent', () => {
    const state = battle(['ember', 'tide', 'sprout'], {});
    const actor = state.allies[0];
    expect(prepareConduitAction(state, actor, 'skill1', 25, false).skillPower).toBe(actor.stats.skillPower);
    expect(conduitActionCost(actor, 'skill1', state, 25)).toBe(25);
  });

  it.each([0, 1, 2, 3, 4, 5])('uses the approved effect text at +%i', level => {
    const effect = legacyConduitEffect(conduits.find(entry => entry.id === id)!, level);
    expect(approvedConduitAbility(id)).toBeDefined();
    for (const maximum of maxValues[id]) {
      const expected = Number((maximum / 1.5 * (1 + level * .1)).toFixed(8));
      expect(effect).toContain(`${expected}%`);
    }
    if (level === 5) for (const maximum of maxValues[id]) expect(effect).toContain(`${maximum}%`);
    expect(calamiticPower(level, maxValues[id][0] / 150, maxValues[id][0] / 100)).toBeCloseTo(maxValues[id][0] / 150 * (1 + level * .1));
  });
});

describe('D-435 Calamitic Conduit mechanics', () => {
  it('applies unconditional Health, Defense, Skill Power and Efficiency at +0 and +5', () => {
    const base = { health: 1000, damage: 100, defense: 100, crit: 0, critMultiplier: 1.5,
      shatterCapacity: 300, skillPower: 1, skillDuration: 0, skillEfficiency: 0, gaugeGain: 1 };
    const stats: Partial<Record<(typeof phaseFour)[number], Partial<Record<'health' | 'defense' | 'skillPower' | 'skillEfficiency', number>>>> = {
      'calamitic-bulwark-of-the-last-horizon': { health: 2, defense: 2 },
      'calamitic-aegis-engine-of-severed-fate': { skillPower: .5 },
      'calamitic-monolith-of-the-unmoved-star': { defense: 10 / 3, skillEfficiency: .1 },
      'calamitic-heartforge-of-the-sunless-dawn': { health: 10 / 3, skillPower: 1 / 6 },
      'calamitic-ruinmark-censer': { defense: .5, skillPower: .4 },
      'calamitic-choir-array-of-branded-stars': { health: 7 / 15, defense: 7 / 15 },
    };
    for (const id of phaseFour) for (const level of [0, 5]) {
      const bonuses = stats[id];
      if (!bonuses) continue;
      const result = applyPhaseZeroStaticBonuses(base, slotsWith(id), { [id]: level });
      const scale = 1 + level * .1;
      for (const key of ['health', 'defense'] as const) if (bonuses[key] !== undefined)
        expect(result[key] / base[key]).toBeCloseTo(1 + bonuses[key]! * scale);
      for (const key of ['skillPower', 'skillEfficiency'] as const) if (bonuses[key] !== undefined)
        expect(result[key] - base[key]).toBeCloseTo(bonuses[key]! * scale);
    }
  });

  it('limits Reliquary bonuses to healing or Shield Skills and respects the Efficiency cap', () => {
    for (const level of [0, 5]) {
      const id = 'calamitic-reliquary-of-unending-mercy';
      const state = battle(['tide', 'ember', 'sprout'], { tide: slotsWith(id) }, { [id]: level });
      const actor = state.allies[0];
      const extraPower = calamiticPower(level, 5 / 6, 1.25);
      const extraEfficiency = calamiticPower(level, 7 / 30, .35);
      expect(prepareConduitAction(state, actor, 'skill2', 25, false).skillPower - actor.stats.skillPower!).toBeCloseTo(extraPower);
      expect(conduitActionCost(actor, 'skill2', state, 100)).toBe(Math.ceil(100 * (1 - extraEfficiency)));
      actor.stats.skillEfficiency = .3;
      expect(conduitActionCost(actor, 'skill2', state, 100)).toBe(50);
      expect(prepareConduitAction(state, actor, 'skill1', 25, false).skillPower - actor.stats.skillPower!).toBe(0);
    }
    const healingId = 'calamitic-reliquary-of-unending-mercy';
    const healing = battle(['sprout', 'ember', 'tide'], { sprout: slotsWith(healingId) }, { [healingId]: 5 });
    expect(prepareConduitAction(healing, healing.allies[0], 'skill1', 25, false).skillPower)
      .toBeCloseTo(healing.allies[0].stats.skillPower! + 1.25);
  });

  it('reduces damage consumed by Shields, combines reductions and caps them at 80%', () => {
    const cases: { ids: ConduitId[]; expectedRemaining: number }[] = [
      { ids: ['calamitic-bulwark-of-the-last-horizon'], expectedRemaining: 25 },
      { ids: ['calamitic-aegis-engine-of-severed-fate'], expectedRemaining: 55 },
      { ids: ['pale-bulwark-diadem', 'calamitic-bulwark-of-the-last-horizon', 'calamitic-aegis-engine-of-severed-fate'], expectedRemaining: 80 },
    ];
    for (const test of cases) {
      const state = battle(['ember', 'tide', 'sprout'], { ember: slotsWith(...test.ids) },
        Object.fromEntries(test.ids.map(id => [id, 5])));
      const owner = state.allies[0];
      owner.shield = 100;
      const before = owner.hp;
      const events: BattleEvent[] = [];
      conduitIncoming(state, state.enemies[0], owner, 100, false, false, events);
      expect(owner.shield).toBeCloseTo(test.expectedRemaining);
      expect(owner.hp).toBe(before);
    }
  });

  it('amplifies damage to targets weakened by this wearer, not other Weaken sources', () => {
    const id = 'calamitic-ruinmark-censer';
    for (const level of [0, 5]) {
      const state = battle(['ember', 'tide', 'sprout'], { ember: slotsWith(id) }, { [id]: level });
      const owner = state.allies[0], other = state.allies[1], target = state.enemies[0];
      target.weakened = 2;
      target.weakenSourceId = owner.id;
      expect(nativeDamageTakenMultiplier(state, other, target)).toBeCloseTo(1 + calamiticPower(level, .1, .15));
      target.weakenSourceId = other.id;
      expect(nativeDamageTakenMultiplier(state, owner, target)).toBe(1);
      target.weakened = 0;
      target.weakenSourceId = owner.id;
      expect(nativeDamageTakenMultiplier(state, owner, target)).toBe(1);
    }
  });

  it('triggers Choir from a native Mark, stacks four times, restores Gauge and expires at turn end', () => {
    const id = 'calamitic-choir-array-of-branded-stars';
    const state = battle(['ilvaris', 'ember', 'tide'], { ilvaris: slotsWith(id) }, { [id]: 5 });
    const owner = state.allies[0];
    owner.shatter = 200;
    state.enemies[0].hp = 100000;
    const marked = act(state, owner.id, 'skill1', state.enemies[0].id).state;
    expect(gear(marked.allies[0]).numbers.calamiticChoirTriggers).toBe(1);
    expect(gear(marked.allies[1]).numbers.calamiticChoirSkillPower).toBe(.5);

    for (const ally of marked.allies) {
      ally.stats.shatterCapacity = 300;
      ally.stats.gaugeGain = 1;
      ally.shatter = 0;
    }
    const beforeSeed = marked.seed;
    const events: BattleEvent[] = [];
    for (let index = 0; index < 5; index++) afterCalamiticMark(marked, marked.allies[0], marked.enemies[0], events);
    expect(marked.seed).toBe(beforeSeed);
    expect(gear(marked.allies[0]).numbers.calamiticChoirTriggers).toBe(4);
    for (const ally of marked.allies) {
      expect(ally.shatter).toBe(90);
      expect(gear(ally).numbers.calamiticChoirSkillPower).toBe(2);
      expect(prepareConduitAction(marked, ally, 'skill1', 0, false).skillPower).toBeCloseTo(ally.stats.skillPower! + 2);
    }
    const snapshot = structuredClone(marked);
    expect(gear(snapshot.allies[1]).numbers.calamiticChoirSkillPower).toBe(2);
    snapshot.round++;
    expect(prepareConduitAction(snapshot, snapshot.allies[1], 'skill1', 0, false).skillPower)
      .toBe(snapshot.allies[1].stats.skillPower);
  });

  it('scales the solo Throne only when the Element-Bearer is the entire Squad', () => {
    const id = 'calamitic-throne-of-the-lone-apostate';
    for (const level of [0, 5]) {
      const baseline = battle(['ember'], {});
      const solo = battle(['ember'], { ember: slotsWith(id) }, { [id]: level });
      const lone = solo.allies[0], plain = baseline.allies[0];
      const scale = 1 + level * .1;
      expect(lone.stats.health / plain.stats.health).toBeCloseTo(1 + (5 / 3) * scale);
      expect(lone.stats.defense / plain.stats.defense).toBeCloseTo(1 + (5 / 3) * scale);
      expect(lone.stats.skillPower! - plain.stats.skillPower!).toBeCloseTo((5 / 6) * scale);
      const team = battle(['ember', 'tide'], { ember: slotsWith(id) }, { [id]: level });
      expect(team.allies[0].stats).toEqual(battle(['ember', 'tide'], {}).allies[0].stats);
    }
  });

  it('applies Worldbreaker only to damaging Skills targeting all enemies', () => {
    const id = 'calamitic-worldbreaker-cannonade';
    for (const level of [0, 5]) {
      const state = battle(['atmoso'], { atmoso: slotsWith(id) }, { [id]: level });
      const actor = state.allies[0];
      const global = actor.kit!.abilities.skill2.targets === 'all-enemies';
      const single = actor.kit!.abilities.skill1.targets === 'all-enemies';
      expect(global).toBe(true);
      expect(single).toBe(false);
      const expected = calamiticPower(level, 5 / 3, 2.5);
      expect(prepareConduitAction(state, actor, 'skill2', 0, global).skillPower - actor.stats.skillPower!).toBeCloseTo(expected);
      expect(prepareConduitAction(state, actor, 'skill1', 0, single).skillPower).toBe(actor.stats.skillPower);
    }
  });

  it('enforces the five-item cap in UI, equip transaction, account validation and fighter resolution', () => {
    const ids = phaseFour.slice(0, 6);
    const slots = slotsWith(...ids.slice(0, 5));
    const account = ownedCalamitics(ids);
    account.conduitEquipment = { ember: slots };
    const sixth = ids[5];
    expect(conduitEquipReason(conduits.find(entry => entry.id === sixth)!, 'infernic', slots, 5)).toBe('Five Calamitic limit');
    const page = document.createElement('div');
    page.innerHTML = conduitLoadout('ember', 'Infernis', 'infernic', account);
    const row = page.querySelector<HTMLElement>(`[data-loadout-conduit="${sixth}"]`)!;
    expect(row.querySelector<HTMLButtonElement>('[data-loadout-equip]')!.disabled).toBe(true);
    expect(row.textContent).toContain('Five Calamitic limit');
    expect(() => validateConduitSlots(slotsWith(...ids))).toThrow('five Calamitic');
    expect(() => resolveFighter('ember', undefined, slotsWith(...ids))).toThrow('five Calamitic');
    const saved = testStorage();
    saveAccount(saved.storage, account);
    const before = saved.values.get(ACCOUNT_KEY);
    expect(() => equipConduit(saved.storage, 'ember', 5, sixth)).toThrow('five Calamitic');
    expect(saved.values.get(ACCOUNT_KEY)).toBe(before);
    const invalid = { ...account, conduitEquipment: { ember: slotsWith(...ids) } };
    expect(() => validateAccount(invalid)).toThrow('five Calamitic');
    expect(() => saveAccount(saved.storage, invalid)).toThrow('five Calamitic');
  });

  it('normalizes legacy saves in slot order without read-time writes, then saves v12 on transaction', () => {
    const ids = phaseFour.slice(0, 6);
    const saved = testStorage();
    const account = { ...ownedCalamitics(ids), version: 10 as const,
      conduitEquipment: { ember: slotsWith(...ids) } };
    const raw = JSON.stringify(account);
    saved.values.set(ACCOUNT_KEY, raw);
    const loaded = loadAccount(saved.storage);
    expect(saved.values.get(ACCOUNT_KEY)).toBe(raw);
    expect(saved.writes()).toBe(0);
    expect(loaded.version).toBe(12);
    expect(loaded.conduitEquipment!.ember).toEqual(slotsWith(...ids.slice(0, 5)));
    expect(normalizeLegacyCalamiticSlots(slotsWith(...ids))).toEqual(slotsWith(...ids.slice(0, 5)));
    equipConduit(saved.storage, 'ember', 7, null);
    expect(saved.writes()).toBe(1);
    expect(JSON.parse(saved.values.get(ACCOUNT_KEY)!).version).toBe(12);
  });

  it('purchases a new design for exactly 100 Tokens in one atomic account write', () => {
    const saved = testStorage();
    const account = ownedCalamitics([phaseFour[0]]);
    account.calamityClears = { infernic: 1 };
    account.calamiticTokens = 100;
    saveAccount(saved.storage, account);
    const beforeWrites = saved.writes();
    const purchased = purchaseConduit(saved.storage, phaseFour[1]);
    expect(saved.writes()).toBe(beforeWrites + 1);
    expect(purchased.calamiticTokens).toBe(0);
    expect(purchased.conduits?.[phaseFour[1]]).toBe(1);
  });

  it('rejects a sixth Calamitic Conduit in the authoritative operation', () => {
    const game = freshGame('d435-cap');
    const ids = phaseFour.slice(0, 6);
    game.starterId = 'ember';
    game.account.characters.ember = { level: 0, evolution: 1 };
    game.account.conduits = Object.fromEntries(ids.map(id => [id, 1]));
    game.account.conduitEquipment = { ember: slotsWith(...ids.slice(0, 5)) };
    const entropy = { seed: () => 1729, random: () => .5, uuid: () => '00000000-0000-4000-8000-000000000001' };
    expect(() => resolveOperation(game, { kind: 'equipConduit', character: 'ember', slot: 5, conduit: ids[5] }, entropy))
      .toThrow('five Calamitic');
    expect(game.account.conduitEquipment.ember).toEqual(slotsWith(...ids.slice(0, 5)));
  });
});
