-- Calendar/mail claims share the authoritative wallet lock and revision with game-operation.
create table private.calendar_attendance (
  user_id uuid primary key references public.player_profiles(user_id) on delete cascade,
  month_key text not null,
  attendance integer not null check (attendance between 1 and 31),
  last_day date not null,
  streak integer not null check (streak > 0)
);
create table private.daily_gifts (
  sender uuid not null references public.player_profiles(user_id) on delete cascade,
  reset_day date not null,
  recipient uuid not null references public.player_profiles(user_id) on delete cascade,
  primary key (sender, reset_day),
  check (sender <> recipient)
);
create table private.player_mail (
  id uuid primary key default gen_random_uuid(),
  recipient uuid not null references public.player_profiles(user_id) on delete cascade,
  sender uuid references public.player_profiles(user_id) on delete set null,
  publication_key text,
  title text not null check (length(title) between 1 and 120),
  body text not null check (length(body) <= 8000),
  attachment jsonb not null default '{"fractalis":0,"lycalis":0,"materials":{}}',
  created_at timestamptz not null default now(),
  read_at timestamptz,
  claimed_at timestamptz,
  unique (recipient, publication_key)
);
create index player_mail_recipient on private.player_mail(recipient, created_at desc, id);
create table private.mail_publications (
  key text primary key check (length(key) between 1 and 120),
  title text not null check (length(title) between 1 and 120),
  body text not null check (length(body) <= 8000),
  created_at timestamptz not null default now()
);
-- No expiry and no read-time delivery writes: publications are projected into the inbox.
create table private.mail_publication_states (
  user_id uuid not null references public.player_profiles(user_id) on delete cascade,
  publication_key text not null references private.mail_publications(key),
  read_at timestamptz not null default now(),
  primary key (user_id, publication_key)
);
insert into private.mail_publications(key, title, body) values (
  'social-calendar-2026-11', 'Attendance, gifts and your mailbox',
  'Monthly attendance is available from Player info. Claim your next reward manually once per New York reset day (8:00 PM). Missed days keep monthly progress but break your consecutive streak; streaks carry across months. You can send one free gift per account per reset day to an accepted friend. Gifts and patch notes never expire. Read mail and claim attachments separately. Unlaunched Moon and Sunshade events are not eligible for event Seed gifts.'
);
create table private.social_calendar_requests (
  user_id uuid not null references public.player_profiles(user_id) on delete cascade,
  request_id uuid not null,
  command jsonb not null,
  response jsonb not null,
  primary key (user_id, request_id)
);
create table private.gift_event_windows (
  family text not null check (family in ('rosethorn', 'moonwake', 'dawnforge')),
  opens_at timestamptz,
  closes_at timestamptz not null,
  check (opens_at is null or opens_at < closes_at),
  unique (family, closes_at)
);
insert into private.gift_event_windows values ('rosethorn', null, '2026-12-01T01:00:00Z');
-- Moon/Sunshade intentionally have NO windows until an approved launch.
revoke all on private.calendar_attendance, private.daily_gifts, private.player_mail,
  private.mail_publications, private.mail_publication_states, private.social_calendar_requests,
  private.gift_event_windows from public, anon, authenticated;

create function private.social_reset_day(p_now timestamptz) returns date
language sql immutable set search_path = '' as $$
  select ((p_now at time zone 'America/New_York') - interval '20 hours')::date
$$;
create function private.attendance_reward(p_day integer, p_streak integer) returns jsonb
language plpgsql immutable set search_path = '' as $$
declare premium integer := 0; streak_premium integer := 0;
begin
  if p_day not between 1 and 31 or p_streak < 1 then raise exception 'Invalid attendance ordinal'; end if;
  if p_day % 5 = 0 then premium := 10; end if;
  if p_day = 15 then premium := 20;
  elsif p_day = 25 then premium := 30;
  elsif p_day = 28 then premium := 40;
  elsif p_day = 30 then premium := 50;
  elsif p_day = 31 then premium := 60; end if;
  if p_streak % 7 = 0 then
    streak_premium := case when p_streak % 28 = 0 then 30 when p_streak % 14 = 0 then 20 else 10 end;
  end if;
  return jsonb_build_object('fractalis', 1000 + 500 * (p_day - 1), 'lycalis', premium + streak_premium,
    'materials', '{}'::jsonb, 'streakPremium', streak_premium);
