// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { emptyAccount } from '../game/account';
import { storyCodexEntries, chapterOneTitle } from '../content/story-codex';
import { storyCodex } from './story-codex';
import { archives, bindArchives } from './archives';
import { storyCampaign } from './story';
import { referenceHome } from './reference-home';
import { gameplayHub } from './gameplay';
import { getStarter } from '../content/starters';

describe('stage-gated Story Codex', { timeout: 30_000 }, () => {
  it('uses the approved seven milestones and derives old-account unlocks without mutation', () => {
    expect(storyCodexEntries.map(entry => entry.stage)).toEqual([0, 20, 40, 60, 80, 100, 120]);
    for (const completed of [0, 19, 20, 39, 40, 60, 80, 100, 119, 120]) {
      const account = { ...emptyAccount(), storyCompleted: completed };
      const before = JSON.stringify(account);
      document.body.innerHTML = storyCodex(account);
      expect(document.querySelectorAll('details')).toHaveLength(1 + Math.floor(completed / 20));
      expect(document.querySelectorAll('.story-codex-locked')).toHaveLength(6 - Math.floor(completed / 20));
      expect(JSON.stringify(account)).toBe(before);
    }
  });
  it('does not put locked titles, paragraphs or future revelations into the DOM', () => {
    const html = storyCodex(emptyAccount());
    for (const entry of storyCodexEntries.slice(1)) {
      expect(html).not.toContain(entry.title);
      expect(html).not.toContain(entry.paragraphs[0]);
    }
    expect(html).not.toMatch(/Nyrasma|worthy|equaliz|destroy all|destroy everything/);
    expect(storyCodex(null)).toContain('role="alert"');
  });
  it('connects the fourth Collections gallery with keyboard-focusable entries and Chapter 1 labeling', () => {
    const account = { ...emptyAccount(), storyCompleted: 120 };
    document.body.innerHTML = archives(account);
    bindArchives(document.body);
    document.querySelector<HTMLButtonElement>('[data-archive-gallery="story"]')!.click();
    expect(document.querySelector<HTMLElement>('#archive-story')!.hidden).toBe(false);
    expect(document.activeElement?.id).toBe('archive-story-heading');
    expect(document.querySelectorAll('#archive-story summary')).toHaveLength(7);
    expect(storyCampaign(account, 'ember')).toContain(chapterOneTitle);
    expect(document.querySelector('#archive-story')?.textContent).toContain("Neither Let's nor Rise's soul has been found.");
  });
  it('labels Home and activity selection as Chapter 1 without advertising future chapters', () => {
    const account = emptyAccount();
    account.characters.ember = { level: 0, evolution: 1 };
    const home = referenceHome(getStarter('ember'), account);
    expect(home).toContain(chapterOneTitle);
    expect(home).toContain('Story · Chapter 1');
    expect(gameplayHub(account)).toContain(chapterOneTitle);
    expect(home).not.toContain('Chapter 2');
  });
});
