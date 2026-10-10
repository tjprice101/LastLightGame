import { describe, expect, it, vi } from 'vitest';
import { kitConduitDesigns, convertedKitConduitIds } from '../content/kit-conduits';
import { conduits, getConduit, conduitBuffs, conduitEffect, validateConduitElement, validateConduitSlots, type ConduitId, type ConduitSlots } from '../content/conduits';
import { machineConduitDrops, machineConduitLoot, isBannerConduitEligible } from '../content/machines';
import { resolveFighter } from '../content/combat';
import { starters } from '../content/starters';
import { act, createBattle, createInfusionBattle, endTurn, nextStage, nextWave, actionUnavailable, type BattleState, type BattleEvent } from './battle';
import { resolveOmnicInteraction, type OmnicContext } from './kit-conduits';
import { ACCOUNT_KEY, emptyAccount, saveAccount, loadAccount, purchaseConduit, equipConduit, saveAccountRewards, upgradeConduit } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { createCreatureCopy } from './character-instances';
import { conduitInventory, conduitStore, kitConduitRules } from '../presentation/conduit-store';
import { archives } from '../presentation/archives';
import { createSession } from '../presentation/battle-view';
import { unitReadout } from '../presentation/unit-readout';
import type { OmnicRule } from '../content/conduit-kit';

function slots(...ids: ConduitId[]): ConduitSlots {
  return [...ids, ...Array<null>(8 - ids.length).fill(null)];
}
function storage(raw?: unknown): ProfileStorage {
  const data = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  if (raw) data.set(ACCOUNT_KEY, JSON.stringify(raw));
  return { getItem: (key) => data.get(key) ?? null, setItem: vi.fn((key, value) => { data.set(key, value); }),
    removeItem: (key) => { data.delete(key); } };
}
function battle(id: ConduitId): BattleState {
  const owner = starters.find((starter) => starter.elementId === getConduit(id).element)!;
  const roster = [owner.id, ...starters.filter((starter) => starter.id !== owner.id).slice(0, 2).map((starter) => starter.id)];
  const state = createBattle(1729, roster, {}, { [owner.id]: slots(id) });
  state.allies.forEach((ally, index) => {
    ally.stats.health = 1000;
    ally.hp = [900, 400, 700][index];
    ally.shatter = 0;
    ally.stats.shatterCapacity = 100;
    ally.stats.crit = 0;
    ally.readyRound = { skill1: 6, skill2: 5 };
  });
  state.enemies.forEach((enemy) => { enemy.hp = enemy.stats.health = 1e8; enemy.stats.defense = 0; enemy.stats.damage = 0; enemy.stats.crit = 0; });
  return state;
}

