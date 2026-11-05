import {
  acquisitionKey, acquisitionView, type AcquisitionHoldings, type AcquisitionMarkers, type AcquisitionKind,
} from '../game/acquisition-markers';
import './acquisition-markers.css';

const itemAttributes: Record<string, AcquisitionKind> = {
  'data-inventory-material': 'material', 'data-showcase-item': 'material', 'data-market-material': 'material',
  'data-inventory-conduit': 'conduit', 'data-archive-conduit': 'conduit', 'data-loadout-conduit': 'conduit',
  'data-store-conduit': 'conduit', 'data-select-upgrade-conduit': 'conduit', 'data-upgrade-card': 'conduit',
  'data-loadout-rule': 'conduit', 'data-inventory-master': 'master', 'data-archive-master': 'master',
  'data-loadout-master-rule': 'master', 'data-acquisition-master': 'master',
  'data-team-detail': 'character', 'data-team-character': 'character', 'data-reference-member': 'character',
  'data-acquisition-character': 'character', 'data-archive-character': 'character',
  'data-owned-character': 'character', 'data-owned-capture': 'form',
  'data-team-capture-detail': 'form', 'data-team-capture': 'form', 'data-captured-copy': 'form',
  'data-acquisition-form': 'form',
  'data-creature': 'form',
};
const itemSelector = Object.keys(itemAttributes).map(attr => `[${attr}]`).join(',');
export interface AcquisitionMarkerBinding {
  account: () => AcquisitionHoldings;
  acknowledge: (keys: readonly string[]) => Promise<AcquisitionMarkers>;
  error: (message: string) => void;
}
function itemKey(node: HTMLElement, holdings: AcquisitionHoldings): string | undefined {
  for (const [attribute, kind] of Object.entries(itemAttributes)) {
    const id = node.getAttribute(attribute);
    if (!id) continue;
    if (kind === 'form' && id.startsWith('capture:')) {
      const copy = (holdings.capturedCharacters as readonly { instanceId?: string; creatureId: string }[] | undefined)
        ?.find(entry => entry.instanceId === id);
      if (copy) return acquisitionKey('form', copy.creatureId);
      continue;
    }
    if (kind === 'character' && id.startsWith('capture:')) continue;
    if (kind === 'material') {
      const canonical = id.includes('-') ? id : `${id}-common`;
      return acquisitionKey(kind, canonical);
    }
    return acquisitionKey(kind, id);
  }
  return undefined;
}
function routeKinds(node: HTMLElement): AcquisitionKind[] {
  const page = node.dataset.page;
  const view = node.dataset.teamView ?? node.dataset.teamArea ?? node.dataset.characterCategory;
  const gallery = node.dataset.archiveGallery;
  if (view === 'bearers') return ['character'];
  if (view === 'creatures') return ['form'];
  if (node.dataset.inventoryTab === 'materials' || node.dataset.marketCategory === 'normal' || node.dataset.marketCategory === 'event') return ['material'];
  if (node.dataset.inventoryTab === 'conduits') return ['conduit', 'master'];
  if (gallery === 'characters') return ['character'];
  if (gallery === 'creatures') return ['form'];
  if (gallery === 'conduits') return ['conduit', 'master'];
  if (['team', 'character', 'squad'].includes(page ?? '')) return ['character', 'form', 'conduit', 'master'];
  if (['inventory'].includes(page ?? '')) return ['material', 'conduit', 'master'];
  if (['collections', 'archives'].includes(page ?? '')) return ['character', 'form', 'conduit', 'master'];
  if (['stores'].includes(page ?? '')) return ['material', 'conduit'];
  if (['conduit-store', 'conduit-upgrade'].includes(page ?? '')) return ['conduit'];
  if (node.hasAttribute('data-menu-toggle')) return ['material', 'character', 'form', 'conduit', 'master'];
  if (view === 'equipment' || node.dataset.teamTab === 'equipment' || node.dataset.characterTab === 'equipment' ||
    node.dataset.characterSectionTab === 'equipment') return ['conduit', 'master'];
  return [];
}
function decorate(node: HTMLElement, keys: readonly string[], item: readonly string[]): void {
  const current = node.dataset.newAcquisition;
  const signature = keys.join('|');
  if (!signature) {
    if (!current) return;
    delete node.dataset.newAcquisition;
    delete node.dataset.newAcquisitionItem;
    node.querySelectorAll(':scope > .new-acquisition-mark,:scope > .new-acquisition-accessible').forEach(mark => mark.remove());
    if (node.dataset.acquisitionTabindex === 'added') { node.removeAttribute('tabindex'); delete node.dataset.acquisitionTabindex; }
    if (node.dataset.acquisitionDescription) {
      const id = node.dataset.acquisitionDescription;
      const descriptions = (node.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(value => value && value !== id);
      if (descriptions.length) node.setAttribute('aria-describedby', descriptions.join(' '));
      else node.removeAttribute('aria-describedby');
      delete node.dataset.acquisitionDescription;
    }
    return;
  }
  node.dataset.newAcquisition = signature;
  if (item.length) node.dataset.newAcquisitionItem = item.join('|');
  else delete node.dataset.newAcquisitionItem;
  if (current) {
    const text = node.querySelector(':scope > .new-acquisition-accessible');
    if (text) text.textContent = item.length ? 'Newly acquired. Hover, focus or tap to acknowledge.' : 'Newly acquired items in this area.';
    return;
  }
  const mark = document.createElement('span'); mark.className = 'new-acquisition-mark'; mark.setAttribute('aria-hidden', 'true');
  const text = document.createElement('span'); text.className = 'new-acquisition-accessible';
  text.textContent = item.length ? 'Newly acquired. Hover, focus or tap to acknowledge.' : 'Newly acquired items in this area.';
  text.id = `new-acquisition-${++descriptionSequence}`;
  node.dataset.acquisitionDescription = text.id;
  node.setAttribute('aria-describedby', [node.getAttribute('aria-describedby'), text.id].filter(Boolean).join(' '));
  if (item.length && !node.matches('button,a,input,select,textarea,[tabindex]')) {
    node.tabIndex = 0; node.dataset.acquisitionTabindex = 'added';
  }
  node.append(mark, text);
}
let descriptionSequence = 0;
export function bindAcquisitionMarkers(root: HTMLElement, binding: AcquisitionMarkerBinding): () => void {
  let disposed = false;
  let local: AcquisitionMarkers | undefined;
  let active: Promise<void> | undefined;
  const waiting = new Set<string>();
  const paint = () => {
    if (disposed) return;
    const account = binding.account();
    const markers = acquisitionView(account);
    for (const [key, seen] of Object.entries(local ?? {})) if (seen || !Object.hasOwn(markers, key)) markers[key] = seen;
    const unread = Object.entries(markers).filter(([, seen]) => !seen).map(([key]) => key);
    root.querySelectorAll<HTMLElement>(`${itemSelector},[data-page],[data-team-view],[data-team-area],[data-character-category],[data-inventory-tab],[data-market-category],[data-archive-gallery],[data-team-tab],[data-character-tab],[data-character-section-tab],[data-menu-toggle],[data-new-acquisition]`)
      .forEach(node => {
        const key = node.matches(itemSelector) ? itemKey(node, account) : undefined;
        const itemUnread = key ? unread.filter(entry => entry === key) : [];
        const routeUnread = unread.filter(entry => routeKinds(node).includes(entry.split(':')[0] as AcquisitionKind));
        decorate(node, [...new Set([...itemUnread, ...routeUnread])], itemUnread);
      });
  };
  const flush = () => {
    if (active || !waiting.size || disposed) return;
    const keys = [...waiting]; waiting.clear();
    active = binding.acknowledge(keys).then(markers => { local = markers; paint(); })
      .catch(error => { binding.error(error instanceof Error ? error.message : 'New-item acknowledgement failed.'); })
      .finally(() => { active = undefined; if (waiting.size) flush(); });
  };
  const acknowledge = (event: Event) => {
    if (!(event.target instanceof Element)) return;
    const item = event.target.closest<HTMLElement>('[data-new-acquisition-item]');
    if (!item || !root.contains(item)) return;
    if (event instanceof MouseEvent && event.type === 'mouseover' && event.relatedTarget instanceof Node && item.contains(event.relatedTarget)) return;
    for (const key of (item.dataset.newAcquisitionItem ?? '').split('|').filter(Boolean)) waiting.add(key);
    flush();
  };
  let scheduled = false;
  const observer = new MutationObserver(records => {
    // Decorations must not recursively repaint themselves.
    if (!records.some(record => Array.from(record.addedNodes).some(node =>
      node instanceof Element && !node.matches('.new-acquisition-mark,.new-acquisition-accessible')) ||
      Array.from(record.removedNodes).some(node => node instanceof Element && !node.matches('.new-acquisition-mark,.new-acquisition-accessible')))) return;
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => { scheduled = false; paint(); });
  });
  observer.observe(root, { childList: true, subtree: true });
  root.addEventListener('mouseover', acknowledge);
  root.addEventListener('focusin', acknowledge);
  root.addEventListener('pointerdown', acknowledge);
  root.addEventListener('click', acknowledge);
  root.addEventListener('last-light-acquisition-change', paint);
  paint();
  return () => {
    disposed = true; observer.disconnect();
    root.removeEventListener('mouseover', acknowledge); root.removeEventListener('focusin', acknowledge);
    root.removeEventListener('pointerdown', acknowledge); root.removeEventListener('click', acknowledge);
    root.removeEventListener('last-light-acquisition-change', paint);
    root.querySelectorAll<HTMLElement>('[data-new-acquisition]').forEach(node => decorate(node, [], []));
  };
}
