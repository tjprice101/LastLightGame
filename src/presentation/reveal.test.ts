import { describe, expect, it } from 'vitest';
import { starters } from '../content/starters';
import { elementalReveal } from './reveal';

describe('starter reveal content', () => {
  it.each(starters)('$id has original lore and a bounded decorative reveal', (starter) => {
    expect(starter.lore.origin.length).toBeGreaterThan(0);
    expect(starter.lore.story.length).toBeGreaterThan(100);
    expect(starter.lore.vow.length).toBeGreaterThan(0);
    expect(starter.lore.awakening.length).toBeGreaterThan(0);
    const markup = elementalReveal(starter);
    expect(markup).toContain(`reveal-${starter.id}`);
    expect(markup).toContain('aria-hidden="true"');
    expect(markup.match(/class="element-mote"/g)).toHaveLength(12);
    expect(markup).not.toContain('setTimeout');
  });
});
