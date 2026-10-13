begin;
do $$
declare user_a uuid := gen_random_uuid(); user_b uuid := gen_random_uuid();
  snapshot jsonb := '{"account":{"fractalis":42},"run":{"frozen":true,"combatSeed":123}}';
  reply jsonb; before_save timestamptz;
begin
  insert into auth.users(id, raw_user_meta_data) values
    (user_a, jsonb_build_object('username', 'autosave_test_a')),
    (user_b, jsonb_build_object('username', 'autosave_test_b'));
  perform public.load_game_account(user_a, snapshot);
  perform public.load_game_account(user_b, '{"account":{"fractalis":0}}');
  select updated_at into before_save from private.game_accounts where user_id = user_a;
  reply := public.checkpoint_game_account(user_a, 0);
  assert reply->'state' = snapshot, 'checkpoint preserves complete authoritative state';
  assert reply->>'revision' = '0', 'checkpoint does not invalidate pending operations or one-time imports';
  assert (select updated_at > before_save from private.game_accounts where user_id = user_a), 'checkpoint is a real persisted write';
  assert (select count(*) from private.game_requests where user_id = user_a) = 0, 'checkpoint does not create reward receipts';
  assert (select state->'account'->>'fractalis' from private.game_accounts where user_id = user_b) = '0', 'other account unchanged';
  perform public.commit_game_operation(user_a, gen_random_uuid(), repeat('c',64), 0,
    '{"account":{"fractalis":99},"run":{"combatSeed":456}}', '{}');
  select updated_at into before_save from private.game_accounts where user_id = user_a;
  reply := public.checkpoint_game_account(user_a, 0);
  assert reply->>'conflict' = 'true', 'stale checkpoint rejected';
  assert (select state->'account'->>'fractalis' from private.game_accounts where user_id = user_a) = '99', 'checkpoint cannot overwrite newer transactions';
  assert (select updated_at = before_save from private.game_accounts where user_id = user_a), 'rejected checkpoint does not write';
  assert not has_function_privilege('authenticated','public.checkpoint_game_account(uuid,bigint)','EXECUTE'), 'no direct client checkpoint';
  assert not has_function_privilege('anon','public.checkpoint_game_account(uuid,bigint)','EXECUTE'), 'no anonymous checkpoint';
end $$;
rollback;
