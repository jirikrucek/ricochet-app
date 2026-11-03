-- The player overview filters, sorts and pages in the backend (ADR 0020), so the
-- browser only ever receives the rows of the page it shows.

-- One collation per supported UI language (src/locales/languages.ts). Level 2
-- ignores letter case but not accents. Non-deterministic so that names differing
-- only in case count as equal and the next sort key decides, instead of Postgres
-- breaking the tie bytewise.
create collation public.player_name_en (provider = icu, locale = 'en-u-ks-level2', deterministic = false);
create collation public.player_name_cs (provider = icu, locale = 'cs-u-ks-level2', deterministic = false);
create collation public.player_name_de (provider = icu, locale = 'de-u-ks-level2', deterministic = false);
create collation public.player_name_pl (provider = icu, locale = 'pl-u-ks-level2', deterministic = false);
create collation public.player_name_nl (provider = icu, locale = 'nl-u-ks-level2', deterministic = false);
create collation public.player_name_hu (provider = icu, locale = 'hu-u-ks-level2', deterministic = false);

-- Every player with their position in the order of a UI language: surname without
-- its prefix, then first name, then suffix with no suffix first. The caller filters
-- and pages with plain PostgREST operators, and orders by sort_position: descending
-- reverses every key, because it reverses the position. The id makes the order total,
-- so a player can't move between pages from one request to the next.
--
-- A collation can't be a parameter, hence the dynamic SQL. Only the allowlisted
-- names below reach it, never the caller's text; an unknown language gets English,
-- the app's default. Security invoker: the players RLS policy still applies.
--
-- It returns a named type because PostgREST can't filter or order the anonymous
-- record that `returns table` produces.
create type public.player_sorted as (
  id bigint,
  first_name text,
  surname_prefix text,
  surname text,
  surname_suffix text,
  nationality text,
  sex public.player_sex,
  sort_position bigint
);

create function public.players_sorted(ui_language text)
returns setof public.player_sorted
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  name_collation text := case ui_language
    when 'cs' then 'player_name_cs'
    when 'de' then 'player_name_de'
    when 'pl' then 'player_name_pl'
    when 'nl' then 'player_name_nl'
    when 'hu' then 'player_name_hu'
    else 'player_name_en'
  end;
begin
  return query execute format(
    $query$
      select
        p.id,
        p.first_name,
        p.surname_prefix,
        p.surname,
        p.surname_suffix,
        p.nationality,
        p.sex,
        row_number() over (
          order by
            p.surname collate public.%1$I,
            p.first_name collate public.%1$I,
            p.surname_suffix collate public.%1$I nulls first,
            p.id
        )
      from public.players p
    $query$,
    name_collation
  );
end;
$$;

-- Functions are executable by PUBLIC by default, and Supabase's default privileges
-- add the API roles, so start from nothing as the players table does.
revoke all on function public.players_sorted(text) from public, anon, authenticated;
grant execute on function public.players_sorted(text) to anon, authenticated;

-- The nationalities some player has, which the nationality filter offers. Security
-- invoker: without it a view runs as its owner and would skip the players RLS policy.
create view public.player_nationalities
with (security_invoker = true)
as
  select distinct nationality from public.players;

revoke all on public.player_nationalities from anon, authenticated;
grant select on public.player_nationalities to anon, authenticated;
