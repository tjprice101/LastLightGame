import { moonCharacters, sunshadeCharacters } from './moon-sunshade-characters';
import { materialRarities } from './activities';
import type { MaterialRarity } from './activities';
import type { StarterId } from './starters';

export type NewEventId = 'moon' | 'sunshade';
export type NewEventFamily = 'moonwake' | 'dawnforge';

export interface ScheduledEventWindow {
  opensAt: number | null;
  closesAt: number;
}

export interface MoonSunshadeEvent {
  id: NewEventId;
  bannerId: NewEventId;
  bannerName: string;
  activityName: string;
  family: NewEventFamily;
  familyDisplay: 'Moonwake' | 'Dawnforge';
  enemySpecies: 'Vesperwing' | 'Solcarapace';
  enemyElement: 'tranquilitic' | 'infernic';
  enemyCommon: string;
  characters: readonly StarterId[];
  windows: readonly ScheduledEventWindow[];
  bannerArt: null;
  activityHeaderArt: null;
  arenaArt: null;
}

export const moonSunshadeEvents = [
  {
    id: 'moon',
    bannerId: 'moon',
    bannerName: "Glow of the Moon's Light",
    activityName: 'The Harbor of Unreturned Names',
    family: 'moonwake',
    familyDisplay: 'Moonwake',
    enemySpecies: 'Vesperwing',
    enemyElement: 'tranquilitic',
    enemyCommon: 'Vesperwing',
    characters: moonCharacters.map(character => character.id),
    windows: [],
    bannerArt: null,
    activityHeaderArt: null,
    arenaArt: null,
  },
  {
    id: 'sunshade',
    bannerId: 'sunshade',
    bannerName: 'The Angel-blazened Sunshade',
    activityName: 'Beneath the Borrowed Dawn',
    family: 'dawnforge',
    familyDisplay: 'Dawnforge',
    enemySpecies: 'Solcarapace',
    enemyElement: 'infernic',
    enemyCommon: 'Solcarapace',
    characters: sunshadeCharacters.map(character => character.id),
    windows: [],
    bannerArt: null,
    activityHeaderArt: null,
    arenaArt: null,
  },
] as const satisfies readonly MoonSunshadeEvent[];

export const moonSunshadePityLimit = 80;
export const moonSunshadeBannerCost = 10;
export const moonSunshadeCharacterChance = .011;
export const moonSunshadeCharacterChancePerBearer = moonSunshadeCharacterChance / 6;
export const moonSunshadeDuplicateBloom = 15;
export const moonSunshadeCaptureChance = .5;
export const moonSunshadeCaptureLevel = 60;
export const moonSunshadeShopPrices = [2_500, 7_500, 25_000, 75_000, 250_000, 750_000] as const;
export const moonSunshadeShopQuantities = [1, 5, 10] as const;
function validWindows(windows: readonly ScheduledEventWindow[]): void {
  for (const window of windows) {
    if (!Number.isSafeInteger(window.closesAt) || window.opensAt !== null &&
        (!Number.isSafeInteger(window.opensAt) || window.opensAt >= window.closesAt)) {
      throw new Error('Invalid event schedule.');
    }
  }
}

export function newEventDefinition(id: NewEventId): MoonSunshadeEvent {
  const definition = moonSunshadeEvents.find(event => event.id === id);
  if (!definition) throw new Error('Unknown Moon/Sunshade event.');
  return definition;
}

export function newEventWindowActive(id: NewEventId, now: number): boolean {
  if (!Number.isFinite(now)) throw new Error('Invalid event time.');
  const windows = newEventDefinition(id).windows;
  validWindows(windows);
  return windows.some(window => (window.opensAt === null || now >= window.opensAt) && now < window.closesAt);
}

export function newEventHasCompletedWindow(id: NewEventId, now: number): boolean {
  if (!Number.isFinite(now)) throw new Error('Invalid event time.');
  const windows = newEventDefinition(id).windows;
  validWindows(windows);
  return windows.some(window => now >= window.closesAt) && !windows.some(window =>
    (window.opensAt === null || now >= window.opensAt) && now < window.closesAt);
}

export function assertNewEventActive(id: NewEventId, now: number): void {
  if (!newEventWindowActive(id, now)) {
    throw new Error(`${newEventDefinition(id).activityName} is not active. Browse the art-neutral archive; event progress and pity are retained.`);
  }
}

export function newEventAccessMessage(id: NewEventId, online: boolean, now: number): string {
  const definition = newEventDefinition(id);
  if (!newEventWindowActive(id, now)) return 'Not launched or not active. Artwork is pending; event progress and banner pity are retained.';
  if (!online) return 'Sign in online to enter this timed event or summon. Offline archive browsing remains available.';
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', dateStyle: 'long', timeStyle: 'short',
  });
  const closesAt = definition.windows.filter(window => window.closesAt > now)
    .map(window => window.closesAt).sort((a, b) => a - b)[0];
  return closesAt === undefined
    ? 'Event is active. Event progress and banner pity carry into explicitly scheduled reruns.'
    : `Active through ${formatter.format(closesAt)} New York time. Event progress and banner pity carry into explicitly scheduled reruns.`;
}

export function isNewEventId(value: unknown): value is NewEventId {
  return value === 'moon' || value === 'sunshade';
}

export function newEventForCharacter(characterId: string): MoonSunshadeEvent | undefined {
  return moonSunshadeEvents.find(event => (event.characters as readonly string[]).includes(characterId));
}

export function isNewEventCharacter(characterId: string): boolean {
  return newEventForCharacter(characterId) !== undefined;
}

export function newEventMaterialIds(id: NewEventId): readonly string[] {
  const family = newEventDefinition(id).family;
  return ['common', 'uncommon', 'rare', 'epic', 'legendary', 'omnic'].map(tier => `${family}-${tier}`);
}

export function newEventMaterialDefinition(id: string): {
  id: string;
  name: string;
  rarity: MaterialRarity;
  family: NewEventFamily;
  event: NewEventId;
} | undefined {
  for (const event of moonSunshadeEvents) {
    const tier = newEventMaterialIds(event.id).indexOf(id);
    if (tier >= 0) return {
      id,
      name: `${['Seed', 'Bud', 'Bloom', 'Crest', 'Heart', 'Soul'][tier]} of ${event.familyDisplay}`,
      rarity: materialRarities[tier],
      family: event.family,
      event: event.id,
    };
  }
  return undefined;
}
