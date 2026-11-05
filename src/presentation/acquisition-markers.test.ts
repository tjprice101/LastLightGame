// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindAcquisitionMarkers } from './acquisition-markers';
import { acknowledgeAcquisitions, type AcquisitionHoldings } from '../game/acquisition-markers';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const fixture = (): AcquisitionHoldings & { capturedCharacters: { instanceId: string; creatureId: string }[] } => ({
  characters: { ember: {}, tide: {} }, materials: { 'infernic-common': 4 },
  conduits: { 'vigil-core': 1 }, masterConduits: { 'master:one': 1 },
  capturedCharacters: [{ instanceId: 'capture:first', creatureId: 'infusion:heavens:2' }, { instanceId: 'capture:second', creatureId: 'infusion:heavens:2' }],
  acquisitionMarkers: { 'character:ember': true, 'character:tide': false, 'material:infernic-common': false,
    'conduit:vigil-core': false, 'master:master:one': false, 'form:infusion:heavens:2': false },
});
const markup = `<button data-page="team">Team</button><button data-page="inventory">Inventory</button><button data-page="collections">Collections</button>
  <button data-page="profile">Player info</button><button data-team-view="bearers">Element-Bearers</button><button data-team-view="creatures">Captured</button>
  <button data-inventory-tab="materials">Materials</button><button data-inventory-tab="conduits">Conduits</button><button data-character-tab="equipment">Equipment</button>
  <button data-team-detail="tide">Tizu</button><button data-team-detail="ember">Infernis</button>
  <article data-inventory-material="infernic-common">Seed</article><article data-inventory-conduit="vigil-core">Conduit</article>
  <article data-inventory-master="master:one">Master</article><button data-team-capture-detail="capture:first">Copy 1</button><button data-team-capture-detail="capture:second">Copy 2</button>`;
