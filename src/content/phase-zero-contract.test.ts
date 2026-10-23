import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { conduits } from './conduits';
import { masterConduits } from './master-conduits';
import { getStarter } from './starters';
import { elements } from './activities';

interface ApprovedEntry {
  name: string;
  rarity: string;
  element: string;
  ability: string;
}

const catalog = readFileSync(new URL('../../docs/conduit-catalog.txt', import.meta.url), 'utf8');
const entries: ApprovedEntry[] = [...catalog.matchAll(
  /^Name: (.+)\r?\nRarity: (.+)\r?\nElement: (.+)\r?\nAbility \(Default Value\): ([\s\S]*?)(?=\r?\n\r?\n|(?![\s\S]))/gm,
)].map((match) => ({
  name: match[1].trim(),
  rarity: match[2].trim(),
  element: match[3].trim(),
  ability: match[4].trim(),
}));
const metadata = [
  ...conduits.map((entry) => ({
    id: entry.id, name: entry.name, rarity: entry.rarity,
    element: entry.element ? elements.find((element) => element.id === entry.element)?.name : undefined,
    character: undefined,
  })),
  ...masterConduits.map((entry) => ({
    id: entry.id, name: entry.name, rarity: `${entry.rarity} (Master)`,
    element: elements.find((element) => element.id === getStarter(entry.character).elementId)?.name,
    character: getStarter(entry.character).name,
  })),
];

describe('approved Phase 0 catalog contract (not runtime effect verification)', () => {
  it('contains every entry exactly once in rarity/name order', () => {
    expect(entries).toHaveLength(138);
    expect(metadata).toHaveLength(138);
    expect(new Set(entries.map((entry) => entry.name)).size).toBe(138);
    expect(new Set(metadata.map((entry) => entry.id)).size).toBe(138);
    const tiers = ['Common', 'Rare', 'Legendary', 'Omnic', 'Calamitic'];
    expect(tiers.map((tier) => entries.filter((entry) =>
      entry.rarity.replace(' (Master)', '') === tier).length)).toEqual([10, 15, 15, 93, 5]);
    const sorted = [...entries].sort((a, b) =>
      tiers.indexOf(a.rarity.replace(' (Master)', '')) -
      tiers.indexOf(b.rarity.replace(' (Master)', '')) || a.name.localeCompare(b.name));
    expect(entries.map((entry) => entry.name)).toEqual(sorted.map((entry) => entry.name));
  });

  it.each(metadata)('$id retains approved identity, eligibility and a complete effect', (expected) => {
    const entry = entries.find((candidate) => candidate.name === expected.name);
    expect(entry, expected.id).toBeDefined();
    if (!entry) throw new Error(`Missing Phase 0 contract: ${expected.id}.`);
    expect(entry.rarity).toBe(expected.rarity);
    expect(entry.ability).not.toBe('');
    expect(entry.ability).not.toMatch(/_{2,}|\b(?:TODO|TBD|undefined)\b/);
    if (expected.element) expect(entry.element).toContain(`${expected.element} (`);
    if (expected.character) expect(entry.element).toContain(`Master for ${expected.character} only`);
    else if (!expected.element) expect(entry.element).toContain('gameplay: universal');
  });

  it('keeps percentage grants distinct from Gauge costs and held-Gauge thresholds', () => {
    for (const entry of entries) {
      if (entry.name === 'Horizon Heartcase' || entry.name === 'Sentinel Aperture') continue;
      expect(entry.ability, entry.name).not.toMatch(
        /\b(?:gains?|grants?|gives?|restores?)\b[^.]*\b[1-9]\d* (?:Elemental )?Gauge\b/i,
      );
    }
    expect(catalog).toContain("own maximum capacity before Gauge Gain scaling");
  });

  it('retains the final approved Calamitic and Aegis revisions', () => {
    const ability = (name: string) => entries.find((entry) => entry.name === name)?.ability;
    expect(ability('Aegis Capacitor')).toBe(
      '+75% [Health] and +75% [Defense].',
    );
    expect(ability('Cathedral of the Final Equation')).toBe(
      'Your [Attack Actions] gain +250% [Critical Rate] and +120% [Critical Damage Multiplier]. +65% [Skill Efficiency].',
    );
    expect(ability('Causality Funeral Engine')).toBe(
      '+100% [Skill Efficiency]. Your [Last Flare] has no [Cooldown] or [Recovery] and gains +125% [Direct Damage]. Normal [Elemental Gauge] cost caps and floors still apply.',
    );
    expect(ability("World-Eater's Orrery")).toBe(
      '+3 turns [Skill Duration]. [Debuffs] applied by your [Skills], including [Burn] damage and [Weaken] strength, gain +125% [Skill Power]. This bonus does not increase the skill\'s [Direct Damage], healing or [Shields].',
    );
    expect(ability('Throne of Borrowed Tomorrows')).toContain(
      'Each character can receive this extra action once per [Player Turn].',
    );
    expect(ability('Throne of Borrowed Tomorrows')).not.toContain('Once per Battle');
  });
});
