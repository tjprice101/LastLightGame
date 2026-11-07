import { describe, expect, it } from 'vitest';
import { auditGear, auditState, measureCapability, tankProbe, type CapabilityPriorities } from './roster-capability';
import { makeBattle, measureBattle, type SurveyPriorities, type SurveyTarget } from './battle-survey';
import { moonCharacters, sunshadeCharacters } from '../src/content/moon-sunshade-characters';
import { masterConduits } from '../src/content/master-conduits';
import type { StarterId } from '../src/content/starters';
import type { ActionId } from '../src/content/combat';
import { actAndAdvanceTurn, type BattleState, type Combatant } from '../src/game/battle';
import { stagedLycalisOdds } from '../src/content/loot-random';
import { benchmarkPriorities, benchmarkTarget } from '../src/game/native-benchmark-pilot';

const characters = [...moonCharacters, ...sunshadeCharacters];
const seeds = [1, 1729, 104729];
const moonIds = new Set(['maerion', 'caevren', 'vespera', 'ilyss', 'asteriel', 'serapha']);

function moonPriorities(state: BattleState, actor: Combatant,
  mode: 'paper-output' | 'paper-support' | 'pressure'): ActionId[] {
  if (!moonIds.has(actor.definitionId)) return benchmarkPriorities(state, actor);
  const living = state.allies.filter(unit => unit.hp > 0);
  const injured = living.filter(unit => unit.hp / unit.stats.health < .85);
  const critical = living.filter(unit => unit.hp / unit.stats.health < .55);
  const lowest = living.reduce((value, unit) =>
    unit.hp / unit.stats.health < value.hp / value.stats.health ? unit : value, living[0]);
  const memory = actor.native;

  if (mode !== 'pressure') {
    const support = mode === 'paper-support';
    switch (actor.definitionId) {
      case 'maerion': return support ? ['ultimate', 'skill2', 'skill1', 'light']
        : ['skill1', 'light', 'skill2', 'ultimate'];
      case 'caevren': return support ? ['ultimate', 'skill2', 'skill1', 'light']
        : ['skill1', 'light', 'ultimate', 'skill2'];
      case 'vespera': return ['ultimate', 'skill1', 'light', 'skill2'];
      case 'ilyss': return support ? ['ultimate', 'skill2', 'skill1', 'light']
        : ['skill1', 'light', 'ultimate', 'skill2'];
      case 'asteriel': return support ? ['ultimate', 'skill1', 'skill2', 'light']
        : ['light', 'skill2', 'skill1', 'ultimate'];
      case 'serapha': return support ? ['ultimate', 'skill2', 'skill1', 'light']
        : ['skill1', 'light', 'ultimate', 'skill2'];
    }
  }

  switch (actor.definitionId) {
    case 'maerion':
      if (critical.length > 0 && (memory?.unreturned ?? 0) > 0)
        return ['ultimate', 'skill1', 'skill2', 'light'];
      if (lowest.hp / lowest.stats.health < .4)
        return ['skill2', 'skill1', 'ultimate', 'light'];
      return ['skill1', 'ultimate', 'skill2', 'light'];
    case 'caevren': {
      const needsInterception = living.some(unit => unit.id !== actor.id &&
        unit.hp / unit.stats.health < .72 && unit.shield < unit.stats.health * .15);
      if ((memory?.load ?? 0) > 0 || critical.length > 0) return ['ultimate', 'skill2', 'skill1', 'light'];
      if (needsInterception) return ['skill2', 'skill1', 'ultimate', 'light'];
      return ['skill1', 'ultimate', 'skill2', 'light'];
    }
    case 'vespera': {
      return ['ultimate', 'skill1', 'skill2', 'light'];
    }
    case 'ilyss': {
      const hasDebuff = living.some(unit => unit.burn.turns > 0 || unit.weakened > 0);
      if (critical.length > 0 || injured.length > 1) return ['ultimate', 'skill2', 'skill1', 'light'];
      if (hasDebuff || lowest.hp / lowest.stats.health < .68)
        return ['skill2', 'ultimate', 'skill1', 'light'];
      return ['skill1', 'ultimate', 'skill2', 'light'];
    }
    case 'asteriel':
      if ((memory?.promise ?? 0) >= 2 && (critical.length > 0 || injured.length > 1))
        return ['ultimate', 'skill1', 'skill2', 'light'];
      if (memory?.path === 'shelter') return ['skill2', 'skill1', 'ultimate', 'light'];
      if (memory?.path === 'flourish') return ['skill1', 'skill2', 'ultimate', 'light'];
      return critical.length > 0 ? ['skill1', 'skill2', 'ultimate', 'light']
        : ['skill2', 'skill1', 'ultimate', 'light'];
    case 'serapha': {
      const needsProtection = living.some(unit => !unit.native?.ceasefire ||
        unit.native.ceasefire.owner !== actor.id || unit.native.ceasefire.throughPhase < state.round);
      if ((memory?.interval ?? 0) > 0 && (injured.length > 0 || (memory?.interval ?? 0) >= 2))
        return ['ultimate', 'skill2', 'skill1', 'light'];
      if (needsProtection && injured.length > 0) return ['skill2', 'skill1', 'ultimate', 'light'];
      return ['skill1', 'skill2', 'ultimate', 'light'];
    }
  }
  return benchmarkPriorities(state, actor);
}

