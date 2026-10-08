import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { roseCharacters } from './starters';
import { characterArt } from './character-art';
import { infusionEncounter } from './infusions';
import { getCreature } from './creatures';
import { roseMaterials } from './roses';
import { materialArt } from './dungeon-art';
import { abilityIcon, abilityIcons } from '../presentation/ability-icon';
import { unitFacing } from '../presentation/unit-facing';
import { getSummonBanner } from './summon-banners';

function shipped(category: string, art: string): void {
  expect(existsSync(resolve('public', 'assets', category, `${art}.png`))).toBe(true);
}

describe('supplied Roses artwork', () => {
  it.each(roseCharacters)('wires every $name form and every supplied action icon', (character) => {
    for (let evolution = 1; evolution <= 6; evolution++) {
      const form = characterArt(character.id, evolution);
      expect(form.available).toBe(true);
      shipped('characters', form.art);
      expect(() => unitFacing(form.art, 'ally')).not.toThrow();
    }
    for (const action of ['passive', 'light', 'defend', 'skill1', 'skill2', 'ultimate'] as const) {
      const art = abilityIcons[character.id][action];
      shipped('abilities', art);
      expect(abilityIcon(character.id, action)).toContain(`abilities/${art}.png`);
    }
  });
  it('uses the same real Roselius art in every stage and catalog/captured form', () => {
    for (let stage = 1; stage <= 35; stage++) {
      const encounter = infusionEncounter('roses', stage);
      const creature = getCreature(`infusion:roses:${encounter.tier}`);
      expect(encounter.enemy.art).toBe(creature.art);
      if (!encounter.enemy.art) throw new Error('Roselius supplied art is missing.');
      const art = encounter.enemy.art;
      shipped('enemies', art);
      expect(() => unitFacing(art, 'enemy')).not.toThrow();
      expect(encounter.background).toBe('roses-arena.png');
    }
    shipped('backgrounds', 'roses-arena');
  });
  it('ships every material and the correct full-bleed event/summon art', () => {
    for (const material of roseMaterials) shipped('materials', materialArt(material.id)!);
    shipped('banners', 'roses-banner');
    expect(getSummonBanner('roses').artwork.path).toBe('banners/summon-roses.png');
    shipped('banners', 'summon-roses');
  });
});
