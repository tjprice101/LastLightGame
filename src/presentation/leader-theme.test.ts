import { describe, expect, it } from 'vitest';
import { elements } from '../content/activities';
import { elementAccents } from '../content/dungeon-art';
import { starters, getStarter } from '../content/starters';
import { emptyAccount } from '../game/account';
import { createCreatureCopy } from '../game/character-instances';
import { createBattle } from '../game/battle';
import { applyLeaderTheme, leaderElement } from './leader-theme';

describe('squad leader UI theme', () => {
  it.each(starters)('uses $name element without changing the account', (starter) => {
    const account = emptyAccount();
    account.characters[starter.id] = { level: 0, evolution: 1 };
    account.squad = [starter.id];
    const before = structuredClone(account);
    expect(leaderElement(account)).toBe(starter.elementId);
    expect(account).toEqual(before);
  });

  it('follows saved leader order rather than the starter or inspected character', () => {
    const account = emptyAccount();
    account.characters.ember = { level: 0, evolution: 1 };
    account.characters.tide = { level: 0, evolution: 1 };
    account.squad = ['tide', 'ember'];
    expect(leaderElement(account)).toBe('oceanic');
    account.squad.reverse();
    expect(leaderElement(account)).toBe('infernic');
  });

  it('supports captured leaders and keeps a frozen battle leader after menu changes', () => {
    const account = emptyAccount();
    account.characters.ember = { level: 0, evolution: 1 };
    const copy = createCreatureCopy('infusion:abyss:0', 1, 80);
    account.capturedCharacters = [copy];
    account.squad = [copy.instanceId, 'ember'];
    const before = structuredClone(account);
    expect(leaderElement(account)).toBe('chaotic');
    expect(account).toEqual(before);
    const capturedBattle = createBattle(1, account.squad, account.characters, {}, [copy]);
    account.squad = ['ember'];
    expect(leaderElement(account, capturedBattle)).toBe('chaotic');
    const battle = createBattle(1, ['ember']);
    expect(leaderElement(account, battle)).toBe(getStarter('ember').elementId);
    expect(leaderElement(null)).toBeNull();
  });

  it.each(elements)('applies the shared $name palette to the root and clears stale themes', (element) => {
    const properties = new Map<string, string>();
    const root = {
      dataset: {} as DOMStringMap,
      style: { setProperty: (key: string, value: string) => properties.set(key, value) },
    };
    applyLeaderTheme(root, element.id);
    expect(root.dataset.leaderElement).toBe(element.id);
    expect(properties.get('--ui-accent')).toBe(elementAccents[element.id]);
    applyLeaderTheme(root, null);
    expect(root.dataset.leaderElement).toBeUndefined();
    expect(properties.get('--ui-accent')).toBe('#f4f4f5');
  });
});
