import { describe, expect, it, vi } from 'vitest';
import { addRadiantPersonalCharge, grantRadiantAction, grantRadiantDrop, grantRadiantRound, personalChargeMaximum,
  radiantHitDrop, readyFlare, spendReadyFlare, validateRadiantGauge,
  type RadiantGaugeState } from './combat-gauge';

function fixture(form = 6, size = 1, convergenceRank = 1): RadiantGaugeState {
  return { members: Array.from({ length: size }, (_, index) => ({
    id: `member-${index}`, elementId: 'infernic', form, convergenceRank, baseCost: 30, charge: 0, living: true,
  })) };
}
describe('isolated radiant charge foundation', () => {
  it.each([1, 2, 3, 4, 5, 6])('preserves personal capacity at saved form%i without unlocking higher ranks', form => {
    const state = fixture(form);
    expect(personalChargeMaximum(state.members[0])).toBe(form < 4 ? 30 : 60);
    expect(readyFlare(state, 'member-0')).toBeNull();
    state.members[0].charge = 30;
    expect(readyFlare(state, 'member-0')).toBe('sparkling');
    if (form >= 4) {
      state.members[0].charge = 60;
      expect(readyFlare(state, 'member-0')).toBe('sparkling');
    }
  });
  it('unlocks tiers from saved rank and enforces their evolution requirements', () => {
    const sparkling = fixture(6, 1, 5);
    sparkling.members[0].charge = 30;
    expect(readyFlare(sparkling, 'member-0')).toBe('sparkling');
    const glimmering = fixture(4, 1, 6);
    glimmering.members[0].charge = 60;
    expect(readyFlare(glimmering, 'member-0')).toBe('glimmering');
    const ultimate = fixture(6, 1, 11);
    ultimate.members[0].charge = 60;
    expect(readyFlare(ultimate, 'member-0')).toBe('ultimate');
    expect(() => validateRadiantGauge(fixture(3, 1, 6))).toThrow('evolution unlock');
    expect(() => validateRadiantGauge(fixture(5, 1, 11))).toThrow('evolution unlock');
  });
  it('retains incomplete charge after a Sparkling cast without mutating its input', () => {
    const state = fixture(4);
    state.members[0].charge = 45;
    const result = spendReadyFlare(state, 'member-0');
    expect(result.tier).toBe('sparkling');
    expect(result.state.members[0].charge).toBe(15);
    expect(state.members[0].charge).toBe(45);
  });
  it('spends each bearer’s personal saved rank independently', () => {
    const state = fixture(6, 3, 11);
    state.members.forEach(member => { member.charge = 60; });
    state.members[2].form = 4;
    state.members[2].convergenceRank = 6;
    expect(readyFlare(state, 'member-2')).toBe('glimmering');
    const cast = spendReadyFlare(state, 'member-0');
    expect(cast.tier).toBe('ultimate');
    expect(cast.state.members.map(member => member.charge)).toEqual([0, 60, 60]);
    expect(readyFlare(cast.state, 'member-1')).toBe('ultimate');
    expect(state.members[0].charge).toBe(60);
  });
  it('grants incoming-hit Luminosity only to the living recipient and nothing at round end', () => {
    const state = fixture(6, 6);
    state.members[5].living = false;
    const drop = grantRadiantDrop(state, 'member-0', 20);
    const next = grantRadiantRound(grantRadiantAction(drop, 'member-0', 'normal', 1).state);
    expect(next.members.map(member => member.charge)).toEqual([20, 2, 2, 2, 2, 0]);
    expect(next.members[5].charge).toBe(0);
  });
  it('does not create charge at round end', () => {
    const state = fixture(5, 6);
    const next = grantRadiantRound(grantRadiantAction(state, 'member-0', 'normal', 1).state);
    expect(next.members.every(member => member.charge === 0)).toBe(true);
  });
  it('does not roll bonuses or generate personal charge from Convergent Light', () => {
    let state = fixture(6, 2);
    state.members[0].charge = 60;
    const roll = vi.fn(() => 0);
    let rolls = 0, offered = 0;
    for (let index = 0; index < 6; index++) {
      const drop = radiantHitDrop('flare', rolls, roll);
      rolls += drop.bonusRolls; offered += drop.bonusOffered;
      expect(drop.amount).toBe(0);
    }
    expect(roll).not.toHaveBeenCalled();
    expect(offered).toBe(0);
    expect(state.members.map(member => member.charge)).toEqual([60, 0]);
  });
  it('does not invoke unused RNG and leaves input untouched', () => {
    const state = fixture(), before = structuredClone(state);
    expect(radiantHitDrop('normal', 0, () => 1).amount).toBe(10);
    expect(() => radiantHitDrop('normal', 1, () => 0)).toThrow('roll');
    expect(state).toEqual(before);
  });
  it('does not let Convergent Light generate Luminosity and rejects cosmetic Normal multi-hits', () => {
    const state = fixture();
    expect(grantRadiantAction(state, 'member-0', 'flare', 1).state).toEqual(state);
    expect(() => grantRadiantAction(state, 'member-0', 'normal', 3)).toThrow('one mechanical');
  });
  it.each([1, 2, 3, 4, 5, 6])('gives the attacker the full drop and each of %i-member squad its own ten percent', size => {
    const state = fixture(6, size), before = structuredClone(state);
    const next = grantRadiantDrop(state, 'member-0', 25);
    expect(next.members.map(member => member.charge)).toEqual([25, ...Array(size - 1).fill(2.5)]);
    expect(state).toEqual(before);
  });
  it('accumulates fractional shares exactly, preserves them when spending and respects caps', () => {
    let state = fixture(6, 3);
    state.members[1].charge = 29.9;
    state.members[2].charge = 59.9;
    state = grantRadiantDrop(state, 'member-0', 1);
    expect(state.members.map(member => member.charge)).toEqual([1, 30, 60]);
    expect(readyFlare(state, 'member-1')).toBe('sparkling');
    for (let index = 0; index < 9; index++) state = grantRadiantDrop(state, 'member-0', 1);
    expect(state.members.map(member => member.charge)).toEqual([10, 30.9, 60]);
    state = spendReadyFlare(state, 'member-1').state;
    expect(state.members[1].charge).toBe(.9);
    addRadiantPersonalCharge(state.members[1], 5);
    expect(state.members[1].charge).toBe(5.9);
    validateRadiantGauge(state);
  });
  it('rejects defeated drop sources without reviving or redistributing their charge', () => {
    const state = fixture(6, 4);
    state.members[0].living = false;
    state.members[2].charge = 60;
    state.members[3].living = false;
    const before = structuredClone(state);
    expect(() => grantRadiantDrop(state, 'member-0', 5)).toThrow('defeated');
    expect(state).toEqual(before);
    expect(() => grantRadiantDrop(state, 'missing', 5)).toThrow('not in');
    expect(() => grantRadiantDrop(state, 'member-0', 0)).toThrow('drop');
  });
  it('rejects fractional precision that is not an exact tenth', () => {
    const state = fixture();
    state.members[0].charge = 1.05;
    expect(() => validateRadiantGauge(state)).toThrow('personal charge');
    state.members[0].charge = 60.1;
    expect(() => validateRadiantGauge(state)).toThrow('unlocked layers');
  });
  it('rejects malformed charge, unknown/defeated actors and seven-member squads', () => {
    expect(() => validateRadiantGauge(fixture(6, 7))).toThrow('one to six');
    const state = fixture();
    expect(() => readyFlare(state, 'missing')).toThrow('not in');
    state.members[0].living = false;
    expect(() => readyFlare(state, 'member-0')).toThrow('defeated');
    state.members[0].charge = 61;
    expect(() => validateRadiantGauge(state)).toThrow('unlocked layers');
  });
});
