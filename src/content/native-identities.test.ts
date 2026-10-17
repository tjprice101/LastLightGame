import { describe, expect, it } from 'vitest';
import { describeFighter, fighters, resolveFighter, shatterGauge, type FighterDefinition } from './combat';
import { nativeIdentities, nativeIdentityIds } from './native-identities';
import { nativeBalance } from './native-balance';
import { characterGrowthFactor, characterPotencyFactor } from './progression';
import { starters, type StarterId } from './starters';

const coefficients: Record<StarterId, readonly (number | undefined)[]> = {
  ember: [1.6, 1.1, 2],
  tide: [1.5, undefined, undefined],
  sprout: [1.4, undefined, undefined],
  atmoso: [1.8, undefined, 2],
  elise: [1.1, 1.4, 2.6],
  bliss: [1.7, 1.2, 2.5],
  bruno: [1.9, undefined, undefined],
  disciple: [undefined, undefined, undefined],
  aurora: [undefined, 1, undefined],
  razor: [1.6, undefined, 2.2],
  rosetta: [1.6, 2, 3],
  thornia: [undefined, 1.7, 1.4],
  crinso: [1.6, 2, 2.6],
  nerithe: [1.8, 1.3, 2.8],
  orvella: [1.4, undefined, 2],
  vaelor: [1.7, 1.2, 2.6],
};
const actions = ['skill1', 'skill2', 'ultimate'] as const;

