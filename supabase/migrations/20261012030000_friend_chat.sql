-- Accepted-friend private text chat and invite-only groups (text only, no gameplay revision).
create table private.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('direct', 'group')),
  name text check (name is null or (char_length(name) between 1 and 48 and name !~ '[\x01-\x1f\x7f]')),
  owner_id uuid,
  direct_low uuid,
  direct_high uuid,
  last_seq bigint not null default 0 check (last_seq >= 0),
  created_at timestamptz not null default clock_timestamp(),
  check ((kind = 'direct' and direct_low is not null and direct_high is not null and direct_low < direct_high
      and name is null and owner_id is null) or
    (kind = 'group' and direct_low is null and direct_high is null and name is not null and owner_id is not null))
);
create unique index chat_direct_pair on private.chat_conversations(direct_low, direct_high) where kind = 'direct';
create table private.chat_members (
  conversation_id uuid not null references private.chat_conversations(id) on delete cascade,
  user_id uuid not null references public.player_profiles(user_id) on delete cascade,
  status text not null check (status in ('member', 'invited')),
  -- Only pending invites reference the inviter, so an inviter's account deletion drops the invite.
  invited_by uuid references public.player_profiles(user_id) on delete cascade,
  pinned boolean not null default false,
  muted boolean not null default false,
  last_read_seq bigint not null default 0 check (last_read_seq >= 0),
  joined_at timestamptz,
  created_at timestamptz not null default clock_timestamp(),
  primary key (conversation_id, user_id),
  check ((status = 'member') = (joined_at is not null)),
  check ((status = 'invited') = (invited_by is not null))
);
create index chat_members_user on private.chat_members(user_id, status);
create table private.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references private.chat_conversations(id) on delete cascade,
  seq bigint not null check (seq > 0),
  sender_id uuid not null references public.player_profiles(user_id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500 and body !~ '[\x01-\x08\x0b-\x1f\x7f]'),
  created_at timestamptz not null default clock_timestamp(),
  unique (conversation_id, seq)
);
create table private.chat_blocks (
  blocker uuid not null references public.player_profiles(user_id) on delete cascade,
  blocked uuid not null references public.player_profiles(user_id) on delete cascade,
  created_at timestamptz not null default clock_timestamp(),
  primary key (blocker, blocked),
  check (blocker <> blocked)
);
create index chat_blocks_blocked on private.chat_blocks(blocked);
create table private.chat_requests (
  user_id uuid not null references public.player_profiles(user_id) on delete cascade,
  request_id uuid not null,
  fingerprint text not null check (length(fingerprint) = 64),
  conversation_id uuid,
  created_at timestamptz not null default clock_timestamp(),
  primary key (user_id, request_id)
);
create table private.chat_limits (
  user_id uuid primary key references public.player_profiles(user_id) on delete cascade,
  starts_at timestamptz not null,
  attempts integer not null,
  sends integer not null
);
alter table private.chat_conversations enable row level security;
alter table private.chat_members enable row level security;
alter table private.chat_messages enable row level security;
alter table private.chat_blocks enable row level security;
alter table private.chat_requests enable row level security;
alter table private.chat_limits enable row level security;
revoke all on private.chat_conversations, private.chat_members, private.chat_messages, private.chat_blocks,
  private.chat_requests, private.chat_limits from public, anon, authenticated;

create function private.chat_friends(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from private.friend_edges where accepted
    and least(sender, recipient) = least(a, b) and greatest(sender, recipient) = greatest(a, b))
