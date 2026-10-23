// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { emptyAccount } from '../game/account';
import { createCreatureCopy } from '../game/character-instances';
import { creatures, getCreature, creatureLore } from '../content/creatures';
import { getStarter } from '../content/starters';
import { machineOrigin, storyPurpose, summonLore, worldHistory } from '../content/world-lore';
import { worldLore } from './world-lore';
import { storyCampaign } from './story';
import { sanctuaryHeader } from './sanctuary';
import { gameplayHub } from './gameplay';
import { referenceTeam } from './reference-team';
import { archives } from './archives';
import { creatureGlossary } from './creature-glossary';
import { summonHub } from './roster';
import { bindInformation } from './information';
import { bracketReferences } from './reference-text';

const plain = (text?: string | null): string => (text ?? '').replace(/<span class="element-label"[^>]*><img[^>]*>(\[[^\]]+\])<\/span>/g, '$1').replace(/\[([^[\]]+)\]/g, '$1');

describe('canon across information and lore surfaces', () => {
  it('shares complete founding history through Help, Gameplay and both Story prologue surfaces', () => {
    const account = emptyAccount();
    const host = document.createElement('main');
    host.innerHTML = storyCampaign(account, 'ember');
    const prologues = [host.querySelector('#story-prologue-information'), host.querySelector('.story-prologue')];
    for (const surface of [worldLore(), sanctuaryHeader('home', 0), gameplayHub(account),
      ...prologues.map(prologue => prologue?.innerHTML ?? '')]) {
      for (const entry of worldHistory) expect(plain(surface).toLowerCase()).toContain(entry.text.toLowerCase());
      expect(plain(surface)).toContain(plain(bracketReferences(machineOrigin, false)));
    }
    for (const prologue of prologues) expect(plain(prologue?.textContent).toLowerCase()).toContain(storyPurpose.toLowerCase());
  });

  it('keeps individual character histories optional instead of restoring the Collections text wall', () => {
    const account = emptyAccount();
    account.characters.ember = { level: 0, evolution: 1 };
    const before = structuredClone(account);
    const team = document.createElement('main');
    team.innerHTML = referenceTeam(account, { view: 'detail', selected: 'ember', element: '', sort: 'name' });
    expect(plain(team.querySelector('#bearer-lore-ember')?.textContent)).toContain(plain(bracketReferences(getStarter('ember').lore.story, false)));
    expect(team.querySelector('[data-information="bearer-lore-ember"]')?.textContent).toBe('Lore');
    const collection = document.createElement('main');
    collection.innerHTML = archives(account);
    expect(collection.querySelector('#collections-information')?.textContent).not.toContain(getStarter('ember').lore.story);
    expect(plain(collection.querySelector('#archive-kit-ember-1')?.textContent)).toContain(plain(bracketReferences(getStarter('ember').lore.story, false)));
    expect(account).toEqual(before);
  });

  it('gates creature lore by discovery and provides captured-copy lore without changing ownership', () => {
    const account = emptyAccount();
    const creature = getCreature('infusion:heavens:0');
    const copy = createCreatureCopy(creature.id, creature.stages[0], 119);
    account.capturedCharacters = [copy];
    account.squad = [copy.instanceId];
    account.creatures[creature.id] = { defeated: false };
    const before = structuredClone(account);
    const host = document.createElement('main');
    host.innerHTML = creatureGlossary(account);
    expect(host.querySelectorAll('[data-information]')).toHaveLength(1);
    expect(plain(host.querySelector('dialog')?.textContent)).toContain(creatureLore(creature));
    const capture = document.createElement('main');
    capture.innerHTML = referenceTeam(account, { view: 'capture', capture: copy.instanceId, selected: 'ember', element: '', sort: 'name' });
    expect(plain(capture.querySelector(`[id="capture-lore-${copy.instanceId}"]`)?.textContent)).toContain(creatureLore(creature));
    const machine = host.querySelector(`[data-creature="${creatures.find(entry => entry.mode === 'machines')!.id}"]`)!;
    expect(machine.querySelector('dialog')).toBeNull();
    expect(machine.querySelector('h2')?.textContent).toBe('Undiscovered Machine');
    expect(account).toEqual(before);
  });

  it('keeps summoning a squad acquisition, not a found creator or new soul reward', () => {
    for (const banner of ['standard', 'roses'] as const) {
      expect(plain(summonHub(emptyAccount(), banner)).toLowerCase()).toContain(summonLore.toLowerCase());
    }
  });

  it('lets Help select and leave the shared origins topic without introducing another modal', () => {
    const host = document.createElement('main');
    host.innerHTML = sanctuaryHeader('home', 0);
    bindInformation(host);
    host.querySelector<HTMLButtonElement>('[data-info-topic="origins"]')!.click();
    const panel = host.querySelector<HTMLElement>('[data-info-panel="origins"]')!;
    expect(panel.hidden).toBe(false);
    expect(panel.textContent).toContain('Infinity');
    panel.querySelector<HTMLButtonElement>('[data-info-back]')!.click();
    expect(panel.hidden).toBe(true);
    expect(host.querySelectorAll('dialog')).toHaveLength(1);
  });
});
