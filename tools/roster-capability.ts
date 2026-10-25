import { actionIds, resolveFighter, type ActionId } from '../src/content/combat';
import { starters, getStarter, type StarterId } from '../src/content/starters';
import { characterLevelCap, characterLevelCost, characterEvolutionCost, type CharacterProgress } from '../src/content/progression';
import { conduits, getConduit, conduitUpgradeCost, validateConduitElement, validateConduitSlots, type ConduitId, type ConduitSlots } from '../src/content/conduits';
import { masterConduits, type MasterConduitId } from '../src/content/master-conduits';
import { act, createBattle, actionUnavailable, withMasterLoadouts, type BattleState, type BattleEvent } from '../src/game/battle';
import { nativeBurnPhase, nativePhaseEnd, nativeTurnStart } from '../src/game/native-kits';
import { conduitTurnStart, refreshConduitStats, expireNativeShields, effectiveDefense, conduitIncoming } from '../src/game/conduit-runtime';
import { settleCalamiticDebt } from '../src/game/calamitic-conduits';
import { benchmarkPriorities, benchmarkTarget } from '../src/game/native-benchmark-pilot';
import { loadout, progressAt } from './battle-survey';
import { standardBannerPool } from '../src/content/standard-banner';
import { roseBannerPool } from '../src/content/rose-banner';
import { nativeIdentities } from '../src/content/native-identities';

export const auditLevels = [0, 20, 40, 60, 80, 100, 105] as const;
export const auditProfiles = ['floor', 'unlucky', 'planned', 'farmed', 'lucky', 'ceiling'] as const;
export type AuditProfile = typeof auditProfiles[number];
export const auditSeeds = [1, 1729, 104729];
export const auditRounds = 18;
export type AuditGear = ReturnType<typeof loadout>;
export interface Capability {
  damage: number; healing: number; shields: number; peakShield: number;
  opening: number; bestRound: number; sustained: number;
  actions: number; normal: number; skills: number; flares: number;
  contributions: Record<string, { damage: number; healing: number; shields: number }>;
  hp: number; defense: number; exhausted: boolean;
}
export interface AuditRow extends Capability {
  level: number; profile: AuditProfile; roster: StarterId[]; seed: number;
  mode: 'output' | 'support'; gear: AuditGear;
}

export function maximumProgress(level: number): CharacterProgress {
  const progress = progressAt(level);
  if (progress.evolution < 6 && characterLevelCap(progress.evolution) === level) progress.evolution++;
  return progress;
}

export function auditGear(roster: readonly StarterId[], profile: AuditProfile): AuditGear {
  const build = profile === 'floor' ? 'bare' : profile === 'unlucky' || profile === 'planned' ? 'common0'
    : profile === 'farmed' ? 'mixed0' : 'master5';
  const gear = loadout(roster, build);
  if (profile === 'lucky') for (const id of Object.keys(gear.upgrades) as ConduitId[]) gear.upgrades[id] = 0;
  return gear;
}

export function validateAuditGear(roster: readonly StarterId[], gear: AuditGear): void {
  if (Object.values(gear.equipment).some(slots => slots?.some(id => id && getConduit(id).rarity === 'Calamitic')))
    throw new Error('Canonical capability benchmarks exclude Calamitic Conduits.');
  for (const id of roster) {
    validateConduitElement(validateConduitSlots(gear.equipment[id]), getStarter(id).elementId);
    const master = gear.masters[id];
    if (master && !masterConduits.some(entry => entry.id === master && entry.character === id))
      throw new Error(`Invalid audit Master for ${id}.`);
  }
}

export function auditState(roster: readonly StarterId[], level: number, profile: AuditProfile, seed: number, gear = auditGear(roster, profile)): BattleState {
  if (!roster.length || roster.length > 3 || new Set(roster).size !== roster.length) throw new Error('Audit needs one to three distinct bearers.');
  validateAuditGear(roster, gear);
  const progress = profile === 'ceiling' ? maximumProgress(level) : progressAt(level);
  const state = withMasterLoadouts(createBattle(seed, roster, Object.fromEntries(roster.map(id => [id, progress])),
    gear.equipment, [], gear.upgrades), gear.masters);
  const dummy = structuredClone(state.enemies[0]);
  dummy.id = 'measuring-target';
  dummy.definitionId = 'measuring-target';
  dummy.name = 'Neutral measuring target';
  dummy.stats = { ...dummy.stats, health: 1e12, damage: 0, defense: 0, crit: 0 };
  dummy.hp = dummy.stats.health;
  dummy.shield = 0;
  dummy.kit = null;
  dummy.enemySkills = [];
  delete dummy.creatureId;
  delete dummy.boss;
  state.enemies = [dummy];
  if (state.allies.some(unit => !unit.kit?.nativeIdentity || unit.kit.passive.healFraction !== 0))
    throw new Error('Audit phase adapter only supports current native-identity kits.');
  return state;
}

