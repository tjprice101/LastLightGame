import {
  radiantFlarePower, radiantLeaderEffects, radiantEquipmentAmount, radiantMasters, radiantRoleSkillPower, radiantSkillAscension,
  radiantStarterKits, radiantSupportSquadHeal, resolveRadiantStarterStats,
  validateRadiantLoadout, validateRadiantStats,
  type RadiantLoadout, type RadiantStats,
} from '../content/combat-kits';
import { radiantFlareTierScale, type RadiantKitEffect, type RadiantSkillDef, type RadiantSkillSlot } from '../content/radiant-kits';
import type { RadiantBearerId } from '../content/combat-kits';
import {
  addRadiantPersonalCharge, grantRadiantAction, grantRadiantDrop, grantRadiantIncomingAttack, grantRadiantRound,
  radiantHitDrop, spendReadyFlare, spendSkill, validateRadiantGauge, type FlareTier, type RadiantGaugeState,
} from './combat-gauge';
import { squadMemberLimit } from '../content/squad-rules';
import { type ConduitId } from '../content/conduits';
import { radiantConduitPrimitives, type RadiantConduitEffect, type RadiantConduitDesign } from '../content/conduit-effects';
import type { ElementId } from '../content/activities';
import { elementDamageMultiplier, isCombatElement } from '../content/element-matchups';

export type RadiantSource =
  | { kind: 'normal' | 'skill' | 'flare' | 'passive' | 'role'; bearerId: string }
  | { kind: 'master'; bearerId: string }
  | { kind: 'leader'; bearerId: string }
  | { kind: 'gear'; bearerId: string; conduitId: ConduitId }
  | { kind: 'enemy'; enemyId: string };
export interface RadiantShield { id: number; source: RadiantSource; remaining: number }
/** D-473 N6 categories. Bearers hold ally categories; enemies hold enemy categories. */
export type RadiantAllyCategory = 'attack-up' | 'defense-up' | 'reduction' | 'gain-up' | 'hot' | 'weaken';
export type RadiantEnemyCategory = 'weaken' | 'expose' | 'burn';
export type RadiantCategory = RadiantAllyCategory | RadiantEnemyCategory;
/** At most one entry per category: the strongest magnitude applies, the longer duration is kept. */
export interface RadiantCategoryEffect<Category extends RadiantCategory = RadiantCategory> {
  category: Category;
  source: RadiantSource;
  /** Fraction for every category except Burn (absolute damage per tick) and HoT (fraction of max Health). */
  magnitude: number;
  remaining: number;
}
/** N6 caps. Burn has no cap; HoT is a fraction of max Health per turn. */
export const radiantCategoryCaps: Record<RadiantCategory, number> = {
  'attack-up': 1, 'defense-up': 1, reduction: .75, 'gain-up': 1, hot: .3, weaken: .5, expose: .8, burn: Infinity,
};
/** N4: timed skill effects last at most this many turns, including Skill Duration. */
export const radiantMaximumDuration = 6;
/** N5: each enemy defeat heals the defeating bearer this fraction of max Health. */
export const radiantHealthMote = .1;
const allyCategories: readonly RadiantAllyCategory[] = ['attack-up', 'defense-up', 'reduction', 'gain-up', 'hot', 'weaken'];
const enemyCategories: readonly RadiantEnemyCategory[] = ['weaken', 'expose', 'burn'];
/** Flora's Seed on its holder: heals `value` x the holder's max Health at the start of the next player turn. */
export interface RadiantSeed { casterId: string; value: number }
/** Bruno's Cover on its holder: the caster takes `share` of the holder's direct enemy damage. */
export interface RadiantCover { casterId: string; share: number; remaining: number }
/** A bearer's own signature counters (Step 2b). Coefficients already include the creating skill's Skill Power. */
export type RadiantOwnSignature =
  | { kind: 'cyclone'; gusts: number; cyclone: { coefficient: number; perGust: number; remaining: number } | null }
  | { kind: 'shuriken'; held: number; lodged: string[] }
  | { kind: 'wounds'; wounds: number };
export interface RadiantBearer {
  loadout: RadiantLoadout;
  stats: RadiantStats;
  hp: number;
  shields: RadiantShield[];
  buffs: RadiantCategoryEffect<RadiantAllyCategory>[];
  seed: RadiantSeed | null;
  cover: RadiantCover | null;
  signature: RadiantOwnSignature | null;
}
export interface RadiantCurrencyLedger {
  budget: number;
  baselineHP: number;
  lowestHP: number;
  paid: number;
}
export interface RadiantEnemy {
  id: string;
  elementId: ElementId | null;
  stats: RadiantStats;
  hp: number;
  shields: RadiantShield[];
  debuffs: RadiantCategoryEffect<RadiantEnemyCategory>[];
  currency: RadiantCurrencyLedger;
}
export interface RadiantCombatState {
  version: 8;
  bearers: RadiantBearer[];
  enemies: RadiantEnemy[];
  gauge: RadiantGaugeState;
  phase: 'player' | 'enemy' | 'victory' | 'defeat';
  round: number;
  acted: string[];
  /** Bearers who used Skill 1 or 2 this turn (D-473 O1 interim for Defend-triggered effects). */
  skilled: string[];
  enemyActed: string[];
  gearTriggered: string[];
  chargeSeed: number;
  nextShieldId: number;
  currencyEarned: number;
}
export type RadiantTimedStatus = RadiantCategory | 'weaken-removed';
export type RadiantSignatureOp = 'seed' | 'seed-wither' | 'cover' | 'cyclone' | 'gust' | 'cyclone-release' |
  'lodge' | 'recall' | 'return' | 'wounds' | 'detonate' | 'refund';
export type RadiantCombatAction =
  | { type: 'normal'; bearerId: string; targetId: string }
  | { type: 'skill'; bearerId: string; slot: RadiantSkillSlot; targetId?: string }
  | { type: 'flare'; bearerId: string; targetId?: string }
  | { type: 'end-turn' }
  | { type: 'enemy-attack'; enemyId: string; targetIds: string[]; coefficient: number;
      hits?: number; healBefore?: number; refreshShieldBefore?: number }
  | { type: 'enemy-heal'; enemyId: string; amount: number }
  | { type: 'finish-enemy-phase' };
export type RadiantCombatEvent =
  | { type: 'damage'; source: RadiantSource; targetId: string; origin: 'direct' | 'periodic' | 'generated';
      offered: number; absorbed: number; healthLoss: number; shields: { source: RadiantSource; amount: number }[];
      /** Present when Cover moved this share of an enemy hit onto its caster. */
      redirected?: true }
  | { type: 'heal'; source: RadiantSource; targetId: string; snapshot: number; offered: number; effective: number }
  | { type: 'shield'; source: RadiantSource; targetId: string; amount: number; shieldId: number }
  | { type: 'currency'; enemyId: string; amount: number; totalPaid: number }
  | { type: 'defeated'; targetId: string }
  | { type: 'health-mote'; enemyId: string; bearerId: string; offered: number; effective: number }
  | { type: 'gauge-drop'; enemyId: string; bearerId: string; trigger: 'hit' | 'defeat'; amount: number }
  | { type: 'skill'; bearerId: string; slot: RadiantSkillSlot; name: string; cost: number }
  | { type: 'flare'; bearerId: string; tier: FlareTier; name: string }
  | { type: 'charge'; bearerId: string; personal: number; bonusRolls: number; bonusOffered: number;
      gearSource?: Extract<RadiantSource, { kind: 'gear' | 'master' | 'leader' }> }
  | { type: 'round'; round: number }
  /** Signature bookkeeping for presentation: `amount` is the new count or value after the change. */
  | { type: 'signature'; bearerId: string; op: RadiantSignatureOp; holderId?: string; amount: number }
  | { type: 'status'; targetId: string;
      status: RadiantTimedStatus; source: RadiantSource; magnitude: number; remaining: number; clockOnly?: true };

