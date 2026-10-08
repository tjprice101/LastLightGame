import { describe, expect, it, vi } from 'vitest';
import { conduits, conduitBuffs, validateConduitSlots, type ConduitId, type ConduitSlots } from '../content/conduits';
import { elements } from '../content/activities';
import { infusionEncounter } from '../content/infusions';
import { machineConduitDrops, machineConduitLoot, bannerConduitBonus, machineEnemies } from '../content/machines';
import { creatureLoot, getCreature } from '../content/creatures';
import { getStarter, starters } from '../content/starters';
import { resolveFighter } from '../content/combat';
import { act, endTurn, nextStage, damageAmount, createBattle, createInfusionBattle, type BattleState } from './battle';
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
function omnicBattle(element: (typeof elements)[number]['id']): BattleState {
  const starter = starters.find((entry) => entry.elementId === element);
  const conduit = conduits.find((entry) => entry.element === element);
  if (!starter || !conduit) throw new Error('Missing element fixture.');
  const state = createBattle(1729, [starter.id], { [starter.id]: { level: 50, evolution: 4 } }, { [starter.id]: slots(conduit.id) });
  state.allies[0].shatter = 100;
  for (const enemy of state.enemies) { enemy.hp = enemy.stats.health = 1e8; enemy.stats.defense = 0; enemy.stats.damage = 0; enemy.stats.crit = 0; }
  state.allies[0].stats.crit = 0;
  return state;
}
function attack(state: BattleState, action: 'light' | 'skill1' | 'skill2' | 'ultimate' | 'defend') {
  return act(state, state.allies[0].id, action, state.enemies[0].id);
}

describe('machine content and exact probabilities', () => {
  it('authors the exact catalog and distinct stats/penalties/elements without selling drops', () => {
    expect(conduits).toHaveLength(25);
    expect(new Set(conduits.map((entry) => entry.id)).size).toBe(25);
    for (const [rarity, count] of [['Common', 5], ['Rare', 5], ['Legendary', 5], ['Omnic', 10]] as const) {
      const pool = conduits.filter((entry) => entry.rarity === rarity);
      expect(pool).toHaveLength(count);
      for (const conduit of pool) {
        const buffs = conduitBuffs(conduit);
        expect(new Set(buffs.map((entry) => entry.stat)).size).toBe(buffs.length);
        if (rarity === 'Rare') expect(buffs).toHaveLength(2);
        if (rarity === 'Legendary') expect(buffs.map((entry) => entry.amount)).toEqual([85, -10]);
        if (rarity === 'Omnic') { expect(buffs).toHaveLength(3); expect(conduit.mechanic).toBeTruthy(); }
        if (rarity !== 'Common') { expect(conduit.price).toBeNull(); expect(conduit.art).toBe(conduit.id); }
      }
    }
    expect(conduits.filter((entry) => entry.rarity === 'Omnic').map((entry) => entry.element).sort()).toEqual(elements.map((entry) => entry.id).sort());
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
    for (let index = 0; index < 5; index++) {
      const drops = machineConduitDrops(75, sequence(.079999, (index + .5) / 5, .034999, (index + .5) / 5, .01));
      expect(Object.keys(drops)).toEqual([conduits.filter((c) => c.rarity === 'Rare')[index].id, conduits.filter((c) => c.rarity === 'Legendary')[index].id]);
    }
    for (let index = 0; index < 10; index++) {
      expect(machineConduitDrops(75, sequence(.08, .035, .009999, (index + .5) / 10))).toEqual({ [conduits.filter((c) => c.rarity === 'Omnic')[index].id]: 1 });
    }
    expect(Object.keys(machineConduitDrops(100, () => 0))).toHaveLength(3);
    expect(bannerConduitBonus(() => .005)).toBeUndefined();
    for (let index = 0; index < 5; index++) expect(bannerConduitBonus(sequence(.004999, (index + .5) / 5))).toBe(conduits.filter((c) => c.rarity === 'Legendary')[index].id);
    for (const invalid of [-1, 1, NaN, Infinity]) expect(() => machineConduitDrops(1, () => invalid)).toThrow('Loot roll');
  });
  it('publishes exactly the acquisition API odds in the discovery-gated glossary', () => {
    for (const stage of [1, 74, 75, 100]) {
      const encounter = infusionEncounter('machines', stage);
      const pool = machineConduitLoot(stage);
      expect(pool).toHaveLength(stage < 75 ? 10 : 20);
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
    const state = attack(omnicBattle('atmospheric'), 'light').state;
    expect(state.allies[0].conduitCharges?.normalMomentum).toBe(true);
    state.allies[0].spent = false;
    const empowered = attack(state, 'skill1');
    const kit = state.allies[0].kit!;
    expect(empowered.events.find((event) => event.kind === 'damage')!.amount).toBe(damageAmount(state.allies[0].stats.damage, kit.abilities.skill1.strength.damageMultiplier! * 1.1, 0, false, state.allies[0].stats.critMultiplier));
    expect(empowered.state.allies[0].conduitCharges?.normalMomentum).toBeUndefined();
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
    expect(archives(account, 'characters').match(/data-archive-character=/g)).toHaveLength(108);
  });
});
