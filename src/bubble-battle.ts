import './style.css';
import './sanctuary.css';
import './neutral-theme.css';
import './character-screen.css';
import './presentation/settings-panel.css';
import './creature-glossary.css';
import './sanctuary-polish.css';
import './interface.css';
import './numeric-layout.css';
import './sanctuary-layout.css';
import './ambient-background.css';
import './sanctuary-reference.css';
import './presentation/mono-reference.css';
import './presentation/reference-layout.css';
import './presentation/leader-theme.css';
import './presentation/button-style.css';
import './presentation/status-toast.css';
import './bubble-battle.css';
import { BattleView, type BattleAuthority } from './presentation/battle-view';
import { ambientBackground } from './presentation/ambient-background';
import { uiIcon } from './presentation/ui-icon';
import { installButtonStyle } from './presentation/button-style';
import { applyLeaderTheme, leaderElement } from './presentation/leader-theme';
import { applyMotion } from './presentation/settings';
import { applyBattleSpeed, battleSpeeds, parseBattleSpeed, type BattleSpeed } from './presentation/battle-speed';
import { defaultBindings } from './game/hotkeys';
import { storyEncounter, storyRules } from './content/story';
import { formatStat } from './content/combat';
import { exampleAccount } from './bubble-preview-model';
import { bubbleBattle, type BubbleBattle, type BubbleBattleBridge } from './bubble-battle-session';

const app = document.querySelector<HTMLElement>('#app');
if (!app) throw new Error('Battle frame host is missing.');
const host = app;
const view = new URLSearchParams(location.search).get('view') === 'results' ? 'results' : 'battle';
const bridge: BubbleBattleBridge = (window.parent !== window ? window.parent.lastLightBubbleBattle?.() : undefined) ?? {
  account: exampleAccount(), destination: { storyStage: 25 }, view, reduced: false, speed: 1 as BattleSpeed, setSpeed: () => undefined,
  leave: () => history.back(), settings: () => undefined, victory: () => { location.search = '?view=results'; }, next: () => location.reload(), retry: () => location.reload(), quit: () => history.back(),
};
const battle = bubbleBattle(bridge.account, bridge.destination, bridge.view === 'results');
const { session } = battle;
let speed: BattleSpeed = bridge.speed;

applyMotion(bridge.reduced ? 'reduced' : 'system');
applyBattleSpeed(speed);
applyLeaderTheme(document.documentElement, leaderElement(bridge.account, session.state));
installButtonStyle(document.body);
document.body.classList.add('in-battle', 'bubble-battle');
host.innerHTML = `<div class="battle-screen"><header class="battle-toolbar">
  <button class="battle-chrome-button" data-bubble-leave>${uiIcon('back')}<span>Leave</span></button>
  <div class="battle-speed-buttons" role="group" aria-label="Battle animation speed">${battleSpeeds.map(value =>
    `<button type="button" data-battle-speed-choice="${value}" aria-pressed="${value === speed}">${value}&times;</button>`).join('')}</div>
  <button class="battle-chrome-button" data-bubble-settings aria-haspopup="dialog">${uiIcon('settings')}<span>Settings</span></button>
  </header><div id="battle-root"></div>${ambientBackground('battle')}<p id="status" class="status" role="alert"></p></div>`;
const root = host.querySelector<HTMLElement>('#battle-root')!;

const still = async (): Promise<never> => { throw new Error('Actions are paused on this battlefield view.'); };
const resolve = (): Promise<never> => { bridge.victory(); return new Promise<never>(() => undefined); };
const authority: BattleAuthority = { action: resolve, endTurn: resolve, nextStage: still, nextWave: still, retry: still };
const battleView = new BattleView(root, session, defaultBindings, () => undefined, async () => bridge.leave(), authority);

