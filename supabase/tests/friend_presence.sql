begin;
do $$
declare
  a uuid := gen_random_uuid();
  b uuid := gen_random_uuid();
  c uuid := gen_random_uuid();
  d uuid := gen_random_uuid();
  peer jsonb;
  seen timestamptz;
  game_before jsonb;
  tracked_request uuid := gen_random_uuid();
begin
  insert into auth.users(id, raw_user_meta_data) values
    (a, '{"username":"presence_a"}'), (b, '{"username":"presence_b"}'),
    (c, '{"username":"presence_c"}'), (d, '{"username":"presence_d"}');
  perform public.load_game_account(a, '{"profile":{"username":"presence_a"}}');
  perform public.load_game_account(b, '{"profile":{"username":"presence_b"}}');
  select to_jsonb(g) into game_before from private.game_accounts g where user_id = b;
  perform public.track_game_session(b, tracked_request);
  select last_seen_at into seen from private.profile_metrics where user_id = b;
  insert into private.friend_edges(sender, recipient) values(a, b), (c, a);
  peer := public.game_social(a)->'outgoing'->0;
  assert not (peer ? 'online') and not (peer ? 'lastSeenAt'), 'outgoing requests omit presence';
  peer := public.game_social(a)->'incoming'->0;
  assert not (peer ? 'online') and not (peer ? 'lastSeenAt'), 'incoming requests omit presence';
  assert public.game_social(d)->'friends' = '[]'::jsonb, 'unrelated users see no presence';
  perform private.apply_friend_operation(b, jsonb_build_object('kind', 'acceptFriendRequest', 'userId', a));
  peer := public.game_social(a)->'friends'->0;
  assert (peer->>'online')::boolean, 'recent accepted server touch is online';
  assert (peer->>'lastSeenAt')::timestamptz = seen, 'presence uses existing timestamp exactly';
  peer := public.game_social(b)->'friends'->0;
  assert peer->'lastSeenAt' = 'null'::jsonb and not (peer->>'online')::boolean,
    'never-seen accepted friends have null timestamp, not fictional history';
  update private.profile_metrics set last_seen_at = clock_timestamp() - interval '89 seconds' where user_id = b;
  assert (public.game_social(a)->'friends'->0->>'online')::boolean, 'within ninety seconds is online';
  update private.profile_metrics set last_seen_at = clock_timestamp() - interval '91 seconds' where user_id = b;
  peer := public.game_social(a)->'friends'->0;
  assert not (peer->>'online')::boolean and peer->>'lastSeenAt' is not null, 'stale friend is offline with actual last seen';
  update private.profile_metrics set last_seen_at = clock_timestamp() + interval '1 minute' where user_id = b;
  assert not (public.game_social(a)->'friends'->0->>'online')::boolean, 'future timestamps are not online';
  update private.profile_metrics set last_seen_at = clock_timestamp() - interval '5 minutes' where user_id = b;
  seen := (public.game_social(a)->'friends'->0->>'lastSeenAt')::timestamptz;
  perform public.track_game_session(b, tracked_request);
  assert (public.game_social(a)->'friends'->0->>'lastSeenAt')::timestamptz = seen,
    'duplicate request does not invent a newer heartbeat';
  perform public.checkpoint_game_account(b, 0);
  perform public.track_game_session(b, gen_random_uuid());
  assert (public.game_social(a)->'friends'->0->>'online')::boolean,
    'checkpoint/read ordering touches accepted tracker before querying social';
  assert (select to_jsonb(g) - 'updated_at' from private.game_accounts g where user_id = b) =
    game_before - 'updated_at', 'presence/read/checkpoint preserves revision and all gameplay state';
  perform private.apply_friend_operation(a, jsonb_build_object('kind', 'removeFriend', 'userId', b));
  assert public.game_social(a)->'friends' = '[]'::jsonb, 'removal stops presence disclosure';
  assert not has_function_privilege('authenticated', 'public.game_social(uuid)', 'EXECUTE'),
    'social graph is service-only';
  assert not has_table_privilege('authenticated', 'private.profile_metrics', 'SELECT'),
    'raw tracking timestamps stay private';
end $$;
rollback;
