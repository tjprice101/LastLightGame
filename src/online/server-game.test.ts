import { describe, expect, it, vi } from 'vitest';
import { freshGame, profileActivityFor, profileIconUnlocked as engineProfileIconUnlocked, resolveOperation, validateChatRequest, validateRequest, type DurableGame } from '../../supabase/functions/game-operation/engine';
import { isProfileIcon, profileIconUnlocked, validateChatResponse, validateGameResponse, type GameOperation } from './server-game';
import { profilePictures } from '../content/profile-pictures';
import { createCreatureCopy } from '../game/character-instances';
import { actAndAdvanceTurn } from '../game/battle';
import { maxLevelPlan } from '../game/account';
import { validateSaveFile } from '../game/save-file';
import { getSummonBanner } from '../content/summon-banners';
import { enemyCombatStats } from '../content/stat-growth';
import { enemyAbilityMultiplier, enemySkills } from '../content/enemy-skills';

let sequence = 0;
const entropy = { seed: () => 7321, random: () => .9,
  uuid: () => `00000000-0000-4000-8000-${String(++sequence).padStart(12, '0')}` };
const op = (game: DurableGame, operation: GameOperation) => resolveOperation(game, operation, entropy);
function started() { return op(freshGame('tester'), { kind: 'bootstrap', starterId: 'ember' }).game; }
function rich() { const game = started(); game.account.fractalis = 1000000; game.account.lycalis = 1000; return game; }

