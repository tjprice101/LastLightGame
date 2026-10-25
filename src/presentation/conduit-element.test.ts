// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { conduits } from '../content/conduits';
import { getElement } from '../content/activities';
import { elementAccents } from '../content/dungeon-art';
import { getStarter, starters } from '../content/starters';
import { masterConduits } from '../content/master-conduits';
import { emptyAccount, type Account } from '../game/account';
import { conduitDetails, conduitIcon, conduitRarity } from './conduit-store';
import { conduitElement, createConduitElement, omnicTheme } from './conduit-element';
import { inventoryView } from './inventory';
import { archives } from './archives';
import { conduitLoadout, conduitSummary } from './conduit-loadout';
import { conduitUpgradeMenu } from './conduit-upgrade';
import { machineLootFocus } from './machine-loot-focus';
import { stageLootContent } from './stage-loot';
import { conduitReward } from './conduit-presentation';
import { masterChestIcon, masterConduitIcon, masterReference, masterReward } from './master-conduits';
import { lootBurst } from './battle-loot';
import type { BattleEvent } from '../game/battle';
import { bindSelectionPanels } from './selection-panel';

const omnics = conduits.filter(entry => entry.rarity === 'Omnic');
function parse(html: string): HTMLDivElement {
  const host = document.createElement('div');
  host.innerHTML = html;
  return host;
}
function wallet(): Account {
  return { ...emptyAccount(), characters: Object.fromEntries(starters.map(entry => [entry.id, { level: 105, evolution: 6 }])),
    conduits: Object.fromEntries(conduits.map(entry => [entry.id, 1])),
    masterConduits: Object.fromEntries(masterConduits.map(entry => [entry.id, 1])) };
}

