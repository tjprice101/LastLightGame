import { describe, expect, it } from 'vitest';
import { freshGame, resolveOperation } from '../../supabase/functions/game-operation/engine';
import { actAndAdvanceTurn, actionGaugeCost } from '../game/battle';

const entropy = { seed: () => 7321, random: () => .9,
  uuid: () => '00000000-0000-4000-8000-000000000001' };

describe('Phase 0 authority source parity', () => {
  it('restarts a version-4 encounter from frozen investments without applying its stale action or rewriting holdings', () => {
    const id = 'calamitic-causality-funeral-engine';
    let game = resolveOperation(freshGame('phase-zero-restart'), { kind: 'bootstrap', starterId: 'ember' }, entropy).game;
    game.account.conduits = { [id]: 1 };
    game.account.conduitUpgrades = { [id]: 2 };
    game.account.conduitEquipment = { ember: [id, null, null, null, null, null, null, null] };
    game = resolveOperation(game, { kind: 'enter', activity: { kind: 'training' } }, entropy).game;
    game.account.conduitEquipment = { ember: [null, null, null, null, null, null, null, null] };
    game.run!.session.state.conduitRulesVersion = 4;
    game.run!.session.state.allies[0].hp = 1;
    const previous = structuredClone(game);
    const result = resolveOperation(game, { kind: 'act', runId: game.run!.session.runId,
      actorId: 'ember', action: 'light', targetId: game.run!.session.state.enemies[0].id }, entropy);
    expect(result.response.result).toBeUndefined();
    expect(result.game.account).toEqual(previous.account);
    const restored = result.game.run!.session.state;
    expect(restored.conduitRulesVersion).toBe(10);
    expect(restored.allies[0].hp).toBe(restored.allies[0].stats.health);
    expect(restored.allies[0].stats.skillPower).toBe(1);
    expect(restored.allies[0].stats.skillEfficiency).toBe(.5);
    expect(restored.allies[0].conduits?.[0]).toBe(id);
    expect(result.game.run!.session.entrancePending).toBe(true);
    expect(game).toEqual(previous);
  });
  it.each([null, 0, 1, 2, 3, 4, 5])('preserves frozen Undertide +%s and charges the selected-target cost identically', level => {
    const id = 'aquatic-undertide-chronometer';
    let game = resolveOperation(freshGame('phase-zero-test'), { kind: 'bootstrap', starterId: 'tide' }, entropy).game;
    game.account.characters.ember = { level: 0, evolution: 1 };
    game.account.squad = ['tide', 'ember'];
    if (level !== null) {
      game.account.conduits = { [id]: 1 };
      game.account.conduitUpgrades = { [id]: level };
      game.account.conduitEquipment = { tide: [id, null, null, null, null, null, null, null] };
    }
    game = resolveOperation(game, { kind: 'enter', activity: { kind: 'training' } }, entropy).game;
    const session = game.run!.session;
    for (const unit of session.state.allies) {
      expect(unit.stats.skillPower).toBe(1);
      expect(unit.stats.gaugeGain).toBe(1);
      unit.shatter = 100;
    }
    for (const enemy of session.state.enemies) {
      enemy.stats.health = 10000;
      enemy.hp = 10000;
    }
    const targetId = session.state.enemies[0].id;
    const first = resolveOperation(game, { kind: 'act', runId: session.runId,
      actorId: 'tide', action: 'skill1', targetId }, entropy);
    game = first.game;
    const state = game.run!.session.state;
    const caster = state.allies.find(ally => ally.id === 'ember')!;
    const cost = Math.ceil(25 * (1 - (level === null ? 0 : .15 * (1 + .1 * level))));
    caster.shatter = cost;
    expect(actionGaugeCost(caster, 'skill1', state, targetId)).toBe(cost);
    game.account.conduitEquipment = { tide: [null, null, null, null, null, null, null, null] };
    const expected = actAndAdvanceTurn(state, caster.id, 'skill1', targetId);
    const before = structuredClone(game);
    const result = resolveOperation(game, { kind: 'act', runId: game.run!.session.runId,
      actorId: caster.id, action: 'skill1', targetId }, entropy);
    expect(result.response.result).toEqual(expected);
    expect(result.game.run!.session.state.allies[0].conduits?.[0]).toBe(level === null ? undefined : id);
    expect(game).toEqual(before);
  });
});
