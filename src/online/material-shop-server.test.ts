import { describe, expect, it } from 'vitest';
import { freshGame, resolveOperation, validateRequest } from '../../supabase/functions/game-operation/engine';
import { exchangeProduct } from '../content/material-exchange';

const entropy = { seed: () => 12345, random: () => .9, uuid: () => crypto.randomUUID() };
function fixture(level: number) {
  const game = resolveOperation(freshGame('shop_player'), { kind: 'bootstrap', starterId: 'ember' }, entropy).game;
  game.account.characters.ember = { level, evolution: 6 };
  game.account.fractalis = 10_000_000;
  return game;
}
describe('authoritative ordinary tier material shop', () => {
  it.each([
    ['infernic', 0, 80], ['oceanic-uncommon', 30, 470], ['botanic-rare', 45, 2750],
    ['atmospheric-epic', 60, 16100], ['chaotic-legendary', 75, 94100], ['tranquilitic-omnic', 90, 550000],
  ] as const)('authorizes %s at owned level%i, not a client price or target level', (id, level, price) => {
    const game = fixture(level);
    const request = validateRequest({ requestId: crypto.randomUUID(), expectedRevision: 0,
      operation: { kind: 'purchaseMaterial', element: id, quantity: 5 } });
    const { game: saved } = resolveOperation(game, request.operation, entropy);
    expect(saved.account.fractalis).toBe(game.account.fractalis - price * 5);
    expect(saved.account.materials[exchangeProduct(id).materialId]).toBe(5);
    expect(game.account.materials[exchangeProduct(id).materialId]).toBeUndefined();
  });
  it('rejects locked tier and inventory overflow without mutating the previous aggregate', () => {
    const game = fixture(89);
    const before = structuredClone(game);
    expect(() => resolveOperation(game, { kind: 'purchaseMaterial', element: 'infernic-omnic', quantity: 1 }, entropy)).toThrow('level 90');
    expect(game).toEqual(before);
    game.account.characters.ember!.level = 90;
    game.account.materials['infernic-omnic'] = Number.MAX_SAFE_INTEGER;
    const full = structuredClone(game);
    expect(() => resolveOperation(game, { kind: 'purchaseMaterial', element: 'infernic-omnic', quantity: 1 }, entropy)).toThrow('capacity');
    expect(game).toEqual(full);
  });
  it('preserves the frozen Training run while making a successful shop purchase', () => {
    const game = resolveOperation(fixture(90), { kind: 'enter', activity: { kind: 'training' } }, entropy).game;
    const frozen = structuredClone(game.run);
    const saved = resolveOperation(game, { kind: 'purchaseMaterial', element: 'infernic-omnic', quantity: 1 }, entropy).game;
    expect(saved.run).toEqual(frozen);
    expect(saved.account.materials['infernic-omnic']).toBe(1);
  });
});
