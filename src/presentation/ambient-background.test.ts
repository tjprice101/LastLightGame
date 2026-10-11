import { describe, expect, it } from 'vitest';
import { ambientBackground, ambientScreens } from './ambient-background';
import { readFileSync } from 'node:fs';

describe('decorative screen backgrounds', () => {
  it('covers the viewport throughout bloom drift without desktop or mobile size caps', () => {
    const css = readFileSync(new URL('./leader-theme.css', import.meta.url), 'utf8');
    const bloom = css.match(/\.ambient-bloom \{([^}]+)\}/)?.[1];
    expect(bloom).toContain('inset: -50%');
    expect(bloom).not.toMatch(/width:|height:|border-radius:/);
    expect(css).toContain('.ambient-background:not([data-ambient-screen="battle"])');
    expect(css).toContain('html[data-motion="reduced"] .ambient-bloom { animation: none; transform: none; }');
  });
  it.each(ambientScreens)('provides bounded noninteractive layers for %s', (screen) => {
    const html = ambientBackground(screen);
    expect(html).toContain(`data-ambient-screen="${screen}"`);
    expect(html).toContain('aria-hidden="true"');
    expect(html.match(/<span /g)).toHaveLength(4);
    expect(html).toContain('class="ambient-bloom"');
    expect(html).not.toMatch(/button|tabindex|img|canvas/);
  });
});
