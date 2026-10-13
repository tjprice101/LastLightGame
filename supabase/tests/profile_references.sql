begin;
do $$
declare
  a uuid := gen_random_uuid();
  b uuid := gen_random_uuid();
  c uuid := gen_random_uuid();
  reply jsonb;
  duplicate_reply jsonb;
  code text;
  reference jsonb;
  before_seconds bigint;
  request_id uuid;
  tracked_request uuid;
  revision_before bigint;
  i integer;
  peer_id uuid;
  peer_name text;
  legacy_peer uuid;
begin
  insert into auth.users(id, raw_user_meta_data) values
    (a, '{"username":"profile_ref_a"}'), (b, '{"username":"profile_ref_b"}'),
    (c, '{"username":"profile_ref_c"}');
  perform public.load_game_account(a, '{"profile":{"username":"profile_ref_a","displayName":"A","icon":"neutral","frame":"default"}}');
  perform public.load_game_account(b, '{"profile":{"username":"profile_ref_b","displayName":"B","icon":"neutral","frame":"default"}}');

  code := public.profile_reference(b)->>'friendCode';
  assert code ~ '^LL-[0-9A-F]{4}-[0-9A-F]{4}$', 'generated friend code format';
  assert public.profile_reference(b)->>'playerId' = substr(code, 4), 'public player id derives from friend code';
  assert public.profile_reference(b)->>'friendCode' = code, 'friend code remains stable';
  assert not (public.profile_reference(b) ? 'email'), 'profile reference excludes email';
  assert not (public.profile_reference(b) ? 'userId'), 'profile reference excludes credentials/UUID';

  reply := public.commit_game_operation(a, gen_random_uuid(), repeat('a', 64), 0,
    '{"profile":{"username":"profile_ref_a","displayName":"A","icon":"neutral","frame":"default"}}',
    '{"profile":{"username":"profile_ref_a","displayName":"A","icon":"neutral","frame":"default"}}',
    jsonb_build_object('kind','friendRequest','friendCode',code));
  assert jsonb_array_length(reply->'social'->'outgoing') = 1, 'friend request resolves by code';
  assert not ((reply->'social'->'outgoing'->0) ? 'email'), 'friend graph excludes email';
  assert not ((reply->'social'->'outgoing'->0) ? 'friendCode'), 'friend graph does not expose reference fields';

  select revision into revision_before from private.game_accounts where user_id = a;
  tracked_request := gen_random_uuid();
  reference := public.track_game_session(a, tracked_request);
  assert (reference->>'daysPlayed')::integer = 1, 'first successful online day counts once';
  assert (reference->>'playTimeSeconds')::bigint = 0, 'first touch does not invent elapsed time';
  assert public.track_game_session(a, tracked_request) = reference, 'duplicate heartbeat is idempotent';
  assert (select revision from private.game_accounts where user_id = a) = revision_before,
    'session tracking never advances game revision';
  before_seconds := (reference->>'playTimeSeconds')::bigint;
  update private.profile_metrics set last_seen_at = clock_timestamp() - interval '30 seconds' where user_id = a;
  reference := public.track_game_session(a, gen_random_uuid());
  assert (reference->>'playTimeSeconds')::bigint between before_seconds and before_seconds + 30,
    'recent server-clock session time is bounded';
  before_seconds := (reference->>'playTimeSeconds')::bigint;
  update private.profile_metrics set last_seen_at = clock_timestamp() - interval '5 minutes' where user_id = a;
  reference := public.track_game_session(a, gen_random_uuid());
  assert (reference->>'playTimeSeconds')::bigint = before_seconds, 'time away is not accrued';

  request_id := gen_random_uuid();
  reply := public.commit_game_operation(a, request_id, repeat('b', 64), 1,
    '{"profile":{"username":"profile_ref_a","displayName":"A","icon":"neutral","frame":"default","daysPlayed":0,"playTimeSeconds":0,"recentActivity":[]}}',
    '{"profile":{"username":"profile_ref_a","displayName":"A","icon":"neutral","frame":"default"}}',
    null, '{"id":"00000000-0000-4000-8000-000000000001","message":"Starter selected","detail":"ember Element-Bearer"}');
  assert reply->'profile'->>'friendCode' = public.profile_reference(a)->>'friendCode',
    'commit response receives current profile fields';
  assert reply->'profile'->>'playerId' = public.profile_reference(a)->>'playerId',
    'commit response includes public player id';
  assert reply->'profile'->'recentActivity'->0->>'message' = 'Starter selected',
    'committed activity returned';
  assert (reply->'profile'->>'daysPlayed')::integer = (public.profile_reference(a)->>'daysPlayed')::integer,
    'commit response has current tracked metrics';
  duplicate_reply := public.commit_game_operation(a, request_id, repeat('b', 64), 1,
    '{"profile":{}}', '{"profile":{}}', null,
    '{"id":"00000000-0000-4000-8000-000000000002","message":"Starter selected","detail":"duplicate"}');
  assert duplicate_reply = reply, 'repeated committed operation returns exact response';
  for i in 1..10 loop
    perform private.record_profile_activity(a, jsonb_build_object(
      'id', gen_random_uuid(), 'message', 'Summoned', 'detail', 'Standard · 1 draw'));
  end loop;
  assert jsonb_array_length(public.profile_reference(a)->'recentActivity') = 8,
    'recent activity retains only the latest eight records';

  for i in 1..30 loop
    peer_name := 'cpeer_' || lpad(i::text, 2, '0');
    peer_id := gen_random_uuid();
    insert into auth.users(id, raw_user_meta_data) values(peer_id, jsonb_build_object('username', peer_name));
    perform private.apply_friend_operation(peer_id, jsonb_build_object('kind','friendRequest','username','profile_ref_c'));
    perform private.apply_friend_operation(c, jsonb_build_object('kind','acceptFriendRequest','userId',peer_id));
  end loop;
  legacy_peer := gen_random_uuid();
  insert into auth.users(id, raw_user_meta_data) values(legacy_peer, '{"username":"legacy_friend"}');
  insert into private.friend_edges(sender, recipient, accepted) values(c, legacy_peer, true);
  perform private.apply_friend_operation(c, jsonb_build_object('kind','friendRequest','username','profile_ref_a'));
  begin
    perform private.apply_friend_operation(a, jsonb_build_object('kind','acceptFriendRequest','userId',c));
    raise exception 'accepting from a capped friend was allowed';
  exception when raise_exception then
    if sqlerrm = 'accepting from a capped friend was allowed' then raise; end if;
  end;
  assert (select count(*) from private.friend_edges where accepted and (sender = c or recipient = c)) = 31,
    'legacy excess accepted friends are preserved';

  for i in 1..30 loop
    peer_name := 'profpeer_' || lpad(i::text, 2, '0');
    peer_id := gen_random_uuid();
    insert into auth.users(id, raw_user_meta_data) values(peer_id, jsonb_build_object('username', peer_name));
    insert into private.friend_edges(sender, recipient, accepted) values(a, peer_id, true);
  end loop;
  peer_name := 'profpeer_31';
  peer_id := gen_random_uuid();
  insert into auth.users(id, raw_user_meta_data) values(peer_id, jsonb_build_object('username', peer_name));
  perform private.apply_friend_operation(peer_id, jsonb_build_object('kind','friendRequest','username','profile_ref_a'));
  begin
    perform private.apply_friend_operation(a, jsonb_build_object('kind','acceptFriendRequest','userId',peer_id));
    raise exception 'friend cap allowed the 31st accepted friend';
  exception when raise_exception then
    if sqlerrm = 'friend cap allowed the 31st accepted friend' then raise; end if;
  end;
  assert (select count(*) from private.friend_edges where accepted and (sender = a or recipient = a)) = 30,
    'new accepted friendships stop at thirty';

  assert not has_function_privilege('authenticated','public.profile_reference(uuid)','EXECUTE'),
    'profile reference endpoint is service-only';
  assert not has_function_privilege('authenticated','public.track_game_session(uuid,uuid)','EXECUTE'),
    'session tracker is service-only';
  assert not has_table_privilege('authenticated','private.profile_activity','SELECT'),
    'activity storage is private';
end $$;
rollback;
