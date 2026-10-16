import { describe, expect, it } from 'vitest';
import { freshGame, publicGame, resolveOperation, validateRequest, type DurableGame } from '../../supabase/functions/game-operation/engine';
import { calamityActivities, calamityChest, calamityChestId } from '../content/calamity';
import { calamityBossArt } from '../content/calamity-art';
import { calamiticConduits, calamiticTokenPrice } from '../content/calamitic-conduits';
import { activityAccess } from '../game/activity-access';
import { validateGameResponse, type GameOperation } from './server-game';

let sequence = 0;
const entropy = { seed: () => 7321, random: () => .9,
  uuid: () => `00000000-0000-4000-8000-${String(++sequence).padStart(12, '0')}` };
const op = (game: DurableGame, operation: GameOperation) => resolveOperation(game, operation, entropy);
function ready() {
  const game = op(freshGame('tester'), { kind: 'bootstrap', starterId: 'ember' }).game;
  game.account.characters.ember = { level: 105, evolution: 6 };
  game.account.normalFinalClears = Object.fromEntries(calamityActivities.map(a => [a.id, true]));
  game.account.calamityClears = Object.fromEntries(calamityActivities.map(a => [a.id, 2]));
  return game;
}

describe('authoritative Calamity operations', () => {
  it('requires actual normal final-clear evidence, not old stage unlocks or bearer levels', () => {
    const game = ready();
    delete game.account.normalFinalClears;
    game.account.dungeonStages = { infernic: 35 };
    const activity = { kind: 'calamity', activity: 'infernic', tier: 1 } as const;
    expect(activityAccess(game.account, activity).unlocked).toBe(false);
    const before = structuredClone(game);
    expect(() => op(game, { kind: 'enter', activity })).toThrow('Activity locked');
    expect(game).toEqual(before);
    game.account.normalFinalClears = { infernic: true };
    delete game.account.calamityClears;
    expect(op(game, { kind: 'enter', activity }).game.run!.activity).toEqual(activity);
    expect(() => op(game, { kind: 'enter', activity: { ...activity, tier: 2 } })).toThrow('Activity locked');
  });

  it.each(calamityActivities)('saves only the actual $id chest and no immediate contents, then replays frozen EX3', definition => {
    let game = ready();
    game.account.conduits = { 'vigil-core': 1 };
    game.account.conduitEquipment = { ember: ['vigil-core', null, null, null, null, null, null, null] };
    game.account.masterConduits = { 'master-ember-1': 1 };
    game.account.masterEquipment = { ember: 'master-ember-1' };
    game = op(game, { kind: 'enter', activity: { kind: 'calamity', activity: definition.id, tier: 3 } }).game;
    expect(game.account.creatures[`calamity:${definition.id}`]).toEqual({ defeated: false });
    const frozen = structuredClone(game.run!);
    const enemy = game.run!.session.state.enemies[0];
    expect(enemy.art).toBe(calamityBossArt[definition.id]);
    enemy.hp = 1;
    const runId = game.run!.session.runId;
    const cleared = op(game, { kind: 'act', runId, actorId: 'ember', action: 'light', targetId: enemy.id });
    game = cleared.game;
    const id = calamityChestId(definition.id, 3);
    expect(game.run!.session.state.phase).toBe('cleared');
    expect(cleared.response.result!.events.filter(event => event.kind === 'reward')).toEqual([
      expect.objectContaining({ amount: 0, calamityChest: id }),
    ]);
    expect(() => validateGameResponse({ ...cleared.response, result: { ...cleared.response.result!,
      events: cleared.response.result!.events.map(event => event.kind === 'reward'
        ? { ...event, calamiticTokens: 1 } : event) } })).toThrow('incomplete');
    expect(game.account.calamityChests?.[id]).toBe(1);
    expect(game.account.creatures[`calamity:${definition.id}`]).toEqual({ defeated: true });
    expect(game.account.calamityClears?.[definition.id]).toBe(3);
    expect(game.account.fractalis).toBe(0);
    expect(game.account.lycalis).toBe(0);
    expect(game.account.masterChests ?? 0).toBe(0);
    expect(game.account.capturedCharacters ?? []).toEqual([]);
    expect(() => op(game, { kind: 'continue', runId })).toThrow('Calamity ends');
    const holdings = structuredClone(game.account);
    game.account.characters.ember = { level: 0, evolution: 1 };
    game.account.conduitEquipment = {};
    game.account.masterEquipment = {};
    const resumed = op(game, { kind: 'read' });
    expect(resumed.game.run).toEqual(game.run);
    const replayed = op(game, { kind: 'retry', runId }).game;
    expect(replayed.run!.activity).toEqual(frozen.activity);
    expect(replayed.run!.session.runId).not.toBe(runId);
    expect(replayed.run!.session.state.allies[0]).toMatchObject({
      level: 105, masterConduit: 'master-ember-1', conduits: frozen.equipment.ember,
    });
    expect(replayed.run!.session.stageEvents).toEqual([]);
    expect(replayed.account.calamityChests).toEqual(holdings.calamityChests);
    expect(replayed.account.fractalis).toBe(holdings.fractalis);
  });

  it('opens a single chest with a strict saved receipt, no supplied rewards, and rejects stale counts', () => {
    const game = ready();
    const id = calamityChestId('treasury', 3);
    game.account.calamityChests = { [id]: 2 };
    const before = structuredClone(game);
    const opened = op(game, { kind: 'openCalamityChest', id, expectedCount: 2 });
    expect(game).toEqual(before);
    expect(opened.game.account.calamityChests?.[id]).toBe(1);
    const reward = opened.response.calamityOpening!;
    expect(reward.id).toBe(id);
    expect(reward.masterChests).toBe(2);
    expect(opened.game.account.fractalis).toBe(reward.fractalis);
    expect(reward.fractalis).toBeGreaterThan(calamityChest('treasury', 3).fractalis);
    expect(validateGameResponse(opened.response).calamityOpening).toEqual(reward);
    expect(Object.keys(reward).sort()).toEqual(['id', 'name', 'fractalis', 'lycalis', 'materials', 'conduits', 'mechanicalComponents', 'calamiticTokens', 'masterChests'].sort());
    expect(reward.calamiticTokens).toBe(8);
    expect(() => op(opened.game, { kind: 'openCalamityChest', id, expectedCount: 2 })).toThrow('count changed');
    expect(() => validateGameResponse({ ...opened.response, calamityOpening: { ...reward, bundles: 7 } })).toThrow('incomplete');
    expect(() => validateGameResponse({ ...opened.response, calamityOpening: { ...reward, name: 'Invented chest' } })).toThrow('incomplete');
    expect(() => validateGameResponse({ ...opened.response, calamityOpening: { ...reward, conduits: { 'vigil-core': 1 } } })).toThrow('incomplete');
    expect(() => validateGameResponse({ ...opened.response, calamityOpening: { ...reward, calamiticTokens: 7 } })).toThrow('incomplete');
  });

  it.each(calamityActivities)('validates actual saved $id openings at every tier', definition => {
    for (const tier of [1, 2, 3] as const) {
      const game = ready();
      const id = calamityChestId(definition.id, tier);
      game.account.calamityChests = { [id]: 1 };
      const seed = 7321;
      game.account.calamitySeed = seed;
      const opened = op(game, { kind: 'openCalamityChest', id, expectedCount: 1 });
      const response = validateGameResponse(opened.response);
      expect(response.calamityOpening?.id).toBe(id);
      expect(response.calamityOpening?.masterChests).toBe(tier === 3 ? 2 : 0);
      expect(response.calamityOpening?.calamiticTokens).toBe([1, 3, 8][tier - 1]);
      expect(response.account.calamityChests?.[id]).toBe(0);
      expect(response.account.calamitySeed).not.toBe(seed);
    }
  });

  it.each(calamiticConduits)('authoritatively purchases $name for tokens with no client-supplied price', ({ id }) => {
    const game = ready();
    game.account.calamiticTokens = calamiticTokenPrice + 17;
    const operation = { kind: 'purchaseConduit', id } as const;
    const request = validateRequest({ requestId: crypto.randomUUID(), expectedRevision: 0, operation });
    expect(request.operation).toEqual(operation);
    const resolved = op(game, request.operation);
    expect(resolved.game.account.calamiticTokens).toBe(17);
    expect(resolved.game.account.conduits?.[id]).toBe(1);
    expect(validateGameResponse(resolved.response).account.conduits?.[id]).toBe(1);
    expect(() => validateRequest({ requestId: crypto.randomUUID(), expectedRevision: 0,
      operation: { ...operation, price: calamiticTokenPrice, calamiticTokens: calamiticTokenPrice } })).toThrow('Unexpected request field');
  });

  it.each([
    { kind: 'enter', activity: { kind: 'calamity', activity: 'war', tier: 1 } },
    { kind: 'enter', activity: { kind: 'calamity', activity: 'infernic', tier: 0 } },
    { kind: 'enter', activity: { kind: 'calamity', activity: 'infernic', tier: '1' } },
    { kind: 'enter', activity: { kind: 'calamity', activity: 'infernic', tier: 1, stage: 1 } },
    { kind: 'openCalamityChest', id: 'calamity:infernic:1', expectedCount: 0 },
    { kind: 'openCalamityChest', id: 'calamity:infernic:1', expectedCount: 1.5 },
    { kind: 'openCalamityChest', id: 'calamity:war:1', expectedCount: 1 },
    { kind: 'openCalamityChest', id: 'calamity:infernic:1', expectedCount: 1, reward: {} },
    { kind: 'purchaseConduit', id: calamiticConduits[0].id, price: calamiticTokenPrice },
  ])('rejects malformed request %j', operation => {
    expect(() => validateRequest({ requestId: crypto.randomUUID(), expectedRevision: 0, operation })).toThrow();
  });

  it('rejects unsupported saved Calamity instead of falling back to Training', () => {
    const game = op(ready(), { kind: 'enter', activity: { kind: 'calamity', activity: 'machines', tier: 1 } }).game;
    Reflect.set(game.run!.activity, 'activity', 'story');
    const before = structuredClone(game);
    expect(() => op(game, { kind: 'read' })).toThrow('Invalid Calamity');
    expect(() => publicGame(game, 1)).toThrow('Invalid Calamity');
    expect(game).toEqual(before);
  });
});
