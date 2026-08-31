alter table public.rye_volunteer_organizer_requests
  add column if not exists venue text,
  add column if not exists shift_start_local time,
  add column if not exists shift_end_local time,
  add column if not exists transport_mode text not null default 'independent' check (transport_mode in ('independent','public_transport','local_reimbursement','station_shuttle','organizer_transport')),
  add column if not exists transport_details text,
  add column if not exists transport_ack boolean not null default false,
  add column if not exists commercial_ack boolean not null default false;

alter table public.rye_volunteer_opportunities
  add column if not exists transport_mode text not null default 'independent' check (transport_mode in ('independent','public_transport','local_reimbursement','station_shuttle','organizer_transport')),
  add column if not exists transport_details text,
  add column if not exists event_checkin_code text unique default encode(gen_random_bytes(12),'hex');

alter table public.rye_volunteer_placements
  add column if not exists invite_token_hash text,
  add column if not exists invited_at timestamptz,
  add column if not exists accepted_at timestamptz,
  add column if not exists reconfirmed_at timestamptz,
  add column if not exists billable_at timestamptz;

alter table public.rye_volunteer_placements drop constraint if exists rye_volunteer_placements_status_check;
alter table public.rye_volunteer_placements add constraint rye_volunteer_placements_status_check
  check (status in ('applied','invited','accepted','reconfirmed','checked_in','confirmed','declined','cancelled','completed','no_show'));

create unique index if not exists rye_volunteer_placements_invite_token_hash_key on public.rye_volunteer_placements(invite_token_hash) where invite_token_hash is not null;

