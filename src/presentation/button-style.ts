/**
 * Presentation-only button styling (D-168). Tags buttons that have no artwork or
 * existing gradient fill so button-style.css can add a subtle accent gradient,
 * and classifies them as text, icon or tile so labels can sit off-center.
 */
const BUTTON_SELECTOR = 'button, a[class], [role="button"]';
const TEXT_BUTTON_MAX_HEIGHT = 72;

export type ButtonKind = 'text' | 'icon' | 'tile' | 'filled' | 'art';

export function classifyButton(
  element: HTMLElement,
  backgroundImage: string,
  height: number,
): ButtonKind {
  if (backgroundImage.includes('url(')) return 'art';
  const rect = element.getBoundingClientRect();
  const largeImage = Array.from(element.querySelectorAll('img, picture, canvas')).some((art) => {
    const box = art.getBoundingClientRect();
    return box.width * box.height > rect.width * rect.height * 0.25;
  });
  if (largeImage) return 'art';
  if (backgroundImage && backgroundImage !== 'none') return height > TEXT_BUTTON_MAX_HEIGHT ? 'art' : 'filled';
  if (height > TEXT_BUTTON_MAX_HEIGHT) return 'tile';
  const text = (element.textContent ?? '').replace(/\s+/g, '');
  return text.length <= 2 || height < 32 ? 'icon' : 'text';
}

function tag(element: HTMLElement): void {
  if (element.dataset.buttonSurface) return;
  const rect = element.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const kind = classifyButton(element, getComputedStyle(element).backgroundImage, rect.height);
  element.dataset.buttonSurface = kind;
}

export function installButtonStyle(root: HTMLElement = document.body): () => void {
  let frame = 0;
  const scan = (): void => {
    frame = 0;
    root.querySelectorAll<HTMLElement>(BUTTON_SELECTOR).forEach((element) => {
      if (!element.closest('.battle-unit, .battle-field, .battle-units')) tag(element);
    });
  };
  const schedule = (): void => {
    if (!frame) frame = requestAnimationFrame(scan);
  };
  const observer = new MutationObserver(schedule);
  observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'open', 'aria-hidden', 'aria-expanded'] });
  schedule();
  return () => {
    observer.disconnect();
    if (frame) cancelAnimationFrame(frame);
  };
}
