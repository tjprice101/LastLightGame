import { describe, expect, it, vi } from 'vitest';
import { elements } from '../content/activities';
import { elementDamageMultiplier, elementWeaknesses } from '../content/element-matchups';
import { characterName } from '../content/character-art';
import { getStarter } from '../content/starters';
import { radiantBearerKits, radiantFinalFlare, radiantLeaderBonus, radiantMasters, radiantPassiveAmount,
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
  it.each(releasedRadiantIds)('%s retains its identity and uses a simple squad passive with 100/200 capacity', id => {
    const kit = radiantBearerKits[id];
    expect(kit.baseCost).toBe(100);
    expect(kit.passive.rule).toBe('squad-stat');
    expect(['attack', 'defense', 'recovery']).toContain(kit.passive.stat);
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

  it('gives 10 Normal Luminosity and a separate 1 only to living same-element allies', () => {
    const sameElement = releasedRadiantIds.find(id => id !== 'ember' && radiantBearerKits[id].elementId === 'infernic')!;
    const state = fixture(['ember', sameElement, 'tide']);
    const next = applyRadiantCombatAction(state, { type: 'normal', bearerId: 'ember', targetId: 'enemy' });
    expect(next.state.gauge.members.map(member => member.charge)).toEqual([10, 1, 0]);
    expect(next.events.filter(event => event.type === 'gauge-drop')).toHaveLength(1);
    expect(next.state.chargeSeed).toBe(state.chargeSeed);
    next.state.gauge.members[1].living = false;
    expect(grantRadiantDrop(next.state.gauge, 'ember', 10).members.map(member => member.charge)).toEqual([20, 1, 0]);
    expect(state.gauge.members.every(member => member.charge === 0)).toBe(true);
  });

  it('does not roll random bonuses or grant Flare, defeat, Defense or personal round charge', () => {
    const roll = vi.fn(() => 0);
    expect(radiantHitDrop('normal', 0, roll)).toEqual({ amount: 10, bonusRolls: 0, bonusOffered: 0 });
    expect(radiantHitDrop('flare', 0, roll).amount).toBe(0);
    expect(roll).not.toHaveBeenCalled();
    const state = fixture();
    const guarded = applyRadiantCombatAction(state, { type: 'defense', bearerId: 'ember' });
    expect(guarded.state.gauge.members[0].charge).toBe(0);
    expect(grantRadiantRound(state.gauge).members[0].charge).toBe(0);
    const result = applyRadiantCombatAction(fixture(['ember'], 6, 1), { type: 'normal', bearerId: 'ember', targetId: 'enemy' });
    expect(result.state.gauge.members[0].charge).toBe(10);
    expect(result.events.filter(event => event.type === 'gauge-drop')).toHaveLength(1);
  });

  it('grants 10 per surviving incoming direct hit through Shields, without sharing', () => {
    const state = fixture(['ember', 'tide']);
    state.phase = 'enemy';
    state.acted = ['ember', 'tide'];
    state.bearers[0].shields.push({ id: state.nextShieldId++, source: { kind: 'flare', bearerId: 'tide' }, remaining: 1000 });
    const next = applyRadiantCombatAction(state, {
      type: 'enemy-attack', enemyId: 'enemy', targetIds: ['ember'], coefficient: 1, hits: 3,
    });
    expect(next.state.gauge.members.map(member => member.charge)).toEqual([30, 0]);
    expect(next.state.bearers[0].hp).toBe(state.bearers[0].hp);
    expect(next.events.filter(event => event.type === 'charge')).toHaveLength(3);
  });

  it.each([['sparkling', 1, 1, 100, 4], ['glimmering', 4, 6, 200, 8], ['ultimate', 6, 11, 200, 12]] as const)(
    '%s rank splits one authored total across %i charge / %i actual hits without refilling itself',
    (tier, form, rank, charge, hits) => {
      const state = createRadiantCombat([loadout('ember', form, rank)], [{
        id: 'enemy', elementId: null, stats: { hp: 100000, attack: 100, defense: 0, recovery: 0 }, currencyBudget: 10,
      }], 1);
      state.gauge.members[0].charge = charge;
      const offer = radiantFinalFlare(state.bearers[0].loadout, tier);
      const expected = radiantDirectDamage(effectiveRadiantStats(state, 'ember').attack, 0, offer.damage,
        1 + radiantLeaderBonus(state.bearers[0].loadout));
      const next = applyRadiantCombatAction(state, { type: 'flare', bearerId: 'ember' });
      const packets = next.events.filter(event => event.type === 'damage' && event.source.kind === 'flare' && event.origin === 'direct');
      expect(packets).toHaveLength(hits);
      expect(packets.reduce((sum, event) => sum + (event.type === 'damage' ? event.offered : 0), 0)).toBe(expected);
      expect(next.state.gauge.members[0].charge).toBe(0);
      expect(next.events.some(event => event.type === 'gauge-drop')).toBe(false);
    });

  it('adds living squad passives rather than multiplying them, and removes only a defeated source', () => {
    const state = fixture(['ember', 'crinso']);
    const base = state.bearers[0].stats.attack;
    const bonuses = state.bearers.map(member => radiantPassiveAmount(member.loadout));
    expect(effectiveRadiantStats(state, 'ember').attack).toBeCloseTo(base * (1 + bonuses[0] + bonuses[1]));
    state.bearers[1].hp = 0;
    state.gauge.members[1].living = false;
    expect(effectiveRadiantStats(state, 'ember').attack).toBeCloseTo(base * (1 + bonuses[0]));
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
    const magnitude = offer.burn * effectiveRadiantStats(state, 'ember').attack *
      (1 + radiantLeaderBonus(state.bearers[0].loadout)) * .75;
    expect(cast.state.enemies[0].burns[0].magnitude).toBeCloseTo(magnitude);
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
        for (const key of ['reduction', 'weaken', 'exposure', 'attackBuff'] as const) {
          expect(offer[key]).toBeGreaterThanOrEqual(0);
          expect(offer[key]).toBeLessThanOrEqual(.8);
        }
        if ((tier === 'glimmering' && form < 4) || (tier === 'ultimate' && form < 6)) continue;
        const state = createRadiantCombat([owner], [{
          id: 'enemy', elementId: 'botanic', stats: { hp: 1000000, attack: 10, defense: 100, recovery: 0 },
          currencyBudget: 10,
        }], 1);
        state.gauge.members[0].charge = tier === 'sparkling' ? 100 : 200;
        const result = applyRadiantCombatAction(state, {
          type: 'flare', bearerId: id, ...(offer.target === 'one-enemy' ? { targetId: 'enemy' } : {}),
        });
        expect(result.state.gauge.members[0].charge).toBe(0);
        validateRadiantCombat(result.state);
      }
    }
  });

  it('uses only one or two simple effects per ordinary Conduit and a single enhancement per Master', () => {
    const allowed = ['hp', 'attack', 'defense', 'recovery', 'normal', 'flare', 'pierce', 'healing', 'shielding', 'resilience', 'guard', 'leader', 'cooperation'];
    for (const design of Object.values(radiantConduits)) {
      expect(design.length).toBeLessThanOrEqual(2);
      for (const effect of design) expect(allowed).toContain(effect.kind);
    }
    for (const master of Object.values(radiantMasters)) expect(master.rule).toBe('standard');
  });
});
