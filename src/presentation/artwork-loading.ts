import './artwork-loading.css';

export function bindArtworkLoading(host: HTMLElement): () => void {
  const retries = new WeakMap<HTMLImageElement, HTMLButtonElement>();
  const failed = (event: Event): void => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || image.matches('.calamity-tier-boss')) return;
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
  const loaded = (event: Event): void => {
    if (!(event.target instanceof HTMLImageElement)) return;
    retries.get(event.target)?.remove();
    retries.delete(event.target);
  };
  const prepare = (node: Node): void => {
    if (!(node instanceof Element)) return;
    const images = node instanceof HTMLImageElement ? [node] : Array.from(node.querySelectorAll('img'));
    for (const image of images) {
      image.decoding = 'async';
      if (!image.hasAttribute('loading') && !image.closest('.battle-screen')) image.loading = 'lazy';
    }
  };
  host.addEventListener('error', failed, true);
  host.addEventListener('load', loaded, true);
  const observer = new MutationObserver(records => {
    for (const record of records) record.addedNodes.forEach(prepare);
  });
  observer.observe(host, { childList: true, subtree: true });
  prepare(host);
  return () => {
    observer.disconnect();
    host.removeEventListener('error', failed, true);
    host.removeEventListener('load', loaded, true);
    host.querySelectorAll('.artwork-retry').forEach(button => button.remove());
  };
}
