import {
  radiantFlarePower, radiantLeaderEffects, radiantEquipmentAmount, radiantMasters, radiantRoleSkillPower, radiantSkillAscension,
  radiantStarterKits, radiantSupportSquadHeal, resolveRadiantStarterStats,
  validateRadiantLoadout, validateRadiantStats,
  type RadiantLoadout, type RadiantStats,
} from '../content/combat-kits';
import {
  radiantFlareTierScale, radiantSkillAcceptsTarget, type RadiantKitEffect, type RadiantSkillDef, type RadiantSkillSlot,
} from '../content/radiant-kits';
import type { RadiantBearerId } from '../content/combat-kits';
import {
  addRadiantPersonalCharge, grantRadiantAction, personalChargeMaximum, radiantCapacityCap, radiantFlareCost, grantRadiantDrop, grantRadiantIncomingAttack, grantRadiantRound,
  radiantHitDrop, spendReadyFlare, spendSkill, validateRadiantGauge, type FlareTier, type RadiantGaugeState,
} from './combat-gauge';
import { squadMemberLimit } from '../content/squad-rules';
import { type ConduitId } from '../content/conduits';
import {
  radiantAllyGuardThreshold, radiantConduitPrimitives, radiantGambleRules, radiantHealthSkillPowerStep, radiantOmnicRules,
  radiantShieldGuardCap, radiantStasisVulnerability, type RadiantConduitEffect, type RadiantConduitDesign,
} from '../content/conduit-effects';
import type { ElementId } from '../content/activities';
import { elementDamageMultiplier, isCombatElement } from '../content/element-matchups';

export type RadiantSource =
  | { kind: 'normal' | 'skill' | 'flare' | 'passive' | 'role'; bearerId: string }
  | { kind: 'master'; bearerId: string }
  | { kind: 'leader'; bearerId: string }
  | { kind: 'gear'; bearerId: string; conduitId: ConduitId }
  | { kind: 'enemy'; enemyId: string };
export type RadiantGearSource = Extract<RadiantSource, { kind: 'gear' | 'master' | 'leader' }>;
/** D-492 presentation bookkeeping: never read by combat, never changes amounts, order or RNG. */
export interface RadiantBoost { source: RadiantGearSource; amount: number }
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
  /** D-493 Cinder Testament: extra Burn damage fraction (Burn only; omitted when 0). */
  amp?: number;
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
/** A Burn boost owned by its caster (Caldrex's and Vespera's Flares): Burn ticks from every ally deal +`value`. */
export interface RadiantBurnBoost { value: number; remaining: number }
/** Vespera's Signal on one other ally: that ally's next damaging skill or Flare deals +`value`. */
export interface RadiantSignal { holderId: string; value: number; remaining: number }
/** A bearer's own signature counters (Step 2b). Coefficients already include the creating skill's Skill Power. */
export type RadiantOwnSignature =
  | { kind: 'cyclone'; gusts: number; cyclone: { coefficient: number; perGust: number; remaining: number } | null }
  | { kind: 'shuriken'; held: number; lodged: string[] }
  | { kind: 'wounds'; wounds: number }
  /** Rosetta: her Quarry (a living enemy or none) and the other allies who hit it this turn. */
  | { kind: 'quarry'; targetId: string | null; contributors: string[] }
  /** Thornia: at most one Thorn Trap per living enemy. */
  | { kind: 'thorns'; traps: RadiantThornTrap[] }
  /** Crinso: Combo 0-5 and the last skill slot used (Rose Duality). */
  | { kind: 'combo'; combo: number; last: RadiantSkillSlot | null }
  /** Ozriel: allies who already survived their one lethal hit this encounter. */
  | { kind: 'refusal'; spent: string[] }
  /** Ilvaris: Fate-seared Mark stacks (1-5) and clocks per living enemy. */
  | { kind: 'marks'; marks: { enemyId: string; stacks: number; remaining: number }[] }
  /** Kaelith: Incisions (1-3) per living enemy, kept until consumed. */
  | { kind: 'incisions'; incisions: { enemyId: string; stacks: number }[] }
  /** Batch 3 counters: `count` within its cap; `latch` marks a once-per-enemy-phase or once-per-turn gain already taken. */
  | { kind: RadiantCounterKind; count: number; latch: boolean }
  /** Maerion: Health allies lost to direct enemy hits, stored as Unreturned (whole Health, capped). */
  | { kind: 'unreturned'; stored: number }
  /** Vespera: at most one Signal per other ally. */
  | { kind: 'signal'; signals: RadiantSignal[] }
  /** Asteriel: Promise 0-3 and the current path (none until her first skill). */
  | { kind: 'path'; count: number; path: 'shelter' | 'flourish' | null }
  /** Nerithe: the one enemy holding Survey (or none) and its points. */
  | { kind: 'survey'; targetId: string | null; count: number }
  /** Orvella: her single Foundation, or none. */
  | { kind: 'foundation'; foundation: RadiantFoundation | null };
/** Counters with no extra state (batches 3-4). Myrthen's `season` counts Sprout 0, Bloom 1, Harvest 2. */
export type RadiantCounterKind = 'heat' | 'stillness' | 'season' | 'current' | 'tension' | 'cadence' | 'crosscut' |
  'load' | 'severance' | 'interval';
/** Orvella's Foundation: whole-number durability, the durability it was created with, and its clock. */
export interface RadiantFoundation { durability: number; max: number; remaining: number }
/** Thornia's trap on one enemy; `value` is the strike coefficient, already scaled by Skill Power and Flare tier. */
export interface RadiantThornTrap { enemyId: string; charges: number; remaining: number; value: number }
export interface RadiantBearer {
  loadout: RadiantLoadout;
  stats: RadiantStats;
  hp: number;
  shields: RadiantShield[];
  buffs: RadiantCategoryEffect<RadiantAllyCategory>[];
  seed: RadiantSeed | null;
  cover: RadiantCover | null;
  /** The Burn boost this bearer cast, if active (shared by Caldrex and Vespera). */
  burnUp: RadiantBurnBoost | null;
  signature: RadiantOwnSignature | null;
  /** D-493 Granite Hourglass: Health lost to direct enemy damage this enemy phase (only for wearers; omitted when 0). */
  phaseLoss?: number;
  /** D-493 Stasis Reliquary after a block: 'current' for the rest of that enemy phase, then 'next' (+25% damage taken). */
  stasis?: 'current' | 'next';
  /** D-493 Leviathan Mercy Reflector: damage reflected this enemy phase (only for wearers; omitted when 0). */
  reflected?: number;
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
  /** D-493 Nightglass Archive marks on this enemy, one per wearer (omitted when none). */
  marks?: RadiantEnemyMark[];
}
export interface RadiantEnemyMark { casterId: string; remaining: number }
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
  /** D-493 O11: separate Conduit RNG stream, present only when a random Conduit is equipped. */
  conduitSeed?: number;
  /** D-493 Stillhour Carillon: wearers who used Convergent Light this turn (omitted when none). */
  flared?: string[];
  nextShieldId: number;
  currencyEarned: number;
}
export type RadiantTimedStatus = RadiantCategory | 'weaken-removed';
export type RadiantSignatureOp = 'seed' | 'seed-wither' | 'cover' | 'cyclone' | 'gust' | 'cyclone-release' |
  'lodge' | 'recall' | 'return' | 'wounds' | 'detonate' | 'refund' |
  'quarry' | 'contributor' | 'trap' | 'trap-strike' | 'combo' | 'refusal' | 'mark' | 'incision' |
  'survey' | 'foundation' | 'foundation-absorb' | 'beat' | 'heat' | 'burn-up' | 'stillness' | 'season' | 'current' |
  'tension' | 'cadence' | 'crosscut' | 'unreturned' | 'load' | 'signal' | 'severance' | 'path' | 'promise' | 'interval';
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
      redirected?: true;
      /** D-492: share of `offered` added by each stat/multiplier Conduit (bearer hits), or damage it prevented (enemy hits). */
      boosts?: RadiantBoost[] }
  | { type: 'heal'; source: RadiantSource; targetId: string; snapshot: number; offered: number; effective: number;
      /** D-492: share of `effective` added by the `healing` Conduit bonus. */
      boosts?: RadiantBoost[] }
  | { type: 'shield'; source: RadiantSource; targetId: string; amount: number; shieldId: number;
      /** D-492: share of `amount` added by the `shielding` Conduit bonus. */
      boosts?: RadiantBoost[] }
  | { type: 'currency'; enemyId: string; amount: number; totalPaid: number }
  | { type: 'defeated'; targetId: string }
  | { type: 'health-mote'; enemyId: string; bearerId: string; offered: number; effective: number }
  | { type: 'gauge-drop'; enemyId: string; bearerId: string; trigger: 'hit' | 'defeat'; amount: number }
  | { type: 'skill'; bearerId: string; slot: RadiantSkillSlot; name: string; cost: number }
  | { type: 'flare'; bearerId: string; tier: FlareTier; name: string }
  | { type: 'charge'; bearerId: string; personal: number; bonusRolls: number; bonusOffered: number;
      gearSource?: Extract<RadiantSource, { kind: 'gear' | 'master' | 'leader' }>;
      /** D-492: Luminosity actually added by `gearSource` (omitted when the gauge was full). */
      gained?: number }
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
  return effectiveStats(state, bearer(state, id), true);
}
/** `share` adds Faultkeeper Loom's flat Defense; a wearer's own share basis is read without it (no recursion). */
function effectiveStats(state: RadiantCombatState, member: RadiantBearer, share: boolean): RadiantStats {
  const stats = { ...member.stats };
  // D-492: stat Conduits are folded into the loadout stats; attribution recomputes rescale them out.
  if (excludedSources) for (const key of ['hp', 'attack', 'defense', 'recovery'] as const)
    stats[key] *= (1 + equipmentAmount(member, key)) / (1 + radiantEquipmentAmount(member.loadout, key));
  for (const key of ['hp', 'attack', 'defense', 'recovery'] as const)
    stats[key] *= 1 + leaderEffects(state, member).filter(entry => entry.kind === key)
      .reduce((sum, entry) => sum + entry.amount, 0);
  stats.attack *= 1 - category(member.buffs, 'weaken') * (1 - Math.min(.8, combatAmount(state, member, 'resilience')));
  // D-493 C2: conditional Attack Up / Defense Up from Conduits join their category (strongest applies, cap 100%).
  stats.attack *= 1 + Math.min(radiantCategoryCaps['attack-up'],
    Math.max(category(member.buffs, 'attack-up'), conduitAttackUp(state)));
  stats.attack *= 1 + squadAura(state, 'squad-attack');
  stats.defense *= 1 + Math.min(radiantCategoryCaps['defense-up'],
    Math.max(category(member.buffs, 'defense-up'), conduitDefenseUp(state, member)));
  stats.defense *= 1 + squadAura(state, 'squad-defense') + defeatedCount(state) * combatAmount(state, member, 'ruin-defense');
  if (share) for (const wearer of state.bearers) {
    if (wearer === member || wearer.hp === 0) continue;
    const amount = combatAmount(state, wearer, 'ally-defense-share');
    if (amount > 0) stats.defense += amount * effectiveStats(state, wearer, false).defense;
  }
  validateRadiantStats(stats);
  return stats;
}
/** D-493 B3a: an aura kind summed over living squad members (each living wearer adds its own). */
function squadAura(state: RadiantCombatState, kind: RadiantConduitEffect): number {
  return state.bearers.reduce((sum, wearer) => sum + (wearer.hp > 0 ? combatAmount(state, wearer, kind) : 0), 0);
}
function defeatedCount(state: RadiantCombatState): number {
  return state.bearers.filter(member => member.hp === 0).length;
}
/** D-493 Phoenix Lifeforge: while a wearer lives and any enemy carries Burn, the squad has Attack Up. */
function conduitAttackUp(state: RadiantCombatState): number {
  if (!state.enemies.some(target => target.hp > 0 && target.debuffs.some(effect => effect.category === 'burn'))) return 0;
  return Math.max(0, ...state.bearers.filter(wearer => wearer.hp > 0).map(wearer => combatAmount(state, wearer, 'burning-attack')));
}
/** D-493 Citadel Spine (another living wearer, holder below 75% Health) and Horizon Heartcase (below the Convergent Light cost). */
function conduitDefenseUp(state: RadiantCombatState, member: RadiantBearer): number {
  if (member.hp <= 0) return 0;
  const reserve = belowFlareCost(state, member) ? combatAmount(state, member, 'reserve-defense') : 0;
  const wounded = member.hp < radiantAllyGuardThreshold * maximumHealth(state, member);
  const aura = wounded ? Math.max(0, ...state.bearers.filter(other => other !== member && other.hp > 0)
    .map(other => combatAmount(state, other, 'ally-guard'))) : 0;
  return Math.max(reserve, aura);
}
function belowFlareCost(state: RadiantCombatState, member: RadiantBearer): boolean {
  const entry = state.gauge.members.find(m => m.id === member.loadout.id);
  return entry !== undefined && entry.charge < radiantFlareCost(entry);
}
/** D-493 C2: maximum Health, including Horizon Heartcase's conditional bonus while Luminosity is below the Convergent Light cost. */
export function radiantMaximumHealth(state: RadiantCombatState, id: string): number {
  return maximumHealth(state, bearer(state, id));
}
function maximumHealth(state: RadiantCombatState, member: RadiantBearer): number {
  const bonus = member.hp > 0 && belowFlareCost(state, member) ? equipmentAmount(member, 'reserve-health') : 0;
  // D-493 B3a: squad maximum-Health auras multiply separately (Leader precedent).
  return rounded(member.stats.hp * (1 + bonus) * (1 + squadAura(state, 'squad-hp')));
}
/** D-493 Horizon Heartcase and squad auras: the highest Health a bearer can hold (every raise active). Health above the
 * current maximum stays until lost to damage; healing never raises Health above the current maximum. */
