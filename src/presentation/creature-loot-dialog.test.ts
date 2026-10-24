// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { creatureGlossary, bindCreatureGlossary } from './creature-glossary';
import { archives } from './archives';
import { bindInformation } from './information';
import { emptyAccount } from '../game/account';
import { creatures, creatureLoot } from '../content/creatures';
import { conduits, getConduit, conduitEffect, isConduitId } from '../content/conduits';
import { formatStat } from '../content/combat';
import { referencedEffect as readableEffect } from './effect-copy';
import { bracketReferences } from './reference-text';

const showModalDescriptor = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal');
const closeDescriptor = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close');
beforeEach(() => {
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: { configurable: true, value: vi.fn(function (this: HTMLDialogElement) { this.open = true; }) },
    close: { configurable: true, value: vi.fn(function (this: HTMLDialogElement) {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    }) },
  });
});
afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
  for (const [name, descriptor] of [['showModal', showModalDescriptor], ['close', closeDescriptor]] as const) {
    if (descriptor) Object.defineProperty(HTMLDialogElement.prototype, name, descriptor);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, name);
  }
});

function mount(allDefeated = false) {
  const account = emptyAccount();
  account.conduitUpgrades = { 'duplex-heart': 3 };
  if (allDefeated) account.creatures = Object.fromEntries(creatures.map(creature => [creature.id, { defeated: true }]));
  else account.creatures = { 'infusion:machines:0': { defeated: true }, 'adventure:goblin': { defeated: false } };
  const before = structuredClone(account);
  const host = document.createElement('main');
  host.innerHTML = creatureGlossary(account);
  document.body.append(host);
  bindCreatureGlossary(host, account.conduitUpgrades);
  bindInformation(host);
  return { host, account, before };
}

