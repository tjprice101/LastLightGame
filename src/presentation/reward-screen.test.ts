import { afterEach, describe, expect, it, vi } from 'vitest';
import { presentReward } from './reward-screen';
import { gameDialogPending } from './game-dialog';

const motion = vi.hoisted(() => ({ reduced: true }));
vi.mock('./settings', () => ({ reducedMotion: () => motion.reduced }));
afterEach(() => { vi.unstubAllGlobals(); motion.reduced = true; });

function fixture() {
  class Element extends EventTarget {
    hidden = true;
    textContent = '';
    isConnected = true;
    focus = vi.fn();
    animation = { cancel: vi.fn(), onfinish: undefined as (() => void) | undefined };
    animate = vi.fn(() => this.animation);
    querySelectorAll() { return []; }
  }
  const selectors = ['.reward-portal', '.reward-art', '.reward-details', '.reward-animation-label',
    '[data-skip-reward]', '[data-close-reward]', '.reward-art-error', '.reward-flash'];
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
  it.each(['five-star', 'six-star'] as const)('keeps the %s reveal dim and within its final art bounds', async (tier) => {
    motion.reduced = false;
    const { dialog, controls } = fixture();
    const pending = presentReward({ title: 'Summoned', name: 'Saved reward', art: '', details: '',
      accent: '#fff', animationLabel: 'Opening', tier });
    controls.get('.reward-portal')!.animation.onfinish!();
    expect(dialog.setAttribute).toHaveBeenCalledWith('data-reward-revealed', 'true');
    expect(controls.get('.reward-art')!.animate).toHaveBeenCalledWith([
      { opacity: 0, transform: 'scale(.96)', filter: 'brightness(1.15)' },
      { opacity: 1, transform: 'scale(1)', filter: 'brightness(1)', offset: .55 },
      { opacity: 1, transform: 'scale(1)', filter: 'brightness(1)' },
    ], { duration: tier === 'six-star' ? 900 : 650, easing: 'ease-out' });
    expect(controls.get('.reward-flash')!.animate).toHaveBeenCalledWith([
      { opacity: .2, transform: 'scale(.4)' }, { opacity: 0, transform: 'scale(1)' },
    ], { duration: tier === 'six-star' ? 450 : 300, easing: 'ease-out' });
    controls.get('[data-close-reward]')!.dispatchEvent(new Event('click'));
    await pending;
    expect(controls.get('.reward-art')!.animation.cancel).toHaveBeenCalledOnce();
    expect(controls.get('.reward-flash')!.animation.cancel).toHaveBeenCalledOnce();
  });
  it('uses the saved-upgrade label and immediately reveals stats in reduced motion', async () => {
    const { dialog, controls } = fixture();
    const pending = presentReward({ title: 'Level up!', name: 'Infernis', art: '', details: '<p>Stat changes</p>',
      accent: '#fff', animationLabel: 'Growing stronger', savedLabel: 'Upgrade saved' });
    expect(controls.get('.reward-animation-label')!.textContent).toBe('Upgrade saved');
    expect(controls.get('.reward-details')!.hidden).toBe(false);
    expect(controls.get('.reward-art')!.hidden).toBe(false);
    controls.get('[data-close-reward]')!.dispatchEvent(new Event('click'));
    await pending;
    expect(dialog.remove).toHaveBeenCalledOnce();
  });
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