$$;
create function private.chat_blocked(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from private.chat_blocks where (blocker = a and blocked = b) or (blocker = b and blocked = a))
$$;
create function private.chat_peer(p_user uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('userId', p.user_id, 'username', p.username,
    'displayName', coalesce(g.state->'profile'->>'displayName', p.username),
    'icon', coalesce(g.state->'profile'->>'icon', 'neutral'),
    'frame', coalesce(g.state->'profile'->>'frame', 'default'))
  from public.player_profiles p left join private.game_accounts g on g.user_id = p.user_id
  where p.user_id = p_user
$$;
create function private.chat_message_json(p_message uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('id', m.id, 'senderId', m.sender_id,
    'senderName', private.chat_peer(m.sender_id)->>'displayName', 'text', m.body, 'createdAt', m.created_at)
  from private.chat_messages m where m.id = p_message
$$;
-- Direct chats require a current accepted, unblocked friendship; groups require active membership.
create function private.chat_visible(p_user uuid, p_conversation uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from private.chat_members m
    join private.chat_conversations c on c.id = m.conversation_id
    where m.conversation_id = p_conversation and m.user_id = p_user and m.status = 'member'
      and (c.kind = 'group' or (private.chat_friends(c.direct_low, c.direct_high)
        and not private.chat_blocked(c.direct_low, c.direct_high))))
$$;

create function private.chat_view(p_user uuid, p_conversation uuid, p_before uuid, p_mark boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  before_seq bigint;
  minimum_seq bigint;
  page jsonb := '[]'::jsonb;
  more boolean := false;
  conversations jsonb;
  total bigint;
  invitations jsonb;
  blocked jsonb;
begin
  if p_conversation is not null then
    if not private.chat_visible(p_user, p_conversation) then raise exception 'Conversation unavailable'; end if;
    if p_before is not null then
      select seq into before_seq from private.chat_messages where id = p_before and conversation_id = p_conversation;
      if before_seq is null then raise exception 'Message unavailable'; end if;
    elsif p_mark then
      update private.chat_members m set last_read_seq = c.last_seq from private.chat_conversations c
        where c.id = p_conversation and m.conversation_id = p_conversation and m.user_id = p_user
          and m.last_read_seq < c.last_seq;
    end if;
    select coalesce(jsonb_agg(private.chat_message_json(v.id) order by v.seq), '[]'::jsonb), min(v.seq)
      into page, minimum_seq
      from (select m.id, m.seq from private.chat_messages m
        where m.conversation_id = p_conversation and (before_seq is null or m.seq < before_seq)
          and not exists(select 1 from private.chat_blocks b where b.blocker = p_user and b.blocked = m.sender_id)
        order by m.seq desc limit 30) v;
    more := minimum_seq is not null and exists(select 1 from private.chat_messages m
      where m.conversation_id = p_conversation and m.seq < minimum_seq
        and not exists(select 1 from private.chat_blocks b where b.blocker = p_user and b.blocked = m.sender_id));
  end if;

  with mine as (
    select c.*, m.pinned, m.muted, m.last_read_seq from private.chat_members m
      join private.chat_conversations c on c.id = m.conversation_id
      where m.user_id = p_user and m.status = 'member' and private.chat_visible(p_user, c.id)
  ), enriched as (
    select mine.*, latest.id as latest_id, latest.created_at as latest_at,
      (select count(*) from private.chat_messages x where x.conversation_id = mine.id
        and x.seq > mine.last_read_seq and x.sender_id <> p_user
        and not exists(select 1 from private.chat_blocks b where b.blocker = p_user and b.blocked = x.sender_id)) as unread
    from mine left join lateral (select x.id, x.created_at from private.chat_messages x
      where x.conversation_id = mine.id
        and not exists(select 1 from private.chat_blocks b where b.blocker = p_user and b.blocked = x.sender_id)
      order by x.seq desc limit 1) latest on true
  )
  select coalesce(jsonb_agg(jsonb_build_object(
      'id', e.id, 'kind', e.kind,
      'name', case when e.kind = 'direct' then private.chat_peer(
        case when e.direct_low = p_user then e.direct_high else e.direct_low end)->>'displayName' else e.name end,
      'ownerId', e.owner_id,
      'members', (select coalesce(jsonb_agg(private.chat_peer(mm.user_id) order by mm.joined_at, mm.user_id), '[]'::jsonb)
        from private.chat_members mm where mm.conversation_id = e.id and mm.status = 'member'),
      'invited', (select coalesce(jsonb_agg(private.chat_peer(mm.user_id) order by mm.created_at, mm.user_id), '[]'::jsonb)
        from private.chat_members mm where mm.conversation_id = e.id and mm.status = 'invited'),
      'unread', e.unread, 'pinned', e.pinned, 'muted', e.muted,
      'lastMessage', case when e.latest_id is null then 'null'::jsonb else private.chat_message_json(e.latest_id) end,
      'createdAt', e.created_at)
    order by e.pinned desc, coalesce(e.latest_at, e.created_at) desc, e.id), '[]'::jsonb),
    coalesce(sum(e.unread) filter (where not e.muted), 0)
    into conversations, total from enriched e;

  select coalesce(jsonb_agg(jsonb_build_object('conversationId', c.id, 'name', c.name,
      'inviter', private.chat_peer(m.invited_by),
      'memberCount', (select count(*) from private.chat_members x where x.conversation_id = c.id and x.status = 'member'),
      'createdAt', m.created_at) order by m.created_at, c.id), '[]'::jsonb)
    into invitations from private.chat_members m join private.chat_conversations c on c.id = m.conversation_id
    where m.user_id = p_user and m.status = 'invited';
  select coalesce(jsonb_agg(private.chat_peer(b.blocked) order by p.username), '[]'::jsonb) into blocked
    from private.chat_blocks b join public.player_profiles p on p.user_id = b.blocked where b.blocker = p_user;

  return jsonb_build_object('selfUserId', p_user, 'conversations', conversations,
    'conversationId', p_conversation, 'messages', page, 'hasMore', more,
    'invitations', invitations, 'blocked', blocked, 'unreadTotal', total);
end;
$$;

-- Owner departure (leave, removal of last owner row or account deletion) transfers to the
-- earliest-joined remaining member; a conversation without members is deleted.
create function private.chat_member_departed() returns trigger
language plpgsql security definer set search_path = '' as $$
declare successor uuid;
begin
  if old.status <> 'member' then return null; end if;
  select m.user_id into successor from private.chat_members m
    where m.conversation_id = old.conversation_id and m.status = 'member'
    order by m.joined_at, m.user_id limit 1;
  if successor is null then
    delete from private.chat_conversations where id = old.conversation_id;
  else
    update private.chat_conversations set owner_id = successor
      where id = old.conversation_id and kind = 'group' and owner_id = old.user_id;
  end if;
  return null;
end;
$$;
create trigger chat_member_departed after delete on private.chat_members
  for each row execute function private.chat_member_departed();

create function public.consume_chat_attempt(p_user uuid, p_send boolean) returns boolean
language plpgsql security definer set search_path = '' as $$
declare used integer; sent integer;
begin
  insert into private.chat_limits as limits values (p_user, clock_timestamp(), 1, case when p_send then 1 else 0 end)
  on conflict (user_id) do update set
    starts_at = case when limits.starts_at < clock_timestamp() - interval '1 minute' then clock_timestamp() else limits.starts_at end,
    attempts = case when limits.starts_at < clock_timestamp() - interval '1 minute' then 1 else least(limits.attempts + 1, 91) end,
    sends = case when limits.starts_at < clock_timestamp() - interval '1 minute' then (case when p_send then 1 else 0 end)
      else least(limits.sends + case when p_send then 1 else 0 end, 31) end
  returning attempts, sends into used, sent;
  return used <= 90 and sent <= 30;
end;
$$;

create function public.chat_operation(p_user uuid, p_request uuid, p_fingerprint text, p_operation jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  action text := p_operation->>'kind';
  conversation uuid;
  result_conversation uuid;
  target uuid;
  invitees uuid[];
  invitee uuid;
  previous private.chat_requests;
  chat private.chat_conversations;
  message_text text;
  group_name text;
  next_seq bigint;
  changed integer;
begin
  if not exists(select 1 from public.player_profiles where user_id = p_user) then
    raise exception 'Online identity unavailable';
  end if;
  if action = 'read' then
    return private.chat_view(p_user, (p_operation->>'conversationId')::uuid, (p_operation->>'before')::uuid, true);
  end if;
  if p_fingerprint is null or length(p_fingerprint) <> 64 then raise exception 'Invalid chat request'; end if;
  -- A concurrent duplicate waits here for the first transaction, then replays its outcome.
  insert into private.chat_requests(user_id, request_id, fingerprint) values (p_user, p_request, p_fingerprint)
    on conflict do nothing;
  if not found then
    select * into strict previous from private.chat_requests where user_id = p_user and request_id = p_request;
    if previous.fingerprint <> p_fingerprint then
      raise exception using errcode = 'LL409', message = 'Request ID was already used with different input';
    end if;
    return private.chat_view(p_user, case when previous.conversation_id is not null and
      private.chat_visible(p_user, previous.conversation_id) then previous.conversation_id end, null, false);
  end if;
  delete from private.chat_requests where user_id = p_user and created_at < clock_timestamp() - interval '1 day';
  conversation := (p_operation->>'conversationId')::uuid;
  target := (p_operation->>'userId')::uuid;

  if action = 'direct' then
    if target is null or target = p_user or not private.chat_friends(p_user, target) or private.chat_blocked(p_user, target) then
      raise exception 'Only accepted friends can chat';
    end if;
    perform pg_advisory_xact_lock(hashtextextended('chat-direct:' || least(p_user, target)::text || greatest(p_user, target)::text, 0));
    select id into result_conversation from private.chat_conversations
      where kind = 'direct' and direct_low = least(p_user, target) and direct_high = greatest(p_user, target);
    if result_conversation is null then
      insert into private.chat_conversations(kind, direct_low, direct_high)
        values ('direct', least(p_user, target), greatest(p_user, target)) returning id into result_conversation;
    end if;
    insert into private.chat_members(conversation_id, user_id, status, joined_at) values
      (result_conversation, p_user, 'member', clock_timestamp()), (result_conversation, target, 'member', clock_timestamp())
      on conflict do nothing;
  elsif action = 'createGroup' then
    group_name := btrim(coalesce(p_operation->>'name', ''));
    if char_length(group_name) not between 1 and 48 or group_name ~ '[\x01-\x1f\x7f]' then raise exception 'Invalid group name'; end if;
    if jsonb_typeof(p_operation->'userIds') <> 'array' then raise exception 'Invite up to 9 distinct friends'; end if;
    invitees := array(select jsonb_array_elements_text(p_operation->'userIds')::uuid);
    if cardinality(invitees) > 9 or cardinality(invitees) <> (select count(distinct x) from unnest(invitees) x) then
      raise exception 'Invite up to 9 distinct friends';
    end if;
    foreach invitee in array invitees loop
      if invitee = p_user or not private.chat_friends(p_user, invitee) or private.chat_blocked(p_user, invitee) then
        raise exception 'Only accepted friends can be invited';
      end if;
    end loop;
    insert into private.chat_conversations(kind, name, owner_id) values ('group', group_name, p_user)
      returning id into result_conversation;
    insert into private.chat_members(conversation_id, user_id, status, joined_at)
      values (result_conversation, p_user, 'member', clock_timestamp());
    insert into private.chat_members(conversation_id, user_id, status, invited_by)
      select result_conversation, x, 'invited', p_user from unnest(invitees) x;
  elsif action = 'send' then
    if conversation is null or not private.chat_visible(p_user, conversation) then raise exception 'Conversation unavailable'; end if;
    select * into strict chat from private.chat_conversations where id = conversation for update;
    message_text := regexp_replace(replace(coalesce(p_operation->>'text', ''), E'\r\n', E'\n'), '^\s+|\s+$', '', 'g');
    if char_length(message_text) not between 1 and 500 or message_text ~ '[\x01-\x08\x0b-\x1f\x7f]' then
      raise exception 'Messages must be 1-500 characters of plain text';
    end if;
    next_seq := chat.last_seq + 1;
    update private.chat_conversations set last_seq = next_seq where id = conversation;
    insert into private.chat_messages(conversation_id, seq, sender_id, body) values (conversation, next_seq, p_user, message_text);
    update private.chat_members set last_read_seq = next_seq where conversation_id = conversation and user_id = p_user;
    result_conversation := conversation;
  elsif action in ('invite', 'removeMember', 'leave', 'respondInvite') then
    select * into chat from private.chat_conversations where id = conversation and kind = 'group' for update;
    if chat.id is null then raise exception 'Group unavailable'; end if;
    if action = 'invite' then
      if chat.owner_id <> p_user then raise exception 'Only the group owner can invite'; end if;
      if target is null or target = p_user or not private.chat_friends(p_user, target) or private.chat_blocked(p_user, target) then
        raise exception 'Only accepted friends can be invited';
      end if;
      if exists(select 1 from private.chat_members where conversation_id = conversation and user_id = target) then
        raise exception 'Player is already in or invited to this group';
      end if;
      if (select count(*) from private.chat_members where conversation_id = conversation) >= 10 then
        raise exception 'Group is full';
      end if;
      insert into private.chat_members(conversation_id, user_id, status, invited_by) values (conversation, target, 'invited', p_user);
      result_conversation := conversation;
    elsif action = 'removeMember' then
      if chat.owner_id <> p_user then raise exception 'Only the group owner can remove members'; end if;
      if target is null or target = p_user then raise exception 'Use leave to exit your own group'; end if;
      delete from private.chat_members where conversation_id = conversation and user_id = target;
      get diagnostics changed = row_count;
      if changed <> 1 then raise exception 'Member unavailable'; end if;
      result_conversation := conversation;
    elsif action = 'leave' then
      delete from private.chat_members where conversation_id = conversation and user_id = p_user and status = 'member';
      get diagnostics changed = row_count;
      if changed <> 1 then raise exception 'Group unavailable'; end if;
    elsif (p_operation->>'accept')::boolean then
      update private.chat_members set status = 'member', joined_at = clock_timestamp(), invited_by = null,
        last_read_seq = chat.last_seq
        where conversation_id = conversation and user_id = p_user and status = 'invited';
      get diagnostics changed = row_count;
      if changed <> 1 then raise exception 'Invitation unavailable'; end if;
      result_conversation := conversation;
    else
      delete from private.chat_members where conversation_id = conversation and user_id = p_user and status = 'invited';
      get diagnostics changed = row_count;
      if changed <> 1 then raise exception 'Invitation unavailable'; end if;
    end if;
  elsif action = 'preferences' then
    if conversation is null or not private.chat_visible(p_user, conversation) then raise exception 'Conversation unavailable'; end if;
    if not (p_operation ? 'pinned' or p_operation ? 'muted') then raise exception 'Choose a chat preference'; end if;
    update private.chat_members set
      pinned = coalesce((p_operation->>'pinned')::boolean, pinned),
      muted = coalesce((p_operation->>'muted')::boolean, muted)
      where conversation_id = conversation and user_id = p_user;
    result_conversation := conversation;
  elsif action = 'block' then
    if target is null or target = p_user or not exists(select 1 from public.player_profiles where user_id = target) then
      raise exception 'Player unavailable';
    end if;
    -- Same pair lock as friend operations, so a racing friend request/accept cannot survive the block.
    perform pg_advisory_xact_lock(hashtextextended(least(p_user, target)::text || greatest(p_user, target)::text, 0));
    insert into private.chat_blocks(blocker, blocked) values (p_user, target) on conflict do nothing;
    delete from private.friend_edges where least(sender, recipient) = least(p_user, target)
      and greatest(sender, recipient) = greatest(p_user, target);
    delete from private.chat_members m using private.chat_conversations c
      where c.id = m.conversation_id and m.status = 'invited' and
        ((m.user_id = target and (c.owner_id = p_user or m.invited_by = p_user)) or
         (m.user_id = p_user and (c.owner_id = target or m.invited_by = target)));
  elsif action = 'unblock' then
    delete from private.chat_blocks where blocker = p_user and blocked = target;
    get diagnostics changed = row_count;
    if changed <> 1 then raise exception 'Player is not blocked'; end if;
  else
    raise exception 'Unknown chat operation';
  end if;
  update private.chat_requests set conversation_id = result_conversation where user_id = p_user and request_id = p_request;
  -- Only actions that open/write a conversation mark it read; preference/member edits do not.
  return private.chat_view(p_user, result_conversation, null, action in ('direct', 'send', 'respondInvite'));
end;
$$;

-- Friend requests are refused in either direction while a block exists, with the same
-- generic wording as an unknown username/code. All other friend semantics are unchanged.
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
    if private.chat_blocked(p_user, target) then raise exception 'Friend username or code is unavailable'; end if;
    if exists(select 1 from private.friend_edges where least(sender, recipient) = first_user
      and greatest(sender, recipient) = second_user) then
      raise exception 'Friendship or request already exists';
    end if;
    insert into private.friend_edges(sender, recipient) values(p_user, target);
  elsif action = 'acceptFriendRequest' then
    if private.chat_blocked(p_user, target) then raise exception 'Friend request or friendship unavailable'; end if;
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

revoke all on function private.chat_friends(uuid, uuid) from public, anon, authenticated;
revoke all on function private.chat_blocked(uuid, uuid) from public, anon, authenticated;
revoke all on function private.chat_peer(uuid) from public, anon, authenticated;
revoke all on function private.chat_message_json(uuid) from public, anon, authenticated;
revoke all on function private.chat_visible(uuid, uuid) from public, anon, authenticated;
revoke all on function private.chat_view(uuid, uuid, uuid, boolean) from public, anon, authenticated;
revoke all on function private.chat_member_departed() from public, anon, authenticated;
revoke all on function private.apply_friend_operation(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.consume_chat_attempt(uuid, boolean) from public, anon, authenticated;
revoke all on function public.chat_operation(uuid, uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.consume_chat_attempt(uuid, boolean) to service_role;
grant execute on function public.chat_operation(uuid, uuid, text, jsonb) to service_role;
comment on function public.chat_operation(uuid, uuid, text, jsonb) is
  'Service-only chat API. Never reads or writes game_accounts revision/state; text stored raw for textContent rendering.';