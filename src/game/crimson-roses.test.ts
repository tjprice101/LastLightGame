import { describe, expect, it, vi } from 'vitest';
import { bossLootRange } from '../content/final-boss-loot';
import { eventModes, infusionStageCount } from '../content/activities';
import { capturedEnemyStats, infusionEncounter, infusionDrops, infusionLoot, roseEnemyStats } from '../content/infusions';
import { enemyCombatStats } from '../content/stat-growth';
import type { ConduitSlots } from '../content/conduits';
import { roseMaterials, roseCaptureAllowed, roseSaleQuantities, roseFormStages } from '../content/roses';
import { roseBannerPool } from '../content/rose-banner';
import { standardBannerPool, resolveBannerPull } from '../content/standard-banner';
import { roseCharacters, availableStarters, getStarter } from '../content/starters';
import { characterArt, characterName } from '../content/character-art';
import { resolveFighter, shatterGauge } from '../content/combat';
import { characterLevelCap, characterLevelCost, characterEvolutionCost, characterGrowthFactor } from '../content/progression';
import { materialArt, materialName } from '../content/dungeon-art';
import { creatureLoot, getCreature } from '../content/creatures';
import { fractalisDrop } from '../content/loot-random';
import { createBattle, createInfusionBattle, act, endTurn, nextStage, withMasterLoadouts } from './battle';
import { ACCOUNT_KEY, emptyAccount, loadAccount, saveAccount, saveAccountRewards, summonCharacter, sellCurrencyCreature,
  creatureSaleOffer, setSquad, evolutionFodderOptions, upgradeCharacter, maxLevelPlan, levelCharacterToMaximum } from './account';
import { SAVE_KEY, saveStarter, type ProfileStorage } from './profile';
import { createCreatureCopy, validateCapturedCharacters, capturedProgress, resolveCapturedFighter } from './character-instances';
import { gameplayHub } from '../presentation/gameplay';
import { roseEvent } from '../presentation/rose-event';
import { characterHub } from '../presentation/hub';
import { archives } from '../presentation/archives';
import { characterCopyManagement, summonHub } from '../presentation/roster';
import { portrait } from '../presentation/portrait';
import { abilityIcon } from '../presentation/ability-icon';
import { battleResults } from '../presentation/battle-results';
import { createSession } from '../presentation/battle-view';
import { playNativeBenchmark } from './native-benchmark-pilot';

function storage() {
  const map = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  let fail = false;
  const saved: ProfileStorage = {
    getItem: (key) => map.get(key) ?? null,
    setItem: vi.fn((key, value) => { if (fail) throw new Error('Storage unavailable'); map.set(key, value); }),
    removeItem: (key) => { map.delete(key); },
  };
  return { saved, fail: () => { fail = true; }, writes: () => vi.mocked(saved.setItem).mock.calls.length,
    reset: () => vi.mocked(saved.setItem).mockClear() };
}

function funded() {
  const account = emptyAccount();
  account.characters.ember = { level: 105, evolution: 6, weaponRank: 2 };
  account.fractalis = 100000;
  account.lycalis = 1000;
  account.materials = Object.fromEntries(roseMaterials.map((material) => [material.id, 1000]));
  account.squad = ['ember'];
  return account;
}

function defeat(stage: number, burn = false) {
  const state = createInfusionBattle('roses', stage, 1, 'ember', { level: 105, evolution: 6 });
  state.captureSeed = 1;
  state.enemies.forEach((enemy) => {
    enemy.hp = 1;
    if (burn) enemy.burn = { damage: 1, turns: 1 };
  });
  state.allies[0].shatter = 100;
  return burn ? endTurn(state) : act(state, 'ember', 'skill2', state.enemies[0].id);
}

