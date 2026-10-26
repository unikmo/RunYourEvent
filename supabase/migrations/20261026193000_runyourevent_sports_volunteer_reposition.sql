-- Reposition RunYourEvent as a sports-volunteer marketplace.
-- Commercial model: EUR 8 per completed volunteer activity.
-- Student certificate: 20 verified volunteer hours.

create or replace view public.rye_volunteer_progress as
with daily as (
  select
    volunteer_profile_id,
    event_day,
    least(sum(case when organizer_verified and status='completed' then verified_minutes else 0 end),240)::integer as credited_minutes
  from public.rye_volunteer_placements
  group by volunteer_profile_id,event_day
), totals as (
  select
    volunteer_profile_id,
    coalesce(sum(credited_minutes),0)::integer as credited_minutes,
    count(*) filter (where credited_minutes>0)::integer as distinct_event_days
  from daily
  group by volunteer_profile_id
)
select
  p.id as volunteer_profile_id,
  coalesce(t.credited_minutes,0) as credited_minutes,
  floor(coalesce(t.credited_minutes,0)::numeric*100/60)::integer as points,
  coalesce(t.distinct_event_days,0) as distinct_event_days,
  (coalesce(t.credited_minutes,0)>=1200) as certificate_eligible
from public.rye_volunteer_profiles p
left join totals t on t.volunteer_profile_id=p.id;

alter table public.rye_volunteer_certificates
  drop constraint if exists rye_volunteer_certificates_credited_minutes_check;
alter table public.rye_volunteer_certificates
  add constraint rye_volunteer_certificates_credited_minutes_check check (credited_minutes >= 1200);

alter table public.rye_volunteer_certificates
  drop constraint if exists rye_volunteer_certificates_points_check;
alter table public.rye_volunteer_certificates
  add constraint rye_volunteer_certificates_points_check check (points >= 2000);

alter table public.rye_volunteer_certificates
  drop constraint if exists rye_volunteer_certificates_distinct_event_days_check;
alter table public.rye_volunteer_certificates
  add constraint rye_volunteer_certificates_distinct_event_days_check check (distinct_event_days >= 1);

create or replace view public.rye_volunteer_oneoff_billing as
with counts as (
  select
    r.id organizer_request_id,
    r.organization_name,
    r.contact_email,
    count(pl.id) filter (where pl.status='completed' and pl.checked_out_at is not null)::integer successful_placements
  from public.rye_volunteer_organizer_requests r
  left join public.rye_volunteer_opportunities o on o.organizer_request_id=r.id
  left join public.rye_volunteer_placements pl on pl.opportunity_id=o.id
  where r.pipeline='one_off_event'
  group by r.id,r.organization_name,r.contact_email
), calc as (
  select *,case when successful_placements>0 then 800 else 0 end unit_fee_cents
  from counts
), protection as (
  select
    r.id organizer_request_id,
    count(pl.id) filter (
      where pl.status='completed'
        and pl.checked_out_at is not null
        and o.protection_mode='runyourevent'
    )::integer protection_volunteer_days
  from public.rye_volunteer_organizer_requests r
  left join public.rye_volunteer_opportunities o on o.organizer_request_id=r.id
  left join public.rye_volunteer_placements pl on pl.opportunity_id=o.id
  where r.pipeline='one_off_event'
  group by r.id
)
select
  c.organizer_request_id,
  c.organization_name,
  c.contact_email,
  c.successful_placements,
  c.unit_fee_cents,
  (c.successful_placements*c.unit_fee_cents)::integer placement_amount_cents,
  coalesce(p.protection_volunteer_days,0)::integer protection_volunteer_days,
  (coalesce(p.protection_volunteer_days,0)*150)::integer protection_amount_cents,
  (c.successful_placements*c.unit_fee_cents+coalesce(p.protection_volunteer_days,0)*150)::integer total_amount_cents
from calc c
left join protection p on p.organizer_request_id=c.organizer_request_id;

revoke all on public.rye_volunteer_oneoff_billing from anon,authenticated;
