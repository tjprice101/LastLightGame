import { describe, expect, it, vi } from 'vitest';
import { freshGame, resolveOperation, type DurableGame } from '../../supabase/functions/game-operation/engine';
import type { GameOperation } from '../online/server-game';
import { BattleView, createSession } from './battle-view';
import { conduitRestartNotice, restartHistoricalConduitSession } from './conduit-compatibility';
import { createCreatureCopy } from '../game/character-instances';
import { isStarterId } from '../content/starters';
import { conduitRulesVersion } from '../game/conduit-runtime';

let sequence = 0;
const entropy = { seed: () => 7321, random: () => .9,
  uuid: () => `00000000-0000-4000-8000-${String(++sequence).padStart(12, '0')}` };
const op = (game: DurableGame, operation: GameOperation) => resolveOperation(game, operation, entropy);
function historical() {
  let game = op(freshGame('tester'), { kind: 'bootstrap', starterId: 'ember' }).game;
  game.account.conduits = { 'vigil-core': 1 };
  game.account.conduitEquipment = { ember: ['vigil-core', null, null, null, null, null, null, null] };
  game.account.conduitUpgrades = { 'vigil-core': 3 };
  game.account.masterConduits = { 'master-ember-1': 1 };
  game.account.masterEquipment = { ember: 'master-ember-1' };
  game = op(game, { kind: 'enter', activity: { kind: 'training' } }).game;
  const s = game.run!.session;
  delete s.state.conduitRulesVersion;
  s.state.wave = 7;
  s.state.round = 9;
  s.state.allies[0].hp = 1;
  s.state.allies[0].spent = true;
  s.state.allies[0].recoverThrough = 20;
  s.state.allies[0].conduitRuntime = { numbers: { windveil: 1 }, owners: {} };
  s.stageEvents = [{ kind: 'reward', source: '', target: '', critical: false, amount: 123, message: 'Saved reward.' }];
  game.account.fractalis = 123;
  game.account.receipts = ['saved-receipt'];
  return game;
}

