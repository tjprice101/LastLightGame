-- D-340: accepted friends can read each other's full profile view. The edge function projects
-- this row into a redacted account (no balances, materials, receipts or seeds) before returning it.
create function public.friend_profile(p_user uuid, p_friend uuid) returns jsonb
language sql security definer set search_path = '' as $$
  select jsonb_build_object(
    'userId', p.user_id,
    'username', p.username,
    'createdAt', p.created_at,
    'state', g.state,
    'reference', public.profile_reference(p.user_id))
  from private.friend_edges e
  join public.player_profiles p on p.user_id = p_friend
  left join private.game_accounts g on g.user_id = p.user_id
  where e.accepted and p_user <> p_friend
    and ((e.sender = p_user and e.recipient = p_friend) or (e.sender = p_friend and e.recipient = p_user))
$$;
comment on function public.friend_profile(uuid, uuid) is
  'Accepted friends only; returns null otherwise. Callers must redact the game state before exposing it.';
revoke all on function public.friend_profile(uuid, uuid) from public, anon, authenticated;
grant execute on function public.friend_profile(uuid, uuid) to service_role;
