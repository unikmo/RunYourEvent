-- Corporate packages have a distinct agreed commercial record; no €10 default.
create table public.rye_corporate_bookings (
 id uuid primary key default gen_random_uuid(),
 opportunity_id uuid not null unique references public.rye_volunteer_opportunities(id),
 agreed_amount_cents integer not null check(agreed_amount_cents between 1 and 100000000),
 agreement_reference text not null check(length(agreement_reference) between 4 and 240),
 status text not null default 'agreed' check(status in ('agreed','completed','cancelled')),
 agreed_at timestamptz not null default now()
);
alter table public.rye_corporate_bookings enable row level security;
revoke all on public.rye_corporate_bookings from public,anon,authenticated;

-- Founder operations are restricted to recruitment, verified fulfilment and exceptions.
-- All operations require an independently validated admin session; no direct table grants.

-- Shared internal verification helper, callable only by trusted wrappers.
alter table public.rye_corporate_bookings add column access_token_hash text unique;

-- Corrections preserve both the evidence reason and the original attendance timestamps.
alter table public.rye_attendance_audit
 add column reason text check(reason is null or length(trim(reason)) between 10 and 3000),
 add column event_type text not null default 'verification' check(event_type in ('verification','correction')),
 add column previous_checked_in_at timestamptz,
 add column previous_checked_out_at timestamptz,
 add column checked_in_at timestamptz,
 add column checked_out_at timestamptz;

create function public.rye_record_verified_placement(p_placement_id uuid,p_minutes integer) returns boolean
language plpgsql security definer set search_path=public,extensions as $$
declare v_pl public.rye_volunteer_placements%rowtype; v_o public.rye_volunteer_opportunities%rowtype; v_limit integer;
begin
 select * into v_pl from rye_volunteer_placements where id=p_placement_id;
 if not found then raise exception 'Placement not found'; end if;
 -- Serialize verification across different placements for the same person.
 perform 1 from rye_volunteer_profiles where id=v_pl.volunteer_profile_id for update;
 select * into v_pl from rye_volunteer_placements where id=p_placement_id for update;
 select * into v_o from rye_volunteer_opportunities where id=v_pl.opportunity_id;
 if v_pl.status<>'completed' or v_pl.checked_in_at is null or v_pl.checked_out_at is null then raise exception 'Check-in and check-out are required before verification'; end if;
 v_limit:=greatest(0,least(480,floor(extract(epoch from (least(v_pl.checked_out_at,v_o.shift_end)-greatest(v_pl.checked_in_at,v_o.shift_start)))/60)::integer-coalesce(v_o.break_minutes,0)));
 if p_minutes is null or p_minutes<0 or p_minutes>v_limit then raise exception 'Verified minutes must fit actual attendance, the scheduled window and the eight-hour maximum'; end if;
 if p_minutes>0 and exists(select 1 from rye_volunteer_placements p where p.volunteer_profile_id=v_pl.volunteer_profile_id and p.id<>v_pl.id and p.organizer_verified and p.status='completed' and p.checked_in_at is not null and p.checked_out_at is not null and tstzrange(p.checked_in_at,p.checked_out_at,'[)') && tstzrange(v_pl.checked_in_at,v_pl.checked_out_at,'[)')) then raise exception 'This attendance overlaps already verified time'; end if;
 insert into rye_attendance_audit(placement_id,previous_minutes,verified_minutes) values(v_pl.id,v_pl.verified_minutes,p_minutes);
 update rye_volunteer_placements set verified_minutes=p_minutes,organizer_verified=true,verified_at=now(),updated_at=now() where id=v_pl.id;
 -- Corrections cannot leave a certificate claiming a milestone no longer supported.
 update rye_volunteer_certificates c set revoked_at=now() where c.volunteer_profile_id=v_pl.volunteer_profile_id and c.revoked_at is null and (select credited_minutes from rye_volunteer_progress where volunteer_profile_id=v_pl.volunteer_profile_id)<case c.tier when 'gold' then 3600 when 'silver' then 2400 else 1200 end;
 return true;
