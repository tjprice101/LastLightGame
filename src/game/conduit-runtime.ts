import { shatterGauge, type ActionId, type Stats } from '../content/combat';
import { omnicSquadStats, omnicStatBonuses, type OmnicStat, type OmnicStatBonuses } from '../content/omnic-conduit-stats';
import type { ConduitId } from '../content/conduits';
import { conduitRedesign, redesignStep, redesignValue } from '../content/conduit-redesign';
import { phaseZeroGaugeOffer, phaseZeroPercentageGaugeOffer, phaseZeroSkillCost, phaseZeroStatBase, phaseZeroUpgradeMagnitude } from '../content/phase-zero-conduit-stats';
import { phaseZeroStatsReady } from '../content/phase-zero-stats';
import { stasisChancePercent } from '../content/phase-zero-conduit-upgrades';
import { damageOverTimeLevelMultiplier } from '../content/native-balance';
import type { MasterConduitId } from '../content/master-conduits';
import type { BattleEvent, BattleState, Combatant } from './battle';
import { roll } from './battle';
import { buffSnapshot } from './battle-buffs';
import { debuffSnapshot } from './battle-debuffs';
import { pilotAuthoredShieldAbsorbed, pilotEffectiveHeal } from './kit-pilots';
import { hasNativeIdentity, nativeAbsorbedHit, nativeDirectHpLoss, nativeIncomingMultiplier,
  nativeRouteDamage, nativeSupportMultiplier } from './native-kits';
import { prepareCalamiticAction, afterCalamiticAction, calamiticSiegeBonus, deferCalamiticDamage,
  bankCalamiticDamage, calamiticSkillDefenseIgnore, calamiticSkillPowerBonus, calamiticSkillEfficiencyBonus } from './calamitic-conduits';

export const conduitRulesVersion = phaseZeroStatsReady ? 10 : 4;
export interface ConduitShieldLayer {
  amount: number;
  owner: string;
  native: boolean;
  plate?: boolean;
  expiresAfterPhase?: number;
  firstReduction?: number;
  healBonus?: number;
  conduit?: ConduitId | MasterConduitId;
}
export interface ConduitRuntimeState {
  statBase?: Stats;
  numbers: Record<string, number>;
  owners: Record<string, string>;
  layers?: ConduitShieldLayer[];
}
export interface ConduitHit {
  target: string; damage: number; totalDamage?: number; critical: boolean; criticalMultiplier: number; overkill?: number;
}
export interface ConduitActivation {
  action: ActionId;
  paid: number;
  bonus: number;
  criticalBonus: number;
  guaranteed: boolean;
  forbidden: boolean;
  all: boolean;
  nativeAll: boolean;
  scale: number;
  skillPower: number;
  debuffPowerBonus?: number;
  supportPowerBonus?: number;
  skillDuration: number;
  criticalDamageBonus: number;
  impacts: number;
  hits: ConduitHit[];
  overheal: number;
  healed: number;
  healRecipients: string[];
  spent: Record<string, number>;
  healExtra: number;
  shieldBurn: number;
  burnPaid: boolean;
  freeAction: boolean;
  eclipseTargets: string[];
  foldTarget?: string;
  emberBonusOwner?: string;
  rosettaTarget?: string;
  shieldRecipients: string[];
  nativeHpDamage: number;
  nativeShieldDamage: number;
}

