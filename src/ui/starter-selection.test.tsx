// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StarterSelection } from './starter-selection';
import { availableStarters } from '../content/starters';

let root: Root;
let host: HTMLDivElement;
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

describe('Organized opening starter selection', () => {
  const props = () => ({ onSelect: vi.fn(), onBegin: vi.fn().mockResolvedValue(undefined), onPlayerInfo: vi.fn() });

  it('offers exactly the original three starters and requires selection before beginning', async () => {
    const callbacks = props();
    await act(async () => root.render(<StarterSelection {...callbacks} />));
    expect(host.querySelectorAll('[data-starter]')).toHaveLength(3);
    expect(host.querySelector<HTMLButtonElement>('#begin')?.disabled).toBe(true);
    expect(host.querySelector('.ll-starter-story')).toBeNull();
    expect(host.querySelectorAll('.character-rating')).toHaveLength(1);
    for (const starter of availableStarters) expect(host.textContent).toContain(starter.role);
    expect(localStorage.length).toBe(0);
  });

  it('retains portraits and focus, updates the choice once and leaves optional lore collapsed', async () => {
    const callbacks = props();
    await act(async () => root.render(<StarterSelection {...callbacks} />));
    const card = host.querySelector<HTMLButtonElement>('[data-starter="tide"]')!;
    const image = card.querySelector('img');
    card.focus();
    await act(async () => card.click());
    expect(callbacks.onSelect).toHaveBeenCalledExactlyOnceWith('tide');
    expect(document.activeElement).toBe(card);
    expect(card.querySelector('img')).toBe(image);
    expect(card.getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelector('h2')?.textContent).toBe('Beginner, Tizu');
    const lore = host.querySelector<HTMLDetailsElement>('details')!;
    expect(lore.open).toBe(false);
    expect(lore.textContent).toContain(availableStarters[1].lore.story);
    expect(host.querySelector('#begin')?.compareDocumentPosition(lore)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    await act(async () => card.click());
    expect(callbacks.onSelect).toHaveBeenCalledOnce();
    lore.open = true;
    await act(async () => host.querySelector<HTMLButtonElement>('[data-starter="sprout"]')!.click());
    expect(host.querySelector<HTMLDetailsElement>('details')?.open).toBe(false);
    expect(host.querySelectorAll('.element-reveal')).toHaveLength(1);
  });

  it('restores the selected starter after Player info and invokes its navigation callback', async () => {
    const callbacks = props();
    await act(async () => root.render(<StarterSelection {...callbacks} initialSelected="ember" />));
    expect(host.querySelector('[data-starter="ember"]')?.getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelector<HTMLButtonElement>('#begin')?.disabled).toBe(false);
    expect(host.querySelector('h2')?.textContent).toBe('Beginner, Infernis');
    const player = Array.from(host.querySelectorAll('button')).find(b => b.textContent === 'Player info')!;
    await act(async () => player.click());
    expect(callbacks.onPlayerInfo).toHaveBeenCalledOnce();
    expect(callbacks.onSelect).not.toHaveBeenCalled();
  });

  it('omits Player info for signed-in accounts', async () => {
    const { onPlayerInfo: _omitted, ...callbacks } = props();
    await act(async () => root.render(<StarterSelection {...callbacks} />));
    expect(Array.from(host.querySelectorAll('button')).some(b => b.textContent === 'Player info')).toBe(false);
  });

  it('locks selection and confirmation while beginning, then permits retry', async () => {
    let finish!: () => void;
    const callbacks = props();
    callbacks.onBegin.mockImplementation(() => new Promise<void>(resolve => { finish = resolve; }));
    await act(async () => root.render(<StarterSelection {...callbacks} initialSelected="sprout" />));
    await act(async () => host.querySelector<HTMLButtonElement>('#begin')!.click());
    expect(callbacks.onBegin).toHaveBeenCalledOnce();
    expect(Array.from(host.querySelectorAll('button')).every(button => button.disabled)).toBe(true);
    await act(async () => finish());
    expect(host.querySelector<HTMLButtonElement>('#begin')?.disabled).toBe(false);
  });
});
