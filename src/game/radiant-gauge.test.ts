import { describe, expect, it, vi } from 'vitest';
import { grantRadiantAction, grantRadiantRound, personalChargeMaximum, readyFlare, sharedChargeThreshold,
  sharedChargeUnit, spendReadyFlare, validateRadiantGauge, type RadiantGaugeState } from './radiant-gauge';

function fixture(form = 6, size = 1): RadiantGaugeState {
  return { members: Array.from({ length: size }, (_, index) => ({
    id: `member-${index}`, form, baseCost: 30, charge: 0, living: true,
  })), sharedUnits: 0, eternalCasts: 0 };
}
describe('isolated radiant charge foundation', () => {
  it.each([1, 2, 3, 4, 5, 6])('unlocks the correct personal layers at saved form%i', form => {
    const state = fixture(form);
    expect(personalChargeMaximum(state.members[0])).toBe(form < 4 ? 30 : 60);
    expect(readyFlare(state, 'member-0')).toBeNull();
    state.members[0].charge = 30;
    expect(readyFlare(state, 'member-0')).toBe('glowing');
    if (form >= 4) {
      state.members[0].charge = 60;
      expect(readyFlare(state, 'member-0')).toBe('lustrous');
    }
  });
  it('retains incomplete overcharge after a Glowing cast without mutating its input', () => {
    const state = fixture(4);
    state.members[0].charge = 45;
    const result = spendReadyFlare(state, 'member-0');
    expect(result.tier).toBe('glowing');
    expect(result.state.members[0].charge).toBe(15);
    expect(state.members[0].charge).toBe(45);
  });
  it('allows one Eternal and leaves other personal bars charged but not Eternal-ready', () => {
    const state = fixture(6, 3);
    state.members.forEach(member => { member.charge = 60; });
    state.sharedUnits = sharedChargeThreshold(0);
    state.members[2].form = 4;
    expect(readyFlare(state, 'member-2')).toBe('lustrous');
    const cast = spendReadyFlare(state, 'member-0');
    expect(cast.tier).toBe('eternal');
    expect(cast.state.members.map(member => member.charge)).toEqual([0, 60, 60]);
    expect(cast.state.sharedUnits).toBe(0);
    expect(cast.state.eternalCasts).toBe(1);
    expect(readyFlare(cast.state, 'member-1')).toBe('lustrous');
    expect(state.sharedUnits).toBe(100 * sharedChargeUnit);
  });
  it('does not use shared fullness to bypass an incomplete second personal layer', () => {
    const state = fixture();
    state.sharedUnits = sharedChargeThreshold(0);
    state.members[0].charge = 59;
    expect(spendReadyFlare(state, 'member-0').tier).toBe('glowing');
  });
  it.each([1, 2, 3, 4, 5, 6])('normalizes guaranteed shared charge for %i starting members exactly', size => {
    let state = fixture(6, size);
    for (const member of state.members) state = grantRadiantAction(state, member.id, 'normal', 1, () => .5).state;
    state = grantRadiantRound(state);
    expect(state.sharedUnits).toBe(24 * sharedChargeUnit);
    expect(state.members.every(member => member.charge === 25)).toBe(true);
  });
  it('uses the starting member count after death and gives no personal round grant to the defeated', () => {
    const state = fixture(6, 6);
    state.members[5].living = false;
    const next = grantRadiantRound(grantRadiantAction(state, 'member-0', 'normal', 1, () => .5).state);
    expect(next.sharedUnits).toBe(19 * sharedChargeUnit);
    expect(next.members[5].charge).toBe(0);
  });
  it('does not accumulate hidden shared charge before any final-form member is equipped', () => {
    const state = fixture(5, 6);
    const next = grantRadiantRound(grantRadiantAction(state, 'member-0', 'normal', 1, () => 0).state);
    expect(next.sharedUnits).toBe(0);
  });
  it('caps bonus rolls and grants at two even at full personal charge', () => {
    const state = fixture();
    state.members[0].charge = 60;
    const roll = vi.fn(() => 0);
    const result = grantRadiantAction(state, 'member-0', 'flare', 6, roll);
    expect(roll).toHaveBeenCalledTimes(2);
    expect(result.bonusOffered).toBe(10);
    expect(result.state.members[0].charge).toBe(60);
  });
  it('rejects invalid RNG and leaves input untouched', () => {
    const state = fixture(), before = structuredClone(state);
    expect(() => grantRadiantAction(state, 'member-0', 'normal', 1, () => 1)).toThrow('roll');
    expect(state).toEqual(before);
  });
  it('does not let Eternal fund its own shared resource and rejects cosmetic Normal multi-hits', () => {
    const state = fixture();
    expect(grantRadiantAction(state, 'member-0', 'eternal', 1, () => .5).state.sharedUnits).toBe(0);
    expect(() => grantRadiantAction(state, 'member-0', 'normal', 3, () => .5)).toThrow('one mechanical');
  });
  it('rejects malformed charge, unknown/defeated actors and seven-member squads', () => {
    expect(() => validateRadiantGauge(fixture(6, 7))).toThrow('one to six');
    const state = fixture();
    expect(() => readyFlare(state, 'missing')).toThrow('not in');
    state.members[0].living = false;
    expect(() => readyFlare(state, 'member-0')).toThrow('defeated');
    state.members[0].charge = 61;
    expect(() => validateRadiantGauge(state)).toThrow('unlocked layers');
    expect(() => sharedChargeThreshold(Number.MAX_SAFE_INTEGER + 1)).toThrow('cast count');
  });
});
