alter table public.rye_volunteer_organizer_requests
  add column if not exists coverage_status text not null default 'unknown' check (coverage_status in ('existing_confirmed','not_covered','unknown')),
  add column if not exists protection_selected boolean not null default false,
  add column if not exists protection_required boolean not null default true,
  add column if not exists protection_ack boolean not null default false,
  add column if not exists protection_price_cents integer not null default 150 check (protection_price_cents >= 0),
  add column if not exists protection_status text not null default 'unresolved' check (protection_status in ('unresolved','existing_coverage','required_pending','selected_pending','active','cancelled'));

alter table public.rye_volunteer_opportunities
  add column if not exists protection_mode text not null default 'unresolved' check (protection_mode in ('unresolved','organizer_existing','runyourevent')),
  add column if not exists protection_status text not null default 'pending' check (protection_status in ('pending','active','not_required','cancelled')),
  add column if not exists protection_price_cents integer not null default 150 check (protection_price_cents >= 0),
  add column if not exists insurer_policy_reference text;

create or replace function public.rye_submit_volunteer_organizer_request_v2(
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
  p_responsibility_ack boolean,
  p_coverage_status text,
  p_protection_selected boolean,
  p_protection_ack boolean
) returns uuid language plpgsql security definer set search_path=public as $$
declare
  v_id uuid;
  v_required boolean;
  v_status text;
begin
  if length(trim(coalesce(p_organization_name,''))) < 2 or length(trim(coalesce(p_contact_name,''))) < 2 then raise exception 'missing required fields'; end if;
  if lower(coalesce(p_contact_email,'')) !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then raise exception 'invalid email'; end if;
  if p_pipeline not in ('sports_club','one_off_event') then raise exception 'invalid pipeline'; end if;
  if p_coverage_status not in ('existing_confirmed','not_covered','unknown') then raise exception 'invalid coverage status'; end if;
  if coalesce(p_volunteers_needed,0) < 1 or p_volunteers_needed > 500 then raise exception 'invalid volunteer count'; end if;
  if p_responsibility_ack is not true then raise exception 'responsibility acknowledgement required'; end if;

  v_required := p_coverage_status <> 'existing_confirmed';
  if v_required and (coalesce(p_protection_selected,false) is not true or coalesce(p_protection_ack,false) is not true) then
    raise exception 'volunteer protection required when equivalent existing coverage is not confirmed';
  end if;

  v_status := case
    when p_coverage_status='existing_confirmed' and coalesce(p_protection_selected,false)=false then 'existing_coverage'
    when v_required then 'required_pending'
    else 'selected_pending'
  end;

  insert into public.rye_volunteer_organizer_requests(
    organization_name,contact_name,contact_email,phone,city,postal_code,pipeline,event_type,event_name,event_date,season_label,volunteers_needed,role_examples,notes,responsibility_ack,
    coverage_status,protection_selected,protection_required,protection_ack,protection_price_cents,protection_status
  ) values (
    left(trim(p_organization_name),160),left(trim(p_contact_name),120),left(lower(trim(p_contact_email)),254),nullif(left(trim(coalesce(p_phone,'')),60),''),left(trim(p_city),120),nullif(left(trim(coalesce(p_postal_code,'')),30),''),p_pipeline,nullif(left(trim(coalesce(p_event_type,'')),120),''),nullif(left(trim(coalesce(p_event_name,'')),160),''),p_event_date,nullif(left(trim(coalesce(p_season_label,'')),100),''),p_volunteers_needed,nullif(left(trim(coalesce(p_role_examples,'')),1500),''),nullif(left(trim(coalesce(p_notes,'')),2000),''),true,
    p_coverage_status,coalesce(p_protection_selected,false),v_required,coalesce(p_protection_ack,false),150,v_status
  ) returning id into v_id;
  return v_id;
end $$;

grant execute on function public.rye_submit_volunteer_organizer_request_v2(text,text,text,text,text,text,text,text,text,date,text,integer,text,text,boolean,text,boolean,boolean) to anon,authenticated;

create or replace view public.rye_volunteer_protection_billing as
select
  o.organizer_request_id,
  r.organization_name,
  o.event_day,
  count(pl.id)::integer as covered_volunteer_days,
  min(o.protection_price_cents)::integer as unit_price_cents,
  (count(pl.id) * min(o.protection_price_cents))::integer as amount_cents
from public.rye_volunteer_opportunities o
join public.rye_volunteer_organizer_requests r on r.id=o.organizer_request_id
join public.rye_volunteer_placements pl on pl.opportunity_id=o.id
where o.protection_mode='runyourevent'
  and o.protection_status='active'
  and pl.status in ('confirmed','completed')
group by o.organizer_request_id,r.organization_name,o.event_day;

revoke all on public.rye_volunteer_protection_billing from anon,authenticated;

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
      'certificateEligible',(select count(*) from public.rye_volunteer_progress where certificate_eligible),
      'protectionRequired',(select count(*) from public.rye_volunteer_organizer_requests where protection_required and status not in ('closed')),
      'protectionSelected',(select count(*) from public.rye_volunteer_organizer_requests where protection_selected and status not in ('closed')),
      'billableProtectionDays',(select coalesce(sum(covered_volunteer_days),0) from public.rye_volunteer_protection_billing),
      'protectionGrossCents',(select coalesce(sum(amount_cents),0) from public.rye_volunteer_protection_billing)
    ),
    'organizers',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from (
      select id,organization_name,contact_name,contact_email,city,pipeline,event_name,event_date,season_label,volunteers_needed,status,created_at,
        coverage_status,protection_selected,protection_required,protection_price_cents,protection_status
      from public.rye_volunteer_organizer_requests order by created_at desc limit 30
    ) x),'[]'::jsonb),
    'volunteers',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from (
      select p.id,p.first_name,p.last_name,p.email,p.city,p.age_band,p.status,p.created_at,coalesce(v.credited_minutes,0) credited_minutes,coalesce(v.points,0) points,coalesce(v.distinct_event_days,0) distinct_event_days,coalesce(v.certificate_eligible,false) certificate_eligible
      from public.rye_volunteer_profiles p left join public.rye_volunteer_progress v on v.volunteer_profile_id=p.id order by p.created_at desc limit 30
    ) x),'[]'::jsonb),
    'placements',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from (
      select pl.id,pl.status,pl.event_day,pl.verified_minutes,pl.organizer_verified,pl.created_at,o.title opportunity_title,o.organization_name,o.protection_mode,o.protection_status,p.first_name,p.last_name
      from public.rye_volunteer_placements pl join public.rye_volunteer_opportunities o on o.id=pl.opportunity_id join public.rye_volunteer_profiles p on p.id=pl.volunteer_profile_id order by pl.created_at desc limit 30
    ) x),'[]'::jsonb)
  ) into v_result;
  return v_result;
end $$;

grant execute on function public.rye_admin_volunteer_dashboard(text) to anon,authenticated;