describe('approved sixteen native identities', () => {
  it('covers exactly the stable playable roster with distinct roles and play loops', () => {
    expect([...nativeIdentityIds].sort()).toEqual(starters.map(starter => starter.id).sort());
    expect(nativeIdentityIds).toHaveLength(16);
    expect(new Set(nativeIdentityIds.map(id => nativeIdentities[id].role)).size).toBe(16);
    expect(new Set(nativeIdentityIds.map(id => nativeIdentities[id].playLoop)).size).toBe(16);
  });

  it('describes the shared tuned HP fractions and preserves stronger pending Seed rules', () => {
    expect(nativeIdentities.tide.abilities.skill2.description).toContain(`${nativeBalance.tizu.shelter * 100}% of its maximum HP`);
    expect(nativeIdentities.tide.abilities.ultimate.description).toContain(`${nativeBalance.tizu.oceanMemory * 100}% of their maximum HP`);
    expect(nativeIdentities.sprout.passive.description).toContain(`${nativeBalance.flora.seed * 100}% of its holder’s maximum HP`);
    expect(nativeIdentities.sprout.abilities.skill2.description).toContain(`${nativeBalance.flora.seed * 100}% of maximum HP`);
    expect(nativeIdentities.sprout.abilities.skill2.description).toContain(`${nativeBalance.flora.empoweredSeed * 100}% for an [Empowered Seed]`);
    expect(nativeIdentities.sprout.abilities.skill2.description).toContain('A new [Seed] never replaces a pending [Empowered Seed]');
    expect(nativeIdentities.sprout.abilities.ultimate.description).toContain(`${nativeBalance.flora.immediateHeal * 100}% of its maximum HP`);
    expect(nativeIdentities.sprout.abilities.ultimate.description).toContain(`${nativeBalance.flora.empoweredSeed * 100}% at the start of the next player turn`);
  });

  it('scales conditional direct coefficients once without changing fixed follow-ups, Burn, pierce or support', () => {
    const scale = nativeBalance.skillDamageScale;
    expect(nativeIdentities.crinso.abilities.skill2.description).toContain(`${200 * scale}% direct damage`);
    expect(nativeIdentities.crinso.abilities.skill2.description).toContain(`increased by ${40 * scale}% (${240 * scale}% total)`);
    expect(nativeIdentities.crinso.abilities.ultimate.description).toContain(`${260 * scale}% direct damage`);
    expect(nativeIdentities.crinso.abilities.ultimate.description).toContain(`${45 * scale}% per [Combo]`);
    expect(nativeIdentities.crinso.abilities.ultimate.description).toContain('ignores 30% of the target’s Defense');
    expect(nativeIdentities.rosetta.abilities.skill2.description).toContain(`${25 * scale}% for each other ally who hit it this player turn.`);
    expect(nativeIdentities.vaelor.abilities.ultimate.description).toContain(`${340 * scale}% on [Crescendo]`);
    expect(nativeIdentities.elise.abilities.skill2.description).toContain('90% of [Elise]’s Attack and cannot critically hit');
    expect(nativeIdentities.elise.abilities.skill2.description).toContain('one extra 60% strike');
    expect(nativeIdentities.elise.abilities.skill2.description).toContain(`${140 * scale}% direct damage`);
    expect(nativeIdentities.ember.abilities.skill1.description).toContain('[Burn] dealing 25% of [Infernis]’s Attack');
    expect(nativeIdentities.atmoso.abilities.skill2.description).toContain('70% of [Atmoso]’s Attack plus 30% per [Gust] and cannot critically hit');
    expect(nativeIdentities.thornia.abilities.ultimate.description).toContain('deal 90% of [Thornia]’s Attack and cannot critically hit');
  });

  it.each(nativeIdentityIds)('%s replaces every old native slot and passive without mutating stat growth', id => {
    const base = fighters[id];
    const before = structuredClone(base);
    const progress = { level: 105, evolution: 6, weaponRank: 2 };
    const grown = resolveFighter(id, progress);
    const factor = characterGrowthFactor(progress);
    const potency = characterPotencyFactor(progress);
    expect(base.nativeIdentity).toBe(true);
    expect(base.pilot).toBeUndefined();
    expect(grown.pilot).toBeUndefined();
    expect(grown.passive).toMatchObject({ damageBonus: 0, defenseBonus: 0, healFraction: 0 });
    expect(grown.passive.lightGaugeBonus).toBe(id === 'nerithe' ? 5 : undefined);
    expect(grown.stats.health).toBeCloseTo(base.stats.health * factor);
    expect(grown.stats.damage).toBeCloseTo(base.stats.damage * factor * 1.04);
    expect(grown.stats.defense).toBeCloseTo(base.stats.defense * factor ** .7);
    expect(grown.stats.elementalDamage).toBeCloseTo(base.stats.elementalDamage * factor);
    expect(grown.stats.crit).toBeCloseTo(Math.min(.75, base.stats.crit * potency));
    expect(grown.stats.critMultiplier).toBeCloseTo(Math.min(3, base.stats.critMultiplier * potency));
    expect(grown.stats.shatterCapacity).toBeCloseTo(base.stats.shatterCapacity * potency);
    for (const [index, action] of actions.entries()) {
      expect(grown.abilities[action].cooldown).toBe(0);
      const coefficient = coefficients[id][index];
      expect(grown.abilities[action].strength.damageMultiplier).toBe(coefficient === undefined ? undefined : coefficient * nativeBalance.skillDamageScale);
      expect(grown.abilities[action].strength).toEqual(base.abilities[action].strength);
      expect(grown.abilities[action].strength).toEqual(nativeIdentities[id].abilities[action].strength);
      const expectedStrength = coefficients[id][index] === undefined
        ? {}
        : { damageMultiplier: coefficients[id][index]! * nativeBalance.skillDamageScale, ...(id === 'tide' && action === 'skill1' ? { weakenFraction: .25 } : {}) };
      expect(grown.abilities[action].strength).toEqual(expectedStrength);
    }
    expect(base).toEqual(before);
  });

  it.each(nativeIdentityIds)('%s retains fixed native coefficients at every form and sampled level', id => {
    for (let evolution = 1; evolution <= 6; evolution++) {
      for (const level of [0, 1, 30]) {
        const resolved = resolveFighter(id, { evolution, level });
        for (const action of actions) {
          expect(resolved.abilities[action].strength).toEqual(fighters[id].abilities[action].strength);
        }
      }
    }
    expect(shatterGauge.costs).toEqual({ light: 0, skill1: 25, skill2: 40, ultimate: 100 });
    expect(shatterGauge.gains.light).toBe(20);
  });

  it('uses explicit ally targets only for the approved targeted support actions', () => {
    const targeted = nativeIdentityIds.flatMap(id => actions
      .filter(action => fighters[id].abilities[action].targets === 'one-ally')
      .map(action => `${id}:${action}`));
    expect(targeted.sort()).toEqual(['bruno:skill2', 'disciple:skill1', 'disciple:skill2', 'tide:skill2']);
    expect(fighters.bruno.abilities.skill2.excludeSelf).toBe(true);
    expect(fighters.bruno.abilities.skill2.description).toContain('If [Bruno] is the only living ally');
    expect(fighters.tide.abilities.skill2.excludeSelf).toBeUndefined();
    expect(fighters.disciple.abilities.skill1.excludeSelf).toBeUndefined();
    expect(fighters.disciple.abilities.skill2.excludeSelf).toBeUndefined();
    for (const id of ['elise', 'crinso', 'rosetta', 'razor'] as const) {
      for (const action of actions) expect(fighters[id].abilities[action].targets).toBeUndefined();
    }
    for (const id of ['tide', 'sprout', 'disciple', 'aurora', 'bruno'] as const) {
      expect(fighters[id].abilities.ultimate.targets).toBe('all-allies');
      expect(fighters[id].abilities.ultimate.strength).toEqual({});
    }
  });

  it.each(nativeIdentityIds)('%s exposes the exact authored native reference, not old pilot appendices', id => {
    const input = resolveFighter(id, { level: 30, evolution: 2 });
    const before = structuredClone(input);
    const described = describeFighter(id, input);
    expect(described.passive.description).toBe(nativeIdentities[id].passive.description);
    for (const action of actions) {
      const expected = nativeIdentities[id].abilities[action].description
        + (action === 'ultimate' ? ' Recovery: caster skips the next player turn.' : '');
      expect(described.abilities[action].description).toBe(expected);
      expect(described.abilities[action].description).not.toContain('Spends all');
      expect(described.abilities[action].description).not.toContain('next two enemy-phase attacks');
    }
    expect(input).toEqual(before);
  });

  it('describes unflagged historical snapshots by their frozen legacy strengths', () => {
    const legacy: FighterDefinition = {
      stats: { health: 220, defense: 10, damage: 38, crit: .15, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 8 },
      passive: { name: 'Unbroken Ember', description: '', damageBonus: .2, defenseBonus: 0, healFraction: 0 },
      abilities: {
        skill1: { name: 'Cinder Cleave', description: '', cooldown: 0, strength: { damageMultiplier: 1.6, burnMultiplier: 1 } },
        skill2: { name: 'Flame Arc', description: '', cooldown: 0, strength: { damageMultiplier: 1.1 } },
        ultimate: { name: 'Dawnfire', description: '', cooldown: 0, strength: { damageMultiplier: 2.8, burnMultiplier: .75 } },
      },
    };
    const before = structuredClone(legacy);
    const described = describeFighter('ember', legacy);
    expect(described.passive.description).toContain('+20% outgoing damage at or below 50% health');
    expect(described.abilities.skill1.description).toContain('burn for 8 damage');
    expect(described.abilities.ultimate.description).toContain('280% damage');
    expect(described.abilities.ultimate.description).not.toContain('45% of caster Attack');
    expect(legacy).toEqual(before);
    expect(described.nativeIdentity).toBeUndefined();
  });
});