let dispose: (() => void) | undefined;
const flush = async () => { await new Promise(resolve => setTimeout(resolve, 0)); };
afterEach(() => { dispose?.(); dispose = undefined; document.body.innerHTML = ''; });
function setup() {
  const account = fixture();
  document.body.innerHTML = markup;
  const acknowledge = vi.fn(async (keys: readonly string[]) => {
    account.acquisitionMarkers = acknowledgeAcquisitions(account, keys);
    return account.acquisitionMarkers;
  });
  const error = vi.fn();
  dispose = bindAcquisitionMarkers(document.body, { account: () => account, acknowledge, error });
  return { account, acknowledge, error };
}
describe('acquisition indicators across real routes and item surfaces', () => {
  it('marks relevant routes and exact items, with accessible static labels and keyboard targets', () => {
    setup();
    for (const selector of ['[data-page="team"]', '[data-page="inventory"]', '[data-page="collections"]', '[data-inventory-tab="materials"]',
      '[data-inventory-tab="conduits"]', '[data-character-tab="equipment"]', '[data-team-detail="tide"]', '[data-inventory-master]']) {
      expect(document.querySelector(selector)?.hasAttribute('data-new-acquisition')).toBe(true);
    }
    expect(document.querySelector('[data-page="profile"]')?.hasAttribute('data-new-acquisition')).toBe(false);
    expect(document.querySelector('[data-team-detail="ember"]')?.hasAttribute('data-new-acquisition')).toBe(false);
    expect(document.querySelector('[data-inventory-material]')?.getAttribute('tabindex')).toBe('0');
    expect(document.querySelector('[data-inventory-material] .new-acquisition-mark')?.getAttribute('aria-hidden')).toBe('true');
    expect(document.querySelector('[data-inventory-material]')?.getAttribute('aria-describedby')).toContain('new-acquisition-');
    const css = readFileSync(join('src', 'presentation', 'acquisition-markers.css'), 'utf8');
    expect(css).toContain('html[data-motion="reduced"]');
    expect(css).toContain('animation: none');
    expect(css).toContain('1.9s ease-in-out 3');
    expect(css).toContain('pointer-events: none');
  });
  it('does not acknowledge route hover/opening another page; item focus clears only its ancestors', async () => {
    const { acknowledge } = setup();
    document.querySelector('[data-page="profile"]')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    document.querySelector('[data-page="team"]')!.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    expect(acknowledge).not.toHaveBeenCalled();
    document.querySelector<HTMLElement>('[data-inventory-material]')!.focus();
    await flush();
    expect(acknowledge).toHaveBeenCalledWith(['material:infernic-common']);
    expect(document.querySelector('[data-inventory-tab="materials"]')?.hasAttribute('data-new-acquisition')).toBe(false);
    expect(document.querySelector('[data-inventory-material]')?.hasAttribute('data-new-acquisition')).toBe(false);
    expect(document.querySelector('[data-page="inventory"]')?.hasAttribute('data-new-acquisition')).toBe(true);
    expect(document.querySelector('[data-team-detail="tide"]')?.hasAttribute('data-new-acquisition')).toBe(true);
  });
  it('captured copies share a form marker; tap clears all copies once after persistence', async () => {
    const { acknowledge } = setup();
    const copies = document.querySelectorAll('[data-team-capture-detail]');
    copies[1].dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await flush();
    expect(acknowledge).toHaveBeenCalledWith(['form:infusion:heavens:2']);
    expect(copies[0].hasAttribute('data-new-acquisition')).toBe(false);
    expect(copies[1].hasAttribute('data-new-acquisition')).toBe(false);
    expect(document.querySelector('[data-team-view="creatures"]')?.hasAttribute('data-new-acquisition')).toBe(false);
  });
  it('does not optimistically clear failed acknowledgements; a later item interaction retries', async () => {
    const account = fixture();
    document.body.innerHTML = markup;
    let attempts = 0;
    const acknowledge = vi.fn(async (keys: readonly string[]) => {
      if (++attempts === 1) throw new Error('Save unavailable');
      return acknowledgeAcquisitions(account, keys);
    });
    const error = vi.fn();
    dispose = bindAcquisitionMarkers(document.body, { account: () => account, acknowledge, error });
    const item = document.querySelector('[data-inventory-conduit]')!;
    item.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    await flush();
    expect(item.hasAttribute('data-new-acquisition')).toBe(true);
    expect(error).toHaveBeenCalledWith('Save unavailable');
    item.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await flush();
    expect(item.hasAttribute('data-new-acquisition')).toBe(false);
  });
  it('decorates dynamically rendered holdings without duplicate marks or unrelated clearing', async () => {
    const { acknowledge } = setup();
    document.body.insertAdjacentHTML('beforeend', '<button data-store-conduit="vigil-core">Same Conduit</button>');
    await flush();
    expect(document.querySelector('[data-store-conduit] > .new-acquisition-mark')).not.toBeNull();
    expect(document.querySelector('[data-store-conduit]')?.querySelectorAll('.new-acquisition-mark')).toHaveLength(1);
    expect(acknowledge).not.toHaveBeenCalled();
    document.querySelector('[data-store-conduit]')!.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    await flush();
    expect(document.querySelector('[data-inventory-conduit]')?.hasAttribute('data-new-acquisition')).toBe(false);
  });
  it('does not clear equipment-route unread items just because its owner is newly acquired', async () => {
    const { acknowledge } = setup();
    document.body.insertAdjacentHTML('beforeend', '<button data-team-detail="tide" data-team-tab="equipment">Tizu equipment</button>');
    await flush();
    document.querySelector('[data-team-tab="equipment"]')!.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    await flush();
    expect(acknowledge).toHaveBeenLastCalledWith(['character:tide']);
    expect(document.querySelector('[data-inventory-conduit]')?.hasAttribute('data-new-acquisition')).toBe(true);
  });
  it('retains lifetime unread marks after spending and allows the real material-store item to acknowledge them', async () => {
    const account = fixture();
    account.materials = {};
    account.acquisitionMarkers!['material:moonwake-common'] = false;
    document.body.innerHTML = '<button data-page="stores">Stores</button><button data-market-material="moonwake-common">Moonwake Seed</button>';
    dispose = bindAcquisitionMarkers(document.body, { account: () => account,
      acknowledge: async keys => {
        account.acquisitionMarkers = acknowledgeAcquisitions(account, keys); return account.acquisitionMarkers;
      }, error: () => {} });
    const item = document.querySelector('[data-market-material]')!;
    expect(item.hasAttribute('data-new-acquisition')).toBe(true);
    item.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await flush();
    expect(account.acquisitionMarkers!['material:moonwake-common']).toBe(true);
  });
  it('syncs seen states across devices without restarting the finite corner animation and disposes decorations', () => {
    const { account, acknowledge } = setup();
    const item = document.querySelector('[data-inventory-material]')!;
    const dot = item.querySelector('.new-acquisition-mark');
    document.body.dispatchEvent(new Event('last-light-acquisition-change'));
    expect(item.querySelector('.new-acquisition-mark')).toBe(dot);
    account.acquisitionMarkers!['material:infernic-common'] = true;
    document.body.dispatchEvent(new Event('last-light-acquisition-change'));
    expect(item.hasAttribute('data-new-acquisition')).toBe(false);
    expect(acknowledge).not.toHaveBeenCalled();
    dispose!(); dispose = undefined;
    expect(document.querySelector('.new-acquisition-mark')).toBeNull();
    expect(document.querySelector('[data-new-acquisition]')).toBeNull();
    expect(document.querySelector('[data-acquisition-description]')).toBeNull();
  });
});
