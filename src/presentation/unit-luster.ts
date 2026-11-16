import { lusterSheen, staggerIn } from './luster';

/*
 * Element-Bearer and Conduit workshop entrance (UI audit session 6, D-466). Cards cascade in once per
 * arrival at a view: the Element-Bearer roster, Squad formation, Loadouts, a Bearer's detail tab, a
 * Bearer's Conduit loadout, the Conduit Store, Conduit Upgrade and the Event Elemental-Devourer shop.
 * Re-renders of the same view (filters, saved equips, wallet refresh) never replay it. The selected
 * Conduit's artwork glints when the player picks a different Conduit in the Store or Upgrade screen.
 * Static under Reduce motion (luster.ts). Presentation only: no save, transaction or RNG involvement.
 */

interface WorkshopView {
  key: string;
  container: HTMLElement;
  selector: string;
  /** Selected Conduit whose artwork glints on change, if this view has one. */
  selection?: { id: string; art: HTMLElement | null };
}

const cascade = { stepMs: 35, maxSteps: 10, durationMs: 340 };

function selectedConduit(screen: HTMLElement, pick: string, read: (element: HTMLElement) => string | undefined, art: string): WorkshopView['selection'] {
  const picked = screen.querySelector<HTMLElement>(pick);
  const id = picked ? read(picked) : undefined;
  return id ? { id, art: screen.querySelector<HTMLElement>(art) } : undefined;
}

function workshopView(host: ParentNode): WorkshopView | null {
  const conduitPage = host.querySelector<HTMLElement>('.conduit-loadout');
  if (conduitPage) {
    const owner = conduitPage.querySelector<HTMLElement>('[data-loadout-owner]')?.dataset.loadoutOwner ?? '';
    return { key: `loadout:${owner}`, container: conduitPage, selector: '.loadout-slot, .loadout-master, .loadout-owned-row:not([hidden])' };
  }
  const detail = host.querySelector<HTMLElement>('.ref-bearer-detail[data-character-view]');
  if (detail) {
    const name = detail.querySelector('.ref-character-identity h2')?.textContent ?? '';
    const panels = detail.querySelector<HTMLElement>('.ref-character-panels') ?? detail;
    return { key: `detail:${name}:${detail.dataset.characterView}`, container: panels, selector: '.ref-compact-kit > *, .workspace-growth-summary, .convergent-rank-panel, .character-upgrade-grid > :not([hidden]), .calamitic-ascension-entry, .upgrade-payment' };
  }
  const roster = host.querySelector<HTMLElement>('.ref-bearer-collection .ref-bearer-grid');
  if (roster) return { key: 'roster', container: roster, selector: ':scope > *' };
  const formation = host.querySelector<HTMLElement>('.squad-slots');
  if (formation) return { key: 'formation', container: formation, selector: '.squad-slot' };
  const loadouts = host.querySelector<HTMLElement>('.ref-saved-loadouts-page');
  if (loadouts) return { key: 'loadouts', container: loadouts, selector: '.saved-loadout-card, .saved-loadout-choice, .saved-loadouts-member' };
  const store = host.querySelector<HTMLElement>('.ref-conduit-store');
  if (store) return {
    key: `store:${store.dataset.storeMode ?? ''}`, container: store, selector: '.info-catalog-choice',
    selection: selectedConduit(store, '[data-store-conduit][aria-pressed="true"]', element => element.dataset.storeConduit, '.ref-store-detail .ref-store-hero'),
  };
  const upgrade = host.querySelector<HTMLElement>('.ref-conduit-upgrade');
  if (upgrade) return {
    key: 'upgrade', container: upgrade, selector: '.ref-upgrade-catalog-grid > *',
    selection: selectedConduit(upgrade, '[data-upgrade-card]', element => element.dataset.upgradeCard, '.ref-upgrade-identity .ref-store-hero'),
  };
  const devourers = host.querySelector<HTMLElement>('.event-devourer-grid');
  if (devourers) return { key: 'event-devourers', container: devourers, selector: '.event-devourer-card' };
  return null;
}

let shownView: string | null = null;
let shownSelection: string | null = null;

export function animateUnitWorkshop(host: ParentNode): () => void {
  const view = workshopView(host);
  if (!view) {
    shownView = null;
    shownSelection = null;
    return () => {};
  }
  const stops: Array<() => void> = [];
  const arrived = view.key !== shownView;
  if (arrived) {
    shownView = view.key;
    stops.push(staggerIn(view.container, view.selector, cascade));
  }
  const selection = view.selection?.id ?? null;
  if (selection !== shownSelection) {
    // Glint on a different pick within the same view; arrival already has its cascade.
    if (!arrived && selection && view.selection?.art) stops.push(lusterSheen(view.selection.art, 800));
    shownSelection = selection;
  }
  return () => stops.forEach(stop => stop());
}

/** Test seam: forget which workshop view was last shown. */
export function resetUnitWorkshopEntrance(): void {
  shownView = null;
  shownSelection = null;
}
