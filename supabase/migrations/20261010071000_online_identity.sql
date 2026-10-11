create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.player_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,16}$'),
  created_at timestamptz not null default now()
);
alter table public.player_profiles enable row level security;
revoke all on public.player_profiles from anon, authenticated;
grant select on public.player_profiles to authenticated;
grant select on public.player_profiles to service_role;
create policy own_profile_read on public.player_profiles
  for select to authenticated using ((select auth.uid()) = user_id);

create table private.login_limits (
  bucket text primary key,
  starts_at timestamptz not null,
  attempts integer not null
);
revoke all on private.login_limits from public, anon, authenticated;

create function public.consume_login_attempt(p_bucket text, p_max integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  used integer;
begin
  if p_max < 1 or p_max > 100 or length(p_bucket) <> 64 then
    raise exception 'Invalid authentication limit';
  end if;
  insert into private.login_limits as limits (bucket, starts_at, attempts)
  values (p_bucket, now(), 1)
  on conflict (bucket) do update set
    starts_at = case when limits.starts_at < now() - interval '15 minutes'
      then now() else limits.starts_at end,
    attempts = case when limits.starts_at < now() - interval '15 minutes'
      then 1 else least(limits.attempts + 1, 101) end
  returning attempts into used;
  return used <= p_max;
end;
$$;
revoke all on function public.consume_login_attempt(text, integer) from public, anon, authenticated;
grant execute on function public.consume_login_attempt(text, integer) to service_role;

create function private.create_player_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.player_profiles (user_id, username)
    values (new.id, lower(new.raw_user_meta_data ->> 'username'));
  return new;
end;
$$;
revoke all on function private.create_player_profile() from public, anon, authenticated;
create trigger create_player_profile after insert on auth.users
  for each row execute function private.create_player_profile();

comment on table public.player_profiles is
  'Online identity only. Browser clients cannot write profiles or submit legacy wallets.';
