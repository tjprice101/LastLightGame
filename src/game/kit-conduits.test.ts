import { describe, expect, it, vi } from 'vitest';
import { kitConduitDesigns } from '../content/kit-conduits';
import { conduits, getConduit, conduitBuffs, conduitEffect, validateConduitElement, type ConduitId, type ConduitSlots } from '../content/conduits';
import { machineConduitDrops, machineConduitLoot, isBannerConduitEligible } from '../content/machines';
import { act, createBattle, createDungeonBattle, createInfusionBattle, endTurn, nextStage, nextWave, actionUnavailable, damageAmount, type BattleState, type BattleResult } from './battle';
import { kitActivationBonus, kitDamageBonus, kitHealingMultiplier, kitSum } from './kit-conduits';
import { ACCOUNT_KEY, emptyAccount, saveAccount, loadAccount, purchaseConduit, equipConduit, saveAccountRewards, upgradeConduit } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { createCreatureCopy, resolveCapturedFighter } from './character-instances';
import { conduitIcon, conduitInventory, conduitStore, kitConduitRules } from '../presentation/conduit-store';
import { characterDetail } from '../presentation/hub';
import { getStarter } from '../content/starters';
import { archives } from '../presentation/archives';
import { debuffSnapshot } from './battle-debuffs';
import type { ActionId } from '../content/combat';
import type { StarterId } from '../content/starters';

function slots(...ids: ConduitId[]): ConduitSlots {
  return [...ids, ...Array<null>(8 - ids.length).fill(null)];
}
function battle(ids: ConduitId[], starter: StarterId = 'ember', roster: StarterId[] = [starter]): BattleState {
  const state = createBattle(1729, roster, Object.fromEntries(roster.map((id) => [id, { level: 50, evolution: 4 }])),
    { [starter]: slots(...ids) });
  state.allies.forEach((ally) => {
    ally.shatter = ally.stats.shatterCapacity;
    ally.stats.crit = 0;
    for (const ability of Object.values(ally.kit!.abilities)) ability.strength.critBonus = 0;
  });
  state.enemies.forEach((enemy) => { enemy.hp = enemy.stats.health = 1e8; enemy.stats.defense = 0; enemy.stats.damage = 0; enemy.stats.crit = 0; });
  return state;
}
function use(state: BattleState, action: ActionId): BattleResult {
  return act(state, state.allies[0].id, action, state.enemies[0].id);
}
function hit(result: BattleResult): number {
  return result.events.find((event) => event.kind === 'damage' && event.source === result.state.allies[0].id)!.amount;
}
function storage(): ProfileStorage {
  const data = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  return { getItem: (key) => data.get(key) ?? null, setItem: vi.fn((key, value) => { data.set(key, value); }),
    removeItem: (key) => { data.delete(key); } };
}
function sequence(...rolls: number[]): () => number {
  return () => {
    const roll = rolls.shift();
    if (roll === undefined) throw new Error('Unexpected RNG consumption.');
    return roll;
  };
}

