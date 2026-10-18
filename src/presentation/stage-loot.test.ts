// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { elements, infusionModes, currencyModes, eventModes, machineModes, dungeonStageCount } from '../content/activities';
import { isPlayableDungeon } from '../content/dungeons';
import { elementalWars, warStageCount } from '../content/elemental-war';
import { storyRules } from '../content/story';
import { creatures, creatureLoot } from '../content/creatures';
import { emptyAccount } from '../game/account';
import { bindStageLoot, parseStageLootSource, stageLoot, stageLootButton, stageLootContent } from './stage-loot';
import { bindSelectionPanels } from './selection-panel';

if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) { this.open = true; };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) { this.open = false; this.dispatchEvent(new Event('close')); };
}

const modes = [...infusionModes, ...currencyModes, ...eventModes, ...machineModes];

describe('stage loot previews', () => {
  afterEach(() => { document.body.replaceChildren(); });

  it('previews every stage of every staged activity from the live drop tables', () => {
    for (const element of elements.map((entry) => entry.id).filter(isPlayableDungeon)) {
      for (let stage = 1; stage <= dungeonStageCount; stage++) {
        const loot = stageLoot({ kind: 'dungeon', element }, stage, null);
        const creature = creatures.find((entry) => entry.dungeonElement === element && entry.stages.includes(stage))!;
        expect(loot.entries.map((entry) => entry.id)).toEqual(creatureLoot(creature, stage).map((drop) => drop.id));
      }
    }
    for (const { id: mode, stages } of modes) {
      for (let stage = 1; stage <= stages; stage++) {
        const loot = stageLoot({ kind: 'infusion', mode }, stage, null);
        expect(loot.entries.filter((entry) => entry.group === 'kill').length).toBeGreaterThan(0);
        expect(stageLootContent({ kind: 'infusion', mode }, stage, null)).toContain('stage-loot-item');
      }
    }
    for (const { character } of elementalWars) for (let stage = 1; stage <= warStageCount; stage++) stageLoot({ kind: 'war', character }, stage, null);
    for (let stage = 1; stage <= storyRules.stages; stage++) stageLoot({ kind: 'story' }, stage, null);
  });

  it('shows captures, recruitment, stage-clear and first-clear rewards where they apply', () => {
    expect(stageLoot({ kind: 'infusion', mode: 'heavens' }, 1, null).entries.some((entry) => entry.group === 'capture' && entry.chance === .2)).toBe(true);
    expect(stageLoot({ kind: 'infusion', mode: 'machines' }, 1, null).entries.some((entry) => entry.group === 'capture')).toBe(false);
    expect(stageLoot({ kind: 'infusion', mode: 'roses' }, 35, null).entries.some((entry) => entry.group === 'capture')).toBe(false);
    const war = stageLoot({ kind: 'war', character: 'nerithe' }, warStageCount, null);
    expect(war.entries.find((entry) => entry.group === 'recruit')?.chance).toBe(.01);
    expect(stageLoot({ kind: 'war', character: 'nerithe' }, 1, null).entries.some((entry) => entry.group === 'recruit')).toBe(false);
    const story = stageLoot({ kind: 'story' }, storyRules.regionStages, { ...emptyAccount(), storyCompleted: storyRules.regionStages });
    expect(story.entries.filter((entry) => entry.group === 'clear')).toHaveLength(2);
    expect(story.entries.find((entry) => entry.group === 'first')?.note).toBe('Already earned on this account.');
    expect(stageLoot({ kind: 'story' }, 1, null).entries.some((entry) => entry.group === 'first')).toBe(false);
    expect(() => parseStageLootSource('infusion:nowhere')).toThrow('Unknown stage loot source');
  });

  it('opens Detailed Loot for the currently selected stage and adds loot art to stage choices', () => {
    const host = document.createElement('div');
    host.innerHTML = `<footer class="activity-entry"><label>Stage<select data-dungeon-stage="infernic" aria-label="Flaming Depths stage"><option value="1">1</option><option value="12" selected>12</option></select></label>${stageLootButton('dungeon:infernic')}</footer>`;
    document.body.append(host);
    const unbindPanels = bindSelectionPanels(host);
    const unbind = bindStageLoot(host, () => null);
    host.querySelector<HTMLButtonElement>('[data-stage-loot]')!.click();
    const dialog = document.querySelector<HTMLDialogElement>('.stage-loot-modal')!;
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector('h2')!.textContent).toContain('Stage 12');
    expect(dialog.querySelectorAll('.stage-loot-item img').length).toBeGreaterThan(0);
    dialog.close();
    host.querySelector<HTMLButtonElement>('.selection-trigger')!.click();
    const choices = document.querySelectorAll('.selection-modal .selection-option');
    expect(choices).toHaveLength(2);
    choices.forEach((choice) => expect(choice.querySelector('.stage-loot-strip img')).not.toBeNull());
    unbind();
    unbindPanels();
  });
});