describe('replacement Omnic catalog, acquisition and stable identity', () => {
  it('replaces exactly25 entries, retains85 identities, and authors unique bounded interactions and epic devices', () => {
    expect(kitConduitDesigns).toHaveLength(25);
    expect(conduits).toHaveLength(85);
    for (const [rarity, count] of [['Common', 10], ['Rare', 15], ['Legendary', 15], ['Omnic', 45]] as const) {
      expect(conduits.filter((entry) => entry.rarity === rarity)).toHaveLength(count);
    }
    expect(new Set(kitConduitDesigns.map((entry) => entry.id)).size).toBe(25);
    expect(new Set(kitConduitDesigns.map((entry) => JSON.stringify(entry.kitEffects))).size).toBe(25);
    expect(new Set(kitConduitDesigns.map((entry) => entry.artDesign)).size).toBe(25);
    expect(new Set(kitConduitDesigns.map((entry) => entry.theme)).size).toBe(6);
    for (const entry of kitConduitDesigns) {
      expect(entry.rarity).toBe('Omnic');
      expect(entry.element).toBe(entry.theme);
      expect(entry.price).toBeNull();
      expect(entry.artDesign).toContain('fully reborn');
      expect(entry.artDesign).toContain('six majestic');
      expect(entry.artDesign).not.toContain('small bronze');
      expect(entry.buffs.map((buff) => buff.amount)).toEqual([60, 50, 40]);
      expect(new Set(entry.buffs.map((buff) => buff.stat)).size).toBe(3);
      expect(isBannerConduitEligible(entry.id)).toBe(false);
      expect(conduitEffect(getConduit(entry.id), 5)).toContain(entry.effect.slice(entry.effect.indexOf('. ') + 2));
      expect(conduitBuffs(getConduit(entry.id), 5).map((buff) => buff.amount)).toEqual([210, 175, 140]);
    }
  });

  it('rolls each of45 Omnics at1%/45 from stage75 without changing lower totals or roll counts', () => {
    const pool = conduits.filter((entry) => entry.rarity === 'Omnic');
    for (const [index, entry] of pool.entries()) {
      const values = [.08, .035, 0, (index + .5) / pool.length];
      const random = vi.fn(() => values.shift()!);
      expect(machineConduitDrops(75, random)).toEqual({ [entry.id]: 1 });
      expect(random).toHaveBeenCalledTimes(4);
      expect(machineConduitLoot(75).find((drop) => drop.id === entry.id)?.chance).toBeCloseTo(.01 / 45, 12);
      expect(machineConduitLoot(74).some((drop) => drop.id === entry.id)).toBe(false);
    }
    for (const [rarity, chance] of [['Rare', .08], ['Legendary', .035], ['Omnic', .01]] as const) {
      expect(machineConduitLoot(75).filter((drop) => getConduit(drop.id).rarity === rarity).reduce((sum, drop) => sum + drop.chance, 0)).toBeCloseTo(chance);
    }
    const below = vi.fn(() => .99);
    expect(machineConduitDrops(74, below)).toEqual({});
    expect(below).toHaveBeenCalledTimes(2);
    expect(conduits.filter((entry) => isBannerConduitEligible(entry.id))).toHaveLength(5);
  });

  it('removes replacement entries from Store while inventory, Archive and detailed references share live rules', () => {
    const account = { ...emptyAccount(), conduits: Object.fromEntries(kitConduitDesigns.map((entry) => [entry.id, 1])) };
    const saved = storage(account);
    for (const entry of kitConduitDesigns) {
      expect(conduitInventory(account)).toContain(entry.name);
      expect(archives(account, 'conduits')).toContain(entry.name);
      expect(kitConduitRules(slots(entry.id))).toContain(entry.effect.slice(entry.effect.indexOf('. ') + 2));
      expect(conduitStore(account)).not.toContain(entry.name);
      expect(() => purchaseConduit(saved, entry.id)).toThrow('not sold');
    }
    expect(saved.setItem).not.toHaveBeenCalled();
  });

  it('saves actual Omnic machine awards once, preserving raw wallets on overflow and denied writes', () => {
    const state = createInfusionBattle('machines', 75, 1729, 'ember', { level: 0, evolution: 1 });
    state.enemies[0].hp = 1;
    const result = act(state, 'ember', 'light', state.enemies[0].id);
    const reward = result.events.find((entry) => entry.kind === 'reward')!;
    reward.conduits = { 'firstlight-cam': 1, 'duplex-heart': 1, 'worldbreaker-drive': 1 };
    const saved = storage();
    const account = saveAccountRewards(saved, result, 'new-omnic');
    expect(account.conduits).toEqual(reward.conduits);
    expect(saveAccountRewards(saved, result, 'new-omnic')).toEqual(account);
    expect(saved.setItem).toHaveBeenCalledTimes(1);
    const overflowing = storage({ ...emptyAccount(), version: 4, conduits: { 'firstlight-cam': Number.MAX_SAFE_INTEGER } });
    const raw = overflowing.getItem(ACCOUNT_KEY);
    expect(() => saveAccountRewards(overflowing, result, 'overflow')).toThrow();
    expect(overflowing.getItem(ACCOUNT_KEY)).toBe(raw);
    const denied = storage({ ...emptyAccount(), version: 4 });
    const deniedRaw = denied.getItem(ACCOUNT_KEY);
    denied.setItem = () => { throw new Error('Storage unavailable'); };
    expect(() => saveAccountRewards(denied, result, 'denied')).toThrow('Storage unavailable');
    expect(denied.getItem(ACCOUNT_KEY)).toBe(deniedRaw);
  });
});