end $$;
revoke all on function public.rye_record_verified_placement(uuid,integer) from public,anon,authenticated;

create function public.rye_admin_community_dashboard(p_token text) returns jsonb
language plpgsql stable security definer set search_path=public,extensions as $$
begin
 if public.rye_admin_session_valid(p_token) is not true then raise exception 'Unauthorized'; end if;
 return jsonb_build_object(
  'needs',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from (select n.*,coalesce((select sum(a.amount_cents) from rye_funding_allocations a where a.need_id=n.id),0) funded_cents from rye_seasonal_needs n order by n.created_at desc limit 500) x),'[]'),
  'sponsors',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from (select * from rye_sponsor_enquiries order by created_at desc limit 500) x),'[]'),
  'campaigns',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from (select c.*,
   coalesce((select sum(a.amount_cents) from rye_funding_allocations a where a.campaign_id=c.id),0) allocated_cents,
   coalesce((select sum(pf.fee_cents) from rye_placement_funding pf join rye_funding_allocations a on a.id=pf.allocation_id where a.campaign_id=c.id),0) used_cents,
   (select count(*) from rye_placement_funding pf join rye_funding_allocations a on a.id=pf.allocation_id join rye_volunteer_placements pl on pl.id=pf.placement_id where a.campaign_id=c.id and pl.status='completed') completed_placements,
   (select count(*) from rye_placement_funding pf join rye_funding_allocations a on a.id=pf.allocation_id join rye_volunteer_placements pl on pl.id=pf.placement_id where a.campaign_id=c.id and pl.status='completed' and pl.organizer_verified) verified_placements,
   coalesce((select sum(pl.verified_minutes) from rye_placement_funding pf join rye_funding_allocations a on a.id=pf.allocation_id join rye_volunteer_placements pl on pl.id=pf.placement_id where a.campaign_id=c.id and pl.status='completed' and pl.organizer_verified),0) verified_minutes
   from rye_sponsor_campaigns c order by c.created_at desc limit 500) x),'[]'),
  'rewards',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from (select r.*,(select count(*) from rye_reward_redemptions d where d.reward_id=r.id and d.status<>'cancelled') redeemed_count from rye_milestone_rewards r order by r.created_at desc limit 500) x),'[]'),
  'certificates',coalesce((select jsonb_agg(to_jsonb(x) order by x.issued_at desc) from (select c.*,p.first_name,p.last_name from rye_volunteer_certificates c join rye_volunteer_profiles p on p.id=c.volunteer_profile_id order by c.issued_at desc limit 500) x),'[]'),
  'placements',coalesce((select jsonb_agg(to_jsonb(x) order by x.event_day desc) from (select pl.*,p.first_name,p.last_name,o.title,o.title opportunity_title,o.organization_name from rye_volunteer_placements pl join rye_volunteer_profiles p on p.id=pl.volunteer_profile_id join rye_volunteer_opportunities o on o.id=pl.opportunity_id order by pl.event_day desc limit 1000) x),'[]'),
  'volunteers',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from (select p.id,p.first_name,p.last_name,p.email,p.city,p.status,p.created_at,v.credited_minutes from rye_volunteer_profiles p join rye_volunteer_progress v on v.volunteer_profile_id=p.id order by p.created_at desc limit 1000) x),'[]'),
  'corporateBookings',coalesce((select jsonb_agg(to_jsonb(x) order by x.agreed_at desc) from (select b.*,o.title,o.organization_name from rye_corporate_bookings b join rye_volunteer_opportunities o on o.id=b.opportunity_id order by b.agreed_at desc limit 500) x),'[]'),
  'issues',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from (select i.*,o.title,p.first_name from rye_volunteer_issues i join rye_volunteer_placements pl on pl.id=i.placement_id join rye_volunteer_opportunities o on o.id=pl.opportunity_id join rye_volunteer_profiles p on p.id=pl.volunteer_profile_id order by i.created_at desc limit 500) x),'[]'),
  'opportunities',coalesce((select jsonb_agg(to_jsonb(x) order by x.event_day desc) from (select o.id,o.title,o.organization_name,o.event_day,o.seasonal_need_id,o.activity_format,o.status from rye_volunteer_opportunities o order by o.event_day desc limit 1000) x),'[]')
 );
