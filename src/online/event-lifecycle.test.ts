import { describe, expect, it, vi } from 'vitest';
import { resetKeys, roseEventEndsAt, roseEventActive, eventWindowActive } from '../content/event-schedule';
import { eventDevourers, eventDevourerPrices } from '../content/event-devourers';
import { freshGame, resolveOperation, validateRequest, type DurableGame } from '../../supabase/functions/game-operation/engine';
import type { GameOperation } from './server-game';
import { validateGameResponse } from './server-game';
import { storyRules } from '../content/story';
import { summonHub } from '../presentation/roster';
import { onlineStores } from '../presentation/online-store-profile';
import { roseEvent } from '../presentation/rose-event';
import { createCreatureCopy } from '../game/character-instances';
import { purchaseEventDevourer, saveAccount, ACCOUNT_KEY, emptyAccount } from '../game/account';
import { SAVE_KEY, type ProfileStorage } from '../game/profile';

const before = roseEventEndsAt - 1;
const after = roseEventEndsAt;
function run(game: DurableGame, operation: GameOperation, now = before) {
  return resolveOperation(game, operation, { seed: () => 1729, random: () => .9,
    uuid: () => crypto.randomUUID(), now: () => now });
}
function fixture() {
  const game = run(freshGame('tester'), { kind: 'bootstrap', starterId: 'ember' }).game;
  game.account.characters.ember = { level: 105, evolution: 6 };
  game.account.fractalis = 20_000_000;
  game.account.lycalis = 100;
  game.account.storyCompleted = storyRules.stages;
  game.account.infusionStages = { roses: 35 };
  game.account.bannerPity = { roses: { highestStar: 37, unownedHighestStar: 0 } };
  return game;
}

describe('shared New York reset clock', () => {
  it.each([
    ['2026-11-02T00:59:59Z', '2026-10-31', '2026-10-25'],
    ['2026-11-02T01:00:00Z', '2026-11-01', '2026-11-01'],
    ['2026-07-06T00:00:00Z', '2026-07-05', '2026-07-05'],
    ['2026-03-09T00:00:00Z', '2026-03-08', '2026-03-08'],
    ['2027-01-01T00:59:59Z', '2026-12-30', '2026-12-27'],
    ['2027-01-01T01:00:00Z', '2026-12-31', '2026-12-27'],
    ['2026-12-01T01:00:00Z', '2026-11-30', '2026-11-29'],
  ])('keys %s by the 8 PM local day and Sunday boundary', (iso, daily, weekly) => {
    expect(resetKeys(Date.parse(iso))).toEqual({ daily, weekly });
  });
  it('rejects invalid time and closes at the exact confirmed instant', () => {
    expect(() => resetKeys(NaN)).toThrow('Invalid');
    expect(() => roseEventActive(Infinity)).toThrow('Invalid');
    expect(roseEventActive(before)).toBe(true);
    expect(roseEventActive(after)).toBe(false);
  });
  it('only reopens explicitly scheduled windows, with inclusive starts and exclusive ends', () => {
    const opensAt = Date.parse('2027-02-01T01:00:00Z');
    const closesAt = Date.parse('2027-03-01T01:00:00Z');
    const windows = [{ opensAt: null, closesAt: after }, { opensAt, closesAt }];
    expect(eventWindowActive(after, windows)).toBe(false);
    expect(eventWindowActive(opensAt - 1, windows)).toBe(false);
    expect(eventWindowActive(opensAt, windows)).toBe(true);
    expect(eventWindowActive(closesAt, windows)).toBe(false);
    expect(() => eventWindowActive(after, [{ opensAt: after, closesAt: after }])).toThrow('schedule');
  });
});

describe('authoritative special-event lifecycle', () => {
  it.each(['summon', 'summonTen'] as const)('closes %s atomically at the boundary, retaining pity and inventory', kind => {
    const game = fixture();
    const previous = structuredClone(game);
    expect(run(game, { kind, bannerId: 'roses' }, before).game.account.lycalis).toBeLessThan(100);
    expect(() => run(game, { kind, bannerId: 'roses' }, after)).toThrow('ended');
    expect(game).toEqual(previous);
    expect(run(game, { kind: 'summon', bannerId: 'standard' }, after).game.account.lycalis).toBe(90);
  });
  it('blocks new entries while preserving archived progress and live non-event modes', () => {
    const game = fixture();
    expect(() => run(game, { kind: 'enter', activity: { kind: 'infusion', mode: 'roses', stage: 1 } }, after)).toThrow('ended');
    const read = run(game, { kind: 'read' }, after);
    expect(read.game).toEqual(game);
    expect(validateGameResponse(read.response).serverTime).toBe(after);
    expect(run(game, { kind: 'enter', activity: { kind: 'training' } }, after).game.run).not.toBeNull();
  });
  it('allows the encounter underway to finish after closure but rejects Continue and Retry', () => {
    const entered = run(fixture(), { kind: 'enter', activity: { kind: 'infusion', mode: 'roses', stage: 1 } }).game;
    const session = entered.run!.session;
    session.state.enemies.forEach(enemy => { enemy.hp = 1; enemy.stats.defense = 0; });
    session.state.allies[0].shatter = 100;
    const cleared = run(entered, { kind: 'act', runId: session.runId,
      actorId: 'ember', action: 'skill2', targetId: session.state.enemies[0].id }, after);
    expect(cleared.game.run!.session.state.phase).toBe('cleared');
    expect(cleared.game.account.fractalis).toBeGreaterThan(entered.account.fractalis);
    for (const kind of ['continue', 'retry'] as const) {
      expect(() => run(cleared.game, { kind, runId: session.runId }, after)).toThrow('ended');
    }
    const quit = run(cleared.game, { kind: 'quit', runId: session.runId }, after).game;
    expect(quit.run).toBeNull();
    expect(quit.account).toEqual(cleared.game.account);
  });
  it('keeps event materials permanently purchasable before and after closure', () => {
    for (const now of [before, after]) {
      expect(run(fixture(), { kind: 'purchaseMaterial', element: 'rosethorn-common', quantity: 10 }, now)
        .game.account.materials['rosethorn-common']).toBe(10);
    }
  });
});