describe('v5 marker and read-only converted equipment compatibility', () => {
  function legacy() {
    const converted = kitConduitDesigns.filter((entry) => entry.element === 'infernic').map((entry) => entry.id);
    const original = conduits.filter((entry) => entry.element === 'infernic' && !convertedKitConduitIds.has(entry.id)).map((entry) => entry.id);
    const copy = createCreatureCopy('infusion:treasury:0', 1, 65);
    copy.locked = true;
    const equipment = slots(...converted.slice(0, 6), ...original);
    return { ...emptyAccount(), version: 4, fractalis: 4000, lycalis: 37, mechanicalComponents: 5000,
      characters: { ember: { level: 30, evolution: 2, weaponRank: 3 }, tide: { level: 0, evolution: 1 } },
      conduits: Object.fromEntries([...converted, ...original, 'firstlight-cam', 'vigil-core'].map((id) => [id, 2])),
      conduitEquipment: { ember: equipment, tide: slots('tempered-strike-link', 'vigil-core'), [copy.instanceId]: slots('firstlight-cam') },
      conduitUpgrades: { 'tempered-strike-link': 3, 'firstlight-cam': 5 },
      capturedCharacters: [copy], characterLocks: { ember: true }, squad: [copy.instanceId, 'ember'],
      materials: { 'infernic-common': 8 }, dungeonStages: { infernic: 13 }, storyCompleted: 9,
      receipts: ['prior'], creatures: { 'infusion:treasury:0': { defeated: true } },
      bannerPity: { standard: { highestStar: 77, unownedHighestStar: 99 } } };
  }
  it('only unequips converted mismatches/excess, reserves original final slots, preserves ownership/upgrades/locks/squad and writes nothing on load', () => {
    const raw = legacy();
    const saved = storage(raw);
    const before = saved.getItem(ACCOUNT_KEY);
    const account = loadAccount(saved);
    expect(account.version).toBe(5);
    expect(account.conduitEquipment?.ember).toEqual([...raw.conduitEquipment.ember.slice(0, 2), null, null, null, null, ...raw.conduitEquipment.ember.slice(6)]);
    expect(account.conduitEquipment?.tide).toEqual(slots('vigil-core').map((id, index) => index === 1 ? 'vigil-core' : null));
    expect(account.conduitEquipment?.[raw.capturedCharacters[0].instanceId]).toEqual(raw.conduitEquipment[raw.capturedCharacters[0].instanceId]);
    for (const key of ['conduits', 'conduitUpgrades', 'capturedCharacters', 'characterLocks', 'squad', 'characters',
      'materials', 'dungeonStages', 'storyCompleted', 'receipts', 'creatures', 'bannerPity', 'lycalis', 'mechanicalComponents'] as const) {
      expect(account[key]).toEqual(raw[key]);
    }
    expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
    expect(saved.setItem).not.toHaveBeenCalled();
    const purchased = purchaseConduit(saved, 'vigil-core');
    expect(purchased.version).toBe(5);
    expect(saved.setItem).toHaveBeenCalledTimes(1);
    expect(loadAccount(saved)).toEqual(purchased);
    const corrupted = { ...purchased, conduitEquipment: { ...purchased.conduitEquipment, tide: slots('tempered-strike-link') } };
    saved.setItem(ACCOUNT_KEY, JSON.stringify(corrupted));
    const invalidRaw = saved.getItem(ACCOUNT_KEY);
    expect(() => loadAccount(saved)).toThrow('requires');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(invalidRaw);
  });
  it('uses the same compatibility path for v2/v3 without remigrating v4/v5 material and dungeon keys', () => {
    for (const version of [2, 3, 4]) {
      const raw = { ...legacy(), version, dungeonStages: { infernic: 1 } };
      const saved = storage(raw);
      expect(loadAccount(saved).conduitEquipment?.tide?.[0]).toBeNull();
      expect(loadAccount(saved).version).toBe(5);
      expect(saved.setItem).not.toHaveBeenCalled();
    }
    expect(loadAccount(storage({ ...emptyAccount(), version: 4, dungeonStages: { infernic: 13 } })).dungeonStages).toEqual({ infernic: 13 });
    expect(loadAccount(storage({ version: 1, fractalis: 123 })).fractalis).toBe(123);
  });
  it('does not repair other malformed legacy data, including duplicate/unowned converted gear or original element/limit corruption', () => {
    const raw = legacy();
    const original = raw.conduitEquipment.ember.slice(6).filter((id): id is ConduitId => id !== null);
    for (const changed of [
      { ...raw, conduitEquipment: { ember: slots('tempered-strike-link', 'tempered-strike-link') } },
      { ...raw, conduits: {}, conduitEquipment: { tide: slots('tempered-strike-link') } },
      { ...raw, conduitEquipment: { tide: slots(...original) } },
      { ...raw, conduitEquipment: { ember: [null] } },
      { ...raw, conduitUpgrades: { 'tempered-strike-link': 6 } },
    ]) {
      const saved = storage(changed);
      const before = saved.getItem(ACCOUNT_KEY);
      expect(() => loadAccount(saved)).toThrow();
      expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
      expect(saved.setItem).not.toHaveBeenCalled();
    }
  });
  it('preserves legacy raw data on transaction rejection and denied persistence; subsequent retry migrates exactly once', () => {
    const saved = storage(legacy());
    const before = saved.getItem(ACCOUNT_KEY);
    expect(() => equipConduit(saved, 'tide', 0, 'tempered-strike-link')).toThrow('requires');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
    const write = saved.setItem;
    saved.setItem = () => { throw new Error('Denied'); };
    expect(() => purchaseConduit(saved, 'vigil-core')).toThrow('Denied');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
    saved.setItem = write;
    purchaseConduit(saved, 'vigil-core');
    expect(saved.setItem).toHaveBeenCalledTimes(1);
    expect(loadAccount(saved).version).toBe(5);
  });
  it('strictly rejects new/current wrong elements and fifth Omnics at account and fighter boundaries', () => {
    const all = kitConduitDesigns.filter((entry) => entry.element === 'infernic').map((entry) => entry.id);
    expect(() => validateConduitSlots(slots(...all.slice(0, 5)))).toThrow('four');
    expect(() => validateConduitElement(slots('tempered-strike-link'), 'oceanic')).toThrow('requires');
    expect(() => resolveFighter('tide', { level: 0, evolution: 1 }, slots('tempered-strike-link'))).toThrow('requires');
    const saved = storage({ ...emptyAccount(), characters: { ember: { level: 0, evolution: 1 } },
      conduits: Object.fromEntries(all.map((id) => [id, 1])), conduitEquipment: { ember: slots(...all.slice(0, 4)) } });
    const before = saved.getItem(ACCOUNT_KEY);
    expect(() => equipConduit(saved, 'ember', 7, all[4])).toThrow('four');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
  });
});

