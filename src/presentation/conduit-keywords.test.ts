// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { conduits, conduitEffect } from '../content/conduits';
import { masterConduits } from '../content/master-conduits';
import { radiantMasterEffect } from './master-text';
import { conduitDetails, conduitInventory, conduitStore } from './conduit-store';
import { conduitRuleText } from './conduit-loadout';
import { readableEffect } from './effect-copy';
import { masterReference } from './master-conduits';
import { emptyAccount } from '../game/account';
import { inventoryView } from './inventory';

function expectPlainEffect(text: string): void {
  expect(text).not.toMatch(/[\[\]×]/);
  expect(text).not.toMatch(/[A-Za-z]\/[A-Za-z]/);
  expect(text).not.toMatch(/\bHP\b/i);
}

function effectTexts(html: string): string[] {
  const host = document.createElement('div');
  host.innerHTML = html;
  return Array.from(host.querySelectorAll('.plain-effect-copy'), element => element.textContent ?? '');
}

describe('Conduit effect wording', () => {
  it.each(conduits)('$id uses plain-English effects at every upgrade level', conduit => {
    for (let level = 0; level <= 5; level++) {
      const effect = readableEffect(conduitEffect(conduit, level));
      expectPlainEffect(effect);
      expect(conduitRuleText(conduit, level)).toBe(effect);

      const details = document.createElement('div');
      details.innerHTML = conduitDetails(conduit.id, level);
      expect(Array.from(details.querySelectorAll('.info-effects li'), entry => entry.textContent)).toContain(`Current effect (+${level}): ${effect}`);
    }
  });

  it.each(masterConduits)('$id explains its effect without bracketed terms or stat formulas', master => {
    const effect = radiantMasterEffect(master.id);
    expectPlainEffect(effect);
    const details = document.createElement('div');
    details.innerHTML = masterReference(master.id);
    const displayed = details.querySelector('.info-effects')?.textContent ?? '';
    expectPlainEffect(displayed);
    expect(displayed).toBe(effect);
  });

  it('keeps plain effect copy consistent in Store, Inventory, and Conduit details', () => {
    const account = emptyAccount();
    account.conduits = { 'vigil-core': 1, 'siege-cantilever': 1 };
    const expected = readableEffect(conduitEffect(conduits.find(entry => entry.id === 'vigil-core')!));

    expect(conduitRuleText(conduits.find(entry => entry.id === 'vigil-core')!)).toBe(expected);
    expect(inventoryView(account, 'conduits')).toContain(expected);
    expect(conduitInventory(account)).toContain(expected);
    expect(conduitStore(account)).toContain(expected);

    for (const html of [inventoryView(account, 'conduits'), conduitStore(account)]) {
      for (const text of effectTexts(html)) expectPlainEffect(text);
    }
  });
});
