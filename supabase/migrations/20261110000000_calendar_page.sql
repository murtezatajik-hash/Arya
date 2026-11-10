-- A NULL holiday_sets means "use the profile region default".
-- An empty array is an explicit choice to show no holiday sets.
alter table public.profiles alter column holiday_sets drop default;
alter table public.profiles alter column holiday_sets drop not null;

-- Holiday data is read-only for the application. Content is managed by seeds
-- and administrative tooling with elevated credentials only.
revoke insert, update, delete, truncate, references, trigger
  on table public.holidays
  from anon, authenticated;
