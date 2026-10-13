import { EXPORTED_SAVE_KEY, offlineSave, parseSaveFile, SAVE_FILE_LIMIT, type SaveFile } from '../game/save-file';

export async function readSaveUpload(file: File): Promise<SaveFile> {
  if (file.size > SAVE_FILE_LIMIT) throw new Error('Save files must be no larger than 4 MB.');
  return parseSaveFile(await file.text());
}

const saveCodePrefix = 'LLSAVE1:';

export function offlineSaveCode(): string {
  const text = JSON.stringify(offlineSave(localStorage));
  const bytes = new TextEncoder().encode(text);
  if (bytes.length > SAVE_FILE_LIMIT) throw new Error('Save codes must be no larger than 4 MB. Use a save file instead.');
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 16384) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 16384));
  }
  return saveCodePrefix + btoa(binary);
}

export function readSaveCode(code: string): SaveFile {
  const value = code.trim();
  if (!value.startsWith(saveCodePrefix)) throw new Error('Paste a Last Light save code beginning with LLSAVE1:.');
  const encoded = value.slice(saveCodePrefix.length);
  if (encoded.length > Math.ceil(SAVE_FILE_LIMIT / 3) * 4) throw new Error('Save codes must be no larger than 4 MB.');
  return parseSaveFile(new TextDecoder('utf-8', { fatal: true }).decode(
    Uint8Array.from(atob(encoded), character => character.charCodeAt(0))));
}

export function exportOfflineSave(): void {
  const text = JSON.stringify(offlineSave(localStorage));
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'last-light-save.json';
  document.body.append(link);
  try {
    link.click();
    localStorage.setItem(EXPORTED_SAVE_KEY, text);
  } finally {
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
