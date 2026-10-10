import { describe, expect, it, vi } from 'vitest';
import { currencyModes, infusionStageCount } from '../content/activities';
import { infusionEncounter, infusionEnemies, infusionDrops, sanctuaryEnemyStats, sanctuarySalePrices, treasurySalePrices } from '../content/infusions';
import { sanctuaryLycalisOdds, rollStagedLycalis, fractalisDrop } from '../content/loot-random';
import { getCreature, creatureLoot } from '../content/creatures';
import { standardBannerPool } from '../content/standard-banner';
import { conduits } from '../content/conduits';
import { ACCOUNT_KEY, loadAccount, saveAccount, saveAccountRewards, creatureSaleOffer, sellCurrencyCreature,
  setCharacterLock, setSquad, equipConduit, validateAccount, summonCharacter, evolutionFodderOptions, levelCapturedCharacter } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { createCreatureCopy, resolveCapturedFighter, capturedProgress, validateCapturedCharacters } from './character-instances';
import { createInfusionBattle, act, endTurn, nextStage } from './battle';
import { gameplayHub } from '../presentation/gameplay';
import { archives } from '../presentation/archives';
import { characterCopyManagement, summonHub } from '../presentation/roster';
import { creatureGlossary } from '../presentation/creature-glossary';
import { battleResults } from '../presentation/battle-results';
import { createSession, BattleView } from '../presentation/battle-view';
import { defaultBindings } from './hotkeys';

function storage(): ProfileStorage {
  const map = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  return { getItem: (key) => map.get(key) ?? null, setItem: (key, value) => { map.set(key, value); }, removeItem: (key) => { map.delete(key); } };
}
function defeat(stage: number, burn = false, premiumSeed = 15872) {
  const state = createInfusionBattle('sanctuary', stage, 1, 'ember', { level: 105, evolution: 6 });
  state.enemies.forEach((enemy) => { enemy.hp = 1; if (burn) enemy.burn = { damage: 1, turns: 1 }; });
  state.lycalisSeed = premiumSeed;
  state.allies[0].shatter = 100;
  return burn ? endTurn(state) : act(state, 'ember', 'skill2', state.enemies[0].id);
}