create table if not exists public.rye_volunteer_billing_runs (
  id uuid primary key default gen_random_uuid(),
  organizer_request_id uuid not null references public.rye_volunteer_organizer_requests(id) on delete cascade,
  successful_placements integer not null check (successful_placements >= 0),
  unit_fee_cents integer not null check (unit_fee_cents >= 0),
  placement_amount_cents integer not null check (placement_amount_cents >= 0),
  protection_volunteer_days integer not null default 0 check (protection_volunteer_days >= 0),
  protection_amount_cents integer not null default 0 check (protection_amount_cents >= 0),
  total_amount_cents integer not null check (total_amount_cents >= 0),
  status text not null default 'ready' check (status in ('ready','invoicing','sent','paid','cancelled','failed')),
  stripe_invoice_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.rye_volunteer_billing_runs enable row level security;
revoke all on public.rye_volunteer_billing_runs from anon,authenticated;

create or replace function public.rye_submit_volunteer_organizer_request_v3(
  p_organization_name text,p_contact_name text,p_contact_email text,p_phone text,p_city text,p_postal_code text,p_pipeline text,p_event_type text,p_event_name text,p_event_date date,p_season_label text,p_volunteers_needed integer,p_role_examples text,p_notes text,p_responsibility_ack boolean,p_coverage_status text,p_protection_selected boolean,p_protection_ack boolean,
  p_venue text,p_shift_start_local time,p_shift_end_local time,p_transport_mode text,p_transport_details text,p_transport_ack boolean,p_commercial_ack boolean
) returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid; v_required boolean; v_status text;
begin
  if length(trim(coalesce(p_organization_name,''))) < 2 or length(trim(coalesce(p_contact_name,''))) < 2 then raise exception 'missing required fields'; end if;
  if lower(coalesce(p_contact_email,'')) !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then raise exception 'invalid email'; end if;
  if p_pipeline not in ('sports_club','one_off_event') then raise exception 'invalid pipeline'; end if;
  if p_coverage_status not in ('existing_confirmed','not_covered','unknown') then raise exception 'invalid coverage status'; end if;
  if coalesce(p_volunteers_needed,0) < 1 or p_volunteers_needed > 500 then raise exception 'invalid volunteer count'; end if;
  if p_responsibility_ack is not true or p_commercial_ack is not true then raise exception 'required acknowledgements missing'; end if;
  if p_transport_mode not in ('independent','public_transport','local_reimbursement','station_shuttle','organizer_transport') then raise exception 'invalid transport mode'; end if;
  if p_pipeline='one_off_event' then
    if p_event_date is null or p_shift_start_local is null or p_shift_end_local is null or p_shift_end_local <= p_shift_start_local then raise exception 'one-off event date and shift window required'; end if;
    if extract(epoch from (p_shift_end_local-p_shift_start_local))/3600 > 4 or extract(epoch from (p_shift_end_local-p_shift_start_local))/3600 < 2 then raise exception 'micro-shift must be 2 to 4 hours'; end if;
    if length(trim(coalesce(p_venue,''))) < 2 then raise exception 'venue required'; end if;
    if p_transport_ack is not true then raise exception 'transport readiness acknowledgement required'; end if;
  end if;

  v_required := p_coverage_status <> 'existing_confirmed';
  if v_required and (coalesce(p_protection_selected,false) is not true or coalesce(p_protection_ack,false) is not true) then raise exception 'volunteer protection required when equivalent existing coverage is not confirmed'; end if;
  v_status := case when p_coverage_status='existing_confirmed' and coalesce(p_protection_selected,false)=false then 'existing_coverage' when v_required then 'required_pending' else 'selected_pending' end;

  insert into public.rye_volunteer_organizer_requests(
    organization_name,contact_name,contact_email,phone,city,postal_code,pipeline,event_type,event_name,event_date,season_label,volunteers_needed,role_examples,notes,responsibility_ack,
    coverage_status,protection_selected,protection_required,protection_ack,protection_price_cents,protection_status,
    venue,shift_start_local,shift_end_local,transport_mode,transport_details,transport_ack,commercial_ack
  ) values (
    left(trim(p_organization_name),160),left(trim(p_contact_name),120),left(lower(trim(p_contact_email)),254),nullif(left(trim(coalesce(p_phone,'')),60),''),left(trim(p_city),120),nullif(left(trim(coalesce(p_postal_code,'')),30),''),p_pipeline,nullif(left(trim(coalesce(p_event_type,'')),120),''),nullif(left(trim(coalesce(p_event_name,'')),160),''),p_event_date,nullif(left(trim(coalesce(p_season_label,'')),100),''),p_volunteers_needed,nullif(left(trim(coalesce(p_role_examples,'')),1500),''),nullif(left(trim(coalesce(p_notes,'')),2000),''),true,
    p_coverage_status,coalesce(p_protection_selected,false),v_required,coalesce(p_protection_ack,false),150,v_status,
    nullif(left(trim(coalesce(p_venue,'')),240),''),p_shift_start_local,p_shift_end_local,p_transport_mode,nullif(left(trim(coalesce(p_transport_details,'')),1000),''),coalesce(p_transport_ack,false),true
  ) returning id into v_id;
  return v_id;
end $$;
grant execute on function public.rye_submit_volunteer_organizer_request_v3(text,text,text,text,text,text,text,text,text,date,text,integer,text,text,boolean,text,boolean,boolean,text,time,time,text,text,boolean,boolean) to anon,authenticated;

create or replace function public.rye_admin_create_volunteer_opportunity(
  p_token text,p_request_id uuid,p_title text,p_event_day date,p_shift_start timestamptz,p_shift_end timestamptz,p_slots integer,p_role_description text,p_venue text,p_transport_mode text,p_transport_details text
) returns uuid language plpgsql security definer set search_path=public as $$
declare v_valid boolean; v_id uuid; v_r public.rye_volunteer_organizer_requests%rowtype;
begin
  select public.rye_admin_session_valid(p_token) into v_valid; if coalesce(v_valid,false) is not true then raise exception 'unauthorized'; end if;
  select * into v_r from public.rye_volunteer_organizer_requests where id=p_request_id; if not found then raise exception 'organizer request not found'; end if;
  if p_shift_end<=p_shift_start or extract(epoch from (p_shift_end-p_shift_start))/3600 not between 2 and 4 then raise exception 'shift must be 2 to 4 hours'; end if;
  if p_transport_mode not in ('independent','public_transport','local_reimbursement','station_shuttle','organizer_transport') then raise exception 'invalid transport mode'; end if;
  insert into public.rye_volunteer_opportunities(organizer_request_id,title,organization_name,event_name,city,venue,event_day,shift_start,shift_end,min_age,slots_total,role_description,transport_mode,transport_details,protection_mode,protection_status,status)
  values(v_r.id,left(trim(p_title),160),v_r.organization_name,v_r.event_name,v_r.city,nullif(left(trim(coalesce(p_venue,'')),240),''),p_event_day,p_shift_start,p_shift_end,16,p_slots,left(trim(p_role_description),1500),p_transport_mode,nullif(left(trim(coalesce(p_transport_details,'')),1000),''),case when v_r.protection_selected then 'runyourevent' else 'organizer_existing' end,case when v_r.protection_selected then 'pending' else 'not_required' end,'open') returning id into v_id;
  update public.rye_volunteer_organizer_requests set status='active',updated_at=now() where id=v_r.id;
  return v_id;
end $$;
grant execute on function public.rye_admin_create_volunteer_opportunity(text,uuid,text,date,timestamptz,timestamptz,integer,text,text,text,text) to anon,authenticated;

create or replace function public.rye_admin_invite_volunteer(p_token text,p_opportunity_id uuid,p_volunteer_id uuid)
returns text language plpgsql security definer set search_path=public as $$
declare v_valid boolean; v_raw text; v_hash text;
begin
  select public.rye_admin_session_valid(p_token) into v_valid; if coalesce(v_valid,false) is not true then raise exception 'unauthorized'; end if;
  v_raw:=encode(gen_random_bytes(24),'hex'); v_hash:=encode(digest(v_raw,'sha256'),'hex');
  insert into public.rye_volunteer_placements(opportunity_id,volunteer_profile_id,status,event_day,invite_token_hash,invited_at)
  select o.id,p_volunteer_id,'invited',o.event_day,v_hash,now() from public.rye_volunteer_opportunities o where o.id=p_opportunity_id
  on conflict(opportunity_id,volunteer_profile_id) do update set status='invited',invite_token_hash=v_hash,invited_at=now(),accepted_at=null,reconfirmed_at=null,checked_in_at=null,checked_out_at=null,billable_at=null,updated_at=now();
  return v_raw;
end $$;
grant execute on function public.rye_admin_invite_volunteer(text,uuid,uuid) to anon,authenticated;

create or replace function public.rye_volunteer_invite_lookup(p_invite_token text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_hash text; v_result jsonb;
begin
  v_hash:=encode(digest(coalesce(p_invite_token,''),'sha256'),'hex');
  select jsonb_build_object('placementId',pl.id,'status',pl.status,'acceptedAt',pl.accepted_at,'reconfirmedAt',pl.reconfirmed_at,'checkedInAt',pl.checked_in_at,'checkedOutAt',pl.checked_out_at,'eventDay',pl.event_day,
    'volunteer',jsonb_build_object('firstName',p.first_name,'lastName',p.last_name),
    'opportunity',jsonb_build_object('id',o.id,'title',o.title,'organizationName',o.organization_name,'eventName',o.event_name,'city',o.city,'venue',o.venue,'eventDay',o.event_day,'shiftStart',o.shift_start,'shiftEnd',o.shift_end,'roleDescription',o.role_description,'transportMode',o.transport_mode,'transportDetails',o.transport_details))
  into v_result from public.rye_volunteer_placements pl join public.rye_volunteer_profiles p on p.id=pl.volunteer_profile_id join public.rye_volunteer_opportunities o on o.id=pl.opportunity_id where pl.invite_token_hash=v_hash;
  if v_result is null then raise exception 'invalid invitation'; end if; return v_result;
end $$;
grant execute on function public.rye_volunteer_invite_lookup(text) to anon,authenticated;

create or replace function public.rye_volunteer_respond_invite(p_invite_token text,p_action text)
returns text language plpgsql security definer set search_path=public as $$
declare v_hash text; v_status text;
begin
  if p_action not in ('accept','decline','reconfirm') then raise exception 'invalid action'; end if;
  v_hash:=encode(digest(coalesce(p_invite_token,''),'sha256'),'hex');
  if p_action='accept' then update public.rye_volunteer_placements set status='accepted',accepted_at=now(),updated_at=now() where invite_token_hash=v_hash and status in ('invited','applied') returning status into v_status;
  elsif p_action='decline' then update public.rye_volunteer_placements set status='declined',updated_at=now() where invite_token_hash=v_hash and status not in ('completed','cancelled') returning status into v_status;
  else update public.rye_volunteer_placements set status='reconfirmed',reconfirmed_at=now(),updated_at=now() where invite_token_hash=v_hash and status in ('accepted','reconfirmed') returning status into v_status; end if;
  if v_status is null then raise exception 'invitation state does not allow this action'; end if; return v_status;
end $$;
grant execute on function public.rye_volunteer_respond_invite(text,text) to anon,authenticated;

create or replace function public.rye_volunteer_event_status(p_invite_token text,p_event_code text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_hash text; v_result jsonb;
begin
  v_hash:=encode(digest(coalesce(p_invite_token,''),'sha256'),'hex');
  select jsonb_build_object('placementId',pl.id,'status',pl.status,'checkedInAt',pl.checked_in_at,'checkedOutAt',pl.checked_out_at,'title',o.title,'organizationName',o.organization_name,'shiftStart',o.shift_start,'shiftEnd',o.shift_end,'venue',o.venue)
  into v_result from public.rye_volunteer_placements pl join public.rye_volunteer_opportunities o on o.id=pl.opportunity_id where pl.invite_token_hash=v_hash and o.event_checkin_code=p_event_code;
  if v_result is null then raise exception 'shift not found'; end if; return v_result;
end $$;
grant execute on function public.rye_volunteer_event_status(text,text) to anon,authenticated;

create or replace function public.rye_volunteer_event_action(p_invite_token text,p_event_code text,p_action text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_hash text; v_pl public.rye_volunteer_placements%rowtype; v_now timestamptz:=now(); v_minutes integer;
begin
  if p_action not in ('check_in','check_out') then raise exception 'invalid action'; end if;
  v_hash:=encode(digest(coalesce(p_invite_token,''),'sha256'),'hex');
  select pl.* into v_pl from public.rye_volunteer_placements pl join public.rye_volunteer_opportunities o on o.id=pl.opportunity_id where pl.invite_token_hash=v_hash and o.event_checkin_code=p_event_code for update;
  if not found then raise exception 'shift not found'; end if;
  if p_action='check_in' then
    if v_pl.status not in ('accepted','reconfirmed','confirmed') or v_pl.checked_in_at is not null then raise exception 'check-in not available'; end if;
    update public.rye_volunteer_placements set status='checked_in',checked_in_at=v_now,billable_at=v_now,updated_at=v_now where id=v_pl.id;
  else
    if v_pl.checked_in_at is null or v_pl.checked_out_at is not null then raise exception 'check-out not available'; end if;
    v_minutes:=greatest(1,least(720,floor(extract(epoch from (v_now-v_pl.checked_in_at))/60)::integer));
    update public.rye_volunteer_placements set status='completed',checked_out_at=v_now,verified_minutes=v_minutes,updated_at=v_now where id=v_pl.id;
  end if;
  return public.rye_volunteer_event_status(p_invite_token,p_event_code);
end $$;
grant execute on function public.rye_volunteer_event_action(text,text,text) to anon,authenticated;

create or replace view public.rye_volunteer_oneoff_billing as
with counts as (
  select r.id organizer_request_id,r.organization_name,r.contact_email,count(pl.id) filter (where pl.billable_at is not null)::integer successful_placements
  from public.rye_volunteer_organizer_requests r
  left join public.rye_volunteer_opportunities o on o.organizer_request_id=r.id
  left join public.rye_volunteer_placements pl on pl.opportunity_id=o.id
  where r.pipeline='one_off_event'
  group by r.id,r.organization_name,r.contact_email
), calc as (
  select *,case when successful_placements between 1 and 5 then 2500 when successful_placements between 6 and 15 then 2000 when successful_placements>=16 then 1500 else 0 end unit_fee_cents from counts
), protection as (
  select r.id organizer_request_id,count(pl.id) filter (where pl.billable_at is not null and o.protection_mode='runyourevent')::integer protection_volunteer_days
  from public.rye_volunteer_organizer_requests r left join public.rye_volunteer_opportunities o on o.organizer_request_id=r.id left join public.rye_volunteer_placements pl on pl.opportunity_id=o.id where r.pipeline='one_off_event' group by r.id
)
select c.organizer_request_id,c.organization_name,c.contact_email,c.successful_placements,c.unit_fee_cents,(c.successful_placements*c.unit_fee_cents)::integer placement_amount_cents,coalesce(p.protection_volunteer_days,0)::integer protection_volunteer_days,(coalesce(p.protection_volunteer_days,0)*150)::integer protection_amount_cents,(c.successful_placements*c.unit_fee_cents+coalesce(p.protection_volunteer_days,0)*150)::integer total_amount_cents
from calc c left join protection p on p.organizer_request_id=c.organizer_request_id;
revoke all on public.rye_volunteer_oneoff_billing from anon,authenticated;

create or replace function public.rye_admin_finalize_volunteer_billing(p_token text,p_request_id uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_valid boolean; v_b record; v_id uuid;
begin
  select public.rye_admin_session_valid(p_token) into v_valid; if coalesce(v_valid,false) is not true then raise exception 'unauthorized'; end if;
  select * into v_b from public.rye_volunteer_oneoff_billing where organizer_request_id=p_request_id; if not found or v_b.successful_placements<1 then raise exception 'no billable attendance'; end if;
  insert into public.rye_volunteer_billing_runs(organizer_request_id,successful_placements,unit_fee_cents,placement_amount_cents,protection_volunteer_days,protection_amount_cents,total_amount_cents)
  values(p_request_id,v_b.successful_placements,v_b.unit_fee_cents,v_b.placement_amount_cents,v_b.protection_volunteer_days,v_b.protection_amount_cents,v_b.total_amount_cents) returning id into v_id;
  return v_id;
end $$;
grant execute on function public.rye_admin_finalize_volunteer_billing(text,uuid) to anon,authenticated;
