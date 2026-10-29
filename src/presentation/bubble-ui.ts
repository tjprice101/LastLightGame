/**
 * Bubble interface runtime (D-433). Presentation only: a persistent living
 * background, press bursts, sparkle glyphs, celebration pop-ups, skippable
 * cinematics and entrance pops. Never changes game state, RNG or saves; every
 * effect is skipped under reduced motion (setting or OS).
 */
import { reducedMotion } from './settings';
import { isRarity, rarityColors } from '../content/rarity';
import '../bubble-battle.css';

const glyphs = ['\u2726', '\u2727', '\u2736', '\u273A', '\u00B7'];
let effects: HTMLElement | null = null;
let installed = false;
let lastScreen = '';

export function bubbleMotionAllowed(): boolean {
  return !reducedMotion() && typeof document.body?.animate === 'function';
}

function layer(): HTMLElement {
  if (effects?.isConnected) return effects;
  effects = document.createElement('div');
  effects.className = 'bubble-effects';
  effects.setAttribute('aria-hidden', 'true');
  document.body.append(effects);
  return effects;
}

export function bubbleBackdrop(): string {
  return `<div class="bubble-glow"></div><div class="bubble-current current-two"></div><div class="bubble-current current-three"></div>${Array.from({ length: 12 }, (_, i) =>
    `<span class="bubble-drift depth-${i % 3}" style="--x:${(i * 19 + 4) % 97}%;--y:${(i * 31 + 18) % 95}%;--size:${25 + i * 13}px;--delay:${i * -2.7}s;--duration:${19 + i % 5 * 4}s"></span>`).join('')}${Array.from({ length: 36 }, (_, i) =>
    `<i class="bubble-spark" style="--x:${(i * 37 + 7) % 97}%;--y:${(i * 23 + 13) % 95}%;--delay:${i * -.43}s;--size:${i % 5 === 0 ? 6 : 2}px"></i>`).join('')}
    <span class="bubble-orbit orbit-a"><b>${glyphs[0]}</b></span><span class="bubble-orbit orbit-b"><b>${glyphs[1]}</b></span>${Array.from({ length: 16 }, (_, i) =>
    `<b class="bubble-twinkle" style="--x:${(i * 29 + 11) % 96}%;--y:${(i * 41 + 7) % 92}%;--delay:${i * -.83}s;--duration:${3.2 + i % 4 * .9}s;--size:${.55 + i % 3 * .3}rem">${glyphs[i % 4]}</b>`).join('')}`;
}