describe('Passion of Crimson Roses integration', () => {
  it('authors35 stages 80-140 with six Luminous forms and increasing endgame stats', () => {
    expect(eventModes[0]).toMatchObject({ stages: 35, startingLevel: 80, maximumLevel: 140 });
    expect(infusionStageCount('roses')).toBe(35);
    for (let stage = 1; stage <= 35; stage++) {
      const encounter = infusionEncounter('roses', stage);
      expect(encounter.level).toBe(Math.round(80 + (stage - 1) * 60 / 34));
      expect(encounter.tier).toBe(roseFormStages.filter((first) => stage >= first).length - 1);
      expect(encounter.enemy.element).toBe('tranquilitic');
      expect(encounter.boss).toBe(stage % 5 === 0);
      expect(encounter.stats.health).toBe(roseEnemyStats(encounter.level, encounter.boss).health);
      expect(encounter.enemy.art).toBe(getCreature(`infusion:roses:${encounter.tier}`).art);
      expect(encounter.background).toBe('roses-arena.png');
      expect(getCreature(`infusion:roses:${encounter.tier}`).stages).toContain(stage);
    }
    expect(roseEnemyStats(120, false).health).toBe(enemyCombatStats(120, false).health);
    expect(roseEnemyStats(140, false).health).toBe(enemyCombatStats(140, false).health);
    expect(roseEnemyStats(140, true).health).toBe(enemyCombatStats(140, true).health);
    expect(roseEnemyStats(140, true).health).toBeGreaterThan(roseEnemyStats(140, false).health);
    for (let level = 81; level <= 140; level++) {
      const prior = roseEnemyStats(level - 1, false);
      const next = roseEnemyStats(level, false);
      for (const stat of ['health', 'damage', 'defense'] as const) expect(next[stat]).toBeGreaterThan(prior[stat]);
    }
    expect(infusionEncounter('roses', 23).level).toBe(119);
    expect(infusionEncounter('roses', 23).tier).toBe(4);
    expect(infusionEncounter('roses', 24).level).toBe(121);
    for (const stage of [0, 36, 1.5, NaN]) expect(() => infusionEncounter('roses', stage)).toThrow();
  });

  it.each([119, 120, 121, 140])('enforces the exact capture ceiling at Lv.%i', (level) => {
    expect(roseCaptureAllowed(level)).toBe(level <= 120);
  });

  it('Crinso maintains a direct single-target edge combo in the Rose event without authoring Burn', () => {
    const state = createInfusionBattle('roses', 35, 1, 'crinso', { level: 105, evolution: 6 });
    state.enemies[0].stats.damage = 1;
    state.allies[0].shatter = 100;
    const first = act(state, 'crinso', 'skill1', state.enemies[0].id);
    expect(first.state.allies[0].native).toMatchObject({ edge: 'gold', combo: 0 });
    const next = endTurn(first.state).state;
    next.allies[0].shatter = 100;
    const crimson = act(next, 'crinso', 'skill2', next.enemies[0].id);
    expect(crimson.state.allies[0].native).toMatchObject({ edge: 'crimson', combo: 1 });
    expect(crimson.state.enemies.every(enemy => enemy.burn.turns === 0)).toBe(true);
    expect(crimson.events.filter(event => event.kind === 'damage' && event.source === 'crinso')).toHaveLength(1);
    expect(endTurn(crimson.state).events.some(event => event.periodic && event.source === 'crinso')).toBe(false);
  });

  it('keeps combat and material RNG independent of Roselius capture rolls', () => {
    const state = createInfusionBattle('roses', 23, 1, 'ember', { level: 105, evolution: 6 });
    state.allies[0].shatter = 100;
    state.enemies.forEach((enemy) => { enemy.hp = 1; });
    const results = [1, 2147483647].map((captureSeed) =>
      act({ ...structuredClone(state), captureSeed }, 'ember', 'skill2', state.enemies[0].id));
    expect(results[0].state.seed).toBe(results[1].state.seed);
    expect(results[0].state.rewardSeed).toBe(results[1].state.rewardSeed);
    expect(results[0].state.captureSeed).not.toBe(results[1].state.captureSeed);
    const rewards = results.map((result) => result.events.filter((entry) => entry.kind === 'reward')
      .map((entry) => ({ amount: entry.amount, materials: entry.materials })));
    expect(rewards[0]).toEqual(rewards[1]);
  });

  it.each([
    ['rosetta', 'thornia', 'crinso'],
    ['ember', 'tide', 'sprout'],
    ['rosetta', 'thornia', 'sprout'],
  ] as const)('does not guarantee a140 boss clear for the old %s/%s/%s build', (...team) => {
    const progress = Object.fromEntries(team.map((id) => [id, { level: 105, evolution: 6 }]));
    const roles = {
      ember: ['siege-cantilever', 'resonance-crucible', 'infernic-cinder-testament'],
      tide: ['opal-indexer', 'wardglass-transformer', 'ward-stitch-spool'],
      sprout: ['springwell-pump', 'coilfeed-ratchet', 'botanic-graft-covenant'],
      rosetta: ['wardglass-transformer', 'duplex-heart', 'tranquilitic-accord-bastion'],
      thornia: ['lifeline-flywheel', 'duplex-heart', 'siege-cantilever'],
      crinso: ['breach-pendulum', 'lifeline-flywheel', 'verdict-caliper'],
    } as const;
    const equipment = Object.fromEntries(team.map(id => [id, [
      'vigil-core', 'immortal-vessel', 'citadel-spine', 'horizon-heartcase',
      team[0] === 'ember' ? 'bastion-lock' : 'sentinel-aperture', ...roles[id],
    ] satisfies ConduitSlots]));
    const masters = {
      ember: 'master-ember-1', tide: 'master-tide-3', sprout: 'master-sprout-1',
      rosetta: 'master-rosetta-1', thornia: 'master-thornia-3', crinso: 'master-crinso-3',
    } as const;
    for (const seed of [1, 1729, 12345]) {
      const upgrades = Object.fromEntries(Object.values(equipment).flatMap(slots => slots.flatMap(id => id ? [[id, 5]] : [])));
      const state = playNativeBenchmark(withMasterLoadouts(createInfusionBattle('roses', 35, seed, team[0], progress[team[0]], team, progress, equipment, [], upgrades), masters));
      expect(['cleared', 'defeat'], `seed ${seed}`).toContain(state.phase);
    }
  });

  it.each(Array.from({ length: 35 }, (_, index) => index + 1))('commits actual stage%i rewards and capture eligibility without a clear grant or reroll', (stage) => {
    for (const burn of [false, true]) {
      const encounter = infusionEncounter('roses', stage);
      const result = defeat(stage, burn);
      const rewards = result.events.filter((event) => event.kind === 'reward');
      expect(rewards).toHaveLength(encounter.boss ? 1 : 2);
      const range = bossLootRange(fractalisDrop(encounter.level, 140), stage === 35 ? 5 : 1);
      const store = storage();
      saveAccount(store.saved, funded());
      store.reset();
      const saved = saveAccountRewards(store.saved, result, `stage-${stage}`);
      expect(store.writes()).toBe(1);
      expect(saved.fractalis).toBe(100000 + rewards.reduce((sum, event) => sum + event.amount, 0));
      expect(saved.lycalis).toBe(1000);
      for (const reward of rewards) {
        expect(reward.amount).toBeGreaterThanOrEqual(range.minimum);
        expect(reward.amount).toBeLessThanOrEqual(range.maximum);
        expect(reward.lycalis).toBeUndefined();
        for (const [id, amount] of Object.entries(reward.materials ?? {})) {
          expect(roseMaterials.some((material) => material.id === id)).toBe(true);
          const drop = infusionLoot('roses', stage).specialties.find((entry) => entry.id === id);
          expect(drop).toBeDefined();
          expect(amount).toBeGreaterThanOrEqual(drop!.minimum);
          expect(amount).toBeLessThanOrEqual(drop!.maximum);
        }
        if (encounter.level > 120) expect(reward.capture).toBeUndefined();
      }
      expect(saved.capturedCharacters?.length ?? 0).toBe(encounter.level <= 120 ? rewards.filter((event) => event.capture).length : 0);
      expect(saved.infusionStages.roses).toBe(Math.min(35, stage + 1));
      const raw = store.saved.getItem(ACCOUNT_KEY);
      saveAccountRewards(store.saved, result, `stage-${stage}`);
      expect(store.saved.getItem(ACCOUNT_KEY)).toBe(raw);
      expect(store.writes()).toBe(1);
      expect(battleResults(result.state, result.events)).toContain('Prismatica');
    }
  });

  it('uses shared authoritative loot with guaranteed Seeds and growing independent material rolls', () => {
    const first = infusionLoot('roses', 1).specialties;
    expect(first).toEqual([{ id: 'rosethorn-common', minimum: 1, maximum: 2, chance: 1 }]);
    const final = infusionLoot('roses', 35).specialties;
    expect(final.map((drop) => [drop.minimum, drop.maximum])).toEqual(Array.from({ length: 6 }, () => [15, 30]));
    expect(final.map((drop) => drop.chance)).toEqual([1, .98, .9, .8, .6, .35]);
    for (let stage = 1; stage <= 35; stage++) {
      const encounter = infusionEncounter('roses', stage);
      const creature = getCreature(`infusion:roses:${encounter.tier}`);
      expect(creatureLoot(creature, stage)).toEqual([{ id: 'fractalis', ...bossLootRange(fractalisDrop(encounter.level, 140), stage === 35 ? 5 : 1) },
        ...infusionLoot('roses', stage).specialties]);
    }
    expect(infusionDrops('roses', 35, () => 0)).toEqual(Object.fromEntries(roseMaterials.map((material) => [material.id, 15])));
    expect(infusionDrops('roses', 35, () => .999999)).toEqual({ 'rosethorn-common': 30 });
  });

  it('rejects forged event captures, premium/material payouts, living/wrong-stage sources and failed writes atomically', () => {
    const store = storage();
    saveAccount(store.saved, funded());
    const raw = store.saved.getItem(ACCOUNT_KEY);
    const invalid = [
      (result: ReturnType<typeof defeat>) => { result.events.find((event) => event.kind === 'reward')!.capture = { creatureId: result.state.enemies[0].creatureId!, level: 140 }; },
      (result: ReturnType<typeof defeat>) => { result.events.find((event) => event.kind === 'reward')!.lycalis = 1; },
      (result: ReturnType<typeof defeat>) => { result.events.find((event) => event.kind === 'reward')!.materials = { 'tranquilitic-common': 1 }; },
      (result: ReturnType<typeof defeat>) => { result.events.find((event) => event.kind === 'reward')!.materials = { 'rosethorn-common': 100 }; },
      (result: ReturnType<typeof defeat>) => { result.events.find((event) => event.kind === 'reward')!.materials = {}; },
      (result: ReturnType<typeof defeat>) => { result.state.enemies[0].hp = 1; },
      (result: ReturnType<typeof defeat>) => { result.state.enemies[0].level = 120; },
    ];
    for (const mutate of invalid) {
      const result = defeat(35);
      mutate(result);
      expect(() => saveAccountRewards(store.saved, result, 'invalid')).toThrow();
      expect(store.saved.getItem(ACCOUNT_KEY)).toBe(raw);
    }
    store.fail();
    expect(() => saveAccountRewards(store.saved, defeat(23), 'fail')).toThrow('Storage unavailable');
    expect(store.saved.getItem(ACCOUNT_KEY)).toBe(raw);
    expect(() => createCreatureCopy('infusion:roses:5')).toThrow();
    const duplicate = createCreatureCopy('infusion:roses:5', undefined, 80, 'banner-duplicate');
    expect(() => validateCapturedCharacters([{ ...duplicate, acquisition: undefined }])).toThrow();
    expect(() => validateCapturedCharacters([{ ...duplicate, level: 59 }])).toThrow();
    expect(validateCapturedCharacters([{ ...duplicate, level: 79 }])[0].level).toBe(60);
  });

  it.each(roseMaterials.map((_, tier) => tier))('exchanges form%i for its own materials in one protected-safe write', (tier) => {
    const store = storage();
    const account = funded();
    const creature = getCreature(`infusion:roses:${tier}`);
    const copy = tier === 5 ? createCreatureCopy(creature.id, undefined, 80, 'banner-duplicate') : createCreatureCopy(creature.id);
    account.capturedCharacters = [copy];
    saveAccount(store.saved, account);
    store.reset();
    const offer = creatureSaleOffer(loadAccount(store.saved), copy.instanceId);
    expect(offer.materials).toEqual({ [roseMaterials[tier].id]: roseSaleQuantities[tier] });
    const sold = sellCurrencyCreature(store.saved, copy.instanceId);
    expect(store.writes()).toBe(1);
    expect(sold.materials[roseMaterials[tier].id]).toBe(1000 + roseSaleQuantities[tier]);
    expect(sold.fractalis).toBe(account.fractalis);
    expect(sold.lycalis).toBe(account.lycalis);
    expect(sold.capturedCharacters).toEqual([]);
    const raw = store.saved.getItem(ACCOUNT_KEY);
    expect(() => sellCurrencyCreature(store.saved, copy.instanceId)).toThrow();
    expect(store.saved.getItem(ACCOUNT_KEY)).toBe(raw);
  });

  it.each(['locked', 'squad', 'conduit', 'overflow', 'write'] as const)('preserves exact copy and materials when sale is blocked by%s', (reason) => {
    const store = storage();
    const account = funded();
    const copy = createCreatureCopy('infusion:roses:0');
    account.capturedCharacters = [copy];
    if (reason === 'locked') copy.locked = true;
    if (reason === 'squad') account.squad = [copy.instanceId];
    if (reason === 'conduit') {
      account.conduits = { 'vigil-core': 1 };
      account.conduitEquipment = { [copy.instanceId]: ['vigil-core', null, null, null, null, null, null, null] };
    }
    if (reason === 'overflow') account.materials['rosethorn-common'] = Number.MAX_SAFE_INTEGER;
    saveAccount(store.saved, account);
    const raw = store.saved.getItem(ACCOUNT_KEY);
    store.reset();
    if (reason === 'write') store.fail();
    expect(() => sellCurrencyCreature(store.saved, copy.instanceId)).toThrow();
    expect(store.saved.getItem(ACCOUNT_KEY)).toBe(raw);
    expect(store.writes()).toBe(reason === 'write' ? 1 : 0);
  });

  it('preserves squad/gear/progress/Gauge snapshots across Continue and rejects final-stage Continue', () => {
    const copy = createCreatureCopy('infusion:roses:4');
    const progress = { rosetta: { level: 105, evolution: 6, weaponRank: 1 } };
    const gear = { rosetta: ['vigil-core', null, null, null, null, null, null, null] } as const;
    const state = createInfusionBattle('roses', 23, 1, 'rosetta', progress.rosetta, ['rosetta', copy.instanceId],
      progress, { rosetta: [...gear.rosetta] }, [copy]);
    state.phase = 'cleared';
    state.enemies.forEach((enemy) => { enemy.hp = 0; });
    state.allies[0].shatter = 70;
    const next = nextStage(state, progress).state;
    expect(next.allies[0].name).toBe('The Rose Beyond the Sun, Rosetta');
    expect(next.allies[0].shatter).toBe(70);
    expect(next.allies[0].conduits).toEqual(gear.rosetta);
    expect(next.allies[1].captured).toEqual(copy);
    expect(next.enemies[0].level).toBe(121);
    expect(resolveCapturedFighter(copy).stats.health).toBeCloseTo(capturedEnemyStats(capturedProgress(copy).level).health * .93);
    const last = defeat(35).state;
    expect(() => nextStage(last, { level: 105, evolution: 6 })).toThrow('complete');
  });
});