describe('current-state copy', () => {
  it('describes only current kit and Conduit behavior, never retired mechanics', async () => {
    const { conduitRedesign } = await import('./conduit-redesign');
    const text = JSON.stringify([nativeIdentities, conduitRedesign]);
    for (const remnant of [/retired/i, /no longer/i, /low-health bonus/i, /\b(Ember|Ward|Bloom) bank/i, /fire charges/i, /Tempest counter/i, /instead of offering/i, /Does not change scheduling/i]) {
      expect(text).not.toMatch(remnant);
    }
  });

  it('names referenced abilities and statuses explicitly in [brackets]', () => {
    const crinso = nativeIdentities.crinso;
    expect(crinso.passive.description).toContain('[Golden Edge]');
    expect(crinso.passive.description).toContain('[Crimson Rupture]');
    expect(JSON.stringify(crinso)).not.toMatch(/\b(Gold|Crimson) edge\b/i);
    expect(nativeIdentities.ember.abilities.skill1.description).toContain('[Burn]');
    for (const id of nativeIdentityIds) {
      const identity = nativeIdentities[id];
      for (const text of [identity.passive.description, ...actions.map(action => identity.abilities[action].description)]) {
        expect(text.split('[').length).toBe(text.split(']').length);
      }
    }
  });
});