export function gear(unit: Combatant): ConduitRuntimeState {
  return unit.conduitRuntime ??= { numbers: {}, owners: {} };
}
export function equipped(unit: Combatant, id: string): boolean {
  return unit.conduits?.some(slot => slot === id) === true || (!unit.captured && unit.masterConduit === id);
}
export function value(state: BattleState, unit: Combatant, id: ConduitId, base: number, maximum: number): number {
  const range = conduitRedesign[id]?.ranges.find(range =>
    (Math.abs(range.base - base) < 1e-9 && Math.abs(range.maximum - maximum) < 1e-9) ||
    (Math.abs(range.base / 100 - base) < 1e-9 && Math.abs(range.maximum / 100 - maximum) < 1e-9));
  if (!range) throw new Error(`Unregistered coefficient for ${id} on ${unit.id}: ${base} -> ${maximum}.`);
  const scale = Math.abs(range.base - base) < 1e-9 ? 1 : .01;
  return redesignValue(state.conduitUpgrades?.[id] ?? 0, range.base, range.maximum) * scale;
}
function step(state: BattleState, id: ConduitId, base: number, maximum: number): number {
  const range = conduitRedesign[id]?.ranges.find(range => range.step && range.base === base && range.maximum === maximum);
  if (!range) throw new Error(`Unregistered stepped coefficient for ${id}: ${base} -> ${maximum}.`);
  return redesignStep(state.conduitUpgrades?.[id] ?? 0, range.base, range.maximum);
}
function alive(state: BattleState): Combatant[] { return state.allies.filter(unit => unit.hp > 0); }
function magnitude(state: BattleState, id: ConduitId, base: number): number {
  return phaseZeroUpgradeMagnitude(base, state.conduitUpgrades?.[id] ?? 0);
}
function diverseSquad(state: BattleState): boolean {
  return new Set(state.allies.map(ally => ally.element)).size === state.allies.length;
}
function heartcaseUnavailable(state: BattleState, unit: Combatant): boolean {
  return unit.kit?.unavailableActions?.includes('ultimate') === true ||
    (!equipped(unit, 'calamitic-causality-funeral-engine') &&
      (unit.recoverThrough >= state.round || (unit.readyRound.ultimate ?? 0) > state.round)) ||
    unit.shatter < conduitActionCost(unit, 'ultimate', state, shatterGauge.costs.ultimate);
}
export function refreshConduitStats(state: BattleState, initial = false): void {
  if (!phaseZeroStatsReady) return;
  const dynamic = state.allies.some(unit => unit.masterConduit ||
    equipped(unit, 'horizon-heartcase') || equipped(unit, 'clearwater-manifold') ||
    equipped(unit, 'ruinselect-prism') || equipped(unit, 'emberlife-kiln') ||
    Object.keys(omnicSquadStats).some(id => equipped(unit, id)));
  if (!dynamic) return;
  for (const unit of state.allies) {
    const memory = gear(unit);
    const base = memory.statBase ??= { ...unit.stats };
    const pool: Partial<Record<OmnicStat, number>> = {};
    const add = (bonuses: OmnicStatBonuses, scale = 1) => {
      for (const [stat, amount] of Object.entries(bonuses) as [OmnicStat, number][])
        pool[stat] = (pool[stat] ?? 0) + amount * scale;
    };
    if (unit.masterConduit) add(omnicStatBonuses(unit.masterConduit));
    for (const source of unit.hp > 0 ? alive(state) : []) {
      for (const id of Object.keys(omnicSquadStats)) if (equipped(source, id))
        add(omnicStatBonuses(id, true), id.startsWith('master-') ? 1 :
          1 + (state.conduitUpgrades?.[id as ConduitId] ?? 0) * .1);
      if (equipped(source, 'emberlife-kiln') && state.enemies.some(enemy =>
        enemy.hp > 0 && enemy.burn.turns > 0))
        add({ damage: magnitude(state, 'emberlife-kiln', 1.5) });
    }
    if (equipped(unit, 'clearwater-manifold'))
      add({ skillPower: magnitude(state, 'clearwater-manifold', .35) *
        state.allies.filter(ally => ally.id !== unit.id && ally.element === 'oceanic').length });
    if (equipped(unit, 'ruinselect-prism')) {
      const dead = state.allies.filter(ally => ally.hp <= 0).length;
      add({ skillPower: magnitude(state, 'ruinselect-prism', .55) * dead,
        defense: magnitude(state, 'ruinselect-prism', .2) * dead });
    }
    unit.stats.skillEfficiency = Math.min(.5, (base.skillEfficiency ?? 0) + (pool.skillEfficiency ?? 0));
    if (equipped(unit, 'horizon-heartcase') && heartcaseUnavailable(state, unit))
      add({ health: magnitude(state, 'horizon-heartcase', .2) });
    for (const stat of Object.keys(pool) as OmnicStat[]) {
      if (['crit', 'skillPower', 'skillEfficiency', 'gaugeGain'].includes(stat))
        unit.stats[stat] = (base[stat] ?? (stat === 'skillPower' || stat === 'gaugeGain' ? 1 : 0)) + (pool[stat] ?? 0);
      else {
        const raw = stat === 'health' || stat === 'defense' || stat === 'damage' || stat === 'critMultiplier' || stat === 'shatterCapacity'
          ? phaseZeroStatBase(base[stat], stat, unit.conduits, state.conduitUpgrades) : base[stat];
        unit.stats[stat] = (base[stat] ?? 0) + (raw ?? 0) * (pool[stat] ?? 0);
      }
    }
    for (const stat of ['health', 'defense', 'damage', 'crit', 'critMultiplier', 'shatterCapacity',
      'skillPower', 'skillEfficiency', 'gaugeGain'] as const)
      if (!(stat in pool)) unit.stats[stat] = base[stat] ??
        (stat === 'skillPower' || stat === 'gaugeGain' ? 1 : 0);
    unit.stats.skillEfficiency = Math.min(.5, unit.stats.skillEfficiency ?? 0);
    if (equipped(unit, 'glassroot-gimbal')) {
      unit.stats.skillPower = (unit.stats.skillPower ?? 1) + (Math.floor(unit.stats.health / 450) -
        Math.floor(base.health / 450)) * magnitude(state, 'glassroot-gimbal', .05);
    }
    unit.shatter = Math.min(unit.shatter, unit.stats.shatterCapacity);
    unit.hp = initial && unit.hp > 0 ? unit.stats.health : Math.min(unit.hp, unit.stats.health);
  }
}
export function grantToken(state: BattleState, target: Combatant, key: string, amount: number, owner?: Combatant): void {
  const memory = gear(target);
  memory.numbers[key] = amount;
  memory.numbers[`${key}Through`] = state.round + 1;
  if (owner) memory.owners[key] = owner.id;
}
function token(state: BattleState, target: Combatant, key: string, consume = false): number {
  const memory = target.conduitRuntime;
  if (!memory) return 0;
  const amount = (memory.numbers[`${key}Through`] ?? 0) >= state.round ? memory.numbers[key] ?? 0 : 0;
  if (consume) {
    delete memory.numbers[key];
    delete memory.numbers[`${key}Through`];
  }
  return amount;
}
export function conduitActionTraits(state: BattleState, actor: Combatant, action: ActionId): {
  damage: boolean; healing: boolean; shield: boolean; debuff: boolean;
} {
  if (action === 'light') return { damage: true, healing: false, shield: false, debuff: false };
  const strength = actor.kit?.abilities[action].strength;
  if (!hasNativeIdentity(actor)) return {
    damage: strength?.damageMultiplier !== undefined,
    healing: strength?.healing !== undefined,
    shield: strength?.shield !== undefined,
    debuff: strength?.weakenFraction !== undefined || strength?.burnMultiplier !== undefined,
  };
  const others = alive(state).filter(ally => ally.id !== actor.id);
  const closing = others.length > 0 && others.every(ally => ally.spent);
  const id = actor.definitionId;
  return {
    damage: id === 'atmoso' || id === 'elise' || id === 'bliss' || id === 'ember' || id === 'crinso' ||
      id === 'rosetta' || id === 'vaelor' || id === 'razor' && action !== 'skill2' ||
      id === 'aurora' && action === 'skill2' || id === 'thornia' && action !== 'skill1' || id === 'orvella' && action !== 'skill2' ||
      id === 'nerithe' ||
      (id === 'tide' || id === 'sprout' || id === 'bruno') && action === 'skill1',
    healing: id === 'sprout' || id === 'bliss' && closing && action !== 'skill2' ||
      id === 'rosetta' && action === 'ultimate' && (actor.native?.quarry?.contributors.length ?? 0) >= 2,
    shield: id === 'tide' && action !== 'skill1' || id === 'bruno' && action === 'ultimate' ||
      id === 'bliss' && action === 'skill2' && (closing || equipped(actor, 'master-bliss-1')),
    debuff: id === 'ember' && action !== 'skill2' || id === 'tide' && action === 'skill1' ||
      id === 'aurora' && action !== 'ultimate' || id === 'thornia' && action !== 'skill2',
  };
}
function injured(state: BattleState, owner: Combatant, other = false): Combatant | undefined {
  return alive(state).filter(unit => (!other || unit.id !== owner.id) && unit.hp < unit.stats.health)
    .sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0];
}
function lowestGauge(state: BattleState, owner: Combatant): Combatant | undefined {
  return alive(state).filter(unit => unit.id !== owner.id && unit.shatter < unit.stats.shatterCapacity)
    .sort((a, b) => a.shatter - b.shatter)[0];
}
function lowestGaugePercentage(state: BattleState, owner?: Combatant): Combatant | undefined {
  return alive(state).filter(unit => unit.id !== owner?.id)
    .sort((a, b) => a.shatter / a.stats.shatterCapacity - b.shatter / b.stats.shatterCapacity)[0];
}
function effectiveGaugeGain(state: BattleState, target: Combatant): number {
  refreshConduitStats(state);
  let bonus = 0;
  if (equipped(target, 'starvein-conductor') && diverseSquad(state))
    bonus += magnitude(state, 'starvein-conductor', .1);
  if ((target.conduitRuntime?.numbers.crosswindGaugeThrough ?? 0) >= state.round)
    bonus += target.conduitRuntime?.numbers.crosswindGaugeBonus ?? .3;
  if ((target.conduitRuntime?.numbers.gaugeGainThrough ?? 0) >= state.round)
    bonus += target.conduitRuntime?.numbers.gaugeGainBonus ?? 0;
  if (alive(state).some(owner => equipped(owner, 'master-bruno-2') &&
      owner.native?.cover?.throughPhase !== undefined &&
      owner.native.cover.throughPhase >= state.round &&
      owner.native.cover.targets.includes(target.id))) bonus += .25;
  return (target.stats.gaugeGain ?? 1) + bonus;
}
function grantCappedGaugePercent(state: BattleState, owner: Combatant, target: Combatant, fraction: number,
  cap: number, key: string, events: BattleEvent[]): void {
  const memory = gear(owner).numbers;
  const used = memory[key] ?? 0;
  const grant = Math.min(fraction, Math.max(0, cap - used));
  if (grant <= 0) return;
  memory[key] = used + grant;
  const gain = effectiveGaugeGain(state, target);
  const received = memory[`${key}:received`] ?? 0;
  const offer = Math.min(phaseZeroPercentageGaugeOffer(target.stats.shatterCapacity, grant, gain),
    Math.max(0, phaseZeroPercentageGaugeOffer(target.stats.shatterCapacity, cap, gain) - received));
  memory[`${key}:received`] = received + offer;
  generatedGauge(owner, target, offer, events, false, true, state);
}
function firstEnemyAttackTrigger(enemy: Combatant, key: string): boolean {
  const memory = enemy.native ??= {};
  const triggers = memory.conduitGaugeTriggers ??= [];
  if (triggers.includes(key)) return false;
  triggers.push(key);
  return true;
}
function healthiestEnemy(state: BattleState, excluded?: string): Combatant | undefined {
  return state.enemies.filter(unit => unit.hp > 0 && unit.id !== excluded).sort((a, b) => b.hp - a.hp)[0];
}
function emit(events: BattleEvent[], kind: BattleEvent['kind'], owner: Combatant, target: Combatant, amount: number, message: string, native = false): void {
  events.push({ kind, source: owner.id, target: target.id, amount, critical: false,
    origin: native ? 'native' : 'conduit', message,
    ...(target.side === 'ally' ? { buffs: buffSnapshot(target) } : { debuffs: debuffSnapshot(target) }),
    ...(kind === 'shield' || kind === 'damage' ? { shieldRemaining: target.shield } : {}) });
}
export function overhealShield(owner: Combatant, target: Combatant, excess: number, events: BattleEvent[]): number {
  const amount = Math.round(excess) - target.shield;
  if (amount <= 0 || target.hp <= 0) return 0;
  target.shield += amount;
  emit(events, 'shield', owner, target, amount, `${target.name}'s excess healing becomes a ${target.shield} Shield.`);
  return amount;
}
// Leviathan Ward Loom tags the Shield layers it grants; holders receive more healing from every source.
function healingReceived(target: Combatant, state?: BattleState): number {
  const shieldBonus = Math.max(0, ...layers(target).filter(layer => layer.amount > 0).map(layer => layer.healBonus ?? 0));
  return 1 + shieldBonus;
}
export function generatedHeal(owner: Combatant, target: Combatant | undefined, offer: number, events: BattleEvent[], state?: BattleState, cap = Infinity): number {
  if (!target || target.hp <= 0) return 0;
  const healing = Math.max(0, Math.min(cap, Math.round(offer * healingReceived(target, state))));
  const amount = Math.min(target.stats.health - target.hp, healing);
  if (!phaseZeroStatsReady) overhealShield(owner, target, healing - Math.max(0, amount), events);
  if (amount <= 0) return 0;
  target.hp += amount;
  emit(events, 'heal', owner, target, amount, `${owner.name}'s Conduit restores ${amount} HP to ${target.name}.`);
  return amount;
}
export function generatedGauge(owner: Combatant, target: Combatant | undefined, offer: number, events: BattleEvent[],
  native = false, gainApplied = false, state?: BattleState): number {
  if (!target || target.hp <= 0) return 0;
  if (phaseZeroStatsReady && !gainApplied) offer = phaseZeroGaugeOffer(offer,
    state ? effectiveGaugeGain(state, target) : target.stats.gaugeGain ?? 1);
  const amount = Math.min(target.stats.shatterCapacity - target.shatter, Math.max(0, offer));
  if (amount <= 0) return 0;
  target.shatter += amount;
  if (state) refreshConduitStats(state);
  emit(events, 'status', owner, target, amount, native ? `${target.name} gains ${amount} Elemental Gauge.`
    : `${owner.name}'s Conduit gives ${target.name} ${amount} Elemental Gauge.`, native);
  return amount;
}
export function generatedGaugePercent(owner: Combatant, target: Combatant | undefined, fraction: number, events: BattleEvent[],
  state?: BattleState): number {
  if (!target || target.hp <= 0 || !phaseZeroStatsReady) return 0;
  const offer = phaseZeroPercentageGaugeOffer(target.stats.shatterCapacity, fraction,
    state ? effectiveGaugeGain(state, target) : target.stats.gaugeGain ?? 1);
  return generatedGauge(owner, target, offer, events, false, true, state);
}
function layers(unit: Combatant): ConduitShieldLayer[] {
  const memory = gear(unit);
  const list = memory.layers ??= [];
  const recorded = list.reduce((sum, layer) => sum + layer.amount, 0);
  if (recorded < unit.shield) list.unshift({ amount: unit.shield - recorded,
    owner: unit.pilot?.authoredShieldSourceId ?? unit.id, native: !!unit.pilot?.authoredShieldSourceId });
  if (recorded > unit.shield) {
    let excess = recorded - unit.shield;
    for (const layer of list) { const spent = Math.min(layer.amount, excess); layer.amount -= spent; excess -= spent; }
  }
  return list;
}
export function generatedShield(owner: Combatant, target: Combatant | undefined, offer: number, events: BattleEvent[], additive = false, _cap = Infinity, plate = false): number {
  if (!target || target.hp <= 0) return 0;
  const list = layers(target);
  const amount = Math.max(0, Math.round(additive ? offer : offer - target.shield));
  if (amount <= 0) return 0;
  list.push({ amount, owner: owner.id, native: false, ...(plate ? { plate } : {}) });
  target.shield += amount;
  emit(events, 'shield', owner, target, amount, `${owner.name}'s Conduit shields ${target.name} for ${amount}.`);
  return amount;
}
export function timedConduitShield(state: BattleState, owner: Combatant, target: Combatant, offer: number,
  id: ConduitId | MasterConduitId, throughPhase: number, events: BattleEvent[], replace = false): void {
  const list = layers(target);
  if (replace) for (const layer of list) if (layer.conduit === id && layer.owner === owner.id) {
    target.shield -= layer.amount;
    layer.amount = 0;
  }
  const gained = generatedShield(owner, target, offer, events);
  if (gained > 0) {
    const layer = list[list.length - 1];
    layer.conduit = id;
    layer.expiresAfterPhase = throughPhase;
  }
}
export function expireNativeShields(state: BattleState, events: BattleEvent[]): void {
  for (const target of [...state.allies, ...state.enemies]) {
    const list = layers(target);
    const expiredByOwner = new Map<string, number>();
    for (const layer of list) {
      if ((!layer.native && !phaseZeroStatsReady) || layer.expiresAfterPhase === undefined || layer.expiresAfterPhase > state.round) continue;
      expiredByOwner.set(layer.owner, (expiredByOwner.get(layer.owner) ?? 0) + layer.amount);
      target.shield -= layer.amount;
      layer.amount = 0;
    }
    if (!expiredByOwner.size) continue;
    gear(target).layers = list.filter(layer => layer.amount > 0);
    for (const [id, amount] of expiredByOwner) {
      if (amount <= 0) continue;
      const owner = state.allies.find(ally => ally.id === id) ?? target;
      emit(events, 'status', owner, target, amount, `${target.name} loses ${Math.round(amount)} expired Shield.`, true);
    }
  }
}
function consumeShield(unit: Combatant, amount: number): { absorbed: number; native: Map<string, number>; broken: Set<string> } {
  const list = layers(unit);
  let remaining = amount;
  const native = new Map<string, number>();
  const before = new Map<string, number>();
  for (const layer of list) if (layer.native) before.set(layer.owner, (before.get(layer.owner) ?? 0) + layer.amount);
  for (const layer of [...list.filter(layer => !layer.plate), ...list.filter(layer => layer.plate)]) {
    const spent = Math.min(layer.amount, remaining);
    layer.amount -= spent; remaining -= spent; unit.shield -= spent;
    if (layer.native && spent > 0) native.set(layer.owner, (native.get(layer.owner) ?? 0) + spent);
    if (remaining <= 0) break;
  }
  const broken = new Set<string>();
  for (const [id, total] of before) if ((native.get(id) ?? 0) >= total && total > 0) broken.add(id);
  gear(unit).layers = list.filter(layer => layer.amount > 0);
  return { absorbed: amount - remaining, native, broken };
}
export function payShield(unit: Combatant, amount: number): number {
  return consumeShield(unit, Math.min(unit.shield, Math.max(0, amount))).absorbed;
}
export function generatedStrike(state: BattleState, owner: Combatant, target: Combatant | undefined, offer: number, events: BattleEvent[], mitigated = true): number {
  if (!target || target.hp <= 0 || offer <= 0) return 0;
  const damage = Math.max(1, Math.round(mitigated ? offer : offer * owner.stats.damage / Math.max(1, owner.stats.damage + effectiveDefense(state, target))));
  const absorbed = consumeShield(target, damage).absorbed;
  const loss = Math.min(target.hp, damage - absorbed);
  target.hp -= loss;
  emit(events, 'damage', owner, target, loss, `${owner.name}'s Conduit strikes ${target.name} for ${loss}.`);
  return loss;
}
export function initializeConduits(state: BattleState, initial = false): void {
  state.conduitRulesVersion = conduitRulesVersion;
  for (const unit of [...state.allies, ...state.enemies]) {
    gear(unit).numbers.entryDefense = unit.stats.defense;
    if (!phaseZeroStatsReady && unit.side === 'ally' && equipped(unit, 'fracture-reservoir')) {
      unit.shatter = Math.min(unit.stats.shatterCapacity, unit.shatter + value(state, unit, 'fracture-reservoir', 5, 10));
    }
    if (phaseZeroStatsReady && state.allies.some(unit => equipped(unit, 'breach-pendulum'))) {
      const reduction = magnitude(state, 'breach-pendulum', .1);
      for (const enemy of state.enemies) {
        if (gear(enemy).numbers.breachApplied) continue;
        enemy.stats.defense *= 1 - reduction;
        gear(enemy).numbers.breachApplied = 1;
      }
    }
    if (!phaseZeroStatsReady && unit.side === 'ally' && equipped(unit, 'twinpulse-bellows')) {
      unit.shatter = Math.min(unit.stats.shatterCapacity, unit.shatter + unit.stats.shatterCapacity * value(state, unit, 'twinpulse-bellows', .15, .35));
    }
  }
  refreshConduitStats(state, initial);
}
export function effectiveDefense(state: BattleState, unit: Combatant, excludeSquadAuras = false): number {
  if (phaseZeroStatsReady) refreshConduitStats(state);
  let defense = unit.stats.defense;
  const baseDefense = phaseZeroStatsReady
    ? phaseZeroStatBase(unit.conduitRuntime?.statBase?.defense ?? unit.stats.defense,
      'defense', unit.conduits, state.conduitUpgrades) : unit.stats.defense;
  const n = unit.conduitRuntime?.numbers ?? {};
  if (phaseZeroStatsReady && !excludeSquadAuras && unit.side === 'ally' && unit.hp > 0 &&
      alive(state).some(owner => equipped(owner, 'master-sprout-3') &&
        !!owner.native?.seeds?.[unit.id]?.empowered &&
        (owner.native.seeds[unit.id]?.dueRound ?? 0) >= state.round)) {
    defense += baseDefense * .25;
  }
  if (phaseZeroStatsReady && unit.side === 'ally' && unit.hp > 0 && unit.native?.cover &&
      unit.native.cover.throughPhase >= state.round &&
      equipped(unit, 'master-bruno-1')) defense += baseDefense * .4;
  if (phaseZeroStatsReady && equipped(unit, 'horizon-heartcase') && heartcaseUnavailable(state, unit))
    defense += baseDefense * magnitude(state, 'horizon-heartcase', .1);
  if (phaseZeroStatsReady && unit.side === 'ally') {
    for (const key of ['tensionDefense', 'graftDefense']) {
      if ((n[`${key}Through`] ?? 0) >= state.round) defense += baseDefense * (n[key] ?? 0);
    }
  }
  if (phaseZeroStatsReady && !excludeSquadAuras && unit.side === 'ally' && unit.hp > 0 && unit.hp < unit.stats.health * .75 &&
      state.allies.some(ally => ally.hp > 0 && ally.id !== unit.id && equipped(ally, 'citadel-spine'))) {
    defense += baseDefense * phaseZeroUpgradeMagnitude(.35,
      state.conduitUpgrades?.['citadel-spine'] ?? 0);
  }
  if (phaseZeroStatsReady && !excludeSquadAuras && unit.side === 'ally' && unit.hp > 0 &&
      alive(state).some(owner => equipped(owner, 'master-orvella-3') &&
        (owner.native?.foundation?.durability ?? 0) > 0 &&
        (owner.native?.foundation?.throughPhase ?? 0) >= state.round))
    defense += baseDefense * .25;
  if (!phaseZeroStatsReady && equipped(unit, 'master-orvella-3') && unit.hp > 0) {
    const foundation = unit.native?.foundation;
    const protectedByFoundation = foundation && foundation.durability > 0 && foundation.throughPhase >= state.round;
    defense += (n.entryDefense ?? defense) * .2 * alive(state).filter(ally => ally.shield > 0 || protectedByFoundation).length;
  }
  if (unit.side === 'enemy' && !phaseZeroStatsReady) {
    defense = Math.max(0, defense - (n.excavated ?? 0));
    if (phaseZeroStatsReady && (n.thorniaDefenseThrough ?? 0) >= state.round)
      defense = Math.max(0, defense - (n.entryDefense ?? unit.stats.defense) * .2);
    if (phaseZeroStatsReady && (n.brunoDefenseThrough ?? 0) >= state.round)
      defense *= .75;
  } else if (unit.hp > 0 && !excludeSquadAuras) {
    const keepers = alive(state).filter(ally => ally.id !== unit.id && equipped(ally, 'tectonic-faultkeeper-loom'));
    if (phaseZeroStatsReady) {
      defense += keepers.reduce((total, keeper) => total + effectiveDefense(state, keeper, true) *
        phaseZeroUpgradeMagnitude(.25, state.conduitUpgrades?.['tectonic-faultkeeper-loom'] ?? 0), 0);
    } else for (const keeper of keepers) {
      defense += keeper.stats.defense * value(state, keeper, 'tectonic-faultkeeper-loom', .15, .3);
    }
  }
  return defense;
}
export function nativeTargetDefense(state: BattleState, target: Combatant): number {
  if (phaseZeroStatsReady && target.side === 'enemy') {
    const n = target.conduitRuntime?.numbers ?? {};
    let reduction = 0;
    if (alive(state).some(owner => equipped(owner, 'master-aurora-1') &&
        (owner.native?.seals?.[target.id]?.throughPhase ?? 0) >= state.round)) reduction += .25;
    if ((n.thorniaDefenseThrough ?? 0) >= state.round) reduction += .2;
    if ((n.brunoDefenseThrough ?? 0) >= state.round) reduction += .25;
    const lodged = Math.max(0, ...alive(state).filter(owner => equipped(owner, 'master-elise-1'))
      .map(owner => owner.native?.blades?.filter(id => id === target.id).length ?? 0));
    reduction += Math.min(2, lodged) * .15;
    return target.stats.defense * (1 - Math.min(.5, reduction));
  }
  const exposed = alive(state).some(owner => equipped(owner, 'master-aurora-1') && nativeControl(state, owner, target));
  let multiplier = exposed ? (phaseZeroStatsReady ? .75 : .85) : 1;
  if (phaseZeroStatsReady && target.side === 'enemy') {
    const lodged = alive(state).filter(owner => equipped(owner, 'master-elise-1'))
      .reduce((count, owner) => count + (owner.native?.blades?.filter(id => id === target.id).length ?? 0), 0);
    multiplier *= 1 - Math.min(2, lodged) * .15;
  }
  return effectiveDefense(state, target) * multiplier;
}
function nativeControl(state: BattleState, owner: Combatant, target: Combatant): boolean {
  return (owner.native?.seals?.[target.id]?.throughPhase ?? 0) >= state.round ||
    target.weakened > 0 && target.weakenSourceId === owner.id && target.weakenOrigin !== 'conduit';
}
function nativeSupportAction(state: BattleState, actor: Combatant, action: ActionId): boolean {
  if (!hasNativeIdentity(actor)) return false;
  if (actor.definitionId === 'tide') return action === 'skill2' || action === 'ultimate';
  if (actor.definitionId === 'sprout') return action === 'skill2' || action === 'ultimate';
  if (actor.definitionId === 'bruno') return action === 'ultimate';
  if (actor.definitionId === 'orvella')
    return action === 'skill2' || action === 'skill1' && !!actor.native?.foundation;
  if (actor.definitionId === 'rosetta')
    return action === 'ultimate' && (actor.native?.quarry?.contributors.length ?? 0) >= 2;
  if (actor.definitionId === 'bliss') {
    const others = alive(state).filter(ally => ally.id !== actor.id);
    const closing = others.length > 0 && others.every(ally => ally.spent);
    return closing && (action === 'skill1' || action === 'skill2' || action === 'ultimate');
  }
  return false;
}
export function conduitActionCost(actor: Combatant, action: ActionId, state: BattleState, base: number, targetId?: string): number {
  const n = actor.conduitRuntime?.numbers ?? {};
  if (action === 'light') {
    if (phaseZeroStatsReady) return 0;
    const cost = solaceCost(state, actor);
    return cost !== undefined && actor.shatter >= cost ? cost : 0;
  }
  if (action === 'skill1' && n.quietFeather) return 0;
  if (!phaseZeroStatsReady) {
    let discount = 0;
    if ((action === 'skill1' || action === 'skill2') && n.tailwind && equipped(actor, 'atmospheric-skythread-rudder'))
      discount += value(state, actor, 'atmospheric-skythread-rudder', 10, 20) * n.tailwind;
    if (action === 'ultimate' && n.stormCount && equipped(actor, 'atmospheric-storm-clock'))
      discount += value(state, actor, 'atmospheric-storm-clock', 15, 30) * n.stormCount;
    if (base > 0 && equipped(actor, 'coilfeed-ratchet')) {
      const cut = Math.floor(base * value(state, actor, 'coilfeed-ratchet', .07, .14));
      discount += action === 'ultimate' ? Math.min(cut, Math.max(0, base - discount - 70)) : cut;
    }
    return base === 0 ? 0 : Math.max(1, base - discount);
  }
  let efficiency = actor.stats.skillEfficiency ?? 0;
  if (equipped(actor, 'starvein-conductor') && diverseSquad(state))
    efficiency += magnitude(state, 'starvein-conductor', .35);
  if (equipped(actor, 'execution-orrery') && action === 'skill2')
    efficiency += magnitude(state, 'execution-orrery', .1);
  for (const key of ['seedSkillEfficiency', 'blissSkillEfficiency', 'orvellaSkillEfficiency', 'rosettaSkillEfficiency'])
    efficiency += token(state, actor, key);
  if (token(state, actor, 'tideEfficiencyPending') && (action === 'skill1' || action === 'skill2' || action === 'ultimate')) {
    const source = state.allies.find(ally => ally.id === gear(actor).owners.tideEfficiencyOwner &&
      ally.hp > 0 && equipped(ally, 'master-tide-2'));
    if (source && layers(actor).some(layer => layer.native && layer.owner === source.id && layer.amount > 0))
      efficiency += .25;
  }
  efficiency += calamiticSkillEfficiencyBonus(state);
  efficiency += token(state, actor, 'temperedEfficiency') + token(state, actor, 'accordEfficiency') +
    token(state, actor, 'coverEfficiency') + token(state, actor, 'triageEfficiency');
  efficiency += Math.max(0, ...alive(state).filter(owner => owner.id !== actor.id)
    .map(owner => token(state, owner, 'stormstepOfferEfficiency')));
  efficiency += Math.max(0, ...alive(state).filter(owner => owner.id !== actor.id)
    .map(owner => token(state, owner, 'coverOfferEfficiency')));
  if (action === 'skill1' || action === 'skill2') efficiency += token(state, actor, 'skyEfficiency');
  if (action === 'ultimate') efficiency += token(state, actor, 'stormEfficiency');
  for (const ally of alive(state).filter(ally => ally.id !== actor.id && equipped(ally, 'chaotic-paradox-spindle') &&
      ally.recoverThrough >= state.round)) efficiency += magnitude(state, 'chaotic-paradox-spindle', .2);
  const target = state.enemies.find(enemy => enemy.id === targetId && enemy.hp > 0 && enemy.weakened > 0);
  if (target && conduitActionTraits(state, actor, action).damage &&
      alive(state).some(owner => owner.id !== actor.id && owner.id === target.weakenSourceId &&
        target.weakenOrigin !== 'conduit' && equipped(owner, 'aquatic-undertide-chronometer')))
    efficiency += magnitude(state, 'aquatic-undertide-chronometer', .15);
  return phaseZeroSkillCost(base, efficiency, action);
}
function solaceCost(state: BattleState, actor: Combatant): number | undefined {
  if (phaseZeroStatsReady) return undefined;
  if (!equipped(actor, 'solace-anchor') || actor.conduitRuntime?.numbers.solaceRound === state.round) return undefined;
  return Math.max(0, Math.round(value(state, actor, 'solace-anchor', 10, 5)));
}
export function recoveryNormal(actor: Combatant): boolean {
  return !phaseZeroStatsReady && equipped(actor, 'chaotic-paradox-spindle');
}
export function conduitActionBlocked(_actor: Combatant, _state: BattleState): boolean { return false; }
export function prepareConduitAction(state: BattleState, actor: Combatant, action: ActionId, paid: number, nativeAll: boolean): ConduitActivation {
  refreshConduitStats(state);
  const n = gear(actor).numbers;
  const ctx: ConduitActivation = { action, paid, bonus: 0, criticalBonus: 0, guaranteed: false, forbidden: false,
    all: nativeAll, nativeAll, scale: 1, skillPower: phaseZeroStatsReady && action !== 'light'
      ? (actor.stats.skillPower ?? 1) + calamiticSkillPowerBonus(state) : 1,
    skillDuration: phaseZeroStatsReady ? Math.floor(actor.stats.skillDuration ?? 0) : 0,
    criticalDamageBonus: 0, impacts: 1, hits: [], overheal: 0, healed: 0, healRecipients: [], spent: {}, healExtra: 0,
    shieldBurn: 0, burnPaid: false, freeAction: false,
    eclipseTargets: [], shieldRecipients: [], nativeHpDamage: 0, nativeShieldDamage: 0 };
  if (phaseZeroStatsReady && action !== 'light') ctx.supportPowerBonus = nativeSupportMultiplier(state, actor) - 1;
  if (phaseZeroStatsReady && action === 'skill2' && equipped(actor, 'master-tide-2')) ctx.skillPower += .5;
  if (phaseZeroStatsReady && action !== 'light') {
    const coverSources = alive(state).filter(owner => owner.id !== actor.id);
    ctx.skillPower += Math.max(0, ...coverSources.map(owner => token(state, owner, 'coverOfferPower')));
    for (const source of coverSources) {
      token(state, source, 'coverOfferPower', true);
      token(state, source, 'coverOfferEfficiency', true);
      token(state, source, 'stormstepOfferEfficiency', true);
    }
    for (const key of ['temperedEfficiency', 'accordEfficiency', 'coverEfficiency']) token(state, actor, key, true);
    ctx.supportPowerBonus = (ctx.supportPowerBonus ?? 0) + token(state, actor, 'triagePower', true);
    token(state, actor, 'triageEfficiency', true);
    if (action === 'skill1' || action === 'skill2') token(state, actor, 'skyEfficiency', true);
    if (action === 'ultimate') token(state, actor, 'stormEfficiency', true);
    ctx.skillPower += token(state, actor, 'brunoCoverSkillPower', true);
    ctx.skillDuration += token(state, actor, 'blissSkillDuration');
  }
  if (phaseZeroStatsReady && equipped(actor, 'solace-anchor') &&
      alive(state).filter(ally => ally.id !== actor.id).every(ally => !ally.spent)) {
    for (const ally of alive(state).filter(ally => ally.id !== actor.id)) {
      const memory = gear(ally).numbers;
      memory.solaceAttack = magnitude(state, 'solace-anchor', .2);
      memory.solaceAttackThrough = state.round;
    }
  }
  n.ordinaryResourceSpend = action === 'skill2' ? 1 : 0;
  if (action === 'light' && solaceCost(state, actor) === paid) {
    n.solaceRound = state.round; ctx.freeAction = true;
  }
  if (prepareCalamiticAction(state, actor, action)) ctx.freeAction = true;
  if (action === 'skill1' && n.quietFeather) n.quietFeather--;
  if ((action === 'skill1' || action === 'skill2') && n.tailwind) delete n.tailwind;
  const traits = conduitActionTraits(state, actor, action);
  const offensive = phaseZeroStatsReady ? traits.damage :
    action === 'light' || actor.kit?.abilities[action].strength.damageMultiplier !== undefined;
  if (phaseZeroStatsReady && action !== 'light') {
    const hasSkillDebuff = traits.debuff;
    const isHealOrShield = traits.healing || traits.shield;
    if (equipped(actor, 'opal-indexer') && hasSkillDebuff) {
      ctx.skillPower += magnitude(state, 'opal-indexer', .75);
      ctx.skillDuration++;
    }
    if (equipped(actor, 'calamitic-world-eater-orrery') && hasSkillDebuff)
      ctx.debuffPowerBonus = magnitude(state, 'calamitic-world-eater-orrery', 1.25);
    if (equipped(actor, 'sentinel-aperture') && action === 'skill1')
      ctx.skillPower += magnitude(state, 'sentinel-aperture', .99);
    if (equipped(actor, 'execution-orrery') && action === 'skill2')
      ctx.skillPower += magnitude(state, 'execution-orrery', .99);
    if (equipped(actor, 'nullsong-transmission'))
      ctx.skillPower += roll(state) < .5 ? magnitude(state, 'nullsong-transmission', .75) : -.75;
    if (equipped(actor, 'judgment-lens') && (!offensive || isHealOrShield || nativeSupportAction(state, actor, action)))
      ctx.skillPower += magnitude(state, 'judgment-lens', .5);
    if (equipped(actor, 'springwell-pump') && isHealOrShield)
      ctx.skillPower += phaseZeroUpgradeMagnitude(.2, state.conduitUpgrades?.['springwell-pump'] ?? 0);
    if (isHealOrShield && actor.shield > 0)
      ctx.skillPower += alive(state).filter(owner => equipped(owner, 'ward-stitch-spool')).length *
        magnitude(state, 'ward-stitch-spool', .3);
    if (equipped(actor, 'siege-cantilever') && nativeAll && offensive)
      ctx.skillPower += magnitude(state, 'siege-cantilever', 1.5);
    if (equipped(actor, 'worldbreaker-drive') && action === 'ultimate')
      ctx.skillPower += magnitude(state, 'worldbreaker-drive', .99);
    if (equipped(actor, 'infernic-pyre-census'))
      ctx.skillPower += Math.min(3, new Set(alive(state).map(ally => ally.element)).size) *
        magnitude(state, 'infernic-pyre-census', .2);
    for (const ally of alive(state).filter(ally => ally.id !== actor.id && equipped(ally, 'chaotic-paradox-spindle') &&
        ally.recoverThrough >= state.round))
      ctx.skillPower += magnitude(state, 'chaotic-paradox-spindle', .4);
    if (equipped(actor, 'flare-focusing-iris') && traits.debuff &&
        (actor.definitionId === 'ember' || actor.kit?.abilities[action].strength.burnMultiplier !== undefined))
      ctx.skillPower += magnitude(state, 'flare-focusing-iris', .8);
    ctx.skillPower += token(state, actor, 'faultSkillPower', true);
    ctx.skillPower += token(state, actor, 'coverSkillPower', true);
    if (offensive) ctx.skillPower += token(state, actor, 'verdantPower', true);
    for (const key of ['vaelorSkillPower', 'seedSkillPower', 'thorniaSkillPower'])
      ctx.skillPower += token(state, actor, key, true);
    if (n.tideEfficiencyPending !== undefined) {
      token(state, actor, 'tideEfficiencyPending', true);
      delete gear(actor).owners.tideEfficiencyOwner;
    }
    for (const key of ['orvellaSkillEfficiency', 'rosettaSkillEfficiency', 'blissSkillEfficiency',
      'blissSkillDuration', 'seedSkillEfficiency']) token(state, actor, key, true);
  }
  if (phaseZeroStatsReady && offensive) {
    if (equipped(actor, 'calamitic-cathedral-final-equation')) {
      ctx.criticalBonus += magnitude(state, 'calamitic-cathedral-final-equation', 2.5);
      ctx.criticalDamageBonus += magnitude(state, 'calamitic-cathedral-final-equation', 1.2);
    }
    if (action === 'ultimate' && equipped(actor, 'horizon-heartcase')) {
      ctx.criticalBonus += magnitude(state, 'horizon-heartcase', .1);
      ctx.criticalDamageBonus += magnitude(state, 'horizon-heartcase', .35);
    }
    if (equipped(actor, 'worldbreaker-drive')) ctx.bonus += magnitude(state, 'worldbreaker-drive', .65);
    if (action === 'ultimate' && equipped(actor, 'parallax-relay')) ctx.bonus += magnitude(state, 'parallax-relay', .1);
    if (action === 'ultimate' && equipped(actor, 'calamitic-causality-funeral-engine'))
      ctx.bonus += magnitude(state, 'calamitic-causality-funeral-engine', 1.25);
    ctx.criticalBonus += token(state, actor, 'dawnRate', true) + token(state, actor, 'thunderRate', true);
    ctx.criticalDamageBonus += token(state, actor, 'dawnDamage', true);
    ctx.bonus += token(state, actor, 'dawnDirect', true);
    if (action === 'ultimate' && equipped(actor, 'ominous-eclipse-mantle'))
      ctx.bonus += magnitude(state, 'ominous-eclipse-mantle', .45);
    if (action === 'ultimate' && equipped(actor, 'chaotic-fault-verdict'))
      ctx.bonus += magnitude(state, 'chaotic-fault-verdict', .7);
    if (action === 'ultimate' && equipped(actor, 'master-ember-2')) {
      ctx.all = ctx.nativeAll = false;
      ctx.bonus += 1.25;
    }
    if (actor.shield > 0 && equipped(actor, 'chaotic-fault-verdict'))
      ctx.criticalDamageBonus += magnitude(state, 'chaotic-fault-verdict', .5);
    const tempered = token(state, actor, 'temperedAttack', true);
    if (tempered > 0) {
      ctx.spent.temperedAttack = tempered;
      ctx.spent.temperedSource = state.allies.findIndex(ally => ally.id === gear(actor).owners.temperedAttack);
    }
    const instruction = actor.native?.instruction;
    const disciple = instruction && instruction.throughRound >= state.round && alive(state).find(unit =>
      unit.id === instruction.owner && equipped(unit, 'master-disciple-3'));
    if (disciple && (instruction.kind === 'strike' || instruction.kind === 'resolve')) {
      ctx.criticalBonus += .3;
      ctx.criticalDamageBonus += .4;
    }
    for (const key of ['vaelorCriticalRate', 'razorCriticalRate', 'eliseCriticalRate', 'blissCriticalRate'])
      ctx.criticalBonus += token(state, actor, key, true);
    for (const key of ['vaelorCriticalDamage', 'eliseCriticalDamage', 'crinsoCriticalDamage'])
      ctx.criticalDamageBonus += token(state, actor, key, true);
  }
  if (offensive && equipped(actor, 'parallax-relay') && !phaseZeroStatsReady) ctx.criticalBonus += value(state, actor, 'parallax-relay', .15, .3);
  if (offensive && equipped(actor, 'ruinselect-prism') && !phaseZeroStatsReady)
    ctx.bonus += Math.floor(Math.max(0, actor.stats.health - actor.hp) / (actor.stats.health * .1)) * value(state, actor, 'ruinselect-prism', .03, .06);
  if (offensive && equipped(actor, 'infernic-pyre-census') && !phaseZeroStatsReady)
    ctx.bonus += state.enemies.filter(enemy => enemy.hp > 0 && enemy.burn.turns > 0 && enemy.burn.sourceId === actor.id).length *
      value(state, actor, 'infernic-pyre-census', .1, .2);
  if (offensive && equipped(actor, 'glassroot-gimbal') && !phaseZeroStatsReady) ctx.bonus += Math.floor((actor.shatter + paid) / 10) * value(state, actor, 'glassroot-gimbal', .01, .02);
  ctx.guaranteed = !phaseZeroStatsReady && equipped(actor, 'falcon-sight') && (n.noncritical ?? 0) >= 2;
  ctx.forbidden = !phaseZeroStatsReady && (equipped(actor, 'verdict-caliper') || (action === 'light' && equipped(actor, 'judgment-lens')));
  if (equipped(actor, 'verdict-caliper') && !phaseZeroStatsReady) ctx.bonus += value(state, actor, 'verdict-caliper', .35, .7);
  if (action === 'light') {
    if (!phaseZeroStatsReady && equipped(actor, 'siegebound-drive')) ctx.bonus += value(state, actor, 'siegebound-drive', .08, .16);
    if (!phaseZeroStatsReady && equipped(actor, 'nullsong-transmission')) ctx.bonus += value(state, actor, 'nullsong-transmission', .4, .8);
    if (actor.recoverThrough >= state.round && recoveryNormal(actor)) ctx.scale *= value(state, actor, 'chaotic-paradox-spindle', .5, .75);
    if (!phaseZeroStatsReady && equipped(actor, 'master-atmoso-1')) { ctx.all = true; ctx.scale *= .7; }
  } else {
    if (action === 'skill1' && equipped(actor, 'prism-splinter-socket') && !phaseZeroStatsReady) ctx.bonus += value(state, actor, 'prism-splinter-socket', .1, .2);
    if (action === 'skill2' && equipped(actor, 'crosspin-governor') && !phaseZeroStatsReady) ctx.bonus += value(state, actor, 'crosspin-governor', .1, .2);
    if (action !== 'ultimate' && equipped(actor, 'nullsong-transmission') && !phaseZeroStatsReady) ctx.bonus += value(state, actor, 'nullsong-transmission', -.12, -.24);
    if (!phaseZeroStatsReady && action !== 'ultimate' && equipped(actor, 'voltaic-stormstep-dynamo') && n.previousSkill && n.previousSkill !== (action === 'skill1' ? 1 : 2)) {
      ctx.bonus += value(state, actor, 'voltaic-stormstep-dynamo', .25, .5);
    }
    if (action !== 'ultimate' && n.verdant) { ctx.bonus += n.verdant; delete n.verdant; }
  }
  if (phaseZeroStatsReady && equipped(actor, 'voltaic-stormstep-dynamo')) {
    const current = action === 'skill1' ? 1 : action === 'skill2' ? 2 : 0;
    if (current && n.previousSkill && n.previousSkill !== current) {
      ctx.skillPower += magnitude(state, 'voltaic-stormstep-dynamo', .3);
      grantToken(state, actor, 'stormstepOfferEfficiency', magnitude(state, 'voltaic-stormstep-dynamo', .15));
    }
    n.previousSkill = current;
  } else n.previousSkill = offensive ? (action === 'skill1' ? 1 : action === 'skill2' ? 2 : 0) : 0;
  if (!phaseZeroStatsReady && nativeAll && state.enemies.filter(enemy => enemy.hp > 0).length === 1 && equipped(actor, 'siege-cantilever')) ctx.bonus += value(state, actor, 'siege-cantilever', .6, 1.2);
  if (action === 'ultimate') {
    if (!phaseZeroStatsReady && equipped(actor, 'atmospheric-storm-clock')) n.stormCount = 0;
    if (equipped(actor, 'worldbreaker-drive') && !phaseZeroStatsReady) ctx.bonus += value(state, actor, 'worldbreaker-drive', .35, .7);
    if (!phaseZeroStatsReady && equipped(actor, 'master-nerithe-3')) ctx.scale *= .5;
    if (!phaseZeroStatsReady && equipped(actor, 'master-elise-2')) { ctx.impacts = 4; ctx.scale *= 1.2; }
    if (!phaseZeroStatsReady && equipped(actor, 'master-razor-2')) ctx.bonus += payShield(actor, actor.shield) / actor.stats.health * 2;
    if (!phaseZeroStatsReady && equipped(actor, 'master-vaelor-1')) { actor.hp -= Math.min(actor.hp - 1, actor.hp * .2); ctx.bonus += .75; }
    if (!phaseZeroStatsReady && equipped(actor, 'chaotic-ouroboros-core')) {
      const excess = actor.shatter; actor.shatter = 0;
      n.excessShield = excess * value(state, actor, 'chaotic-ouroboros-core', .003, .006) * actor.stats.health;
    }
  }
  if (!phaseZeroStatsReady && action === 'skill2' && equipped(actor, 'master-ember-2')) { ctx.all = false; ctx.scale *= 2; }
  if (!phaseZeroStatsReady && action === 'skill1' && equipped(actor, 'master-bliss-2')) { ctx.impacts = 2; ctx.scale *= 1.4; }
  if (!phaseZeroStatsReady && action === 'skill2' && equipped(actor, 'master-crinso-2')) ctx.shieldBurn = payShield(actor, actor.shield) * .5;
  if (!phaseZeroStatsReady && action === 'skill2' && equipped(actor, 'master-bliss-1')) {
    const count = alive(state).filter(ally => ally.id !== actor.id).length;
    if (count && actor.hp - actor.stats.health * .1 >= 1) { ctx.healExtra = actor.stats.health * .1 / count; actor.hp -= actor.stats.health * .1; }
  }
  if (!phaseZeroStatsReady && equipped(actor, 'master-atmoso-2') && n.counterwind) {
    if (offensive) ctx.bonus += n.counterwind;
    delete n.counterwind; delete n.counterwindActive;
  }
  if (!phaseZeroStatsReady && equipped(actor, 'master-crinso-3')) {
    if (!n.crimson || action === 'ultimate') ctx.bonus += .3;
  }
  if (!phaseZeroStatsReady && action === 'skill2' && hasNativeIdentity(actor) && equipped(actor, 'master-crinso-1')) {
    ctx.bonus += n.goldImprint ?? 0;
    delete n.goldImprint;
  }
  ctx.skillPower = Math.max(0, ctx.skillPower);
  return ctx;
}
export function conduitCriticalBonus(state: BattleState, actor: Combatant, target: Combatant, action: ActionId = 'light'): number {
  if (!phaseZeroStatsReady) return 0;
  let bonus = 0;
  if (layers(actor).some(layer => layer.native && layer.amount > 0 &&
      alive(state).some(owner => owner.id === layer.owner && equipped(owner, 'aegis-return-spring'))))
    bonus += magnitude(state, 'aegis-return-spring', .2);
  if (target.burn.turns > 0 && target.burn.origin !== 'conduit' && alive(state).some(owner =>
    owner.id !== actor.id && owner.id === target.burn.sourceId && equipped(owner, 'flare-focusing-iris')))
    bonus += magnitude(state, 'flare-focusing-iris', .2);
  return bonus;
}
export function conduitHitModifiers(state: BattleState, actor: Combatant, target: Combatant, ctx: ConduitActivation, critical: boolean): {
  bonus: number; pierce: number; attack: number; skillPowerBonus: number; critMultiplier?: number; criticalDamageBonus?: number;
} {
  let bonus = ctx.bonus + calamiticSiegeBonus(state, actor, target);
  let pierce = 0;
  let criticalDamageBonus = ctx.criticalDamageBonus;
  let skillPowerBonus = 0;
  const action = ctx.action;
  if (phaseZeroStatsReady && action !== 'light') skillPowerBonus += ctx.spent.starveinPower ?? 0;
  if (phaseZeroStatsReady && action !== 'light' && !ctx.foldTarget &&
      gear(actor).owners.foldTarget === target.id && token(state, actor, 'foldTarget', true)) {
    ctx.foldTarget = target.id;
    delete gear(actor).owners.foldTarget;
  }
  if (phaseZeroStatsReady && action !== 'light') {
    const points = Math.max(0, ...alive(state).filter(owner => owner.id !== actor.id &&
      equipped(owner, 'master-nerithe-1') && owner.native?.survey?.target === target.id)
      .map(owner => owner.native?.survey?.points ?? 0));
    pierce += Math.min(4, points) * .1;
  }
  if (phaseZeroStatsReady && alive(state).some(owner => equipped(owner, 'master-tide-3') &&
      target.side === 'enemy' && target.weakened > 0 && target.weakenSourceId === owner.id &&
      layers(actor).some(layer => layer.amount > 0 && layer.native && layer.owner === owner.id)))
    pierce += .25;
  if (phaseZeroStatsReady && ctx.foldTarget === target.id) skillPowerBonus += .4;
  if (phaseZeroStatsReady && action !== 'light' && !ctx.rosettaTarget &&
      gear(actor).owners.rosettaTarget === target.id && token(state, actor, 'rosettaTarget', true)) {
    ctx.rosettaTarget = target.id;
    delete gear(actor).owners.rosettaTarget;
  }
  if (phaseZeroStatsReady && ctx.rosettaTarget === target.id) skillPowerBonus += .35;
  if (phaseZeroStatsReady && action !== 'light' && ctx.spent.elisePowerUsed && ctx.spent.elisePowerTarget === state.enemies.indexOf(target) + 1)
    skillPowerBonus += .35;
  if (phaseZeroStatsReady && action !== 'light' && !ctx.spent.elisePowerUsed) {
    const elise = alive(state).find(owner => owner.id !== actor.id && equipped(owner, 'master-elise-2') &&
      owner.native?.blades?.includes(target.id));
    const key = elise ? `eliseSkillPower:${elise.id}` : '';
    if (elise && (gear(target).numbers[key] ?? 0) > 0) {
      skillPowerBonus += .35;
      gear(target).numbers[key]--;
      ctx.spent.elisePowerUsed = 1;
      ctx.spent.elisePowerTarget = state.enemies.indexOf(target) + 1;
    }
  }
  if (phaseZeroStatsReady && action !== 'light') {
    const storedOwner = gear(actor).owners.emberSkillOwner;
    const burnOwner = state.allies.find(ally => ally.id === storedOwner && equipped(ally, 'master-ember-3'));
    if (burnOwner && target.burn.turns > 0 && target.burn.sourceId === burnOwner.id &&
        target.burn.origin !== 'conduit' && token(state, actor, 'emberSkillOwner', true)) {
      ctx.emberBonusOwner = burnOwner.id;
      delete gear(actor).owners.emberSkillOwner;
    }
    if (ctx.emberBonusOwner && target.burn.turns > 0 && target.burn.sourceId === ctx.emberBonusOwner &&
        target.burn.origin !== 'conduit') skillPowerBonus += .4;
  }
  if (phaseZeroStatsReady && action !== 'light' && critical && equipped(actor, 'judgment-lens'))
    criticalDamageBonus += phaseZeroUpgradeMagnitude(.5, state.conduitUpgrades?.['judgment-lens'] ?? 0);
  if (!phaseZeroStatsReady && target.hp >= target.stats.health && equipped(actor, 'breach-pendulum'))
    bonus += value(state, actor, 'breach-pendulum', .2, .4);
  if (!phaseZeroStatsReady && target.hp <= target.stats.health * .25 && equipped(actor, 'execution-orrery')) bonus += value(state, actor, 'execution-orrery', .5, 1);
  if (!phaseZeroStatsReady && action === 'skill1' && equipped(actor, 'spearwheel-engine')) pierce += value(state, actor, 'spearwheel-engine', .15, .3);
  if (phaseZeroStatsReady && action !== 'light' && equipped(actor, 'spearwheel-engine')) pierce += magnitude(state, 'spearwheel-engine', .1);
  pierce += calamiticSkillDefenseIgnore(state, actor, action);
  if (target.weakened > 0 && equipped(actor, 'ominous-eclipse-mantle')) {
    if (phaseZeroStatsReady && action !== 'light') {
      pierce += magnitude(state, 'ominous-eclipse-mantle', .35);
      if (target.weakenSourceId && target.weakenSourceId !== actor.id)
        skillPowerBonus += magnitude(state, 'ominous-eclipse-mantle', .2);
    } else if (!phaseZeroStatsReady && target.weakenSourceId === actor.id && target.weakenOrigin !== 'conduit') {
      pierce += value(state, actor, 'ominous-eclipse-mantle', .4, .6);
      ctx.eclipseTargets.push(target.id);
    }
  }
  if (action === 'light' && !phaseZeroStatsReady) {
    const marks = target.conduitMarks?.[actor.id] ?? 0;
    if (marks) {
      bonus += marks * value(state, actor, 'ominous-nightglass-archive', .1, .2);
      delete target.conduitMarks?.[actor.id];
    }
  }
  const targetMemory = gear(target);
  if (phaseZeroStatsReady) {
    if (action === 'light' && state.allies.some(owner => owner.id !== actor.id &&
        (targetMemory.numbers[`nightglass:${owner.id}`] ?? 0) >= state.round))
      criticalDamageBonus += magnitude(state, 'ominous-nightglass-archive', .5);
    if (action !== 'light') {
      let soot = false;
      for (const source of state.allies.filter(ally => ally.id !== actor.id)) {
        const key = `soot:${source.id}:${actor.id}`;
        if ((targetMemory.numbers[key] ?? 0) >= state.round) {
          soot = true;
          delete targetMemory.numbers[key];
        }
      }
      if (soot) ctx.spent[`soot:${target.id}`] = magnitude(state, 'sootwake-crucible', .3);
      skillPowerBonus += ctx.spent[`soot:${target.id}`] ?? 0;
      if (gear(actor).owners.secondbeatTarget === target.id && token(state, actor, 'secondbeatPower')) {
        ctx.spent[`secondbeat:${target.id}`] = token(state, actor, 'secondbeatPower', true);
        const source = state.allies.find(ally => ally.id === gear(actor).owners.secondbeatSource);
        if (source) ctx.spent.secondbeatSource = state.allies.indexOf(source) + 1;
      }
      skillPowerBonus += ctx.spent[`secondbeat:${target.id}`] ?? 0;
    }
  }
  for (const owner of state.allies) {
    if (phaseZeroStatsReady) break;
    if (owner.id === actor.id) continue;
    const sootPrefix = `soot:${owner.id}:`;
    const sootKeys = Object.keys(targetMemory.numbers).filter(key => key.startsWith(sootPrefix));
    const activeSoot = sootKeys.filter(key => {
      if (targetMemory.numbers[key] >= state.round) return true;
      delete targetMemory.numbers[key]; return false;
    });
    const legacySoot = `soot:${owner.id}`;
    const hasLegacySoot = targetMemory.numbers[legacySoot] !== undefined && targetMemory.numbers[legacySoot] >= state.round;
    if (hasLegacySoot) delete targetMemory.numbers[legacySoot];
    if (activeSoot.length || hasLegacySoot) {
      bonus += value(state, owner, 'sootwake-crucible', .2, .4) * (activeSoot.length + Number(hasLegacySoot));
      for (const key of activeSoot) delete targetMemory.numbers[key];
    }
    const openingKey = `opening:${owner.id}`;
    const openings = targetMemory.numbers[openingKey] ?? 0;
    if (!phaseZeroStatsReady && openings > 0 &&
      (hasNativeIdentity(owner) || target.weakened > 0 && target.weakenSourceId === owner.id)) {
      bonus += .4;
      if (!hasNativeIdentity(owner)) target.weakened--;
      if (openings > 1) targetMemory.numbers[openingKey] = openings - 1;
      else delete targetMemory.numbers[openingKey];
    }
  }
  if (!phaseZeroStatsReady && equipped(actor, 'master-atmoso-3') && !ctx.forbidden) bonus += Math.max(0, actor.stats.crit + ctx.criticalBonus - 1);
  if (critical && equipped(actor, 'master-elise-1') && !phaseZeroStatsReady) pierce += .5;
  const coveredByBruno = phaseZeroStatsReady && alive(state).some(owner =>
    equipped(owner, 'master-bruno-3') && owner.native?.cover?.throughPhase !== undefined &&
    owner.native.cover.throughPhase >= state.round && owner.native.cover.targets.includes(actor.id));
  let attackBonus = 0;
  if (phaseZeroStatsReady) {
    attackBonus += ctx.spent.temperedAttack ?? 0;
    if ((gear(actor).numbers.solaceAttackThrough ?? 0) >= state.round)
      attackBonus += gear(actor).numbers.solaceAttack ?? 0;
    if (actor.attackBoost && actor.attackBoost.throughRound >= state.round)
      attackBonus += actor.attackBoost.fraction;
  }
  const attack = phaseZeroStatsReady ? actor.stats.damage +
    phaseZeroStatBase(actor.conduitRuntime?.statBase?.damage ?? actor.stats.damage, 'damage', actor.conduits, state.conduitUpgrades) *
      (attackBonus + (coveredByBruno ? .25 : 0)) : actor.stats.damage * (1 + attackBonus + (coveredByBruno ? .25 : 0));
  const criticalBase = phaseZeroStatsReady
    ? phaseZeroStatBase(actor.conduitRuntime?.statBase?.critMultiplier ?? actor.stats.critMultiplier, 'critMultiplier', actor.conduits, state.conduitUpgrades) : actor.stats.critMultiplier;
  return { bonus, skillPowerBonus, pierce: phaseZeroStatsReady ? Math.min(.75, pierce) : pierce,
    attack,
    ...(criticalDamageBonus > 0 ? { criticalDamageBonus: actor.stats.critMultiplier > 0
      ? criticalDamageBonus * (criticalBase / actor.stats.critMultiplier) : 0 } : {}),
    ...(critical && equipped(actor, 'master-elise-1') && !phaseZeroStatsReady ? { critMultiplier: 1.5 } : {}) };
}
export function resetConduitBurnStreak(owner: Combatant, target: Combatant): void {
  const n = gear(target).numbers;
  n[`cinder:${owner.id}`] = 0; n[`extensions:${owner.id}`] = 0;
}
export function applyConduitBurn(state: BattleState, owner: Combatant, target: Combatant, base: number, ctx: ConduitActivation): number {
  let bonus = 0;
  if (!phaseZeroStatsReady && equipped(owner, 'starvein-conductor')) {
    const payment = owner.stats.health * .05;
    if (!ctx.burnPaid && owner.hp - payment >= 1) { owner.hp -= payment; ctx.burnPaid = true; }
    if (ctx.burnPaid) bonus += value(state, owner, 'starvein-conductor', .3, .6);
  }
  const levelMultiplier = owner.side === 'ally' ? damageOverTimeLevelMultiplier(owner.level ?? 0) : 1;
  const scaledBase = base * levelMultiplier;
  const damage = Math.round((scaledBase * (ctx.skillPower + (ctx.debuffPowerBonus ?? 0)) +
    ctx.shieldBurn * levelMultiplier) * (1 + bonus));
  if (phaseZeroStatsReady) {
    const n = gear(target).numbers;
    const prior = owner.native?.burns?.[target.id] ??
      (target.burn.sourceId === owner.id ? target.burn : undefined);
    if (!prior || prior.turns <= 0) n[`cinderPower:${owner.id}`] = 0;
    if (!prior || prior.turns <= 0 || damage >= prior.damage) n[`cinderBase:${owner.id}`] = scaledBase;
    return damage;
  }
  if (target.burn.turns <= 0 || damage >= target.burn.damage) resetConduitBurnStreak(owner, target);
  return damage;
}
export function afterConduitImpact(owner: Combatant, target: Combatant, ctx: ConduitActivation): void {
  if (ctx.eclipseTargets.includes(target.id) && target.weakened > 0 && target.weakenSourceId === owner.id) {
    target.weakened--;
    if (!target.weakened) { target.weakenFraction = 0; delete target.weakenSourceId; delete target.weakenOrigin; }
  }
}
export function applyConduitWeaken(state: BattleState, owner: Combatant, target: Combatant, fraction: number, events: BattleEvent[], action: ActionId = 'skill1', baseDuration = 2, activation?: ConduitActivation): void {
  if (!phaseZeroStatsReady && equipped(owner, 'master-bruno-3') && action === 'skill1') {
    gear(target).numbers.excavated = (gear(target).numbers.excavated ?? 0) + (gear(target).numbers.entryDefense ?? target.stats.defense) * .15;
    emit(events, 'status', owner, target, gear(target).numbers.excavated, `${target.name}'s Battle-start Defense is excavated.`);
    return;
  }
  const duration = baseDuration + (phaseZeroStatsReady ? activation?.skillDuration ?? Math.floor(owner.stats.skillDuration ?? 0) : 0) +
    (phaseZeroStatsReady ? Number(equipped(owner, 'aquatic-undertide-chronometer')) :
      equipped(owner, 'opal-indexer') ? step(state, 'opal-indexer', 1, 2) : 0);
  const strength = fraction * (phaseZeroStatsReady
    ? (activation?.skillPower ?? owner.stats.skillPower ?? 1) + (activation?.debuffPowerBonus ?? 0) : 1) +
    (!phaseZeroStatsReady && equipped(owner, 'tension-governor') ? value(state, owner, 'tension-governor', .05, .1) : 0);
  const boundedStrength = phaseZeroStatsReady ? Math.min(.5, strength) : strength;
  if (target.weakened > 0 && target.weakenFraction > boundedStrength) {
    emit(events, 'status', owner, target, target.weakenFraction, `${target.name}'s stronger Weaken remains unchanged.`);
    return;
  }
  target.weakened = phaseZeroStatsReady ? Math.min(6, duration) : duration;
  target.weakenFraction = boundedStrength; target.weakenSourceId = owner.id;
  target.weakenOrigin = owner.kit?.pilot === 'rose-grace' || owner.kit?.pilot === 'thorn-aegis' || owner.kit?.pilot === 'rose-duality' ? 'rose' : 'native';
  const n = gear(target).numbers;
  if (!phaseZeroStatsReady && equipped(owner, 'aquatic-undertide-chronometer') && !n[`undertide:${owner.id}`]) {
    n[`undertide:${owner.id}`] = 1;
    n.scheduleShift = (n.scheduleShift ?? 0) + step(state, 'aquatic-undertide-chronometer', 1, 2);
  }
  if (!phaseZeroStatsReady && equipped(owner, 'master-razor-3') && !n[`silenced:${owner.id}`]) { n[`silenced:${owner.id}`] = 1; n.silence = 1; }
  if (!phaseZeroStatsReady && equipped(owner, 'master-tide-3')) applyTaunt(owner, target);
  emit(events, 'status', owner, target, boundedStrength, `${target.name} has ${Math.round(boundedStrength * 100)}% [Weaken] for ${target.weakened} Enemy Turns.`, true);
  if (phaseZeroStatsReady && equipped(owner, 'tension-governor') && !activation?.spent.tension) {
    if (activation) activation.spent.tension = 1;
    const recipient = alive(state).sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0];
    if (recipient) {
      gear(recipient).numbers.tensionDefense = magnitude(state, 'tension-governor', .3);
      gear(recipient).numbers.tensionDefenseThrough = state.round;
      if (recipient.hp < recipient.stats.health * .5)
        generatedHeal(owner, recipient, recipient.stats.health * magnitude(state, 'tension-governor', .06), events, state);
    }
  }
}
export function supportEffect(state: BattleState, owner: Combatant, target: Combatant, events: BattleEvent[]): void {
  if (owner.id !== target.id && equipped(owner, 'tranquilitic-accord-bastion') && !gear(target).owners.accord && !gear(target).numbers.accordGranted) {
    gear(target).owners.accord = owner.id; gear(target).numbers.accordGranted = 1;
    emit(events, 'status', owner, target, 1, `${target.name} receives one Accord lethal-hit protection.`);
  }
}
export type NativeHealingContext = Pick<ConduitActivation, 'overheal' | 'healed'> &
  Partial<Pick<ConduitActivation, 'healExtra' | 'skillPower' | 'supportPowerBonus' | 'healRecipients' | 'spent' | 'action'>>;
