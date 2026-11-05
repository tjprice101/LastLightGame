import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { freshGame, friendProfileView, resolveOperation } from '../../supabase/functions/game-operation/engine';

describe('social/calendar data stays private', () => {
  it('does not expose future calendar/mail/unread fields through friend-profile projection', () => {
    const game = resolveOperation(freshGame('friend'), { kind: 'bootstrap', starterId: 'ember' },
      { seed: () => 123, random: () => .9, uuid: () => crypto.randomUUID() }).game;
    const state = {
      ...game, calendar: { attendance: 30 }, mailbox: [{ body: 'private-mail-content' }], unread: 99,
      account: { ...game.account, acquisitionMarkers: { 'material:private-acquisition': false }, calendar: { streak: 31 }, mail: ['private-account-mail'] },
      profile: { ...game.profile, privateCalendar: 'private-calendar-content' },
    };
    const view = friendProfileView({ userId: crypto.randomUUID(), username: 'friend', createdAt: game.profile.createdAt, state, reference: null });
    for (const secret of ['private-mail-content', 'private-account-mail', 'private-acquisition', 'private-calendar-content', '"mailbox"', '"unread"', '"calendar"']) {
      expect(JSON.stringify(view)).not.toContain(secret);
    }
  });
  it('stores social/calendar metadata outside the game aggregate and never adds it to friend references', () => {
    const sql = readFileSync('supabase\\migrations\\20261105000000_social_calendar.sql', 'utf8');
    expect(sql).toContain('create table private.calendar_attendance');
    expect(sql).toContain('create table private.player_mail');
    expect(sql).not.toContain('create or replace function public.friend_profile');
    expect(sql).not.toContain('create or replace function public.profile_reference');
    expect(sql).toContain("jsonb_set(state, '{account}', next_account)");
  });
});
