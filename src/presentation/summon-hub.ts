import { lusterSheen, staggerIn } from './luster';
import './summon-hub.css';

/*
 * Summon hub entrance (UI audit session 4). The banner art sheens and the featured
 * Element-Bearers cascade in once per arrival at a banner: entering Summon or the
 * Special Banner Archive, or switching banners. Re-renders of the same banner (after a
 * saved draw, Settings, wallet refresh) never replay it. Static under Reduce motion.
 */

let shownView: string | null = null;

export function animateSummonHub(host: ParentNode): () => void {
  const screen = host.querySelector<HTMLElement>('.ref-summon[data-banner]');
  if (!screen) {
    shownView = null;
    return () => {};
  }
  const view = `${screen.dataset.summonView ?? 'summon'}:${screen.dataset.banner}`;
  if (view === shownView) return () => {};
  shownView = view;
  const stops: (() => void)[] = [];
  const art = screen.querySelector<HTMLElement>('.summon-banner-art');
  if (art) stops.push(lusterSheen(art, 1200));
  const featured = screen.querySelector<HTMLElement>('.summon-featured');
  if (featured) stops.push(staggerIn(featured, '[data-featured-character]', { stepMs: 45, maxSteps: 10, durationMs: 380 }));
  return () => stops.forEach(stop => stop());
}

/** Test seam: forget which banner was last shown. */
export function resetSummonHubEntrance(): void {
  shownView = null;
}