const expected: Record<string, (state: BattleState) => void> = {
  'tempered-strike-link': (state) => expect(state.allies[0].shatter).toBe(4),
  'mending-valve': (state) => expect(state.allies[1].shatter).toBe(6),
  'ward-stitch-spool': (state) => expect(state.allies[0].shield).toBe(25),
  'cinder-metering-nozzle': (state) => expect(state.enemies[0].burn.turns).toBe(3),
  'pulse-trigger-pawl': (state) => expect(state.allies[0].readyRound.skill1).toBe(5),
  'firstlight-cam': (state) => expect(state.allies[1].readyRound.skill1).toBe(5),
  'secondbeat-rack': (state) => expect(state.enemies[0].conduitMarks?.[state.allies[0].id]).toBe(1),
  'flare-focusing-iris': (state) => expect(state.allies[1].shield).toBe(120),
  'clearwater-manifold': (state) => expect(state.allies[1].shatter).toBe(4),
  'aegis-return-spring': (state) => expect(state.allies[1].attackBoost?.fraction).toBe(.08),
  'emberlife-kiln': (state) => expect(state.allies[1].hp).toBe(420),
  'tension-governor': (state) => expect(state.allies[1].shield).toBe(10),
  'covercharge-drum': (state) => expect(state.allies[0].shield).toBe(40),
  'sootwake-crucible': (state) => expect(state.allies[0].shield).toBe(10),
  'tidebound-reflector': (state) => expect(state.allies[1].shield).toBe(50),
  'pressurecrest-governor': (state) => expect(state.allies[1].shield).toBe(10),
  'rootbound-triage-vault': (state) => expect(state.allies[1].readyRound.skill1).toBe(5),
  'solace-anchor': (state) => expect(state.allies[1].shatter).toBe(5),
  'ruinselect-prism': (state) => expect(state.allies[1].shatter).toBe(4),
  'infernic-pyre-census': (state) => expect(state.allies[0].readyRound).toEqual({ skill1: 5, skill2: 4 }),
  'oceanic-shared-tide-pump': (state) => expect(state.allies[1].hp).toBe(430),
  'atmospheric-storm-clock': (state) => expect(state.allies[0].shatter).toBe(6),
  'botanic-graft-covenant': (state) => expect(state.allies[1].shield).toBe(90),
  'tranquilitic-accord-bastion': (state) => expect(state.allies[1].omnicProtection).toBe(.1),
  'chaotic-fault-verdict': (state) => expect(state.allies[0].hp).toBe(960),
};
function context(state: BattleState, rule: OmnicRule): OmnicContext {
  const owner = state.allies[0];
  state.enemies[0].burn = { damage: 20, turns: 2, sourceId: owner.id };
  state.enemies[0].weakened = 2;
  state.enemies[0].weakenSourceId = owner.id;
  return { trigger: rule.trigger, action: rule.actions?.[0] ?? 'skill1',
    target: ['direct', 'burn-tick', 'fracture-spent'].includes(rule.trigger) ? state.enemies[0] : state.allies[1],
    amount: rule.trigger === 'resource-spent' ? 3 : rule.trigger === 'fracture-spent' ? 2 : 100,
    ownBurn: true, ownWeaken: true, lethal: true, beforeHp: 400, resource: rule.resources?.[0], hpDamage: rule.trigger === 'direct' || rule.trigger === 'critical' ? 100 : undefined };
}