describe('post-event Elemental-Devourer shop', () => {
  it('uses the exact approved prices and ordinary authored copies for all six forms', () => {
    expect(eventDevourerPrices).toEqual([10_000, 30_000, 100_000, 350_000, 1_500_000, 5_000_000]);
    for (const product of eventDevourers) {
      const game = fixture();
      const operation = { kind: 'purchaseEventDevourer', id: product.id } as const;
      expect(() => run(game, operation, before)).toThrow('after their event');
      const result = run(game, operation, after).game;
      expect(result.account.fractalis).toBe(game.account.fractalis - product.price);
      const copy = result.account.capturedCharacters![0];
      const { instanceId: _expected, ...expected } = createCreatureCopy(product.id);
      const { instanceId: _actual, ...actual } = copy;
      expect(actual).toEqual(expected);
      expect(copy.locked).toBe(false);
      expect(result.account.squad).toEqual(game.account.squad);
      const repeated = run(result, operation, after).game;
      expect(new Set(repeated.account.capturedCharacters!.map(entry => entry.instanceId)).size).toBe(2);
      expect(repeated.account.bannerPity).toEqual(game.account.bannerPity);
    }
  });
  it('rejects unknown IDs, insufficient funds and client-supplied clocks/prices', () => {
    const game = fixture();
    game.account.fractalis = 0;
    expect(() => run(game, { kind: 'purchaseEventDevourer', id: eventDevourers[0].id }, after)).toThrow('Not enough');
    expect(() => run(game, { kind: 'purchaseEventDevourer', id: 'infusion:treasury:0' }, after)).toThrow('Unknown');
    expect(() => validateRequest({ requestId: crypto.randomUUID(), expectedRevision: 0,
      operation: { kind: 'purchaseEventDevourer', id: eventDevourers[0].id, now: after, price: 0 } })).toThrow();
    expect(game.account.capturedCharacters).toBeUndefined();
  });
  it('saves once and preserves raw storage when saving is denied', () => {
    const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
    const storage: ProfileStorage = { getItem: key => values.get(key) ?? null,
      setItem: vi.fn((key, value) => { values.set(key, value); }), removeItem: key => { values.delete(key); } };
    const account = emptyAccount();
    account.characters.ember = { level: 0, evolution: 1 };
    account.fractalis = 100_000;
    saveAccount(storage, account);
    vi.mocked(storage.setItem).mockClear();
    purchaseEventDevourer(storage, eventDevourers[0].id, after);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    const raw = values.get(ACCOUNT_KEY);
    vi.mocked(storage.setItem).mockImplementation(() => { throw new Error('denied'); });
    expect(() => purchaseEventDevourer(storage, eventDevourers[0].id, after)).toThrow('denied');
    expect(values.get(ACCOUNT_KEY)).toBe(raw);
  });
});

describe('archive and event availability presentation', () => {
  it('keeps archive browsing read-only with full rules, artwork, roster, rates and retained pity', () => {
    const game = fixture();
    const previous = structuredClone(game.account);
    const html = summonHub(game.account, 'roses', { online: false, now: after }, true);
    for (const text of ['Special Banner Archive', 'Rosetta', 'Thornia', 'Crinso', 'summon-roses', '37 / 80',
      'Rates &amp; Information', 'Event rules and progression', 'Evolution Value']) expect(html).toContain(text);
    expect(html).not.toContain('id="summon-character"');
    expect(html).not.toContain('id="summon-ten"');
    expect(game.account).toEqual(previous);
  });
  it('disables timed draws/entries offline and closes them online after the boundary', () => {
    const game = fixture();
    for (const access of [{ online: false, now: before }, { online: true, now: after }]) {
      expect(summonHub(game.account, 'roses', access)).toContain('class="primary-button" disabled aria-describedby="banner-cost-note"');
      expect(roseEvent(game.account, true, access)).not.toContain('data-infusion="roses"');
    }
    expect(roseEvent(game.account, true, { online: true, now: before })).toContain('data-infusion="roses"');
  });
  it('shows all six shop forms but only enables purchases online after closure', () => {
    const account = fixture().account;
    for (const access of [{ online: false, now: after }, { online: true, now: before }]) {
      const html = onlineStores(account, null, 'event-devourers', undefined, undefined, access);
      expect(html.match(/data-buy-event-devourer="[^"]+" disabled/g)).toHaveLength(6);
    }
    const html = onlineStores(account, null, 'event-devourers', undefined, undefined, { online: true, now: after });
    expect(html.match(/data-buy-event-devourer=/g)).toHaveLength(6);
    expect(html).not.toMatch(/data-buy-event-devourer="[^"]+" disabled/);
  });
});
