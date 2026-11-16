// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const motion = vi.hoisted(() => ({ reduced: false }));
vi.mock('./settings', () => ({ reducedMotion: () => motion.reduced }));
import { animatePlayHub, resetPlayHubEntrance } from './play-luster';

function dungeons(selected: number, difficulty = 'normal'): HTMLElement {
  const card = (index: number) => `<article class="activity-card" ${index === selected ? '' : 'hidden'}><div class="activity-difficulty">
      <div role="tablist"><button data-difficulty="normal" aria-selected="${difficulty === 'normal'}"></button><button data-difficulty="calamity" aria-selected="${difficulty === 'calamity'}"></button></div>
      <div role="tabpanel" ${difficulty === 'normal' ? '' : 'hidden'}><div class="activity-banner"></div><dl class="activity-facts"><div></div><div></div><div></div></dl><section class="enemy-strength"></section><footer class="activity-entry"></footer></div>
      <div role="tabpanel" ${difficulty === 'calamity' ? '' : 'hidden'}><div class="calamity-tier"></div></div></div></article>`;
  document.body.innerHTML = `<div class="gameplay-hub"><section class="activity-group" id="gameplay-story" hidden></section>
    <section class="activity-group" id="gameplay-dungeons">${card(0)}${card(1)}</section></div>`;
  return document.body;
}
function story(region: string, mode: 'stages' | 'map'): HTMLElement {
  document.body.innerHTML = `<div class="gameplay-hub"><section class="activity-group" id="gameplay-story"><div class="mono-story-campaign"><section class="ref-story-main">
    <div data-story-region-heading><h2>${region}</h2></div>
    <button data-story-view="stages" aria-pressed="${mode === 'stages'}"></button><button data-story-view="map" aria-pressed="${mode === 'map'}"></button>
    <figure class="story-map-art" ${mode === 'map' ? '' : 'hidden'}><div class="ref-world-map"><button class="ref-map-node"></button><button class="ref-map-node"></button></div></figure>
    <section class="story-region-panel" ${mode === 'stages' ? '' : 'hidden'}><div class="mono-story-stage-row"></div><div class="mono-story-stage-row"></div><aside class="story-boss-preview"></aside></section>
    </section></div></section></div>`;
  return document.body;
}
const cascading = () => document.querySelectorAll('.luster-stagger-item').length;
const glinting = () => document.querySelectorAll('.luster-sheen').length;

beforeEach(() => { vi.useFakeTimers(); motion.reduced = false; resetPlayHubEntrance(); });
afterEach(() => { vi.useRealTimers(); document.body.innerHTML = ''; });

describe('Play hub entrance (D-468)', () => {
  it('cascades the visible activity once per arrival and glints its banner, never on a re-render', () => {
    animatePlayHub(dungeons(0));
    expect(cascading()).toBe(6);
    expect(glinting()).toBe(1);
    vi.advanceTimersByTime(2000);
    expect(cascading()).toBe(0);
    expect(glinting()).toBe(0);
    animatePlayHub(dungeons(0));
    expect(cascading()).toBe(0);
    expect(glinting()).toBe(0);
  });

  it('treats another location or Calamity as a new arrival and skips hidden panels', () => {
    animatePlayHub(dungeons(0));
    vi.advanceTimersByTime(2000);
    animatePlayHub(dungeons(1));
    expect(cascading()).toBe(6);
    vi.advanceTimersByTime(2000);
    animatePlayHub(dungeons(1, 'calamity'));
    expect(cascading()).toBe(1);
    expect(document.querySelector('[role="tabpanel"][hidden] .luster-stagger-item')).toBeNull();
  });

  it('replays on a switch made in place inside the rendered hub', async () => {
    const host = dungeons(0);
    animatePlayHub(host);
    vi.advanceTimersByTime(2000);
    const cards = host.querySelectorAll<HTMLElement>('.activity-card');
    cards[0].hidden = true;
    cards[1].hidden = false;
    cards[1].querySelector<HTMLButtonElement>('[data-difficulty]')!.click();
    await Promise.resolve();
    expect(cascading()).toBe(6);
  });

  it('cascades Story stages or map beacons per region and view', () => {
    animatePlayHub(story('Emberwake March', 'stages'));
    expect(cascading()).toBe(3);
    vi.advanceTimersByTime(2000);
    animatePlayHub(story('Emberwake March', 'map'));
    expect(cascading()).toBe(2);
    expect(glinting()).toBe(1);
    vi.advanceTimersByTime(2000);
    animatePlayHub(story('Emberwake March', 'map'));
    expect(cascading()).toBe(0);
    animatePlayHub(story('Glasswater Reach', 'map'));
    expect(cascading()).toBe(2);
  });

  it('adds no effect nodes under Reduce motion', () => {
    motion.reduced = true;
    animatePlayHub(dungeons(0));
    expect(cascading()).toBe(0);
    expect(glinting()).toBe(0);
  });
});