export function glyphBurst(x: number, y: number, count: number, reach: number, host: Element | null = null, rise = 0): void {
  if (!bubbleMotionAllowed()) return;
  for (let i = 0; i < count; i++) {
    const spark = document.createElement('b');
    spark.className = 'fx-glyph';
    spark.textContent = glyphs[i % glyphs.length];
    spark.style.left = `${x}px`; spark.style.top = `${y}px`;
    spark.style.fontSize = `${10 + Math.random() * 14}px`;
    (host ?? layer()).append(spark);
    const angle = Math.random() * Math.PI * 2, distance = reach * (.45 + Math.random() * .75);
    const dx = Math.cos(angle) * distance, dy = Math.sin(angle) * distance - rise * Math.random(), spin = Math.random() * 300 - 150;
    spark.animate([
      { opacity: 0, transform: 'translate(-50%, -50%) scale(.2) rotate(0deg)' },
      { opacity: 1, transform: `translate(calc(-50% + ${dx * .55}px), calc(-50% + ${dy * .55}px)) scale(1.15) rotate(${spin * .5}deg)`, offset: .35 },
      { opacity: 0, transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + rise * .4}px)) scale(.3) rotate(${spin}deg)` },
    ], { duration: 750 + Math.random() * 650, delay: Math.random() * 120, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'both' })
      .addEventListener('finish', () => spark.remove(), { once: true });
    window.setTimeout(() => spark.remove(), 2200);
  }
}

function pressFeedback(target: HTMLElement, event: MouseEvent): void {
  if (!bubbleMotionAllowed()) return;
  const rect = target.getBoundingClientRect();
  const x = event.detail ? event.clientX : rect.x + rect.width / 2;
  const y = event.detail ? event.clientY : rect.y + rect.height / 2;
  const host = target.closest('dialog[open]') ?? layer();
  const burst = document.createElement('div');
  burst.className = 'click-burst';
  burst.style.left = `${x}px`; burst.style.top = `${y}px`;
  burst.innerHTML = `<span class="click-ring"></span><span class="click-ring second"></span>${Array.from({ length: 12 }, (_, i) => {
    const angle = i * Math.PI / 6, distance = 35 + (i % 3) * 17;
    return `<i class="fx-particle ${i % 3 === 0 ? 'fx-star' : ''}" style="--dx:${Math.cos(angle) * distance}px;--dy:${Math.sin(angle) * distance - 12}px;--size:${i % 3 + 3}px;--spin:${i * 43}deg"></i>`;
  }).join('')}`;
  host.append(burst);
  burst.addEventListener('animationend', animation => { if (animation.target === burst) burst.remove(); });
  window.setTimeout(() => burst.remove(), 1200);
  const major = target.matches('.home-bubble, [data-bubble-primary], .primary-button, [data-button-surface="tile"]');
  glyphBurst(x, y, major ? 12 : 6, major ? 80 : 60, target.closest('dialog[open]'));
  target.animate([
    { filter: 'brightness(1)' },
    { filter: 'brightness(1.4) drop-shadow(0 0 14px var(--ui-accent))', offset: .3 },
    { filter: 'brightness(1)' },
  ], { duration: 600, easing: 'ease-out' });
}

/** Colour theme of the thing obtained: Calamitic is black/white/crimson, Omnic prismatic. */
export type FxTheme = 'calamitic' | 'prismatic';
export interface FxPalette { accent?: string; theme?: FxTheme }

const calamiticCrimson = '#e8203f';

export function rarityPalette(rarity: string | undefined, fallback?: string): FxPalette {
  if (rarity === 'Calamitic') return { accent: calamiticCrimson, theme: 'calamitic' };
  if (rarity === 'Omnic') return { accent: '#c9b3ff', theme: 'prismatic' };
  return { accent: isRarity(rarity) ? rarityColors[rarity] : fallback };
}

function applyPalette(element: HTMLElement, palette: FxPalette | undefined): void {
  if (palette?.accent) { element.style.setProperty('--accent', palette.accent); element.style.setProperty('--ui-accent', palette.accent); }
  if (palette?.theme) element.classList.add(`fx-${palette.theme}`);
}

/** Jagged lightning bolts radiating from the centre of a -100..100 SVG box. */
function lightningMarkup(waves: readonly { count: number; delay: number }[]): string {
  const jag = (angle: number, from: number, to: number, steps: number, spread: number): [number, number][] => {
    const points: [number, number][] = [];
    for (let step = 0; step <= steps; step++) {
      const radius = from + (to - from) * step / steps;
      const offset = step === 0 ? 0 : (Math.random() - .5) * spread;
      const a = angle + offset / Math.max(radius, 1);
      points.push([Math.cos(a) * radius, Math.sin(a) * radius]);
    }
    return points;
  };
  const path = (points: readonly [number, number][]) => `M${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}`;
  return `<svg class="cine-bolts" viewBox="-100 -100 200 200" aria-hidden="true">${waves.map(({ count, delay }, wave) =>
    Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2 + wave * .4 + (Math.random() - .5) * .35;
      const length = 52 + Math.random() * 46 - wave * 8;
      const main = jag(angle, 9, length, 7, 16);
      const fork = main[3 + (index % 3)];
      const branchAngle = Math.atan2(fork[1], fork[0]) + (index % 2 ? .55 : -.55);
      const start = Math.hypot(fork[0], fork[1]);
      const branch = jag(branchAngle, start, start + 14 + Math.random() * 16, 3, 9);
      const d = `${path(main)} ${path(branch)}`;
      return `<g style="--d:${delay + index * 23 + Math.round(Math.random() * 60)}ms"><path class="bolt-glow" pathLength="1" d="${d}"/><path class="bolt-core" pathLength="1" d="${d}"/></g>`;
    }).join('')).join('')}</svg>`;
}

/** Large centered text pop-up with shockwave and sparkles; purely decorative. */
export function celebrate(message: string, options: FxPalette & { subtitle?: string } = {}): void {
  if (!bubbleMotionAllowed()) return;
  const scope = document.createElement('div');
  scope.className = 'fx-scope';
  applyPalette(scope, options);
  layer().append(scope);
  const banner = document.createElement('div');
  banner.className = 'fx-banner';
  const title = document.createElement('span');
  title.textContent = `${glyphs[0]} ${message.replace(/\.$/, '')} ${glyphs[0]}`;
  banner.append(title);
  if (options.subtitle) {
    const subtitle = document.createElement('small');
    subtitle.textContent = options.subtitle;
    banner.append(subtitle);
  }
  scope.append(banner);
  const ring = document.createElement('div');
  ring.className = 'fx-wave';
  ring.style.left = `${innerWidth / 2}px`; ring.style.top = `${innerHeight * .42}px`;
  scope.append(ring);
  if (options.theme === 'calamitic') {
    const bolts = document.createElement('div');
    bolts.className = 'fx-bolts';
    bolts.innerHTML = lightningMarkup([{ count: 8, delay: 60 }]);
    scope.append(bolts);
  }
  window.setTimeout(() => scope.remove(), 2400);
  glyphBurst(innerWidth / 2, innerHeight * .42, 26, Math.min(innerWidth, 900) * .38, scope, 60);
  window.setTimeout(() => glyphBurst(innerWidth * .3, innerHeight * .5, 10, 140, scope, 80), 180);
  window.setTimeout(() => glyphBurst(innerWidth * .7, innerHeight * .5, 10, 140, scope, 80), 300);
}

export type CinematicKind = 'level' | 'evolution' | 'summon' | 'conduit' | 'chest';
export type CinematicTier = 'normal' | 'gold' | 'prismatic';
export interface CinematicSpec {
  kind: CinematicKind; eyebrow: string; title: string; subtitle?: string;
  /** Full image URLs; never request missing artwork. */
  art?: string; fromArt?: string; tier?: CinematicTier;
  /** Colours of the thing obtained; overrides the generic tier colours. */
  palette?: FxPalette;
}
const cinematicDuration: Record<CinematicKind, number> = { level: 2100, evolution: 3300, summon: 2900, conduit: 2200, chest: 2500 };

function escapeText(value: string): string {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}

export function evolutionTier(evolution: number): CinematicTier {
  return evolution >= 6 ? 'prismatic' : evolution >= 4 ? 'gold' : 'normal';
}

export function rarityTier(rarity: string | undefined): CinematicTier {
  return rarity === 'Omnic' || rarity === 'Calamitic' ? 'prismatic' : rarity === 'Legendary' || rarity === 'Epic' ? 'gold' : 'normal';
}

/** First real image URL inside already-rendered artwork markup; pending art has none. */
export function imageSource(markup: string): string | undefined {
  const match = /<img\b[^>]*\bsrc="([^"]+)"/.exec(markup);
  return match ? match[1].replace(/&amp;/g, '&') : undefined;
}

/**
 * Full-screen, tap-to-skip cinematic shown only after an outcome has saved.
 * Resolves when it finishes or is skipped; resolves immediately under reduced motion.
 */
export function cinematic(spec: CinematicSpec): Promise<void> {
  if (!bubbleMotionAllowed()) return Promise.resolve();
  return new Promise(resolve => {
    const scene = document.createElement('div');
    const calamitic = spec.palette?.theme === 'calamitic';
    scene.className = `cine cine-${spec.kind} cine-${spec.tier ?? 'normal'}${calamitic ? ' cine-calamitic' : ''}`;
    scene.setAttribute('role', 'presentation');
    applyPalette(scene, spec.palette);
    if (spec.palette?.accent && !calamitic) {
      scene.style.setProperty('--c1', spec.palette.accent);
      scene.style.setProperty('--c2', `color-mix(in srgb, ${spec.palette.accent} 40%, #fff)`);
    }
    const duration = cinematicDuration[spec.kind] + (calamitic && spec.kind === 'chest' ? 1100 : 0);
    scene.style.setProperty('--cine-duration', `${duration}ms`);
    const art = (url: string | undefined, cls: string) => url ? `<div class="cine-art ${cls}"><img src="${escapeText(url)}" alt="" draggable="false" /></div>` : '';
    const peakAt = (spec.kind === 'evolution' ? .46 : spec.kind === 'summon' ? .55 : calamitic && spec.kind === 'chest' ? .4 : .3) * duration;
    scene.style.setProperty('--peak', String(peakAt / duration));
    const storm = calamitic ? `<div class="cine-storm"><i></i><i></i><i></i></div>${lightningMarkup(spec.kind === 'chest'
      ? [{ count: 14, delay: Math.round(peakAt) }, { count: 9, delay: Math.round(peakAt + 520) }, { count: 9, delay: Math.round(peakAt + 1100) }]
      : [{ count: 10, delay: Math.round(peakAt) }])}` : '';
    scene.innerHTML = `<div class="cine-veil"></div><div class="cine-rays"></div><div class="cine-columns">${'<i></i>'.repeat(9)}</div>
      <div class="cine-rings"><i></i><i></i><i></i></div>${spec.kind === 'summon' ? '<div class="cine-orb"><i></i></div>' : ''}${storm}
      ${art(spec.fromArt, 'cine-from')}${art(spec.art, 'cine-to')}
      <div class="cine-flash"></div><div class="cine-text"><p>${escapeText(spec.eyebrow)}</p><h2>${escapeText(spec.title)}</h2>${spec.subtitle ? `<small>${escapeText(spec.subtitle)}</small>` : ''}</div><span class="cine-skip">Tap to skip</span>`;
    document.body.append(scene);
    const app = document.querySelector<HTMLElement>('#app');
    if (app) app.inert = true;
    let finished = false;
    const timers: number[] = [];
    const finish = (): void => {
      if (finished) return;
      finished = true;
      timers.forEach(timer => window.clearTimeout(timer));
      document.removeEventListener('keydown', key);
      if (app) app.inert = false;
      scene.classList.add('cine-out');
      window.setTimeout(() => scene.remove(), 380);
      resolve();
    };
    const key = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') { event.preventDefault(); finish(); }
    };
    scene.addEventListener('click', finish);
    document.addEventListener('keydown', key);
    const burstAt = (delay: number, count: number, reach: number) => timers.push(window.setTimeout(() =>
      glyphBurst(innerWidth / 2, innerHeight * .44, count, reach, scene, 40), delay));
    burstAt(peakAt, 34, Math.min(innerWidth, 1000) * .42);
    burstAt(peakAt + 220, 16, 220);
    if (calamitic && spec.kind === 'chest') { burstAt(peakAt + 560, 22, 320); burstAt(peakAt + 1140, 22, 360); }
    timers.push(window.setTimeout(finish, duration));
  });
}

