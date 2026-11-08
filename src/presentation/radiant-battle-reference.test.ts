import { describe, expect, it } from 'vitest';
import { radiantBattleReference, radiantConduitDescription, radiantFlareDescription,
  radiantFlareNeedsTarget, radiantLeaderReference } from './radiant-battle-reference';
import { radiantFlares, radiantMasters, radiantStarterKits, releasedRadiantIds,
  type RadiantLoadout, type RadiantMasterId } from '../content/radiant-combat';
import { radiantConduits, radiantConduitPrimitives } from '../content/radiant-conduits';
import { type ConduitId } from '../content/conduits';
import { createRadiantCombat, applyRadiantCombatAction } from '../game/radiant-combat';
import { escapeDialogText } from './game-dialog';

function loadout(starter: RadiantLoadout['starter'], masterId: RadiantMasterId | null = null): RadiantLoadout {
  return { id: starter, starter, masterId, form: 6, level: 105, weaponRank: 0, ascension: {} };
}
describe('complete frozen Radiant battle reference', () => {
  it.each(releasedRadiantIds.map(id => ({ id })))('covers all three authored Flare offers for $id without mutating content', ({ id }) => {
    const member = loadout(id), before = structuredClone(radiantFlares[id]);
    const html = radiantBattleReference(member, radiantStarterKits[id].baseCost);
    for (const tier of ['glowing', 'lustrous', 'eternal'] as const) {
      expect(html).toContain(radiantFlares[id][tier].name);
      const lines = radiantFlareDescription(radiantFlares[id][tier]);
      expect(lines.length).toBeGreaterThan(0);
      expect(html).toContain(`data-radiant-reference-tier="${tier}"`);
      if (radiantFlares[id][tier].damage) expect(lines.join(' ')).toContain('before Defense mitigation');
      if (radiantFlares[id][tier].heal) expect(lines.join(' ')).toContain('no revival');
      if (radiantFlares[id][tier].shieldHP) expect(lines.join(' ')).toContain('recipient maximum HP');
    }
    expect(radiantFlares[id]).toEqual(before);
    expect(html).not.toContain('undefined'); expect(html).not.toContain('NaN');
  });
  it('every installed Master has its actual effect and selected-target predicate agrees with real combat', () => {
    expect(Object.keys(radiantMasters)).toHaveLength(96);
    for (const [id, master] of Object.entries(radiantMasters)) {
      const member = loadout(master.starter, id as RadiantMasterId);
      const html = radiantBattleReference(member, radiantStarterKits[master.starter].baseCost);
      expect(html).toContain('Personal Master');
      expect(html).toContain(escapeDialogText(master.effect));
      const state = createRadiantCombat([member], [{ id: 'enemy', stats: { hp: 1000000, attack: 100, defense: 100, recovery: 100 }, currencyBudget: 30000 }], 1);
      state.gauge.members[0].charge = state.gauge.members[0].baseCost;
      const targeted = radiantFlareNeedsTarget(member, 'glowing');
      const result = applyRadiantCombatAction(state, { type: 'flare', bearerId: member.id, ...(targeted ? { targetId: 'enemy' } : {}) });
      expect(result.events.some(event => event.type === 'flare')).toBe(true);
      if (targeted) expect(() => applyRadiantCombatAction(state, { type: 'flare', bearerId: member.id })).toThrow('selected');
    }
  });
  it('all99 ordinary Conduits display current converted primitives and rank5 magnitudes, not legacy effect text', () => {
    expect(Object.keys(radiantConduits)).toHaveLength(99);
    for (const id of Object.keys(radiantConduits) as ConduitId[]) {
      for (const primitive of radiantConduitPrimitives({ id, rank: 5 })) {
        const description = radiantConduitDescription(primitive);
        expect(description).toMatch(/[0-9]/);
        expect(description).not.toContain('undefined'); expect(description).not.toContain('NaN');
      }
    }
    expect(radiantConduitDescription({ kind: 'shared-normal', amount: 270 })).toContain('4.5 shared charge');
    expect(radiantConduitDescription({ kind: 'normal-weaken', amount: 1.2 })).toContain('80%');
    const member = loadout('ember'); member.gear = [{ id: 'vigil-core', rank: 5 }, ...Array.from({ length: 7 }, () => null)];
    expect(radiantBattleReference(member, 30)).toContain('Frozen maximum HP +30%');
  });
  it('leader bonus reflects frozen ascension/Master/gear and displayed life state, never promotes another member', () => {
    const member = loadout('rosetta', 'master-rosetta-3'); member.ascension.skill2 = true;
    const state = createRadiantCombat([member, loadout('tide')], [{ id: 'enemy', stats: { hp: 1000, attack: 1, defense: 1, recovery: 1 }, currencyBudget: 1 }], 1);
    const bonus = radiantStarterKits.rosetta.leaderBonus * 1.5 + .05;
    expect(radiantLeaderReference(state)).toContain(`${Number((bonus * 100).toPrecision(12))}%`);
    expect(radiantLeaderReference(state, false)).toContain('Inactive: leader defeated');
    expect(radiantLeaderReference(state, false)).not.toContain('Tizu');
    expect(state.bearers[0].hp).toBeGreaterThan(0);
  });
  it('future tiers and saved enhancements are explicitly separated from authored baseline coefficients', () => {
    const member = loadout('sprout', 'master-sprout-3');
    member.form = 1; member.level = 30; member.ascension.lastFlare = true;
    const html = radiantBattleReference(member, 20);
    expect(html.match(/Future form tier/g)).toHaveLength(2);
    expect(html).toContain('Saved signature magnitude ×1.5');
    expect(html).toContain('one additional round');
    expect(html).toContain('even if immediate healing restores no HP');
    expect(html).toContain('not guaranteed final damage/healing amounts');
  });
});
