import { describe, expect, it } from 'vitest';
import { bracketReferences } from './reference-text';
import { information } from './information';

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
});