const entranceTargets = ['.bubble-page-heading', '.home-bubble', '.home-story', '.home-squad', '.ref-panel', '.ref-card', '.activity-card', '.activity-group',
  '.inventory-card', '.item-tile', '.conduit-card', '.store-card', '.archive-card', '.story-stage', '.banner-card', '.summon-banner', '.reward-card',
  '.section-navigation > button', '.team-member', '.roster-card', '.friend-row', '.profile-card'].join(',');

function popEntrances(root: ParentNode): void {
  if (!bubbleMotionAllowed()) return;
  Array.from(root.querySelectorAll<HTMLElement>(entranceTargets)).slice(0, 80).forEach((element, index) => {
    element.animate([
      { opacity: 0, transform: 'translateY(18px) scale(.6)', filter: 'blur(4px)' },
      { opacity: 1, transform: 'translateY(-2px) scale(1.04)', filter: 'blur(0)', offset: .6 },
      { opacity: 1, transform: 'none', filter: 'blur(0)' },
    ], { duration: 600, delay: Math.min(index * 30, 850), easing: 'cubic-bezier(.2,1.25,.4,1)', fill: 'backwards' });
  });
}

/** Screen identity used to pop entrances only on navigation, not on in-page re-renders. */
function screenIdentity(app: HTMLElement): string {
  const screen = app.querySelector<HTMLElement>('[data-menu-screen]');
  return [screen?.dataset.menuScreen ?? (app.querySelector('.battle-screen') ? 'battle' : 'opening'),
    app.querySelector('h1')?.textContent?.trim() ?? '',
    app.querySelector('[data-team-view]')?.getAttribute('data-team-view') ?? ''].join('|');
}