export function nativeHeal(state: BattleState, owner: Combatant, target: Combatant, offer: number, events: BattleEvent[], active: boolean, ctx?: NativeHealingContext, instruction = active): number {
  if (target.hp <= 0) return 0;
  if (instruction && !phaseZeroStatsReady) offer *= nativeSupportMultiplier(state, owner);
  if (phaseZeroStatsReady && ctx && (instruction || !active)) {
    const graft = active && instruction && equipped(owner, 'botanic-graft-covenant') &&
      target.hp < target.stats.health * .4 ? magnitude(state, 'botanic-graft-covenant', .5) : 0;
    offer *= (ctx.skillPower ?? owner.stats.skillPower ?? 1) + (ctx.supportPowerBonus ?? 0) + graft;
  }
  let bonus = !phaseZeroStatsReady && active && equipped(owner, 'springwell-pump') ? value(state, owner, 'springwell-pump', .2, .4) : 0;

  const beforeHp = target.hp;
  offer = Math.max(0, offer * (1 + bonus) + (active && owner.id !== target.id ? ctx?.healExtra ?? 0 : 0)) * healingReceived(target, state);
  const restored = Math.min(target.stats.health - target.hp, offer);
  const wasted = offer - restored;
  if (ctx) {
    ctx.overheal += wasted; ctx.healed += restored;
    if (restored > 0) ctx.healRecipients?.push(target.id);
  }
  if (active && wasted > 0 && equipped(owner, 'efflorescent-worldtree-heart')) {
    if (phaseZeroStatsReady) {
      timedConduitShield(state, owner, target, Math.min(target.stats.health * .2,
        wasted * magnitude(state, 'efflorescent-worldtree-heart', .6)),
      'efflorescent-worldtree-heart', state.round + 1, events, true);
    } else {
      const seed = wasted * value(state, owner, 'efflorescent-worldtree-heart', .5, 1);
      const key = `seed:${owner.id}`;
      gear(target).numbers[key] = (gear(target).numbers[key] ?? 0) + seed;
    }
  }
  if (!phaseZeroStatsReady) overhealShield(owner, target, wasted, events);
  if (restored <= 0) return 0;
  target.hp += restored;
  if (phaseZeroStatsReady && active) {
    if (equipped(target, 'tempered-strike-link') && owner.id !== target.id)
      grantToken(state, target, 'temperedAttack', magnitude(state, 'tempered-strike-link', .4), owner);
    if (equipped(owner, 'efflorescent-verdant-covenant'))
      grantToken(state, target, 'verdantPower', magnitude(state, 'efflorescent-verdant-covenant', .3), owner);
    if (equipped(owner, 'botanic-graft-covenant') && beforeHp < target.stats.health * .4 &&
        target.hp > target.stats.health * .4) {
      gear(target).numbers.graftDefense = magnitude(state, 'botanic-graft-covenant', .3);
      gear(target).numbers.graftDefenseThrough = state.round;
    }
  }
  emit(events, 'heal', owner, target, restored, `${owner.name} restores ${restored} HP to ${target.name}.`, true);
  if (phaseZeroStatsReady && active && equipped(owner, 'meridian-inverter')) {
    const key = `meridian:${target.id}`;
    if (ctx?.spent && !ctx.spent[key]) {
      ctx.spent[key] = 1;
      generatedGaugePercent(owner, target, magnitude(state, 'meridian-inverter', .04), events, state);
    }
  }
  pilotEffectiveHeal(state, owner, target, restored, events);
  supportEffect(state, owner, target, events);
  if (!phaseZeroStatsReady && active && owner.id !== target.id && equipped(owner, 'efflorescent-verdant-covenant')) gear(target).numbers.verdant = Math.max(gear(target).numbers.verdant ?? 0, value(state, owner, 'efflorescent-verdant-covenant', .2, .4));
  return restored;
}
export function finishNativeHealing(state: BattleState, owner: Combatant, ctx: NativeHealingContext, events: BattleEvent[]): void {
  if (!phaseZeroStatsReady && equipped(owner, 'rootbound-triage-vault') && ctx.healed > 0 && owner.shatter >= 15) {
    const threshold = value(state, owner, 'rootbound-triage-vault', .2, .4);
    const ally = alive(state).filter(ally => ally.hp < ally.stats.health * threshold)
      .sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0];
    if (ally) {
      const restored = generatedHeal(owner, ally, ally.stats.health * threshold - ally.hp, events, state);
      if (restored > 0) owner.shatter -= 15;
    }
  }
}
export interface NativeShieldOptions { throughPhase?: number; firstReduction?: number; skillPower?: number; activation?: ConduitActivation }
export function nativeShield(state: BattleState, owner: Combatant, target: Combatant, offer: number, events: BattleEvent[],
  options: NativeShieldOptions = {}): number {
  if (target.hp <= 0) return 0;
  if (!phaseZeroStatsReady) offer *= nativeSupportMultiplier(state, owner);
  if (phaseZeroStatsReady && options.skillPower !== undefined)
    offer *= options.skillPower + (options.activation?.supportPowerBonus ?? 0);
  let bonus = !phaseZeroStatsReady && equipped(owner, 'wardglass-transformer') ? value(state, owner, 'wardglass-transformer', .2, .4) : 0;
  if (!phaseZeroStatsReady && owner.id === target.id && owner.hp <= owner.stats.health * .75 && equipped(owner, 'pale-bulwark-diadem')) bonus += value(state, owner, 'pale-bulwark-diadem', .25, .5);
  offer *= 1 + bonus;
  if (!phaseZeroStatsReady && equipped(owner, 'citadel-spine')) offer += effectiveDefense(state, owner) * value(state, owner, 'citadel-spine', .1, .2);
  if (!phaseZeroStatsReady && equipped(owner, 'meridian-inverter')) {
    generatedHeal(owner, target, offer * value(state, owner, 'meridian-inverter', .75, 1.5), events);
    return 0;
  }
  const plate = !phaseZeroStatsReady && equipped(owner, 'master-orvella-1');
  const finalOffer = offer * (plate ? .5 : 1);
  const list = layers(target);
  const existing = target.shield - (plate ? list.filter(layer => layer.plate).reduce((sum, layer) => sum + layer.amount, 0) : 0);
  const gained = Math.max(0, finalOffer - existing);
  const owned = list.filter(layer => layer.native && layer.owner === owner.id && layer.amount > 0);
  const throughPhase = phaseZeroStatsReady && equipped(owner, 'ward-stitch-spool')
    ? (options.throughPhase ?? state.round) + 1 : options.throughPhase;
  for (const layer of owned) {
    if (throughPhase !== undefined && layer.expiresAfterPhase !== undefined)
      layer.expiresAfterPhase = phaseZeroStatsReady ? throughPhase : Math.max(layer.expiresAfterPhase, throughPhase);
  }
  if (options.firstReduction !== undefined && owned.length) {
    for (const layer of owned) delete layer.firstReduction;
    owned[0].firstReduction = options.firstReduction;
  }
  if (gained > 0) {
    options.activation?.shieldRecipients.push(target.id);
    list.push({ amount: gained, owner: owner.id, native: true,
      ...(throughPhase !== undefined ? { expiresAfterPhase: throughPhase } : {}),
      ...(options.firstReduction !== undefined && !owned.length ? { firstReduction: options.firstReduction } : {}) });
    target.shield += gained;
    target.pilot ??= {}; target.pilot.authoredShieldSourceId = owner.id;
    supportEffect(state, owner, target, events);
    if (phaseZeroStatsReady && options.activation?.action === 'skill2' && equipped(owner, 'master-tide-2')) {
      grantToken(state, target, 'tideEfficiencyPending', 1);
      gear(target).owners.tideEfficiencyOwner = owner.id;
    }
    if (!phaseZeroStatsReady && target.id !== owner.id && equipped(owner, 'aegis-return-spring')) {
      const n = gear(owner).numbers;
      gear(target).numbers.criticalSeal = (gear(target).numbers.criticalSeal ?? 0) + 1;
    }
  }
  emit(events, 'shield', owner, target, gained, `${target.name} has ${target.shield} shield.`, true);
  if (!phaseZeroStatsReady && equipped(owner, 'ward-stitch-spool')) {
    const healBonus = value(state, owner, 'ward-stitch-spool', .2, .4);
    for (const layer of layers(target)) if (layer.native && layer.owner === owner.id) layer.healBonus = healBonus;
  }
  if (plate) {
    const prior = layers(target).filter(layer => layer.plate && layer.owner === owner.id).reduce((sum, layer) => sum + layer.amount, 0);
    const amount = Math.max(0, Math.round(offer * .5) - prior);
    generatedShield(owner, target, amount, events, true, Infinity, true);
  }
  if (phaseZeroStatsReady && options.skillPower !== undefined &&
      equipped(owner, 'oceanic-shared-tide-pump') && options.activation && options.activation.action !== 'light' &&
      owner.kit?.abilities[options.activation.action]?.targets === 'one-ally') {
    const recipient = alive(state).filter(ally => ally.id !== target.id)
      .sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0];
    if (recipient) timedConduitShield(state, owner, recipient,
      finalOffer * magnitude(state, 'oceanic-shared-tide-pump', .5),
      'oceanic-shared-tide-pump', throughPhase ?? state.round, events);
  }
  return gained;
}
export function nativeGauge(state: BattleState, target: Combatant, offer: number, events: BattleEvent[], conduit = false): void {
  if (offer <= 0 || target.hp <= 0) return;
  if (!phaseZeroStatsReady && !conduit && equipped(target, 'reserve-torque-crank')) offer += Math.max(1, Math.round(offer * value(state, target, 'reserve-torque-crank', .1, .25)));
  const link = !phaseZeroStatsReady && state.allies.find(owner => owner.hp > 0 && equipped(owner, 'master-disciple-2') && (gear(owner).numbers.linkThrough ?? 0) >= state.round && gear(target).owners.link === owner.id);
  const legacyOverflow = Math.max(0, target.shatter + offer - target.stats.shatterCapacity);
  if (link) {
    const linked = alive(state).filter(ally => gear(ally).owners.link === link.id);
    for (const ally of linked) generatedGauge(target, ally, offer / linked.length, events, false, false, state);
  } else {
    const received = phaseZeroStatsReady ? phaseZeroGaugeOffer(offer, effectiveGaugeGain(state, target)) : offer;
    const overflow = Math.max(0, target.shatter + received - target.stats.shatterCapacity);
    generatedGauge(target, target, received, events, true, phaseZeroStatsReady, state);
    if (!phaseZeroStatsReady && overflow > 0 && equipped(target, 'clearwater-manifold')) {
      generatedGauge(target, lowestGauge(state, target), overflow * value(state, target, 'clearwater-manifold', .5, 1), events, false, false, state);
    }
    return;
  }
  const overflow = legacyOverflow;
  if (!phaseZeroStatsReady && overflow > 0 && equipped(target, 'clearwater-manifold')) {
    generatedGauge(target, lowestGauge(state, target), overflow * value(state, target, 'clearwater-manifold', .5, 1), events, false, false, state);
  }
}
export function recordConduitHit(ctx: ConduitActivation, target: Combatant, amount: number, critical: boolean,
  criticalMultiplier: number, overkill = 0, totalDamage = amount): void {
  ctx.hits.push({ target: target.id, damage: amount, totalDamage, critical, criticalMultiplier, ...(overkill > 0 ? { overkill } : {}) });
}
function adjustBurnTurns(owner: Combatant, target: Combatant, delta: number): void {
  target.burn.turns = Math.max(0, target.burn.turns + delta);
  const stored = owner.native?.burns?.[target.id];
  if (stored && target.burn.sourceId === owner.id && target.burn.origin !== 'conduit')
    stored.turns = target.burn.turns;
}
export function finishConduitAction(state: BattleState, owner: Combatant, ctx: ConduitActivation, events: BattleEvent[]): void {
  const n = gear(owner).numbers;
  if (phaseZeroStatsReady) {
    token(state, owner, 'triagePower', true);
    token(state, owner, 'triageEfficiency', true);
  }
  finishNativeHealing(state, owner, ctx, events);
  if (phaseZeroStatsReady && ctx.action === 'ultimate' && equipped(owner, 'master-nerithe-3') && (ctx.spent.survey ?? 0) > 0) {
    const grant = Math.min(.2, (ctx.spent.survey ?? 0) * .04);
    for (const ally of alive(state)) generatedGaugePercent(owner, ally, grant, events, state);
  }
  if (!phaseZeroStatsReady && equipped(owner, 'master-nerithe-2') && ctx.action === 'skill2') {
    for (const ally of alive(state)) {
      nativeGauge(state, ally, 15, events, true);
      ally.omnicProtection = 1 - (1 - (ally.omnicProtection ?? 0)) * .85;
    }
  }
  const damage = ctx.hits.reduce((sum, hit) => sum + hit.damage, 0) + ctx.nativeHpDamage;
  if (phaseZeroStatsReady && equipped(owner, 'duplex-heart') && ctx.healRecipients.some(id => id !== owner.id)) {
    generatedHeal(owner, owner, owner.stats.health * phaseZeroUpgradeMagnitude(.05, state.conduitUpgrades?.['duplex-heart'] ?? 0), events, state);
  }
  const critical = ctx.hits.find(hit => hit.critical && hit.damage > 0);
  if (phaseZeroStatsReady && ctx.hits.some(hit => hit.critical && (hit.totalDamage ?? hit.damage) > 0) &&
      equipped(owner, 'verdict-caliper'))
    generatedHeal(owner, owner, owner.stats.health * magnitude(state, 'verdict-caliper', .25), events, state);
  const primaryHit = ctx.hits[0];
  const target = state.enemies.find(enemy => enemy.id === primaryHit?.target);
  const killed = ctx.hits.some(hit => hit.damage > 0 && state.enemies.some(enemy => enemy.id === hit.target && enemy.hp <= 0));
  if (!phaseZeroStatsReady && critical && ctx.action !== 'ultimate' && equipped(owner, 'atmospheric-storm-clock'))
    n.stormCount = (n.stormCount ?? 0) + ctx.hits.filter(hit => hit.critical && hit.damage > 0).length;
  if (!phaseZeroStatsReady && !damage) n.previousSkill = 0;
  if (ctx.action === 'light') {
    n.normalRound = state.round;
    if (equipped(owner, 'atmospheric-skythread-rudder')) {
      if (phaseZeroStatsReady) {
        const recipient = lowestGaugePercentage(state, owner);
        if (recipient) grantToken(state, recipient, 'skyEfficiency', magnitude(state, 'atmospheric-skythread-rudder', .25));
      } else n.tailwind = (n.tailwind ?? 0) + 1;
    }
    if (phaseZeroStatsReady && equipped(owner, 'twinpulse-bellows')) {
      generatedGaugePercent(owner, owner, phaseZeroUpgradeMagnitude(.07, state.conduitUpgrades?.['twinpulse-bellows'] ?? 0), events, state);
      const other = alive(state).filter(ally => ally.id !== owner.id)
        .sort((a, b) => a.shatter / a.stats.shatterCapacity - b.shatter / b.stats.shatterCapacity)[0];
      generatedGaugePercent(owner, other, phaseZeroUpgradeMagnitude(.07, state.conduitUpgrades?.['twinpulse-bellows'] ?? 0), events, state);
    }
    if (equipped(owner, 'tranquilitic-kirin-cradle')) {
      const recipient = alive(state).sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0];
      if (phaseZeroStatsReady && recipient && recipient.hp === recipient.stats.health) {
        generatedGaugePercent(owner, recipient, phaseZeroUpgradeMagnitude(.08,
          state.conduitUpgrades?.['tranquilitic-kirin-cradle'] ?? 0), events, state);
      } else generatedHeal(owner, recipient, phaseZeroStatsReady && recipient
        ? Math.min(effectiveDefense(state, owner) * phaseZeroUpgradeMagnitude(1,
          state.conduitUpgrades?.['tranquilitic-kirin-cradle'] ?? 0), recipient.stats.health * .5)
        : effectiveDefense(state, owner) * value(state, owner, 'tranquilitic-kirin-cradle', .5, 1), events, state,
        phaseZeroStatsReady && recipient ? recipient.stats.health * .5 : Infinity);
    }
    if (equipped(owner, 'tectonic-atlas-bastion')) {
      n.tauntRound = state.round;
      for (const key of Object.keys(n)) if (key.startsWith('atlasGauge:')) delete n[key];
      for (const enemy of state.enemies.filter(enemy => enemy.hp > 0)) {
        applyTaunt(owner, enemy);
      }
    }
    if (!phaseZeroStatsReady && equipped(owner, 'master-vaelor-3')) {
      const ally = alive(state).filter(ally => ally.id !== owner.id && ally.spent && ally.recoverThrough < state.round).sort((a, b) => b.shatter - a.shatter)[0];
      if (ally) { ally.spent = false; emit(events, 'status', owner, ally, 1, `${owner.name} donates an action to ${ally.name}.`); }
    }
    if (phaseZeroStatsReady && equipped(owner, 'master-vaelor-3')) {
      const beat = owner.native?.beat;
      if (beat === 0 || beat === 2) for (const ally of alive(state).filter(ally => ally.id !== owner.id)) {
        if (beat === 0) grantToken(state, ally, 'vaelorCriticalRate', .25);
        else grantToken(state, ally, 'vaelorCriticalDamage', .4);
      }
    }
  }
  if (phaseZeroStatsReady && ctx.action === 'ultimate' && equipped(owner, 'chaotic-ouroboros-core')) {
    for (const ally of alive(state))
      timedConduitShield(state, owner, ally, ally.stats.health * magnitude(state, 'chaotic-ouroboros-core', .1),
        'chaotic-ouroboros-core', state.round + 1, events);
  }
  for (const id of owner.conduits ?? []) {
    if (!id) continue;
    switch (id) {
      case 'falcon-sight':
        if (!phaseZeroStatsReady && ctx.hits.length) n.noncritical = ctx.guaranteed || ctx.hits.some(hit => hit.critical) ? 0 : (n.noncritical ?? 0) + 1;
        break;
      case 'lifeline-flywheel':
        generatedHeal(owner, owner, ctx.hits.reduce((sum, hit) => sum + (phaseZeroStatsReady ? hit.totalDamage ?? hit.damage : hit.damage), 0) *
          (phaseZeroStatsReady ? phaseZeroUpgradeMagnitude(.1, state.conduitUpgrades?.[id] ?? 0) : value(state, owner, id, .08, .16)), events, state); break;
      case 'voltaic-thunderbird-coil':
        if (phaseZeroStatsReady) {
          if (ctx.action !== 'light' && critical && primaryHit && primaryHit.damage > 0) {
            const recipient = healthiestEnemy(state, primaryHit.target);
            if (recipient) generatedStrike(state, owner, recipient,
              primaryHit.damage * magnitude(state, id, .4), events);
            else for (const ally of alive(state).filter(ally => ally.id !== owner.id))
              grantToken(state, ally, 'thunderRate', magnitude(state, id, .2));
          }
          break;
        }
        for (const hit of ctx.hits.filter(hit => hit.critical && hit.damage > 0)) generatedStrike(state, owner, healthiestEnemy(state, hit.target), hit.damage * value(state, owner, id, .3, .6), events);
        break;
      case 'atmospheric-griffin-turbine':
        if (ctx.action === 'light' && damage > 0) {
          if (phaseZeroStatsReady) {
            const fraction = magnitude(state, id, .1);
            for (const ally of alive(state).filter(ally => ally.id !== owner.id))
              generatedGaugePercent(owner, ally, fraction, events, state);
          } else {
            const gauge = Math.min(25, Math.round(100 * damage / Math.max(1, owner.stats.damage) * value(state, owner, id, .15, .3)));
            for (const ally of alive(state).filter(ally => ally.id !== owner.id)) generatedGauge(owner, ally, gauge, events, false, false, state);
          }
        }
        break;
      case 'luminous-seraph-mirror':
        if (phaseZeroStatsReady) {
          if (critical && n.seraphRound !== state.round) {
            n.seraphRound = state.round;
            for (const ally of alive(state)) generatedHeal(owner, ally, ally.stats.health * magnitude(state, id, .06), events, state);
          }
          break;
        }
        for (const hit of ctx.hits.filter(hit => hit.critical && hit.damage > 0)) for (const ally of alive(state)) generatedHeal(owner, ally, hit.damage * value(state, owner, id, .08, .16), events);
        break;
      case 'chaotic-ouroboros-core':
        if (!phaseZeroStatsReady && ctx.action === 'ultimate') { generatedShield(owner, owner, n.excessShield ?? 0, events); delete n.excessShield; } break;
      case 'luminous-dawn-witness-array':
        if (phaseZeroStatsReady) {
          if (ctx.hits.length && !ctx.hits.some(hit => hit.critical)) {
            for (const ally of alive(state).filter(ally => ally.id !== owner.id))
              grantToken(state, ally, 'dawnRate', magnitude(state, id, .15));
            grantToken(state, owner, 'dawnDamage', magnitude(state, id, .3));
            grantToken(state, owner, 'dawnDirect', magnitude(state, id, 2));
          }
          break;
        }
        if (ctx.hits.some(hit => hit.critical)) {
          if (target?.hp && (n.witness ?? 0) > 0) { generatedStrike(state, owner, target, owner.stats.damage * n.witness * value(state, owner, id, .15, .3), events, false); n.witness = 0; }
        } else if (ctx.action === 'light') n.witness = (n.witness ?? 0) + 1;
        break;
      case 'ominous-nightglass-archive':
        if (ctx.action !== 'light') for (const hit of ctx.hits) {
          const enemy = state.enemies.find(enemy => enemy.id === hit.target && enemy.hp > 0);
          if (enemy && hit.damage > 0) {
            if (phaseZeroStatsReady) gear(enemy).numbers[`nightglass:${owner.id}`] = state.round + 1;
            else { enemy.conduitMarks ??= {}; enemy.conduitMarks[owner.id] = (enemy.conduitMarks[owner.id] ?? 0) + 1; }
          }
        }
        break;
      case 'tempered-strike-link':
        if (phaseZeroStatsReady) break;
        if (ctx.action === 'light') for (const hit of ctx.hits) {
          const enemy = state.enemies.find(enemy => enemy.id === hit.target && enemy.hp > 0 && enemy.burn.turns > 0 && enemy.burn.sourceId === owner.id && enemy.burn.origin !== 'conduit');
          if (!enemy) continue;
          const tick = conduitBurnTick(state, owner, enemy);
          adjustBurnTurns(owner, enemy, -1);
          generatedStrike(state, owner, enemy, tick * value(state, owner, id, .8, 1.6), events);
        }
        break;
      case 'mending-valve':
        if (phaseZeroStatsReady) {
          if (ctx.action !== 'light' && damage > 0) {
            const recipient = alive(state).sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0];
            if (recipient) generatedHeal(owner, recipient, damage * magnitude(state, id, .15), events, state,
              recipient.stats.health * .1);
          }
          break;
        }
        for (const hit of ctx.hits.filter(hit => hit.damage > 0 && state.enemies.some(enemy => enemy.id === hit.target && enemy.hp <= 0)))
          generatedHeal(owner, injured(state, owner), owner.stats.health * value(state, owner, id, .08, .16), events); break;
      case 'pulse-trigger-pawl':
        if (phaseZeroStatsReady && critical && (ctx.action === 'skill1' || ctx.action === 'skill2') &&
            n.pulseTriggerRound !== state.round) {
          n.pulseTriggerRound = state.round;
          for (const ally of alive(state).filter(ally => ally.id !== owner.id))
            generatedGaugePercent(owner, ally, phaseZeroUpgradeMagnitude(.08, state.conduitUpgrades?.[id] ?? 0), events, state);
        } else if (!phaseZeroStatsReady && critical && (ctx.action === 'skill1' || ctx.action === 'skill2')) {
          generatedGauge(owner, owner, value(state, owner, id, 8, 16), events, false, false, state);
        }
        break;
      case 'resonance-crucible':
        if (phaseZeroStatsReady) break;
        for (const hit of ctx.hits.filter(hit => (hit.overkill ?? 0) > 0))
          generatedStrike(state, owner, healthiestEnemy(state, hit.target),
            (hit.overkill ?? 0) * (phaseZeroStatsReady ? 1 : value(state, owner, id, .3, .6)), events);
        break;
      case 'flare-focusing-iris':
        if (phaseZeroStatsReady) break;
        if ((ctx.spent.ember ?? 0) > 0) for (const enemy of state.enemies.filter(enemy => enemy.hp > 0 && enemy.burn.turns > 0 &&
          enemy.burn.sourceId === owner.id && enemy.burn.origin !== 'conduit')) {
          const turns = ctx.spent.ember * step(state, id, 1, 2);
          adjustBurnTurns(owner, enemy, turns);
          emit(events, 'status', owner, enemy, turns, `${enemy.name}'s [Burn] lasts ${turns} more Enemy Turns.`);
        }
        break;
      case 'pressurecrest-governor':
        if (phaseZeroStatsReady) {
          if (ctx.action !== 'light' && critical && n.pressurecrestRound !== state.round) {
            n.pressurecrestRound = state.round;
            const recipient = alive(state).sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0];
            if (recipient) timedConduitShield(state, owner, recipient, recipient.stats.health * magnitude(state, id, .15),
              id, state.round, events);
          }
        } else if (critical) n.windveil = 1;
        break;
      case 'chaotic-fault-verdict':
        if (phaseZeroStatsReady) {
          if (owner.shield > 0 && critical && n.faultVerdictRound !== state.round) {
            const source = layers(owner).filter(layer => layer.amount > 0).sort((a, b) => b.amount - a.amount)[0]?.owner;
            const recipient = alive(state).find(ally => ally.id === source);
            if (recipient) {
              n.faultVerdictRound = state.round;
              grantToken(state, recipient, 'faultSkillPower', magnitude(state, id, .2));
            }
          }
          break;
        }
        for (const hit of ctx.hits.filter(hit => hit.critical && hit.damage > 0)) {
          const enemy = state.enemies.find(enemy => enemy.id === hit.target && enemy.hp > 0);
          if (enemy) generatedStrike(state, owner, enemy, payShield(owner, owner.shield) * value(state, owner, id, .5, 1), events);
        }
        break;
    }
  }
  if (phaseZeroStatsReady) {
    if (critical && equipped(owner, 'atmospheric-storm-clock')) {
      n.stormCount = (n.stormCount ?? 0) + 1;
      if (n.stormCount >= 3) {
        n.stormCount = 0;
        for (const ally of alive(state)) grantToken(state, ally, 'stormEfficiency',
          magnitude(state, 'atmospheric-storm-clock', .25));
      }
    }
    delete n.ruinselectRetained;
    if (ctx.spent.temperedAttack && ctx.spent.temperedSource >= 0) {
      const healer = state.allies[ctx.spent.temperedSource];
      if (healer?.hp > 0) grantToken(state, healer, 'temperedEfficiency', magnitude(state, 'tempered-strike-link', .2));
    }
    if (ctx.spent.secondbeatSource) {
      generatedGaugePercent(owner, state.allies[ctx.spent.secondbeatSource - 1],
        magnitude(state, 'secondbeat-rack', .08), events, state);
    }
    if (ctx.action !== 'light' && equipped(owner, 'covercharge-drum')) {
      if (damage > 0) grantToken(state, owner, 'coverOfferPower', magnitude(state, 'covercharge-drum', .2));
      if (ctx.healed > 0 || ctx.shieldRecipients.length)
        grantToken(state, owner, 'coverOfferEfficiency', magnitude(state, 'covercharge-drum', .15));
    }
    for (const enemy of state.enemies) {
      const memory = gear(enemy).numbers;
      for (const key of Object.keys(memory)) if (key.startsWith('soot:') && key.endsWith(`:${owner.id}`))
        delete memory[key];
    }
    for (const watcher of alive(state).filter(ally => ally.id !== owner.id && equipped(ally, 'secondbeat-rack'))) {
      if (primaryHit && primaryHit.damage > 0 && target && target.hp > 0) {
        gear(watcher).owners.secondbeatTarget = target.id;
        gear(watcher).owners.secondbeatSource = owner.id;
        grantToken(state, watcher, 'secondbeatPower', magnitude(state, 'secondbeat-rack', .35));
      }
    }
    if (ctx.action !== 'light') for (const hit of ctx.hits.filter(hit => (hit.totalDamage ?? hit.damage) > 0)) {
      const enemy = state.enemies.find(unit => unit.id === hit.target && unit.hp > 0);
      if (!enemy) continue;
      for (const source of alive(state).filter(ally => ally.id !== owner.id && equipped(ally, 'infernic-cinder-testament'))) {
        if (!(enemy.burn.sourceId === source.id && enemy.burn.turns > 0 ||
            (source.native?.burns?.[enemy.id]?.turns ?? 0) > 0)) continue;
        const key = `cinderPower:${source.id}`;
        const seen = `cinderCast:${source.id}:${enemy.id}`;
        if (ctx.spent[seen]) continue;
        ctx.spent[seen] = 1;
        gear(enemy).numbers[key] = Math.min(magnitude(state, 'infernic-cinder-testament', .6),
          (gear(enemy).numbers[key] ?? 0) + magnitude(state, 'infernic-cinder-testament', .15));
      }
    }
  }
  switch (owner.masterConduit) {
    case 'master-vaelor-1':
      if (phaseZeroStatsReady && ctx.action === 'ultimate') {
        const bonus = hasNativeIdentity(owner) && owner.native?.beat === 2 ? .6 : .3;
        for (const ally of alive(state).filter(ally => ally.id !== owner.id))
          grantToken(state, ally, 'vaelorSkillPower', bonus);
      }
      break;
    case 'master-ember-3':
      if (phaseZeroStatsReady && ctx.action === 'ultimate' &&
          state.enemies.some(enemy => enemy.hp > 0 && enemy.burn.turns > 0 &&
            enemy.burn.sourceId === owner.id && enemy.burn.origin !== 'conduit')) {
        for (const ally of alive(state).filter(ally => ally.id !== owner.id)) {
          grantToken(state, ally, 'emberSkillOwner', 1);
          gear(ally).owners.emberSkillOwner = owner.id;
        }
      }
      break;
    case 'master-razor-1':
      if (phaseZeroStatsReady && ctx.action === 'ultimate' && (ctx.spent.wounds ?? 0) > 0) for (const ally of alive(state).filter(ally => ally.id !== owner.id))
        generatedHeal(owner, ally, (ctx.spent.wounds ?? 0) * .2, events, state, ally.stats.health * .15);
      break;
    case 'master-razor-3':
      if (phaseZeroStatsReady && ctx.action === 'skill1' && (ctx.spent.wounds ?? 0) > 0) for (const ally of alive(state).filter(ally => ally.id !== owner.id))
        grantToken(state, ally, 'razorCriticalRate', .3);
      break;
    case 'master-rosetta-3':
      if (ctx.action === (phaseZeroStatsReady ? 'skill2' : 'ultimate')) {
        const quarryId = owner.native?.quarry?.target;
        const quarry = state.enemies.find(enemy => enemy.id === quarryId && enemy.hp > 0);
        if (quarry && phaseZeroStatsReady) for (const ally of alive(state).filter(ally => ally.id !== owner.id)) {
          grantToken(state, ally, 'rosettaTarget', 1);
          gear(ally).owners.rosettaTarget = quarry.id;
        } else if (!phaseZeroStatsReady) for (const enemy of state.enemies.filter(enemy => enemy.hp > 0 &&
          (hasNativeIdentity(owner) ? enemy.id === owner.native?.quarry?.target : enemy.weakened > 0 && enemy.weakenSourceId === owner.id))) {
          const memory = gear(enemy).numbers, key = `opening:${owner.id}`;
          memory[key] = (memory[key] ?? 0) + 1;
        }
      }
      break;
    case 'master-bruno-3':
      if (phaseZeroStatsReady && hasNativeIdentity(owner) && ctx.action === 'skill1' && damage > 0 && target?.hp) {
        gear(target).numbers.brunoDefenseThrough = state.round + 1;
      } else if (!phaseZeroStatsReady && hasNativeIdentity(owner) && ctx.action === 'skill1' && damage > 0 && target?.hp) {
        const memory = gear(target).numbers;
        const base = memory.entryDefense ?? target.stats.defense;
        memory.excavated = (memory.excavated ?? 0) + base * .15;
        emit(events, 'status', owner, target, memory.excavated, `${target.name}'s Battle-start Defense is excavated.`);
      }
      break;
    case 'master-sprout-2':
      if (!phaseZeroStatsReady && ctx.action === 'skill1' && damage > 0 && target && target.hp > 0 && !gear(target).numbers[`rooted:${owner.id}`]) {
        gear(target).numbers[`rooted:${owner.id}`] = 1; gear(target).numbers.rootbind = 1;
      } break;
    case 'master-sprout-3':
      if (ctx.action === 'ultimate' && !n.worldseedRevived) {
        const fallen = state.allies.filter(ally => ally.id !== owner.id && ally.hp <= 0);
        if (fallen.length) n.worldseedRevived = 1;
        for (const ally of fallen) revive(state, owner, ally, phaseZeroStatsReady ? .35 : .3, events);
      } break;
    case 'master-atmoso-2':
      if (!phaseZeroStatsReady && ctx.action === 'skill2') { n.counterwindActive = 1; n.counterwind = 0; } break;
    case 'master-aurora-2':
      if (!phaseZeroStatsReady && ctx.action === 'ultimate') for (const enemy of state.enemies.filter(enemy => enemy.hp > 0)) gear(enemy).numbers.judgmentThrough = state.round + 1;
      break;
    case 'master-bliss-3':
      if (!phaseZeroStatsReady && ctx.action === 'ultimate') {
        const ally = alive(state).filter(ally => ally.id !== owner.id && !ally.kit?.unavailableActions?.includes('skill1'))
          .sort((a, b) => a.shatter - b.shatter)[0];
        if (ally) gear(ally).numbers.quietFeather = (gear(ally).numbers.quietFeather ?? 0) + 1;
      } break;
    case 'master-disciple-2':
      if (!phaseZeroStatsReady && ctx.action === 'ultimate') {
        n.linkThrough = state.round + 2;
        for (const ally of alive(state)) gear(ally).owners.link = owner.id;
      } break;
    case 'master-disciple-3':
      if (!phaseZeroStatsReady && ctx.action === 'skill1') {
        const instructed = alive(state).find(ally => ally.native?.instruction?.owner === owner.id &&
          ally.native.instruction.kind === 'strike');
        const ally = hasNativeIdentity(owner) ? instructed :
          alive(state).filter(ally => ally.id !== owner.id).sort((a, b) => b.stats.damage - a.stats.damage)[0];
        const victim = hasNativeIdentity(owner) ? state.enemies.find(enemy => enemy.hp > 0) : target;
        if (ally && victim?.hp && (hasNativeIdentity(owner) || damage > 0)) {
          if (!ally.kit) throw new Error('The assisting squad member has no frozen ability kit.');
          const passive = ally.hp <= ally.stats.health / 2 ? 1 + ally.kit.passive.damageBonus : 1;
          const buff = ally.attackBoost && ally.attackBoost.throughRound >= state.round ? 1 + ally.attackBoost.fraction : 1;
          generatedStrike(state, ally, victim, ally.stats.damage * .4 * passive * buff, events, false);
        }
      } break;
    case 'master-elise-3':
      if (phaseZeroStatsReady && (ctx.spent.eliseRecallCount ?? 0) >= 2) {
        for (const ally of alive(state).filter(ally => ally.id !== owner.id)) {
          grantToken(state, ally, 'eliseCriticalDamage', .4);
          if (ctx.spent.eliseSameTarget) grantToken(state, ally, 'eliseCriticalRate', .15);
        }
      } else if (!phaseZeroStatsReady && killed && owner.recoverThrough < state.round) owner.spent = false;
      break;
    case 'master-rosetta-2':
      if (phaseZeroStatsReady && hasNativeIdentity(owner) && ctx.action === 'ultimate') {
        const quarry = owner.native?.quarry;
        if (quarry?.round === state.round) for (const ally of alive(state).filter(ally =>
          quarry.contributors.includes(ally.id))) {
          generatedHeal(owner, ally, ally.stats.health * .08, events, state);
          if (ally.id !== owner.id) grantToken(state, ally, 'rosettaSkillEfficiency', .2);
        }
      } else if (!phaseZeroStatsReady &&
          ((ctx.action === 'skill2' && hasNativeIdentity(owner)) || (ctx.action === 'skill1' && (ctx.spent.roseGrace ?? 0) > 0))) {
        for (const enemy of state.enemies.filter(enemy => enemy.hp > 0 && enemy.id !== target?.id))
          generatedStrike(state, owner, enemy, (primaryHit?.damage ?? 0) * .25, events);
      } break;
    case 'master-thornia-3':
      if (!phaseZeroStatsReady && ctx.action === 'skill1') for (const ally of alive(state).filter(ally => ally.id !== owner.id)) {
        gear(ally).owners.guardian = owner.id; gear(ally).numbers.guardianRound = state.round;
      } break;
    case 'master-crinso-1':
      if (phaseZeroStatsReady && hasNativeIdentity(owner) && ctx.action === 'ultimate' &&
          (ctx.spent.duality ?? 0) > 0) {
        const bonus = Math.min(.6, .15 * (ctx.spent.duality ?? 0));
        for (const ally of alive(state).filter(ally => ally.id !== owner.id))
          grantToken(state, ally, 'crinsoCriticalDamage', bonus);
      } else if (!phaseZeroStatsReady && ctx.action === 'skill1' && primaryHit?.critical && target?.hp) {
        if (hasNativeIdentity(owner)) n.goldImprint = (n.goldImprint ?? 0) + Math.max(0, primaryHit.criticalMultiplier - 1);
        else gear(target).numbers[`imprint:${owner.id}`] = primaryHit.criticalMultiplier;
      }
      break;
    case 'master-crinso-2':
      if (phaseZeroStatsReady && hasNativeIdentity(owner) && ctx.spent.goldenEdge &&
          ctx.action === 'skill1') {
        const recipient = alive(state).sort((a, b) =>
          (a.hp / a.stats.health) - (b.hp / b.stats.health))[0];
        if (recipient) timedConduitShield(state, owner, recipient, recipient.stats.health * .12,
          'master-crinso-2', state.round, events);
      } else if (!phaseZeroStatsReady && hasNativeIdentity(owner) && ctx.action === 'skill2' &&
          target?.hp && ctx.shieldBurn > 0)
        generatedStrike(state, owner, target, ctx.shieldBurn, events, false);
      break;
    case 'master-crinso-3':
      if (phaseZeroStatsReady) {
        const combo = ctx.spent.crinsoCombo ?? 0;
        if (combo > 0) {
          const recipients = combo >= 3 ? alive(state) : alive(state).sort((a, b) =>
            a.hp / a.stats.health - b.hp / b.stats.health).slice(0, 1);
          for (const recipient of recipients)
            generatedHeal(owner, recipient, recipient.stats.health * .08, events, state);
        }
      } else {
        if (!ctx.hits.length) break;
        if (ctx.action === 'ultimate' || n.crimson) generatedHeal(owner, owner, damage * .2, events);
        n.crimson = ctx.action === 'ultimate' ? 0 : n.crimson ? 0 : 1;
      }
      break;
    case 'master-nerithe-1':
      if (ctx.action === 'light' && target?.hp) gear(target).owners.chart = owner.id;
      break;
    case 'master-orvella-2':
      if (!phaseZeroStatsReady && ctx.action === 'skill2') {
        const allies = alive(state).filter(ally => ally.hp < ally.stats.health);
        if (allies.length) {
          const reserve = hasNativeIdentity(owner) ? owner.native?.foundation?.durability ?? 0 : owner.shield;
          const amount = Math.min(reserve, allies.length * Math.min(...allies.map(ally => ally.stats.health - ally.hp)));
          let total = 0;
          for (const ally of allies) total += generatedHeal(owner, ally, Math.floor(amount / allies.length), events, state);
          if (hasNativeIdentity(owner) && owner.native?.foundation) owner.native.foundation.durability -= total;
          else payShield(owner, total);
        }
      } break;
    case 'master-vaelor-2':
      if (ctx.action === 'skill2' && (hasNativeIdentity(owner) ? owner.native?.beat === 1 : (ctx.spent.tempest ?? 0) > 0)) {
        if (phaseZeroStatsReady) {
          const fraction = .2 * ctx.skillPower;
          const throughRound = state.round + 1 + ctx.skillDuration;
          for (const ally of alive(state)) {
            const prior = ally.attackBoost && ally.attackBoost.throughRound >= state.round ? ally.attackBoost.fraction : 0;
            if (prior <= fraction)
              ally.attackBoost = { fraction, throughRound, sourceId: owner.id, origin: 'native' };
            const numbers = gear(ally).numbers;
            numbers.gaugeGainBonus = .2;
            numbers.gaugeGainThrough = throughRound;
          }
        } else for (const hit of ctx.hits) {
          const enemy = state.enemies.find(enemy => enemy.id === hit.target && enemy.hp > 0);
          if (enemy && (enemy.weakened <= 0 || enemy.weakenFraction < .15)) { enemy.weakened = 1; enemy.weakenFraction = .15; enemy.weakenSourceId = owner.id; enemy.weakenOrigin = 'conduit'; }
        }
      } break;
  }
  for (const flora of alive(state).filter(ally => !phaseZeroStatsReady && equipped(ally, 'master-sprout-1'))) {
    if (ctx.action !== 'skill1' && ctx.action !== 'skill2') continue;
    for (const ally of alive(state)) nativeHeal(state, flora, ally, ally.stats.health * .02, events, false);
  }
  if (!ctx.all && damage > 0) {
    for (const nerithe of alive(state).filter(ally => !phaseZeroStatsReady && ally.id !== owner.id && equipped(ally, 'master-nerithe-1'))) {
      for (const enemy of state.enemies.filter(enemy => enemy.hp > 0 && enemy.id !== target?.id && gear(enemy).owners.chart === nerithe.id)) generatedStrike(state, owner, enemy, damage * .4, events);
      for (const enemy of state.enemies) if (gear(enemy).owners.chart === nerithe.id) delete gear(enemy).owners.chart;
    }
  }
  afterCalamiticAction(state, owner, ctx.action, events,
    ctx.action === 'light' ? 0 : ctx.hits.reduce((sum, hit) => sum + (hit.totalDamage ?? hit.damage), 0) +
      ctx.nativeHpDamage + ctx.nativeShieldDamage);
}
function revive(state: BattleState, owner: Combatant, target: Combatant, fraction: number, events: BattleEvent[]): void {
  if (phaseZeroStatsReady) {
    if (gear(target).numbers.rescueUsed) return;
    gear(target).numbers.rescueUsed = 1;
    target.hp = 1;
    refreshConduitStats(state);
  }
  target.hp = Math.max(1, Math.round(target.stats.health * fraction)); target.shatter = 0;
  emit(events, 'heal', owner, target, target.hp, `${target.name} is revived by a Conduit at ${target.hp} HP.`);
}
function rescue(state: BattleState, target: Combatant, loss: number, events: BattleEvent[], direct: boolean): number {
  if (loss < target.hp) return loss;
  const n = gear(target).numbers;
  if (phaseZeroStatsReady && n.rescueUsed) return loss;
  const accord = state.allies.find(owner => owner.id === gear(target).owners.accord &&
    (!phaseZeroStatsReady || owner.hp > 0));
  if (direct && accord) {
    delete gear(target).owners.accord;
    if (phaseZeroStatsReady) {
      n.rescueUsed = 1;
      grantToken(state, target, 'accordEfficiency', magnitude(state, 'tranquilitic-accord-bastion', .25));
    } else n.accordShield = accord.stats.health * value(state, accord, 'tranquilitic-accord-bastion', .1, .2);
    return Math.max(0, target.hp - 1);
  }
  if (direct && !phaseZeroStatsReady && equipped(target, 'horizon-heartcase')) {
    // Each save costs 10 more Gauge than the last, so the drain always runs out.
    const saves = n.heartcaseSaves ?? 0;
    const excess = loss - target.hp + 1;
    const cost = Math.max(1, Math.ceil(excess / (target.stats.health * .01) * (1 - value(state, target, 'horizon-heartcase', .2, .5)))) + 10 * saves;
    if (target.shatter >= cost) {
      target.shatter -= cost; n.heartcaseSaves = saves + 1;
      emit(events, 'status', target, target, cost, `${target.name}'s Horizon Heartcase drains ${cost} Elemental Gauge to stay standing.`);
      return Math.max(0, target.hp - 1);
    }
  }
  return loss;
}
export function afterConduitHpLoss(state: BattleState, target: Combatant, events: BattleEvent[]): void {
  const n = gear(target).numbers;
  if (n.accordShield) { generatedShield(target, target, n.accordShield, events); delete n.accordShield; }
  if (target.hp <= 0 && equipped(target, 'infernic-phoenix-reactor') && !n.phoenixUsed &&
      (!phaseZeroStatsReady || !n.rescueUsed)) {
    n.phoenixUsed = 1;
    revive(state, target, target, phaseZeroStatsReady ? magnitude(state, 'infernic-phoenix-reactor', .35) : value(state, target, 'infernic-phoenix-reactor', .25, .5), events);
    if (phaseZeroStatsReady) for (const ally of alive(state).filter(ally => ally.id !== target.id))
      timedConduitShield(state, target, ally, ally.stats.health * magnitude(state, 'infernic-phoenix-reactor', .15),
        'infernic-phoenix-reactor', state.round, events);
  }
}
export function conduitBurnTick(state: BattleState, owner: Combatant, target: Combatant): number {
  if (target.burn.origin === 'conduit') return target.burn.damage;
  const n = gear(target).numbers;
  if (phaseZeroStatsReady) return Math.round(target.burn.damage * (1 + (n[`cinderPower:${owner.id}`] ?? 0)));
  const cinderKey = `cinder:${owner.id}`, imprint = `imprint:${owner.id}`;
  let bonus = 0;
  if (equipped(owner, 'infernic-cinder-testament')) bonus += (n[cinderKey] ?? 0) * value(state, owner, 'infernic-cinder-testament', .2, .4);
  return Math.round(target.burn.damage * (1 + bonus) * (n[imprint] ?? 1));
}
export function afterConduitBurn(state: BattleState, owner: Combatant, target: Combatant, damage: number, events: BattleEvent[]): void {
  if (target.burn.origin !== 'conduit') delete gear(target).numbers[`imprint:${owner.id}`];
  if (damage <= 0 || target.burn.origin === 'conduit') return;
  if (phaseZeroStatsReady) for (const source of alive(state).filter(ally => equipped(ally, 'emberlife-kiln')))
    for (const recipient of alive(state))
      generatedHeal(source, recipient, recipient.stats.health * magnitude(state, 'emberlife-kiln', .08), events, state);
  const tn = gear(target).numbers, n = gear(owner).numbers;
  if (phaseZeroStatsReady && equipped(owner, 'master-ember-1'))
    n.masterEmberBurnDamage = (n.masterEmberBurnDamage ?? 0) + damage;
  if (!phaseZeroStatsReady) tn[`cinder:${owner.id}`] = (tn[`cinder:${owner.id}`] ?? 0) + 1;
  if (!phaseZeroStatsReady && owner.hp > 0 && equipped(owner, 'emberlife-kiln'))
    generatedHeal(owner, owner, damage * value(state, owner, 'emberlife-kiln', .2, .4), events);
  if (equipped(owner, 'sootwake-crucible') && target.hp > 0) {
    if (phaseZeroStatsReady) {
      for (const ally of alive(state).filter(ally => ally.id !== owner.id))
        tn[`soot:${owner.id}:${ally.id}`] = state.round + 1;
    } else {
      const serialKey = `sootSerial:${owner.id}`;
      const serial = (tn[serialKey] ?? 0) + 1;
      tn[serialKey] = serial;
      tn[`soot:${owner.id}:${serial}`] = state.round + 1;
    }
  }
  if (!phaseZeroStatsReady && target.burn.turns === 0 && target.hp > 0 && owner.hp > owner.stats.health * .5 && equipped(owner, 'master-ember-1') &&
      owner.hp - owner.stats.health * .03 >= 1) {
    owner.hp -= owner.stats.health * .03; target.burn.turns = 1;

    emit(events, 'status', owner, target, 1, `${owner.name} pays HP to sustain Burn for one phase.`);
  }
  if (target.burn.turns <= 0) { delete tn[`cinder:${owner.id}`]; }
}
export function conduitDeaths(state: BattleState, previous: BattleState, events: BattleEvent[]): void {
  for (const enemy of state.enemies.filter(enemy => enemy.hp <= 0 && previous.enemies.some(prior => prior.id === enemy.id && prior.hp > 0))) {
    if (gear(enemy).numbers.deathProcessed) continue;
    gear(enemy).numbers.deathProcessed = 1;
    const owner = state.allies.find(ally => ally.id === enemy.burn.sourceId);
    if (owner && enemy.burn.turns > 0 && enemy.burn.origin !== 'conduit' && equipped(owner, 'cinder-metering-nozzle')) {
      const target = healthiestEnemy(state);
      const damage = phaseZeroStatsReady
        ? conduitBurnTick(state, owner, enemy) * enemy.burn.turns
        : conduitBurnTick(state, owner, enemy) * value(state, owner, 'cinder-metering-nozzle', .25, .5);
      if (phaseZeroStatsReady) generatedStrike(state, owner, target, damage, events);
      else if (target && (target.burn.turns <= 0 || target.burn.damage < damage))
        target.burn = { damage, turns: enemy.burn.turns, sourceId: owner.id, origin: 'conduit' };
    }
    const suppressor = state.allies.find(ally => ally.id === enemy.weakenSourceId);
    if (!phaseZeroStatsReady && suppressor && enemy.weakened > 0 && enemy.weakenOrigin !== 'conduit' && equipped(suppressor, 'secondbeat-rack')) {
      const target = state.enemies.filter(unit => unit.hp > 0).sort((a, b) => b.stats.damage - a.stats.damage)[0];
      const fraction = enemy.weakenFraction * value(state, suppressor, 'secondbeat-rack', .6, 1);
      if (target) {
        target.weakened = enemy.weakened; target.weakenFraction = fraction; target.weakenSourceId = suppressor.id; target.weakenOrigin = 'conduit';
        emit(events, 'status', suppressor, target, fraction, `${target.name} receives [Weaken].`);
      }
    }
  }
}
function applyTaunt(owner: Combatant, enemy: Combatant): void {
  const memory = gear(enemy);
  memory.owners.taunt = owner.id;
  memory.numbers.tauntSequence = (memory.numbers.tauntSequence ?? 0) + 1;
  memory.numbers[`taunt:${owner.id}`] = memory.numbers.tauntSequence;
}
export function forcedConduitTarget(state: BattleState, enemy: Combatant, randomTarget: Combatant): Combatant {
  const memory = gear(enemy);
  const owner = alive(state).filter(ally => memory.numbers[`taunt:${ally.id}`] &&
    ((equipped(ally, 'master-tide-3') && enemy.weakened > 0 && enemy.weakenSourceId === ally.id) ||
      (equipped(ally, 'tectonic-atlas-bastion') && gear(ally).numbers.tauntRound === state.round)))
    .sort((a, b) => memory.numbers[`taunt:${b.id}`] - memory.numbers[`taunt:${a.id}`])[0];
  if (owner) memory.owners.taunt = owner.id;
  else delete memory.owners.taunt;
  return owner ?? randomTarget;
}
export function conduitSuppressSkill(enemy: Combatant): boolean {
  const n = gear(enemy).numbers;
  if (!n.rootbind && !n.silence) return false;
  delete n.rootbind; delete n.silence;
  return true;
}
function nativeShieldActivationMultiplier(enemy: Combatant, target: Combatant): number {
  const memory = gear(enemy);
  const prefix = 'nativeWardReduction:';
  if (enemy.native === undefined) {
    for (const key of Object.keys(memory.numbers)) if (key.startsWith(prefix)) delete memory.numbers[key];
  }
  const key = `${prefix}${target.id}`;
  if (memory.numbers[key] !== undefined) return memory.numbers[key];
  let multiplier = 1;
  for (const layer of layers(target)) {
    if (!layer.native || !layer.firstReduction || layer.firstReduction <= 0) continue;
    multiplier *= 1 - Math.min(1, layer.firstReduction);
    delete layer.firstReduction;
  }
  if (multiplier < 1) memory.numbers[key] = multiplier;
  return multiplier;
}
function absorbEnemyDamage(state: BattleState, target: Combatant, amount: number, events: BattleEvent[]) {
  const shieldBefore = target.shield;
  const reduction = phaseZeroStatsReady && equipped(target, 'pale-bulwark-diadem')
    ? magnitude(state, 'pale-bulwark-diadem', .5) : 0;
  const covered = Math.min(amount, shieldBefore / (1 - reduction));
  const absorbed = consumeShield(target, covered * (1 - reduction));
  let loss = Math.max(0, amount - covered);
  const n = gear(target).numbers;
  if (phaseZeroStatsReady && shieldBefore > 0 && target.shield <= 0 && loss > 0 &&
      equipped(target, 'stasis-reliquary') && n.stasisPenalty !== state.round &&
      roll(state) < stasisChancePercent(state.conduitUpgrades?.['stasis-reliquary'] ?? 0) / 100) {
    n.stasisPenalty = state.round + 1;
    loss = 0;
    emit(events, 'status', target, target, 1, `${target.name}'s [Stasis Reliquary] prevents this hit's [Shield] spillover; next [Enemy Turn], take 25% more damage from enemy [Attack Actions].`);
  }
  return { absorbed, loss, covered };
}
export function conduitIncoming(state: BattleState, enemy: Combatant, target: Combatant, damage: number, critical: boolean,
  scheduled: boolean, events: BattleEvent[], action: ActionId = scheduled ? 'skill1' : 'light'): void {
  const n = gear(target).numbers;
  if (!scheduled && n.windveil && n.windveilRound !== state.round - 1) {
    delete n.windveil; n.windveilRound = state.round;
    emit(events, 'status', target, target, 0, `${target.name}'s Windveil avoids the Normal Attack.`);
    return;
  }
  const shieldBefore = target.shield;
  let equipmentMultiplier = 1;
  if (phaseZeroStatsReady && n.stasisPenalty === state.round) equipmentMultiplier *= 1.25;
  for (const keeper of alive(state).filter(ally => !phaseZeroStatsReady && equipped(ally, 'firstlight-cam'))) {
    const memory = gear(keeper).numbers;
    memory.firstlightRound ??= state.round;
    if (memory.firstlightRound === state.round) equipmentMultiplier *= 1 - value(state, keeper, 'firstlight-cam', .25, .5);
  }
  if (!phaseZeroStatsReady && critical && equipped(target, 'sentinel-aperture')) equipmentMultiplier *= 1 - value(state, target, 'sentinel-aperture', .25, .5);
  if (!phaseZeroStatsReady && target.hp > target.stats.health * .75 && equipped(target, 'pale-bulwark-diadem')) equipmentMultiplier *= 1 - value(state, target, 'pale-bulwark-diadem', .15, .3);
  if (phaseZeroStatsReady && critical && layers(target).some(layer => layer.native && layer.amount > 0 &&
      alive(state).some(owner => owner.id === layer.owner && equipped(owner, 'aegis-return-spring'))))
    equipmentMultiplier *= 1 - magnitude(state, 'aegis-return-spring', .3);
  if (!phaseZeroStatsReady && n.tauntRound === state.round && equipped(target, 'tectonic-atlas-bastion')) equipmentMultiplier *= 1 - value(state, target, 'tectonic-atlas-bastion', .1, .2);
  if (phaseZeroStatsReady && target.side === 'ally') {
    const thornia = alive(state).find(ally => equipped(ally, 'master-thornia-3') &&
      ally.id !== target.id && (ally.native?.traps?.[enemy.id]?.charges ?? 0) > 0);
    if (thornia) equipmentMultiplier *= .85;
  }
  const parryKey = `parry:${target.id}`;
  const enemyMemory = gear(enemy).numbers;
  // Reuse the first parry across one skill's impacts, not across later enemy activations.
  if (!enemy.native) delete enemyMemory[parryKey];
  const hasParry = !phaseZeroStatsReady && scheduled && n.normalRound === state.round && equipped(target, 'master-razor-1') &&
    (n.parryRound !== state.round || enemyMemory[parryKey] === state.round);
  if (hasParry) { n.parryRound = state.round; enemyMemory[parryKey] = state.round; }
  const wardMultiplier = nativeShieldActivationMultiplier(enemy, target);
  const nativeMultiplier = nativeIncomingMultiplier(state, enemy, target, action, events) * wardMultiplier;
  const temporaryMultiplier = (parry: boolean) => equipmentMultiplier * nativeMultiplier * (parry ? .5 : 1);
  const totalMultiplier = (parry: boolean) => temporaryMultiplier(parry);
  let reflection = 0;
  const beforeParry = damage * totalMultiplier(false);
  let offered = damage * totalMultiplier(hasParry);
  if (hasParry) {
    reflection = Math.max(0, beforeParry - offered) * .5;
  }
  if (!phaseZeroStatsReady && equipped(target, 'stasis-reliquary') && offered > target.stats.health * .2) {
    offered = target.stats.health * .2 + (offered - target.stats.health * .2) * (1 - value(state, target, 'stasis-reliquary', .3, .6));
  }
  if (phaseZeroStatsReady) offered = Math.max(damage * .2, offered);
  if (phaseZeroStatsReady && n.tauntRound === state.round && equipped(target, 'tectonic-atlas-bastion') &&
      firstEnemyAttackTrigger(enemy, `atlas:${target.id}`)) {
    for (const ally of alive(state).filter(ally => ally.id !== target.id)) {
      grantCappedGaugePercent(state, target, ally,
        phaseZeroUpgradeMagnitude(.04, state.conduitUpgrades?.['tectonic-atlas-bastion'] ?? 0),
        phaseZeroUpgradeMagnitude(.12, state.conduitUpgrades?.['tectonic-atlas-bastion'] ?? 0),
        `atlasGauge:${ally.id}:${state.round}`, events);
    }
  }
  let remaining = Math.max(1, Math.round(offered));
  const postMitigation = remaining;
  remaining = nativeRouteDamage(state, enemy, target, remaining, events,
    (recipient, redirected) => routedDamage(state, enemy, recipient, redirected, events, true));
  const networks = alive(state).filter(ally => !phaseZeroStatsReady && equipped(ally, 'oceanic-shared-tide-pump') &&
    layers(target).some(layer => layer.native && layer.owner === ally.id && layer.amount > 0));
  for (const network of networks) {
    let budget = remaining;
    for (const ally of alive(state).filter(ally => ally.id !== target.id)) {
      const list = layers(ally);
      const available = list.filter(layer => layer.native && layer.owner === network.id).reduce((sum, layer) => sum + layer.amount, 0);
      const amount = Math.min(budget, available);
      if (amount <= 0) continue;
      let consume = amount;
      for (const layer of list.filter(layer => layer.native && layer.owner === network.id)) { const spent = Math.min(consume, layer.amount); layer.amount -= spent; ally.shield -= spent; consume -= spent; }
      budget -= amount; remaining -= amount;
      pilotAuthoredShieldAbsorbed(state, network.id, amount, events);
      absorbedNative(state, network, ally, enemy, amount, false, events);
      emit(events, 'shield', network, ally, -amount, `${ally.name}'s linked shield absorbs ${amount} for ${target.name}.`);
    }
  }
  const shieldResult = absorbEnemyDamage(state, target, remaining, events);
  const { absorbed } = shieldResult;
  let loss = shieldResult.loss;
  if (!phaseZeroStatsReady && shieldBefore > 0 && target.shield <= 0 && absorbed.absorbed > 0 && equipped(target, 'fieldbrace-coupler')) n.fieldbraceRound = state.round + 1;
  for (const [id, amount] of absorbed.native) {
    const owner = state.allies.find(ally => ally.id === id);
    if (!owner) continue;
    const broke = absorbed.broken.has(id);
    const guardKey = phaseZeroStatsReady ? 'tideGuard' : `tideGuard:${id}`;
    if (!phaseZeroStatsReady && equipped(owner, 'master-tide-1') && broke && !n[guardKey]) { n[guardKey] = 1; loss = 0; }
    pilotAuthoredShieldAbsorbed(state, id, amount, events);
    absorbedNative(state, owner, target, enemy, amount, broke, events);
  }
  if (absorbed.absorbed > 0 && target.hp > 0) {
    if (!phaseZeroStatsReady && equipped(target, 'aegis-capacitor')) generatedGauge(target, target, value(state, target, 'aegis-capacitor', 4, 8), events, false, false, state);
    if (!phaseZeroStatsReady && equipped(target, 'tidebound-reflector'))
      generatedStrike(state, target, enemy, absorbed.absorbed * value(state, target, 'tidebound-reflector', .2, .4), events);
  }
  if (!phaseZeroStatsReady && equipped(target, 'master-bruno-1')) loss *= .8;
  const guardian = state.allies.find(ally => ally.id === gear(target).owners.guardian && ally.hp > 0);
  if (guardian && loss >= target.hp && n.guardianRound === state.round) {
    const routed = loss - target.hp + 1;
    loss -= routed; routedDamage(state, enemy, guardian, routed, events);
  }
  loss = deferCalamiticDamage(state, target, loss, events);
  loss = Math.min(target.hp, rescue(state, target, loss, events, true));
  const fullyAbsorbedNative = loss === 0 && shieldResult.covered >= postMitigation
    ? new Map([...absorbed.native].filter(([, amount]) => amount >= absorbed.absorbed))
    : new Map<string, number>();
  nativeAbsorbedHit(state, target, fullyAbsorbedNative, loss, events);
  nativeGauge(state, target, shatterGauge.incomingHit, events);
  loss = Math.min(target.hp, loss);
  target.hp -= loss;
  refreshConduitStats(state);
  bankCalamiticDamage(state, loss);
  emit(events, 'damage', enemy, target, loss, `${target.name}: ${Math.round(loss)} damage${critical ? ' (critical)' : ''}${absorbed.absorbed ? `, ${Math.round(absorbed.absorbed)} shield absorbed` : ''}.`, true);
  events[events.length - 1].shieldAbsorbed = absorbed.absorbed;
  events[events.length - 1].critical = critical;
  nativeDirectHpLoss(state, target, loss, events);
  afterConduitHpLoss(state, target, events);
  if (target.hp <= 0) allyFell(state, target, events);
  if (reflection > 0) generatedStrike(state, target, enemy, reflection, events);
  if (loss > 0) {
    n.phaseLoss = (n.phaseLoss ?? 0) + loss;
    if (!phaseZeroStatsReady && target.hp > 0 && equipped(target, 'duplex-heart')) generatedHeal(target, injured(state, target, true), target.stats.health * value(state, target, 'duplex-heart', .05, .1), events);
    const aurora = !phaseZeroStatsReady
      ? state.allies.find(ally => ally.hp > 0 && equipped(ally, 'master-aurora-3') && nativeControl(state, ally, enemy))
      : undefined;
    if (aurora) {
      const an = gear(aurora).numbers;
      const recipient = alive(state).filter(ally => ally.id !== target.id && ally.hp < ally.stats.health).sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0];
      generatedHeal(aurora, recipient, loss * .5, events);
    }
  }
  if (target.hp > 0) {
    if (!phaseZeroStatsReady && n.counterwindActive) n.counterwind = (n.counterwind ?? 0) + .15;
  }
}
function allyFell(state: BattleState, fallen: Combatant, events: BattleEvent[]): void {
  if (phaseZeroStatsReady) return;
  for (const owner of alive(state).filter(ally => ally.id !== fallen.id && equipped(ally, 'covercharge-drum'))) {
    const heal = value(state, owner, 'covercharge-drum', .1, .2), gauge = value(state, owner, 'covercharge-drum', 20, 40);
    for (const ally of alive(state)) {
      generatedHeal(owner, ally, ally.stats.health * heal, events);
      generatedGauge(owner, ally, gauge, events, false, false, state);
    }
  }
}
function routedDamage(state: BattleState, enemy: Combatant, target: Combatant, amount: number, events: BattleEvent[], nativeRedirect = false): void {
  const n = gear(target).numbers;
  if (phaseZeroStatsReady && n.stasisPenalty === state.round) amount = Math.round(amount * 1.25);
  const { loss: remaining } = absorbEnemyDamage(state, target, amount, events);
  const loss = Math.min(target.hp, remaining);
  const wasStanding = target.hp > 0;
  target.hp -= loss;
  emit(events, 'damage', enemy, target, loss, `${target.name} intercepts ${Math.round(amount)} damage (Conduit routing).`);
  if (nativeRedirect) {
    events[events.length - 1].origin = 'native';
    events[events.length - 1].nativeKind = 'redirect';
  }
  if (wasStanding && target.hp <= 0 && target.side === 'ally') allyFell(state, target, events);
}
function absorbedNative(state: BattleState, owner: Combatant, target: Combatant, enemy: Combatant, amount: number, broken: boolean, events: BattleEvent[]): void {
  if (owner.hp <= 0) return;
  const n = gear(owner).numbers;
  if (phaseZeroStatsReady && equipped(owner, 'tidebound-reflector')) {
    const key = `reflection:${state.round}`;
    const offer = Math.min(amount * magnitude(state, 'tidebound-reflector', .4),
      Math.max(0, owner.stats.damage * magnitude(state, 'tidebound-reflector', 1.5) - (n[key] ?? 0)));
    if (offer > 0) {
      n[key] = (n[key] ?? 0) + offer;
      generatedStrike(state, owner, enemy, offer, events);
    }
  }
  if (equipped(owner, 'aquatic-leviathan-pump')) {
    if (!phaseZeroStatsReady) n.absorption = (n.absorption ?? 0) + amount;
    if (phaseZeroStatsReady && firstEnemyAttackTrigger(enemy, `leviathan:${owner.id}:${target.id}`)) {
      const level = state.conduitUpgrades?.['aquatic-leviathan-pump'] ?? 0;
      grantCappedGaugePercent(state, owner, target, phaseZeroUpgradeMagnitude(.05, level),
        phaseZeroUpgradeMagnitude(.15, level), `leviathanGauge:${target.id}:${state.round}`, events);
    }
  }
  if (!phaseZeroStatsReady && broken && equipped(owner, 'master-thornia-1')) {
    for (const foe of state.enemies.filter(foe => foe.hp > 0)) generatedStrike(state, owner, foe, amount * .4, events);
  }
}
export function conduitTurnStart(state: BattleState, events: BattleEvent[]): void {
  if (phaseZeroStatsReady && alive(state).some(owner => equipped(owner, 'rootbound-triage-vault'))) {
    const recipient = alive(state).sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0];
    if (recipient) {
      grantToken(state, recipient, 'triageEfficiency', magnitude(state, 'rootbound-triage-vault', .25));
      grantToken(state, recipient, 'triagePower', magnitude(state, 'rootbound-triage-vault', .35));
    }
  }
  for (const owner of alive(state)) {
    const n = gear(owner).numbers;
    for (const key of Object.keys(n)) if (/^(?:atlasGauge|leviathanGauge|thorniaShield):/.test(key)) {
      const parts = key.split(':');
      const round = Number(parts[parts.length - (key.endsWith(':received') ? 2 : 1)]);
      if (Number.isFinite(round) && round < state.round) delete n[key];
    }
    if (n.solaceRound !== state.round) delete n.solaceRound;
    if (equipped(owner, 'granite-hourglass') && (n.phaseLoss ?? 0) > 0)
      generatedShield(owner, owner, n.phaseLoss * (phaseZeroStatsReady
        ? phaseZeroUpgradeMagnitude(.3, state.conduitUpgrades?.['granite-hourglass'] ?? 0)
        : value(state, owner, 'granite-hourglass', .2, .4)), events);
    n.phaseLoss = 0;
    if (!phaseZeroStatsReady && n.fieldbraceRound === state.round) {
      delete n.fieldbraceRound;
      generatedHeal(owner, owner, owner.stats.health * value(state, owner, 'fieldbrace-coupler', .06, .12), events);
    }
    if (owner.recoverThrough >= state.round) {
      if (equipped(owner, 'tranquilitic-stillhour-carillon')) {
        if (phaseZeroStatsReady) {
          for (const ally of alive(state)) {
            generatedHeal(owner, ally, ally.stats.health * phaseZeroUpgradeMagnitude(.08,
              state.conduitUpgrades?.['tranquilitic-stillhour-carillon'] ?? 0), events, state);
            generatedGaugePercent(owner, ally, phaseZeroUpgradeMagnitude(.1,
              state.conduitUpgrades?.['tranquilitic-stillhour-carillon'] ?? 0), events, state);
          }
        } else {
          const amount = value(state, owner, 'tranquilitic-stillhour-carillon', 15, 30);
          generatedGauge(owner, owner, amount, events, false, false, state);
          generatedGauge(owner, lowestGauge(state, owner), amount, events, false, false, state);
        }
      }
    }
    if (!phaseZeroStatsReady && equipped(owner, 'aquatic-leviathan-pump') && (n.absorption ?? 0) > 0) {
      const pool = n.absorption * value(state, owner, 'aquatic-leviathan-pump', .3, .6);
      const recipients = alive(state).filter(ally => ally.hp < ally.stats.health);
      for (const ally of recipients) generatedHeal(owner, ally, pool / recipients.length, events, state);
    }
    n.absorption = 0;
    for (const source of state.allies) {
      const key = `seed:${source.id}`;
      const offer = gear(owner).numbers[key];
      if (offer) { delete gear(owner).numbers[key]; generatedHeal(source, owner, offer, events); }
    }
  }
}