describe('25 kit-focused Conduit catalog and acquisition', () => {
  it('implements exactly5/8/6/6 unique additions with one Omnic per canonical element and no art URLs', () => {
    expect(kitConduitDesigns).toHaveLength(25);
    expect(conduits).toHaveLength(85);
    for (const [rarity, count] of [['Common', 5], ['Rare', 8], ['Legendary', 6], ['Omnic', 6]] as const) {
      expect(kitConduitDesigns.filter((entry) => entry.rarity === rarity)).toHaveLength(count);
    }
    expect(new Set(kitConduitDesigns.map((entry) => entry.id)).size).toBe(25);
    expect(new Set(kitConduitDesigns.map((entry) => entry.artDesign)).size).toBe(25);
    expect(new Set(kitConduitDesigns.filter((entry) => entry.rarity === 'Omnic').map((entry) => entry.element)).size).toBe(6);
    for (const entry of kitConduitDesigns) {
      const conduit = getConduit(entry.id);
      expect(conduit.art).toBeNull();
      expect(conduitIcon(entry.id)).not.toContain('assets/conduits/');
      expect(conduitIcon(entry.id)).toContain('Artwork pending');
      expect(isBannerConduitEligible(entry.id)).toBe(false);
      expect(conduitEffect(conduit, 5)).toContain(entry.effect.slice(entry.effect.indexOf('. ') + 2));
      expect(conduitBuffs(conduit, 5).map((buff) => buff.amount)).toEqual(conduitBuffs(conduit).map((buff) => buff.amount * 3.5));
      expect(conduit.element !== null).toBe(entry.rarity === 'Omnic');
    }
  });

  it('gives each machine entry its exact equal share without changing tier odds/gates or rolling Common', () => {
    for (const entry of kitConduitDesigns.filter((design) => design.rarity !== 'Common')) {
      const pool = conduits.filter((conduit) => conduit.rarity === entry.rarity);
      const index = pool.findIndex((conduit) => conduit.id === entry.id);
      const selection = (index + .5) / pool.length;
      const random = entry.rarity === 'Rare' ? sequence(0, selection, 1 - Number.EPSILON, 1 - Number.EPSILON)
        : entry.rarity === 'Legendary' ? sequence(.08, 0, selection, .01) : sequence(.08, .035, 0, selection);
      expect(machineConduitDrops(75, random)).toEqual({ [entry.id]: 1 });
      const chance = entry.rarity === 'Rare' ? .08 : entry.rarity === 'Legendary' ? .035 : .01;
      expect(machineConduitLoot(75).find((drop) => drop.id === entry.id)?.chance).toBeCloseTo(chance / pool.length, 12);
      if (entry.rarity === 'Omnic') expect(machineConduitLoot(74).some((drop) => drop.id === entry.id)).toBe(false);
    }
    for (const entry of kitConduitDesigns.filter((design) => design.rarity === 'Common')) {
      expect(machineConduitLoot(100).map((drop) => drop.id)).not.toContain(entry.id);
    }
  });

  it('purchases, equips and upgrades new Common entries atomically without granting anything on reads', () => {
    const saved = storage();
    saveAccount(saved, { ...emptyAccount(), fractalis: 10000, mechanicalComponents: 25,
      characters: { ember: { level: 0, evolution: 1 } }, squad: ['ember'] });
    const before = saved.getItem(ACCOUNT_KEY);
    const write = vi.mocked(saved.setItem);
    write.mockClear();
    expect(loadAccount(saved).conduits).toBeUndefined();
    expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
    expect(write).not.toHaveBeenCalled();
    const bought = purchaseConduit(saved, 'tempered-strike-link');
    expect(write).toHaveBeenCalledTimes(1);
    expect(bought.fractalis).toBe(8500);
    expect(bought.conduits).toEqual({ 'tempered-strike-link': 1 });
    equipConduit(saved, 'ember', 0, 'tempered-strike-link');
    const upgraded = upgradeConduit(saved, 'tempered-strike-link', 0);
    expect(upgraded.conduitUpgrades?.['tempered-strike-link']).toBe(1);
    expect(upgraded.mechanicalComponents).toBe(0);
    expect(kitSum(createBattle(1, ['ember'], upgraded.characters, upgraded.conduitEquipment, [], upgraded.conduitUpgrades).allies[0], 'normalGauge')).toBe(0);
    expect(conduitStore(upgraded)).toContain('Normal Attack deals +5%');
    expect(conduitInventory(upgraded)).toContain('Tempered Strike Link');
    expect(archives(upgraded)).toContain('Pyre Census');
    for (const entry of kitConduitDesigns.filter((design) => design.rarity !== 'Common')) {
      const raw = saved.getItem(ACCOUNT_KEY);
      expect(() => purchaseConduit(saved, entry.id)).toThrow('not sold');
      expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    }
  });

  it('persists actual new machine awards once, and preserves the wallet on failure/overflow', () => {
    const saved = storage();
    const state = createInfusionBattle('machines', 75, 1729, 'ember', { level: 0, evolution: 1 });
    state.enemies[0].hp = 1;
    const result = act(state, 'ember', 'light', state.enemies[0].id);
    const reward = result.events.find((event) => event.kind === 'reward')!;
    reward.conduits = { 'firstlight-cam': 1, 'sootwake-crucible': 1, 'infernic-pyre-census': 1 };
    reward.materials = {};
    const account = saveAccountRewards(saved, result, 'kit-test');
    expect(account.conduits).toEqual(reward.conduits);
    const writes = vi.mocked(saved.setItem).mock.calls.length;
    expect(saveAccountRewards(saved, result, 'kit-test')).toEqual(account);
    expect(vi.mocked(saved.setItem)).toHaveBeenCalledTimes(writes);
    const raw = saved.getItem(ACCOUNT_KEY);
    const realWrite = saved.setItem;
    saved.setItem = () => { throw new Error('Write denied'); };
    expect(() => saveAccountRewards(saved, result, 'kit-retry')).toThrow('Write denied');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    saved.setItem = realWrite;
    expect(saveAccountRewards(saved, result, 'kit-retry').conduits?.['firstlight-cam']).toBe(2);
    saveAccount(saved, { ...loadAccount(saved), conduits: { 'firstlight-cam': Number.MAX_SAFE_INTEGER } });
    const full = saved.getItem(ACCOUNT_KEY);
    expect(() => saveAccountRewards(saved, result, 'kit-overflow')).toThrow();
    expect(saved.getItem(ACCOUNT_KEY)).toBe(full);
  });
});

