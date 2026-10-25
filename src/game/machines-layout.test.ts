import { describe, expect, it, vi } from 'vitest';
import { infusionEncounter } from '../content/infusions';
import { machineComponentDrop } from '../content/mechanical-components';
import { creatureLoot, getCreature } from '../content/creatures';
import { machineConduitDrops, machineConduitLoot, machineConduitChance, machineRules } from '../content/machines';
import { machineStageCount, migratePreviousMachineStage } from '../content/activities';
import { fractalisDrop } from '../content/loot-random';
import { masterChestDrops } from '../content/master-conduits';
import { ACCOUNT_KEY, calamityUnlockedTier, emptyAccount, loadAccount, saveAccount, setMachineLootFocus, validateAccount } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { freshGame, publicGame, resolveOperation } from '../../supabase/functions/game-operation/engine';
import type { GameOperation } from '../online/server-game';

function storage(): ProfileStorage {
  const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); },
    removeItem: key => { values.delete(key); } };
}
const uuid = '12345678-1234-4abc-8def-123456789abc';
const entropy = { seed: () => 1729, uuid: () => crypto.randomUUID(), random: () => .5 };

describe('35-stage Machines layout and v9 migration', () => {
  it('uses exact proportional level/reward curves at every stage, preserving endpoints and bosses', () => {
    expect(machineStageCount).toBe(35);
    for (let stage = 1; stage <= 35; stage++) {
      const encounter = infusionEncounter('machines', stage);
      const level = Math.round(10 + (stage - 1) * 110 / 34);
      expect(encounter.level).toBe(level);
      expect(encounter.boss).toBe(stage % 5 === 0);
      const components = Math.round(3 + (stage - 1) * 122 / 34) * (stage === 35 ? 5 : 1);
      expect(machineComponentDrop(stage)).toMatchObject({ chance: 1, minimum: components, maximum: components });
      const currency = creatureLoot(getCreature(`infusion:machines:${encounter.tier}`), stage).find(drop => drop.id === 'fractalis')!;
      const range = fractalisDrop(level);
      expect(currency.minimum).toBe(range.minimum * (stage === 35 ? 5 : 1));
      expect(currency.maximum).toBe(range.maximum * (stage === 35 ? 5 : 1));
      expect(masterChestDrops(stage, encounter.boss, () => 0)).toBe(stage === 35 ? 1 : 0);
    }
    expect(infusionEncounter('machines', 1).level).toBe(10);
    expect(infusionEncounter('machines', 35).level).toBe(120);
    expect(machineComponentDrop(1).minimum).toBe(3);
    expect(machineComponentDrop(35).minimum).toBe(625);
  });
  it('uses the updated tier odds on every applicable stage, including every stage after26', () => {
    expect(machineRules.omnicStage).toBe(26);
    for (let stage = 1; stage <= 35; stage++) {
      const drops = machineConduitDrops(stage, () => 0);
      expect(Object.keys(drops)).toHaveLength(stage >= 26 ? 3 : 2);
      const boundaries = [machineConduitChance(stage, 'Rare'), machineConduitChance(stage, 'Legendary'),
        ...(stage >= 26 ? [machineConduitChance(stage, 'Omnic')] : [])];
      expect(machineConduitDrops(stage, () => boundaries.shift()!)).toEqual({});
      const table = machineConduitLoot(stage);
      const expected = .10 + .45 * (stage - 1) / 34 + (stage >= 26 ? .05 + .10 * (stage - 26) / 9 : 0);
      expect(table.reduce((sum, drop) => sum + drop.chance, 0)).toBeCloseTo(expected, 12);
      for (const rarity of ['Rare', 'Legendary', 'Omnic'] as const) {
        const first = rarity === 'Omnic' ? 26 : 1;
        const end = rarity === 'Rare' ? .35 : rarity === 'Legendary' ? .20 : .15;
        const chance = stage < first ? 0 : .05 + (end - .05) * (stage - first) / (35 - first);
        expect(machineConduitChance(stage, rarity)).toBeCloseTo(chance, 14);
        if (stage >= first) {
          const rolls = ['Rare', 'Legendary', 'Omnic'].filter(tier => tier !== 'Omnic' || stage >= 26)
            .flatMap(tier => tier === rarity ? [chance - 1e-12, .5] : [.99]);
          expect(Object.keys(machineConduitDrops(stage, () => rolls.shift()!))).toHaveLength(1);
        }
      }
    }
    expect(machineConduitChance(1, 'Rare')).toBe(.05);
    expect(machineConduitChance(1, 'Legendary')).toBe(.05);
    expect(machineConduitChance(25, 'Omnic')).toBe(0);
    expect(machineConduitChance(26, 'Omnic')).toBe(.05);
    expect(machineConduitChance(35, 'Rare')).toBe(.35);
    expect(machineConduitChance(35, 'Legendary')).toBe(.20);
    expect(machineConduitChance(35, 'Omnic')).toBe(.15);
    for (const stage of [0, 36, 1.5, NaN]) expect(() => machineConduitChance(stage, 'Rare')).toThrow();
  });
  it.each([7, 8])('remaps every v%i saved stage using floor(stage/75*35), never on read or twice', version => {
    for (let stage = 1; stage <= 75; stage++) {
      const saved = storage();
      const source = { ...emptyAccount(), version, storyCompleted: 0, infusionStages: { machines: stage, heavens: 12 },
        fractalis: 123, lycalis: 45, mechanicalComponents: 99, masterChests: 2,
        conduits: { 'duplex-heart': 1 }, machineLootFocus: { Legendary: 'worldbreaker-drive' },
        normalFinalClears: { machines: true }, calamityClears: { machines: 2 } };
      const raw = JSON.stringify(source);
      saved.setItem(ACCOUNT_KEY, raw);
      const writes = vi.spyOn(saved, 'setItem');
      const loaded = loadAccount(saved);
      expect(writes).not.toHaveBeenCalled();
      expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
      expect(loaded.infusionStages).toEqual({ machines: Math.max(1, Math.floor(stage * 35 / 75)), heavens: 12 });
      expect(loaded).toMatchObject({ version: 9, fractalis: 123, lycalis: 45, mechanicalComponents: 99,
        masterChests: 2, conduits: source.conduits, machineLootFocus: source.machineLootFocus,
        normalFinalClears: source.normalFinalClears, calamityClears: source.calamityClears });
      saveAccount(saved, loaded);
      expect(loadAccount(saved)).toEqual(loaded);
      expect(validateAccount(loaded)).toEqual(loaded);
      expect(writes).toHaveBeenCalledOnce();
    }
  });
  it('chains pre-v7 100-stage conversion through its old75-stage mapping exactly once', () => {
    for (let stage = 1; stage <= 100; stage++) {
      const legacy = { ...emptyAccount(), version: 6, infusionStages: { machines: stage } };
      const previous = 1 + Math.ceil((stage - 1) * 74 / 99);
      const loaded = validateAccount(legacy);
      expect(loaded.infusionStages.machines).toBe(Math.max(1, Math.floor(previous * 35 / 75)));
      expect(validateAccount(loaded)).toEqual(loaded);
    }
  });
  it('preserves raw legacy saves on failed first transactions and persists v9 on retry', () => {
    const saved = storage();
    const raw = JSON.stringify({ ...emptyAccount(), version: 8, infusionStages: { machines: 56 } });
    saved.setItem(ACCOUNT_KEY, raw);
    const write = vi.spyOn(saved, 'setItem').mockImplementationOnce(() => { throw new Error('Storage denied'); });
    expect(() => setMachineLootFocus(saved, 'Rare', 'duplex-heart')).toThrow('denied');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    expect(setMachineLootFocus(saved, 'Rare', 'duplex-heart')).toMatchObject({ version: 9,
      infusionStages: { machines: 26 }, machineLootFocus: { Rare: 'duplex-heart' } });
    expect(loadAccount(saved).infusionStages.machines).toBe(26);
    expect(write).toHaveBeenCalledTimes(2);
  });
  it.each([0, -1, 76, 1.5, NaN, Infinity])('rejects invalid previous stage %s', stage => {
    expect(() => migratePreviousMachineStage(stage)).toThrow();
    expect(() => validateAccount({ ...emptyAccount(), version: 8, infusionStages: { machines: stage } })).toThrow();
  });
  it('strictly rejects out-of-range v9 stages and leaves current valid stages untouched', () => {
    for (let stage = 1; stage <= 35; stage++) expect(validateAccount({ ...emptyAccount(), infusionStages: { machines: stage } }).infusionStages.machines).toBe(stage);
    for (const stage of [36, 56, 75]) expect(() => validateAccount({ ...emptyAccount(), infusionStages: { machines: stage } })).toThrow();
  });
  it.each([[8, 75], [7, 75], [6, 100]] as const)('retains receipt-proven v%i final victory and Calamity access', (version, final) => {
    const source = { ...emptyAccount(), version, infusionStages: { machines: final },
      receipts: [`${uuid}:infusion-machines-${final}-0`] };
    const loaded = validateAccount(source);
    expect(loaded.normalFinalClears?.machines).toBe(true);
    expect(calamityUnlockedTier(loaded, 'machines')).toBe(1);
    expect(loaded.receipts).toEqual(source.receipts);
    for (const receipt of [`bad:infusion-machines-${final}-0`, `${uuid}:infusion-machines-${final}-1`,
      `${uuid}:infusion-machines-${final}-0:extra`, `${uuid}:infusion-machines-${final}-0\n`]) {
      const invalid = validateAccount({ ...source, receipts: [receipt] });
      expect(invalid.normalFinalClears?.machines).not.toBe(true);
      expect(calamityUnlockedTier(invalid, 'machines')).toBe(0);
    }
  });
  it('does not grant final-clear credit for unlocked final access without victory', () => {
    const account = validateAccount({ ...emptyAccount(), version: 8, infusionStages: { machines: 75 } });
    expect(account.infusionStages.machines).toBe(35);
    expect(calamityUnlockedTier(account, 'machines')).toBe(0);
  });
  it('discards old Machines encounters before stage validation while preserving other v8 runs', () => {
    let game = resolveOperation(freshGame('layout'), { kind: 'bootstrap', starterId: 'ember' }, entropy).game;
    game.account.characters.ember = { level: 105, evolution: 6 };
    game.account.storyCompleted = 120;
    game.account.infusionStages.machines = 35;
    game = resolveOperation(game, { kind: 'enter', activity: { kind: 'infusion', mode: 'machines', stage: 35 } }, entropy).game;
    const legacy = { ...game, account: { ...game.account, version: 8, infusionStages: { machines: 75 } } };
    const previous = structuredClone(legacy);
    legacy.run!.activity = { kind: 'infusion', mode: 'machines', stage: 75 };
    legacy.run!.session.state.infusion!.stage = 75;
    expect(publicGame(legacy as typeof game, 1).session).toBeNull();
    const read = resolveOperation(legacy as typeof game, { kind: 'read' }, entropy);
    expect(read.game.run).toBeNull();
    expect(read.response.account.infusionStages.machines).toBe(35);
    expect(legacy.account).toEqual(previous.account);
    const operation: GameOperation = { kind: 'act', runId: legacy.run!.session.runId,
      actorId: 'ember', action: 'light', targetId: legacy.run!.session.state.enemies[0].id };
    expect(() => resolveOperation(legacy as typeof game, operation, entropy)).toThrow('no longer active');
    const training = resolveOperation({ ...game, run: null }, { kind: 'enter', activity: { kind: 'training' } }, entropy).game;
    const trainingV8 = { ...training, account: { ...training.account, version: 8, infusionStages: { machines: 75 } } };
    expect(resolveOperation(trainingV8 as typeof game, { kind: 'read' }, entropy).response.session).not.toBeNull();
  });
});
