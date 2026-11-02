import { describe, expect, it } from 'vitest';
import { fighters, resolveFighter } from '../content/combat';
import { starters } from '../content/starters';
import { intrinsicRole, roleBonuses, roleTarget } from '../content/role-perks';
import { act, createBattle, endTurn, roll, withMasterLoadouts } from './battle';
import { elementResonance } from './element-resonance';
import { refreshConduitStats } from './conduit-runtime';
import { resonanceBadge, rolePerkRow } from '../presentation/intrinsic-perks';

const capture = { instanceId: 'capture:00000000-0000-4000-8000-000000000001', creatureId: 'infusion:heavens:0', locked: false };

describe('intrinsic roles and frozen Element Resonance', () => {
  it('resolves every authored role including Flora and Calamitic characters', () => {
    for (const unit of starters) {
      const stats = resolveFighter(unit.id).stats;
      const bonus = roleBonuses(unit.id);
      expect(stats.damage).toBeCloseTo(fighters[unit.id].stats.damage * (1 + (bonus.damage ?? 0)));
      expect(stats.health).toBeCloseTo(fighters[unit.id].stats.health * (1 + (bonus.health ?? 0)));
      expect(stats.defense).toBeCloseTo((fighters[unit.id].stats.defense + fighters[unit.id].passive.defenseBonus) * (1 + (bonus.defense ?? 0)));
      expect(stats.skillPower).toBeCloseTo((fighters[unit.id].stats.skillPower ?? 1) + (bonus.skillPower ?? 0));
      expect(rolePerkRow(unit.id)).toContain(`${intrinsicRole(unit.id)} perk:`);
    }
    expect(intrinsicRole('sprout')).toBe('Support');
    expect(intrinsicRole('ozriel')).toBe('Tank');
    expect(intrinsicRole('ilvaris')).toBe('Support');
    expect(intrinsicRole('kaelith')).toBe('Attacker');
    expect(roleBonuses('ember', true)).toEqual({});
    expect(rolePerkRow(capture.instanceId)).toBe('');
  });

  it('adds innate percentages to the same equipment bucket without compounding', () => {
    const slots = ['parallax-relay', null, null, null, null, null, null, null] as const;
    const kit = resolveFighter('sprout', undefined, [...slots]);
    expect(kit.stats.health).toBe(fighters.sprout.stats.health * 2);
    expect(resolveFighter('ember', undefined, ['siegebound-drive', null, null, null, null, null, null, null]).stats.damage)
      .toBeCloseTo(fighters.ember.stats.damage * 2.35);
    expect(resolveFighter('tide', undefined, ['bastion-lock', null, null, null, null, null, null, null]).stats.defense)
      .toBeCloseTo(fighters.tide.stats.defense * 1.85);
    const tank = withMasterLoadouts(createBattle(1, ['tide']), { tide: 'master-tide-1' });
    expect(tank.allies[0].stats.defense).toBeCloseTo(fighters.tide.stats.defense * 2.3);
    const state = createBattle(1, ['sprout'], {}, { sprout: [...slots] });
    state.allies[0].masterConduit = 'master-sprout-1';
    refreshConduitStats(state);
    const once = structuredClone(state.allies[0].stats);
    refreshConduitStats(state);
    expect(state.allies[0].stats).toEqual(once);
  });

  it('weights Tanks using the supplied single roll and excludes captured identities', () => {
    const members = [{ definitionId: 'tide' }, { definitionId: 'ember' }];
    expect(roleTarget(members, .54)).toBe(members[0]);
    expect(roleTarget(members, .56)).toBe(members[1]);
    expect(roleTarget([{ definitionId: 'tide', captured: capture }, members[1]], .54)).toBe(members[1]);
    const state = createBattle(1729, ['tide', 'ember']);
    state.enemies = [state.enemies[0]];
    state.enemies[0].stats.crit = 0;
    const expected = structuredClone(state);
    const target = roleTarget(expected.allies, roll(expected));
    roll(expected); // The unchanged critical roll follows the one target roll.
    const result = endTurn(state);
    expect(result.events.find(e => e.kind === 'damage')?.target).toBe(target.id);
    expect(result.state.seed).toBe(expected.seed);
    expect(state.seed).toBe(1729);
  });

  it('counts only bearers: two grant +15% Health, three +25% Health and +5% Skill Power to the whole squad', () => {
    expect(elementResonance(['ember', 'tide', 'sprout'])).toBeNull();
    expect(elementResonance(['sprout', capture.instanceId])).toBeNull();
    expect(elementResonance(['sprout', 'bruno', capture.instanceId])).toEqual({ element: 'botanic', health: .15, skillPower: 0 });
    expect(elementResonance(['sprout', 'bruno', 'orvella'])).toEqual({ element: 'botanic', health: .25, skillPower: .05 });
    const plain = createBattle(1, ['sprout', 'ember', capture.instanceId], {}, {}, [capture]);
    const state = createBattle(1, ['sprout', 'bruno', capture.instanceId], {}, {}, [capture]);
    const solo = createBattle(1, ['bruno']);
    expect(state.allies.map(u => u.stats.skillPower)).toEqual(plain.allies.map(u => u.stats.skillPower).map((v, i) => i === 1 ? solo.allies[0].stats.skillPower : v));
    expect(state.allies[0].stats.health).toBeCloseTo(plain.allies[0].stats.health * 1.15);
    expect(state.allies[2].stats.health).toBeCloseTo(plain.allies[2].stats.health * 1.15);
    expect(state.allies[0].hp).toBe(state.allies[0].stats.health);
    const health = state.allies[0].stats.health;
    state.allies[1].hp = 0;
    refreshConduitStats(state);
    expect(state.allies[0].stats.health).toBe(health);
    const trio = createBattle(1, ['sprout', 'bruno', 'orvella']);
    expect(trio.allies[0].stats.health).toBeCloseTo(plain.allies[0].stats.health * 1.25);
    expect(trio.allies[0].stats.skillPower).toBeCloseTo((plain.allies[0].stats.skillPower ?? 0) + .05);
    expect(resonanceBadge(['sprout', 'bruno'])).toContain('Botanic Resonance: +15% Health');
    expect(resonanceBadge(['sprout', 'bruno', 'orvella'])).toContain('Botanic Resonance: +25% Health, +5% Skill Power');
    expect(resonanceBadge(['ember', 'tide'])).toBe('');
  });

  it.each(['skill1', 'skill2', 'ultimate', 'light'] as const)('Support perk heals living allies only after %s', action => {
    const state = createBattle(1, ['aurora', 'ember', 'tide']);
    for (const ally of state.allies) { ally.hp = ally.stats.health / 2; ally.shatter = 100; }
    state.allies[2].hp = 0;
    state.enemies.forEach(e => { e.hp = e.stats.health = 1e6; });
    const result = act(state, 'aurora', action, state.enemies[0].id);
    const heals = result.events.filter(e => e.kind === 'heal' && e.rolePerk === 'Support');
    expect(heals).toHaveLength(action === 'light' ? 0 : 2);
    for (const heal of heals) {
      const ally = state.allies.find(u => u.id === heal.target)!;
      expect(heal.amount).toBe(Math.round(ally.stats.health * .04));
    }
    expect(result.state.allies[2].hp).toBe(0);
  });
});
