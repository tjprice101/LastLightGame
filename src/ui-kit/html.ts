/**
 * Interface kit markup (D-497): the string helpers every rebuilt screen is composed from, so screens
 * cannot drift apart. They are pure and know nothing about the game: `Html` arguments are trusted markup
 * built by the caller, and anything typed by a player goes through `text()` first.
 */
import { type ElementId } from '../content/activities';

export type Html = string;
export type Accent = ElementId | 'gild';
export type CardState = 'actionable' | 'selected' | 'locked';

export function text(value: string): Html {
  return value.replace(/[&<>"']/g, char => `&#${char.charCodeAt(0)};`);
}

const attr = (name: string, value: string | undefined): string => value === undefined ? '' : ` ${name}="${text(value)}"`;
const raw = (attrs: string | undefined): string => attrs ? ` ${attrs.trim()}` : '';

export interface ScreenOptions {
  /** Identifies the screen for styling and for arrival; usually the menu page. */
  page: string;
  title: string;
  /** One line of flavour under the title. Never mechanics. */
  flavour?: string;
  /** Controls at the top right of the heading. */
  actions?: Html;
  body: Html;
  /** True when the player has just arrived, so the panels settle in. */
  arrive?: boolean;
  accent?: Accent;
}

/** A whole screen. Owns the page's single focusable `<h1>`. */
export function screen(o: ScreenOptions): Html {
  return `<section class="lk-screen" data-menu-screen="${text(o.page)}"${o.arrive ? ' data-arrive' : ''}${attr('data-accent', o.accent)}>
  <header class="lk-screen-head">
    <div class="lk-screen-heading"><h1 class="lk-title" tabindex="-1">${text(o.title)}</h1>${o.flavour ? `<p class="lk-flavour">${text(o.flavour)}</p>` : ''}</div>
    ${o.actions ? `<div class="lk-screen-actions">${o.actions}</div>` : ''}
  </header>
  <div class="lk-screen-body">${o.body}</div>
</section>`;
}

export interface PanelOptions { title?: string; aside?: Html; filigree?: boolean; accent?: Accent; attrs?: string }

/** The glass surface. Group related content in one; never nest panels. */
export function panel(body: Html, o: PanelOptions = {}): Html {
  const head = o.title || o.aside
    ? `<header class="lk-panel-head">${o.title ? `<h2 class="lk-panel-title">${text(o.title)}</h2>` : ''}${o.aside ? `<span class="lk-panel-aside">${o.aside}</span>` : ''}</header>`
    : '';
  return `<section class="lk-panel"${o.filigree ? ' data-filigree' : ''}${attr('data-accent', o.accent)}${raw(o.attrs)}>${head}${body}</section>`;
}

export interface CardOptions {
  title?: string;
  body: Html;
  aside?: Html;
  accent?: Accent;
  state?: CardState;
  /** `button` makes the whole card one control; give it its `data-*` hooks through `attrs`. */
  as?: 'article' | 'button' | 'li';
  attrs?: string;
  disabled?: boolean;
}

export function card(o: CardOptions): Html {
  const tag = o.as ?? 'article';
  const head = o.title || o.aside
    ? `<span class="lk-card-head">${o.title ? `<strong class="lk-card-title">${text(o.title)}</strong>` : ''}${o.aside ? `<span class="lk-card-aside">${o.aside}</span>` : ''}</span>`
    : '';
  const inner = tag === 'button' ? 'span' : 'div';
  return `<${tag} class="lk-card"${tag === 'button' ? ' type="button"' : ''}${o.disabled && tag === 'button' ? ' disabled' : ''}${attr('data-state', o.state)}${attr('data-accent', o.accent)}${raw(o.attrs)}>${head}<${inner} class="lk-card-body">${o.body}</${inner}></${tag}>`;
}

/** A responsive grid of cards. `min` is the narrowest a column may get, in pixels. */
export function grid(items: readonly Html[], o: { min?: 180 | 220 | 280 | 340; as?: 'div' | 'ul'; attrs?: string } = {}): Html {
  const tag = o.as ?? 'div';
  return `<${tag} class="lk-grid"${o.min ? ` style="--lk-min:${o.min}px"` : ''}${raw(o.attrs)}>${items.join('')}</${tag}>`;
}

export interface StatOptions { label: string; value: Html; sub?: Html; tone?: 'gain' | 'loss' | 'accent'; id?: string }

/** A label over an exact value. `value` is already formatted; the kit never abbreviates a number. */
export function stat(o: StatOptions): Html {
  return `<div class="lk-stat"${attr('data-tone', o.tone)}><dt class="lk-stat-label">${text(o.label)}</dt><dd class="lk-stat-value"${attr('id', o.id)}>${o.value}</dd>${o.sub ? `<dd class="lk-stat-sub">${o.sub}</dd>` : ''}</div>`;
}

export function statRow(stats: readonly Html[], attrs?: string): Html {
  return `<dl class="lk-stats"${raw(attrs)}>${stats.join('')}</dl>`;
}

export interface ButtonOptions {
  label: Html;
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
  icon?: Html;
  attrs?: string;
  disabled?: boolean;
  submit?: boolean;
}

export function button(o: ButtonOptions): Html {
  return `<button class="lk-button" type="${o.submit ? 'submit' : 'button'}" data-variant="${o.variant ?? 'secondary'}"${o.disabled ? ' disabled' : ''}${raw(o.attrs)}>${o.icon ?? ''}<span>${o.label}</span></button>`;
}

/** A round button for an icon alone. `label` is its accessible name and is required. */
export function iconButton(o: { icon: Html; label: string; attrs?: string; disabled?: boolean }): Html {
  return `<button class="lk-icon-button" type="button" aria-label="${text(o.label)}"${o.disabled ? ' disabled' : ''}${raw(o.attrs)}>${o.icon}</button>`;
}

export interface SegmentOption { label: Html; attrs: string; selected?: boolean; disabled?: boolean }

/** Tabs, filters and pickers. Each option reports its state with `aria-pressed`. */
export function segmented(o: { label: string; options: readonly SegmentOption[]; attrs?: string }): Html {
  return `<div class="lk-seg" role="group" aria-label="${text(o.label)}"${raw(o.attrs)}>${o.options.map(option =>
    `<button type="button" aria-pressed="${option.selected ? 'true' : 'false'}"${option.disabled ? ' disabled' : ''}${raw(option.attrs)}>${option.label}</button>`).join('')}</div>`;
}

export function chip(label: Html, o: { on?: boolean; accent?: Accent; tone?: 'gain' | 'loss' } = {}): Html {
  return `<span class="lk-chip"${o.on ? ' data-on' : ''}${attr('data-accent', o.accent)}${attr('data-tone', o.tone)}>${label}</span>`;
}

/** Progress toward a known maximum. `label` shows the exact figures beside the bar. */
export function bar(o: { value: number; max: number; ariaLabel: string; label?: Html; accent?: Accent }): Html {
  if (!(o.max > 0) || !Number.isFinite(o.value)) throw new Error('A bar needs a finite value and a positive maximum.');
  const fill = Math.min(1, Math.max(0, o.value / o.max));
  return `<div class="lk-bar"${attr('data-accent', o.accent)}>${o.label ? `<span class="lk-bar-label">${o.label}</span>` : ''}<div class="lk-bar-track" role="meter" aria-label="${text(o.ariaLabel)}" aria-valuemin="0" aria-valuemax="${o.max}" aria-valuenow="${Math.min(o.max, Math.max(0, o.value))}"><i class="lk-bar-fill" style="--lk-fill:${fill}"></i></div></div>`;
}

export function divider(): Html {
  return '<hr class="lk-divider">';
}
