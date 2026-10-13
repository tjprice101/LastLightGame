create function public.checkpoint_game_account(p_user uuid, p_revision bigint) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare row private.game_accounts;
begin
  select * into strict row from private.game_accounts where user_id = p_user for update;
  if row.revision <> p_revision then
    return jsonb_build_object('conflict', true, 'revision', row.revision);
  end if;
  -- Re-save only the authoritative aggregate, never a client snapshot or an earlier read.
  update private.game_accounts set state = row.state, updated_at = clock_timestamp()
    where user_id = p_user;
  return jsonb_build_object('revision', row.revision, 'state', row.state);
end;
$$;
revoke all on function public.checkpoint_game_account(uuid, bigint) from public, anon, authenticated;
grant execute on function public.checkpoint_game_account(uuid, bigint) to service_role;
