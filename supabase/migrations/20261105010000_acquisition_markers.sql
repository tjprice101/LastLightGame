-- Lifetime acquisition metadata lives inside the same authoritative aggregate/save.
-- No migration/load wallet writes. Old positive holdings are projected as already seen.
create function private.acquisition_keys(p_account jsonb) returns table(key text)
language sql immutable set search_path = '' as $$
  select 'character:' || k from jsonb_object_keys(coalesce(p_account->'characters', '{}')) k
  union select 'form:' || (copy->>'creatureId')
    from jsonb_array_elements(coalesce(p_account->'capturedCharacters', '[]')) copy
    where copy->>'creatureId' is not null
  union select 'material:' || k from jsonb_each_text(coalesce(p_account->'materials', '{}')) e(k,v) where v::numeric > 0
  union select 'conduit:' || k from jsonb_each_text(coalesce(p_account->'conduits', '{}')) e(k,v) where v::numeric > 0
  union select 'master:' || k from jsonb_each_text(coalesce(p_account->'masterConduits', '{}')) e(k,v) where v::numeric > 0
$$;
create function private.acquisition_view(p_account jsonb) returns jsonb
language plpgsql immutable set search_path = '' as $$
declare markers jsonb := coalesce(p_account->'acquisitionMarkers', '{}'); entry record;
begin
  for entry in select key from private.acquisition_keys(p_account) loop
    if not markers ? entry.key then markers := markers || jsonb_build_object(entry.key, true); end if;
  end loop;
  return markers;
end;
$$;
create function private.track_acquisitions() returns trigger
language plpgsql security definer set search_path = '' as $$
declare markers jsonb; entry record; proposed jsonb;
begin
  if new.state->'account' is null then return new; end if;
  if tg_op = 'INSERT' then
    return new;
  else
    markers := private.acquisition_view(old.state->'account');
    proposed := coalesce(new.state->'account'->'acquisitionMarkers', '{}');
    for entry in select key, value from jsonb_each(proposed) loop
      if markers ? entry.key and entry.value = 'true'::jsonb then
        markers := markers || jsonb_build_object(entry.key, true);
      end if;
    end loop;
    for entry in select key from private.acquisition_keys(new.state->'account') loop
      if not markers ? entry.key then
        markers := markers || jsonb_build_object(entry.key,
          coalesce(old.state->>'starterId' is null and proposed->entry.key = 'true'::jsonb, false));
      end if;
    end loop;
  end if;
  new.state := jsonb_set(new.state, '{account,acquisitionMarkers}', markers);
  return new;
end;
$$;
create trigger track_game_acquisitions before insert or update of state on private.game_accounts
  for each row execute function private.track_acquisitions();

create function public.acquisition_markers(p_keys jsonb default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); aggregate private.game_accounts; markers jsonb; key text; changed boolean := false;
begin
  if actor is null then raise exception 'Sign in to view acquisition markers.'; end if;
  if p_keys is null then
    select * into strict aggregate from private.game_accounts where user_id = actor;
    return jsonb_build_object('revision', aggregate.revision, 'markers', private.acquisition_view(aggregate.state->'account'));
  end if;
  if jsonb_typeof(p_keys) <> 'array' or jsonb_array_length(p_keys) > 200 then raise exception 'Invalid acquisition acknowledgement'; end if;
  select * into strict aggregate from private.game_accounts where user_id = actor for update;
  markers := private.acquisition_view(aggregate.state->'account');
  for key in select jsonb_array_elements_text(p_keys) loop
    if key !~ '^(character|form|material|conduit|master):[a-z0-9][a-z0-9:_-]{0,159}$' then raise exception 'Invalid acquisition key'; end if;
    if markers->key = 'false'::jsonb then markers := markers || jsonb_build_object(key, true); changed := true; end if;
  end loop;
  if changed then
    update private.game_accounts set state = jsonb_set(state, '{account,acquisitionMarkers}', markers),
      updated_at = now() where user_id = actor returning * into aggregate;
  end if;
  return jsonb_build_object('revision', aggregate.revision, 'markers', markers);
end;
$$;
comment on function public.acquisition_markers(jsonb) is
  'Own-user monotonic metadata acknowledgement under aggregate lock. Does not invalidate gameplay revision; commit trigger preserves already-seen keys across concurrent wallet commits.';
revoke all on function private.acquisition_keys(jsonb), private.acquisition_view(jsonb),
  private.track_acquisitions(), public.acquisition_markers(jsonb) from public, anon, authenticated;
grant execute on function public.acquisition_markers(jsonb) to authenticated;

-- The commit response must contain the trigger-authorized metadata, never a stale pre-save view.
create or replace function public.commit_game_aggregate(p_user uuid, p_request uuid, p_fingerprint text,
  p_revision bigint, p_state jsonb, p_response jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare current_revision bigint; cached jsonb; saved_state jsonb;
begin
  select revision into strict current_revision from private.game_accounts where user_id = p_user for update;
  cached := public.find_game_request(p_user, p_request, p_fingerprint);
  if cached is not null then return cached; end if;
  if current_revision <> p_revision then return jsonb_build_object('conflict', true, 'revision', current_revision); end if;
  if length(p_fingerprint) <> 64 or jsonb_typeof(p_state) <> 'object' or jsonb_typeof(p_response) <> 'object' then
    raise exception 'Invalid game commit';
  end if;
  update private.game_accounts set revision = current_revision + 1, state = p_state, updated_at = now()
    where user_id = p_user returning state into saved_state;
  p_response := jsonb_set(p_response, '{revision}', to_jsonb(current_revision + 1));
  p_response := jsonb_set(p_response, '{account}', saved_state->'account');
  insert into private.game_requests(user_id, request_id, fingerprint, response) values (p_user, p_request, p_fingerprint, p_response);
  return p_response;
end;
$$;
