import { lusterSheen, staggerIn } from './luster';

/*
 * Play hub entrance (UI audit session 7, D-468). The visible activity's panels cascade in and its banner
 * art glints once per arrival: opening Play, choosing another activity in the rail, another location or
 * mode, Normal/Calamity, a Story region, or switching Stages/World map. Re-renders that keep the same
 * activity (wallet refresh, saved stage choice) never replay it. Static under Reduce motion (luster.ts).
 * Presentation only: no save, transaction, battle or RNG involvement.
 */

interface PlayView {
  key: string;
  container: HTMLElement;
  selector: string;
  art: HTMLElement | null;
}

const cascade = { stepMs: 40, maxSteps: 8, durationMs: 360 };
const ACTIVITY_PARTS = '.activity-banner, .training-hero, .activity-facts > div, .item-showcase, .enemy-strength, .war-recruit-note, .activity-entry, .training-entry, .training-summary, .calamity-tier';

function storyView(group: HTMLElement): PlayView | null {
  const main = group.querySelector<HTMLElement>('.ref-story-main');
  if (!main) return null;
  const region = main.querySelector('[data-story-region-heading] h2')?.textContent ?? '';
  const mode = main.querySelector<HTMLElement>('[data-story-view][aria-pressed="true"]')?.dataset.storyView ?? '';
  const map = mode === 'map';
  return {
    key: `story:${region}:${mode}`,
    container: main,
    selector: map ? '.ref-map-node' : '.story-region-panel:not([hidden]) .mono-story-stage-row, .story-region-panel:not([hidden]) .story-boss-preview',
    art: map ? main.querySelector<HTMLElement>('.ref-world-map') : null,
  };
}

function playView(host: ParentNode): PlayView | null {
  const group = host.querySelector<HTMLElement>('.gameplay-hub .activity-group:not([hidden])');
  if (!group) return null;
  if (group.id === 'gameplay-story') return storyView(group);
  const cards = Array.from(group.querySelectorAll<HTMLElement>('.activity-card'));
  const card = cards.find(entry => !entry.hidden);
  if (!card) return null;
  const difficulty = card.querySelector<HTMLElement>('[data-difficulty][aria-selected="true"]')?.dataset.difficulty ?? '';
  const panel = card.querySelector<HTMLElement>('.activity-difficulty > [role="tabpanel"]:not([hidden])') ?? card;
  return {
    key: `${group.id}:${cards.indexOf(card)}:${difficulty}`,
    container: panel,
    selector: ACTIVITY_PARTS,
    art: panel.querySelector<HTMLElement>('.activity-banner, .training-hero'),
  };
}

let shownView: string | null = null;
let stops: Array<() => void> = [];
const boundHubs = new WeakSet<HTMLElement>();

function run(host: ParentNode): void {
  const view = playView(host);
  if (!view) { shownView = null; return; }
  if (view.key === shownView) return;
  shownView = view.key;
  stops.forEach(stop => stop());
  stops = [staggerIn(view.container, view.selector, cascade)];
  if (view.art) stops.push(lusterSheen(view.art, 900));
}

/** Call after every app render; binds the hub's in-place switches once per rendered hub. */
export function animatePlayHub(host: ParentNode): void {
  const hub = host.querySelector<HTMLElement>('.gameplay-hub');
  if (!hub) { shownView = null; return; }
  run(host);
  if (boundHubs.has(hub)) return;
  boundHubs.add(hub);
  // Rail, location, mode and Story controls switch panels in place; read the result after their handlers.
  hub.addEventListener('click', () => { queueMicrotask(() => { if (hub.isConnected) run(host); }); });
}

/** Test seam: forget which Play view was last shown. */
export function resetPlayHubEntrance(): void {
  shownView = null;
  stops.forEach(stop => stop());
  stops = [];
}
