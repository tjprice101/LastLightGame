import { describe, expect, it } from 'vitest';
import { settingsPanel } from './settings-panel';
import { defaultBindings, commands } from '../game/hotkeys';

describe('shared settings drawer', () => {
  it('shows saved music volume and mute with labelled controls', () => {
    const html = settingsPanel('system', defaultBindings, 1, { volume: 72, muted: true });
    expect(html).toContain('for="music-volume"');
    expect(html).toContain('value="72"');
    expect(html).toContain('72%</output>');
    expect(html).toContain('id="music-muted" type="checkbox" checked');
    expect(html).toContain('aria-describedby="music-description"');
    expect(html).toContain('Activities without delivered tracks stay silent');
  });
  it('groups presentation, motion and selection keys with an accessible close control', () => {
    const html = settingsPanel('system', defaultBindings, 1);
    for (const text of ['Battle presentation', 'Motion &amp; accessibility', 'Selection keys',
      'aria-label="Close settings"', 'id="settings-heading"', 'id="settings-result"', 'id="hotkey-result"']) {
      expect(html).toContain(text);
    }
    expect(html.match(/id="close-settings"/g)).toHaveLength(1);
    expect(html).toContain('data-information="settings-information"');
    expect(html.match(/id="return-title"/g)).toHaveLength(1);
    expect(html).toContain('Saved progress and earned rewards are kept');
    expect(html).toContain('data-close-information');
    expect(html).toContain('aria-describedby="speed-description"');
    expect(html).toContain('aria-describedby="motion-description"');
    expect(html).toContain('Full animations');
    expect(html).toContain('Only Reduce motion disables them');
    expect(html).not.toContain('Follow device preferences');
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
