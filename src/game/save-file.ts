import { ACCOUNT_KEY, loadAccount, validateAccount, type Account } from './account';
import { SAVE_KEY, loadProfile, type Profile, type ProfileStorage } from './profile';

export const SAVE_FILE_LIMIT = 4 * 1024 * 1024;
export const EXPORTED_SAVE_KEY = 'last-light.offline-exported';
export const PENDING_IMPORT_KEY = 'last-light.pending-online-import';
export interface SaveFile {
  format: 'last-light-save';
  version: 1;
  profile: Profile;
  account: Account;
}

export function validateSaveFile(value: unknown): SaveFile {
  if (!value || typeof value !== 'object' || !('format' in value) || value.format !== 'last-light-save' ||
    !('version' in value) || value.version !== 1 || !('profile' in value) || !('account' in value)) {
    throw new Error('Choose a supported Last Light save file.');
  }
  const profile = loadProfile({ getItem: () => JSON.stringify(value.profile), setItem() {}, removeItem() {} });
  if (!profile) throw new Error('The save file is missing its starter.');
  const account = validateAccount(value.account);
  if (!account.characters[profile.starterId] || !account.squad?.length) throw new Error('The save file is missing its owned starter or squad.');
  return { format: 'last-light-save', version: 1, profile, account };
}

export function parseSaveFile(text: string): SaveFile {
  if (new TextEncoder().encode(text).length > SAVE_FILE_LIMIT) throw new Error('Save files must be no larger than 4 MB.');
  return validateSaveFile(JSON.parse(text));
}

export function offlineSave(storage: ProfileStorage): SaveFile {
  const profile = loadProfile(storage);
  if (!profile) throw new Error('Start an offline game before saving or exporting.');
  return validateSaveFile({ format: 'last-light-save', version: 1, profile, account: loadAccount(storage) });
}

function replaceOffline(storage: ProfileStorage, values: Record<string, string | null>): void {
  const previous = Object.fromEntries(Object.keys(values).map(key => [key, storage.getItem(key)]));
  try {
    for (const [key, value] of Object.entries(values)) {
      if (value === null) storage.removeItem(key);
      else storage.setItem(key, value);
    }
  } catch (error) {
    try {
      for (const [key, value] of Object.entries(previous)) {
        if (value === null) storage.removeItem(key);
        else storage.setItem(key, value);
      }
    } catch (restoreError) {
      throw new Error(`Offline storage failed and could not be restored. Keep your exported file. ${String(error)} ${String(restoreError)}`);
    }
    throw new Error(`Offline save was not changed. ${String(error)}`);
  }
}

export function loadOfflineSave(storage: ProfileStorage, file: SaveFile): void {
  const validated = validateSaveFile(file);
  replaceOffline(storage, {
    [ACCOUNT_KEY]: JSON.stringify(validated.account),
    [SAVE_KEY]: JSON.stringify(validated.profile),
    [EXPORTED_SAVE_KEY]: null,
  });
}

export function saveOfflineProgress(storage: ProfileStorage): void {
  const file = offlineSave(storage);
  replaceOffline(storage, { [ACCOUNT_KEY]: JSON.stringify(file.account), [SAVE_KEY]: JSON.stringify(file.profile) });
}

export function deleteOfflineSave(storage: ProfileStorage): void {
  replaceOffline(storage, { [ACCOUNT_KEY]: null, [SAVE_KEY]: null, [EXPORTED_SAVE_KEY]: null });
}

export function needsOfflineExport(storage: ProfileStorage): boolean {
  if (storage.getItem(SAVE_KEY) === null) return false;
  return storage.getItem(EXPORTED_SAVE_KEY) !== JSON.stringify(offlineSave(storage));
}
