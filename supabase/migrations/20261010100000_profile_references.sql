alter table public.player_profiles add column friend_code text;

create function private.assign_friend_code(p_user uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare candidate text;
begin
  loop
    candidate := 'LL-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4)) || '-' ||
      upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4));
    begin
      update public.player_profiles set friend_code = candidate where user_id = p_user;
      return candidate;
    exception when unique_violation then
      null;
    end;
  end loop;
end;
$$;
revoke all on function private.assign_friend_code(uuid) from public, anon, authenticated;

create function private.initialize_profile_reference() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into private.profile_activity(user_id, message, detail, at)
    values (new.user_id, 'Profile created', 'Joined Last Light', new.created_at);
  return new;
end;
$$;
revoke all on function private.initialize_profile_reference() from public, anon, authenticated;

create or replace function private.create_player_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
declare requested_username text := lower(new.raw_user_meta_data ->> 'username'); candidate text;
begin
  loop
    candidate := 'LL-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4)) || '-' ||
      upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4));
    begin
      insert into public.player_profiles(user_id, username, friend_code)
        values (new.id, requested_username, candidate);
      return new;
    exception when unique_violation then
      if exists(select 1 from public.player_profiles where username = requested_username) then
        raise exception 'Username unavailable';
      end if;
    end;
  end loop;
end;
$$;
revoke all on function private.create_player_profile() from public, anon, authenticated;

create table private.profile_metrics (
  user_id uuid primary key references public.player_profiles(user_id) on delete cascade,
  days_played integer not null default 0 check (days_played >= 0),
  play_time_seconds bigint not null default 0
    check (play_time_seconds between 0 and 9007199254740991),
  last_seen_at timestamptz,
  last_active_day date
);
create table private.profile_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.player_profiles(user_id) on delete cascade,
  message text not null,
  detail text not null default '',
  at timestamptz not null default clock_timestamp()
);
create index profile_activity_recent on private.profile_activity(user_id, at desc, id desc);
create table private.profile_request_ids (
  user_id uuid not null references public.player_profiles(user_id) on delete cascade,
  request_id uuid not null,
  created_at timestamptz not null default clock_timestamp(),
  primary key(user_id, request_id)
);
revoke all on private.profile_metrics, private.profile_activity, private.profile_request_ids
  from public, anon, authenticated;

create unique index player_profiles_friend_code on public.player_profiles(friend_code);
do $$
declare row record;
begin
  for row in select user_id from public.player_profiles where friend_code is null loop
    perform private.assign_friend_code(row.user_id);
  end loop;
end;
$$;
alter table public.player_profiles alter column friend_code set not null;
revoke select(friend_code) on public.player_profiles from authenticated;

create trigger initialize_profile_reference
  after insert on public.player_profiles
  for each row execute function private.initialize_profile_reference();

create function public.profile_reference(p_user uuid) returns jsonb
language sql security definer set search_path = '' as $$
  select jsonb_build_object(
    'friendCode', p.friend_code,
    'playerId', substr(p.friend_code, 4),
    'daysPlayed', coalesce(m.days_played, 0),
    'playTimeSeconds', coalesce(m.play_time_seconds, 0),
    'recentActivity', coalesce((
      select jsonb_agg(jsonb_build_object('id', a.id, 'message', a.message,
        'detail', a.detail, 'at', a.at) order by a.at desc, a.id desc)
      from (
        select id, message, detail, at from private.profile_activity
        where user_id = p_user order by at desc, id desc limit 8
      ) a
    ), '[]'::jsonb)
  )
  from public.player_profiles p
  left join private.profile_metrics m on m.user_id = p.user_id
  where p.user_id = p_user
$$;