export function validateRadiantDropEvents(
  events: readonly RadiantCombatEvent[], enemyIds: ReadonlySet<string>, bearerIds: ReadonlySet<string>,
): void {
  for (const [index, event] of events.entries()) {
    if (event.type !== 'gauge-drop') continue;
    if (!enemyIds.has(event.enemyId)) throw new Error('Saved Gauge-drop source is not an enemy.');
    if (!bearerIds.has(event.bearerId)) throw new Error('Saved Gauge-drop owner is not a squad member.');
    if (event.trigger !== 'hit') throw new Error('Invalid saved Luminosity-drop trigger.');
    let position = index - 1;
    const currency = events[position];
    if (currency?.type === 'currency') {
      if (currency.enemyId !== event.enemyId) throw new Error('Saved Gauge-drop currency source does not match.');
      position--;
    }
    const damage = events[position];
    if (damage?.type !== 'damage' || damage.targetId !== event.enemyId || damage.source.kind === 'enemy' ||
      damage.source.bearerId !== event.bearerId)
      throw new Error('Saved Gauge-drop source does not match its damage.');
    if (damage.origin !== 'direct' || damage.source.kind !== 'normal' ||
      damage.healthLoss + damage.absorbed <= 0) throw new Error('Saved Luminosity drop requires a damaging Normal hit.');
    // Gauge Gain scales the N1 Normal drop, so any positive whole amount is a valid record.
    if (!Number.isSafeInteger(event.amount) || event.amount < 1) throw new Error('Invalid saved Luminosity-drop amount.');
  }
}

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
function category<C extends RadiantCategory>(effects: readonly RadiantCategoryEffect<C>[], kind: C): number {
  return effects.find(effect => effect.category === kind)?.magnitude ?? 0;
}
function exposure(target: RadiantEnemy): number {
  return category(target.debuffs, 'expose');
}
function living(hp: number): void {
  if (hp <= 0) throw new Error('Defeated radiant target cannot act or be selected.');
}
export function effectiveRadiantStats(state: RadiantCombatState, id: string): RadiantStats {
  const member = bearer(state, id);
  const stats = { ...member.stats };
  for (const key of ['hp', 'attack', 'defense', 'recovery'] as const)
    stats[key] *= 1 + leaderEffects(state, member).filter(entry => entry.kind === key)
      .reduce((sum, entry) => sum + entry.amount, 0);
  stats.attack *= 1 - category(member.buffs, 'weaken') * (1 - Math.min(.8, combatAmount(state, member, 'resilience')));
  stats.attack *= 1 + category(member.buffs, 'attack-up');
  stats.defense *= 1 + category(member.buffs, 'defense-up');
  validateRadiantStats(stats);
  return stats;
}
export interface RadiantSkillStats {
  /** N4: scales skill and Flare damage, Burn, heals, Shields and buff/debuff strength. */
  skillPower: number;
  /** N4: whole turns added to timed skill effects. */
  skillDuration: number;
  /** N2: cost discount (capped at 50% by the gauge). */
  skillEfficiency: number;
  /** N1: multiplies every Luminosity gain. */
  gaugeGain: number;
}
/** Skill stats for one bearer's Skill 1, Skill 2 or Flare (D-473 N4, O3, O5). */
export function radiantSkillStats(state: RadiantCombatState, id: string, slot: RadiantSkillSlot | 'flare'): RadiantSkillStats {
  const member = bearer(state, id);
  const ascended = slot === 1 ? member.loadout.ascension.skill1 === true : slot === 2 && member.loadout.ascension.skill2 === true;
  return {
    skillPower: 1 + radiantRoleSkillPower[radiantStarterKits[member.loadout.starter].role] +
      (ascended ? radiantSkillAscension.skillPower : 0),
    skillDuration: 0,
    skillEfficiency: ascended ? radiantSkillAscension.efficiency : 0,
    gaugeGain: gaugeGain(member),
  };
}
function gaugeGain(member: RadiantBearer): number {
  return 1 + category(member.buffs, 'gain-up');
}
function leaderEffects(state: RadiantCombatState, recipient: RadiantBearer): RadiantConduitDesign {
  const leader = state.bearers[0];
  return leader.hp > 0 && radiantStarterKits[leader.loadout.starter].elementId ===
    radiantStarterKits[recipient.loadout.starter].elementId ? radiantLeaderEffects(leader.loadout) : [];
}
function combatAmount(state: RadiantCombatState, actor: RadiantBearer, kind: RadiantConduitEffect): number {
  return radiantEquipmentAmount(actor.loadout, kind) +
    leaderEffects(state, actor).filter(entry => entry.kind === kind).reduce((sum, entry) => sum + entry.amount, 0);
}
/** Conditional damage Conduits and Leaders; D-473 O2 applies them to skills as well as Normals and Flares. */
function outgoingDamageMultiplier(state: RadiantCombatState, actor: RadiantBearer, target: RadiantEnemy, periodic = false): number {
  const element = radiantStarterKits[actor.loadout.starter].elementId;
  if (periodic) return (1 + combatAmount(state, actor, 'burn-power')) * elementDamageMultiplier(element, target.elementId);
  const conditions: readonly [RadiantConduitEffect, boolean][] = [
    ['opening', target.hp === Math.round(target.stats.hp)], ['execution', target.hp <= target.stats.hp * .25],
    ['burning', target.debuffs.some(effect => effect.category === 'burn')], ['exposed', exposure(target) > 0],
    ['weakened', target.debuffs.some(effect => effect.category === 'weaken')],
    ['shielded', actor.shields.length > 0], ['wounded', actor.hp <= actor.stats.hp / 2],
    ['solo', state.enemies.filter(member => member.hp > 0).length === 1], ['first-action', state.acted.length === 0],
  ];
  const bonus = conditions.reduce((sum, [kind, active]) => sum + (active ? combatAmount(state, actor, kind) : 0), 0);
  return (1 + bonus) * elementDamageMultiplier(element, target.elementId);
}
const bearerSourceKinds = ['normal', 'skill', 'flare', 'passive', 'role', 'master', 'leader', 'gear'];
function validateSource(state: RadiantCombatState, source: RadiantSource): void {
  if (!source || !(bearerSourceKinds.includes(source.kind) || source.kind === 'enemy'))
    throw new Error('Invalid radiant effect source.');
  if (source.kind === 'enemy') enemy(state, source.enemyId);
  else {
    const owner = bearer(state, source.bearerId);
    if (source.kind === 'gear' && !owner.loadout.gear?.some(slot => slot?.id === source.conduitId))
      throw new Error('Radiant gear source is not equipped by its owner.');
  }
}
function validateCategories(
  state: RadiantCombatState, effects: RadiantCategoryEffect[], allowed: readonly RadiantCategory[],
): void {
  if (!Array.isArray(effects)) throw new Error('Invalid radiant category ledger.');
  const seen = new Set<RadiantCategory>();
  for (const effect of effects) {
    if (!effect || typeof effect !== 'object' || Object.keys(effect).length !== 4 ||
      !allowed.includes(effect.category) || seen.has(effect.category))
      throw new Error('Invalid radiant category effect.');
    seen.add(effect.category);
    validateSource(state, effect.source);
    finite(effect.magnitude, 'effect magnitude');
    if (effect.magnitude > radiantCategoryCaps[effect.category]) throw new Error('Radiant category exceeds its cap.');
    safe(effect.remaining, 'effect clock', 1);
    if (effect.remaining > radiantMaximumDuration) throw new Error('Radiant effect exceeds its maximum duration.');
  }
}
/** Bearers whose signature clauses, `when` conditions, `alt` powers and Passive rules run (Step 2b batches). */
export const radiantSignatureBearers: ReadonlySet<RadiantBearerId> = new Set<RadiantBearerId>([
  'ember', 'tide', 'sprout', 'atmoso', 'aurora', 'bliss', 'bruno', 'disciple', 'elise', 'razor',
]);
/** Elise's Shuriken count (Stormwheel Rhythm). */
export const radiantShurikenCount = 2;
/** Atmoso's Cyclone holds at most this many Gusts (Gale Cadence). */
export const radiantGustCap = 5;
/** Passive values for batch 1 (D-473). */
export const radiantPassiveValues = {
  emberBurn: .3, tideRefund: 8, brunoRedirect: .25, discipleFill: 5, auroraWeakenTurns: 1,
} as const;
function startingSignature(starter: RadiantBearerId): RadiantOwnSignature | null {
  if (!radiantSignatureBearers.has(starter)) return null;
  if (starter === 'atmoso') return { kind: 'cyclone', gusts: 0, cyclone: null };
  if (starter === 'elise') return { kind: 'shuriken', held: radiantShurikenCount, lodged: [] };
  if (starter === 'razor') return { kind: 'wounds', wounds: 0 };
  return null;
}
function validateSignatures(state: RadiantCombatState, member: RadiantBearer): void {
  if (!('seed' in member) || !('cover' in member) || !('signature' in member)) throw new Error('Invalid radiant signature state.');
  const casterOf = (id: string, starter: RadiantBearerId): RadiantBearer => {
    const caster = bearer(state, id);
    if (caster.loadout.starter !== starter || caster === member) throw new Error('Invalid radiant signature caster.');
    return caster;
  };
  if (member.seed !== null) {
    if (!member.seed || Object.keys(member.seed).length !== 2) throw new Error('Invalid radiant Seed.');
    const caster = bearer(state, member.seed.casterId);
    if (caster.loadout.starter !== 'sprout') throw new Error('Invalid radiant signature caster.');
    finite(member.seed.value, 'Seed value', Number.MIN_VALUE);
  }
  if (member.cover !== null) {
    if (!member.cover || Object.keys(member.cover).length !== 3) throw new Error('Invalid radiant Cover.');
    casterOf(member.cover.casterId, 'bruno');
    finite(member.cover.share, 'Cover share', Number.MIN_VALUE);
    if (member.cover.share >= 1) throw new Error('Invalid radiant Cover share.');
    safe(member.cover.remaining, 'Cover clock', 1);
    if (member.cover.remaining > radiantMaximumDuration) throw new Error('Radiant effect exceeds its maximum duration.');
  }
  const own = member.signature, expected = startingSignature(member.loadout.starter);
  if ((own === null) !== (expected === null) || (own && own.kind !== expected?.kind)) throw new Error('Invalid radiant signature state.');
  if (own?.kind === 'cyclone') {
    safe(own.gusts, 'Gusts');
    if (own.gusts > radiantGustCap || Object.keys(own).length !== 3) throw new Error('Invalid radiant Cyclone.');
    if (own.cyclone !== null) {
      if (!own.cyclone || Object.keys(own.cyclone).length !== 3) throw new Error('Invalid radiant Cyclone.');
      finite(own.cyclone.coefficient, 'Cyclone coefficient', Number.MIN_VALUE);
      finite(own.cyclone.perGust, 'Cyclone Gust coefficient');
      safe(own.cyclone.remaining, 'Cyclone clock', 1);
      if (own.cyclone.remaining > radiantMaximumDuration) throw new Error('Radiant effect exceeds its maximum duration.');
    } else if (own.gusts !== 0) throw new Error('Radiant Gusts require a Cyclone.');
  } else if (own?.kind === 'shuriken') {
    safe(own.held, 'held Shuriken');
    if (Object.keys(own).length !== 3 || !Array.isArray(own.lodged) || own.held + own.lodged.length !== radiantShurikenCount ||
      own.lodged.some(id => enemy(state, id).hp === 0)) throw new Error('Invalid radiant Shuriken.');
  } else if (own?.kind === 'wounds') {
    safe(own.wounds, 'Wounds');
    if (Object.keys(own).length !== 2) throw new Error('Invalid radiant Wounds.');
  }
}
export function validateRadiantCombat(state: RadiantCombatState): void {
  if (!state || state.version !== 8 || !Array.isArray(state.bearers) || !state.bearers.length ||
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
        gauge.convergenceRank !== member.loadout.convergenceRank ||
        gauge.baseCost !== radiantStarterKits[member.loadout.starter].baseCost || gauge.living !== (member.hp > 0) ||
        gauge.elementId !== radiantStarterKits[member.loadout.starter].elementId)
      throw new Error('Radiant Gauge member mismatch.');
    validateCategories(state, member.buffs, allyCategories);
    validateSignatures(state, member);
  }
  let paid = 0, budget = 0;
  for (const member of state.enemies) {
    if (member.elementId !== null && !isCombatElement(member.elementId)) throw new Error('Invalid enemy combat element.');
    validateCategories(state, member.debuffs, enemyCategories);
    validateRadiantCurrencyLedger(member.currency);
    if (member.currency.baselineHP !== Math.round(member.stats.hp) || member.currency.lowestHP > member.hp)
      throw new Error('Radiant currency baseline mismatch.');
    paid += member.currency.paid;
    safe(paid, 'total paid');
    budget += member.currency.budget;
    safe(budget, 'total currency budget');
  }
  if (paid !== state.currencyEarned) throw new Error('Radiant paid currency total mismatch.');
  const gearKeys = state.bearers.flatMap(member => (member.loadout.gear ?? [])
    .flatMap(slot => slot === null ? [] : [`${member.loadout.id}:${slot.id}`])
    .concat(member.loadout.masterId ? [`${member.loadout.id}:${member.loadout.masterId}`] : [], [`${member.loadout.id}:leader`]));
  if (!Array.isArray(state.gearTriggered) || new Set(state.gearTriggered).size !== state.gearTriggered.length ||
      state.gearTriggered.some(key => !gearKeys.includes(key)))
    throw new Error('Invalid radiant gear trigger ledger.');
  for (const [list, valid] of [[state.acted, state.bearers.map(m => m.loadout.id)],
    [state.enemyActed, state.enemies.map(m => m.id)],
    [state.skilled, state.acted]] as const) {
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
    throw new Error('Radiant party must contain one to three acquired Element-Bearers.');
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
  loadouts: RadiantLoadout[], enemies: { id: string; elementId: ElementId | null; stats: RadiantStats; currencyBudget: number }[], chargeSeed: number,
): RadiantCombatState {
  const state: RadiantCombatState = {
    version: 8,
    bearers: loadouts.map(loadout => {
      const stats = resolveRadiantStarterStats(loadout);
      return { loadout: structuredClone(loadout), stats, hp: rounded(stats.hp), shields: [], buffs: [],
        seed: null, cover: null, signature: startingSignature(loadout.starter) };
    }),
    enemies: enemies.map(input => {
      validateRadiantStats(input.stats);
      const hp = rounded(input.stats.hp);
      return { id: input.id, elementId: input.elementId, stats: { ...input.stats }, hp, shields: [], debuffs: [],
        currency: { budget: input.currencyBudget, baselineHP: hp, lowestHP: hp, paid: 0 } };
    }),
    gauge: { members: loadouts.map(loadout => ({ id: loadout.id, form: loadout.form,
      convergenceRank: loadout.convergenceRank,
      elementId: radiantStarterKits[loadout.starter].elementId,
      baseCost: radiantStarterKits[loadout.starter].baseCost, charge: 0, living: true })) },
    phase: 'player', round: 1, acted: [], skilled: [], enemyActed: [], gearTriggered: [],
    chargeSeed, nextShieldId: 1, currencyEarned: 0,
  };
  for (const member of state.gauge.members) {
    addRadiantPersonalCharge(member, rounded(combatAmount(state, bearer(state, member.id), 'start-charge')));
  }
  validateRadiantCombat(state);
  return state;
}
function sync(state: RadiantCombatState): void {
  state.gauge.members.forEach((member, index) => { member.living = state.bearers[index].hp > 0; });
  if (state.enemies.every(member => member.hp === 0)) state.phase = 'victory';
  else if (state.bearers.every(member => member.hp === 0)) state.phase = 'defeat';
}
interface RadiantHitCharge {
  bonusRolls: number;
  bonusOffered: number;
}
function gaugeDrop(
  state: RadiantCombatState, events: RadiantCombatEvent[], enemyId: string, bearerId: string,
  trigger: 'hit' | 'defeat', amount: number,
): void {
  state.gauge = grantRadiantDrop(state.gauge, bearerId, amount);
  events.push({ type: 'gauge-drop', enemyId, bearerId, trigger, amount });
}
/** N5: a defeated enemy drops one Health mote for the bearer whose damage defeated it (a Burn's caster for Burn). */
function healthMote(state: RadiantCombatState, events: RadiantCombatEvent[], target: RadiantEnemy, source: RadiantSource): void {
  if (source.kind === 'enemy') return;
  const owner = bearer(state, source.bearerId);
  if (owner.hp === 0) return;
  const offered = rounded(radiantHealthMote * owner.stats.hp);
  const effective = Math.min(offered, rounded(owner.stats.hp) - owner.hp);
  owner.hp += effective;
  events.push({ type: 'health-mote', enemyId: target.id, bearerId: owner.loadout.id, offered, effective });
}
function packet(
  state: RadiantCombatState, events: RadiantCombatEvent[], target: RadiantBearer | RadiantEnemy,
  source: RadiantSource, origin: 'direct' | 'periodic' | 'generated', offered: number, hitCharge?: RadiantHitCharge,
  redirected = false,
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
  events.push({ type: 'damage', source, targetId, origin, offered, absorbed, healthLoss, shields,
    ...(redirected ? { redirected: true as const } : {}) });
  if ('currency' in target) {
    const payout = depleteRadiantCurrency(target.currency, target.hp);
    target.currency = payout.ledger;
    state.currencyEarned += payout.amount;
    safe(state.currencyEarned, 'earned currency');
    if (payout.amount > 0) events.push({ type: 'currency', enemyId: target.id,
      amount: payout.amount, totalPaid: target.currency.paid });
    if (origin === 'direct' && source.kind === 'normal' && healthLoss + absorbed > 0) {
      if (!hitCharge) throw new Error('Radiant direct hit is missing its charge context.');
      const drop = radiantHitDrop(source.kind, hitCharge.bonusRolls, () => rollCharge(state),
        gaugeGain(bearer(state, source.bearerId)));
      hitCharge.bonusRolls += drop.bonusRolls;
      hitCharge.bonusOffered += drop.bonusOffered;
      gaugeDrop(state, events, target.id, source.bearerId, 'hit', drop.amount);
    }
  }
  if (target.hp === 0) {
    events.push({ type: 'defeated', targetId });
    if ('currency' in target) { healthMote(state, events, target, source); returnShuriken(state, events, targetId); }
  }
  sync(state);
  return { healthLoss, absorbed, shields };
}
/** Sources whose heals and Shields take the Conduit `healing`/`shielding` bonuses. */
function native(source: RadiantSource): source is Extract<RadiantSource, { kind: 'normal' | 'skill' | 'flare' | 'passive' | 'role' }> {
  return source.kind === 'normal' || source.kind === 'skill' || source.kind === 'flare' || source.kind === 'passive';
}
function heal(
  state: RadiantCombatState, events: RadiantCombatEvent[], target: RadiantBearer | RadiantEnemy,
  source: RadiantSource, snapshot: number,
): number {
  if (native(source)) snapshot *= 1 + combatAmount(state, bearer(state, source.bearerId), 'healing');
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
  const amount = rounded(magnitude * (native(source) ? 1 + combatAmount(state, bearer(state, source.bearerId), 'shielding') : 1));
  if (amount === 0 || target.hp === 0) return;
  const shieldId = state.nextShieldId++;
  safe(state.nextShieldId, 'shield serial', 1);
  target.shields.push({ id: shieldId, source, remaining: amount });
  events.push({ type: 'shield', source, targetId: target.loadout.id, amount, shieldId });
}
/** N6: same category does not stack. The strongest applies (keeping its source); the longer duration is kept. */
function applyCategory<C extends RadiantCategory>(
  events: RadiantCombatEvent[], targetId: string, effects: RadiantCategoryEffect<C>[],
  kind: C, source: RadiantSource, magnitude: number, turns: number,
): void {
  finite(magnitude, 'category magnitude');
  safe(turns, 'category duration');
  const capped = Math.min(radiantCategoryCaps[kind], magnitude), remaining = Math.min(radiantMaximumDuration, turns);
  if (capped <= 0 || remaining < 1) return;
  let entry = effects.find(effect => effect.category === kind);
  if (!entry) effects.push(entry = { category: kind, source: structuredClone(source), magnitude: capped, remaining });
  else {
    if (capped > entry.magnitude) { entry.magnitude = capped; entry.source = structuredClone(source); }
    entry.remaining = Math.max(entry.remaining, remaining);
  }
  events.push({ type: 'status', targetId, status: kind, source: structuredClone(entry.source),
    magnitude: entry.magnitude, remaining: entry.remaining });
}
function rollCharge(state: RadiantCombatState): number {
  state.chargeSeed = (Math.imul(state.chargeSeed, 1664525) + 1013904223) >>> 0;
  return state.chargeSeed / 0x100000000;
}
function addPassiveCharge(state: RadiantCombatState, events: RadiantCombatEvent[], id: string, amount: number): void {
  safe(amount, 'passive charge');
  const member = state.gauge.members.find(m => m.id === id)!;
  addRadiantPersonalCharge(member, amount);
  events.push({ type: 'charge', bearerId: id, personal: member.charge,
    bonusRolls: 0, bonusOffered: 0 });
}
/** The living ally with the lowest Health fraction (first in squad order on ties). */
function woundedAlly(state: RadiantCombatState, exclude?: string): RadiantBearer | undefined {
  let selected: RadiantBearer | undefined, largest = 0;
  for (const ally of state.bearers.filter(member => member.hp > 0 && member.loadout.id !== exclude)) {
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
function cleanse(events: RadiantCombatEvent[], target: RadiantBearer): void {
  const weaken = target.buffs.find(effect => effect.category === 'weaken');
  if (!weaken) return;
  target.buffs.splice(target.buffs.indexOf(weaken), 1);
  events.push({ type: 'status', targetId: target.loadout.id, status: 'weaken-removed',
    source: weaken.source, magnitude: weaken.magnitude, remaining: 0 });
}
// ---------------------------------------------------------------------------------------------
// Step 2b signature mechanics (batch 1: Opening and Flagships). A Passive works only while its
// bearer lives unless its text says otherwise.
// ---------------------------------------------------------------------------------------------
function signed(member: RadiantBearer): boolean {
  return radiantSignatureBearers.has(member.loadout.starter);
}
function livingStarter(state: RadiantCombatState, starter: RadiantBearerId): RadiantBearer | undefined {
  return state.bearers.find(member => member.loadout.starter === starter && member.hp > 0 && signed(member));
}
/** Bliss's Tempo and Elise's Shuriken conditions; unknown conditions (later batches) never hold. */
function condition(state: RadiantCombatState, actor: RadiantBearer, when: string): boolean {
  const others = state.bearers.filter(member => member !== actor && member.hp > 0);
  const opening = !others.some(member => state.acted.includes(member.loadout.id));
  switch (when) {
    case 'opening': return opening;
    // When alone every action is Opening, so Closing needs another living ally, all of whom have acted.
    case 'closing': return others.length > 0 && others.every(member => state.acted.includes(member.loadout.id));
    case 'no-shuriken-held': return actor.signature?.kind === 'shuriken' && actor.signature.held === 0;
    default: return false;
  }
}
/** Stillwater Guard: a hit fully blocked by a Shield from Tizu's skill or Flare refunds 8 Luminosity to its holder. */
function refundFullBlock(
  state: RadiantCombatState, events: RadiantCombatEvent[], holder: RadiantBearer,
  part: { healthLoss: number; absorbed: number; shields: { source: RadiantSource; amount: number }[] }, offered: number,
): void {
  if (holder.hp === 0 || part.healthLoss > 0 || part.absorbed !== offered) return;
  const tizu = part.shields.map(entry => entry.source).find(entry =>
    (entry.kind === 'skill' || entry.kind === 'flare') && bearer(state, entry.bearerId).loadout.starter === 'tide');
  if (!tizu || tizu.kind === 'enemy') return;
  const caster = bearer(state, tizu.bearerId);
  if (caster.hp === 0 || !signed(caster)) return;
  const amount = rounded(radiantPassiveValues.tideRefund * gaugeGain(holder));
  addPassiveCharge(state, events, holder.loadout.id, amount);
  events.push({ type: 'signature', bearerId: caster.loadout.id, op: 'refund', holderId: holder.loadout.id, amount });
}
/** Stormwheel Rhythm: Shuriken lodged in a defeated enemy return to Elise without damage. */
function returnShuriken(state: RadiantCombatState, events: RadiantCombatEvent[], enemyId: string): void {
  for (const member of state.bearers) {
    const own = member.signature;
    if (own?.kind !== 'shuriken' || !own.lodged.includes(enemyId)) continue;
    const count = own.lodged.filter(id => id === enemyId).length;
    own.lodged = own.lodged.filter(id => id !== enemyId);
    own.held += count;
    events.push({ type: 'signature', bearerId: member.loadout.id, op: 'return', holderId: enemyId, amount: own.held });
  }
}
/** Ally-applied enemy debuffs: Aurora's Lens of Diminishment adds 1 turn to Weaken while she lives. */
function debuff(
  state: RadiantCombatState, events: RadiantCombatEvent[], target: RadiantEnemy, kind: RadiantEnemyCategory,
  source: RadiantSource, magnitude: number, turns: number,
): void {
  const longer = kind === 'weaken' && source.kind !== 'enemy' && livingStarter(state, 'aurora')
    ? radiantPassiveValues.auroraWeakenTurns : 0;
  applyCategory(events, target.id, target.debuffs, kind, source, magnitude, turns + longer);
}
/** One mitigated signature strike on an enemy (Cyclone, Shuriken recall). */
function strike(
  state: RadiantCombatState, events: RadiantCombatEvent[], actor: RadiantBearer, target: RadiantEnemy,
  source: RadiantSource, coefficient: number,
): void {
  if (target.hp === 0 || coefficient <= 0) return;
  const stats = effectiveRadiantStats(state, actor.loadout.id);
  packet(state, events, target, source, 'direct', radiantDirectDamage(stats.attack, gearDefense(state, actor, target.stats.defense),
    coefficient, (1 + exposure(target)) * outgoingDamageMultiplier(state, actor, target)));
}
/** Gale Cadence: release Atmoso's Cyclone on all enemies (`multiplier` x its stored coefficient), then clear it. */
function releaseCyclone(
  state: RadiantCombatState, events: RadiantCombatEvent[], actor: RadiantBearer, multiplier: number, source: RadiantSource,
): void {
  const own = actor.signature;
  if (own?.kind !== 'cyclone' || own.cyclone === null) return;
  const coefficient = (own.cyclone.coefficient + own.cyclone.perGust * own.gusts) * multiplier;
  own.cyclone = null;
  own.gusts = 0;
  events.push({ type: 'signature', bearerId: actor.loadout.id, op: 'cyclone-release', amount: 0 });
  if (actor.hp === 0) return;
  for (const target of state.enemies.filter(member => member.hp > 0)) strike(state, events, actor, target, source, coefficient);
}
/** Signature clauses of one skill or Flare, resolved right after its damage (Step 2b batch 1). */
function signatureClauses(
  state: RadiantCombatState, events: RadiantCombatEvent[], actor: RadiantBearer, input: RadiantCast,
  clauses: readonly Extract<RadiantKitEffect, { kind: 'signature' }>[], primary: RadiantEnemy | undefined,
  enemyTargets: readonly RadiantEnemy[], hitCharge: RadiantHitCharge,
): void {
  const id = actor.loadout.id, source: RadiantSource = { kind: input.kind, bearerId: id }, own = actor.signature;
  const lowest = woundedAlly(state);
  const allies = (to: string | undefined): RadiantBearer[] => (to === 'lowest' ? (lowest ? [lowest] : []) :
    to === 'other-allies' ? state.bearers.filter(member => member !== actor) : to === 'self' ? [actor] : state.bearers)
    .filter(member => member.hp > 0);
  for (const clause of clauses) {
    const value = clause.value ?? 0;
    switch (clause.op) {
      case 'detonate':
        // Flame Arc: each target's Burn from Infernis deals up to `value` remaining turns at once and loses them.
        for (const target of enemyTargets) {
          const burn = target.debuffs.find(effect => effect.category === 'burn');
          if (target.hp === 0 || !burn || burn.source.kind === 'enemy' || burn.source.bearerId !== id) continue;
          const turns = Math.min(value, burn.remaining), amount = Math.max(1, rounded(burn.magnitude * turns));
          const burnSource = structuredClone(burn.source);
          burn.remaining -= turns;
          if (burn.remaining === 0) target.debuffs.splice(target.debuffs.indexOf(burn), 1);
          events.push({ type: 'status', targetId: target.id, status: 'burn', source: structuredClone(burnSource),
            magnitude: burn.magnitude, remaining: burn.remaining });
          events.push({ type: 'signature', bearerId: id, op: 'detonate', holderId: target.id, amount: turns });
          packet(state, events, target, burnSource, 'periodic', amount);
        }
        break;
      case 'seed':
        // Root of Hope: one Seed per ally; a stronger Seed replaces a weaker one.
        for (const ally of allies(clause.to)) {
          const strength = value * input.effectScale * input.skill.skillPower;
          if (ally.seed && ally.seed.value >= strength) continue;
          ally.seed = { casterId: id, value: strength };
          events.push({ type: 'signature', bearerId: id, op: 'seed', holderId: ally.loadout.id, amount: strength });
        }
        break;
      case 'cover':
        // Citadel Mantle / Worldwall Ascendant: one Cover per ally; the larger share and the longer clock are kept.
        for (const ally of allies(clause.to)) {
          if (ally === actor) continue;
          const remaining = Math.min(radiantMaximumDuration, (clause.turns ?? 1) + input.skill.skillDuration);
          const previous = ally.cover?.casterId === id ? ally.cover : null;
          ally.cover = { casterId: id, share: Math.max(value, previous?.share ?? 0),
            remaining: Math.max(remaining, previous?.remaining ?? 0) };
          events.push({ type: 'signature', bearerId: id, op: 'cover', holderId: ally.loadout.id, amount: ally.cover.share });
        }
        break;
      case 'cyclone':
        // Cyclone Weave: a new Cyclone releases the old one first.
        if (own?.kind !== 'cyclone') break;
        releaseCyclone(state, events, actor, 1, source);
        own.cyclone = { coefficient: value * input.damageScale * input.skill.skillPower,
          perGust: (clause.perStack ?? 0) * input.damageScale * input.skill.skillPower,
          remaining: Math.min(radiantMaximumDuration, (clause.turns ?? 1) + input.skill.skillDuration) };
        events.push({ type: 'signature', bearerId: id, op: 'cyclone', amount: own.cyclone.remaining });
        break;
      case 'cyclone-release':
        releaseCyclone(state, events, actor, value * input.damageScale, source);
        break;
      case 'lodge-shuriken':
        if (own?.kind !== 'shuriken' || own.held === 0 || !primary || primary.hp === 0) break;
        own.held--;
        own.lodged.push(primary.id);
        events.push({ type: 'signature', bearerId: id, op: 'lodge', holderId: primary.id, amount: own.held });
        break;
      case 'recall-shuriken': {
        // Each lodged Shuriken strikes its enemy for `value` x Attack, then all return.
        if (own?.kind !== 'shuriken' || !own.lodged.length) break;
        const lodged = own.lodged;
        own.lodged = [];
        own.held = radiantShurikenCount;
        events.push({ type: 'signature', bearerId: id, op: 'recall', amount: lodged.length });
        for (const enemyId of lodged)
          strike(state, events, actor, enemy(state, enemyId), source, value * input.damageScale * input.skill.skillPower);
        break;
      }
      case 'spend-wounds': {
        // Nightcleave / Unbroken Midnight: an extra strike equal to `value` x the Wounds spent (no mitigation).
        if (own?.kind !== 'wounds' || own.wounds === 0 || !primary || primary.hp === 0) break;
        const amount = rounded(own.wounds * value * input.damageScale);
        own.wounds = 0;
        events.push({ type: 'signature', bearerId: id, op: 'wounds', amount: 0 });
        if (amount > 0) packet(state, events, primary, source, 'direct', amount, hitCharge);
        break;
      }
    }
  }
}
/** Start of a player turn: Seeds bloom, or wither if Flora or the holder has fallen. */
function bloomSeeds(state: RadiantCombatState, events: RadiantCombatEvent[]): void {
  for (const holder of state.bearers) {
    const seed = holder.seed;
    if (!seed) continue;
    holder.seed = null;
    if (bearer(state, seed.casterId).hp === 0 || holder.hp === 0) {
      events.push({ type: 'signature', bearerId: seed.casterId, op: 'seed-wither', holderId: holder.loadout.id, amount: 0 });
      continue;
    }
    heal(state, events, holder, { kind: 'passive', bearerId: seed.casterId }, seed.value * holder.stats.hp);
  }
}
/** End of the enemy phase: Cover clocks tick; Cyclones count down and release at 0. */
function tickSignatures(state: RadiantCombatState, events: RadiantCombatEvent[]): void {
  for (const member of state.bearers) {
    if (member.cover && --member.cover.remaining <= 0) member.cover = null;
    const own = member.signature;
    if (own?.kind === 'cyclone' && own.cyclone && --own.cyclone.remaining <= 0)
      releaseCyclone(state, events, member, 1, { kind: 'skill', bearerId: member.loadout.id });
  }
}
function normal(
  state: RadiantCombatState, events: RadiantCombatEvent[], actor: RadiantBearer, targetId: string, hitCharge: RadiantHitCharge,
): number {
  const target = enemy(state, targetId);
  living(target.hp);
  const stats = effectiveRadiantStats(state, actor.loadout.id);
  const source: RadiantSource = { kind: 'normal', bearerId: actor.loadout.id };
  const impact = packet(state, events, target, source, 'direct',
    radiantDirectDamage(stats.attack, gearDefense(state, actor, target.stats.defense),
      1 + combatAmount(state, actor, 'normal') + cooperation(state, actor),
      (1 + exposure(target)) * outgoingDamageMultiplier(state, actor, target)), hitCharge);
  return impact.healthLoss + impact.absorbed > 0 ? 1 : 0;
}
interface RadiantCast {
  kind: 'skill' | 'flare';
  def: RadiantSkillDef;
  targetId: string | undefined;
  /** Flare tier and form/rank scaling; 1 for skills. */
  damageScale: number;
  effectScale: number;
  hits: number;
  skill: RadiantSkillStats;
}
/** Shared Skill 1 / Skill 2 / Flare resolver: damage, enemy debuffs, ally buffs, heals and Shields, fills, Support heal. */
function cast(
  state: RadiantCombatState, events: RadiantCombatEvent[], actor: RadiantBearer, input: RadiantCast, hitCharge: RadiantHitCharge,
): number {
  const { def, skill } = input;
  if (def.target === 'one-enemy') {
    if (input.targetId === undefined) throw new Error('This skill requires a selected living enemy.');
    living(enemy(state, input.targetId).hp);
  } else if (input.targetId !== undefined) throw new Error('This skill uses its authored target set.');
  const id = actor.loadout.id;
  const source: RadiantSource = { kind: input.kind, bearerId: id };
  const stats = effectiveRadiantStats(state, id);
  // Step 2b: conditions are read once, before the cast changes anything.
  const holds = (when: string | undefined) => when === undefined || (signed(actor) && condition(state, actor, when));
  const effects = def.effects.filter(effect => effect.kind !== 'signature' && holds(effect.when));
  const clauses = signed(actor) ? def.effects.filter((effect): effect is Extract<RadiantKitEffect, { kind: 'signature' }> =>
    effect.kind === 'signature' && holds(effect.when)) : [];
  const power = def.alt && holds(def.alt.when) ? def.alt.power : def.power;
  const ignore = effects.reduce((sum, effect) => sum + (effect.kind === 'ignore-defense' ? effect.value : 0), 0);
  const bonus = effects.reduce((sum, effect) => sum + (effect.kind === 'damage-bonus' ? effect.value : 0), 0);
  const primary = input.targetId === undefined ? undefined : enemy(state, input.targetId);
  const enemyTargets = def.target === 'all-enemies' ? state.enemies.filter(member => member.hp > 0) : primary ? [primary] : [];
  let hits = 0;
  if (def.target !== 'none') for (const target of enemyTargets) {
    if (target.hp === 0) continue;
    const coefficient = power * input.damageScale * skill.skillPower *
      (1 + (input.kind === 'flare' ? combatAmount(state, actor, 'flare') : 0) + cooperation(state, actor) + bonus);
    const total = Math.max(input.hits, radiantDirectDamage(stats.attack, gearDefense(state, actor, target.stats.defense, ignore),
      coefficient, (1 + exposure(target)) * outgoingDamageMultiplier(state, actor, target)));
    for (let hit = 0; hit < input.hits && target.hp > 0; hit++) {
      const amount = Math.floor(total / input.hits) + (hit === input.hits - 1 ? total % input.hits : 0);
      if (!amount) continue;
      const impact = packet(state, events, target, source, 'direct', amount, hitCharge);
      if (impact.healthLoss + impact.absorbed > 0) hits++;
    }
  }
  signatureClauses(state, events, actor, input, clauses, primary, enemyTargets, hitCharge);
  const duration = (turns: number) => Math.min(radiantMaximumDuration, turns + skill.skillDuration);
  const enemiesFor = (to: string) => (to === 'all-enemies' ? state.enemies : primary ? [primary] : []).filter(member => member.hp > 0);
  for (const effect of effects) {
    if (effect.kind !== 'burn' && effect.kind !== 'weaken' && effect.kind !== 'expose') continue;
    for (const target of enemiesFor(effect.to)) {
      const strength = effect.value * input.effectScale * skill.skillPower;
      // Unbroken Ember: Burn from all allies' skills and Flares deals +30% while Infernis lives.
      const ember = effect.kind === 'burn' && livingStarter(state, 'ember') ? 1 + radiantPassiveValues.emberBurn : 1;
      const magnitude = effect.kind === 'burn'
        ? strength * stats.attack * outgoingDamageMultiplier(state, actor, target, true) * ember : strength;
      debuff(state, events, target, effect.kind, source, magnitude, duration(effect.turns));
    }
  }
  const lowest = woundedAlly(state);
  const alliesFor = (to: string): RadiantBearer[] => (to === 'self' ? [actor] : to === 'lowest' ? (lowest ? [lowest] : []) :
    state.bearers.filter(member => to === 'all-allies' || member !== actor)).filter(member => member.hp > 0);
  // Heals and Shields resolve before ally buffs (no rule depends on the order), so each recipient's
  // heal and its attached statuses present as one impact.
  for (const effect of effects) {
    if (effect.kind !== 'heal' && effect.kind !== 'shield') continue;
    // N7: kit heals and Shields are a % of the recipient's max Health x the caster's Skill Power.
    for (const ally of alliesFor(effect.to)) {
      const magnitude = effect.value * input.effectScale * skill.skillPower * ally.stats.hp;
      if (effect.kind === 'heal') heal(state, events, ally, source, magnitude);
      else shield(state, events, ally, source, magnitude);
    }
  }
  for (const effect of effects) {
    if (effect.kind === 'cleanse') { for (const ally of alliesFor(effect.to)) cleanse(events, ally); continue; }
    if (effect.kind !== 'attack-up' && effect.kind !== 'defense-up' && effect.kind !== 'reduction' &&
      effect.kind !== 'gain-up' && effect.kind !== 'hot') continue;
    for (const ally of alliesFor(effect.to)) {
      applyCategory(events, ally.loadout.id, ally.buffs, effect.kind, source,
        effect.value * input.effectScale * skill.skillPower, duration(effect.turns));
      // Shared Mindflame: Attack Up from Disciple also fills each ally it reaches.
      if (effect.kind === 'attack-up' && actor.loadout.starter === 'disciple' && signed(actor))
        addPassiveCharge(state, events, ally.loadout.id, rounded(radiantPassiveValues.discipleFill * gaugeGain(ally)));
    }
  }
  for (const effect of effects) {
    if (effect.kind !== 'fill') continue;
    for (const ally of alliesFor(effect.to))
      addPassiveCharge(state, events, ally.loadout.id, Math.round(effect.value * input.effectScale * gaugeGain(ally)));
  }
  if (radiantStarterKits[actor.loadout.starter].role === 'Support')
    for (const ally of state.bearers.filter(member => member.hp > 0))
      heal(state, events, ally, { kind: 'role', bearerId: id }, radiantSupportSquadHeal * ally.stats.hp);
  return hits;
}
function skillAction(
  state: RadiantCombatState, events: RadiantCombatEvent[], actor: RadiantBearer,
  action: Extract<RadiantCombatAction, { type: 'skill' }>, hitCharge: RadiantHitCharge,
): number {
  if (action.slot !== 1 && action.slot !== 2) throw new Error('Invalid radiant skill slot.');
  const id = actor.loadout.id;
  const def = radiantStarterKits[actor.loadout.starter].kit[action.slot === 1 ? 'skill1' : 'skill2'];
  if (def.target !== 'one-enemy' && action.targetId !== undefined) throw new Error('This skill uses its authored target set.');
  if (def.target === 'one-enemy' && (action.targetId === undefined || enemy(state, action.targetId).hp <= 0))
    throw new Error('This skill requires a selected living enemy.');
  const skill = radiantSkillStats(state, id, action.slot);
  const spent = spendSkill(state.gauge, id, action.slot, skill.skillEfficiency);
  state.gauge = spent.state;
  events.push({ type: 'skill', bearerId: id, slot: action.slot, name: def.name, cost: spent.cost });
  return cast(state, events, actor, { kind: 'skill', def, targetId: action.targetId, damageScale: 1, effectScale: 1,
    hits: def.hits, skill }, hitCharge);
}
function flare(
  state: RadiantCombatState, events: RadiantCombatEvent[], actor: RadiantBearer, targetId: string | undefined,
  hitCharge: RadiantHitCharge,
): { tier: FlareTier; hits: number } {
  const def = radiantStarterKits[actor.loadout.starter].kit.flare;
  if (def.target !== 'one-enemy' && targetId !== undefined) throw new Error('This signature uses its authored target set.');
  if (def.target === 'one-enemy' && (targetId === undefined || enemy(state, targetId).hp <= 0))
    throw new Error('This signature requires a selected living enemy.');
  const spent = spendReadyFlare(state.gauge, actor.loadout.id);
  state.gauge = spent.state;
  const tier = spent.tier, scale = radiantFlareTierScale[tier], power = radiantFlarePower(actor.loadout);
  events.push({ type: 'flare', bearerId: actor.loadout.id, tier, name: def.name });
  const hits = cast(state, events, actor, { kind: 'flare', def, targetId, damageScale: scale.damage * power,
    effectScale: scale.effect * power, hits: scale.hits, skill: radiantSkillStats(state, actor.loadout.id, 'flare') }, hitCharge);
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
  const hits = action.hits ?? 1;
  safe(hits, 'enemy hit count', 1);
  if (hits > 16) throw new Error('Radiant enemy attack exceeds bounded packet count.');
  const targets = action.targetIds.map(id => { const target = bearer(state, id); living(target.hp); return target; });
  const source: RadiantSource = { kind: 'enemy', enemyId: actor.id };
  if (action.healBefore !== undefined) heal(state, events, actor, source, action.healBefore);
  if (action.refreshShieldBefore !== undefined) {
    const amount = rounded(action.refreshShieldBefore);
    const old = actor.shields.find(layer => layer.source.kind === 'enemy' && layer.source.enemyId === actor.id);
    const gained = Math.max(0, amount - (old?.remaining ?? 0));
    if (gained > 0) {
      const shieldId = old?.id ?? state.nextShieldId++;
      if (old) old.remaining += gained;
      else actor.shields.push({ id: shieldId, source, remaining: gained });
      events.push({ type: 'shield', source, targetId: actor.id, amount: gained, shieldId });
    }
  }
  for (const target of targets) {
    const stats = effectiveRadiantStats(state, target.loadout.id);
    const reduction = category(target.buffs, 'reduction');
    const weakening = category(actor.debuffs, 'weaken');
    const element = elementDamageMultiplier(actor.elementId, radiantStarterKits[target.loadout.starter].elementId);
    // D-473 O1 interim: `guard` reduces damage while this bearer used a skill this turn (no 50% Defend base).
    const guard = state.skilled.includes(target.loadout.id) ? Math.min(.6, combatAmount(state, target, 'guard')) : 0;
    const output = Math.max(.2, (1 - guard) * (1 - reduction));
    const beforeProtection = radiantDirectDamage(actor.stats.attack * (1 - weakening), stats.defense, action.coefficient, output * element);
    const protection = (target.hp > target.stats.hp * .75 ? combatAmount(state, target, 'shelter') : 0) +
      (beforeProtection > target.stats.hp * .2 ? combatAmount(state, target, 'brace') : 0);
    const total = radiantDirectDamage(actor.stats.attack * (1 - weakening), stats.defense, action.coefficient,
      Math.max(.2, output * (1 - Math.min(.8, protection))) * element);
    for (let hit = 0; hit < hits && target.hp > 0; hit++) {
      const amount = Math.floor(total / hits) + (hit === hits - 1 ? total % hits : 0);
      if (!amount) continue;
      // Bruno's Cover: the caster takes its share of this hit (Faultbound Resolve reduces that share by 25%).
      const cover = target.cover, coverer = cover ? bearer(state, cover.casterId) : undefined;
      const moved = cover && coverer && coverer.hp > 0 ? Math.round(amount * cover.share) : 0;
      if (moved > 0 && coverer) {
        const taken = rounded(moved * (1 - (coverer.loadout.starter === 'bruno' ? radiantPassiveValues.brunoRedirect : 0)));
        if (taken > 0) {
          const redirected = packet(state, events, coverer, source, 'direct', taken, undefined, true);
          refundFullBlock(state, events, coverer, redirected, taken);
        }
      }
      if (amount - moved <= 0) continue;
      const part = packet(state, events, target, source, 'direct', amount - moved);
      refundFullBlock(state, events, target, part, amount - moved);
      if (target.signature?.kind === 'wounds' && part.healthLoss > 0 && target.hp > 0) {
        target.signature.wounds += part.healthLoss;
        safe(target.signature.wounds, 'Wounds');
        events.push({ type: 'signature', bearerId: target.loadout.id, op: 'wounds', amount: target.signature.wounds });
      }
      if (target.hp > 0 && part.healthLoss + part.absorbed > 0) {
        state.gauge = grantRadiantIncomingAttack(state.gauge, target.loadout.id, gaugeGain(target));
        events.push({ type: 'charge', bearerId: target.loadout.id,
          personal: state.gauge.members.find(m => m.id === target.loadout.id)!.charge,
          bonusRolls: 0, bonusOffered: 0 });
      }
    }
  }
}
function tick<C extends RadiantCategory>(events: RadiantCombatEvent[], targetId: string, alive: boolean,
  effects: RadiantCategoryEffect<C>[], kinds: readonly C[]): RadiantCategoryEffect<C>[] {
  for (const effect of effects) if (kinds.includes(effect.category)) {
    effect.remaining--;
    if (alive) events.push({ type: 'status', targetId, status: effect.category, source: effect.source,
      magnitude: effect.magnitude, remaining: effect.remaining, clockOnly: true });
  }
  return effects.filter(effect => effect.remaining > 0);
}
/** End of the enemy phase: Burn ticks, then category clocks; HoT heals; a new player turn begins. */
function finishRound(state: RadiantCombatState, events: RadiantCombatEvent[]): void {
  if (state.enemies.filter(m => m.hp > 0).some(m => !state.enemyActed.includes(m.id)))
    throw new Error('Every living enemy must act before completing its phase.');
  for (const target of state.enemies.filter(m => m.hp > 0)) {
    const burn = target.debuffs.find(effect => effect.category === 'burn');
    if (burn) packet(state, events, target, burn.source, 'periodic', Math.max(1, rounded(burn.magnitude)));
  }
  if (state.phase !== 'victory') tickSignatures(state, events);
  for (const target of state.enemies)
    target.debuffs = tick(events, target.id, target.hp > 0, target.debuffs, enemyCategories);
  if (state.phase === 'victory' || state.phase === 'defeat') return;
  for (const target of state.bearers) {
    const hot = target.buffs.find(effect => effect.category === 'hot');
    if (hot) heal(state, events, target, hot.source, hot.magnitude * target.stats.hp);
    target.buffs = tick(events, target.loadout.id, target.hp > 0, target.buffs, allyCategories);
  }
  state.gauge = grantRadiantRound(state.gauge);
  state.round++;
  safe(state.round, 'round', 1);
  state.acted = [];
  state.skilled = [];
  state.enemyActed = [];
  state.gearTriggered = [];
  state.phase = 'player';
  events.push({ type: 'round', round: state.round });
  bloomSeeds(state, events);
  for (const member of state.gauge.members.filter(m => m.living))
    events.push({ type: 'charge', bearerId: member.id, personal: member.charge,
      bonusRolls: 0, bonusOffered: 0 });
}
function gearDefense(state: RadiantCombatState, actor: RadiantBearer, defense: number, ignore = 0): number {
  return defense * (1 - Math.min(.8, combatAmount(state, actor, 'pierce') + ignore));
}
function cooperation(state: RadiantCombatState, actor: RadiantBearer): number {
  return state.acted.some(id => id !== actor.loadout.id)
    ? combatAmount(state, actor, 'cooperation') : 0;
}

/** Process a fixed native ledger once. Gear output is never an input to another
 * native/gear trigger, and multi-target packets cannot multiply action grants. */
function processRadiantGear(
  state: RadiantCombatState, events: RadiantCombatEvent[], action: RadiantCombatAction,
): void {
  const nativeEvents = events.filter(event =>
    'source' in event && !['gear', 'master', 'leader'].includes(event.source.kind));
  const defeated = new Set(events.filter(event => event.type === 'defeated').map(event => event.targetId));
  const shielded = new Set(state.bearers.filter(owner => owner.shields.length > 0).map(owner => owner.loadout.id));
  const snapshots = new Map(state.bearers.filter(owner => owner.hp > 0)
    .map(owner => [owner.loadout.id, effectiveRadiantStats(state, owner.loadout.id)]));
  for (const owner of state.bearers) {
    if (owner.hp === 0) continue;
    const id = owner.loadout.id, stats = snapshots.get(id)!;
    const owned = nativeEvents.filter(event => 'source' in event && 'bearerId' in event.source && event.source.bearerId === id);
    const direct = owned.filter((event): event is Extract<RadiantCombatEvent, { type: 'damage' }> =>
      event.type === 'damage' && event.origin === 'direct' &&
      (event.source.kind === 'normal' || event.source.kind === 'skill' || event.source.kind === 'flare'));
    const restored = owned.filter((event): event is Extract<RadiantCombatEvent, { type: 'heal' }> =>
      event.type === 'heal' && event.effective > 0);
    const incoming = nativeEvents.filter((event): event is Extract<RadiantCombatEvent, { type: 'damage' }> =>
      event.type === 'damage' && event.origin === 'direct' && event.source.kind === 'enemy');
    const absorbed = incoming.flatMap(event => event.shields.filter(entry =>
      native(entry.source) && 'bearerId' in entry.source && entry.source.bearerId === id)
      .map(entry => ({ event, amount: entry.amount })));
    const ownAction = 'bearerId' in action && action.bearerId === id;
    const normalHit = ownAction && action.type === 'normal' && direct.some(event => event.healthLoss > 0);
    const normalDirect = ownAction && action.type === 'normal' && direct.some(event => event.healthLoss + event.absorbed > 0);
    const flareCast = ownAction && action.type === 'flare';
    // D-473 O1 interim: Defend-triggered effects fire when this bearer uses Skill 1 or Skill 2.
    const skillUse = ownAction && action.type === 'skill';
    const round = action.type === 'finish-enemy-phase' && events.some(event => event.type === 'round');
    const bundles: { source: Extract<RadiantSource, { kind: 'gear' | 'master' | 'leader' }>;
      key: string; effects: RadiantConduitDesign }[] = (owner.loadout.gear ?? []).flatMap(slot => slot === null ? [] : [{
        source: { kind: 'gear', bearerId: id, conduitId: slot.id }, key: `${id}:${slot.id}`,
        effects: radiantConduitPrimitives(slot),
      }]);
    if (owner.loadout.masterId) bundles.push({ source: { kind: 'master', bearerId: id },
      key: `${id}:${owner.loadout.masterId}`, effects: radiantMasters[owner.loadout.masterId].effects });
    bundles.push({ source: { kind: 'leader', bearerId: state.bearers[0].loadout.id },
      key: `${id}:leader`, effects: leaderEffects(state, owner) });
    for (const { source, key, effects } of bundles) {
      let triggered = false;
      for (const primitive of effects) {
        const amount = primitive.amount;
        const grant = (recipient: RadiantBearer, value: number): void => {
          if (recipient.hp > 0) {
            addPassiveCharge(state, events, recipient.loadout.id, rounded(value * gaugeGain(recipient)));
            const event = events[events.length - 1];
            if (event.type === 'charge') event.gearSource = source;
          }
        };
        const wounded = woundedAlly(state);
        const primary = direct.find(event => event.healthLoss > 0);
        const target = primary ? state.enemies.find(member => member.id === primary.targetId && member.hp > 0) : undefined;
        const boundedIncoming = !state.gearTriggered.includes(key);
        const hurt = incoming.some(event => event.targetId === id && event.healthLoss > 0);
        const killed = direct.some(event => defeated.has(event.targetId) && event.healthLoss > 0);
        switch (primitive.kind) {
          case 'normal-charge': if (normalDirect) grant(owner, amount); break;
          case 'guard-charge': if (skillUse) grant(owner, amount); break;
          case 'team-charge':
            if (normalDirect) for (const ally of state.bearers) if (ally !== owner) grant(ally, amount);
            break;
          case 'guard-shield': if (skillUse) shield(state, events, owner, source, amount * stats.defense); break;
          case 'normal-heal': if (normalHit && wounded) heal(state, events, wounded, source, amount * stats.recovery); break;
          case 'leech':
            if (direct.length) heal(state, events, owner, source, amount * direct.reduce((sum, event) => sum + event.healthLoss, 0));
            break;
          case 'heal-charge':
            if (restored.length) grant(owner, amount);
            break;
          case 'heal-buff':
            for (const targetId of new Set(restored.map(event => event.targetId))) {
              const ally = state.bearers.find(member => member.loadout.id === targetId && member.hp > 0);
              if (ally) applyCategory(events, targetId, ally.buffs, 'attack-up', source, amount, 1);
            }
            break;
          case 'absorbed-charge':
            if (boundedIncoming && absorbed.length) { grant(owner, amount); triggered = true; }
            break;
          case 'reflect':
            if (boundedIncoming && absorbed.length) {
              const enemyId = absorbed[0].event.source;
              const selected = enemyId.kind === 'enemy' ? state.enemies.find(member => member.id === enemyId.enemyId) : undefined;
              if (selected && selected.hp > 0) packet(state, events, selected, source, 'generated',
                Math.max(1, rounded(Math.min(stats.attack, amount * absorbed.reduce((sum, entry) => sum + entry.amount, 0)))));
              triggered = true;
            }
            break;
          case 'hurt-shield':
            if (boundedIncoming && incoming.some(event => event.targetId === id && event.healthLoss > 0)) {
              shield(state, events, owner, source, amount * owner.stats.hp); triggered = true;
            }
            break;
          case 'flare-shield':
            if (flareCast) for (const ally of state.bearers) shield(state, events, ally, source, amount * ally.stats.hp);
            break;
          case 'round-heal': if (round && wounded) heal(state, events, wounded, source, amount * stats.recovery); break;
          case 'round-shield': if (round && wounded) shield(state, events, wounded, source, amount * stats.defense); break;
          case 'normal-burn':
            if (normalHit && target) applyCategory(events, target.id, target.debuffs, 'burn', source, amount * stats.attack, 1);
            break;
          case 'normal-expose':
            if (normalHit && target) applyCategory(events, target.id, target.debuffs, 'expose', source, amount, 1);
            break;
          case 'normal-weaken':
            if (normalHit && target) debuff(state, events, target, 'weaken', source, amount, 1);
            break;
          case 'next-buff':
            if (normalHit) {
              const next = nextAlly(state, owner);
              if (next) applyCategory(events, next.loadout.id, next.buffs, 'attack-up', source, amount, 1);
            }
            break;
          case 'status-shield':
            if (owned.some(event => event.type === 'status' && !event.clockOnly && event.remaining > 0 &&
              ['weaken', 'burn', 'expose'].includes(event.status)) && wounded)
              shield(state, events, wounded, source, amount * stats.defense);
            break;
          case 'guard-heal': if (skillUse) heal(state, events, owner, source, amount * stats.recovery); break;
          case 'flare-heal': if (flareCast && wounded) heal(state, events, wounded, source, amount * stats.recovery); break;
          case 'normal-shield': if (normalHit) shield(state, events, owner, source, amount * stats.defense); break;
          case 'heal-shield':
            for (const targetId of new Set(restored.map(event => event.targetId)))
              shield(state, events, bearer(state, targetId), source, amount * stats.defense);
            break;
          case 'hurt-heal':
            if (boundedIncoming && hurt) {
              const ally = woundedAlly(state, id);
              if (ally) heal(state, events, ally, source, amount * stats.recovery);
              triggered = true;
            }
            break;
          case 'break-heal':
            if (boundedIncoming && !shielded.has(id) && incoming.some(event => event.targetId === id && event.absorbed > 0)) {
              heal(state, events, owner, source, amount * stats.recovery); triggered = true;
            }
            break;
          case 'burn-heal': {
            const damage = owned.filter((event): event is Extract<RadiantCombatEvent, { type: 'damage' }> =>
              event.type === 'damage' && event.origin === 'periodic').reduce((sum, event) => sum + event.healthLoss, 0);
            if (damage > 0) heal(state, events, owner, source, amount * damage);
            break;
          }
          case 'kill-heal': if (killed && wounded) heal(state, events, wounded, source, amount * owner.stats.hp); break;
          case 'kill-charge': if (killed) grant(owner, amount); break;
          case 'normal-splash':
            if (normalHit && primary) {
              const other = state.enemies.filter(enemy => enemy.hp > 0 && enemy.id !== primary.targetId)
                .reduce<RadiantEnemy | undefined>((best, enemy) => !best || enemy.hp > best.hp ? enemy : best, undefined);
              if (other) packet(state, events, other, source, 'generated', Math.max(1, rounded(amount * primary.healthLoss)));
            }
            break;
          case 'flare-team-charge':
          case 'heal-team-charge':
            if (primitive.kind === 'flare-team-charge' ? flareCast : restored.length > 0)
              for (const ally of state.bearers) if (ally !== owner) grant(ally, amount);
            break;
          case 'hurt-charge':
            if (boundedIncoming && hurt) { grant(owner, amount); triggered = true; }
            break;
          case 'guard-team-shield':
            if (skillUse) for (const ally of state.bearers) shield(state, events, ally, source, amount * stats.defense);
            break;
          case 'flare-weaken':
            if (flareCast) for (const target of state.enemies.filter(enemy => enemy.hp > 0))
              debuff(state, events, target, 'weaken', source, amount, 1);
            break;
          case 'normal-reduction':
            if (normalHit) applyCategory(events, id, owner.buffs, 'reduction', source, amount, 1);
            break;
          case 'round-charge': if (round) grant(owner, amount); break;
          case 'round-team-heal':
            if (round) for (const ally of state.bearers) heal(state, events, ally, source, amount * stats.recovery);
            break;
        }
      }
      if (triggered) state.gearTriggered.push(key);
    }
  }
}
export function applyRadiantCombatAction(
  input: RadiantCombatState, action: RadiantCombatAction,
): { state: RadiantCombatState; events: RadiantCombatEvent[] } {
  validateRadiantCombat(input);
  if (!action || !['normal', 'skill', 'flare', 'end-turn', 'enemy-attack', 'enemy-heal', 'finish-enemy-phase'].includes(action.type))
    throw new Error('Unknown radiant combat action.');
  if (input.phase === 'victory' || input.phase === 'defeat') throw new Error('Radiant encounter is finished.');
  const state = structuredClone(input), events: RadiantCombatEvent[] = [];
  if (action.type === 'end-turn') {
    // End Turn: remaining living bearers forgo their action and the enemy phase begins.
    if (state.phase !== 'player') throw new Error('Not the radiant player phase.');
    for (const member of state.bearers)
      if (member.hp > 0 && !state.acted.includes(member.loadout.id)) state.acted.push(member.loadout.id);
    state.phase = 'enemy';
  } else if (action.type === 'normal' || action.type === 'skill' || action.type === 'flare') {
    if (state.phase !== 'player') throw new Error('Not the radiant player phase.');
    const actor = bearer(state, action.bearerId);
    living(actor.hp);
    if (state.acted.includes(action.bearerId)) throw new Error('This bearer already acted this round.');
    let hits = 0;
    const hitCharge: RadiantHitCharge = { bonusRolls: 0, bonusOffered: 0 };
    if (action.type === 'normal') {
      hits = normal(state, events, actor, action.targetId, hitCharge);
      // Gale Cadence: another ally's Normal Attack adds 1 Gust to each living Atmoso's Cyclone.
      for (const member of state.bearers) {
        const own = member.signature;
        if (member === actor || member.hp === 0 || own?.kind !== 'cyclone' || !own.cyclone || own.gusts >= radiantGustCap) continue;
        own.gusts++;
        events.push({ type: 'signature', bearerId: member.loadout.id, op: 'gust', amount: own.gusts });
      }
    }
    else if (action.type === 'skill') hits = skillAction(state, events, actor, action, hitCharge);
    else hits = flare(state, events, actor, action.targetId, hitCharge).hits;
    const charge = grantRadiantAction(state.gauge, action.bearerId, action.type, action.type === 'normal' ? hits : 0);
    state.gauge = charge.state;
    events.push({ type: 'charge', bearerId: action.bearerId,
      personal: state.gauge.members.find(m => m.id === action.bearerId)!.charge,
      bonusRolls: hitCharge.bonusRolls, bonusOffered: hitCharge.bonusOffered });
    processRadiantGear(state, events, action);
    state.acted.push(action.bearerId);
    if (action.type === 'skill') state.skilled.push(action.bearerId);
    if (state.phase === 'player' && state.bearers.filter(m => m.hp > 0).every(m => state.acted.includes(m.loadout.id)))
      state.phase = 'enemy';
  } else {
    if (state.phase !== 'enemy') throw new Error('Not the radiant enemy phase.');
    if (action.type === 'finish-enemy-phase') finishRound(state, events);
    else {
      if (state.enemyActed.includes(action.enemyId)) throw new Error('This enemy already acted this phase.');
      living(enemy(state, action.enemyId).hp);
      if (action.type === 'enemy-attack') enemyAttack(state, events, action);
      else heal(state, events, enemy(state, action.enemyId), { kind: 'enemy', enemyId: action.enemyId }, action.amount);
      state.enemyActed.push(action.enemyId);
    }
    processRadiantGear(state, events, action);
  }
  sync(state);
  validateRadiantCombat(state);
  return { state, events: structuredClone(events) };
}
