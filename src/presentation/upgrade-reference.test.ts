// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { creatureSaleOffer, emptyAccount } from '../game/account';
import { getStarter, starters } from '../content/starters';
import { characterEvolutionCost, characterLevelCost, characterLevelCap } from '../content/progression';
import { materialName } from '../content/dungeon-art';
import { bindCaptureTabs, referenceTeam } from './reference-team';
import { createCreatureCopy, capturedProgress, capturedLevelCost, resolveCapturedFighter } from '../game/character-instances';
import { getCreature } from '../content/creatures';
import { statChange } from './stat-change';
import { saleControls } from './creature-sale';
import { updateCharacterTab, updateEvolutionSelection } from './hub';
import { celebrateUpgrade } from './upgrade-celebration';
import { presentUpgrade } from './upgrade-result';
import { presentReward } from './reward-screen';
import { reducedMotion } from './settings';
import { bindInformation } from './information';
import { archives } from './archives';
import { characterName } from '../content/character-art';
import { elementLabel } from './element-label';
import { phaseZeroStatKeys, statDisplayUnit } from '../content/phase-zero-stats';

vi.mock('./reward-screen', () => ({ presentReward: vi.fn().mockResolvedValue(undefined) }));
vi.mock('./settings', () => ({ reducedMotion: vi.fn(() => false) }));
afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
  vi.mocked(reducedMotion).mockReturnValue(false);
  document.body.replaceChildren();
});

