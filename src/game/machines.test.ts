import { describe, expect, it, vi } from 'vitest';
import { conduits, conduitBuffs, validateConduitSlots, type ConduitId, type ConduitSlots } from '../content/conduits';
import { elements } from '../content/activities';
import { infusionEncounter } from '../content/infusions';
import { machineConduitDrops, machineConduitLoot, bannerConduitBonus, machineEnemies, isBannerConduitEligible } from '../content/machines';
import { creatureLoot, getCreature } from '../content/creatures';
import { getStarter, starters } from '../content/starters';
import { resolveFighter, shatterGauge } from '../content/combat';
import { act, endTurn, nextStage, damageAmount, actionUnavailable, createBattle, createInfusionBattle, type BattleState } from './battle';
import { ACCOUNT_KEY, emptyAccount, loadAccount, saveAccount, saveAccountRewards, equipConduit, summonCharacter, purchaseConduit, validateAccount } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { createCreatureCopy, validateCapturedCharacters, resolveCapturedFighter } from './character-instances';
import { gameplayHub } from '../presentation/gameplay';
import { inventoryView } from '../presentation/inventory';
import { characterDetail } from '../presentation/hub';
import { lootItems } from '../presentation/battle-loot';
import { encounterRewards, battleResults } from '../presentation/battle-results';
import { archives } from '../presentation/archives';
import { machineComponentDrop } from '../content/mechanical-components';
import { createSession } from '../presentation/battle-view';

function sequence(...values: number[]): () => number {
  let index = 0;
  return () => {
    if (index >= values.length) throw new Error('Test RNG exhausted.');
    return values[index++];
  };
}
function storage(): ProfileStorage {
  const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); }, removeItem: (key) => { values.delete(key); } };
}
function slots(id: ConduitId): ConduitSlots { return [id, null, null, null, null, null, null, null]; }
function omnicBattle(element: 'infernic' | 'aquatic' | 'tectonic' | 'efflorescent' | 'voltaic' | 'atmospheric' | 'luminous' | 'ominous' | 'tranquilitic' | 'chaotic'): BattleState {
  const identities = { infernic: 'ember', aquatic: 'tide', tectonic: 'bruno', efflorescent: 'sprout',
    voltaic: 'elise', atmospheric: 'atmoso', luminous: 'rosetta', ominous: 'thornia', tranquilitic: 'bliss', chaotic: 'crinso' };
  const starter = starters.find((entry) => entry.id === identities[element]);
  const conduit = conduits.find((entry) => entry.id.startsWith(`${element}-`));
  if (!starter || !conduit) throw new Error('Missing element fixture.');
  const state = createBattle(1729, [starter.id], { [starter.id]: { level: 50, evolution: 4 } }, { [starter.id]: slots(conduit.id) });
  state.allies[0].shatter = 100;
  for (const enemy of state.enemies) { enemy.hp = enemy.stats.health = 1e8; enemy.stats.defense = 0; enemy.stats.damage = 0; enemy.stats.crit = 0; }
  state.allies[0].stats.crit = 0;
  return state;
}
function expandedBattle(id: ConduitId): BattleState {
  const conduit = conduits.find((entry) => entry.id === id);
  const starter = conduit?.element && starters.find((entry) => entry.elementId === conduit.element);
  if (!conduit?.element || !starter) throw new Error(`Missing expanded Omnic fixture: ${id}.`);
  const state = createBattle(1729, [starter.id], { [starter.id]: { level: 50, evolution: 4 } },
    { [starter.id]: slots(conduit.id) });
  state.allies[0].shatter = 100;
  state.allies[0].stats.crit = 0;
  for (const enemy of state.enemies) {
    enemy.hp = enemy.stats.health = 1e8;
    enemy.stats.defense = 0;
    enemy.stats.damage = 0;
    enemy.stats.crit = 0;
  }
  return state;
}
function attack(state: BattleState, action: 'light' | 'skill1' | 'skill2' | 'ultimate' | 'defend') {
  return act(state, state.allies[0].id, action, state.enemies[0].id);
}

