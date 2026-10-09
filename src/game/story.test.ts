import { describe, expect, it } from 'vitest';
import { elements } from '../content/activities';
import { storyBossBonus, storyCreature, storyDrops, storyEncounter, storyLoot, storyMaterialLoot, storyRegions } from '../content/story';
import { creatures, creatureLoot, getCreature } from '../content/creatures';
import { dungeonEncounter } from '../content/dungeons';
import { ACCOUNT_KEY, emptyAccount, loadAccount, saveAccount, saveAccountRewards, unlockedStoryStage, validateAccount } from './account';
import { act, createBattle, createStoryBattle, endTurn, nextStage, nextWave, type BattleResult } from './battle';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { createCreatureCopy } from './character-instances';
import { createSession } from '../presentation/battle-view';
import { battleResults, encounterRewards } from '../presentation/battle-results';
import { storyCampaign } from '../presentation/story';
import { gameplayHub } from '../presentation/gameplay';
import { homeHub } from '../presentation/hub';
import { getStarter } from '../content/starters';
import { type ConduitLoadouts } from '../content/conduits';

function storage() {
  const values = new Map<string, string>([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  let writes = 0;
  const saved: ProfileStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); writes++; },
    removeItem: (key) => { values.delete(key); },
  };
  return { saved, writes: () => writes };
}

function unlocked(stage: number) {
  const fixture = storage();
  const account = emptyAccount();
  account.storyCompleted = stage - 1;
  saveAccount(fixture.saved, account);
  return fixture;
}

function clear(stage: number): BattleResult {
  const state = createStoryBattle(stage, 1729, 'ember', { level: 105, evolution: 6 });
  state.allies[0].shatter = 100;
  state.enemies.forEach((enemy) => { enemy.hp = 1; });
  return act(state, 'ember', 'skill2', state.enemies[0].id);
}

