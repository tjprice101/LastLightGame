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

export const sharedChargeUnit = 60;
export const radiantChargeRules = {
  normal: 20,
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
    integer(member.charge, 0, 'personal charge');
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
  member.charge -= member.baseCost * (tier === 'glowing' ? 1 : 2);
  if (tier === 'eternal') {
    integer(next.eternalCasts + 1, 1, 'cast count');
    next.eternalCasts += 1;
    next.sharedUnits = 0;
  }
  validateRadiantGauge(next);
  return { state: next, tier };
}
function addPersonal(member: RadiantGaugeMember, amount: number): void {
  integer(amount, 0, 'charge grant');
  const remaining = personalChargeMaximum(member) - member.charge;
  member.charge += Math.min(remaining, amount);
}
function addShared(state: RadiantGaugeState, units: number): void {
  if (!state.members.some(member => member.form === 6)) return;
  state.sharedUnits += Math.min(sharedChargeThreshold(state.eternalCasts) - state.sharedUnits, units);
}
export function grantRadiantAction(
  state: RadiantGaugeState, id: string, action: 'normal' | 'defense' | 'flare' | 'eternal', qualifyingDirectHits: number,
  roll: () => number,
): { state: RadiantGaugeState; bonusRolls: number; bonusOffered: number } {
  validateRadiantGauge(state);
  actor(state, id);
  integer(qualifyingDirectHits, 0, 'direct hit count');
  if (!['normal', 'defense', 'flare', 'eternal'].includes(action)) throw new Error('Invalid radiant charge action.');
  if (action === 'normal' && qualifyingDirectHits > 1) throw new Error('Normal Attack has one mechanical charge hit.');
  if (action === 'defense' && qualifyingDirectHits !== 0) throw new Error('Defense cannot generate attack-hit motes.');
  const next = structuredClone(state);
  const member = actor(next, id);
  const qualifies = qualifyingDirectHits > 0;
  if (action === 'normal' && qualifies) addPersonal(member, radiantChargeRules.normal);
  if (action === 'defense') addPersonal(member, radiantChargeRules.defense);
  const bonusRolls = action === 'defense' ? 0 : Math.min(qualifyingDirectHits, radiantChargeRules.maximumBonusRolls);
  let bonusOffered = 0;
  for (let index = 0; index < bonusRolls; index++) {
    const value = roll();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('Invalid radiant bonus-charge roll.');
    if (value < radiantChargeRules.bonusChance) bonusOffered += radiantChargeRules.bonusAmount;
  }
  addPersonal(member, bonusOffered);
  if (action !== 'eternal' && (action !== 'normal' || qualifies))
    addShared(next, (action === 'flare' ? 12 : 6) * sharedChargeUnit / next.members.length);
  validateRadiantGauge(next);
  return { state: next, bonusRolls, bonusOffered };
}
export function grantRadiantIncomingAttack(state: RadiantGaugeState, id: string): RadiantGaugeState {
  validateRadiantGauge(state);
  const next = structuredClone(state);
  addPersonal(actor(next, id), radiantChargeRules.incomingAttack);
  validateRadiantGauge(next);
  return next;
}
export function grantRadiantRound(state: RadiantGaugeState): RadiantGaugeState {
  validateRadiantGauge(state);
  if (!state.members.some(member => member.living)) throw new Error('A defeated squad cannot earn round charge.');
  const next = structuredClone(state);
  next.members.filter(member => member.living).forEach(member => addPersonal(member, radiantChargeRules.round));
  addShared(next, 18 * sharedChargeUnit);
  validateRadiantGauge(next);
  return next;
}
