import { describe, expect, it } from 'vitest';
import { auditState, measureCapability, tankProbe } from './roster-capability';
import { makeBattle, measureBattle } from './battle-survey';
import { moonCharacters, sunshadeCharacters } from '../src/content/moon-sunshade-characters';
import { masterConduits } from '../src/content/master-conduits';
import type { StarterId } from '../src/content/starters';
import { actAndAdvanceTurn } from '../src/game/battle';
import { stagedLycalisOdds } from '../src/content/loot-random';

const characters = [...moonCharacters, ...sunshadeCharacters];
const seeds = [1, 1729, 104729];

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
      const packet = tankProbe(id, 105, 'planned');
      expect([output.damage, support.healing, support.shields].every(Number.isFinite)).toBe(true);
      expect(output.actions).toBeGreaterThan(0);
      return { id, damage: output.damage, healing: support.healing, shields: support.shields, packet };
    });
    process.stdout.write(`SEASONAL PAPER Lv105 Common+0, seed1729, six rounds, no incoming; separate packet probe: ${JSON.stringify(rows)}\n`);
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
});
