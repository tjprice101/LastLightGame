/**
 * Which living scene each screen shows, and in which three colours (D-496). One table feeds the shader;
 * `accentFor` gives the interface the same accent (D-497). Accents reuse the element accents the menus already use.
 */
import { type ElementId } from '../content/activities';
import { elementAccents } from '../content/dungeon-art';
import { type AmbientScreen } from '../presentation/ambient-background';
import { rgbFromHex, type Rgb, type ScenePalette } from './scene-engine';
import { type SceneId } from './scene-glsl';

function palette(deep: string, mid: string, accent: string): ScenePalette {
  return { deep: rgbFromHex(deep), mid: rgbFromHex(mid), accent: rgbFromHex(accent) };
}

/** Gold on ink: the look with no element in play. Accent is `--gild-mid`. */
export const sanctuaryPalette = palette('#07050c', '#241a3a', '#e0b45a');

export const elementScenes: Readonly<Record<ElementId, { scene: SceneId; palette: ScenePalette }>> = {
  infernic: { scene: 'ember', palette: palette('#0d0507', '#4a1a12', elementAccents.infernic) },
  oceanic: { scene: 'tide', palette: palette('#030a14', '#0f3350', elementAccents.oceanic) },
  atmospheric: { scene: 'gale', palette: palette('#050c10', '#15414a', elementAccents.atmospheric) },
  botanic: { scene: 'grove', palette: palette('#040b07', '#17402a', elementAccents.botanic) },
  tranquilitic: { scene: 'stillness', palette: palette('#0a0610', '#3a2145', elementAccents.tranquilitic) },
  chaotic: { scene: 'rift', palette: palette('#0a040c', '#45123a', elementAccents.chaotic) },
};

interface ScreenScene {
  scene: SceneId;
  palette: ScenePalette;
  /** Showcase screens run brighter; working screens stay calm behind their panels. */
  intensity: number;
  /** `scene`: the squad leader's element scene and colours replace this entry. `accent`: only its accent does. */
  leader?: 'scene' | 'accent';
}
const calm = .12, showcase = .35;
const sanctuary: ScreenScene = { scene: 'sanctuary', palette: sanctuaryPalette, intensity: showcase };
const vault: ScreenScene = { scene: 'vault', palette: palette('#06060b', '#1c2238', '#e0b45a'), intensity: calm };
const expanse: ScreenScene = { scene: 'expanse', palette: palette('#04070f', '#142a44', '#a9dccb'), intensity: calm };

/** `battle` has no entry: the backdrop sleeps while a battle owns the screen. */
export const screenScenes: Readonly<Record<Exclude<AmbientScreen, 'battle'>, ScreenScene>> = {
  title: sanctuary,
  selection: sanctuary,
  home: { ...sanctuary, leader: 'accent' },
  settings: { ...sanctuary, intensity: calm },
  summon: { scene: 'astral', palette: palette('#05040f', '#241a52', '#c9b8ff'), intensity: showcase },
  character: { ...sanctuary, intensity: calm, leader: 'scene' },
  squad: { ...sanctuary, intensity: calm, leader: 'scene' },
  inventory: vault,
  stores: vault,
  collections: vault,
  gameplay: expanse,
  story: expanse,
  events: expanse,
};

export interface ResolvedScene { scene: SceneId; palette: ScenePalette; intensity: number }

export function sceneFor(screen: AmbientScreen, leader: ElementId | null): ResolvedScene | null {
  if (screen === 'battle') return null;
  const entry = screenScenes[screen];
  const element = leader ? elementScenes[leader] : null;
  if (element && entry.leader === 'scene') return { scene: element.scene, palette: element.palette, intensity: entry.intensity };
  if (element && entry.leader === 'accent')
    return { scene: entry.scene, palette: { ...entry.palette, accent: element.palette.accent }, intensity: entry.intensity };
  return { scene: entry.scene, palette: entry.palette, intensity: entry.intensity };
}

/** Text white: the interface accent when no element is in play in battle. */
export const neutralAccent = '#f4f4f5';

function hexFromRgb(rgb: Rgb): string {
  return `#${rgb.map(channel => Math.round(channel * 255).toString(16).padStart(2, '0')).join('')}`;
}

/**
 * The interface accent for a screen: the accent of the scene behind it, so light and interface agree.
 * Battle has no scene and keeps the squad leader's element accent.
 */
export function accentFor(screen: AmbientScreen, leader: ElementId | null): string {
  if (screen === 'battle') return leader ? elementAccents[leader] : neutralAccent;
  return hexFromRgb(sceneFor(screen, leader)!.palette.accent);
}
