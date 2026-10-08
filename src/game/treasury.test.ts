import { describe, expect, it, vi } from 'vitest';
import { infusionEncounter, infusionEnemies, infusionLoot, infusionDrops, treasurySalePrices } from '../content/infusions';
import { treasuryFractalisDrop } from '../content/loot-random';
import { creatureLoot, getCreature } from '../content/creatures';
import { standardBannerPool } from '../content/standard-banner';
import { ACCOUNT_KEY, emptyAccount, loadAccount, saveAccount, saveAccountRewards, sellTreasuryCreature, treasurySaleOffer,
  summonCharacter, validateAccount, setSquad, setCharacterLock, equipConduit } from './account';
import { createCreatureCopy, capturedProgress, resolveCapturedFighter, validateCapturedCharacters } from './character-instances';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { createInfusionBattle, act, endTurn, nextStage } from './battle';
import { createSession, BattleView } from '../presentation/battle-view';
import { battleResults } from '../presentation/battle-results';
import { characterCopyManagement, summonHub } from '../presentation/roster';
import { archives } from '../presentation/archives';
import { gameplayHub } from '../presentation/gameplay';
import { defaultBindings } from './hotkeys';
import { conduits } from '../content/conduits';

function storage(): ProfileStorage {
  const map = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  return { getItem: (key) => map.get(key) ?? null, setItem: (key, value) => { map.set(key, value); }, removeItem: (key) => { map.delete(key); } };
}
function funded(lycalis = 100) {
  const saved = storage();
  const account = loadAccount(saved);
  account.lycalis = lycalis;
  saveAccount(saved, account);
  return saved;
}
function defeat(stage: number, burn = false) {
  const state = createInfusionBattle('treasury', stage, 1, 'ember', { level: 105, evolution: 6 });
  state.enemies.forEach((enemy) => { enemy.hp = 1; if (burn) enemy.burn = { damage: 1, turns: 1 }; });
  state.allies[0].shatter = 100;
  return burn ? endTurn(state) : act(state, 'ember', 'skill2', state.enemies[0].id);
}

