import { describe, expect, it } from 'vitest';
import { radiantBattleReference, radiantConduitDescription, radiantFlareDescription,
  radiantFlareNeedsTarget, radiantLeaderReference } from './battle-reference';
import { radiantFlares, radiantFinalFlare, radiantLeaderBonus, radiantPassiveAmount, radiantMasters, radiantStarterKits, releasedRadiantIds,
  type RadiantLoadout, type RadiantMasterId } from '../content/combat-kits';
import { radiantConduits, radiantConduitPrimitives } from '../content/conduit-effects';
import { type ConduitId } from '../content/conduits';
import { createRadiantCombat, applyRadiantCombatAction } from '../game/combat-engine';
import { escapeDialogText } from './game-dialog';
import { radiantPassiveArticle } from './character-combat';

function loadout(starter: RadiantLoadout['starter'], masterId: RadiantMasterId | null = null): RadiantLoadout {
  return { id: starter, starter, masterId, form: 6, level: 105, convergenceRank: 1, weaponRank: 0, ascension: {} };
}
describe('complete frozen Radiant battle reference', () => {
  it.each(releasedRadiantIds.map(id => ({ id })))('covers all three authored Flare offers for $id without mutating content', ({ id }) => {
    const member = loadout(id), before = structuredClone(radiantFlares[id]);
    const html = radiantBattleReference(member, radiantStarterKits[id].baseCost);
    for (const tier of ['sparkling', 'glimmering', 'ultimate'] as const) {
      expect(html).toContain(radiantFlares[id][tier].name);
      const lines = radiantFlareDescription(radiantFlares[id][tier]);
      expect(lines.length).toBeGreaterThan(0);
      expect(html).toContain(`data-radiant-reference-tier="${tier}"`);
      if (radiantFlares[id][tier].damage) expect(lines.join(' ')).toContain('Attack total');
      if (radiantFlares[id][tier].heal) expect(lines.join(' ')).toContain('no revival');
      if (radiantFlares[id][tier].shieldHP) expect(lines.join(' ')).toContain('recipient maximum Health');
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
      const state = createRadiantCombat([member], [{ elementId: null, id: 'enemy', stats: { hp: 1000000, attack: 100, defense: 100, recovery: 100 }, currencyBudget: 30000 }], 1);
      state.gauge.members[0].charge = state.gauge.members[0].baseCost;
      const targeted = radiantFlareNeedsTarget(member, 'sparkling');
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
    expect(radiantConduitDescription({ kind: 'normal-charge', amount: 270 })).toContain('additional personal charge');
    expect(radiantConduitDescription({ kind: 'normal-weaken', amount: 1.2 })).toContain('80%');
    const member = loadout('ember'); member.gear = [{ id: 'vigil-core', rank: 5 }, ...Array.from({ length: 7 }, () => null)];
    expect(radiantBattleReference(member, 30)).toContain('Maximum Health +30%');
  });
  it('leader bonus reflects frozen ascension/Master/gear and displayed life state, never promotes another member', () => {
    const member = loadout('rosetta', 'master-rosetta-3'); member.ascension.skill2 = true;
    const state = createRadiantCombat([member, loadout('tide')], [{ elementId: null, id: 'enemy', stats: { hp: 1000, attack: 1, defense: 1, recovery: 1 }, currencyBudget: 1 }], 1);
    const bonus = radiantLeaderBonus(member);
    expect(radiantLeaderReference(state)).toContain(`${Number((bonus * 100).toPrecision(12))}%`);
    expect(radiantLeaderReference(state, false)).toContain('Inactive: leader defeated');
    expect(radiantLeaderReference(state, false)).not.toContain('Tizu');
    expect(state.bearers[0].hp).toBeGreaterThan(0);
  });
  it('marks future tiers and shows already-enhanced coefficients without a second hidden multiplier', () => {
    const member = loadout('sprout', 'master-sprout-3');
    member.form = 1; member.level = 30; member.ascension.lastFlare = true;
    const html = radiantBattleReference(member, 20);
    expect(html.match(/Locked · Rank/g)).toHaveLength(2);
    expect(html).toContain('240% caster Recovery');
    expect(radiantFinalFlare(member, 'sparkling').heal).toBeCloseTo(2.4);
    expect(html).toContain('coefficients include evolution, rank, saved Imbues and personal Master enhancements');
    expect(html).not.toContain('Saved signature magnitude');
  });
  it.each(['aurora', 'ilyss'] as const)('shows %s actual enhanced squad passive, not retired cleanse effects', id => {
    const member = loadout(id);
    member.ascension.skill1 = true;
    for (const html of [radiantPassiveArticle(member), radiantBattleReference(member, radiantStarterKits[id].baseCost)]) {
      expect(html).toContain(`${Number((radiantPassiveAmount(member) * 100).toPrecision(12))}%`);
      expect(html).toContain('while this bearer is alive');
      expect(html).not.toContain('Weaken this passive removes');
    }
  });
});
