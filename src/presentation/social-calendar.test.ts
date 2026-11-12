// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { attendanceMarkup, openSocialCalendar, socialCalendarMarkup, type SocialCalendarUiState } from './social-calendar';
import { attendanceReward } from '../content/social-calendar';
import { SocialCalendarRejected, type SocialCalendarCommand, type SocialCalendarView } from '../online/social-calendar';
import { gameDialogPending } from './game-dialog';

const presentReward = vi.fn(async (_reward: unknown) => {});
vi.mock('./reward-screen', () => ({ presentReward: (reward: unknown) => presentReward(reward) }));
vi.mock('./rarity-feedback', () => ({ rarityFeedback: vi.fn(), clearRarityFeedback: vi.fn() }));
const fixture = (): SocialCalendarView => ({
  serverTime: 1793858400000, resetDay: '2026-11-04', nextResetAt: '2026-11-06T01:00:00Z', month: '2026-11',
  attendance: 0, daysInMonth: 30, attendedToday: false, streak: 0, nextReward: attendanceReward(1, 1),
  giftSentToday: false, seedChoices: ['infernic-common'], mail: [],
});
const friends = [{ userId: 'friend-id', username: 'friend', displayName: '<Friend>', frame: 'default', icon: 'neutral' }];
const flush = async () => { await new Promise(resolve => setTimeout(resolve, 0)); };
let opened: Promise<void> | undefined;
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); this.dispatchEvent(new Event('close')); };
  presentReward.mockReset().mockResolvedValue(undefined);
});
afterEach(async () => {
  document.querySelectorAll<HTMLDialogElement>('dialog').forEach(dialog => dialog.close());
  await opened;
  opened = undefined;
  document.body.innerHTML = '';
});
describe('real social/calendar dialogs', () => {
  it('shows ordinal rewards only for the real month length and no automatic claims', async () => {
    const host = document.createElement('div');
    host.innerHTML = attendanceMarkup(fixture());
    expect(host.querySelectorAll('.attendance-ladder li')).toHaveLength(30);
    expect(host.textContent).not.toContain('Attendance 31');
    expect(host.textContent).toContain('No catch-up');
    const transport = vi.fn(async () => fixture());
    opened = openSocialCalendar('attendance', { identity: 'self', state: {}, friends: () => friends, transport, onError: vi.fn() });
    await flush();
    expect(transport).toHaveBeenCalledOnce();
    expect(transport).toHaveBeenCalledWith({ kind: 'read' }, undefined);
    expect(presentReward).not.toHaveBeenCalled();
    expect(document.querySelector('[data-calendar-status]')?.getAttribute('role')).toBe('status');
  });
  it('never celebrates before save and releases the shared modal before reward receipt', async () => {
    let complete!: (view: SocialCalendarView) => void;
    const transport = vi.fn((command: SocialCalendarCommand) => command.kind === 'attend'
      ? new Promise<SocialCalendarView>(resolve => { complete = resolve; }) : Promise.resolve(fixture()));
    opened = openSocialCalendar('attendance', { identity: 'self', state: {}, friends: () => friends, transport, onError: vi.fn() });
    await flush();
    document.querySelector<HTMLButtonElement>('[data-calendar-action="attend"]')!.click();
    await flush();
    expect(presentReward).not.toHaveBeenCalled();
    expect(document.querySelector('[data-calendar-close]')).not.toBeNull();
    presentReward.mockImplementation(async () => { expect(gameDialogPending()).toBe(false); });
    complete({ ...fixture(), attendedToday: true, attendance: 1, reward: attendanceReward(1, 1) });
    await flush();
    expect(presentReward).toHaveBeenCalledOnce();
    expect(presentReward.mock.calls[0][0]).toMatchObject({ title: 'Attendance reward saved', savedLabel: 'Reward saved' });
  });
  it('retains unknown outcomes and retries the exact request without optimistic grants', async () => {
    let attempts = 0;
    const state: SocialCalendarUiState = {};
    const transport = vi.fn(async (command: SocialCalendarCommand, _requestId?: string) => {
      if (command.kind === 'attend' && ++attempts === 1) throw new Error('Connection lost');
      return command.kind === 'attend' ? { ...fixture(), attendedToday: true, attendance: 1, reward: attendanceReward(1, 1) } : fixture();
    });
    opened = openSocialCalendar('attendance', { identity: 'self', state, friends: () => friends, transport, onError: vi.fn() });
    await flush();
    document.querySelector<HTMLButtonElement>('[data-calendar-action="attend"]')!.click();
    await flush();
    expect(state.pending?.command).toEqual({ kind: 'attend' });
    expect(presentReward).not.toHaveBeenCalled();
    expect(document.querySelector<HTMLButtonElement>('[data-calendar-action="attend"]')!.disabled).toBe(true);
    document.querySelector<HTMLButtonElement>('[data-calendar-retry]')!.click();
    await flush();
    const claims = transport.mock.calls.filter(([command]) => command.kind === 'attend');
    expect(claims).toHaveLength(2);
    expect(claims[0][1]).toBe(claims[1][1]);
    expect(state.pending).toBeUndefined();
    expect(presentReward).toHaveBeenCalledOnce();
  });
  it('definitive rejection clears pending state and never celebrates', async () => {
    const state: SocialCalendarUiState = {};
    const transport = vi.fn(async (command: SocialCalendarCommand) => {
      if (command.kind === 'attend') throw new SocialCalendarRejected('Already saved today');
      return fixture();
    });
    opened = openSocialCalendar('attendance', { identity: 'self', state, friends: () => friends, transport, onError: vi.fn() });
    await flush();
    document.querySelector<HTMLButtonElement>('[data-calendar-action="attend"]')!.click();
    await flush();
    expect(state.pending).toBeUndefined();
    expect(document.querySelector('[data-calendar-error]')!.textContent).toBe('Already saved today');
    expect(presentReward).not.toHaveBeenCalled();
  });
  it.each(['error', 'pending'] as const)('Close immediately releases the shared modal after %s and permits reopening', async mode => {
    // Browsers queue native close events; disposal must not wait for that task.
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open');
      setTimeout(() => this.dispatchEvent(new Event('close')), 0);
    };
    let complete!: (view: SocialCalendarView) => void;
    const transport = async (command: SocialCalendarCommand) => {
      if (command.kind === 'read') return fixture();
      if (mode === 'error') throw new SocialCalendarRejected('Fixture save rejected');
      return new Promise<SocialCalendarView>(resolve => { complete = resolve; });
    };
    opened = openSocialCalendar('attendance', { identity: 'self', state: {}, friends: () => friends, transport, onError: vi.fn() });
    await flush();
    document.querySelector<HTMLButtonElement>('[data-calendar-action="attend"]')!.click();
    await flush();
    if (mode === 'error') expect(document.querySelector('[data-calendar-error]')!.textContent).toBe('Fixture save rejected');
    document.querySelector<HTMLButtonElement>('[data-calendar-close]')!.click();
    expect(gameDialogPending()).toBe(false);
    expect(document.querySelector('dialog')).toBeNull();
    await opened;
    opened = openSocialCalendar('mail', { identity: 'self', state: {}, friends: () => friends,
      transport: async () => fixture(), onError: vi.fn() });
    await flush();
    expect(gameDialogPending()).toBe(true);
    expect(document.querySelector('[data-calendar-tab="mail"]')!.getAttribute('aria-pressed')).toBe('true');
    if (mode === 'pending') {
      complete({ ...fixture(), attendedToday: true, attendance: 1, reward: attendanceReward(1, 1) });
      await flush();
      expect(presentReward).not.toHaveBeenCalled();
      expect(gameDialogPending()).toBe(true);
    }
  });
  it('uses same shared dialog for explicit gift confirmation (no nested modal deadlock)', async () => {
    const transport = vi.fn(async (command: SocialCalendarCommand) => command.kind === 'sendGift'
      ? { ...fixture(), giftSentToday: true } : fixture());
    opened = openSocialCalendar('gifts', { identity: 'self', state: {}, friends: () => friends, transport, onError: vi.fn() });
    await flush();
    document.querySelector<HTMLInputElement>('input[name="friend"]')!.checked = true;
    document.querySelector<HTMLFormElement>('[data-calendar-gift]')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(document.querySelector('[data-calendar-gift-confirmation]')!.textContent).toContain('<Friend>');
    expect(document.querySelectorAll('dialog')).toHaveLength(1);
    expect(transport).toHaveBeenCalledOnce();
    document.querySelector<HTMLButtonElement>('[data-calendar-send-confirm]')!.click();
    await flush();
    expect(transport.mock.calls[1][0]).toEqual({ kind: 'sendGift', userId: 'friend-id', gift: 'fractalis' });
    expect(document.querySelector('[data-calendar-status]')!.textContent).toContain('Nothing was deducted');
  });
  it('persists explicit mail reading, escapes body text and exposes claim separately', async () => {
    const mail = { id: 'mail-id', title: '<Gift>', body: '<script>alert(1)</script>', sender: '<Friend>', createdAt: '2026-11-04T12:00:00Z',
      read: false, claimed: false, informational: false, attachment: attendanceReward(1, 1) };
    const transport = vi.fn(async (command: SocialCalendarCommand) => ({ ...fixture(), mail: [{ ...mail, read: command.kind === 'readMail' }] }));
    opened = openSocialCalendar('mail', { identity: 'self', state: {}, friends: () => friends, transport, onError: vi.fn() });
    await flush();
    document.querySelector<HTMLButtonElement>('[data-calendar-mail]')!.click();
    await flush();
    expect(transport.mock.calls[1][0]).toEqual({ kind: 'readMail', id: 'mail-id' });
    expect(document.querySelector('.social-mail-body')!.textContent).toBe(mail.body);
    expect(document.querySelector('script')).toBeNull();
    expect(document.querySelector('[data-calendar-claim]')).not.toBeNull();
    expect(document.querySelectorAll('dialog')).toHaveLength(1);
  });
  it('keeps unlaunched event Seeds out of gift choices and uses factual static labels', () => {
    const host = document.createElement('div');
    host.innerHTML = socialCalendarMarkup(fixture(), 'gifts', friends);
    expect(host.textContent).toContain('Unlaunched Moon/Sunshade Seeds are not eligible');
    expect(host.querySelector('input[value="moonwake-common"]')).toBeNull();
    expect(host.querySelector('input[value="dawnforge-common"]')).toBeNull();
  });
  it('uses shared numeric labels and wrapping attachment groups without changing gift values', () => {
    const host = document.createElement('div');
    host.innerHTML = socialCalendarMarkup(fixture(), 'gifts', friends);
    expect(Array.from(host.querySelectorAll<HTMLInputElement>('input[name="gift"]'), input => input.value))
      .toEqual(['fractalis', 'lycalis', 'infernic-common']);
    expect(host.querySelectorAll('.social-gift-attachment .currency-icon')).toHaveLength(2);
    expect(Array.from(host.querySelectorAll('.info-number'), node => node.textContent))
      .toEqual(['1,000 Prismatica', '10 Null-Prismatica', '10 Seed of Infernic']);
    host.innerHTML = socialCalendarMarkup({ ...fixture(), mail: [{
      id: 'large-reward', title: 'Saved gift', sender: 'Friend', body: 'Mail', read: false, createdAt: '2026-11-04T12:00:00Z',
      informational: false, claimed: false,
      attachment: { fractalis: Number.MAX_SAFE_INTEGER, lycalis: 0, materials: {} },
    }] }, 'mail', friends);
    expect(host.querySelector('[data-calendar-mail] .info-number')?.textContent)
      .toBe('9,007,199,254,740,991 Prismatica');
    expect(host.querySelector('[data-calendar-claim]')?.getAttribute('data-calendar-claim')).toBe('large-reward');
  });
  it('restores initiating focus and closes immediately with Escape', async () => {
    const button = document.createElement('button');
    button.textContent = 'Attendance';
    document.body.append(button); button.focus();
    opened = openSocialCalendar('attendance', { identity: 'self', state: {}, friends: () => friends,
      transport: async () => fixture(), onError: vi.fn() });
    await flush();
    document.querySelector('dialog')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await opened;
    expect(document.activeElement).toBe(button);
    expect(gameDialogPending()).toBe(false);
  });
  it('does not reopen a celebration after dismissal while a save is in flight', async () => {
    let complete!: (view: SocialCalendarView) => void;
    const report = vi.fn();
    const transport = vi.fn((command: SocialCalendarCommand) => command.kind === 'attend'
      ? new Promise<SocialCalendarView>(resolve => { complete = resolve; }) : Promise.resolve(fixture()));
    opened = openSocialCalendar('attendance', { identity: 'self', state: {}, friends: () => friends, transport, onError: report });
    await flush();
    document.querySelector<HTMLButtonElement>('[data-calendar-action="attend"]')!.click();
    document.querySelector<HTMLButtonElement>('[data-calendar-close]')!.click();
    await opened;
    complete({ ...fixture(), attendance: 1, attendedToday: true, reward: attendanceReward(1, 1) });
    await flush();
    expect(presentReward).not.toHaveBeenCalled();
    expect(report).toHaveBeenCalledWith('Reward saved to your online account: 1,000 Prismatica.');
    expect(gameDialogPending()).toBe(false);
  });
});