describe('Conduit rules encounter compatibility', () => {
  it.each(['read', 'checkpoint'] as const)('restarts historical %s at the current wave without changing any saved account data', kind => {
    const game = historical();
    const before = structuredClone(game);
    // Current menu choices must not replace the frozen entry snapshot.
    game.account.conduitEquipment = {};
    game.account.masterEquipment = {};
    game.account.characters.ember!.level = 10;
    const account = structuredClone(game.account);
    const resolved = op(game, { kind });
    const s = resolved.game.run!.session;
    expect(resolved.game.account).toEqual(account);
    expect(s.runId).not.toBe(before.run!.session.runId);
    expect(s.state).toMatchObject({ conduitRulesVersion, wave: 7, round: 1, phase: 'player' });
    expect(s.state.allies[0]).toMatchObject({ level: 0, spent: false, recoverThrough: 0,
      masterConduit: 'master-ember-1', conduits: before.run!.equipment.ember });
    expect(s.state.allies[0].hp).toBe(s.state.allies[0].stats.health);
    expect(s.state.allies[0].conduitRuntime?.numbers.windveil).toBeUndefined();
    expect(s.state.conduitUpgrades).toEqual(before.run!.upgrades);
    expect(s.stageEvents).toEqual([]);
    expect(s.log).toContain(conduitRestartNotice);
    expect(s.entrancePending).toBe(true);
    expect(op(resolved.game, { kind }).game).toEqual(resolved.game);
  });

  it.each(['act', 'endTurn', 'continue', 'retry'] as const)('does not apply stale %s input to the restarted encounter', kind => {
    const game = historical();
    const runId = game.run!.session.runId;
    const operation: GameOperation = kind === 'act'
      ? { kind, runId, actorId: 'stale-actor', action: 'light', targetId: 'stale-target' } : { kind, runId };
    const resolved = op(game, operation);
    expect(resolved.response.result).toBeUndefined();
    expect(resolved.game.account).toEqual(game.account);
    expect(resolved.game.run!.session.state.round).toBe(1);
    expect(resolved.game.run!.session.runId).not.toBe(runId);
    expect(() => op(resolved.game, operation)).toThrow('no longer active');
  });

  it('honors quit without restarting or changing saved rewards', () => {
    const game = historical();
    const result = op(game, { kind: 'quit', runId: game.run!.session.runId });
    expect(result.game.run).toBeNull();
    expect(result.game.account).toEqual(game.account);
  });

  it.each([undefined, 2, 3, 7, 8])('restarts an offline version%s encounter once, preserving progress, gear, masters and log communication', version => {
    const online = historical().run!;
    const session = structuredClone(online.session);
    session.state.conduitRulesVersion = version;
    const frozen = structuredClone(session);
    expect(restartHistoricalConduitSession(session)).toBe(true);
    expect(session.runId).not.toBe(frozen.runId);
    expect(session.progress).toEqual(frozen.progress);
    expect(session.teamProgress).toEqual(frozen.teamProgress);
    expect(session.state.wave).toBe(7);
    expect(session.state.round).toBe(1);
    expect(session.state.allies[0].conduits).toEqual(frozen.state.allies[0].conduits);
    expect(session.state.allies[0].masterConduit).toBe('master-ember-1');
    expect(session.stageEvents).toEqual([]);
    expect(session.log).toContain(conduitRestartNotice);
    expect(restartHistoricalConduitSession(session)).toBe(false);
  });

  it('leaves current offline sessions untouched', () => {
    const session = createSession('ember');
    const before = structuredClone(session);
    expect(restartHistoricalConduitSession(session)).toBe(false);
    expect(session).toEqual(before);
  });

  it('retains frozen captured copies and staged progress when the account changes after entry', () => {
    let game = op(freshGame('tester'), { kind: 'bootstrap', starterId: 'ember' }).game;
    const copy = createCreatureCopy('infusion:heavens:0', 1, 60);
    game.account.capturedCharacters = [copy];
    game.account.squad = ['ember', copy.instanceId];
    game = op(game, { kind: 'enter', activity: { kind: 'story', stage: 1 } }).game;
    delete game.run!.session.state.conduitRulesVersion;
    const frozen = structuredClone(game.run!);
    game.account.capturedCharacters = [];
    game.account.squad = ['ember'];
    game.account.characters.ember!.level = 15;
    const account = structuredClone(game.account);
    const resolved = op(game, { kind: 'checkpoint' });
    expect(resolved.game.account).toEqual(account);
    expect(resolved.game.run!.session.state.story?.storyStage).toBe(1);
    expect(resolved.game.run!.session.state.allies.map(unit => unit.id)).toEqual(frozen.roster);
    expect(resolved.game.run!.session.state.allies[1].captured).toEqual(copy);
    expect(resolved.game.run!.session.state.allies[0].level).toBe(0);
    const session = structuredClone(frozen.session);
    expect(restartHistoricalConduitSession(session)).toBe(true);
    expect(session.state.allies[1].captured).toEqual(copy);
    expect(session.state.allies.filter(unit => isStarterId(unit.definitionId))[0].level).toBe(0);
  });

  it('replaces authoritative state without presenting old impacts or retaining stale actor/target choices', async () => {
    const session = structuredClone(historical().run!.session);
    const replacement = structuredClone(session);
    restartHistoricalConduitSession(replacement);
    const view = Object.create(BattleView.prototype);
    const present = vi.fn();
    const render = vi.fn();
    const enterEncounter = vi.fn();
    Object.assign(view, { session, present, render, enterEncounter, disposed: false,
      actorId: 'stale-actor', targetId: 'stale-target' });
    await Reflect.apply(Reflect.get(BattleView.prototype, 'presentAuthoritative'), view,
      [{ session: replacement }, { state: replacement.state, events: [] }, true]);
    expect(present).not.toHaveBeenCalled();
    expect(render).toHaveBeenCalledOnce();
    expect(enterEncounter).toHaveBeenCalledOnce();
    expect(view.actorId).toBe(replacement.state.allies[0].id);
    expect(view.targetId).toBe(replacement.state.enemies[0].id);
    expect(session).toEqual(replacement);
  });

  it('exposes the restart notice outside the battle menu as an accessible status', () => {
    const session = structuredClone(historical().run!.session);
    restartHistoricalConduitSession(session);
    const menu = { addEventListener: () => {}, close: () => {}, showModal: () => {} };
    const host = { innerHTML: '', querySelectorAll: () => [],
      querySelector: (selector: string) => selector === '#battle-menu' ? menu : null };
    const view = Object.create(BattleView.prototype);
    Object.assign(view, { host, session, actorId: 'ember', targetId: '', dragging: false });
    Reflect.apply(Reflect.get(BattleView.prototype, 'render'), view, []);
    expect(host.innerHTML).toContain(`<p class="battle-compatibility-notice" role="status">${conduitRestartNotice}</p>`);
    expect(host.innerHTML.indexOf('class="battle-compatibility-notice"')).toBeLessThan(host.innerHTML.indexOf('<dialog'));
  });
});