describe('six-region linear Story contract', () => {
  it('has six ordered regions, exactly 150 stages at levels 1-55, four ordinary identities and one distinct boss each', () => {
    expect(storyRegions.map((region) => region.element)).toEqual(elements.map((element) => element.id));
    const ids = new Set<string>();
    for (let stage = 1; stage <= 150; stage++) {
      const encounter = storyEncounter(stage);
      expect(encounter.regionIndex).toBe(Math.floor((stage - 1) / 25));
      expect(encounter.regionStage).toBe((stage - 1) % 25 + 1);
      expect(encounter.boss).toBe(stage % 25 === 0);
      expect(encounter.level).toBe(Math.round(1 + (stage - 1) * 54 / 149));
      if (stage > 1) expect(encounter.level).toBeGreaterThanOrEqual(storyEncounter(stage - 1).level);
      for (let identity = 0; identity < (encounter.boss ? 1 : 4); identity++) {
        const creature = storyCreature(stage, identity);
        ids.add(creature.id);
        expect(getCreature(creature.id)).toMatchObject({ name: creature.name, element: encounter.element, story: true });
        expect(getCreature(creature.id).stages).toContain(stage);
      }
    }
    expect(ids.size).toBe(30);
    expect(creatures.filter((creature) => creature.story)).toHaveLength(30);
    expect(storyEncounter(1).level).toBe(1);
    expect(storyEncounter(150).level).toBe(55);
  });

  it('rejects invalid stages, identities and nonboss bonuses explicitly', () => {
    for (const stage of [0, 151, -1, 1.5, NaN, Infinity]) expect(() => storyEncounter(stage)).toThrow();
    for (const identity of [-1, 4, 1.5, NaN]) expect(() => storyCreature(1, identity)).toThrow();
    expect(() => storyCreature(25, 1)).toThrow();
    expect(() => storyBossBonus(24)).toThrow();
  });

  it('has easier encounters than overlapping material dungeon levels, and only the two low material tiers', () => {
    for (let stage = 1; stage <= 150; stage++) {
      const encounter = storyEncounter(stage);
      const materials = storyMaterialLoot(stage);
      expect(materials[0].id).toBe(`${encounter.element}-common`);
      expect(materials.every((drop) => /-(common|uncommon)$/.test(drop.id))).toBe(true);
      expect(materials.length).toBe(encounter.level < 23 ? 1 : 2);
      expect(storyDrops(stage, () => 0)).toEqual(Object.fromEntries(materials.map((drop) => [drop.id, drop.minimum])));
      for (const creature of creatures.filter((entry) => entry.story && entry.stages.includes(stage))) {
        const pool = creatureLoot(creature, stage);
        expect(pool.filter((drop) => drop.id.includes('-')).every((drop) => /-(common|uncommon)$/.test(drop.id))).toBe(true);
      }
      if (encounter.level >= 38) {
        const dungeonStage = Array.from({ length: 35 }, (_, index) => index + 1).find((floor) =>
          dungeonEncounter(encounter.element, floor).level >= encounter.level && dungeonEncounter(encounter.element, floor).boss === encounter.boss)!;
        const dungeon = dungeonEncounter(encounter.element, dungeonStage);
        expect(encounter.stats.health).toBeLessThan(dungeon.stats.health);
        expect(encounter.stats.damage).toBeLessThan(dungeon.stats.damage);
      }
    }
    expect(storyLoot(150).map((drop) => drop.id)).toEqual(['fractalis', 'chaotic-common', 'chaotic-uncommon']);
    expect(storyMaterialLoot(150)[1].chance).toBeCloseTo(.8);
    expect(storyMaterialLoot(150)[0]).toMatchObject({ minimum: 3, maximum: 6 });
    expect(() => storyDrops(150, () => 1)).toThrow();
  });

  it('samples four ordinary identities on a separate stream and preserves the stream across Continue', () => {
    const identities = new Set<string>();
    for (let seed = 1; seed <= 100; seed++) {
      const state = createStoryBattle(1, seed, 'ember', { level: 0, evolution: 1 });
      state.enemies.forEach((enemy) => identities.add(enemy.creatureId!));
      expect(state.seed).toBe(seed);
      expect(state.rewardSeed).toBe(seed);
    }
    expect(identities.size).toBe(4);
    const state = createStoryBattle(24, 1729, 'ember', { level: 0, evolution: 1 });
    state.phase = 'cleared';
    const expected = nextStage(state, { level: 0, evolution: 1 }).state;
    const altered = structuredClone(state);
    altered.seed = 999;
    const actual = nextStage(altered, { level: 0, evolution: 1 }).state;
    expect(actual.encounterSeed).toBe(expected.encounterSeed);
    expect(actual.enemies.map((enemy) => enemy.creatureId)).toEqual(expected.enemies.map((enemy) => enemy.creatureId));
    expect(actual.enemies).toHaveLength(1);
    actual.phase = 'cleared';
    const ocean = nextStage(actual, { level: 0, evolution: 1 }).state;
    expect(ocean.story?.storyStage).toBe(26);
    expect(ocean.enemies.every((enemy) => enemy.element === 'oceanic')).toBe(true);
  });

  it('preserves mixed/all-captured squad progress and equipment snapshots across Continue/replay', () => {
    const copy = createCreatureCopy('infusion:heavens:0');
    const equipment: ConduitLoadouts = { [copy.instanceId]: ['tempered-strike-link', null, null, null, null, null, null, null] };
    const session = createSession('ember', { level: 0, evolution: 1 }, { storyStage: 1 },
      { ids: [copy.instanceId], progress: {}, captures: [copy], equipment });
    session.state.allies[0].shatter = 42;
    session.state.phase = 'cleared';
    equipment[copy.instanceId]![0] = null;
    copy.level = 120;
    const continued = nextStage(session.state, {}).state;
    expect(continued.allies[0].id).toBe(session.state.allies[0].id);
    expect(continued.allies[0].captured?.level).not.toBe(120);
    expect(continued.allies[0].conduits?.[0]).toBe('tempered-strike-link');
    expect(continued.allies[0].shatter).toBe(42);
    expect(() => nextWave(session.state)).toThrow('Staged');
  });
});