end $$;
revoke all on function public.rye_admin_community_dashboard(text) from public,anon,authenticated;
grant execute on function public.rye_admin_community_dashboard(text) to anon,authenticated;

create function public.rye_admin_community_action(p_token text,p_action text,p_payload jsonb) returns jsonb
language plpgsql security definer set search_path=public,extensions as $$
declare b jsonb:=p_payload; v_id uuid; v_c rye_sponsor_campaigns%rowtype; v_n rye_seasonal_needs%rowtype;
 v_a rye_funding_allocations%rowtype; v_pl rye_volunteer_placements%rowtype; v_o rye_volunteer_opportunities%rowtype;
 v_r rye_milestone_rewards%rowtype; v_progress rye_volunteer_progress%rowtype;
 v_used bigint; v_funded bigint; v_amount integer; v_minutes integer; v_tier text; v_signed timestamptz; v_redeemed uuid;
 v_checked_in timestamptz; v_checked_out timestamptz; v_correction_reason text; v_sponsor_token text; v_corporate_token text;
begin
 if public.rye_admin_session_valid(p_token) is not true then raise exception 'Unauthorized'; end if;
 if p_action is null or jsonb_typeof(b)<>'object' then raise exception 'Invalid operation'; end if;
 if p_action='approve_need' then
  update rye_seasonal_needs set status='requested' where id=(b->>'id')::uuid and status='pending' returning id into v_id;
  if v_id is null then raise exception 'Pending need not found'; end if;
 elsif p_action='activate_corporate' then
  select * into v_o from rye_volunteer_opportunities where id=(b->>'opportunityId')::uuid for update;
  if not found or v_o.activity_format<>'corporate' or v_o.status<>'draft' or v_o.shift_start<=now() then raise exception 'A future draft corporate project is required'; end if;
  if v_o.protection_status not in ('active','not_required') or coalesce(length(trim(v_o.safeguarding_notes)),0)<5 or coalesce(length(trim(v_o.briefing_notes)),0)<2 then raise exception 'Confirm project safety, supervision and volunteer coverage before activation'; end if;
  v_amount:=(b->>'agreedAmountCents')::integer;
  if v_amount is null or v_amount not between 1 and 100000000 or coalesce(length(trim(b->>'agreementReference')),0) not between 4 and 240 then raise exception 'Record the agreed project price and actual agreement reference'; end if;
  v_corporate_token:=encode(extensions.gen_random_bytes(24),'hex');
  insert into rye_corporate_bookings(opportunity_id,agreed_amount_cents,agreement_reference,access_token_hash) values(v_o.id,v_amount,trim(b->>'agreementReference'),encode(extensions.digest(v_corporate_token,'sha256'),'hex')) returning id into v_id;
  update rye_volunteer_opportunities set status='open',updated_at=now() where id=v_o.id;
 elsif p_action='resolve_issue' then
  update rye_volunteer_issues set status='resolved' where id=(b->>'id')::uuid and status='open' returning id into v_id;
  if v_id is null then raise exception 'Open issue not found'; end if;
 elsif p_action='create_campaign' then
  if length(trim(coalesce(b->>'sponsorName','')))<2 or length(b->>'sponsorName')>160 or coalesce((b->>'budgetCents')::integer,0)<1000 or (b->>'endDate')::date<(b->>'startDate')::date then raise exception 'Enter an agreed sponsor, budget and valid campaign dates'; end if;
  v_sponsor_token:=encode(extensions.gen_random_bytes(24),'hex');
  insert into rye_sponsor_campaigns(sponsor_name,budget_cents,starts_on,ends_on,access_token_hash) values(trim(b->>'sponsorName'),(b->>'budgetCents')::integer,(b->>'startDate')::date,(b->>'endDate')::date,encode(extensions.digest(v_sponsor_token,'sha256'),'hex')) returning id into v_id;
 elsif p_action='allocate_funding' then
  v_amount:=(b->>'amountCents')::integer;
  select * into v_c from rye_sponsor_campaigns where id=(b->>'campaignId')::uuid for update;
  if not found or v_c.status<>'active' or v_c.ends_on<current_date then raise exception 'Active campaign not found'; end if;
  select * into v_n from rye_seasonal_needs where id=(b->>'needId')::uuid for update;
  if not found or v_n.status in ('pending','cancelled','completed','verified') then raise exception 'This club need cannot receive funding'; end if;
  if v_n.season_end<v_c.starts_on or v_n.season_start>v_c.ends_on then raise exception 'The campaign and club season do not overlap'; end if;
  select coalesce(sum(amount_cents),0) into v_used from rye_funding_allocations where campaign_id=v_c.id;
  select coalesce(sum(amount_cents),0) into v_funded from rye_funding_allocations where need_id=v_n.id;
  if v_amount is null or v_amount<1000 or v_used+v_amount>v_c.budget_cents then raise exception 'Allocation exceeds the available campaign budget'; end if;
  if v_funded+v_amount>v_n.funding_target_cents then raise exception 'Allocation exceeds the remaining club need'; end if;
  if not v_n.partial_funding and v_funded+v_amount<>v_n.funding_target_cents then raise exception 'This club accepts full funding only'; end if;
  insert into rye_funding_allocations(campaign_id,need_id,amount_cents) values(v_c.id,v_n.id,v_amount)
   on conflict(campaign_id,need_id) do update set amount_cents=rye_funding_allocations.amount_cents+excluded.amount_cents returning id into v_id;
  if v_funded+v_amount=v_n.funding_target_cents and v_n.status in ('requested','funded') then update rye_seasonal_needs set status='funded' where id=v_n.id; end if;
 elsif p_action='create_reward' then
  v_tier:=b->>'tier';
  if v_tier not in ('bronze','silver','gold') or length(trim(coalesce(b->>'title','')))<2 or length(b->>'title')>240 or coalesce((b->>'quantity')::integer,0)<1 or (b->>'expiresOn')::date<current_date then raise exception 'Enter a funded reward, quantity, tier and expiry'; end if;
  insert into rye_milestone_rewards(title,tier,quantity,expires_on,delivery_details,delivery_mode) values(trim(b->>'title'),v_tier,(b->>'quantity')::integer,(b->>'expiresOn')::date,nullif(left(trim(b->>'deliveryDetails'),3000),''),coalesce(b->>'deliveryMode','manual')) returning id into v_id;
 elsif p_action='issue_certificate' then
  v_tier:=b->>'tier'; v_minutes:=case v_tier when 'bronze' then 1200 when 'silver' then 2400 when 'gold' then 3600 else null end;
  if v_minutes is null then raise exception 'Invalid certificate tier'; end if;
  perform 1 from rye_volunteer_profiles where id=(b->>'volunteerId')::uuid for update;
  select * into v_progress from rye_volunteer_progress where volunteer_profile_id=(b->>'volunteerId')::uuid;
  if not found or v_progress.credited_minutes<v_minutes then raise exception 'This milestone requires more verified hours'; end if;
  v_signed:=nullif(b->>'handSignedAt','')::timestamptz;
  if v_tier='gold' and (v_signed is null or v_signed>now() or length(trim(coalesce(b->>'signerName','')))<2) then raise exception 'Gold issuance requires the actual hand-signature date and signer name'; end if;
  insert into rye_volunteer_certificates(volunteer_profile_id,period_label,credited_minutes,points,distinct_event_days,tier,hand_signed_at,signer_name)
  values(v_progress.volunteer_profile_id,'lifetime-'||v_tier,v_progress.credited_minutes,v_progress.points,v_progress.distinct_event_days,v_tier,case when v_tier='gold' then v_signed end,case when v_tier='gold' then left(trim(b->>'signerName'),120) end)
  on conflict(volunteer_profile_id,period_label) do update set credited_minutes=excluded.credited_minutes,points=excluded.points,distinct_event_days=excluded.distinct_event_days,hand_signed_at=excluded.hand_signed_at,signer_name=excluded.signer_name,revoked_at=null,issued_at=now() returning id into v_id;
 elsif p_action='revoke_certificate' then
  update rye_volunteer_certificates set revoked_at=now() where id=(b->>'id')::uuid and revoked_at is null returning id into v_id;
  if v_id is null then raise exception 'Active certificate not found'; end if;
 elsif p_action='correct_attendance' then
  -- Read identity first, then take locks in the same order as normal verification.
  select * into v_pl from rye_volunteer_placements where id=(b->>'id')::uuid;
  if not found then raise exception 'Placement not found'; end if;
  perform 1 from rye_volunteer_profiles where id=v_pl.volunteer_profile_id for update;
  select * into v_pl from rye_volunteer_placements where id=(b->>'id')::uuid for update;
  if not found then raise exception 'Placement not found'; end if;
  select * into v_o from rye_volunteer_opportunities where id=v_pl.opportunity_id;
  v_checked_in:=nullif(b->>'checkedInAt','')::timestamptz;
  v_checked_out:=nullif(b->>'checkedOutAt','')::timestamptz;
  v_minutes:=(b->>'minutes')::integer;
  v_correction_reason:=trim(coalesce(b->>'reason',''));
  if length(v_correction_reason) not between 10 and 3000 then raise exception 'Record the evidence and a correction reason of 10–3000 characters'; end if;
  if v_checked_in is null or v_checked_out is null or v_checked_out<v_checked_in or v_checked_in>now() or v_checked_out>now() or v_checked_in<v_o.shift_start or v_checked_out>v_o.shift_end or v_checked_out-v_checked_in>interval '8 hours' then raise exception 'Corrected attendance must be in the past, within the scheduled activity and no longer than eight hours'; end if;
  if v_minutes is null or v_minutes not between 0 and 480 then raise exception 'Enter actual verified minutes from 0 to 480, excluding breaks'; end if;
  update rye_volunteer_placements set status='completed',checked_in_at=v_checked_in,checked_out_at=v_checked_out,organizer_verified=false,verified_minutes=0,updated_at=now() where id=v_pl.id;
  -- Any failure rolls back the timestamp change as part of this same transaction.
  perform rye_record_verified_placement(v_pl.id,v_minutes);
  insert into rye_attendance_audit(placement_id,previous_minutes,verified_minutes,reason,event_type,previous_checked_in_at,previous_checked_out_at,checked_in_at,checked_out_at)
  values(v_pl.id,v_pl.verified_minutes,v_minutes,v_correction_reason,'correction',v_pl.checked_in_at,v_pl.checked_out_at,v_checked_in,v_checked_out);
  v_id:=v_pl.id;
 elsif p_action='verify_placement' then
  perform rye_record_verified_placement((b->>'id')::uuid,(b->>'minutes')::integer); v_id:=(b->>'id')::uuid;
 elsif p_action='link_opportunity' then
  select * into v_n from rye_seasonal_needs where id=(b->>'needId')::uuid for update;
  if not found or v_n.status in ('pending','cancelled') then raise exception 'Published seasonal need not found'; end if;
  select * into v_o from rye_volunteer_opportunities where id=(b->>'opportunityId')::uuid for update;
  if not found then raise exception 'Activity not found'; end if;
  if v_o.seasonal_need_id is not null and v_o.seasonal_need_id<>v_n.id then raise exception 'Activity already belongs to another seasonal need'; end if;
  if lower(trim(v_o.organization_name))<>lower(trim(v_n.organization_name)) or lower(trim(v_o.city))<>lower(trim(v_n.city)) or v_o.activity_format<>v_n.activity_format or v_o.event_day not between v_n.season_start and v_n.season_end then raise exception 'Activity club, city, format and date must match the seasonal need'; end if;
  update rye_volunteer_opportunities set seasonal_need_id=v_n.id where id=v_o.id; v_id:=v_o.id;
 elsif p_action='redeem_reward' then
  select * into v_r from rye_milestone_rewards where id=(b->>'rewardId')::uuid for update;
  if not found or not v_r.active or v_r.expires_on<current_date then raise exception 'Reward is not currently available'; end if;
  perform 1 from rye_volunteer_profiles where id=(b->>'volunteerId')::uuid for update;
  select * into v_progress from rye_volunteer_progress where volunteer_profile_id=(b->>'volunteerId')::uuid;
  if not found or v_progress.credited_minutes<(case v_r.tier when 'gold' then 3600 when 'silver' then 2400 else 1200 end) then raise exception 'Volunteer has not reached this milestone'; end if;
  select id into v_redeemed from rye_reward_redemptions where reward_id=v_r.id and volunteer_profile_id=v_progress.volunteer_profile_id and status<>'cancelled';
  if v_redeemed is not null then
   update rye_reward_redemptions set status='fulfilled' where id=v_redeemed;
   return jsonb_build_object('id',v_redeemed,'fulfilled',true);
  end if;
  select count(*) into v_used from rye_reward_redemptions where reward_id=v_r.id and status<>'cancelled';
  if v_used>=v_r.quantity then raise exception 'This reward has been fully allocated'; end if;
  insert into rye_reward_redemptions(reward_id,volunteer_profile_id,status) values(v_r.id,v_progress.volunteer_profile_id,'fulfilled')
  on conflict(reward_id,volunteer_profile_id) do update set status='fulfilled',created_at=now() returning id into v_id;
 elsif p_action='reserve_placement_funding' then
  select * into v_a from rye_funding_allocations where id=(b->>'allocationId')::uuid for update;
  if not found then raise exception 'Funding allocation not found'; end if;
  select * into v_c from rye_sponsor_campaigns where id=v_a.campaign_id;
  select * into v_pl from rye_volunteer_placements where id=(b->>'placementId')::uuid for update;
  if not found or v_pl.status in ('cancelled','declined','no_show') then raise exception 'Active placement not found'; end if;
  select * into v_o from rye_volunteer_opportunities where id=v_pl.opportunity_id;
  if v_o.seasonal_need_id is distinct from v_a.need_id or v_c.status<>'active' or v_o.event_day not between v_c.starts_on and v_c.ends_on then raise exception 'Campaign does not cover this placement'; end if;
  if exists(select 1 from rye_placement_funding where placement_id=v_pl.id) then raise exception 'This placement already has a funding assignment'; end if;
  if v_o.organizer_request_id is not null then
   perform 1 from rye_volunteer_organizer_requests where id=v_o.organizer_request_id for update;
   if exists(select 1 from rye_volunteer_billing_runs where organizer_request_id=v_o.organizer_request_id and status in ('invoicing','sent','paid')) then raise exception 'Club billing has already started; funding cannot be changed'; end if;
  end if;
  select coalesce(sum(fee_cents),0) into v_used from rye_placement_funding where allocation_id=v_a.id;
  if v_used+1000>v_a.amount_cents then raise exception 'Allocation has no remaining placement-fee budget'; end if;
  insert into rye_placement_funding(placement_id,allocation_id) values(v_pl.id,v_a.id); v_id:=v_pl.id;
 else raise exception 'Unsupported community operation';
 end if;
 return jsonb_build_object('id',v_id,'action',p_action,'sponsorToken',v_sponsor_token,'corporateToken',v_corporate_token);