const moonPressurePriorities: SurveyPriorities = (state, actor) => moonPriorities(state, actor, 'pressure');
const moonPaperPriorities: CapabilityPriorities = (state, actor, mode) =>
  moonPriorities(state, actor, mode === 'support' ? 'paper-support' : 'paper-output');
const moonPressureTarget: SurveyTarget = (state, actor, action) => {
  if (actor.definitionId === 'vespera' && action === 'skill2') {
    const candidates = state.allies.filter(unit => unit.hp > 0 && unit.id !== actor.id && !unit.spent &&
      (!unit.native?.signal || unit.native.signal.owner !== actor.id ||
        unit.native.signal.throughRound < state.round));
    if (candidates.length) return [...candidates].sort((a, b) =>
      b.stats.damage - a.stats.damage || a.hp / a.stats.health - b.hp / b.stats.health)[0].id;
  }
  return benchmarkTarget(state, actor, action);
};

describe('bounded seasonal experiments, conditional owned teams and non-Calamitic gear', () => {
  it('saves late event kill rewards without premium drops or consuming premium RNG', () => {
    for (const mode of ['moon', 'sunshade'] as const) {
      const state = makeBattle({ kind: 'infusion', mode, stage: 35 }, ['ember'], 105, 'mixed0', 1729);
      const premiumSeed = state.lycalisSeed;
      state.enemies[0].hp = 1;
      const result = actAndAdvanceTurn(state, state.allies[0].id, 'light', state.enemies[0].id);
      const reward = result.events.find(event => event.kind === 'reward');
      expect(reward).toBeDefined();
      expect(reward?.lycalis).toBeUndefined();
      expect(result.state.lycalisSeed).toBe(premiumSeed);
      expect(() => stagedLycalisOdds(mode, 140)).toThrow('does not award Null-Prismatica');
    }
  });
  it('separates six-round zero-Defense output, effective laboratory healing, Shield creation and packet survival', () => {
    const rows = characters.map(({ id }) => {
      const state = auditState([id], 105, 'planned', 1729);
      const output = measureCapability(state, 'planned', 'output', 6);
      const support = measureCapability(state, 'planned', 'support', 6);
      const packet = tankProbe(id, 105, 'planned', auditGear([id], 'planned'));
      expect([output.damage, support.healing, support.shields].every(Number.isFinite)).toBe(true);
      expect(output.actions).toBeGreaterThan(0);
      return { id, damage: output.damage, healing: support.healing, shields: support.shields, packet };
    });
    process.stdout.write(`SEASONAL PAPER Lv105 Common+0, seed1729, six rounds, no incoming; separate packet probe: ${JSON.stringify(rows)}\n`);
  });

  it('compares Moon paper checks under the generic proxy and an explicit role-aware policy', () => {
    const rows = moonCharacters.map(({ id }) => {
      const state = auditState([id], 105, 'planned', 1729);
      const proxyOutput = measureCapability(state, 'planned', 'output', 6);
      const proxySupport = measureCapability(state, 'planned', 'support', 6);
      const moonOutput = measureCapability(state, 'planned', 'output', 6, moonPaperPriorities);
      const moonSupport = measureCapability(state, 'planned', 'support', 6, moonPaperPriorities);
      const packet = tankProbe(id, 105, 'planned', auditGear([id], 'planned'));
      expect([moonOutput.damage, moonSupport.healing, moonSupport.shields, packet.packet].every(Number.isFinite)).toBe(true);
      return {
        id,
        proxy: { damage: proxyOutput.damage, healing: proxySupport.healing, shields: proxySupport.shields },
        moon: { damage: moonOutput.damage, healing: moonSupport.healing, shields: moonSupport.shields },
        packet: { damage: packet.packet, shield: packet.shield, action: packet.action },
      };
    });
    process.stdout.write(`MOON PAPER Lv105 Common+0 seed1729 six rounds; generic proxy vs Moon-role policy; single-packet probe remains separate: ${JSON.stringify(rows)}\n`);
  });

  it('measures actual Stage35 event pressure with mixed+0 and each single personal Master alternative', () => {
    const rows = [];
    for (const character of characters) {
      const id = character.id;
      const roster: StarterId[] = [id, 'tide', 'sprout'];
      const mode = moonCharacters.some(unit => unit.id === id) ? 'moon' : 'sunshade';
      const choices = [undefined, ...masterConduits.filter(master => master.character === id).map(master => master.id)];
      expect(choices).toHaveLength(4);
      for (const master of choices) {
        const results = seeds.map(seed => measureBattle(makeBattle(
          { kind: 'infusion', mode, stage: 35 }, roster, 105, 'mixed0', seed,
          master ? { [id]: master } : {},
        )).result);
        expect(results.every(result => Number.isFinite(result.enemyRemaining) &&
          result.rounds <= 101 && result.decisions <= 1800)).toBe(true);
        rows.push({ id, mode, master: master ?? 'none', outcomes: results.map(result => result.outcome),
          rounds: results.map(result => result.rounds), surviving: results.map(result => result.surviving),
          enemyRemaining: results.map(result => Number(result.enemyRemaining.toFixed(4))) });
      }
    }
    expect(rows).toHaveLength(48);
    process.stdout.write(`SEASONAL PRESSURE Lv105 owned[new,Tizu,Flora], Stage35 Lv140, mixed+0, optional single Master,144 fights: ${JSON.stringify(rows)}\n`);
  }, 60000);

  it('measures Stage35 Moon pressure with role-aware choices and the same conditional ownership', () => {
    const rows = [];
    for (const { id } of moonCharacters) {
      const roster: StarterId[] = [id, 'tide', 'sprout'];
      const choices = [undefined, ...masterConduits.filter(master => master.character === id).map(master => master.id)];
      for (const master of choices) {
        const results = seeds.map(seed => measureBattle(makeBattle(
          { kind: 'infusion', mode: 'moon', stage: 35 }, roster, 105, 'mixed0', seed,
          master ? { [id]: master } : {},
        ), 'native', undefined, moonPressurePriorities, moonPressureTarget).result);
        const valid = results.every(result => Number.isFinite(result.enemyRemaining) &&
          result.rounds <= 102 && result.decisions <= 1800);
        if (!valid) throw new Error(`Invalid bounded Moon result for ${id}/${master ?? 'none'}: ${
          JSON.stringify(results.map(({ outcome, rounds, decisions, enemyRemaining }) =>
            ({ outcome, rounds, decisions, enemyRemaining })))}`);
        rows.push({
          id, master: master ?? 'none',
          outcomes: results.map(result => result.outcome),
          rounds: results.map(result => result.rounds),
          surviving: results.map(result => result.surviving),
          enemyRemaining: results.map(result => Number(result.enemyRemaining.toFixed(4))),
        });
      }
    }
    expect(rows).toHaveLength(24);
    process.stdout.write(`MOON ROLE-AWARE PRESSURE Lv105 owned[new,Tizu,Flora], Stage35 Lv140, mixed+0, optional single Master,72 fights: ${JSON.stringify(rows)}\n`);
  }, 60000);
});