describe('Phase10 Rosethorn Sanctuary', () => {
  it('authors25 floors65-120, six fixed Tranquilitic forms and exact stage-specific loot', () => {
    expect(currencyModes.find((entry) => entry.id === 'sanctuary')?.name).toBe('Rosethorn Sanctuary');
    expect(infusionStageCount('sanctuary')).toBe(25);
    for (let stage = 1; stage <= 25; stage++) {
      const encounter = infusionEncounter('sanctuary', stage);
      expect(encounter.level).toBe(Math.round(65 + (stage - 1) * 55 / 24));
      expect(encounter.tier).toBe(Math.floor((stage - 1) * 6 / 25));
      expect(encounter.boss).toBe(stage % 5 === 0);
      expect(encounter.enemy.element).toBe('tranquilitic');
      expect(encounter.enemy.art).toBe(infusionEnemies.sanctuary[encounter.tier][1]);
      expect(encounter.background).toBe('sanctuary-arena.png');
      const random = vi.fn(() => 0);
      expect(infusionDrops('sanctuary', stage, random)).toEqual({});
      expect(random).not.toHaveBeenCalled();
      const odds = sanctuaryLycalisOdds(encounter.level);
      expect(creatureLoot(getCreature(`infusion:sanctuary:${encounter.tier}`), stage)).toEqual([
        { id: 'fractalis', ...fractalisDrop(encounter.level) },
        { id: 'lycalis', minimum: odds[1].amount, maximum: odds[1].amount, chance: odds[1].chance, note: expect.any(String) },
      ]);
      for (const burn of [false, true]) {
        const result = defeat(stage, burn);
        const rewards = result.events.filter((event) => event.kind === 'reward');
        expect(rewards).toHaveLength(encounter.boss ? 1 : 2);
        expect(rewards[0].lycalis).toBe(odds[1].amount);
        for (const reward of rewards) {
          expect(reward.lycalis === undefined || reward.lycalis === odds[1].amount).toBe(true);
          expect(reward.materials).toEqual({});
          expect(reward.message).not.toContain(' and  and ');
        }
      }
    }
    expect(sanctuaryEnemyStats(120, false).health).toBeCloseTo(200000);
    expect(sanctuaryEnemyStats(120, true).health).toBeCloseTo(400000);
    for (const stage of [0, 26, NaN, 1.5]) expect(() => infusionEncounter('sanctuary', stage)).toThrow();
  });
  it('implements the exact 1-at 50% to 5-at 80% curve and validates RNG and level boundaries', () => {
    expect(sanctuaryLycalisOdds(65)).toEqual([{ amount: 0, chance: .5 }, { amount: 1, chance: .5 }]);
    expect(sanctuaryLycalisOdds(120)[1]).toEqual({ amount: 5, chance: .8 });
    for (let level = 65; level <= 120; level++) {
      const [none, drop] = sanctuaryLycalisOdds(level);
      expect(drop.amount).toBe(Math.round(1 + 4 * (level - 65) / 55));
      expect(drop.chance).toBeCloseTo(.5 + .3 * (level - 65) / 55, 14);
      expect(rollStagedLycalis('sanctuary', level, () => none.chance - 1e-10)).toBe(0);
      expect(rollStagedLycalis('sanctuary', level, () => none.chance)).toBe(drop.amount);
      expect(rollStagedLycalis('sanctuary', level, () => .999999)).toBe(drop.amount);
    }
    for (const level of [64, 121, NaN, 65.5]) expect(() => sanctuaryLycalisOdds(level)).toThrow();
    for (const roll of [-1, 1, NaN, Infinity]) expect(() => rollStagedLycalis('sanctuary', 65, () => roll)).toThrow();
  });
  it('keeps premium RNG independent of Prismatica, captures and combat for direct and burn kills', () => {
    for (const burn of [false, true]) {
      const premium = defeat(25, burn);
      const none = defeat(25, burn, 1);
      expect(premium.events.find((entry) => entry.kind === 'reward')?.lycalis).toBe(5);
      expect(none.events.find((entry) => entry.kind === 'reward')?.lycalis).toBeUndefined();
      expect(premium.state.rewardSeed).toBe(none.state.rewardSeed);
      expect(premium.state.captureSeed).toBe(none.state.captureSeed);
      expect(premium.state.seed).toBe(none.state.seed);
      expect(premium.events.map(({ lycalis, message, ...event }) => event))
        .toEqual(none.events.map(({ lycalis, message, ...event }) => event));
    }
  });
  it('atomically saves rewards/captures/unlocks/receipts, rejects forged amounts/sources/materials and retries failures', () => {
    const saved = storage();
    const result = defeat(25);
    const write = saved.setItem;
    saved.setItem = () => { throw new Error('Write denied'); };
    expect(() => saveAccountRewards(saved, result, 'run')).toThrow('Write denied');
    expect(saved.getItem(ACCOUNT_KEY)).toBeNull();
    saved.setItem = write;
    const spy = vi.spyOn(saved, 'setItem');
    const account = saveAccountRewards(saved, result, 'run');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(account.lycalis).toBe(5);
    expect(account.fractalis).toBeGreaterThanOrEqual(15);
    expect(account.materials).toEqual({});
    expect(account.capturedCharacters?.[0].level).toBe(120);
    expect(account.capturedCharacters?.[0].skills).toEqual(result.state.enemies[0].enemySkills);
    expect(account.infusionStages.sanctuary).toBe(25);
    expect(loadAccount(saved)).toEqual(account);
    expect(saveAccountRewards(saved, result, 'run')).toEqual(account);
    expect(spy).toHaveBeenCalledTimes(1);
    const before = saved.getItem(ACCOUNT_KEY);
    for (const patch of ['amount', 'level', 'alive', 'lycalis', 'material', 'mode'] as const) {
      const forged = structuredClone(result);
      const reward = forged.events.find((entry) => entry.kind === 'reward')!;
      if (patch === 'amount') reward.amount = 1000;
      if (patch === 'level') forged.state.enemies[0].level = 119;
      if (patch === 'alive') forged.state.enemies[0].hp = 1;
      if (patch === 'lycalis') reward.lycalis = 3;
      if (patch === 'material') reward.materials = { 'tranquilitic-common': 1 };
      if (patch === 'mode') forged.state.enemies[0].creatureId = 'infusion:heavens:5';
      expect(() => saveAccountRewards(saved, forged, `forged-${patch}`)).toThrow();
      expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
    }
    expect(() => validateAccount({ ...account, infusionStages: { sanctuary: 26 } })).toThrow();
    expect(validateAccount({ ...account, version: 2, infusionStages: { sanctuary: 25, treasury: 25, heavens: 25 } }).infusionStages)
      .toEqual({ sanctuary: 25, treasury: 25, heavens: 35 });
    expect(battleResults(result.state, result.events)).toContain('Activity complete');
    expect(() => nextStage(result.state, {})).toThrow('complete');
  });
  it('supports independent copies, leveling, mixed/all-wisp squads, Continue and unchanged infusion recipes', () => {
    const saved = storage();
    const copy = createCreatureCopy('infusion:sanctuary:0');
    const other = createCreatureCopy(copy.creatureId);
    const account = loadAccount(saved);
    account.capturedCharacters = [copy, other, createCreatureCopy('infusion:sanctuary:5')];
    account.fractalis = 10000;
    account.materials = { 'tranquilitic-common': 10 };
    saveAccount(saved, account);
    expect(evolutionFodderOptions(account, 'tranquilitic', 3).every((entry) => !entry.eligible)).toBe(true);
    const upgraded = levelCapturedCharacter(saved, copy.instanceId, 65);
    expect(upgraded.capturedCharacters?.[0].level).toBe(66);
    expect(upgraded.capturedCharacters?.[1].level).toBe(65);
    expect(creatureSaleOffer(upgraded, copy.instanceId)).toMatchObject(sanctuarySalePrices[0]);
    expect(() => validateCapturedCharacters([{ ...copy, level: 64 }])).toThrow();
    expect(() => validateCapturedCharacters([{ ...copy, acquisition: 'banner-duplicate' }])).toThrow();
    expect(resolveCapturedFighter(copy).stats.health).toBeCloseTo(sanctuaryEnemyStats(65, false).health * .65);
    for (const ids of [[copy.instanceId, other.instanceId], ['ember', copy.instanceId]]) {
      const state = createInfusionBattle('sanctuary', 24, 1, 'ember', { level: 0, evolution: 1 }, ids,
        { ember: { level: 0, evolution: 1 } }, {}, [copy, other]);
      state.phase = 'cleared';
      state.allies[0].shatter = 100;
      const next = nextStage(state, { ember: { level: 0, evolution: 1 } });
      expect(next.state.wave).toBe(25);
      expect(next.state.allies.map((ally) => ally.id)).toEqual(ids);
      expect(next.state.allies[0].shatter).toBe(100);
    }
  });
  it('sells each fixed rarity for both currencies in one write, retaining other copies/discovery/pity', () => {
    expect(sanctuarySalePrices.map((price) => price.lycalis)).toEqual([1, 2, 3, 5, 7, 10]);
    expect(sanctuarySalePrices.map((price) => price.fractalis)).toEqual([100, 300, 1000, 3000, 10000, 30000]);
    for (let tier = 0; tier < 6; tier++) {
      const saved = storage();
      const copy = createCreatureCopy(`infusion:sanctuary:${tier}`);
      const other = createCreatureCopy(copy.creatureId);
      const account = loadAccount(saved);
      account.capturedCharacters = [copy, other];
      account.creatures[copy.creatureId] = { defeated: true };
      account.bannerPity = { standard: { highestStar: 10, unownedHighestStar: 20 } };
      account.conduitEquipment = { [copy.instanceId]: Array.from({ length: 8 }, () => null) };
      saveAccount(saved, account);
      const offer = creatureSaleOffer(account, copy.instanceId);
      expect(offer).toMatchObject(sanctuarySalePrices[tier]);
      expect(offer.fractalis).toBeLessThan(treasurySalePrices[tier]);
      const write = vi.spyOn(saved, 'setItem');
      const sold = sellCurrencyCreature(saved, copy.instanceId);
      expect(write).toHaveBeenCalledTimes(1);
      expect(sold.fractalis).toBe(offer.fractalis);
      expect(sold.lycalis).toBe(offer.lycalis);
      expect(sold.capturedCharacters).toEqual([other]);
      expect(sold.conduitEquipment?.[copy.instanceId]).toBeUndefined();
      expect(sold.creatures).toEqual(account.creatures);
      expect(sold.bannerPity).toEqual(account.bannerPity);
      expect(loadAccount(saved)).toEqual(sold);
      expect(() => sellCurrencyCreature(saved, copy.instanceId)).toThrow();
    }
  });
  it('rereads all protections, rejects nonsale creatures, and preserves both balances/copy on write failure or overflow', () => {
    const saved = storage();
    const copy = createCreatureCopy('infusion:sanctuary:5');
    const account = loadAccount(saved);
    account.capturedCharacters = [copy, createCreatureCopy('infusion:heavens:0')];
    account.conduits = { [conduits[0].id]: 1 };
    saveAccount(saved, account);
    for (const protection of ['lock', 'squad', 'conduit'] as const) {
      if (protection === 'lock') setCharacterLock(saved, copy.instanceId, true);
      if (protection === 'squad') setSquad(saved, [copy.instanceId]);
      if (protection === 'conduit') equipConduit(saved, copy.instanceId, 0, conduits[0].id);
      const before = saved.getItem(ACCOUNT_KEY);
      expect(() => sellCurrencyCreature(saved, copy.instanceId)).toThrow('cannot be sold');
      expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
      expect(characterCopyManagement(loadAccount(saved))).toContain('Sale protected');
      saveAccount(saved, account);
    }
    for (const id of ['ember', account.capturedCharacters![1].instanceId]) expect(() => sellCurrencyCreature(saved, id)).toThrow();
    const before = saved.getItem(ACCOUNT_KEY);
    const write = saved.setItem;
    saved.setItem = () => { throw new Error('Write denied'); };
    expect(() => sellCurrencyCreature(saved, copy.instanceId)).toThrow('Write denied');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
    saved.setItem = write;
    for (const currency of ['fractalis', 'lycalis'] as const) {
      saveAccount(saved, { ...account, [currency]: Number.MAX_SAFE_INTEGER });
      const overflowing = saved.getItem(ACCOUNT_KEY);
      expect(() => sellCurrencyCreature(saved, copy.instanceId)).toThrow();
      expect(saved.getItem(ACCOUNT_KEY)).toBe(overflowing);
    }
  });
  it('adds the first three wisps to Standard with equal tier odds and atomic independently sellable rewards', () => {
    const pool = standardBannerPool();
    expect(pool).toHaveLength(22);
    expect(pool.reduce((total, entry) => total + entry.chance, 0)).toBeCloseTo(1, 14);
    for (let tier = 0; tier < 3; tier++) {
      const entry = pool.find((candidate) => candidate.id === `infusion:sanctuary:${tier}`)!;
      expect(entry.chance).toBeCloseTo(.989 * [50, 30, 17][tier] / 97 / 4, 14);
      const roll = pool.slice(0, pool.indexOf(entry)).reduce((total, candidate) => total + candidate.chance, 0) + entry.chance / 2;
      const saved = storage();
      const account = loadAccount(saved);
      account.lycalis = 20;
      saveAccount(saved, account);
      const write = vi.spyOn(saved, 'setItem');
      const result = summonCharacter(saved, () => roll);
      expect(write).toHaveBeenCalledTimes(1);
      expect(result.copy?.creatureId).toBe(entry.id);
      expect(result.copy?.level).toBe(infusionEncounter('sanctuary', getCreature(entry.id).stages[0]).level);
      expect(result.account.lycalis).toBe(10);
      expect(result.account.bannerPity?.standard).toEqual({ highestStar: 1, unownedHighestStar: 1 });
      expect(creatureSaleOffer(result.account, result.copy!.instanceId)).toMatchObject(sanctuarySalePrices[tier]);
    }
  });
  it('renders accurate activity, sale, glossary, archives and battle chrome without missing assets', () => {
    const saved = storage();
    const account = loadAccount(saved);
    account.capturedCharacters = [createCreatureCopy('infusion:sanctuary:5')];
    account.creatures['infusion:sanctuary:5'] = { defeated: true };
    expect(gameplayHub(account)).toContain('data-infusion="sanctuary"');
    expect(gameplayHub(account)).toContain('50% of 1 at Lv.65 to 80% of 5 at Lv.120');
    expect(characterCopyManagement(account)).toContain('30,000 Prismatica + 10 Null-Prismatica');
    const glossary = creatureGlossary(account);
    expect(glossary).toContain('aria-label="Sale value"');
    expect(glossary).toContain('currencies/fractalis.png');
    expect(glossary).toContain('currencies/lycalis.png');
    expect(glossary).toContain('<strong>30,000</strong>');
    expect(glossary).toContain('<strong>10</strong>');
    expect(archives(account).match(/data-archive-character=/g)).toHaveLength(126);
    const html = summonHub(account);
    expect(html.match(/data-banner-entry=/g)).toHaveLength(22);
    const table = html.slice(html.indexOf('<table'), html.indexOf('</table>'));
    expect(table).toContain('Rosethorn Wisp');
    expect(table).not.toMatch(/<img|<svg|portrait/);
    const session = createSession('ember', { level: 0, evolution: 1 }, { mode: 'sanctuary', stage: 25 });
    const menu = { addEventListener: vi.fn(), close: vi.fn() };
    const view = Object.create(BattleView.prototype);
    Object.assign(view, { session, bindings: defaultBindings, host: { innerHTML: '', querySelectorAll: () => [],
      querySelector: (selector: string) => selector === '#battle-menu' ? menu : null }, bind: vi.fn() });
    Reflect.apply(Reflect.get(BattleView.prototype, 'render'), view, []);
    expect(view.host.innerHTML).toContain('Stage 25 / 25');
    expect(view.host.innerHTML).toContain('CURRENCY FARM');
    expect(view.host.innerHTML).toContain('80% chance of 5');
    expect(view.host.innerHTML).toContain('assets/backgrounds/sanctuary-arena.png');
    expect(view.host.innerHTML).toContain('assets/enemies/the-flame-beyond-eternity-rosethorn-wisp.png');
    expect(view.host.innerHTML).not.toContain('enemies/undefined');
    expect(gameplayHub(account)).toContain('assets/banners/sanctuary-banner.png');
    expect(capturedProgress(account.capturedCharacters[0]).tier).toBe(5);
  });
});