let zoomKey = '';

function detailKey(detail: HTMLElement): string {
  return detail.dataset.capturedCopy ?? detail.querySelector('[data-reference-name]')?.textContent?.trim() ?? '';
}

function setZoom(detail: HTMLElement, open: boolean): void {
  detail.dataset.zoom = open ? 'open' : 'closed';
  const panels = detail.querySelector<HTMLElement>('.ref-character-panels');
  const stage = detail.querySelector<HTMLElement>('.ref-character-header');
  if (panels) panels.inert = !open;
  if (stage) stage.inert = open;
  zoomKey = open ? detailKey(detail) : '';
}

/** D-433 Team orbit: portrait-centred stage, sub-menus orbit as bubbles and zoom into a detail panel. */
function orbitTeamDetail(app: HTMLElement): void {
  app.querySelectorAll<HTMLElement>('.ref-bearer-detail:not([data-orbit])').forEach(detail => {
    detail.dataset.orbit = '';
    const panels = detail.querySelector<HTMLElement>('.ref-character-panels');
    if (!panels) return;
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'bubble-zoom-back';
    back.innerHTML = '<span aria-hidden="true">&larr;</span> Portrait';
    back.setAttribute('aria-label', 'Back to portrait');
    back.addEventListener('click', () => {
      setZoom(detail, false);
      detail.querySelector<HTMLElement>('.ref-character-submenus button[aria-pressed="true"]')?.focus({ preventScroll: true });
    });
    panels.before(back);
    setZoom(detail, zoomKey !== '' && zoomKey === detailKey(detail));
    detail.querySelectorAll<HTMLButtonElement>('.ref-character-submenus button').forEach(button => button.addEventListener('click', () => {
      if (button.matches('[data-open-loadout], [data-character-tab="equipment"]')) return;
      if (detail.dataset.zoom === 'open') return;
      const rect = button.getBoundingClientRect();
      if (bubbleMotionAllowed()) {
        const portal = document.createElement('div');
        portal.className = 'bubble-portal';
        portal.setAttribute('aria-hidden', 'true');
        portal.style.left = `${rect.left + rect.width / 2}px`;
        portal.style.top = `${rect.top + rect.height / 2}px`;
        layer().append(portal);
        window.setTimeout(() => portal.remove(), 700);
      }
      detail.style.setProperty('--zoom-x', `${rect.left + rect.width / 2 - detail.getBoundingClientRect().left}px`);
      detail.style.setProperty('--zoom-y', `${rect.top + rect.height / 2 - detail.getBoundingClientRect().top}px`);
      setZoom(detail, true);
      back.focus({ preventScroll: true });
    }));
  });
}

