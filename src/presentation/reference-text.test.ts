import { describe, expect, it } from 'vitest';
import { bracketReferences } from './reference-text';
import { information } from './information';
import { phaseZeroStatLabels } from '../content/phase-zero-stats';
import { conduitGlossary } from '../content/conduit-glossary';

describe('bracketed reference formatting', () => {
  it('canonicalizes legacy Health names, full ability names and plural traps without nesting', () => {
    const input = "HP, [HP], maximum HP, [Maximum HP], Empowered Thorn Traps and Dawnfire.";
    const expected = '[Health], [Health], maximum [Health], maximum [Health], [Empowered Thorn Traps] and [Last Flare: Dawnfire].';
    expect(bracketReferences(input, false)).toBe(expected);
    expect(bracketReferences(expected, false)).toBe(expected);
  });
  it('brackets full names in prose while leaving headings, labels, buttons and attributes plain', () => {
    const html = bracketReferences('<h3>Prismatica</h3><p data-name="Prismatica">Spend Prismatica in Heaven with Crinso\'s Golden Edge.</p><button>Story</button><strong>Calamity</strong>');
    expect(html).toBe('<h3>Prismatica</h3><p data-name="Prismatica">Spend [Prismatica] in [Soar to Heaven] with [Crinso]\'s [Golden Edge].</p><button>Story</button><strong>Calamity</strong>');
  });

  it('is idempotent and never nests brackets', () => {
    const once = bracketReferences('<p>Null-Prismatica and [Last Flare] after Last Flare.</p>');
    expect(once).toBe('<p>[Null-Prismatica] and [Last Flare] after [Last Flare].</p>');
    expect(bracketReferences(once)).toBe(once);
  });

  it('gives element names a medal and brackets, keeping longer names intact', () => {
    const html = bracketReferences('<p>Infernic foes and Infernic Embers.</p>');
    expect(html).toMatch(/^<p><span class="element-label" data-element="infernic"><img class="element-emblem"[^>]*>\[Infernic\]<\/span> foes and \[Infernic Embers\]\.<\/p>$/);
    expect(bracketReferences(html)).toBe(html);
    expect(bracketReferences('<h3>Infernic</h3>')).toBe('<h3>Infernic</h3>');
  });

  it('applies to Information dialog content but not to its title', () => {
    const markup = information('test-info', 'Story', '<p>Story is open from the start.</p>');
    expect(markup).toContain('<h2 id="test-info-heading">Story</h2>');
    expect(markup).toContain('<p>[Story] is open from the start.</p>');
  });

  it('supports text-only confirmation messages without escaped element markup', () => {
    const text = bracketReferences('Oceanic Skills grant Skill Power.', false);
    expect(text).toBe('[Oceanic] [Skills] grant [Skill Power].');
    expect(bracketReferences(text, false)).toBe(text);
  });

  it('brackets the reported targeting, skill and stat keywords without changing the amount', () => {
    expect(bracketReferences('All-enemy damaging Skills gains +45% Skill Power.'))
      .toBe('[Global] damaging [Skills] gains +45% [Skill Power].');
    expect(bracketReferences('all-enemy damaging skills gain +67.5% skill power.'))
      .toBe('[Global] damaging [Skills] gain +67.5% [Skill Power].');
  });

  it.each([...Object.values(phaseZeroStatLabels), ...conduitGlossary.map(entry => entry.term)])(
    'brackets the complete %s keyword instead of its shorter components', term => {
      for (const casing of [term, term.toLowerCase(), term.toUpperCase()]) {
        expect(bracketReferences(`+20% ${casing}.`)).toBe(`+20% [${term}].`);
        expect(bracketReferences(`+20% [${casing}].`)).toBe(`+20% [${term}].`);
      }
    });

  it('keeps existing brackets and possessive native resources intact across repeated rendering', () => {
    const input = "Normal Attacks against Shielded enemies grant Skill Power and Skill Efficiency on the next player turn. Flora's Empowered Seeds and Thornia's trap grant [Elemental Gauge Capacity].";
    const once = bracketReferences(input);
    expect(once).toBe("[Normal Attack] against [Shielded] enemies grant [Skill Power] and [Skill Efficiency] on the next [Player Turn]. [Flora]'s [Empowered Seeds] and [Thornia]'s [Trap] grant [Elemental Gauge Capacity].");
    expect(bracketReferences(once)).toBe(once);
    expect(bracketReferences('<span class="stat">Skill Power</span><p data-stat="Skill Power">Skill Power</p>'))
      .toBe('<span class="stat">Skill Power</span><p data-stat="Skill Power">[Skill Power]</p>');
  });

  it('uses Global for damage, healing and support without changing target-side prose', () => {
    const text = 'Global damage to enemies, Global Healing to allies and Global Shields for living allies.';
    const formatted = bracketReferences(text);
    expect(formatted).toBe('[Global] damage to enemies, [Global] [Healing] to allies and [Global] [Shields] for living allies.');
    expect(bracketReferences(formatted)).toBe(formatted);
  });

  it('normalizes mixed and already bracketed keywords while preserving surrounding prose and amounts', () => {
    const input = 'global damaging [skills] gain +67.5% SKILL POWER after [all-enemy] attacks; [custom wording] stays unchanged.';
    const expected = '[Global] damaging [Skills] gain +67.5% [Skill Power] after [Global] attacks; [custom wording] stays unchanged.';
    expect(bracketReferences(input)).toBe(expected);
    expect(bracketReferences(expected)).toBe(expected);
  });

  it('leaves casing and brackets in skipped HTML and attributes untouched', () => {
    const html = '<button data-key="[skills]">[skills]</button><span>[skill power]</span><p title="[skills]">[skills] and healing</p>';
    expect(bracketReferences(html)).toBe('<button data-key="[skills]">[skills]</button><span>[skill power]</span><p title="[skills]">[Skills] and [Healing]</p>');
  });
});
