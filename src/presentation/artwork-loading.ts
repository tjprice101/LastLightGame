import './artwork-loading.css';
import { pngFallback, thumbnailSrcset } from './image-format';

const AUTO_RETRY_DELAY = 900;

export function bindArtworkLoading(host: HTMLElement): () => void {
  const retries = new WeakMap<HTMLImageElement, HTMLButtonElement>();
  const autoRetried = new WeakSet<HTMLImageElement>();
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const showRetry = (image: HTMLImageElement): void => {
    console.error('Artwork request failed', image.currentSrc || image.src);
    if (retries.has(image)) return;
    const button = host.ownerDocument.createElement('button');
    button.type = 'button';
    button.className = 'artwork-retry';
    button.textContent = 'Image unavailable - retry';
    button.setAttribute('aria-label', `Retry image${image.alt ? `: ${image.alt}` : ''}`);
    button.addEventListener('click', event => {
      event.stopPropagation();
      event.preventDefault();
      const url = new URL(image.currentSrc || image.src, location.href);
      if (url.origin === location.origin) url.searchParams.set('retry', String(Date.now()));
      image.loading = 'eager';
      image.src = url.href;
    });
    // A retry control must not be nested inside an existing navigation button.
    const anchor = image.closest('button, a') ?? image;
    anchor.insertAdjacentElement('afterend', button);
    retries.set(image, button);
  };
  const failed = (event: Event): void => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || image.matches('.calamity-tier-boss')) return;
    // AVIF copy unavailable or undecodable: fall back to the canonical PNG silently.
    const fallback = pngFallback(image.getAttribute('src') ?? '');
    if (fallback) {
      // Not a final failure: keep per-screen error notices quiet.
      event.stopPropagation();
      image.removeAttribute('srcset');
      image.removeAttribute('sizes');
      image.src = fallback;
      return;
    }
    // Transient network failures usually succeed on a single quiet retry.
    if (!autoRetried.has(image) && image.src && !image.src.startsWith('data:')) {
      event.stopPropagation();
      autoRetried.add(image);
      const timer = setTimeout(() => {
        timers.delete(timer);
        if (!image.isConnected) return;
        const url = new URL(image.src, location.href);
        if (url.origin === location.origin) url.searchParams.set('retry', String(Date.now()));
        image.loading = 'eager';
        image.src = url.href;
      }, AUTO_RETRY_DELAY);
      timers.add(timer);
      return;
    }
    showRetry(image);
  };
  const loaded = (event: Event): void => {
    if (!(event.target instanceof HTMLImageElement)) return;
    retries.get(event.target)?.remove();
    retries.delete(event.target);
  };
  const thumbnailed = new WeakSet<HTMLImageElement>();
  const applyThumbnail = (image: HTMLImageElement): void => {
    if (thumbnailed.has(image)) {
      // Source swapped in place (evolution, roster selection): keep srcset in step.
      const srcset = thumbnailSrcset(image.getAttribute('src') ?? '');
      if (srcset) image.setAttribute('srcset', srcset);
      else {
        image.removeAttribute('srcset');
        image.removeAttribute('sizes');
        thumbnailed.delete(image);
      }
      return;
    }
    // Lazy menu tiles let the browser pick a 384px thumbnail when the art is shown small.
    if ((image.loading || image.getAttribute('loading')) !== 'lazy' || image.hasAttribute('srcset')) return;
    const srcset = thumbnailSrcset(image.getAttribute('src') ?? '');
    if (!srcset) return;
    image.setAttribute('sizes', 'auto');
    image.setAttribute('srcset', srcset);
    thumbnailed.add(image);
  };
  const prepare = (node: Node): void => {
    if (!(node instanceof Element)) return;
    const images = node instanceof HTMLImageElement ? [node] : Array.from(node.querySelectorAll('img'));
    for (const image of images) {
      image.decoding = 'async';
      if (!image.hasAttribute('loading') && !image.closest('.battle-screen')) image.loading = 'lazy';
      applyThumbnail(image);
    }
  };
  host.addEventListener('error', failed, true);
  host.addEventListener('load', loaded, true);
  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes') {
        if (record.target instanceof HTMLImageElement && thumbnailed.has(record.target)) applyThumbnail(record.target);
      } else record.addedNodes.forEach(prepare);
    }
  });
  observer.observe(host, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
  prepare(host);
  return () => {
    observer.disconnect();
    timers.forEach(clearTimeout);
    timers.clear();
    host.removeEventListener('error', failed, true);
    host.removeEventListener('load', loaded, true);
    host.querySelectorAll('.artwork-retry').forEach(button => button.remove());
  };
}
