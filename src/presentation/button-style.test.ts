// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { classifyButton, installButtonStyle } from './button-style';

describe('button surface classification', () => {
  const button = (text: string) => Object.assign(document.createElement('button'), { textContent: text });

  it('keeps wide labelled buttons as text surfaces instead of round icons', () => {
    expect(classifyButton(button('EX+1 Lv.145'), 'none', 30, 300)).toBe('text');
    expect(classifyButton(button('Calamity rules'), 'none', 44, 150)).toBe('text');
  });

  it('still rounds compact glyph controls', () => {
    expect(classifyButton(button('×'), 'none', 44, 44)).toBe('icon');
    expect(classifyButton(button('Info'), 'none', 28, 30)).toBe('icon');
  });

  it('tags the first layout and hidden-document updates without waiting on suspended animation frames', async () => {
    const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 0, left: 0, top: 0, right: 120, bottom: 44, width: 120, height: 44, toJSON: () => ({}),
    });
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    const root = document.createElement('main');
    root.innerHTML = '<button>Details</button><button class="hub-bubble">Home</button>';
    document.body.append(root);
    const dispose = installButtonStyle(root);
    try {
      expect(root.querySelector('button')?.dataset.buttonSurface).toBe('text');
      expect(root.querySelector('.hub-bubble')?.getAttribute('data-button-surface')).toBeNull();
      root.insertAdjacentHTML('beforeend', '<button>Cancel</button>');
      await Promise.resolve();
      expect(root.lastElementChild?.getAttribute('data-button-surface')).toBe('text');
    } finally {
      dispose();
      root.remove();
      rect.mockRestore();
      hidden.mockRestore();
    }
  });
});
