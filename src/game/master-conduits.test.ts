import { describe, expect, it, vi } from 'vitest';
import { existsSync } from 'node:fs';
import { masterConduits, masterChestDrops, getMasterConduit, type MasterConduitId } from '../content/master-conduits';
import { starters } from '../content/starters';
import { resolveFighter } from '../content/combat';
import { conduits } from '../content/conduits';
import { creatureLoot, getCreature } from '../content/creatures';
import { createBattle, createInfusionBattle, withMasterLoadouts, act, endTurn, nextStage, nextWave, type BattleEvent } from './battle';
import { resolveOmnicInteraction } from './kit-conduits';
import { ACCOUNT_KEY, emptyAccount, saveAccount, loadAccount, validateAccount, openMasterChest, equipMasterConduit, equipConduit, saveAccountRewards, type Account } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { createSession } from '../presentation/battle-view';
import { unitReadout } from '../presentation/unit-readout';
import { inventoryView } from '../presentation/inventory';
import { referenceTeam } from '../presentation/reference-team';
import { archives } from '../presentation/archives';
import { lootItems } from '../presentation/battle-loot';
import { encounterRewards } from '../presentation/battle-results';
import { validateSaveFile } from './save-file';
import { freshGame, resolveOperation } from '../../supabase/functions/game-operation/engine';

