import { onlineClient } from './account-client';
import type { SocialReward } from '../content/social-calendar';

export interface PlayerMail {
  id: string;
  title: string;
  body: string;
  sender: string;
  createdAt: string;
  read: boolean;
  claimed: boolean;
  informational: boolean;
  attachment: SocialReward;
}
export interface SocialCalendarView {
  serverTime: number;
  resetDay: string;
  nextResetAt: string;
  month: string;
  attendance: number;
  daysInMonth: number;
  attendedToday: boolean;
  streak: number;
  nextReward: SocialReward;
  giftSentToday: boolean;
  seedChoices: string[];
  mail: PlayerMail[];
  reward?: SocialReward;
  claimedCount?: number;
}
export type SocialCalendarCommand =
  | { kind: 'read' | 'attend' | 'claimAll' }
  | { kind: 'sendGift'; userId: string; gift: 'fractalis' | 'lycalis' }
  | { kind: 'sendGift'; userId: string; gift: 'seed'; materialId: string }
  | { kind: 'readMail' | 'claimMail'; id: string };

function validReward(value: unknown): value is SocialReward {
  if (!value || typeof value !== 'object') return false;
  const reward = value as SocialReward;
  const count = (n: unknown) => typeof n === 'number' && Number.isSafeInteger(n) && n >= 0;
  return count(reward.fractalis) && count(reward.lycalis) && !!reward.materials &&
    typeof reward.materials === 'object' && !Array.isArray(reward.materials) &&
    Object.values(reward.materials).every(count) &&
    (reward.streakPremium === undefined || count(reward.streakPremium));
}
export function validSocialCalendarView(value: unknown): value is SocialCalendarView {
  if (!value || typeof value !== 'object') return false;
  const view = value as SocialCalendarView;
  return Number.isFinite(view.serverTime) && typeof view.resetDay === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(view.resetDay) &&
    typeof view.month === 'string' && /^\d{4}-\d{2}$/.test(view.month) &&
    typeof view.nextResetAt === 'string' && Number.isFinite(Date.parse(view.nextResetAt)) &&
    Number.isInteger(view.attendance) && view.attendance >= 0 && view.attendance <= 31 &&
    Number.isInteger(view.daysInMonth) && view.daysInMonth >= 28 && view.daysInMonth <= 31 &&
    typeof view.attendedToday === 'boolean' && Number.isSafeInteger(view.streak) && view.streak >= 0 &&
    typeof view.giftSentToday === 'boolean' && Array.isArray(view.seedChoices) &&
    view.seedChoices.every(seed => typeof seed === 'string') && validReward(view.nextReward) &&
    (view.reward === undefined || validReward(view.reward)) &&
    (view.claimedCount === undefined || Number.isSafeInteger(view.claimedCount) && view.claimedCount >= 0) &&
    Array.isArray(view.mail) && view.mail.every(mail => mail && typeof mail.id === 'string' &&
      typeof mail.title === 'string' && typeof mail.body === 'string' && typeof mail.sender === 'string' &&
      typeof mail.createdAt === 'string' && Number.isFinite(Date.parse(mail.createdAt)) &&
      typeof mail.read === 'boolean' && typeof mail.claimed === 'boolean' &&
      typeof mail.informational === 'boolean' && validReward(mail.attachment));
}

export class SocialCalendarRejected extends Error {}
export async function socialCalendarOperation(command: SocialCalendarCommand, requestId?: string): Promise<SocialCalendarView> {
  const { data, error } = await onlineClient().rpc('social_calendar', {
    p_command: command, p_request: command.kind === 'read' ? null : requestId ?? crypto.randomUUID(),
  });
  if (error) {
    if (error.code === 'P0001' || error.code === '22P02' || error.code === '23505') {
      throw new SocialCalendarRejected(error.message);
    }
    throw new Error('Social/calendar service could not confirm the outcome. Retry the same action to check its saved result.');
  }
  if (!validSocialCalendarView(data)) throw new Error('Social/calendar service returned an invalid response. Retry to confirm the saved result.');
  return data;
}
