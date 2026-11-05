begin;
do $$
declare
  a uuid := gen_random_uuid(); b uuid := gen_random_uuid(); c uuid := gen_random_uuid(); d uuid := gen_random_uuid();
  request_id uuid := gen_random_uuid(); failed_request uuid; mail_id uuid; res jsonb; before_state jsonb; before_revision bigint;
  day_key date := private.social_reset_day(now()); monthly_prism numeric := 0; monthly_premium numeric := 0;
  streak_premium numeric := 0; i integer; failed boolean;
begin
  assert private.social_reset_day('2026-11-01T00:00:00Z') = '2026-10-31', '8PM EDT begins reset day before DST change';
  assert private.social_reset_day('2026-11-02T00:59:59Z') = '2026-10-31', '7:59PM EST remains previous reset day';
  assert private.social_reset_day('2026-11-02T01:00:00Z') = '2026-11-01', '8PM EST begins new reset day';
  assert private.social_reset_day('2026-03-09T00:00:00Z') = '2026-03-08', 'spring DST 8PM remains local';
  for i in 1..31 loop
    res := private.attendance_reward(i, 1);
    monthly_prism := monthly_prism + (res->>'fractalis')::numeric;
    monthly_premium := monthly_premium + (res->>'lycalis')::numeric;
    streak_premium := streak_premium + (private.attendance_reward(i, i)->>'streakPremium')::numeric;
  end loop;
  assert monthly_prism = 263500 and monthly_premium = 230 and streak_premium = 70, 'owner approved exact monthly/streak budget';
  insert into auth.users(id, raw_user_meta_data) values (a, '{"username":"calendar_a"}'),
    (b, '{"username":"calendar_b"}'), (c, '{"username":"calendar_c"}'), (d, '{"username":"calendar_d"}');
  perform public.load_game_account(a, '{"starterId":"ember","run":{"frozen":true},"account":{"version":11,"fractalis":0,"lycalis":0,"materials":{},"characters":{}}}');
  perform public.load_game_account(b, '{"starterId":"tide","account":{"version":11,"fractalis":0,"lycalis":0,"materials":{},"characters":{}}}');
  perform public.load_game_account(c, '{"starterId":"sprout","account":{"version":11,"fractalis":0,"lycalis":0,"materials":{},"characters":{}}}');
  perform public.load_game_account(d, '{"starterId":"sprout","account":{"version":11,"fractalis":0,"lycalis":0,"materials":{},"characters":{}}}');
  perform set_config('request.jwt.claim.sub', a::text, true);
  select state, revision into before_state, before_revision from private.game_accounts where user_id = a;
  res := public.social_calendar();
  assert (res->>'attendance')::int = 0 and not (res->>'attendedToday')::boolean, 'attendance never auto claimed';
  assert not exists(select 1 from private.calendar_attendance where user_id = a), 'read inserts no calendar row';
  assert (select state = before_state and revision = before_revision from private.game_accounts where user_id = a), 'read never writes account';
  assert not res->'seedChoices' ? 'moonwake-common' and not res->'seedChoices' ? 'dawnforge-common', 'unlaunched families excluded';
  res := public.social_calendar('{"kind":"attend"}', request_id);
  assert (res->>'attendance')::int = 1 and (res->'reward'->>'fractalis')::int = 1000, 'first manual reward';
  assert (select state->'run' = before_state->'run' and revision = before_revision + 1 from private.game_accounts where user_id = a),
    'reward updates revision without replacing frozen run';
  assert public.social_calendar('{"kind":"attend"}', request_id) = res, 'same request retry returns same reward';
  begin perform public.social_calendar('{"kind":"attend"}', gen_random_uuid()); failed := false;
  exception when others then failed := sqlerrm ~ 'already claimed'; end;
  assert failed, 'one attendance per reset day';
  begin perform public.social_calendar('{"kind":"claimAll"}', request_id); failed := false;
  exception when others then failed := sqlerrm ~ 'different input'; end;
  assert failed, 'request reuse with altered command rejected';

  -- Missed-day monthly cumulative progression, month roll, carried and broken streaks.
  update private.calendar_attendance set last_day = day_key - 2, attendance = 4, streak = 6 where user_id = a;
  res := public.social_calendar('{"kind":"attend"}', gen_random_uuid());
  assert (res->>'attendance')::int = 5 and (res->>'streak')::int = 1
    and (res->'reward'->>'fractalis')::int = 3000 and (res->'reward'->>'lycalis')::int = 10, 'no catchup; missed day breaks only streak';
  update private.calendar_attendance set month_key = '1900-01', last_day = day_key - 1, attendance = 31, streak = 13 where user_id = a;
  res := public.social_calendar('{"kind":"attend"}', gen_random_uuid());
  assert (res->>'attendance')::int = 1 and (res->>'streak')::int = 14
    and (res->'reward'->>'lycalis')::int = 20, 'monthly ordinal resets, streak carries and next milestone saves once';
  res := private.social_calendar_view(a, '2026-05-01T00:00:00Z');
  assert res->>'month' = '2026-04' and (res->>'daysInMonth')::int = 30, 'reset-day month and actual month length';
  update private.calendar_attendance set last_day = day_key - 1 where user_id = a;
  update private.game_accounts set state = jsonb_set(state,'{account,fractalis}','9007199254740991') where user_id = a;
  select state, revision into before_state, before_revision from private.game_accounts where user_id = a;
  failed_request := gen_random_uuid();
  begin perform public.social_calendar('{"kind":"attend"}', failed_request); failed := false;
  exception when others then failed := sqlerrm ~ 'capacity'; end;
  assert failed and (select state = before_state and revision = before_revision from private.game_accounts where user_id = a), 'attendance overflow rolls back wallet and revision';
  assert (select last_day = day_key - 1 from private.calendar_attendance where user_id = a), 'failed attendance leaves daily eligibility';
  assert not exists(select 1 from private.social_calendar_requests where user_id = a and social_calendar_requests.request_id = failed_request), 'failed award has no successful cached response';
  update private.game_accounts set state = jsonb_set(state,'{account,fractalis}','0') where user_id = a;

  insert into private.friend_edges(sender, recipient, accepted) values(a,b,true);
  insert into private.friend_edges(sender, recipient) values(a,c);
  begin perform public.social_calendar(jsonb_build_object('kind','sendGift','userId',c,'gift','fractalis'), gen_random_uuid()); failed := false;
  exception when others then failed := sqlerrm ~ 'accepted friend'; end;
  assert failed, 'pending request cannot receive a new gift';
  begin perform public.social_calendar(jsonb_build_object('kind','sendGift','userId',b,'gift','seed','materialId','moonwake-common'), gen_random_uuid()); failed := false;
  exception when others then failed := sqlerrm ~ 'eligible'; end;
  assert failed and not exists(select 1 from private.daily_gifts where sender = a), 'invalid family does not consume allowance';
  select state, revision into before_state, before_revision from private.game_accounts where user_id = a;
  request_id := gen_random_uuid();
  res := public.social_calendar(jsonb_build_object('kind','sendGift','userId',b,'gift','seed','materialId','infernic-common'), request_id);
  assert (res->>'giftSentToday')::boolean, 'send allowance saved';
  assert (select state = before_state and revision = before_revision from private.game_accounts where user_id = a), 'free gift no sender deduction or wallet write';
  perform public.social_calendar(jsonb_build_object('kind','sendGift','userId',b,'gift','seed','materialId','infernic-common'), request_id);
  assert (select count(*) = 1 from private.player_mail where sender = a and recipient = b), 'idempotent send creates one legitimate mail';
  begin perform public.social_calendar(jsonb_build_object('kind','sendGift','userId',b,'gift','lycalis'), gen_random_uuid()); failed := false;
  exception when others then failed := sqlerrm ~ 'already sent'; end;
  assert failed, 'send cap applies account-wide across choices and friends';
  select id into mail_id from private.player_mail where sender = a and recipient = b;
  begin perform public.social_calendar(jsonb_build_object('kind','claimMail','id',mail_id), gen_random_uuid()); failed := false;
  exception when others then failed := sqlerrm ~ 'unavailable'; end;
  assert failed, 'sender cannot claim recipient mail';
  -- Authorized mail remains claimable after friendship removal and event close.
  delete from private.friend_edges where sender = a and recipient = b;
  perform set_config('request.jwt.claim.sub', b::text, true);
  perform public.social_calendar(jsonb_build_object('kind','readMail','id',mail_id), gen_random_uuid());
  assert (select read_at is not null and claimed_at is null from private.player_mail where id = mail_id), 'reading persists, never claims';
  request_id := gen_random_uuid();
  res := public.social_calendar(jsonb_build_object('kind','claimMail','id',mail_id), request_id);
  assert (res->'reward'->'materials'->>'infernic-common')::int = 10 and (res->>'claimedCount')::int = 1, 'individual attachment authorized and saved';
  perform public.social_calendar(jsonb_build_object('kind','claimMail','id',mail_id), request_id);
  assert (select (state->'account'->'materials'->>'infernic-common')::int = 10 from private.game_accounts where user_id = b), 'retry cannot double grant';
  res := public.social_calendar(jsonb_build_object('kind','claimMail','id',mail_id), gen_random_uuid());
  assert (res->>'claimedCount')::int = 0, 'different request on already claimed mail is harmless';
  -- A second legitimate sender can send on the same reset day; only actually active event Seeds qualify.
  perform set_config('request.jwt.claim.sub', c::text, true);
  insert into private.friend_edges(sender,recipient,accepted) values(c,b,true);
  perform public.schedule_gift_event('moonwake', now() + interval '1 day', now() + interval '2 days');
  begin perform public.social_calendar(jsonb_build_object('kind','sendGift','userId',b,'gift','seed','materialId','moonwake-common'), gen_random_uuid()); failed := false;
  exception when others then failed := sqlerrm ~ 'eligible'; end;
  assert failed, 'future event window is not gift eligible';
  perform public.schedule_gift_event('rosethorn', now() - interval '1 day', now() + interval '1 day');
  res := public.social_calendar(jsonb_build_object('kind','sendGift','userId',b,'gift','seed','materialId','rosethorn-common'), gen_random_uuid());
  assert (res->>'giftSentToday')::boolean, 'actually active event family Seed sends successfully';
  select id into mail_id from private.player_mail where sender = c and recipient = b;
  delete from private.gift_event_windows where family = 'rosethorn';
  delete from private.friend_edges where sender = c and recipient = b;
  perform set_config('request.jwt.claim.sub', b::text, true);
  res := public.social_calendar(jsonb_build_object('kind','claimMail','id',mail_id), gen_random_uuid());
  assert (res->'reward'->'materials'->>'rosethorn-common')::int = 10, 'closing event/removing friend never invalidates already authorized attachment';
  assert (select count(*) = 2 from private.player_mail where recipient = b), 'receiving has no one-per-day cap';
  insert into private.friend_edges(sender,recipient,accepted) values(b,a,true),(d,b,true);
  select state, revision into before_state, before_revision from private.game_accounts where user_id = b;
  perform public.social_calendar(jsonb_build_object('kind','sendGift','userId',a,'gift','fractalis'), gen_random_uuid());
  assert (select attachment->>'fractalis' = '1000' from private.player_mail where sender = b and recipient = a), 'free Prismatica option authorizes exactly1000';
  assert (select state = before_state and revision = before_revision from private.game_accounts where user_id = b), 'currency gift has no sender deduction';
  perform set_config('request.jwt.claim.sub', d::text, true);
  perform public.social_calendar(jsonb_build_object('kind','sendGift','userId',b,'gift','lycalis'), gen_random_uuid());
  assert (select attachment->>'lycalis' = '10' from private.player_mail where sender = d and recipient = b), 'free premium option authorizes exactly10';
  select id into mail_id from private.player_mail where sender = d and recipient = b;
  perform set_config('request.jwt.claim.sub', b::text, true);
  perform public.social_calendar(jsonb_build_object('kind','claimMail','id',mail_id), gen_random_uuid());

  -- Unlimited receiving; claim-all rejects overflow with no partial grants/claim states.
  insert into private.player_mail(recipient,title,body,attachment) values
    (b,'Gift 1','', '{"fractalis":1000,"lycalis":0,"materials":{}}'),
    (b,'Gift 2','', '{"fractalis":0,"lycalis":10,"materials":{}}');
  update private.game_accounts set state = jsonb_set(state,'{account,lycalis}','9007199254740991') where user_id = b;
  select state, revision into before_state, before_revision from private.game_accounts where user_id = b;
  begin perform public.social_calendar('{"kind":"claimAll"}', gen_random_uuid()); failed := false;
  exception when others then failed := sqlerrm ~ 'capacity'; end;
  assert failed and (select state = before_state and revision = before_revision from private.game_accounts where user_id = b), 'overflow entire aggregate rollback';
  assert (select count(*) = 2 from private.player_mail where recipient = b and claimed_at is null), 'no partial claim flags on overflow';
  update private.game_accounts set state = jsonb_set(state,'{account,lycalis}','0') where user_id = b;
  res := public.social_calendar('{"kind":"claimAll"}', gen_random_uuid());
  assert (res->>'claimedCount')::int = 2 and (res->'reward'->>'fractalis')::int = 1000 and (res->'reward'->>'lycalis')::int = 10, 'claim-all exact attachment sum';
  perform public.publish_game_patch('social-test', '<Patch>', '<b>Plain text only</b>');
  perform public.publish_game_patch('social-test', '<Patch>', '<b>Plain text only</b>');
  res := public.social_calendar();
  assert exists(select 1 from jsonb_array_elements(res->'mail') m where m->>'id' = 'patch:social-test' and (m->>'informational')::boolean), 'persistent broadcast patch projection';
  assert not exists(select 1 from private.mail_publication_states where user_id = b), 'patch loading never writes read states';
  perform public.social_calendar('{"kind":"readMail","id":"patch:social-test"}', gen_random_uuid());
  assert exists(select 1 from private.mail_publication_states where user_id = b and publication_key = 'social-test'), 'patch explicitly marked read';
  assert not has_function_privilege('anon', 'public.social_calendar(jsonb,uuid)', 'execute'), 'anonymous denied';
  assert has_function_privilege('authenticated', 'public.social_calendar(jsonb,uuid)', 'execute'), 'authenticated own-user RPC';
  assert not has_function_privilege('authenticated', 'public.publish_game_patch(text,text,text)', 'execute'), 'players cannot publish patch mail';
  assert not has_table_privilege('authenticated','private.player_mail','insert'), 'players cannot forge attachments';
  perform set_config('request.jwt.claim.sub', '', true);
  begin perform public.social_calendar(); failed := false;
  exception when others then failed := sqlerrm ~ 'Sign in'; end;
  assert failed, 'missing identity denied';
end;
$$;
rollback;
