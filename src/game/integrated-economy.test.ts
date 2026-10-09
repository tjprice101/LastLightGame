import { describe, expect, it, vi } from 'vitest';
import { ACCOUNT_KEY, loadAccount, saveAccount, saveAccountRewards, summonCharacter, sellCurrencyCreature,
  purchaseConduit, equipConduit, setSquad, setCharacterLock, levelCapturedCharacter, equippedSquad } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { createBattle, createDungeonBattle, createInfusionBattle, endTurn, nextStage, nextWave } from './battle';
import { capturedProgress } from './character-instances';
import { standardBannerPool } from '../content/standard-banner';
import { playableDungeons } from '../content/dungeons';
import { archives } from '../presentation/archives';
import { characterCopyManagement } from '../presentation/roster';

function storage(): ProfileStorage {
  const map = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  return { getItem: (key) => map.get(key) ?? null, setItem: (key, value) => { map.set(key, value); }, removeItem: (key) => { map.delete(key); } };
}
function mission(mode: 'sanctuary' | 'treasury') {
  const state = createInfusionBattle(mode, 25, 1, 'ember', { level: 105, evolution: 6 });
  state.lycalisSeed = 15872;
  state.enemies.forEach((enemy) => { enemy.hp = 1; enemy.burn = { damage: 1, turns: 1 }; });
  return endTurn(state);
}

