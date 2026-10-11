create table private.game_accounts (
  user_id uuid primary key references public.player_profiles(user_id) on delete cascade,
  revision bigint not null default 0 check (revision >= 0),
  state jsonb not null,
  updated_at timestamptz not null default now()
);
create table private.game_requests (
  user_id uuid not null references private.game_accounts(user_id) on delete cascade,
  request_id uuid not null,
  fingerprint text not null,
  response jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, request_id)
);
create table private.game_limits (
  user_id uuid primary key references public.player_profiles(user_id) on delete cascade,
  starts_at timestamptz not null,
  attempts integer not null
);
revoke all on private.game_accounts, private.game_requests, private.game_limits from public, anon, authenticated;

create function public.consume_game_attempt(p_user uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
declare used integer;
begin
  insert into private.game_limits as limits values (p_user, now(), 1)
  on conflict (user_id) do update set
    starts_at = case when limits.starts_at < now() - interval '1 minute' then now() else limits.starts_at end,
    attempts = case when limits.starts_at < now() - interval '1 minute' then 1 else least(limits.attempts + 1, 121) end
  returning attempts into used;
  return used <= 120;
end;
$$;

create function public.load_game_account(p_user uuid, p_initial jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare row private.game_accounts;
begin
  insert into private.game_accounts(user_id, state) values (p_user, p_initial)
    on conflict (user_id) do nothing;
  select * into strict row from private.game_accounts where user_id = p_user;
  return jsonb_build_object('revision', row.revision, 'state', row.state);
end;
$$;

create function public.find_game_request(p_user uuid, p_request uuid, p_fingerprint text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare row private.game_requests;
begin
  select * into row from private.game_requests where user_id = p_user and request_id = p_request;
  if not found then return null; end if;
  if row.fingerprint <> p_fingerprint then raise exception 'Request ID reused with different input'; end if;
  return row.response;
end;
$$;

create function public.commit_game_operation(p_user uuid, p_request uuid, p_fingerprint text,
  p_revision bigint, p_state jsonb, p_response jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare current_revision bigint; cached jsonb;
begin
  -- Lock the entire authoritative aggregate: account, frozen run and profile.
  select revision into strict current_revision from private.game_accounts where user_id = p_user for update;
  cached := public.find_game_request(p_user, p_request, p_fingerprint);
  if cached is not null then return cached; end if;
  if current_revision <> p_revision then
    return jsonb_build_object('conflict', true, 'revision', current_revision);
  end if;
  if length(p_fingerprint) <> 64 or jsonb_typeof(p_state) <> 'object' or
    jsonb_typeof(p_response) <> 'object' then raise exception 'Invalid game commit'; end if;
  p_response := jsonb_set(p_response, '{revision}', to_jsonb(current_revision + 1));
  update private.game_accounts set revision = current_revision + 1, state = p_state, updated_at = now()
    where user_id = p_user;
  insert into private.game_requests(user_id, request_id, fingerprint, response)
    values (p_user, p_request, p_fingerprint, p_response);
  return p_response;
end;
$$;
revoke all on function public.consume_game_attempt(uuid) from public, anon, authenticated;
revoke all on function public.load_game_account(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.find_game_request(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.commit_game_operation(uuid, uuid, text, bigint, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.consume_game_attempt(uuid) to service_role;
grant execute on function public.load_game_account(uuid, jsonb) to service_role;
grant execute on function public.find_game_request(uuid, uuid, text) to service_role;
grant execute on function public.commit_game_operation(uuid, uuid, text, bigint, jsonb, jsonb) to service_role;
comment on table private.game_accounts is 'Server-only aggregate. No client wallets, reward claims or local save imports.';
