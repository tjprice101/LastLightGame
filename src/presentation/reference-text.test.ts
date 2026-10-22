import { describe, expect, it } from 'vitest';
import { bracketReferences } from './reference-text';
import { information } from './information';
import { phaseZeroStatLabels } from '../content/phase-zero-stats';
import { conduitGlossary } from '../content/conduit-glossary';

describe('bracketed reference formatting', () => {
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
      .toBe('[All-enemy] damaging [Skills] gains +45% [Skill Power].');
    expect(bracketReferences('all-enemy damaging skills gain +67.5% skill power.'))
      .toBe('[all-enemy] damaging [skills] gain +67.5% [skill power].');
  });

  it.each([...Object.values(phaseZeroStatLabels), ...conduitGlossary.map(entry => entry.term)])(
    'brackets the complete %s keyword instead of its shorter components', term => {
      expect(bracketReferences(`+20% ${term}.`)).toBe(`+20% [${term}].`);
    });

  it('keeps existing brackets and possessive native resources intact across repeated rendering', () => {
    const input = "Normal Attacks against Shielded enemies grant Skill Power and Skill Efficiency on the next player turn. Flora's Empowered Seeds and Thornia's trap grant [Elemental Gauge Capacity].";
    const once = bracketReferences(input);
    expect(once).toBe("[Normal Attack] against [Shielded] enemies grant [Skill Power] and [Skill Efficiency] on the next [player turn]. [Flora]'s [Empowered Seeds] and [Thornia]'s [trap] grant [Elemental Gauge Capacity].");
    expect(bracketReferences(once)).toBe(once);
    expect(bracketReferences('<span class="stat">Skill Power</span><p data-stat="Skill Power">Skill Power</p>'))
      .toBe('<span class="stat">Skill Power</span><p data-stat="Skill Power">[Skill Power]</p>');
  });
});