export function installBubbleUi(app: HTMLElement): void {
  if (installed) return;
  installed = true;
  const backdrop = document.createElement('div');
  backdrop.className = 'bubble-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  backdrop.innerHTML = bubbleBackdrop();
  document.body.prepend(backdrop);
  layer();
  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target.closest<HTMLElement>('button, [role="button"], summary, a[href]') : null;
    if (!target || target.matches(':disabled') || target.closest('.cine, .battle-field, .battle-units, #battle-root .battle-unit')) return;
    pressFeedback(target, event);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || document.querySelector('dialog[open], .cine')) return;
    const open = app.querySelector<HTMLElement>('.ref-bearer-detail[data-zoom="open"]');
    if (!open) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    open.querySelector<HTMLButtonElement>(':scope > .bubble-zoom-back, .bubble-zoom-back')?.click();
  }, true);
  const observer = new MutationObserver(() => {
    orbitTeamDetail(app);
    const identity = screenIdentity(app);
    if (identity === lastScreen) return;
    lastScreen = identity;
    popEntrances(app);
  });
  observer.observe(app, { childList: true });
  const battleObserver = new MutationObserver(() => {
    const battle = Boolean(app.querySelector('.battle-screen'));
    document.body.classList.toggle('bubble-battle', battle);
    if (battle) enhanceVictory(app);
    else enhanceSkillCards(app);
  });
  battleObserver.observe(app, { childList: true, subtree: true });
}