// Advance real clocks/hooks without an enemy action, incoming Gauge, counters or loot.
export function auditBoundary(state: BattleState): BattleEvent[] {
  const events: BattleEvent[] = [];
  settleCalamiticDebt(state, events);
  for (const target of state.enemies) {
    nativeBurnPhase(state, target, events);
    if (target.burn.origin === 'conduit' && target.burn.turns > 0)
      throw new Error('Audit needs a production conduit-Burn phase adapter for this loadout.');
    if (target.weakened > 0 && --target.weakened === 0) {
      target.weakenFraction = 0;
      delete target.weakenSourceId;
      delete target.weakenOrigin;
    }
  }
  nativePhaseEnd(state, events);
  expireNativeShields(state, events);
  state.round++;
  for (const ally of state.allies) {
    ally.spent = false;
    if (ally.attackBoost && ally.attackBoost.throughRound < state.round) delete ally.attackBoost;
  }
  conduitTurnStart(state, events);
  nativeTurnStart(state, events);
  refreshConduitStats(state);
  return events;
}

export function measureCapability(initial: BattleState, profile: AuditProfile, mode: AuditRow['mode'] = 'output', rounds = auditRounds): Capability {
  let state = structuredClone(initial);
  const contributions = Object.fromEntries(state.allies.map(unit => [unit.id, { damage: 0, healing: 0, shields: 0 }]));
  let damage = 0, healing = 0, shields = 0, opening = 0, bestRound = 0, lateDamage = 0;
  let actions = 0, normal = 0, skills = 0, flares = 0, peakShield = 0;
  const collect = (events: BattleEvent[]) => {
    for (const event of events) {
      const source = contributions[event.source];
      if (!source) continue;
      if (event.kind === 'damage' && event.target === 'measuring-target') { damage += event.amount; source.damage += event.amount; }
      if (event.kind === 'heal' && contributions[event.target]) { healing += event.amount; source.healing += event.amount; }
      if (event.kind === 'shield' && contributions[event.target]) { shields += event.amount; source.shields += event.amount; }
    }
    peakShield = Math.max(peakShield, ...state.allies.map(unit => unit.shield));
  };
  const normalOnly = profile === 'floor' || profile === 'unlucky';
  for (let round = 0; round < rounds; round++) {
    if (mode === 'support') {
      // Fixed laboratory headroom, not damage suffered or a survival claim.
      for (const ally of state.allies) if (ally.hp > 0) ally.hp = Math.min(ally.hp, ally.stats.health * .1);
    }
    const before = damage;
    let decisions = 0;
    for (;;) {
      const ready = state.allies.filter(unit => unit.hp > 0 && actionIds.some(action =>
        !actionUnavailable(state, unit, action, benchmarkTarget(state, unit, action))));
      const actor = ready.find(unit => unit.definitionId === 'disciple') ??
        (mode === 'output' ? ready.find(unit => unit.definitionId === 'bliss') : undefined) ??
        ready.find(unit => unit.definitionId !== 'bliss' && (unit.definitionId !== 'rosetta' || !unit.native?.quarry)) ?? ready[0];
      if (!actor) break;
      const supportPriority: Partial<Record<StarterId, ActionId[]>> = {
        tide: ['ultimate', 'skill2', 'light'], sprout: ['ultimate', 'skill2', 'light'],
        disciple: ['ultimate', 'skill2', 'light'], bruno: ['ultimate', 'skill2', 'light'],
      };
      const priorities: ActionId[] = normalOnly ? ['light'] : [
        ...(mode === 'support' ? supportPriority[actor.definitionId as StarterId] ?? benchmarkPriorities(state, actor)
          : benchmarkPriorities(state, actor)), ...actionIds];
      const choice = priorities.map(action => ({ action, target: benchmarkTarget(state, actor, action) }))
        .find(({ action, target }) => !actionUnavailable(state, actor, action, target));
      if (!choice) break;
      if (++decisions > 30) throw new Error('Audit action cycle exceeded bounded per-round decisions.');
      const result = act(state, actor.id, choice.action, choice.target);
      state = result.state;
      collect(result.events);
      actions++;
      if (choice.action === 'light') normal++;
      else if (choice.action === 'ultimate') flares++;
      else skills++;
    }
    if (mode === 'support') for (const ally of state.allies)
      if (ally.hp > 0) ally.hp = Math.min(ally.hp, ally.stats.health * .1);
    collect(auditBoundary(state));
    const dealt = damage - before;
    if (round === 0) opening = dealt;
    bestRound = Math.max(bestRound, dealt);
    if (round >= Math.floor(rounds / 2)) lateDamage += dealt;
  }
  const result = { damage, healing, shields, peakShield, opening, bestRound,
    sustained: lateDamage / (rounds - Math.floor(rounds / 2)),
    actions, normal, skills, flares, contributions,
    hp: initial.allies.reduce((sum, unit) => sum + unit.stats.health, 0),
    defense: initial.allies.reduce((sum, unit) => sum + effectiveDefense(initial, unit), 0),
    exhausted: state.allies.some(unit => unit.hp <= 0) };
  if (Object.values(result).some(value => typeof value === 'number' && !Number.isFinite(value)))
    throw new Error('Nonfinite capability result.');
  return result;
}