describe('atomic Story progression and first-clear rewards', () => {
  it('clears the complete linear campaign with exactly 150 atomic writes, 294 kill receipts and six premium bonuses', () => {
    const { saved, writes } = storage();
    let ordinaryCurrency = 0;
    for (let stage = 1; stage <= 150; stage++) {
      expect(unlockedStoryStage(loadAccount(saved))).toBe(stage);
      const result = clear(stage);
      ordinaryCurrency += result.events.filter((event) => event.kind === 'reward').reduce((sum, event) => sum + event.amount, 0);
      const account = saveAccountRewards(saved, result, 'campaign');
      expect(account.storyCompleted).toBe(stage);
      expect(writes()).toBe(stage);
    }
    const completed = loadAccount(saved);
    expect(completed.receipts).toHaveLength(294);
    expect(completed.lycalis).toBe(438);
    expect(completed.fractalis).toBe(ordinaryCurrency + 8754);
    expect(completed.materials['infernic-rare']).toBeUndefined();
    expect(Object.keys(completed.creatures).filter((id) => id.endsWith(':boss'))).toHaveLength(6);
    expect(unlockedStoryStage(completed)).toBe(150);
    const replayed = saveAccountRewards(saved, clear(150), 'replay-final');
    expect(replayed.lycalis).toBe(438);
    expect(replayed.storyCompleted).toBe(150);
    expect(writes()).toBe(151);
  });
  it('reads optional legacy progress without writes, preserves account fields and rejects malformed progress', () => {
    const fixture = storage();
    const account = emptyAccount();
    account.fractalis = 123;
    saveAccount(fixture.saved, account);
    const raw = fixture.saved.getItem(ACCOUNT_KEY);
    const writes = fixture.writes();
    expect(unlockedStoryStage(loadAccount(fixture.saved))).toBe(1);
    expect(loadAccount(fixture.saved).storyCompleted).toBeUndefined();
    expect(fixture.writes()).toBe(writes);
    expect(fixture.saved.getItem(ACCOUNT_KEY)).toBe(raw);
    for (const value of [-1, 151, 1.5, '1', null, NaN]) expect(() => validateAccount({ ...account, storyCompleted: value })).toThrow('Story');
    expect(unlockedStoryStage(validateAccount({ ...account, storyCompleted: 150 }))).toBe(150);
  });

  it('commits partial per-kill rewards immediately but unlocks only after every enemy reward is saved', () => {
    const { saved } = storage();
    const state = createStoryBattle(1, 1729, 'ember', { level: 0, evolution: 1 });
    state.enemies[0].hp = 1;
    const first = act(state, 'ember', 'light', state.enemies[0].id);
    const account = saveAccountRewards(saved, first, 'partial');
    expect(account.fractalis).toBeGreaterThan(0);
    expect(account.materials['infernic-common']).toBeGreaterThan(0);
    expect(account.storyCompleted).toBeUndefined();
    first.state.allies[0].spent = false;
    first.state.enemies[1].hp = 1;
    const final = act(first.state, 'ember', 'light', first.state.enemies[1].id);
    expect(saveAccountRewards(saved, final, 'partial').storyCompleted).toBe(1);
    expect(unlockedStoryStage(loadAccount(saved))).toBe(2);
    expect(loadAccount(saved).lycalis).toBe(0);
  });

  it.each([25, 50, 75, 100, 125, 150])('stage %i pays the exact 15%%-grown first bonus once with materials, progress, discovery and receipt in one write', (stage) => {
    const { saved, writes } = unlocked(stage);
    const before = writes();
    const result = clear(stage);
    const ordinary = result.events.find((event) => event.kind === 'reward')!.amount;
    const bonus = storyBossBonus(stage);
    const expectedBonuses = [[1000, 50], [1150, 58], [1323, 66], [1521, 76], [1749, 87], [2011, 101]];
    expect(bonus).toEqual({ fractalis: expectedBonuses[stage / 25 - 1][0], lycalis: expectedBonuses[stage / 25 - 1][1] });
    const account = saveAccountRewards(saved, result, 'first');
    expect(writes()).toBe(before + 1);
    expect(account.fractalis).toBe(ordinary + bonus.fractalis);
    expect(account.lycalis).toBe(bonus.lycalis);
    expect(account.storyCompleted).toBe(stage);
    expect(account.creatures[result.state.enemies[0].creatureId!].defeated).toBe(true);
    expect(account.receipts).toContain(`first:story-${stage}-0`);
    expect(result.events.find((event) => event.kind === 'reward')?.storyBonus).toEqual(bonus);
    expect(encounterRewards(result.events).find((item) => item.id === 'lycalis')?.amount).toBe(bonus.lycalis);
    expect(saveAccountRewards(saved, result, 'first')).toEqual(account);
    expect(writes()).toBe(before + 1);
    const replay = clear(stage);
    const replayOrdinary = replay.events.find((event) => event.kind === 'reward')!.amount;
    const replayAccount = saveAccountRewards(saved, replay, 'replay');
    expect(replayAccount.fractalis).toBe(account.fractalis + replayOrdinary);
    expect(replayAccount.lycalis).toBe(account.lycalis);
    expect(replay.events.some((event) => event.storyBonus || event.lycalis)).toBe(false);
    expect(replayAccount.storyCompleted).toBe(stage);
  });

  it('fails atomically on storage denial or balance/material overflow; retry preserves undecorated events and pays once', () => {
    const { saved } = unlocked(25);
    const result = clear(25);
    const events = structuredClone(result.events);
    const raw = saved.getItem(ACCOUNT_KEY);
    const write = saved.setItem;
    saved.setItem = () => { throw new Error('Write denied'); };
    expect(() => saveAccountRewards(saved, result, 'fail')).toThrow('Write denied');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    expect(result.events).toEqual(events);
    saved.setItem = write;
    const account = loadAccount(saved);
    account.lycalis = Number.MAX_SAFE_INTEGER;
    saveAccount(saved, account);
    const overflowRaw = saved.getItem(ACCOUNT_KEY);
    expect(() => saveAccountRewards(saved, result, 'fail')).toThrow();
    expect(saved.getItem(ACCOUNT_KEY)).toBe(overflowRaw);
    expect(result.events).toEqual(events);
    account.lycalis = 0;
    account.materials['infernic-common'] = Number.MAX_SAFE_INTEGER;
    saveAccount(saved, account);
    expect(() => saveAccountRewards(saved, result, 'fail')).toThrow();
    account.materials = {};
    account.fractalis = Number.MAX_SAFE_INTEGER;
    saveAccount(saved, account);
    expect(() => saveAccountRewards(saved, result, 'fail')).toThrow();
    account.fractalis = 0;
    saveAccount(saved, account);
    expect(saveAccountRewards(saved, result, 'fail').lycalis).toBe(50);
    expect(saveAccountRewards(saved, result, 'fail').lycalis).toBe(50);
  });

  it('rejects locked stages, forged sources, high-tier/off-element materials, premium/capture claims and rewardless clear', () => {
    const invalidResults: BattleResult[] = [];
    invalidResults.push(clear(2));
    const source = clear(1);
    source.state.enemies[0].level = 55;
    invalidResults.push(source);
    const clearWithoutRewards = clear(1);
    clearWithoutRewards.events = [];
    invalidResults.push(clearWithoutRewards);
    for (const fields of [{ materials: { 'infernic-common': 1, 'infernic-rare': 1 } },
      { materials: { 'oceanic-common': 1 } }, { lycalis: 50 }, { storyBonus: { fractalis: 1000, lycalis: 50 } },
      { capture: { creatureId: 'infusion:heavens:0', level: 80 } }]) {
      const result = clear(1);
      Object.assign(result.events.find((event) => event.kind === 'reward')!, fields);
      invalidResults.push(result);
    }
    for (const result of invalidResults) {
      const { saved } = storage();
      expect(() => saveAccountRewards(saved, result, 'forged')).toThrow();
      expect(saved.getItem(ACCOUNT_KEY)).toBeNull();
    }
  });

  it('real Burn kills save ordinary Story drops and progression, never duplicate rewards or premium outside regional bosses', () => {
    const { saved } = storage();
    const state = createStoryBattle(1, 1729, 'ember', { level: 0, evolution: 1 });
    state.enemies.forEach((enemy) => { enemy.hp = 1; enemy.burn = { damage: 8, turns: 1, sourceId: 'ember' }; });
    const result = endTurn(state);
    expect(result.state.phase).toBe('cleared');
    expect(saveAccountRewards(saved, result, 'burn')).toMatchObject({ storyCompleted: 1, lycalis: 0 });
    const before = loadAccount(saved);
    expect(saveAccountRewards(saved, result, 'burn')).toEqual(before);
  });
});