function plainSummary(text: string): string {
  return text.replace(/\[([^\]]+)\]/g, '$1').replace(/\s+/g, ' ').trim();
}

/** Mock-up skill cards: echo each ability's own dialog effect and cost text inside its (unchanged) details button. */
function enhanceSkillCards(app: HTMLElement): void {
  app.querySelectorAll<HTMLButtonElement>('.ref-ability-buttons > button[data-information]:not([data-bubble-skill])').forEach(button => {
    button.dataset.bubbleSkill = '';
    const article = document.getElementById(button.dataset.information ?? '')?.querySelector('article');
    if (!article) return;
    const paragraphs = Array.from(article.querySelectorAll<HTMLElement>(':scope > p'));
    const effect = paragraphs.find(p => !p.className);
    const cost = article.querySelector<HTMLElement>(':scope > .hub-cost') ?? paragraphs.filter(p => !p.className).at(-1);
    const copy = button.querySelector('span');
    if (!copy || !effect) return;
    const summary = document.createElement('span');
    summary.className = 'bubble-skill-summary';
    summary.setAttribute('aria-hidden', 'true');
    summary.textContent = plainSummary(effect.textContent ?? '');
    copy.append(summary);
    if (cost && cost !== effect) {
      const costLine = document.createElement('span');
      costLine.className = 'bubble-skill-cost';
      costLine.setAttribute('aria-hidden', 'true');
      costLine.textContent = plainSummary(cost.textContent ?? '');
      copy.append(costLine);
    }
  });
}

/** Presentation-only glory layered onto the live victory sheet; every amount and label stays the live markup's. */
function enhanceVictory(app: HTMLElement): void {
  const sheet = app.querySelector<HTMLElement>('.battle-results.result-victory:not(.victory-cinematic)');
  if (!sheet) return;
  sheet.classList.add('victory-cinematic');
  sheet.insertAdjacentHTML('afterbegin', `<div class="victory-glory" aria-hidden="true"><span class="victory-rays"></span><span class="victory-ring"></span><span class="victory-ring late"></span>${Array.from({ length: 18 }, (_, index) =>
    `<i style="--i:${index};--a:${index * 20}deg"></i>`).join('')}</div>`);
  const items = Array.from(sheet.querySelectorAll<HTMLElement>('.battle-result-rewards li'));
  items.forEach((item, index) => item.style.setProperty('--i', String(index)));
  if (!bubbleMotionAllowed()) return;
  items.forEach((item, index) => {
    const amount = item.querySelector('strong');
    const final = amount?.textContent ?? '';
    const digits = final.replace(/[^0-9]/g, '');
    const target = Number(digits);
    if (!amount || !digits || !Number.isSafeInteger(target) || target <= 0 || /[.,]\d*[a-z]/i.test(final)) return;
    const prefix = final.trim().startsWith('+') ? '+' : '';
    const start = performance.now() + 450 + index * 110;
    const tick = (now: number): void => {
      if (!amount.isConnected) return;
      const progress = Math.min(1, Math.max(0, (now - start) / 900));
      amount.textContent = progress >= 1 ? final : `${prefix}${Math.round(target * (1 - (1 - progress) ** 3)).toLocaleString('en-US')}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    amount.textContent = `${prefix}0`;
    requestAnimationFrame(tick);
    // Hidden documents may never paint; the exact live amount must always land.
    window.setTimeout(() => { amount.textContent = final; }, 450 + index * 110 + 1100);
  });
}
