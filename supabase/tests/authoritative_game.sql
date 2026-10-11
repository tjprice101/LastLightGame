begin;
do $$
declare a uuid := gen_random_uuid(); b uuid := gen_random_uuid();
  req uuid := gen_random_uuid(); reply jsonb; original jsonb;
begin
  insert into auth.users(id, raw_user_meta_data) values
    (a, jsonb_build_object('username', 'server_test_a')),
    (b, jsonb_build_object('username', 'server_test_b'));
  perform public.load_game_account(a, '{"account":{"fractalis":0}}');
  perform public.load_game_account(b, '{"account":{"fractalis":0}}');
  reply := public.commit_game_operation(a, req, repeat('a',64), 0,
    '{"account":{"fractalis":10},"run":{"frozen":true}}', '{"account":{"fractalis":10}}');
  assert (reply->>'revision')::integer = 1, 'first commit revision';
  original := reply;
  reply := public.commit_game_operation(a, req, repeat('a',64), 0,
    '{"account":{"fractalis":999}}', '{"account":{"fractalis":999}}');
  assert reply = original, 'retry must return exact committed result';
  assert public.find_game_request(b, req, repeat('a',64)) is null, 'requests isolated by owner';
  begin
    perform public.find_game_request(a, req, repeat('b',64));
    raise exception 'fingerprint reuse accepted';
  exception when raise_exception then
    if sqlerrm = 'fingerprint reuse accepted' then raise; end if;
  end;
  reply := public.commit_game_operation(a, gen_random_uuid(), repeat('c',64), 0,
    '{"account":{"fractalis":999}}', '{}');
  assert reply->>'conflict' = 'true', 'stale concurrent revision rejected';
  assert (select state->'account'->>'fractalis' from private.game_accounts where user_id=a) = '10', 'CAS preserves wallet';
  assert (select state->'run'->>'frozen' from private.game_accounts where user_id=a) = 'true', 'atomic run';
  assert (select revision from private.game_accounts where user_id=b) = 0, 'cross-user write isolated';
  for i in 1..120 loop assert public.consume_game_attempt(a), 'limit before threshold'; end loop;
  assert not public.consume_game_attempt(a), 'server rate limit';
  assert not has_table_privilege('authenticated','private.game_accounts','SELECT'), 'no client wallet read';
  assert not has_table_privilege('authenticated','private.game_accounts','UPDATE'), 'no client wallet write';
  assert not has_function_privilege('authenticated','public.commit_game_operation(uuid,uuid,text,bigint,jsonb,jsonb,jsonb)','EXECUTE'), 'no client commit';
  assert not has_function_privilege('anon','public.load_game_account(uuid,jsonb)','EXECUTE'), 'no anonymous load';
end $$;
rollback;