end $$;
revoke all on function public.rye_admin_community_action(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.rye_admin_community_action(text,text,jsonb) to anon,authenticated;

create or replace function public.rye_sponsor_report(p_token text) returns jsonb
language plpgsql stable security definer set search_path=public,extensions as $$
declare v_result jsonb;
begin
 v_result:=rye_campaign_report(p_token);
 if v_result is not null then return v_result; end if;
 select jsonb_build_object('sponsor_name',o.organization_name||' · employee project','budget_cents',b.agreed_amount_cents,'allocated_cents',b.agreed_amount_cents,'reserved_cents',0,
 'completed_placements',(select count(*) from rye_volunteer_placements p where p.opportunity_id=o.id and p.status='completed'),
 'verified_placements',(select count(*) from rye_volunteer_placements p where p.opportunity_id=o.id and p.status='completed' and p.organizer_verified),
 'verified_minutes',coalesce((select sum(p.verified_minutes) from rye_volunteer_placements p where p.opportunity_id=o.id and p.status='completed' and p.organizer_verified),0),
 'needs',jsonb_build_array(jsonb_build_object('title',o.title,'organization_name',o.organization_name,'allocated_cents',b.agreed_amount_cents,
 'completed_placements',(select count(*) from rye_volunteer_placements p where p.opportunity_id=o.id and p.status='completed'),
 'verified_minutes',coalesce((select sum(p.verified_minutes) from rye_volunteer_placements p where p.opportunity_id=o.id and p.status='completed' and p.organizer_verified),0))))
 into v_result from rye_corporate_bookings b join rye_volunteer_opportunities o on o.id=b.opportunity_id where length(p_token)=48 and b.access_token_hash=encode(extensions.digest(p_token,'sha256'),'hex');
 return v_result;
end $$;
revoke all on function public.rye_sponsor_report(text) from public,anon,authenticated;
grant execute on function public.rye_sponsor_report(text) to anon,authenticated;

-- Re-inviting must never erase existing attendance, verified hours or a live acceptance.
create or replace function public.rye_admin_invite_volunteer(p_token text,p_opportunity_id uuid,p_volunteer_id uuid)
returns text language plpgsql security definer set search_path=public,extensions as $$
declare v_raw text:=encode(extensions.gen_random_bytes(24),'hex'); v_rows integer;
begin
 if rye_admin_session_valid(p_token) is not true then raise exception 'Unauthorized'; end if;
 perform 1 from rye_volunteer_profiles where id=p_volunteer_id and status='active' for update;
 if not found then raise exception 'Active volunteer not found'; end if;
 perform 1 from rye_volunteer_opportunities where id=p_opportunity_id and status='open' and shift_start>now() for update;
 if not found then raise exception 'Open future activity not found'; end if;
 insert into rye_volunteer_placements(opportunity_id,volunteer_profile_id,status,event_day,invite_token_hash,invited_at)
 select o.id,p_volunteer_id,'invited',o.event_day,encode(extensions.digest(v_raw,'sha256'),'hex'),now() from rye_volunteer_opportunities o where o.id=p_opportunity_id
 on conflict(opportunity_id,volunteer_profile_id) do update set status='invited',invite_token_hash=excluded.invite_token_hash,invited_at=now(),updated_at=now()
 where rye_volunteer_placements.status in ('applied','invited','declined','cancelled','no_show') and rye_volunteer_placements.checked_in_at is null and not rye_volunteer_placements.organizer_verified;
 get diagnostics v_rows=row_count;
 if v_rows=0 then raise exception 'Existing acceptance or attendance is preserved; use the exception workflow to correct it'; end if;
 return v_raw;
end $$;
