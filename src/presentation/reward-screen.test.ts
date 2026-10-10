import { afterEach, describe, expect, it, vi } from 'vitest';
import { presentReward } from './reward-screen';
import { gameDialogPending } from './game-dialog';

vi.mock('./settings', () => ({ reducedMotion: () => true }));
afterEach(() => vi.unstubAllGlobals());

function fixture() {
  class Element extends EventTarget {
    hidden = true;
    textContent = '';
    isConnected = true;
    focus = vi.fn();
  }
  const selectors = ['.reward-portal', '.reward-art', '.reward-details', '.reward-animation-label',
    '[data-skip-reward]', '[data-close-reward]', '.reward-art-error'];
  const controls = new Map(selectors.map((selector) => [selector, new Element()]));
  class Dialog extends Element {
    open = false;
    innerHTML = '';
    className = '';
    classList = { add: vi.fn() };
    style = { setProperty: vi.fn() };
    remove = vi.fn();
    setAttribute = vi.fn();
    showModal() { this.open = true; }
    close() { this.open = false; }
    querySelector(selector: string) { return controls.get(selector) ?? null; }
  }
  const dialog = new Dialog();
  const removeMotion = vi.fn();
  vi.stubGlobal('HTMLElement', Element);
  vi.stubGlobal('document', { activeElement: new Element(), createElement: () => dialog, body: { append: vi.fn() } });
  vi.stubGlobal('window', { addEventListener: vi.fn(), removeEventListener: removeMotion });
  vi.stubGlobal('matchMedia', () => ({ addEventListener: vi.fn(), removeEventListener: removeMotion }));
  return { dialog, controls, removeMotion };
}

describe('saved reward dismissal', () => {
  it.each(['continue', 'escape', 'cancel'])('settles %s without waiting for native close rendering', async (action) => {
    const { dialog, controls, removeMotion } = fixture();
    const pending = presentReward({ title: 'Saved', name: 'Conduit', art: '', details: '', accent: '#fff', animationLabel: 'Opening' });
    expect(gameDialogPending()).toBe(true);
    expect(controls.get('[data-close-reward]')!.hidden).toBe(false);
    if (action === 'continue') controls.get('[data-close-reward]')!.dispatchEvent(new Event('click'));
    else if (action === 'escape') {
      const event = new Event('keydown', { cancelable: true });
      Object.defineProperty(event, 'key', { value: 'Escape' });
      dialog.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    } else dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    await pending;
    expect(dialog.open).toBe(false);
    expect(gameDialogPending()).toBe(false);
    expect(dialog.remove).toHaveBeenCalledOnce();
    expect(removeMotion).toHaveBeenCalledTimes(2);
  });
});
