// @vitest-environment jsdom
import { radiantConduitDescription, radiantConduitEffectLines, radiantSummedConduitEffects } from '../content/conduit-effect-text';
import { radiantGearAmount } from '../content/conduit-effects';
import { beforeEach, describe, expect, it } from 'vitest';
import { emptyAccount, type Account } from '../game/account';
import { createCreatureCopy } from '../game/character-instances';
import { applyConduitSearch, bindConduitLoadout, conduitBuffLine, conduitLoadout, conduitLoadoutPageSize, conduitLoadoutView, conduitMatchesSearch, conduitRuleText, conduitSummary, filledConduitSlots, refreshConduitLoadout, resetConduitLoadoutView } from './conduit-loadout';
import { conduits, getConduit, conduitEffect } from '../content/conduits';
import { referenceTeam } from './reference-team';
import { updateCharacterTab } from './hub';
import { getStarter } from '../content/starters';
import { readableEffect, referencedEffect } from './effect-copy';

function account(): Account {
  return { ...emptyAccount(), characters: { ember: { level: 12, evolution: 1 }, tide: { level: 20, evolution: 1 } }, squad: ['ember', 'tide'],
    conduits: { 'siegebound-drive': 1, 'vigil-core': 1, 'ward-stitch-spool': 1 }, conduitUpgrades: { 'siegebound-drive': 2 },
    conduitEquipment: { ember: ['siegebound-drive', null, null, null, null, null, null, null] } };
}

