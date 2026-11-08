import {
  radiantFlares, radiantMasters, radiantStarterKits, resolveRadiantStarterStats,
  validateRadiantLoadout, validateRadiantStats,
  type RadiantLoadout, type RadiantStats,
} from '../content/radiant-combat';
import {
  grantRadiantAction, grantRadiantIncomingAttack, grantRadiantRound, personalChargeMaximum,
  spendReadyFlare, validateRadiantGauge, type FlareTier, type RadiantGaugeState,
} from './radiant-gauge';
import { squadMemberLimit } from '../content/squad-rules';

export type RadiantSource =
  | { kind: 'normal' | 'flare' | 'passive' | 'master'; bearerId: string }
  | { kind: 'enemy'; enemyId: string };
export interface RadiantShield { id: number; source: RadiantSource; remaining: number }
export interface RadiantTimedEffect {
  source: RadiantSource;
  magnitude: number;
  remaining: number;
}
export interface RadiantBearer {
  loadout: RadiantLoadout;
  stats: RadiantStats;
  hp: number;
  shields: RadiantShield[];
  renewal: RadiantTimedEffect[];
  seeds: RadiantTimedEffect[];
  weaken: RadiantTimedEffect[];
  reductions: RadiantTimedEffect[];
  attackBuffs: RadiantTimedEffect[];
  guarding: boolean;
}
export interface RadiantCurrencyLedger {
  budget: number;
  baselineHP: number;
  lowestHP: number;
  paid: number;
}
export interface RadiantEnemy {
  id: string;
  stats: RadiantStats;
  hp: number;
  shields: RadiantShield[];
  burns: RadiantTimedEffect[];
  exposures: RadiantTimedEffect[];
  weaken: RadiantTimedEffect[];
  currency: RadiantCurrencyLedger;
}
export interface RadiantCombatState {
  version: 2;
  bearers: RadiantBearer[];
  enemies: RadiantEnemy[];
  gauge: RadiantGaugeState;
  phase: 'player' | 'enemy' | 'victory' | 'defeat';
  round: number;
  acted: string[];
  enemyActed: string[];
  tideReturns: string[];
  passiveTriggered: string[];
  chargeSeed: number;
  nextShieldId: number;
  currencyEarned: number;
}
export type RadiantCombatAction =
  | { type: 'normal'; bearerId: string; targetId: string }
  | { type: 'defense'; bearerId: string }
  | { type: 'flare'; bearerId: string; targetId?: string }
  | { type: 'enemy-attack'; enemyId: string; targetIds: string[]; coefficient: number }
  | { type: 'enemy-heal'; enemyId: string; amount: number }
  | { type: 'finish-enemy-phase' };
export type RadiantCombatEvent =
  | { type: 'damage'; source: RadiantSource; targetId: string; origin: 'direct' | 'periodic' | 'generated';
      offered: number; absorbed: number; healthLoss: number; shields: { source: RadiantSource; amount: number }[] }
  | { type: 'heal'; source: RadiantSource; targetId: string; snapshot: number; offered: number; effective: number }
  | { type: 'shield'; source: RadiantSource; targetId: string; amount: number; shieldId: number }
  | { type: 'currency'; enemyId: string; amount: number; totalPaid: number }
  | { type: 'defeated'; targetId: string }
  | { type: 'flare'; bearerId: string; tier: FlareTier; name: string }
  | { type: 'charge'; bearerId: string; personal: number; sharedUnits: number; bonusRolls: number; bonusOffered: number }
  | { type: 'round'; round: number }
  | { type: 'status'; targetId: string;
      status: 'burn' | 'seed' | 'renewal' | 'reduction' | 'weaken' | 'attack-buff' | 'exposure' | 'weaken-removed';
      source: RadiantSource; magnitude: number; remaining: number };

