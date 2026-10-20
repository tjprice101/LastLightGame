// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { archives, bindArchives } from './archives';
import { bindSelectionPanels } from './selection-panel';
import { bindInformation } from './information';
import { bindCreatureGlossary } from './creature-glossary';
import { emptyAccount } from '../game/account';
import { machineComponentDrop } from '../content/mechanical-components';
import { conduits, getConduit } from '../content/conduits';
import { masterConduits } from '../content/master-conduits';

let disposeSelection: (() => void) | undefined;
afterEach(() => {
  disposeSelection?.();
  disposeSelection = undefined;
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

function fixture(prepare?: (account: ReturnType<typeof emptyAccount>) => void) {
  const account = emptyAccount();
  account.characters.ember = { level: 30, evolution: 1 };
  account.creatures['infusion:machines:0'] = { defeated: true };
  prepare?.(account);
  const before = structuredClone(account);
  const host = document.createElement('main');
  host.className = 'sanctuary-content';
  host.innerHTML = archives(account);
  document.body.append(host);
  const mockDialog = (dialog: HTMLDialogElement) => {
    dialog.showModal = vi.fn(() => { dialog.open = true; });
    dialog.close = vi.fn(() => {
      dialog.open = false;
      dialog.dispatchEvent(new Event('close'));
    });
  };
  host.querySelectorAll<HTMLDialogElement>('dialog').forEach(mockDialog);
  bindArchives(host);
  bindCreatureGlossary(host);
  bindInformation(host);
  disposeSelection = bindSelectionPanels(host);
  mockDialog(document.querySelector<HTMLDialogElement>('.selection-modal')!);
  const select = (name: string, value: string) => {
    const control = host.querySelector<HTMLSelectElement>(`[data-character-filter="${name}"]`)!;
    control.value = value;
    control.dispatchEvent(new Event('change', { bubbles: true }));
  };
  const visible = () => Array.from(host.querySelectorAll<HTMLElement>('[data-archive-character]')).filter(card => !card.hidden);
  return { host, account, before, select, visible };
}

describe('Collections controls', () => {
  it('combines all five filters, reports empty matches and resets the visible selection labels', () => {
    const f = fixture();
    f.select('element', 'infernic');
    f.select('rarity', 'Common');
    f.select('ownership', 'owned');
    f.select('discovery', 'revealed');
    f.select('stars', '5');
    expect(f.visible()).toHaveLength(1);
    expect(f.visible()[0].dataset.archiveCharacter).toBe('ember');
    expect(f.host.querySelector('[data-character-filter-result]')?.textContent).toBe('1 / 126 forms shown');
    f.select('discovery', 'locked');
    expect(f.visible()).toHaveLength(0);
    expect(f.host.querySelector('[data-character-filter-result]')?.textContent).toBe('No forms match these filters.');
    f.host.querySelector<HTMLButtonElement>('[data-reset-character-filters]')!.click();
    expect(f.visible()).toHaveLength(126);
    expect(Array.from(f.host.querySelectorAll('#archive-characters .archive-filters .selection-trigger')).map(button => button.textContent))
      .toEqual(['All elements', 'All rarities', 'All characters', 'All forms', 'All stars']);
    expect(f.account).toEqual(f.before);
  });

  it('changes filters through real selection-dialog choices, retaining card DOM and gallery state', () => {
    const f = fixture();
    expect(f.host.dataset.menuScroll).toBe('collections');
    const card = f.host.querySelector('[data-archive-character="ember"]');
    const trigger = f.host.querySelector<HTMLButtonElement>('.archive-filters .selection-trigger')!;
    trigger.click();
    const dialog = document.querySelector<HTMLDialogElement>('.selection-modal')!;
    Array.from(dialog.querySelectorAll<HTMLButtonElement>('.selection-option'))
      .find(button => button.textContent === 'Infernic')!.click();
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
    expect(f.visible()).toHaveLength(6);
    for (const gallery of ['conduits', 'creatures', 'characters']) {
      f.host.querySelector<HTMLButtonElement>(`[data-archive-gallery="${gallery}"]`)!.click();
      const panels = Array.from(f.host.querySelectorAll<HTMLElement>('.archive-panel'));
      expect(panels.filter(panel => !panel.hidden).map(panel => panel.id)).toEqual([`archive-${gallery}`]);
      expect(f.host.querySelector(`[data-archive-gallery="${gallery}"]`)?.getAttribute('aria-pressed')).toBe('true');
      expect(document.activeElement?.id).toBe(`archive-${gallery}-heading`);
    }
    expect(f.visible()).toHaveLength(6);
    expect(f.host.querySelector('[data-archive-character="ember"]')).toBe(card);
    expect(f.account).toEqual(f.before);
  });

  it('opens combat kits, Conduit details and Information with native dialog close controls', () => {
    const f = fixture();
    for (const id of ['archive-kit-ember-1', 'archive-conduit-vigil-core', 'collections-information']) {
      f.host.querySelector<HTMLButtonElement>(`[data-information="${id}"]`)!.click();
      const dialog = f.host.querySelector<HTMLDialogElement>(`#${id}`)!;
      expect(dialog.open).toBe(true);
      dialog.querySelector<HTMLButtonElement>('[data-close-information]')!.click();
      expect(dialog.open).toBe(false);
    }
    expect(f.account).toEqual(f.before);
  });

  it('filters enemy discoveries and updates loot for the selected real stage', () => {
    const f = fixture();
    f.host.querySelector<HTMLButtonElement>('[data-archive-gallery="creatures"]')!.click();
    const activity = f.host.querySelector<HTMLSelectElement>('#glossary-area')!;
    activity.value = 'Awaken the Machines';
    activity.dispatchEvent(new Event('change', { bubbles: true }));
    const cards = Array.from(f.host.querySelectorAll<HTMLElement>('[data-creature]'));
    expect(cards.filter(card => !card.hidden)).toHaveLength(6);
    expect(cards.filter(card => !card.hidden).every(card => card.dataset.area === activity.value)).toBe(true);
    const stage = f.host.querySelector<HTMLSelectElement>('[data-loot-stage="infusion:machines:0"]')!;
    stage.value = '5';
    stage.dispatchEvent(new Event('change', { bubbles: true }));
    const loot = stage.closest('article')!.querySelector('.glossary-loot')!;
    expect(loot.textContent).toContain('Stage 5');
    const quantity = machineComponentDrop(5).minimum;
    expect(loot.innerHTML).toContain(`<td>${quantity}-${quantity}</td><td>100%</td>`);
    activity.value = '';
    activity.dispatchEvent(new Event('change', { bubbles: true }));
    expect(cards.every(card => !card.hidden)).toBe(true);
    expect(f.account).toEqual(f.before);
  });

  it('searches Conduits by name, effect, ability term and lore, combined with rarity and ownership', () => {
    const f = fixture(account => { account.conduits = { 'bastion-lock': 1 }; });
    const search = f.host.querySelector<HTMLInputElement>('[data-conduit-search]')!;
    const scope = f.host.querySelector<HTMLSelectElement>('[data-conduit-search-scope]')!;
    const all = () => Array.from(f.host.querySelectorAll<HTMLElement>('[data-archive-conduit], [data-archive-master]'));
    const shown = () => all().filter(card => !card.hidden);
    const result = () => f.host.querySelector('[data-conduit-filter-result]')?.textContent;
    const type = (value: string) => { search.value = value; search.dispatchEvent(new Event('input')); };
    const choose = (control: HTMLSelectElement, value: string) => { control.value = value; control.dispatchEvent(new Event('change', { bubbles: true })); };
    const total = conduits.filter(entry => entry.rarity !== 'Calamitic').length + masterConduits.length;
    expect(all()).toHaveLength(total);
    expect(result()).toBe(`${total} / ${total} Conduits shown`);

    const vigil = getConduit('vigil-core');
    type(vigil.name.toUpperCase());
    choose(scope, 'name');
    expect(shown().map(card => card.dataset.archiveConduit)).toEqual(['vigil-core']);

    type('[Burn]');
    choose(scope, 'ability');
    const burn = shown();
    expect(burn.length).toBeGreaterThan(0);
    expect(burn.every(card => /\[[^\]]*burn[^\]]*\]/i.test(card.textContent ?? ''))).toBe(true);
    choose(scope, 'effect');
    expect(shown().length).toBeGreaterThanOrEqual(burn.length);

    const lore = vigil.lore.split(/\s+/).slice(0, 3).join(' ');
    type(lore);
    choose(scope, 'lore');
    expect(shown().map(card => card.dataset.archiveConduit)).toContain('vigil-core');
    choose(scope, 'name');
    expect(shown().map(card => card.dataset.archiveConduit)).not.toContain('vigil-core');

    type('');
    choose(scope, 'all');
    choose(f.host.querySelector<HTMLSelectElement>('[data-conduit-filter="ownership"]')!, 'owned');
    expect(shown().map(card => card.dataset.archiveConduit)).toEqual(['bastion-lock']);
    choose(f.host.querySelector<HTMLSelectElement>('[data-conduit-filter="rarity"]')!, 'Master');
    expect(shown()).toHaveLength(0);
    expect(result()).toBe('No Conduits match these filters.');
    choose(f.host.querySelector<HTMLSelectElement>('[data-conduit-filter="ownership"]')!, '');
    expect(shown()).toHaveLength(masterConduits.length);
    expect(shown().every(card => card.dataset.archiveMaster)).toBe(true);

    type('zzzz-no-match');
    f.host.querySelector<HTMLButtonElement>('[data-reset-conduit-filters]')!.click();
    expect(search.value).toBe('');
    expect(scope.value).toBe('all');
    expect(shown()).toHaveLength(total);
    expect(f.account).toEqual(f.before);
  }, 30_000);

  it('keeps unowned captured portraits locked independently of enemy discovery', () => {
    const f = fixture();
    const portrait = f.host.querySelector('[data-archive-character="infusion:heavens:0"] .archive-portrait');
    expect(portrait?.classList.contains('unreached-character-art')).toBe(true);
    expect(f.host.querySelector('[data-archive-character="ember"] .archive-portrait')?.classList.contains('unreached-character-art')).toBe(false);
  });
});