describe('Conduit loadout (D-229)', () => {
  beforeEach(() => resetConduitLoadoutView());

  it('offers Unequip All directly in the loadout and enables it for ordinary, Master-only and captured gear', () => {
    const wallet = account();
    const host = document.createElement('div');
    const button = () => host.querySelector<HTMLButtonElement>('[data-loadout-clear]')!;
    host.innerHTML = conduitLoadout('ember', 'Infernis', 'infernic', wallet);
    expect(button().disabled).toBe(false);
    expect(button().textContent).toBe('Unequip All');
    expect(button().dataset.loadoutOwner).toBe('ember');
    expect(button().getAttribute('aria-label')).toContain('including Master');
    expect(button().closest('.loadout-slots')).not.toBeNull();
    wallet.conduitEquipment = {};
    host.innerHTML = conduitLoadout('ember', 'Infernis', 'infernic', wallet);
    expect(button().disabled).toBe(true);
    wallet.masterEquipment = { ember: 'master-ember-1' };
    host.innerHTML = conduitLoadout('ember', 'Infernis', 'infernic', wallet);
    expect(button().disabled).toBe(false);
    const copy = createCreatureCopy('infusion:treasury:0');
    wallet.capturedCharacters = [copy];
    wallet.conduitEquipment = { [copy.instanceId]: ['vigil-core', null, null, null, null, null, null, null] };
    host.innerHTML = conduitLoadout(copy.instanceId, 'Copy', 'tranquilitic', wallet);
    expect(button().disabled).toBe(false);
    expect(button().getAttribute('aria-label')).not.toContain('Master');
    host.innerHTML = conduitLoadout('ember', 'Infernis', 'infernic', null);
    expect(button().disabled).toBe(true);
  });

  it('shows filled slot cards with art, level, next level, upgrade and unequip actions', () => {
    const wallet = account();
    const before = structuredClone(wallet);
    const html = conduitLoadout('ember', 'Infernis', 'infernic', wallet);
    expect(html).toContain('Infernis · Conduits');
    expect(html).toContain('class="loadout-back" data-team-detail="ember">← Back to Infernis</button>');
    expect(html).toContain('1 of 8 slots filled');
    expect(html).toContain('Loadout · 1 of 8');
    expect(html.match(/data-page="conduit-store"/g)).toHaveLength(1);
    expect(html).not.toContain('loadout-heading-links');
    expect(html.match(/data-page="conduit-upgrade"/g)).toHaveLength(1);
    expect(html.match(/data-conduit-slot=/g)).toHaveLength(8);
    expect(html.match(/class="ref-equipment-slot loadout-slot is-empty"/g)).toHaveLength(7);
    expect(html).toContain('Slot 2 · Empty');
    expect(html).toContain('conduit-icon-frame');
    expect(html).toContain('data-conduit-upgrade="2"');
    expect(html).toContain('data-loadout-rule="siegebound-drive" data-loadout-detail-level="2"');
    expect(html).toContain(`Level 2 of 5 · next level ${referencedEffect(conduitEffect(getConduit('siegebound-drive'), 3))}`);
    expect(html).toContain('data-page="conduit-upgrade" data-upgrade-target="siegebound-drive"');
    expect(html).toContain('data-loadout-unequip="0" data-loadout-owner="ember"');
    expect(html).toContain('data-master-equipment="ember"');
    expect(wallet).toEqual(before);
  });

  it('lists owned Conduits with equipped chips, first-empty equip targets and gray disabled reasons', () => {
    const html = conduitLoadout('ember', 'Infernis', 'infernic', account());
    expect(html).toContain('Your Conduits · 3');
    expect(html).toContain('Equipped on this character');
    expect(html).toContain('data-loadout-equip="vigil-core" data-loadout-owner="ember" data-loadout-target="1" >');
    expect(html).toMatch(/data-loadout-equip="ward-stitch-spool"[^>]*disabled/);
    expect(html).toContain('Requires Oceanic');
    const full = account();
    full.conduitEquipment = { ember: conduits.filter((entry) => !entry.element && entry.id !== 'vigil-core').slice(0, 8).map((entry) => entry.id) };
    const fullHtml = conduitLoadout('ember', 'Infernis', 'infernic', full);
    expect(fullHtml).toContain('8 of 8 slots filled');
    expect(fullHtml).toMatch(/data-loadout-equip="vigil-core"[^>]*data-loadout-target="-1" disabled/);
    expect(fullHtml).toContain('All slots full');
  });

  it('sums equipped Radiant effects at their saved ranks', () => {
    const wallet = account();
    wallet.conduitEquipment = { ember: ['vigil-core', null, null, null, null, null, null, null] };
    const dom = document.createElement('div');
    dom.innerHTML = conduitLoadout('ember', 'Infernis', 'infernic', wallet);
    expect(dom.querySelector('.loadout-bonus-heading')?.textContent).toBe('Combined effects');
    expect(dom.querySelector('[data-radiant-effect="hp"]')?.textContent).toBe('Maximum [Health] +20%.');
    expect(conduitLoadout('tide', 'Tizu', 'oceanic', account())).toContain('No combined modifiers yet');
    wallet.conduitEquipment = { ember: ['wardglass-transformer', 'bastion-lock', null, null, null, null, null, null] };
    wallet.conduitUpgrades = { 'bastion-lock': 5 };
    dom.innerHTML = conduitLoadout('ember', 'Infernis', 'infernic', wallet);
    const gear = [{ id: 'wardglass-transformer', rank: 0 }, { id: 'bastion-lock', rank: 5 }] as const;
    for (const kind of radiantSummedConduitEffects) {
      const amount = radiantGearAmount([...gear], kind);
      const row = dom.querySelector(`[data-radiant-effect="${kind}"]`);
      if (!amount) expect(row).toBeNull();
      else expect(row?.textContent?.replace(/[[\]]/g, '')).toBe(readableEffect(radiantConduitDescription({ kind, amount })));
    }
    expect(dom.querySelectorAll('[data-radiant-effect]').length).toBeGreaterThan(0);
    expect(wallet.conduitUpgrades).toEqual({ 'bastion-lock': 5 });
  });
  it.each([
    ['siegebound-drive', '  SIEGEBOUND  ', true],
    ['siegebound-drive', 'interlocking gears', true],
    ['siegebound-drive', 'attack mechanical', true],
    ['siegebound-drive', 'any element', true],
    ['siegebound-drive', 'oceanic', false],
    ['infernic-cinder-testament', 'infernic attack', true],
    ['infernic-cinder-testament', 'omnic', true],
    ['infernic-cinder-testament', 'oceanic burn', false],
    ['siegebound-drive', '   ', true],
  ] as const)('searches %s for %s using all keywords (%s)', (id, query, matches) => {
    expect(conduitMatchesSearch(getConduit(id), query)).toBe(matches);
  });

  it('filters only the owned list, preserves controls and exposes counts/no results without account writes', () => {
    const wallet = account();
    const before = structuredClone(wallet);
    const host = document.createElement('div');
    host.innerHTML = conduitLoadout('ember', 'Infernis', 'infernic', wallet);
    const attackRow = host.querySelector<HTMLElement>('[data-loadout-conduit="siegebound-drive"]')!;
    const equip = host.querySelector<HTMLButtonElement>('[data-loadout-equip="vigil-core"]')!;
    applyConduitSearch(host, 'interlocking');
    expect(host.querySelector('[data-loadout-search-status]')?.textContent).toBe('Showing 1 of 3 Conduits');
    expect(attackRow.hidden).toBe(false);
    expect(host.querySelector<HTMLElement>('[data-loadout-conduit="vigil-core"]')?.hidden).toBe(true);
    expect(host.querySelectorAll('[data-loadout-slot]')).toHaveLength(8);
    expect(host.querySelector('[data-loadout-equip="vigil-core"]')).toBe(equip);
    applyConduitSearch(host, '<not-a-conduit>');
    expect(host.querySelector<HTMLElement>('[data-loadout-search-empty]')?.hidden).toBe(false);
    expect(host.querySelector('[data-loadout-search-status]')?.textContent).toBe('Showing 0 of 3 Conduits');
    expect(host.querySelector('not-a-conduit')).toBeNull();
    applyConduitSearch(host, '');
    expect(Array.from(host.querySelectorAll<HTMLElement>('[data-loadout-conduit]')).every(row => !row.hidden)).toBe(true);
    expect(host.querySelector<HTMLElement>('[data-loadout-search-empty]')?.hidden).toBe(true);
    expect(equip.disabled).toBe(false);
    expect(wallet).toEqual(before);
  });

  it('retains the search through the Element-Bearer equipment refresh', () => {
    const wallet = account();
    const host = document.createElement('div');
    host.innerHTML = referenceTeam(wallet, { view: 'conduits', selected: 'ember', element: '', sort: 'level' });
    applyConduitSearch(host, 'attack');
    updateCharacterTab(host, getStarter('ember'), 'equipment', wallet);
    expect(host.querySelector<HTMLInputElement>('[data-loadout-search]')?.value).toBe('attack');
    expect(host.querySelector('[data-loadout-search-status]')?.textContent).toBe('Showing 1 of 3 Conduits');
    expect(host.querySelector<HTMLElement>('[data-loadout-conduit="vigil-core"]')?.hidden).toBe(true);
  });

  it('distinguishes no owned Conduits from an unsuccessful search', () => {
    const host = document.createElement('div');
    host.innerHTML = conduitLoadout('ember', 'Infernis', 'infernic', emptyAccount());
    applyConduitSearch(host, 'shield');
    expect(host.textContent).toContain('You do not own any Conduits yet');
    expect(host.querySelector('[data-loadout-search-status]')?.textContent).toBe('Showing 0 of 0 Conduits');
    expect(host.querySelector<HTMLElement>('[data-loadout-search-empty]')?.hidden).toBe(true);
  });

  it('formats compact buff lines and counts filled slots', () => {
    expect(conduitBuffLine(getConduit('parallax-relay'))).toBe(radiantConduitEffectLines('parallax-relay').map(line => line.replace(/\.$/, '')).join(' · '));
    expect(conduitBuffLine(getConduit('vigil-core'), 2)).toBe('Maximum Health +24%');
    expect(filledConduitSlots('ember', account())).toBe(1);
    expect(filledConduitSlots('tide', account())).toBe(0);
  });

  it('opens a full page with squad tabs instead of the Team sidebar and character header', () => {
    const wallet = account();
    const before = structuredClone(wallet);
    const html = referenceTeam(wallet, { view: 'conduits', selected: 'ember', element: '', sort: 'level' });
    expect(html).toContain('ref-screen ref-team ref-conduit-page');
    expect(html).toContain('hub-detail ref-character-panels');
    expect(html).not.toContain('ref-team-sidebar');
    expect(html).not.toContain('ref-character-header');
    expect(html).not.toContain('ref-character-submenus');
    expect(html.match(/data-conduit-slot=/g)).toHaveLength(8);
    expect(html).toContain('data-team-detail="tide" data-team-tab="equipment" aria-pressed="false"');
    expect(html).toContain('data-team-detail="ember" data-team-tab="equipment" aria-pressed="true"');
    expect(wallet).toEqual(before);
    const detail = referenceTeam(wallet, { view: 'detail', selected: 'ember', element: '', sort: 'level' });
    expect(detail).not.toContain('data-conduit-count');
    expect(detail).toContain('data-character-tab="equipment"');
  });

  it('summarizes equipped Conduits on the overview with an open-full-view action', () => {
    const summary = conduitSummary('ember', account());
    expect(summary).toContain('Conduits · 1 of 8');
    expect(summary).toContain('Siegebound Drive');
    expect(summary.match(/data-open-loadout/g)).toHaveLength(2);
    expect(conduitSummary('tide', account())).toContain('No Conduits equipped.');
    const overview = referenceTeam(account(), { view: 'detail', selected: 'ember', element: '', sort: 'level' });
    expect(overview).not.toContain('loadout-summary');
  });

  it('uses captured-copy slot controls without a Master selector', () => {
    const wallet = account();
    const copy = createCreatureCopy('infusion:treasury:0', 1, 65);
    wallet.capturedCharacters = [copy];
    const html = conduitLoadout(copy.instanceId, 'Copy', 'tranquilitic', wallet);
    expect(html.match(new RegExp(`data-capture-conduit="${copy.instanceId}"`, 'g'))).toHaveLength(8);
    expect(html).not.toContain('data-master-equipment');
    expect(html).not.toContain('data-loadout-unequip');
  });

  it('opens a captured member full page with copy-specific Back, tabs and slot controls', () => {
    const wallet = account();
    const copy = createCreatureCopy('infusion:treasury:0', 1, 65);
    wallet.capturedCharacters = [copy];
    wallet.squad = ['ember', copy.instanceId];
    wallet.conduitEquipment![copy.instanceId] = ['vigil-core', null, null, null, null, null, null, null];
    const before = structuredClone(wallet);
    const html = referenceTeam(wallet, { view: 'capture-conduits', selected: 'ember', capture: copy.instanceId, element: '', sort: 'level' });
    expect(html).toContain('ref-screen ref-team ref-conduit-page');
    expect(html).toContain('hub-detail ref-character-panels');
    expect(html).not.toContain('ref-team-sidebar');
    expect(html).not.toContain('ref-character-header');
    expect(html).toContain(`class="loadout-back" data-team-capture-detail="${copy.instanceId}">← Back to`);
    expect(html).toContain(`data-team-capture-detail="${copy.instanceId}" data-team-tab="equipment" aria-pressed="true"`);
    expect(html.match(new RegExp(`data-capture-conduit="${copy.instanceId}"`, 'g'))).toHaveLength(8);
    expect(html).toContain(`data-loadout-unequip="0" data-loadout-owner="${copy.instanceId}"`);
    expect(html).not.toContain('data-master-equipment');
    expect(wallet).toEqual(before);
  });

  it('rejects unowned full-page selections instead of substituting a character', () => {
    expect(() => referenceTeam(account(), { view: 'conduits', selected: 'sprout', element: '', sort: 'level' })).toThrow('Choose an owned Element-Bearer.');
    expect(() => referenceTeam(account(), { view: 'capture-conduits', selected: 'ember', capture: 'capture:missing', element: '', sort: 'level' })).toThrow('Choose an owned captured Elemental-Devourer.');
  });

  it('disables controls without an account', () => {
    const html = conduitLoadout('ember', 'Infernis', 'infernic', null);
    expect(html).toContain('Equipment unavailable');
    expect(html).toContain('You do not own any Conduits yet');
  });

  function fullAccount(): Account {
    const wallet = account();
    wallet.conduits = Object.fromEntries(conduits.map((entry) => [entry.id, 1]));
    return wallet;
  }
  const visibleIds = (host: HTMLElement) => Array.from(host.querySelectorAll<HTMLElement>('[data-loadout-conduit]')).filter(row => !row.hidden).map(row => row.dataset.loadoutConduit);
  const click = (host: HTMLElement, selector: string) => host.querySelector<HTMLElement>(selector)!.click();

  it('renders a compact page: Master row, 4x2 slot grid, bonus strip inside the loadout and a paginated list', () => {
    const wallet = fullAccount();
    wallet.masterConduits = { 'master-ember-1': 1 } as Account['masterConduits'];
    wallet.masterEquipment = { ember: 'master-ember-1' } as Account['masterEquipment'];
    const host = document.createElement('div');
    host.innerHTML = conduitLoadout('ember', 'Infernis', 'infernic', wallet);
    const loadout = host.querySelector('.loadout-slots')!;
    expect(loadout.querySelector('.ref-master-slot.loadout-master [data-master-equipment="ember"]')).not.toBeNull();
    expect(loadout.querySelector('[data-loadout-master-rule="master-ember-1"]')).not.toBeNull();
    expect(loadout.querySelectorAll('.loadout-grid > [data-loadout-slot]')).toHaveLength(8);
    expect(loadout.querySelector('.loadout-bonuses')?.textContent).toContain('Combined effects');
    expect(loadout.querySelectorAll('.loadout-bonuses [data-radiant-effect]').length).toBeGreaterThan(0);
    expect(host.querySelectorAll('.loadout-slot.is-empty .loadout-slot-plus [data-conduit-slot]')).toHaveLength(7);
    expect(host.querySelector('[data-loadout-unequip="0"]')?.textContent).toBe('Remove');
    expect(host.querySelector('.loadout-owned-list.ref-scroll')).toBeNull();
    const rows = host.querySelectorAll<HTMLElement>('[data-loadout-conduit]');
    expect(rows).toHaveLength(conduits.length);
    applyConduitSearch(host, '');
    expect(visibleIds(host)).toHaveLength(conduitLoadoutPageSize);
    expect(host.querySelector('[data-loadout-page-status]')?.textContent).toBe(`Page 1 of ${Math.ceil(conduits.length / conduitLoadoutPageSize)}`);
    expect(host.querySelector<HTMLButtonElement>('[data-loadout-page="previous"]')?.disabled).toBe(true);
    expect(host.querySelector('[data-loadout-target-cue]')?.textContent).toBe('Equipping to Slot 2');
  });

  it('pages, filters and sorts through the binder, survives re-renders and never writes the account', () => {
    const wallet = fullAccount();
    const before = structuredClone(wallet);
    const host = document.createElement('div');
    host.innerHTML = conduitLoadout('ember', 'Infernis', 'infernic', wallet);
    bindConduitLoadout(host);
    bindConduitLoadout(host);
    const first = visibleIds(host);
    click(host, '[data-loadout-page="next"]');
    expect(conduitLoadoutView().page).toBe(1);
    const second = visibleIds(host);
    expect(second).toHaveLength(conduitLoadoutPageSize);
    expect(second.some(id => first.includes(id))).toBe(false);
    host.innerHTML = conduitLoadout('ember', 'Infernis', 'infernic', wallet);
    applyConduitSearch(host, '');
    expect(visibleIds(host)).toEqual(second);
    expect(host.querySelector('[data-loadout-page-status]')?.textContent).toMatch(/^Page 2 of /);
    applyConduitSearch(host, 'attack');
    expect(conduitLoadoutView().page).toBe(0);
    click(host, '[data-loadout-rarity="Omnic"]');
    expect(host.querySelector('[data-loadout-rarity="Omnic"]')?.getAttribute('aria-pressed')).toBe('true');
    const omnic = visibleIds(host);
    expect(omnic.length).toBeGreaterThan(0);
    expect(omnic.every(id => getConduit(id as never).rarity === 'Omnic')).toBe(true);
    click(host, '[data-loadout-rarity=""]');
    click(host, '[data-loadout-equipment-filter="equipped"]');
    applyConduitSearch(host, '');
    expect(visibleIds(host)).toEqual(['siegebound-drive']);
    expect(host.querySelector('[data-loadout-search-status]')?.textContent).toBe(`Showing 1 of ${conduits.length} Conduits`);
    click(host, '[data-loadout-equipment-filter="unequipped"]');
    expect(visibleIds(host)).not.toContain('siegebound-drive');
    click(host, '[data-loadout-equipment-filter="all"]');
    const sort = host.querySelector<HTMLSelectElement>('[data-loadout-sort]')!;
    sort.value = 'name';
    sort.dispatchEvent(new Event('change', { bubbles: true }));
    const names = Array.from(host.querySelectorAll<HTMLElement>('[data-loadout-conduit]')).map(row => row.dataset.loadoutName!);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    expect(conduitLoadoutView().sort).toBe('name');
    host.innerHTML = conduitLoadout('ember', 'Infernis', 'infernic', wallet);
    expect(host.querySelector<HTMLSelectElement>('[data-loadout-sort]')?.value).toBe('name');
    sort.value = 'rarity';
    host.querySelector<HTMLSelectElement>('[data-loadout-sort]')!.value = 'rarity';
    host.querySelector<HTMLSelectElement>('[data-loadout-sort]')!.dispatchEvent(new Event('change', { bubbles: true }));
    const rarities = visibleIds(host).map(id => getConduit(id as never).rarity);
    expect(rarities[0]).toBe('Calamitic');
    expect(wallet).toEqual(before);
  });

  it('changes the rarity filter only from the filter buttons, never from clicks inside a Conduit row', () => {
    const wallet = account();
    const host = document.createElement('div');
    document.body.append(host);
    host.innerHTML = conduitLoadout('ember', 'Infernis', 'infernic', wallet);
    bindConduitLoadout(host);
    host.querySelector<HTMLElement>('[data-loadout-conduit="vigil-core"] .loadout-owned-text')!.click();
    host.querySelector<HTMLButtonElement>('[data-loadout-equip="vigil-core"]')!.click();
    expect(conduitLoadoutView().rarity).toBe('');
    expect(host.querySelector('button[data-loadout-rarity=""]')?.getAttribute('aria-pressed')).toBe('true');
    host.remove();
  });

  it('refreshes equipment in place, keeping the screen, unchanged artwork and the chosen filters', () => {
    const wallet = account();
    const host = document.createElement('div');
    host.innerHTML = conduitLoadout('ember', 'Infernis', 'infernic', wallet);
    bindConduitLoadout(host);
    host.querySelector<HTMLButtonElement>('[data-loadout-equipment-filter="unequipped"]')!.click();
    host.querySelector<HTMLInputElement>('[data-loadout-search]')!.value = 'vigil';
    applyConduitSearch(host, 'vigil');
    const screen = host.querySelector('.conduit-loadout');
    const art = host.querySelector('[data-loadout-conduit="ward-stitch-spool"] img');
    const slotArt = host.querySelector('[data-loadout-slot="0"] img');
    wallet.conduitEquipment = { ember: ['siegebound-drive', 'vigil-core', null, null, null, null, null, null] };
    expect(refreshConduitLoadout(host, 'ember', 'Infernis', 'infernic', wallet)).toBe(true);
    expect(host.querySelector('.conduit-loadout')).toBe(screen);
    expect(host.querySelector('[data-loadout-conduit="ward-stitch-spool"] img')).toBe(art);
    expect(host.querySelector('[data-loadout-slot="0"] img')).toBe(slotArt);
    expect(host.querySelector('[data-loadout-slot="1"]')?.getAttribute('data-loadout-slot-name')).toBe(getConduit('vigil-core').name);
    expect(host.querySelector('[data-loadout-conduit="vigil-core"]')?.classList.contains('is-equipped')).toBe(true);
    expect(host.querySelector<HTMLInputElement>('[data-loadout-search]')!.value).toBe('vigil');
    expect(conduitLoadoutView().equipment).toBe('unequipped');
    expect(host.querySelector('[data-loadout-equipment-filter="unequipped"]')?.getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelector<HTMLElement>('[data-loadout-conduit="vigil-core"]')!.hidden).toBe(true);
    expect(refreshConduitLoadout(host, 'tide', 'Tizu', 'oceanic', wallet)).toBe(false);
  });

  it('selects a replacement target and propagates it to equip hooks with per-slot reasons', () => {
    const wallet = fullAccount();
    const host = document.createElement('div');
    host.innerHTML = conduitLoadout('ember', 'Infernis', 'infernic', wallet);
    bindConduitLoadout(host);
    applyConduitSearch(host, 'vigil');
    const vigil = () => host.querySelector<HTMLButtonElement>('[data-loadout-equip="vigil-core"]')!;
    expect(vigil().dataset.loadoutTarget).toBe('1');
    expect(vigil().textContent).toBe('Equip');
    click(host, '[data-loadout-select-slot="0"]');
    expect(host.querySelector('[data-loadout-select-slot="0"]')?.getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelector('[data-loadout-slot="0"]')?.classList.contains('is-target')).toBe(true);
    expect(host.querySelector('[data-loadout-target-cue]')?.textContent).toBe('Replacing Slot 1 · Siegebound Drive');
    expect(vigil().dataset.loadoutTarget).toBe('0');
    expect(vigil().dataset.loadoutOwner).toBe('ember');
    expect(vigil().textContent).toBe('Replace');
    expect(vigil().disabled).toBe(false);
    host.innerHTML = conduitLoadout('ember', 'Infernis', 'infernic', wallet);
    applyConduitSearch(host, 'vigil');
    expect(vigil().dataset.loadoutTarget).toBe('0');
    wallet.conduitEquipment = { ember: ['siegebound-drive', 'vigil-core', null, null, null, null, null, null] };
    host.innerHTML = conduitLoadout('ember', 'Infernis', 'infernic', wallet);
    applyConduitSearch(host, '');
    expect(host.querySelector('[data-loadout-target-cue]')?.textContent).toBe('Equipping to Slot 3');
    const full = account();
    full.conduitEquipment = { ember: conduits.filter((entry) => !entry.element && entry.id !== 'vigil-core').slice(0, 8).map((entry) => entry.id) };
    host.innerHTML = conduitLoadout('ember', 'Infernis', 'infernic', full);
    applyConduitSearch(host, '');
    expect(host.querySelector('[data-loadout-target-cue]')?.textContent).toBe('All slots full · select a slot to replace');
    expect(vigil().disabled).toBe(true);
    click(host, '[data-loadout-select-slot="3"]');
    expect(vigil().dataset.loadoutTarget).toBe('3');
    expect(vigil().disabled).toBe(false);
    const mismatch = host.querySelector<HTMLButtonElement>('[data-loadout-equip="ward-stitch-spool"]')!;
    expect(mismatch.disabled).toBe(true);
    expect(mismatch.closest('[data-loadout-conduit]')?.querySelector('[data-loadout-reason]')?.textContent).toBe('Requires Oceanic');
  });

  it('keeps no-account equip buttons disabled even when a target is chosen', () => {
    const host = document.createElement('div');
    host.innerHTML = conduitLoadout('ember', 'Infernis', 'infernic', null);
    bindConduitLoadout(host);
    expect(host.querySelectorAll('[data-loadout-equip]:not(:disabled)')).toHaveLength(0);
  });

  it('exposes long kit rules through an accessible detail button instead of card prose', () => {
    const kit = conduits.find((entry) => conduitRuleText(entry));
    expect(kit).toBeDefined();
    const wallet = account();
    wallet.conduits = { [kit!.id]: 1 } as Account['conduits'];
    const html = conduitLoadout('ember', 'Infernis', kit!.element ?? 'infernic', wallet);
    expect(html).toContain(`data-loadout-rule="${kit!.id}"`);
    expect(html).not.toContain(conduitRuleText(kit!)!);
    expect(conduitRuleText(getConduit('siegebound-drive'))).toBe(referencedEffect(conduitEffect(getConduit('siegebound-drive'))));
  });

  it('opens complete upgraded Omnic stats and mechanics in a Details dialog', async () => {
    const conduit = getConduit('infernic-phoenix-reactor');
    const wallet = account();
    wallet.conduits = { [conduit.id]: 1 };
    wallet.conduitUpgrades = { [conduit.id]: 5 };
    const host = document.createElement('div');
    document.body.append(host);
    host.innerHTML = conduitLoadout('ember', 'Infernis', 'infernic', wallet);
    const prototype = HTMLDialogElement.prototype;
    const show = Object.getOwnPropertyDescriptor(prototype, 'showModal');
    const close = Object.getOwnPropertyDescriptor(prototype, 'close');
    Object.defineProperty(prototype, 'showModal', { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } });
    Object.defineProperty(prototype, 'close', { configurable: true, value: function (this: HTMLDialogElement) {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    } });
    try {
      bindConduitLoadout(host);
      const button = host.querySelector<HTMLButtonElement>(`[data-loadout-rule="${conduit.id}"]`)!;
      button.focus();
      button.click();
      const dialog = document.querySelector<HTMLDialogElement>('.game-dialog')!;
      expect(dialog.open).toBe(true);
      expect(dialog.textContent).toContain('Level 5 of 5');
      expect(dialog.textContent).toContain(referencedEffect(conduitEffect(conduit, 5)));
      expect(dialog.textContent).toContain('Maximum 4 Omnic');
      const lore = dialog.querySelector<HTMLDetailsElement>('.conduit-lore-disclosure')!;
      expect(lore.open).toBe(false);
      expect(lore.querySelector('summary')?.textContent).toBe('Lore');
      expect(lore.querySelector('.conduit-lore')?.textContent).toBe(conduit.lore);
      expect(dialog.querySelector('.info-item-header h3')?.textContent).toBe(conduit.name);
      expect(dialog.querySelector('.info-effects')?.textContent).toContain(referencedEffect(conduitEffect(conduit, 5)));
      lore.open = true;
      expect(lore.open).toBe(true);
      dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await Promise.resolve();
      expect(document.querySelector('.game-dialog')).toBeNull();
      expect(document.activeElement).toBe(button);
    } finally {
      if (show) Object.defineProperty(prototype, 'showModal', show);
      else Reflect.deleteProperty(prototype, 'showModal');
      if (close) Object.defineProperty(prototype, 'close', close);
      else Reflect.deleteProperty(prototype, 'close');
      host.remove();
    }
  });
});
