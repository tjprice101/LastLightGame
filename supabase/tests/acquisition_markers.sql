begin;
do $$
declare
  a uuid := gen_random_uuid(); b uuid := gen_random_uuid(); c uuid := gen_random_uuid(); d uuid := gen_random_uuid(); req uuid := gen_random_uuid();
  state jsonb; before_state jsonb; res jsonb; base_revision bigint; fingerprint text := repeat('c',64);
begin
  insert into auth.users(id,raw_user_meta_data) values(a,'{"username":"markers_a"}'),(b,'{"username":"markers_b"}'),
    (c,'{"username":"markers_c"}'),(d,'{"username":"markers_d"}');
  state := '{"starterId":"ember","run":{"frozen":true},"account":{"version":11,"fractalis":10000,"lycalis":0,"characters":{"ember":{}},"materials":{"infernic-common":10},"conduits":{"vigil-core":1},"masterConduits":{"master:old":1},"capturedCharacters":[{"creatureId":"infusion:heavens:2"}]}}';
  perform public.load_game_account(a,state);
  perform public.load_game_account(b,'{"starterId":"tide","account":{"characters":{"tide":{}},"materials":{},"fractalis":0,"lycalis":0}}');
  perform set_config('request.jwt.claim.sub',a::text,true);
  select g.state,g.revision into before_state,base_revision from private.game_accounts g where user_id=a;
  res := public.acquisition_markers();
  assert (res->'markers'->>'character:ember')::boolean and (res->'markers'->>'material:infernic-common')::boolean, 'legacy holdings projected seen';
  assert (select g.state=before_state and g.revision=base_revision from private.game_accounts g where user_id=a), 'load/read no state mutation';
  state := jsonb_set(state,'{account,materials,oceanic-common}','10');
  state := jsonb_set(state,'{account,characters,tide}','{}');
  state := jsonb_set(state,'{account,conduits,bastion-lock}','1');
  state := jsonb_set(state,'{account,masterConduits,master:new}','1');
  state := jsonb_set(state,'{account,capturedCharacters}','[{"creatureId":"infusion:heavens:2"},{"creatureId":"infusion:heavens:2"},{"creatureId":"infusion:heavens:3"}]');
  res := public.commit_game_aggregate(a,req,fingerprint,base_revision,state,jsonb_build_object('account',state->'account'));
  assert res->'account'->'acquisitionMarkers'->'material:oceanic-common'='false'::jsonb
    and res->'account'->'acquisitionMarkers'->'character:tide'='false'::jsonb
    and res->'account'->'acquisitionMarkers'->'conduit:bastion-lock'='false'::jsonb
    and res->'account'->'acquisitionMarkers'->'master:master:new'='false'::jsonb, 'every acquisition category tracked on authoritative commit';
  assert res->'account'->'acquisitionMarkers'->'form:infusion:heavens:2'='true'::jsonb
    and res->'account'->'acquisitionMarkers'->'form:infusion:heavens:3'='false'::jsonb, 'captured forms tracked, duplicate copies never new';
  assert public.commit_game_aggregate(a,req,fingerprint,base_revision,state,jsonb_build_object('account',state->'account'))=res, 'cached reward retry unchanged markers';
  res := public.acquisition_markers('["material:oceanic-common","form:infusion:heavens:3"]');
  assert res->'markers'->'material:oceanic-common'='true'::jsonb, 'explicit acknowledgement saved';
  assert (res->>'revision')::bigint=base_revision+1, 'metadata acknowledgement does not invalidate gameplay revision';
  assert public.acquisition_markers('["material:oceanic-common","form:infusion:heavens:3"]')=res, 'ack idempotent';
  assert (select g.state->'run'=before_state->'run' from private.game_accounts g where user_id=a), 'frozen run never changed';
  -- A stale wallet commit selected before acknowledgement must preserve seen history.
  perform public.commit_game_aggregate(a,gen_random_uuid(),fingerprint,base_revision+1,state,jsonb_build_object('account',state->'account'));
  assert public.acquisition_markers()->'markers'->'material:oceanic-common'='true'::jsonb, 'stale aggregate cannot reopen seen marker';
  state := jsonb_set(state,'{account,materials}','{}');
  perform public.commit_game_aggregate(a,gen_random_uuid(),fingerprint,base_revision+2,state,jsonb_build_object('account',state->'account'));
  state := jsonb_set(state,'{account,materials,oceanic-common}','1');
  perform public.commit_game_aggregate(a,gen_random_uuid(),fingerprint,base_revision+3,state,jsonb_build_object('account',state->'account'));
  assert public.acquisition_markers()->'markers'->'material:oceanic-common'='true'::jsonb, 'spend and reacquire never makes first-ever item new';
  -- Mail path bypasses game resolver but shares the database acquisition trigger.
  perform set_config('request.jwt.claim.sub',b::text,true);
  insert into private.player_mail(recipient,title,body,attachment) values(b,'gift','', '{"fractalis":0,"lycalis":0,"materials":{"botanic-common":10}}');
  perform public.social_calendar('{"kind":"claimAll"}',gen_random_uuid());
  assert public.acquisition_markers()->'markers'->'material:botanic-common'='false'::jsonb, 'mail grants create actual new material marker';
  assert public.acquisition_markers()->'markers'->'character:tide'='true'::jsonb, 'another account legacy baseline independent';
  assert not has_function_privilege('anon','public.acquisition_markers(jsonb)','execute'), 'anonymous marker access denied';
  assert has_function_privilege('authenticated','public.acquisition_markers(jsonb)','execute'), 'authenticated own-user marker RPC';
  perform public.load_game_account(c,'{"starterId":null,"account":{"characters":{},"materials":{},"fractalis":0,"lycalis":0}}');
  state := '{"starterId":"ember","account":{"characters":{"ember":{}},"materials":{},"fractalis":0,"lycalis":0}}';
  perform public.commit_game_aggregate(c,gen_random_uuid(),fingerprint,0,state,jsonb_build_object('account',state->'account'));
  perform set_config('request.jwt.claim.sub',c::text,true);
  assert public.acquisition_markers()->'markers'->'character:ember'='false'::jsonb, 'new online starter is an actual first acquisition';
  perform public.load_game_account(d,'{"starterId":null,"account":{"characters":{},"materials":{},"fractalis":0,"lycalis":0}}');
  state := '{"starterId":"tide","account":{"characters":{"tide":{}},"materials":{"oceanic-common":10,"botanic-common":1},"fractalis":0,"lycalis":0,"acquisitionMarkers":{"character:tide":true,"material:oceanic-common":true,"material:botanic-common":false}}}';
  perform public.commit_game_aggregate(d,gen_random_uuid(),fingerprint,0,state,jsonb_build_object('account',state->'account'));
  perform set_config('request.jwt.claim.sub',d::text,true);
  assert public.acquisition_markers()->'markers'->'character:tide'='true'::jsonb
    and public.acquisition_markers()->'markers'->'material:oceanic-common'='true'::jsonb, 'legacy imported holdings remain seen';
  assert public.acquisition_markers()->'markers'->'material:botanic-common'='false'::jsonb, 'imported actual unread history retained';
end;
$$;
rollback;