export function radiantHealthBound(state: RadiantCombatState, member: RadiantBearer): number {
  const aura = state.bearers.reduce((sum, wearer) => sum + radiantEquipmentAmount(wearer.loadout, 'squad-hp'), 0);
  return rounded(member.stats.hp * (1 + radiantEquipmentAmount(member.loadout, 'reserve-health')) * (1 + aura));
}
function healthCap(state: RadiantCombatState, target: RadiantBearer | RadiantEnemy): number {
  return 'loadout' in target ? maximumHealth(state, target) : rounded(target.stats.hp);
}
/** D-493 Starvein Conductor: every squad member has a different element (defeated members count). */
function distinctElements(loadouts: readonly RadiantLoadout[]): boolean {
  return new Set(loadouts.map(loadout => radiantStarterKits[loadout.starter].elementId)).size === loadouts.length;
}
/** D-493 O11: kinds that read the Conduit RNG stream. */
const randomConduitKinds: readonly RadiantConduitEffect[] = ['gamble-power', 'last-block'];
function usesConduitRng(loadouts: readonly RadiantLoadout[]): boolean {
  return loadouts.some(loadout => randomConduitKinds.some(kind => radiantEquipmentAmount(loadout, kind) > 0));
}
function initialConduitSeed(chargeSeed: number): number {
  return (Math.imul(chargeSeed ^ 0x5bd1e995, 0x27d4eb2d) + 0x165667b1) >>> 0;
}
function rollConduit(state: RadiantCombatState): number {
  if (state.conduitSeed === undefined) throw new Error('Radiant Conduit RNG stream is missing.');
  // Xorshift32: distinct from the charge stream's LCG, so neither perturbs the other.
  let x = state.conduitSeed || 0x9e3779b9;
  x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0;
  state.conduitSeed = x;
  return x / 0x100000000;
}
/** D-493 Nullsong Transmission: Skill Power change for a cast whose roll was `won` (undefined = no roll). */
function gambleShift(state: RadiantCombatState, actor: RadiantBearer, won: boolean | undefined): number {
  const amount = combatAmount(state, actor, 'gamble-power');
  return won === undefined || amount <= 0 ? 0 : won ? amount : -radiantGambleRules.loss;
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
/** D-493 C3-C6/C13: role, slot Imbue and Conduit/Master Skill stats; traits come from the kit definition. */
function skillStatsFrom(
  loadout: RadiantLoadout, slot: RadiantSkillSlot | 'flare', amount: (kind: RadiantConduitEffect) => number, maximumHealth: number,
  distinct = false,
): RadiantSkillStats {
  const ascended = slot === 1 ? loadout.ascension.skill1 === true : slot === 2 && loadout.ascension.skill2 === true;
  const { debuff, restore, support, area, burn } = skillTraits(loadout, slot);
  return {
    skillPower: 1 + radiantRoleSkillPower[radiantStarterKits[loadout.starter].role] +
      (ascended ? radiantSkillAscension.skillPower : 0) + amount('skill-power') +
      (slot === 1 ? amount('skill1-power') : 0) + (debuff ? amount('debuff-power') : 0) +
      (restore ? amount('restore-power') : 0) +
      Math.floor(maximumHealth / radiantHealthSkillPowerStep) * amount('health-skill-power') +
      (slot === 2 ? amount('skill2-power') : 0) + (support ? amount('support-power') : 0) +
      (area ? amount('aoe-power') : 0) + (slot === 'flare' ? amount('flare-power') : 0) +
      (burn ? amount('burn-skill-power') : 0),
    skillDuration: Math.round(amount('skill-duration') + (debuff ? amount('debuff-duration') : 0)),
    skillEfficiency: (ascended ? radiantSkillAscension.efficiency : 0) + amount('skill-efficiency') +
      (slot === 2 ? amount('skill2-efficiency') : 0) + (distinct ? amount('prism-efficiency') : 0),
    gaugeGain: 1 + amount('gauge-gain') + (distinct ? amount('prism-gain') : 0),
  };
}
/** D-493 C13 traits of one slot, from the kit definition. */
function skillTraits(loadout: RadiantLoadout, slot: RadiantSkillSlot | 'flare') {
  const kit = radiantStarterKits[loadout.starter].kit;
  const def = slot === 'flare' ? kit.flare : slot === 1 ? kit.skill1 : kit.skill2;
  const kinds = new Set<string>(def.effects.map(entry => entry.kind));
  const restore = kinds.has('heal') || kinds.has('shield');
  return {
    debuff: kinds.has('burn') || kinds.has('weaken') || kinds.has('expose'), burn: kinds.has('burn'), restore,
    support: restore || ['attack-up', 'defense-up', 'reduction', 'gain-up', 'hot'].some(kind => kinds.has(kind)),
    area: def.target === 'all-enemies' && def.power > 0, damaging: def.power > 0,
  };
}
/** Loadout Skill stats outside combat (role, slot Imbue, Conduits, Master; Gauge Gain before Luminosity Gain Up). Shared with the UI.
 * `distinct` applies squad-element conditions (D-493 Starvein Conductor); menus without a squad leave it off. */
export function radiantLoadoutSkillStats(loadout: RadiantLoadout, slot: RadiantSkillSlot | 'flare', distinct = false): RadiantSkillStats {
  return skillStatsFrom(loadout, slot, kind => radiantEquipmentAmount(loadout, kind), resolveRadiantStarterStats(loadout).hp, distinct);
}
/** Skill stats for one bearer's Skill 1, Skill 2 or Flare (D-473 N4, O3, O5; D-493 gear Skill stats). */
export function radiantSkillStats(state: RadiantCombatState, id: string, slot: RadiantSkillSlot | 'flare'): RadiantSkillStats {
  const member = bearer(state, id);
  const stats = skillStatsFrom(member.loadout, slot, kind => combatAmount(state, member, kind), member.stats.hp,
    distinctElements(state.bearers.map(entry => entry.loadout)));
  return { ...stats, skillPower: stats.skillPower + squadSkillPower(state, member, slot), gaugeGain: gaugeGain(state, member) };
}
/** D-493 B3a squad-conditional Skill Power (combat only; menus show the loadout value without it). */
function squadSkillPower(state: RadiantCombatState, member: RadiantBearer, slot: RadiantSkillSlot | 'flare'): number {
  const element = (entry: RadiantBearer) => radiantStarterKits[entry.loadout.starter].elementId;
  const oceanic = state.bearers.filter(entry => entry !== member && element(entry) === 'oceanic').length;
  const living = new Set(state.bearers.filter(entry => entry.hp > 0).map(element)).size;
  const shielded = member.shields.length > 0 && skillTraits(member.loadout, slot).restore
    ? squadAura(state, 'shielded-restore-power') : 0;
  return oceanic * combatAmount(state, member, 'oceanic-power') + living * combatAmount(state, member, 'census-power') +
    defeatedCount(state) * combatAmount(state, member, 'ruin-power') + shielded;
}
/** D-493 C6: Gauge Gain = 1 + Conduit/Master Gauge Gain + Luminosity Gain Up. */
function gaugeGain(state: RadiantCombatState, member: RadiantBearer): number {
  const distinct = distinctElements(state.bearers.map(entry => entry.loadout));
  return 1 + equipmentAmount(member, 'gauge-gain') + (distinct ? equipmentAmount(member, 'prism-gain') : 0) +
    category(member.buffs, 'gain-up') + squadAura(state, 'squad-gain');
}
/** D-492 attribution: while set, Conduit amounts from these source keys are treated as unequipped (pure recomputes only). */
let excludedSources: ReadonlySet<string> | null = null;
function gearKey(source: RadiantGearSource): string {
  return source.kind === 'gear' ? `gear:${source.bearerId}:${source.conduitId}` : `${source.kind}:${source.bearerId}`;
}
function equipmentAmount(member: RadiantBearer, kind: RadiantConduitEffect): number {
  if (!excludedSources) return radiantEquipmentAmount(member.loadout, kind);
  const id = member.loadout.id, skip = excludedSources;
  let sum = 0;
  for (const slot of member.loadout.gear ?? []) {
    if (slot === null || skip.has(gearKey({ kind: 'gear', bearerId: id, conduitId: slot.id }))) continue;
    for (const entry of radiantConduitPrimitives(slot)) if (entry.kind === kind) sum += entry.amount;
  }
  if (member.loadout.masterId !== null && !skip.has(gearKey({ kind: 'master', bearerId: id })))
    for (const entry of radiantMasters[member.loadout.masterId].effects) if (entry.kind === kind) sum += entry.amount;
  return sum;
}
function leaderEffects(state: RadiantCombatState, recipient: RadiantBearer): RadiantConduitDesign {
  const leader = state.bearers[0];
  if (excludedSources?.has(gearKey({ kind: 'leader', bearerId: leader.loadout.id }))) return [];
  return leader.hp > 0 && radiantStarterKits[leader.loadout.starter].elementId ===
    radiantStarterKits[recipient.loadout.starter].elementId ? radiantLeaderEffects(leader.loadout) : [];
}
function combatAmount(state: RadiantCombatState, actor: RadiantBearer, kind: RadiantConduitEffect): number {
  return equipmentAmount(actor, kind) +
    leaderEffects(state, actor).filter(entry => entry.kind === kind).reduce((sum, entry) => sum + entry.amount, 0);
}
/** The gear (or Master) source carrying a primitive kind, for effects a cast applies inline. */
function gearSourceOf(member: RadiantBearer, kind: RadiantConduitEffect): RadiantGearSource | undefined {
  const id = member.loadout.id;
  for (const slot of member.loadout.gear ?? [])
    if (slot !== null && radiantConduitPrimitives(slot).some(entry => entry.kind === kind)) return { kind: 'gear', bearerId: id, conduitId: slot.id };
  return member.loadout.masterId !== null && radiantMasters[member.loadout.masterId].effects.some(entry => entry.kind === kind)
    ? { kind: 'master', bearerId: id } : undefined;
}
/** D-493 B3a: direct-damage bonuses granted by another living bearer's Conduit (Ember Iris Burn, Nightglass mark on
 * Normal Attacks, Aegis Covenant Crown Shield holder). */
function allyDirect(state: RadiantCombatState, actor: RadiantBearer, target: RadiantEnemy, normal: boolean): number {
  const burn = target.debuffs.find(effect => effect.category === 'burn');
  let sum = 0;
  for (const wearer of state.bearers) {
    if (wearer.hp === 0) continue;
    const id = wearer.loadout.id;
    if (wearer !== actor && burn && burn.source.kind !== 'enemy' && burn.source.bearerId === id)
      sum += combatAmount(state, wearer, 'burn-ally-direct');
    if (normal && wearer !== actor && target.marks?.some(mark => mark.casterId === id)) sum += combatAmount(state, wearer, 'skill-mark');
    if (actor.shields.some(layer => (layer.source.kind === 'skill' || layer.source.kind === 'flare') && layer.source.bearerId === id))
      sum += combatAmount(state, wearer, 'skill-shield-direct');
  }
  return sum;
}
/** D-493 Aegis Covenant Crown: damage reduction against heavy enemy hits for holders of a wearer's skill Shield. */
function skillShieldBrace(state: RadiantCombatState, holder: RadiantBearer): number {
  return state.bearers.reduce((sum, wearer) => sum + (wearer.hp > 0 && holder.shields.some(layer =>
    (layer.source.kind === 'skill' || layer.source.kind === 'flare') && layer.source.bearerId === wearer.loadout.id)
    ? combatAmount(state, wearer, 'skill-shield-brace') : 0), 0);
}
/** D-493 Undertide Chronometer: Skill Efficiency for a damaging skill aimed at an enemy carrying a living wearer's Weaken. */
function targetEfficiency(state: RadiantCombatState, actor: RadiantBearer, def: RadiantSkillDef, targetId: string | undefined): number {
  if (def.power <= 0 || targetId === undefined) return 0;
  const weaken = enemy(state, targetId).debuffs.find(effect => effect.category === 'weaken');
  if (!weaken || weaken.source.kind === 'enemy' || weaken.source.bearerId === actor.loadout.id) return 0;
  const wearer = bearer(state, weaken.source.bearerId);
  return wearer.hp > 0 ? combatAmount(state, wearer, 'weaken-ally-efficiency') : 0;
}
/** Conditional damage Conduits and Leaders; D-473 O2 applies them to skills as well as Normals and Flares. */
function outgoingDamageMultiplier(state: RadiantCombatState, actor: RadiantBearer, target: RadiantEnemy, periodic = false): number {
  const element = radiantStarterKits[actor.loadout.starter].elementId;
  if (periodic) return (1 + combatAmount(state, actor, 'burn-power')) * elementDamageMultiplier(element, target.elementId);
  const conditions: readonly [RadiantConduitEffect, boolean][] = [
    ['opening', target.hp === Math.round(target.stats.hp)], ['execution', target.hp <= target.stats.hp * .25],
    ['burning', target.debuffs.some(effect => effect.category === 'burn')], ['exposed', exposure(target) > 0],
    ['weakened', target.debuffs.some(effect => effect.category === 'weaken')],
    ['shielded', actor.shields.length > 0], ['wounded', actor.hp <= maximumHealth(state, actor) / 2],
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
    const amped = effect && typeof effect === 'object' && 'amp' in effect;
    if (!effect || typeof effect !== 'object' || Object.keys(effect).length !== (amped ? 5 : 4) ||
      !allowed.includes(effect.category) || seen.has(effect.category) ||
      (amped && (effect.category !== 'burn' || !(typeof effect.amp === 'number' && effect.amp > 0 &&
        effect.amp <= radiantOmnicRules.burnAmpCap + 1e-9))))
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
  'rosetta', 'thornia', 'crinso', 'ozriel', 'ilvaris', 'kaelith',
  'nerithe', 'orvella', 'vaelor', 'caldrex', 'solenne', 'myrthen', 'neralis', 'varkhel', 'seravelle', 'velmira',
  'maerion', 'caevren', 'vespera', 'ilyss', 'asteriel', 'serapha',
]);
/** Bearers whose kits place Cover, and whose kits create a Burn boost. */
const coverCasters: readonly RadiantBearerId[] = ['bruno', 'caevren'];
const burnBoostCasters: readonly RadiantBearerId[] = ['caldrex', 'vespera'];
/** Elise's Shuriken count (Stormwheel Rhythm). */
export const radiantShurikenCount = 2;
/** Atmoso's Cyclone holds at most this many Gusts (Gale Cadence). */
export const radiantGustCap = 5;
/** Signature caps for batches 2-4 (D-473). */
export const radiantSignatureCaps = {
  combo: 5, marks: 5, incisions: 3,
  survey: 3, heat: 3, stillness: 4, season: 2, current: 3, tension: 4, cadence: 3, crosscut: 3,
  load: 3, severance: 3, interval: 3, promise: 3,
} as const;
/** Passive values for batches 1-4 (D-473). */
export const radiantPassiveValues = {
  emberBurn: .3, tideRefund: 8, brunoRedirect: .25, discipleFill: 5, auroraWeakenTurns: 1,
  markTaken: .1, markTurns: 2, incisionTaken: .1,
  surveyFill: 5, foundationShare: .2, stillnessReduction: .2, harvestBonus: .35, harvestIgnore: .2,
  unreturnedCap: .45, signalTurns: 2,
} as const;
/** Vaelor's Beat for a round: 0 Tune, 1 Rise, 2 Crescendo; one step per player turn, starting on Tune. */
export function radiantBeat(round: number): 0 | 1 | 2 {
  return ((round - 1) % 3) as 0 | 1 | 2;
}
const counterKinds: readonly RadiantCounterKind[] = ['heat', 'stillness', 'season', 'current', 'tension', 'cadence', 'crosscut',
  'load', 'severance', 'interval'];
function startingSignature(starter: RadiantBearerId): RadiantOwnSignature | null {
  if (!radiantSignatureBearers.has(starter)) return null;
  if (starter === 'atmoso') return { kind: 'cyclone', gusts: 0, cyclone: null };
  if (starter === 'elise') return { kind: 'shuriken', held: radiantShurikenCount, lodged: [] };
  if (starter === 'razor') return { kind: 'wounds', wounds: 0 };
  if (starter === 'rosetta') return { kind: 'quarry', targetId: null, contributors: [] };
  if (starter === 'thornia') return { kind: 'thorns', traps: [] };
  if (starter === 'crinso') return { kind: 'combo', combo: 0, last: null };
  if (starter === 'ozriel') return { kind: 'refusal', spent: [] };
  if (starter === 'ilvaris') return { kind: 'marks', marks: [] };
  if (starter === 'kaelith') return { kind: 'incisions', incisions: [] };
  if (starter === 'nerithe') return { kind: 'survey', targetId: null, count: 0 };
  if (starter === 'orvella') return { kind: 'foundation', foundation: null };
  if (starter === 'caldrex') return { kind: 'heat', count: 0, latch: false };
  if (starter === 'solenne') return { kind: 'stillness', count: 0, latch: false };
  if (starter === 'myrthen') return { kind: 'season', count: 0, latch: false };
  if (starter === 'neralis') return { kind: 'current', count: 0, latch: false };
  if (starter === 'varkhel') return { kind: 'tension', count: 0, latch: false };
  if (starter === 'seravelle') return { kind: 'cadence', count: 0, latch: false };
  if (starter === 'velmira') return { kind: 'crosscut', count: 0, latch: false };
  if (starter === 'maerion') return { kind: 'unreturned', stored: 0 };
  if (starter === 'caevren') return { kind: 'load', count: 0, latch: false };
  if (starter === 'vespera') return { kind: 'signal', signals: [] };
  if (starter === 'ilyss') return { kind: 'severance', count: 0, latch: false };
  if (starter === 'asteriel') return { kind: 'path', count: 0, path: null };
  if (starter === 'serapha') return { kind: 'interval', count: 0, latch: false };
  return null;
}
function validateSignatures(state: RadiantCombatState, member: RadiantBearer): void {
  if (!('seed' in member) || !('cover' in member) || !('burnUp' in member) || !('signature' in member))
    throw new Error('Invalid radiant signature state.');
  if (member.seed !== null) {
    if (!member.seed || Object.keys(member.seed).length !== 2) throw new Error('Invalid radiant Seed.');
    const caster = bearer(state, member.seed.casterId);
    if (caster.loadout.starter !== 'sprout') throw new Error('Invalid radiant signature caster.');
    finite(member.seed.value, 'Seed value', Number.MIN_VALUE);
  }
  if (member.cover !== null) {
    if (!member.cover || Object.keys(member.cover).length !== 3) throw new Error('Invalid radiant Cover.');
    const caster = bearer(state, member.cover.casterId);
    if (caster === member || !coverCasters.includes(caster.loadout.starter)) throw new Error('Invalid radiant signature caster.');
    finite(member.cover.share, 'Cover share', Number.MIN_VALUE);
    if (member.cover.share >= 1) throw new Error('Invalid radiant Cover share.');
    safe(member.cover.remaining, 'Cover clock', 1);
    if (member.cover.remaining > radiantMaximumDuration) throw new Error('Radiant effect exceeds its maximum duration.');
  }
  if (member.burnUp !== null) {
    if (!member.burnUp || typeof member.burnUp !== 'object' || Object.keys(member.burnUp).length !== 2 ||
      !burnBoostCasters.includes(member.loadout.starter)) throw new Error('Invalid radiant Burn boost.');
    finite(member.burnUp.value, 'Burn boost', Number.MIN_VALUE);
    safe(member.burnUp.remaining, 'Burn boost clock', 1);
    if (member.burnUp.remaining > radiantMaximumDuration) throw new Error('Radiant effect exceeds its maximum duration.');
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
  } else if (own && !validateCounters(state, member, own)) validateEnemyLedger(state, member, own);
}
/** Batch 3-4 state: counters within their caps, Survey on one living enemy, a bounded Foundation, Unreturned within
 * its cap, at most one Signal per other ally, and a Path that holds no Promise before its first skill. */
function validateCounters(state: RadiantCombatState, member: RadiantBearer, own: RadiantOwnSignature): boolean {
  const capped = (value: number, cap: number, name: string) => {
    safe(value, name);
    if (value > cap) throw new Error(`Invalid radiant ${name}.`);
  };
  const clock = (value: number, name: string) => {
    safe(value, name, 1);
    if (value > radiantMaximumDuration) throw new Error('Radiant effect exceeds its maximum duration.');
  };
  if (own.kind === 'survey') {
    if (Object.keys(own).length !== 3 || (own.targetId === null) !== (own.count === 0)) throw new Error('Invalid radiant Survey.');
    capped(own.count, radiantSignatureCaps.survey, 'Survey');
    if (own.targetId !== null && (typeof own.targetId !== 'string' || enemy(state, own.targetId).hp === 0))
      throw new Error('Invalid radiant Survey.');
    return true;
  }
  if (own.kind === 'foundation') {
    if (Object.keys(own).length !== 2) throw new Error('Invalid radiant Foundation.');
    const foundation = own.foundation;
    if (foundation === null) return true;
    if (!foundation || typeof foundation !== 'object' || Object.keys(foundation).length !== 3) throw new Error('Invalid radiant Foundation.');
    safe(foundation.durability, 'Foundation durability', 1);
    safe(foundation.max, 'Foundation durability', 1);
    if (foundation.durability > foundation.max) throw new Error('Invalid radiant Foundation durability.');
    clock(foundation.remaining, 'Foundation clock');
    return true;
  }
  if (own.kind === 'unreturned') {
    if (Object.keys(own).length !== 2) throw new Error('Invalid radiant Unreturned.');
    capped(own.stored, rounded(radiantPassiveValues.unreturnedCap * member.stats.hp), 'Unreturned');
    return true;
  }
  if (own.kind === 'signal') {
    if (Object.keys(own).length !== 2 || !Array.isArray(own.signals)) throw new Error('Invalid radiant Signal.');
    const holders = own.signals.map(signal => signal?.holderId);
    if (new Set(holders).size !== holders.length) throw new Error('Invalid radiant Signal.');
    for (const signal of own.signals) {
      if (!signal || typeof signal !== 'object' || Object.keys(signal).length !== 3 || typeof signal.holderId !== 'string' ||
        bearer(state, signal.holderId) === member) throw new Error('Invalid radiant Signal.');
      finite(signal.value, 'Signal', Number.MIN_VALUE);
      safe(signal.remaining, 'Signal clock', 1);
      if (signal.remaining > radiantPassiveValues.signalTurns) throw new Error('Invalid radiant Signal clock.');
    }
    return true;
  }
  if (own.kind === 'path') {
    if (Object.keys(own).length !== 3 || (own.path !== null && own.path !== 'shelter' && own.path !== 'flourish') ||
      (own.path === null && own.count !== 0)) throw new Error('Invalid radiant Path.');
    capped(own.count, radiantSignatureCaps.promise, 'Promise');
    return true;
  }
  if (counterKinds.includes(own.kind as RadiantCounterKind)) {
    const counter = own as Extract<RadiantOwnSignature, { latch: boolean }>;
    if (Object.keys(counter).length !== 3 || typeof counter.latch !== 'boolean')
      throw new Error(`Invalid radiant ${counter.kind}.`);
    capped(counter.count, radiantSignatureCaps[counter.kind], counter.kind);
    return true;
  }
  return false;
}
/** Batch 2 ledgers: every enemy reference is a distinct living enemy; counts and clocks stay within their caps. */
function validateEnemyLedger(state: RadiantCombatState, member: RadiantBearer, own: RadiantOwnSignature): void {
  const livingEnemies = (ids: readonly string[], name: string) => {
    if (new Set(ids).size !== ids.length || ids.some(id => typeof id !== 'string' || enemy(state, id).hp === 0))
      throw new Error(`Invalid radiant ${name}.`);
  };
  const clock = (value: number, name: string) => {
    safe(value, name, 1);
    if (value > radiantMaximumDuration) throw new Error('Radiant effect exceeds its maximum duration.');
  };
  const count = (value: number, cap: number, name: string, minimum = 1) => {
    safe(value, name, minimum);
    if (value > cap) throw new Error(`Invalid radiant ${name}.`);
  };
  const shaped = (entries: unknown, keys: number, name: string): boolean => {
    if (!Array.isArray(entries) || entries.some(entry => !entry || typeof entry !== 'object' || Object.keys(entry).length !== keys))
      throw new Error(`Invalid radiant ${name}.`);
    return true;
  };
  if (own.kind === 'quarry') {
    if (Object.keys(own).length !== 3 || !Array.isArray(own.contributors)) throw new Error('Invalid radiant Quarry.');
    if (own.targetId !== null) livingEnemies([own.targetId], 'Quarry');
    if (new Set(own.contributors).size !== own.contributors.length || own.contributors.some(id =>
      id === member.loadout.id || !state.bearers.some(entry => entry.loadout.id === id)))
      throw new Error('Invalid radiant Quarry contributors.');
  } else if (own.kind === 'thorns') {
    if (Object.keys(own).length !== 2 || !shaped(own.traps, 4, 'Thorn Trap')) throw new Error('Invalid radiant Thorn Trap.');
    livingEnemies(own.traps.map(trap => trap.enemyId), 'Thorn Trap');
    for (const trap of own.traps) {
      safe(trap.charges, 'Thorn Trap charges', 1);
      clock(trap.remaining, 'Thorn Trap clock');
      finite(trap.value, 'Thorn Trap strike', Number.MIN_VALUE);
    }
  } else if (own.kind === 'combo') {
    if (Object.keys(own).length !== 3 || ![null, 1, 2].includes(own.last)) throw new Error('Invalid radiant Combo.');
    count(own.combo, radiantSignatureCaps.combo, 'Combo', 0);
  } else if (own.kind === 'refusal') {
    if (Object.keys(own).length !== 2 || !Array.isArray(own.spent) || new Set(own.spent).size !== own.spent.length ||
      own.spent.some(id => !state.bearers.some(entry => entry.loadout.id === id))) throw new Error('Invalid radiant Refusal.');
  } else if (own.kind === 'marks') {
    if (Object.keys(own).length !== 2 || !shaped(own.marks, 3, 'Fate-seared Mark')) throw new Error('Invalid radiant Fate-seared Mark.');
    livingEnemies(own.marks.map(mark => mark.enemyId), 'Fate-seared Mark');
    for (const mark of own.marks) {
      count(mark.stacks, radiantSignatureCaps.marks, 'Fate-seared Mark');
      clock(mark.remaining, 'Fate-seared Mark clock');
    }
  } else if (own.kind === 'incisions') {
    if (Object.keys(own).length !== 2 || !shaped(own.incisions, 2, 'Incision')) throw new Error('Invalid radiant Incision.');
    livingEnemies(own.incisions.map(entry => entry.enemyId), 'Incision');
    for (const entry of own.incisions) count(entry.stacks, radiantSignatureCaps.incisions, 'Incision');
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
    if (member.hp > ('loadout' in member ? radiantHealthBound(state, member) : Math.round(member.stats.hp)))
      throw new Error('Radiant health exceeds maximum.');
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
  const distinct = distinctElements(state.bearers.map(member => member.loadout));
  if ((state.conduitSeed !== undefined) !== usesConduitRng(state.bearers.map(member => member.loadout)) ||
    (state.conduitSeed !== undefined && (!Number.isSafeInteger(state.conduitSeed) || state.conduitSeed < 0 || state.conduitSeed > 0xffffffff)))
    throw new Error('Invalid radiant Conduit RNG stream.');
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
        gauge.elementId !== radiantStarterKits[member.loadout.starter].elementId ||
        gauge.capacity !== gaugeExtras(member.loadout, distinct).capacity ||
        gauge.flareEfficiency !== gaugeExtras(member.loadout, distinct).flareEfficiency)
      throw new Error('Radiant Gauge member mismatch.');
    if (member.phaseLoss !== undefined) {
      safe(member.phaseLoss, 'Granite Hourglass loss', 1);
      if (!(radiantEquipmentAmount(member.loadout, 'phase-shield') > 0)) throw new Error('Invalid radiant Granite Hourglass ledger.');
    }
    if (member.stasis !== undefined && (!['current', 'next'].includes(member.stasis) ||
      !(radiantEquipmentAmount(member.loadout, 'last-block') > 0))) throw new Error('Invalid radiant Stasis Reliquary state.');
    if (member.reflected !== undefined) {
      safe(member.reflected, 'Mercy Reflector ledger', 1);
      if (!(radiantEquipmentAmount(member.loadout, 'shield-reflect') > 0)) throw new Error('Invalid radiant Mercy Reflector ledger.');
    }
    validateCategories(state, member.buffs, allyCategories);
    validateSignatures(state, member);
  }
  if (state.flared !== undefined && (!Array.isArray(state.flared) || !state.flared.length ||
    new Set(state.flared).size !== state.flared.length || state.flared.some(id => {
      const owner = state.bearers.find(member => member.loadout.id === id);
      return !owner || !(radiantEquipmentAmount(owner.loadout, 'flare-round-heal') + radiantEquipmentAmount(owner.loadout, 'flare-round-charge') > 0);
    }))) throw new Error('Invalid radiant Stillhour Carillon ledger.');
  let paid = 0, budget = 0;
  for (const member of state.enemies) {
    if (member.elementId !== null && !isCombatElement(member.elementId)) throw new Error('Invalid enemy combat element.');
    if (member.marks !== undefined) {
      if (!Array.isArray(member.marks) || !member.marks.length ||
        new Set(member.marks.map(mark => mark?.casterId)).size !== member.marks.length) throw new Error('Invalid radiant enemy marks.');
      for (const mark of member.marks) {
        const owner = mark && typeof mark === 'object' && Object.keys(mark).length === 2
          ? state.bearers.find(entry => entry.loadout.id === mark.casterId) : undefined;
        if (!owner || !(radiantEquipmentAmount(owner.loadout, 'skill-mark') > 0)) throw new Error('Invalid radiant enemy mark.');
        safe(mark.remaining, 'mark clock', 1);
        if (mark.remaining > radiantOmnicRules.markTurns) throw new Error('Invalid radiant enemy mark clock.');
      }
    }
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
        seed: null, cover: null, burnUp: null, signature: startingSignature(loadout.starter) };
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
      baseCost: radiantStarterKits[loadout.starter].baseCost, charge: 0, living: true, ...gaugeExtras(loadout, distinctElements(loadouts)) })) },
    phase: 'player', round: 1, acted: [], skilled: [], enemyActed: [], gearTriggered: [],
    chargeSeed, ...(usesConduitRng(loadouts) ? { conduitSeed: initialConduitSeed(chargeSeed) } : {}),
    nextShieldId: 1, currencyEarned: 0,
  };
  for (const member of state.gauge.members) {
    addRadiantPersonalCharge(member, rounded(combatAmount(state, bearer(state, member.id), 'start-charge')));
  }
  // D-493 Horizon Heartcase: bearers begin at their (possibly raised) maximum Health.
  for (const member of state.bearers) member.hp = maximumHealth(state, member);
  validateRadiantCombat(state);
  return state;
}
/** D-493 C4/C8: static Conduit capacity and Convergent Light Skill Efficiency, stored only when present. */
function gaugeExtras(loadout: RadiantLoadout, distinct: boolean): { capacity?: number; flareEfficiency?: number } {
  const capacity = Math.min(radiantCapacityCap, radiantEquipmentAmount(loadout, 'capacity'));
  const flareEfficiency = radiantLoadoutSkillStats(loadout, 'flare', distinct).skillEfficiency;
  return { ...(capacity > 0 ? { capacity } : {}), ...(flareEfficiency > 0 ? { flareEfficiency } : {}) };
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
  const effective = Math.max(0, Math.min(offered, maximumHealth(state, owner) - owner.hp));
  owner.hp += effective;
  events.push({ type: 'health-mote', enemyId: target.id, bearerId: owner.loadout.id, offered, effective });
}
/** D-493 kinds on one bearer's Conduits that change another squad member's amounts. */
const squadSourceKinds: readonly RadiantConduitEffect[] = [
  'enemy-defense', 'ally-guard', 'squad-hp', 'squad-attack', 'squad-gain', 'squad-defense', 'ally-defense-share',
  'burn-ally-direct', 'skill-shield-direct', 'skill-shield-brace', 'shielded-restore-power', 'skill-mark', 'burning-attack',
  'weaken-ally-efficiency',
];
/** D-492: Conduit sources that can change amounts for this bearer (its gear, its Master, the living same-element Leader). */
function gearSources(state: RadiantCombatState, holder: RadiantBearer): RadiantGearSource[] {
  const id = holder.loadout.id, seen = new Set<string>(), sources: RadiantGearSource[] = [];
  for (const slot of holder.loadout.gear ?? []) if (slot !== null && !seen.has(slot.id)) {
    seen.add(slot.id);
    sources.push({ kind: 'gear', bearerId: id, conduitId: slot.id });
  }
  if (holder.loadout.masterId !== null) sources.push({ kind: 'master', bearerId: id });
  if (leaderEffects(state, holder).length > 0) sources.push({ kind: 'leader', bearerId: state.bearers[0].loadout.id });
  // D-493 C14: another squad member's enemy-Defense aura also changes this bearer's damage.
  for (const member of state.bearers) if (member !== holder) for (const slot of member.loadout.gear ?? [])
    if (slot !== null && radiantConduitPrimitives(slot).some(entry => squadSourceKinds.includes(entry.kind)))
      sources.push({ kind: 'gear', bearerId: member.loadout.id, conduitId: slot.id });
  return sources;
}
/** D-492: split `|final - without all Conduits|` among sources in proportion to each one's marginal effect.
 * `compute` must be a pure recompute of `final` (no state writes, no RNG); failures only drop the bookkeeping. */