describe('all25 distinct resolved interactions', () => {
  it.each(kitConduitDesigns)('$id resolves its exact new effect once, preserving seeds and source ownership', (entry) => {
    const state = battle(entry.id);
    const rule: OmnicRule = entry.kitEffects.rule;
    if (rule.bank) state.allies[0].omnicMemory = { [entry.id]: { bank: Math.min(2, rule.bank.maximum) } };
    const input = context(state, rule);
    const seeds = [state.seed, state.rewardSeed, state.captureSeed, state.conduitSeed];
    const events: BattleEvent[] = [];
    resolveOmnicInteraction(state, state.allies[0], input, events);
    expect(Object.keys(expected)).toHaveLength(25);
    expected[entry.id](state);
    expect(events.length).toBeGreaterThan(0);
    expect(events.every((event) => event.source === state.allies[0].id)).toBe(true);
    expect(state.allies[0].omnicMemory?.[entry.id].usedRound).toBe(state.round);
    const after = structuredClone(state);
    resolveOmnicInteraction(state, state.allies[0], input, events);
    expect(state).toEqual(after);
    expect([state.seed, state.rewardSeed, state.captureSeed, state.conduitSeed]).toEqual(seeds);
  });

  it.each(kitConduitDesigns)('$id rejects ineffective triggering outcomes and dead owners', (entry) => {
    const state = battle(entry.id);
    const rule: OmnicRule = entry.kitEffects.rule;
    const input = context(state, rule);
    input.amount = 0;
    if (rule.trigger === 'defense') {
      // Defense itself is legal, but neither a missing reserve nor absent authored support qualifies.
      delete state.allies[1].attackBoost;
    }
    const before = structuredClone(state);
    resolveOmnicInteraction(state, state.allies[0], input, []);
    expect(state).toEqual(before);
    state.allies[0].hp = 0;
    const dead = structuredClone(state);
    input.amount = 100;
    resolveOmnicInteraction(state, state.allies[0], input, []);
    expect(state).toEqual(dead);
  });

  it('banks only once per round, clamps reserves, and cannot recursively earn native resources from generated healing/shields', () => {
    const state = battle('tempered-strike-link');
    const owner = state.allies[0];
    for (let round = 1; round <= 6; round++) {
      state.round = round;
      resolveOmnicInteraction(state, owner, { trigger: 'burn-tick', amount: 100 }, []);
      resolveOmnicInteraction(state, owner, { trigger: 'burn-tick', amount: 100 }, []);
      expect(owner.omnicMemory?.['tempered-strike-link'].bank).toBe(Math.min(3, round));
    }
    const generated = battle('emberlife-kiln');
    generated.allies[0].pilot = { ember: 2 };
    generated.allies[1].pilot = { bloom: 1 };
    resolveOmnicInteraction(generated, generated.allies[0], { trigger: 'burn-tick', amount: 100 }, []);
    expect(generated.allies[0].pilot).toEqual({ ember: 2 });
    expect(generated.allies[1].pilot).toEqual({ bloom: 1 });
  });

  it('retains authored provenance when stronger existing shields prevent Conduit refresh, and rejects full healing/cooldown/mark feedback', () => {
    const state = battle('ward-stitch-spool');
    const owner = state.allies[0];
    owner.shield = 100;
    owner.pilot = { authoredShieldSourceId: owner.id };
    resolveOmnicInteraction(state, owner, { trigger: 'shield-absorbed', amount: 100 }, []);
    expect(owner.shield).toBe(100);
    expect(owner.pilot.authoredShieldSourceId).toBe(owner.id);
    expect(owner.omnicMemory).toBeUndefined();
    owner.shield = 0;
    resolveOmnicInteraction(state, owner, { trigger: 'shield-absorbed', amount: 100 }, []);
    expect(owner.pilot.authoredShieldSourceId).toBeUndefined();
    const triage = battle('rootbound-triage-vault');
    triage.allies[1].readyRound = { skill1: 2, skill2: 2 };
    resolveOmnicInteraction(triage, triage.allies[0], { trigger: 'heal', target: triage.allies[1], amount: 100, beforeHp: 400 }, []);
    expect(triage.allies[1].readyRound).toEqual({ skill1: 2, skill2: 2 });
    expect(triage.allies[0].omnicMemory).toBeUndefined();
  });
});

