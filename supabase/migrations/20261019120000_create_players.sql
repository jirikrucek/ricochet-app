-- Players listed on the player overview. Public and read-only: every visitor
-- can select, nobody can write through the API (docs/standards/security-standard.md).
-- Rows are loaded by hand (production data) or by supabase/seed.sql (local, CI).

create type public.player_sex as enum ('male', 'female');

create table public.players (
  id bigint generated always as identity primary key,
  first_name text not null,
  surname text not null,
  -- "de", "van", "ter": shown before the surname, ignored when sorting
  surname_prefix text,
  -- "jr.", "sr.": shown after the surname, the last sort tie-breaker
  surname_suffix text,
  -- ISO 3166-1 alpha-2. Adding a country also needs a flag and six translations.
  nationality text not null,
  sex public.player_sex not null,
  created_at timestamptz not null default now(),

  constraint players_first_name_not_blank check (btrim(first_name) <> ''),
  constraint players_surname_not_blank check (btrim(surname) <> ''),
  -- "no prefix/suffix" is always null, never an empty string
  constraint players_surname_prefix_not_blank check (btrim(surname_prefix) <> ''),
  constraint players_surname_suffix_not_blank check (btrim(surname_suffix) <> ''),
  constraint players_nationality_known
    check (nationality in ('CZ', 'DE', 'HU', 'PL', 'NL', 'GB')),

  -- Natural key: keeps the hand-run production data script idempotent
  -- (insert ... on conflict) and stops the same person being loaded twice.
  constraint players_natural_key unique nulls not distinct
    (first_name, surname_prefix, surname, surname_suffix, nationality)
);

alter table public.players enable row level security;

create policy "Players are readable by every visitor"
  on public.players
  for select
  to anon, authenticated
  using (true);

-- Supabase's default privileges grant the API roles every privilege on a new
-- table in `public`, so start from nothing and grant only the read. Even a
-- later mistaken "for all" policy then can't open writes.
revoke all on public.players from anon, authenticated;
grant select on public.players to anon, authenticated;
