begin;

do $$
declare
  first_id uuid := gen_random_uuid();
  second_id uuid := gen_random_uuid();
  first_name text := 'test_' || substr(replace(first_id::text, '-', ''), 1, 10);
  second_name text := 'test_' || substr(replace(second_id::text, '-', ''), 1, 10);
  test_bucket text := replace(first_id::text || second_id::text, '-', '');
  count_visible integer;
begin
  if has_table_privilege('anon', 'public.player_profiles', 'SELECT') or
    has_table_privilege('authenticated', 'public.player_profiles', 'INSERT,UPDATE,DELETE') or
    has_function_privilege('authenticated', 'public.consume_login_attempt(text,integer)', 'EXECUTE') then
    raise exception 'Client identity permissions are too broad';
  end if;
  insert into auth.users (id, raw_user_meta_data) values
    (first_id, jsonb_build_object('username', upper(first_name))),
    (second_id, jsonb_build_object('username', second_name));
  if not exists (select 1 from public.player_profiles where user_id = first_id and username = first_name) then
    raise exception 'Profile trigger did not normalize the username';
  end if;
  begin
    insert into auth.users (id, raw_user_meta_data)
      values (gen_random_uuid(), jsonb_build_object('username', first_name));
    raise exception 'Duplicate username was accepted';
  exception when unique_violation then null;
  end;
  begin
    insert into auth.users (id, raw_user_meta_data)
      values (gen_random_uuid(), '{"username":"invalid-name"}');
    raise exception 'Invalid username was accepted';
  exception when check_violation then null;
  end;
  if not public.consume_login_attempt(test_bucket, 1) or
    public.consume_login_attempt(test_bucket, 1) then
    raise exception 'Authentication limiter did not enforce the threshold';
  end if;
  perform set_config('request.jwt.claim.sub', first_id::text, true);
  set local role authenticated;
  select count(*) into count_visible from public.player_profiles;
  if count_visible <> 1 or not exists (
    select 1 from public.player_profiles where user_id = first_id
  ) then
    raise exception 'Profile row-level isolation failed';
  end if;
  reset role;
end;
$$;

rollback;