describe('live authored hooks, settings snapshots, reset and upgrade independence', () => {
  it('uses actual Burn HP damage, never shield-only/zero ticks or a dead source', () => {
    const state = battle('tempered-strike-link');
    state.enemies.forEach((enemy) => { enemy.burn = { damage: 10, turns: 2, sourceId: state.allies[0].id }; });
    const ticked = endTurn(state);
    expect(ticked.state.allies[0].omnicMemory?.['tempered-strike-link'].bank).toBe(1);
    const blocked = structuredClone(state);
    blocked.enemies.forEach((enemy) => { enemy.shield = 100; });
    expect(endTurn(blocked).state.allies[0].omnicMemory).toBeUndefined();
    const dead = structuredClone(state);
    dead.allies[0].hp = 0;
    expect(endTurn(dead).state.allies[0].omnicMemory).toBeUndefined();
  });

  it('cannot spend a newly created Cinder relay in the same activation, and preserves its clock extension through authored reapplication', () => {
    const state = battle('cinder-metering-nozzle');
    state.allies[0].readyRound = { skill1: 1, skill2: 1 };
    state.allies[0].shatter = 100;
    let result = act(state, 'ember', 'skill1', state.enemies[0].id).state;
    expect(result.enemies[0].burn.turns).toBe(2);
    expect(result.allies[0].omnicMemory?.['cinder-metering-nozzle'].bank).toBe(1);
    result.round = 3;
    result.allies[0].spent = false;
    result.allies[0].shatter = 100;
    result = act(result, 'ember', 'skill1', result.enemies[0].id).state;
    expect(result.enemies[0].burn.turns).toBe(3);
    expect(result.allies[0].omnicMemory?.['cinder-metering-nozzle'].bank).toBe(0);
    const foreign = structuredClone(state);
    foreign.enemies[0].burn = { damage: 10, turns: 2, sourceId: foreign.allies[1].id };
    foreign.allies[0].omnicMemory = { 'cinder-metering-nozzle': { bank: 1 } };
    const notSpent = act(foreign, 'ember', 'skill2', foreign.enemies[0].id).state;
    expect(notSpent.allies[0].omnicMemory?.['cinder-metering-nozzle'].bank).toBe(1);
  });

  it('uses actual healing, including passives, and does not count overhealing or Conduit healing', () => {
    const state = battle('mending-valve');
    state.allies[0].readyRound = { skill1: 1, skill2: 1 };
    state.allies[0].shatter = 100;
    const healed = act(state, 'sprout', 'skill2', state.enemies[0].id);
    expect(healed.state.allies[0].omnicMemory?.['mending-valve'].bank).toBe(1);
    const full = structuredClone(state);
    full.allies.forEach((ally) => { ally.hp = ally.stats.health; });
    expect(act(full, 'sprout', 'skill2', full.enemies[0].id).state.allies[0].omnicMemory).toBeUndefined();
    expect(endTurn(state).state.allies[0].omnicMemory?.['mending-valve'].bank).toBe(1);
  });

  it('tracks authored shield absorption independently from captured/native resource eligibility', () => {
    const state = battle('clearwater-manifold');
    state.allies[0].readyRound = { skill1: 1, skill2: 1 };
    state.allies[0].shatter = 100;
    const shielded = act(state, 'tide', 'skill2', state.enemies[0].id).state;
    shielded.enemies.forEach((enemy) => { enemy.stats.damage = 100; });
    expect(endTurn(shielded).state.allies.slice(1).reduce((sum, ally) => sum + ally.shatter, 0)).toBeGreaterThanOrEqual(4);
    const fake = structuredClone(state);
    fake.allies.forEach((ally) => { ally.shield = 100; });
    fake.enemies.forEach((enemy) => { enemy.stats.damage = 100; });
    expect(endTurn(fake).state.allies[0].omnicMemory).toBeUndefined();
  });

  it('refunds real spent native resources, keeps one AoE gate and preserves recovery/costs', () => {
    const owner = starters.find((starter) => starter.id === 'atmoso')!;
    const state = createBattle(1729, [owner.id], {}, { [owner.id]: slots('atmospheric-storm-clock') });
    state.allies[0].pilot = { tempest: 3 };
    state.allies[0].shatter = 100;
    state.enemies.forEach((enemy) => { enemy.hp = enemy.stats.health = 1e8; });
    const result = act(state, owner.id, 'ultimate', state.enemies[0].id);
    expect(result.state.allies[0].shatter).toBe(6);
    expect(result.state.allies[0].pilot?.tempest).toBe(0);
    expect(result.state.allies[0].recoverThrough).toBe(2);
    expect(actionUnavailable(result.state, result.state.allies[0], 'light')).not.toBeNull();
    expect(result.events.filter((event) => event.message.includes('returns 6 Gauge'))).toHaveLength(1);
  });

  it('supports real captured Fracture capability without inventing native resources or consuming extra rolls', () => {
    const copy = createCreatureCopy('infusion:abyss:0', undefined, 80);
    const state = createBattle(1729, [copy.instanceId, 'ember'], { ember: { level: 0, evolution: 1 } },
      { [copy.instanceId]: slots('ruinselect-prism', 'ominous-nightglass-archive') }, [copy]);
    state.allies[0].stats.crit = 0;
    state.allies[0].shatter = 100;
    state.enemies.forEach((enemy) => { enemy.hp = enemy.stats.health = 1e8; enemy.stats.damage = 0; });
    const marked = act(state, copy.instanceId, 'skill1', state.enemies[0].id).state;
    expect(marked.enemies[0].conduitMarks?.[copy.instanceId]).toBe(1);
    marked.allies[0].spent = false;
    const control = structuredClone(marked);
    control.allies[0].conduits = slots('ominous-nightglass-archive');
    const result = act(marked, copy.instanceId, 'light', marked.enemies[0].id);
    const ordinary = act(control, copy.instanceId, 'light', control.enemies[0].id);
    expect(result.state.allies[1].shatter).toBe(2);
    expect(result.state.allies[0].pilot).toBeUndefined();
    expect(result.state.seed).toBe(ordinary.state.seed);
    expect(result.state.rewardSeed).toBe(ordinary.state.rewardSeed);
    expect(result.events.filter((event) => event.kind === 'damage')).toEqual(ordinary.events.filter((event) => event.kind === 'damage'));
    const cooled = battle('firstlight-cam');
    cooled.allies[1].readyRound = { skill1: 8, skill2: 7 };
    cooled.allies[0].omnicMemory = { 'firstlight-cam': { bank: 1 } };
    cooled.allies[1].kit!.unavailableActions = ['skill1', 'skill2'];
    resolveOmnicInteraction(cooled, cooled.allies[0], { trigger: 'direct', action: 'light', target: cooled.enemies[0], amount: 10 }, []);
    expect(cooled.allies[1].readyRound).toEqual({ skill1: 8, skill2: 7 });
    expect(cooled.allies[0].omnicMemory['firstlight-cam'].bank).toBe(1);
  });

  it('generated Rose recovery never feeds intrinsic Rose/Bloom loops and requires a genuinely spent resource', () => {
    const state = createBattle(1729, ['crinso'], {}, { crinso: slots('chaotic-fault-verdict') });
    state.allies[0].pilot = { duality: 3 };
    state.allies[0].hp /= 2;
    state.allies[0].shatter = 100;
    state.enemies.forEach((enemy) => { enemy.hp = enemy.stats.health = 1e8; });
    const result = act(state, 'crinso', 'ultimate', state.enemies[0].id);
    expect(result.state.allies[0].hp).toBeGreaterThan(state.allies[0].hp);
    expect(result.state.allies[0].pilot?.duality).toBe(0);
    expect(result.state.allies[0].pilot?.bloom).toBeUndefined();
    expect(result.events.filter((event) => event.kind === 'heal')).toHaveLength(1);
    const empty = structuredClone(state);
    empty.allies[0].pilot = {};
    expect(act(empty, 'crinso', 'ultimate', empty.enemies[0].id).events.some((event) => event.kind === 'heal')).toBe(false);
  });

  it('support protection applies to one direct hit only and cannot decorate overhealing or reduce periodic Burn', () => {
    const state = battle('tranquilitic-accord-bastion');
    const owner = state.allies[0];
    const target = state.allies[1];
    resolveOmnicInteraction(state, owner, { trigger: 'support', target, amount: 100 }, []);
    state.allies[2].hp = 0;
    owner.hp = 0;
    state.enemies.forEach((enemy) => { enemy.stats.damage = 100; });
    const defended = endTurn(state);
    expect(defended.state.allies[1].omnicProtection).toBeUndefined();
    const control = structuredClone(state);
    delete control.allies[1].omnicProtection;
    const hits = defended.events.filter((event) => event.kind === 'damage' && event.target === target.id);
    const controlHits = endTurn(control).events.filter((event) => event.kind === 'damage' && event.target === target.id);
    expect(hits[0].amount).toBeLessThan(controlHits[0].amount);
    expect(hits.slice(1).map((event) => event.amount)).toEqual(controlHits.slice(1).map((event) => event.amount));
  });

  it('makes all Tranquilitic support devices reachable through Bliss’s real healing/Bloom shield kit, not invented Attack support', () => {
    const state = createBattle(1729, ['bliss', 'ember'], {}, { bliss: slots('aegis-return-spring', 'solace-anchor', 'firstlight-cam', 'tranquilitic-accord-bastion') });
    state.allies[0].pilot = { bloom: 3 };
    state.allies[0].shatter = 100;
    state.allies[1].hp /= 2;
    state.enemies.forEach((enemy) => { enemy.hp = enemy.stats.health = 1e8; enemy.stats.damage = 0; });
    let resolved = act(state, 'bliss', 'ultimate', state.enemies[0].id).state;
    expect(resolved.allies[0].omnicMemory?.['aegis-return-spring'].bank).toBe(1);
    expect(resolved.allies[0].omnicMemory?.['firstlight-cam'].bank).toBe(1);
    expect(resolved.allies[0].omnicMemory?.['solace-anchor'].bank).toBe(1);
    expect(resolved.allies[1].omnicProtection).toBe(.1);
    resolved = endTurn(endTurn(resolved).state).state;
    const beforeGauge = resolved.allies[1].shatter;
    resolved = act(resolved, 'bliss', 'defend', resolved.enemies[0].id).state;
    expect(resolved.allies[1].attackBoost).toMatchObject({ fraction: .08, origin: 'conduit' });
    expect(resolved.allies[1].shatter).toBe(beforeGauge + 5);
    expect(resolved.allies[0].omnicMemory?.['aegis-return-spring'].bank).toBe(0);
    expect(resolved.allies[0].omnicMemory?.['solace-anchor'].bank).toBe(0);
  });

  it('preserves banks/gates in clones/Settings and resets all replacement state at new encounters', () => {
    const state = battle('tempered-strike-link');
    state.allies[0].omnicMemory = { 'tempered-strike-link': { bank: 3, bankRound: 1, usedRound: 1 } };
    state.allies[0].omnicProtection = .1;
    const cloned = structuredClone(state);
    cloned.allies[0].omnicMemory!['tempered-strike-link'].bank = 1;
    expect(state.allies[0].omnicMemory['tempered-strike-link'].bank).toBe(3);
    state.phase = 'cleared';
    const continued = nextWave(state).state;
    expect(continued.allies[0].omnicMemory).toBeUndefined();
    expect(continued.allies[0].omnicProtection).toBeUndefined();
    const session = createSession('ember', { level: 0, evolution: 1 }, { mode: 'machines', stage: 75 },
      { ids: ['ember'], progress: { ember: { level: 0, evolution: 1 } }, equipment: { ember: slots('tempered-strike-link') } });
    session.state.allies[0].omnicMemory = structuredClone(state.allies[0].omnicMemory);
    session.state.phase = 'cleared';
    expect(nextStage(session.state, { level: 0, evolution: 1 }).state.allies[0].omnicMemory).toBeUndefined();
    expect(unitReadout(state.allies[0])).toContain('stored reserve 3');
    expect(unitReadout(state.allies[0], true)).not.toContain('stored reserve');
  });

  it('scales stat vectors only with account upgrades, retaining fixed interaction coefficients and surviving saved old levels', () => {
    const saved = storage({ ...emptyAccount(), version: 4, mechanicalComponents: 10000,
      characters: { ember: { level: 0, evolution: 1 } }, conduits: { 'tempered-strike-link': 1 },
      conduitUpgrades: { 'tempered-strike-link': 1 } });
    const upgraded = upgradeConduit(saved, 'tempered-strike-link', 1);
    expect(upgraded.conduitUpgrades?.['tempered-strike-link']).toBe(2);
    const base = resolveFighter('ember', { level: 0, evolution: 1 });
    const unit = resolveFighter('ember', { level: 0, evolution: 1 }, slots('tempered-strike-link'), { 'tempered-strike-link': 5 });
    expect(unit.stats.damage).toBeCloseTo(base.stats.damage * 3.1);
    for (const level of [0, 5]) {
      const state = createBattle(1, ['ember'], {}, { ember: slots('tempered-strike-link') }, [], { 'tempered-strike-link': level });
      state.allies[0].omnicMemory = { 'tempered-strike-link': { bank: 3 } };
      resolveOmnicInteraction(state, state.allies[0], { trigger: 'direct', action: 'light', amount: 1 }, []);
      expect(state.allies[0].shatter).toBe(6);
    }
  });
});
