/**
 * Bubble interface runtime (D-433). Presentation only: a persistent living
 * background, press bursts, sparkle glyphs, celebration pop-ups, skippable
 * cinematics and entrance pops. Never changes game state, RNG or saves; every
 * effect is skipped under reduced motion (setting or OS).
 */
import { reducedMotion } from './settings';
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

/** Large centered text pop-up with shockwave and sparkles; purely decorative. */
export function celebrate(message: string): void {
  if (!bubbleMotionAllowed()) return;
  const host = layer();
  const banner = document.createElement('div');
  banner.className = 'fx-banner';
  banner.textContent = `${glyphs[0]} ${message.replace(/\.$/, '')} ${glyphs[0]}`;
  host.append(banner);
  const ring = document.createElement('div');
  ring.className = 'fx-wave';
  ring.style.left = `${innerWidth / 2}px`; ring.style.top = `${innerHeight * .42}px`;
  host.append(ring);
  window.setTimeout(() => { banner.remove(); ring.remove(); }, 2400);
  glyphBurst(innerWidth / 2, innerHeight * .42, 26, Math.min(innerWidth, 900) * .38, null, 60);
  window.setTimeout(() => glyphBurst(innerWidth * .3, innerHeight * .5, 10, 140, null, 80), 180);
  window.setTimeout(() => glyphBurst(innerWidth * .7, innerHeight * .5, 10, 140, null, 80), 300);
}

export type CinematicKind = 'level' | 'evolution' | 'summon' | 'conduit' | 'chest';
export type CinematicTier = 'normal' | 'gold' | 'prismatic';
export interface CinematicSpec {
  kind: CinematicKind; eyebrow: string; title: string; subtitle?: string;
  /** Full image URLs; never request missing artwork. */
  art?: string; fromArt?: string; tier?: CinematicTier;
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
    scene.className = `cine cine-${spec.kind} cine-${spec.tier ?? 'normal'}`;
    scene.setAttribute('role', 'presentation');
    const duration = cinematicDuration[spec.kind];
    scene.style.setProperty('--cine-duration', `${duration}ms`);
    const art = (url: string | undefined, cls: string) => url ? `<div class="cine-art ${cls}"><img src="${escapeText(url)}" alt="" draggable="false" /></div>` : '';
    scene.innerHTML = `<div class="cine-veil"></div><div class="cine-rays"></div><div class="cine-columns">${'<i></i>'.repeat(9)}</div>
      <div class="cine-rings"><i></i><i></i><i></i></div>${spec.kind === 'summon' ? '<div class="cine-orb"><i></i></div>' : ''}
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
    const peak = spec.kind === 'evolution' ? .46 : spec.kind === 'summon' ? .55 : .3;
    const burstAt = (delay: number, count: number, reach: number) => timers.push(window.setTimeout(() =>
      glyphBurst(innerWidth / 2, innerHeight * .44, count, reach, scene, 40), delay));
    burstAt(duration * peak, 34, Math.min(innerWidth, 1000) * .42);
    burstAt(duration * peak + 220, 16, 220);
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

let playGroup = '';

function activeGroupId(hub: HTMLElement): string {
  const id = location.hash.slice(1);
  return id && hub.querySelector(`.activity-group#${CSS.escape(id)}`) ? id : '';
}

function setPlayZoom(hub: HTMLElement, group: string): void {
  hub.dataset.zoom = group ? 'open' : 'closed';
  const board = hub.querySelector<HTMLElement>('.bubble-play-board');
  if (board) board.inert = Boolean(group);
  hub.querySelectorAll<HTMLElement>(':scope > .ref-activity-sidebar, :scope > .activity-group').forEach(element => { element.inert = !group; });
  playGroup = group;
}

/** Bubble card art: the group's own banner/scenery, never another activity's image. */
function groupArt(group: HTMLElement): string {
  const image = group.querySelector<HTMLImageElement>('.ref-world-map-canvas, img.dungeon-banner, .activity-banner img, img.training-hero, .training-hero img, img');
  return image?.currentSrc || image?.getAttribute('src') || '';
}

