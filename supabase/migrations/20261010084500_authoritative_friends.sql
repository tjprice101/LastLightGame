create table private.friend_edges (
  sender uuid not null references public.player_profiles(user_id) on delete cascade,
  recipient uuid not null references public.player_profiles(user_id) on delete cascade,
  accepted boolean not null default false,
  created_at timestamptz not null default now(),
  primary key(sender,recipient),
  check(sender <> recipient)
);
create unique index friend_pair on private.friend_edges(least(sender,recipient),greatest(sender,recipient));
alter table private.friend_edges enable row level security;
revoke all on private.friend_edges from public,anon,authenticated;
create policy own_friend_edge on private.friend_edges for select to authenticated
using ((select auth.uid()) in (sender,recipient));
create table private.friend_limits (
  user_id uuid primary key references public.player_profiles(user_id) on delete cascade,
  starts_at timestamptz not null default now(),
  attempts integer not null default 0
);
revoke all on private.friend_limits from public,anon,authenticated;

create function public.game_social(p_user uuid) returns jsonb
language sql security definer set search_path = '' as $$
  select jsonb_build_object(
    'friends', coalesce(jsonb_agg(peer) filter(where accepted),'[]'::jsonb),
    'incoming', coalesce(jsonb_agg(peer) filter(where not accepted and recipient=p_user),'[]'::jsonb),
    'outgoing', coalesce(jsonb_agg(peer) filter(where not accepted and sender=p_user),'[]'::jsonb))
  from (
    select e.*, jsonb_build_object('userId',p.user_id,'username',p.username,
      'displayName',coalesce(g.state->'profile'->>'displayName',p.username),
      'icon',coalesce(g.state->'profile'->>'icon','neutral'),
      'frame',coalesce(g.state->'profile'->>'frame','default')) peer
    from private.friend_edges e
    join public.player_profiles p on p.user_id=case when e.sender=p_user then e.recipient else e.sender end
    left join private.game_accounts g on g.user_id=p.user_id
    where p_user in (e.sender,e.recipient)
    order by p.username
  ) graph
$$;

create function private.apply_friend_operation(p_user uuid,p_operation jsonb) returns void
language plpgsql security definer set search_path='' as $$
declare target uuid; action text:=p_operation->>'kind'; changed integer; attempts integer;
begin
  if action='friendRequest' then
    select user_id into target from public.player_profiles where username=lower(p_operation->>'username');
    if target is null then raise exception 'Friend username is unavailable'; end if;
  else target:=(p_operation->>'userId')::uuid; end if;
  if target=p_user then raise exception 'You cannot friend yourself'; end if;
  -- Serialize both directions without exposing a player directory.
  perform pg_advisory_xact_lock(hashtextextended(least(target,p_user)::text||greatest(target,p_user)::text,0));
  if action='friendRequest' then
    insert into private.friend_limits as limits(user_id,attempts) values(p_user,1)
    on conflict(user_id) do update set
      starts_at=case when limits.starts_at<now()-interval '1 hour' then now() else limits.starts_at end,
      attempts=case when limits.starts_at<now()-interval '1 hour' then 1 else limits.attempts+1 end
    returning limits.attempts into attempts;
    if attempts>20 then
      raise exception 'Friend request rate limit: wait one hour';
    end if;
    if exists(select 1 from private.friend_edges where least(sender,recipient)=least(p_user,target) and greatest(sender,recipient)=greatest(p_user,target)) then
      raise exception 'Friendship or request already exists';
    end if;
    insert into private.friend_edges(sender,recipient) values(p_user,target);
  elsif action='acceptFriendRequest' then
    update private.friend_edges set accepted=true where sender=target and recipient=p_user and not accepted;
    get diagnostics changed=row_count;
  elsif action='declineFriendRequest' then
    delete from private.friend_edges where sender=target and recipient=p_user and not accepted;
    get diagnostics changed=row_count;
  elsif action='cancelFriendRequest' then
    delete from private.friend_edges where sender=p_user and recipient=target and not accepted;
    get diagnostics changed=row_count;
  elsif action='removeFriend' then
    delete from private.friend_edges where accepted and
      least(sender,recipient)=least(p_user,target) and greatest(sender,recipient)=greatest(p_user,target);
    get diagnostics changed=row_count;
  else raise exception 'Unknown social operation';
  end if;
  if action<>'friendRequest' and changed<>1 then raise exception 'Friend request or friendship unavailable'; end if;
end;
$$;

-- Preserve the locked/CAS game commit and apply social changes in that same transaction.
alter function public.commit_game_operation(uuid,uuid,text,bigint,jsonb,jsonb) rename to commit_game_aggregate;
revoke all on function public.commit_game_aggregate(uuid,uuid,text,bigint,jsonb,jsonb) from service_role;
create function public.commit_game_operation(p_user uuid,p_request uuid,p_fingerprint text,
  p_revision bigint,p_state jsonb,p_response jsonb,p_social jsonb default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare current_revision bigint; cached jsonb; reply jsonb;
begin
  select revision into strict current_revision from private.game_accounts where user_id=p_user for update;
  cached:=public.find_game_request(p_user,p_request,p_fingerprint);
  if cached is not null then return cached; end if;
  if current_revision<>p_revision then return jsonb_build_object('conflict',true,'revision',current_revision); end if;
  if p_social is not null then perform private.apply_friend_operation(p_user,p_social); end if;
  p_response:=jsonb_set(p_response,'{social}',public.game_social(p_user));
  reply:=public.commit_game_aggregate(p_user,p_request,p_fingerprint,p_revision,p_state,p_response);
  return reply;
end;
$$;
revoke all on function public.game_social(uuid) from public,anon,authenticated;
revoke all on function private.apply_friend_operation(uuid,jsonb) from public,anon,authenticated;
revoke all on function public.commit_game_operation(uuid,uuid,text,bigint,jsonb,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.game_social(uuid) to service_role;
grant execute on function public.commit_game_operation(uuid,uuid,text,bigint,jsonb,jsonb,jsonb) to service_role;