describe('reference Team upgrade presentation', () => {
  it('shows the matching element medal for every bearer and preserves it across tab refreshes', () => {
    for (const starter of starters) {
      const account = emptyAccount();
      account.characters[starter.id] = { level: 0, evolution: 1 };
      const host = document.createElement('main');
      host.innerHTML = referenceTeam(account, { view: 'detail', selected: starter.id, element: '', sort: 'level' });
      const medal = host.querySelector('.ref-character-identity .element-label')!;
      const expected = document.createElement('div');
      expected.innerHTML = elementLabel(starter.elementId);
      expect(medal.outerHTML).toBe(expected.innerHTML);
      const image = medal.querySelector('img');
      updateCharacterTab(host, starter, 'upgrade-1', account);
      expect(host.querySelector('.ref-character-identity .element-emblem')).toBe(image);
      expect(host.querySelector('[data-reference-prefix]')?.textContent).toContain(starter.weapon);
    }
  });

  it('shows captured members actual combat-element medals', () => {
    for (const id of ['infusion:heavens:0', 'infusion:abyss:0', 'infusion:roses:2']) {
      const account = emptyAccount();
      const copy = createCreatureCopy(id);
      account.capturedCharacters = [copy];
      account.squad = [copy.instanceId];
      const host = document.createElement('main');
      host.innerHTML = referenceTeam(account, { view: 'capture', selected: 'ember', capture: copy.instanceId, element: '', sort: 'level' });
      expect(host.querySelector('.ref-character-identity .element-label')?.getAttribute('data-element')).toBe(getCreature(id).element);
      expect(host.querySelector('.ref-character-identity .element-emblem')).not.toBeNull();
    }
  });
  it('gives evolution copies a full-width picker with exact eligibility and live selection progress', () => {
    const account = emptyAccount();
    account.characters.rosetta = { level: 60, evolution: 3 };
    account.fractalis = 100000;
    account.materials = { 'rosethorn-uncommon': 100, 'rosethorn-rare': 100 };
    const wrong = createCreatureCopy('infusion:sanctuary:0');
    const first = createCreatureCopy('infusion:roses:2');
    const second = createCreatureCopy('infusion:roses:3');
    const locked = { ...createCreatureCopy('infusion:roses:2'), locked: true };
    account.capturedCharacters = [wrong, first, locked, second];
    const before = structuredClone(account);
    const host = document.createElement('main');
    host.innerHTML = referenceTeam(account, { view: 'detail', selected: 'rosetta', tab: 'upgrade-0', element: '', sort: 'level' });
    const picker = host.querySelector<HTMLElement>('.evolution-fodder')!;
    expect(picker.parentElement?.classList.contains('ref-evolution-detail')).toBe(true);
    expect(picker.closest('.upgrade-payment')).toBeNull();
    expect(host.querySelectorAll('[data-evolution-fodder]')).toHaveLength(3);
    const checkboxes = Array.from(host.querySelectorAll<HTMLInputElement>('[data-evolution-fodder]'));
    expect(checkboxes.map(input => input.dataset.evolutionFodder)).toEqual([
      first.instanceId, second.instanceId, locked.instanceId,
    ]);
    expect(checkboxes.map(input => input.disabled)).toEqual([false, false, true]);
    expect(picker.textContent).not.toMatch(/Copy \d|Form \d/);
    expect(picker.querySelector('legend')?.textContent).toBe('Elemental-Devourers to consume \u00b7 3 Evolution Value');
    expect(picker.querySelector('p')?.textContent).toContain('adding up to 3 Evolution Value');
    expect(picker.textContent).toContain('Locked');
    expect(picker.textContent).toContain('permanently consumed');
    const button = host.querySelector<HTMLButtonElement>('[data-upgrade="evolve"]')!;
    const meter = host.querySelector<HTMLMeterElement>('[data-fodder-progress]')!;
    expect(button.disabled).toBe(true);
    expect(button.dataset.fodderValueRequired).toBe('3');
    expect(button.dataset.fodderCount).toBeUndefined();
    expect(checkboxes.map(input => input.dataset.fodderValue)).toEqual([
      String(capturedProgress(first).tier + 1), String(capturedProgress(second).tier + 1), String(capturedProgress(locked).tier + 1),
    ]);
    expect(meter.max).toBe(3);
    expect(meter.value).toBe(0);
    checkboxes[0].checked = true;
    updateEvolutionSelection(host);
    expect(button.disabled).toBe(false);
    expect(meter.value).toBe(capturedProgress(first).tier + 1);
    expect(picker.dataset.selectionState).toBe('complete');
    expect(host.querySelector('[data-fodder-status]')?.textContent).toBe(`${capturedProgress(first).tier + 1} / 3 value chosen \u00b7 2 available \u00b7 Ready to evolve`);
    checkboxes[1].checked = true;
    updateEvolutionSelection(host);
    expect(button.disabled).toBe(true);
    expect(picker.dataset.selectionState).toBe('excess');
    expect(host.querySelector('[data-fodder-status]')?.textContent).toContain('Remove extra Elemental-Devourers');
    checkboxes[1].checked = false;
    button.dataset.upgradeBlocked = 'true';
    updateEvolutionSelection(host);
    expect(button.disabled).toBe(true);
    checkboxes[0].checked = false;
    updateEvolutionSelection(host);
    expect(picker.dataset.selectionState).toBe('incomplete');
    expect(meter.value).toBe(0);
    expect(account).toEqual(before);
    expect(() => updateEvolutionSelection(document.createElement('div'))).toThrow('controls are missing');
  });

  it('explains insufficient eligible copies without hiding protected copies', () => {
    const account = emptyAccount();
    account.characters.rosetta = { level: 75, evolution: 4 };
    account.capturedCharacters = [{ ...createCreatureCopy('infusion:roses:3'), locked: true }];
    const host = document.createElement('main');
    host.innerHTML = referenceTeam(account, { view: 'detail', selected: 'rosetta', tab: 'upgrade-0', element: '', sort: 'level' });
    expect(host.querySelector('.evolution-fodder-empty')?.textContent).toContain('You need 8 more Evolution Value. Capture more in [Passion of Crimson Roses].');
    expect(host.querySelectorAll('[data-evolution-fodder]:disabled')).toHaveLength(1);
    expect(host.querySelector('.evolution-fodder-list')?.textContent).toContain('Locked');
    expect(host.querySelector('[data-fodder-status]')?.textContent).toBe('0 / 8 value chosen \u00b7 0 available');
  });
  it.each(['infusion:heavens:0', 'infusion:abyss:3', 'infusion:treasury:2', 'infusion:sanctuary:0', 'infusion:roses:2'])('opens exact per-copy Quick Sell choices for %s without changing ownership', creatureId => {
    const account = emptyAccount();
    account.characters.ember = { level: 0, evolution: 1 };
    account.squad = ['ember'];
    const first = createCreatureCopy(creatureId, getCreature(creatureId).stages[0], 119);
    const locked = { ...first, instanceId: 'capture:00000000-0000-4000-8000-000000000001', locked: true };
    account.capturedCharacters = [first, locked];
    const before = structuredClone(account);
    const host = document.createElement('main');
    host.innerHTML = referenceTeam(account, { view: 'creatures', selected: 'ember', element: '', sort: 'level' });
    document.body.append(host);
    bindInformation(host);
    for (const copy of [first, locked]) {
      const trigger = host.querySelector<HTMLButtonElement>(`[data-information="quick-sale-${copy.instanceId}"]`)!;
      const dialog = document.getElementById(`quick-sale-${copy.instanceId}`) as HTMLDialogElement;
      expect(trigger.textContent).toBe('Quick Sell');
      const expected = document.createElement('div');
      expected.innerHTML = saleControls(creatureSaleOffer(account, copy.instanceId), copy.instanceId, 'Sell');
      expect(dialog.querySelector('.information-content')?.innerHTML).toContain(expected.innerHTML);
      dialog.showModal = vi.fn(() => dialog.setAttribute('open', ''));
      dialog.close = vi.fn(() => dialog.removeAttribute('open'));
      trigger.click();
      expect(dialog.showModal).toHaveBeenCalledOnce();
      const actions = dialog.querySelectorAll<HTMLButtonElement>('[data-sell-creature]');
      expect(actions.length).toBeGreaterThan(0);
      for (const button of Array.from(actions)) {
        expect(button.dataset.sellCreature).toBe(copy.instanceId);
        expect(button.disabled).toBe(copy.locked);
      }
      dialog.querySelector<HTMLButtonElement>('[data-close-information]')!.click();
      expect(dialog.close).toHaveBeenCalledOnce();
    }
    expect(account).toEqual(before);
  });
  it.each(['infusion:heavens:0', 'infusion:abyss:3', 'infusion:treasury:2', 'infusion:sanctuary:0', 'infusion:roses:2'])('switches %s panels without replacing its portrait, copy or controls', creatureId => {
    const account = emptyAccount();
    account.characters.ember = { level: 0, evolution: 1 };
    account.squad = ['ember'];
    const copy = createCreatureCopy(creatureId, getCreature(creatureId).stages[0], creatureId === 'infusion:heavens:0' ? 59 : undefined);
    account.capturedCharacters = [copy];
    const before = structuredClone(account);
    const host = document.createElement('div');
    host.innerHTML = referenceTeam(account, { view: 'capture', selected: 'ember', capture: copy.instanceId, element: '', sort: 'level' });
    const changed = vi.fn();
    bindCaptureTabs(host, changed);
    const image = host.querySelector('.ref-character-portrait img');
    const levelButton = host.querySelector('[data-level-capture]');
    const overview = host.querySelector<HTMLElement>('#capture-panel-overview')!;
    const level = host.querySelector<HTMLElement>('#capture-panel-upgrade-1')!;
    expect(overview.hidden).toBe(false);
    expect(level.hidden).toBe(true);
    host.querySelector<HTMLButtonElement>('[data-capture-tab="upgrade-1"]')!.click();
    expect(changed).toHaveBeenLastCalledWith('upgrade-1');
    expect(overview.hidden).toBe(true);
    expect(level.hidden).toBe(false);
    expect(host.querySelector('.ref-growth-detail')).not.toBeNull();
    if (capturedProgress(copy).level < 60) {
      expect(level.querySelectorAll('.upgrade-stat-preview > span')).toHaveLength(10);
      expect(level.textContent).toContain(`0 / ${capturedLevelCost(copy).fractalis}`);
      const beforeStats = resolveCapturedFighter(copy).stats;
      const afterStats = resolveCapturedFighter({ ...copy, level: 60 }).stats;
      for (const [index, key] of phaseZeroStatKeys.entries()) {
        const expected = document.createElement('div');
        expected.innerHTML = statChange(beforeStats[key]!, afterStats[key]!, statDisplayUnit(key));
        expect(level.querySelectorAll('.upgrade-stat-preview > span')[index].textContent).toContain(expected.textContent);
      }
      for (const [id, amount] of Object.entries(capturedLevelCost(copy).materials)) {
        const row = Array.from(level.querySelectorAll('.upgrade-resources li')).find(row => row.querySelector('strong')?.textContent === materialName(id));
        expect(row?.querySelector('span')?.textContent).toBe(`0 / ${amount}`);
      }
    } else {
      expect(level.textContent).toContain('Maximum level 60');
      expect(level.querySelector('[data-level-capture]')).toBeNull();
    }
    host.querySelector<HTMLButtonElement>('[data-capture-tab="sale"]')!.click();
    expect(host.querySelector<HTMLElement>('#capture-panel-sale')!.hidden).toBe(false);
    expect(host.querySelector('.ref-growth-detail')).toBeNull();
    expect(host.querySelector('.ref-character-portrait img')).toBe(image);
    expect(host.querySelector('[data-level-capture]')).toBe(levelButton);
    expect(host.querySelector('[data-character-tab="upgrade-0"]')).toBeNull();
    expect(host.querySelector('[data-open-loadout]')).not.toBeNull();
    expect(account).toEqual(before);
  });
  it('switches sub-menus in place and shows ability details only in their dialog', () => {
    const account = emptyAccount();
    account.characters.tide = { level: 0, evolution: 1 };
    account.squad = ['tide'];
    const host = document.createElement('main');
    host.innerHTML = referenceTeam(account, { view: 'detail', selected: 'tide', element: '', sort: 'level' });
    document.body.append(host);
    bindInformation(host);
    const header = host.querySelector('.ref-character-header');
    const portrait = header?.querySelector('img');
    const navigation = host.querySelector('.ref-character-submenus');
    const button = host.querySelector<HTMLButtonElement>('[data-information="character-tide-skill1"]')!;
    const dialog = host.querySelector<HTMLDialogElement>('#character-tide-skill1')!;
    dialog.showModal = vi.fn(() => dialog.setAttribute('open', ''));
    dialog.close = vi.fn(() => dialog.removeAttribute('open'));
    expect(button.textContent).not.toContain('Elemental Gauge');
    button.click();
    expect(dialog.showModal).toHaveBeenCalledOnce();
    expect(dialog.textContent).toContain('Costs 25 [Elemental Gauge]');
    expect(dialog.querySelector('[data-close-information]')?.getAttribute('aria-label')).toBe('Close Skill 1 details');
    expect(dialog.querySelector('[data-close-information]')?.textContent).toBe('×');
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(dialog.close).toHaveBeenCalledOnce();
    updateCharacterTab(host, getStarter('tide'), 'upgrade-1', account);
    expect(host.querySelector('.ref-growth-detail')).not.toBeNull();
    expect(host.querySelector('.ref-growth-action [data-max-level]')).not.toBeNull();
    expect(header?.querySelector('img')).toBe(portrait);
    updateCharacterTab(host, getStarter('tide'), 'upgrade-0', account);
    expect(host.querySelector('.ref-evolution-detail')).not.toBeNull();
    expect(header?.querySelector('img')).toBe(portrait);
    updateCharacterTab(host, getStarter('tide'), 'overview', account);
    expect(host.querySelector('.ref-growth-detail')).toBeNull();
    expect(host.querySelector('.ref-evolution-detail')).toBeNull();
    expect(host.querySelector('.ref-character-header')).toBe(header);
    updateCharacterTab(host, getStarter('tide'), 'equipment', account);
    expect(host.querySelector('.ref-character-header')).toBe(header);
    expect(header?.querySelector('img')).toBe(portrait);
    expect(host.querySelector('.ref-character-submenus')).toBe(navigation);
    expect(host.querySelectorAll('[data-conduit-slot]')).toHaveLength(8);
    expect(host.querySelector('[data-master-equipment]')).not.toBeNull();
    expect(host.querySelector('[data-character-tab="equipment"]')?.getAttribute('aria-pressed')).toBe('true');
  });

  it.each(starters)('$name shows exact level and evolution costs for every nonfinal form without changing the account', starter => {
    for (let evolution = 1; evolution <= 5; evolution++) {
      const account = emptyAccount();
      const progress = { level: characterLevelCap(evolution) - 1, evolution };
      account.characters[starter.id] = progress;
      account.squad = [starter.id];
      account.fractalis = Number.MAX_SAFE_INTEGER;
      const before = structuredClone(account);
      for (const [tab, cost] of [
        ['upgrade-1', characterLevelCost(starter.id, progress)],
        ['upgrade-0', characterEvolutionCost(starter.id, progress)],
      ] as const) {
        const host = document.createElement('div');
        host.innerHTML = referenceTeam(account, { view: 'detail', selected: starter.id, element: '', sort: 'level', tab });
        const resources = host.querySelector('.upgrade-resources')!;
        expect(resources.textContent).toContain(`${Number.MAX_SAFE_INTEGER} / ${cost.fractalis}`);
        for (const [id, amount] of Object.entries(cost.materials)) {
          const row = Array.from(resources.querySelectorAll('li')).find(row => row.querySelector('strong')?.textContent === materialName(id));
          expect(row?.querySelector('span')?.textContent).toBe(`0 / ${amount}`);
        }
        expect(host.querySelectorAll('.upgrade-stat-preview > span')).toHaveLength(10);
        const preview = host.querySelector('.upgrade-benefits > .ref-growth-preview');
        expect(preview).not.toBeNull();
        expect(preview?.querySelector('.ref-growth-preview-heading')?.textContent).toBe(tab === 'upgrade-0' ? 'Stat & form preview' : 'Level & stat preview');
        expect(preview?.querySelectorAll('.upgrade-stat-preview > span')).toHaveLength(10);
        expect(host.querySelector('.upgrade-benefits details')).toBeNull();
        expect(host.querySelector('.ref-growth-detail')).not.toBeNull();
        expect(host.querySelectorAll('.upgrade-benefits h3')).toHaveLength(1);
        expect(host.querySelector('.upgrade-progress')).toBeNull();
        expect(host.querySelector(`.ref-growth-action [data-upgrade="${tab === 'upgrade-0' ? 'evolve' : 'level'}"]`)).not.toBeNull();
        if (tab === 'upgrade-0') {
          expect(host.querySelector('.ref-evolution-detail')).not.toBeNull();
          expect(host.querySelectorAll('.upgrade-benefits h3')).toHaveLength(1);
          expect(host.querySelector('.upgrade-progress')).toBeNull();
          expect(host.querySelector('.ref-evolution-action [data-upgrade="evolve"]')).not.toBeNull();
        }
      }
      expect(account).toEqual(before);
    }
  });
  it.each(starters)('$name uses the Collections silhouette treatment and actual next form', starter => {
    const account = emptyAccount();
    account.characters[starter.id] = { level: 0, evolution: 1 };
    account.squad = [starter.id];
    const collection = document.createElement('div');
    collection.innerHTML = archives(account);
    for (let evolution = 1; evolution <= 5; evolution++) {
      account.characters[starter.id] = { level: characterLevelCap(evolution), evolution };
      const host = document.createElement('div');
      host.innerHTML = referenceTeam(account, { view: 'detail', selected: starter.id, element: '', sort: 'level', tab: 'upgrade-0' });
      const silhouette = host.querySelector('.evolution-silhouette.unreached-character-art img');
      const archived = collection.querySelector(`[data-archive-character="${starter.id}"][data-form="${evolution + 1}"] .unreached-character-art img`);
      expect(archived).not.toBeNull();
      expect(silhouette?.getAttribute('src')).toBe(archived?.getAttribute('src'));
      expect(silhouette?.getAttribute('data-mirrored')).toBe(archived?.getAttribute('data-mirrored'));
      expect(silhouette?.getAttribute('alt')).toContain(characterName(starter.id, evolution + 1));
    }
  });
  it.each(['level', 'evolve'] as const)('plays %s celebration and then the saved stat reveal on the real Team markup', async kind => {
    vi.useFakeTimers();
    const before = emptyAccount();
    before.characters.ember = { level: kind === 'level' ? 12 : 30, evolution: 1 };
    before.squad = ['ember'];
    const after = structuredClone(before);
    after.characters.ember = kind === 'level' ? { level: 13, evolution: 1 } : { level: 30, evolution: 2 };
    const host = document.createElement('main');
    host.innerHTML = referenceTeam(before, { view: 'detail', selected: 'ember', element: '', sort: 'level' });
    document.body.append(host);
    expect(host.querySelector('.character-hub')).toBeNull();
    const portrait = host.querySelector('.hub-showcase .hub-portrait')!;
    const image = portrait.querySelector('img');
    updateCharacterTab(host, getStarter('ember'), 'overview', after);
    expect(portrait.querySelector('img')).toBe(image);
    celebrateUpgrade(host, getStarter('ember'), kind, after.characters.ember);
    expect(portrait.classList.contains(`celebrating-${kind}`)).toBe(true);
    expect(portrait.querySelector('.upgrade-aura-ring')).not.toBeNull();
    expect(portrait.querySelectorAll('.upgrade-spark')).toHaveLength(kind === 'level' ? 6 : 12);
    await presentUpgrade(before, after, 'ember', kind);
    expect(presentReward).toHaveBeenCalledOnce();
    const reveal = vi.mocked(presentReward).mock.calls[0][0];
    expect(reveal.details).toContain('Stat changes');
    expect(reveal.art).toContain('upgrade-result-portrait');
    vi.runAllTimers();
    expect(portrait.querySelector('.upgrade-celebration')).toBeNull();
    expect(portrait.classList.contains(`celebrating-${kind}`)).toBe(false);
  });

  it('keeps reduced-motion feedback on the reference portrait', () => {
    vi.useFakeTimers();
    vi.mocked(reducedMotion).mockReturnValue(true);
    const account = emptyAccount();
    account.characters.ember = { level: 1, evolution: 1 };
    account.squad = ['ember'];
    const host = document.createElement('main');
    host.innerHTML = referenceTeam(account, { view: 'detail', selected: 'ember', element: '', sort: 'level' });
    celebrateUpgrade(host, getStarter('ember'), 'level', account.characters.ember);
    expect(host.querySelector('.celebration-reduced')?.textContent).toContain('Level up');
    vi.runAllTimers();
  });
});
