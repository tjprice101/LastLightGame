import {
  radiantFlares, radiantMasters, radiantStarterKits, resolveRadiantStarterStats,
  validateRadiantLoadout, validateRadiantStats,
  type RadiantLoadout, type RadiantStats,
} from '../content/radiant-combat';
import {
  grantRadiantAction, grantRadiantIncomingAttack, grantRadiantRound, personalChargeMaximum,
  spendReadyFlare, validateRadiantGauge, type FlareTier, type RadiantGaugeState,
} from './radiant-gauge';

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
  currency: RadiantCurrencyLedger;
}
export interface RadiantCombatState {
  version: 1;
  bearers: RadiantBearer[];
  enemies: RadiantEnemy[];
  gauge: RadiantGaugeState;
  phase: 'player' | 'enemy' | 'victory' | 'defeat';
  round: number;
  acted: string[];
  enemyActed: string[];
  tideReturns: string[];
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
  | { type: 'status'; targetId: string; status: 'burn' | 'seed' | 'renewal' | 'reduction' | 'weaken-removed';
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
function living(hp: number): void {
  if (hp <= 0) throw new Error('Defeated radiant target cannot act or be selected.');
}
export function effectiveRadiantStats(state: RadiantCombatState, id: string): RadiantStats {
  const member = bearer(state, id);
  const stats = { ...member.stats };
  const leader = state.bearers[0];
  if (leader.hp > 0) {
    const kit = radiantStarterKits[leader.loadout.starter];
    stats[kit.leaderStat] *= 1 + kit.leaderBonus;
  }
  stats.attack *= 1 - Math.max(0, ...member.weaken.map(effect => effect.magnitude));
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
  if (!state || state.version !== 1 || !Array.isArray(state.bearers) || !state.bearers.length ||
      state.bearers.length > 6 || !Array.isArray(state.enemies) || !state.enemies.length ||
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
  }
  let paid = 0, budget = 0;
  for (const member of state.enemies) {
    validateEffects(state, member.burns);
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
    [state.tideReturns, state.bearers.filter(m => m.loadout.starter === 'tizu').map(m => m.loadout.id)]] as const) {
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
export function createRadiantCombat(
  loadouts: RadiantLoadout[], enemies: { id: string; stats: RadiantStats; currencyBudget: number }[], chargeSeed: number,
): RadiantCombatState {
  const state: RadiantCombatState = {
    version: 1,
    bearers: loadouts.map(loadout => {
      const stats = resolveRadiantStarterStats(loadout);
      return { loadout: structuredClone(loadout), stats, hp: rounded(stats.hp), shields: [],
        renewal: [], seeds: [], weaken: [], reductions: [], guarding: false };
    }),
    enemies: enemies.map(input => {
      validateRadiantStats(input.stats);
      const hp = rounded(input.stats.hp);
      return { id: input.id, stats: { ...input.stats }, hp, shields: [], burns: [],
        currency: { budget: input.currencyBudget, baselineHP: hp, lowestHP: hp, paid: 0 } };
    }),
    gauge: { members: loadouts.map(loadout => ({ id: loadout.id, form: loadout.form,
      baseCost: radiantStarterKits[loadout.starter].baseCost, charge: 0, living: true })),
      sharedUnits: 0, eternalCasts: 0 },
    phase: 'player', round: 1, acted: [], enemyActed: [], tideReturns: [],
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
): void {
  finite(snapshot, 'healing snapshot');
  if (target.hp === 0) return;
  const offered = rounded(snapshot), effective = Math.min(offered, rounded(target.stats.hp) - target.hp);
  target.hp += effective;
  events.push({ type: 'heal', source, targetId: 'loadout' in target ? target.loadout.id : target.id,
    snapshot, offered, effective });
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
  const member = state.gauge.members.find(m => m.id === id)!;
  member.charge += Math.min(amount, personalChargeMaximum(member) - member.charge);
  events.push({ type: 'charge', bearerId: id, personal: member.charge, sharedUnits: state.gauge.sharedUnits,
    bonusRolls: 0, bonusOffered: 0 });
}
function normal(state: RadiantCombatState, events: RadiantCombatEvent[], actor: RadiantBearer, targetId: string): number {
  const target = enemy(state, targetId);
  living(target.hp);
  const stats = effectiveRadiantStats(state, actor.loadout.id);
  const source: RadiantSource = { kind: 'normal', bearerId: actor.loadout.id };
  const burning = target.burns.some(effect => 'bearerId' in effect.source && effect.source.bearerId === actor.loadout.id);
  const impact = packet(state, events, target, source, 'direct', radiantDirectDamage(stats.attack, target.stats.defense, 1));
  if (impact.healthLoss > 0 && actor.loadout.starter === 'infernis' && burning && target.hp > 0)
    packet(state, events, target, { kind: 'passive', bearerId: actor.loadout.id },
      'periodic', Math.max(1, rounded(.1 * stats.attack)));
  if (impact.healthLoss > 0 && actor.loadout.starter === 'flora') {
    let selected: RadiantBearer | undefined;
    let largest = 0;
    for (const ally of state.bearers.filter(member => member.hp > 0)) {
      const fraction = (rounded(ally.stats.hp) - ally.hp) / rounded(ally.stats.hp);
      if (fraction > largest) { selected = ally; largest = fraction; }
    }
    if (selected) {
      const passive: RadiantSource = { kind: 'passive', bearerId: actor.loadout.id };
      refresh(selected.seeds, passive, .15 * stats.recovery, 1);
      events.push({ type: 'status', targetId: selected.loadout.id, status: 'seed',
        source: passive, magnitude: .15 * stats.recovery, remaining: 1 });
    }
  }
  return impact.healthLoss + impact.absorbed > 0 ? 1 : 0;
}
function flare(
  state: RadiantCombatState, events: RadiantCombatEvent[], actor: RadiantBearer, targetId: string | undefined,
): { tier: FlareTier; hits: number } {
  const master = actor.loadout.masterId === null ? null : radiantMasters[actor.loadout.masterId];
  const strike = master?.effect === 'tide-strike' || master?.effect === 'sprout-strike';
  if (strike) {
    if (targetId === undefined) throw new Error('This Master Flare requires a selected living enemy.');
    living(enemy(state, targetId).hp);
  } else if (targetId !== undefined) throw new Error('This Flare uses its signature target set, not a selected enemy.');
  const spent = spendReadyFlare(state.gauge, actor.loadout.id);
  state.gauge = spent.state;
  const tier = spent.tier, offer = radiantFlares[actor.loadout.starter][tier];
  const stats = effectiveRadiantStats(state, actor.loadout.id);
  const source: RadiantSource = { kind: 'flare', bearerId: actor.loadout.id };
  const masterSource: RadiantSource = { kind: 'master', bearerId: actor.loadout.id };
  const imbue = .1 * actor.loadout.imbue;
  events.push({ type: 'flare', bearerId: actor.loadout.id, tier, name: offer.name });
  let hits = 0;
  for (const target of state.enemies.filter(member => member.hp > 0)) {
    if (actor.loadout.starter !== 'infernis') break;
    if (tier === 'eternal') {
      const burns = target.burns.filter(effect => 'bearerId' in effect.source && effect.source.bearerId === actor.loadout.id);
      target.burns = target.burns.filter(effect => !burns.includes(effect));
      for (const burn of burns) if (target.hp > 0)
        packet(state, events, target, burn.source, 'periodic', Math.max(1, rounded(burn.magnitude) * burn.remaining));
    }
    if (target.hp === 0) continue;
    const impact = packet(state, events, target, source, 'direct', radiantDirectDamage(stats.attack,
      target.stats.defense, offer.damage, 1 + imbue + (master?.effect === 'flare-damage' ? .15 : 0)));
    if (impact.healthLoss + impact.absorbed > 0) hits++;
    if (target.hp > 0) {
      const magnitude = offer.burn * stats.attack * (1 + imbue);
      const remaining = offer.burnPhases + (master?.effect === 'longer-burn' ? 1 : 0);
      refresh(target.burns, source, magnitude, remaining);
      events.push({ type: 'status', targetId: target.id, status: 'burn', source, magnitude, remaining });
    }
  }
  for (const ally of state.bearers.filter(member => member.hp > 0)) {
    if (actor.loadout.starter === 'tizu') {
      const magnitude = (offer.shieldDefense * stats.defense +
        (offer.shieldHP + (master?.effect === 'deep-shield' ? .08 : 0)) * ally.stats.hp) *
        (1 + imbue + (master?.effect === 'flare-shield' ? .15 : 0));
      shield(state, events, ally, source, magnitude);
      if (offer.reduction > 0) {
        refresh(ally.reductions, source, offer.reduction, offer.reductionPhases);
        events.push({ type: 'status', targetId: ally.loadout.id, status: 'reduction',
          source, magnitude: offer.reduction, remaining: offer.reductionPhases });
      }
    }
    if (actor.loadout.starter === 'flora') {
      heal(events, ally, source, offer.heal * stats.recovery * (1 + imbue + (master?.effect === 'flare-heal' ? .15 : 0)));
      if (tier === 'eternal' && ally.weaken.length) {
        const strongest = ally.weaken.reduce((a, b) => a.magnitude >= b.magnitude ? a : b);
        ally.weaken.splice(ally.weaken.indexOf(strongest), 1);
        events.push({ type: 'status', targetId: ally.loadout.id, status: 'weaken-removed',
          source: strongest.source, magnitude: strongest.magnitude, remaining: strongest.remaining });
      }
      const magnitude = offer.renewal * stats.recovery * (1 + imbue);
      const remaining = offer.renewalRounds + (master?.effect === 'longer-renewal' ? 1 : 0);
      refresh(ally.renewal, source, magnitude, remaining);
      events.push({ type: 'status', targetId: ally.loadout.id, status: 'renewal', source, magnitude, remaining });
    }
  }
  if (master?.effect === 'self-shield') shield(state, events, actor, masterSource, .12 * actor.stats.hp);
  if (strike && targetId !== undefined && state.phase !== 'victory')
    packet(state, events, enemy(state, targetId), masterSource, 'generated',
      radiantDirectDamage(stats.attack, enemy(state, targetId).stats.defense, master.effect === 'tide-strike' ? 1.2 : 1));
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
    const impact = packet(state, events, target, { kind: 'enemy', enemyId: actor.id }, 'direct',
      radiantDirectDamage(actor.stats.attack, stats.defense, action.coefficient,
        Math.max(.2, (target.guarding ? .5 : 1) * (1 - reduction))));
    if (target.hp > 0 && impact.healthLoss + impact.absorbed > 0) {
      state.gauge = grantRadiantIncomingAttack(state.gauge, target.loadout.id);
      events.push({ type: 'charge', bearerId: target.loadout.id,
        personal: state.gauge.members.find(m => m.id === target.loadout.id)!.charge,
        sharedUnits: state.gauge.sharedUnits, bonusRolls: 0, bonusOffered: 0 });
    }
    if (impact.healthLoss === 0 && impact.absorbed > 0 && impact.shields.every(entry =>
      entry.source.kind === 'flare' && 'bearerId' in entry.source &&
      entry.source.bearerId === (impact.shields[0].source as { bearerId: string }).bearerId)) {
      const source = impact.shields[0].source;
      if ('bearerId' in source) {
        const owner = bearer(state, source.bearerId);
        if (owner.hp > 0 && owner.loadout.starter === 'tizu') returns.add(owner.loadout.id);
      }
    }
  }
  for (const id of returns) if (!state.tideReturns.includes(id) && bearer(state, id).hp > 0) {
    state.tideReturns.push(id);
    addPassiveCharge(state, events, id, 8);
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
  if (state.phase === 'victory' || state.phase === 'defeat') return;
  for (const target of state.bearers) {
    target.guarding = false;
    for (const effects of [target.weaken, target.reductions]) effects.forEach(effect => { effect.remaining--; });
    target.weaken = target.weaken.filter(effect => effect.remaining > 0);
    target.reductions = target.reductions.filter(effect => effect.remaining > 0);
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
    else if (action.type === 'defense') actor.guarding = true;
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
