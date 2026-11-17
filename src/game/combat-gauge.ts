import { squadMemberLimit } from '../content/squad-rules';
import type { ElementId } from '../content/activities';
import { isCombatElement } from '../content/element-matchups';
import { convergentLightRules, convergentLightTier, type ConvergentLightTier } from '../content/progression';
import { radiantSkillCosts, type RadiantSkillSlot } from '../content/radiant-kits';

export type FlareTier = ConvergentLightTier;
export interface RadiantGaugeMember {
  id: string;
  elementId: ElementId;
  form: number;
  convergenceRank: number;
  baseCost: number;
  charge: number;
  living: boolean;
}
export interface RadiantGaugeState {
  members: RadiantGaugeMember[];
}

export const personalChargeUnit = 10;
/** D-473 N1: Normal Attack hit +15, being hit +10; skills, Flares and defeats +0. */
export const radiantChargeRules = {
  normal: 15,
  flareHit: 0,
  defeatedEnemy: 0,
  otherMemberPercent: 10,
  defense: 0,
  round: 0,
  incomingAttack: 10,
  bonusChance: 0,
  bonusAmount: 0,
  maximumBonusRolls: 0,
} as const;

function integer(value: number, minimum: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < minimum) throw new Error(`Invalid radiant ${name}.`);
}
function personalUnits(value: number): number {
  const units = Math.round(value * personalChargeUnit);
  if (!Number.isSafeInteger(units) || units < 0 || units / personalChargeUnit !== value)
    throw new Error('Invalid radiant personal charge.');
  return units;
}
export function personalChargeMaximum(member: RadiantGaugeMember): number {
  integer(member.form, 1, 'form');
  if (member.form > 6) throw new Error('Radiant form must use the saved six-form index.');
  integer(member.baseCost, 1, 'base cost');
  const maximum = member.baseCost * (member.form >= 4 ? 2 : 1);
  integer(maximum, 1, 'charge capacity');
  integer(maximum * personalChargeUnit, 1, 'charge capacity units');
  return maximum;
}
export function validateRadiantGauge(state: RadiantGaugeState): void {
  if (!Array.isArray(state.members) || !state.members.length || state.members.length > squadMemberLimit)
    throw new Error('Radiant charge requires one to three squad members.');
  const ids = new Set<string>();
  for (const member of state.members) {
    if (typeof member.id !== 'string' || !member.id || ids.has(member.id) || typeof member.living !== 'boolean' || !isCombatElement(member.elementId))
      throw new Error('Invalid radiant squad member.');
    ids.add(member.id);
    integer(member.convergenceRank, 1, 'Convergent Light rank');
    if (member.convergenceRank > convergentLightRules.maximumRank ||
        (member.convergenceRank > 10 && member.form < convergentLightRules.ultimateEvolution) ||
        (member.convergenceRank > 5 && member.form < convergentLightRules.glimmeringEvolution))
      throw new Error('Convergent Light rank exceeds its evolution unlock.');
    personalUnits(member.charge);
    if (member.charge > personalChargeMaximum(member)) throw new Error('Personal charge exceeds its unlocked layers.');
  }
}
function actor(state: RadiantGaugeState, id: string): RadiantGaugeMember {
  const member = state.members.find(entry => entry.id === id);
  if (!member) throw new Error('Radiant charge actor is not in this squad.');
  if (!member.living) throw new Error('A defeated bearer cannot receive or spend action charge.');
  return member;
}
/** D-473 N2: Skill Efficiency discount cap and cost floors. */
export const radiantCostRules = { efficiencyCap: .5, skillFloor: 1, flareFloor: 70 } as const;
function discounted(base: number, efficiency: number, floor: number): number {
  if (!Number.isFinite(efficiency) || efficiency < 0) throw new Error('Invalid radiant Skill Efficiency.');
  // A floor limits the discount; it never raises a cost above its base.
  return Math.max(Math.min(base, floor), Math.round(base * (1 - Math.min(radiantCostRules.efficiencyCap, efficiency))));
}
export function radiantFlareCost(member: RadiantGaugeMember, efficiency = 0): number {
  return discounted(member.baseCost * (convergentLightTier(member.convergenceRank) === 'sparkling' ? 1 : 2),
    efficiency, radiantCostRules.flareFloor);
}
export function radiantSkillCost(slot: RadiantSkillSlot, efficiency = 0): number {
  if (slot !== 1 && slot !== 2) throw new Error('Invalid radiant skill slot.');
  return discounted(radiantSkillCosts[slot], efficiency, radiantCostRules.skillFloor);
}
export function readyFlare(state: RadiantGaugeState, id: string): FlareTier | null {
  validateRadiantGauge(state);
  const member = actor(state, id);
  return member.charge >= radiantFlareCost(member) ? convergentLightTier(member.convergenceRank) : null;
}
export function spendReadyFlare(state: RadiantGaugeState, id: string): { state: RadiantGaugeState; tier: FlareTier } {
  const tier = readyFlare(state, id);
  if (!tier) throw new Error('This bearer has no ready Convergent Light.');
  const next = structuredClone(state);
  const member = actor(next, id);
  member.charge = (personalUnits(member.charge) - radiantFlareCost(member) * personalChargeUnit) / personalChargeUnit;
  validateRadiantGauge(next);
  return { state: next, tier };
}
export function readySkill(state: RadiantGaugeState, id: string, slot: RadiantSkillSlot, efficiency = 0): boolean {
  validateRadiantGauge(state);
  return actor(state, id).charge >= radiantSkillCost(slot, efficiency);
}
export function spendSkill(
  state: RadiantGaugeState, id: string, slot: RadiantSkillSlot, efficiency = 0,
): { state: RadiantGaugeState; cost: number } {
  if (!readySkill(state, id, slot, efficiency)) throw new Error('This bearer lacks the Luminosity for that skill.');
  const next = structuredClone(state);
  const member = actor(next, id), cost = radiantSkillCost(slot, efficiency);
  member.charge = (personalUnits(member.charge) - cost * personalChargeUnit) / personalChargeUnit;
  validateRadiantGauge(next);
  return { state: next, cost };
}
/** Gauge Gain multiplies every Luminosity gain, rounded once to a whole amount. */
export function radiantGain(amount: number, gaugeGain: number): number {
  integer(amount, 0, 'charge grant');
  if (!Number.isFinite(gaugeGain) || gaugeGain <= 0) throw new Error('Invalid radiant Gauge Gain.');
  return Math.round(amount * gaugeGain);
}
function addPersonalUnits(member: RadiantGaugeMember, units: number): void {
  integer(units, 0, 'charge grant units');
  const current = personalUnits(member.charge);
  const remaining = personalChargeMaximum(member) * personalChargeUnit - current;
  if (remaining < 0) throw new Error('Personal charge exceeds its unlocked layers.');
  member.charge = (current + Math.min(remaining, units)) / personalChargeUnit;
}
export function addRadiantPersonalCharge(member: RadiantGaugeMember, amount: number): void {
  integer(amount, 0, 'charge grant');
  addPersonalUnits(member, amount * personalChargeUnit);
}
export function grantRadiantDrop(state: RadiantGaugeState, id: string, amount: number): RadiantGaugeState {
  validateRadiantGauge(state);
  integer(amount, 1, 'enemy drop');
  integer(amount * personalChargeUnit, 1, 'enemy drop units');
  const next = structuredClone(state);
  const owner = next.members.find(member => member.id === id);
  if (!owner) throw new Error('Radiant drop owner is not in this squad.');
  if (!owner.living) throw new Error('A defeated bearer cannot generate Luminosity.');
  const allyUnits = amount * (personalChargeUnit * radiantChargeRules.otherMemberPercent / 100);
  integer(allyUnits, 0, 'same-element drop units');
  for (const member of next.members) {
    if (!member.living || member.elementId !== owner.elementId) continue;
    const units = member.id === id ? amount * personalChargeUnit : allyUnits;
    addPersonalUnits(member, units);
  }
  validateRadiantGauge(next);
  return next;
}
export function radiantHitDrop(
  action: 'normal' | 'flare', previousRolls: number, roll: () => number, gaugeGain = 1,
): { amount: number; bonusRolls: number; bonusOffered: number } {
  if (action !== 'normal' && action !== 'flare') throw new Error('Invalid radiant drop action.');
  integer(previousRolls, 0, 'bonus roll count');
  if (previousRolls > radiantChargeRules.maximumBonusRolls) throw new Error('Too many radiant bonus rolls.');
  const bonusRolls = previousRolls < radiantChargeRules.maximumBonusRolls ? 1 : 0;
  let bonusOffered = 0;
  if (bonusRolls) {
    const value = roll();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('Invalid radiant bonus-charge roll.');
    if (value < radiantChargeRules.bonusChance) bonusOffered = radiantChargeRules.bonusAmount;
  }
  return { amount: radiantGain((action === 'normal' ? radiantChargeRules.normal : radiantChargeRules.flareHit) + bonusOffered,
    gaugeGain), bonusRolls, bonusOffered };
}
export function grantRadiantAction(
  state: RadiantGaugeState, id: string, action: 'normal' | 'skill' | 'flare', qualifyingDirectHits: number,
): { state: RadiantGaugeState } {
  validateRadiantGauge(state);
  actor(state, id);
  integer(qualifyingDirectHits, 0, 'direct hit count');
  if (!['normal', 'skill', 'flare'].includes(action)) throw new Error('Invalid radiant charge action.');
  if (action === 'normal' && qualifyingDirectHits > 1) throw new Error('Normal Attack has one mechanical charge hit.');
  return { state: structuredClone(state) };
}
export function grantRadiantIncomingAttack(state: RadiantGaugeState, id: string, gaugeGain = 1): RadiantGaugeState {
  validateRadiantGauge(state);
  const next = structuredClone(state);
  addRadiantPersonalCharge(actor(next, id), radiantGain(radiantChargeRules.incomingAttack, gaugeGain));
  validateRadiantGauge(next);
  return next;
}
export function grantRadiantRound(state: RadiantGaugeState): RadiantGaugeState {
  validateRadiantGauge(state);
  if (!state.members.some(member => member.living)) throw new Error('A defeated squad cannot earn round charge.');
  return structuredClone(state);
}
