// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { classifyButton } from './button-style';

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
});
