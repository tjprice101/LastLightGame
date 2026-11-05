import { describe, expect, it } from 'vitest';
import { freshGame, resolveOperation, validateRequest } from '../../supabase/functions/game-operation/engine';
import { actAndAdvanceTurn } from '../game/battle';
import type { GameOperation } from './server-game';

const entropy = { seed: () => 1729, random: () => .5, uuid: () => '00000000-0000-4000-8000-000000000001' };
function ready() {
  let game = resolveOperation(freshGame('tester'), { kind: 'bootstrap', starterId: 'ember' }, entropy).game;
  game.account.characters.ilyss = { level: 0, evolution: 1 };
  game.account.squad = ['ilyss', 'ember'];
  game = resolveOperation(game, { kind: 'enter', activity: { kind: 'training' } }, entropy).game;
  const state = game.run!.session.state;
  state.allies[0].shatter = 100;
  const recipient = state.allies[1];
  recipient.burn = { damage: 1, turns: 3, sourceId: 'enemy-a', origin: 'native' };
  recipient.weakened = 3;
  recipient.weakenFraction = .25;
  recipient.weakenSourceId = 'enemy-b';
  recipient.weakenOrigin = 'native';
  return game;
}
function request(operation: unknown) {
  return validateRequest({ requestId: entropy.uuid(), expectedRevision: 0, operation });
}
describe('Ilyss chosen-cleanse authority', () => {
  it.each(['burn', 'weaken'] as const)('validates %s and preserves local/authority/checkpoint parity', cleanseChoice => {
    const game = ready();
    const session = game.run!.session;
    const operation: GameOperation = { kind: 'act', runId: session.runId, actorId: 'ilyss',
      action: 'skill2', targetId: 'ember', cleanseChoice };
    expect(request(operation).operation).toEqual(operation);
    const local = actAndAdvanceTurn(session.state, 'ilyss', 'skill2', 'ember', cleanseChoice);
    const result = resolveOperation(game, operation, entropy);
    expect(result.game.run!.session.state).toEqual(local.state);
    const checkpoint = resolveOperation(result.game, { kind: 'checkpoint' }, entropy);
    expect(checkpoint.game.run!.session.state).toEqual(local.state);
  });
  it('rejects malformed, missing, unavailable and non-Ilyss choices without changing the durable game', () => {
    const game = ready();
    const before = structuredClone(game);
    const base = { kind: 'act', runId: game.run!.session.runId, actorId: 'ilyss', action: 'skill2', targetId: 'ember' };
    for (const cleanseChoice of ['invalid', null, 1]) expect(() => request({ ...base, cleanseChoice })).toThrow();
    for (const operation of [base, { ...base, actorId: 'ember', action: 'light', targetId: game.run!.session.state.enemies[0].id,
      cleanseChoice: 'burn' }]) {
      expect(() => resolveOperation(game, operation as GameOperation, entropy)).toThrow();
      expect(game).toEqual(before);
    }
  });
});
