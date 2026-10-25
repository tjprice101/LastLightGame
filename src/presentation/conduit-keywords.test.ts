// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { conduits, conduitEffect } from '../content/conduits';
import { masterConduits } from '../content/master-conduits';
import { conduitDetails, conduitInventory, conduitStore } from './conduit-store';
import { conduitRuleText } from './conduit-loadout';
import { referencedEffect } from './effect-copy';
import { masterReference } from './master-conduits';
import { emptyAccount } from '../game/account';
import { inventoryView } from './inventory';

const unbracketedKeyword = /\b(?:HP|Global|All-enemy|Skills?|Skill Power|Skill Duration|Skill Efficiency|Health|Defense|Direct Attack|Critical Rate|Critical Damage Multiplier|Elemental Gauge(?: Capacity| Gain)?|Shields?|Shielded|Attack Actions?|Direct Damage|Bonus Strikes?|Enemy Turns?|Player Turns?|Burn|Weaken|Recovery|Empowered Thorn Traps?|Thorn Traps?|Seeds?|Gusts?|Cyclone|Foundation|Combo|Wounds|Cover|Seals?|Shuriken|Survey|Quarry|Instruction|Strike|Shelter|Resolve|Opening|Closing|Tune|Crescendo|Accord)\b/i;
function expectKeywords(html: string): void {
  const host = document.createElement('div');
  host.innerHTML = html;
  expect(host.textContent).not.toMatch(/\bHP\b|\[\[/);
  expect(host.textContent?.replace(/\[[^\]]+\]/g, '')).not.toMatch(unbracketedKeyword);
  for (const match of (host.textContent ?? '').matchAll(/\[([^[\]]+)\]/g)) {
    expect(referencedEffect(match[0], false)).toBe(match[0]);
  }
}

describe('Conduit keyword presentation', () => {
  it.each(conduits)('$id brackets every ordinary effect at every upgrade, including skipped HTML value containers', conduit => {
    for (let level = 0; level <= 5; level++) {
      expectKeywords(conduitRuleText(conduit, level));
      const host = document.createElement('div');
      host.innerHTML = conduitDetails(conduit.id, level);
      for (const value of Array.from(host.querySelectorAll('dd'))) expectKeywords(value.innerHTML);
    }
  });

  it.each(masterConduits)('$id brackets fixed native Master rules', master => {
    const host = document.createElement('div');
    host.innerHTML = masterReference(master.id);
    expectKeywords(host.querySelector('p')!.innerHTML);
  });

  it('uses the same bracketed rules in Store, Inventory and the equipment formatter', () => {
    const account = emptyAccount();
    account.conduits = { 'vigil-core': 1, 'siege-cantilever': 1 };
    const expected = 'Your [Global] damaging [Skills] gain +150% [Skill Power].';
    expect(conduitRuleText(conduits.find(entry => entry.id === 'siege-cantilever')!)).toBe(expected);
    expect(inventoryView(account, 'conduits')).toContain(expected);
    expect(conduitInventory(account)).toContain(expected);
    expect(conduitStore(account)).toContain('+100% [Health].');
    for (const conduit of conduits) {
      const rendered = referencedEffect(conduitEffect(conduit, 5));
      expect(referencedEffect(rendered)).toBe(rendered);
    }
  });
});
