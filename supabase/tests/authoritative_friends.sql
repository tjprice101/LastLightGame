begin;
do $$
declare a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); c uuid:=gen_random_uuid();
  req uuid:=gen_random_uuid(); reply jsonb; original jsonb;
begin
  insert into auth.users(id,raw_user_meta_data) values
    (a,'{"username":"friends_test_a"}'),(b,'{"username":"friends_test_b"}'),(c,'{"username":"friends_test_c"}');
  perform public.load_game_account(a,'{"profile":{"displayName":"A","icon":"neutral","frame":"default"}}');
  perform public.load_game_account(b,'{"profile":{"displayName":"B","icon":"neutral","frame":"default"}}');
  reply:=public.commit_game_operation(a,req,repeat('d',64),0,'{}','{}',
    '{"kind":"friendRequest","username":"friends_test_b"}');
  original:=reply;
  assert jsonb_array_length(reply->'social'->'outgoing')=1,'outgoing request';
  assert jsonb_array_length(public.game_social(b)->'incoming')=1,'recipient incoming';
  assert jsonb_array_length(public.game_social(c)->'incoming')=0,'no directory';
  assert not ((reply->'social'->'outgoing'->0) ? 'email'),'private email excluded';
  assert not ((reply->'social'->'outgoing'->0) ? 'account'),'wallet excluded';
  reply:=public.commit_game_operation(a,req,repeat('d',64),0,'{}','{}',
    '{"kind":"friendRequest","username":"friends_test_b"}');
  assert reply=original,'social idempotency';
  begin
    perform private.apply_friend_operation(a,jsonb_build_object('kind','acceptFriendRequest','userId',b));
    raise exception 'wrong recipient accepted';
  exception when raise_exception then if sqlerrm='wrong recipient accepted' then raise; end if; end;
  begin
    perform private.apply_friend_operation(a,'{"kind":"friendRequest","username":"friends_test_a"}');
    raise exception 'self accepted';
  exception when raise_exception then if sqlerrm='self accepted' then raise; end if; end;
  perform private.apply_friend_operation(b,jsonb_build_object('kind','acceptFriendRequest','userId',a));
  assert jsonb_array_length(public.game_social(a)->'friends')=1,'accepted friend';
  assert jsonb_array_length(public.game_social(b)->'friends')=1,'mutual graph';
  perform private.apply_friend_operation(a,jsonb_build_object('kind','removeFriend','userId',b));
  assert jsonb_array_length(public.game_social(a)->'friends')=0,'remove mutual';
  perform private.apply_friend_operation(a,'{"kind":"friendRequest","username":"friends_test_b"}');
  perform private.apply_friend_operation(a,jsonb_build_object('kind','cancelFriendRequest','userId',b));
  perform private.apply_friend_operation(a,'{"kind":"friendRequest","username":"friends_test_b"}');
  perform private.apply_friend_operation(b,jsonb_build_object('kind','declineFriendRequest','userId',a));
  assert jsonb_array_length(public.game_social(a)->'outgoing')=0,'decline';
  assert not has_function_privilege('authenticated','public.game_social(uuid)','EXECUTE'),'no graph lookup';
  assert not has_function_privilege('authenticated','public.commit_game_operation(uuid,uuid,text,bigint,jsonb,jsonb,jsonb)','EXECUTE'),'no browser commit';
  assert not has_table_privilege('authenticated','private.friend_edges','SELECT'),'private edges';
end $$;
rollback;