function boardCard(link: HTMLAnchorElement, group: HTMLElement, index: number): HTMLButtonElement {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'bubble-play-card';
  card.dataset.playGroup = group.id;
  card.style.setProperty('--delay', `${-index * 1.3}s`);
  const art = groupArt(group);
  const choices = group.querySelectorAll('[data-activity-choice]').length;
  const name = link.querySelector('strong')?.textContent?.trim() ?? group.querySelector('h2')?.textContent?.trim() ?? '';
  const detail = link.querySelector('small')?.textContent?.trim() ?? '';
  const loot = choices > 1 ? [] : Array.from(group.querySelectorAll<HTMLImageElement>('.item-showcase img')).slice(0, 5);
  card.innerHTML = `${art ? `<span class="bubble-play-art" aria-hidden="true"><img src="${escapeText(art)}" alt="" loading="lazy" decoding="async"></span>` : ''}
    <span class="bubble-play-copy"><strong>${escapeText(name)}</strong><small>${escapeText(detail)}</small>
    ${choices > 1 ? `<em>${choices} activities</em>` : ''}
    ${loot.length ? `<span class="bubble-play-loot" aria-hidden="true">${loot.map(image => `<img src="${escapeText(image.getAttribute('src') ?? '')}" alt="">`).join('')}</span>` : ''}</span>`;
  card.setAttribute('aria-label', `${name}. ${detail}${choices > 1 ? `. ${choices} activities` : ''}`);
  card.addEventListener('click', () => {
    const rect = card.getBoundingClientRect();
    if (bubbleMotionAllowed()) {
      const portal = document.createElement('div');
      portal.className = 'bubble-portal';
      portal.setAttribute('aria-hidden', 'true');
      portal.style.left = `${rect.left + rect.width / 2}px`;
      portal.style.top = `${rect.top + rect.height / 2}px`;
      layer().append(portal);
      window.setTimeout(() => portal.remove(), 700);
    }
    const hub = card.closest<HTMLElement>('.gameplay-hub');
    if (!hub) return;
    hub.style.setProperty('--zoom-x', `${rect.left + rect.width / 2 - hub.getBoundingClientRect().left}px`);
    hub.style.setProperty('--zoom-y', `${rect.top + rect.height / 2 - hub.getBoundingClientRect().top}px`);
    hub.dataset.zoomAnimate = '';
    link.click();
    setPlayZoom(hub, group.id);
  });
  return card;
}

/** D-433 Play board: live activity categories as grouped bubble cards that zoom into the existing detail. */
function bubblePlayBoard(app: HTMLElement): void {
  app.querySelectorAll<HTMLElement>('.gameplay-hub:not([data-board])').forEach(hub => {
    hub.dataset.board = '';
    const board = document.createElement('nav');
    board.className = 'bubble-play-board';
    board.setAttribute('aria-label', 'Activities');
    hub.querySelectorAll<HTMLElement>('.ref-activity-section').forEach(section => {
      const heading = section.querySelector('h3')?.textContent?.trim() ?? '';
      const group = document.createElement('section');
      group.className = 'bubble-play-group';
      group.dataset.section = heading.toLowerCase().replace(/[^a-z]+/g, '-');
      group.innerHTML = `<h2>${escapeText(heading)}</h2><div class="bubble-play-cards"></div>`;
      const cards = group.querySelector('.bubble-play-cards')!;
      section.querySelectorAll<HTMLAnchorElement>('a[href^="#gameplay-"]').forEach(link => {
        const target = hub.querySelector<HTMLElement>(`.activity-group${link.hash}`);
        if (target) cards.append(boardCard(link, target, board.querySelectorAll('.bubble-play-card').length + cards.children.length));
      });
      if (cards.children.length) board.append(group);
    });
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'bubble-zoom-back';
    back.innerHTML = '<span aria-hidden="true">&larr;</span> All activities';
    back.setAttribute('aria-label', 'Back to all activities');
    back.addEventListener('click', () => {
      const previous = playGroup;
      history.replaceState(null, '', `${location.pathname}${location.search}`);
      delete hub.dataset.zoomAnimate;
      setPlayZoom(hub, '');
      hub.querySelector<HTMLElement>(`.bubble-play-card[data-play-group="${CSS.escape(previous)}"]`)?.focus({ preventScroll: true });
    });
    hub.prepend(board);
    (hub.querySelector('.ref-activity-sidebar') ?? hub).prepend(back);
    const group = activeGroupId(hub);
    if (group !== playGroup || !group) delete hub.dataset.zoomAnimate;
    setPlayZoom(hub, group);
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
    const open = app.querySelector<HTMLElement>('.ref-bearer-detail[data-zoom="open"], .gameplay-hub[data-zoom="open"]');
    if (!open) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    open.querySelector<HTMLButtonElement>(':scope > .bubble-zoom-back, .bubble-zoom-back')?.click();
  }, true);
  const observer = new MutationObserver(() => {
    orbitTeamDetail(app);
    bubblePlayBoard(app);
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
  });
  battleObserver.observe(app, { childList: true, subtree: true });
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