describe('enemy loot dialogs and Conduit details', () => {
  it('shows account-specific owned/unowned chances on initial display and stage changes', () => {
    const account = emptyAccount();
    account.conduits = Object.fromEntries(conduits.filter(c => c.rarity === 'Rare' && c.id !== 'duplex-heart').map(c => [c.id, 2]));
    account.creatures = { 'infusion:machines:0': { defeated: true } };
    const host = document.createElement('main');
    host.innerHTML = creatureGlossary(account);
    document.body.append(host);
    bindCreatureGlossary(host, account.conduitUpgrades, account.conduits);
    const dialog = document.getElementById('creature-loot-infusion:machines:0')!;
    const check = () => {
      const rows = Array.from(dialog.querySelectorAll('tbody tr'));
      for (const conduit of conduits.filter(c => c.rarity === 'Rare')) {
        const row = rows.find(row => row.textContent?.includes(`${conduit.name} · Rare`))!;
        expect(row.children[2].textContent).toBe(conduit.id === 'duplex-heart' ? '8%' : '0%');
      }
      expect(dialog.textContent).toContain('Fully owned rarities drop nothing');
    };
    check();
    const select = dialog.querySelector<HTMLSelectElement>('[data-loot-stage]')!;
    select.value = '5';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    check();
  });
  it('shows one concise Conduit note across all rarities, including mixed focused and random drops', () => {
    const account = emptyAccount();
    account.creatures = { 'infusion:machines:5': { defeated: true } };
    account.machineLootFocus = { Omnic: conduits.find(conduit => conduit.rarity === 'Omnic')!.id };
    const host = document.createElement('main');
    host.innerHTML = creatureGlossary(account);
    bindCreatureGlossary(host, account.conduitUpgrades, account.conduits, account.machineLootFocus);
    const stage = host.querySelector<HTMLSelectElement>('[data-loot-stage="infusion:machines:5"]')!;
    stage.value = '35';
    stage.dispatchEvent(new Event('change', { bubbles: true }));
    const notes = host.querySelector('[id="creature-loot-infusion:machines:5"] .loot-roll-notes')!;
    expect(notes.querySelectorAll('p')).toHaveLength(3);
    const text = notes.textContent!.replace(/[[\]]/g, '');
    expect(text.match(/Each rarity rolls separately/g)).toHaveLength(1);
    expect(text).toContain('your focus, or an equal random choice');
    expect(text).toContain('Fully owned rarities drop nothing');
    expect(text).toContain('Final-boss amounts already include the 5x bonus');
    expect(text).toContain('Choose an unowned Master in Inventory');
    expect(text.trim().split(/\s+/).length).toBeLessThanOrEqual(60);
  });
  it('puts a View Loot button on every enemy, preserving encountered/undiscovered loot gates', () => {
    const { host, account, before } = mount();
    for (const creature of creatures) {
      const card = host.querySelector<HTMLElement>(`[data-creature="${creature.id}"]`)!;
      const button = Array.from(card.children).find(element => element instanceof HTMLButtonElement && element.textContent === 'View Loot') as HTMLButtonElement;
      expect(button).toBeDefined();
      expect(card.querySelector(':scope > .creature-loot')).toBeNull();
      expect(card.querySelector(':scope > .glossary-loot')).toBeNull();
      const dialog = card.querySelector<HTMLDialogElement>(`[id="creature-loot-${creature.id}"]`);
      expect(button.disabled).toBe(!account.creatures[creature.id]?.defeated);
      expect(!!dialog).toBe(!!account.creatures[creature.id]?.defeated);
      if (dialog) {
        expect(dialog.open).toBe(false);
        expect(dialog.querySelector('.glossary-loot')).not.toBeNull();
        button.click();
        expect(dialog.open).toBe(true);
        dialog.querySelector<HTMLButtonElement>('[data-close-information]')!.click();
        expect(dialog.open).toBe(false);
      }
    }
    expect(account).toEqual(before);
  }, 20000);

  it('uses actual stage-specific tables for every defeated enemy, with details for every Conduit', () => {
    const { host } = mount(true);
    const ids = Array.from(host.querySelectorAll('[id]')).map(element => element.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const creature of creatures) {
      const dialog = document.getElementById(`creature-loot-${creature.id}`) as HTMLDialogElement;
      const stage = dialog.querySelector<HTMLSelectElement>('[data-loot-stage]')!;
      for (const value of [creature.stages[0] ?? 1, creature.stages.at(-1) ?? 120]) {
        stage.value = String(value);
        stage.dispatchEvent(new Event('change', { bubbles: true }));
        const expected = creatureLoot(creature, value);
        const rows = dialog.querySelectorAll('.glossary-loot > table > tbody > tr');
        expect(rows).toHaveLength(expected.length);
        expected.forEach((drop, index) => {
          expect(rows[index].children[1].textContent).toBe(drop.minimum === 1 && drop.id === 'grand-master-chest' ? '1' : `${drop.minimum}-${drop.maximum}`);
          expect(rows[index].children[2].textContent).toBe(`${formatStat(drop.chance * 100)}%`);
          if (isConduitId(drop.id)) {
            const button = rows[index].querySelector<HTMLButtonElement>('[data-information]')!;
            expect(button.textContent).toBe('View Details');
            button.click();
            const details = document.getElementById(button.dataset.information!) as HTMLDialogElement;
            expect(details.open).toBe(true);
            expect(details.textContent?.replace(/[[\]]/g, '')).toContain(bracketReferences(getConduit(drop.id).lore, false).replace(/[[\]]/g, ''));
            details.querySelector<HTMLButtonElement>('[data-close-information]')!.click();
          }
        });
      }
    }
  }, 20000);

  it('opens shared Conduit information from loot and retains the parent stage through close/Escape', () => {
    const { host, account, before } = mount();
    const lootButton = host.querySelector<HTMLButtonElement>('[data-information="creature-loot-infusion:machines:0"]')!;
    lootButton.click();
    const loot = document.getElementById(lootButton.dataset.information!) as HTMLDialogElement;
    const stage = loot.querySelector<HTMLSelectElement>('[data-loot-stage]')!;
    stage.value = '5';
    stage.dispatchEvent(new Event('change', { bubbles: true }));
    const button = loot.querySelector<HTMLButtonElement>('[data-information$="-duplex-heart"]')!;
    button.click();
    const details = document.getElementById(button.dataset.information!) as HTMLDialogElement;
    expect(loot.open).toBe(true);
    expect(details.open).toBe(true);
    expect(details.textContent).toContain(readableEffect(conduitEffect(getConduit('duplex-heart'), 3)));
    expect(details.textContent).toContain(readableEffect(conduitEffect(getConduit('duplex-heart'), 5)));
    details.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(details.open).toBe(false);
    expect(loot.open).toBe(true);
    expect(stage.value).toBe('5');
    expect(loot.querySelector('caption')?.textContent).toContain('Stage 5');
    loot.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(loot.open).toBe(false);
    lootButton.click();
    expect(stage.value).toBe('5');
    expect(account).toEqual(before);
  });

  it('keeps repeated Conduit roll explanations out of each loot row', () => {
    const { host } = mount();
    const loot = host.querySelector('[id="creature-loot-infusion:machines:0"]')!;
    const rows = Array.from(loot.querySelectorAll('tbody > tr')).filter(row => row.querySelector('[data-information]'));
    expect(rows.length).toBeGreaterThan(1);
    for (const row of rows) expect(row.querySelector('td > small')).toBeNull();
    expect(loot.querySelector('.loot-roll-notes')?.textContent).toContain('Each rarity rolls separately');
  });

  it('shares complete upgrade-aware effect/lore information with the Conduit Archive', () => {
    const account = emptyAccount();
    account.calamityClears = { machines: 1 };
    const template = document.createElement('template');
    template.innerHTML = archives(account);
    const dialogs = new Map(Array.from(template.content.querySelectorAll('dialog')).map(dialog => [dialog.id, dialog]));
    for (const conduit of conduits) {
      const dialog = dialogs.get(`archive-conduit-${conduit.id}`)!;
      expect(dialog.textContent).toContain(readableEffect(conduitEffect(conduit, 0)));
      expect(dialog.textContent).toContain(readableEffect(conduitEffect(conduit, 5)));
      expect(dialog.textContent?.replace(/[[\]]/g, '')).toContain(bracketReferences(conduit.lore, false).replace(/[[\]]/g, ''));
      expect(dialog.textContent?.replace(/[[\]]/g, '')).toContain(bracketReferences(conduit.power, false).replace(/[[\]]/g, ''));
      expect(dialog.querySelector('.conduit-details-art')?.classList.contains('unreached-character-art')).toBe(true);
    }
  });
});
