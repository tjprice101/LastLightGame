import { EXPORTED_SAVE_KEY, offlineSave, parseSaveFile, SAVE_FILE_LIMIT, type SaveFile } from '../game/save-file';

export async function readSaveUpload(file: File): Promise<SaveFile> {
  if (file.size > SAVE_FILE_LIMIT) throw new Error('Save files must be no larger than 4 MB.');
  return parseSaveFile(await file.text());
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