create function public.track_game_session(p_user uuid, p_request uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  now_at timestamptz := clock_timestamp();
  today date;
  last_at timestamptz;
  last_day date;
  elapsed integer := 0;
  inserted integer;
begin
  perform pg_advisory_xact_lock(hashtextextended('profile-session:' || p_user::text, 1));
  insert into private.profile_metrics(user_id) values (p_user) on conflict (user_id) do nothing;
  select last_seen_at, last_active_day into last_at, last_day
    from private.profile_metrics where user_id = p_user for update;
  insert into private.profile_request_ids(user_id, request_id) values (p_user, p_request)
    on conflict (user_id, request_id) do nothing;
  get diagnostics inserted = row_count;
  if inserted = 0 then return public.profile_reference(p_user); end if;
  today := (now_at at time zone 'UTC')::date;
  if last_at is not null and now_at > last_at then
    if extract(epoch from now_at - last_at) <= 90 then
      elapsed := least(floor(extract(epoch from now_at - last_at))::integer, 60);
    end if;
  end if;
  update private.profile_metrics set
    days_played = days_played + case when last_day is null or today > last_day then 1 else 0 end,
    play_time_seconds = play_time_seconds + elapsed,
    last_seen_at = case when last_at is null or now_at > last_at then now_at else last_at end,
    last_active_day = case when last_day is null or today > last_day then today else last_day end
  where user_id = p_user;
  return public.profile_reference(p_user);
end;
$$;
comment on function public.track_game_session(uuid, uuid) is
  'Uses server time; accrues at most 60 seconds when the prior heartbeat was within 90 seconds, and deduplicates request IDs.';

create function private.record_profile_activity(p_user uuid, p_activity jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare activity_id uuid; activity_message text; activity_detail text;
begin
  if p_activity is null or p_activity = 'null'::jsonb then return; end if;
  if jsonb_typeof(p_activity) <> 'object' or
      (select count(*) from jsonb_object_keys(p_activity)) <> 3 or
      not (p_activity ?& array['id', 'message', 'detail']) then
    raise exception 'Invalid profile activity';
  end if;
  activity_id := (p_activity->>'id')::uuid;
  activity_message := p_activity->>'message';
  activity_detail := p_activity->>'detail';
  if activity_message not in ('Starter selected', 'Save imported', 'Summoned',
      'Conduit purchased', 'Story stage cleared') or
      length(activity_message) > 40 or length(activity_detail) > 120 or
      activity_detail ~ '[[:cntrl:]]' then
    raise exception 'Invalid profile activity';
  end if;
  insert into private.profile_activity(id, user_id, message, detail)
    values (activity_id, p_user, activity_message, activity_detail);
  delete from private.profile_activity where user_id = p_user and id not in (
    select id from private.profile_activity where user_id = p_user
      order by at desc, id desc limit 8
  );
end;
$$;
revoke all on function private.record_profile_activity(uuid, jsonb) from public, anon, authenticated;

create or replace function private.apply_friend_operation(p_user uuid, p_operation jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare
  target uuid;
  action text := p_operation->>'kind';
  changed integer;
  attempts integer;
  friend_count integer;
  first_user uuid;
  second_user uuid;
begin
  if action = 'friendRequest' then
    if (p_operation ? 'username') = (p_operation ? 'friendCode') then
      raise exception 'Enter a username or friend code';
    end if;
    if p_operation ? 'username' then
      select user_id into target from public.player_profiles where username = lower(p_operation->>'username');
    else
      select user_id into target from public.player_profiles where friend_code = upper(p_operation->>'friendCode');
    end if;
    if target is null then raise exception 'Friend username or code is unavailable'; end if;
  else
    target := (p_operation->>'userId')::uuid;
  end if;
  if target = p_user then raise exception 'You cannot friend yourself'; end if;

  first_user := least(p_user, target);
  second_user := greatest(p_user, target);
  if action = 'acceptFriendRequest' then
    perform pg_advisory_xact_lock(hashtextextended('friend-cap:' || first_user::text, 0));
    perform pg_advisory_xact_lock(hashtextextended('friend-cap:' || second_user::text, 0));
  end if;
  perform pg_advisory_xact_lock(hashtextextended(first_user::text || second_user::text, 0));

  if action = 'friendRequest' then
    insert into private.friend_limits as limits(user_id, attempts) values(p_user, 1)
    on conflict(user_id) do update set
      starts_at = case when limits.starts_at < now() - interval '1 hour' then now() else limits.starts_at end,
      attempts = case when limits.starts_at < now() - interval '1 hour' then 1 else limits.attempts + 1 end
    returning limits.attempts into attempts;
    if attempts > 20 then raise exception 'Friend request rate limit: wait one hour'; end if;
    if exists(select 1 from private.friend_edges where least(sender, recipient) = first_user
      and greatest(sender, recipient) = second_user) then
      raise exception 'Friendship or request already exists';
    end if;
    insert into private.friend_edges(sender, recipient) values(p_user, target);
  elsif action = 'acceptFriendRequest' then
    select count(*) into friend_count from private.friend_edges
      where accepted and (sender = p_user or recipient = p_user);
    if friend_count >= 30 then raise exception 'Friend limit reached'; end if;
    select count(*) into friend_count from private.friend_edges
      where accepted and (sender = target or recipient = target);
    if friend_count >= 30 then raise exception 'Friend limit reached'; end if;
    update private.friend_edges set accepted = true
      where sender = target and recipient = p_user and not accepted;
    get diagnostics changed = row_count;
  elsif action = 'declineFriendRequest' then
    delete from private.friend_edges where sender = target and recipient = p_user and not accepted;
    get diagnostics changed = row_count;
  elsif action = 'cancelFriendRequest' then
    delete from private.friend_edges where sender = p_user and recipient = target and not accepted;
    get diagnostics changed = row_count;
  elsif action = 'removeFriend' then
    delete from private.friend_edges where accepted and least(sender, recipient) = first_user
      and greatest(sender, recipient) = second_user;
    get diagnostics changed = row_count;
  else
    raise exception 'Unknown social operation';
  end if;
  if action <> 'friendRequest' and changed <> 1 then
    raise exception 'Friend request or friendship unavailable';
  end if;
end;
$$;
revoke all on function private.apply_friend_operation(uuid, jsonb) from public, anon, authenticated;

alter function public.commit_game_operation(uuid, uuid, text, bigint, jsonb, jsonb, jsonb)
  rename to commit_game_profile_aggregate;
revoke all on function public.commit_game_profile_aggregate(uuid, uuid, text, bigint, jsonb, jsonb, jsonb)
  from public, anon, authenticated;

create function public.commit_game_operation(p_user uuid, p_request uuid, p_fingerprint text,
  p_revision bigint, p_state jsonb, p_response jsonb, p_social jsonb, p_activity jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  current_revision bigint;
  current_state jsonb;
  cached jsonb;
  reply jsonb;
  reference jsonb;
begin
  select revision, state into strict current_revision, current_state
    from private.game_accounts where user_id = p_user for update;
  cached := public.find_game_request(p_user, p_request, p_fingerprint);
  if cached is not null then return cached; end if;
  if current_revision <> p_revision then
    return jsonb_build_object('conflict', true, 'revision', current_revision);
  end if;
  perform public.track_game_session(p_user, p_request);
  perform private.record_profile_activity(p_user, p_activity);
  reference := public.profile_reference(p_user);
  p_state := jsonb_set(p_state, '{profile}', coalesce(p_state->'profile', '{}'::jsonb) || reference, true);
  p_response := jsonb_set(p_response, '{profile}', coalesce(p_response->'profile', '{}'::jsonb) || reference, true);
  reply := public.commit_game_profile_aggregate(p_user, p_request, p_fingerprint,
    p_revision, p_state, p_response, p_social);
  return reply;
end;
$$;
create function public.commit_game_operation(p_user uuid, p_request uuid, p_fingerprint text,
  p_revision bigint, p_state jsonb, p_response jsonb, p_social jsonb default null) returns jsonb
language sql security definer set search_path = '' as $$
  select public.commit_game_operation(p_user, p_request, p_fingerprint, p_revision,
    p_state, p_response, p_social, null::jsonb)
$$;
revoke all on function public.profile_reference(uuid) from public, anon, authenticated;
revoke all on function public.track_game_session(uuid, uuid) from public, anon, authenticated;
revoke all on function public.commit_game_operation(uuid, uuid, text, bigint, jsonb, jsonb, jsonb, jsonb)
  from public, anon, authenticated;
revoke all on function public.commit_game_operation(uuid, uuid, text, bigint, jsonb, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.profile_reference(uuid) to service_role;
grant execute on function public.track_game_session(uuid, uuid) to service_role;
grant execute on function public.commit_game_operation(uuid, uuid, text, bigint, jsonb, jsonb, jsonb, jsonb)
  to service_role;
grant execute on function public.commit_game_operation(uuid, uuid, text, bigint, jsonb, jsonb, jsonb)
  to service_role;
