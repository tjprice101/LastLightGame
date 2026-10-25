// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installOverlayPages, paginateOverlay } from './overlay-pages';

let stop: (() => void) | undefined;
const tick = async () => { await new Promise(resolve => setTimeout(resolve, 0)); };

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(300);
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(400);
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(964);
});
afterEach(() => {
  stop?.(); stop = undefined;
  document.body.replaceChildren();
  vi.restoreAllMocks(); vi.unstubAllGlobals();
});

function dialog(markup: string): HTMLDialogElement {
  const element = document.createElement('dialog');
  element.innerHTML = markup;
  document.body.append(element);
  element.open = true;
  return element;
}

describe('full-screen overlay pages', () => {
  it('keeps original headings, controls, values and handlers while paging; restores original structure on close', () => {
    const element = dialog('<h2>Confirm</h2><form><input name="choice" value="unchanged"><p>Details</p><div class="game-dialog-actions"><button>Confirm</button></div></form>');
    const title = element.querySelector('h2')!;
    const form = element.querySelector('form')!;
    const input = element.querySelector('input')!;
    const button = element.querySelector<HTMLButtonElement>('.game-dialog-actions button')!;
    const handler = vi.fn((event: Event) => event.preventDefault());
    form.addEventListener('submit', handler);
    stop = paginateOverlay(element);
    expect(element.classList.contains('fullscreen-overlay')).toBe(true);
    expect(element.dataset.overlayPages).toBe('3');
    expect(element.querySelector('.overlay-heading h2')).toBe(title);
    expect(button.form).toBe(form);
    button.click();
    expect(handler).toHaveBeenCalledOnce();
    element.querySelector<HTMLButtonElement>('[data-overlay-next]')!.click();
    expect(element.dataset.overlayPage).toBe('2');
    expect(input.value).toBe('unchanged');
    expect(element.querySelector('.overlay-flow input')).toBe(input);
    stop(); stop = undefined;
    expect(element.firstElementChild).toBe(title);
    expect(form.querySelector('button')).toBe(button);
    expect(button.hasAttribute('form')).toBe(false);
    expect(element.querySelector('.overlay-shell')).toBeNull();
  });

  it('uses non-submitting navigation with boundary states and no duplicate pages', () => {
    const element = dialog('<header><h2>Choose</h2></header><p>Content</p>');
    stop = paginateOverlay(element);
    const previous = element.querySelector<HTMLButtonElement>('[data-overlay-previous]')!;
    const next = element.querySelector<HTMLButtonElement>('[data-overlay-next]')!;
    expect(previous.type).toBe('button');
    expect(next.type).toBe('button');
    expect(previous.disabled).toBe(true);
    next.click(); next.click();
    expect(next.disabled).toBe(true);
    expect(element.querySelector('[role="status"]')?.textContent).toBe('Page 3 of 3');
    previous.click();
    expect(element.dataset.overlayPage).toBe('2');
  });

  it('preserves the initially focused selection and opens its page instead of dropping focus during layout', () => {
    const element = dialog('<h2>Choose</h2><button id="selected-option">Selected</button>');
    const selected = element.querySelector<HTMLButtonElement>('button')!;
    selected.focus();
    vi.spyOn(selected, 'getBoundingClientRect').mockReturnValue({ x: 664, left: 664, right: 764, width: 100, top: 0, bottom: 44, y: 0, height: 44, toJSON() {} });
    stop = paginateOverlay(element);
    expect(document.activeElement).toBe(selected);
    expect(element.dataset.overlayPage).toBe('3');
    expect(element.querySelector<HTMLButtonElement>('[data-overlay-next]')!.disabled).toBe(true);
  });

  it('updates page counts after filtering and resets to the first remaining page', async () => {
    const element = dialog('<h2>Options</h2><p>Filtered content</p>');
    stop = paginateOverlay(element);
    element.querySelector<HTMLButtonElement>('[data-overlay-next]')!.click();
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(300);
    element.querySelector('p')!.hidden = true;
    await tick();
    expect(element.dataset.overlayPage).toBe('1');
    expect(element.dataset.overlayPages).toBe('1');
    expect(element.querySelector<HTMLButtonElement>('[data-overlay-next]')!.disabled).toBe(true);
  });

  it('reveals the first invalid field even when browser validation does not send a new focus event', async () => {
    const element = dialog('<h2>Form</h2><input id="first" required><input id="second" required>');
    const first = element.querySelector<HTMLInputElement>('#first')!;
    const second = element.querySelector<HTMLInputElement>('#second')!;
    vi.spyOn(first, 'getBoundingClientRect').mockReturnValue({ x: 664, left: 664, right: 764, width: 100, top: 0, bottom: 44, y: 0, height: 44, toJSON() {} });
    stop = paginateOverlay(element);
    first.dispatchEvent(new Event('invalid', { cancelable: true }));
    second.dispatchEvent(new Event('invalid', { cancelable: true }));
    expect(element.dataset.overlayPage).toBe('3');
    await tick();
    element.querySelector<HTMLButtonElement>('[data-overlay-previous]')!.click();
    first.dispatchEvent(new Event('invalid', { cancelable: true }));
    expect(element.dataset.overlayPage).toBe('3');
  });

  it('leaves React-owned content and action nodes in their declared containers', () => {
    const element = dialog('<header data-overlay-heading><h2>React</h2></header><div data-overlay-body><div data-overlay-flow><input value="draft"></div></div><footer data-overlay-footer><div data-overlay-actions><button>Choose</button></div></footer>');
    element.setAttribute('data-overlay-layout', '');
    const body = element.querySelector('[data-overlay-body]')!;
    const content = body.firstElementChild;
    const actions = element.querySelector('[data-overlay-actions]')!;
    const button = actions.firstElementChild;
    stop = paginateOverlay(element);
    expect(body.firstElementChild).toBe(content);
    expect(actions.firstElementChild).toBe(button);
    expect(element.querySelector('.overlay-shell')).toBeNull();
    stop(); stop = undefined;
    expect(body.firstElementChild).toBe(content);
    expect(actions.firstElementChild).toBe(button);
    expect(element.querySelector('.overlay-pagination')).toBeNull();
  });

  it('pins Settings submit actions without losing their original form ownership', () => {
    const element = dialog('<header><h2>Settings</h2></header><form id="motion" class="settings-panel"><select name="motion"><option>reduced</option></select><button type="submit">Save motion</button></form><form id="keys" class="settings-panel"><button type="submit">Save keys</button></form>');
    const motion = element.querySelector<HTMLFormElement>('#motion')!;
    const button = motion.querySelector('button')!;
    stop = paginateOverlay(element);
    expect(element.querySelector('.overlay-footer')?.contains(button)).toBe(true);
    expect(button.form).toBe(motion);
    expect(new FormData(motion).get('motion')).toBe('reduced');
    stop(); stop = undefined;
    expect(motion.querySelector('button')).toBe(button);
  });

  it('automatically covers late-created and nested dialogs, preserving the parent page', async () => {
    stop = installOverlayPages();
    const parent = dialog('<header><h2>Parent</h2></header><p>Parent content</p>');
    await tick();
    parent.querySelector<HTMLButtonElement>('[data-overlay-next]')!.click();
    const child = dialog('<h2>Nested</h2><p>Child content</p>');
    await tick();
    expect(document.querySelectorAll('.fullscreen-overlay')).toHaveLength(2);
    child.open = false;
    await tick();
    expect(child.querySelector('.overlay-shell')).toBeNull();
    expect(parent.dataset.overlayPage).toBe('2');
  });

  it('isolates embedded sub-modal focus and filtering from the parent paginator', async () => {
    stop = installOverlayPages();
    const parent = dialog('<header><h2>Parent</h2></header><p>Content</p><dialog id="child"><h2>Child</h2><p>Details</p><button>Child action</button></dialog>');
    await tick();
    parent.querySelector<HTMLButtonElement>('[data-overlay-next]')!.click();
    const child = parent.querySelector<HTMLDialogElement>('#child')!;
    child.open = true;
    await tick();
    child.querySelector('p')!.hidden = true;
    child.querySelector('button')!.focus();
    await tick();
    expect(parent.dataset.overlayPage).toBe('2');
    expect(child.dataset.overlayPage).toBe('1');
    expect(child.querySelector('button')!.tabIndex).toBe(0);
  });

  it('moves a content title into an existing close-only heading without losing its label ID', () => {
    const element = dialog('<header><button>Close</button></header><div><h2 id="max-level-heading">Max Level</h2><p>Preview</p></div>');
    stop = paginateOverlay(element);
    expect(element.querySelector('header #max-level-heading')?.textContent).toBe('Max Level');
    stop(); stop = undefined;
    expect(element.querySelector(':scope > div #max-level-heading')).not.toBeNull();
  });

  it('does not resurrect stale contents when a reusable dialog is rebuilt before the observer runs', async () => {
    stop = installOverlayPages();
    const element = dialog('<h2>Old loot</h2><p>Old content</p>');
    await tick();
    element.open = false;
    element.innerHTML = '<h2>New loot</h2><p>New content</p>';
    element.open = true;
    await tick();
    expect(element.textContent).not.toContain('Old content');
    expect(element.querySelector('.overlay-heading')?.textContent).toBe('New loot');
    expect(element.querySelectorAll('.overlay-pagination')).toHaveLength(1);
  });

  it('cleans removed dialogs without touching the underlying page', async () => {
    document.body.innerHTML = '<main><input value="page state"></main>';
    stop = installOverlayPages();
    const element = dialog('<h2>Temporary</h2><p>Content</p>');
    await tick();
    element.remove();
    await tick();
    expect(document.body.innerHTML).toBe('<main><input value="page state"></main>');
  });
});