end;
$$;

create function private.social_calendar_view(p_user uuid, p_now timestamptz) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  day_key date := private.social_reset_day(p_now);
  month_key text := to_char(day_key, 'YYYY-MM');
  attendance private.calendar_attendance;
  ordinal integer; next_streak integer; inbox jsonb; choices jsonb;
begin
  select * into attendance from private.calendar_attendance where user_id = p_user;
  ordinal := case when attendance.month_key = month_key then attendance.attendance else 0 end;
  next_streak := case when attendance.last_day = day_key - 1 then attendance.streak + 1
    when attendance.last_day = day_key then attendance.streak else 1 end;
  select coalesce(jsonb_agg(item order by created_at desc, id), '[]'::jsonb) into inbox from (
    select m.created_at, m.id::text id, jsonb_build_object('id', m.id, 'title', m.title, 'body', m.body,
      'sender', coalesce(g.state->'profile'->>'displayName', p.username, 'Friend'),
      'createdAt', m.created_at, 'read', m.read_at is not null, 'claimed', m.claimed_at is not null,
      'attachment', m.attachment, 'informational', false) item
    from private.player_mail m left join public.player_profiles p on p.user_id = m.sender
    left join private.game_accounts g on g.user_id = m.sender where m.recipient = p_user
    union all
    select p.created_at, 'patch:' || p.key, jsonb_build_object('id', 'patch:' || p.key, 'title', p.title,
      'body', p.body, 'sender', 'Last Light', 'createdAt', p.created_at, 'read', s.read_at is not null,
      'claimed', false, 'attachment', jsonb_build_object('fractalis', 0, 'lycalis', 0, 'materials', '{}'::jsonb),
      'informational', true)
    from private.mail_publications p left join private.mail_publication_states s
      on s.publication_key = p.key and s.user_id = p_user
  ) mail;
  select jsonb_agg(seed order by seed) into choices from (
    select unnest(array['infernic-common','oceanic-common','atmospheric-common','botanic-common',
      'tranquilitic-common','chaotic-common']) seed
    union select family || '-common' from private.gift_event_windows
      where (opens_at is null or opens_at <= p_now) and p_now < closes_at
  ) seeds;
  return jsonb_build_object('serverTime', floor(extract(epoch from p_now) * 1000), 'resetDay', day_key,
    'nextResetAt', ((day_key + 1) + time '20:00') at time zone 'America/New_York',
    'month', month_key, 'attendance', ordinal,
    'daysInMonth', extract(day from (date_trunc('month', day_key::timestamp) + interval '1 month - 1 day'))::integer,
    'attendedToday', coalesce(attendance.last_day = day_key, false),
    'streak', case when attendance.last_day >= day_key - 1 then attendance.streak else 0 end,
    'nextReward', private.attendance_reward(least(ordinal + 1, 31), next_streak),
    'giftSentToday', exists(select 1 from private.daily_gifts where sender = p_user and reset_day = day_key),
    'seedChoices', choices, 'mail', inbox);
end;
$$;

create function private.add_social_reward(p_account jsonb, p_reward jsonb) returns jsonb
language plpgsql immutable set search_path = '' as $$
declare key text; amount numeric; current_amount numeric; total numeric;
begin
  if jsonb_typeof(p_account->'materials') <> 'object' or jsonb_typeof(p_reward->'materials') <> 'object' then
    raise exception 'Invalid reward materials';
  end if;
  foreach key in array array['fractalis', 'lycalis'] loop
    amount := (p_reward->>key)::numeric;
    current_amount := (p_account->>key)::numeric;
    total := current_amount + amount;
    if amount is null or current_amount is null or amount < 0 or current_amount < 0
      or trunc(amount) <> amount or trunc(current_amount) <> current_amount or total > 9007199254740991 then
      raise exception 'Reward exceeds account capacity. Nothing was claimed.';
    end if;
    p_account := jsonb_set(p_account, array[key], to_jsonb(total));
  end loop;
  for key, amount in select k, v::numeric from jsonb_each_text(p_reward->'materials') e(k, v) loop
    current_amount := coalesce((p_account->'materials'->>key)::numeric, 0);
    total := current_amount + amount;
    if amount is null or current_amount is null or amount < 0 or current_amount < 0 or trunc(amount) <> amount or trunc(current_amount) <> current_amount
      or total > 9007199254740991 then raise exception 'Reward exceeds material capacity. Nothing was claimed.'; end if;
    p_account := jsonb_set(p_account, array['materials', key], to_jsonb(total));
  end loop;
  return p_account;
