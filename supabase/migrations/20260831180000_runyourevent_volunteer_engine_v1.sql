create table if not exists public.rye_volunteer_organizer_requests (
  id uuid primary key default gen_random_uuid(),
  organization_name text not null,
  contact_name text not null,
  contact_email text not null,
  phone text,
  city text not null,
  postal_code text,
  pipeline text not null check (pipeline in ('sports_club','one_off_event')),
  event_type text,
  event_name text,
  event_date date,
  season_label text,
  volunteers_needed integer not null check (volunteers_needed between 1 and 500),
  role_examples text,
  notes text,
  responsibility_ack boolean not null default false,
  status text not null default 'new' check (status in ('new','contacted','qualified','active','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rye_volunteer_profiles (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null unique,
  city text not null,
  postal_code text,
  age_band text not null check (age_band in ('16_17','18_20','21_25','26_plus')),
  school_or_university text,
  interests text,
  availability text,
  guardian_consent_ready boolean not null default false,
  privacy_ack boolean not null default false,
  status text not null default 'active' check (status in ('active','paused','blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rye_volunteer_opportunities (
  id uuid primary key default gen_random_uuid(),
  organizer_request_id uuid references public.rye_volunteer_organizer_requests(id) on delete set null,
  title text not null,
  organization_name text not null,
  event_name text,
  city text not null,
  venue text,
  event_day date not null,
  shift_start timestamptz not null,
  shift_end timestamptz not null,
  min_age smallint not null default 16 check (min_age between 16 and 99),
  slots_total integer not null check (slots_total between 1 and 500),
  role_description text not null,
  briefing_notes text,
  safeguarding_notes text,
  status text not null default 'draft' check (status in ('draft','open','full','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (shift_end > shift_start),
  check (extract(epoch from (shift_end-shift_start))/3600 <= 12)
);

create table if not exists public.rye_volunteer_placements (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.rye_volunteer_opportunities(id) on delete cascade,
  volunteer_profile_id uuid not null references public.rye_volunteer_profiles(id) on delete cascade,
  status text not null default 'applied' check (status in ('applied','confirmed','declined','cancelled','completed','no_show')),
  event_day date not null,
  checked_in_at timestamptz,
  checked_out_at timestamptz,
  verified_minutes integer not null default 0 check (verified_minutes between 0 and 1440),
  organizer_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(opportunity_id, volunteer_profile_id),
  check (checked_out_at is null or checked_in_at is null or checked_out_at >= checked_in_at)
);

create table if not exists public.rye_volunteer_certificates (
  id uuid primary key default gen_random_uuid(),
  volunteer_profile_id uuid not null references public.rye_volunteer_profiles(id) on delete cascade,
  period_label text not null,
  credited_minutes integer not null check (credited_minutes >= 1800),
  points integer not null check (points >= 3000),
  distinct_event_days integer not null check (distinct_event_days >= 8),
  certificate_code text not null unique default encode(gen_random_bytes(12),'hex'),
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique(volunteer_profile_id, period_label)
);

alter table public.rye_volunteer_organizer_requests enable row level security;
alter table public.rye_volunteer_profiles enable row level security;
alter table public.rye_volunteer_opportunities enable row level security;
alter table public.rye_volunteer_placements enable row level security;
alter table public.rye_volunteer_certificates enable row level security;

create or replace view public.rye_volunteer_progress as
with daily as (
  select
    volunteer_profile_id,
    event_day,
    least(sum(case when organizer_verified and status='completed' then verified_minutes else 0 end),240)::integer as credited_minutes
  from public.rye_volunteer_placements
  group by volunteer_profile_id,event_day
), totals as (
  select volunteer_profile_id,
    coalesce(sum(credited_minutes),0)::integer as credited_minutes,
    count(*) filter (where credited_minutes>0)::integer as distinct_event_days
  from daily
  group by volunteer_profile_id
)
select p.id as volunteer_profile_id,
  coalesce(t.credited_minutes,0) as credited_minutes,
  floor(coalesce(t.credited_minutes,0)::numeric*100/60)::integer as points,
  coalesce(t.distinct_event_days,0) as distinct_event_days,
  (coalesce(t.credited_minutes,0)>=1800) as certificate_eligible
from public.rye_volunteer_profiles p
left join totals t on t.volunteer_profile_id=p.id;

create or replace function public.rye_submit_volunteer_organizer_request(
  p_organization_name text,
  p_contact_name text,
  p_contact_email text,
  p_phone text,
  p_city text,
  p_postal_code text,
  p_pipeline text,
  p_event_type text,
  p_event_name text,
  p_event_date date,
  p_season_label text,
  p_volunteers_needed integer,
  p_role_examples text,
  p_notes text,
  p_responsibility_ack boolean
) returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid;
begin
  if length(trim(coalesce(p_organization_name,''))) < 2 or length(trim(coalesce(p_contact_name,''))) < 2 then raise exception 'missing required fields'; end if;
  if lower(coalesce(p_contact_email,'')) !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then raise exception 'invalid email'; end if;
  if p_pipeline not in ('sports_club','one_off_event') then raise exception 'invalid pipeline'; end if;
  if coalesce(p_volunteers_needed,0) < 1 or p_volunteers_needed > 500 then raise exception 'invalid volunteer count'; end if;
  if p_responsibility_ack is not true then raise exception 'responsibility acknowledgement required'; end if;
  insert into public.rye_volunteer_organizer_requests(
    organization_name,contact_name,contact_email,phone,city,postal_code,pipeline,event_type,event_name,event_date,season_label,volunteers_needed,role_examples,notes,responsibility_ack
  ) values (
    left(trim(p_organization_name),160),left(trim(p_contact_name),120),left(lower(trim(p_contact_email)),254),nullif(left(trim(coalesce(p_phone,'')),60),''),left(trim(p_city),120),nullif(left(trim(coalesce(p_postal_code,'')),30),''),p_pipeline,nullif(left(trim(coalesce(p_event_type,'')),120),''),nullif(left(trim(coalesce(p_event_name,'')),160),''),p_event_date,nullif(left(trim(coalesce(p_season_label,'')),100),''),p_volunteers_needed,nullif(left(trim(coalesce(p_role_examples,'')),1500),''),nullif(left(trim(coalesce(p_notes,'')),2000),''),true
  ) returning id into v_id;
  return v_id;
end $$;

create or replace function public.rye_submit_volunteer_profile(
  p_first_name text,
  p_last_name text,
  p_email text,
  p_city text,
  p_postal_code text,
  p_age_band text,
  p_school_or_university text,
  p_interests text,
  p_availability text,
  p_guardian_consent_ready boolean,
  p_privacy_ack boolean
) returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid; v_email text;
begin
  v_email:=lower(trim(coalesce(p_email,'')));
  if length(trim(coalesce(p_first_name,''))) < 1 or length(trim(coalesce(p_last_name,''))) < 1 then raise exception 'missing required fields'; end if;
  if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then raise exception 'invalid email'; end if;
  if p_age_band not in ('16_17','18_20','21_25','26_plus') then raise exception 'invalid age band'; end if;
  if p_age_band='16_17' and p_guardian_consent_ready is not true then raise exception 'guardian consent readiness required'; end if;
  if p_privacy_ack is not true then raise exception 'privacy acknowledgement required'; end if;
  insert into public.rye_volunteer_profiles(first_name,last_name,email,city,postal_code,age_band,school_or_university,interests,availability,guardian_consent_ready,privacy_ack)
  values(left(trim(p_first_name),80),left(trim(p_last_name),80),left(v_email,254),left(trim(p_city),120),nullif(left(trim(coalesce(p_postal_code,'')),30),''),p_age_band,nullif(left(trim(coalesce(p_school_or_university,'')),160),''),nullif(left(trim(coalesce(p_interests,'')),1500),''),nullif(left(trim(coalesce(p_availability,'')),1500),''),coalesce(p_guardian_consent_ready,false),true)
  on conflict(email) do update set
    first_name=excluded.first_name,last_name=excluded.last_name,city=excluded.city,postal_code=excluded.postal_code,age_band=excluded.age_band,school_or_university=excluded.school_or_university,interests=excluded.interests,availability=excluded.availability,guardian_consent_ready=excluded.guardian_consent_ready,privacy_ack=true,updated_at=now(),status='active'
  returning id into v_id;
  return v_id;
end $$;

grant execute on function public.rye_submit_volunteer_organizer_request(text,text,text,text,text,text,text,text,text,date,text,integer,text,text,boolean) to anon,authenticated;
grant execute on function public.rye_submit_volunteer_profile(text,text,text,text,text,text,text,text,text,boolean,boolean) to anon,authenticated;

create or replace function public.rye_admin_volunteer_dashboard(p_token text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_valid boolean; v_result jsonb;
begin
  select public.rye_admin_session_valid(p_token) into v_valid;
  if coalesce(v_valid,false) is not true then raise exception 'unauthorized'; end if;
  select jsonb_build_object(
    'metrics',jsonb_build_object(
      'organizerLeads7d',(select count(*) from public.rye_volunteer_organizer_requests where created_at>=now()-interval '7 days'),
      'volunteers30d',(select count(*) from public.rye_volunteer_profiles where created_at>=now()-interval '30 days'),
      'openOpportunities',(select count(*) from public.rye_volunteer_opportunities where status='open'),
      'confirmedPlacements',(select count(*) from public.rye_volunteer_placements where status in ('confirmed','completed')),
      'certificateEligible',(select count(*) from public.rye_volunteer_progress where certificate_eligible)
    ),
    'organizers',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from (select id,organization_name,contact_name,contact_email,city,pipeline,event_name,event_date,season_label,volunteers_needed,status,created_at from public.rye_volunteer_organizer_requests order by created_at desc limit 30) x),'[]'::jsonb),
    'volunteers',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from (select p.id,p.first_name,p.last_name,p.email,p.city,p.age_band,p.status,p.created_at,coalesce(v.credited_minutes,0) credited_minutes,coalesce(v.points,0) points,coalesce(v.distinct_event_days,0) distinct_event_days,coalesce(v.certificate_eligible,false) certificate_eligible from public.rye_volunteer_profiles p left join public.rye_volunteer_progress v on v.volunteer_profile_id=p.id order by p.created_at desc limit 30) x),'[]'::jsonb),
    'placements',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from (select pl.id,pl.status,pl.event_day,pl.verified_minutes,pl.organizer_verified,pl.created_at,o.title opportunity_title,o.organization_name,p.first_name,p.last_name from public.rye_volunteer_placements pl join public.rye_volunteer_opportunities o on o.id=pl.opportunity_id join public.rye_volunteer_profiles p on p.id=pl.volunteer_profile_id order by pl.created_at desc limit 30) x),'[]'::jsonb)
  ) into v_result;
  return v_result;
end $$;
grant execute on function public.rye_admin_volunteer_dashboard(text) to anon,authenticated;

revoke all on public.rye_volunteer_organizer_requests from anon,authenticated;
revoke all on public.rye_volunteer_profiles from anon,authenticated;
revoke all on public.rye_volunteer_opportunities from anon,authenticated;
revoke all on public.rye_volunteer_placements from anon,authenticated;
revoke all on public.rye_volunteer_certificates from anon,authenticated;
revoke all on public.rye_volunteer_progress from anon,authenticated;
