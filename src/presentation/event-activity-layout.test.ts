// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { emptyAccount } from '../game/account';
import { bindActivityDifficulties } from './calamity';
import { bindGameplayNavigation, gameplayHub } from './gameplay';

const activeTime = Date.parse('2026-11-11T05:00:00Z');
const closedTime = Date.parse('2026-12-01T01:00:00Z');

function renderEvents(online: boolean, now: number) {
  const account = emptyAccount();
  account.characters.ember = { level: 105, evolution: 6 };
  account.infusionStages.roses = 35;
  account.infusionStages.moon = 35;
  const before = structuredClone(account);
  document.body.innerHTML = `<div class="sanctuary-shell">${gameplayHub(account, { online, now })}</div>`;
  history.replaceState(null, '', '#gameplay-events');
  bindGameplayNavigation(document.body);
  bindActivityDifficulties(document.body);
  const group = document.querySelector<HTMLElement>('#gameplay-events')!;
  const choices = Array.from(group.querySelectorAll<HTMLButtonElement>('[data-activity-choice]'));
  const cards = Array.from(group.querySelectorAll<HTMLElement>(':scope > .activity-card'));
  return { account, before, group, choices, cards };
}

afterEach(() => {
  document.querySelector<HTMLButtonElement>('#gameplay-events [data-activity-choice="0"]')?.click();
  document.body.innerHTML = '';
  history.replaceState(null, '', '/');
});

describe('event activity layout', () => {
  it('switches between separate event cards and retains their stage and difficulty selections', () => {
    const { account, before, choices, cards } = renderEvents(true, activeTime);
    expect(choices.map((choice) => choice.textContent?.trim())).toEqual([
      'Passion of Crimson Roses', 'The Harbor of Unreturned Names',
    ]);
    expect(cards).toHaveLength(2);
    expect(cards[0].classList.contains('rose-event-card')).toBe(true);
    expect(cards[1].classList.contains('moon-event-card')).toBe(true);
    expect(cards.map((card) => card.hidden)).toEqual([false, true]);
    expect(choices.map((choice) => choice.getAttribute('aria-pressed'))).toEqual(['true', 'false']);
    expect(choices.map((choice) => choice.getAttribute('aria-controls'))).toEqual(cards.map((card) => card.id));
    expect(cards[0].querySelector('[data-infusion="roses"]')).not.toBeNull();
    expect(cards[0].textContent).toContain('Seed of Rosethorn');
    expect(cards[1].querySelector('[data-infusion="moon"]')).not.toBeNull();
    expect(cards[1].textContent).toContain('Seed of Moonwake');

    const roseStage = cards[0].querySelector<HTMLSelectElement>('[data-infusion-stage="roses"]')!;
    roseStage.value = '12';
    cards[0].querySelector<HTMLButtonElement>('[data-difficulty="calamity"]')!.click();
    choices[1].click();
    expect(cards.map((card) => card.hidden)).toEqual([true, false]);
    expect(choices.map((choice) => choice.getAttribute('aria-pressed'))).toEqual(['false', 'true']);
    choices[0].click();
    expect(roseStage.value).toBe('12');
    expect(cards[0].querySelector<HTMLElement>('[data-difficulty-panel="calamity"]')!.hidden).toBe(false);
    expect(account).toEqual(before);
  });

  it('remembers the selected event when the activity screen is rebuilt', () => {
    const first = renderEvents(true, activeTime);
    first.choices[1].click();
    const rebuilt = renderEvents(true, activeTime);
    expect(rebuilt.cards.map((card) => card.hidden)).toEqual([true, false]);
    expect(rebuilt.choices[1].getAttribute('aria-pressed')).toBe('true');
    expect(rebuilt.account).toEqual(rebuilt.before);
  });

  it.each([
    ['offline', false, activeTime],
    ['after closure', true, closedTime],
  ])('keeps both events browseable but unavailable %s', (_label, online, now) => {
    const { account, before, group, choices, cards } = renderEvents(online, now);
    expect(choices).toHaveLength(2);
    for (const [index, card] of cards.entries()) {
      choices[index].click();
      expect(card.hidden).toBe(false);
      expect(card.querySelector('[data-infusion]')).toBeNull();
      expect(card.querySelector('[data-page="special-banner-archive"]')).not.toBeNull();
      expect(card.querySelector<HTMLButtonElement>('button:disabled')).not.toBeNull();
    }
    expect(group.textContent).not.toContain('Beneath the Borrowed Dawn');
    expect(account).toEqual(before);
  });

  it('lets event cards auto-place instead of sharing a fixed grid row', () => {
    const css = readFileSync(resolve(process.cwd(), 'src', 'presentation', 'reference-layout.css'), 'utf8');
    expect(css).toMatch(/#gameplay-events\s*>\s*\.activity-card\s*\{\s*grid-row:\s*auto;\s*\}/);
    const compactCss = readFileSync(resolve(process.cwd(), 'src', 'presentation', 'activity-layout.css'), 'utf8');
    expect(compactCss).toMatch(/#gameplay-events\s*>\s*\.activity-picker\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
    expect(compactCss).toMatch(/@media \(max-width: 480px\)\s*\{\s*#app\s+\.ref-play\s+#gameplay-events\s*>\s*\.activity-picker\s*\{\s*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  });
});