describe('machine content and exact probabilities', () => {
  it('authors the exact catalog and distinct stats/penalties/elements without selling drops', () => {
    expect(conduits).toHaveLength(85);
    expect(new Set(conduits.map((entry) => entry.id)).size).toBe(85);
    for (const [rarity, count] of [['Common', 10], ['Rare', 15], ['Legendary', 15], ['Omnic', 45]] as const) {
      const pool = conduits.filter((entry) => entry.rarity === rarity);
      expect(pool).toHaveLength(count);
      for (const conduit of pool) {
        const buffs = conduitBuffs(conduit);
        expect(new Set(buffs.map((entry) => entry.stat)).size).toBe(buffs.length);
        if (rarity === 'Rare') expect(buffs).toHaveLength(2);
        if (rarity === 'Legendary') expect(buffs.map((entry) => entry.amount)).toEqual([85, -10]);
        if (rarity === 'Omnic') { expect(buffs).toHaveLength(3); expect(conduit.mechanic).toBeTruthy(); }
        if (rarity !== 'Common') expect(conduit.price).toBeNull();
      }
    }
    expect(conduits.filter((entry) => entry.rarity === 'Omnic').map((entry) => entry.element).sort())
      .toEqual([...Array<string>(8).fill('infernic'), ...Array<string>(6).fill('oceanic'),
        ...Array<string>(7).fill('atmospheric'), ...Array<string>(8).fill('botanic'),
        ...Array<string>(8).fill('tranquilitic'), ...Array<string>(8).fill('chaotic')].sort());
    expect(conduits.filter((entry) => entry.price !== null)).toHaveLength(10);
    expect(conduits.filter((entry) => entry.art === null)).toHaveLength(25);
    expect(conduits.filter((entry) => entry.art === entry.id)).toHaveLength(60);
  });
  it('has100 stages 10-120, six distinct machines, every fifth-stage boss and no missing art URLs', () => {
    for (let stage = 1; stage <= 100; stage++) {
      const encounter = infusionEncounter('machines', stage);
      expect(encounter.boss).toBe(stage % 5 === 0);
      expect(encounter.enemy.art).toBe(machineEnemies[encounter.tier].art);
      expect(encounter.background).toBe('machines-arena.png');
      expect(encounter.level).toBe(Math.round(10 + (stage - 1) * 110 / 99));
    }
    expect(new Set(Array.from({ length: 100 }, (_, index) => infusionEncounter('machines', index + 1).enemy.name)).size).toBe(6);
    expect(infusionEncounter('machines', 100).stats.health).toBe(400000);
    expect(infusionEncounter('machines', 99).stats.health).toBeLessThan(200000);
    for (const [tier, [first, last]] of [[1, 17], [18, 34], [35, 50], [51, 67], [68, 84], [85, 100]].entries()) {
      expect(getCreature(`infusion:machines:${tier}`).stages).toEqual(Array.from({ length: last - first + 1 }, (_, index) => first + index));
    }
    for (const stage of [0, 101, NaN, 1.5]) expect(() => machineConduitDrops(stage, () => 0)).toThrow();
  });
  it('checks exact independent tier boundaries, excludes Omnic below 75 and chooses equal entries', () => {
    expect(machineConduitDrops(74, sequence(.08, .035))).toEqual({});
    expect(machineConduitDrops(75, sequence(.08, .035, .01))).toEqual({});
    const rarePool = conduits.filter((c) => c.rarity === 'Rare');
    const legendaryPool = conduits.filter((c) => c.rarity === 'Legendary');
    const omnicPool = conduits.filter((c) => c.rarity === 'Omnic');
    for (let index = 0; index < rarePool.length; index++) {
      const drops = machineConduitDrops(75, sequence(.079999, (index + .5) / rarePool.length,
        .035, .01));
      expect(Object.keys(drops)).toEqual([rarePool[index].id]);
    }
    for (let index = 0; index < legendaryPool.length; index++) {
      expect(machineConduitDrops(75, sequence(.08, .034999, (index + .5) / legendaryPool.length, .01)))
        .toEqual({ [legendaryPool[index].id]: 1 });
    }
    for (let index = 0; index < omnicPool.length; index++) {
      expect(machineConduitDrops(75, sequence(.08, .035, .009999, (index + .5) / omnicPool.length))).toEqual({ [omnicPool[index].id]: 1 });
    }
    expect(Object.keys(machineConduitDrops(100, () => 0))).toHaveLength(3);
    expect(bannerConduitBonus(() => .005)).toBeUndefined();
    const bannerPool = ['worldbreaker-drive', 'immortal-vessel', 'citadel-spine', 'astral-prism', 'judgment-lens'];
    for (let index = 0; index < bannerPool.length; index++) {
      expect(bannerConduitBonus(sequence(.004999, (index + .5) / bannerPool.length))).toBe(bannerPool[index]);
    }
    expect(conduits.filter((entry) => entry.rarity === 'Legendary' && isBannerConduitEligible(entry.id))).toHaveLength(5);
    expect(conduits.filter((entry) => entry.rarity === 'Legendary' && !isBannerConduitEligible(entry.id))).toHaveLength(10);
    for (const invalid of [-1, 1, NaN, Infinity]) expect(() => machineConduitDrops(1, () => invalid)).toThrow('Loot roll');
  });
  it('publishes exactly the acquisition API odds in the discovery-gated glossary', () => {
    for (const stage of [1, 74, 75, 100]) {
      const encounter = infusionEncounter('machines', stage);
      const pool = machineConduitLoot(stage);
      expect(pool).toHaveLength(stage < 75 ? 30 : 75);
      expect(pool.some((drop) => conduits.find((conduit) => conduit.id === drop.id)?.rarity === 'Common')).toBe(false);
      for (const [rarity, chance] of [['Rare', .08], ['Legendary', .035], ['Omnic', stage < 75 ? 0 : .01]] as const) {
        expect(pool.filter((drop) => conduits.find((c) => c.id === drop.id)?.rarity === rarity).reduce((sum, entry) => sum + entry.chance, 0)).toBeCloseTo(chance, 12);
      }
      expect(creatureLoot(getCreature(`infusion:machines:${encounter.tier}`), stage).slice(1)).toEqual([machineComponentDrop(stage), ...pool]);
    }
  });
});