function storage(account?: Partial<Account>): ProfileStorage {
  const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  const saved = { getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
  saveAccount(saved, { ...emptyAccount(), characters: { ember: { level: 0, evolution: 1 }, tide: { level: 0, evolution: 1 } },
    squad: ['ember'], masterChests: 2, ...account });
  return saved;
}
function masterState(id: MasterConduitId) {
  const entry = getMasterConduit(id);
  const other = entry.character === 'ember' ? 'tide' : 'ember';
  const state = withMasterLoadouts(createBattle(1729, [entry.character, other]), { [entry.character]: id });
  state.allies.forEach(ally => { ally.hp = ally.stats.health / 2; ally.shatter = 0; ally.readyRound = { skill1: 9, skill2: 10 }; });
  const owner = state.allies[0], target = state.enemies[0];
  target.hp = target.stats.health = 10000;
  target.burn = { damage: 10, turns: 2, sourceId: owner.id };
  target.weakened = 2; target.weakenSourceId = owner.id;
  return { state, owner, target };
}

describe('character Masters and chest contracts', () => {
  it('has exactly three unique Omnic Masters for every Element-Bearer, outside the ordinary catalog', () => {
    expect(masterConduits).toHaveLength(starters.length * 3);
    expect(new Set(masterConduits.map(entry => entry.id)).size).toBe(48);
    expect(new Set(masterConduits.map(entry => entry.name)).size).toBe(48);
    for (const character of starters) expect(masterConduits.filter(entry => entry.character === character.id)).toHaveLength(3);
    expect(masterConduits.every(entry => entry.rarity === 'Omnic' && entry.art === `master-conduits/${entry.id}.png`)).toBe(true);
    expect(conduits).toHaveLength(85);
  });
  it('gives every Master a distinct effect and a distinct rule within each character', () => {
    expect(new Set(masterConduits.map(entry => entry.effect)).size).toBe(48);
    const signature = (entry: (typeof masterConduits)[number]) => JSON.stringify(entry.rule);
    expect(new Set(masterConduits.map(signature)).size).toBe(48);
    const shapes = masterConduits.map(entry => `${entry.rule.trigger}:${entry.rule.bank?.trigger ?? ''}:${
      entry.rule.outcomes.map(outcome => `${outcome.kind}/${outcome.recipient ?? 'self'}`).join('+')}`);
    expect(new Set(shapes).size).toBeGreaterThanOrEqual(40);
    for (const character of starters) {
      const own = masterConduits.filter(entry => entry.character === character.id);
      expect(new Set(own.map(entry => entry.rule.trigger + (entry.rule.bank?.trigger ?? ''))).size).toBe(3);
    }
  });
  it('keeps every enhancement recurring without copying passive healing, Gauge or native charges', () => {
    for (const entry of masterConduits) {
      expect(entry.effect).not.toMatch(/once per round/i);
      expect(entry.rule.outcomes.some(outcome => outcome.kind === 'charge')).toBe(false);
      const passive = resolveFighter(entry.character).passive;
      if (passive.healFraction > 0) expect(entry.rule.outcomes.some(outcome => outcome.kind === 'heal')).toBe(false);
      if (passive.lightGaugeBonus) expect(entry.rule.outcomes.some(outcome => outcome.kind === 'gauge')).toBe(false);
      if (entry.rule.trigger === 'burn-tick') expect(entry.rule.outcomes.some(outcome => outcome.kind === 'burn-clock')).toBe(false);
    }
  });
  it('rolls exactly below 1%, only final boss, without consuming entropy elsewhere', () => {
    for (const stage of [1, 5, 75, 95, 99]) {
      const random = vi.fn(() => 0);
      expect(masterChestDrops(stage, true, random)).toBe(0);
      expect(random).not.toHaveBeenCalled();
    }
    expect(masterChestDrops(100, false, () => { throw new Error('Unexpected RNG'); })).toBe(0);
    expect(masterChestDrops(100, true, () => .009999999)).toBe(1);
    expect(masterChestDrops(100, true, () => .01)).toBe(0);
    for (const invalid of [-1, 1, NaN, Infinity]) expect(() => masterChestDrops(100, true, () => invalid)).toThrow();
  });
  it('exposes chest loot only at the actual final Machines boss stage', () => {
    expect(creatureLoot(getCreature('infusion:machines:5'), 99).some(drop => drop.id === 'grand-master-chest')).toBe(false);
    expect(creatureLoot(getCreature('infusion:machines:5'), 100).find(drop => drop.id === 'grand-master-chest'))
      .toMatchObject({ chance: .01, minimum: 1, maximum: 1 });
  });
  it('loads legacy accounts without writes or granting anything', () => {
    const saved = storage();
    const legacy = emptyAccount();
    saved.setItem(ACCOUNT_KEY, JSON.stringify(legacy));
    const write = vi.spyOn(saved, 'setItem');
    const account = loadAccount(saved);
    expect(account.masterChests).toBeUndefined();
    expect(account.masterConduits).toBeUndefined();
    expect(write).not.toHaveBeenCalled();
  });
  it('opens one chest for a future-character unlock in one write without auto-equipping', () => {
    const saved = storage();
    const write = vi.spyOn(saved, 'setItem');
    const account = openMasterChest(saved, 'master-nerithe-2');
    expect(write).toHaveBeenCalledOnce();
    expect(account.masterChests).toBe(1);
    expect(account.masterConduits).toEqual({ 'master-nerithe-2': 1 });
    expect(account.characters.nerithe).toBeUndefined();
    expect(account.masterEquipment).toBeUndefined();
    expect(account.fractalis).toBe(0);
  });
  it('rejects duplicates, no chest, forged IDs, captures and mismatch without changing storage', () => {
    const saved = storage({ masterConduits: { 'master-ember-1': 1 } });
    const raw = saved.getItem(ACCOUNT_KEY);
    expect(() => openMasterChest(saved, 'master-ember-1')).toThrow('already owned');
    expect(() => equipMasterConduit(saved, 'tide', 'master-ember-1')).toThrow('named');
    expect(() => equipMasterConduit(saved, 'sprout', 'master-sprout-1')).toThrow('owned Element-Bearer');
    expect(() => equipConduit(saved, 'ember', 0, 'master-ember-1' as never)).toThrow('owned Conduit');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    expect(() => openMasterChest(storage({ masterChests: 0 }), 'master-ember-1')).toThrow('No Cosmic');
    expect(() => validateAccount({ ...loadAccount(saved), masterChests: Number.MAX_SAFE_INTEGER + 1 })).toThrow('chest count');
    expect(() => validateAccount({ ...loadAccount(saved), masterConduits: { 'master-ember-1': 2 } })).toThrow('unlock');
    expect(() => validateAccount({ ...loadAccount(saved), masterEquipment: { 'capture:fake': 'master-ember-1' } })).toThrow('owned Element-Bearer');
    expect(() => validateAccount({ ...loadAccount(saved), masterEquipment: { tide: 'master-ember-1' } })).toThrow('named');
    expect(() => openMasterChest(saved, 'missing' as never)).toThrow('valid Master');
  });
  it('keeps the raw wallet and chest on write failure, and preserves save-file round trips', () => {
    const saved = storage();
    const raw = saved.getItem(ACCOUNT_KEY);
    vi.spyOn(saved, 'setItem').mockImplementation(() => { throw new Error('Disk denied'); });
    expect(() => openMasterChest(saved, 'master-ember-1')).toThrow('Disk denied');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    const account = loadAccount(storage({ masterConduits: { 'master-ember-1': 1 }, masterEquipment: { ember: 'master-ember-1' } }));
    const file = validateSaveFile({ format: 'last-light-save', version: 1, profile: { version: 1, starterId: 'ember' }, account });
    expect(file.account.masterEquipment).toEqual(account.masterEquipment);
    expect(file.account.masterChests).toBe(2);
  });
  it('swaps/removes exactly one Master without ordinary slot or inventory changes', () => {
    const saved = storage({ masterConduits: { 'master-ember-1': 1, 'master-ember-2': 1 }, conduitEquipment: { ember: Array(8).fill(null) } });
    equipMasterConduit(saved, 'ember', 'master-ember-1');
    expect(equipMasterConduit(saved, 'ember', 'master-ember-2').masterEquipment?.ember).toBe('master-ember-2');
    const account = equipMasterConduit(saved, 'ember', null);
    expect(account.masterEquipment?.ember).toBeNull();
    expect(account.conduitEquipment?.ember).toEqual(Array(8).fill(null));
    expect(account.masterConduits).toEqual({ 'master-ember-1': 1, 'master-ember-2': 1 });
  });
  it('saves and deduplicates a final-boss chest together with ordinary kill rewards', () => {
    const saved = storage({ infusionStages: { machines: 100 } });
    const state = createInfusionBattle('machines', 100, 1, 'ember', { level: 0, evolution: 1 });
    state.enemies[0].hp = 0; state.phase = 'cleared';
    const reward: BattleEvent = { kind: 'reward', source: state.enemies[0].id, target: '', amount: 15, critical: false, message: 'Saved kill', masterChests: 1 };
    const write = vi.spyOn(saved, 'setItem');
    const account = saveAccountRewards(saved, { state, events: [reward] }, 'master-run');
    expect(write).toHaveBeenCalledOnce();
    expect(account.masterChests).toBe(3);
    expect(account.fractalis).toBe(15);
    expect(lootItems(reward).find(item => item.id === 'grand-master-chest')?.amount).toBe(1);
    expect(encounterRewards([reward, reward]).find(item => item.id === 'grand-master-chest')?.amount).toBe(1);
    saveAccountRewards(saved, { state, events: [reward] }, 'master-run');
    expect(write).toHaveBeenCalledOnce();
    const raw = saved.getItem(ACCOUNT_KEY);
    const wrong = createInfusionBattle('machines', 95, 1, 'ember', { level: 0, evolution: 1 });
    wrong.enemies[0].hp = 0; wrong.phase = 'cleared';
    expect(() => saveAccountRewards(saved, { state: wrong, events: [{ ...reward, source: wrong.enemies[0].id }] }, 'wrong')).toThrow('final');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    const overflow = storage({ masterChests: Number.MAX_SAFE_INTEGER, infusionStages: { machines: 100 } });
    const before = overflow.getItem(ACCOUNT_KEY);
    expect(() => saveAccountRewards(overflow, { state, events: [reward] }, 'overflow')).toThrow('capacity');
    expect(overflow.getItem(ACCOUNT_KEY)).toBe(before);
  });
  it('uses a dedicated chest stream without changing existing reward or combat RNG', () => {
    const first = createInfusionBattle('machines', 100, 1729, 'ember', { level: 0, evolution: 1 });
    first.allies[0].stats.damage = 1e12; first.enemies[0].hp = 1;
    const second = structuredClone(first);
    first.masterChestSeed = 1;
    second.masterChestSeed = 0x12345678;
    const a = act(first, 'ember', 'light', first.enemies[0].id), b = act(second, 'ember', 'light', second.enemies[0].id);
    const strip = (events: BattleEvent[]) => events.map(({ masterChests: _chest, ...event }) => event);
    expect(strip(a.events)).toEqual(strip(b.events));
    for (const key of ['seed', 'rewardSeed', 'conduitSeed', 'componentSeed'] as const) expect(a.state[key]).toBe(b.state[key]);
    expect(a.events.find(event => event.kind === 'reward')?.masterChests).toBe(1);
    expect(b.events.find(event => event.kind === 'reward')?.masterChests).toBeUndefined();
  });
});

describe('all Master rules and frozen sessions', () => {
  it.each(masterConduits)('$name remains active for subsequent qualifying outcomes in the same round without extra RNG', entry => {
    const { state, owner, target } = masterState(entry.id);
    if (entry.rule.bank) owner.omnicMemory = { [entry.id]: { bank: 3 } };
    const ally = state.allies[1];
    const enemyTrigger = ['direct', 'critical', 'burn-applied', 'weaken-applied', 'burn-tick', 'activation'].includes(entry.rule.trigger);
    const context = { trigger: entry.rule.trigger, action: entry.rule.actions?.[0], target: enemyTrigger ? target : ally,
      amount: entry.rule.trigger === 'resource-spent' ? 2 : 10, hpDamage: 10, ownBurn: true, ownWeaken: true,
      lethal: true, beforeHp: 1, resource: entry.rule.resources?.[0], attacker: target };
    const events: BattleEvent[] = [];
    resolveOmnicInteraction(state, owner, context, events);
    expect(events.length).toBeGreaterThan(0);
    expect(owner.omnicMemory?.[entry.id]?.usedRound).toBeUndefined();
    expect(owner.shatter).toBeLessThanOrEqual(owner.stats.shatterCapacity);
    expect(owner.shield).toBeLessThanOrEqual(owner.stats.health * .45 + 1);
    state.allies.forEach(ally => {
      ally.hp = ally.stats.health / 2;
      ally.shatter = 0;
      ally.shield = 0;
      ally.readyRound = { skill1: 9, skill2: 10 };
      delete ally.attackBoost;
      delete ally.omnicProtection;
    });
    target.hp = 10000;
    target.burn.turns = 2;
    target.weakened = 2;
    delete target.conduitMarks;
    owner.omnicMemory = { ...owner.omnicMemory, [entry.id]: {
      ...(entry.rule.bank ? { bank: 3 } : {}), usedRound: state.round, bankRound: state.round,
    } };
    const count = events.length;
    resolveOmnicInteraction(state, owner, context, events);
    expect(events.length).toBeGreaterThan(count);
    expect(state.seed).toBe(1729);
    if (entry.rule.bank) expect(owner.omnicMemory?.[entry.id]?.bank).toBe(0);
  });
  it('banks only effective authored events, caps at three, keeps same chosen recipient for multiple rewards', () => {
    const { state, owner } = masterState('master-sprout-2');
    const events: BattleEvent[] = [];
    resolveOmnicInteraction(state, owner, { trigger: 'heal', target: owner, amount: 0 }, events);
    expect(owner.omnicMemory).toBeUndefined();
    for (let round = 1; round <= 5; round++) {
      state.round = round;
      resolveOmnicInteraction(state, owner, { trigger: 'heal', target: owner, amount: 1 }, events);
      resolveOmnicInteraction(state, owner, { trigger: 'heal', target: owner, amount: 1 }, events);
    }
    expect(owner.omnicMemory?.['master-sprout-2']?.bank).toBe(3);
    const pair = masterState('master-disciple-1');
    const third = createBattle(1, ['tide']).allies[0]; pair.state.allies.push(third);
    const combined: BattleEvent[] = [];
    resolveOmnicInteraction(pair.state, pair.owner, { trigger: 'support', target: pair.state.allies[1], amount: 1 }, combined);
    expect(combined.map(event => event.target)).toEqual([pair.state.allies[1].id, pair.state.allies[1].id]);
  });
  it.each(masterConduits.filter(entry => entry.rule.bank))('$name banks each qualifying native outcome in one round up to three', entry => {
    const { state, owner } = masterState(entry.id);
    const bank = entry.rule.bank!;
    const events: BattleEvent[] = [];
    for (let index = 0; index < 5; index++) {
      resolveOmnicInteraction(state, owner, { trigger: bank.trigger, target: state.allies[1], amount: 1 }, events);
      expect(owner.omnicMemory?.[entry.id]?.bank).toBe(Math.min(3, index + 1));
    }
    expect(owner.omnicMemory?.[entry.id]?.bankRound).toBeUndefined();
  });
  it('preserves ordinary Conduit round limits beside a recurring equipped Master', () => {
    const ordinary = conduits.find(entry => 'kitEffects' in entry && entry.kitEffects.rule.trigger === 'critical' && !('bank' in entry.kitEffects.rule));
    if (!ordinary || !('kitEffects' in ordinary)) throw new Error('Missing ordinary critical rule fixture.');
    const { state, owner, target } = masterState('master-atmoso-1');
    owner.conduits = [ordinary.id, null, null, null, null, null, null, null];
    const events: BattleEvent[] = [];
    const context = { trigger: 'critical' as const, target, amount: 10, hpDamage: 10 };
    resolveOmnicInteraction(state, owner, context, events);
    expect(owner.omnicMemory?.[ordinary.id]?.usedRound).toBe(state.round);
    const memory = structuredClone(owner.omnicMemory?.[ordinary.id]);
    const before = target.hp;
    const count = events.length;
    resolveOmnicInteraction(state, owner, context, events);
    expect(owner.omnicMemory?.[ordinary.id]).toEqual(memory);
    expect(target.hp).toBeLessThan(before);
    expect(events.slice(count).every(event => event.message.includes('Sky Without End Turbine'))).toBe(true);
  });
  it('repeats every native AoE critical payoff, not just the first target, and never recursively triggers on strikes', () => {
    const { state, owner } = masterState('master-atmoso-1');
    owner.shatter = owner.stats.shatterCapacity;
    owner.readyRound.skill2 = state.round;
    owner.stats.crit = 1;
    state.enemies.forEach(enemy => { enemy.hp = enemy.stats.health = 10000; });
    const result = act(state, owner.id, 'skill2', state.enemies[0].id);
    const followups = result.events.filter(event => event.kind === 'damage' && event.message.includes('Sky Without End Turbine'));
    expect(followups).toHaveLength(state.enemies.length);
    expect(new Set(followups.map(event => event.target)).size).toBe(state.enemies.length);
    expect(result.state.allies[0].omnicMemory?.['master-atmoso-1']?.usedRound).toBeUndefined();
  });
  it('does not make Burn self-sustaining when each tick receives the persistent Master enhancement', () => {
    const { state, owner, target } = masterState('master-ember-1');
    state.enemies.forEach(enemy => {
      enemy.hp = enemy.stats.health = 10000;
      enemy.stats.damage = 0;
      enemy.stats.crit = 0;
      enemy.burn = { damage: 10, turns: 2, sourceId: owner.id };
    });
    const first = endTurn(state);
    expect(first.events.filter(event => event.kind === 'damage' && event.message.includes('Helios Pyre Cathedral'))).toHaveLength(state.enemies.length);
    expect(first.state.enemies[0].burn.turns).toBe(1);
    const second = endTurn(first.state);
    expect(second.state.enemies.find(enemy => enemy.id === target.id)?.burn.turns).toBe(0);
    expect(endTurn(second.state).events.some(event => event.message.includes('Helios Pyre Cathedral'))).toBe(false);
  });
  it('refreshes bounded Attack through next round without stacking', () => {
    const { state, owner, target } = masterState('master-crinso-1');
    const events: BattleEvent[] = [];
    resolveOmnicInteraction(state, owner, { trigger: 'critical', action: 'skill1', target, amount: 10 }, events);
    expect(owner.attackBoost).toMatchObject({ fraction: .4, throughRound: 2 });
    state.round = 2;
    resolveOmnicInteraction(state, owner, { trigger: 'critical', action: 'skill1', target, amount: 10 }, events);
    expect(owner.attackBoost).toMatchObject({ fraction: .4, throughRound: 3 });
  });
  it('actually applies Master activation after Last Flare without bypassing recovery', () => {
    const { state, owner, target } = masterState('master-aurora-2');
    owner.shatter = 100;
    owner.omnicMemory = { 'master-aurora-2': { bank: 3 } };
    const result = act(state, owner.id, 'ultimate', target.id);
    for (const ally of result.state.allies) expect(ally.attackBoost).toMatchObject({ fraction: .3, origin: 'conduit' });
    expect(result.state.allies[0].omnicMemory?.['master-aurora-2']?.bank).toBe(0);
    expect(result.state.allies[0].recoverThrough).toBeGreaterThanOrEqual(state.round + 1);
  });
  it('team-wide outcomes reach every living ally without duplicating native kit charges', () => {
    const tide = masterState('master-tide-1');
    tide.state.allies[1].hp = 0;
    resolveOmnicInteraction(tide.state, tide.owner, { trigger: 'shield-absorbed', target: tide.owner, attacker: tide.target, amount: 5 }, []);
    expect(tide.owner.omnicProtection).toBe(.15);
    expect(tide.state.allies[1].omnicProtection).toBeUndefined();
    expect(tide.owner.pilot?.ward ?? 0).toBe(0);
    const ember = masterState('master-ember-2');
    ember.owner.pilot = { ...ember.owner.pilot, ember: 2 };
    ember.owner.omnicMemory = { 'master-ember-2': { bank: 3 } };
    const before = ember.state.enemies.map(enemy => enemy.hp);
    resolveOmnicInteraction(ember.state, ember.owner, { trigger: 'activation', action: 'skill2', target: ember.target, amount: 1 }, []);
    expect(ember.owner.pilot?.ember).toBe(2);
    expect(ember.owner.shield).toBe(Math.round(ember.owner.stats.health * .12));
    ember.state.enemies.forEach((enemy, index) => { if (before[index] > 0) expect(enemy.hp).toBeLessThan(before[index]); });
  });
  it('extends only the owner\'s own Weaken, up to three phases', () => {
    const { state, owner, target } = masterState('master-tide-3');
    resolveOmnicInteraction(state, owner, { trigger: 'weaken-applied', target, amount: .2 }, []);
    expect(target.weakened).toBe(3);
    expect(target.conduitMarks?.[owner.id]).toBe(2);
    const other = masterState('master-aurora-1');
    other.target.weakenSourceId = 'someone-else';
    resolveOmnicInteraction(other.state, other.owner, { trigger: 'weaken-applied', target: other.target, amount: .2 }, []);
    expect(other.target.weakened).toBe(2);
  });
  it('a Conduit strike that defeats an enemy during the enemy phase is rewarded and clears the wave', () => {
    const state = withMasterLoadouts(createBattle(1729, ['thornia']), { thornia: 'master-thornia-1' });
    const owner = state.allies[0];
    owner.shield = 50; owner.pilot = { ...owner.pilot, authoredShieldSourceId: owner.id };
    state.enemies.forEach((enemy, index) => { enemy.hp = index === 0 ? 1 : 0; });
    const result = endTurn(state);
    expect(result.events.some(event => event.message.includes('Conduit strike'))).toBe(true);
    expect(result.state.enemies[0].hp).toBe(0);
    expect(result.events.filter(event => event.kind === 'reward' && event.source === state.enemies[0].id)).toHaveLength(1);
    expect(result.state.phase).toBe('cleared');
  });
  it('defense never deals Conduit damage', () => {
    for (const entry of masterConduits.filter(item => item.rule.trigger === 'defense'))
      expect(entry.rule.outcomes.some(outcome => outcome.kind === 'strike')).toBe(false);
  });
  it('freezes gear through Settings cloning, Continue, Training and Retry session construction', () => {
    const session = createSession('ember', { level: 0, evolution: 1 }, { storyStage: 1 },
      { ids: ['ember'], progress: { ember: { level: 0, evolution: 1 } }, masters: { ember: 'master-ember-2' } });
    expect(structuredClone(session).state.allies[0].masterConduit).toBe('master-ember-2');
    session.state.phase = 'cleared'; session.state.enemies.forEach(enemy => enemy.hp = 0);
    session.state.masterChestSeed = 123;
    const continued = nextStage(session.state, session.progress).state;
    expect(continued.allies[0].masterConduit).toBe('master-ember-2');
    expect(continued.masterChestSeed).toBe(123);
    expect(continued.allies[0].omnicMemory).toBeUndefined();
    const training = withMasterLoadouts(createBattle(1), { ember: 'master-ember-1' });
    training.phase = 'cleared'; training.enemies.forEach(enemy => enemy.hp = 0);
    expect(nextWave(training).state.allies[0].masterConduit).toBe('master-ember-1');
    expect(() => withMasterLoadouts(createBattle(1), { tide: 'master-ember-1' })).toThrow('named');
  });
  it('wires exact ownership/effects and versioned delivered art through equipment, Inventory, Archives and field reserve', () => {
    const account = loadAccount(storage({ masterConduits: { 'master-ember-2': 1 }, masterEquipment: { ember: 'master-ember-2' } }));
    const team = referenceTeam(account, { view: 'detail', selected: 'ember', element: '', sort: 'level', tab: 'equipment' });
    expect(team).toContain('data-master-equipment="ember"');
    expect(team).toContain('Cinderstar Genesis Engine');
    expect(team).toContain('Always active · Omnic Master');
    expect(team).not.toContain('Master slot · Reserved');
    expect(inventoryView(account)).toContain('data-open-master-chest');
    expect(archives(account, 'conduits').match(/data-archive-master=/g)).toHaveLength(48);
    const { owner } = masterState('master-ember-2');
    expect(unitReadout(owner, true)).toContain('Astral Reserve 0 / 3');
    expect(unitReadout(owner, true)).toMatch(/assets\/master-conduits\/astral-reserve\.png\?v=[0-9a-f]{16}/);
    expect(team).toMatch(/assets\/master-conduits\/master-ember-2\.png\?v=[0-9a-f]{16}" alt="Cinderstar Genesis Engine"/);
    expect(inventoryView(account)).toMatch(/assets\/master-conduits\/grand-master-chest\.png\?v=[0-9a-f]{16}/);
    expect(inventoryView(account)).not.toContain('Artwork pending');
    for (const entry of masterConduits) expect(existsSync(`public/assets/${entry.art}`)).toBe(true);
    expect(existsSync('public/assets/master-conduits/grand-master-chest.png') && existsSync('public/assets/master-conduits/astral-reserve.png')).toBe(true);
    expect(team).not.toMatch(/assets\/conduits\/master-/);
  });
  it('uses the same authoritative operations and frozen Master loadout online', () => {
    const entropy = { seed: () => 1729, uuid: () => 'master-online-run', random: () => .5 };
    const game = freshGame('MasterTest');
    game.starterId = 'ember';
    game.account = loadAccount(storage());
    const opened = resolveOperation(game, { kind: 'openMasterChest', id: 'master-ember-1' }, entropy).game;
    expect(game.account.masterConduits).toBeUndefined();
    expect(() => resolveOperation(opened, { kind: 'openMasterChest', id: 'master-ember-1' }, entropy)).toThrow('already owned');
    const second = resolveOperation(opened, { kind: 'openMasterChest', id: 'master-ember-2' }, entropy).game;
    const equipped = resolveOperation(second, { kind: 'equipMasterConduit', character: 'ember', conduit: 'master-ember-1' }, entropy).game;
    const entered = resolveOperation(equipped, { kind: 'enter', activity: { kind: 'story', stage: 1 } }, entropy).game;
    expect(entered.run?.session.state.allies[0].masterConduit).toBe('master-ember-1');
    const changed = resolveOperation(entered, { kind: 'equipMasterConduit', character: 'ember', conduit: 'master-ember-2' }, entropy).game;
    expect(changed.account.masterEquipment?.ember).toBe('master-ember-2');
    expect(changed.run?.session.state.allies[0].masterConduit).toBe('master-ember-1');
    if (!changed.run) throw new Error('Test run missing.');
    changed.run.session.state.phase = 'defeat';
    const retry = resolveOperation(changed, { kind: 'retry', runId: 'master-online-run' }, entropy).game;
    expect(retry.run?.session.state.allies[0].masterConduit).toBe('master-ember-1');
  });
});
