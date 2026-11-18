import { describe, expect, it, vi } from 'vitest';
import { elements } from '../content/activities';
import { elementDamageMultiplier, elementWeaknesses } from '../content/element-matchups';
import { characterName } from '../content/character-art';
import { getStarter } from '../content/starters';
import { radiantBearerKits, radiantFinalFlare, radiantLeaderBonus, radiantLeaderEffects, radiantMasters,
  releasedRadiantIds, type RadiantBearerId, type RadiantLoadout, type RadiantMasterId } from '../content/combat-kits';
import { radiantConduits } from '../content/conduit-effects';
import { applyRadiantCombatAction, createRadiantCombat, effectiveRadiantStats, radiantDirectDamage,
  validateRadiantCombat } from './combat-engine';
import { grantRadiantDrop, grantRadiantRound, personalChargeMaximum, radiantHitDrop, readyFlare } from './combat-gauge';

function loadout(id: RadiantBearerId, form = 6, convergenceRank = 1): RadiantLoadout {
  return { id, starter: id, level: (convergenceRank - 1) * 5, form, convergenceRank,
    masterId: null, weaponRank: 0, ascension: {} };
}
function fixture(ids: RadiantBearerId[] = ['ember'], form = 6, enemyHP = 100000) {
  return createRadiantCombat(ids.map(id => loadout(id, form)), [{
    id: 'enemy', elementId: null, stats: { hp: enemyHP, attack: 100, defense: 0, recovery: 0 }, currencyBudget: 10,
  }], 1);
}

