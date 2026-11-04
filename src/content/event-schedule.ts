export const resetTimezone = 'America/New_York';
export const roseEventEndsAt = Date.parse('2026-12-01T01:00:00Z');
export interface EventWindow { opensAt: number | null; closesAt: number }
export const roseEventWindows: readonly EventWindow[] = [{ opensAt: null, closesAt: roseEventEndsAt }];
const localClock = new Intl.DateTimeFormat('en-US', {
  timeZone: resetTimezone, year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', hourCycle: 'h23',
});

export function resetKeys(now: number): { daily: string; weekly: string } {
  if (!Number.isFinite(now)) throw new Error('Invalid reset time.');
  const parts = localClock.formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find(entry => entry.type === type)?.value);
  const date = new Date(Date.UTC(part('year'), part('month') - 1, part('day')));
  if (part('hour') < 20) date.setUTCDate(date.getUTCDate() - 1);
  const daily = date.toISOString().slice(0, 10);
  date.setUTCDate(date.getUTCDate() - date.getUTCDay());
  return { daily, weekly: date.toISOString().slice(0, 10) };
}

export function eventWindowActive(now: number, windows: readonly EventWindow[]): boolean {
  if (!Number.isFinite(now)) throw new Error('Invalid event time.');
  for (const window of windows) {
    if (!Number.isFinite(window.closesAt) || window.opensAt !== null &&
        (!Number.isFinite(window.opensAt) || window.opensAt >= window.closesAt)) throw new Error('Invalid event schedule.');
  }
  return windows.some(window => (window.opensAt === null || now >= window.opensAt) && now < window.closesAt);
}

export function roseEventActive(now: number): boolean {
  return eventWindowActive(now, roseEventWindows);
}

export function assertRoseEventActive(now: number): void {
  if (!roseEventActive(now)) throw new Error('Roses Under Sunny Skies has ended. Browse Special Banner Archive; event shops remain available.');
}

export interface EventAccess {
  online: boolean;
  now: number;
}

export function roseAccessMessage(access: EventAccess): string {
  return !roseEventActive(access.now)
    ? 'Event ended. Pity and progress are retained. Materials remain in Material Exchange; Roselius are available in Event Elemental-Devourers.'
    : !access.online
      ? 'Sign in online to enter this timed event or summon. Offline archive browsing remains available.'
      : 'Ends November 30, 2026 at 8:00 PM New York time. Pity and event progress carry into explicitly scheduled reruns.';
}