document.addEventListener('click', event => {
  const target = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('button') : null;
  if (!target) return;
  const route = target.matches('[data-bubble-leave]') ? bridge.leave : target.matches('[data-bubble-settings]') ? bridge.settings
    : target.matches('[data-result-continue]') ? bridge.next : target.matches('[data-result-restart]') ? bridge.retry
      : target.matches('[data-result-quit]') ? bridge.quit : null;
  if (route) { event.preventDefault(); event.stopImmediatePropagation(); route(); return; }
  if (target.dataset.battleSpeedChoice) {
    speed = parseBattleSpeed(target.dataset.battleSpeedChoice);
    applyBattleSpeed(speed);
    host.querySelectorAll<HTMLButtonElement>('[data-battle-speed-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.battleSpeedChoice === String(speed))));
  }
}, true);
window.addEventListener('pagehide', () => battleView.destroy(), { once: true });

/** Presentation-only polish layered onto the live results sheet; amounts and wording come from the live markup. */
function enhanceVictory(details: BubbleBattle): void {
  const sheet = root.querySelector<HTMLElement>('.battle-results.result-victory');
  if (!sheet || sheet.classList.contains('victory-cinematic')) return;
  sheet.classList.add('victory-cinematic');
  const state = details.session.state;
  sheet.insertAdjacentHTML('afterbegin', `<div class="victory-glory" aria-hidden="true"><span class="victory-rays"></span><span class="victory-ring"></span><span class="victory-ring late"></span>${Array.from({ length: 18 }, (_, index) =>
    `<i style="--i:${index};--a:${index * 20}deg"></i>`).join('')}</div>`);
  const title = sheet.querySelector('.battle-result-title > div');
  if (state.story) {
    const encounter = storyEncounter(state.story.storyStage);
    title?.insertAdjacentHTML('beforeend', `<p class="victory-stage">${encounter.name} · Stage ${encounter.stage} / ${storyRules.stages} · Lv. ${encounter.level}${encounter.boss ? ' · Regional boss' : ''}</p>`);
  } else {
    const level = state.enemies.find(enemy => enemy.level !== null)?.level;
    const name = document.querySelector('.battle-heading h1')?.textContent ?? '';
    if (name) title?.insertAdjacentHTML('beforeend', `<p class="victory-stage">${name}${level ? ` · Lv. ${level}` : ''}</p>`);
  }
  const callouts = [
    ...(details.firstClear ? ['<li class="callout-first">First clear · Stage-clear pay included in the totals below</li>'] : []),
    ...(details.storyBonus ? [`<li class="callout-region">First regional clear · +${formatStat(details.storyBonus.fractalis)} Prismatica · +${formatStat(details.storyBonus.lycalis)} Null-Prismatica</li>`] : []),
    ...details.captures.map(name => `<li class="callout-capture">Captured · ${name} Elemental-Devourer</li>`),
    ...details.discoveries.map(name => `<li class="callout-discovery">New in Collections · ${name}</li>`),
  ];
  if (callouts.length) sheet.querySelector('.battle-result-rewards')?.insertAdjacentHTML('beforebegin', `<ul class="victory-callouts">${callouts.join('')}</ul>`);
  sheet.querySelectorAll<HTMLElement>('.victory-callouts li').forEach((item, index) => item.style.setProperty('--n', String(index)));
  const items = Array.from(sheet.querySelectorAll<HTMLElement>('.battle-result-rewards li'));
  items.forEach((item, index) => item.style.setProperty('--i', String(index)));
  if (bridge.reduced || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  items.forEach((item, index) => {
    const amount = item.querySelector('strong');
    const target = Number(amount?.textContent?.replace(/[^0-9.]/g, ''));
    if (!amount || !Number.isFinite(target) || target <= 0) return;
    const final = amount.textContent ?? '';
    const start = performance.now() + 450 + index * 110;
    const tick = (now: number): void => {
      const progress = Math.min(1, Math.max(0, (now - start) / 900));
      amount.textContent = progress >= 1 ? final : `+${formatStat(Math.round(target * (1 - (1 - progress) ** 3)))}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    amount.textContent = '+0';
    requestAnimationFrame(tick);
    // Throttled or hidden documents may never paint; the exact live amount must always land.
    window.setTimeout(() => { amount.textContent = final; }, 450 + index * 110 + 1100);
  });
}
new MutationObserver(() => enhanceVictory(battle)).observe(root, { childList: true });
enhanceVictory(battle);