describe('consolidated live combat contract', () => {
  it.each(releasedRadiantIds)('%s retains its identity, carries its Phase 3 kit and keeps 100/200 capacity', id => {
    const kit = radiantBearerKits[id];
    expect(kit.baseCost).toBe(100);
    expect(kit.passive.name && kit.passive.description).toBeTruthy();
    expect([kit.kit.skill1.name, kit.kit.skill2.name, kit.kit.flare.name].every(Boolean)).toBe(true);
    expect(['Tank', 'Attacker', 'Support']).toContain(kit.role);
    expect(characterName(id)).toBe(getStarter(id).name);
    const names = Array.from({ length: 6 }, (_, index) => characterName(id, index + 1));
    expect(new Set(names).size).toBe(6);
    for (let form = 1; form <= 6; form++) {
      const state = fixture([id], form), member = state.gauge.members[0];
      expect(personalChargeMaximum(member)).toBe(form < 4 ? 100 : 200);
      member.charge = 100;
      expect(readyFlare(state.gauge, id)).toBe('sparkling');
      if (form >= 4) {
        member.charge = 200;
        expect(readyFlare(state.gauge, id)).toBe('sparkling');
      }
    }
  });

  it('gives 15 Normal Luminosity and a separate 1.5 only to living same-element allies (D-473 N1)', () => {
    const sameElement = releasedRadiantIds.find(id => id !== 'ember' && radiantBearerKits[id].elementId === 'infernic')!;
    const state = fixture(['ember', sameElement, 'tide']);
    const next = applyRadiantCombatAction(state, { type: 'normal', bearerId: 'ember', targetId: 'enemy' });
    expect(next.state.gauge.members.map(member => member.charge)).toEqual([15, 1.5, 0]);
    expect(next.events.filter(event => event.type === 'gauge-drop')).toHaveLength(1);
    expect(next.state.chargeSeed).toBe(state.chargeSeed);
    next.state.gauge.members[1].living = false;
    expect(grantRadiantDrop(next.state.gauge, 'ember', 10).members.map(member => member.charge)).toEqual([25, 1.5, 0]);
    expect(state.gauge.members.every(member => member.charge === 0)).toBe(true);
  });

  it('does not roll random bonuses or grant skill, Convergent Light, defeat or personal round charge', () => {
    const roll = vi.fn(() => 0);
    expect(radiantHitDrop('normal', 0, roll)).toEqual({ amount: 15, bonusRolls: 0, bonusOffered: 0 });
    expect(radiantHitDrop('flare', 0, roll).amount).toBe(0);
    expect(roll).not.toHaveBeenCalled();
    const state = fixture();
    state.gauge.members[0].charge = 25;
    const skill = applyRadiantCombatAction(state, { type: 'skill', bearerId: 'ember', slot: 1, targetId: 'enemy' });
    expect(skill.state.gauge.members[0].charge).toBe(0);
    expect(skill.events.some(event => event.type === 'gauge-drop')).toBe(false);
    expect(grantRadiantRound(state.gauge).members[0].charge).toBe(25);
    const result = applyRadiantCombatAction(fixture(['ember'], 6, 1), { type: 'normal', bearerId: 'ember', targetId: 'enemy' });
    expect(result.state.gauge.members[0].charge).toBe(15);
    expect(result.events.filter(event => event.type === 'gauge-drop')).toHaveLength(1);
  });

  it('grants 10 per surviving incoming direct hit through Shields, plus the Tizu full-block refund, without sharing', () => {
    const state = fixture(['ember', 'tide']);
    state.phase = 'enemy';
    state.acted = ['ember', 'tide'];
    state.bearers[0].shields.push({ id: state.nextShieldId++, source: { kind: 'flare', bearerId: 'tide' }, remaining: 1000 });
    const next = applyRadiantCombatAction(state, {
      type: 'enemy-attack', enemyId: 'enemy', targetIds: ['ember'], coefficient: 1, hits: 3,
    });
    // Each fully blocked hit: +10 incoming and +8 from Stillwater Guard (Tizu's Shield).
    expect(next.state.gauge.members.map(member => member.charge)).toEqual([54, 0]);
    expect(next.state.bearers[0].hp).toBe(state.bearers[0].hp);
    expect(next.events.filter(event => event.type === 'charge')).toHaveLength(6);
  });

  it.each([['sparkling', 1, 1, 100, 4], ['glimmering', 4, 6, 200, 8], ['ultimate', 6, 11, 200, 12]] as const)(
    '%s rank splits one authored total across %i charge / %i actual hits without refilling itself',
    (tier, form, rank, charge, hits) => {
      const state = createRadiantCombat([loadout('ember', form, rank)], [{
        id: 'enemy', elementId: null, stats: { hp: 100000, attack: 100, defense: 0, recovery: 0 }, currencyBudget: 10,
      }], 1);
      state.gauge.members[0].charge = charge;
      const offer = radiantFinalFlare(state.bearers[0].loadout, tier);
      // Infernis is an Attacker: Skill Power 1.5 scales the Flare (D-473 N4, O5).
      const expected = radiantDirectDamage(effectiveRadiantStats(state, 'ember').attack, 0, offer.damage * 1.5);
      const next = applyRadiantCombatAction(state, { type: 'flare', bearerId: 'ember' });
      const packets = next.events.filter(event => event.type === 'damage' && event.source.kind === 'flare' && event.origin === 'direct');
      expect(packets).toHaveLength(hits);
      expect(packets.reduce((sum, event) => sum + (event.type === 'damage' ? event.offered : 0), 0)).toBe(expected);
      expect(next.state.gauge.members[0].charge).toBe(0);
      expect(next.events.some(event => event.type === 'gauge-drop')).toBe(false);
    });

  it('no longer adds squad-stat Passives: effective Attack is the frozen stat without timed effects', () => {
    const state = fixture(['ember', 'crinso']);
    expect(effectiveRadiantStats(state, 'ember').attack).toBe(state.bearers[0].stats.attack);
    state.bearers[1].hp = 0;
    state.gauge.members[1].living = false;
    expect(effectiveRadiantStats(state, 'ember').attack).toBe(state.bearers[0].stats.attack);
    validateRadiantCombat(state);
  });

  it('restricts the fixed leader bonus to matching-element attacks and never promotes another leader', () => {
    const state = fixture(['ember', 'tide']);
    const attack = effectiveRadiantStats(state, 'tide').attack;
    const next = applyRadiantCombatAction(state, { type: 'normal', bearerId: 'tide', targetId: 'enemy' });
    const packet = next.events.find(event => event.type === 'damage');
    expect(packet?.type === 'damage' && packet.offered).toBe(radiantDirectDamage(attack, 0, 1));
    state.bearers[0].hp = 0;
    state.gauge.members[0].living = false;
    const afterDeath = applyRadiantCombatAction(state, { type: 'normal', bearerId: 'tide', targetId: 'enemy' });
    const damage = afterDeath.events.find(event => event.type === 'damage');
    expect(damage?.type === 'damage' && damage.offered).toBe(radiantDirectDamage(effectiveRadiantStats(state, 'tide').attack, 0, 1));
  });
  it('Tizu leads with Defense and skill-triggered Shields (D-473 O1), not the shared attack template', () => {
    const state = fixture(['tide', 'nerithe', 'ember']);
    state.gauge.members.forEach(member => { member.charge = 40; });
    const otherLeader = fixture(['ember', 'tide', 'nerithe']);
    expect(effectiveRadiantStats(state, 'nerithe').defense)
      .toBeCloseTo(effectiveRadiantStats(otherLeader, 'nerithe').defense * 1.3);
    expect(effectiveRadiantStats(state, 'ember').defense).toBeCloseTo(effectiveRadiantStats(otherLeader, 'ember').defense);
    const skill = applyRadiantCombatAction(state, { type: 'skill', bearerId: 'nerithe', slot: 2 });
    expect(skill.events).toContainEqual(expect.objectContaining({
      type: 'shield', targetId: 'nerithe', source: { kind: 'leader', bearerId: 'tide' },
    }));
    const normal = applyRadiantCombatAction(state, { type: 'normal', bearerId: 'nerithe', targetId: 'enemy' });
    expect(normal.events.filter(event => event.type === 'shield')).toHaveLength(0);
    const offElement = applyRadiantCombatAction(state, { type: 'skill', bearerId: 'ember', slot: 2 });
    expect(offElement.events.filter(event => event.type === 'shield')).toHaveLength(0);
    state.bearers[0].hp = 0;
    state.gauge.members[0].living = false;
    const inactive = applyRadiantCombatAction(state, { type: 'skill', bearerId: 'nerithe', slot: 2 });
    expect(inactive.events.filter(event => event.type === 'shield')).toHaveLength(0);
  });
  it('an equipped Elise Master creates its authored splash without another Luminosity drop', () => {
    const state = createRadiantCombat([{ ...loadout('elise'), masterId: 'master-elise-2' }],
      ['enemy', 'other'].map(id => ({ id, elementId: null,
        stats: { hp: 100000, attack: 100, defense: 0, recovery: 0 }, currencyBudget: 10 })), 1);
    const result = applyRadiantCombatAction(state, { type: 'normal', bearerId: 'elise', targetId: 'enemy' });
    expect(result.events).toContainEqual(expect.objectContaining({
      type: 'damage', origin: 'generated', targetId: 'other', source: { kind: 'master', bearerId: 'elise' },
    }));
    expect(result.events.filter(event => event.type === 'gauge-drop')).toHaveLength(1);
    expect(result.state.gauge.members[0].charge).toBe(15);
  });

  it.each(elements)('$name arrows mean weak to, including the mutual light/dark pair', element => {
    const weakness = elementWeaknesses[element.id];
    expect(elementDamageMultiplier(weakness, element.id)).toBe(1.5);
    expect(elementDamageMultiplier(element.id, weakness)).toBe(
      element.id === 'tranquilitic' || element.id === 'chaotic' ? 1.5 : .75);
    expect(elementDamageMultiplier(element.id, element.id)).toBe(1);
  });

  it('applies elemental damage modifiers to actual outgoing and incoming direct packets', () => {
    const state = fixture();
    state.enemies[0].elementId = 'oceanic';
    const stats = effectiveRadiantStats(state, 'ember');
    const normal = applyRadiantCombatAction(state, { type: 'normal', bearerId: 'ember', targetId: 'enemy' });
    const damage = normal.events.find(event => event.type === 'damage');
    expect(damage?.type === 'damage' && damage.offered).toBe(
      radiantDirectDamage(stats.attack, 0, 1, (1 + radiantLeaderBonus(state.bearers[0].loadout)) * .75));
    const incoming = applyRadiantCombatAction(normal.state, {
      type: 'enemy-attack', enemyId: 'enemy', targetIds: ['ember'], coefficient: 1,
    });
    const enemyDamage = incoming.events.find(event => event.type === 'damage');
    expect(enemyDamage?.type === 'damage' && enemyDamage.offered).toBe(
      radiantDirectDamage(100, stats.defense, 1, 1.5));
  });

  it.each(releasedRadiantIds)('%s enhances Convergent Light through evolution and rank without a separate purchase', id => {
    const first = radiantFinalFlare(loadout(id, 1), 'sparkling');
    const final = radiantFinalFlare(loadout(id, 6), 'sparkling');
    for (const key of ['damage', 'heal', 'shieldDefense', 'shieldHP', 'attackBuff', 'burn'] as const)
      expect(final[key]).toBeCloseTo(first[key] * 1.5);
    expect(final.comboHits).toBe(first.comboHits);
    const higherRank = radiantFinalFlare(loadout(id, 6, 20), 'ultimate');
    const sameTier = radiantFinalFlare(loadout(id, 6, 11), 'ultimate');
    expect(higherRank.damage).toBeCloseTo(sameTier.damage * 1.19 / 1.1);
  });

  it('snapshots elemental and living-leader modifiers into Burn once, without periodic Luminosity', () => {
    const state = fixture(['ember', 'crinso']);
    state.enemies[0].elementId = 'oceanic';
    state.gauge.members[0].charge = 100;
    const offer = radiantFinalFlare(state.bearers[0].loadout, 'sparkling');
    const cast = applyRadiantCombatAction(state, { type: 'flare', bearerId: 'ember' });
    // Burn = value x tier/form scale x Skill Power (Attacker 1.5) x caster Attack x Burn power x element x Unbroken Ember.
    const magnitude = offer.burn * 1.5 * effectiveRadiantStats(state, 'ember').attack *
      (1 + radiantLeaderEffects(state.bearers[0].loadout).find(effect => effect.kind === 'burn-power')!.amount) * .75 * 1.3;
    expect(cast.state.enemies[0].debuffs.find(effect => effect.category === 'burn')!.magnitude).toBeCloseTo(magnitude);
    cast.state.bearers[0].hp = 0;
    cast.state.gauge.members[0].living = false;
    cast.state.phase = 'enemy';
    cast.state.acted = ['crinso'];
    cast.state.enemyActed = ['enemy'];
    const tick = applyRadiantCombatAction(cast.state, { type: 'finish-enemy-phase' });
    expect(tick.events.find(event => event.type === 'damage')).toMatchObject({
      origin: 'periodic', offered: Math.round(magnitude),
    });
    expect(tick.state.gauge.members.map(member => member.charge)).toEqual([0, 0]);
    expect(tick.events.some(event => event.type === 'gauge-drop')).toBe(false);
  });

  it.each(releasedRadiantIds)('%s validates every unlocked form/tier/Master with all saved enhancements', id => {
    const masters = [null, ...(Object.keys(radiantMasters) as RadiantMasterId[])
      .filter(masterId => radiantMasters[masterId].starter === id)];
    for (let form = 1; form <= 6; form++) for (const masterId of masters) {
      for (const tier of ['sparkling', 'glimmering', 'ultimate'] as const) {
        const rank = tier === 'sparkling' ? 1 : tier === 'glimmering' ? 6 : 11;
        const owner = { ...loadout(id, form, rank), masterId,
          ascension: { stats: true, skill1: true, skill2: true, lastFlare: true } };
        const offer = radiantFinalFlare(owner, tier);
        for (const key of ['reduction', 'weaken', 'exposure', 'attackBuff'] as const)
          expect(offer[key]).toBeGreaterThanOrEqual(0);
        if ((tier === 'glimmering' && form < 4) || (tier === 'ultimate' && form < 6)) continue;
        const state = createRadiantCombat([owner], [{
          id: 'enemy', elementId: 'botanic', stats: { hp: 1000000, attack: 10, defense: 100, recovery: 0 },
          currencyBudget: 10,
        }], 1);
        state.gauge.members[0].charge = tier === 'sparkling' ? 100 : 200;
        const result = applyRadiantCombatAction(state, {
          type: 'flare', bearerId: id, ...(offer.target === 'one-enemy' ? { targetId: 'enemy' } : {}),
        });
        // A Flare that fills "all allies" refills its own caster (as does Disciple's Shared Mindflame); every other Flare spends to zero.
        const selfFill = id === 'disciple' ||
          radiantBearerKits[id].kit.flare.effects.some(effect => effect.kind === 'fill' && effect.to === 'all-allies');
        if (selfFill) expect(result.state.gauge.members[0].charge).toBeGreaterThan(0);
        else expect(result.state.gauge.members[0].charge).toBe(0);
        // State validation enforces the N6 category caps on every applied effect.
        validateRadiantCombat(result.state);
      }
    }
  });

  it('gives every Conduit and Master a mechanically distinct one-or-two-effect design, ignoring numeric differences', () => {
    const designs = [...Object.values(radiantConduits), ...Object.values(radiantMasters).map(master => master.effects)];
    for (const design of designs) {
      expect(design.length).toBeLessThanOrEqual(2);
      expect(design.length).toBeGreaterThan(0);
    }
    expect(new Set(designs.map(design => design.map(effect => effect.kind).sort().join('|'))).size).toBe(designs.length);
    const leaders = releasedRadiantIds.map(id => radiantLeaderEffects(loadout(id)).map(effect => effect.kind).sort().join('|'));
    expect(new Set(leaders).size).toBe(leaders.length);
  });
});
