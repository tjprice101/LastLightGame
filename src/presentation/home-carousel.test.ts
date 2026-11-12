// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { emptyAccount } from '../game/account';
import { getStarter } from '../content/starters';
import { attendanceReward } from '../content/social-calendar';
import type { SocialCalendarView } from '../online/social-calendar';
import { bindHomeCarousel, referenceHome, updateHomeAttendance } from './reference-home';

function attendance(overrides: Partial<SocialCalendarView> = {}): SocialCalendarView {
  return {
    serverTime: Date.parse('2026-11-12T02:00:00Z'), resetDay: '2026-11-11', nextResetAt: '2026-11-13T01:00:00Z',
    month: '2026-11', attendance: 6, daysInMonth: 30, attendedToday: false, streak: 6,
    nextReward: attendanceReward(7, 7), giftSentToday: false, seedChoices: [], mail: [], ...overrides,
  };
}
function home(online = true): HTMLElement {
  const account = emptyAccount();
  account.characters.ember = { level: 0, evolution: 1 };
  account.squad = ['ember'];
  const host = document.createElement('main');
  host.innerHTML = referenceHome(getStarter('ember'), account, online);
  return host;
}

describe('live Home carousel', () => {
  it('switches every featured destination and wraps without starting timers or changing the account', () => {
    const host = home();
    bindHomeCarousel(host);
    const visible = () => Array.from(host.querySelectorAll<HTMLElement>('[data-home-slide]')).filter(slide => !slide.hidden);
    expect(visible().map(slide => slide.dataset.homeSlide)).toEqual(['0']);
    host.querySelector<HTMLButtonElement>('[data-home-carousel-step="-1"]')!.click();
    expect(visible().map(slide => slide.dataset.homeSlide)).toEqual(['4']);
    host.querySelector<HTMLButtonElement>('[data-home-carousel-step="1"]')!.click();
    expect(visible().map(slide => slide.dataset.homeSlide)).toEqual(['0']);
    host.querySelector<HTMLButtonElement>('[data-home-carousel-index="1"]')!.click();
    expect(visible().map(slide => slide.dataset.homeSlide)).toEqual(['1']);
    expect(host.querySelector('[data-home-carousel-index="1"]')?.getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelector('[data-home-loadouts]')?.getAttribute('data-page')).toBe('team');
  });

  it('uses the monthly authority state and next streak reward, with review rather than an invented claim', () => {
    const host = home(), view = attendance(), before = structuredClone(view);
    updateHomeAttendance(host, view);
    const panel = host.querySelector('[data-home-attendance]')!;
    expect(panel.textContent).toContain('Day 7 of 30');
    expect(panel.querySelectorAll('.home-attendance-days li')).toHaveLength(7);
    expect(panel.querySelectorAll('.is-saved')).toHaveLength(6);
    expect(panel.querySelector('[aria-current="step"]')?.textContent).toContain('4,000');
    expect(panel.querySelector('[aria-current="step"]')?.textContent).toContain('10');
    expect(panel.textContent).toContain('Next claim: 4,000 Prismatica + 10 Null-Prismatica');
    expect(panel.querySelector('[data-social-calendar="attendance"]')?.textContent).toContain('Review & claim');
    expect(panel.querySelector('[data-calendar-action]')).toBeNull();
    expect(view).toEqual(before);
  });

  it('marks saved days with text and shows the remaining monthly days without fake seven-day resets', () => {
    const host = home();
    updateHomeAttendance(host, attendance({ attendance: 30, attendedToday: true, streak: 30 }));
    const panel = host.querySelector('[data-home-attendance]')!;
    expect(panel.textContent).toContain('Day 30 of 30');
    expect(panel.textContent).toContain('Come back after the next reset');
    expect(panel.querySelectorAll('.home-attendance-days li')).toHaveLength(2);
    expect(panel.querySelectorAll('.is-saved')).toHaveLength(2);
    expect(panel.querySelector('button')?.textContent).toBe('View attendance');
  });

  it('does not show invented rewards or dead claim controls for a local account', () => {
    const host = home(false);
    expect(host.querySelector('[data-home-attendance]')?.textContent).toContain('Sign in online');
    expect(host.querySelector('[data-home-attendance] button')?.getAttribute('data-page')).toBe('profile');
    expect(host.querySelector('[data-social-calendar]')).toBeNull();
    expect(host.querySelector('.home-attendance-days')).toBeNull();
  });
});