function safe(value: number, name: string, minimum = 0): void {
  if (!Number.isSafeInteger(value) || value < minimum) throw new Error(`Invalid radiant ${name}.`);
}
function finite(value: number, name: string, minimum = 0): void {
  if (!Number.isFinite(value) || value < minimum || value > Number.MAX_SAFE_INTEGER)
    throw new Error(`Invalid radiant ${name}.`);
}
function rounded(value: number): number {
  finite(value, 'packet magnitude');
  const result = Math.round(value);
  safe(result, 'rounded packet');
  return result;
}
function sourceEqual(a: RadiantSource, b: RadiantSource): boolean {
  return a.kind === b.kind && ('bearerId' in a && 'bearerId' in b
    ? a.bearerId === b.bearerId : 'enemyId' in a && 'enemyId' in b && a.enemyId === b.enemyId);
}
function currencyTotal(ledger: RadiantCurrencyLedger): number {
  const loss = ledger.baselineHP - ledger.lowestHP;
  return Number(BigInt(ledger.budget) * BigInt(loss) / BigInt(ledger.baselineHP));
}
export function validateRadiantCurrencyLedger(ledger: RadiantCurrencyLedger): void {
  safe(ledger.budget, 'currency budget');
  safe(ledger.baselineHP, 'currency baseline', 1);
  safe(ledger.lowestHP, 'lowest health');
  safe(ledger.paid, 'paid currency');
  if (ledger.lowestHP > ledger.baselineHP || ledger.paid !== currencyTotal(ledger))
    throw new Error('Inconsistent radiant currency ledger.');
}
export function depleteRadiantCurrency(
  ledger: RadiantCurrencyLedger, actualHP: number,
): { ledger: RadiantCurrencyLedger; amount: number } {
  validateRadiantCurrencyLedger(ledger);
  safe(actualHP, 'actual enemy health');
  if (actualHP > ledger.baselineHP) throw new Error('Enemy health exceeds its currency baseline.');
  const next = { ...ledger, lowestHP: Math.min(ledger.lowestHP, actualHP) };
  next.paid = currencyTotal(next);
  return { ledger: next, amount: next.paid - ledger.paid };
}
export function radiantDirectDamage(attack: number, defense: number, coefficient: number, output = 1): number {
  finite(attack, 'source Attack', Number.MIN_VALUE);
  finite(defense, 'effective Defense');
  finite(coefficient, 'damage coefficient', Number.MIN_VALUE);
  finite(output, 'damage output', Number.MIN_VALUE);
  // Divide before multiplying to avoid overflowing the Attack squared intermediate.
  const ratio = defense > attack ? (attack / defense) / (1 + attack / defense) : 1 / (1 + defense / attack);
  return Math.max(1, rounded(attack * ratio * coefficient * output));
}
function bearer(state: RadiantCombatState, id: string): RadiantBearer {
  const found = state.bearers.find(member => member.loadout.id === id);
  if (!found) throw new Error('Unknown radiant bearer.');
  return found;
}
function enemy(state: RadiantCombatState, id: string): RadiantEnemy {
  const found = state.enemies.find(member => member.id === id);
  if (!found) throw new Error('Unknown radiant enemy.');
  return found;
}
function exposure(target: RadiantEnemy): number {
  return Math.max(0, ...target.exposures.map(effect => effect.magnitude));
}
function living(hp: number): void {
  if (hp <= 0) throw new Error('Defeated radiant target cannot act or be selected.');
}
export function effectiveRadiantStats(state: RadiantCombatState, id: string): RadiantStats {
  const member = bearer(state, id);
  const stats = { ...member.stats };
  const leader = state.bearers[0];
  if (leader.hp > 0) {
    const kit = radiantStarterKits[leader.loadout.starter];
    const master = leader.loadout.masterId === null ? null : radiantMasters[leader.loadout.masterId];
    stats[kit.leaderStat] *= 1 + kit.leaderBonus * (leader.loadout.ascension.skill2 ? 1.5 : 1) +
      (master?.enhancement === 'leader' ? master.magnitude : 0);
  }
  stats.attack *= 1 - Math.max(0, ...member.weaken.map(effect => effect.magnitude));
  stats.attack *= 1 + Math.max(0, ...member.attackBuffs.map(effect => effect.magnitude));
  validateRadiantStats(stats);
  return stats;
}
function validateSource(state: RadiantCombatState, source: RadiantSource): void {
  if (!source || !['normal', 'flare', 'passive', 'master', 'enemy'].includes(source.kind))
    throw new Error('Invalid radiant effect source.');
  if (source.kind === 'enemy') enemy(state, source.enemyId);
  else bearer(state, source.bearerId);
}
function validateEffects(state: RadiantCombatState, effects: RadiantTimedEffect[], fractional = false): void {
  if (!Array.isArray(effects)) throw new Error('Invalid radiant effect ledger.');
  const sources: RadiantSource[] = [];
  for (const effect of effects) {
    validateSource(state, effect.source);
    if (sources.some(source => sourceEqual(source, effect.source))) throw new Error('Duplicate radiant effect source.');
    sources.push(effect.source);
    finite(effect.magnitude, 'effect magnitude');
    safe(effect.remaining, 'effect clock', 1);
    if (fractional && effect.magnitude >= 1) throw new Error('Invalid radiant reduction.');
  }
}
export function validateRadiantCombat(state: RadiantCombatState): void {
  if (!state || state.version !== 2 || !Array.isArray(state.bearers) || !state.bearers.length ||
      state.bearers.length > squadMemberLimit || !Array.isArray(state.enemies) || !state.enemies.length ||
      !['player', 'enemy', 'victory', 'defeat'].includes(state.phase))
    throw new Error('Invalid radiant combat roster or version.');
  safe(state.round, 'round', 1);
  safe(state.chargeSeed, 'charge seed');
  if (state.chargeSeed > 0xffffffff) throw new Error('Invalid radiant charge seed.');
  safe(state.nextShieldId, 'shield serial', 1);
  safe(state.currencyEarned, 'earned currency');
  const ids = [...state.bearers.map(member => member.loadout.id), ...state.enemies.map(member => member.id)];
  if (ids.some(id => typeof id !== 'string' || !id) || new Set(ids).size !== ids.length)
    throw new Error('Radiant instance IDs must be distinct.');
  validateRadiantGauge(state.gauge);
  if (state.gauge.members.length !== state.bearers.length) throw new Error('Radiant Gauge roster mismatch.');
  const shieldIds = new Set<number>();
  for (const member of [...state.bearers, ...state.enemies]) {
    validateRadiantStats(member.stats);
    safe(member.hp, 'current health');
    if (member.hp > Math.round(member.stats.hp)) throw new Error('Radiant health exceeds maximum.');
    if (!Array.isArray(member.shields)) throw new Error('Invalid radiant Shields.');
    let shieldTotal = 0;
    let previousShieldId = 0;
    for (const shield of member.shields) {
      validateSource(state, shield.source);
      safe(shield.id, 'shield ID', 1);
      safe(shield.remaining, 'shield remaining', 1);
      shieldTotal += shield.remaining;
      safe(shieldTotal, 'total Shield');
      if (shield.id >= state.nextShieldId || shield.id <= previousShieldId || shieldIds.has(shield.id))
        throw new Error('Invalid radiant Shield order.');
      previousShieldId = shield.id;
      shieldIds.add(shield.id);
    }
  }
  for (let index = 0; index < state.bearers.length; index++) {
    const member = state.bearers[index];
    validateRadiantLoadout(member.loadout);
    const expected = resolveRadiantStarterStats(member.loadout);
    if (Object.keys(expected).some(key => expected[key as keyof RadiantStats] !== member.stats[key as keyof RadiantStats]))
      throw new Error('Radiant frozen stats do not match their loadout.');
    const gauge = state.gauge.members[index];
    if (gauge.id !== member.loadout.id || gauge.form !== member.loadout.form ||
        gauge.baseCost !== radiantStarterKits[member.loadout.starter].baseCost || gauge.living !== (member.hp > 0))
      throw new Error('Radiant Gauge member mismatch.');
    if (typeof member.guarding !== 'boolean') throw new Error('Invalid radiant guard.');
    validateEffects(state, member.renewal);
    validateEffects(state, member.seeds);
    validateEffects(state, member.weaken, true);
    validateEffects(state, member.reductions, true);
    validateEffects(state, member.attackBuffs, true);
  }
  let paid = 0, budget = 0;
  for (const member of state.enemies) {
    validateEffects(state, member.burns);
    validateEffects(state, member.exposures, true);
    validateEffects(state, member.weaken, true);
    validateRadiantCurrencyLedger(member.currency);
    if (member.currency.baselineHP !== Math.round(member.stats.hp) || member.currency.lowestHP > member.hp)
      throw new Error('Radiant currency baseline mismatch.');
    paid += member.currency.paid;
    safe(paid, 'total paid');
    budget += member.currency.budget;
    safe(budget, 'total currency budget');
  }
  if (paid !== state.currencyEarned) throw new Error('Radiant paid currency total mismatch.');
  for (const [list, valid] of [[state.acted, state.bearers.map(m => m.loadout.id)],
    [state.enemyActed, state.enemies.map(m => m.id)],
    [state.passiveTriggered, state.bearers.map(m => m.loadout.id)],
    [state.tideReturns, state.bearers.filter(m => m.loadout.starter === 'tide').map(m => m.loadout.id)]] as const) {
    if (!Array.isArray(list) || new Set(list).size !== list.length || list.some(id => !valid.includes(id)))
      throw new Error('Invalid radiant action ledger.');
  }
  const alliesLive = state.bearers.some(m => m.hp > 0), enemiesLive = state.enemies.some(m => m.hp > 0);
  if ((state.phase === 'victory') !== !enemiesLive ||
      (state.phase === 'defeat') !== (enemiesLive && !alliesLive))
    throw new Error('Radiant phase does not match living combatants.');
  if (state.phase === 'player' && state.bearers.filter(m => m.hp > 0).every(m => state.acted.includes(m.loadout.id)))
    throw new Error('Radiant player phase has no remaining actions.');
  if (state.phase === 'enemy' && state.bearers.filter(m => m.hp > 0).some(m => !state.acted.includes(m.loadout.id)))
    throw new Error('Radiant enemy phase began before the squad acted.');
}
export function validateRadiantParty(loadouts: RadiantLoadout[]): void {
  if (!Array.isArray(loadouts) || loadouts.length < 1 || loadouts.length > squadMemberLimit)
    throw new Error('Radiant party must contain one to six acquired Element-Bearers.');
  const instanceIds = new Set<string>(), bearerIds = new Set<string>();
  for (const loadout of loadouts) {
    validateRadiantLoadout(loadout);
    if (instanceIds.has(loadout.id) || bearerIds.has(loadout.starter))
      throw new Error('Radiant party members must be distinct acquired Element-Bearers.');
    instanceIds.add(loadout.id);
    bearerIds.add(loadout.starter);
  }
}
export function createRadiantCombat(
  loadouts: RadiantLoadout[], enemies: { id: string; stats: RadiantStats; currencyBudget: number }[], chargeSeed: number,
): RadiantCombatState {
  const state: RadiantCombatState = {
    version: 2,
    bearers: loadouts.map(loadout => {
      const stats = resolveRadiantStarterStats(loadout);
      return { loadout: structuredClone(loadout), stats, hp: rounded(stats.hp), shields: [],
        renewal: [], seeds: [], weaken: [], reductions: [], attackBuffs: [], guarding: false };
    }),
    enemies: enemies.map(input => {
      validateRadiantStats(input.stats);
      const hp = rounded(input.stats.hp);
      return { id: input.id, stats: { ...input.stats }, hp, shields: [], burns: [],
        exposures: [], weaken: [],
        currency: { budget: input.currencyBudget, baselineHP: hp, lowestHP: hp, paid: 0 } };
    }),
    gauge: { members: loadouts.map(loadout => ({ id: loadout.id, form: loadout.form,
      baseCost: radiantStarterKits[loadout.starter].baseCost, charge: 0, living: true })),
      sharedUnits: 0, eternalCasts: 0 },
    phase: 'player', round: 1, acted: [], enemyActed: [], tideReturns: [], passiveTriggered: [],
    chargeSeed, nextShieldId: 1, currencyEarned: 0,
  };
  validateRadiantCombat(state);
  return state;
}
function sync(state: RadiantCombatState): void {
  state.gauge.members.forEach((member, index) => { member.living = state.bearers[index].hp > 0; });
  if (state.enemies.every(member => member.hp === 0)) state.phase = 'victory';
  else if (state.bearers.every(member => member.hp === 0)) state.phase = 'defeat';
}
function packet(
  state: RadiantCombatState, events: RadiantCombatEvent[], target: RadiantBearer | RadiantEnemy,
  source: RadiantSource, origin: 'direct' | 'periodic' | 'generated', offered: number,
): { healthLoss: number; absorbed: number; shields: { source: RadiantSource; amount: number }[] } {
  safe(offered, 'damage packet', 1);
  living(target.hp);
  let remaining = offered;
  const shields: { source: RadiantSource; amount: number }[] = [];
  for (const shield of target.shields) {
    const amount = Math.min(remaining, shield.remaining);
    if (amount > 0) shields.push({ source: { ...shield.source }, amount });
    shield.remaining -= amount;
    remaining -= amount;
  }
  target.shields = target.shields.filter(shield => shield.remaining > 0);
  const healthLoss = Math.min(target.hp, remaining), absorbed = offered - remaining;
  target.hp -= healthLoss;
  const targetId = 'loadout' in target ? target.loadout.id : target.id;
  events.push({ type: 'damage', source, targetId, origin, offered, absorbed, healthLoss, shields });
  if ('currency' in target) {
    const payout = depleteRadiantCurrency(target.currency, target.hp);
    target.currency = payout.ledger;
    state.currencyEarned += payout.amount;
    safe(state.currencyEarned, 'earned currency');
    if (payout.amount > 0) events.push({ type: 'currency', enemyId: target.id,
      amount: payout.amount, totalPaid: target.currency.paid });
  }
  if (target.hp === 0) events.push({ type: 'defeated', targetId });
  sync(state);
  return { healthLoss, absorbed, shields };
}
function heal(
  events: RadiantCombatEvent[], target: RadiantBearer | RadiantEnemy, source: RadiantSource, snapshot: number,
): number {
  finite(snapshot, 'healing snapshot');
  if (target.hp === 0) return 0;
  const offered = rounded(snapshot), effective = Math.min(offered, rounded(target.stats.hp) - target.hp);
  target.hp += effective;
  events.push({ type: 'heal', source, targetId: 'loadout' in target ? target.loadout.id : target.id,
    snapshot, offered, effective });
  return effective;
}
function shield(
  state: RadiantCombatState, events: RadiantCombatEvent[], target: RadiantBearer,
  source: RadiantSource, magnitude: number,
): void {
  const amount = rounded(magnitude);
  if (amount === 0 || target.hp === 0) return;
  const shieldId = state.nextShieldId++;
  safe(state.nextShieldId, 'shield serial', 1);
  target.shields.push({ id: shieldId, source, remaining: amount });
  events.push({ type: 'shield', source, targetId: target.loadout.id, amount, shieldId });
}
function refresh(effects: RadiantTimedEffect[], source: RadiantSource, magnitude: number, remaining: number): void {
  const old = effects.find(effect => sourceEqual(effect.source, source));
  if (old) {
    old.magnitude = Math.max(old.magnitude, magnitude);
    old.remaining = Math.max(old.remaining, remaining);
  } else effects.push({ source, magnitude, remaining });
}
function rollCharge(state: RadiantCombatState): number {
  state.chargeSeed = (Math.imul(state.chargeSeed, 1664525) + 1013904223) >>> 0;
  return state.chargeSeed / 0x100000000;
}
function addPassiveCharge(state: RadiantCombatState, events: RadiantCombatEvent[], id: string, amount: number): void {
  safe(amount, 'passive charge');
  const member = state.gauge.members.find(m => m.id === id)!;
  member.charge += Math.min(amount, personalChargeMaximum(member) - member.charge);
  events.push({ type: 'charge', bearerId: id, personal: member.charge, sharedUnits: state.gauge.sharedUnits,
    bonusRolls: 0, bonusOffered: 0 });
}
function passivePower(actor: RadiantBearer): number {
  const master = actor.loadout.masterId === null ? null : radiantMasters[actor.loadout.masterId];
  return 1 + (master?.rule === 'standard' && master.enhancement === 'passive' ? master.magnitude : 0) +
    (actor.loadout.ascension.skill1 ? .5 : 0);
}
function woundedAlly(state: RadiantCombatState): RadiantBearer | undefined {
  let selected: RadiantBearer | undefined, largest = 0;
  for (const ally of state.bearers.filter(member => member.hp > 0)) {
    const missing = (rounded(ally.stats.hp) - ally.hp) / rounded(ally.stats.hp);
    if (selected === undefined || missing > largest) { selected = ally; largest = missing; }
  }
  return selected;
}
function nextAlly(state: RadiantCombatState, actor: RadiantBearer): RadiantBearer | undefined {
  const start = state.bearers.indexOf(actor);
  const ordered = [...state.bearers.slice(start + 1), ...state.bearers.slice(0, start)];
  return ordered.find(member => member.hp > 0 && !state.acted.includes(member.loadout.id));
}
function applyStatus(
  events: RadiantCombatEvent[], targetId: string, effects: RadiantTimedEffect[],
  source: RadiantSource, status: Extract<RadiantCombatEvent, { type: 'status' }>['status'],
  magnitude: number, remaining: number,
): void {
  refresh(effects, source, magnitude, remaining);
  events.push({ type: 'status', targetId, status, source, magnitude, remaining });
}
function cleanse(
  events: RadiantCombatEvent[], actor: RadiantBearer, target: RadiantBearer, recovery: number,
): void {
  if (!target.weaken.length) return;
  const strongest = target.weaken.reduce((a, b) => a.magnitude >= b.magnitude ? a : b);
  target.weaken.splice(target.weaken.indexOf(strongest), 1);
  events.push({ type: 'status', targetId: target.loadout.id, status: 'weaken-removed',
    source: strongest.source, magnitude: strongest.magnitude, remaining: strongest.remaining });
  const master = actor.loadout.masterId === null ? null : radiantMasters[actor.loadout.masterId];
  if (master?.rule === 'standard' && master.enhancement === 'passive')
    heal(events, target, { kind: 'master', bearerId: actor.loadout.id }, .15 * recovery);
  if (actor.loadout.ascension.skill1)
    heal(events, target, { kind: 'passive', bearerId: actor.loadout.id }, .5 * recovery);
}
function defensePassive(state: RadiantCombatState, events: RadiantCombatEvent[], actor: RadiantBearer): void {
  const stats = effectiveRadiantStats(state, actor.loadout.id);
  const passive = radiantStarterKits[actor.loadout.starter].passive;
  const magnitude = passive.magnitude * passivePower(actor);
  const source: RadiantSource = { kind: 'passive', bearerId: actor.loadout.id };
  const wounded = woundedAlly(state);
  switch (passive.rule) {
    case 'guard-shelter':
      if (wounded) shield(state, events, wounded, source, magnitude * stats.defense);
      break;
    case 'guard-convoy':
      if (wounded) shield(state, events, wounded, source, magnitude * stats.recovery);
      break;
    case 'guard-foundation':
      shield(state, events, actor, source, magnitude * stats.defense);
      break;
    case 'guard-focus': {
      const next = nextAlly(state, actor);
      if (next) applyStatus(events, next.loadout.id, next.attackBuffs, source, 'attack-buff', magnitude, 1);
      break;
    }
    case 'guard-weaken': {
      const target = state.enemies.filter(member => member.hp > 0)
        .reduce<RadiantEnemy | undefined>((best, member) => !best || member.stats.attack > best.stats.attack ? member : best, undefined);
      if (target) applyStatus(events, target.id, target.weaken, source, 'weaken', magnitude, 1);
      break;
    }
    case 'guard-cleanse': {
      const target = state.bearers.filter(member => member.hp > 0 && member.weaken.length)
        .reduce<RadiantBearer | undefined>((best, member) =>
          !best || Math.max(...member.weaken.map(effect => effect.magnitude)) >
          Math.max(...best.weaken.map(effect => effect.magnitude)) ? member : best, undefined);
      if (target) cleanse(events, actor, target, stats.recovery);
      break;
    }
    case 'guard-stillness':
      applyStatus(events, actor.loadout.id, actor.reductions, source, 'reduction', magnitude, 1);
      break;
  }
}
function normal(state: RadiantCombatState, events: RadiantCombatEvent[], actor: RadiantBearer, targetId: string): number {
  const target = enemy(state, targetId);
  living(target.hp);
  const stats = effectiveRadiantStats(state, actor.loadout.id);
  const source: RadiantSource = { kind: 'normal', bearerId: actor.loadout.id };
  const burning = target.burns.some(effect => 'bearerId' in effect.source && effect.source.bearerId === actor.loadout.id);
  const anyBurn = target.burns.length > 0, exposed = exposure(target) > 0, weakened = target.weaken.length > 0;
  const aboveHalf = target.hp > rounded(target.stats.hp) / 2;
  const impact = packet(state, events, target, source, 'direct',
    radiantDirectDamage(stats.attack, target.stats.defense, 1, 1 + exposure(target)));
  const power = passivePower(actor);
  if (impact.healthLoss > 0 && actor.loadout.starter === 'ember' && burning && target.hp > 0)
    packet(state, events, target, { kind: 'passive', bearerId: actor.loadout.id },
      'periodic', Math.max(1, rounded(.1 * stats.attack * power)));
  if (impact.healthLoss > 0 && actor.loadout.starter === 'sprout') {
    let selected: RadiantBearer | undefined;
    let largest = 0;
    for (const ally of state.bearers.filter(member => member.hp > 0)) {
      const fraction = (rounded(ally.stats.hp) - ally.hp) / rounded(ally.stats.hp);
      if (fraction > largest) { selected = ally; largest = fraction; }
    }
    if (selected) {
      const passive: RadiantSource = { kind: 'passive', bearerId: actor.loadout.id };
      refresh(selected.seeds, passive, .15 * stats.recovery * power, 1);
      events.push({ type: 'status', targetId: selected.loadout.id, status: 'seed',
        source: passive, magnitude: .15 * stats.recovery * power, remaining: 1 });
    }
  }
  if (actor.loadout.starter === 'nerithe') {
    addPassiveCharge(state, events, actor.loadout.id, rounded(5 * power));
  }
  if (impact.healthLoss > 0) {
    const passive = radiantStarterKits[actor.loadout.starter].passive;
    const magnitude = passive.magnitude * power;
    const passiveSource: RadiantSource = { kind: 'passive', bearerId: actor.loadout.id };
    const wounded = woundedAlly(state);
    const extraHit = passive.rule === 'burning-strike' && anyBurn ||
      passive.rule === 'exposed-strike' && exposed || passive.rule === 'opening-incision' && aboveHalf;
    if (extraHit && target.hp > 0)
      packet(state, events, target, passiveSource, 'generated', Math.max(1, rounded(magnitude * stats.attack)));
    if (target.hp > 0 && (passive.rule === 'normal-expose' || passive.rule === 'weakened-expose' && weakened))
      applyStatus(events, target.id, target.exposures, passiveSource, 'exposure', magnitude, 1);
    if (target.hp > 0 && passive.rule === 'normal-burn')
      applyStatus(events, target.id, target.burns, passiveSource, 'burn', magnitude * stats.attack, 1);
    if (wounded && wounded.hp < rounded(wounded.stats.hp) && (passive.rule === 'long-seed' || passive.rule === 'normal-renewal'))
      applyStatus(events, wounded.loadout.id, passive.rule === 'long-seed' ? wounded.seeds : wounded.renewal,
        passiveSource, passive.rule === 'long-seed' ? 'seed' : 'renewal',
        magnitude * stats.recovery, passive.rule === 'long-seed' ? 2 : 1);
    if (passive.rule === 'burning-heal' && anyBurn) heal(events, actor, passiveSource, magnitude * stats.recovery);
    if (passive.rule === 'late-heal' && state.acted.length && wounded)
      heal(events, wounded, passiveSource, magnitude * stats.recovery);
    if (passive.rule === 'exposed-charge' && exposed) addPassiveCharge(state, events, actor.loadout.id, rounded(magnitude));
    if (passive.rule === 'next-ally-focus' || passive.rule === 'next-ally-shield') {
      const next = nextAlly(state, actor);
      if (next && passive.rule === 'next-ally-shield') shield(state, events, next, passiveSource, magnitude * stats.defense);
      else if (next) applyStatus(events, next.loadout.id, next.attackBuffs, passiveSource, 'attack-buff', magnitude, 1);
    }
  }
  return impact.healthLoss + impact.absorbed > 0 ? 1 : 0;
}
function flare(
  state: RadiantCombatState, events: RadiantCombatEvent[], actor: RadiantBearer, targetId: string | undefined,
): { tier: FlareTier; hits: number } {
  const master = actor.loadout.masterId === null ? null : radiantMasters[actor.loadout.masterId];
  const spent = spendReadyFlare(state.gauge, actor.loadout.id);
  state.gauge = spent.state;
  const tier = spent.tier, offer = radiantFlares[actor.loadout.starter][tier];
  const masterStrike = master?.rule === 'tide-strike' || master?.rule === 'sprout-strike';
  if (offer.target === 'one-enemy' || masterStrike) {
    if (targetId === undefined) throw new Error('This signature requires a selected living enemy.');
    living(enemy(state, targetId).hp);
  } else if (targetId !== undefined) throw new Error('This signature uses its authored target set.');
  const stats = effectiveRadiantStats(state, actor.loadout.id);
  const source: RadiantSource = { kind: 'flare', bearerId: actor.loadout.id };
  const signaturePower = 1 + (master?.rule === 'standard' && master.enhancement === 'signature' ? master.magnitude : 0) +
    (actor.loadout.ascension.lastFlare ? .5 : 0);
  events.push({ type: 'flare', bearerId: actor.loadout.id, tier, name: offer.name });
  let hits = 0;
  const enemyTargets = offer.target === 'all-enemies'
    ? state.enemies.filter(member => member.hp > 0)
    : offer.target === 'one-enemy' && targetId !== undefined ? [enemy(state, targetId)] : [];
  for (const target of enemyTargets) {
    if (actor.loadout.starter === 'ember' && tier === 'eternal') {
      const burns = target.burns.filter(effect => 'bearerId' in effect.source && effect.source.bearerId === actor.loadout.id);
      target.burns = target.burns.filter(effect => !burns.includes(effect));
      for (const burn of burns) if (target.hp > 0)
        packet(state, events, target, burn.source, 'periodic', Math.max(1, rounded(burn.magnitude) * burn.remaining));
    }
    if (target.hp === 0) continue;
    const impact = packet(state, events, target, source, 'direct', radiantDirectDamage(stats.attack,
      target.stats.defense, offer.damage * signaturePower * (master?.rule === 'flare-damage' ? 1.15 : 1), 1 + exposure(target)));
    if (impact.healthLoss + impact.absorbed > 0) hits++;
    if (target.hp > 0 && offer.burn > 0) {
      const magnitude = offer.burn * stats.attack * signaturePower;
      const remaining = offer.burnPhases + (master?.rule === 'longer-burn' ? 1 : 0);
      refresh(target.burns, source, magnitude, remaining);
      events.push({ type: 'status', targetId: target.id, status: 'burn', source, magnitude, remaining });
    }
    if (target.hp > 0 && offer.weaken > 0) {
      const magnitude = offer.weaken * signaturePower;
      refresh(target.weaken, source, magnitude, offer.weakenPhases);
      events.push({ type: 'status', targetId: target.id, status: 'weaken', source, magnitude,
        remaining: offer.weakenPhases });
    }
    if (target.hp > 0 && offer.exposure > 0) {
      const magnitude = offer.exposure * signaturePower;
      refresh(target.exposures, source, magnitude, offer.exposurePhases);
      events.push({ type: 'status', targetId: target.id, status: 'exposure', source, magnitude,
        remaining: offer.exposurePhases });
    }
  }
  const allyTargets = state.bearers.filter(member => member.hp > 0);
  let effectiveHealing = 0;
  for (const ally of allyTargets) {
    if (offer.shieldDefense > 0 || offer.shieldHP > 0) {
      const magnitude = (offer.shieldDefense * stats.defense +
        (offer.shieldHP + (master?.rule === 'deep-shield' ? .08 : 0)) * ally.stats.hp) *
        signaturePower * (master?.rule === 'flare-shield' ? 1.15 : 1);
      shield(state, events, ally, source, magnitude);
    }
    if (offer.reduction > 0) {
      refresh(ally.reductions, source, offer.reduction * signaturePower, offer.reductionPhases);
      events.push({ type: 'status', targetId: ally.loadout.id, status: 'reduction',
        source, magnitude: offer.reduction * signaturePower, remaining: offer.reductionPhases });
    }
    if (offer.heal > 0) {
      effectiveHealing += heal(events, ally, source,
        offer.heal * stats.recovery * signaturePower * (master?.rule === 'flare-heal' ? 1.15 : 1));
      if (actor.loadout.starter === 'sprout' && tier === 'eternal' && ally.weaken.length) {
        const strongest = ally.weaken.reduce((a, b) => a.magnitude >= b.magnitude ? a : b);
        ally.weaken.splice(ally.weaken.indexOf(strongest), 1);
        events.push({ type: 'status', targetId: ally.loadout.id, status: 'weaken-removed',
          source: strongest.source, magnitude: strongest.magnitude, remaining: strongest.remaining });
      }
    }
    if (offer.renewal > 0) {
      const magnitude = offer.renewal * stats.recovery * signaturePower;
      const remaining = offer.renewalRounds + (master?.rule === 'longer-renewal' ? 1 : 0);
      refresh(ally.renewal, source, magnitude, remaining);
      events.push({ type: 'status', targetId: ally.loadout.id, status: 'renewal', source, magnitude, remaining });
    }
    if (offer.attackBuff > 0) {
      const magnitude = offer.attackBuff * signaturePower;
      refresh(ally.attackBuffs, source, magnitude, offer.attackBuffRounds);
      events.push({ type: 'status', targetId: ally.loadout.id, status: 'attack-buff', source,
        magnitude, remaining: offer.attackBuffRounds });
    }
  }
  if (master?.rule === 'self-shield')
    shield(state, events, actor, { kind: 'master', bearerId: actor.loadout.id }, .08 * actor.stats.hp);
  if (masterStrike && targetId !== undefined && enemy(state, targetId).hp > 0) {
    const target = enemy(state, targetId);
    packet(state, events, target, { kind: 'master', bearerId: actor.loadout.id }, 'generated',
      radiantDirectDamage(stats.attack, target.stats.defense, master?.rule === 'tide-strike' ? .9 : .75, 1 + exposure(target)));
  }
  const passive = radiantStarterKits[actor.loadout.starter].passive;
  const passiveSource: RadiantSource = { kind: 'passive', bearerId: actor.loadout.id };
  if (passive.rule === 'flare-cleanse') for (const ally of allyTargets) cleanse(events, actor, ally, stats.recovery);
  if (effectiveHealing > 0 && passive.rule === 'heal-charge')
    addPassiveCharge(state, events, actor.loadout.id, rounded(passive.magnitude * passivePower(actor)));
  if (effectiveHealing > 0 && passive.rule === 'heal-shelter') {
    const wounded = woundedAlly(state);
    if (wounded) shield(state, events, wounded, passiveSource, passive.magnitude * passivePower(actor) * stats.recovery);
  }
  return { tier, hits };
}
function enemyAttack(
  state: RadiantCombatState, events: RadiantCombatEvent[], action: Extract<RadiantCombatAction, { type: 'enemy-attack' }>,
): void {
  const actor = enemy(state, action.enemyId);
  living(actor.hp);
  if (!Array.isArray(action.targetIds) || !action.targetIds.length ||
      new Set(action.targetIds).size !== action.targetIds.length) throw new Error('Invalid radiant enemy target set.');
  finite(action.coefficient, 'enemy coefficient', Number.MIN_VALUE);
  const targets = action.targetIds.map(id => { const target = bearer(state, id); living(target.hp); return target; });
  const returns = new Set<string>();
  for (const target of targets) {
    const stats = effectiveRadiantStats(state, target.loadout.id);
    const reduction = Math.max(0, ...target.reductions.map(effect => effect.magnitude));
    const weakening = Math.max(0, ...actor.weaken.map(effect => effect.magnitude));
    const impact = packet(state, events, target, { kind: 'enemy', enemyId: actor.id }, 'direct',
      radiantDirectDamage(actor.stats.attack * (1 - weakening), stats.defense, action.coefficient,
        Math.max(.2, (target.guarding ? .5 : 1) * (1 - reduction))));
    if (target.hp > 0 && impact.healthLoss + impact.absorbed > 0) {
      state.gauge = grantRadiantIncomingAttack(state.gauge, target.loadout.id);
      events.push({ type: 'charge', bearerId: target.loadout.id,
        personal: state.gauge.members.find(m => m.id === target.loadout.id)!.charge,
        sharedUnits: state.gauge.sharedUnits, bonusRolls: 0, bonusOffered: 0 });
    }
    const passive = radiantStarterKits[target.loadout.starter].passive;
    if (target.hp > 0 && !state.passiveTriggered.includes(target.loadout.id)) {
      const magnitude = passive.magnitude * passivePower(target);
      const passiveSource: RadiantSource = { kind: 'passive', bearerId: target.loadout.id };
      let triggered = false;
      if (impact.healthLoss > 0 && passive.rule === 'hurt-bulwark') {
        shield(state, events, target, passiveSource, magnitude * stats.defense);
        triggered = true;
      } else if (impact.healthLoss > 0 && (passive.rule === 'hurt-shelter' ||
        passive.rule === 'wounded-refusal' && target.hp < rounded(target.stats.hp) / 2)) {
        shield(state, events, target, passiveSource, magnitude * target.stats.hp);
        triggered = true;
      } else if (impact.absorbed > 0 && passive.rule === 'absorbed-heal') {
        heal(events, target, passiveSource, magnitude * stats.recovery);
        triggered = true;
      }
      if (triggered) state.passiveTriggered.push(target.loadout.id);
    }
    for (const absorption of impact.shields) if ('bearerId' in absorption.source) {
      const owner = bearer(state, absorption.source.bearerId);
      const ownerPassive = radiantStarterKits[owner.loadout.starter].passive;
      if (owner.hp > 0 && ownerPassive.rule === 'absorbed-burn' && !state.passiveTriggered.includes(owner.loadout.id)) {
        const magnitude = ownerPassive.magnitude * passivePower(owner) * effectiveRadiantStats(state, owner.loadout.id).attack;
        applyStatus(events, actor.id, actor.burns, { kind: 'passive', bearerId: owner.loadout.id }, 'burn', magnitude, 1);
        state.passiveTriggered.push(owner.loadout.id);
      }
    }
    if (impact.healthLoss === 0 && impact.absorbed > 0 && impact.shields.every(entry =>
      entry.source.kind === 'flare' && 'bearerId' in entry.source &&
      entry.source.bearerId === (impact.shields[0].source as { bearerId: string }).bearerId)) {
      const source = impact.shields[0].source;
      if ('bearerId' in source) {
        const owner = bearer(state, source.bearerId);
        if (owner.hp > 0 && owner.loadout.starter === 'tide') returns.add(owner.loadout.id);
      }
    }
  }
  for (const id of returns) if (!state.tideReturns.includes(id) && bearer(state, id).hp > 0) {
    state.tideReturns.push(id);
    addPassiveCharge(state, events, id, rounded(8 * passivePower(bearer(state, id))));
  }
}
function finishRound(state: RadiantCombatState, events: RadiantCombatEvent[]): void {
  if (state.enemies.filter(m => m.hp > 0).some(m => !state.enemyActed.includes(m.id)))
    throw new Error('Every living enemy must act before completing its phase.');
  for (const target of state.enemies.filter(m => m.hp > 0)) {
    for (const burn of target.burns) if (target.hp > 0) {
      packet(state, events, target, burn.source, 'periodic', Math.max(1, rounded(burn.magnitude)));
      burn.remaining--;
    }
    target.burns = target.burns.filter(burn => burn.remaining > 0);
  }
  for (const target of state.enemies) {
    for (const effect of [...target.weaken, ...target.exposures]) effect.remaining--;
    target.weaken = target.weaken.filter(effect => effect.remaining > 0);
    target.exposures = target.exposures.filter(effect => effect.remaining > 0);
  }
  if (state.phase === 'victory' || state.phase === 'defeat') return;
  for (const target of state.bearers) {
    target.guarding = false;
    for (const effects of [target.weaken, target.reductions]) effects.forEach(effect => { effect.remaining--; });
    target.weaken = target.weaken.filter(effect => effect.remaining > 0);
    target.reductions = target.reductions.filter(effect => effect.remaining > 0);
    target.attackBuffs.forEach(effect => { effect.remaining--; });
    target.attackBuffs = target.attackBuffs.filter(effect => effect.remaining > 0);
    for (const effects of [target.seeds, target.renewal]) for (const effect of effects) {
      heal(events, target, effect.source, effect.magnitude);
      effect.remaining--;
    }
    target.seeds = target.seeds.filter(effect => effect.remaining > 0);
    target.renewal = target.renewal.filter(effect => effect.remaining > 0);
  }
  state.gauge = grantRadiantRound(state.gauge);
  state.round++;
  safe(state.round, 'round', 1);
  state.acted = [];
  state.enemyActed = [];
  state.tideReturns = [];
  state.passiveTriggered = [];
  state.phase = 'player';
  events.push({ type: 'round', round: state.round });
  for (const member of state.gauge.members.filter(m => m.living))
    events.push({ type: 'charge', bearerId: member.id, personal: member.charge,
      sharedUnits: state.gauge.sharedUnits, bonusRolls: 0, bonusOffered: 0 });
}
export function applyRadiantCombatAction(
  input: RadiantCombatState, action: RadiantCombatAction,
): { state: RadiantCombatState; events: RadiantCombatEvent[] } {
  validateRadiantCombat(input);
  if (!action || !['normal', 'defense', 'flare', 'enemy-attack', 'enemy-heal', 'finish-enemy-phase'].includes(action.type))
    throw new Error('Unknown radiant combat action.');
  if (input.phase === 'victory' || input.phase === 'defeat') throw new Error('Radiant encounter is finished.');
  const state = structuredClone(input), events: RadiantCombatEvent[] = [];
  if (action.type === 'normal' || action.type === 'defense' || action.type === 'flare') {
    if (state.phase !== 'player') throw new Error('Not the radiant player phase.');
    const actor = bearer(state, action.bearerId);
    living(actor.hp);
    if (state.acted.includes(action.bearerId)) throw new Error('This bearer already acted this round.');
    let hits = 0, chargeAction: 'normal' | 'defense' | 'flare' | 'eternal' = action.type;
    if (action.type === 'normal') hits = normal(state, events, actor, action.targetId);
    else if (action.type === 'defense') {
      actor.guarding = true;
      defensePassive(state, events, actor);
    }
    else {
      const cast = flare(state, events, actor, action.targetId);
      hits = cast.hits;
      chargeAction = cast.tier === 'eternal' ? 'eternal' : 'flare';
    }
    const charge = grantRadiantAction(state.gauge, action.bearerId, chargeAction, hits, () => rollCharge(state));
    state.gauge = charge.state;
    events.push({ type: 'charge', bearerId: action.bearerId,
      personal: state.gauge.members.find(m => m.id === action.bearerId)!.charge,
      sharedUnits: state.gauge.sharedUnits, bonusRolls: charge.bonusRolls, bonusOffered: charge.bonusOffered });
    state.acted.push(action.bearerId);
    if (state.phase === 'player' && state.bearers.filter(m => m.hp > 0).every(m => state.acted.includes(m.loadout.id)))
      state.phase = 'enemy';
  } else {
    if (state.phase !== 'enemy') throw new Error('Not the radiant enemy phase.');
    if (action.type === 'finish-enemy-phase') finishRound(state, events);
    else {
      if (state.enemyActed.includes(action.enemyId)) throw new Error('This enemy already acted this phase.');
      living(enemy(state, action.enemyId).hp);
      if (action.type === 'enemy-attack') enemyAttack(state, events, action);
      else heal(events, enemy(state, action.enemyId), { kind: 'enemy', enemyId: action.enemyId }, action.amount);
      state.enemyActed.push(action.enemyId);
    }
  }
  sync(state);
  validateRadiantCombat(state);
  return { state, events: structuredClone(events) };
}
