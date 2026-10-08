import { describe, expect, it } from 'vitest';
import { ambientBackground, ambientScreens } from './ambient-background';

describe('decorative screen backgrounds', () => {
  it.each(ambientScreens)('provides bounded noninteractive layers for %s', (screen) => {
    const html = ambientBackground(screen);
    expect(html).toContain(`data-ambient-screen="${screen}"`);
    expect(html).toContain('aria-hidden="true"');
    expect(html.match(/<span /g)).toHaveLength(3);
    expect(html).not.toMatch(/button|tabindex|img|canvas/);
  });
});