function attribute(
  state: RadiantCombatState, holder: RadiantBearer, final: number, compute: () => number, scale = 1,
): RadiantBoost[] | undefined {
  if (excludedSources) return undefined;
  const sources = gearSources(state, holder);
  if (sources.length === 0) return undefined;
  const without = (keys: string[]): number => {
    excludedSources = new Set(keys);
    try { return compute(); } finally { excludedSources = null; }
  };
  try {
    const total = Math.round(Math.abs(final - without(sources.map(gearKey))) * scale);
    if (!(total > 0)) return undefined;
    const margins = sources.map(source => Math.abs(final - without([gearKey(source)])));
    const sum = margins.reduce((a, b) => a + b, 0);
    if (!(sum > 0)) return undefined;
    const shares = margins.map(margin => Math.floor(total * margin / sum));
    let left = total - shares.reduce((a, b) => a + b, 0);
    const order = margins.map((margin, i) => ({ i, rest: total * margin / sum - shares[i] })).sort((a, b) => b.rest - a.rest);
    for (const { i } of order) { if (left <= 0) break; shares[i]++; left--; }
    const boosts = sources.map((source, i) => ({ source, amount: shares[i] })).filter(entry => entry.amount > 0);
    return boosts.length > 0 ? boosts : undefined;
  } catch {
    excludedSources = null;
    return undefined;
  }
}
/** D-492: the share of a total's boosts carried by hit `hit` of `hits` (same floor/remainder split as the damage). */
function hitBoosts(boosts: RadiantBoost[] | undefined, hit: number, hits: number): RadiantBoost[] | undefined {
  if (!boosts) return undefined;
  const part = boosts.map(entry => ({ source: entry.source,
    amount: Math.floor(entry.amount / hits) + (hit === hits - 1 ? entry.amount % hits : 0) })).filter(entry => entry.amount > 0);
  return part.length > 0 ? part : undefined;
}
function packet(
  state: RadiantCombatState, events: RadiantCombatEvent[], target: RadiantBearer | RadiantEnemy,
  source: RadiantSource, origin: 'direct' | 'periodic' | 'generated', offered: number, hitCharge?: RadiantHitCharge,
  redirected = false, boosts?: RadiantBoost[],
): { healthLoss: number; absorbed: number; shields: { source: RadiantSource; amount: number }[] } {
  safe(offered, 'damage packet', 1);
  living(target.hp);
  let remaining = offered;
  const shields: { source: RadiantSource; amount: number }[] = [];
  const enemyHit = 'loadout' in target && source.kind === 'enemy' && origin === 'direct';
  // D-493 Pale Bulwark Diadem (C15): enemy hits remove less of this bearer's Shield per point of damage.
  const keep = enemyHit ? 1 - Math.min(radiantShieldGuardCap, combatAmount(state, target as RadiantBearer, 'shield-guard')) : 1;
  const hadShield = target.shields.length > 0;
  for (const shield of target.shields) {
    const amount = Math.min(shield.remaining, Math.ceil(remaining * keep));
    if (amount > 0) shields.push({ source: { ...shield.source }, amount });
    shield.remaining -= amount;
    remaining -= Math.min(remaining, Math.ceil(amount / keep));
  }
  target.shields = target.shields.filter(shield => shield.remaining > 0);
  // D-493 Stasis Reliquary: when an enemy hit breaks this bearer's last Shield, a Conduit roll may block the rest.
  if (enemyHit && hadShield && target.shields.length === 0 && remaining > 0 && 'loadout' in target &&
    target.stasis === undefined && combatAmount(state, target, 'last-block') > 0 &&
    rollConduit(state) < combatAmount(state, target, 'last-block')) {
    remaining = 0;
    target.stasis = 'current';
  }
  let healthLoss = Math.min(target.hp, remaining);
  const absorbed = shields.reduce((sum, entry) => sum + entry.amount, 0);
  // Ozriel's Refusal: while he lives, each ally survives one lethal enemy hit per encounter with 1 Health.
  const refusal = 'loadout' in target && source.kind === 'enemy' && healthLoss > 0 && healthLoss === target.hp
    ? refuser(state, target) : undefined;
  if (refusal) healthLoss = target.hp - 1;
  target.hp -= healthLoss;
  // D-493 Granite Hourglass: remember Health lost to direct enemy damage this enemy phase.
  if (enemyHit && healthLoss > 0 && 'loadout' in target && combatAmount(state, target, 'phase-shield') > 0) {
    target.phaseLoss = (target.phaseLoss ?? 0) + healthLoss;
    safe(target.phaseLoss, 'Granite Hourglass loss', 1);
  }
  const targetId = 'loadout' in target ? target.loadout.id : target.id;
  events.push({ type: 'damage', source, targetId, origin, offered, absorbed, healthLoss, shields,
    ...(redirected ? { redirected: true as const } : {}), ...(boosts ? { boosts } : {}) });
  if (refusal?.signature?.kind === 'refusal') {
    refusal.signature.spent.push(targetId);
    events.push({ type: 'signature', bearerId: refusal.loadout.id, op: 'refusal', holderId: targetId, amount: target.hp });
  }
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
        gaugeGain(state, bearer(state, source.bearerId)));
      hitCharge.bonusRolls += drop.bonusRolls;
      hitCharge.bonusOffered += drop.bonusOffered;
      gaugeDrop(state, events, target.id, source.bearerId, 'hit', drop.amount);
    }
  }
  if (target.hp === 0) {
    events.push({ type: 'defeated', targetId });
    if ('currency' in target) { healthMote(state, events, target, source); releaseEnemySignatures(state, events, targetId); }
    else if (target.signature?.kind === 'foundation') target.signature.foundation = null;
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
  const base = snapshot;
  if (native(source)) snapshot *= 1 + combatAmount(state, bearer(state, source.bearerId), 'healing');
  finite(snapshot, 'healing snapshot');
  if (target.hp === 0) return 0;
  const offered = rounded(snapshot), effective = Math.max(0, Math.min(offered, healthCap(state, target) - target.hp));
  target.hp += effective;
  const boosts = native(source) && effective > 0 ? attribute(state, bearer(state, source.bearerId), offered,
    () => rounded(base * (1 + combatAmount(state, bearer(state, source.bearerId), 'healing'))), effective / offered) : undefined;
  events.push({ type: 'heal', source, targetId: 'loadout' in target ? target.loadout.id : target.id,
    snapshot, offered, effective, ...(boosts ? { boosts } : {}) });
  return effective;
}
function shield(
  state: RadiantCombatState, events: RadiantCombatEvent[], target: RadiantBearer,
  source: RadiantSource, magnitude: number,
): void {
  const shielded = () => rounded(magnitude *
    (native(source) ? 1 + combatAmount(state, bearer(state, source.bearerId), 'shielding') : 1));
  const amount = shielded();
  if (amount === 0 || target.hp === 0) return;
  const shieldId = state.nextShieldId++;
  safe(state.nextShieldId, 'shield serial', 1);
  target.shields.push({ id: shieldId, source, remaining: amount });
  const boosts = native(source) ? attribute(state, bearer(state, source.bearerId), amount, shielded) : undefined;
  events.push({ type: 'shield', source, targetId: target.loadout.id, amount, shieldId, ...(boosts ? { boosts } : {}) });
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
    if (capped > entry.magnitude) {
      // D-493 Cinder Testament: a stronger Burn from another caster replaces the bonus; the same caster keeps it.
      const owner = (value: RadiantSource) => value.kind === 'enemy' ? `enemy:${value.enemyId}` : value.bearerId;
      if (entry.amp !== undefined && owner(entry.source) !== owner(source)) delete entry.amp;
      entry.magnitude = capped; entry.source = structuredClone(source);
    }
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
    const cap = maximumHealth(state, ally), missing = (cap - ally.hp) / cap;
    if (selected === undefined || missing > largest) { selected = ally; largest = missing; }
  }
  return selected;
}
function nextAlly(state: RadiantCombatState, actor: RadiantBearer): RadiantBearer | undefined {
  const start = state.bearers.indexOf(actor);
  const ordered = [...state.bearers.slice(start + 1), ...state.bearers.slice(0, start)];
  return ordered.find(member => member.hp > 0 && !state.acted.includes(member.loadout.id));
}
function cleanse(events: RadiantCombatEvent[], target: RadiantBearer): boolean {
  const weaken = target.buffs.find(effect => effect.category === 'weaken');
  if (!weaken) return false;
  target.buffs.splice(target.buffs.indexOf(weaken), 1);
  events.push({ type: 'status', targetId: target.loadout.id, status: 'weaken-removed',
    source: weaken.source, magnitude: weaken.magnitude, remaining: 0 });
  return true;
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
    case 'after-edge': return actor.signature?.kind === 'combo' && actor.signature.last === 1;
    case 'after-rupture': return actor.signature?.kind === 'combo' && actor.signature.last === 2;
    case 'combo-3': return actor.signature?.kind === 'combo' && actor.signature.combo >= 3;
    case 'no-foundation': return actor.signature?.kind === 'foundation' && actor.signature.foundation === null;
    case 'tune': return radiantBeat(state.round) === 0;
    case 'rise': return radiantBeat(state.round) === 1;
    case 'crescendo': return radiantBeat(state.round) === 2;
    case 'crosscut-2': return actor.signature?.kind === 'crosscut' && actor.signature.count >= 2;
    case 'shelter-or-no-path': return actor.signature?.kind === 'path' && actor.signature.path !== 'flourish';
    case 'flourish': return actor.signature?.kind === 'path' && actor.signature.path === 'flourish';
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
  const amount = rounded(radiantPassiveValues.tideRefund * gaugeGain(state, holder));
  addPassiveCharge(state, events, holder.loadout.id, amount);
  events.push({ type: 'signature', bearerId: caster.loadout.id, op: 'refund', holderId: holder.loadout.id, amount });
}
/** A defeated enemy leaves every signature ledger: lodged Shuriken return to Elise without damage, Rosetta's
 * Quarry clears, and Thorn Traps, Fate-seared Marks and Incisions on it disappear. */