describe('Story and Training presentation', () => {
  it('renders a linear map with 150 exact stage controls, only valid entries enabled and no missing art requests', () => {
    const html = storyCampaign(emptyAccount(), 'ember');
    expect(html.match(/data-story-region=/g)).toHaveLength(6);
    expect(html.match(/data-story-stage=/g)).toHaveLength(150);
    expect(html.match(/data-story-stage="\d+" disabled/g)).toHaveLength(149);
    expect(html).toContain('data-story-stage="1"');
    expect(html).toContain('First-clear bonus');
    expect(html).toContain('artwork pending');
    expect(html).not.toContain('assets/enemies');
    expect(html).toContain('Read opening prologue');
    expect(storyCampaign(null, 'ember')).toContain('role="alert"');
    const complete = storyCampaign({ ...emptyAccount(), storyCompleted: 150 }, 'ember');
    expect(complete).not.toMatch(/data-story-stage="\d+" disabled/);
    expect(complete).toContain('already earned');
    expect(complete).toContain('All beacons restored');
  });

  it('makes Story the Home campaign and preserves endless Training launch/rules separately', () => {
    expect(homeHub(getStarter('ember'), false, emptyAccount())).toContain('<strong>Story &rarr;</strong>');
    const html = gameplayHub();
    expect(html).toContain('Open world map');
    expect(html).toContain('Enter Training');
    expect(html).toContain('data-page="battle"');
    expect(html).not.toContain('Enter Adventure');
    const training = createBattle();
    expect(training.story).toBeUndefined();
    expect(training.wave).toBe(1);
    expect(training.enemies.map((enemy) => enemy.creatureId)).toEqual(['adventure:goblin', 'adventure:imp', 'adventure:golem']);
  });

  it('regional Continue crosses into the next region, final stage 150 has no Continue and defeat retries the same stage', () => {
    const boss = clear(25);
    expect(battleResults(boss.state, boss.events)).toContain('data-result-continue');
    expect(battleResults(boss.state, boss.events)).toContain(storyRegions[0].conclusion);
    const final = clear(150);
    expect(battleResults(final.state, final.events)).toContain('Activity complete');
    expect(battleResults(final.state, final.events)).not.toContain('data-result-continue');
    expect(() => nextStage(final.state, { level: 105, evolution: 6 })).toThrow('complete');
    boss.state.phase = 'defeat';
    expect(battleResults(boss.state, [])).toContain('Retry stage');
  });
});
