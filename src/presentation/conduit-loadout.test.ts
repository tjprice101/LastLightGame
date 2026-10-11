// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { emptyAccount, type Account } from '../game/account';
import { createCreatureCopy } from '../game/character-instances';
import { applyConduitSearch, conduitBuffLine, conduitLoadout, conduitMatchesSearch, conduitSummary, filledConduitSlots } from './conduit-loadout';
import { conduits, getConduit } from '../content/conduits';
import { referenceTeam } from './reference-team';
import { updateCharacterTab } from './hub';
import { getStarter } from '../content/starters';

function account(): Account {
  return { ...emptyAccount(), characters: { ember: { level: 12, evolution: 1 }, tide: { level: 20, evolution: 1 } }, squad: ['ember', 'tide'],
    conduits: { 'siegebound-drive': 1, 'vigil-core': 1, 'ward-stitch-spool': 1 }, conduitUpgrades: { 'siegebound-drive': 2 },
    conduitEquipment: { ember: ['siegebound-drive', null, null, null, null, null, null, null] } };
}

describe('Conduit loadout (D-229)', () => {
  it('shows filled slot cards with art, level, next level, upgrade and unequip actions', () => {
    const wallet = account();
    const before = structuredClone(wallet);
    const html = conduitLoadout('ember', 'Infernis', 'infernic', wallet);
    expect(html).toContain('Infernis · Conduits');
    expect(html).toContain('class="loadout-back" data-team-detail="ember">← Back to Infernis</button>');
    expect(html).toContain('1 of 8 slots filled');
    expect(html).toContain('Loadout · 1 of 8');
    expect(html.match(/data-conduit-slot=/g)).toHaveLength(8);
    expect(html.match(/class="ref-equipment-slot loadout-slot is-empty"/g)).toHaveLength(7);
    expect(html).toContain('Slot 2 · Empty');
    expect(html).toContain('conduit-icon-frame');
    expect(html).toContain('data-conduit-upgrade="2"');
    expect(html).toContain('+10% Attack');
    expect(html).toContain('Level 2 of 5 · next level +12.5% Attack');
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
    expect(html).toContain('Element mismatch');
    const full = account();
    full.conduitEquipment = { ember: conduits.filter((entry) => !entry.element && entry.id !== 'vigil-core').slice(0, 8).map((entry) => entry.id) };
    const fullHtml = conduitLoadout('ember', 'Infernis', 'infernic', full);
    expect(fullHtml).toContain('8 of 8 slots filled');
    expect(fullHtml).toMatch(/data-loadout-equip="vigil-core"[^>]*data-loadout-target="-1" disabled/);
    expect(fullHtml).toContain('All slots full');
  });

  it('totals actual stat changes with before and after values', () => {
    const html = conduitLoadout('ember', 'Infernis', 'infernic', account());
    expect(html).toContain('Total bonuses');
    expect(html).toMatch(/<span>Attack<\/span><strong><span class="stat-change stat-change--increase">\+10%<\/span> · <span class="loadout-base-stat">[\d,.]+<\/span> → <span class="stat-change stat-change--increase">[\d,.]+<\/span><\/strong>/);
    expect(conduitLoadout('tide', 'Tizu', 'oceanic', account())).toContain('No stat changes yet');
  });

  it('marks actual penalties red and gains green without changing the displayed values', () => {
    const wallet = account();
    wallet.conduitEquipment = { ember: ['siege-cantilever', null, null, null, null, null, null, null] };
    const html = conduitLoadout('ember', 'Infernis', 'infernic', wallet);
    expect(html).toMatch(/<span>Attack<\/span><strong><span class="stat-change stat-change--increase">\+85%<\/span> · <span class="loadout-base-stat">[\d,.]+<\/span> → <span class="stat-change stat-change--increase">[\d,.]+<\/span><\/strong>/);
    expect(html).toMatch(/<span>Defense<\/span><strong><span class="stat-change stat-change--decrease">-10%<\/span> · <span class="loadout-base-stat">[\d,.]+<\/span> → <span class="stat-change stat-change--decrease">[\d,.]+<\/span><\/strong>/);
  });

  it('colors net results relative to the unequipped base, not an individual penalty', () => {
    const wallet = account();
    wallet.conduitEquipment = { ember: ['siege-cantilever', 'bastion-lock', null, null, null, null, null, null] };
    wallet.conduitUpgrades = { 'bastion-lock': 5 };
    const dom = document.createElement('div');
    dom.innerHTML = conduitLoadout('ember', 'Infernis', 'infernic', wallet);
    const defense = Array.from(dom.querySelectorAll('.loadout-bonus-row')).find(row => row.firstElementChild?.textContent === 'Defense')!;
    expect(defense.querySelectorAll('.stat-change--increase')).toHaveLength(2);
    expect(defense.querySelector('.stat-change--decrease')).toBeNull();
    expect(defense.querySelector('.loadout-base-stat')?.classList.contains('stat-change')).toBe(false);
    wallet.conduitUpgrades = { 'bastion-lock': 2 };
    const lower = document.createElement('div');
    lower.innerHTML = conduitLoadout('ember', 'Infernis', 'infernic', wallet);
    const lowerDefense = Array.from(lower.querySelectorAll('.loadout-bonus-row')).find(row => row.firstElementChild?.textContent === 'Defense')!;
    expect(lowerDefense.querySelectorAll('.stat-change--decrease')).toHaveLength(2);
    wallet.conduitEquipment = {};
    const equal = document.createElement('div');
    equal.innerHTML = conduitLoadout('ember', 'Infernis', 'infernic', wallet);
    expect(equal.querySelectorAll('.stat-change')).toHaveLength(0);
  });

  it.each([
    ['siegebound-drive', '  SIEGEBOUND  ', true],
    ['siegebound-drive', 'interlocking gears', true],
    ['siegebound-drive', 'attack mechanical', true],
    ['siegebound-drive', 'any element', true],
    ['siegebound-drive', 'oceanic', false],
    ['infernic-cinder-testament', 'infernic burn', true],
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
    expect(conduitBuffLine(getConduit('parallax-relay'))).toBe('+2 pts Critical rate');
    expect(conduitBuffLine(getConduit('siegebound-drive'), 2)).toBe('+10% Attack');
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
    expect(detail).toContain('<span data-conduit-count>1/8</span>');
  });

  it('summarizes equipped Conduits on the overview with an open-full-view action', () => {
    const summary = conduitSummary('ember', account());
    expect(summary).toContain('Conduits · 1 of 8');
    expect(summary).toContain('Siegebound Drive');
    expect(summary.match(/data-open-loadout/g)).toHaveLength(2);
    expect(conduitSummary('tide', account())).toContain('No Conduits equipped.');
    const overview = referenceTeam(account(), { view: 'detail', selected: 'ember', element: '', sort: 'level' });
    expect(overview).toContain('loadout-summary');
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
});
