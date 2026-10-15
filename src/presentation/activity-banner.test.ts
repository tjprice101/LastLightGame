import { describe, expect, it } from 'vitest';
import { activityBanner } from './activity-banner';
import { gameplayHub } from './gameplay';
import { emptyAccount } from '../game/account';
import { elementalWars, warEncounter } from '../content/elemental-war';

describe('reference activity banners', () => {
  it('uses real base-aware artwork with a separate activity heading', () => {
    const html = activityBanner('Awaken the Machines', 'banners/machines-banner.png', 'An ancient machine awakens.');
    expect(html).toContain('class="activity-banner"');
    expect(html).toContain('assets/banners/machines-banner.png');
    expect(html).toContain('alt="An ancient machine awakens."');
    expect(html).toContain('<h3>Awaken the Machines</h3>');
    expect(html).not.toContain('loading="lazy"');
    expect(activityBanner('City of Heaven', 'banners/heavens-banner.png', undefined, true)).toContain('loading="lazy"');
  });
  it('keeps missing-art activities named without requesting a missing image', () => {
    const html = activityBanner('An authored dungeon', null);
    expect(html).toContain('Artwork pending');
    expect(html).toContain('<h3>An authored dungeon</h3>');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('src=');
  });
  it('preserves all three War banners, final-stage choices and free entry without mutating progress', () => {
    const account = emptyAccount();
    account.characters.ember = { level: 105, evolution: 6 };
    account.warStages = { nerithe: 10, orvella: 10, vaelor: 10 };
    const before = structuredClone(account);
    const html = gameplayHub(account);
    const war = html.slice(html.indexOf('id="gameplay-war"'), html.indexOf('id="gameplay-story"'));
    for (const mode of elementalWars) {
      expect(war).toContain(`<h3>${mode.name}</h3>`);
      expect(war).toContain(`data-war-stage="${mode.character}"`);
      expect(war).toContain(`data-war="${mode.character}" >Enter trial · Free`);
      expect(war).toContain(`10 · Lv.${warEncounter(mode.character, 10).level}</option>`);
    }
    expect(war.match(/class="activity-entry"/g)).toHaveLength(3);
    expect(war).not.toContain('class="activity-unlock-hint"');
    expect(account).toEqual(before);
  });
  it('retains all staged entry selectors inside real entry footers and all named reward panels', () => {
    const account = emptyAccount();
    account.infusionStages.machines = 100;
    const html = gameplayHub(account);
    expect(html.match(/class="activity-entry"/g)).toHaveLength(15);
    expect(html.match(/data-dungeon-stage=/g)).toHaveLength(6);
    expect(html.match(/data-infusion-stage=/g)).toHaveLength(6);
    expect(html).toContain('value="100" selected');
    expect(html).toContain('data-infusion="machines"');
    expect(html).toContain('class="activity-facts"');
    expect(html).toContain('Conduit upgrade currency');
    expect(html).toContain('Passion of Crimson Roses</h3>');
    expect(gameplayHub(null)).not.toContain('class="activity-entry"');
  });
  it.each([
    [0, 0, 15],
    [10, 24, 15],
    [10, 25, 14],
    [29, 25, 14],
    [30, 25, 8],
    [50, 25, 6],
    [60, 25, 4],
    [75, 25, 3],
    [85, 25, 0],
  ])('shows requirements only for locked entries at Lv.%i with %i Story clears', (level, storyCompleted, lockedCount) => {
    const account = emptyAccount();
    account.characters.ember = { level, evolution: 6 };
    account.storyCompleted = storyCompleted;
    const before = structuredClone(account);
    const html = gameplayHub(account);
    const entries = [...html.matchAll(/<footer class="activity-entry">([\s\S]*?)<\/footer>/g)]
      .map(match => match[1]);
    expect(entries).toHaveLength(15);
    expect(entries.filter(entry => entry.includes('class="activity-unlock-hint"'))).toHaveLength(lockedCount);
    for (const entry of entries) {
      const locked = entry.includes('>Locked</button>');
      expect(entry.includes('class="activity-unlock-hint"')).toBe(locked);
      expect(entry.includes('Your highest:')).toBe(locked);
      if (locked) expect(entry).toContain('Unlocks at ');
    }
    expect(account).toEqual(before);
  });
});