describe('Phase11 integrated economy and save lifecycle', () => {
  it('connects both farms, exact-copy dual sale, draw/duplicate conversion and Conduit spending with reloads', () => {
    const saved = storage();
    const original = loadAccount(saved);
    const treasury = mission('treasury');
    const sanctuary = mission('sanctuary');
    saveAccountRewards(saved, treasury, 'treasury');
    const farmed = saveAccountRewards(saved, sanctuary, 'sanctuary');
    expect(farmed.lycalis).toBe(5);
    expect(farmed.capturedCharacters?.map((copy) => copy.creatureId))
      .toEqual(['infusion:treasury:5', 'infusion:sanctuary:5']);
    const wisp = farmed.capturedCharacters![1];
    const sold = sellCurrencyCreature(saved, wisp.instanceId);
    expect(sold.lycalis).toBe(15);
    expect(sold.fractalis).toBe(farmed.fractalis + 30000);
    expect(sold.creatures[wisp.creatureId]).toEqual({ defeated: true });
    expect(sold.receipts).toEqual(farmed.receipts);
    const draw = summonCharacter(saved, () => 0);
    expect(draw.duplicate).toBe(true);
    expect(draw.account.lycalis).toBe(5);
    expect(draw.account.characters.ember).toEqual(original.characters.ember);
    expect(draw.copy).toMatchObject({ creatureId: 'infusion:treasury:5', level: 50, acquisition: 'banner-duplicate' });
    expect(draw.account.bannerPity?.standard).toEqual({ highestStar: 1, unownedHighestStar: 1 });
    const bought = purchaseConduit(saved, 'vigil-core');
    expect(bought.fractalis).toBe(sold.fractalis - 1000);
    equipConduit(saved, draw.copy!.instanceId, 0, 'vigil-core');
    const protectedSave = saved.getItem(ACCOUNT_KEY);
    expect(() => sellCurrencyCreature(saved, draw.copy!.instanceId)).toThrow('cannot be sold');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(protectedSave);
    equipConduit(saved, draw.copy!.instanceId, 0, null);
    const final = sellCurrencyCreature(saved, draw.copy!.instanceId);
    expect(final.fractalis).toBe(bought.fractalis + 300000);
    expect(final.lycalis).toBe(5);
    expect(final.bannerPity).toEqual(draw.account.bannerPity);
    expect(final.capturedCharacters).toEqual([farmed.capturedCharacters![0]]);
    expect(loadAccount(saved)).toEqual(final);
    expect(saveAccountRewards(saved, sanctuary, 'sanctuary')).toEqual(final);
    expect(saveAccountRewards(saved, treasury, 'treasury')).toEqual(final);
    const before = saved.getItem(ACCOUNT_KEY);
    const random = vi.fn(() => 0);
    expect(() => summonCharacter(saved, random)).toThrow('requires');
    expect(random).not.toHaveBeenCalled();
    expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
  });

  it('enforces actual200 ~ 500 saved pull milestones while sales/reloads never reset pity', () => {
    const saved = storage();
    const account = loadAccount(saved);
    account.lycalis = 5000;
    account.characters.aurora = { level: 0, evolution: 1, weaponRank: 0 };
    saveAccount(saved, account);
    for (let pull = 1; pull <= 500; pull++) {
      const result = summonCharacter(saved, () => 0.02);
      if (pull === 200 || pull === 400) {
        expect(result.guarantee).toBe('highest-star');
        expect(result.duplicate).toBe(true);
        expect(result.copy?.level).toBe(50);
        const sold = sellCurrencyCreature(saved, result.copy!.instanceId);
        expect(sold.bannerPity).toEqual(result.account.bannerPity);
        expect(sold.lycalis).toBe(5000 - pull * 10);
      } else if (pull === 500) {
        expect(result.guarantee).toBe('unowned-highest-star');
        expect(result.entry.id).toBe('bliss');
        expect(result.account.characters.bliss).toEqual({ level: 0, evolution: 1, weaponRank: 0 });
        expect(result.account.bannerPity?.standard).toEqual({ highestStar: 0, unownedHighestStar: 0 });
      } else {
        expect(result.guarantee).toBe('none');
        expect(result.entry.kind).toBe('creature');
        expect(result.account.bannerPity?.standard)
          .toEqual({ highestStar: pull % 200, unownedHighestStar: pull });
      }
      expect(loadAccount(saved).lycalis).toBe(5000 - pull * 10);
    }
    const final = loadAccount(saved);
    expect(final.capturedCharacters).toHaveLength(497);
    expect(final.fractalis).toBe(600000);
    expect(final.squad).toEqual(['ember']);
    expect(final.characters.ember).toEqual(account.characters.ember);
  });

  it('preserves independently leveled/equipped mixed copies across all activities and Continue snapshots', () => {
    const saved = storage();
    const account = loadAccount(saved);
    account.lycalis = 10;
    account.fractalis = 3000;
    account.materials = { 'tranquilitic-common': 10 };
    saveAccount(saved, account);
    const pool = standardBannerPool();
    const index = pool.findIndex((entry) => entry.id === 'infusion:sanctuary:0');
    const roll = pool.slice(0, index).reduce((total, entry) => total + entry.chance, 0) + pool[index].chance / 2;
    const draw = summonCharacter(saved, () => roll);
    const copy = draw.copy!;
    levelCapturedCharacter(saved, copy.instanceId, 65);
    purchaseConduit(saved, 'vigil-core');
    equipConduit(saved, copy.instanceId, 0, 'vigil-core');
    setSquad(saved, [copy.instanceId, 'ember']);
    const current = loadAccount(saved);
    const ids = equippedSquad(current);
    const captures = current.capturedCharacters!;
    const progress = current.characters;
    const equipment = current.conduitEquipment;
    const starterProgress = progress.ember!;
    const factories = [
      { create: () => createBattle(1, ids, progress, equipment, captures), kind: 'adventure' as const },
      ...playableDungeons.map((element) => ({
        create: () => createDungeonBattle(element, 1, 1, 'ember', starterProgress, ids, progress, equipment, captures),
        kind: 'staged' as const,
      })),
      ...(['heavens', 'abyss', 'treasury', 'sanctuary'] as const).map((mode) =>
        ({ create: () => createInfusionBattle(mode, 1, 1, 'ember', starterProgress, ids, progress, equipment, captures), kind: 'staged' as const })),
    ];
    expect(factories).toHaveLength(11);
    for (const { create, kind } of factories) {
      const state = create();
      expect(state.allies.map((ally) => ally.id)).toEqual(ids);
      expect(state.allies[0].captured?.level).toBe(66);
      expect(state.allies[0].conduits?.[0]).toBe('vigil-core');
      if (kind === 'adventure') {
        state.phase = 'cleared';
        state.allies[0].shatter = 37;
        const next = nextWave(state);
        expect(next.state.allies[0].captured).toEqual(state.allies[0].captured);
        expect(next.state.allies[0].stats).toEqual(state.allies[0].stats);
        expect(next.state.allies[0].shatter).toBe(37);
        expect(next.state.allies[0].hp).toBe(next.state.allies[0].stats.health);
      } else {
        state.phase = 'cleared';
        state.allies[0].shatter = 37;
        const next = nextStage(state, progress);
        expect(next.state.allies[0].captured).toEqual(state.allies[0].captured);
        expect(next.state.allies[0].stats).toEqual(state.allies[0].stats);
        expect(next.state.allies[0].shatter).toBe(37);
        expect(next.state.allies[0].hp).toBe(next.state.allies[0].stats.health);
      }
    }
    expect(capturedProgress(captures[0]).level).toBe(66);
    expect(() => sellCurrencyCreature(saved, copy.instanceId)).toThrow('cannot be sold');
    setSquad(saved, ['ember']);
    expect(() => sellCurrencyCreature(saved, copy.instanceId)).toThrow('Conduits equipped');
    equipConduit(saved, copy.instanceId, 0, null);
    setCharacterLock(saved, copy.instanceId, true);
    expect(() => sellCurrencyCreature(saved, copy.instanceId)).toThrow('Locked');
    setCharacterLock(saved, copy.instanceId, false);
    const sold = sellCurrencyCreature(saved, copy.instanceId);
    expect(sold.capturedCharacters).toEqual([]);
    expect(characterCopyManagement(sold)).not.toContain(`data-captured-copy="${copy.instanceId}"`);
    const gallery = archives(sold);
    const form = gallery.match(/<article[^>]*data-archive-character="infusion:sanctuary:0"[\s\S]*?<\/article>/)?.[0];
    expect(form).toBeDefined();
    expect(form).toContain('archive-form-locked');
    expect(sold.characters).toEqual(account.characters);
  });

  it('loads legacy wallets read-only and preserves every existing field when first using the new economy', () => {
    const saved = storage();
    const legacy = { version: 2, fractalis: 12345, lycalis: 10, materials: { 'infernic-common': 7 },
      characters: { ember: { level: 30, evolution: 2, weaponRank: 3 } }, firstFracture: true,
      dungeonStages: { infernic: 45 }, infusionStages: { heavens: 25 }, receipts: ['old:enemy'],
      creatures: { 'adventure:goblin': { defeated: true } }, squad: ['ember'] };
    saved.setItem(ACCOUNT_KEY, JSON.stringify(legacy));
    const before = saved.getItem(ACCOUNT_KEY);
    const write = vi.spyOn(saved, 'setItem');
    const loaded = loadAccount(saved);
    expect(write).not.toHaveBeenCalled();
    expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
    expect(loaded.bannerPity).toBeUndefined();
    expect(loaded.capturedCharacters).toBeUndefined();
    const draw = summonCharacter(saved, () => 0);
    expect(write).toHaveBeenCalledTimes(1);
    expect(draw.account).toMatchObject({ version: 4, fractalis: 12345, lycalis: 0, materials: legacy.materials,
      characters: legacy.characters, firstFracture: true, receipts: legacy.receipts,
      creatures: legacy.creatures, squad: legacy.squad, dungeonStages: { infernic: 35 }, infusionStages: { heavens: 35 } });
    expect(draw.copy?.level).toBe(50);
    expect(loadAccount(saved)).toEqual(draw.account);
  });
});