describe('machine rewards and atomic saves', () => {
  function kill(stage = 26) {
    const state = createInfusionBattle('machines', stage, 1729, 'ember', { level: 0, evolution: 1 });
    state.enemies.forEach((enemy) => { enemy.hp = 1; enemy.stats.defense = 0; });
    state.conduitSeed = 1;
    return attack(state, 'light');
  }
  it('uses isolated RNG, commits drops/discovery/receipt once and deduplicates replays', () => {
    const state = createInfusionBattle('machines', 26, 1729, 'ember', { level: 0, evolution: 1 });
    state.enemies.forEach((enemy) => { enemy.hp = 1; enemy.stats.defense = 0; });
    const first = attack({ ...state, conduitSeed: 1 }, 'light');
    const second = attack({ ...state, conduitSeed: 999 }, 'light');
    expect(first.state.seed).toBe(second.state.seed);
    expect(first.state.rewardSeed).toBe(second.state.rewardSeed);
    expect(first.state.captureSeed).toBe(state.captureSeed);
    expect(first.state.lycalisSeed).toBeUndefined();
    const reward = first.events.find((event) => event.kind === 'reward');
    expect(reward?.capture).toBeUndefined();
    expect(reward?.lycalis).toBeUndefined();
    expect(reward?.materials).toEqual({});
    expect(Object.keys(reward?.conduits ?? {})).not.toHaveLength(0);
    const saved = storage();
    const write = vi.spyOn(saved, 'setItem');
    const account = saveAccountRewards(saved, first, 'machine-test');
    expect(write).toHaveBeenCalledTimes(1);
    expect(account.conduits).toEqual(reward?.conduits);
    expect(account.receipts).toEqual(['machine-test:infusion-machines-26-0']);
    expect(account.creatures['infusion:machines:1'].defeated).toBe(true);
    saveAccountRewards(saved, first, 'machine-test');
    expect(write).toHaveBeenCalledTimes(1);
    expect(encounterRewards(first.events).map((entry) => entry.id)).toEqual(lootItems(reward!).map((entry) => entry.id));
  });
  it('rejects ineligible tiers, multiple same-tier awards, wrong sources, forbidden loot and overflow with no writes', () => {
    const saved = storage();
    saveAccount(saved, { ...loadAccount(saved), conduits: { 'duplex-heart': Number.MAX_SAFE_INTEGER } });
    const raw = saved.getItem(ACCOUNT_KEY);
    const write = vi.spyOn(saved, 'setItem');
    const result = kill();
    const rewardIndex = result.events.findIndex((event) => event.kind === 'reward');
    for (const extras of [
      { conduits: { 'duplex-heart': 1 } }, { conduits: { 'duplex-heart': 2 } },
      { conduits: { 'duplex-heart': 1, 'spearwheel-engine': 1 } },
      { conduits: { 'vigil-core': 1 } }, { materials: { 'infernic-common': 1 } }, { lycalis: 1 },
      { capture: { creatureId: 'infusion:machines:4', level: result.state.enemies[0].level! } },
    ]) {
      const invalid = structuredClone(result);
      invalid.events[rewardIndex] = { ...invalid.events[rewardIndex], ...extras };
      expect(() => saveAccountRewards(saved, invalid, 'invalid')).toThrow();
      expect(write).not.toHaveBeenCalled();
      expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    }
    const early = kill(25);
    early.events.find((event) => event.kind === 'reward')!.conduits = { 'infernic-phoenix-reactor': 1 };
    expect(() => saveAccountRewards(saved, early, 'early')).toThrow('Invalid machine');
    const wrong = kill();
    delete wrong.state.infusion;
    expect(() => saveAccountRewards(saved, wrong, 'wrong')).toThrow();
  });
  it('retains old saves without load writes, rejects machine ownership, and persists unlocks/snapshots', () => {
    const saved = storage();
    const write = vi.spyOn(saved, 'setItem');
    loadAccount(saved);
    expect(write).not.toHaveBeenCalled();
    expect(() => createCreatureCopy('infusion:machines:0')).toThrow('eligible');
    expect(() => validateCapturedCharacters([{ instanceId: 'capture:11111111-1111-1111-1111-111111111111', creatureId: 'infusion:machines:0', locked: false }])).toThrow('eligible');
    const state = omnicBattle('infernic');
    state.infusion = { mode: 'machines', stage: 26 };
    const real = createInfusionBattle('machines', 26, 1729, 'ember', { level: 50, evolution: 4 }, ['ember'], { ember: { level: 50, evolution: 4 } }, { ember: slots('infernic-phoenix-reactor') });
    real.phase = 'cleared';
    real.allies[0].conduitCharges = { burnFocus: true };
    const next = nextStage(real, { level: 50, evolution: 4 }).state;
    expect(next.infusion?.stage).toBe(27);
    expect(next.allies[0].conduits).toEqual(real.allies[0].conduits);
    expect(next.allies[0].conduitCharges).toEqual({ burnFocus: true });
    expect(saveAccountRewards(saved, { state: real, events: [] }, 'unlock').infusionStages.machines).toBe(27);
  });
  it('preserves saved stage numbers and discovers/unlocks the expanded late stages without ending at35', () => {
    const saved = storage();
    saveAccount(saved, { ...loadAccount(saved), infusionStages: { machines: 35, heavens: 35 },
      conduits: { 'infernic-phoenix-reactor': 1 }, conduitUpgrades: { 'infernic-phoenix-reactor': 5 } });
    const raw = saved.getItem(ACCOUNT_KEY);
    const write = vi.spyOn(saved, 'setItem');
    expect(loadAccount(saved).infusionStages).toEqual({ machines: 35, heavens: 35 });
    expect(loadAccount(saved).conduitUpgrades).toEqual({ 'infernic-phoenix-reactor': 5 });
    expect(write).not.toHaveBeenCalled();
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    const progress = { level: 105, evolution: 6 };
    for (const stage of [35, 74, 75, 99]) {
      const state = createInfusionBattle('machines', stage, 1, 'ember', progress);
      state.phase = 'cleared';
      expect(nextStage(state, progress).state.infusion?.stage).toBe(stage + 1);
      expect(battleResults(state, [])).toContain('data-result-continue');
      expect(saveAccountRewards(saved, { state, events: [] }, `clear-${stage}`).infusionStages.machines).toBe(stage + 1);
    }
    const final = createInfusionBattle('machines', 100, 1, 'ember', progress);
    final.phase = 'cleared';
    expect(() => nextStage(final, progress)).toThrow('Dungeon complete');
    expect(battleResults(final, [])).toContain('Activity complete');
    expect(battleResults(final, [])).not.toContain('data-result-continue');
    expect(saveAccountRewards(saved, { state: final, events: [] }, 'final').infusionStages.machines).toBe(100);
    const markup = gameplayHub(loadAccount(saved));
    expect(markup).toContain('<dd>100 stages</dd>');
    expect(markup).toContain('<dd>10-120</dd>');
    expect(markup).toContain('Omnic 1% from stage 75');
    expect(markup).toContain('100% chance of 100 at stage 100');
    expect(markup).toContain('value="100" selected');
    expect(validateAccount({ ...loadAccount(saved), infusionStages: { machines: 100 } }).infusionStages.machines).toBe(100);
    expect(() => validateAccount({ ...loadAccount(saved), infusionStages: { machines: 101 } })).toThrow('stage');
    expect(infusionEncounter('heavens', 35).level).toBe(120);
    expect(() => infusionEncounter('heavens', 36)).toThrow();
  });
  it.each(['standard', 'roses'])('saves %s main outcome, bonus, cost and pity together; fails atomically', (banner) => {
    const saved = storage();
    saveAccount(saved, { ...loadAccount(saved), lycalis: 20 });
    const write = vi.spyOn(saved, 'setItem');
    const draw = summonCharacter(saved, () => 0, banner);
    expect(draw.bonusConduit).toBe('worldbreaker-drive');
    expect(draw.account.conduits?.['worldbreaker-drive']).toBe(1);
    expect(draw.account.lycalis).toBe(10);
    expect(draw.account.bannerPity?.[banner === 'standard' ? 'standard' : 'roses']).toBeDefined();
    expect(draw.account.conduitEquipment).toBeUndefined();
    expect(write).toHaveBeenCalledTimes(1);
    const raw = saved.getItem(ACCOUNT_KEY);
    vi.spyOn(saved, 'setItem').mockImplementation(() => { throw new Error('Storage unavailable'); });
    expect(() => summonCharacter(saved, () => 0, banner)).toThrow('Storage unavailable');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
  });
  it('does not roll on unaffordable draws and rejects bonus overflow without charging or advancing pity', () => {
    const saved = storage();
    const random = vi.fn(() => 0);
    expect(() => summonCharacter(saved, random)).toThrow('requires');
    expect(random).not.toHaveBeenCalled();
    saveAccount(saved, { ...loadAccount(saved), lycalis: 10, conduits: { 'worldbreaker-drive': Number.MAX_SAFE_INTEGER } });
    const raw = saved.getItem(ACCOUNT_KEY);
    const write = vi.spyOn(saved, 'setItem');
    expect(() => summonCharacter(saved, random)).toThrow('Conduit inventory');
    expect(write).not.toHaveBeenCalled();
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
  });
});

