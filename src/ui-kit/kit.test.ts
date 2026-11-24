import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { bar, button, card, chip, divider, grid, iconButton, panel, screen, segmented, stat, statRow, text } from './html';

const kitDir = join(process.cwd(), 'src', 'ui-kit');
/** `legacy-host.css` is the temporary bridge to un-rebuilt screens and is allowed to break the kit rules. */
const kitCss = readdirSync(kitDir).filter(name => name.endsWith('.css') && name !== 'legacy-host.css');
const read = (name: string) => readFileSync(join(kitDir, name), 'utf8');
const withoutComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

describe('interface kit stylesheets keep the rules that make them clean', () => {
  it('has stylesheets to check', () => {
    expect(kitCss).toEqual(expect.arrayContaining(['controls.css', 'kit.css', 'motion.css']));
  });
  it.each(kitCss)('%s uses no !important and no specificity guards', (name) => {
    const css = withoutComments(read(name));
    expect(css).not.toContain('!important');
    expect(css).not.toContain(':not(#_)');
    expect(css).not.toMatch(/@layer\b/);
  });
  it.each(kitCss)('%s takes every colour and font from the shared tokens', (name) => {
    const css = withoutComments(read(name));
    expect(css.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).toEqual([]);
    expect(css).not.toMatch(/font-family:(?!\s*var\()/);
    expect(css).not.toMatch(/\bfont:(?!\s*inherit)/);
  });
  it.each(kitCss)('%s only styles kit markup', (name) => {
    const selectors = withoutComments(read(name)).replace(/@keyframes[^{]+\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '')
      .split('}').map(rule => rule.split('{')[0]!.trim()).filter(selector => selector && !selector.startsWith('@'));
    for (const selector of selectors)
      for (const part of selector.split(',')) expect(part, part).toMatch(/\.lk-|\[data-accent/);
    expect(selectors.join(' ')).not.toMatch(/\.(sanctuary|ref|home|workspace|bubble|mono|hub)-/);
  });
  it('gives every interactive control a 44px target', () => {
    const css = read('controls.css');
    for (const selector of ['.lk-button {', '.lk-seg button {', '.lk-input, .lk-select {'])
      expect(css.slice(css.indexOf(selector)).split('}')[0]).toContain('min-height: 44px');
    expect(css.slice(css.indexOf('.lk-icon-button {')).split('}')[0]).toMatch(/width: 44px;\s*height: 44px/);
  });
  it('keeps disabled controls gray and opaque', () => {
    const rule = read('controls.css').split('.lk-button:disabled')[1]!.split('}')[0]!;
    expect(rule).toContain('background: var(--disabled-fill)');
    expect(rule).toContain('opacity: 1');
  });
  it('runs arrival only with full motion and settles in under 250 ms', () => {
    const css = read('motion.css');
    for (const line of css.split('\n').filter(line => line.includes('lk-rise') && !line.startsWith('@keyframes')))
      expect(line).toContain(':root[data-motion-effective="full"]');
    expect(css).toContain(':root[data-motion-effective="reduced"]');
    const tokens = readFileSync(join(process.cwd(), 'src', 'interface.css'), 'utf8');
    const arrive = Number(/--motion-arrive: (\d+)ms/.exec(tokens)![1]);
    const lastDelay = Math.max(...[...css.matchAll(/animation-delay: (\d+)ms/g)].map(match => Number(match[1])));
    expect(arrive + lastDelay).toBeLessThanOrEqual(400);
    expect(arrive).toBeLessThan(250);
  });
  it('blurs panels only, with a solid fallback', () => {
    const css = read('kit.css');
    expect(css.match(/backdrop-filter: var\(--glass-blur\)/g)).toHaveLength(2);
    expect(css).toContain('@supports not ((backdrop-filter: blur(1px))');
    expect(css.slice(css.indexOf('.lk-card {')).split('}')[0]).not.toContain('backdrop-filter');
  });
});

describe('interface tokens', () => {
  const tokens = readFileSync(join(process.cwd(), 'src', 'interface.css'), 'utf8');
  it('registers the accent as a colour so it can fade, and stops the fade under reduced motion', () => {
    expect(tokens).toContain("@property --ui-accent { syntax: '<color>'; inherits: true; initial-value: #f4f4f5; }");
    expect(tokens).toContain('transition: --ui-accent var(--motion-retint) ease;');
    expect(tokens).toContain(':root[data-motion-effective="reduced"] { transition: none; }');
  });
  it('defines every token the kit reads', () => {
    const used = new Set(kitCss.flatMap(name => [...read(name).matchAll(/var\((--[a-z0-9-]+)/g)].map(match => match[1]!)));
    const local = new Set(['--accent', '--lk-min', '--lk-fill']);
    for (const name of used)
      if (!local.has(name)) expect(tokens, name).toContain(name === '--ui-accent' ? '@property --ui-accent ' : `${name}:`);
  });
});

describe('interface kit markup', () => {
  it('builds a screen with one focusable heading, flavour, actions and an arrival flag', () => {
    const html = screen({ page: 'stores', title: 'Stores', flavour: 'Trade what you carry.', actions: button({ label: 'Refresh' }), body: '<p>x</p>', arrive: true });
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain('<h1 class="lk-title" tabindex="-1">Stores</h1>');
    expect(html).toContain('data-menu-screen="stores" data-arrive');
    expect(html).toContain('<p class="lk-flavour">Trade what you carry.</p>');
    expect(html).toContain('<div class="lk-screen-actions">');
    expect(screen({ page: 'home', title: 'Home', body: '' })).not.toMatch(/data-arrive|lk-flavour|lk-screen-actions/);
  });
  it('escapes plain text and leaves trusted markup alone', () => {
    expect(text(`<b a="1">&'`)).toBe('&#60;b a=&#34;1&#34;&#62;&#38;&#39;');
    expect(panel('<i>kept</i>', { title: 'A & B' })).toContain('<h2 class="lk-panel-title">A &#38; B</h2><');
    expect(panel('<i>kept</i>')).toBe('<section class="lk-panel"><i>kept</i></section>');
  });
  it('carries accent, state and hooks on a card, and makes a button card one control', () => {
    const html = card({ title: 'Ember Rite', aside: '3 / 5', body: 'Exact text.', accent: 'infernic', state: 'actionable', as: 'button', attrs: 'data-page="gameplay"' });
    expect(html).toMatch(/^<button class="lk-card" type="button" data-state="actionable" data-accent="infernic" data-page="gameplay">/);
    expect(html).toContain('<span class="lk-card-body">Exact text.</span></button>');
    expect(html).not.toContain('<div');
    expect(card({ body: 'x' })).toBe('<article class="lk-card"><div class="lk-card-body">x</div></article>');
    expect(card({ body: 'x', as: 'button', disabled: true })).toContain(' disabled');
  });
  it('lays out grids and stats', () => {
    expect(grid(['<a></a>', '<b></b>'], { min: 220 })).toBe('<div class="lk-grid" style="--lk-min:220px"><a></a><b></b></div>');
    expect(grid([], { as: 'ul' })).toBe('<ul class="lk-grid"></ul>');
    expect(statRow([stat({ label: 'Prismatica', value: '1,234,567', id: 'balance', tone: 'accent', sub: 'owned' })]))
      .toBe('<dl class="lk-stats"><div class="lk-stat" data-tone="accent"><dt class="lk-stat-label">Prismatica</dt><dd class="lk-stat-value" id="balance">1,234,567</dd><dd class="lk-stat-sub">owned</dd></div></dl>');
  });
  it('builds buttons that are never submit by accident and icon buttons that always have a name', () => {
    expect(button({ label: 'Upgrade', variant: 'primary', attrs: 'data-upgrade', disabled: true }))
      .toBe('<button class="lk-button" type="button" data-variant="primary" disabled data-upgrade><span>Upgrade</span></button>');
    expect(button({ label: 'Save', submit: true })).toContain('type="submit" data-variant="secondary"');
    expect(iconButton({ icon: '<svg></svg>', label: 'Settings', attrs: 'id="open-settings"' }))
      .toBe('<button class="lk-icon-button" type="button" aria-label="Settings" id="open-settings"><svg></svg></button>');
  });
  it('reports the selected segment with aria-pressed', () => {
    const html = segmented({ label: 'Rarity', options: [{ label: 'All', attrs: 'data-filter="all"', selected: true }, { label: 'Rare', attrs: 'data-filter="rare"', disabled: true }] });
    expect(html).toContain('<div class="lk-seg" role="group" aria-label="Rarity">');
    expect(html).toContain('<button type="button" aria-pressed="true" data-filter="all">All</button>');
    expect(html).toContain('<button type="button" aria-pressed="false" disabled data-filter="rare">Rare</button>');
  });
  it('builds chips, dividers and exact, clamped bars', () => {
    expect(chip('Ready', { on: true, tone: 'gain' })).toBe('<span class="lk-chip" data-on data-tone="gain">Ready</span>');
    expect(divider()).toBe('<hr class="lk-divider">');
    const html = bar({ value: 30, max: 120, ariaLabel: 'Experience', label: '30 / 120' });
    expect(html).toContain('role="meter" aria-label="Experience" aria-valuemin="0" aria-valuemax="120" aria-valuenow="30"');
    expect(html).toContain('style="--lk-fill:0.25"');
    expect(bar({ value: 500, max: 120, ariaLabel: 'x' })).toContain('aria-valuenow="120"');
    expect(bar({ value: 500, max: 120, ariaLabel: 'x' })).toContain('--lk-fill:1"');
    expect(() => bar({ value: 1, max: 0, ariaLabel: 'x' })).toThrow('positive maximum');
  });
});