describe('Phase9 Crownfall Treasury and Standard activation', () => {
  it('authors25 floors,65-120 levels, six Luminous forms, bosses and consistent exact currency loot', () => {
    const starts: number[] = [];
    for (let stage = 1; stage <= 25; stage++) {
      const encounter = infusionEncounter('treasury', stage);
      expect(encounter.name).toBe('Crownfall Treasury');
      expect(encounter.level).toBe(Math.round(65 + (stage - 1) * 55 / 24));
      expect(encounter.tier).toBe(Math.floor((stage - 1) * 6 / 25));
      expect(encounter.boss).toBe(stage % 5 === 0);
      expect(encounter.enemy.element).toBe('luminous');
      expect(encounter.enemy.art).toBe(infusionEnemies.treasury[encounter.tier][1]);
      expect(encounter.background).toBe('treasury-arena.png');
      if (!starts[encounter.tier]) starts[encounter.tier] = stage;
      expect(infusionLoot('treasury', stage)).toEqual({ specialties: [], bonuses: [] });
      const random = vi.fn(() => 0);
      expect(infusionDrops('treasury', stage, random)).toEqual({});
      expect(random).not.toHaveBeenCalled();
      const range = treasuryFractalisDrop(encounter.level);
      expect(creatureLoot(getCreature(`infusion:treasury:${encounter.tier}`), stage)).toEqual([{ id: 'fractalis', ...range }]);
      for (const burn of [false, true]) {
        const result = defeat(stage, burn);
        const rewards = result.events.filter((event) => event.kind === 'reward');
        expect(rewards).toHaveLength(encounter.boss ? 1 : 2);
        for (const reward of rewards) {
          expect(reward.amount).toBeGreaterThanOrEqual(range.minimum);
          expect(reward.amount).toBeLessThanOrEqual(range.maximum);
          expect(reward.materials).toEqual({});
          expect(reward.lycalis).toBeUndefined();
        }
        expect(result.state.lycalisSeed).toBeUndefined();
      }
    }
    expect(starts).toEqual([1, 6, 10, 14, 18, 22]);
    expect(treasuryFractalisDrop(65)).toEqual({ minimum: 100, maximum: 200, chance: 1 });
    expect(treasuryFractalisDrop(120)).toEqual({ minimum: 1000, maximum: 2000, chance: 1 });
    for (const level of [64, 121, 65.5, NaN]) expect(() => treasuryFractalisDrop(level)).toThrow();
    for (const stage of [0, 26, NaN, 1.5]) expect(() => infusionEncounter('treasury', stage)).toThrow();
  });
  it('saves actual capture metadata/currency/unlocks together, rejects forged sources and stops at 25', () => {
    const saved = storage();
    const result = defeat(25);
    expect(result.events.some((entry) => entry.capture)).toBe(true);
    const write = saved.setItem;
    saved.setItem = () => { throw new Error('Write denied'); };
    expect(() => saveAccountRewards(saved, result, 'run')).toThrow('Write denied');
    expect(saved.getItem(ACCOUNT_KEY)).toBeNull();
    saved.setItem = write;
    const account = saveAccountRewards(saved, result, 'run');
    expect(account.fractalis).toBeGreaterThanOrEqual(1000);
    expect(account.lycalis).toBe(0);
    expect(account.materials).toEqual({});
    expect(account.capturedCharacters?.[0].level).toBe(120);
    expect(account.capturedCharacters?.[0].skills).toEqual(result.state.enemies[0].enemySkills);
    expect(account.infusionStages.treasury).toBe(25);
    expect(loadAccount(saved)).toEqual(account);
    expect(saveAccountRewards(saved, result, 'run')).toEqual(account);
    expect(battleResults(result.state, result.events)).toContain('Activity complete');
    expect(() => nextStage(result.state, { level: 105, evolution: 6 })).toThrow('complete');
    const before = saved.getItem(ACCOUNT_KEY);
    for (const patch of ['amount', 'level', 'alive', 'lycalis'] as const) {
      const forged = structuredClone(result);
      if (patch === 'amount') forged.events.find((entry) => entry.kind === 'reward')!.amount = 5;
      if (patch === 'level') forged.state.enemies[0].level = 119;
      if (patch === 'alive') forged.state.enemies[0].hp = 1;
      if (patch === 'lycalis') forged.events.find((entry) => entry.kind === 'reward')!.lycalis = 1;
      expect(() => saveAccountRewards(saved, forged, `forged-${patch}`)).toThrow();
      expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
    }
    expect(() => validateAccount({ ...account, infusionStages: { treasury: 26 } })).toThrow();
  });
  it('supports mixed/all-Treasury squads, Continue snapshots and supplied mode art', () => {
    const copy = createCreatureCopy('infusion:treasury:5');
    const kit = resolveCapturedFighter(copy);
    expect(kit.stats.health).toBeLessThan(infusionEncounter('treasury', 25).stats.health);
    const session = createSession('ember', { level: 0, evolution: 1 }, { mode: 'treasury', stage: 24 },
      { ids: [copy.instanceId], captures: [copy], progress: {} });
    expect(session.state.allies).toHaveLength(1);
    session.state.phase = 'cleared';
    session.state.allies[0].shatter = 100;
    const next = nextStage(session.state, {});
    expect(next.state.wave).toBe(25);
    expect(next.state.allies[0].shatter).toBe(100);
    expect(next.state.allies[0].captured).toEqual(copy);
    const menu = { addEventListener: vi.fn(), close: vi.fn() };
    const view = Object.create(BattleView.prototype);
    Object.assign(view, { session, bindings: defaultBindings, host: { innerHTML: '', querySelectorAll: () => [],
      querySelector: (selector: string) => selector === '#battle-menu' ? menu : null }, bind: vi.fn() });
    Reflect.apply(Reflect.get(BattleView.prototype, 'render'), view, []);
    expect(view.host.innerHTML).toContain('Stage 24 ~ 25');
    expect(view.host.innerHTML).toContain('assets/backgrounds/treasury-arena.png');
    expect(view.host.innerHTML).toContain('assets/enemies/the-crown-beyond-dawn-gleamstone-slime.png');
    expect(view.host.innerHTML).not.toContain('enemies/undefined');
    const account = emptyAccount();
    expect(gameplayHub(account)).toContain('data-infusion="treasury"');
    expect(gameplayHub(account)).toContain('100-200 Prismatica at Lv.65 to 1,000-2,000 at Lv.120');
    expect(gameplayHub(account)).toContain('assets/banners/treasury-banner.png');
    expect(archives(account).match(/data-archive-character=/g)).toHaveLength(108);
  });
  it('creates base EBs, independent creature rewards and exact Lv50 Omnic duplicate copies without modifying old progress', () => {
    const saved = funded();
    const account = loadAccount(saved);
    account.characters.ember = { level: 75, evolution: 4, weaponRank: 3 };
    saveAccount(saved, account);
    const duplicate = summonCharacter(saved, () => 0);
    expect(duplicate.duplicate).toBe(true);
    expect(duplicate.copy?.creatureId).toBe('infusion:treasury:5');
    expect(duplicate.copy?.level).toBe(50);
    expect(duplicate.copy?.acquisition).toBe('banner-duplicate');
    expect(duplicate.account.characters.ember).toEqual(account.characters.ember);
    expect(duplicate.account.squad).toEqual(['ember']);
    expect(duplicate.account.lycalis).toBe(90);
    expect(duplicate.account.bannerPity?.standard).toEqual({ highestStar: 1, unownedHighestStar: 1 });
    expect(resolveCapturedFighter(duplicate.copy!).stats.health).toBeGreaterThan(0);
    expect(validateCapturedCharacters([duplicate.copy])).toEqual([duplicate.copy]);
    const newEB = summonCharacter(saved, () => .002);
    expect(newEB.entry.id).toBe('tide');
    expect(newEB.account.characters.tide).toEqual({ level: 0, evolution: 1, weaponRank: 0 });
    expect(newEB.account.bannerPity?.standard).toEqual({ highestStar: 2, unownedHighestStar: 2 });
    const pool = standardBannerPool();
    for (const entry of pool.filter((entry) => entry.kind === 'creature')) {
      const index = pool.indexOf(entry);
      const roll = pool.slice(0, index).reduce((sum, candidate) => sum + candidate.chance, 0) + entry.chance / 2;
      const fresh = funded();
      const first = summonCharacter(fresh, () => roll);
      const second = summonCharacter(fresh, () => roll);
      expect(first.copy?.creatureId).toBe(entry.id);
      expect(first.copy?.level).toBe(infusionEncounter(getCreature(entry.id).mode!, getCreature(entry.id).stages[0]).level);
      expect(first.copy?.instanceId).not.toBe(second.copy?.instanceId);
      expect(second.account.capturedCharacters).toHaveLength(2);
    }
  });
  it('commits pity guarantees/reward/cost in one write, including500 all-owned conversion and failed retry', () => {
    for (const allOwned of [false, true]) {
      const saved = funded();
      const account = loadAccount(saved);
      if (allOwned) account.characters = { ember: { level: 0, evolution: 1 },
        aurora: { level: 0, evolution: 1 }, bliss: { level: 0, evolution: 1 },
        disciple: { level: 0, evolution: 1 }, razor: { level: 0, evolution: 1 } };
      account.bannerPity = { standard: { highestStar: 199, unownedHighestStar: 499 } };
      saveAccount(saved, account);
      const before = saved.getItem(ACCOUNT_KEY);
      const original = saved.setItem;
      saved.setItem = () => { throw new Error('Write denied'); };
      expect(() => summonCharacter(saved, () => 0)).toThrow('Write denied');
      expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
      saved.setItem = original;
      const write = vi.spyOn(saved, 'setItem');
      const result = summonCharacter(saved, () => 0);
      expect(result.guarantee).toBe(allOwned ? 'all-owned-highest-star' : 'unowned-highest-star');
      expect(result.account.bannerPity?.standard).toEqual({ highestStar: 0, unownedHighestStar: 0 });
      expect(result.account.lycalis).toBe(90);
      expect(result.copy?.level).toBe(allOwned ? 50 : undefined);
      expect(write).toHaveBeenCalledTimes(1);
      expect(loadAccount(saved)).toEqual(result.account);
    }
    for (const roll of [-1, 1, NaN, Infinity]) {
      const saved = funded();
      const before = saved.getItem(ACCOUNT_KEY);
      expect(() => summonCharacter(saved, () => roll)).toThrow();
      expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
    }
    expect(summonHub(loadAccount(funded()))).not.toContain('disabled');
  });
  it('sells exact unprotected Treasury copies by rarity, independent of level; removes empty gear and preserves discovery', () => {
    for (let tier = 0; tier < 6; tier++) {
      const saved = funded();
      const copy = createCreatureCopy(`infusion:treasury:${tier}`);
      const other = createCreatureCopy(copy.creatureId);
      const account = loadAccount(saved);
      account.capturedCharacters = [copy, other];
      account.conduitEquipment = { [copy.instanceId]: Array.from({ length: 8 }, () => null) };
      account.creatures[copy.creatureId] = { defeated: true };
      saveAccount(saved, account);
      expect(treasurySaleOffer(account, copy.instanceId).amount).toBe(treasurySalePrices[tier]);
      expect(treasurySaleOffer({ ...account, capturedCharacters: [{ ...copy, level: 120 }] }, copy.instanceId).amount).toBe(treasurySalePrices[tier]);
      const sold = sellTreasuryCreature(saved, copy.instanceId);
      expect(sold.fractalis).toBe(treasurySalePrices[tier]);
      expect(sold.capturedCharacters).toEqual([other]);
      expect(sold.conduitEquipment?.[copy.instanceId]).toBeUndefined();
      expect(sold.creatures[copy.creatureId]).toEqual({ defeated: true });
      expect(sold.lycalis).toBe(100);
      expect(() => sellTreasuryCreature(saved, copy.instanceId)).toThrow('owned');
      expect(loadAccount(saved)).toEqual(sold);
    }
  });
  it('rejects locked/squad/equipped/non-Treasury sales authoritatively and preserves copies on failure/overflow', () => {
    const saved = funded();
    const copy = createCreatureCopy('infusion:treasury:5', undefined, 50, 'banner-duplicate');
    const account = loadAccount(saved);
    account.capturedCharacters = [copy, createCreatureCopy('infusion:abyss:0')];
    account.conduits = { [conduits[0].id]: 1 };
    saveAccount(saved, account);
    for (const protection of ['lock', 'squad', 'conduit'] as const) {
      if (protection === 'lock') setCharacterLock(saved, copy.instanceId, true);
      if (protection === 'squad') setSquad(saved, [copy.instanceId]);
      if (protection === 'conduit') equipConduit(saved, copy.instanceId, 0, conduits[0].id);
      const before = saved.getItem(ACCOUNT_KEY);
      expect(() => sellTreasuryCreature(saved, copy.instanceId)).toThrow('cannot be sold');
      expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
      expect(characterCopyManagement(loadAccount(saved))).toContain('Sale protected');
      saveAccount(saved, account);
    }
    expect(() => sellTreasuryCreature(saved, account.capturedCharacters![1].instanceId)).toThrow('Treasury');
    expect(() => sellTreasuryCreature(saved, 'ember')).toThrow('Treasury');
    const before = saved.getItem(ACCOUNT_KEY);
    const write = saved.setItem;
    saved.setItem = () => { throw new Error('Write denied'); };
    expect(() => sellTreasuryCreature(saved, copy.instanceId)).toThrow('Write denied');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
    saved.setItem = write;
    account.fractalis = Number.MAX_SAFE_INTEGER;
    saveAccount(saved, account);
    const overflowing = saved.getItem(ACCOUNT_KEY);
    expect(() => sellTreasuryCreature(saved, copy.instanceId)).toThrow();
    expect(saved.getItem(ACCOUNT_KEY)).toBe(overflowing);
  });
  it('permits the level 50 duplicate provenance only for the final Treasury form with a complete authored kit', () => {
    const copy = createCreatureCopy('infusion:treasury:5', undefined, 50, 'banner-duplicate');
    expect(capturedProgress(copy).level).toBe(50);
    expect(() => validateCapturedCharacters([{ ...copy, acquisition: undefined }])).toThrow();
    expect(() => validateCapturedCharacters([{ ...copy, creatureId: 'infusion:abyss:5' }])).toThrow();
    expect(() => validateCapturedCharacters([{ ...copy, level: 49 }])).toThrow();
    expect(() => validateCapturedCharacters([{ ...copy, skills: [] }])).toThrow();
    expect(() => createCreatureCopy('infusion:treasury:5', undefined, 50)).toThrow();
  });
});