describe('Roses Under Sunny Skies and rose Element-Bearers', () => {
  it('authors six real outcomes with one equally split 1.1% six-star tier and excludes Roses from Standard', () => {
    const pool = roseBannerPool();
    expect(pool).toHaveLength(6);
    expect(pool.reduce((sum, entry) => sum + entry.chance, 0)).toBeCloseTo(1, 14);
    for (const id of ['rosetta', 'thornia', 'crinso'] as const) {
      expect(pool.find((entry) => entry.id === id)).toMatchObject({ stars: 6, chance: .011 / 3 });
      expect(getStarter(id).stars).toBe(6);
    }
    expect(pool.filter((entry) => entry.stars === 5)).toEqual([]);
    expect(pool.filter((entry) => entry.kind === 'character').reduce((sum, entry) => sum + entry.chance, 0)).toBeCloseTo(.011, 14);
    expect(pool.filter((entry) => entry.kind === 'material').map((entry) => entry.chance)).toEqual([50, 30, 17].map((weight) => .989 * weight / 97));
    expect(standardBannerPool()).toHaveLength(28);
    expect(standardBannerPool().filter((entry) => entry.kind === 'character').map((entry) => entry.id))
      .toEqual(['ember', 'tide', 'sprout', 'atmoso', 'aurora', 'bliss', 'bruno', 'disciple', 'elise', 'razor']);
    expect(availableStarters.map((entry) => entry.id)).toEqual(['ember', 'tide', 'sprout']);
    expect(() => saveStarter(storage().saved, 'rosetta')).toThrow('valid starter');
  });

  it.each(roseCharacters)('acquires$name at Lv.0/Evo.1, then converts duplicates to Rare Rosethorn materials', (character) => {
    const store = storage();
    saveAccount(store.saved, funded());
    const pool = roseBannerPool();
    const index = pool.findIndex((entry) => entry.id === character.id);
    const roll = pool.slice(0, index).reduce((sum, entry) => sum + entry.chance, 0) + pool[index].chance / 2;
    store.reset();
    const first = summonCharacter(store.saved, () => roll, 'roses');
    expect(store.writes()).toBe(1);
    expect(first.account.characters[character.id]).toEqual({ level: 0, evolution: 1, weaponRank: 0 });
    expect(first.account.conduitEquipment?.[character.id]).toBeUndefined();
    const second = summonCharacter(store.saved, () => roll, 'roses');
    expect(store.writes()).toBe(2);
    expect(second.copy).toBeUndefined();
    expect(second.materials).toEqual({ id: 'rosethorn-rare', amount: 15 });
    expect(second.account.materials['rosethorn-rare']).toBe(1015);
    expect(second.account.lycalis).toBe(980);
    expect(second.account.bannerPity?.standard).toBeUndefined();
    expect(second.account.characters[character.id]).toEqual(first.account.characters[character.id]);
  });

  it('targets all three six-stars equally for 200 / 500 guarantees and preserves independent pity on rejected/failed draws', () => {
    const pool = roseBannerPool();
    for (const [index, id] of ['rosetta', 'thornia', 'crinso'].entries()) {
      expect(resolveBannerPull(pool, [], { highestStar: 199, unownedHighestStar: 20 }, () => (index + .5) / 3).entry.id).toBe(id);
      const natural = resolveBannerPull(pool, [], { highestStar: 3, unownedHighestStar: 4 }, () => (index + .5) * .011 / 3);
      expect(natural.entry.id).toBe(id);
      expect(natural.pity).toEqual({ highestStar: 0, unownedHighestStar: 0 });
      const duplicate = resolveBannerPull(pool, [id], { highestStar: 3, unownedHighestStar: 4 }, () => (index + .5) * .011 / 3);
      expect(duplicate.pity).toEqual({ highestStar: 0, unownedHighestStar: 5 });
    }
    expect(resolveBannerPull(pool, [], { highestStar: 199, unownedHighestStar: 499 }, () => .9).guarantee).toBe('unowned-highest-star');
    for (const [index, id] of ['thornia', 'crinso'].entries()) {
      expect(resolveBannerPull(pool, ['rosetta'], { highestStar: 199, unownedHighestStar: 499 }, () => (index + .5) / 2).entry.id).toBe(id);
    }
    const all = resolveBannerPull(pool, ['rosetta', 'thornia', 'crinso'], { highestStar: 199, unownedHighestStar: 499 }, () => .9);
    expect(all.guarantee).toBe('all-owned-highest-star');
    expect(all.pity).toEqual({ highestStar: 0, unownedHighestStar: 0 });
    const lower = resolveBannerPull(pool, [], { highestStar: 3, unownedHighestStar: 4 }, () => .5);
    expect(lower.entry.kind).toBe('material');
    expect(lower.pity).toEqual({ highestStar: 4, unownedHighestStar: 5 });
    const store = storage();
    const account = funded();
    account.characters.rosetta = { level: 30, evolution: 2 };
    account.bannerPity = { standard: { highestStar: 6, unownedHighestStar: 7 }, roses: { highestStar: 199, unownedHighestStar: 499 } };
    saveAccount(store.saved, account);
    const pulled = summonCharacter(store.saved, () => .9, 'roses');
    expect(pulled.account.bannerPity?.standard).toEqual(account.bannerPity.standard);
    expect(pulled.account.bannerPity?.roses).toEqual({ highestStar: 0, unownedHighestStar: 0 });
    const raw = store.saved.getItem(ACCOUNT_KEY);
    store.fail();
    expect(() => summonCharacter(store.saved, () => .003, 'roses')).toThrow('Storage unavailable');
    expect(store.saved.getItem(ACCOUNT_KEY)).toBe(raw);
    const insufficient = storage();
    const poor = funded();
    poor.lycalis = 9;
    saveAccount(insufficient.saved, poor);
    const random = vi.fn(() => 0);
    const before = insufficient.saved.getItem(ACCOUNT_KEY);
    expect(() => summonCharacter(insufficient.saved, random, 'roses')).toThrow('10 Null-Prismatica');
    expect(random).not.toHaveBeenCalled();
    expect(insufficient.saved.getItem(ACCOUNT_KEY)).toBe(before);
  });

  it.each(roseCharacters)('uses six named forms, real combat kits, rose-only costs and max-level evolution gates for$name', (character) => {
    for (let evolution = 1; evolution <= 6; evolution++) {
      const cap = characterLevelCap(evolution);
      expect(characterName(character.id, evolution)).toMatch(new RegExp(`, ${character.name}$`));
      expect(characterArt(character.id, evolution).available).toBe(true);
      for (let level = 0; level <= cap; level++) {
        const progress = { level, evolution };
        const kit = resolveFighter(character.id, progress);
        expect(kit.stats.health).toBeCloseTo(resolveFighter(character.id).stats.health * characterGrowthFactor(progress));
        expect(kit.stats.crit).toBeLessThanOrEqual(.75);
        expect(kit.stats.critMultiplier).toBeLessThanOrEqual(3);
        for (const action of ['skill1', 'skill2', 'ultimate'] as const) expect(kit.abilities[action].description).not.toBe('');
        if (level < cap) expect(Object.keys(characterLevelCost(character.id, progress).materials).every((id) => id.startsWith('rosethorn-'))).toBe(true);
      }
      if (evolution === 6) continue;
      const store = storage();
      const account = funded();
      account.characters[character.id] = { level: cap - 1, evolution };
      const copies = Array.from({ length: Math.max(0, evolution - 2) }, () => createCreatureCopy('infusion:roses:4'));
      account.capturedCharacters = copies;
      saveAccount(store.saved, account);
      const raw = store.saved.getItem(ACCOUNT_KEY);
      expect(() => upgradeCharacter(store.saved, character.id, 'evolve', { level: cap - 1, evolution }, copies.map((copy) => copy.instanceId))).toThrow('level cap');
      expect(store.saved.getItem(ACCOUNT_KEY)).toBe(raw);
      account.characters[character.id] = { level: cap, evolution };
      saveAccount(store.saved, account);
      store.reset();
      const result = upgradeCharacter(store.saved, character.id, 'evolve', { level: cap, evolution }, copies.map((copy) => copy.instanceId));
      expect(store.writes()).toBe(1);
      expect(result.characters[character.id]).toEqual({ level: cap, evolution: evolution + 1 });
      expect(result.capturedCharacters).toEqual([]);
      expect(Object.keys(characterEvolutionCost(character.id, { level: cap, evolution }).materials).every((id) => id.startsWith('rosethorn-'))).toBe(true);
    }
  });

  it('shares exact rose costs through Max Level, fodder protection and displayed evolution selections', () => {
    const store = storage();
    const account = funded();
    account.characters.thornia = { level: 0, evolution: 1 };
    saveAccount(store.saved, account);
    const plan = maxLevelPlan(account, 'thornia');
    expect(plan.cost).toEqual({ fractalis: 1230, materials: { 'rosethorn-common': 30 } });
    expect(levelCharacterToMaximum(store.saved, plan).characters.thornia?.level).toBe(30);
    const copy = createCreatureCopy('infusion:roses:4');
    account.capturedCharacters = [copy, createCreatureCopy('infusion:abyss:5')];
    account.characters.thornia = { level: 60, evolution: 3 };
    let options = evolutionFodderOptions(account, 'chaotic', 3, 'thornia');
    expect(options.map((option) => option.eligible)).toEqual([true, false]);
    copy.locked = true;
    options = evolutionFodderOptions(account, 'chaotic', 3, 'thornia');
    expect(options[0].reasons).toContain('Locked');
    saveAccount(store.saved, account);
    const raw = store.saved.getItem(ACCOUNT_KEY);
    expect(() => upgradeCharacter(store.saved, 'thornia', 'evolve', { level: 60, evolution: 3 }, [copy.instanceId])).toThrow('Locked');
    expect(store.saved.getItem(ACCOUNT_KEY)).toBe(raw);
    expect(characterHub(getStarter('thornia'), 'upgrade-0', account)).toContain('from Passion of Crimson Roses');
    expect(characterHub(getStarter('thornia'), 'upgrade-0', account)).not.toContain('from Delve into the Abyss');
  });

  it.each(roseCharacters)('runs every$name action with exact Gauge costs, targeting and bounded effects', (character) => {
    for (const action of ['light', 'skill1', 'skill2', 'ultimate', 'defend'] as const) {
      const state = createBattle(12, [character.id, 'ember'], { [character.id]: { level: 0, evolution: 1 } });
      const actor = state.allies[0];
      actor.shatter = 100;
      actor.stats.crit = 0;
      state.enemies.forEach((enemy) => { enemy.hp = 100000; enemy.stats.health = 100000; });
      const snapshot = structuredClone(state);
      const result = act(state, character.id, action, state.enemies[0].id);
      expect(state).toEqual(snapshot);
      expect(result.state.allies[0].shatter).toBe(action === 'light' ? 100 : 100 - shatterGauge.costs[action]);
      if (action !== 'light' && action !== 'defend') {
        expect(result.events.find((event) => event.kind === 'attack')?.abilityName).toBe(actor.kit?.abilities[action].name);
        const ability = actor.kit!.abilities[action];
        if (ability.targets === 'all-allies') expect(result.state.enemies.map((enemy) => enemy.hp)).toEqual(snapshot.enemies.map((enemy) => enemy.hp));
        if (ability.targets === 'all-enemies') expect(result.state.enemies.every((enemy) => enemy.hp < 100000)).toBe(true);
        if (ability.strength.shield) expect(result.state.allies.every((ally) => ally.shield > 0)).toBe(true);
        if (ability.strength.weakenFraction) expect(result.state.enemies[0].weakened).toBe(2);
        if (ability.strength.burnMultiplier) expect(result.state.enemies[0].burn.turns).toBe(2);
      }
    }
  });

  it('renders event/banner/character/copy/archive surfaces honestly with no missing-art requests or load writes', () => {
    const store = storage();
    const account = funded();
    for (const character of roseCharacters) account.characters[character.id] = { level: 105, evolution: 6 };
    account.capturedCharacters = [createCreatureCopy('infusion:roses:5', undefined, 80, 'banner-duplicate')];
    account.infusionStages.roses = 35;
    saveAccount(store.saved, account);
    store.reset();
    const loaded = loadAccount(store.saved);
    expect(store.writes()).toBe(0);
    expect(setSquad(store.saved, ['rosetta', 'thornia', 'crinso']).squad).toEqual(['rosetta', 'thornia', 'crinso']);
    const html = [roseEvent(loaded), gameplayHub(loaded), summonHub(loaded, 'roses'), characterCopyManagement(loaded, 'creatures'),
      archives(loaded), ...roseCharacters.map((character) => characterHub(character, 'overview', loaded))].join('');
    expect(html).toContain('data-infusion="roses"');
    expect(html).toContain('No captures above Lv.120');
    expect(html).toContain('Current highest tier: 6-star');
    expect(html).toContain('6-star · 1.1%');
    expect(html).not.toContain('5-star tier: 1%');
    for (const id of ['rosetta', 'thornia', 'crinso']) expect(html).toContain(`data-banner-entry="${id}" data-entry-stars="6"`);
    expect(html).not.toContain('Thornia and Crinso do not reset');
    expect(html).toContain('15 Rare Rosethorn materials');
    expect(html).toContain('6 Soul of Rosethorn');
    expect(html).toContain('assets/banners/roses-banner.png');
    expect(html).toContain('assets/banners/summon-roses.png');
    for (const character of roseCharacters) {
      expect(portrait(character, 6)).toContain(`assets/characters/${character.art}-evo-6.png`);
      expect(abilityIcon(character.id, 'skill1')).toContain(`assets/abilities/${character.id}-skill1.png`);
      expect(abilityIcon(character.id, 'defend')).toContain('assets/abilities/universal-defense.png');
    }
    for (const material of roseMaterials) {
      expect(materialName(material.id)).toBe(material.name);
      expect(materialArt(material.id)).toBe(material.id);
    }
    const session = createSession('rosetta', { level: 105, evolution: 6 }, { mode: 'roses', stage: 35 });
    expect(session.state.enemies[0].level).toBe(140);
  });
});