export function rosterCombinations(): StarterId[][] {
  const ids = starters.map(unit => unit.id);
  const teams: StarterId[][] = [];
  for (let i = 0; i < ids.length; i++) {
    teams.push([ids[i]]);
    for (let j = i + 1; j < ids.length; j++) {
      teams.push([ids[i], ids[j]]);
      for (let k = j + 1; k < ids.length; k++) teams.push([ids[i], ids[j], ids[k]]);
    }
  }
  return teams;
}

export function resourceCost(id: StarterId, level: number, maximum = false) {
  let progress: CharacterProgress = { level: 0, evolution: 1 };
  const target = maximum ? maximumProgress(level) : progressAt(level);
  let fractalis = 0;
  const materials: Record<string, number> = {};
  const add = (cost: ReturnType<typeof characterLevelCost>) => {
    fractalis += cost.fractalis;
    for (const [key, amount] of Object.entries(cost.materials)) materials[key] = (materials[key] ?? 0) + amount;
  };
  while (progress.level < level || progress.evolution < target.evolution) {
    if (progress.level === characterLevelCap(progress.evolution)) {
      add(characterEvolutionCost(id, progress)); progress = { ...progress, evolution: progress.evolution + 1 };
    } else {
      add(characterLevelCost(id, progress)); progress = { ...progress, level: progress.level + 1 };
    }
  }
  return { progress, fractalis, materials };
}

export function statSnapshot(id: StarterId, level: number, profile: AuditProfile, gear = auditGear([id], profile)) {
  return auditState([id], level, profile, 1, gear).allies[0].stats;
}

export function tankProbe(id: StarterId, level: number, profile: AuditProfile, gear: AuditGear) {
  const initial = auditState([id], level, profile, 1, gear);
  initial.allies[0].shatter = initial.allies[0].stats.shatterCapacity;
  const candidates: { state: BattleState; action: ActionId | 'none' }[] = [{ state: initial, action: 'none' }];
  for (const action of actionIds) {
    if (actionUnavailable(initial, initial.allies[0], action, benchmarkTarget(initial, initial.allies[0], action))) continue;
    candidates.push({ state: act(initial, id, action, benchmarkTarget(initial, initial.allies[0], action)).state, action });
  }
  return candidates.map(({ state, action }) => {
    const hp = state.allies[0].stats.health;
    const survives = (amount: number) => {
      const copy = structuredClone(state);
      // First random roll is 0.7769: do not credit a lucky Stasis save.
      copy.seed = 12345;
      conduitIncoming(copy, copy.enemies[0], copy.allies[0], amount, false, true, []);
      return copy.allies[0].hp > 0;
    };
    let low = 0, high = hp * 100;
    const censored = survives(high);
    if (censored) low = high;
    else for (let i = 0; i < 28; i++) {
      const middle = (low + high) / 2;
      if (survives(middle)) low = middle; else high = middle;
    }
    return { hp, defense: effectiveDefense(state, state.allies[0]), shield: state.allies[0].shield,
      packet: low, censored, action };
  }).sort((a, b) => b.packet - a.packet)[0];
}

