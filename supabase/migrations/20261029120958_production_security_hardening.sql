-- Fix the legacy planning helpers without changing volunteering access rules.
-- Minimal volunteering-only installations may not include these legacy helpers.
do $$
begin
 if to_regprocedure('public.rye_classify_event_segment(jsonb)') is not null then
  alter function public.rye_classify_event_segment(jsonb) set search_path = pg_catalog, public;
 end if;
 if to_regprocedure('public.rye_set_draft_segment()') is not null then
  alter function public.rye_set_draft_segment() set search_path = pg_catalog, public;
  revoke all on function public.rye_set_draft_segment() from public, anon, authenticated;
 end if;
end $$;