function releaseEnemySignatures(state: RadiantCombatState, events: RadiantCombatEvent[], enemyId: string): void {
  for (const member of state.bearers) {
    const own = member.signature;
    if (own?.kind === 'shuriken' && own.lodged.includes(enemyId)) {
      const count = own.lodged.filter(id => id === enemyId).length;
      own.lodged = own.lodged.filter(id => id !== enemyId);
      own.held += count;
      events.push({ type: 'signature', bearerId: member.loadout.id, op: 'return', holderId: enemyId, amount: own.held });
    } else if (own?.kind === 'quarry' && own.targetId === enemyId) own.targetId = null;
    else if (own?.kind === 'thorns') own.traps = own.traps.filter(trap => trap.enemyId !== enemyId);
    else if (own?.kind === 'marks') own.marks = own.marks.filter(mark => mark.enemyId !== enemyId);
    else if (own?.kind === 'incisions') own.incisions = own.incisions.filter(entry => entry.enemyId !== enemyId);
    else if (own?.kind === 'survey' && own.targetId === enemyId) { own.targetId = null; own.count = 0; }
  }
}
/** The living Ozriel whose Refusal still covers `target` this encounter. */
function refuser(state: RadiantCombatState, target: RadiantBearer): RadiantBearer | undefined {
  return state.bearers.find(member => member.hp > 0 && member.signature?.kind === 'refusal' &&
    !member.signature.spent.includes(target.loadout.id));
}
/** Damage taken from allies' direct hits: Expose, plus Fate-seared Marks and Incisions while their owner lives. */
function vulnerability(state: RadiantCombatState, target: RadiantEnemy): number {
  let taken = exposure(target);
  for (const member of state.bearers) {
    const own = member.signature;
    if (member.hp === 0) continue;
    if (own?.kind === 'marks')
      taken += (own.marks.find(mark => mark.enemyId === target.id)?.stacks ?? 0) * radiantPassiveValues.markTaken;
    else if (own?.kind === 'incisions')
      taken += (own.incisions.find(entry => entry.enemyId === target.id)?.stacks ?? 0) * radiantPassiveValues.incisionTaken;
  }
  return taken;
}
/** Signature stacks that `perStack` powers add: Rosetta's contributors, Crinso's Combo, Kaelith's Incisions on the target. */
function signatureStacks(actor: RadiantBearer, primary: RadiantEnemy | undefined): number {
  const own = actor.signature;
  if (own?.kind === 'quarry') return own.contributors.length;
  if (own?.kind === 'combo') return own.combo;
  if (own?.kind === 'incisions') return own.incisions.find(entry => entry.enemyId === primary?.id)?.stacks ?? 0;
  if (own?.kind === 'path') return own.count;
  return counterOf(own)?.count ?? 0;
}
/** Spend one Thorn Trap charge; an empty trap is removed. */
function spendTrap(events: RadiantCombatEvent[], owner: RadiantBearer, trap: RadiantThornTrap): void {
  const own = owner.signature;
  if (own?.kind !== 'thorns') return;
  trap.charges--;
  if (trap.charges === 0) own.traps = own.traps.filter(entry => entry !== trap);
  events.push({ type: 'signature', bearerId: owner.loadout.id, op: 'trap-strike', holderId: trap.enemyId, amount: trap.charges });
}
/** Forbidden Garden: an enemy action that damaged an ally triggers its Thorn Trap once, while Thornia lives. */
function springThornTraps(state: RadiantCombatState, events: RadiantCombatEvent[], attacker: RadiantEnemy): void {
  for (const member of state.bearers) {
    const own = member.signature;
    if (own?.kind !== 'thorns' || member.hp === 0 || attacker.hp === 0) continue;
    const trap = own.traps.find(entry => entry.enemyId === attacker.id);
    if (!trap) continue;
    spendTrap(events, member, trap);
    strike(state, events, member, attacker, { kind: 'passive', bearerId: member.loadout.id }, trap.value);
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
  const offered = () => radiantDirectDamage(effectiveRadiantStats(state, actor.loadout.id).attack,
    gearDefense(state, actor, target.stats.defense),
    coefficient, (1 + vulnerability(state, target)) * outgoingDamageMultiplier(state, actor, target));
  const amount = offered();
  packet(state, events, target, source, 'direct', amount, undefined, false, attribute(state, actor, amount, offered));
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
/** A counter signature (Heat, Stillness, Season, Current, Tension, Cadence, Crosscut, Load, Severance, Interval), if any. */
function counterOf(own: RadiantOwnSignature | null): Extract<RadiantOwnSignature, { latch: boolean }> | undefined {
  return own && counterKinds.includes(own.kind as RadiantCounterKind)
    ? own as Extract<RadiantOwnSignature, { latch: boolean }> : undefined;
}
/** Pre-damage signature modifiers: Survey that Nerithe's skill will spend ignores part of its enemy's Defense;
 * Myrthen's Harvest adds +35% damage and 20% Defense ignore. */
function signatureSurge(
  actor: RadiantBearer, clauses: readonly Extract<RadiantKitEffect, { kind: 'signature' }>[], primary: RadiantEnemy | undefined,
): { ignore: number; bonus: number } {
  const own = actor.signature;
  let ignore = 0;
  if (own?.kind === 'survey' && own.count > 0 && primary && own.targetId === primary.id)
    for (const clause of clauses) {
      if (clause.op === 'spend-survey') ignore += clause.value ?? 0;
      else if (clause.op === 'spend-all-survey') ignore += (clause.value ?? 0) * own.count;
    }
  if (own?.kind === 'season' && own.count === 2)
    return { ignore: ignore + radiantPassiveValues.harvestIgnore, bonus: radiantPassiveValues.harvestBonus };
  return { ignore, bonus: 0 };
}
/** Load-Bearing Will: a living Orvella's Foundation absorbs 20% of each direct enemy hit on an ally (Orvella included),
 * before Cover and Shields, and loses that much durability. Returns the absorbed amount. */
function foundationAbsorb(state: RadiantCombatState, events: RadiantCombatEvent[], target: RadiantBearer, amount: number): number {
  const orvella = state.bearers.find(member => member.hp > 0 && member.signature?.kind === 'foundation' &&
    member.signature.foundation !== null);
  const own = orvella?.signature;
  if (!orvella || own?.kind !== 'foundation' || !own.foundation) return 0;
  // Math.round(20% of a whole hit) is always less than the hit, so at least 1 damage passes on.
  const absorbed = Math.min(own.foundation.durability, Math.round(amount * radiantPassiveValues.foundationShare));
  if (absorbed <= 0) return 0;
  own.foundation.durability -= absorbed;
  events.push({ type: 'signature', bearerId: orvella.loadout.id, op: 'foundation-absorb', holderId: target.loadout.id,
    amount: own.foundation.durability });
  if (own.foundation.durability === 0) own.foundation = null;
  return absorbed;
}
/** Held Stillness: each enemy hit on Solenne spends 1 Stillness to reduce that hit by 20% before Shields. */
function holdStillness(events: RadiantCombatEvent[], target: RadiantBearer, amount: number): number {
  const own = target.signature;
  if (own?.kind !== 'stillness' || own.count === 0) return amount;
  own.count--;
  events.push({ type: 'signature', bearerId: target.loadout.id, op: 'stillness', amount: own.count });
  return amount - Math.round(amount * radiantPassiveValues.stillnessReduction);
}
/** Banked Heat / Tension Held / Weight of the Watch: +1 the first time each enemy phase an enemy hit damages the
 * holder's Health or Shield. */
function hitGain(events: RadiantCombatEvent[], holder: RadiantBearer): void {
  const own = holder.signature;
  if ((own?.kind !== 'heat' && own?.kind !== 'tension' && own?.kind !== 'load') || own.latch) return;
  own.latch = true;
  own.count = Math.min(radiantSignatureCaps[own.kind], own.count + 1);
  events.push({ type: 'signature', bearerId: holder.loadout.id, op: own.kind, amount: own.count });
}
/** Nothing Beyond These Gates / None Left in the Dark: active Burn boosts (one per caster) add to Burn ticks from allies. */
function burnBoost(state: RadiantCombatState, source: RadiantSource): number {
  if (source.kind === 'enemy') return 0;
  return state.bearers.reduce((sum, member) => sum + (member.burnUp?.value ?? 0), 0);
}
/** Names Still Carried: while Maerion lives, Health an ally loses to a direct enemy hit is stored as Unreturned. */
function carryUnreturned(state: RadiantCombatState, events: RadiantCombatEvent[], healthLoss: number): void {
  const maerion = livingStarter(state, 'maerion'), own = maerion?.signature;
  if (!maerion || own?.kind !== 'unreturned' || healthLoss <= 0) return;
  const stored = Math.min(rounded(radiantPassiveValues.unreturnedCap * maerion.stats.hp), own.stored + healthLoss);
  if (stored === own.stored) return;
  own.stored = stored;
  events.push({ type: 'signature', bearerId: maerion.loadout.id, op: 'unreturned', amount: stored });
}
/** An Interval Without Surrender: an attacking enemy still Weakened by Serapha's skill or Flare gives her 1 Interval,
 * once per enemy phase, while she lives. */
function intervalGain(state: RadiantCombatState, events: RadiantCombatEvent[], attacker: RadiantEnemy): void {
  const serapha = livingStarter(state, 'serapha'), own = serapha?.signature;
  if (!serapha || own?.kind !== 'interval' || own.latch) return;
  const weaken = attacker.debuffs.find(effect => effect.category === 'weaken');
  if (!weaken || weaken.source.kind === 'enemy' || weaken.source.bearerId !== serapha.loadout.id) return;
  own.latch = true;
  gainCounter(events, serapha);
}
/** Someone Still Beyond the Walls: the holder's damaging skill or Flare spends its Signal for +value damage. */
function spendSignal(state: RadiantCombatState, events: RadiantCombatEvent[], holder: RadiantBearer): number {
  for (const member of state.bearers) {
    const own = member.signature;
    if (own?.kind !== 'signal') continue;
    const signal = own.signals.find(entry => entry.holderId === holder.loadout.id);
    if (!signal) continue;
    own.signals = own.signals.filter(entry => entry !== signal);
    events.push({ type: 'signature', bearerId: member.loadout.id, op: 'signal', holderId: holder.loadout.id, amount: 0 });
    return signal.value;
  }
  return 0;
}
/** +1 to a bearer's counter, within its cap. */
function gainCounter(events: RadiantCombatEvent[], holder: RadiantBearer): void {
  const counter = counterOf(holder.signature);
  if (!counter) return;
  counter.count = Math.min(radiantSignatureCaps[counter.kind], counter.count + 1);
  events.push({ type: 'signature', bearerId: holder.loadout.id, op: counter.kind, amount: counter.count });
}
/** Normal Attack Passives that need a landed hit: Nerithe's Uncharted Current, Neralis's Returning Current,
 * Varkhel's Tension Held and Seravelle's Convoy Cadence (the first ally Normal hit each turn). */
function normalPassives(
  state: RadiantCombatState, events: RadiantCombatEvent[], actor: RadiantBearer, targetId: string, hits: number,
): void {
  const own = actor.signature, id = actor.loadout.id;
  if (hits === 0) return;
  if (own?.kind === 'current' || own?.kind === 'tension') gainCounter(events, actor);
  const seravelle = state.bearers.find(member => member.hp > 0 && member.signature?.kind === 'cadence' && !member.signature.latch);
  if (seravelle?.signature?.kind === 'cadence') {
    seravelle.signature.latch = true;
    gainCounter(events, seravelle);
  }
  if (own?.kind === 'survey') {
    addPassiveCharge(state, events, id, rounded(radiantPassiveValues.surveyFill * gaugeGain(state, actor)));
    if (enemy(state, targetId).hp > 0) {
      own.count = own.targetId === targetId ? Math.min(radiantSignatureCaps.survey, own.count + 1) : 1;
      own.targetId = targetId;
      events.push({ type: 'signature', bearerId: id, op: 'survey', holderId: targetId, amount: own.count });
    }
  }
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
      case 'quarry':
        // Golden Thorn Volley marks its surviving target as Rosetta's Quarry.
        if (own?.kind !== 'quarry' || !primary || primary.hp === 0) break;
        own.targetId = primary.id;
        events.push({ type: 'signature', bearerId: id, op: 'quarry', holderId: primary.id, amount: own.contributors.length });
        break;
      case 'heal-contributors':
        // Rose Beyond the Sun heals each contributor this turn (N7 basis).
        if (own?.kind !== 'quarry') break;
        for (const ally of own.contributors.map(entry => bearer(state, entry)).filter(entry => entry.hp > 0))
          heal(state, events, ally, source, value * input.effectScale * input.skill.skillPower * ally.stats.hp);
        break;
      case 'thorn-trap': {
        // One trap per enemy: a new trap keeps the stronger strike, the larger charge count and the longer clock.
        if (own?.kind !== 'thorns') break;
        const remaining = Math.min(radiantMaximumDuration, (clause.turns ?? 1) + input.skill.skillDuration);
        const strength = value * input.damageScale * input.skill.skillPower, charges = clause.charges ?? 1;
        for (const target of (clause.to === 'all-enemies' ? state.enemies : primary ? [primary] : []).filter(entry => entry.hp > 0)) {
          const trap = own.traps.find(entry => entry.enemyId === target.id);
          if (trap) Object.assign(trap, { charges: Math.max(trap.charges, charges),
            remaining: Math.max(trap.remaining, remaining), value: Math.max(trap.value, strength) });
          else own.traps.push({ enemyId: target.id, charges, remaining, value: strength });
          events.push({ type: 'signature', bearerId: id, op: 'trap', holderId: target.id,
            amount: own.traps.find(entry => entry.enemyId === target.id)!.charges });
        }
        break;
      }
      case 'spend-trap': {
        // Shadow Rose Cleave spends 1 charge of the target's trap for an extra strike.
        if (own?.kind !== 'thorns' || !primary || primary.hp === 0) break;
        const trap = own.traps.find(entry => entry.enemyId === primary.id);
        if (!trap) break;
        spendTrap(events, actor, trap);
        strike(state, events, actor, primary, source, value * input.damageScale * input.skill.skillPower);
        break;
      }
      case 'spend': {
        // Blossoming Cataclysm spends all Combo; batch 3 skills spend all of their counter after `perStack` read it.
        if (own?.kind === 'combo' && own.combo > 0) {
          own.combo = 0;
          events.push({ type: 'signature', bearerId: id, op: 'combo', amount: 0 });
        }
        // Every Orbit Bears a Future spends all Promise and keeps the current path.
        if (own?.kind === 'path' && own.count > 0) {
          own.count = 0;
          events.push({ type: 'signature', bearerId: id, op: 'promise', amount: 0 });
        }
        const counter = counterOf(own);
        if (!counter || counter.count === 0) break;
        counter.count = 0;
        events.push({ type: 'signature', bearerId: id, op: counter.kind, amount: 0 });
        break;
      }
      case 'gain': {
        // Circle of Repose: Solenne gains Stillness.
        const counter = counterOf(own);
        if (!counter) break;
        counter.count = Math.min(radiantSignatureCaps[counter.kind], counter.count + value);
        events.push({ type: 'signature', bearerId: id, op: counter.kind, amount: counter.count });
        break;
      }
      case 'spend-survey':
      case 'spend-all-survey':
        // Meridian Break spends 1 Survey, Ocean Beyond the Map all of it; their Defense ignore applied before the damage.
        if (own?.kind !== 'survey' || own.count === 0 || !primary || own.targetId !== primary.id) break;
        own.count = clause.op === 'spend-survey' ? own.count - 1 : 0;
        if (own.count === 0) own.targetId = null;
        events.push({ type: 'signature', bearerId: id, op: 'survey', holderId: primary.id, amount: own.count });
        break;
      case 'move-survey':
        // Fold the Sea moves all Survey to the current target.
        if (own?.kind !== 'survey' || own.count === 0 || !primary || primary.hp === 0 || own.targetId === primary.id) break;
        own.targetId = primary.id;
        events.push({ type: 'signature', bearerId: id, op: 'survey', holderId: primary.id, amount: own.count });
        break;
      case 'foundation': {
        // Raise the Faultline / Worldweight Citadel: a new Foundation replaces the old one at full durability.
        if (own?.kind !== 'foundation') break;
        const durability = rounded(value * input.effectScale * input.skill.skillPower * actor.stats.hp);
        if (durability < 1) break;
        own.foundation = { durability, max: durability,
          remaining: Math.min(radiantMaximumDuration, (clause.turns ?? 1) + input.skill.skillDuration) };
        events.push({ type: 'signature', bearerId: id, op: 'foundation', amount: durability });
        break;
      }
      case 'repair-foundation': {
        // Keystone Reversal repairs the Foundation, up to the durability it was created with.
        if (own?.kind !== 'foundation' || !own.foundation) break;
        const foundation = own.foundation;
        foundation.durability = Math.min(foundation.max,
          foundation.durability + rounded(value * input.effectScale * input.skill.skillPower * actor.stats.hp));
        events.push({ type: 'signature', bearerId: id, op: 'foundation', amount: foundation.durability });
        break;
      }
      case 'spend-foundation': {
        // Worldweight Citadel spends the Foundation: an exact strike on each enemy of `value` x its remaining durability.
        if (own?.kind !== 'foundation' || !own.foundation) break;
        const amount = rounded(own.foundation.durability * value * input.damageScale);
        own.foundation = null;
        events.push({ type: 'signature', bearerId: id, op: 'foundation', amount: 0 });
        if (amount > 0) for (const target of enemyTargets.filter(entry => entry.hp > 0))
          packet(state, events, target, source, 'direct', amount, hitCharge);
        break;
      }
      case 'burn-up': {
        // Nothing Beyond These Gates / None Left in the Dark: Burn ticks from all allies deal +value; the caster keeps one
        // boost, with the stronger value and the longer clock.
        const boost = value * input.effectScale * input.skill.skillPower;
        const remaining = Math.min(radiantMaximumDuration, (clause.turns ?? 1) + input.skill.skillDuration);
        actor.burnUp = { value: Math.max(boost, actor.burnUp?.value ?? 0), remaining: Math.max(remaining, actor.burnUp?.remaining ?? 0) };
        events.push({ type: 'signature', bearerId: id, op: 'burn-up', amount: actor.burnUp.value });
        break;
      }
      case 'signal':
        // Keep the Last Beacon / None Left in the Dark: one Signal per other ally; reapplying keeps the stronger value and
        // refreshes the clock (through the end of the next player turn).
        if (own?.kind !== 'signal') break;
        for (const ally of allies(clause.to)) {
          if (ally === actor) continue;
          const strength = value * input.effectScale * input.skill.skillPower;
          const previous = own.signals.find(entry => entry.holderId === ally.loadout.id);
          const signal = { holderId: ally.loadout.id, value: Math.max(strength, previous?.value ?? 0),
            remaining: radiantPassiveValues.signalTurns };
          own.signals = [...own.signals.filter(entry => entry !== previous), signal];
          events.push({ type: 'signature', bearerId: id, op: 'signal', holderId: ally.loadout.id, amount: signal.value });
        }
        break;
      case 'spend-unreturned':
        // A Place on the Ferry / Bring Every Name Home: the heal already carried Unreturned (read before the cast).
        if (own?.kind !== 'unreturned' || own.stored === 0) break;
        own.stored = 0;
        events.push({ type: 'signature', bearerId: id, op: 'unreturned', amount: 0 });
        break;
      case 'path': {
        // Futures Given Freely: Skill 1 enters Shelter (1), Skill 2 Flourish (2); switching paths grants 1 Promise.
        if (own?.kind !== 'path') break;
        const next = value === 1 ? 'shelter' : 'flourish';
        if (own.path !== null && own.path !== next) {
          own.count = Math.min(radiantSignatureCaps.promise, own.count + 1);
          events.push({ type: 'signature', bearerId: id, op: 'promise', amount: own.count });
        }
        own.path = next;
        events.push({ type: 'signature', bearerId: id, op: 'path', amount: value });
        break;
      }
      case 'fate-mark': {
        // Severed Prophecy: stacks add up to 5; a new stack refreshes the 2-turn clock.
        if (own?.kind !== 'marks') break;
        const remaining = Math.min(radiantMaximumDuration, radiantPassiveValues.markTurns + input.skill.skillDuration);
        for (const target of (clause.to === 'all-enemies' ? state.enemies : primary ? [primary] : []).filter(entry => entry.hp > 0)) {
          let mark = own.marks.find(entry => entry.enemyId === target.id);
          if (!mark) own.marks.push(mark = { enemyId: target.id, stacks: 0, remaining });
          mark.stacks = Math.min(radiantSignatureCaps.marks, mark.stacks + value);
          mark.remaining = Math.max(mark.remaining, remaining);
          events.push({ type: 'signature', bearerId: id, op: 'mark', holderId: target.id, amount: mark.stacks });
        }
        break;
      }
      case 'consume-incisions':
        // Glass Meridian consumes the Incisions on its target after its damage.
        if (own?.kind !== 'incisions' || !primary || !own.incisions.some(entry => entry.enemyId === primary.id)) break;
        own.incisions = own.incisions.filter(entry => entry.enemyId !== primary.id);
        events.push({ type: 'signature', bearerId: id, op: 'incision', holderId: primary.id, amount: 0 });
        break;
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
/** End of the enemy phase: Cover, Burn boost, Signal, Thorn Trap and Fate-seared Mark clocks tick; Cyclones count down
 * and release at 0. */
function tickSignatures(state: RadiantCombatState, events: RadiantCombatEvent[]): void {
  for (const member of state.bearers) {
    if (member.cover && --member.cover.remaining <= 0) member.cover = null;
    if (member.burnUp && --member.burnUp.remaining <= 0) member.burnUp = null;
    const own = member.signature;
    if (own?.kind === 'signal') own.signals = own.signals.filter(signal => --signal.remaining > 0);
    if (own?.kind === 'thorns') own.traps = own.traps.filter(trap => --trap.remaining > 0);
    if (own?.kind === 'marks') own.marks = own.marks.filter(mark => --mark.remaining > 0);
    if (own?.kind === 'foundation' && own.foundation && --own.foundation.remaining <= 0) own.foundation = null;
    if (own?.kind === 'cyclone' && own.cyclone && --own.cyclone.remaining <= 0)
      releaseCyclone(state, events, member, 1, { kind: 'skill', bearerId: member.loadout.id });
  }
}
function normal(
  state: RadiantCombatState, events: RadiantCombatEvent[], actor: RadiantBearer, targetId: string, hitCharge: RadiantHitCharge,
): number {
  const target = enemy(state, targetId);
  living(target.hp);
  const source: RadiantSource = { kind: 'normal', bearerId: actor.loadout.id };
  const offered = () => radiantDirectDamage(effectiveRadiantStats(state, actor.loadout.id).attack,
    gearDefense(state, actor, target.stats.defense),
    1 + combatAmount(state, actor, 'normal') + combatAmount(state, actor, 'direct') + cooperation(state, actor) +
      allyDirect(state, actor, target, true),
    (1 + vulnerability(state, target)) * outgoingDamageMultiplier(state, actor, target));
  const amount = offered();
  const impact = packet(state, events, target, source, 'direct', amount, hitCharge, false,
    attribute(state, actor, amount, offered));
  return impact.healthLoss + impact.absorbed > 0 ? 1 : 0;
}
interface RadiantCast {
  kind: 'skill' | 'flare';
  /** Skill slot, or 'flare' (D-493 slot-specific Skill Power recomputes). */
  slot: RadiantSkillSlot | 'flare';
  /** D-493 Nullsong Transmission roll for this cast (undefined when not equipped). */
  won?: boolean;
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
  } else if (input.targetId !== undefined) {
    if (!radiantSkillAcceptsTarget(def)) throw new Error('This skill uses its authored target set.');
    living(enemy(state, input.targetId).hp);
  }
  const id = actor.loadout.id;
  const source: RadiantSource = { kind: input.kind, bearerId: id };
  const stats = effectiveRadiantStats(state, id);
  // Step 2b: conditions are read once, before the cast changes anything.
  const holds = (when: string | undefined) => when === undefined || (signed(actor) && condition(state, actor, when));
  const effects = def.effects.filter(effect => effect.kind !== 'signature' && holds(effect.when));
  const clauses = signed(actor) ? def.effects.filter((effect): effect is Extract<RadiantKitEffect, { kind: 'signature' }> =>
    effect.kind === 'signature' && holds(effect.when)) : [];
  // Rosetta's Quarry and Nerithe's Survey: marked skills strike the living marked enemy instead of the current target.
  const own = actor.signature;
  const redirects = (op: string) => clauses.some(clause => clause.op === op);
  const marked = own?.kind === 'quarry' && redirects('quarry-target') ? own.targetId
    : own?.kind === 'survey' && redirects('survey-target') ? own.targetId : null;
  const primary = marked !== null ? enemy(state, marked) : input.targetId === undefined ? undefined : enemy(state, input.targetId);
  // Signature stacks are read once, before `spend` clauses clear them; they add to `perStack` powers and effect values.
  const stacks = signed(actor) ? signatureStacks(actor, primary) : 0;
  const valueOf = (effect: { value: number; perStack?: number }) => effect.value + (effect.perStack ?? 0) * stacks;
  const power = (def.alt && holds(def.alt.when) ? def.alt.power : def.power) + (def.perStack ?? 0) * stacks;
  const surge = signed(actor) ? signatureSurge(actor, clauses, primary) : { ignore: 0, bonus: 0 };
  // Vespera's Signal: the holder's next damaging skill or Flare spends it for its bonus.
  const signal = def.target !== 'none' ? spendSignal(state, events, actor) : 0;
  // Names Still Carried: Unreturned spent by this cast joins its matching heal, split evenly among the recipients.
  const ferry = clauses.find(clause => clause.op === 'spend-unreturned');
  const unreturned = ferry && own?.kind === 'unreturned' ? own.stored : 0;
  const ignore = surge.ignore + effects.reduce((sum, effect) => sum + (effect.kind === 'ignore-defense' ? effect.value : 0), 0);
  const bonus = surge.bonus + signal + effects.reduce((sum, effect) => sum + (effect.kind === 'damage-bonus' ? effect.value : 0), 0);
  const enemyTargets = def.target === 'all-enemies' ? state.enemies.filter(member => member.hp > 0) : primary ? [primary] : [];
  const struck = new Set<RadiantEnemy>();
  // Alternating Edge reads Weaken before the hit, so a skill's own Weaken never counts for that cast.
  const weakened = new Set(enemyTargets.filter(target => target.debuffs.some(effect => effect.category === 'weaken')));
  // D-493 Eclipse Mantle: Weakened targets (read before the hit) lose Defense; another ally's Weaken adds Skill Power.
  const weakenedBy = (target: RadiantEnemy) => target.debuffs.find(effect => effect.category === 'weaken')?.source;
  const targetPower = (target: RadiantEnemy) => {
    const by = weakened.has(target) ? weakenedBy(target) : undefined;
    return by && by.kind !== 'enemy' && by.bearerId !== id ? combatAmount(state, actor, 'weakened-ally-power') : 0;
  };
  let hits = 0;
  if (def.target !== 'none') for (const target of enemyTargets) {
    if (target.hp === 0) continue;
    const offered = () => Math.max(input.hits, radiantDirectDamage(
      excludedSources ? effectiveRadiantStats(state, id).attack : stats.attack,
      gearDefense(state, actor, target.stats.defense,
        ignore + (weakened.has(target) ? combatAmount(state, actor, 'weakened-pierce') : 0), true),
      power * input.damageScale * ((excludedSources
        ? radiantSkillStats(state, id, input.slot).skillPower + gambleShift(state, actor, input.won) : skill.skillPower) +
        targetPower(target)) *
        (1 + (input.kind === 'flare' ? combatAmount(state, actor, 'flare') : 0) + combatAmount(state, actor, 'direct') +
          combatAmount(state, actor, 'skill-direct') + cooperation(state, actor) + bonus + allyDirect(state, actor, target, false)),
      (1 + vulnerability(state, target)) * outgoingDamageMultiplier(state, actor, target)));
    const total = offered();
    const boosts = attribute(state, actor, total, offered);
    for (let hit = 0; hit < input.hits && target.hp > 0; hit++) {
      const amount = Math.floor(total / input.hits) + (hit === input.hits - 1 ? total % input.hits : 0);
      if (!amount) continue;
      const impact = packet(state, events, target, source, 'direct', amount, hitCharge, false,
        hitBoosts(boosts, hit, input.hits));
      if (impact.healthLoss + impact.absorbed > 0) { hits++; struck.add(target); }
    }
  }
  // Reality Fault: each skill or Flare from Kaelith adds 1 Incision to every enemy it hit (max 3).
  if (own?.kind === 'incisions') for (const target of struck) {
    if (target.hp === 0) continue;
    let entry = own.incisions.find(item => item.enemyId === target.id);
    if (!entry) own.incisions.push(entry = { enemyId: target.id, stacks: 0 });
    entry.stacks = Math.min(radiantSignatureCaps.incisions, entry.stacks + 1);
    events.push({ type: 'signature', bearerId: id, op: 'incision', holderId: target.id, amount: entry.stacks });
  }
  // Alternating Edge: a Skill 1/2 that hits at least one Weakened enemy adds 1 Crosscut (max 3).
  if (own?.kind === 'crosscut' && input.kind === 'skill' && [...struck].some(target => weakened.has(target))) gainCounter(events, actor);
  // D-493 C5: Skill Duration never extends signature resources.
  signatureClauses(state, events, actor, { ...input, skill: { ...skill, skillDuration: 0 } }, clauses, primary, enemyTargets, hitCharge);
  const duration = (turns: number) => Math.min(radiantMaximumDuration, turns + skill.skillDuration);
  const enemiesFor = (to: string) => (to === 'all-enemies' ? state.enemies : primary ? [primary] : []).filter(member => member.hp > 0);
  for (const effect of effects) {
    if (effect.kind !== 'burn' && effect.kind !== 'weaken' && effect.kind !== 'expose') continue;
    for (const target of enemiesFor(effect.to)) {
      const strength = valueOf(effect) * input.effectScale * skill.skillPower;
      // Unbroken Ember: Burn from all allies' skills and Flares deals +30% while Infernis lives.
      const ember = effect.kind === 'burn' && livingStarter(state, 'ember') ? 1 + radiantPassiveValues.emberBurn : 1;
      const magnitude = effect.kind === 'burn'
        ? strength * stats.attack * outgoingDamageMultiplier(state, actor, target, true) * ember : strength;
      // D-493 Ember Iris / Undertide Chronometer: this bearer's skill Burn or Weaken lasts longer.
      const longer = effect.kind === 'burn' ? combatAmount(state, actor, 'burn-duration')
        : effect.kind === 'weaken' ? combatAmount(state, actor, 'weaken-duration') : 0;
      debuff(state, events, target, effect.kind, source, magnitude, duration(effect.turns) + Math.round(longer));
    }
  }
  const lowest = woundedAlly(state);
  const alliesFor = (to: string): RadiantBearer[] => (to === 'self' ? [actor] : to === 'lowest' ? (lowest ? [lowest] : []) :
    state.bearers.filter(member => to === 'all-allies' || member !== actor)).filter(member => member.hp > 0);
  // Heals and Shields resolve before ally buffs (no rule depends on the order), so each recipient's
  // heal and its attached statuses present as one impact.
  let restored = false;
  for (const effect of effects) {
    if (effect.kind !== 'heal' && effect.kind !== 'shield') continue;
    // N7: kit heals and Shields are a % of the recipient's max Health x the caster's Skill Power.
    const recipients = alliesFor(effect.to);
    const carried = effect.kind === 'heal' && ferry?.to === effect.to && recipients.length ? unreturned / recipients.length : 0;
    for (const ally of recipients) {
      // D-493 Worldroot Graft: healing on allies below 40% Health gains Skill Power; lifting them past 40% grants Defense Up.
      const line = radiantOmnicRules.lowHealthLine;
      const low = effect.kind === 'heal' && ally.hp < line * maximumHealth(state, ally);
      const powered = skill.skillPower + (low ? combatAmount(state, actor, 'low-heal-power') : 0);
      const magnitude = valueOf(effect) * input.effectScale * powered * ally.stats.hp + carried;
      if (effect.kind === 'heal') {
        const gained = heal(state, events, ally, source, magnitude);
        restored = gained > 0 || restored;
        const lift = combatAmount(state, actor, 'lift-guard'), from = gearSourceOf(actor, 'lift-guard');
        if (low && gained > 0 && lift > 0 && from && ally.hp >= line * maximumHealth(state, ally))
          applyCategory(events, ally.loadout.id, ally.buffs, 'defense-up', from, lift, 1);
      }
      else shield(state, events, ally, source, magnitude);
    }
  }
  // Returning Current: a skill or Flare heal that restores Health adds 1 Current, once per action (after any spend).
  if (restored && own?.kind === 'current') gainCounter(events, actor);
  for (const effect of effects) {
    if (effect.kind === 'cleanse') {
      let removed = false;
      for (const ally of alliesFor(effect.to)) removed = cleanse(events, ally) || removed;
      // What Need Not Remain: removing a Weaken gives Ilyss 1 Severance, once per player turn.
      if (removed && own?.kind === 'severance' && !own.latch) { own.latch = true; gainCounter(events, actor); }
      continue;
    }
    if (effect.kind !== 'attack-up' && effect.kind !== 'defense-up' && effect.kind !== 'reduction' &&
      effect.kind !== 'gain-up' && effect.kind !== 'hot') continue;
    for (const ally of alliesFor(effect.to)) {
      applyCategory(events, ally.loadout.id, ally.buffs, effect.kind, source,
        valueOf(effect) * input.effectScale * skill.skillPower, duration(effect.turns));
      // Shared Mindflame: Attack Up from Disciple also fills each ally it reaches.
      if (effect.kind === 'attack-up' && actor.loadout.starter === 'disciple' && signed(actor))
        addPassiveCharge(state, events, ally.loadout.id, rounded(radiantPassiveValues.discipleFill * gaugeGain(state, ally)));
    }
  }
  for (const effect of effects) {
    if (effect.kind !== 'fill') continue;
    for (const ally of alliesFor(effect.to))
      addPassiveCharge(state, events, ally.loadout.id, Math.round(valueOf(effect) * input.effectScale * gaugeGain(state, ally)));
  }
  if (radiantStarterKits[actor.loadout.starter].role === 'Support')
    for (const ally of state.bearers.filter(member => member.hp > 0))
      heal(state, events, ally, { kind: 'role', bearerId: id }, radiantSupportSquadHeal * ally.stats.hp);
  // Turning Season: a skill advances Sprout -> Bloom -> Harvest; a skill or Flare cast in Harvest returns it to Sprout.
  if (own?.kind === 'season' && (own.count === 2 || input.kind === 'skill')) {
    own.count = own.count === 2 ? 0 : own.count + 1;
    events.push({ type: 'signature', bearerId: id, op: 'season', amount: own.count });
  }
  return hits;
}
/** D-493 Nullsong Transmission: one Conduit roll per skill or Convergent Light while equipped. */
function gambleRoll(state: RadiantCombatState, actor: RadiantBearer): boolean | undefined {
  return combatAmount(state, actor, 'gamble-power') > 0 ? rollConduit(state) < radiantGambleRules.chance : undefined;
}
function skillAction(
  state: RadiantCombatState, events: RadiantCombatEvent[], actor: RadiantBearer,
  action: Extract<RadiantCombatAction, { type: 'skill' }>, hitCharge: RadiantHitCharge,
): number {
  if (action.slot !== 1 && action.slot !== 2) throw new Error('Invalid radiant skill slot.');
  const id = actor.loadout.id;
  const def = radiantStarterKits[actor.loadout.starter].kit[action.slot === 1 ? 'skill1' : 'skill2'];
  if (!radiantSkillAcceptsTarget(def) && action.targetId !== undefined) throw new Error('This skill uses its authored target set.');
  if (def.target === 'one-enemy' && (action.targetId === undefined || enemy(state, action.targetId).hp <= 0))
    throw new Error('This skill requires a selected living enemy.');
  const stats = radiantSkillStats(state, id, action.slot);
  stats.skillEfficiency += targetEfficiency(state, actor, def, action.targetId);
  const spent = spendSkill(state.gauge, id, action.slot, stats.skillEfficiency);
  state.gauge = spent.state;
  events.push({ type: 'skill', bearerId: id, slot: action.slot, name: def.name, cost: spent.cost });
  const won = gambleRoll(state, actor);
  const skill = { ...stats, skillPower: stats.skillPower + gambleShift(state, actor, won) };
  const hits = cast(state, events, actor, { kind: 'skill', slot: action.slot, won, def, targetId: action.targetId, damageScale: 1, effectScale: 1,
    hits: def.hits, skill }, hitCharge);
  // Rose Duality: alternating skills add 1 Combo (max 5); repeating a skill resets it. The first skill only sets the slot.
  const own = actor.signature;
  if (own?.kind === 'combo') {
    if (own.last !== null) own.combo = own.last === action.slot ? 0 : Math.min(radiantSignatureCaps.combo, own.combo + 1);
    own.last = action.slot;
    events.push({ type: 'signature', bearerId: id, op: 'combo', amount: own.combo });
  }
  return hits;
}
function flare(
  state: RadiantCombatState, events: RadiantCombatEvent[], actor: RadiantBearer, targetId: string | undefined,
  hitCharge: RadiantHitCharge,
): { tier: FlareTier; hits: number } {
  const def = radiantStarterKits[actor.loadout.starter].kit.flare;
  if (!radiantSkillAcceptsTarget(def) && targetId !== undefined) throw new Error('This signature uses its authored target set.');
  if (def.target === 'one-enemy' && (targetId === undefined || enemy(state, targetId).hp <= 0))
    throw new Error('This signature requires a selected living enemy.');
  const spent = spendReadyFlare(state.gauge, actor.loadout.id);
  state.gauge = spent.state;
  const tier = spent.tier, scale = radiantFlareTierScale[tier], power = radiantFlarePower(actor.loadout);
  events.push({ type: 'flare', bearerId: actor.loadout.id, tier, name: def.name });
  const won = gambleRoll(state, actor), stats = radiantSkillStats(state, actor.loadout.id, 'flare');
  const hits = cast(state, events, actor, { kind: 'flare', slot: 'flare', won, def, targetId, damageScale: scale.damage * power,
    effectScale: scale.effect * power, hits: scale.hits,
    skill: { ...stats, skillPower: stats.skillPower + gambleShift(state, actor, won) } }, hitCharge);
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
  let damaged = false;
  intervalGain(state, events, actor);
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
    const reduction = category(target.buffs, 'reduction');
    const weakening = category(actor.debuffs, 'weaken');
    const element = elementDamageMultiplier(actor.elementId, radiantStarterKits[target.loadout.starter].elementId);
    const incoming = (): number => {
      const stats = effectiveRadiantStats(state, target.loadout.id);
      // D-473 O1 interim: `guard` reduces damage while this bearer used a skill this turn (no 50% Defend base).
      const guard = state.skilled.includes(target.loadout.id) ? Math.min(.6, combatAmount(state, target, 'guard')) : 0;
      const output = Math.max(.2, (1 - guard) * (1 - reduction));
      const beforeProtection = radiantDirectDamage(actor.stats.attack * (1 - weakening), stats.defense, action.coefficient, output * element);
      const cap = maximumHealth(state, target);
      const protection = (target.hp > cap * .75 ? combatAmount(state, target, 'shelter') : 0) +
        (beforeProtection > cap * .2 ? combatAmount(state, target, 'brace') : 0) +
        (beforeProtection > cap * radiantOmnicRules.heavyHitLine ? skillShieldBrace(state, target) : 0);
      // D-493 Stasis Reliquary: +25% damage taken in the enemy phase after a block (state, not a Conduit amount).
      const exposed = target.stasis === 'next' ? 1 + radiantStasisVulnerability : 1;
      return radiantDirectDamage(actor.stats.attack * (1 - weakening), stats.defense, action.coefficient,
        Math.max(.2, output * (1 - Math.min(.8, protection))) * element * exposed);
    };
    const total = incoming();
    // D-492: damage prevented by the target's Defense, guard, shelter and brace Conduits.
    const prevented = attribute(state, target, total, incoming);
    for (let hit = 0; hit < hits && target.hp > 0; hit++) {
      let amount = Math.floor(total / hits) + (hit === hits - 1 ? total % hits : 0);
      if (!amount) continue;
      amount -= foundationAbsorb(state, events, target, amount);
      // Bruno's Cover: the caster takes its share of this hit (Faultbound Resolve reduces that share by 25%).
      const cover = target.cover, coverer = cover ? bearer(state, cover.casterId) : undefined;
      const moved = cover && coverer && coverer.hp > 0 ? Math.round(amount * cover.share) : 0;
      if (moved > 0 && coverer) {
        const taken = rounded(moved * (1 - (coverer.loadout.starter === 'bruno' ? radiantPassiveValues.brunoRedirect : 0)));
        if (taken > 0) {
          const redirected = packet(state, events, coverer, source, 'direct', taken, undefined, true);
          refundFullBlock(state, events, coverer, redirected, taken);
          // Weight of the Watch counts redirected hits; Names Still Carried does not.
          if (coverer.hp > 0 && redirected.healthLoss + redirected.absorbed > 0) hitGain(events, coverer);
          damaged = true;
        }
      }
      if (amount - moved <= 0) continue;
      const taken = holdStillness(events, target, amount - moved);
      const part = packet(state, events, target, source, 'direct', taken, undefined, false, hitBoosts(prevented, hit, hits));
      // Every landed hit counts as damage for Thorn Traps, including a lethal hit Ozriel's Refusal turned to 0 loss.
      damaged = true;
      refundFullBlock(state, events, target, part, taken);
      carryUnreturned(state, events, part.healthLoss);
      if (target.signature?.kind === 'wounds' && part.healthLoss > 0 && target.hp > 0) {
        target.signature.wounds += part.healthLoss;
        safe(target.signature.wounds, 'Wounds');
        events.push({ type: 'signature', bearerId: target.loadout.id, op: 'wounds', amount: target.signature.wounds });
      }
      if (target.hp > 0 && part.healthLoss + part.absorbed > 0) {
        hitGain(events, target);
        state.gauge = grantRadiantIncomingAttack(state.gauge, target.loadout.id, gaugeGain(state, target));
        events.push({ type: 'charge', bearerId: target.loadout.id,
          personal: state.gauge.members.find(m => m.id === target.loadout.id)!.charge,
          bonusRolls: 0, bonusOffered: 0 });
      }
    }
  }
  if (damaged) springThornTraps(state, events, actor);
}
/** One Burn tick: magnitude with the caster's Burn boost and Cinder Testament's bonus. */
function burnTick(state: RadiantCombatState, burn: RadiantCategoryEffect): number {
  return Math.max(1, rounded(burn.magnitude * (1 + burnBoost(state, burn.source) + (burn.amp ?? 0))));
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
    if (burn) packet(state, events, target, burn.source, 'periodic', burnTick(state, burn));
  }
  // D-493 Nightglass Archive: mark clocks tick with the enemy phase.
  for (const target of state.enemies) if (target.marks) {
    target.marks = target.marks.filter(mark => --mark.remaining > 0);
    if (!target.marks.length) delete target.marks;
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
  // Virtuous Bloom: contributors count for one turn.
  for (const member of state.bearers) if (member.signature?.kind === 'quarry') member.signature.contributors = [];
  // Once-per-enemy-phase and once-per-turn gains open again.
  for (const member of state.bearers) { const counter = counterOf(member.signature); if (counter) counter.latch = false; }
  // D-493 Stasis Reliquary: a block's vulnerability covers the next enemy phase, then the Conduit is available again.
  for (const member of state.bearers) {
    if (member.stasis === 'next') delete member.stasis;
    else if (member.stasis === 'current') member.stasis = 'next';
  }
  events.push({ type: 'round', round: state.round });
  // Standing Thunder: the Beat moves one step each player turn.
  const vaelor = livingStarter(state, 'vaelor');
  if (vaelor) events.push({ type: 'signature', bearerId: vaelor.loadout.id, op: 'beat', amount: radiantBeat(state.round) });
  bloomSeeds(state, events);
  for (const member of state.gauge.members.filter(m => m.living))
    events.push({ type: 'charge', bearerId: member.id, personal: member.charge,
      bonusRolls: 0, bonusOffered: 0 });
}
/** D-493 C14: Defense ignore and enemy Defense reduction share one 80% cap; `skill` adds skill-only ignore. */
function gearDefense(state: RadiantCombatState, actor: RadiantBearer, defense: number, ignore = 0, skill = false): number {
  // Copies of the enemy-Defense aura do not stack: the strongest squad member's amount applies for the encounter.
  const reduction = Math.max(0, ...state.bearers.map(member => combatAmount(state, member, 'enemy-defense')));
  return defense * (1 - Math.min(.8, combatAmount(state, actor, 'pierce') + ignore + reduction +
    (skill ? combatAmount(state, actor, 'skill-pierce') : 0)));
}
function cooperation(state: RadiantCombatState, actor: RadiantBearer): number {
  return state.acted.some(id => id !== actor.loadout.id)
    ? combatAmount(state, actor, 'cooperation') : 0;
}

/** Virtuous Bloom: another ally whose Normal, skill or Flare hit Rosetta's Quarry this action becomes a contributor. */
function recordContributors(
  state: RadiantCombatState, events: RadiantCombatEvent[], actor: RadiantBearer, quarries: readonly (string | null)[],
): void {
  const id = actor.loadout.id;
  state.bearers.forEach((member, index) => {
    const own = member.signature, quarry = quarries[index];
    if (own?.kind !== 'quarry' || member === actor || member.hp === 0 || quarry === null || own.contributors.includes(id)) return;
    if (!events.some(event => event.type === 'damage' && event.targetId === quarry && event.origin === 'direct' &&
      event.healthLoss + event.absorbed > 0 && event.source.kind !== 'enemy' && event.source.bearerId === id &&
      (event.source.kind === 'normal' || event.source.kind === 'skill' || event.source.kind === 'flare'))) return;
    own.contributors.push(id);
    events.push({ type: 'signature', bearerId: member.loadout.id, op: 'contributor', holderId: id, amount: own.contributors.length });
  });
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
  // D-493 Cinder Testament: enemies the acting bearer's skill or Convergent Light damaged this action.
  const actorStruck = 'bearerId' in action && (action.type === 'skill' || action.type === 'flare')
    ? new Set(nativeEvents.filter(event => event.type === 'damage' && event.origin === 'direct' &&
      (event.source.kind === 'skill' || event.source.kind === 'flare') && event.source.bearerId === action.bearerId &&
      event.healthLoss + event.absorbed > 0).map(event => (event as Extract<RadiantCombatEvent, { type: 'damage' }>).targetId))
    : new Set<string>();
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
            const before = state.gauge.members.find(m => m.id === recipient.loadout.id)!.charge;
            addPassiveCharge(state, events, recipient.loadout.id, rounded(value * gaugeGain(state, recipient)));
            const event = events[events.length - 1];
            if (event.type === 'charge') {
              event.gearSource = source;
              // D-492: Luminosity this Conduit actually added (after the gauge cap), for the contribution summary.
              if (event.personal > before) event.gained = event.personal - before;
            }
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
          case 'drain': {
            // D-493 Lifeline Flywheel: heal from direct damage dealt to enemy Health and Shields by this action.
            const dealt = direct.reduce((sum, event) => sum + event.healthLoss + event.absorbed, 0);
            if (ownAction && dealt > 0) heal(state, events, owner, source, amount * dealt);
            break;
          }
          case 'ally-heal-self':
            // D-493 Duplex Heart: once per skill or Convergent Light that restores another ally's Health.
            if (ownAction && (action.type === 'skill' || action.type === 'flare') && restored.some(event =>
              event.targetId !== id && (event.source.kind === 'skill' || event.source.kind === 'flare')))
              heal(state, events, owner, source, amount * owner.stats.hp);
            break;
          case 'phase-shield':
            // D-493 Granite Hourglass: at the start of each turn, from Health lost in the previous enemy phase.
            if (round && owner.phaseLoss) shield(state, events, owner, source, amount * owner.phaseLoss);
            break;
          case 'restore-charge':
            // D-493 Meridian Inverter: once per skill or Convergent Light, each ally whose Health it restored.
            if (ownAction && (action.type === 'skill' || action.type === 'flare'))
              for (const targetId of new Set(restored.filter(event => event.source.kind === 'skill' || event.source.kind === 'flare')
                .map(event => event.targetId))) grant(bearer(state, targetId), amount);
            break;
          case 'exposed-heal':
            // D-493 Verdict Caliper: once per action, a damaging action on an enemy with Exposure.
            if (ownAction && direct.some(event => event.healthLoss + event.absorbed > 0 &&
              exposure(enemy(state, event.targetId)) > 0)) heal(state, events, owner, source, amount * owner.stats.hp);
            break;
          case 'twin-charge':
            // D-493 Twinpulse Bellows: this bearer and the other living ally with the lowest Luminosity percentage.
            if (normalDirect) {
              grant(owner, amount);
              const share = (member: RadiantBearer): number => {
                const entry = state.gauge.members.find(m => m.id === member.loadout.id)!;
                return entry.charge / personalChargeMaximum(entry);
              };
              const other = state.bearers.filter(member => member !== owner && member.hp > 0)
                .reduce<RadiantBearer | undefined>((best, member) => !best || share(member) < share(best) ? member : best, undefined);
              if (other) grant(other, amount);
            }
            break;
          case 'round-team-heal':
            if (round) for (const ally of state.bearers) heal(state, events, ally, source, amount * stats.recovery);
            break;
          // D-493 B3a (Omnic). "Maximum Health" bases use the frozen maximum, like kit heals.
          case 'skill-mark':
            // Nightglass Archive: this bearer's damaging skills and Convergent Light mark surviving enemies they hit.
            if (ownAction && (action.type === 'skill' || action.type === 'flare'))
              for (const targetId of new Set(direct.filter(event => event.healthLoss + event.absorbed > 0).map(event => event.targetId))) {
                const marked = state.enemies.find(member => member.id === targetId && member.hp > 0);
                if (!marked) continue;
                const marks = marked.marks ??= [];
                const existing = marks.find(mark => mark.casterId === id);
                if (existing) existing.remaining = radiantOmnicRules.markTurns;
                else marks.push({ casterId: id, remaining: radiantOmnicRules.markTurns });
              }
            break;
          case 'defense-heal':
            // Kirin Cradle: heal the lowest-Health-percentage ally from current Defense; all full grants Luminosity instead.
            if (normalDirect && wounded) {
              if (state.bearers.every(member => member.hp === 0 || member.hp >= maximumHealth(state, member)))
                grant(wounded, radiantOmnicRules.defenseHealCharge);
              else heal(state, events, wounded, source,
                Math.min(amount * stats.defense, radiantOmnicRules.defenseHealCap * wounded.stats.hp));
            }
            break;
          case 'shield-charge':
            // Leviathan Pump: once per enemy attack, each ally whose Shield absorbed it gains Luminosity.
            if (action.type === 'enemy-attack')
              for (const holderId of new Set(incoming.filter(event => event.absorbed > 0).map(event => event.targetId)))
                grant(bearer(state, holderId), amount);
            break;
          case 'first-heal':
            // Seraph Mirror: once per turn, this bearer's first damaging action heals every living ally.
            if (ownAction && direct.length > 0 && boundedIncoming) {
              for (const ally of state.bearers) heal(state, events, ally, source, amount * ally.stats.hp);
              triggered = true;
            }
            break;
          case 'first-skill-charge':
            // Sky Sovereign Escapement: once per turn, the first damaging Skill 1 or Skill 2 fills each other living ally.
            if (ownAction && action.type === 'skill' && direct.length > 0 && boundedIncoming) {
              for (const ally of state.bearers) if (ally !== owner) grant(ally, amount);
              triggered = true;
            }
            break;
          case 'first-skill-shield':
            // Tempest Shelter Sovereign: once per turn, the first damaging skill or Convergent Light Shields the lowest ally.
            if (ownAction && (action.type === 'skill' || action.type === 'flare') && direct.length > 0 && boundedIncoming && wounded) {
              shield(state, events, wounded, source, amount * wounded.stats.hp);
              triggered = true;
            }
            break;
          case 'flare-round-heal':
            // Stillhour Carillon: the turn after this bearer's Convergent Light.
            if (round && state.flared?.includes(id)) for (const ally of state.bearers) heal(state, events, ally, source, amount * ally.stats.hp);
            break;
          case 'flare-round-charge':
            if (round && state.flared?.includes(id)) for (const ally of state.bearers) grant(ally, amount);
            break;
          case 'weaken-guard':
          case 'weaken-heal':
            // Fractured Mercy Governor: once per skill or Convergent Light from this bearer that applies Weaken.
            if (ownAction && (action.type === 'skill' || action.type === 'flare') && wounded && owned.some(event =>
              event.type === 'status' && !event.clockOnly && event.status === 'weaken' &&
              (event.source.kind === 'skill' || event.source.kind === 'flare'))) {
              if (primitive.kind === 'weaken-guard') applyCategory(events, wounded.loadout.id, wounded.buffs, 'defense-up', source, amount, 1);
              else if (wounded.hp < radiantOmnicRules.weakenHealLine * maximumHealth(state, wounded))
                heal(state, events, wounded, source, amount * wounded.stats.hp);
            }
            break;
          case 'shield-echo':
            // Shared Tide Lifesea Engine: a skill Shield on exactly one ally echoes onto the most-wounded other ally.
            if (ownAction && (action.type === 'skill' || action.type === 'flare')) {
              const given = owned.filter((event): event is Extract<RadiantCombatEvent, { type: 'shield' }> =>
                event.type === 'shield' && (event.source.kind === 'skill' || event.source.kind === 'flare'));
              const holders = [...new Set(given.map(event => event.targetId))];
              const other = holders.length === 1 ? woundedAlly(state, holders[0]) : undefined;
              if (other) shield(state, events, other, source, amount * given.reduce((sum, event) => sum + event.amount, 0));
            }
            break;
          case 'skill-drain-ally':
            // Worldroot Sap Cathedral: damaging skills heal the lowest ally from enemy Health removed (capped per cast).
            if (ownAction && (action.type === 'skill' || action.type === 'flare') && wounded) {
              const removed = direct.reduce((sum, event) => sum + event.healthLoss, 0);
              if (removed > 0) heal(state, events, wounded, source,
                Math.min(amount * removed, radiantOmnicRules.drainAllyCap * wounded.stats.hp));
            }
            break;
          case 'burn-tick-heal':
            // Phoenix Lifeforge: each ability Burn tick that damages enemy Health heals the squad.
            for (const event of nativeEvents) if (event.type === 'damage' && event.origin === 'periodic' && event.healthLoss > 0 &&
              state.enemies.some(member => member.id === event.targetId))
              for (const ally of state.bearers) heal(state, events, ally, source, amount * ally.stats.hp);
            break;
          case 'shield-reflect':
            // Leviathan Mercy Reflector: this bearer's ability Shields reflect absorbed damage, capped per enemy phase.
            if (action.type === 'enemy-attack' && absorbed.length) {
              const attacker = state.enemies.find(member => member.id === action.enemyId);
              const room = radiantOmnicRules.reflectCap * stats.attack - (owner.reflected ?? 0);
              const value = Math.floor(Math.min(amount * absorbed.reduce((sum, entry) => sum + entry.amount, 0), room));
              if (attacker && attacker.hp > 0 && value >= 1) {
                packet(state, events, attacker, source, 'generated', value);
                owner.reflected = (owner.reflected ?? 0) + value;
              }
            }
            break;
          case 'first-turn-attack':
            // Solace Witness Monolith: acting before every other living ally gives them Attack Up for the rest of the turn.
            if (ownAction && state.acted.length === 0)
              for (const ally of state.bearers) if (ally !== owner && ally.hp > 0)
                applyCategory(events, ally.loadout.id, ally.buffs, 'attack-up', source, amount, 1);
            break;
          case 'burn-amp':
            // Cinder Testament: another ally's skill or Convergent Light on an enemy carrying this bearer's Burn.
            if ('bearerId' in action && action.bearerId !== id) for (const targetId of actorStruck) {
              const burn = enemy(state, targetId).debuffs.find(effect => effect.category === 'burn');
              if (burn && burn.source.kind !== 'enemy' && burn.source.bearerId === id)
                burn.amp = Math.min(radiantOmnicRules.burnAmpCap, (burn.amp ?? 0) + amount);
            }
            break;
          case 'burn-transfer':
            // Eternal Cinder Observatory: a burning enemy's defeat sends its remaining Burn to the healthiest other enemy.
            for (const targetId of defeated) {
              const fallen = state.enemies.find(member => member.id === targetId);
              const burn = fallen?.debuffs.find(effect => effect.category === 'burn');
              if (!fallen || !burn) continue;
              const next = state.enemies.filter(member => member.hp > 0 && member !== fallen)
                .reduce<RadiantEnemy | undefined>((best, member) =>
                  !best || member.hp / member.stats.hp > best.hp / best.stats.hp ? member : best, undefined);
              if (next) packet(state, events, next, source, 'generated', Math.max(1, rounded(amount * burnTick(state, burn) * burn.remaining)));
            }
            break;
          case 'overheal-shield':
            // Worldtree Heart: overhealing from this bearer's skills becomes (or raises) this Conduit's Shield.
            if (ownAction && (action.type === 'skill' || action.type === 'flare')) {
              const over = new Map<string, number>();
              for (const event of owned) if (event.type === 'heal' && (event.source.kind === 'skill' || event.source.kind === 'flare') &&
                event.offered > event.effective) over.set(event.targetId, (over.get(event.targetId) ?? 0) + event.offered - event.effective);
              for (const [targetId, extra] of over) {
                const ally = bearer(state, targetId);
                if (ally.hp > 0) refreshShield(state, events, ally, source, Math.min(amount * extra, radiantOmnicRules.overhealCap * ally.stats.hp));
              }
            }
            break;
        }
      }
      if (triggered) state.gearTriggered.push(key);
    }
  }
  // D-493 Granite Hourglass and Mercy Reflector ledgers cover one enemy phase; Stillhour Carillon's covers one turn.
  if (action.type === 'finish-enemy-phase') {
    for (const member of state.bearers) { delete member.phaseLoss; delete member.reflected; }
    delete state.flared;
  }
}
/** D-493 Worldtree Heart: raise this source's Shield on the holder to `magnitude`; the shield event carries the increase. */
function refreshShield(
  state: RadiantCombatState, events: RadiantCombatEvent[], target: RadiantBearer, source: RadiantGearSource, magnitude: number,
): void {
  const key = gearKey(source);
  const existing = target.shields.find(layer => (layer.source.kind === 'gear' || layer.source.kind === 'master' ||
    layer.source.kind === 'leader') && gearKey(layer.source) === key);
  if (!existing) { shield(state, events, target, source, magnitude); return; }
  const gained = rounded(magnitude) - existing.remaining;
  if (gained <= 0) return;
  existing.remaining += gained;
  events.push({ type: 'shield', source, targetId: target.loadout.id, amount: gained, shieldId: existing.id });
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
    const quarries = state.bearers.map(member => member.signature?.kind === 'quarry' ? member.signature.targetId : null);
    if (action.type === 'normal') {
      hits = normal(state, events, actor, action.targetId, hitCharge);
      normalPassives(state, events, actor, action.targetId, hits);
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
    recordContributors(state, events, actor, quarries);
    const charge = grantRadiantAction(state.gauge, action.bearerId, action.type, action.type === 'normal' ? hits : 0);
    state.gauge = charge.state;
    events.push({ type: 'charge', bearerId: action.bearerId,
      personal: state.gauge.members.find(m => m.id === action.bearerId)!.charge,
      bonusRolls: hitCharge.bonusRolls, bonusOffered: hitCharge.bonusOffered });
    processRadiantGear(state, events, action);
    // D-493 Stillhour Carillon: remember this turn's Convergent Light for the next turn's start.
    if (action.type === 'flare' && radiantEquipmentAmount(actor.loadout, 'flare-round-heal') +
      radiantEquipmentAmount(actor.loadout, 'flare-round-charge') > 0 && !state.flared?.includes(action.bearerId))
      (state.flared ??= []).push(action.bearerId);
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