export function screenMasters(id: StarterId, level: number, profile: 'lucky' | 'ceiling') {
  const variants = profile === 'ceiling' ? ['standard', 'glassroot', 'hybrid'] : ['standard'];
  const results = variants.flatMap(variant => masterConduits.filter(entry => entry.character === id).map(master => {
    const gear = auditGear([id], profile);
    if (variant === 'glassroot') gear.equipment[id] = ['immortal-vessel', 'horizon-heartcase', 'glassroot-gimbal',
      'stasis-reliquary', ...gear.equipment[id]!.slice(4)];
    if (variant === 'hybrid') gear.equipment[id] = ['citadel-spine', 'immortal-vessel', 'glassroot-gimbal',
      'stasis-reliquary', ...gear.equipment[id]!.slice(4)];
    for (const piece of gear.equipment[id]!) if (piece) gear.upgrades[piece] = profile === 'ceiling' ? 5 : 0;
    gear.masters[id] = master.id;
    validateAuditGear([id], gear);
    const output = auditSeeds.map(seed => measureCapability(auditState([id], level, profile, seed, gear), profile));
    const support = measureCapability(auditState([id], level, profile, 1729, gear), profile, 'support');
    const damage = output.reduce((sum, result) => sum + result.sustained, 0) / output.length;
    return { gear, variant, master: master.id, damage, healing: support.healing / auditRounds,
      shields: support.shields / auditRounds, hp: output[0].hp };
  }));
  results.sort((a, b) => b.damage - a.damage);
  return { best: results[0], candidates: results };
}

export const auditRoster = starters.map(unit => ({ id: unit.id, name: unit.name, element: unit.elementId,
  role: nativeIdentities[unit.id].role, loop: nativeIdentities[unit.id].playLoop,
  naturalPullChance: [...standardBannerPool(), ...roseBannerPool()].find(entry => entry.kind === 'character' && entry.id === unit.id)?.chance ?? 0,
  stars: unit.stars, native: resolveFighter(unit.id).nativeIdentity }));
export const auditPools = Object.fromEntries(['Rare', 'Legendary', 'Omnic'].map(rarity =>
  [rarity, conduits.filter(unit => unit.rarity === rarity).length]));
export function gearNames(slots: ConduitSlots): string[] { return slots.flatMap(id => id ? [getConduit(id).name] : []); }

export function gearBudget(gear: AuditGear) {
  const unique = [...new Set(Object.values(gear.equipment).flatMap(slots => slots?.flatMap(id => id ? [id] : []) ?? []))];
  let components = 0, prismatica = 0;
  const rarities: Record<string, number> = {};
  for (const id of unique) {
    const conduit = getConduit(id);
    rarities[conduit.rarity] = (rarities[conduit.rarity] ?? 0) + 1;
    prismatica += conduit.price ?? 0;
    for (let level = 0; level < (gear.upgrades[id] ?? 0); level++) components += conduitUpgradeCost(conduit, level);
  }
  return { prismatica, components, calamiticTokens: (rarities.Calamitic ?? 0) * 100,
    rarities, masters: Object.values(gear.masters).filter(Boolean).length };
}

export function chargedBurst(id: StarterId, level: number, profile: AuditProfile, gear: AuditGear) {
  return actionIds.map(action => {
    const values = auditSeeds.map(seed => {
      const state = auditState([id], level, profile, seed, gear);
      state.allies[0].shatter = state.allies[0].stats.shatterCapacity;
      const target = benchmarkTarget(state, state.allies[0], action);
      if (actionUnavailable(state, state.allies[0], action, target)) return 0;
      return act(state, id, action, target).events.filter(event => event.kind === 'damage' && event.target === 'measuring-target')
        .reduce((sum, event) => sum + event.amount, 0);
    });
    return { action, mean: values.reduce((a, b) => a + b, 0) / values.length, maximum: Math.max(...values) };
  }).sort((a, b) => b.mean - a.mean)[0];
}
