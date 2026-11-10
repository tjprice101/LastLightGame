import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { radiantPressureAnchors, adaptRadiantPressureEncounter } from '../game/radiant-pressure-encounters';
import { authoredRadiantCalibration } from '../content/radiant-enemy-calibration';
import { getCreature } from '../content/creatures';
import { radiantEnemyArt, radiantArenaArt } from './radiant-battle-art';
import { characterArt } from '../content/character-art';
import { isWarCharacter } from '../content/elemental-war';
import { storyEncounter } from '../content/story';
import { starters } from '../content/starters';
import type { RadiantLoadout } from '../content/radiant-combat';
import { radiantAllyArt } from './radiant-battle-art';

describe('canonical Radiant battlefield artwork', () => {
  it('scales each contact offset to the square bitmap in the responsive field slot', () => {
    const css = readFileSync(new URL('./radiant-battle.css', import.meta.url), 'utf8');
    expect(css).toContain(
      'translate: 0 calc(var(--radiant-contact-gap, 0) * min(var(--radiant-unit-width), var(--radiant-unit-height)));',
    );
  });
  it('resolves an alpha-derived contact offset for each available bearer form', () => {
    for (const starter of starters) {
      for (let form = 1; form <= 6; form++) {
        const html = radiantAllyArt({ starter: starter.id, form } as RadiantLoadout);
        if (characterArt(starter.id, form).available) {
          expect(html).toContain('style="--radiant-contact-gap:');
          expect(html).toContain('characters/');
        } else {
          expect(html).toContain('artwork pending');
          expect(html).not.toContain('radiant-contact-gap');
        }
      }
    }
  });
  it('resolves every authored family/species anchor through its own catalog artwork and facing', () => {
    for (const anchor of radiantPressureAnchors()) {
      for (const enemy of adaptRadiantPressureEncounter(anchor, 1729, authoredRadiantCalibration)) {
        if (enemy.identity.startsWith('war:')) {
          const [, id, form] = enemy.identity.split(':');
          if (!isWarCharacter(id)) throw new Error('Invalid fixture War bearer.');
          const art = characterArt(id, Number(form));
          expect(radiantEnemyArt(enemy)).toContain(`--radiant-contact-gap:`);
          expect(radiantEnemyArt(enemy)).toContain(`characters/${art.art}.`);
          continue;
        }
        const creature = getCreature(enemy.identity), html = radiantEnemyArt(enemy);
        if (creature.art) {
          expect(html).toContain(`enemies/${creature.art}.png`); expect(html).toContain('data-facing');
          expect(html).toContain('--radiant-contact-gap:');
          expect(html).not.toContain('Artwork pending');
        } else { expect(html).toContain('Artwork pending'); expect(html).not.toContain('<img'); }
      }
    }
  });
  it('uses current Story art and leaves undelivered War scenery pending', () => {
    expect(radiantArenaArt({ kind: 'story', stage: 1 })).toContain(storyEncounter(1).background!);
    expect(radiantArenaArt({ kind: 'story', stage: 25 })).not.toContain('grassy-field');
    expect(radiantArenaArt({ kind: 'war', character: 'neralis', stage: 1 })).toContain('scenery pending');
    expect(radiantArenaArt({ kind: 'war', character: 'neralis', stage: 1 })).not.toContain('<img');
    expect(radiantArenaArt({ kind: 'training' })).toContain('grassy-field.png');
  });
});
