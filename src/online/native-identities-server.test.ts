import { describe, expect, it } from 'vitest';
import { freshGame, resolveOperation, type DurableGame } from '../../supabase/functions/game-operation/engine';
import { actAndAdvanceTurn } from '../game/battle';
import { conduitRulesVersion } from '../game/conduit-runtime';
import type { GameOperation } from './server-game';
import type { StarterId } from '../content/starters';
import { nativeIdentityIds } from '../content/native-identities';
import { enemyCombatStats } from '../content/stat-growth';

let sequence = 0;
const entropy = { seed: () => 1729, random: () => .5,
  uuid: () => `00000000-0000-4000-8000-${String(++sequence).padStart(12, '0')}` };
const op = (game: DurableGame, operation: GameOperation) => resolveOperation(game, operation, entropy);
function ready(roster: StarterId[]) {
  let game = op(freshGame('tester'), { kind: 'bootstrap', starterId: 'ember' }).game;
  for (const id of roster) game.account.characters[id] = { level: 0, evolution: 1 };
  game.account.squad = roster;
  game = op(game, { kind: 'enter', activity: { kind: 'training' } }).game;
  for (const ally of game.run!.session.state.allies) ally.shatter = 100;
  for (const enemy of game.run!.session.state.enemies) enemy.stats.health = enemy.hp = 100000;
  return game;
}

describe('native identity authoritative parity and restart', () => {
  it('rebuilds a rules8 late Training encounter with stronger enemies and unchanged frozen allies/holdings', () => {
    const game = ready(['ember', 'tide']);
    const session = game.run!.session;
    session.state.conduitRulesVersion = 8;
    session.state.wave = 120;
    const before = structuredClone(game);
    const result = op(game, { kind: 'read' });
    expect(result.game.account).toEqual(before.account);
    const restored = result.game.run!.session;
    expect(restored.state.wave).toBe(120);
    expect(restored.state.conduitRulesVersion).toBe(9);
    for (const enemy of restored.state.enemies) {
      expect(enemy.level).toBe(120);
      expect(enemy.stats).toEqual(enemyCombatStats(120, false));
    }
    expect(restored.state.allies.map(ally => ally.stats)).toEqual(session.state.allies.map(ally => ally.stats));
    expect(result.response.result).toBeUndefined();
    expect(game).toEqual(before);
  });
  it.each(nativeIdentityIds)('matches %s strengthened Last Flare and frozen state online', id => {
    const game = ready([id, id === 'ember' ? 'tide' : 'ember']);
    const targetId = game.run!.session.state.enemies[0].id;
    const local = actAndAdvanceTurn(game.run!.session.state, id, 'ultimate', targetId);
    const online = op(game, { kind: 'act', runId: game.run!.session.runId, actorId: id, action: 'ultimate', targetId });
    expect(online.response.result).toEqual(local);
    expect(op(online.game, { kind: 'read' }).game.run!.session.state).toEqual(local.state);
  });
  it.each([
    { roster: ['tide', 'ember'] as StarterId[], actor: 'tide', action: 'skill2', target: 'ember' },
    { roster: ['bruno', 'ember'] as StarterId[], actor: 'bruno', action: 'skill2', target: 'ember' },
    { roster: ['disciple', 'ember'] as StarterId[], actor: 'disciple', action: 'skill1', target: 'ember' },
  ] as const)('validates and preserves explicit $actor ally targeting online', ({ roster, actor, action, target }) => {
    const game = ready(roster);
    const before = structuredClone(game);
    const local = actAndAdvanceTurn(game.run!.session.state, actor, action, target);
    const online = op(game, { kind: 'act', runId: game.run!.session.runId, actorId: actor, action, targetId: target });
    expect(online.response.result).toEqual(local);
    expect(game).toEqual(before);
    expect(op(online.game, { kind: 'read' }).game.run!.session.state).toEqual(local.state);
  });

  it.each(['ember', 'elise', 'crinso', 'nerithe', 'orvella', 'vaelor'] as const)('matches %s native state across client and authority', id => {
    const game = ready([id, 'tide']);
    const targetId = game.run!.session.state.enemies[0].id;
    const action = id === 'orvella' ? 'skill2' : 'skill1';
    const local = actAndAdvanceTurn(game.run!.session.state, id, action, targetId);
    const online = op(game, { kind: 'act', runId: game.run!.session.runId, actorId: id, action, targetId });
    expect(online.response.result).toEqual(local);
  });

  it('rejects invalid ally targets atomically without Gauge or account changes', () => {
    const game = ready(['disciple', 'ember']);
    const before = structuredClone(game);
    expect(() => op(game, { kind: 'act', runId: game.run!.session.runId, actorId: 'disciple',
      action: 'skill1', targetId: game.run!.session.state.enemies[0].id })).toThrow('living ally');
    expect(game).toEqual(before);
  });

  it.each([2, 3, 7, 8].flatMap(version => (['read', 'checkpoint', 'act'] as const).map(kind => ({ version, kind }))))(
    'restarts version$version through $kind without applying stale commands or replacing frozen squad', ({ version, kind }) => {
    const game = ready(['crinso', 'tide']);
    const runId = game.run!.session.runId;
    game.run!.session.state.conduitRulesVersion = version;
    game.run!.session.state.allies[0].hp = 1;
    game.run!.session.state.allies[0].pilot = { duality: 3 };
    game.run!.session.state.allies[0].native = { combo: 3, edge: 'crimson' };
    game.account.squad = ['ember'];
    const holdings = structuredClone(game.account);
    const operation: GameOperation = kind === 'act' ? { kind, runId, actorId: 'crinso', action: 'skill1',
      targetId: game.run!.session.state.enemies[0].id } : { kind };
    const result = op(game, operation);
    const state = result.game.run!.session.state;
    expect(state.conduitRulesVersion).toBe(conduitRulesVersion);
    expect(result.game.run!.session.runId).not.toBe(runId);
    expect(state.allies.map(ally => ally.id)).toEqual(['crinso', 'tide']);
    expect(state.allies[0].hp).toBe(state.allies[0].stats.health);
    expect(state.allies[0].native?.combo ?? 0).toBe(0);
    expect(state.allies[0].pilot?.duality).toBeUndefined();
    expect(state.allies[0].spent).toBe(false);
    expect(result.response.result).toBeUndefined();
    expect(result.game.account).toEqual(holdings);
  });
});