describe('server authoritative game engine', () => {
  it.each(['player', 'cleared', 'defeat'] as const)('quits a %s run without changing saved rewards or progress', phase => {
    const entered = op(started(), { kind: 'enter', activity: { kind: 'training' } }).game;
    entered.run!.session.state.phase = phase;
    const account = structuredClone(entered.account);
    const runId = entered.run!.session.runId;
    const exited = op(entered, { kind: 'quit', runId });
    expect(exited.game.run).toBeNull();
    expect(exited.response.session).toBeNull();
    expect(exited.game.account).toEqual(account);
    expect(validateGameResponse(exited.response)).toEqual(exited.response);
    expect(entered.run!.session.runId).toBe(runId);
  });
  it.each([1, 25, 50, 75, 100])('atomically guarantees current component quantities on authoritative Machine stage %s kills', stage => {
    const game = started();
    game.account.storyCompleted = 25;
    game.account.characters.ember = { level: 105, evolution: 6 };
    game.account.infusionStages = { machines: 100 };
    const entered = op(game, { kind: 'enter', activity: { kind: 'infusion', mode: 'machines', stage } }).game;
    const state = entered.run!.session.state;
    state.allies[0].shatter = 100;
    state.enemies.forEach(enemy => { enemy.hp = 1; enemy.stats.defense = 0; });
    const result = op(entered, { kind: 'act', runId: entered.run!.session.runId,
      actorId: 'ember', action: 'skill2', targetId: state.enemies[0].id });
    const quantity = Math.round(3 + 122 * (stage - 1) / 99) * (stage === 100 ? 5 : 1);
    const rewards = result.response.result!.events.filter(event => event.kind === 'reward');
    expect(rewards).toHaveLength(state.enemies.length);
    for (const reward of rewards) expect(reward.mechanicalComponents).toBe(quantity);
    expect(result.game.account.mechanicalComponents).toBe(quantity * state.enemies.length);
    expect(validateGameResponse(result.response)).toEqual(result.response);
    expect(entered.account.mechanicalComponents ?? 0).toBe(0);
  });
  it('uses shared hostile stats and skill power through authoritative activity entries', () => {
    const game = started();
    game.account.characters.ember = { level: 105, evolution: 6 };
    game.account.storyCompleted = 150;
    game.account.dungeonStages = { infernic: 35 };
    game.account.infusionStages = { heavens: 35 };
    for (const activity of [
      { kind: 'training' },
      { kind: 'story', stage: 149 },
      { kind: 'story', stage: 150 },
      { kind: 'dungeon', element: 'infernic', stage: 8 },
      { kind: 'infusion', mode: 'heavens', stage: 5 },
    ] as const) {
      const result = op(game, { kind: 'enter', activity });
      for (const enemy of result.game.run!.session.state.enemies) {
        expect(enemy.stats).toEqual(enemyCombatStats(enemy.level!, enemy.boss ?? false));
        const skills = enemySkills(enemy.level!, enemy.boss ?? false, enemy.enemySkills![0].name, enemyAbilityMultiplier(enemy.level!));
        expect(enemy.enemySkills).toEqual(skills);
      }
      expect(validateGameResponse(result.response)).toEqual(result.response);
    }
  });
  it('preserves older active encounter snapshots on read and refreshes stats only on new entry', () => {
    const entered = op(started(), { kind: 'enter', activity: { kind: 'story', stage: 1 } }).game;
    const enemy = entered.run!.session.state.enemies[0];
    enemy.stats.health += 17;
    enemy.hp += 17;
    enemy.stats.damage += 9;
    enemy.enemySkills![0].multiplier += .3;
    const original = structuredClone(entered);
    const read = op(entered, { kind: 'read' });
    expect(read.game).toEqual(original);
    expect(read.response.session!.state.enemies[0]).toEqual(enemy);
    const exited = op(read.game, { kind: 'quit', runId: entered.run!.session.runId }).game;
    const fresh = op(exited, { kind: 'enter', activity: { kind: 'story', stage: 1 } });
    expect(fresh.game.run!.session.state.enemies[0].stats).toEqual(enemyCombatStats(1, false));
    expect(entered).toEqual(original);
  });
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
  it('validates optional public profile references and bounded recent activity while retaining legacy profiles', () => {
    const response = op(started(), { kind: 'read' }).response;
    expect(validateGameResponse(response)).toEqual(response);
    const enriched = {
      ...response,
      profile: {
        ...response.profile, friendCode: 'LL-A1B2-C3D4', playerId: 'A1B2-C3D4',
        daysPlayed: 3, playTimeSeconds: 240,
        recentActivity: [{
          id: '00000000-0000-4000-8000-000000000001', message: 'Story stage cleared',
          detail: 'Story · Stage 1', at: '2026-10-11T12:00:00.000Z',
        }],
      },
    };
    expect(validateGameResponse(enriched)).toEqual(enriched);
    for (const profile of [
      { ...enriched.profile, friendCode: 'not-a-code' },
      { ...enriched.profile, playerId: 'FFFF-EEEE' },
      { ...enriched.profile, daysPlayed: -1 },
      { ...enriched.profile, playTimeSeconds: Number.MAX_SAFE_INTEGER + 1 },
      { ...enriched.profile, recentActivity: Array(9).fill(enriched.profile.recentActivity[0]) },
      { ...enriched.profile, recentActivity: [{ ...enriched.profile.recentActivity[0], detail: 'bad\ntext' }] },
    ]) expect(() => validateGameResponse({ ...response, profile })).toThrow('incomplete');
    const requestId = entropy.uuid();
    expect(validateRequest({ requestId, expectedRevision: 0, operation: { kind: 'friendRequest', username: 'player_1' } }).operation.kind)
      .toBe('friendRequest');
    expect(validateRequest({ requestId, expectedRevision: 0, operation: { kind: 'friendRequest', friendCode: 'll-a1b2-c3d4' } }).operation.kind)
      .toBe('friendRequest');
    for (const operation of [
      { kind: 'friendRequest' },
      { kind: 'friendRequest', username: 'player_1', friendCode: 'LL-A1B2-C3D4' },
      { kind: 'friendRequest', friendCode: 'bad-code' },
    ]) expect(() => validateRequest({ requestId, expectedRevision: 0, operation })).toThrow();
  });
  it('validates real optional presence only on accepted friends, never on requests', () => {
    const response = op(started(), { kind: 'read' }).response;
    const peer = {
      userId: entropy.uuid(), username: 'friend_1', displayName: 'Friend',
      icon: 'neutral', frame: 'default',
    };
    const validate = (entry: unknown, key = 'friends') => validateGameResponse({
      ...response, social: { friends: [], incoming: [], outgoing: [], [key]: [entry] },
    });
    for (const presence of [{}, { online: false, lastSeenAt: null },
      { online: true, lastSeenAt: '2026-10-11T12:00:00.123456+00:00' },
      { online: false, lastSeenAt: '2026-10-10T12:00:00Z' }]) {
      expect(() => validate({ ...peer, ...presence })).not.toThrow();
    }
    for (const presence of [{ online: 'true' }, { online: 0 }, { lastSeenAt: 123 },
      { lastSeenAt: 'yesterday' }, { lastSeenAt: '2026-10-11' },
      { online: true, lastSeenAt: null }, { online: true }]) {
      expect(() => validate({ ...peer, ...presence })).toThrow('incomplete');
    }
    for (const key of ['incoming', 'outgoing']) {
      expect(() => validate(peer, key)).not.toThrow();
      for (const presence of [{ online: false }, { lastSeenAt: null },
        { online: undefined }, { lastSeenAt: '2026-10-11T12:00:00Z' }]) {
        expect(() => validate({ ...peer, ...presence }, key)).toThrow('incomplete');
      }
    }
    for (const kind of ['read', 'checkpoint']) {
      expect(() => validateRequest({ requestId: entropy.uuid(), expectedRevision: 0,
        operation: { kind, lastSeenAt: '2026-10-11T12:00:00Z' } })).toThrow();
      expect(() => validateRequest({ requestId: entropy.uuid(), expectedRevision: 0,
        operation: { kind, online: true } })).toThrow();
    }
  });
  it('marks only a newly crossed 25-stage Story region as a restored Beacon', () => {
    const makeResolved = (completed: number, stage: number) => {
      const game = started();
      game.account.storyCompleted = completed;
      game.run = {
        activity: { kind: 'story', stage }, roster: ['ember'], equipment: {}, captures: [],
        upgrades: {}, session: {} as never,
      };
      const response = {
        ...op(game, { kind: 'read' }).response,
        result: { state: { phase: 'cleared' } } as never,
      };
      return { game, response } as ReturnType<typeof resolveOperation>;
    };
    const uuid = () => entropy.uuid();
    const clear25 = profileActivityFor({ kind: 'endTurn', runId: entropy.uuid() }, 24, makeResolved(25, 25), uuid);
    expect(clear25?.detail).toBe('Beacon restored · Story · Stage 25');
    const laterStage = profileActivityFor({ kind: 'endTurn', runId: entropy.uuid() }, 25, makeResolved(26, 26), uuid);
    expect(laterStage?.detail).toBe('Story · Stage 26');
    const replay = profileActivityFor({ kind: 'endTurn', runId: entropy.uuid() }, 25, makeResolved(25, 1), uuid);
    expect(replay?.detail).toBe('Story · Stage 1');
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
  it('accepts only a payload-free checkpoint and preserves frozen server state without entropy', () => {
    const request = { requestId: entropy.uuid(), expectedRevision: 1, operation: { kind: 'checkpoint' } };
    expect(validateRequest(request)).toEqual(request);
    expect(() => validateRequest({ ...request, operation: { kind: 'checkpoint', wallet: {} } })).toThrow('Unexpected');
    const game = op(started(), { kind: 'enter', activity: { kind: 'training' } }).game;
    const noEntropy = { seed: vi.fn(), uuid: vi.fn(), random: vi.fn() };
    const result = resolveOperation(game, { kind: 'checkpoint' }, noEntropy);
    expect(result.game).toEqual(game);
    expect(noEntropy.seed).not.toHaveBeenCalled();
    expect(noEntropy.uuid).not.toHaveBeenCalled();
    expect(noEntropy.random).not.toHaveBeenCalled();
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

describe('profile pictures and chat contract', () => {
  it('validates all 32 profile pictures authoritatively without automatic writes', () => {
    expect(profilePictures).toHaveLength(32);
    expect(new Set(profilePictures.map(p => p.id)).size).toBe(32);
    const game = started();
    const loaded = structuredClone(game);
    expect(loaded).toEqual(game);
    for (const picture of profilePictures) {
      expect(isProfileIcon(picture.id)).toBe(true);
      const owned = picture.characterId === 'ember';
      expect(profileIconUnlocked(game.account, picture.id)).toBe(owned && picture.form === 'base');
      expect(engineProfileIconUnlocked(game.account, picture.id)).toBe(owned && picture.form === 'base');
      const request = { requestId: crypto.randomUUID(), expectedRevision: 1,
        operation: { kind: 'updateProfile', displayName: 'tester', bio: '', icon: picture.id, frame: 'default' } };
      expect(validateRequest(request).operation).toEqual(request.operation);
      const attempt = () => op(game, request.operation as GameOperation);
      if (owned && picture.form === 'base') expect(attempt().game.profile.icon).toBe(picture.id);
      else expect(attempt).toThrow('unlocked profile picture');
    }
    const omnic = structuredClone(game);
    omnic.account.characters.ember = { level: 0, evolution: 6, weaponRank: 0 };
    expect(op(omnic, { kind: 'updateProfile', displayName: 'tester', bio: '', icon: 'profile:ember:omnic', frame: 'default' })
      .game.profile.icon).toBe('profile:ember:omnic');
    expect(game.profile.icon).toBe('neutral');
  });

  it('keeps legacy neutral and starter icons and rejects unknown picture IDs', () => {
    const game = started();
    expect(isProfileIcon('neutral') && isProfileIcon('ember') && isProfileIcon('tide')).toBe(true);
    expect(profileIconUnlocked(game.account, 'neutral')).toBe(true);
    expect(profileIconUnlocked(game.account, 'ember')).toBe(true);
    expect(profileIconUnlocked(game.account, 'tide')).toBe(false);
    for (const icon of ['profile:ember:epic', 'profile:unknown:base', 'profile:ember', '', 7]) {
      expect(isProfileIcon(icon)).toBe(false);
      expect(() => validateRequest({ requestId: crypto.randomUUID(), expectedRevision: 1,
        operation: { kind: 'updateProfile', displayName: 'tester', bio: '', icon, frame: 'default' } })).toThrow('Invalid');
    }
  });

  it('validates chat requests strictly', () => {
    const id = () => crypto.randomUUID();
    const conversationId = id();
    const ok = [
      { kind: 'read' }, { kind: 'read', conversationId }, { kind: 'read', conversationId, before: id() },
      { kind: 'direct', userId: id() }, { kind: 'createGroup', name: 'Squad', userIds: [id(), id()] },
      { kind: 'send', conversationId, text: ` ${'e'.repeat(500)} ` }, { kind: 'send', conversationId, text: 'a\r\nb' },
      { kind: 'invite', conversationId, userId: id() }, { kind: 'respondInvite', conversationId, accept: false },
      { kind: 'removeMember', conversationId, userId: id() }, { kind: 'leave', conversationId },
      { kind: 'preferences', conversationId, pinned: true }, { kind: 'preferences', conversationId, muted: false },
      { kind: 'block', userId: id() }, { kind: 'unblock', userId: id() },
    ];
    for (const chat of ok) expect(validateChatRequest({ requestId: id(), chat }).chat.kind).toBe(chat.kind);
    const bad = [
      { kind: 'read', before: id() }, { kind: 'read', conversationId: 'x' }, { kind: 'send', conversationId, text: '   ' },
      { kind: 'send', conversationId, text: 'x'.repeat(501) }, { kind: 'send', conversationId, text: 'bell\u0007' },
      { kind: 'send', conversationId, text: 'hi', extra: 1 }, { kind: 'createGroup', name: '', userIds: [] },
      { kind: 'createGroup', name: 'x'.repeat(49), userIds: [] },
      { kind: 'createGroup', name: 'ok', userIds: Array.from({ length: 10 }, id) },
      { kind: 'createGroup', name: 'ok', userIds: [conversationId, conversationId] },
      { kind: 'preferences', conversationId }, { kind: 'respondInvite', conversationId, accept: 'yes' },
      { kind: 'invite', conversationId, userId: 'nope' }, { kind: 'sendCode', conversationId }, { kind: 'block' },
    ];
    for (const chat of bad) expect(() => validateChatRequest({ requestId: id(), chat })).toThrow();
    expect(() => validateChatRequest({ requestId: 'x', chat: { kind: 'read' } })).toThrow();
    expect(() => validateChatRequest({ requestId: id(), chat: { kind: 'read' }, expectedRevision: 1 })).toThrow();
  });

  it('validates chat responses with raw message text', () => {
    const self = crypto.randomUUID(), peer = crypto.randomUUID(), conversationId = crypto.randomUUID();
    const player = (userId: string, username: string) => ({ userId, username, displayName: username, icon: 'profile:ember:base', frame: 'default' });
    const message = { id: crypto.randomUUID(), senderId: peer, senderName: '<b>p</b>', text: '<script>x</script>', createdAt: '2026-10-12T03:00:00Z' };
    const response = { selfUserId: self, conversationId, hasMore: false, unreadTotal: 1, invitations: [], blocked: [],
      messages: [message], conversations: [{ id: conversationId, kind: 'direct', name: 'p', ownerId: null,
        members: [player(self, 'me_one'), player(peer, 'peer_two')], invited: [], unread: 1, pinned: false, muted: false,
        lastMessage: message, createdAt: '2026-10-12T03:00:00Z' }] };
    expect(validateChatResponse(response).messages[0].text).toBe('<script>x</script>');
    expect(() => validateChatResponse({ ...response, messages: [{ ...message, text: 'x'.repeat(501) }] })).toThrow();
    expect(() => validateChatResponse({ ...response, unreadTotal: -1 })).toThrow();
  });
});
