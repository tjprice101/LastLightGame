import { defenseMode, shatterGauge, type ActionId } from '../content/combat';
import type { ConduitId } from '../content/conduits';
import { conduitRedesign, redesignStep, redesignValue } from '../content/conduit-redesign';
import type { BattleEvent, BattleState, Combatant } from './battle';
import { buffSnapshot } from './battle-buffs';
import { debuffSnapshot } from './battle-debuffs';
import { pilotAuthoredShieldAbsorbed, pilotEffectiveHeal } from './kit-pilots';
import { hasNativeIdentity, nativeAbsorbedHit, nativeDirectHpLoss, nativeIncomingMultiplier,
  nativeRouteDamage, nativeSupportMultiplier } from './native-kits';
import { prepareCalamiticAction, afterCalamiticAction, calamiticSiegeBonus, deferCalamiticDamage,
  bankCalamiticDamage } from './calamitic-conduits';

export const conduitRulesVersion = 4;
export interface ConduitShieldLayer {
  amount: number;
  owner: string;
  native: boolean;
  plate?: boolean;
  expiresAfterPhase?: number;
  firstReduction?: number;
}
export interface ConduitRuntimeState {
  numbers: Record<string, number>;
  owners: Record<string, string>;
  layers?: ConduitShieldLayer[];
}
export interface ConduitHit {
  target: string; damage: number; critical: boolean; criticalMultiplier: number;
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
  impacts: number;
  hits: ConduitHit[];
  overheal: number;
  healed: number;
  spent: Record<string, number>;
  healExtra: number;
  shieldBurn: number;
  burnPaid: boolean;
  freeDefense: boolean;
  openingBurns: Record<string, number>;
  eclipseTargets: string[];
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
function injured(state: BattleState, owner: Combatant, other = false): Combatant | undefined {
  return alive(state).filter(unit => (!other || unit.id !== owner.id) && unit.hp < unit.stats.health)
    .sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0];
}
function lowestGauge(state: BattleState, owner: Combatant): Combatant | undefined {
  return alive(state).filter(unit => unit.id !== owner.id && unit.shatter < unit.stats.shatterCapacity)
    .sort((a, b) => a.shatter - b.shatter)[0];
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
export function generatedHeal(owner: Combatant, target: Combatant | undefined, offer: number, events: BattleEvent[]): number {
  if (!target || target.hp <= 0) return 0;
  const amount = Math.min(target.stats.health - target.hp, Math.max(0, Math.round(offer)));
  if (amount <= 0) return 0;
  target.hp += amount;
  emit(events, 'heal', owner, target, amount, `${owner.name}'s Conduit restores ${amount} HP to ${target.name}.`);
  return amount;
}
export function generatedGauge(owner: Combatant, target: Combatant | undefined, offer: number, events: BattleEvent[], native = false): number {
  if (!target || target.hp <= 0) return 0;
  const amount = Math.min(target.stats.shatterCapacity - target.shatter, Math.max(0, offer));
  if (amount <= 0) return 0;
  target.shatter += amount;
  emit(events, 'status', owner, target, amount, native ? `${target.name} gains ${amount} Shatter Gauge.`
    : `${owner.name}'s Conduit gives ${target.name} ${amount} Gauge.`, native);
  return amount;
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
export function generatedShield(owner: Combatant, target: Combatant | undefined, offer: number, events: BattleEvent[], additive = false, cap = Infinity, plate = false): number {
  if (!target || target.hp <= 0) return 0;
  const list = layers(target);
  const amount = Math.max(0, Math.round(additive ? Math.min(offer, cap - target.shield) : offer - target.shield));
  if (amount <= 0) return 0;
  list.push({ amount, owner: owner.id, native: false, ...(plate ? { plate } : {}) });
  target.shield += amount;
  emit(events, 'shield', owner, target, amount, `${owner.name}'s Conduit shields ${target.name} for ${amount}.`);
  return amount;
}
export function expireNativeShields(state: BattleState, events: BattleEvent[]): void {
  for (const target of [...state.allies, ...state.enemies]) {
    const list = layers(target);
    const expiredByOwner = new Map<string, number>();
    for (const layer of list) {
      if (!layer.native || layer.expiresAfterPhase === undefined || layer.expiresAfterPhase > state.round) continue;
      expiredByOwner.set(layer.owner, (expiredByOwner.get(layer.owner) ?? 0) + layer.amount);
      target.shield -= layer.amount;
      layer.amount = 0;
    }
    if (!expiredByOwner.size) continue;
    gear(target).layers = list.filter(layer => layer.amount > 0);
    for (const [id, amount] of expiredByOwner) {
      if (amount <= 0) continue;
      const owner = state.allies.find(ally => ally.id === id) ?? target;
      emit(events, 'status', owner, target, amount, `${target.name} loses ${Math.round(amount)} expired native shield.`, true);
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
export function initializeConduits(state: BattleState): void {
  state.conduitRulesVersion = conduitRulesVersion;
  for (const unit of [...state.allies, ...state.enemies]) {
    gear(unit).numbers.entryDefense = unit.stats.defense;
    if (unit.side === 'ally' && equipped(unit, 'fracture-reservoir')) {
      unit.shatter = Math.min(unit.stats.shatterCapacity, unit.shatter + value(state, unit, 'fracture-reservoir', 5, 10));
    }
  }
}
export function effectiveDefense(state: BattleState, unit: Combatant): number {
  let defense = unit.stats.defense;
  const n = unit.conduitRuntime?.numbers ?? {};
  if (equipped(unit, 'master-orvella-3') && unit.hp > 0) {
    const foundation = unit.native?.foundation;
    const protectedByFoundation = foundation && foundation.durability > 0 && foundation.throughPhase >= state.round;
    defense += (n.entryDefense ?? defense) * .2 * alive(state).filter(ally => ally.shield > 0 || protectedByFoundation).length;
  }
  if (unit.side === 'enemy') {
    defense = Math.max(0, defense - (n.excavated ?? 0));
  }
  return defense;
}
export function nativeTargetDefense(state: BattleState, target: Combatant): number {
  const exposed = alive(state).some(owner => equipped(owner, 'master-aurora-1') && nativeControl(state, owner, target));
  return effectiveDefense(state, target) * (exposed ? .85 : 1);
}
function nativeControl(state: BattleState, owner: Combatant, target: Combatant): boolean {
  return (owner.native?.seals?.[target.id]?.throughPhase ?? 0) >= state.round ||
    target.weakened > 0 && target.weakenSourceId === owner.id && target.weakenOrigin !== 'conduit';
}
export function conduitActionCost(actor: Combatant, action: ActionId, state: BattleState, base: number): number {
  const n = actor.conduitRuntime?.numbers ?? {};
  if (action === 'defend') return equipped(actor, 'solace-anchor') && !n.solaceUsed && actor.shatter >= 10 ? 10 : 0;
  if (action === 'skill1' && n.quietFeather) return 0;
  let discount = 0;
  if (action === 'skill2' && equipped(actor, 'coilfeed-ratchet')) discount += value(state, actor, 'coilfeed-ratchet', 3, 6);
  if ((action === 'skill1' || action === 'skill2') && n.tailwind && equipped(actor, 'atmospheric-skythread-rudder')) {
    discount += value(state, actor, 'atmospheric-skythread-rudder', 10, 20);
  }
  if (action === 'ultimate' && n.stormCount >= 3 && equipped(actor, 'atmospheric-storm-clock')) {
    discount += value(state, actor, 'atmospheric-storm-clock', 15, 30);
  }
  return base === 0 ? 0 : Math.max(action === 'ultimate' ? 70 : 1, base - discount);
}
export function recoveryNormal(actor: Combatant): boolean { return equipped(actor, 'chaotic-paradox-spindle'); }
export function conduitActionBlocked(actor: Combatant, state: BattleState): boolean {
  const n = actor.conduitRuntime?.numbers ?? {};
  return n.stasisSkip === state.round || n.revivedRound === state.round ||
    (n.actionsRound === state.round && (n.actions >= 2 || (actor.recoverThrough >= state.round && n.actions >= 1)));
}
export function prepareConduitAction(state: BattleState, actor: Combatant, action: ActionId, paid: number, nativeAll: boolean): ConduitActivation {
  const n = gear(actor).numbers;
  const ctx: ConduitActivation = { action, paid, bonus: 0, criticalBonus: 0, guaranteed: false, forbidden: false,
    all: nativeAll, nativeAll, scale: 1, impacts: 1, hits: [], overheal: 0, healed: 0, spent: {}, healExtra: 0,
    shieldBurn: 0, burnPaid: false, freeDefense: false,
    openingBurns: Object.fromEntries(state.enemies.filter(enemy => enemy.hp > 0 && enemy.burn.turns > 0 &&
      enemy.burn.sourceId === actor.id && enemy.burn.origin !== 'conduit')
      .map(enemy => [enemy.id, conduitBurnTick(state, actor, enemy)])), eclipseTargets: [] };
  n.ordinaryResourceSpend = action === 'skill2' ? 1 : 0;
  if (n.actionsRound !== state.round) { n.actionsRound = state.round; n.actions = 0; }
  if (action === 'defend' && equipped(actor, 'solace-anchor') && !n.solaceUsed && paid === 10) {
    n.solaceUsed = 1; n.solaceRound = state.round; ctx.freeDefense = true;
  } else n.actions++;
  if (prepareCalamiticAction(state, actor, action)) ctx.freeDefense = true;
  if (action === 'skill1') delete n.quietFeather;
  if (action === 'skill1' || action === 'skill2') delete n.tailwind;
  if (action === 'defend') {
    delete n.counterwind; delete n.counterwindActive;
    n.normalSequence = 0; n.previousSkill = 0;
    return ctx;
  }
  const offensive = action === 'light' || actor.kit?.abilities[action].strength.damageMultiplier !== undefined;
  if (offensive && equipped(actor, 'parallax-relay') && !n.opening) { ctx.criticalBonus += value(state, actor, 'parallax-relay', .15, .3); n.opening = 1; }
  if (equipped(actor, 'glassroot-gimbal')) ctx.criticalBonus += value(state, actor, 'glassroot-gimbal', .12, .24) * Math.min(1, (1 - actor.hp / actor.stats.health) / .75);
  ctx.guaranteed = equipped(actor, 'falcon-sight') && (n.noncritical ?? 0) >= 2;
  ctx.forbidden = equipped(actor, 'verdict-caliper') || (action === 'light' && equipped(actor, 'judgment-lens'));
  if (equipped(actor, 'verdict-caliper')) ctx.bonus += value(state, actor, 'verdict-caliper', .35, .7);
  if (action === 'light') {
    if (equipped(actor, 'siegebound-drive')) ctx.bonus += value(state, actor, 'siegebound-drive', .08, .16);
    if (equipped(actor, 'nullsong-transmission')) ctx.bonus += value(state, actor, 'nullsong-transmission', .4, .8);
    if (equipped(actor, 'twinpulse-bellows')) {
      n.normalSequence = (n.normalSequence ?? 0) + 1;
      if (n.normalSequence === 2) { ctx.bonus += value(state, actor, 'twinpulse-bellows', .25, .5); n.normalSequence = 0; }
    }
    if (actor.recoverThrough >= state.round && recoveryNormal(actor)) ctx.scale *= value(state, actor, 'chaotic-paradox-spindle', .5, .75);
    if (equipped(actor, 'master-atmoso-1')) { ctx.all = true; ctx.scale *= .7; }
  } else {
    n.normalSequence = 0;
    if (action === 'skill1' && equipped(actor, 'prism-splinter-socket')) ctx.bonus += value(state, actor, 'prism-splinter-socket', .1, .2);
    if (action === 'skill2' && equipped(actor, 'crosspin-governor')) ctx.bonus += value(state, actor, 'crosspin-governor', .1, .2);
    if (action !== 'ultimate' && equipped(actor, 'nullsong-transmission')) ctx.bonus += value(state, actor, 'nullsong-transmission', -.12, -.24);
    if (action !== 'ultimate' && equipped(actor, 'voltaic-stormstep-dynamo') && n.previousSkill && n.previousSkill !== (action === 'skill1' ? 1 : 2)) {
      ctx.bonus += value(state, actor, 'voltaic-stormstep-dynamo', .25, .5);
    }
    if (action !== 'ultimate' && n.verdant) { ctx.bonus += n.verdant; delete n.verdant; }
  }
  n.previousSkill = offensive ? (action === 'skill1' ? 1 : action === 'skill2' ? 2 : 0) : 0;
  if (nativeAll && state.enemies.filter(enemy => enemy.hp > 0).length === 1 && equipped(actor, 'siege-cantilever')) ctx.bonus += value(state, actor, 'siege-cantilever', .6, 1.2);
  if (action === 'ultimate') {
    if (equipped(actor, 'atmospheric-storm-clock') && n.stormCount >= 3) n.stormCount = 0;
    if (equipped(actor, 'worldbreaker-drive')) ctx.bonus += value(state, actor, 'worldbreaker-drive', .35, .7);
    if (equipped(actor, 'master-nerithe-3')) ctx.scale *= .5;
    if (equipped(actor, 'master-elise-2')) { ctx.impacts = 4; ctx.scale *= 1.2; }
    if (equipped(actor, 'master-razor-2')) ctx.bonus += Math.min(.6, payShield(actor, actor.shield) / actor.stats.health * 2);
    if (equipped(actor, 'master-vaelor-1')) { actor.hp -= Math.min(actor.hp - 1, actor.hp * .2); ctx.bonus += .75; }
    if (equipped(actor, 'chaotic-ouroboros-core')) {
      const excess = actor.shatter; actor.shatter = 0;
      n.excessShield = Math.min(value(state, actor, 'chaotic-ouroboros-core', .15, .3),
        excess * value(state, actor, 'chaotic-ouroboros-core', .003, .006)) * actor.stats.health;
    }
  }
  if (action === 'skill2' && equipped(actor, 'master-ember-2')) { ctx.all = false; ctx.scale *= 2; }
  if (action === 'skill1' && equipped(actor, 'master-bliss-2')) { ctx.impacts = 2; ctx.scale *= 1.4; }
  if (action === 'skill2' && equipped(actor, 'master-crinso-2')) ctx.shieldBurn = Math.min(payShield(actor, actor.stats.health * .1) * .5, actor.stats.damage * .5);
  if (action === 'skill2' && equipped(actor, 'master-bliss-1')) {
    const count = alive(state).filter(ally => ally.id !== actor.id).length;
    if (count && actor.hp - actor.stats.health * .1 >= 1) { ctx.healExtra = actor.stats.health * .1 / count; actor.hp -= actor.stats.health * .1; }
  }
  if (equipped(actor, 'master-atmoso-2') && n.counterwind) {
    if (offensive) ctx.bonus += n.counterwind;
    delete n.counterwind; delete n.counterwindActive;
  }
  if (equipped(actor, 'master-crinso-3')) {
    if (!n.crimson || action === 'ultimate') ctx.bonus += .3;
  }
  if (action === 'skill2' && hasNativeIdentity(actor) && equipped(actor, 'master-crinso-1')) {
    ctx.bonus += n.goldImprint ?? 0;
    delete n.goldImprint;
  }
  return ctx;
}
export function conduitHitModifiers(state: BattleState, actor: Combatant, target: Combatant, ctx: ConduitActivation, critical: boolean): { bonus: number; pierce: number; attack: number; critMultiplier?: number } {
  let bonus = ctx.bonus + calamiticSiegeBonus(state, actor, target);
  let pierce = 0;
  const action = ctx.action;
  if (target.hp <= target.stats.health * .25 && equipped(actor, 'execution-orrery')) bonus += value(state, actor, 'execution-orrery', .5, 1);
  if (action === 'skill1' && equipped(actor, 'spearwheel-engine')) pierce += value(state, actor, 'spearwheel-engine', .15, .3);
  if (action !== 'light' && target.weakened > 0 && target.weakenSourceId === actor.id &&
      target.weakenOrigin !== 'conduit' && equipped(actor, 'ominous-eclipse-mantle')) {
    pierce += value(state, actor, 'ominous-eclipse-mantle', .4, .6);
    ctx.eclipseTargets.push(target.id);
  }
  if (action === 'light' || (action === 'skill1' && equipped(actor, 'ruinselect-prism'))) {
    const marks = target.conduitMarks?.[actor.id] ?? 0;
    if (marks) {
      bonus += marks * (action === 'light' ? value(state, actor, 'ominous-nightglass-archive', .1, .2) : value(state, actor, 'ruinselect-prism', .15, .3));
      delete target.conduitMarks?.[actor.id];
    }
  }
  const targetMemory = gear(target);
  for (const owner of state.allies) {
    if (owner.id === actor.id) continue;
    if (targetMemory.numbers[`soot:${owner.id}`] >= state.round) {
      bonus += value(state, owner, 'sootwake-crucible', .2, .4); delete targetMemory.numbers[`soot:${owner.id}`];
    }
    if (targetMemory.numbers[`opening:${owner.id}`] &&
      (hasNativeIdentity(owner) || target.weakened > 0 && target.weakenSourceId === owner.id)) {
      bonus += .4;
      if (!hasNativeIdentity(owner)) target.weakened--;
      delete targetMemory.numbers[`opening:${owner.id}`];
    }
  }
  if (equipped(actor, 'master-atmoso-3') && !ctx.forbidden) bonus += Math.min(.5, Math.max(0, actor.stats.crit + ctx.criticalBonus - 1));
  if (critical && equipped(actor, 'master-elise-1')) pierce += .5;
  return { bonus: Math.min(3, bonus), pierce: Math.min(.75, pierce),
    attack: ctx.action === 'ultimate' && equipped(actor, 'master-bruno-2') ? effectiveDefense(state, actor) : actor.stats.damage,
    ...(critical && equipped(actor, 'master-elise-1') ? { critMultiplier: 1.5 } : {}) };
}
export function applyConduitBurn(state: BattleState, owner: Combatant, target: Combatant, base: number, ctx: ConduitActivation): number {
  let bonus = 0;
  if (equipped(owner, 'resonance-crucible')) bonus += value(state, owner, 'resonance-crucible', .2, .4);
  if (equipped(owner, 'starvein-conductor')) {
    const payment = owner.stats.health * .05;
    if (!ctx.burnPaid && owner.hp - payment >= 1) { owner.hp -= payment; ctx.burnPaid = true; }
    if (ctx.burnPaid) bonus += value(state, owner, 'starvein-conductor', .4, .8);
  }
  const damage = Math.round((base + ctx.shieldBurn) * (1 + Math.min(3, bonus)));
  if (target.burn.turns <= 0 || damage >= target.burn.damage) {
    const n = gear(target).numbers;
    n[`cinder:${owner.id}`] = 0; n[`extensions:${owner.id}`] = 0;
    if (target.burn.sourceId !== owner.id || target.burn.turns <= 0) n[`census:${owner.id}`] = 0;
  }
  return damage;
}
export function afterConduitImpact(owner: Combatant, target: Combatant, ctx: ConduitActivation): void {
  if (ctx.eclipseTargets.includes(target.id) && target.weakened > 0 && target.weakenSourceId === owner.id) {
    target.weakened--;
    if (!target.weakened) { target.weakenFraction = 0; delete target.weakenSourceId; delete target.weakenOrigin; }
  }
}
export function applyConduitWeaken(state: BattleState, owner: Combatant, target: Combatant, fraction: number, events: BattleEvent[], action: ActionId = 'skill1', baseDuration = 2): void {
  if (equipped(owner, 'master-bruno-3') && action === 'skill1') {
    gear(target).numbers.excavated = Math.min((gear(target).numbers.entryDefense ?? target.stats.defense) * .3,
      (gear(target).numbers.excavated ?? 0) + (gear(target).numbers.entryDefense ?? target.stats.defense) * .15);
    emit(events, 'status', owner, target, gear(target).numbers.excavated, `${target.name}'s encounter Defense is excavated.`);
    return;
  }
  const duration = baseDuration + (equipped(owner, 'opal-indexer') ? step(state, 'opal-indexer', 1, 2) : 0);
  const strength = Math.min(.6, fraction + (equipped(owner, 'tension-governor') ? value(state, owner, 'tension-governor', .05, .1) : 0));
  if (target.weakened > 0 && target.weakenFraction > strength) {
    emit(events, 'status', owner, target, target.weakenFraction, `${target.name}'s stronger Weaken remains unchanged.`);
    return;
  }
  target.weakened = Math.min(6, duration); target.weakenFraction = strength; target.weakenSourceId = owner.id;
  target.weakenOrigin = owner.kit?.pilot === 'rose-grace' || owner.kit?.pilot === 'thorn-aegis' || owner.kit?.pilot === 'rose-duality' ? 'rose' : 'native';
  const n = gear(target).numbers;
  if (equipped(owner, 'aquatic-undertide-chronometer') && !n[`undertide:${owner.id}`]) {
    n[`undertide:${owner.id}`] = 1;
    n.scheduleShift = (n.scheduleShift ?? 0) + step(state, 'aquatic-undertide-chronometer', 1, 2);
  }
  if (equipped(owner, 'master-razor-3') && !n[`silenced:${owner.id}`]) { n[`silenced:${owner.id}`] = 1; n.silence = 1; }
  if (equipped(owner, 'master-tide-3')) applyTaunt(owner, target);
  emit(events, 'status', owner, target, strength, `${target.name} has ${Math.round(strength * 100)}% Weaken for ${target.weakened} enemy phases.`, true);
}
export function supportEffect(state: BattleState, owner: Combatant, target: Combatant, events: BattleEvent[]): void {
  if (owner.id !== target.id && equipped(owner, 'tranquilitic-accord-bastion') && !gear(owner).numbers.accordUsed && !gear(target).owners.accord) {
    gear(owner).numbers.accordUsed = 1; gear(target).owners.accord = owner.id;
    emit(events, 'status', owner, target, 1, `${target.name} receives one Accord lethal-hit protection.`);
  }
}
export type NativeHealingContext = Pick<ConduitActivation, 'overheal' | 'healed'> & Partial<Pick<ConduitActivation, 'healExtra'>>;
export function nativeHeal(state: BattleState, owner: Combatant, target: Combatant, offer: number, events: BattleEvent[], active: boolean, ctx?: NativeHealingContext, instruction = active): number {
  if (target.hp <= 0) return 0;
  if (instruction) offer *= nativeSupportMultiplier(state, owner);
  let bonus = active && equipped(owner, 'springwell-pump') ? value(state, owner, 'springwell-pump', .2, .4) : 0;
  bonus = Math.min(2, bonus);
  offer = Math.max(0, offer * (1 + bonus) + (active && owner.id !== target.id ? ctx?.healExtra ?? 0 : 0));
  const restored = Math.min(target.stats.health - target.hp, offer);
  const wasted = offer - restored;
  if (ctx) { ctx.overheal += wasted; ctx.healed += restored; }
  if (active && wasted > 0 && equipped(owner, 'efflorescent-worldtree-heart')) {
    const seed = Math.min(owner.stats.health * value(state, owner, 'efflorescent-worldtree-heart', .1, .2),
      wasted * value(state, owner, 'efflorescent-worldtree-heart', .5, 1));
    const key = `seed:${owner.id}`;
    gear(target).numbers[key] = Math.max(gear(target).numbers[key] ?? 0, seed);
  }
  if (restored <= 0) return 0;
  target.hp += restored;
  emit(events, 'heal', owner, target, restored, `${owner.name} restores ${restored} HP to ${target.name}.`, true);
  pilotEffectiveHeal(state, owner, target, restored, events);
  supportEffect(state, owner, target, events);
  if (active && owner.id !== target.id && equipped(owner, 'efflorescent-verdant-covenant')) gear(target).numbers.verdant = Math.max(gear(target).numbers.verdant ?? 0, value(state, owner, 'efflorescent-verdant-covenant', .2, .4));
  return restored;
}
export function finishNativeHealing(state: BattleState, owner: Combatant, ctx: NativeHealingContext, events: BattleEvent[]): void {
  if (equipped(owner, 'covercharge-drum') && ctx.overheal > 0)
    generatedHeal(owner, injured(state, owner, true), Math.min(ctx.overheal * value(state, owner, 'covercharge-drum', .4, .8),
      owner.stats.health * value(state, owner, 'covercharge-drum', .1, .2)), events);
  if (equipped(owner, 'rootbound-triage-vault') && ctx.healed > 0 && owner.shatter >= 15) {
    const threshold = value(state, owner, 'rootbound-triage-vault', .2, .4);
    const ally = alive(state).filter(ally => ally.hp < ally.stats.health * threshold)
      .sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0];
    if (ally) {
      const restored = generatedHeal(owner, ally, Math.min(ally.stats.health * threshold - ally.hp,
        owner.stats.health * value(state, owner, 'rootbound-triage-vault', .1, .2)), events);
      if (restored > 0) owner.shatter -= 15;
    }
  }
}
export interface NativeShieldOptions { throughPhase?: number; firstReduction?: number }
export function nativeShield(state: BattleState, owner: Combatant, target: Combatant, offer: number, events: BattleEvent[],
  options: NativeShieldOptions = {}): void {
  if (target.hp <= 0) return;
  offer *= nativeSupportMultiplier(state, owner);
  let bonus = equipped(owner, 'wardglass-transformer') ? value(state, owner, 'wardglass-transformer', .2, .4) : 0;
  if (owner.id === target.id && owner.hp <= owner.stats.health * .75 && equipped(owner, 'pale-bulwark-diadem')) bonus += value(state, owner, 'pale-bulwark-diadem', .25, .5);
  offer *= 1 + Math.min(2, bonus);
  if (equipped(owner, 'citadel-spine')) offer += effectiveDefense(state, owner) * value(state, owner, 'citadel-spine', .1, .2);
  if (equipped(owner, 'meridian-inverter')) {
    generatedHeal(owner, target, offer * value(state, owner, 'meridian-inverter', .75, 1.5), events);
    return;
  }
  const plate = equipped(owner, 'master-orvella-1');
  const finalOffer = offer * (plate ? .5 : 1);
  const list = layers(target);
  const existing = target.shield - (plate ? list.filter(layer => layer.plate).reduce((sum, layer) => sum + layer.amount, 0) : 0);
  const gained = Math.max(0, finalOffer - existing);
  const owned = list.filter(layer => layer.native && layer.owner === owner.id && layer.amount > 0);
  for (const layer of owned) {
    if (options.throughPhase !== undefined && layer.expiresAfterPhase !== undefined)
      layer.expiresAfterPhase = Math.max(layer.expiresAfterPhase, options.throughPhase);
  }
  if (options.firstReduction !== undefined && owned.length) {
    for (const layer of owned) delete layer.firstReduction;
    owned[0].firstReduction = options.firstReduction;
  }
  if (gained > 0) {
    list.push({ amount: gained, owner: owner.id, native: true,
      ...(options.throughPhase !== undefined ? { expiresAfterPhase: options.throughPhase } : {}),
      ...(options.firstReduction !== undefined && !owned.length ? { firstReduction: options.firstReduction } : {}) });
    target.shield += gained;
    target.pilot ??= {}; target.pilot.authoredShieldSourceId = owner.id;
    supportEffect(state, owner, target, events);
    if (target.id !== owner.id && equipped(owner, 'aegis-return-spring')) {
      const n = gear(owner).numbers;
      if (n.sealRound !== state.round) { n.sealRound = state.round; n.seals = 0; }
      if (n.seals < step(state, 'aegis-return-spring', 1, 2) && !gear(target).numbers.criticalSeal) { gear(target).numbers.criticalSeal = 1; n.seals++; }
    }
  }
  emit(events, 'shield', owner, target, gained, `${target.name} has ${target.shield} shield.`, true);
  if (equipped(owner, 'ward-stitch-spool')) generatedShield(owner, target, offer * value(state, owner, 'ward-stitch-spool', .25, .5), events, true,
    target.stats.health * value(state, owner, 'ward-stitch-spool', .3, .6));
  if (plate) {
    const prior = layers(target).filter(layer => layer.plate && layer.owner === owner.id).reduce((sum, layer) => sum + layer.amount, 0);
    const amount = Math.max(0, Math.min(target.stats.health * .15, Math.round(offer * .5)) - prior);
    generatedShield(owner, target, amount, events, true, Infinity, true);
  }
}
export function nativeGauge(state: BattleState, target: Combatant, offer: number, events: BattleEvent[]): void {
  if (offer <= 0 || target.hp <= 0) return;
  const link = state.allies.find(owner => owner.hp > 0 && equipped(owner, 'master-disciple-2') && (gear(owner).numbers.linkThrough ?? 0) >= state.round && gear(target).owners.link === owner.id);
  const overflow = Math.max(0, target.shatter + offer - target.stats.shatterCapacity);
  if (link) {
    const linked = alive(state).filter(ally => gear(ally).owners.link === link.id);
    for (const ally of linked) generatedGauge(target, ally, offer / linked.length, events);
  } else generatedGauge(target, target, offer, events, true);
  if (overflow > 0 && equipped(target, 'clearwater-manifold')) {
    const n = gear(target).numbers;
    if (n.overflowRound !== state.round) { n.overflowRound = state.round; n.overflow = 0; }
    const amount = Math.min(overflow * value(state, target, 'clearwater-manifold', .5, 1), value(state, target, 'clearwater-manifold', 20, 40) - n.overflow);
    n.overflow += generatedGauge(target, lowestGauge(state, target), amount, events);
  }
}
export function recordConduitHit(ctx: ConduitActivation, target: Combatant, amount: number, critical: boolean, criticalMultiplier: number): void {
  ctx.hits.push({ target: target.id, damage: amount, critical, criticalMultiplier });
}
export function finishConduitAction(state: BattleState, owner: Combatant, ctx: ConduitActivation, events: BattleEvent[]): void {
  const n = gear(owner).numbers;
  finishNativeHealing(state, owner, ctx, events);
  if (equipped(owner, 'master-nerithe-2') && ctx.action === 'skill2') {
    for (const ally of alive(state)) { nativeGauge(state, ally, 15, events); ally.omnicProtection = Math.max(ally.omnicProtection ?? 0, .15); }
  }
  const damage = ctx.hits.reduce((sum, hit) => sum + hit.damage, 0);
  const critical = ctx.hits.find(hit => hit.critical && hit.damage > 0);
  const primaryHit = ctx.hits[0];
  const target = state.enemies.find(enemy => enemy.id === primaryHit?.target);
  const killed = ctx.hits.some(hit => hit.damage > 0 && state.enemies.some(enemy => enemy.id === hit.target && enemy.hp <= 0));
  if (critical && ctx.action !== 'ultimate' && equipped(owner, 'atmospheric-storm-clock'))
    n.stormCount = Math.min(3, (n.stormCount ?? 0) + 1);
  if (!damage && ctx.action !== 'defend') n.previousSkill = 0;
  if (ctx.action === 'defend') {
    if (equipped(owner, 'reserve-torque-crank')) generatedGauge(owner, owner, value(state, owner, 'reserve-torque-crank', 3, 6), events);
    if (equipped(owner, 'atmospheric-skythread-rudder')) n.tailwind = 1;
    if (equipped(owner, 'tranquilitic-kirin-cradle')) generatedHeal(owner, alive(state).sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0],
      Math.min(effectiveDefense(state, owner) * value(state, owner, 'tranquilitic-kirin-cradle', .5, 1), owner.stats.health * value(state, owner, 'tranquilitic-kirin-cradle', .1, .2)), events);
    if (equipped(owner, 'tectonic-atlas-bastion')) {
      n.tauntRound = state.round;
      for (const enemy of state.enemies.filter(enemy => enemy.hp > 0)) {
        applyTaunt(owner, enemy);
      }
    }
    if (equipped(owner, 'master-vaelor-3') && !n.donationUsed) {
      const ally = alive(state).filter(ally => ally.id !== owner.id && ally.spent && ally.recoverThrough < state.round && !conduitActionBlocked(ally, state)).sort((a, b) => b.shatter - a.shatter)[0];
      if (ally) { n.donationUsed = 1; ally.spent = false; emit(events, 'status', owner, ally, 1, `${owner.name} donates an action to ${ally.name}.`); }
    }
    afterCalamiticAction(state, owner, ctx.action, events);
    return;
  }
  for (const id of owner.conduits ?? []) {
    if (!id) continue;
    switch (id) {
      case 'falcon-sight':
        if (ctx.hits.length) n.noncritical = ctx.guaranteed || ctx.hits.some(hit => hit.critical) ? 0 : Math.min(2, (n.noncritical ?? 0) + 1);
        break;
      case 'lifeline-flywheel':
        generatedHeal(owner, owner, Math.min(damage * value(state, owner, id, .08, .16), owner.stats.health * value(state, owner, id, .04, .08)), events); break;
      case 'breach-pendulum':
        generatedShield(owner, owner, Math.min(damage * value(state, owner, id, .08, .16), owner.stats.health * value(state, owner, id, .05, .1)), events); break;
      case 'voltaic-thunderbird-coil':
        if (critical) generatedStrike(state, owner, healthiestEnemy(state, critical.target), Math.min(critical.damage * value(state, owner, id, .3, .6), owner.stats.damage * value(state, owner, id, .5, 1)), events);
        break;
      case 'atmospheric-griffin-turbine':
        if (ctx.action === 'light' && damage > 0) for (const ally of alive(state).filter(ally => ally.id !== owner.id)) generatedGauge(owner, ally, value(state, owner, id, 3, 6), events);
        break;
      case 'luminous-seraph-mirror':
        if (critical) for (const ally of alive(state)) generatedHeal(owner, ally, Math.min(damage * value(state, owner, id, .08, .16), owner.stats.health * value(state, owner, id, .03, .06)), events);
        break;
      case 'chaotic-ouroboros-core':
        if (ctx.action === 'ultimate') { generatedShield(owner, owner, n.excessShield ?? 0, events); delete n.excessShield; } break;
      case 'luminous-dawn-witness-array':
        if (ctx.hits.some(hit => hit.critical)) {
          if (target?.hp && (n.witness ?? 0) > 0) { generatedStrike(state, owner, target, owner.stats.damage * n.witness * value(state, owner, id, .15, .3), events, false); n.witness = 0; }
        } else if (ctx.action === 'light') n.witness = Math.min(3, (n.witness ?? 0) + 1);
        break;
      case 'ominous-nightglass-archive':
        if (ctx.action !== 'light') for (const hit of ctx.hits) {
          const enemy = state.enemies.find(enemy => enemy.id === hit.target && enemy.hp > 0);
          if (enemy) { enemy.conduitMarks ??= {}; enemy.conduitMarks[owner.id] = Math.min(3, (enemy.conduitMarks[owner.id] ?? 0) + 1); }
        }
        break;
      case 'tempered-strike-link':
        if (ctx.action === 'light' && target && target.hp > 0 && target.burn.turns > 0 && target.burn.sourceId === owner.id && target.burn.origin !== 'conduit') {
          const tick = conduitBurnTick(state, owner, target);
          target.burn.turns--;
          generatedStrike(state, owner, target, Math.min(tick * value(state, owner, id, .8, 1.6), owner.stats.damage * value(state, owner, id, .8, 1.6)), events);
        }
        break;
      case 'mending-valve':
        if (killed) generatedHeal(owner, injured(state, owner), owner.stats.health * value(state, owner, id, .08, .16), events); break;
      case 'pulse-trigger-pawl':
        if (critical && (ctx.action === 'skill1' || ctx.action === 'skill2')) generatedGauge(owner, owner, Math.min(ctx.paid, value(state, owner, id, 8, 16)), events);
        break;
      case 'firstlight-cam':
        if (ctx.action === 'light' && damage > 0) {
          const ally = lowestGauge(state, owner);
          const amount = generatedGauge(owner, ally, Math.min(owner.shatter, value(state, owner, id, 8, 16)), events);
          owner.shatter -= amount;
        }
        break;
      case 'flare-focusing-iris':
        if ((ctx.spent.ember ?? 0) > 0) for (const enemy of state.enemies.filter(enemy => enemy.hp > 0 && ctx.openingBurns[enemy.id] !== undefined)) {
          generatedStrike(state, owner, enemy, Math.min(ctx.openingBurns[enemy.id] * ctx.spent.ember * value(state, owner, id, .25, .5), owner.stats.damage * value(state, owner, id, .6, 1.2)), events);
        }
        break;
      case 'pressurecrest-governor':
        if (critical) { n.windCriticals = (n.windCriticals ?? 0) + 1; if (n.windCriticals >= step(state, id, 3, 2)) { n.windCriticals = 0; n.windveil = 1; } } break;
      case 'chaotic-fault-verdict':
        if (critical) {
          const enemy = state.enemies.find(enemy => enemy.id === critical.target && enemy.hp > 0);
          if (enemy) generatedStrike(state, owner, enemy, Math.min(payShield(owner, owner.stats.health * .1) * value(state, owner, id, .5, 1), owner.stats.damage * value(state, owner, id, .5, 1)), events);
        }
        break;
    }
  }
  switch (owner.masterConduit) {
    case 'master-bruno-3':
      if (hasNativeIdentity(owner) && ctx.action === 'skill1' && damage > 0 && target?.hp) {
        const memory = gear(target).numbers;
        const base = memory.entryDefense ?? target.stats.defense;
        memory.excavated = Math.min(base * .3, (memory.excavated ?? 0) + base * .15);
        emit(events, 'status', owner, target, memory.excavated, `${target.name}'s encounter Defense is excavated.`);
      }
      break;
    case 'master-sprout-2':
      if (ctx.action === 'skill1' && damage > 0 && target && target.hp > 0 && !gear(target).numbers[`rooted:${owner.id}`]) {
        gear(target).numbers[`rooted:${owner.id}`] = 1; gear(target).numbers.rootbind = 1;
      } break;
    case 'master-sprout-3':
      if (ctx.action === 'ultimate' && !n.revivalUsed) {
        const fallen = state.allies.filter(ally => ally.id !== owner.id && ally.hp <= 0);
        if (fallen.length) { n.revivalUsed = 1; for (const ally of fallen) revive(state, owner, ally, .3, events); }
      } break;
    case 'master-atmoso-2':
      if (ctx.action === 'skill2') { n.counterwindActive = 1; n.counterwind = 0; } break;
    case 'master-aurora-2':
      if (ctx.action === 'ultimate') for (const enemy of state.enemies.filter(enemy => enemy.hp > 0)) gear(enemy).numbers.judgmentThrough = state.round + 1;
      break;
    case 'master-bliss-3':
      if (ctx.action === 'ultimate' && !n.featherUsed) {
        const ally = alive(state).filter(ally => ally.id !== owner.id && !ally.kit?.unavailableActions?.includes('skill1'))
          .sort((a, b) => a.shatter - b.shatter)[0];
        if (ally) { n.featherUsed = 1; gear(ally).numbers.quietFeather = 1; }
      } break;
    case 'master-disciple-2':
      if (ctx.action === 'ultimate') {
        n.linkThrough = state.round + 2;
        for (const ally of alive(state)) gear(ally).owners.link = owner.id;
      } break;
    case 'master-disciple-3':
      if (ctx.action === 'skill1') {
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
      if (killed && !n.resetUsed && n.actions < 2 && owner.recoverThrough < state.round) {
        n.resetUsed = 1; owner.spent = false;
      }
      break;
    case 'master-rosetta-2':
      if (ctx.action === 'skill2' && hasNativeIdentity(owner) || ctx.action === 'skill1' && (ctx.spent.roseGrace ?? 0) > 0) {
        const count = hasNativeIdentity(owner) ? Math.min(2, owner.native?.quarry?.contributors.filter(id => id !== owner.id).length ?? 0) : ctx.spent.roseGrace;
        for (const enemy of state.enemies.filter(enemy => enemy.hp > 0 && enemy.id !== target?.id).sort((a, b) => b.hp - a.hp).slice(0, count)) generatedStrike(state, owner, enemy, (primaryHit?.damage ?? 0) * .25, events);
      } break;
    case 'master-rosetta-3':
      if (ctx.action === 'ultimate') for (const enemy of state.enemies.filter(enemy => enemy.hp > 0 &&
        (hasNativeIdentity(owner) ? enemy.id === owner.native?.quarry?.target : enemy.weakened > 0 && enemy.weakenSourceId === owner.id))) gear(enemy).numbers[`opening:${owner.id}`] = 1;
      break;
    case 'master-thornia-3':
      if (ctx.action === 'skill1') for (const ally of alive(state).filter(ally => ally.id !== owner.id)) {
        gear(ally).owners.guardian = owner.id; gear(ally).numbers.guardianRound = state.round;
      } break;
    case 'master-crinso-1':
      if (ctx.action === 'skill1' && primaryHit?.critical && target?.hp) {
        if (hasNativeIdentity(owner)) n.goldImprint = Math.min(.5, Math.max(0, primaryHit.criticalMultiplier - 1));
        else gear(target).numbers[`imprint:${owner.id}`] = primaryHit.criticalMultiplier;
      }
      break;
    case 'master-crinso-2':
      if (hasNativeIdentity(owner) && ctx.action === 'skill2' && target?.hp && ctx.shieldBurn > 0)
        generatedStrike(state, owner, target, ctx.shieldBurn, events, false);
      break;
    case 'master-crinso-3':
      if (!ctx.hits.length) break;
      if (ctx.action === 'ultimate' || n.crimson) generatedHeal(owner, owner, Math.min(damage * .2, owner.stats.health * .1), events);
      n.crimson = ctx.action === 'ultimate' ? 0 : n.crimson ? 0 : 1;
      break;
    case 'master-nerithe-1':
      if (ctx.action === 'light' && target?.hp) gear(target).owners.chart = owner.id;
      break;
    case 'master-orvella-2':
      if (ctx.action === 'skill2') {
        const allies = alive(state).filter(ally => ally.hp < ally.stats.health);
        if (allies.length) {
          const reserve = hasNativeIdentity(owner) ? owner.native?.foundation?.durability ?? 0 : owner.shield;
          const amount = Math.min(reserve * .25, owner.stats.health * .05, allies.length * Math.min(...allies.map(ally => ally.stats.health - ally.hp)));
          let total = 0;
          for (const ally of allies) total += generatedHeal(owner, ally, Math.floor(amount / allies.length), events);
          if (hasNativeIdentity(owner) && owner.native?.foundation) owner.native.foundation.durability -= total;
          else payShield(owner, total);
        }
      } break;
    case 'master-vaelor-2':
      if (ctx.action === 'skill2' && (hasNativeIdentity(owner) ? owner.native?.beat === 1 : (ctx.spent.tempest ?? 0) > 0)) for (const hit of ctx.hits) {
        const enemy = state.enemies.find(enemy => enemy.id === hit.target && enemy.hp > 0);
        if (enemy && (enemy.weakened <= 0 || enemy.weakenFraction < .15)) { enemy.weakened = 1; enemy.weakenFraction = .15; enemy.weakenSourceId = owner.id; enemy.weakenOrigin = 'conduit'; }
      } break;
  }
  for (const flora of alive(state).filter(ally => equipped(ally, 'master-sprout-1'))) {
    if (ctx.action !== 'skill1' && ctx.action !== 'skill2') continue;
    const key = `pulse:${owner.id}`;
    if (gear(flora).numbers[key] === state.round) continue;
    gear(flora).numbers[key] = state.round;
    for (const ally of alive(state)) nativeHeal(state, flora, ally, ally.stats.health * .02, events, false);
  }
  if ((ctx.action === 'skill1' || ctx.action === 'skill2') && !ctx.all && damage > 0) {
    for (const nerithe of alive(state).filter(ally => ally.id !== owner.id && equipped(ally, 'master-nerithe-1'))) {
      for (const enemy of state.enemies.filter(enemy => enemy.hp > 0 && enemy.id !== target?.id && gear(enemy).owners.chart === nerithe.id)) generatedStrike(state, owner, enemy, damage * .4, events);
      for (const enemy of state.enemies) if (gear(enemy).owners.chart === nerithe.id) delete gear(enemy).owners.chart;
    }
  }
  afterCalamiticAction(state, owner, ctx.action, events);
}
function revive(state: BattleState, owner: Combatant, target: Combatant, fraction: number, events: BattleEvent[]): void {
  target.hp = Math.max(1, Math.round(target.stats.health * fraction)); target.shatter = 0; target.spent = true;
  gear(target).numbers.revivedRound = state.round;
  emit(events, 'heal', owner, target, target.hp, `${target.name} is revived by a Conduit at ${target.hp} HP; cannot act this turn.`);
}
function rescue(state: BattleState, target: Combatant, loss: number, events: BattleEvent[], direct: boolean): number {
  if (loss < target.hp) return loss;
  const n = gear(target).numbers;
  const accord = state.allies.find(owner => owner.id === gear(target).owners.accord);
  if (direct && accord) {
    delete gear(target).owners.accord;
    n.accordShield = accord.stats.health * value(state, accord, 'tranquilitic-accord-bastion', .1, .2);
    return Math.max(0, target.hp - 1);
  }
  if (direct && equipped(target, 'stasis-reliquary') && !n.stasisUsed) {
    n.stasisUsed = 1; n.stasisProtectedRound = state.round; n.stasisSkip = state.round + 1;
    return Math.max(0, target.hp - 1);
  }
  return loss;
}
export function afterConduitHpLoss(state: BattleState, target: Combatant, events: BattleEvent[]): void {
  const n = gear(target).numbers;
  if (n.accordShield) { generatedShield(target, target, n.accordShield, events); delete n.accordShield; }
  if (target.hp <= 0 && equipped(target, 'infernic-phoenix-reactor') && !n.phoenixUsed) {
    n.phoenixUsed = 1; revive(state, target, target, value(state, target, 'infernic-phoenix-reactor', .25, .5), events);
  }
}
export function conduitBurnTick(state: BattleState, owner: Combatant, target: Combatant): number {
  if (target.burn.origin === 'conduit') return target.burn.damage;
  const n = gear(target).numbers;
  const cinderKey = `cinder:${owner.id}`, censusKey = `census:${owner.id}`, imprint = `imprint:${owner.id}`;
  let bonus = 0;
  if (equipped(owner, 'infernic-cinder-testament')) bonus += Math.min(value(state, owner, 'infernic-cinder-testament', .6, 1.2),
    (n[cinderKey] ?? 0) * value(state, owner, 'infernic-cinder-testament', .2, .4));
  if (equipped(owner, 'infernic-pyre-census') && ((n[censusKey] ?? 0) + 1) % 3 === 0) bonus += value(state, owner, 'infernic-pyre-census', .75, 1.5);
  return Math.round(target.burn.damage * (1 + bonus) * (n[imprint] ?? 1));
}
export function afterConduitBurn(state: BattleState, owner: Combatant, target: Combatant, damage: number, events: BattleEvent[]): void {
  if (target.burn.origin !== 'conduit') delete gear(target).numbers[`imprint:${owner.id}`];
  if (damage <= 0 || target.burn.origin === 'conduit') return;
  const tn = gear(target).numbers, n = gear(owner).numbers;
  tn[`cinder:${owner.id}`] = (tn[`cinder:${owner.id}`] ?? 0) + 1;
  tn[`census:${owner.id}`] = (tn[`census:${owner.id}`] ?? 0) + 1;
  if (owner.hp > 0 && equipped(owner, 'emberlife-kiln')) {
    if (n.burnHealRound !== state.round) { n.burnHealRound = state.round; n.burnHeal = 0; }
    n.burnHeal += generatedHeal(owner, owner, Math.min(damage * value(state, owner, 'emberlife-kiln', .2, .4),
      owner.stats.health * value(state, owner, 'emberlife-kiln', .06, .12) - n.burnHeal), events);
  }
  if (equipped(owner, 'sootwake-crucible') && target.hp > 0) tn[`soot:${owner.id}`] = state.round + 1;
  if (target.burn.turns === 0 && target.hp > 0 && owner.hp > owner.stats.health * .5 && equipped(owner, 'master-ember-1') &&
      (tn[`extensions:${owner.id}`] ?? 0) < 2 && owner.hp - owner.stats.health * .03 > 1) {
    owner.hp -= owner.stats.health * .03; target.burn.turns = 1;
    tn[`extensions:${owner.id}`] = (tn[`extensions:${owner.id}`] ?? 0) + 1;
    emit(events, 'status', owner, target, 1, `${owner.name} pays HP to sustain Burn for one phase.`);
  }
  if (target.burn.turns <= 0) { delete tn[`cinder:${owner.id}`]; delete tn[`census:${owner.id}`]; }
}
export function conduitDeaths(state: BattleState, previous: BattleState, events: BattleEvent[]): void {
  for (const enemy of state.enemies.filter(enemy => enemy.hp <= 0 && previous.enemies.some(prior => prior.id === enemy.id && prior.hp > 0))) {
    if (gear(enemy).numbers.deathProcessed) continue;
    gear(enemy).numbers.deathProcessed = 1;
    const owner = state.allies.find(ally => ally.id === enemy.burn.sourceId);
    if (owner && enemy.burn.turns > 0 && enemy.burn.origin !== 'conduit' && equipped(owner, 'cinder-metering-nozzle')) {
      const target = healthiestEnemy(state);
      const damage = conduitBurnTick(state, owner, enemy) * value(state, owner, 'cinder-metering-nozzle', .25, .5);
      if (target && (target.burn.turns <= 0 || target.burn.damage < damage)) target.burn = { damage, turns: enemy.burn.turns, sourceId: owner.id, origin: 'conduit' };
    }
    const suppressor = state.allies.find(ally => ally.id === enemy.weakenSourceId);
    if (suppressor && enemy.weakened > 0 && enemy.weakenOrigin !== 'conduit' && equipped(suppressor, 'secondbeat-rack')) {
      const target = state.enemies.filter(unit => unit.hp > 0).sort((a, b) => b.stats.damage - a.stats.damage)[0];
      const fraction = enemy.weakenFraction * value(state, suppressor, 'secondbeat-rack', .6, 1);
      if (target && (target.weakened <= 0 || target.weakenFraction < fraction)) {
        target.weakened = Math.min(3, enemy.weakened); target.weakenFraction = fraction; target.weakenSourceId = suppressor.id; target.weakenOrigin = 'conduit';
        emit(events, 'status', suppressor, target, fraction, `${target.name} inherits generated Weaken.`);
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
export function conduitIncoming(state: BattleState, enemy: Combatant, target: Combatant, damage: number, critical: boolean,
  scheduled: boolean, events: BattleEvent[], action: ActionId = scheduled ? 'skill1' : 'light'): void {
  const n = gear(target).numbers;
  if (!scheduled && n.windveil) {
    delete n.windveil;
    emit(events, 'status', target, target, 0, `${target.name}'s Windveil avoids the Normal Attack.`);
    return;
  }
  const shieldBefore = target.shield;
  let equipmentMultiplier = 1;
  if (shieldBefore > 0 && equipped(target, 'fieldbrace-coupler')) equipmentMultiplier *= 1 - value(state, target, 'fieldbrace-coupler', .04, .08);
  if (critical && equipped(target, 'sentinel-aperture')) equipmentMultiplier *= 1 - value(state, target, 'sentinel-aperture', .25, .5);
  if (target.hp > target.stats.health * .75 && equipped(target, 'pale-bulwark-diadem')) equipmentMultiplier *= 1 - value(state, target, 'pale-bulwark-diadem', .15, .3);
  if (target.defending && equipped(target, 'tectonic-atlas-bastion')) equipmentMultiplier *= 1 - value(state, target, 'tectonic-atlas-bastion', .1, .2);
  if (n.solaceRound === state.round) equipmentMultiplier *= 1 - value(state, target, 'solace-anchor', .1, .2);
  const wardMultiplier = nativeShieldActivationMultiplier(enemy, target);
  const nativeMultiplier = nativeIncomingMultiplier(state, enemy, target, action, events) * wardMultiplier;
  const defendingMultiplier = target.defending ? 1 - defenseMode.damageReduction : 1;
  const hasParry = scheduled && target.defending && equipped(target, 'master-razor-1') && n.parryRound !== state.round;
  const temporaryMultiplier = (parry: boolean) => defendingMultiplier * equipmentMultiplier * nativeMultiplier * (parry ? .5 : 1);
  const totalMultiplier = (parry: boolean) => (state.conduitRulesVersion ?? 0) >= 3
    ? Math.max(.4, temporaryMultiplier(parry)) : temporaryMultiplier(parry);
  let reflection = 0;
  const beforeParry = damage * totalMultiplier(false);
  let offered = damage * totalMultiplier(hasParry);
  if (hasParry) {
    n.parryRound = state.round;
    reflection = Math.min(target.stats.damage, Math.max(0, beforeParry - offered) * .5);
  }
  let remaining = Math.max(1, Math.round(offered));
  const postMitigation = remaining;
  remaining = nativeRouteDamage(state, enemy, target, remaining, events,
    (recipient, redirected) => routedDamage(state, enemy, recipient, redirected, events, true));
  const networks = alive(state).filter(ally => equipped(ally, 'oceanic-shared-tide-pump') &&
    layers(target).some(layer => layer.native && layer.owner === ally.id && layer.amount > 0));
  for (const network of networks) {
    let budget = Math.min(remaining, postMitigation * value(state, network, 'oceanic-shared-tide-pump', .3, .6));
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
  for (const protector of alive(state).filter(ally => ally.id !== target.id && ally.defending && equipped(ally, 'tectonic-faultkeeper-loom'))) {
    const pn = gear(protector).numbers;
    if (pn.interceptRound !== state.round) { pn.interceptRound = state.round; pn.intercepted = 0; }
    const amount = Math.min(remaining * value(state, protector, 'tectonic-faultkeeper-loom', .3, .6), protector.stats.health * value(state, protector, 'tectonic-faultkeeper-loom', .2, .4) - pn.intercepted);
    if (amount <= 0) continue;
    pn.intercepted += amount; remaining -= amount; routedDamage(state, enemy, protector, amount, events);
  }
  const absorbed = consumeShield(target, remaining);
  let loss = remaining - absorbed.absorbed;
  for (const [id, amount] of absorbed.native) {
    const owner = state.allies.find(ally => ally.id === id);
    if (!owner) continue;
    const broke = absorbed.broken.has(id);
    if (equipped(owner, 'master-tide-1') && broke && !n[`tideBreak:${id}`]) { n[`tideBreak:${id}`] = 1; loss = 0; }
    pilotAuthoredShieldAbsorbed(state, id, amount, events);
    absorbedNative(state, owner, target, enemy, amount, broke, events);
  }
  if (absorbed.absorbed > 0 && target.hp > 0) {
    if (equipped(target, 'aegis-capacitor') && n.batteryRound !== state.round) { n.batteryRound = state.round; generatedGauge(target, target, value(state, target, 'aegis-capacitor', 4, 8), events); }
    if (equipped(target, 'tidebound-reflector') && n.reflectRound !== state.round) {
      n.reflectRound = state.round;
      generatedStrike(state, target, enemy, Math.min(absorbed.absorbed * value(state, target, 'tidebound-reflector', .2, .4), target.stats.damage * value(state, target, 'tidebound-reflector', .3, .6)), events);
    }
  }
  if (equipped(target, 'master-bruno-1') && n.limiterRound !== state.round) { n.limiterRound = state.round; loss = Math.min(loss, target.stats.health * .2); }
  const guardian = state.allies.find(ally => ally.id === gear(target).owners.guardian && ally.hp > 0);
  if (guardian && loss >= target.hp && n.guardianRound === state.round && gear(guardian).numbers.guardianUsedRound !== state.round) {
    gear(guardian).numbers.guardianUsedRound = state.round;
    const routed = Math.min(loss - target.hp + 1, guardian.stats.health * .2);
    loss -= routed; routedDamage(state, enemy, guardian, routed, events);
  }
  if (n.stasisProtectedRound === state.round) loss = 0;
  loss = deferCalamiticDamage(state, target, loss, events);
  loss = Math.min(target.hp, rescue(state, target, loss, events, true));
  const fullyAbsorbedNative = loss === 0 && absorbed.absorbed >= postMitigation
    ? new Map([...absorbed.native].filter(([, amount]) => amount >= postMitigation))
    : new Map<string, number>();
  nativeAbsorbedHit(state, target, fullyAbsorbedNative, loss, events);
  nativeGauge(state, target, shatterGauge.incomingHit, events);
  target.hp -= loss;
  bankCalamiticDamage(state, loss);
  emit(events, 'damage', enemy, target, loss, `${target.name}: ${Math.round(loss)} damage${critical ? ' (critical)' : ''}${absorbed.absorbed ? `, ${Math.round(absorbed.absorbed)} shield absorbed` : ''}.`, true);
  events[events.length - 1].shieldAbsorbed = absorbed.absorbed;
  events[events.length - 1].critical = critical;
  nativeDirectHpLoss(state, target, loss, events);
  afterConduitHpLoss(state, target, events);
  if (reflection > 0) generatedStrike(state, target, enemy, reflection, events);
  if (loss > 0) {
    n.phaseLoss = (n.phaseLoss ?? 0) + loss;
    if (target.hp > 0 && equipped(target, 'duplex-heart') && n.duplexRound !== state.round) { n.duplexRound = state.round; generatedHeal(target, injured(state, target, true), target.stats.health * value(state, target, 'duplex-heart', .05, .1), events); }
    const aurora = state.allies.find(ally => ally.hp > 0 && equipped(ally, 'master-aurora-3') && nativeControl(state, ally, enemy));
    if (aurora) {
      const an = gear(aurora).numbers;
      if (an.repairRound !== state.round) { an.repairRound = state.round; an.repaired = 0; }
      const recipient = alive(state).filter(ally => ally.id !== target.id && ally.hp < ally.stats.health).sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0];
      an.repaired += generatedHeal(aurora, recipient, Math.min(loss * .5, aurora.stats.health * .1 - an.repaired), events);
    }
  }
  if (target.hp > 0) {
    if (n.counterwindActive) n.counterwind = Math.min(.45, (n.counterwind ?? 0) + .15);
  }
}
function routedDamage(state: BattleState, enemy: Combatant, target: Combatant, amount: number, events: BattleEvent[], nativeRedirect = false): void {
  const absorbed = consumeShield(target, amount).absorbed;
  const loss = Math.min(target.hp, amount - absorbed);
  target.hp -= loss;
  emit(events, 'damage', enemy, target, loss, `${target.name} intercepts ${Math.round(amount)} damage (Conduit routing).`);
  if (nativeRedirect) {
    events[events.length - 1].origin = 'native';
    events[events.length - 1].nativeKind = 'redirect';
  }
}
function absorbedNative(state: BattleState, owner: Combatant, target: Combatant, enemy: Combatant, amount: number, broken: boolean, events: BattleEvent[]): void {
  if (owner.hp <= 0) return;
  const n = gear(owner).numbers;
  if (equipped(owner, 'aquatic-leviathan-pump')) n.absorption = (n.absorption ?? 0) + amount;
  if (broken && equipped(owner, 'master-thornia-1') && n.thornsRound !== state.round) {
    n.thornsRound = state.round;
    for (const foe of state.enemies.filter(foe => foe.hp > 0)) generatedStrike(state, owner, foe, Math.min(amount * .4, effectiveDefense(state, owner) * .5), events);
  }
}
export function conduitTurnStart(state: BattleState, events: BattleEvent[]): void {
  for (const owner of alive(state)) {
    const n = gear(owner).numbers;
    if (equipped(owner, 'granite-hourglass') && (n.phaseLoss ?? 0) > 0) generatedShield(owner, owner, Math.min(n.phaseLoss * value(state, owner, 'granite-hourglass', .3, .6), owner.stats.health * value(state, owner, 'granite-hourglass', .1, .2)), events);
    n.phaseLoss = 0;
    if (n.stasisSkip === state.round) generatedShield(owner, owner, owner.stats.health * value(state, owner, 'stasis-reliquary', .1, .2), events);
    if (owner.recoverThrough >= state.round) {
      if (equipped(owner, 'horizon-heartcase')) generatedHeal(owner, owner, (owner.stats.health - owner.hp) * value(state, owner, 'horizon-heartcase', .15, .3), events);
      if (equipped(owner, 'tranquilitic-stillhour-carillon')) {
        const amount = value(state, owner, 'tranquilitic-stillhour-carillon', 15, 30);
        generatedGauge(owner, owner, amount, events); generatedGauge(owner, lowestGauge(state, owner), amount, events);
      }
    }
    if (equipped(owner, 'aquatic-leviathan-pump') && (n.absorption ?? 0) > 0) {
      const pool = Math.min(n.absorption * value(state, owner, 'aquatic-leviathan-pump', .3, .6), owner.stats.health * value(state, owner, 'aquatic-leviathan-pump', .1, .2));
      const recipients = alive(state).filter(ally => ally.hp < ally.stats.health);
      for (const ally of recipients) generatedHeal(owner, ally, pool / recipients.length, events);
    }
    n.absorption = 0;
    for (const source of state.allies) {
      const key = `seed:${source.id}`;
      const offer = gear(owner).numbers[key];
      if (offer) { delete gear(owner).numbers[key]; generatedHeal(source, owner, offer, events); }
    }
  }
}