describe('Omnic element presentation (D-403)', () => {
  it('uses the canonical element and shared palette for all 45 Omnics, not legacy asset names', () => {
    expect(omnics).toHaveLength(45);
    for (const entry of omnics) {
      expect(entry.element).toBeDefined();
      const element = entry.element!;
      const host = parse(conduitDetails(entry.id, 3));
      const label = host.querySelector<HTMLElement>('strong.conduit-element-label')!;
      expect(label.textContent).toBe(getElement(element).name);
      expect(label.dataset.conduitElement).toBe(element);
      expect(label.style.getPropertyValue('--conduit-element-accent')).toBe(elementAccents[element]);
      expect(host.querySelector('.conduit-omnic')?.textContent).toBe('Omnic');
      expect(host.querySelector('.conduit-omnic .conduit-element-label')).toBeNull();
      expect(host.querySelector('.conduit-icon-frame')?.getAttribute('data-conduit-element')).toBe(element);
      expect(host.querySelector('.conduit-icon-frame')?.getAttribute('data-conduit-upgrade')).toBe('3');
      const liveLabel = createConduitElement(entry.id)!;
      expect(liveLabel.textContent).toBe(label.textContent);
      expect(liveLabel.dataset.conduitElement).toBe(element);
      expect(liveLabel.style.getPropertyValue('--conduit-element-accent')).toBe(elementAccents[element]);
    }
  });

  it('leaves other rarities unthemed and preserves art, meter and Omnic rarity styling', () => {
    for (const entry of conduits.filter(entry => entry.rarity !== 'Omnic')) {
      expect(conduitElement(entry.id)).toBe('');
      expect(omnicTheme(entry.id)).toBe('');
      expect(createConduitElement(entry.id)).toBeNull();
      expect(conduitIcon(entry.id)).not.toContain('data-conduit-element');
      expect(conduitRarity(entry.id)).not.toContain('conduit-element-label');
    }
    for (const entry of omnics) {
      const host = parse(conduitIcon(entry.id, 5));
      expect(host.querySelector('img')?.getAttribute('src')).toContain(`conduits/${entry.art}.png`);
      expect(host.querySelectorAll('.conduit-upgrade-meter > *')).toHaveLength(5);
      expect(host.querySelector('.conduit-icon-frame')?.getAttribute('role')).toBe('img');
    }
  });

  it('wires Inventory, Collections, upgrades, focus and stage loot without mutating holdings', () => {
    const account = wallet();
    const before = structuredClone(account);
    const surfaces = [
      { html: inventoryView(account), selector: '[data-inventory-conduit]' },
      { html: archives(account, 'conduits'), selector: '[data-archive-conduit]' },
      { html: machineLootFocus(account), selector: '.machine-focus-grid > li' },
      { html: stageLootContent({ kind: 'infusion', mode: 'machines' }, 35, account), selector: '[data-stage-loot-item]' },
    ];
    for (const surface of surfaces) {
      const host = parse(surface.html);
      const cards = Array.from(host.querySelectorAll(surface.selector)).filter(card => card.querySelector('.conduit-icon-frame[data-conduit-element]'));
      expect(cards).toHaveLength(45);
      for (const card of cards) {
        expect(card.querySelector(':scope strong.conduit-element-label')).not.toBeNull();
        if (card.hasAttribute('data-inventory-conduit')) {
          expect(card.querySelectorAll(':scope > :not(dialog)')).toHaveLength(5);
          expect(card.querySelector('.conduit-identity-badges .conduit-rarity')).not.toBeNull();
        }
      }
    }
    for (const entry of omnics) {
      const host = parse(conduitUpgradeMenu({ ...account, conduits: { [entry.id]: 1 } }, entry.id));
      expect(host.querySelector('.ref-upgrade-identity .conduit-element-label')?.textContent).toBe(getElement(entry.element!).name);
      const reward = conduitReward(entry.id, account, 'Unlocked', 'Saved receipt');
      expect(parse(reward.details).querySelector('.conduit-element-label')?.textContent).toBe(getElement(entry.element!).name);
    }
    expect(account).toEqual(before);
  });

  it('labels equipped slots, available rows and battle loadout summaries', () => {
    for (const entry of omnics) {
      const owner = starters.find(starter => starter.elementId === entry.element)!;
      const account: Account = { ...wallet(), conduits: { [entry.id]: 1 },
        conduitEquipment: { [owner.id]: [entry.id, null, null, null, null, null, null, null] } };
      const host = parse(conduitLoadout(owner.id, owner.name, owner.elementId, account));
      expect(host.querySelector('[data-loadout-slot="0"] .conduit-element-label')?.textContent).toBe(getElement(entry.element!).name);
      expect(host.querySelector(`[data-loadout-conduit="${entry.id}"] .conduit-element-label`)?.textContent).toBe(getElement(entry.element!).name);
      expect(conduitSummary(owner.id, account)).toContain(conduitElement(entry.id));
    }
  });

  it('uses the eligible bearer element for all 48 Omnic Masters and leaves chests generic', () => {
    const account = wallet();
    for (const entry of masterConduits) {
      const element = getStarter(entry.character).elementId;
      const art = parse(masterConduitIcon(entry.id));
      expect(art.querySelector('img')?.getAttribute('data-conduit-element')).toBe(element);
      expect(parse(masterReference(entry.id)).querySelector('.conduit-element-label')?.textContent).toBe(getElement(element).name);
      expect(parse(masterReward(entry.id, account).details).querySelector('.conduit-element-label')?.textContent).toBe(getElement(element).name);
    }
    expect(masterChestIcon()).not.toContain('data-conduit-element');
  });

  it('labels ordinary and personal Master selection choices without changing their backing values', () => {
    const ordinary = omnics[0];
    const master = masterConduits[0];
    const host = parse(`<label>Ordinary<select data-conduit-slot="0"><option value="${ordinary.id}">${ordinary.name}</option></select></label>
      <label>Master<select data-master-equipment="ember"><option value="${master.id}">${master.name}</option></select></label>`);
    document.body.append(host);
    const unbind = bindSelectionPanels(host);
    const dialog = document.querySelector<HTMLDialogElement>('.selection-modal')!;
    dialog.showModal = () => { dialog.open = true; };
    dialog.close = () => { dialog.open = false; dialog.dispatchEvent(new Event('close')); };
    try {
      const triggers = host.querySelectorAll<HTMLButtonElement>('.selection-trigger');
      for (const [index, element] of [ordinary.element!, getStarter(master.character).elementId].entries()) {
        triggers[index].click();
        expect(dialog.querySelector('.selection-option .conduit-element-label')?.textContent).toBe(getElement(element).name);
        dialog.close();
      }
      expect(host.querySelector<HTMLSelectElement>('[data-conduit-slot]')?.value).toBe(ordinary.id);
      expect(host.querySelector<HTMLSelectElement>('[data-master-equipment]')?.value).toBe(master.id);
    } finally {
      unbind();
      host.remove();
    }
  });

  it('adds bold badges to actual floating Omnic rewards without altering the saved event', () => {
    const event: BattleEvent = { kind: 'reward', source: 'enemy', target: '', amount: 5, critical: false,
      message: 'Saved', conduits: Object.fromEntries(omnics.map(entry => [entry.id, 1])) };
    const before = structuredClone(event);
    const burst = lootBurst(event, () => .5);
    expect(burst.querySelectorAll('.conduit-element-label')).toHaveLength(45);
    expect(burst.querySelector('.loot-drop .loot-beam')).not.toBeNull();
    expect(event).toEqual(before);
  });
});
