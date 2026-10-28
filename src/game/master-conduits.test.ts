import { machineRules } from '../content/machines';
import { describe, expect, it, vi } from 'vitest';
import { existsSync } from 'node:fs';
import { masterConduits, masterChestDrops, getMasterConduit, type MasterConduitId } from '../content/master-conduits';
import { starters } from '../content/starters';
import { resolveFighter } from '../content/combat';
import { conduits } from '../content/conduits';
import { creatureLoot, getCreature } from '../content/creatures';
import { createBattle, createInfusionBattle, withMasterLoadouts, act, endTurn, nextStage, nextWave, type BattleEvent } from './battle';
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
    expect(conduits).toHaveLength(90);
  });
  it('gives every Master a distinct complete effect within each character', () => {
    expect(new Set(masterConduits.map(entry => entry.effect)).size).toBe(48);
    for (const character of starters) {
      const own = masterConduits.filter(entry => entry.character === character.id);
      expect(new Set(own.map(entry => entry.effect)).size).toBe(3);
    }
  });
  it('removes obsolete uniform bank metadata and states every fixed enhancement completely', () => {
    for (const entry of masterConduits) {
      expect(entry.effect.length).toBeGreaterThan(40);
      expect(entry).not.toHaveProperty('rule');
      expect(entry.effect).not.toContain('Astral Reserve');
      expect(entry.effect).not.toContain('->');
    }
  });
  it('rolls exactly below 50%, only final boss, without consuming entropy elsewhere', () => {
    for (const stage of [1, 5, machineRules.omnicStage, machineRules.stages - 5, machineRules.stages - 1]) {
      const random = vi.fn(() => 0);
      expect(masterChestDrops(stage, true, random)).toBe(0);
      expect(random).not.toHaveBeenCalled();
    }
    expect(masterChestDrops(machineRules.stages, false, () => { throw new Error('Unexpected RNG'); })).toBe(0);
    expect(masterChestDrops(machineRules.stages, true, () => .499999999)).toBe(1);
    expect(masterChestDrops(machineRules.stages, true, () => .5)).toBe(0);
    for (const invalid of [-1, 1, NaN, Infinity]) expect(() => masterChestDrops(machineRules.stages, true, () => invalid)).toThrow();
  });
  it('exposes chest loot only at the actual final Machines boss stage', () => {
    expect(creatureLoot(getCreature('infusion:machines:5'), machineRules.stages - 1).some(drop => drop.id === 'grand-master-chest')).toBe(false);
    expect(creatureLoot(getCreature('infusion:machines:5'), machineRules.stages).find(drop => drop.id === 'grand-master-chest'))
      .toMatchObject({ chance: .5, minimum: 1, maximum: 1 });
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
    expect(() => openMasterChest(storage({ masterChests: 0 }), 'master-ember-1')).toThrow("No Machine's Master Chest");
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
    const saved = storage({ infusionStages: { machines: machineRules.stages } });
    const state = createInfusionBattle('machines', machineRules.stages, 1, 'ember', { level: 0, evolution: 1 });
    state.enemies[0].hp = 0; state.phase = 'cleared';
    const reward: BattleEvent = { kind: 'reward', source: state.enemies[0].id, target: '', amount: 501, critical: false, message: 'Saved kill', masterChests: 1, mechanicalComponents: 625 };
    const write = vi.spyOn(saved, 'setItem');
    const account = saveAccountRewards(saved, { state, events: [reward] }, 'master-run');
    expect(write).toHaveBeenCalledOnce();
    expect(account.masterChests).toBe(3);
    expect(account.fractalis).toBe(501);
    expect(lootItems(reward).find(item => item.id === 'grand-master-chest')?.amount).toBe(1);
    expect(encounterRewards([reward, reward]).find(item => item.id === 'grand-master-chest')?.amount).toBe(1);
    saveAccountRewards(saved, { state, events: [reward] }, 'master-run');
    expect(write).toHaveBeenCalledOnce();
    const raw = saved.getItem(ACCOUNT_KEY);
    const wrong = createInfusionBattle('machines', machineRules.stages - 5, 1, 'ember', { level: 0, evolution: 1 });
    wrong.enemies[0].hp = 0; wrong.phase = 'cleared';
    expect(() => saveAccountRewards(saved, { state: wrong, events: [{ ...reward, source: wrong.enemies[0].id }] }, 'wrong')).toThrow('final');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    const overflow = storage({ masterChests: Number.MAX_SAFE_INTEGER, infusionStages: { machines: machineRules.stages } });
    const before = overflow.getItem(ACCOUNT_KEY);
    expect(() => saveAccountRewards(overflow, { state, events: [reward] }, 'overflow')).toThrow('capacity');
    expect(overflow.getItem(ACCOUNT_KEY)).toBe(before);
  });
  it('uses a dedicated chest stream without changing existing reward or combat RNG', () => {
    const first = createInfusionBattle('machines', machineRules.stages, 1729, 'ember', { level: 0, evolution: 1 });
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
  it('awards all three rarity drops and the 50% chest together in one atomic final-boss receipt', () => {
    const saved = storage({ infusionStages: { machines: machineRules.stages } });
    const state = createInfusionBattle('machines', 35, 1729, 'ember', { level: 0, evolution: 1 });
    state.enemies[0].hp = 1;
    state.allies[0].stats.damage = 1e12;
    state.conduitSeed = 645;
    state.masterChestSeed = 4864;
    const result = act(state, 'ember', 'light', state.enemies[0].id);
    const reward = result.events.find(event => event.kind === 'reward')!;
    expect(Object.keys(reward.conduits ?? {})).toHaveLength(3);
    expect(reward.masterChests).toBe(1);
    const write = vi.spyOn(saved, 'setItem');
    const account = saveAccountRewards(saved, result, 'all-four-drops');
    expect(account.conduits).toEqual(reward.conduits);
    expect(account.masterChests).toBe(3);
    expect(write).toHaveBeenCalledOnce();
    expect(saveAccountRewards(saved, result, 'all-four-drops')).toEqual(account);
    expect(write).toHaveBeenCalledOnce();
  });
});

describe('all Master rules and frozen sessions', () => {
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
    expect(unitReadout(owner, true)).not.toContain('Astral Reserve');
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
