// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const motion = vi.hoisted(() => ({ reduced: false }));
vi.mock('./settings', () => ({ reducedMotion: () => motion.reduced }));
import { animateSocial, glintPicturePreview, resetSocialEntrance } from './social-luster';

function profile(tab: 'info' | 'friends'): HTMLElement {
  document.body.innerHTML = `<section class="ref-profile profile-layout"><nav><button data-profile-tab="info" aria-pressed="${tab === 'info'}"></button><button data-profile-tab="friends" aria-pressed="${tab === 'friends'}"></button></nav>
    <form class="online-profile-panel"><div class="profile-main-avatar"></div></form><div class="online-profile-statistics"><article class="profile-metric"></article><article class="profile-story"></article></div>
    <aside class="ref-profile-right"><section></section><section></section></aside></section>`;
  return document.body;
}
function chats(): HTMLElement {
  document.body.innerHTML = '<section class="ref-profile profile-chat-layout"><div class="friend-chat-layout"><section></section><section></section><aside></aside></div></section>';
  return document.body;
}
const playing = () => document.querySelectorAll('.luster-sheen, .luster-stagger-item').length > 0;

beforeEach(() => { vi.useFakeTimers(); motion.reduced = false; resetSocialEntrance(); });
afterEach(() => { vi.useRealTimers(); document.body.innerHTML = ''; });

describe('Social entrance (D-465)', () => {
  it('cascades panels and glints the picture once per Player info arrival, never on a re-render', () => {
    animateSocial(profile('info'));
    expect(document.querySelectorAll('.luster-stagger-item')).toHaveLength(5);
    expect(document.querySelector('.profile-main-avatar .luster-sheen')).not.toBeNull();
    vi.advanceTimersByTime(2000);
    expect(playing()).toBe(false);
    animateSocial(profile('info'));
    expect(playing()).toBe(false);
  });

  it('treats each tab and a friend profile as its own arrival, and replays after leaving Social', () => {
    animateSocial(profile('info'));
    vi.advanceTimersByTime(2000);
    animateSocial(profile('friends'));
    expect(playing()).toBe(true);
    expect(document.querySelector('.luster-sheen')).toBeNull();
    vi.advanceTimersByTime(2000);
    animateSocial(chats());
    expect(document.querySelectorAll('.luster-stagger-item')).toHaveLength(3);
    vi.advanceTimersByTime(2000);
    document.body.innerHTML = '<div class="home"></div>';
    animateSocial(document.body);
    animateSocial(chats());
    expect(playing()).toBe(true);
  });

  it('stays static under Reduce motion', () => {
    motion.reduced = true;
    animateSocial(profile('info'));
    document.body.insertAdjacentHTML('beforeend', '<div class="picture-preview-art"></div>');
    glintPicturePreview(document.body);
    expect(playing()).toBe(false);
  });
});

describe('Social and Settings Jewel & Gold skin (D-465)', () => {
  const css = (name: string) => readFileSync(resolve(__dirname, name), 'utf8');
  it('uses tokens instead of the old mono-gray surfaces', () => {
    for (const name of ['settings-panel.css', 'profile-layout.css', 'friend-chat.css', 'profile-picture-browser.css']) {
      expect(css(name), name).not.toMatch(/#(131314|131315|151518|1a1a1c|eee|ededf0|b5b5bc|303034|2d2d31)\b/i);
      expect(css(name), name).toContain('var(--gild-');
    }
    expect(css('settings-panel.css')).not.toContain('Segoe UI');
  });
  it('visually hides the chat composer label outside the Player info grid', () => {
    expect(css('friend-chat.css')).toMatch(/\.chat-composer > label \{[^}]*clip-path: inset\(50%\)/);
  });
});