end;
$$;

-- Only the authenticated caller is selectable; no caller-supplied clock, reward or wallet.
create function public.social_calendar(p_command jsonb default '{"kind":"read"}', p_request uuid default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  server_now timestamptz := now();
  day_key date := private.social_reset_day(server_now);
  month_key text := to_char(day_key, 'YYYY-MM');
  action text := p_command->>'kind';
  aggregate private.game_accounts;
  previous private.calendar_attendance;
  cached private.social_calendar_requests;
  ordinal integer; streak integer; target uuid; seed text; mail_id text; entry private.player_mail;
  reward jsonb := '{"fractalis":0,"lycalis":0,"materials":{}}';
  attachment jsonb; next_account jsonb; result jsonb;
  claimed integer := 0; changed_wallet boolean := false;
begin
  if actor is null then raise exception 'Sign in to an online account.'; end if;
  if action = 'read' then return private.social_calendar_view(actor, server_now); end if;
  if action is null or action not in ('attend', 'sendGift', 'readMail', 'claimMail', 'claimAll') or p_request is null then
    raise exception 'Invalid social/calendar request';
  end if;
  -- Same lock as game-operation prevents concurrent wallet overwrites and double claims.
  select * into strict aggregate from private.game_accounts where game_accounts.user_id = actor for update;
  select * into cached from private.social_calendar_requests r where r.user_id = actor and request_id = p_request;
  if found then
    if cached.command <> p_command then raise exception 'Request ID reused with different input'; end if;
    return cached.response;
  end if;
  if not public.consume_game_attempt(actor) then raise exception 'Too many social/calendar actions. Try again in one minute.'; end if;
  if aggregate.state->>'starterId' is null then raise exception 'Select your starter before claiming rewards.'; end if;
  next_account := aggregate.state->'account';
  if action = 'attend' then
    select * into previous from private.calendar_attendance a where a.user_id = actor;
    if previous.last_day = day_key then raise exception 'Attendance already claimed for this reset day.'; end if;
    ordinal := case when previous.month_key = month_key then previous.attendance + 1 else 1 end;
    streak := case when previous.last_day = day_key - 1 then previous.streak + 1 else 1 end;
    reward := private.attendance_reward(ordinal, streak);
    next_account := private.add_social_reward(next_account, reward);
    insert into private.calendar_attendance values (actor, month_key, ordinal, day_key, streak)
      on conflict (user_id) do update set month_key = excluded.month_key, attendance = excluded.attendance,
        last_day = excluded.last_day, streak = excluded.streak;
    changed_wallet := true;
  elsif action = 'sendGift' then
    target := (p_command->>'userId')::uuid;
    if target is null or target = actor then raise exception 'Choose an accepted friend.'; end if;
    perform pg_advisory_xact_lock(hashtextextended(least(target,actor)::text || greatest(target,actor)::text,0));
    if not exists(select 1 from private.friend_edges where accepted and
      least(sender,recipient) = least(actor,target) and greatest(sender,recipient) = greatest(actor,target))
      or private.chat_blocked(actor, target) then raise exception 'Gifts require a currently accepted friend.'; end if;
    if exists(select 1 from private.daily_gifts where sender = actor and reset_day = day_key) then
      raise exception 'Your free gift was already sent for this reset day.';
    end if;
    if p_command->>'gift' = 'fractalis' then attachment := '{"fractalis":1000,"lycalis":0,"materials":{}}';
    elsif p_command->>'gift' = 'lycalis' then attachment := '{"fractalis":0,"lycalis":10,"materials":{}}';
    elsif p_command->>'gift' = 'seed' then
      seed := p_command->>'materialId';
      if seed is null or not (private.social_calendar_view(actor, server_now)->'seedChoices' ? seed) then
        raise exception 'This Seed is not currently eligible for gifting.';
      end if;
      attachment := jsonb_build_object('fractalis', 0, 'lycalis', 0, 'materials', jsonb_build_object(seed, 10));
    else raise exception 'Unknown gift choice'; end if;
    insert into private.daily_gifts values (actor, day_key, target);
    insert into private.player_mail(recipient, sender, title, body, attachment)
      values (target, actor, 'A gift from your friend', 'A free daily gift. Claim whenever you like; this mail never expires.', attachment);
  elsif action = 'readMail' then
    mail_id := p_command->>'id';
    if left(mail_id, 6) = 'patch:' then
      if not exists(select 1 from private.mail_publications where key = substring(mail_id from 7)) then
        raise exception 'Mail is unavailable';
      end if;
      insert into private.mail_publication_states(user_id, publication_key) values (actor, substring(mail_id from 7))
        on conflict do nothing;
    else
      update private.player_mail set read_at = coalesce(read_at, server_now)
        where id = mail_id::uuid and recipient = actor;
      if not found then raise exception 'Mail is unavailable'; end if;
    end if;
  else
    if action = 'claimMail' then
      mail_id := p_command->>'id';
      if not exists(select 1 from private.player_mail where id = mail_id::uuid and recipient = actor) then
        raise exception 'Reward mail is unavailable';
      end if;
    end if;
    for entry in select * from private.player_mail where recipient = actor and claimed_at is null
      and (action = 'claimAll' or id = mail_id::uuid) order by id for update loop
      -- Validate every attachment before publishing any wallet or claim changes.
      next_account := private.add_social_reward(next_account, entry.attachment);
      reward := private.add_social_reward(reward, entry.attachment);
      update private.player_mail set claimed_at = server_now, read_at = coalesce(read_at, server_now) where id = entry.id;
      claimed := claimed + 1;
    end loop;
    changed_wallet := claimed > 0;
  end if;
  if changed_wallet then
    update private.game_accounts set state = jsonb_set(state, '{account}', next_account),
      revision = revision + 1, updated_at = server_now where game_accounts.user_id = actor;
  end if;
  result := private.social_calendar_view(actor, server_now) || jsonb_build_object('reward', reward, 'claimedCount', claimed);
  insert into private.social_calendar_requests values (actor, p_request, p_command, result);
  return result;
end;
$$;

-- Service-only publication; repeated identical keys are safe, changed content is rejected.
create function public.publish_game_patch(p_key text, p_title text, p_body text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  insert into private.mail_publications(key, title, body) values(p_key, p_title, p_body) on conflict do nothing;
  if not exists(select 1 from private.mail_publications where key = p_key and title = p_title and body = p_body) then
    raise exception 'Publication key already has different content';
  end if;
end;
$$;
create function public.schedule_gift_event(p_family text, p_opens_at timestamptz, p_closes_at timestamptz) returns void
language plpgsql security definer set search_path = '' as $$
begin
  insert into private.gift_event_windows(family, opens_at, closes_at) values (p_family, p_opens_at, p_closes_at)
    on conflict (family, closes_at) do update set opens_at = excluded.opens_at;
end;
$$;
revoke all on function private.social_reset_day(timestamptz), private.attendance_reward(integer,integer),
  private.social_calendar_view(uuid,timestamptz), private.add_social_reward(jsonb,jsonb),
  public.social_calendar(jsonb,uuid), public.publish_game_patch(text,text,text),
  public.schedule_gift_event(text,timestamptz,timestamptz) from public, anon, authenticated;
grant execute on function public.social_calendar(jsonb,uuid) to authenticated;
grant execute on function public.publish_game_patch(text,text,text) to service_role;
grant execute on function public.schedule_gift_event(text,timestamptz,timestamptz) to service_role;