describe('kit modifiers at exact combat boundaries', () => {
  it.each([
    ['tempered-strike-link', 'light', .05], ['firstlight-cam', 'skill1', .08],
    ['secondbeat-rack', 'skill2', .08], ['flare-focusing-iris', 'ultimate', .08],
  ] as const)('%s modifies only its selected damaging activation', (id, action, bonus) => {
    const state = battle([id]);
    const actor = state.allies[0];
    const strength = action === 'light' ? 1 : actor.kit!.abilities[action].strength.damageMultiplier!;
    expect(hit(use(state, action))).toBe(damageAmount(actor.stats.damage, strength * (1 + bonus), 0, false, actor.stats.critMultiplier));
    expect(kitDamageBonus(actor, state.enemies[0], action === 'light' ? 'skill1' : 'light')).toBe(0);
    expect(state.allies[0].spent).toBe(false);
  });

  it.each([['cinder-metering-nozzle', .05], ['emberlife-kiln', .10], ['infernic-pyre-census', .20]] as const)(
    '%s enhances actual Burn without changing source/duration or inventing new Burn', (id, bonus) => {
      const state = battle([id]);
      const applied = use(state, 'skill1').state;
      expect(applied.enemies[0].burn).toEqual({ damage: Math.round(state.allies[0].stats.elementalDamage *
        state.allies[0].kit!.abilities.skill1.strength.burnMultiplier! * (1 + bonus)), turns: 2, sourceId: 'ember' });
      expect(debuffSnapshot(applied.enemies[0]).burn).toEqual({ damage: applied.enemies[0].burn.damage, turns: 2 });
      const normal = use(state, 'light').state;
      expect(normal.enemies[0].burn.turns).toBe(0);
    });

  it.each([['mending-valve', .05], ['clearwater-manifold', .08], ['botanic-graft-covenant', .15]] as const)(
    '%s enhances healing once, clamps actual amounts and never revives', (id, bonus) => {
      const state = battle([id], 'sprout', ['sprout', 'ember', 'tide']);
      state.allies[0].hp -= 2000;
      state.allies[1].hp -= 2000;
      state.allies[2].hp = 0;
      const amount = state.allies[0].kit!.abilities.skill2.strength.healing! * (1 + bonus);
      const result = use(state, 'skill2');
      expect(result.events.filter((event) => event.kind === 'heal').map((event) => event.amount)).toEqual([amount, amount]);
      expect(result.state.allies[2].hp).toBe(0);
      const capped = battle([id], 'sprout');
      capped.allies[0].hp -= .25;
      expect(use(capped, 'skill2').events.find((event) => event.kind === 'heal')?.amount).toBe(.25);
    });

  it('enhances passive healing and snapshots the low-HP triage bonus before healing the caster', () => {
    const state = battle(['rootbound-triage-vault', 'mending-valve'], 'sprout', ['sprout', 'ember']);
    state.allies[0].hp = state.allies[0].stats.health / 2;
    state.allies[1].hp -= 1000;
    expect(kitHealingMultiplier(state.allies[0])).toBe(1.3);
    const result = endTurn(state);
    const heals = result.events.filter((event) => event.kind === 'heal' && event.source === 'sprout');
    const fraction = state.allies[0].kit!.passive.healFraction;
    expect(heals.map((event) => event.amount)).toEqual(state.allies.map((ally) => Math.max(1, Math.round(ally.stats.health * fraction * 1.3))));
    expect(kitHealingMultiplier(result.state.allies[0])).toBe(1.05);
  });

  it.each([['ward-stitch-spool', .05], ['oceanic-shared-tide-pump', .15]] as const)(
    '%s enhances authored shields with refresh rather than addition', (id, bonus) => {
      const state = battle([id], 'tide', ['tide', 'ember']);
      const amount = state.allies[0].kit!.abilities.skill2.strength.shield! * (1 + bonus);
      const first = use(state, 'skill2');
      expect(first.state.allies.map((ally) => ally.shield)).toEqual([amount, amount]);
      const refresh = structuredClone(first.state);
      refresh.allies[0].spent = false;
      refresh.allies[0].readyRound.skill2 = 1;
      refresh.allies[0].shatter = 100;
      const second = use(refresh, 'skill2');
      expect(second.state.allies.map((ally) => ally.shield)).toEqual([amount, amount]);
      expect(second.events.filter((event) => event.kind === 'shield').every((event) => event.amount === 0)).toBe(true);
    });

  it('grants recipient Gauge only for increased shields, once per living recipient and never on unchanged refresh', () => {
    const state = battle(['oceanic-shared-tide-pump', 'aegis-return-spring'], 'tide', ['tide', 'ember', 'sprout']);
    state.allies.forEach((ally) => { ally.shatter = 50; });
    state.allies[2].hp = 0;
    const result = use(state, 'skill2');
    expect(result.state.allies.map((ally) => ally.shatter)).toEqual([15, 53, 50]);
    const refreshed = structuredClone(result.state);
    refreshed.allies[0].spent = false;
    refreshed.allies[0].readyRound.skill2 = 1;
    refreshed.allies[0].shatter = 50;
    expect(use(refreshed, 'skill2').state.allies.map((ally) => ally.shatter)).toEqual([10, 53, 50]);
  });

  it('restoration Gauge triggers once per activation only when health actually changes', () => {
    const state = battle(['clearwater-manifold'], 'sprout', ['sprout', 'ember']);
    state.allies.forEach((ally) => { ally.hp -= 1000; });
    expect(use(state, 'skill2').state.allies[0].shatter).toBe(state.allies[0].shatter - 40 + 2);
    const full = battle(['clearwater-manifold'], 'sprout');
    expect(use(full, 'skill2').state.allies[0].shatter).toBe(full.allies[0].shatter - 40);
  });

  it('Gauge gains clamp, Defense spends an action, and unowned/unequipped effects do not run', () => {
    const state = battle(['pulse-trigger-pawl', 'covercharge-drum']);
    state.allies[0].shatter = 0;
    expect(use(state, 'light').state.allies[0].shatter).toBe(21);
    const defended = use(state, 'defend').state;
    expect(defended.allies[0].shatter).toBe(3);
    expect(defended.allies[0].spent).toBe(true);
    state.allies[0].shatter = state.allies[0].stats.shatterCapacity - .5;
    expect(use(state, 'light').state.allies[0].shatter).toBe(state.allies[0].stats.shatterCapacity);
    const plain = battle([]);
    plain.allies[0].shatter = 0;
    expect(use(plain, 'light').state.allies[0].shatter).toBe(20);
  });

  it.each([['tension-governor', .03], ['chaotic-fault-verdict', .05]] as const)(
    '%s changes authored Weaken only, clamps at60%% and exposes actual potency near HP', (id, bonus) => {
      const state = battle([id], 'thornia');
      const fraction = state.allies[0].kit!.abilities.skill2.strength.weakenFraction!;
      const result = use(state, 'skill2');
      expect(result.state.enemies[0].weakenFraction).toBe(Math.min(.6, fraction + bonus));
      expect(result.events.find((event) => event.debuffs?.weakened)?.debuffs?.weakenFraction).toBe(Math.min(.6, fraction + bonus));
      state.allies[0].kit!.abilities.skill2.strength.weakenFraction = .59;
      expect(use(state, 'skill2').state.enemies[0].weakenFraction).toBe(.6);
      expect(use(state, 'light').state.enemies[0].weakened).toBe(0);
    });

  it.each([['sootwake-crucible', 'burning'], ['ruinselect-prism', 'weakened']] as const)(
    '%s checks each target before application, not the whole AoE or the new status', (id, condition) => {
      const state = battle([id]);
      state.enemies[0].burn = { damage: 1, turns: condition === 'burning' ? 2 : 0 };
      state.enemies[0].weakened = condition === 'weakened' ? 2 : 0;
      const result = use(state, 'skill2');
      const damage = result.events.filter((event) => event.kind === 'damage' && event.source === 'ember');
      const strength = state.allies[0].kit!.abilities.skill2.strength.damageMultiplier!;
      expect(damage.map((event) => event.amount)).toEqual([1.18, 1, 1].map((multiplier) =>
        damageAmount(state.allies[0].stats.damage, strength * multiplier, 0, false, state.allies[0].stats.critMultiplier)));
    });

  it('shielded bonus follows actual positive shield and does not create one', () => {
    const state = battle(['tidebound-reflector']);
    expect(kitDamageBonus(state.allies[0], state.enemies[0], 'skill1')).toBe(0);
    state.allies[0].shield = .25;
    expect(kitDamageBonus(state.allies[0], state.enemies[0], 'skill1')).toBe(.18);
    expect(kitDamageBonus(state.allies[0], state.enemies[0], 'light')).toBe(0);
  });

  it('critical damage applies only to critical direct hits, with no extra rolls or Burn change', () => {
    const state = battle(['pressurecrest-governor']);
    const actor = state.allies[0];
    expect(hit(use(state, 'light'))).toBe(damageAmount(actor.stats.damage, 1, 0, false, actor.stats.critMultiplier));
    actor.stats.crit = 1;
    const critical = use(state, 'light');
    expect(hit(critical)).toBe(damageAmount(actor.stats.damage, 1, 0, true, actor.stats.critMultiplier * 1.12));
    const plain = structuredClone(state);
    plain.allies[0].conduits = slots();
    expect(use(plain, 'light').state.seed).toBe(critical.state.seed);
    expect(use(plain, 'light').state.rewardSeed).toBe(critical.state.rewardSeed);
  });

  it('Solace adds exactly5pp to Defense on direct hits without affecting periodic damage or idle defense', () => {
    const state = battle(['solace-anchor']);
    state.enemies.slice(1).forEach((enemy) => { enemy.hp = 0; });
    state.enemies[0].stats.damage = 100;
    state.allies[0].stats.defense = 0;
    const guarded = endTurn(use(state, 'defend').state);
    expect(use(state, 'defend').events[0].message).toContain('direct damage reduced by 15%');
    expect(guarded.events.find((event) => event.kind === 'damage')?.amount).toBe(85);
    expect(endTurn(state).events.find((event) => event.kind === 'damage')?.amount).toBe(100);
  });

  it('Pyre Census snapshots living Burning enemies once, caps the whole AoE at18%% and keeps recovery', () => {
    const state = battle(['infernic-pyre-census']);
    state.enemies.forEach((enemy) => { enemy.burn = { damage: 1, turns: 2 }; });
    const result = use(state, 'ultimate');
    const actor = state.allies[0];
    const expected = damageAmount(actor.stats.damage, actor.kit!.abilities.ultimate.strength.damageMultiplier! * 1.18,
      0, false, actor.stats.critMultiplier);
    expect(result.events.filter((event) => event.kind === 'damage').map((event) => event.amount)).toEqual([expected, expected, expected]);
    expect(result.state.allies[0].recoverThrough).toBe(2);
    result.state.allies[0].spent = false;
    expect(actionUnavailable(result.state, result.state.allies[0], 'light')).toContain('Recovering');
    state.enemies[0].hp = 0;
    expect(kitActivationBonus(state, actor, 'ultimate', false, [])).toBe(.12);
  });

  it('Storm Clock shortens only a critically hitting ordinary skill, once per round with a next-round floor', () => {
    const state = battle(['atmospheric-storm-clock'], 'elise');
    state.allies[0].stats.crit = 1;
    state.allies[0].kit!.abilities.skill1.cooldown = 3;
    const result = use(state, 'skill1');
    expect(result.state.allies[0].readyRound.skill1).toBe(3);
    const again = structuredClone(result.state);
    again.allies[0].spent = false;
    again.allies[0].shatter = 100;
    expect(use(again, 'skill2').state.allies[0].readyRound.skill2).toBe(1 + again.allies[0].kit!.abilities.skill2.cooldown);
    state.allies[0].kit!.abilities.skill1.cooldown = 1;
    expect(use(state, 'skill1').state.allies[0].readyRound.skill1).toBe(2);
    state.allies[0].stats.crit = 0;
    state.allies[0].kit!.abilities.skill1.strength.critBonus = 0;
    expect(use(state, 'skill1').state.allies[0].readyRound.skill1).toBe(2);
  });

  it('Graft Covenant needs actual healing of another ally, refreshes one charge and consumes only on a damaging ordinary skill', () => {
    const state = battle(['botanic-graft-covenant'], 'sprout', ['sprout', 'ember']);
    state.allies[1].hp -= 1000;
    const healing = use(state, 'skill2').state;
    expect(healing.allies[0].conduitCharges?.graftCovenant).toBe(true);
    expect(state.allies[0].conduitCharges).toBeUndefined();
    const ready = structuredClone(healing);
    ready.allies[0].spent = false;
    ready.allies[0].shatter = 100;
    const normal = use(ready, 'light').state;
    expect(normal.allies[0].conduitCharges?.graftCovenant).toBe(true);
    ready.allies[0].shield = 0;
    const skill = use(ready, 'skill1');
    const actor = ready.allies[0];
    expect(hit(skill)).toBe(damageAmount(actor.stats.damage, actor.kit!.abilities.skill1.strength.damageMultiplier! *
      (1 + actor.attackBoost!.fraction) * (1 + (actor.pilot?.blooms ?? 0) * .1) * 1.15,
      0, false, actor.stats.critMultiplier));
    expect(skill.state.allies[0].conduitCharges?.graftCovenant).toBeUndefined();
    expect(use(battle(['botanic-graft-covenant'], 'sprout'), 'skill2').state.allies[0].conduitCharges?.graftCovenant).toBeUndefined();
  });

  it('Accord shields each living ally at3%% caster HP on Defense, never adds, and does not amplify its own Conduit ward', () => {
    const state = battle(['tranquilitic-accord-bastion'], 'bliss', ['bliss', 'ember', 'tide']);
    state.allies[2].hp = 0;
    state.allies[1].shield = 1e6;
    const result = use(state, 'defend');
    expect(result.state.allies.map((ally) => ally.shield)).toEqual([Math.round(state.allies[0].stats.health * .03), 1e6, 0]);
    expect(result.state.allies[0].spent).toBe(true);
    expect(result.state.allies[2].hp).toBe(0);
  });

  it('Fault Verdict Gauge checks pre-existing Weaken once for AoE, and Last Flare pierces without mutating defense', () => {
    const state = battle(['chaotic-fault-verdict'], 'thornia');
    const fresh = use(state, 'skill2');
    expect(fresh.state.allies[0].shatter).toBe(state.allies[0].shatter - 40);
    state.enemies[0].weakened = 2;
    expect(use(state, 'skill2').state.allies[0].shatter).toBe(state.allies[0].shatter - 40 + 3);
    state.enemies[0].stats.defense = 100;
    const result = use(state, 'ultimate');
    const actor = state.allies[0];
    expect(hit(result)).toBe(damageAmount(actor.stats.damage, actor.kit!.abilities.ultimate.strength.damageMultiplier!, 85, false, actor.stats.critMultiplier));
    expect(result.state.enemies[0].stats.defense).toBe(100);
    expect(result.state.allies[0].recoverThrough).toBe(2);
  });

  it('keeps kit-effect bounds fixed under account upgrades and aggregates distinct names additively', () => {
    const state = battle(['mending-valve', 'clearwater-manifold', 'botanic-graft-covenant'], 'sprout');
    expect(kitHealingMultiplier(state.allies[0])).toBe(1.28);
    const upgraded = createBattle(1729, ['sprout'], { sprout: { level: 50, evolution: 4 } },
      { sprout: slots('mending-valve', 'clearwater-manifold', 'botanic-graft-covenant') }, [],
      { 'mending-valve': 5, 'clearwater-manifold': 5, 'botanic-graft-covenant': 5 });
    expect(kitHealingMultiplier(upgraded.allies[0])).toBe(1.28);
    expect(upgraded.allies[0].stats.health).toBeGreaterThan(state.allies[0].stats.health);
  });

  it('caps stacked outgoing kit bonuses at75%% without changing each target status or engine RNG', () => {
    const state = battle(['infernic-pyre-census', 'sootwake-crucible', 'ruinselect-prism', 'tidebound-reflector', 'flare-focusing-iris']);
    state.allies[0].shield = 1;
    state.enemies.forEach((enemy) => { enemy.burn = { damage: 1, turns: 2 }; enemy.weakened = 2; });
    const actor = state.allies[0];
    const result = use(state, 'ultimate');
    expect(hit(result)).toBe(damageAmount(actor.stats.damage, actor.kit!.abilities.ultimate.strength.damageMultiplier! * 1.75,
      0, false, actor.stats.critMultiplier));
  });

  it('shows base-versus-equipped rules in Character and battle reference helpers only when actually equipped', () => {
    expect(kitConduitRules()).toBe('');
    expect(kitConduitRules(slots('vigil-core'))).toBe('');
    const rules = kitConduitRules(slots('pulse-trigger-pawl'));
    expect(rules).toContain('Each legal Normal Attack gains 1 additional Gauge');
    expect(rules).toContain('authored base kit');
    const account = { ...emptyAccount(), characters: { ember: { level: 0, evolution: 1 } },
      conduits: { 'pulse-trigger-pawl': 1 }, conduitEquipment: { ember: slots('pulse-trigger-pawl') } };
    expect(characterDetail(getStarter('ember'), 'overview', account)).toContain(rules);
    expect(characterDetail(getStarter('ember'), 'upgrade-4', account)).toContain(rules);
  });

  it('enhances retained captured skills without creating unavailable slots or new healing/Burn', () => {
    const copy = createCreatureCopy('infusion:heavens:0');
    const state = createBattle(1729, [copy.instanceId], {}, { [copy.instanceId]: slots('firstlight-cam', 'mending-valve', 'cinder-metering-nozzle') }, [copy]);
    const actor = state.allies[0];
    actor.stats.crit = 0;
    actor.shatter = 100;
    state.enemies.forEach((enemy) => { enemy.hp = 1e8; enemy.stats.defense = 0; });
    expect(actor.captured?.creatureId).toBe(copy.creatureId);
    const result = use(state, 'skill1');
    expect(hit(result)).toBe(damageAmount(actor.stats.damage, actor.kit!.abilities.skill1.strength.damageMultiplier! * 1.08,
      0, false, actor.stats.critMultiplier));
    expect(result.events.some((event) => event.kind === 'heal')).toBe(false);
    expect(result.state.enemies[0].burn.turns).toBe(0);
    actor.kit!.unavailableActions = ['skill2'];
    expect(() => use(state, 'skill2')).toThrow();
    expect(actor.kit!.unavailableActions).toEqual(['skill2']);
  });

  it('rejects insufficient Gauge or cooldown actions without consuming pending charges or mutating input', () => {
    const state = battle(['botanic-graft-covenant'], 'sprout');
    state.allies[0].conduitCharges = { graftCovenant: true };
    state.allies[0].shatter = 0;
    const raw = structuredClone(state);
    expect(() => use(state, 'skill1')).toThrow('Gauge');
    expect(state).toEqual(raw);
    state.allies[0].shatter = 100;
    state.allies[0].readyRound.skill1 = 3;
    const unavailable = structuredClone(state);
    expect(() => use(state, 'skill1')).toThrow('Ready');
    expect(state).toEqual(unavailable);
  });

  it('preserves gear and pending charges in cloned actions, resets new transient charges on Continue, and supports captured kits', () => {
    const saved = storage();
    const copy = createCreatureCopy('infusion:heavens:3');
    saveAccount(saved, { ...emptyAccount(), capturedCharacters: [copy], conduits: { 'clearwater-manifold': 1 },
      characters: { ember: { level: 45, evolution: 2 } }, squad: [copy.instanceId] });
    const equipped = equipConduit(saved, copy.instanceId, 0, 'clearwater-manifold');
    expect(resolveCapturedFighter(copy, equipped.conduitEquipment?.[copy.instanceId]).stats.health)
      .toBeGreaterThan(resolveCapturedFighter(copy).stats.health);
    expect(() => validateConduitElement(slots('botanic-graft-covenant'), 'oceanic')).toThrow('requires');
    const stage = createDungeonBattle('botanic', 1, 1729, 'sprout', { level: 50, evolution: 4 },
      ['sprout'], { sprout: { level: 50, evolution: 4 } }, { sprout: slots('botanic-graft-covenant') });
    stage.phase = 'cleared';
    stage.allies[0].shatter = 37;
    stage.allies[0].conduitCharges = { graftCovenant: true, kitCooldownRound: 1 };
    const continued = nextStage(stage, { sprout: { level: 50, evolution: 4 } }).state;
    expect(continued.allies[0].conduits).toEqual(stage.allies[0].conduits);
    expect(continued.allies[0].shatter).toBe(37);
    expect(continued.allies[0].conduitCharges?.graftCovenant).toBeUndefined();
    const adventure = battle(['botanic-graft-covenant'], 'sprout');
    adventure.phase = 'cleared';
    adventure.allies[0].conduitCharges = { graftCovenant: true, kitCooldownRound: 1 };
    expect(nextWave(adventure).state.allies[0].conduitCharges?.graftCovenant).toBeUndefined();
  });
});
