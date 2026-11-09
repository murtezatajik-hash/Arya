begin;

alter table public.profiles
  add column if not exists hijri_offset smallint not null default 0;

-- Drop old calendar/offset checks before adding the new values and range.
do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select conname
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'c'
      and (
        pg_get_constraintdef(oid) ilike '%calendar%'
        or pg_get_constraintdef(oid) ilike '%hijri_offset%'
      )
  loop
    execute format(
      'alter table public.profiles drop constraint %I',
      constraint_name
    );
  end loop;
end $$;

-- NULL means "the user has not chosen a calendar yet". In that case the app
-- uses the locale default (fa -> jalali, en -> gregorian).
alter table public.profiles
  alter column calendar drop not null,
  alter column calendar drop default;

alter table public.profiles
  drop constraint if exists profiles_calendar_check;
alter table public.profiles
  add constraint profiles_calendar_check
  check (calendar is null or calendar in ('gregorian', 'jalali', 'hijri'));

alter table public.profiles
  drop constraint if exists profiles_hijri_offset_check;
alter table public.profiles
  add constraint profiles_hijri_offset_check
  check (hijri_offset between -2 and 2);

-- Older rows were created with the database default "gregorian" before the
-- user made a choice. The previous app tracked an explicit choice in auth
-- metadata, so only turn the untouched defaults into NULL.
update public.profiles p
set calendar = null
from auth.users u
where p.id = u.id
  and p.calendar = 'gregorian'
  and (u.raw_user_meta_data ->> 'calendar_explicit') is distinct from 'true';

-- PostgREST upserts with ON CONFLICT DO UPDATE need table-level UPDATE
-- privileges, even though RLS still limits which rows can actually change.
grant update on public.profiles to authenticated;

-- A missing profiles row must be creatable by its authenticated owner. This is
-- what makes the settings form's upsert work when no profile row exists.
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'profiles_insert_own'
  ) then
    create policy "profiles_insert_own"
      on public.profiles
      for insert
      to authenticated
      with check (auth.uid() = id);
  end if;
end $$;

commit;
