import { describe, expect, it } from 'vitest';
import { conduitUpgradeMeter } from './conduit-upgrade-meter';
import { conduitIcon } from './conduit-store';

describe('Conduit upgrade square meter', () => {
  it.each([0, 1, 2, 3, 4, 5])('shows exactly five squares with %i filled', (level) => {
    const html = conduitUpgradeMeter(level);
    expect(html.match(/class="conduit-upgrade-square(?: is-filled)?"/g)).toHaveLength(5);
    expect(html.match(/is-filled/g) ?? []).toHaveLength(level);
    expect(html).toContain(`data-upgrade-level="${level}"`);
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain(`+${level}`);
    expect(conduitIcon('vigil-core', level)).toContain(`aria-label="Vigil Core · Upgrade +${level} of 5"`);
    expect(conduitIcon('vigil-core', level)).toContain(html);
  });
  it.each([-1, 6, 1.5, NaN])('rejects invalid level %s', (level) => {
    expect(() => conduitUpgradeMeter(level)).toThrow();
  });
});
