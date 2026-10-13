begin;
do $$
declare
  a uuid := gen_random_uuid();
  b uuid := gen_random_uuid();
  c uuid := gen_random_uuid();
  d uuid := gen_random_uuid();
  e uuid := gen_random_uuid();
  extra uuid[] := array[]::uuid[];
  peer uuid;
  fp text := repeat('a', 64);
  fp2 text := repeat('b', 64);
  res jsonb;
  direct uuid;
  grp uuid;
  send_id uuid := gen_random_uuid();
  game_before jsonb;
  first_message text;
  i integer;
  failed boolean;
begin
  insert into auth.users(id, raw_user_meta_data) values
    (a, '{"username":"chat_a"}'), (b, '{"username":"chat_b"}'), (c, '{"username":"chat_c"}'),
    (d, '{"username":"chat_d"}'), (e, '{"username":"chat_e"}');
  perform public.load_game_account(a, '{"profile":{"username":"chat_a","displayName":"<b>A</b>","icon":"profile:ember:base","frame":"default"}}');
  perform public.load_game_account(b, '{"profile":{"username":"chat_b"}}');
  select jsonb_agg(to_jsonb(g) - 'updated_at' order by user_id) into game_before from private.game_accounts g where user_id in (a, b);
  insert into private.friend_edges(sender, recipient, accepted) values (a, b, true), (a, c, true), (a, d, true), (b, c, true);
  insert into private.friend_edges(sender, recipient) values (a, e);

  -- Direct chat requires accepted friendship.
  begin perform public.chat_operation(a, gen_random_uuid(), fp, jsonb_build_object('kind', 'direct', 'userId', e)); failed := false;
  exception when others then failed := sqlerrm ~ 'accepted friends'; end;
  assert failed, 'pending request is not chat eligible';
  begin perform public.chat_operation(b, gen_random_uuid(), fp, jsonb_build_object('kind', 'direct', 'userId', d)); failed := false;
  exception when others then failed := sqlerrm ~ 'accepted friends'; end;
  assert failed, 'strangers cannot open direct chat';
  res := public.chat_operation(a, gen_random_uuid(), fp, jsonb_build_object('kind', 'direct', 'userId', b));
  direct := (res->>'conversationId')::uuid;
  assert res->'conversations'->0->>'kind' = 'direct' and res->'conversations'->0->>'name' = 'chat_b', 'direct uses peer display name';
  assert (public.chat_operation(b, gen_random_uuid(), fp, jsonb_build_object('kind', 'direct', 'userId', a))->>'conversationId')::uuid = direct,
    'one direct conversation per pair';

  -- Idempotent send, raw plain text, trimming and limits.
  res := public.chat_operation(a, send_id, fp, jsonb_build_object('kind', 'send', 'conversationId', direct, 'text', E'  <script>x</script>\r\nline2  '));
  first_message := res->'messages'->0->>'id';
  assert res->'messages'->0->>'text' = E'<script>x</script>\nline2', 'raw text stored trimmed with normalized newline';
  assert res->'messages'->0->>'senderName' = '<b>A</b>', 'display names are returned raw for textContent';
  res := public.chat_operation(a, send_id, fp, jsonb_build_object('kind', 'send', 'conversationId', direct, 'text', E'  <script>x</script>\r\nline2  '));
  assert jsonb_array_length(res->'messages') = 1 and res->'messages'->0->>'id' = first_message, 'retry does not duplicate send';
  begin perform public.chat_operation(a, send_id, fp2, jsonb_build_object('kind', 'send', 'conversationId', direct, 'text', 'other')); failed := false;
  exception when sqlstate 'LL409' then failed := true; end;
  assert failed, 'request reuse with different input is a conflict';
  begin perform public.chat_operation(a, gen_random_uuid(), fp, jsonb_build_object('kind', 'send', 'conversationId', direct, 'text', repeat('x', 501))); failed := false;
  exception when others then failed := sqlerrm ~ '500'; end;
  assert failed, '501 characters rejected';
  perform public.chat_operation(a, gen_random_uuid(), fp, jsonb_build_object('kind', 'send', 'conversationId', direct, 'text', repeat('é', 500)));
  begin perform public.chat_operation(a, gen_random_uuid(), fp, jsonb_build_object('kind', 'send', 'conversationId', direct, 'text', '   ')); failed := false;
  exception when others then failed := true; end;
  assert failed, 'blank message rejected';
  begin perform public.chat_operation(a, gen_random_uuid(), fp, jsonb_build_object('kind', 'send', 'conversationId', direct, 'text', E'bell\u0007')); failed := false;
  exception when others then failed := true; end;
  assert failed, 'control characters rejected';
  begin perform public.chat_operation(c, gen_random_uuid(), fp, jsonb_build_object('kind', 'send', 'conversationId', direct, 'text', 'intrude')); failed := false;
  exception when others then failed := sqlerrm ~ 'unavailable'; end;
  assert failed, 'non-participants cannot send';
  begin perform public.chat_operation(c, null, null, jsonb_build_object('kind', 'read', 'conversationId', direct)); failed := false;
  exception when others then failed := sqlerrm ~ 'unavailable'; end;
  assert failed, 'non-participants cannot read';

  -- Unread, read marking, pin/mute and pagination.
  res := public.chat_operation(b, null, null, '{"kind":"read"}');
  assert (res->'conversations'->0->>'unread')::int = 2 and (res->>'unreadTotal')::int = 2, 'unread counts peer messages';
  assert res->'messages' = '[]'::jsonb and res->'conversationId' = 'null'::jsonb, 'overview read has no page';
  perform public.chat_operation(b, gen_random_uuid(), fp, jsonb_build_object('kind', 'preferences', 'conversationId', direct, 'muted', true, 'pinned', true));
  res := public.chat_operation(b, null, null, '{"kind":"read"}');
  assert (res->>'unreadTotal')::int = 0 and (res->'conversations'->0->>'unread')::int = 2
    and (res->'conversations'->0->>'pinned')::boolean, 'muted excluded from total, per-user pin';
  assert not (public.chat_operation(a, null, null, '{"kind":"read"}')->'conversations'->0->>'pinned')::boolean, 'preferences are per user';
  res := public.chat_operation(b, null, null, jsonb_build_object('kind', 'read', 'conversationId', direct));
  assert (res->'conversations'->0->>'unread')::int = 0, 'opening newest page marks read';
  for i in 1..35 loop
    perform public.chat_operation(b, gen_random_uuid(), fp, jsonb_build_object('kind', 'send', 'conversationId', direct, 'text', 'm' || i));
  end loop;
  res := public.chat_operation(a, null, null, jsonb_build_object('kind', 'read', 'conversationId', direct));
  assert jsonb_array_length(res->'messages') = 30 and (res->>'hasMore')::boolean and res->'messages'->29->>'text' = 'm35', 'newest page ascending';
  res := public.chat_operation(a, null, null, jsonb_build_object('kind', 'read', 'conversationId', direct, 'before', res->'messages'->0->>'id'));
  assert jsonb_array_length(res->'messages') = 7 and not (res->>'hasMore')::boolean and res->'messages'->0->>'id' = first_message, 'older page';

  -- Groups: invite-only friends, explicit accept, owner controls and size cap.
  begin perform public.chat_operation(a, gen_random_uuid(), fp, jsonb_build_object('kind', 'createGroup', 'name', 'Team', 'userIds', jsonb_build_array(e))); failed := false;
  exception when others then failed := sqlerrm ~ 'accepted friends'; end;
  assert failed, 'only accepted friends of owner can be invited';
  res := public.chat_operation(a, gen_random_uuid(), fp, jsonb_build_object('kind', 'createGroup', 'name', ' Team <i> ', 'userIds', jsonb_build_array(b, c)));
  grp := (res->>'conversationId')::uuid;
  assert res->'conversations'->0->>'name' = 'Team <i>' and jsonb_array_length(res->'conversations'->0->'invited') = 2, 'group with pending invites';
  begin perform public.chat_operation(b, gen_random_uuid(), fp, jsonb_build_object('kind', 'send', 'conversationId', grp, 'text', 'early')); failed := false;
  exception when others then failed := true; end;
  assert failed, 'pending invitees cannot send';
  res := public.chat_operation(b, null, null, '{"kind":"read"}');
  assert res->'invitations'->0->>'conversationId' = grp::text and res->'invitations'->0->'inviter'->>'userId' = a::text, 'invite visible';
  perform public.chat_operation(b, gen_random_uuid(), fp, jsonb_build_object('kind', 'respondInvite', 'conversationId', grp, 'accept', true));
  perform public.chat_operation(c, gen_random_uuid(), fp, jsonb_build_object('kind', 'respondInvite', 'conversationId', grp, 'accept', false));
  begin perform public.chat_operation(c, gen_random_uuid(), fp, jsonb_build_object('kind', 'respondInvite', 'conversationId', grp, 'accept', true)); failed := false;
  exception when others then failed := true; end;
  assert failed, 'declined invite cannot be accepted';
  begin perform public.chat_operation(b, gen_random_uuid(), fp, jsonb_build_object('kind', 'invite', 'conversationId', grp, 'userId', c)); failed := false;
  exception when others then failed := sqlerrm ~ 'owner'; end;
  assert failed, 'only owner invites';
  perform public.chat_operation(a, gen_random_uuid(), fp, jsonb_build_object('kind', 'invite', 'conversationId', grp, 'userId', d));
  begin perform public.chat_operation(a, gen_random_uuid(), fp, jsonb_build_object('kind', 'invite', 'conversationId', grp, 'userId', d)); failed := false;
  exception when others then failed := true; end;
  assert failed, 'duplicate invite rejected';
  for i in 1..7 loop
    peer := gen_random_uuid(); extra := extra || peer;
    insert into auth.users(id, raw_user_meta_data) values (peer, jsonb_build_object('username', 'chat_x' || i));
    insert into private.friend_edges(sender, recipient, accepted) values (a, peer, true);
    perform public.chat_operation(a, gen_random_uuid(), fp, jsonb_build_object('kind', 'invite', 'conversationId', grp, 'userId', peer));
  end loop;
  assert (select count(*) from private.chat_members where conversation_id = grp) = 10, 'ten seats counted with invites';
  begin perform public.chat_operation(a, gen_random_uuid(), fp, jsonb_build_object('kind', 'invite', 'conversationId', grp, 'userId', c)); failed := false;
  exception when others then failed := sqlerrm ~ 'full'; end;
  assert failed, 'eleventh seat rejected';
  perform public.chat_operation(a, gen_random_uuid(), fp, jsonb_build_object('kind', 'removeMember', 'conversationId', grp, 'userId', extra[1]));
  begin perform public.chat_operation(b, gen_random_uuid(), fp, jsonb_build_object('kind', 'removeMember', 'conversationId', grp, 'userId', a)); failed := false;
  exception when others then failed := sqlerrm ~ 'owner'; end;
  assert failed, 'members cannot remove';
  perform public.chat_operation(b, gen_random_uuid(), fp, jsonb_build_object('kind', 'send', 'conversationId', grp, 'text', 'group hello'));
  perform public.chat_operation(d, gen_random_uuid(), fp, jsonb_build_object('kind', 'respondInvite', 'conversationId', grp, 'accept', true));

  -- Block: hides blocker-side messages, ends friendship/invites and blocks friend requests.
  perform public.chat_operation(a, gen_random_uuid(), fp, jsonb_build_object('kind', 'block', 'userId', b));
  assert not exists(select 1 from private.friend_edges where a in (sender, recipient) and b in (sender, recipient)), 'block removes friendship';
  res := public.chat_operation(a, null, null, jsonb_build_object('kind', 'read', 'conversationId', grp));
  assert not exists(select 1 from jsonb_array_elements(res->'messages') m where m->>'senderId' = b::text), 'blocked group messages hidden';
  assert res->'blocked'->0->>'userId' = b::text, 'blocked list';
  assert not exists(select 1 from jsonb_array_elements(res->'conversations') x where x->>'id' = direct::text), 'direct hidden after block';
  begin perform public.chat_operation(b, gen_random_uuid(), fp, jsonb_build_object('kind', 'send', 'conversationId', direct, 'text', 'hi')); failed := false;
  exception when others then failed := true; end;
  assert failed, 'blocked direct send rejected';
  begin perform private.apply_friend_operation(b, jsonb_build_object('kind', 'friendRequest', 'username', 'chat_a')); failed := false;
  exception when others then failed := sqlerrm ~ 'unavailable'; end;
  assert failed, 'blocked player cannot send new friend request';
  begin perform private.apply_friend_operation(a, jsonb_build_object('kind', 'friendRequest', 'username', 'chat_b')); failed := false;
  exception when others then failed := sqlerrm ~ 'unavailable'; end;
  assert failed, 'blocker cannot request until unblocked';
  perform public.chat_operation(a, gen_random_uuid(), fp, jsonb_build_object('kind', 'unblock', 'userId', b));
  perform private.apply_friend_operation(b, jsonb_build_object('kind', 'friendRequest', 'username', 'chat_a'));
  assert not private.chat_friends(a, b), 'unblock does not restore friendship';

  -- Owner leave transfers to earliest member; last member leaving closes the group.
  perform public.chat_operation(a, gen_random_uuid(), fp, jsonb_build_object('kind', 'leave', 'conversationId', grp));
  assert (select owner_id from private.chat_conversations where id = grp) = b, 'earliest joined member becomes owner';
  perform public.chat_operation(b, gen_random_uuid(), fp, jsonb_build_object('kind', 'leave', 'conversationId', grp));
  assert (select owner_id from private.chat_conversations where id = grp) = d, 'next earliest becomes owner';
  perform public.chat_operation(d, gen_random_uuid(), fp, jsonb_build_object('kind', 'leave', 'conversationId', grp));
  assert not exists(select 1 from private.chat_conversations where id = grp), 'empty group closes with pending invites and messages';

  -- Chat never touches gameplay aggregates, and storage remains service-only.
  assert (select jsonb_agg(to_jsonb(g) - 'updated_at' order by user_id) from private.game_accounts g where user_id in (a, b)) = game_before,
    'chat preserves gameplay revision/state';
  for i in 1..30 loop assert public.consume_chat_attempt(e, true), 'thirty sends allowed'; end loop;
  assert not public.consume_chat_attempt(e, true), 'thirty-first send limited';
  assert not has_function_privilege('authenticated', 'public.chat_operation(uuid,uuid,text,jsonb)', 'EXECUTE'), 'chat RPC service-only';
  assert not has_function_privilege('anon', 'public.consume_chat_attempt(uuid,boolean)', 'EXECUTE'), 'limiter service-only';
  assert not has_table_privilege('authenticated', 'private.chat_messages', 'SELECT'), 'messages private';
  assert has_function_privilege('service_role', 'public.chat_operation(uuid,uuid,text,jsonb)', 'EXECUTE'), 'service can call';
end $$;
rollback;