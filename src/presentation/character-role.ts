import { getStarter, type StarterId } from '../content/starters';

const symbols = {
  Attacker: '<path d="m9 15 8-8 2-2 1 4-9 9M7 13l6 6M9 17l-3 3-2-2 3-3"/>',
  'Healer & Support': '<path d="M12 19s-8-5-8-10a4 4 0 0 1 8-2 4 4 0 0 1 8 2c0 5-8 10-8 10Z"/><path d="M12 9v6m-3-3h6"/>',
  Tank: '<path d="m12 4 7 3v5c0 4-7 8-7 8s-7-4-7-8V7Z"/><path d="M12 7v10"/>',
  Support: '<circle cx="12" cy="6" r="2"/><circle cx="6" cy="17" r="2"/><circle cx="18" cy="17" r="2"/><path d="m11 8-4 7m6-7 4 7M8 17h8"/>',
} as const;

export function characterRole(id: StarterId): string {
  const { role } = getStarter(id);
  return `<span class="character-role" data-character-role="${role}"><span class="role-medal" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${symbols[role]}</svg></span><span>${role}</span></span>`;
}