describe('Conduit equipment and all ten Omnic mechanics', () => {
  it('validates element matching, four-Omnic cap, captured element and drop-only purchases atomically', () => {
    const saved = storage();
    saveAccount(saved, { ...loadAccount(saved), conduits: Object.fromEntries(conduits.map((entry) => [entry.id, 1])) });
    const raw = saved.getItem(ACCOUNT_KEY);
    expect(() => equipConduit(saved, 'ember', 0, 'aquatic-leviathan-pump')).toThrow('requires');
    expect(() => purchaseConduit(saved, 'duplex-heart')).toThrow('not sold');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    expect(equipConduit(saved, 'ember', 0, 'infernic-phoenix-reactor').conduitEquipment?.ember?.[0]).toBe('infernic-phoenix-reactor');
    expect(() => validateConduitSlots([...conduits.filter((entry) => entry.rarity === 'Omnic').slice(0, 5).map((entry) => entry.id), null, null, null])).toThrow('four');
    const copy = createCreatureCopy('infusion:heavens:0');
    expect(() => resolveCapturedFighter(copy, slots('infernic-phoenix-reactor'))).toThrow('requires');
    expect(() => resolveCapturedFighter(copy, slots('tranquilitic-kirin-cradle'))).not.toThrow();
    const invalid = { ...loadAccount(saved), conduitEquipment: { ember: slots('aquatic-leviathan-pump') } };
    expect(() => validateAccount(invalid)).toThrow('requires');
  });
  it('applies two stat buffs, three stat buffs and Legendary penalties after growth without mutating bases', () => {
    const progress = { level: 105, evolution: 6 };
    const baseline = resolveFighter('ember', progress).stats;
    const legendary = resolveFighter('ember', progress, slots('worldbreaker-drive')).stats;
    expect(legendary.damage).toBeCloseTo(baseline.damage * 1.85);
    expect(legendary.health).toBeCloseTo(baseline.health * .9);
    const rare = resolveFighter('ember', progress, slots('duplex-heart')).stats;
    expect(rare.health).toBeCloseTo(baseline.health * 1.15);
    expect(rare.defense).toBeCloseTo(baseline.defense * 1.12);
    const omnic = resolveFighter('ember', progress, slots('infernic-phoenix-reactor')).stats;
    expect(omnic.damage).toBeCloseTo(baseline.damage * 1.6);
    expect(omnic.elementalDamage).toBeCloseTo(baseline.elementalDamage * 1.5);
    expect(omnic.health).toBeCloseTo(baseline.health * 1.4);
    expect(resolveFighter('ember', progress).stats).toEqual(baseline);
  });
  it('Infernic charges on actual surviving-target Burn, consumes on next attack and never stacks', () => {
    const initial = omnicBattle('infernic');
    const first = attack(initial, 'skill1').state;
    expect(first.allies[0].conduitCharges?.burnFocus).toBe(true);
    first.allies[0].spent = false;
    const next = attack(first, 'light').state;
    expect(next.allies[0].conduitCharges?.burnFocus).toBeUndefined();
    expect(initial.allies[0].conduitCharges).toBeUndefined();
    const charged = structuredClone(first);
    charged.seed = 1;
    const uncharged = structuredClone(charged);
    delete uncharged.allies[0].conduitCharges;
    expect(attack(charged, 'light').events.find((entry) => entry.kind === 'damage')?.critical).toBe(true);
    expect(attack(uncharged, 'light').events.find((entry) => entry.kind === 'damage')?.critical).toBe(false);
  });
  it('Aquatic heals only when an ability increases a shield, once per activation', () => {
    const state = omnicBattle('aquatic');
    state.allies[0].hp /= 2;
    const result = attack(state, 'skill2');
    expect(result.state.allies[0].hp - state.allies[0].hp).toBeCloseTo(Math.round(state.allies[0].stats.health * .05), 8);
    state.allies[0].shield = 1e8;
    expect(attack(state, 'skill2').state.allies[0].hp).toBe(state.allies[0].hp);
  });
  it('Tectonic Defense grants a10% ward and Tranquilitic Defense heals5%', () => {
    const earth = omnicBattle('tectonic');
    const ward = attack(earth, 'defend').state;
    expect(ward.allies[0].shield).toBe(Math.round(earth.allies[0].stats.health * .1));
    ward.allies[0].spent = false;
    expect(attack(ward, 'defend').state.allies[0].shield).toBe(ward.allies[0].shield);
    const peace = omnicBattle('tranquilitic');
    peace.allies[0].hp /= 2;
    const result = attack(peace, 'defend');
    expect(result.state.allies[0].hp - peace.allies[0].hp).toBeCloseTo(Math.round(peace.allies[0].stats.health * .05), 8);
    expect(result.state.allies[0].defending).toBe(true);
  });
  it('Efflorescent heals2% on new turns, never revives and does not heal on initial spawn', () => {
    const state = omnicBattle('efflorescent');
    state.allies[0].hp /= 2;
    const result = endTurn(state);
    expect(result.events.some((event) => event.kind === 'heal' && event.message.includes('Conduit') && event.amount === Math.round(state.allies[0].stats.health * .02))).toBe(true);
    state.allies[0].hp = 0;
    expect(endTurn(state).state.allies[0].hp).toBe(0);
  });
  it('Voltaic critical activation grants5 Gauge once and Luminous defeating enemies grants5 once', () => {
    const storm = omnicBattle('voltaic');
    storm.allies[0].stats.crit = 1;
    const crit = attack(storm, 'skill2');
    expect(crit.events.filter((event) => event.kind === 'status' && event.amount === 5 && event.message.includes('Gauge'))).toHaveLength(1);
    const light = omnicBattle('luminous');
    light.enemies.forEach((enemy) => { enemy.hp = 1; });
    const shield = attack(light, 'skill2');
    expect(shield.events.filter((event) => event.kind === 'status' && event.amount === 5 && event.message.includes('Gauge'))).toHaveLength(1);
    expect(shield.state.phase).toBe('cleared');
  });
  it('Atmospheric normal attack empowers only the next offensive skill', () => {
    const initial = omnicBattle('atmospheric');
    initial.allies[0].stats.crit = 1;
    const state = attack(initial, 'light').state;
    expect(state.allies[0].conduitCharges?.normalMomentum).toBe(true);
    expect(state.allies[0].pilot?.tempest).toBe(1);
    state.allies[0].stats.crit = 0;
    state.allies[0].spent = false;
    const empowered = attack(state, 'skill1');
    const kit = state.allies[0].kit!;
    const conduitBonus = .1;
    const intrinsicBonus = .08;
    expect(empowered.events.find((event) => event.kind === 'damage')!.amount)
      .toBe(damageAmount(state.allies[0].stats.damage,
        kit.abilities.skill1.strength.damageMultiplier! * (1 + conduitBonus + intrinsicBonus),
        0, false, state.allies[0].stats.critMultiplier));
    expect(empowered.state.allies[0].conduitCharges?.normalMomentum).toBeUndefined();
    expect(empowered.state.allies[0].pilot?.tempest).toBe(0);
  });
  it('Ominous Weaken prepares20% pierce without altering enemy stats; Chaotic ultimate wards but keeps recovery', () => {
    const shadow = attack(omnicBattle('ominous'), 'skill2').state;
    expect(shadow.allies[0].conduitCharges?.weakenPierce).toBe(true);
    shadow.allies[0].spent = false;
    shadow.enemies[0].stats.defense = 100;
    const next = attack(shadow, 'light');
    expect(next.events.find((event) => event.kind === 'damage')?.amount).toBe(damageAmount(shadow.allies[0].stats.damage, 1, 80, false));
    expect(next.state.enemies[0].stats.defense).toBe(100);
    expect(next.state.allies[0].conduitCharges?.weakenPierce).toBeUndefined();
    const chaos = omnicBattle('chaotic');
    const ultimate = attack(chaos, 'ultimate').state;
    expect(ultimate.allies[0].shield).toBe(Math.round(chaos.allies[0].stats.health * .15));
    expect(ultimate.allies[0].recoverThrough).toBe(chaos.round + 1);
  });
  it('shows mode, honest artwork, odds and disabled mismatches on every relevant menu', () => {
    const account = { ...emptyAccount(), characters: { ember: { level: 0, evolution: 1 } }, conduits: { 'aquatic-leviathan-pump': 1, 'worldbreaker-drive': 1 } };
    expect(gameplayHub(account)).toContain('data-infusion="machines"');
    expect(gameplayHub(account)).toContain('banners/machines-banner.png');
    const inventory = inventoryView(account, 'conduits');
    expect(inventory).toContain('conduit-legendary');
    expect(inventory).toContain('conduit-omnic');
    expect(inventory).toContain('conduits/aquatic-leviathan-pump.png');
    const detail = characterDetail(getStarter('ember'), 'equipment', account);
    expect(detail).toContain('Element mismatch');
    expect(archives(account, 'characters').match(/data-archive-character=/g)).toHaveLength(126);
    expect(archives(account, 'conduits').match(/Eligible for the 0\.5% Legendary bonus tier/g)).toHaveLength(5);
  });
});

