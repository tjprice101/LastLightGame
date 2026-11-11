import { squadMemberLimit } from '../content/squad-rules';

export type FlareTier = 'glowing' | 'lustrous' | 'eternal';
export interface RadiantGaugeMember {
  id: string;
  form: number;
  baseCost: number;
  charge: number;
  living: boolean;
}
export interface RadiantGaugeState {
  members: RadiantGaugeMember[];
  sharedUnits: number;
  eternalCasts: number;
}

export const personalChargeUnit = 10;
export const sharedChargeUnit = 60;
export const radiantChargeRules = {
  normal: 20,
  flareHit: 1,
  defeatedEnemy: 5,
  otherMemberPercent: 10,
  defense: 10,
  round: 5,
  incomingAttack: 8,
  bonusChance: .25,
  bonusAmount: 5,
  maximumBonusRolls: 2,
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
export function sharedChargeThreshold(casts: number): number {
  integer(casts, 0, 'cast count');
  return (100 + 25 * Math.min(casts, 4)) * sharedChargeUnit;
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
    throw new Error('Radiant charge requires one to six squad members.');
  const ids = new Set<string>();
  for (const member of state.members) {
    if (typeof member.id !== 'string' || !member.id || ids.has(member.id) || typeof member.living !== 'boolean')
      throw new Error('Invalid radiant squad member.');
    ids.add(member.id);
    personalUnits(member.charge);
    if (member.charge > personalChargeMaximum(member)) throw new Error('Personal charge exceeds its unlocked layers.');
  }
  integer(state.sharedUnits, 0, 'shared charge');
  if (state.sharedUnits > sharedChargeThreshold(state.eternalCasts))
    throw new Error('Shared charge exceeds its current threshold.');
  if (!state.members.some(member => member.form === 6) && state.sharedUnits !== 0)
    throw new Error('Shared charge is unavailable without a final-form squad member.');
}
function actor(state: RadiantGaugeState, id: string): RadiantGaugeMember {
  const member = state.members.find(entry => entry.id === id);
  if (!member) throw new Error('Radiant charge actor is not in this squad.');
  if (!member.living) throw new Error('A defeated bearer cannot receive or spend action charge.');
  return member;
}
export function readyFlare(state: RadiantGaugeState, id: string): FlareTier | null {
  validateRadiantGauge(state);
  const member = actor(state, id);
  if (member.charge < member.baseCost) return null;
  if (member.form < 4 || member.charge < member.baseCost * 2) return 'glowing';
  return member.form === 6 && state.sharedUnits === sharedChargeThreshold(state.eternalCasts)
    ? 'eternal' : 'lustrous';
}
export function spendReadyFlare(state: RadiantGaugeState, id: string): { state: RadiantGaugeState; tier: FlareTier } {
  const tier = readyFlare(state, id);
  if (!tier) throw new Error('This bearer has no ready Flare.');
  const next = structuredClone(state);
  const member = actor(next, id);
  member.charge = (personalUnits(member.charge) -
    member.baseCost * (tier === 'glowing' ? 1 : 2) * personalChargeUnit) / personalChargeUnit;
  if (tier === 'eternal') {
    integer(next.eternalCasts + 1, 1, 'cast count');
    next.eternalCasts += 1;
    next.sharedUnits = 0;
  }
  validateRadiantGauge(next);
  return { state: next, tier };
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
  if (!next.members.some(member => member.id === id)) throw new Error('Radiant drop owner is not in this squad.');
  const allyUnits = amount * (personalChargeUnit * radiantChargeRules.otherMemberPercent / 100);
  integer(allyUnits, 0, 'shared drop units');
  for (const member of next.members) {
    if (!member.living) continue;
    const units = member.id === id ? amount * personalChargeUnit : allyUnits;
    addPersonalUnits(member, units);
  }
  validateRadiantGauge(next);
  return next;
}
export function radiantHitDrop(
  action: 'normal' | 'flare', previousRolls: number, roll: () => number,
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
  return { amount: (action === 'normal' ? radiantChargeRules.normal : radiantChargeRules.flareHit) + bonusOffered,
    bonusRolls, bonusOffered };
}
function addShared(state: RadiantGaugeState, units: number): void {
  if (!state.members.some(member => member.form === 6)) return;
  state.sharedUnits += Math.min(sharedChargeThreshold(state.eternalCasts) - state.sharedUnits, units);
}
export function grantRadiantAction(
  state: RadiantGaugeState, id: string, action: 'normal' | 'defense' | 'flare' | 'eternal', qualifyingDirectHits: number,
): { state: RadiantGaugeState } {
  validateRadiantGauge(state);
  actor(state, id);
  integer(qualifyingDirectHits, 0, 'direct hit count');
  if (!['normal', 'defense', 'flare', 'eternal'].includes(action)) throw new Error('Invalid radiant charge action.');
  if (action === 'normal' && qualifyingDirectHits > 1) throw new Error('Normal Attack has one mechanical charge hit.');
  if (action === 'defense' && qualifyingDirectHits !== 0) throw new Error('Defense cannot generate attack-hit motes.');
  const next = structuredClone(state);
  const member = actor(next, id);
  const qualifies = qualifyingDirectHits > 0;
  if (action === 'defense') addRadiantPersonalCharge(member, radiantChargeRules.defense);
  if (action !== 'eternal' && (action !== 'normal' || qualifies))
    addShared(next, (action === 'flare' ? 12 : 6) * sharedChargeUnit / next.members.length);
  validateRadiantGauge(next);
  return { state: next };
}
export function grantRadiantIncomingAttack(state: RadiantGaugeState, id: string): RadiantGaugeState {
  validateRadiantGauge(state);
  const next = structuredClone(state);
  addRadiantPersonalCharge(actor(next, id), radiantChargeRules.incomingAttack);
  validateRadiantGauge(next);
  return next;
}
export function grantRadiantRound(state: RadiantGaugeState): RadiantGaugeState {
  validateRadiantGauge(state);
  if (!state.members.some(member => member.living)) throw new Error('A defeated squad cannot earn round charge.');
  const next = structuredClone(state);
  next.members.filter(member => member.living).forEach(member => addRadiantPersonalCharge(member, radiantChargeRules.round));
  addShared(next, 18 * sharedChargeUnit);
  validateRadiantGauge(next);
  return next;
}
