// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { sunshadeCharacters } from './moon-sunshade-characters';
import { masterConduits } from './master-conduits';
import { moonSunshadeEvents, newEventWindowActive } from './moon-sunshade-events';
import { archives } from '../presentation/archives';
import { inventoryView } from '../presentation/inventory';
import { onlineStores } from '../presentation/online-store-profile';
import { summonHub } from '../presentation/roster';
import { moonEvent } from '../presentation/rose-event';
import { freshGame, resolveOperation } from '../../supabase/functions/game-operation/engine';
import { characterReleased } from './release-visibility';
import type { GameOperation } from '../online/server-game';

const opensAt = Date.parse('2026-11-07T19:22:12.304Z');
const closesAt = Date.parse('2026-12-01T01:00:00Z');
const entropy = { seed: () => 1729, random: () => .9, uuid: () => crypto.randomUUID(), now: () => opensAt };

function fixture() {
  const game = resolveOperation(freshGame('release_test'), { kind: 'bootstrap', starterId: 'ember' }, entropy).game;
  game.account.fractalis = 10_000_000;
  game.account.lycalis = 100;
  game.account.masterChests = 2;
  return game;
}

describe('Moon launch and unreleased content', () => {
  it('opens now, closes at the previously agreed New York reset, and never schedules Sunshade', () => {
    expect(moonSunshadeEvents.find(event => event.id === 'moon')?.windows).toEqual([{ opensAt, closesAt }]);
    for (const [now, active] of [[opensAt - 1, false], [opensAt, true], [closesAt - 1, true], [closesAt, false]] as const) {
      expect(newEventWindowActive('moon', now)).toBe(active);
      expect(newEventWindowActive('sunshade', now)).toBe(false);
    }
  });

  it('removes all Sunshade identities from catalogs, rates, archives, shops and saved holdings presentation without deleting data', () => {
    const account = fixture().account;
    account.materials['dawnforge-common'] = 123;
    const hiddenMasters = masterConduits.filter(master => !characterReleased(master.character));
    account.masterConduits = Object.fromEntries(hiddenMasters.map(master => [master.id, 1]));
    const original = structuredClone(account);
    const html = [
      ...(['characters', 'conduits', 'creatures'] as const).map(gallery => archives(account, gallery)),
      inventoryView(account, 'materials'), inventoryView(account, 'conduits'),
      ...(['materials', 'event-devourers'] as const).map(tab => onlineStores(account, null, tab)),
      summonHub(account, 'moon', { online: true, now: opensAt }),
      summonHub(account, 'moon', { online: true, now: opensAt }, true),
      summonHub(account, 'sunshade', { online: true, now: opensAt }),
    ].join('');
    expect(html).not.toMatch(/sunshade|dawnforge|solcarapace|borrowed dawn/i);
    for (const character of sunshadeCharacters) expect(html).not.toContain(character.name);
    for (const master of hiddenMasters) expect(html).not.toContain(master.name);
    expect(html).toContain("Glow of the Moon");
    expect(account).toEqual(original);
    expect(sunshadeCharacters).toHaveLength(6);
    expect(hiddenMasters).toHaveLength(18);
  });

  it('rejects unreleased purchases and chest selections atomically at the authority', () => {
    const game = fixture();
    const original = structuredClone(game);
    const master = masterConduits.find(entry => !characterReleased(entry.character))!;
    const operations: GameOperation[] = [
      { kind: 'purchaseMaterial', element: 'dawnforge-common', quantity: 1 },
      { kind: 'openMasterChest', id: master.id },
      { kind: 'openMasterChests', ids: ['master-ember-1', master.id] },
      { kind: 'summon', bannerId: 'sunshade' },
      { kind: 'enter', activity: { kind: 'infusion', mode: 'sunshade', stage: 1 } },
      { kind: 'purchaseEventDevourer', id: 'infusion:sunshade:0' },
    ];
    for (const operation of operations) {
      expect(() => resolveOperation(game, operation, entropy)).toThrow();
      expect(game).toEqual(original);
    }
    const drawn = resolveOperation(game, { kind: 'summon', bannerId: 'moon' }, entropy).game;
    expect(drawn.account.lycalis).toBe(90);
    expect(drawn.account.materials).toEqual({ 'moonwake-rare': 2 });
  });

  it('uses the supplied authoritative clock for enabled entry controls, not the device clock', () => {
    const account = fixture().account;
    account.characters.ember = { level: 105, evolution: 6 };
    account.storyCompleted = 120;
    const clock = vi.spyOn(Date, 'now').mockReturnValue(0);
    try {
      const html = moonEvent(account, { online: true, now: opensAt });
      const entry = new DOMParser().parseFromString(html, 'text/html').querySelector<HTMLButtonElement>('[data-infusion="moon"]');
      expect(entry).not.toBeNull();
      expect(entry?.disabled).toBe(false);
      expect(html).toContain('November 30, 2026 at 8:00 PM');
      for (const access of [{ online: false, now: opensAt }, { online: true, now: closesAt }]) {
        expect(moonEvent(account, access)).not.toContain('data-infusion="moon"');
      }
    } finally {
      clock.mockRestore();
    }
  });
});
