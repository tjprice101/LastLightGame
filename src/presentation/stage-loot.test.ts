// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { elements, infusionModes, currencyModes, eventModes, machineModes, dungeonStageCount } from '../content/activities';
import { isPlayableDungeon } from '../content/dungeons';
import { elementalWars, warStageCount } from '../content/elemental-war';
import { storyRules } from '../content/story';
import { creatures, creatureLoot } from '../content/creatures';
import { bindStageLoot, parseStageLootSource, stageLoot, stageLootButton, stageLootContent } from './stage-loot';
import { bindSelectionPanels } from './selection-panel';
import { emptyAccount } from '../game/account';
import { conduits } from '../content/conduits';

if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) { this.open = true; };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) { this.open = false; this.dispatchEvent(new Event('close')); };
}

const modes = [...infusionModes, ...currencyModes, ...eventModes, ...machineModes];

describe('stage loot previews', () => {
  afterEach(() => { document.body.replaceChildren(); });

  it('keeps the baseline Machines pool visible even when every name is owned or a tier is focused', () => {
    const account = emptyAccount();
    const source = { kind: 'infusion', mode: 'machines' } as const;
    const baseline = stageLoot(source, 35, null);
    account.machineLootFocus = { Legendary: 'worldbreaker-drive' };
    expect(stageLoot(source, 35, account)).toEqual(baseline);
    account.conduits = Object.fromEntries(conduits.map(conduit => [conduit.id, 1]));
    delete account.machineLootFocus;
    expect(stageLoot(source, 35, account)).toEqual(baseline);
    expect(stageLoot(source, 25, account).entries.some(entry => entry.group === 'conduit-omnic')).toBe(false);
    expect(stageLoot(source, 26, account).entries.filter(entry => entry.group === 'conduit-omnic')).toHaveLength(45);
  });

  it('previews every stage of every staged activity from the live drop tables', () => {
    for (const element of elements.map((entry) => entry.id).filter(isPlayableDungeon)) {
      for (let stage = 1; stage <= dungeonStageCount; stage++) {
        const loot = stageLoot({ kind: 'dungeon', element }, stage, null);
        const creature = creatures.find((entry) => entry.dungeonElement === element && entry.stages.includes(stage))!;
        expect(loot.entries.map((entry) => entry.id)).toEqual(creatureLoot(creature, stage).filter((drop) => drop.chance > 0).map((drop) => drop.id));
      }
    }
    for (const { id: mode, stages } of modes) {
      for (let stage = 1; stage <= stages; stage++) {
        const loot = stageLoot({ kind: 'infusion', mode }, stage, null);
        expect(loot.entries.filter((entry) => entry.group !== 'capture').length).toBeGreaterThan(0);
        const html = stageLootContent({ kind: 'infusion', mode }, stage, null);
        expect(html).toContain('stage-loot-item');
        expect(html).not.toMatch(/\d%|Guaranteed|×|Independent|roll/);
      }
    }
    for (const { character } of elementalWars) for (let stage = 1; stage <= warStageCount; stage++) stageLoot({ kind: 'war', character }, stage, null);
    for (let stage = 1; stage <= storyRules.stages; stage++) stageLoot({ kind: 'story' }, stage, null);
  });

  it('lists captures, recruitment, stage-clear and first-clear rewards where they apply, without rates', () => {
    expect(stageLoot({ kind: 'infusion', mode: 'heavens' }, 1, null).entries.some((entry) => entry.group === 'capture')).toBe(true);
    expect(stageLoot({ kind: 'infusion', mode: 'machines' }, 1, null).entries.some((entry) => entry.group === 'capture')).toBe(false);
    expect(stageLoot({ kind: 'infusion', mode: 'roses' }, 35, null).entries.some((entry) => entry.group === 'capture')).toBe(false);
    const war = stageLoot({ kind: 'war', character: 'nerithe' }, warStageCount, null);
    expect(war.entries.find((entry) => entry.group === 'recruit')?.id).toBe('nerithe');
    expect(stageLoot({ kind: 'war', character: 'nerithe' }, 1, null).entries.some((entry) => entry.group === 'recruit')).toBe(false);
    const story = stageLoot({ kind: 'story' }, storyRules.regionStages, null);
    expect(story.entries.filter((entry) => entry.group === 'clear').map((entry) => entry.id)).toEqual(['fractalis']);
    expect(story.entries.filter((entry) => entry.group === 'first').map((entry) => entry.id)).toEqual(['fractalis', 'lycalis']);
    expect(stageLoot({ kind: 'story' }, 1, null).entries.filter((entry) => entry.group === 'first').map((entry) => entry.id)).toEqual(['lycalis']);
    expect(() => parseStageLootSource('infusion:nowhere')).toThrow('Unknown stage loot source');
  });

  it('opens Detailed Loot from each stage in the picker', () => {
    const host = document.createElement('div');
    host.innerHTML = `<footer class="activity-entry"><label>Stage<select data-dungeon-stage="infernic" aria-label="Flaming Depths stage"><option value="1">1</option><option value="12" selected>12</option></select></label></footer>`;
    document.body.append(host);
    const unbindPanels = bindSelectionPanels(host);
    const unbind = bindStageLoot(host, () => null);
    expect(host.querySelector('[data-stage-loot]')).toBeNull();
    host.querySelector<HTMLButtonElement>('.selection-trigger')!.click();
    const rows = document.querySelectorAll('.selection-modal .selection-option-row');
    expect(rows).toHaveLength(2);
    expect(document.querySelector('.stage-loot-strip')).toBeNull();
    rows[1].querySelector<HTMLButtonElement>('[data-stage-loot]')!.click();
    const dialog = document.querySelector<HTMLDialogElement>('.stage-loot-modal')!;
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector('h2')!.textContent).toContain('Stage 12');
    expect(dialog.querySelectorAll('.stage-loot-item img').length).toBeGreaterThan(0);
    dialog.close();
    rows[0].querySelector<HTMLButtonElement>('[data-stage-loot]')!.click();
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector('h2')!.textContent).toContain('Stage 1 ');
    unbind();
    unbindPanels();
  });
});
