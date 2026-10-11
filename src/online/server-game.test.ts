import { describe, expect, it } from 'vitest';
import { freshGame, resolveOperation, validateRequest, type DurableGame } from '../../supabase/functions/game-operation/engine';
import { validateGameResponse, type GameOperation } from './server-game';
import { createCreatureCopy } from '../game/character-instances';
import { actAndAdvanceTurn } from '../game/battle';
import { maxLevelPlan } from '../game/account';
import { validateSaveFile } from '../game/save-file';
import { getSummonBanner } from '../content/summon-banners';

let sequence = 0;
const entropy = { seed: () => 7321, random: () => .9,
  uuid: () => `00000000-0000-4000-8000-${String(++sequence).padStart(12, '0')}` };
const op = (game: DurableGame, operation: GameOperation) => resolveOperation(game, operation, entropy);
function started() { return op(freshGame('tester'), { kind: 'bootstrap', starterId: 'ember' }).game; }
function rich() { const game = started(); game.account.fractalis = 1000000; game.account.lycalis = 1000; return game; }

describe('server authoritative game engine', () => {
  it.each(['standard', 'roses'] as const)('commits and validates %s material draws and Rare duplicate conversions', bannerId => {
    const game = rich();
    const result = op(game, { kind: 'summon', bannerId });
    expect(result.response.summon?.entry.kind).toBe('material');
    expect(result.response.summon?.materials?.id).toMatch(/-rare$/);
    expect(result.response.summon?.materials?.amount).toBe(3);
    expect(result.game.account.capturedCharacters).toBeUndefined();
    expect(validateGameResponse(result.response)).toEqual(result.response);
    const materials = result.response.summon!.materials!;
    for (const patch of [undefined, { ...materials, amount: 0 }, { ...materials, amount: 15 },
      { ...materials, id: 'infernic-omnic' }, { ...materials, id: 'rosethorn-epic' }]) {
      expect(() => validateGameResponse({ ...result.response, summon: { ...result.response.summon, materials: patch } })).toThrow('incomplete');
    }
    const owned = rich();
    const entries = getSummonBanner(bannerId).pool();
    for (const entry of entries) if (entry.kind === 'character') owned.account.characters[entry.id] = { level: 0, evolution: 1 };
    owned.account.bannerPity = { [bannerId]: { highestStar: 79, unownedHighestStar: 149 } };
    const duplicate = op(owned, { kind: 'summon', bannerId });
    expect(duplicate.response.summon?.materials?.amount).toBe(15);
    expect(duplicate.response.summon?.materials?.id).toMatch(/-rare$/);
    expect(duplicate.response.summon?.copy).toBeUndefined();
    expect(validateGameResponse(duplicate.response)).toEqual(duplicate.response);
    expect(owned.account.bannerPity?.[bannerId]?.highestStar).toBe(79);
  });
  it('honors 80/150 pity and imported overdue progress through authoritative draws', () => {
    for (const [bannerId, highestStar, unownedHighestStar] of [
      ['standard', 79, 100], ['roses', 79, 100],
      ['standard', 79, 149], ['roses', 199, 499],
    ] as const) {
      const game = rich();
      game.account.bannerPity = { [bannerId]: { highestStar, unownedHighestStar } };
      const before = structuredClone(game);
      const read = op(game, { kind: 'read' });
      expect(read.game.account.bannerPity).toEqual(game.account.bannerPity);
      const result = op(game, { kind: 'summon', bannerId });
      expect(result.game.account.lycalis).toBe(game.account.lycalis - 10);
      expect(result.game.account.bannerPity?.[bannerId]?.highestStar).toBe(0);
      expect(result.game.account.bannerPity?.[bannerId]?.unownedHighestStar).toBe(0);
      expect(game).toEqual(before);
    }
  });
  it('imports a full validated offline save once into an unstarted account, then preserves authority', () => {
    const source = rich();
    source.account.storyCompleted = 29;
    source.account.capturedCharacters = [createCreatureCopy('infusion:treasury:0', 1, 89)];
    const save = validateSaveFile({ format: 'last-light-save', version: 1, profile: { version: 1, starterId: 'ember' }, account: source.account });
    const initial = freshGame('newplayer');
    const before = structuredClone(initial);
    const imported = op(initial, { kind: 'importSave', save }).game;
    expect(imported.account).toEqual(save.account);
    expect(imported.starterId).toBe('ember');
    expect(imported.profile.username).toBe('newplayer');
    expect(imported.run).toBeNull();
    expect(initial).toEqual(before);
    expect(() => op(imported, { kind: 'importSave', save })).toThrow('new');
    expect(() => op(started(), { kind: 'importSave', save })).toThrow('new');
    expect(op(imported, { kind: 'setSquad', ids: ['ember'] }).game.account.fractalis).toBe(save.account.fractalis);
  });
  it('rejects malformed server envelopes before exposing profile/social/session to UI', () => {
    const response = op(started(), { kind: 'read' }).response;
    expect(validateGameResponse(response)).toEqual(response);
    for (const patch of [{ social: {} }, { profile: {} }, { account: {} }, { session: {} },
      { revision: -1 }, { result: { state: {}, events: [] } },
      { social: { friends: [{}], incoming: [], outgoing: [] } }]) {
      expect(() => validateGameResponse({ ...response, ...patch })).toThrow('incomplete');
    }
    const entered = op(started(), { kind: 'enter', activity: { kind: 'story', stage: 1 } }).response;
    expect(validateGameResponse(entered)).toEqual(entered);
  });
  it('starts fresh with exactly one approved starter once, no imported currency', () => {
    const first = started();
    expect(first.account.fractalis).toBe(0);
    expect(Object.keys(first.account.characters)).toEqual(['ember']);
    expect(() => op(first, { kind: 'bootstrap', starterId: 'tide' })).toThrow('already');
    expect(() => op(freshGame('tester'), { kind: 'bootstrap', starterId: 'rosetta' } as never)).toThrow('Invalid');
    expect(() => op(freshGame('tester'), { kind: 'enter', activity: { kind: 'training' } })).toThrow('first');
  });
  it('rejects unknown and tampered outcomes, wallets, seeds, ownership and fields', () => {
    const base = { requestId: entropy.uuid(), expectedRevision: 0, operation: { kind: 'read' } };
    for (const tamper of [{ wallet: {} }, { seed: 1 }, { result: {} }, { userId: entropy.uuid() }]) {
      expect(() => validateRequest({ ...base, ...tamper })).toThrow('Unexpected');
      expect(() => validateRequest({ ...base, operation: { kind: 'read', ...tamper } })).toThrow('Unexpected');
    }
    expect(() => validateRequest({ ...base, operation: { kind: 'summon' } })).toThrow('Missing');
    expect(() => validateRequest({ ...base, requestId: 'not-an-id' })).toThrow('UUID');
    expect(() => validateRequest({ ...base, expectedRevision: 1.1 })).toThrow('integer');
    expect(() => op(started(), { kind: 'setSquad', ids: ['tide'] })).toThrow();
    expect(() => op(rich(), { kind: 'upgradeCharacter', id: 'tide', upgradeKind: 'level', expected: { level: 0, evolution: 1 } })).toThrow('owned');
  });
  it('enforces all activity unlock gates and active-run exclusivity', () => {
    const game = started();
    for (const activity of [
      { kind: 'story', stage: 2 }, { kind: 'dungeon', element: 'infernic', stage: 2 },
      { kind: 'infusion', mode: 'machines', stage: 2 }, { kind: 'war', character: 'nerithe', stage: 2 },
      { kind: 'dungeon', element: 'physical', stage: 1 }, { kind: 'story', stage: 0 },
    ]) expect(() => op(game, { kind: 'enter', activity } as never)).toThrow();
    const entered = op(game, { kind: 'enter', activity: { kind: 'story', stage: 1 } }).game;
    expect(() => op(entered, { kind: 'enter', activity: { kind: 'training' } })).toThrow('Quit');
    const id = entered.run!.session.runId;
    expect(() => op(entered, { kind: 'continue', runId: id })).toThrow('Clear');
    expect(() => op(entered, { kind: 'retry', runId: id })).toThrow('defeat');
    expect(() => op(entered, { kind: 'quit', runId: entropy.uuid() })).toThrow('active');
    expect(op(entered, { kind: 'quit', runId: id }).game.run).toBeNull();
  });
  it('resolves real combat/events and credits actual rewards without accepting claims', () => {
    let game = started();
    const first = op(game, { kind: 'enter', activity: { kind: 'story', stage: 1 } });
    game = first.game;
    let amount = 0;
    for (let turn = 0; turn < 100 && game.run!.session.state.phase === 'player'; turn++) {
      const state = game.run!.session.state;
      const target = state.enemies.find(e => e.hp > 0)!;
      const expected = actAndAdvanceTurn(state, 'ember', 'light', target.id);
      const resolved = op(game, { kind: 'act', runId: game.run!.session.runId,
        actorId: 'ember', action: 'light', targetId: target.id });
      expect(resolved.response.result).toEqual(expected);
      amount += expected.events.filter(e => e.kind === 'reward').reduce((sum, e) => sum + e.amount, 0);
      game = resolved.game;
    }
    expect(game.run!.session.state.phase).toBe('cleared');
    expect(game.account.fractalis).toBe(amount);
    expect(game.account.storyCompleted).toBe(1);
    expect(game.account.receipts.length).toBeGreaterThan(0);
    expect(() => op(game, { kind: 'act', runId: game.run!.session.runId, actorId: 'ember', action: 'light', targetId: 'x' })).toThrow();
  });
  it('validates actual actor/action/target and never changes previous durable state on rejection', () => {
    const game = op(started(), { kind: 'enter', activity: { kind: 'training' } }).game;
    const before = JSON.stringify(game);
    const runId = game.run!.session.runId;
    for (const action of [
      { actorId: 'tide', action: 'light', targetId: 'enemy-1-0' },
      { actorId: 'ember', action: 'ultimate', targetId: 'enemy-1-0' },
      { actorId: 'ember', action: 'light', targetId: 'nonexistent' },
      { actorId: 'ember', action: 'hack', targetId: 'enemy-1-0' },
    ]) expect(() => op(game, { kind: 'act', runId, ...action } as never)).toThrow();
    expect(JSON.stringify(game)).toBe(before);
  });
  it('keeps squads/progress/equipment/upgrades frozen across menu operations and continue', () => {
    let game = rich();
    game.account.characters.ember = { level: 30, evolution: 1, weaponRank: 0 };
    game = op(game, { kind: 'enter', activity: { kind: 'story', stage: 1 } }).game;
    const original = structuredClone(game.run!);
    game.account.characters.ember!.level = 0;
    game.account.conduitUpgrades = {};
    while (game.run!.session.state.phase === 'player') {
      const target = game.run!.session.state.enemies.find(e => e.hp > 0)!;
      game = op(game, { kind: 'act', runId: game.run!.session.runId, actorId: 'ember', action: 'light', targetId: target.id }).game;
    }
    const continued = op(game, { kind: 'continue', runId: game.run!.session.runId }).game;
    expect(continued.run!.session.state.allies[0].level).toBe(30);
    expect(continued.run!.session.teamProgress).toEqual(original.session.teamProgress);
    expect(continued.run!.session.stageEvents.some(e => e.kind === 'reward')).toBe(false);
  });
  it('charges six Common materials exactly 80 each, preserves overflow and invalid purchases', () => {
    let game = rich();
    for (const element of ['infernic', 'oceanic', 'atmospheric', 'botanic', 'tranquilitic', 'chaotic'] as const) {
      game = op(game, { kind: 'purchaseMaterial', element, quantity: 10 }).game;
      expect(game.account.materials[`${element}-common`]).toBe(10);
    }
    expect(game.account.fractalis).toBe(1000000 - 4800);
    expect(() => op(game, { kind: 'purchaseMaterial', element: 'infernic', quantity: 2 } as never)).toThrow('Invalid');
    expect(() => op(started(), { kind: 'purchaseMaterial', element: 'infernic', quantity: 1 })).toThrow('Prismatica');
    game.account.materials['infernic-common'] = Number.MAX_SAFE_INTEGER;
    expect(() => op(game, { kind: 'purchaseMaterial', element: 'infernic', quantity: 1 })).toThrow();
  });
  it('sells Rose event materials at their exact prices and rejects unknown or unaffordable products', () => {
    let game = rich();
    const prices = { 'rosethorn-common': 2500, 'rosethorn-uncommon': 7500, 'rosethorn-rare': 25000, 'rosethorn-epic': 75000 } as const;
    for (const [id, price] of Object.entries(prices)) {
      const before = game.account.fractalis;
      game = op(game, { kind: 'purchaseMaterial', element: id, quantity: 1 }).game;
      expect(game.account.materials[id]).toBe(1);
      expect(game.account.fractalis).toBe(before - price);
    }
    expect(() => op(game, { kind: 'purchaseMaterial', element: 'rosethorn-omnic', quantity: 10 })).toThrow('Prismatica');
    expect(() => op(game, { kind: 'purchaseMaterial', element: 'infernic-rare', quantity: 1 })).toThrow('Unknown');
  });
  it('commits a 10-pull atomically with ten validated receipts and sequential pity', () => {
    const game = rich();
    game.account.bannerPity = { standard: { highestStar: 75, unownedHighestStar: 0 } };
    const result = op(game, { kind: 'summonTen', bannerId: 'standard' });
    expect(result.response.summons).toHaveLength(10);
    expect(result.game.account.lycalis).toBe(900);
    expect(result.game.profile.totalDraws).toBe(10);
    expect(result.response.summons!.filter(draw => draw.guarantee !== 'none')).toHaveLength(1);
    expect(validateGameResponse(result.response)).toEqual(result.response);
    expect(() => validateGameResponse({ ...result.response, summons: result.response.summons!.slice(1) })).toThrow('incomplete');
    const poor = rich();
    poor.account.lycalis = 99;
    const before = structuredClone(poor);
    expect(() => op(poor, { kind: 'summonTen', bannerId: 'standard' })).toThrow('100 Null-Prismatica');
    expect(poor).toEqual(before);
  });
  it('owns cosmetics permanently and enforces immutable username, actual statistics and icon ownership', () => {
    let game = rich();
    game = op(game, { kind: 'purchaseFrame', frame: 'thin-outline' }).game;
    expect(game.account.lycalis).toBe(990);
    expect(() => op(game, { kind: 'purchaseFrame', frame: 'thin-outline' })).toThrow('already');
    expect(() => op(game, { kind: 'updateProfile', displayName: 'tester', bio: '', icon: 'tide', frame: 'default' })).toThrow('owned');
    game = op(game, { kind: 'updateProfile', displayName: 'New Name', bio: 'Hello', icon: 'ember', frame: 'thin-outline' }).game;
    expect(game.profile.username).toBe('tester');
    expect(game.profile.ownedFrames).toContain('thin-outline');
    expect(op(game, { kind: 'read' }).response.profile.statistics.ownedBearers).toBe(1);
    expect(() => op(game, { kind: 'updateProfile', displayName: 'a'.repeat(17), bio: '', icon: 'neutral', frame: 'default' })).toThrow('Invalid');
    expect(() => op(game, { kind: 'updateProfile', displayName: 'a', bio: 'a'.repeat(121), icon: 'neutral', frame: 'default' })).toThrow('Invalid');
    game = op(game, { kind: 'summon', bannerId: 'standard' }).game;
    expect(game.profile.totalDraws).toBe(1);
  });
  it('delegates capture sales to existing protections and transactions', () => {
    const game = rich();
    const copy = createCreatureCopy('infusion:treasury:0');
    game.account.capturedCharacters = [copy];
    const protectedGame = op(game, { kind: 'setCharacterLock', id: copy.instanceId, locked: true }).game;
    expect(() => op(protectedGame, { kind: 'sellCurrencyCreature', id: copy.instanceId })).toThrow('Locked');
    expect(op(game, { kind: 'sellCurrencyCreature', id: copy.instanceId }).game.account.capturedCharacters).toEqual([]);
  });
  it('rejects stale Max Level previews rather than spending a changed amount', () => {
    const game = rich();
    game.account.materials['infernic-common'] = 1000;
    const expected = maxLevelPlan(game.account, 'ember');
    const changed = structuredClone(game);
    changed.account.fractalis = 0;
    expect(() => op(changed, { kind: 'levelMax', id: 'ember', expected })).toThrow('changed');
    const leveled = op(game, { kind: 'levelMax', id: 'ember', expected }).game;
    expect(leveled.account.characters.ember!.level).toBe(expected.targetLevel);
    expect(leveled.account.fractalis).toBe(game.account.fractalis - expected.cost.fractalis);
  });
  it('permits authenticated social intents without starter ownership and rejects directory-like input', () => {
    const fresh = freshGame('tester');
    expect(op(fresh, { kind: 'friendRequest', username: 'friend_one' }).game.account).toEqual(fresh.account);
    expect(() => op(fresh, { kind: 'friendRequest', username: '%' })).toThrow('username');
    expect(() => op(fresh, { kind: 'removeFriend', userId: 'untrusted' })).toThrow('user ID');
  });
  it('preserves frozen kit/team on Retry and replaces the receipt namespace', () => {
    let game = op(started(), { kind: 'enter', activity: { kind: 'training' } }).game;
    const original = structuredClone(game.run!);
    for (let round = 0; round < 100 && game.run!.session.state.phase === 'player'; round++) {
      game = op(game, { kind: 'endTurn', runId: game.run!.session.runId }).game;
    }
    expect(game.run!.session.state.phase).toBe('defeat');
    const retried = op(game, { kind: 'retry', runId: game.run!.session.runId }).game;
    expect(retried.run!.session.runId).not.toBe(original.session.runId);
    expect(retried.run!.session.state.phase).toBe('player');
    expect(retried.run!.session.teamProgress).toEqual(original.session.teamProgress);
    expect(retried.run!.equipment).toEqual(original.equipment);
    expect(retried.account.fractalis).toBe(game.account.fractalis);
  });
});