describe('expanded Omnic mechanics', () => {
  it('combines live and expanded same-element Omnic modifiers while preserving zero stats and upgrades', () => {
    const progress = { level: 105, evolution: 6 };
    const base = resolveFighter('ember', progress);
    const equipped = resolveFighter('ember', progress, [
      'infernic-phoenix-reactor', 'infernic-cinder-testament', null, null, null, null, null, null,
    ]);
    expect(equipped.stats.damage).toBeCloseTo(base.stats.damage * 1.6 * 1.5);
    expect(equipped.stats.elementalDamage).toBeCloseTo(base.stats.elementalDamage * 1.5 * 1.6);
    expect(equipped.stats.health).toBeCloseTo(base.stats.health * 1.4);
    expect(equipped.stats.defense).toBeCloseTo(base.stats.defense * 1.4);
    const zeroElemental = resolveFighter('tide', progress, ['prism-splinter-socket', null, null, null, null, null, null, null]);
    expect(zeroElemental.stats.elementalDamage).toBe(0);
    const upgraded = resolveFighter('ember', progress, ['infernic-cinder-testament', null, null, null, null, null, null, null],
      { 'infernic-cinder-testament': 5 });
    expect(upgraded.stats.elementalDamage).toBeCloseTo(base.stats.elementalDamage * 3.1);
  });

  it('Cinder seals trigger once per enemy phase, cap at three, and add damage when consumed by a skill', () => {
    let state = expandedBattle('infernic-cinder-testament');
    for (const enemy of state.enemies) enemy.burn = { damage: 1, turns: 3, sourceId: state.allies[0].id };
    for (const seals of [1, 2, 3]) {
      const tick = endTurn(state);
      const periodic = tick.events.find((entry) => entry.kind === 'damage' && entry.periodic);
      expect(periodic?.debuffs).toEqual({
        ...(seals < 3 ? { burn: { damage: 1, turns: 3 - seals } } : {}),
        ...(seals < 3 ? { elementalEffects: [{ family: 'burn', kind: 'burn', origin: 'native', source: 'living-self-authored-burn' }] } : {}),
        weakened: 0, weakenFraction: 0,
      });
      state = tick.state;
      expect(state.allies[0].conduitCharges?.emberSeals).toBe(seals);
    }
    state.allies[0].spent = false;
    const actor = state.allies[0];
    const expected = damageAmount(actor.stats.damage,
      actor.kit!.abilities.skill1.strength!.damageMultiplier! * 1.15, 0, false, actor.stats.critMultiplier);
    const result = attack(state, 'skill1');
    expect(result.events.find((entry) => entry.kind === 'damage')?.amount).toBe(expected);
    expect(result.state.allies[0].conduitCharges?.emberSeals).toBeUndefined();
    expect(result.state.allies[0].conduitCharges?.emberSealRound).toBe(state.round - 1);
  });

  it('Undertide reduces the other ordinary cooldown once per player turn without touching recovery', () => {
    const state = expandedBattle('aquatic-undertide-chronometer');
    const actor = state.allies[0];
    state.enemies[0].weakened = 2;
    actor.readyRound.skill2 = state.round + 3;
    const first = attack(state, 'skill1').state;
    expect(first.allies[0].readyRound.skill2).toBe(state.round + 2);
    expect(first.allies[0].recoverThrough).toBe(0);
    first.allies[0].spent = false;
    first.allies[0].readyRound.skill1 = first.round;
    first.enemies[0].weakened = 2;
    const second = attack(first, 'skill1').state;
    expect(second.allies[0].readyRound.skill2).toBe(state.round + 2);
  });

  it('publishes ordered typed debuff snapshots on application, periodic damage, and duration changes', () => {
    const state = expandedBattle('aquatic-undertide-chronometer');
    const application = attack(state, 'skill1');
    const applied = application.events.find((entry) => entry.kind === 'status' && entry.target === state.enemies[0].id)?.debuffs;
    expect(applied?.weakened).toBe(2);
    expect(applied?.weakenFraction).toBe(application.state.enemies[0].weakenFraction);
    const tick = endTurn(application.state);
    const weakenUpdate = tick.events.find((entry) => entry.kind === 'status' && entry.target === state.enemies[0].id);
    expect(weakenUpdate?.debuffs?.weakened).toBe(1);
    expect(weakenUpdate?.debuffs?.weakenFraction).toBe(application.state.enemies[0].weakenFraction);
    const periodicState = structuredClone(state);
    periodicState.enemies[0].burn = { damage: 7, turns: 2, sourceId: state.allies[0].id };
    const periodic = endTurn(periodicState).events.find((entry) => entry.periodic);
    expect(periodic?.debuffs).toEqual({
      burn: { damage: 7, turns: 1 },
      elementalEffects: [{ family: 'burn', kind: 'burn', origin: 'native', source: 'living-self-authored-burn' }],
      weakened: 0, weakenFraction: 0,
    });
  });

  it('Faultkeeper consumes its ward on the first direct hit even when shields absorb it', () => {
    const guarded = expandedBattle('tectonic-faultkeeper-loom');
    guarded.enemies = guarded.enemies.slice(0, 1);
    guarded.enemies[0].stats.damage = 10000;
    guarded.allies[0].shield = 1e6;
    const without = structuredClone(guarded);
    without.allies[0].conduits = Array(8).fill(null);
    const armed = attack(guarded, 'defend').state;
    const plain = attack(without, 'defend').state;
    const armedStart = armed.allies[0].shield;
    const plainStart = plain.allies[0].shield;
    const guardedHit = endTurn(armed);
    const plainHit = endTurn(plain);
    expect(armedStart - guardedHit.state.allies[0].shield).toBeLessThan(plainStart - plainHit.state.allies[0].shield);
    expect(guardedHit.state.allies[0].conduitCharges?.faultkeeperWard).toBeUndefined();
    expect(guardedHit.events.some((entry) => entry.kind === 'status' && entry.message.includes('reduces this direct hit by 15%'))).toBe(true);
  });

  it('Verdant healing grants another living ally a one-use Normal Attack bonus', () => {
    const progress = { level: 50, evolution: 4 };
    const state = createBattle(1729, ['sprout', 'ember'], { sprout: progress, ember: progress },
      { sprout: slots('efflorescent-verdant-covenant') });
    state.enemies = state.enemies.slice(0, 1);
    state.enemies.forEach((enemy) => { enemy.hp = enemy.stats.health = 1e8; enemy.stats.defense = 0; });
    state.allies[0].shatter = 100;
    state.allies[1].stats.crit = 0;
    state.seed = 0x7fffffff;
    const other = state.allies[1];
    other.hp = Math.floor(other.stats.health / 2);
    const healed = act(state, 'sprout', 'skill2', state.enemies[0].id).state;
    expect(healed.allies[1].conduitCharges?.verdantNormal).toBe(true);
    healed.allies[1].spent = false;
    const expected = damageAmount(other.stats.damage, 1.1 * (1 + healed.allies[1].attackBoost!.fraction), 0, false, other.stats.critMultiplier);
    const normal = act(healed, 'ember', 'light', healed.enemies[0].id);
    expect(normal.events.find((entry) => entry.kind === 'damage')?.amount).toBe(expected);
    expect(normal.state.allies[1].conduitCharges?.verdantNormal).toBeUndefined();
  });

  it('Stormstep primes the opposite slot and its new charge never affects the priming activation', () => {
    const state = expandedBattle('voltaic-stormstep-dynamo');
    const first = attack(state, 'skill1');
    const actor = first.state.allies[0];
    expect(actor.conduitCharges?.stormstepSkill2).toBe(true);
    expect(actor.conduitCharges?.stormstepSkill1).toBeUndefined();
    const ordinaryHit = first.events.find((entry) => entry.kind === 'damage')!;
    const noBonus = damageAmount(state.allies[0].stats.damage,
      state.allies[0].kit!.abilities.skill1.strength!.damageMultiplier!, 0, ordinaryHit.critical, state.allies[0].stats.critMultiplier);
    expect(ordinaryHit.amount).toBe(noBonus);
    actor.spent = false;
    actor.readyRound.skill2 = first.state.round;
    const next = attack(first.state, 'skill2');
    const chargedHit = next.events.find((entry) => entry.kind === 'damage')!;
    const expected = damageAmount(actor.stats.damage,
      actor.kit!.abilities.skill2.strength!.damageMultiplier! * 1.1, 0, chargedHit.critical, actor.stats.critMultiplier);
    expect(chargedHit.amount).toBe(expected);
    const uncharged = structuredClone(first.state);
    uncharged.allies[0].conduits = Array(8).fill(null);
    delete uncharged.allies[0].conduitCharges?.stormstepSkill2;
    uncharged.allies[0].spent = false;
    uncharged.allies[0].readyRound.skill2 = uncharged.round;
    expect(attack(uncharged, 'skill2').events.find((entry) => entry.kind === 'damage')?.amount).toBeLessThan(chargedHit.amount);
    expect(next.state.allies[0].conduitCharges?.stormstepSkill1).toBe(true);
    expect(next.state.allies[0].conduitCharges?.stormstepSkill2).toBeUndefined();
  });

  it('Skythread saves an illegal skill attempt and discounts only the next legal ordinary skill', () => {
    const state = expandedBattle('atmospheric-skythread-rudder');
    const defended = attack(state, 'defend').state;
    const actor = defended.allies[0];
    const discountedCost = Math.max(1, shatterGauge.costs.skill1 - 5);
    expect(actor.conduitCharges?.skythread).toBe(true);
    actor.spent = false;
    actor.shatter = discountedCost - 1;
    expect(actionUnavailable(defended, actor, 'skill1')).toContain(`Requires ${discountedCost} Shatter Gauge`);
    expect(actor.conduitCharges?.skythread).toBe(true);
    actor.shatter = discountedCost;
    expect(actionUnavailable(defended, actor, 'skill1')).toBeNull();
    const activated = attack(defended, 'skill1').state.allies[0];
    expect(activated.shatter).toBe(0);
    expect(activated.conduitCharges?.skythread).toBeUndefined();
  });

  it('Dawn Witness stacks to three and consumes the bonus on the next offensive activation', () => {
    let state = expandedBattle('luminous-dawn-witness-array');
    state.enemies = state.enemies.slice(0, 1);
    for (const stacks of [1, 2, 3]) {
      state.allies[0].spent = false;
      state.seed = 0x7fffffff;
      state = attack(state, 'light').state;
      expect(state.allies[0].conduitCharges?.dawnWitness).toBe(stacks);
    }
    const withWitness = structuredClone(state);
    const withoutWitness = structuredClone(state);
    withWitness.seed = withoutWitness.seed = Array.from({ length: 10000 }, (_, index) => index + 1).find((seed) => {
      let roll = seed;
      roll ^= roll << 13;
      roll ^= roll >>> 17;
      roll ^= roll << 5;
      const chance = (roll >>> 0) / 0x100000000;
      return chance > .02 && chance < .11;
    })!;
    withWitness.allies[0].spent = withoutWitness.allies[0].spent = false;
    withWitness.allies[0].stats.crit = withoutWitness.allies[0].stats.crit = .02;
    delete withoutWitness.allies[0].conduitCharges?.dawnWitness;
    withoutWitness.allies[0].conduits = Array(8).fill(null);
    expect(attack(withWitness, 'light').events.find((entry) => entry.kind === 'damage')?.critical).toBe(true);
    expect(attack(withoutWitness, 'light').events.find((entry) => entry.kind === 'damage')?.critical).toBe(false);
    expect(attack(withWitness, 'light').state.allies[0].conduitCharges?.dawnWitness).toBeUndefined();
  });

  it('Nightglass marks surviving targets to two and consumes only the attacked bearer-owned marks', () => {
    const state = expandedBattle('ominous-nightglass-archive');
    const first = attack(state, 'skill2').state;
    expect(first.enemies[0].conduitMarks?.[first.allies[0].id]).toBe(1);
    expect(attack(state, 'skill2').events.find((entry) => entry.kind === 'status' && entry.debuffs?.marks)?.debuffs)
      .toMatchObject({ weakened: 2, marks: [{ bearerId: state.allies[0].id, stacks: 1 }] });
    first.allies[0].spent = false;
    first.allies[0].readyRound.skill2 = first.round;
    const second = attack(first, 'skill2').state;
    expect(second.enemies[0].conduitMarks?.[second.allies[0].id]).toBe(2);
    second.allies[0].spent = false;
    const actor = second.allies[0];
    const expected = damageAmount(actor.stats.damage, 1.16, 0, false, actor.stats.critMultiplier);
    const attackResult = attack(second, 'light');
    expect(attackResult.events.find((entry) => entry.kind === 'damage')?.amount).toBe(expected);
    expect(attackResult.events.find((entry) => entry.kind === 'status' && entry.target === second.enemies[0].id)?.debuffs)
      .toMatchObject({ weakened: 2, weakenFraction: second.enemies[0].weakenFraction });
    expect(attackResult.events.find((entry) => entry.kind === 'status' && entry.target === second.enemies[0].id)?.debuffs).not.toHaveProperty('marks');
    expect(attackResult.state.enemies[0].conduitMarks).toBeUndefined();
  });

  it('Stillhour grants Gauge after a direct shield-absorbed hit that is survived', () => {
    const state = expandedBattle('tranquilitic-stillhour-carillon');
    state.enemies = state.enemies.slice(0, 1);
    state.enemies[0].stats.damage = 100;
    state.allies[0].shield = 1e6;
    const defended = attack(state, 'defend').state;
    const withoutCharge = structuredClone(defended);
    delete withoutCharge.allies[0].conduitCharges?.stillhour;
    const ordinary = endTurn(withoutCharge).state.allies[0];
    const hit = endTurn(defended);
    expect(hit.state.allies[0].hp).toBeGreaterThan(0);
    expect(hit.state.allies[0].shatter).toBe(Math.min(hit.state.allies[0].stats.shatterCapacity, ordinary.shatter + 8));
    expect(hit.state.allies[0].conduitCharges?.stillhour).toBeUndefined();
  });

  it('Paradox primes only after Last Flare, respects normal recovery, and carries charges through Continue but not replay', () => {
    const state = expandedBattle('chaotic-paradox-spindle');
    const ultimate = attack(state, 'ultimate').state;
    expect(ultimate.allies[0].conduitCharges?.paradox).toBe(true);
    ultimate.allies[0].spent = false;
    expect(actionUnavailable(ultimate, ultimate.allies[0], 'light')).toContain('Recovering');
    const recovery = endTurn(ultimate).state;
    expect(actionUnavailable(recovery, recovery.allies[0], 'light')).toContain('Recovering');
    const ready = endTurn(recovery).state;
    const actor = ready.allies[0];
    const strike = attack(ready, 'light');
    const hit = strike.events.find((entry) => entry.kind === 'damage')!;
    expect(hit.amount).toBe(damageAmount(actor.stats.damage, 1.15, 0, hit.critical, actor.stats.critMultiplier));
    expect(strike.state.allies[0].conduitCharges?.paradox).toBeUndefined();

    const progress = { level: 50, evolution: 4 };
    const machine = createInfusionBattle('machines', 1, 1, 'ember', progress, ['ember'], { ember: progress },
      { ember: slots('infernic-cinder-testament') });
    machine.phase = 'cleared';
    machine.allies[0].conduitCharges = { emberSeals: 2, emberSealRound: 1 };
    machine.enemies[0].conduitMarks = { ember: 2 };
    const continued = nextStage(machine, progress).state;
    expect(continued.allies[0].conduitCharges?.emberSeals).toBe(2);
    expect(continued.allies[0].conduitCharges?.emberSealRound).toBeUndefined();
    expect(continued.enemies[0].conduitMarks).toBeUndefined();
    const replay = createSession('ember', progress, { mode: 'machines', stage: 1 },
      { ids: ['ember'], progress: { ember: progress }, equipment: { ember: slots('infernic-cinder-testament') } });
    expect(replay.state.allies[0].conduitCharges).toBeUndefined();
  });
});
