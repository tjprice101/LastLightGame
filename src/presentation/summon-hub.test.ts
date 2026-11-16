// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const motion = vi.hoisted(() => ({ reduced: false }));
vi.mock('./settings', () => ({ reducedMotion: () => motion.reduced }));
import { animateSummonHub, resetSummonHubEntrance } from './summon-hub';

function render(banner: string, view = 'summon'): HTMLElement {
  document.body.innerHTML = `<div class="ref-summon" data-banner="${banner}" data-summon-view="${view}">
    <div class="summon-banner-art"></div><section class="summon-featured"><ul>
    <li data-featured-character="a"></li><li data-featured-character="b"></li></ul></section></div>`;
  return document.body;
}
const playing = () => document.querySelectorAll('.luster-sheen, .luster-stagger-item').length > 0;

beforeEach(() => { vi.useFakeTimers(); motion.reduced = false; resetSummonHubEntrance(); });
afterEach(() => { vi.useRealTimers(); document.body.innerHTML = ''; });

describe('summon hub entrance (D-464)', () => {
  it('plays once per banner arrival and never on a same-banner re-render', () => {
    animateSummonHub(render('standard'));
    expect(document.querySelector('.summon-banner-art .luster-sheen')).not.toBeNull();
    expect(document.querySelectorAll('.summon-featured .luster-stagger-item')).toHaveLength(2);
    vi.advanceTimersByTime(2000);
    expect(playing()).toBe(false);
    animateSummonHub(render('standard'));
    expect(playing()).toBe(false);
    animateSummonHub(render('roses'));
    expect(playing()).toBe(true);
  });

  it('replays after leaving Summon and treats the Archive as its own arrival', () => {
    animateSummonHub(render('roses'));
    vi.advanceTimersByTime(2000);
    animateSummonHub(render('roses', 'archive'));
    expect(playing()).toBe(true);
    vi.advanceTimersByTime(2000);
    document.body.innerHTML = '<div class="home"></div>';
    animateSummonHub(document.body);
    animateSummonHub(render('roses', 'archive'));
    expect(playing()).toBe(true);
  });

  it('stays static under Reduce motion', () => {
    motion.reduced = true;
    animateSummonHub(render('standard'));
    expect(playing()).toBe(false);
  });
});
