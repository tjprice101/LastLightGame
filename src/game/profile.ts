import { isStarterId, type StarterId } from '../content/starters';

export const SAVE_KEY = 'last-light.profile';
export interface Profile {
  version: 1;
  starterId: StarterId;
}

export interface ProfileStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function loadProfile(storage: ProfileStorage): Profile | null {
  const raw = storage.getItem(SAVE_KEY);
  if (raw === null) return null;
  const data: unknown = JSON.parse(raw);
  if (
    typeof data !== 'object' || data === null ||
    !('version' in data) || data.version !== 1 ||
    !('starterId' in data) || !isStarterId(data.starterId)
  ) {
    throw new Error('This local save is invalid or uses an unsupported version.');
  }
  return { version: 1, starterId: data.starterId };
}

export function saveStarter(storage: ProfileStorage, starterId: StarterId): Profile {
  if (!isStarterId(starterId)) throw new Error('Choose a valid starter.');
  const profile: Profile = { version: 1, starterId };
  storage.setItem(SAVE_KEY, JSON.stringify(profile));
  return profile;
}
