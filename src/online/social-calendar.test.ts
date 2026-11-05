import { describe, expect, it, vi } from 'vitest';
import { attendanceReward } from '../content/social-calendar';
import { validSocialCalendarView, socialCalendarOperation, SocialCalendarRejected } from './social-calendar';

const rpc = vi.fn();
vi.mock('./account-client', () => ({ onlineClient: () => ({ rpc }) }));
export function calendarFixture() {
  return {
    serverTime: 1793858400000, resetDay: '2026-11-04', nextResetAt: '2026-11-06T01:00:00Z', month: '2026-11',
    attendance: 0, daysInMonth: 30, attendedToday: false, streak: 0, nextReward: attendanceReward(1, 1),
    giftSentToday: false, seedChoices: ['infernic-common'], mail: [],
  };
}
describe('online social/calendar authority transport', () => {
  it('uses authenticated RPC without client time, rewards or wallet', async () => {
    rpc.mockResolvedValue({ data: calendarFixture(), error: null });
    await socialCalendarOperation({ kind: 'attend' }, 'request-id');
    expect(rpc).toHaveBeenCalledWith('social_calendar', { p_command: { kind: 'attend' }, p_request: 'request-id' });
    await socialCalendarOperation({ kind: 'read' });
    expect(rpc).toHaveBeenLastCalledWith('social_calendar', { p_command: { kind: 'read' }, p_request: null });
  });
  it('distinguishes authoritative rejection from uncertain network outcomes', async () => {
    rpc.mockResolvedValue({ data: null, error: { code: 'P0001', message: 'Attendance already claimed.' } });
    await expect(socialCalendarOperation({ kind: 'attend' }, 'id')).rejects.toBeInstanceOf(SocialCalendarRejected);
    rpc.mockResolvedValue({ data: null, error: { code: 'FETCH_ERROR' } });
    await expect(socialCalendarOperation({ kind: 'attend' }, 'id')).rejects.toThrow('Retry the same action');
  });
  it('validates rewards and persistent mail states', () => {
    expect(validSocialCalendarView(calendarFixture())).toBe(true);
    expect(validSocialCalendarView({ ...calendarFixture(), nextReward: { fractalis: Number.MAX_SAFE_INTEGER + 1, lycalis: 0, materials: {} } })).toBe(false);
    expect(validSocialCalendarView({ ...calendarFixture(), mail: [{ id: 'fake', title: 'Gift' }] })).toBe(false);
    expect(validSocialCalendarView({ ...calendarFixture(), serverTime: NaN })).toBe(false);
  });
});
describe('approved attendance display ladder', () => {
  it('has exact full31 monthly and carried streak budgets', () => {
    const rewards = Array.from({ length: 31 }, (_, index) => attendanceReward(index + 1, 1));
    expect(rewards.reduce((sum, reward) => sum + reward.fractalis, 0)).toBe(263500);
    expect(rewards.reduce((sum, reward) => sum + reward.lycalis, 0)).toBe(230);
    expect(Array.from({ length: 31 }, (_, index) => attendanceReward(index + 1, index + 1))
      .reduce((sum, reward) => sum + reward.streakPremium!, 0)).toBe(70);
    expect(attendanceReward(1, 28).lycalis).toBe(30);
    expect(attendanceReward(1, 35).lycalis).toBe(10);
    expect(() => attendanceReward(32, 1)).toThrow('Invalid');
  });
});
