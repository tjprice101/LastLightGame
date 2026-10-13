create or replace function public.game_social(p_user uuid) returns jsonb
language sql security definer set search_path = '' as $$
  select jsonb_build_object(
    'friends', coalesce(jsonb_agg(peer) filter(where accepted), '[]'::jsonb),
    'incoming', coalesce(jsonb_agg(peer) filter(where not accepted and recipient = p_user), '[]'::jsonb),
    'outgoing', coalesce(jsonb_agg(peer) filter(where not accepted and sender = p_user), '[]'::jsonb))
  from (
    select e.*, jsonb_build_object('userId', p.user_id, 'username', p.username,
      'displayName', coalesce(g.state->'profile'->>'displayName', p.username),
      'icon', coalesce(g.state->'profile'->>'icon', 'neutral'),
      'frame', coalesce(g.state->'profile'->>'frame', 'default')) ||
      case when e.accepted then jsonb_build_object(
        'lastSeenAt', m.last_seen_at,
        'online', coalesce(m.last_seen_at <= observed.at and
          m.last_seen_at >= observed.at - interval '90 seconds', false))
      else '{}'::jsonb end peer
    from private.friend_edges e
    join public.player_profiles p
      on p.user_id = case when e.sender = p_user then e.recipient else e.sender end
    left join private.game_accounts g on g.user_id = p.user_id
    left join private.profile_metrics m on m.user_id = p.user_id and e.accepted
    cross join (select clock_timestamp() as at) observed
    where p_user in (e.sender, e.recipient)
    order by p.username
  ) graph
$$;
comment on function public.game_social(uuid) is
  'Accepted friends only receive existing server last_seen_at and online status within 90 seconds; requests omit presence.';
revoke all on function public.game_social(uuid) from public, anon, authenticated;
grant execute on function public.game_social(uuid) to service_role;
