import { describe, expect, it } from 'vitest';
import { elements } from '../content/activities';
import { ambientScreens } from '../presentation/ambient-background';
import { sceneIds } from './scene-glsl';
import { elementAccents } from '../content/dungeon-art';
import { accentFor, elementScenes, neutralAccent, sanctuaryPalette, sceneFor, screenScenes } from './scene-palettes';

const luminance = ([r, g, b]: readonly number[]) => .2126 * r + .7152 * g + .0722 * b;

describe('scene palettes', () => {
  it('every screen but battle has a scene; battle sleeps', () => {
    for (const screen of ambientScreens) {
      if (screen === 'battle') expect(sceneFor(screen, 'infernic')).toBeNull();
      else expect(sceneIds).toContain(sceneFor(screen, null)!.scene);
    }
  });
  it('every scene is reachable from a screen or an element', () => {
    const used = new Set([...Object.values(screenScenes).map(entry => entry.scene), ...Object.values(elementScenes).map(entry => entry.scene)]);
    expect([...used].sort()).toEqual([...sceneIds].sort());
  });
  it('each element has its own scene', () => {
    expect(Object.keys(elementScenes).sort()).toEqual(elements.map(element => element.id).sort());
    expect(new Set(Object.values(elementScenes).map(entry => entry.scene)).size).toBe(elements.length);
  });
  it('palettes run dark to bright so panels and text stay readable over them', () => {
    const palettes = [sanctuaryPalette, ...Object.values(elementScenes).map(entry => entry.palette), ...Object.values(screenScenes).map(entry => entry.palette)];
    for (const palette of palettes) {
      expect(luminance(palette.deep)).toBeLessThan(.06);
      expect(luminance(palette.mid)).toBeLessThan(.25);
      expect(luminance(palette.accent)).toBeGreaterThan(.35);
    }
  });
  it('team screens take the leader element scene; home keeps its scene and takes the accent', () => {
    expect(sceneFor('character', 'oceanic')).toMatchObject({ scene: 'tide', palette: elementScenes.oceanic.palette });
    expect(sceneFor('squad', 'chaotic')!.scene).toBe('rift');
    expect(sceneFor('character', null)!.scene).toBe('sanctuary');
    const home = sceneFor('home', 'botanic')!;
    expect(home.scene).toBe('sanctuary');
    expect(home.palette.accent).toEqual(elementScenes.botanic.palette.accent);
    expect(home.palette.deep).toEqual(sanctuaryPalette.deep);
    expect(sceneFor('summon', 'botanic')!.scene).toBe('astral');
  });
  it('the interface accent is the accent of the scene behind the screen', () => {
    expect(accentFor('title', null)).toBe('#e0b45a');
    expect(accentFor('summon', 'botanic')).toBe('#c9b8ff');
    expect(accentFor('inventory', 'infernic')).toBe('#e0b45a');
    expect(accentFor('gameplay', null)).toBe('#a9dccb');
    for (const element of elements) {
      const accent = elementAccents[element.id].toLowerCase();
      expect(accentFor('home', element.id)).toBe(accent);
      expect(accentFor('character', element.id)).toBe(accent);
      expect(accentFor('squad', element.id)).toBe(accent);
    }
    for (const screen of ambientScreens) expect(accentFor(screen, null)).toMatch(/^#[0-9a-f]{6}$/);
  });
  it('battle has no scene and keeps the leader accent', () => {
    expect(accentFor('battle', 'oceanic')).toBe(elementAccents.oceanic);
    expect(accentFor('battle', null)).toBe(neutralAccent);
  });
  it('showcase screens run brighter than working screens', () => {
    expect(sceneFor('home', null)!.intensity).toBeGreaterThan(sceneFor('inventory', null)!.intensity);
    expect(sceneFor('summon', null)!.intensity).toBeGreaterThan(sceneFor('settings', null)!.intensity);
  });
});
