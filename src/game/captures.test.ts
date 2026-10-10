import { describe, expect, it } from 'vitest';
import { createBattle, createDungeonBattle, createInfusionBattle, act, endTurn, nextStage, nextWave, captureSucceeds, actionUnavailable, damageAmount } from './battle';
import { emptyAccount, saveAccount, loadAccount, saveAccountRewards, setSquad, equipConduit, levelCapturedCharacter, characterProtection, validateAccount, ACCOUNT_KEY } from './account';
import { capturedProgress, resolveCapturedFighter, type CapturedCharacter } from './character-instances';
import { infusionEncounter } from '../content/infusions';
import { enemySkills } from '../content/enemy-skills';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { playableDungeons } from '../content/dungeons';
import { createSession } from '../presentation/battle-view';
import { lootItems, lootArt } from '../presentation/battle-loot';
import { squadHub, characterCopyManagement } from '../presentation/roster';
import { archives } from '../presentation/archives';
import { homeHub } from '../presentation/hub';
import { getStarter } from '../content/starters';
import { formatStat } from '../content/combat';

function copy(tier = 0, boss = false, index = 1): CapturedCharacter {
  const stage = boss ? tier === 5 ? 35 : 5 : tier === 0 ? 1 : tier === 5 ? 31 : 7;
  const encounter = infusionEncounter('abyss', stage);
  return { instanceId: `capture:00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
    creatureId: `infusion:abyss:${encounter.tier}`, level: encounter.level, capturedStage: stage, locked: false,
    skills: enemySkills(encounter.level, encounter.boss, encounter.ability, encounter.abilityMultiplier) };
}
function storage(): ProfileStorage {
  const map = new Map<string, string>();
  return { getItem: (key) => map.get(key) ?? null, setItem: (key, value) => { map.set(key, value); }, removeItem: (key) => { map.delete(key); } };
}
function seeded() {
  const saved = storage();
  saved.setItem(SAVE_KEY, JSON.stringify({ version: 1, starterId: 'ember' }));
  const account = emptyAccount();
  account.characters.ember = { level: 105, evolution: 6 };
  account.capturedCharacters = [copy(), copy(0, false, 2)];
  account.squad = ['ember'];
  account.fractalis = 10000;
  account.materials['chaotic-common'] = 100;
  account.conduits = { 'vigil-core': 1, 'siegebound-drive': 1 };
  saveAccount(saved, account);
  return { saved, account };
}

describe('20% capture rewards and retained fixed-form creatures', () => {
  it('uses exactly the [0,.2) threshold and rejects invalid rolls', () => {
    expect(captureSucceeds(0)).toBe(true);
    expect(captureSucceeds(.199999)).toBe(true);
    expect(captureSucceeds(.2)).toBe(false);
    expect(captureSucceeds(.999999)).toBe(false);
    for (const value of [-1, 1, NaN, Infinity]) expect(() => captureSucceeds(value)).toThrow();
  });
  it('captures every newly killed eligible enemy separately, saves once, and retains actual level/skills', () => {
    const saved = storage();
    const state = createInfusionBattle('abyss', 1, 1, 'ember', { level: 105, evolution: 6 });
    state.enemies.forEach((enemy) => { enemy.hp = 1; });
    state.allies[0].shatter = 100;
    const result = act(state, 'ember', 'skill2', state.enemies[0].id);
    expect(result.events.filter((event) => event.capture)).toHaveLength(2);
    expect(saveAccountRewards(saved, result, 'aoe').capturedCharacters).toHaveLength(2);
  });
  it('handles burn kills atomically and idempotently, including multiple duplicate captures', () => {
    const saved = storage();
    const state = createInfusionBattle('abyss', 1, 1, 'ember', { level: 105, evolution: 6 });
    state.enemies.forEach((enemy) => { enemy.hp = 1; enemy.burn = { damage: 1, turns: 1 }; });
    const result = endTurn(state);
    const rewards = result.events.filter((event) => event.kind === 'reward');
    expect(rewards).toHaveLength(2);
    expect(rewards.every((event) => !!event.capture)).toBe(true);
    const write = saved.setItem;
    saved.setItem = () => { throw new Error('Write denied'); };
    expect(() => saveAccountRewards(saved, result, 'burn')).toThrow('Write denied');
    expect(saved.getItem(ACCOUNT_KEY)).toBeNull();
    saved.setItem = write;
    const account = saveAccountRewards(saved, result, 'burn');
    expect(account.capturedCharacters).toHaveLength(2);
    expect(new Set(account.capturedCharacters?.map((entry) => entry.instanceId)).size).toBe(2);
    for (const entry of account.capturedCharacters ?? []) {
      expect(entry.level).toBe(80);
      expect(entry.skills).toEqual(state.enemies[0].enemySkills);
      expect(entry.locked).toBe(false);
    }
    expect(saveAccountRewards(saved, result, 'burn')).toEqual(account);
    expect(loadAccount(saved)).toEqual(account);
    expect(() => endTurn(result.state)).toThrow();
  });
  it('does not capture Adventure/dungeon enemies and does not change material random rolls', () => {
    for (const state of [createBattle(1), createDungeonBattle('chaotic', 1, 1, 'ember', { level: 105, evolution: 6 })]) {
      state.enemies.forEach((enemy) => { enemy.hp = 1; enemy.burn = { damage: 1, turns: 1 }; });
      expect(endTurn(state).events.filter((event) => event.kind === 'reward').every((event) => !event.capture)).toBe(true);
    }
    const a = createInfusionBattle('heavens', 1, 1, 'ember', { level: 105, evolution: 6 });
    a.enemies.forEach((enemy) => { enemy.hp = 1; enemy.burn = { damage: 1, turns: 1 }; });
    const b = structuredClone(a);
    b.captureSeed = 10000;
    const drops = (state: typeof a) => endTurn(state).events.filter((event) => event.kind === 'reward').map((event) => [event.amount, event.materials]);
    expect(drops(a)).toEqual(drops(b));
  });
  it('keeps early level 120 forms weaker than final forms and removes boss stat bonuses', () => {
    const early = { ...copy(), level: 120 };
    const final = { ...copy(5), level: 120 };
    const boss = { ...copy(5, true), level: 120 };
    const weak = resolveCapturedFighter(early);
    const strong = resolveCapturedFighter(final);
    const bossKit = resolveCapturedFighter(boss);
    expect(weak.stats.health).toBe(130000);
    expect(strong.stats.health).toBe(200000);
    expect(bossKit.stats.health).toBe(200000);
    expect(weak.stats.damage).toBeLessThan(strong.stats.damage);
    expect(strong.stats.health).toBeLessThan(infusionEncounter('abyss', 35).stats.health);
    expect(bossKit.abilities.ultimate.name).toBe('Last Ruin: Cosmic Wrath');
    expect(bossKit.abilities.ultimate.cooldown).toBe(6);
  });
  it('allows duplicate species with distinct IDs and a captured leader across every destination', () => {
    const { saved, account } = seeded();
    const ids = account.capturedCharacters!.map((entry) => entry.instanceId);
    const mixed = setSquad(saved, [ids[0], 'ember', ids[1]]);
    expect(characterProtection(mixed, ids[0]).protected).toBe(true);
    expect(() => setSquad(saved, [ids[0], ids[0]])).toThrow('distinct');
    const captures = mixed.capturedCharacters!;
    const destinations = [undefined, ...playableDungeons.map((element) => ({ element, stage: 1 })), { mode: 'heavens' as const, stage: 1 }, { mode: 'abyss' as const, stage: 1 }];
    for (const destination of destinations) {
      const session = createSession('ember', account.characters.ember, destination, { ids: mixed.squad!, progress: mixed.characters, captures });
      expect(session.state.allies.map((ally) => ally.id)).toEqual(mixed.squad);
      expect(session.state.allies[0].captured?.creatureId).toBe('infusion:abyss:0');
      const actor = session.state.allies[0];
      actor.shatter = 100;
      actor.stats.crit = 0;
      const target = session.state.enemies[0];
      target.hp = target.stats.health = 10000000;
      const expected = damageAmount(actor.stats.damage, actor.kit!.abilities.skill2.strength.damageMultiplier!, target.stats.defense, false);
      const result = act(session.state, actor.id, 'skill2', target.id);
      expect(result.events.find((event) => event.kind === 'damage')?.amount).toBe(expected);
      expect(result.state.allies[0].readyRound.skill2).toBe(6);
      expect(actionUnavailable(session.state, actor, 'ultimate')).toContain('does not have');
      session.state.phase = 'cleared';
      const advanced = destination ? nextStage(session.state, mixed.characters) : nextWave(session.state);
      expect(advanced.state.allies.map((ally) => ally.id)).toEqual(mixed.squad);
      expect(advanced.state.allies[0].captured).toEqual(actor.captured);
    }
    expect(squadHub(mixed)).toContain('Copy 1');
    expect(squadHub(mixed)).toContain('Copy 2');
  });
  it('levels/equips one copy independently, preserves the other, and rejects stale/overflow levels', () => {
    const { saved, account } = seeded();
    const first = account.capturedCharacters![0];
    const second = account.capturedCharacters![1];
    const leveled = levelCapturedCharacter(saved, first.instanceId, 80);
    expect(leveled.capturedCharacters?.[0].level).toBe(81);
    expect(leveled.capturedCharacters?.[1].level).toBe(80);
    expect(leveled.fractalis).toBe(9828);
    expect(leveled.materials['chaotic-common']).toBe(97);
    expect(() => levelCapturedCharacter(saved, first.instanceId, 80)).toThrow('changed');
    const equipped = equipConduit(saved, first.instanceId, 0, 'vigil-core');
    expect(resolveCapturedFighter(equipped.capturedCharacters![0], equipped.conduitEquipment?.[first.instanceId]).stats.health)
      .toBeCloseTo(resolveCapturedFighter(equipped.capturedCharacters![0]).stats.health * 1.05);
    expect(equipped.conduitEquipment?.[second.instanceId]).toBeUndefined();
    const max = loadAccount(saved);
    max.capturedCharacters![0].level = 120;
    saveAccount(saved, max);
    expect(() => levelCapturedCharacter(saved, first.instanceId, 120)).toThrow('Maximum');
    expect(() => validateAccount({ ...max, capturedCharacters: [{ ...first, level: 121 }] })).toThrow();
    const copyHtml = characterCopyManagement(equipped);
    expect(copyHtml).toContain(`Copy 1 · Lv.${equipped.capturedCharacters![0].level}`);
    expect(copyHtml).not.toContain('Fixed form');
    const homeHtml = homeHub(getStarter('ember'), false, { ...equipped, squad: [first.instanceId] });
    expect(homeHtml).not.toContain('Fixed form');
    expect(homeHtml).toContain('Cannot evolve.');
    expect(homeHtml).toContain('Level cap 120');
  });
  it('presents captured rewards as enemy icons and reveals only owned forms in Character Archive', () => {
    const { account } = seeded();
    const event = { kind: 'reward' as const, source: 'enemy', target: '', critical: false, amount: 5, message: '', capture: { creatureId: 'infusion:abyss:0', level: 80 } };
    const item = lootItems(event).at(-1)!;
    expect(item.amount).toBe(1);
    expect(lootArt(item)).toContain('enemies/abyss-wraththorn-slime.png');
    const html = archives(account);
    expect(html).toContain('Owned copies 2');
    expect(html).toContain('data-filter-stars="6"');
    expect(html.match(/data-archive-character=/g)).toHaveLength(126);
  });
  it('retains boss ultimates with their exact damage, cooldown and recovery', () => {
    const captured = copy(5, true);
    const state = createInfusionBattle('heavens', 35, 1, 'ember', { level: 105, evolution: 6 }, [captured.instanceId], {}, {}, [captured]);
    const actor = state.allies[0];
    actor.shatter = 100;
    actor.stats.crit = 0;
    const target = state.enemies[0];
    target.hp = target.stats.health = 10000000;
    const expected = damageAmount(actor.stats.damage, actor.kit!.abilities.ultimate.strength.damageMultiplier!, target.stats.defense, false);
    const result = act(state, actor.id, 'ultimate', target.id);
    const after = result.state.allies[0];
    expect(result.events.find((event) => event.kind === 'damage')?.amount).toBe(expected);
    expect(after.shatter).toBe(0);
    expect(after.readyRound.ultimate).toBe(7);
    expect(after.recoverThrough).toBe(2);
    result.state.round = 2;
    result.state.phase = 'player';
    after.spent = false;
    after.shatter = 100;
    expect(actionUnavailable(result.state, after, 'ultimate')).toContain('Recovering');
    result.state.round = 3;
    expect(actionUnavailable(result.state, after, 'ultimate')).toBe('Ready on turn 7.');
    result.state.round = 7;
    expect(actionUnavailable(result.state, after, 'ultimate')).toBeNull();
  });
  it('preserves all-capture identities, gauge and equipment through Continue and Home', () => {
    const { account } = seeded();
    account.squad = account.capturedCharacters!.map((entry) => entry.instanceId);
    account.conduitEquipment = { [account.squad[0]]: ['vigil-core', null, null, null, null, null, null, null] };
    const session = createSession('ember', account.characters.ember, { mode: 'abyss', stage: 1 },
      { ids: account.squad, progress: account.characters, equipment: account.conduitEquipment, captures: account.capturedCharacters });
    session.state.allies[0].shatter = 77;
    session.state.phase = 'cleared';
    const next = nextStage(session.state, account.characters).state;
    expect(next.allies.map((ally) => ally.id)).toEqual(account.squad);
    expect(next.allies[0].shatter).toBe(77);
    expect(next.allies[0].conduits).toEqual(session.state.allies[0].conduits);
    expect(next.allies[0].kit?.stats).toEqual(session.state.allies[0].kit?.stats);
    const home = homeHub(getStarter('ember'), false, account);
    const showcase = home.slice(home.indexOf('<section class="hub-showcase'), home.indexOf('<aside class="hub-info">'));
    expect(showcase).toContain('Wraththorn Slime');
    expect(showcase).toContain('enemies/abyss-wraththorn-slime.png');
    expect(showcase).not.toContain('Infernis');
    const info = home.match(/<dialog[^>]*id="home-information"[\s\S]*?<\/dialog>/)?.[0] ?? '';
    expect(info).not.toContain('Infernis');
    expect(info).toContain(formatStat(next.allies[0].stats.health));
    expect(info).toContain('Before Conduits');
  });
  it('rejects forged rewards and metadata without saving partial currency or copies', () => {
    const saved = storage();
    const state = createInfusionBattle('abyss', 1, 1, 'ember', { level: 105, evolution: 6 });
    state.enemies.forEach((enemy) => { enemy.hp = 1; enemy.burn = { damage: 1, turns: 1 }; });
    const result = endTurn(state);
    result.events.find((event) => event.capture)!.capture!.creatureId = 'infusion:heavens:0';
    expect(() => saveAccountRewards(saved, result, 'forged')).toThrow('Invalid captured');
    expect(saved.getItem(ACCOUNT_KEY)).toBeNull();
    result.events.find((event) => event.capture)!.capture!.creatureId = 'infusion:abyss:0';
    result.state.enemies[0].hp = 1;
    expect(() => saveAccountRewards(saved, result, 'living')).toThrow('Invalid captured');
    expect(saved.getItem(ACCOUNT_KEY)).toBeNull();
    const original = copy();
    expect(() => validateAccount({ ...emptyAccount(), capturedCharacters: [{ ...original, capturedStage: 35 }] })).toThrow();
    expect(() => validateAccount({ ...emptyAccount(), capturedCharacters: [{ ...original, skills: [{ ...original.skills![0], multiplier: 100 }] }] })).toThrow();
  });
  it('preserves copies and balances when leveling or equipment writes fail', () => {
    const { saved, account } = seeded();
    const before = saved.getItem(ACCOUNT_KEY);
    const write = saved.setItem;
    saved.setItem = () => { throw new Error('Write denied'); };
    const id = account.capturedCharacters![0].instanceId;
    expect(() => levelCapturedCharacter(saved, id, 80)).toThrow('Write denied');
    expect(() => equipConduit(saved, id, 0, 'vigil-core')).toThrow('Write denied');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
    saved.setItem = write;
    expect(levelCapturedCharacter(saved, id, 80).capturedCharacters?.[0].level).toBe(81);
    expect(equipConduit(saved, id, 0, 'vigil-core').conduitEquipment?.[id]?.[0]).toBe('vigil-core');
  });
});
