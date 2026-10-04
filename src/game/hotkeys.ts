import { type ProfileStorage } from './profile';

export const HOTKEYS_KEY = 'last-light.hotkeys';
export const commands = [
  ['light', 'Light Attack'], ['heavy', 'Heavy Attack'], ['skill1', 'Ability 1'],
  ['skill2', 'Ability 2'], ['ultimate', 'Last Flare'], ['endTurn', 'End turn / next wave'],
  ['nextAlly', 'Next ally'], ['nextTarget', 'Next enemy'],
] as const;
export type Command = (typeof commands)[number][0];
export type Bindings = Record<Command, string>;
export const defaultBindings: Bindings = {
  light: 'KeyQ', heavy: 'KeyW', skill1: 'KeyE', skill2: 'KeyR', ultimate: 'KeyF',
  endTurn: 'Space', nextAlly: 'KeyC', nextTarget: 'KeyT',
};
export const allowedCodes = [
  ...Array.from({ length: 26 }, (_, index) => `Key${String.fromCharCode(65 + index)}`),
  ...Array.from({ length: 10 }, (_, index) => `Digit${index}`),
  'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
];

export function keyLabel(code: string): string {
  return code.replace(/^Key/, '').replace(/^Digit/, '').replace('Arrow', '');
}

export function validateBindings(value: unknown): Bindings {
  if (typeof value !== 'object' || value === null) throw new Error('Hotkeys must be a complete mapping.');
  const result = { ...defaultBindings };
  for (const [command] of commands) {
    if (!(command in value)) throw new Error(`Missing binding for ${command}.`);
    const code: unknown = Reflect.get(value, command);
    if (typeof code !== 'string' || !allowedCodes.includes(code)) throw new Error(`Unsupported key for ${command}.`);
    result[command] = code;
  }
  if (new Set(Object.values(result)).size !== commands.length) throw new Error('Each command must use a different key.');
  return result;
}

export function loadBindings(storage: ProfileStorage): Bindings {
  const raw = storage.getItem(HOTKEYS_KEY);
  return raw === null ? { ...defaultBindings } : validateBindings(JSON.parse(raw));
}

export function saveBindings(storage: ProfileStorage, bindings: Bindings): void {
  storage.setItem(HOTKEYS_KEY, JSON.stringify(validateBindings(bindings)));
}
