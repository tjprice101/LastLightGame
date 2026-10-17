import { describe, expect, it } from 'vitest';
import { conduitUpgradeMeter } from './conduit-upgrade-meter';
import { conduitIcon } from './conduit-store';

describe('Conduit upgrade square meter', () => {
  it.each([0, 1, 5, 6, 25])('renders the level-aware +%i badge', (level) => {
    const html = conduitUpgradeMeter(level);
    expect(html).toContain(`data-upgrade-level="${level}"`);
    expect(html).toContain(`<span class="conduit-upgrade-value">+${level}</span>`);
    expect(html).toContain('aria-hidden="true"');
    expect(conduitIcon('vigil-core', level)).toContain(html);
  });
  it.each([-1, 1.5, NaN, Infinity])('rejects invalid level %s', (level) => {
    expect(() => conduitUpgradeMeter(level)).toThrow();
  });
});
