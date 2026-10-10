import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { abilityIcon, abilityIcons } from './ability-icon';
import { openingStarters as starters } from '../content/starters';
import { homeHub, characterHub } from './hub';
import { gestureGuide } from './gesture-guide';
import { createBattle } from '../game/battle';
import { abilityArtRevisions } from '../content/ability-art-revisions';
import { assetUrl } from './portrait';
import { createHash } from 'node:crypto';

describe('starter ability icons', () => {
  it.each(starters)('maps $name icons to separate square RGBA assets with accessible text supplied by the host', (starter) => {
    const icons = abilityIcons[starter.id];
    expect(new Set(Object.values(icons)).size).toBe(5);
    for (const action of ['passive', 'skill1', 'skill2', 'ultimate'] as const) {
      expect(abilityIcon(starter.id, action)).toContain(`abilities/${icons[action]}.png`);
      expect(abilityIcon(starter.id, action)).toContain('alt="" aria-hidden="true"');
      expect(icons[action]).toMatch(new RegExp(`^${starter.art}-`));
      const png = readFileSync(new URL(`../../public/assets/abilities/${icons[action]}.png`, import.meta.url));
      expect(png.readUInt32BE(16)).toBe(256);
      expect(png.readUInt32BE(20)).toBe(256);
      expect(png[25]).toBe(6);
    }
  });
  it.each(starters)('uses shared steel action art for $name', (starter) => {
    for (const [action, id] of [['light', 'universal-normal-attack'], ['defend', 'universal-defense']] as const) {
      const path = `abilities/${id}.png`;
      const png = readFileSync(new URL(`../../public/assets/${path}`, import.meta.url));
      const revision = createHash('sha256').update(png).digest('hex').slice(0, 16);
      expect(abilityArtRevisions[id]).toBe(revision);
      expect(assetUrl(path)).toBe(`${import.meta.env.BASE_URL}assets/${path}?v=${revision}`);
      expect(abilityIcon(starter.id, action)).toContain(`src="${assetUrl(path)}"`);
      expect(abilityIcon(starter.id, action)).toContain('alt="" aria-hidden="true"');
      expect(png.readUInt32BE(16)).toBe(256);
      expect(png.readUInt32BE(20)).toBe(256);
      expect(png[25]).toBe(6);
    }
  });
  it.each(starters)('uses $name supplied icons in menus and all four hold directions', (starter) => {
    const icons = abilityIcons[starter.id];
    expect(homeHub(starter, false)).not.toContain('assets/abilities/');
    const overview = characterHub(starter, 'overview');
    for (const action of ['passive', 'skill1', 'skill2', 'ultimate'] as const) {
      expect(overview).toContain(`abilities/${icons[action]}.png`);
    }
    const state = createBattle(1729, [starter.id]);
    const guide = gestureGuide(state, state.allies[0]);
    for (const action of ['skill1', 'skill2', 'ultimate'] as const) {
      expect(guide).toContain(`abilities/${icons[action]}.png`);
    }
    expect(guide).toContain('abilities/universal-normal-attack.png');
  });
});
