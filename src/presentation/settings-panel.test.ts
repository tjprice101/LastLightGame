import { describe, expect, it } from 'vitest';
import { settingsPanel } from './settings-panel';
import { defaultBindings, commands } from '../game/hotkeys';

describe('shared settings drawer', () => {
  it('groups presentation, motion and selection keys with an accessible close control', () => {
    const html = settingsPanel('system', defaultBindings, 1);
    for (const text of ['Battle presentation', 'Motion &amp; accessibility', 'Selection keys',
      'aria-label="Close settings"', 'id="settings-heading"', 'id="settings-result"', 'id="hotkey-result"']) {
      expect(html).toContain(text);
    }
    expect(html.match(/id="close-settings"/g)).toHaveLength(1);
    expect(html).toContain('data-information="settings-information"');
    expect(html).toContain('data-close-information');
    expect(html).toContain('aria-describedby="speed-description"');
    expect(html).toContain('aria-describedby="motion-description"');
    for (const [command] of commands) {
      expect(html).toContain(`label for="key-${command}"`);
      expect(html).toContain(`id="key-${command}" name="${command}"`);
    }
  });
  it('retains saved preferences and documents automatic turns without introducing attack keys', () => {
    const html = settingsPanel('reduced', defaultBindings, 3);
    expect(html).toContain('value="reduced" selected');
    expect(html).toContain('value="3" selected');
    expect(html).toContain('data-battle-speed');
    expect(html).toContain('Turns advance automatically');
    expect(html).not.toContain('name="endTurn"');
    expect(html).not.toContain('name="light"');
  });
});
