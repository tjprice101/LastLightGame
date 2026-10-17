import { describe, expect, it } from 'vitest';
import { elements } from './activities';
import { creatures, creatureLore } from './creatures';
import { conduits } from './conduits';
import { masterConduits } from './master-conduits';
import { machineRulesText } from './machines';
import { storyRegions, storyRules } from './story';
import { conduitOrigin, elementEmotions, machineOrigin, masterOrigin, worldHistory } from './world-lore';

describe('Let and Rise founding canon', () => {
  it('keeps the two powers, shared creation, rivalry and unresolved soul search explicit', () => {
    const history = worldHistory.map(entry => entry.text).join(' ');
    for (const phrase of ['first being', 'Infinity', 'transform and manipulate space', 'Rise', 'Nothingness',
      'destroy and bind', 'coexist', 'civilizations into wars', 'split themselves', 'creator\'s soul',
      'created the Element-Bearers', 'in his image', 'in her image', 'stole the same six elements',
      'no creator has yet been declared the victor']) expect(history).toContain(phrase);
  });

  it('maps all six existing element IDs to the approved themes without introducing new types', () => {
    expect(elementEmotions).toEqual({
      infernic: 'Wrath', oceanic: 'Sadness', atmospheric: 'Calm', botanic: 'Joy and Life',
      tranquilitic: 'Peace', chaotic: 'Death and Destruction',
    });
    expect(Object.keys(elementEmotions)).toEqual(elements.map(element => element.id));
    expect(storyRegions.map(region => region.element)).toEqual(elements.map(element => element.id));
    expect(storyRules).toEqual({ regionStages: 25, stages: 150, startingLevel: 1, maximumLevel: 55 });
  });

  it('gives every catalogued enemy the correct origin, with Machines kept separate', () => {
    for (const creature of creatures) {
      const lore = creatureLore(creature);
      expect(lore).toContain(creature.name);
      if (creature.mode === 'machines' || creature.calamity === 'machines') {
        expect(lore).toContain(machineOrigin);
        expect(lore).not.toContain('is an Elemental-Devourer of Rise');
      } else {
        expect(lore).toContain('Rise\'s creation');
        expect(lore).toContain('seeking her soul');
        expect(lore).toContain(elementEmotions[creature.element]);
      }
    }
    expect(machineRulesText).toContain(machineOrigin);
    expect(storyRegions.at(-1)?.conclusion).toContain('Neither Let\'s nor Rise\'s soul has been found');
  });

  it('preserves shared prototypes and gives only the five Calamitic creations to Rise alone', () => {
    expect(conduits).toHaveLength(90);
    expect(conduits.filter(conduit => conduit.rarity === 'Calamitic')).toHaveLength(5);
    expect(masterConduits).toHaveLength(48);
    for (const conduit of conduits) {
      if (conduit.rarity === 'Calamitic') {
        expect(conduit.lore).toContain('Rise');
        expect(conduit.lore).not.toContain(conduitOrigin);
        expect(conduit.lore).not.toContain('Let');
      } else expect(conduit.lore).toContain(conduitOrigin);
      expect(conduit.effect).not.toContain('Let');
      expect(conduit.effect).not.toContain('Rise');
      expect(conduit.lore).not.toContain('awaiting its original reviewed artwork');
    }
    for (const master of masterConduits) expect(master.lore).toBe(masterOrigin);
  });
});
