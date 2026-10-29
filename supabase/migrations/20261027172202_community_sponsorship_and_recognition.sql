-- Additive community funding, employee projects and verifiable recognition.
-- No sponsors, rewards or attendance are seeded into production.
alter table public.rye_volunteer_profiles
 add column if not exists display_name text,
 add column if not exists public_slug text unique,
 add column if not exists public_enabled boolean not null default false,
 add column if not exists access_token_hash text unique;
alter table public.rye_volunteer_opportunities
 add column if not exists activity_format text not null default 'community' check(activity_format in ('community','corporate'));
alter table public.rye_volunteer_placements
 add column if not exists group_code text,
 add column if not exists verified_at timestamptz;
alter table public.rye_volunteer_certificates
 add column if not exists tier text not null default 'bronze' check(tier in ('bronze','silver','gold')),
 add column if not exists hand_signed_at timestamptz,
 add column if not exists signer_name text;
create table public.rye_seasonal_needs (
 id uuid primary key default gen_random_uuid(), organization_name text not null, contact_name text not null,
 contact_email text not null, city text not null, title text not null, description text not null,
 season_start date not null, season_end date not null check(season_end>=season_start), activity_date date,
 volunteer_count integer not null check(volunteer_count between 1 and 500),
 hours_per_volunteer integer not null check(hours_per_volunteer between 2 and 8),
 activity_format text not null check(activity_format in ('community','corporate')),
 materials_budget_cents integer not null default 0 check(materials_budget_cents between 0 and 100000000),
 skills text, materials text, supervision text not null, partial_funding boolean not null default true,
 funding_target_cents integer not null check(funding_target_cents>0),
 status text not null default 'pending' check(status in ('pending','requested','funded','recruiting','filled','completed','verified','cancelled')),
 organizer_request_id uuid references public.rye_volunteer_organizer_requests(id),
 created_at timestamptz not null default now(),
 check(activity_format='corporate' or hours_per_volunteer<=4)
);
alter table public.rye_volunteer_opportunities add column if not exists seasonal_need_id uuid references public.rye_seasonal_needs(id);
create table public.rye_sponsor_enquiries (
 id uuid primary key default gen_random_uuid(), organization_name text not null, contact_name text not null,
 contact_email text not null, need_id uuid references public.rye_seasonal_needs(id), budget_cents integer check(budget_cents>0),
 message text, created_at timestamptz not null default now()
);
create table public.rye_sponsor_campaigns (
 id uuid primary key default gen_random_uuid(), sponsor_name text not null,
 budget_cents integer not null check(budget_cents>0), starts_on date not null, ends_on date not null check(ends_on>=starts_on),
 status text not null default 'active' check(status in ('active','closed')), created_at timestamptz not null default now()
);
create table public.rye_funding_allocations (
 id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.rye_sponsor_campaigns(id),
 need_id uuid not null references public.rye_seasonal_needs(id), amount_cents integer not null check(amount_cents>0),
 created_at timestamptz not null default now(), unique(campaign_id,need_id)
);
-- Only confirmed funded placements are excluded from the club's platform invoice.
create table public.rye_placement_funding (
 placement_id uuid primary key references public.rye_volunteer_placements(id), allocation_id uuid not null references public.rye_funding_allocations(id),
 fee_cents integer not null default 1000 check(fee_cents=1000), created_at timestamptz not null default now()
);
create table public.rye_milestone_rewards (
 id uuid primary key default gen_random_uuid(), title text not null, tier text not null check(tier in ('bronze','silver','gold')),
 quantity integer not null check(quantity>0), delivery_details text, delivery_mode text not null default 'manual' check(delivery_mode in ('manual','reusable_digital')), expires_on date not null, active boolean not null default true,
 created_at timestamptz not null default now()
);
create table public.rye_reward_redemptions (
 id uuid primary key default gen_random_uuid(), reward_id uuid not null references public.rye_milestone_rewards(id),
 volunteer_profile_id uuid not null references public.rye_volunteer_profiles(id), status text not null default 'fulfilled' check(status in ('fulfilled','cancelled')),
 created_at timestamptz not null default now(), unique(reward_id,volunteer_profile_id)
);
create table public.rye_attendance_audit (
 id uuid primary key default gen_random_uuid(), placement_id uuid not null references public.rye_volunteer_placements(id),
 previous_minutes integer not null, verified_minutes integer not null, recorded_at timestamptz not null default now()
);
create index on public.rye_funding_allocations(need_id);
create index on public.rye_sponsor_enquiries(need_id);
create index on public.rye_reward_redemptions(volunteer_profile_id);
create index on public.rye_volunteer_opportunities(seasonal_need_id);
create index on public.rye_attendance_audit(placement_id);
alter table public.rye_seasonal_needs enable row level security;
alter table public.rye_sponsor_enquiries enable row level security;
alter table public.rye_sponsor_campaigns enable row level security;
alter table public.rye_funding_allocations enable row level security;
alter table public.rye_placement_funding enable row level security;
alter table public.rye_milestone_rewards enable row level security;
alter table public.rye_reward_redemptions enable row level security;
alter table public.rye_attendance_audit enable row level security;
revoke all on public.rye_seasonal_needs,public.rye_sponsor_enquiries,public.rye_sponsor_campaigns,public.rye_funding_allocations,public.rye_placement_funding,public.rye_milestone_rewards,public.rye_reward_redemptions,public.rye_attendance_audit from public,anon,authenticated;

-- Internal token resolver. Never exposed as an RPC to public roles.
create function public.rye_passport_identity(p_token text) returns uuid
language sql stable security definer set search_path=public,extensions as $$
 select p.id from public.rye_volunteer_profiles p
 where p.status='active' and length(p_token)=48 and (p.access_token_hash=encode(extensions.digest(p_token,'sha256'),'hex')
 or exists(select 1 from public.rye_volunteer_placements pl where pl.volunteer_profile_id=p.id and pl.invite_token_hash=encode(extensions.digest(p_token,'sha256'),'hex')))
 limit 1
$$;
revoke all on function public.rye_passport_identity(text) from public,anon,authenticated;

create function public.rye_submit_community(p_action text,p_payload jsonb) returns uuid
language plpgsql security definer set search_path=public,extensions as $$
declare v_id uuid; b jsonb:=p_payload; v_email text:=lower(trim(b->>'email')); v_count integer; v_hours integer;
begin
 if p_action not in ('seasonal_need','sponsor_enquiry') or b->>'privacyAck' is distinct from 'true' or length(trim(b->>'organizationName'))<2 or length(trim(b->>'contactName'))<2 or v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then raise exception 'Complete the required fields and privacy acknowledgement'; end if;
 if p_action='seasonal_need' then
  if exists(select 1 from rye_seasonal_needs where contact_email=v_email and created_at>now()-interval '1 minute') then raise exception 'Please wait before submitting another request'; end if;
  v_count:=(b->>'volunteerCount')::integer; v_hours:=(b->>'hoursPerVolunteer')::integer;
  if coalesce(b->>'city','')='' or coalesce(b->>'title','')='' or coalesce(b->>'description','')='' or coalesce(b->>'supervision','')='' then raise exception 'Describe the project, location and supervision'; end if;
  insert into rye_seasonal_needs(organization_name,contact_name,contact_email,city,title,description,season_start,season_end,activity_date,volunteer_count,hours_per_volunteer,activity_format,materials_budget_cents,skills,materials,supervision,partial_funding,funding_target_cents)
  values(left(b->>'organizationName',160),left(b->>'contactName',120),v_email,left(b->>'city',120),left(b->>'title',160),left(b->>'description',3000),(b->>'seasonStart')::date,(b->>'seasonEnd')::date,nullif(b->>'activityDate','')::date,v_count,v_hours,b->>'activityFormat',coalesce((b->>'materialsBudgetCents')::integer,0),left(b->>'skills',1000),left(b->>'materials',1000),left(b->>'supervision',1500),coalesce((b->>'partialFunding')::boolean,true),v_count*1000) returning id into v_id;
 else
  if exists(select 1 from rye_sponsor_enquiries where contact_email=v_email and created_at>now()-interval '1 minute') then raise exception 'Please wait before submitting another enquiry'; end if;
  if nullif(b->>'needId','') is not null and not exists(select 1 from rye_seasonal_needs where id=(b->>'needId')::uuid and status not in ('pending','cancelled')) then raise exception 'This sponsorship need is not available'; end if;
  insert into rye_sponsor_enquiries(organization_name,contact_name,contact_email,need_id,budget_cents,message)
  values(left(b->>'organizationName',160),left(b->>'contactName',120),v_email,nullif(b->>'needId','')::uuid,nullif(b->>'budgetCents','')::integer,left(b->>'message',3000)) returning id into v_id;
 end if;
 return v_id;
end $$;

create function public.rye_list_seasonal_needs() returns jsonb
language sql stable security definer set search_path=public,extensions as $$
 select coalesce(jsonb_agg(to_jsonb(x) order by x.season_start),'[]') from (
 select n.id,n.organization_name,n.city,n.title,n.description,n.season_start,n.season_end,n.volunteer_count,n.hours_per_volunteer,n.activity_format,n.funding_target_cents,n.partial_funding,n.status,coalesce((select sum(a.amount_cents) from rye_funding_allocations a where a.need_id=n.id),0) funded_cents
 from rye_seasonal_needs n where status not in ('pending','cancelled') and season_end>=current_date order by season_start limit 200) x
$$;
create function public.rye_list_public_activities() returns jsonb
language sql stable security definer set search_path=public,extensions as $$
 select coalesce(jsonb_agg(to_jsonb(x) order by x.shift_start),'[]') from (
 select o.id,o.title,o.organization_name,o.city,o.venue,o.event_day,o.shift_start,o.shift_end,o.slots_total,o.activity_format,o.role_description,
 greatest(0,o.slots_total-(select count(*) from rye_volunteer_placements pl where pl.opportunity_id=o.id and pl.status in ('accepted','reconfirmed','confirmed','checked_in','completed'))) slots_remaining,
 case when o.seasonal_need_id is not null then 'Funding confirmed individually before participation' else 'Club-funded activity' end funding_label
 from rye_volunteer_opportunities o where o.status='open' and o.shift_start>now() and o.activity_format='community' and o.protection_status in ('active','not_required') order by o.shift_start limit 200) x
$$;

-- Mint access only when a genuinely new profile is inserted. Never claim an existing profile by email.
create function public.rye_register_volunteer(p_payload jsonb) returns jsonb
language plpgsql security definer set search_path=public,extensions as $$
declare b jsonb:=p_payload; v_id uuid; v_raw text:=encode(extensions.gen_random_bytes(24),'hex');
begin
 if b->>'privacyAck' is distinct from 'true' or b->>'ageBand' not in ('16_17','18_20','21_25','26_plus') or length(trim(coalesce(b->>'firstName','')))<1 or length(trim(coalesce(b->>'lastName','')))<1 or length(trim(coalesce(b->>'city','')))<2 or coalesce(b->>'email','') !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then raise exception 'Complete the required registration fields'; end if;
 if b->>'ageBand'='16_17' and b->>'guardianConsentReady' is distinct from 'true' then raise exception 'Guardian consent confirmation required'; end if;
 insert into rye_volunteer_profiles(first_name,last_name,email,city,postal_code,age_band,school_or_university,interests,availability,guardian_consent_ready,privacy_ack,access_token_hash)
 values(left(b->>'firstName',80),left(b->>'lastName',80),lower(trim(b->>'email')),left(b->>'city',120),left(b->>'postalCode',30),b->>'ageBand',left(b->>'schoolOrUniversity',160),left(b->>'interests',1500),left(b->>'availability',1500),coalesce((b->>'guardianConsentReady')::boolean,false),true,encode(extensions.digest(v_raw,'sha256'),'hex'))
 on conflict(email) do nothing returning id into v_id;
 if v_id is null then return jsonb_build_object('created',false); end if;
 return jsonb_build_object('created',true,'accessToken',v_raw);
end $$;

create function public.rye_join_public_activity(p_invite_token text,p_opportunity_id uuid,p_group_code text default null) returns boolean
language plpgsql security definer set search_path=public,extensions as $$
declare v_id uuid:=rye_passport_identity(p_invite_token); o rye_volunteer_opportunities%rowtype; v_age text; v_used integer;
begin
 if v_id is null then raise exception 'Sign in on your registered device or use your personal invitation'; end if;
 perform 1 from rye_volunteer_profiles where id=v_id for update;
 select * into o from rye_volunteer_opportunities where id=p_opportunity_id for update;
 if not found or o.status<>'open' or o.shift_start<=now() or (o.activity_format='corporate' and not exists(select 1 from rye_volunteer_placements x where x.opportunity_id=o.id and x.volunteer_profile_id=v_id and x.status in ('invited','accepted','reconfirmed','confirmed'))) or o.protection_status not in ('active','not_required') then raise exception 'This activity is not available'; end if;
 select age_band into v_age from rye_volunteer_profiles where id=v_id;
 if (v_age='16_17' and o.min_age>16) or (v_age='18_20' and o.min_age>18) or (v_age='21_25' and o.min_age>21) or o.min_age>26 then raise exception 'Contact the organizer to confirm the minimum age for this role'; end if;
 if p_group_code is not null and p_group_code !~ '^[a-f0-9]{16}$' then raise exception 'Invalid group code'; end if;
 if exists(select 1 from rye_volunteer_placements where opportunity_id=o.id and volunteer_profile_id=v_id and status in ('accepted','reconfirmed','confirmed','checked_in','completed')) then return true; end if;
 select count(*) into v_used from rye_volunteer_placements where opportunity_id=o.id and status in ('accepted','reconfirmed','confirmed','checked_in','completed');
 if v_used>=o.slots_total then raise exception 'This activity has no places remaining'; end if;
 if exists(select 1 from rye_volunteer_placements pl join rye_volunteer_opportunities other on other.id=pl.opportunity_id where pl.volunteer_profile_id=v_id and pl.status in ('accepted','reconfirmed','confirmed','checked_in') and tstzrange(other.shift_start,other.shift_end,'[)') && tstzrange(o.shift_start,o.shift_end,'[)')) then raise exception 'You already have an activity at this time'; end if;
 insert into rye_volunteer_placements(opportunity_id,volunteer_profile_id,status,event_day,accepted_at,group_code)
 values(o.id,v_id,'accepted',o.event_day,now(),p_group_code) on conflict(opportunity_id,volunteer_profile_id) do update set status='accepted',accepted_at=now(),group_code=excluded.group_code;
 return true;
end $$;

-- Only organizer-approved completed time contributes. No arbitrary four-hour daily cap.
create or replace view public.rye_volunteer_progress as
with totals as(select volunteer_profile_id,sum(verified_minutes)::integer credited_minutes,count(distinct event_day)::integer distinct_event_days from rye_volunteer_placements where organizer_verified and status='completed' group by volunteer_profile_id)
select p.id volunteer_profile_id,coalesce(t.credited_minutes,0) credited_minutes,floor(coalesce(t.credited_minutes,0)::numeric*100/60)::integer points,coalesce(t.distinct_event_days,0) distinct_event_days,(coalesce(t.credited_minutes,0)>=1200) certificate_eligible
from rye_volunteer_profiles p left join totals t on t.volunteer_profile_id=p.id;
revoke all on public.rye_volunteer_progress from public,anon,authenticated;

create function public.rye_my_volunteer_passport(p_invite_token text) returns jsonb
language plpgsql stable security definer set search_path=public,extensions as $$
declare v_id uuid:=rye_passport_identity(p_invite_token); v_result jsonb;
begin
 if v_id is null then return null; end if;
 select jsonb_build_object('profile',jsonb_build_object('id',p.id,'first_name',p.first_name,'display_name',p.display_name,'public_slug',p.public_slug,'public_enabled',p.public_enabled,'age_band',p.age_band),
 'credited_minutes',v.credited_minutes,'tier',case when v.credited_minutes>=3600 then 'gold' when v.credited_minutes>=2400 then 'silver' when v.credited_minutes>=1200 then 'bronze' else null end,
 'certificates',coalesce((select jsonb_agg(to_jsonb(c)-'volunteer_profile_id') from rye_volunteer_certificates c where c.volunteer_profile_id=p.id),'[]'),
 'rewards',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'title',r.title,'tier',r.tier,'redemption_details',case when exists(select 1 from rye_reward_redemptions dd where dd.reward_id=r.id and dd.volunteer_profile_id=p.id and dd.status<>'cancelled') then r.delivery_details else null end,'status',case when exists(select 1 from rye_reward_redemptions d where d.reward_id=r.id and d.volunteer_profile_id=p.id and d.status='fulfilled') then 'fulfilled' when exists(select 1 from rye_reward_redemptions d where d.reward_id=r.id and d.volunteer_profile_id=p.id and d.status='claimed') then 'claimed' else 'available' end)) from rye_milestone_rewards r where r.active and r.expires_on>=current_date and v.credited_minutes>=case r.tier when 'gold' then 3600 when 'silver' then 2400 else 1200 end and ((select count(*) from rye_reward_redemptions d where d.reward_id=r.id and d.status<>'cancelled')<r.quantity or exists(select 1 from rye_reward_redemptions d where d.reward_id=r.id and d.volunteer_profile_id=p.id and d.status<>'cancelled'))),'[]'),
 'activities',coalesce((select jsonb_agg(jsonb_build_object('id',pl.id,'opportunity_id',o.id,'title',o.title,'organization_name',o.organization_name,'event_day',pl.event_day,'status',pl.status,'verified_minutes',case when pl.organizer_verified then pl.verified_minutes else 0 end,'event_code',case when pl.status in ('accepted','reconfirmed','checked_in') then o.event_checkin_code else null end) order by o.shift_start desc) from rye_volunteer_placements pl join rye_volunteer_opportunities o on o.id=pl.opportunity_id where pl.volunteer_profile_id=p.id),'[]')) into v_result
 from rye_volunteer_profiles p join rye_volunteer_progress v on v.volunteer_profile_id=p.id where p.id=v_id;
 return v_result;
end $$;
create function public.rye_update_volunteer_visibility(p_invite_token text,p_display_name text,p_public_enabled boolean,p_public_slug text) returns boolean
language plpgsql security definer set search_path=public,extensions as $$
declare v_id uuid:=rye_passport_identity(p_invite_token);
begin
 if v_id is null then raise exception 'Unauthorized'; end if;
 if p_public_enabled is null or length(p_display_name) not between 2 and 80 or p_public_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(p_public_slug) not between 3 and 60 then raise exception 'Enter a display name and valid profile address'; end if;
 if p_public_enabled and exists(select 1 from rye_volunteer_profiles where id=v_id and age_band='16_17') then raise exception 'Public profiles are available to adults only'; end if;
 update rye_volunteer_profiles set display_name=p_display_name,public_enabled=p_public_enabled,public_slug=p_public_slug where id=v_id;
 return true;
end $$;
create function public.rye_public_volunteer_passport(p_slug text) returns jsonb
language sql stable security definer set search_path=public,extensions as $$
 select jsonb_build_object('display_name',p.display_name,'credited_minutes',v.credited_minutes,'tier',case when v.credited_minutes>=3600 then 'gold' when v.credited_minutes>=2400 then 'silver' when v.credited_minutes>=1200 then 'bronze' else null end,
 'activities',coalesce((select jsonb_agg(jsonb_build_object('title',o.title,'organization_name',o.organization_name,'event_day',pl.event_day,'verified_minutes',pl.verified_minutes)) from rye_volunteer_placements pl join rye_volunteer_opportunities o on o.id=pl.opportunity_id where pl.volunteer_profile_id=p.id and pl.organizer_verified and pl.status='completed'),'[]'),
 'certificates',coalesce((select jsonb_agg(jsonb_build_object('certificate_code',c.certificate_code,'tier',c.tier,'issued_at',c.issued_at,'hand_signed_at',c.hand_signed_at)) from rye_volunteer_certificates c where c.volunteer_profile_id=p.id and c.revoked_at is null),'[]'))
 from rye_volunteer_profiles p join rye_volunteer_progress v on v.volunteer_profile_id=p.id where p.public_slug=p_slug and p.public_enabled and p.age_band<>'16_17' and p.status='active'
$$;
create function public.rye_verify_volunteer_certificate(p_code text) returns jsonb
language sql stable security definer set search_path=public,extensions as $$
 select jsonb_build_object('certificate_code',c.certificate_code,'display_name',coalesce(nullif(p.display_name,''),p.first_name),'tier',c.tier,'credited_minutes',c.credited_minutes,'issued_at',c.issued_at,'hand_signed_at',c.hand_signed_at,'signer_name',c.signer_name,'revoked_at',c.revoked_at,'supporters',coalesce((select jsonb_agg(distinct camp.sponsor_name) from rye_placement_funding pf join rye_funding_allocations a on a.id=pf.allocation_id join rye_sponsor_campaigns camp on camp.id=a.campaign_id join rye_volunteer_placements pl on pl.id=pf.placement_id where pl.volunteer_profile_id=p.id and pl.organizer_verified and pl.status='completed' and pl.verified_at<=c.issued_at),'[]'))
 from rye_volunteer_certificates c join rye_volunteer_profiles p on p.id=c.volunteer_profile_id where c.certificate_code=p_code
$$;

-- Self-service club accounts use high-entropy capabilities; contacts are never public.
create table public.rye_club_accounts (
 id uuid primary key default gen_random_uuid(), access_token_hash text not null unique, owner_email text not null,
 created_at timestamptz not null default now()
);
alter table public.rye_club_accounts enable row level security;
revoke all on public.rye_club_accounts from public,anon,authenticated;
alter table public.rye_seasonal_needs add column club_account_id uuid references public.rye_club_accounts(id);
create index on public.rye_seasonal_needs(club_account_id);
alter table public.rye_volunteer_opportunities add column break_minutes integer not null default 0 check(break_minutes between 0 and 120), add column materials text;
create table public.rye_placement_messages (
 id uuid primary key default gen_random_uuid(), placement_id uuid not null references public.rye_volunteer_placements(id),
 sender_role text not null check(sender_role in ('club','volunteer')), body text not null check(length(body) between 1 and 3000),
 created_at timestamptz not null default now()
);
create index on public.rye_placement_messages(placement_id,created_at);
alter table public.rye_placement_messages enable row level security;
revoke all on public.rye_placement_messages from public,anon,authenticated;
create table public.rye_volunteer_issues (
 id uuid primary key default gen_random_uuid(), placement_id uuid not null references public.rye_volunteer_placements(id),
 reporter_role text not null check(reporter_role in ('club','volunteer')), body text not null,
 status text not null default 'open' check(status in ('open','resolved')), created_at timestamptz not null default now()
);
create index on public.rye_volunteer_issues(placement_id);
alter table public.rye_volunteer_issues enable row level security;
revoke all on public.rye_volunteer_issues from public,anon,authenticated;

create function public.rye_club_identity(p_token text) returns uuid
language sql stable security definer set search_path=public,extensions as $$
 select id from rye_club_accounts where length(p_token)=48 and access_token_hash=encode(extensions.digest(p_token,'sha256'),'hex')
$$;
revoke all on function public.rye_club_identity(text) from public,anon,authenticated;

create function public.rye_submit_seasonal_need(p_payload jsonb,p_club_token text default null) returns jsonb
language plpgsql security definer set search_path=public,extensions as $$
declare v_account uuid:=rye_club_identity(p_club_token); v_raw text; v_need uuid;
begin
 if v_account is null then
  v_raw:=encode(extensions.gen_random_bytes(24),'hex');
  insert into rye_club_accounts(access_token_hash,owner_email) values(encode(extensions.digest(v_raw,'sha256'),'hex'),lower(trim(p_payload->>'email'))) returning id into v_account;
 end if;
 v_need:=rye_submit_community('seasonal_need',p_payload);
 update rye_seasonal_needs set club_account_id=v_account,status='requested' where id=v_need;
 return jsonb_build_object('needId',v_need,'accessToken',v_raw);
end $$;

create function public.rye_club_workspace(p_token text) returns jsonb
language plpgsql stable security definer set search_path=public,extensions as $$
declare v_id uuid:=rye_club_identity(p_token);
begin
 if v_id is null then return null; end if;
 return jsonb_build_object(
 'needs',coalesce((select jsonb_agg(to_jsonb(n)-'contact_email'-'contact_name'-'club_account_id') from rye_seasonal_needs n where n.club_account_id=v_id),'[]'),
 'opportunities',coalesce((select jsonb_agg(to_jsonb(o)) from rye_volunteer_opportunities o join rye_seasonal_needs n on n.id=o.seasonal_need_id where n.club_account_id=v_id),'[]'),
 'placements',coalesce((select jsonb_agg(jsonb_build_object('id',pl.id,'volunteer_name',p.first_name,'title',o.title,'status',pl.status,'verified_minutes',pl.verified_minutes,'organizer_verified',pl.organizer_verified,'checked_in_at',pl.checked_in_at,'checked_out_at',pl.checked_out_at,'scheduled_minutes',extract(epoch from (o.shift_end-o.shift_start))/60-o.break_minutes,'opportunity_id',o.id)) from rye_volunteer_placements pl join rye_volunteer_profiles p on p.id=pl.volunteer_profile_id join rye_volunteer_opportunities o on o.id=pl.opportunity_id join rye_seasonal_needs n on n.id=o.seasonal_need_id where n.club_account_id=v_id),'[]'),
 'matches',coalesce((select jsonb_agg(to_jsonb(x)) from (select p.id,p.first_name,p.city,p.interests from rye_volunteer_profiles p where p.status='active' and exists(select 1 from rye_seasonal_needs n where n.club_account_id=v_id and lower(trim(n.city))=lower(trim(p.city))) order by p.created_at desc limit 100) x),'[]'));
end $$;

create function public.rye_club_action(p_token text,p_action text,p_payload jsonb) returns jsonb
language plpgsql security definer set search_path=public,extensions as $$
declare v_account uuid:=rye_club_identity(p_token); b jsonb:=p_payload; n rye_seasonal_needs%rowtype; o rye_volunteer_opportunities%rowtype; pl rye_volunteer_placements%rowtype;
 v_id uuid; v_start timestamptz; v_end timestamptz; v_minutes integer; v_max integer; v_break integer; v_format text;
begin
 if v_account is null then raise exception 'Unauthorized'; end if;
 if p_action='publish_activity' then
  select * into n from rye_seasonal_needs where id=(b->>'needId')::uuid and club_account_id=v_account for update;
  if not found or n.status in ('cancelled','completed','verified') then raise exception 'Club need not available'; end if;
  v_start:=(b->>'shiftStart')::timestamptz; v_end:=(b->>'shiftEnd')::timestamptz; v_format:=b->>'activityFormat'; v_break:=coalesce((b->>'breakMinutes')::integer,0);
  if v_start is null or v_end is null or v_start<=now() or v_format not in ('community','corporate') or extract(epoch from(v_end-v_start))/60 not between 120 and (case when v_format='corporate' then 480 else 240 end) then raise exception 'Choose a future 2–4 hour community activity or corporate project up to 8 hours'; end if;
  if (v_start at time zone 'Europe/Berlin')::date not between n.season_start and n.season_end or (b->>'eventDay')::date<>(v_start at time zone 'Europe/Berlin')::date then raise exception 'Activity date must fall within the season'; end if;
  if b->>'commercialAck' is distinct from 'true' or b->>'coverageConfirmed' is distinct from 'true' or length(trim(coalesce(b->>'safetyNotes','')))<5 or length(trim(coalesce(b->>'supervision','')))<2 or length(trim(coalesce(b->>'venue','')))<2 or length(trim(coalesce(b->>'roleDescription','')))<5 or length(trim(coalesce(b->>'title','')))<2 then raise exception 'Confirm coverage, venue, supervision and safety arrangements'; end if;
  if v_break<0 or v_break>120 or (extract(epoch from(v_end-v_start))/3600>6 and v_break<30) then raise exception 'Projects longer than six hours require at least 30 minutes of planned breaks'; end if;
  if n.organizer_request_id is null then
   insert into rye_volunteer_organizer_requests(organization_name,contact_name,contact_email,city,pipeline,event_name,volunteers_needed,responsibility_ack,commercial_ack,coverage_status,protection_status,status)
   values(n.organization_name,n.contact_name,n.contact_email,n.city,'one_off_event',n.title,n.volunteer_count,true,true,'existing_confirmed','existing_coverage','active') returning id into v_id;
   update rye_seasonal_needs set organizer_request_id=v_id where id=n.id;
  else v_id:=n.organizer_request_id; end if;
  insert into rye_volunteer_opportunities(organizer_request_id,seasonal_need_id,title,organization_name,city,venue,event_day,shift_start,shift_end,min_age,slots_total,role_description,safeguarding_notes,briefing_notes,activity_format,break_minutes,materials,protection_mode,protection_status,status)
  values(v_id,n.id,left(b->>'title',160),n.organization_name,n.city,left(b->>'venue',240),(b->>'eventDay')::date,v_start,v_end,case when v_format='corporate' then 18 else 16 end,(b->>'slots')::integer,left(b->>'roleDescription',1500),left(b->>'safetyNotes',2000),left(b->>'supervision',1500),v_format,v_break,left(b->>'materials',1500),'organizer_existing','not_required',case when v_format='corporate' then 'draft' else 'open' end) returning id into v_id;
  update rye_seasonal_needs set status='recruiting' where id=n.id;
  return jsonb_build_object('opportunityId',v_id,'status',case when v_format='corporate' then 'draft' else 'open' end);
 elsif p_action='cancel_activity' then
  select oo.* into o from rye_volunteer_opportunities oo join rye_seasonal_needs nn on nn.id=oo.seasonal_need_id where oo.id=(b->>'opportunityId')::uuid and nn.club_account_id=v_account for update of oo;
  if not found or o.shift_start<=now() then raise exception 'Only future activities can be cancelled here; report an issue for an activity already started'; end if;
  update rye_volunteer_opportunities set status='cancelled' where id=o.id;
  update rye_volunteer_placements set status='cancelled' where opportunity_id=o.id and status in ('invited','applied','accepted','reconfirmed','confirmed');
  return jsonb_build_object('cancelled',true);
 elsif p_action='verify_placement' then
  select p.* into pl from rye_volunteer_placements p join rye_volunteer_opportunities oo on oo.id=p.opportunity_id join rye_seasonal_needs nn on nn.id=oo.seasonal_need_id where p.id=(b->>'placementId')::uuid and nn.club_account_id=v_account;
  if not found then raise exception 'Placement not found'; end if;
  perform rye_record_verified_placement(pl.id,(b->>'minutes')::integer);
  return jsonb_build_object('verified',true);
 elsif p_action='invite_volunteer' then
  select oo.* into o from rye_volunteer_opportunities oo join rye_seasonal_needs nn on nn.id=oo.seasonal_need_id where oo.id=(b->>'opportunityId')::uuid and nn.club_account_id=v_account;
  if not found or o.status<>'open' or o.shift_start<=now() then raise exception 'Activity not available'; end if;
  if not exists(select 1 from rye_volunteer_profiles p where p.id=(b->>'volunteerId')::uuid and p.status='active' and lower(trim(p.city))=lower(trim(o.city))) then raise exception 'Choose a suitable local volunteer'; end if;
  insert into rye_volunteer_placements(opportunity_id,volunteer_profile_id,status,event_day,invited_at) values(o.id,(b->>'volunteerId')::uuid,'invited',o.event_day,now()) on conflict(opportunity_id,volunteer_profile_id) do nothing;
  return jsonb_build_object('invited',true);
 elsif p_action='report_issue' then
  if not exists(select 1 from rye_volunteer_placements p join rye_volunteer_opportunities oo on oo.id=p.opportunity_id join rye_seasonal_needs nn on nn.id=oo.seasonal_need_id where p.id=(b->>'placementId')::uuid and nn.club_account_id=v_account) then raise exception 'Placement not found'; end if;
  if length(trim(coalesce(b->>'message','')))<5 then raise exception 'Describe the issue'; end if;
  insert into rye_volunteer_issues(placement_id,reporter_role,body) values((b->>'placementId')::uuid,'club',left(b->>'message',3000));
  return jsonb_build_object('reported',true);
 end if;
 raise exception 'Unknown club action';
end $$;

create function public.rye_conversation(p_volunteer_token text,p_club_token text,p_placement_id uuid) returns jsonb
language plpgsql stable security definer set search_path=public,extensions as $$
declare v_volunteer uuid:=rye_passport_identity(p_volunteer_token); v_club uuid:=rye_club_identity(p_club_token); v_title text;
begin
 select o.title into v_title from rye_volunteer_placements p join rye_volunteer_opportunities o on o.id=p.opportunity_id left join rye_seasonal_needs n on n.id=o.seasonal_need_id
 where p.id=p_placement_id and (p.volunteer_profile_id=v_volunteer or n.club_account_id=v_club);
 if not found then return null; end if;
 return jsonb_build_object('title',v_title,'messages',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at) from (select id,sender_role,body,created_at from rye_placement_messages where placement_id=p_placement_id order by created_at desc limit 200) x),'[]'));
end $$;
create function public.rye_send_message(p_volunteer_token text,p_club_token text,p_placement_id uuid,p_message text) returns uuid
language plpgsql security definer set search_path=public,extensions as $$
declare v_role text; v_id uuid;
begin
 if rye_conversation(p_volunteer_token,p_club_token,p_placement_id) is null then raise exception 'Unauthorized'; end if;
 if length(trim(coalesce(p_message,''))) not between 1 and 3000 then raise exception 'Message must contain 1–3000 characters'; end if;
 select case when volunteer_profile_id=rye_passport_identity(p_volunteer_token) then 'volunteer' else 'club' end into v_role from rye_volunteer_placements where id=p_placement_id;
 if exists(select 1 from rye_placement_messages where placement_id=p_placement_id and sender_role=v_role and created_at>now()-interval '2 seconds') then raise exception 'Please wait before sending again'; end if;
 insert into rye_placement_messages(placement_id,sender_role,body) values(p_placement_id,v_role,trim(p_message)) returning id into v_id;
 return v_id;
end $$;

create function public.rye_claim_reward(p_invite_token text,p_reward_id uuid) returns jsonb
language plpgsql security definer set search_path=public,extensions as $$
declare v_id uuid:=rye_passport_identity(p_invite_token); r rye_milestone_rewards%rowtype; v_redemption uuid;
begin
 if v_id is null then raise exception 'Unauthorized'; end if;
 select * into r from rye_milestone_rewards where id=p_reward_id for update;
 perform 1 from rye_volunteer_profiles where id=v_id for update;
 if not found or not r.active or r.expires_on<current_date then raise exception 'This reward is not available'; end if;
 select id into v_redemption from rye_reward_redemptions where reward_id=r.id and volunteer_profile_id=v_id and status<>'cancelled';
 if found then return jsonb_build_object('claimed',true,'redemptionDetails',r.delivery_details); end if;
 if (select credited_minutes from rye_volunteer_progress where volunteer_profile_id=v_id)<(case r.tier when 'gold' then 3600 when 'silver' then 2400 else 1200 end) then raise exception 'Milestone not reached'; end if;
 if (select count(*) from rye_reward_redemptions where reward_id=r.id and status<>'cancelled')>=r.quantity then raise exception 'All rewards have been claimed'; end if;
 insert into rye_reward_redemptions(reward_id,volunteer_profile_id,status) values(r.id,v_id,case when r.delivery_mode='reusable_digital' and nullif(trim(r.delivery_details),'') is not null then 'fulfilled' else 'claimed' end) on conflict(reward_id,volunteer_profile_id) do update set status=excluded.status;
 return jsonb_build_object('claimed',true,'redemptionDetails',r.delivery_details);
end $$;
alter table rye_reward_redemptions drop constraint rye_reward_redemptions_status_check;
alter table rye_reward_redemptions add constraint rye_reward_redemptions_status_check check(status in ('claimed','fulfilled','cancelled'));

-- Personal sessions also authorize event-day attendance without exposing invitation tokens.
create or replace function public.rye_volunteer_event_status(p_invite_token text,p_event_code text)
returns jsonb language plpgsql security definer set search_path=public,extensions as $$
declare v_id uuid:=rye_passport_identity(p_invite_token); v_result jsonb;
begin
 select jsonb_build_object('placementId',pl.id,'status',pl.status,'checkedInAt',pl.checked_in_at,'checkedOutAt',pl.checked_out_at,'title',o.title,'organizationName',o.organization_name,'shiftStart',o.shift_start,'shiftEnd',o.shift_end,'venue',o.venue)
 into v_result from rye_volunteer_placements pl join rye_volunteer_opportunities o on o.id=pl.opportunity_id where pl.volunteer_profile_id=v_id and o.event_checkin_code=p_event_code;
 if v_result is null then raise exception 'Activity not found'; end if; return v_result;
end $$;
create or replace function public.rye_volunteer_event_action(p_invite_token text,p_event_code text,p_action text)
returns jsonb language plpgsql security definer set search_path=public,extensions as $$
declare v_id uuid:=rye_passport_identity(p_invite_token); pl rye_volunteer_placements%rowtype; o rye_volunteer_opportunities%rowtype; v_now timestamptz:=now();
begin
 if p_action not in ('check_in','check_out') then raise exception 'Invalid action'; end if;
 select p.* into pl from rye_volunteer_placements p join rye_volunteer_opportunities oo on oo.id=p.opportunity_id where p.volunteer_profile_id=v_id and oo.event_checkin_code=p_event_code for update of p;
 if not found then raise exception 'Activity not found'; end if;
 select * into o from rye_volunteer_opportunities where id=pl.opportunity_id;
 if o.status='cancelled' or o.protection_status not in ('active','not_required') then raise exception 'Activity is not active or coverage is not confirmed'; end if;
 if p_action='check_in' then
  if pl.status not in ('accepted','reconfirmed','confirmed') or pl.checked_in_at is not null or v_now<o.shift_start-interval '30 minutes' or v_now>o.shift_end then raise exception 'Check-in is not available for this activity now'; end if;
  if exists(select 1 from rye_volunteer_placements x where x.volunteer_profile_id=v_id and x.id<>pl.id and x.status='checked_in') then raise exception 'Complete your other activity first'; end if;
  update rye_volunteer_placements set status='checked_in',checked_in_at=v_now,updated_at=v_now where id=pl.id;
 else
  if pl.status<>'checked_in' or pl.checked_out_at is not null then raise exception 'Check-out is not available'; end if;
  update rye_volunteer_placements set status='completed',checked_out_at=v_now,verified_minutes=0,organizer_verified=false,updated_at=v_now where id=pl.id;
 end if;
 return rye_volunteer_event_status(p_invite_token,p_event_code);
end $$;

-- Public RPCs are intentional, narrowly scoped APIs. Internal helpers remain revoked.
do $$ declare f record; begin
 for f in select p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('rye_submit_community','rye_list_seasonal_needs','rye_list_public_activities','rye_register_volunteer','rye_join_public_activity','rye_my_volunteer_passport','rye_update_volunteer_visibility','rye_public_volunteer_passport','rye_verify_volunteer_certificate','rye_submit_seasonal_need','rye_club_workspace','rye_club_action','rye_conversation','rye_send_message','rye_claim_reward')
 loop execute format('revoke all on function %s from public,anon,authenticated',f.signature); execute format('grant execute on function %s to anon,authenticated',f.signature); end loop;
end $$;

create function public.rye_passport_activity_action(p_token text,p_placement_id uuid,p_action text,p_message text default '') returns jsonb
language plpgsql security definer set search_path=public,extensions as $$
declare v_id uuid:=rye_passport_identity(p_token); pl rye_volunteer_placements%rowtype; o rye_volunteer_opportunities%rowtype;
begin
 if v_id is null then raise exception 'Unauthorized'; end if;
 select * into pl from rye_volunteer_placements where id=p_placement_id and volunteer_profile_id=v_id;
 if not found then raise exception 'Activity not found'; end if;
 select * into o from rye_volunteer_opportunities where id=pl.opportunity_id;
 if p_action='accept' then perform rye_join_public_activity(p_token,o.id,pl.group_code);
 else
  perform 1 from rye_volunteer_profiles where id=v_id for update;
  select * into pl from rye_volunteer_placements where id=p_placement_id and volunteer_profile_id=v_id for update;
  if not found then raise exception 'Activity not found'; end if;
  if p_action in ('decline','cancel') then
   if pl.status not in ('invited','applied','accepted','reconfirmed','confirmed') then raise exception 'This participation can no longer be cancelled; report an issue'; end if;
   update rye_volunteer_placements set status=case when p_action='decline' then 'declined' else 'cancelled' end where id=pl.id;
  elsif p_action='reconfirm' then
   update rye_volunteer_placements set status='reconfirmed',reconfirmed_at=now() where id=pl.id and status in ('accepted','reconfirmed');
   if not found then raise exception 'Accept this activity first'; end if;
  elsif p_action='report_issue' then
   if length(trim(p_message))<5 then raise exception 'Describe the issue'; end if;
   insert into rye_volunteer_issues(placement_id,reporter_role,body) values(pl.id,'volunteer',left(p_message,3000));
  else raise exception 'Unknown activity action'; end if;
 end if;
 return jsonb_build_object('updated',true);
end $$;
revoke all on function public.rye_passport_activity_action(text,uuid,text,text) from public,anon,authenticated;
grant execute on function public.rye_passport_activity_action(text,uuid,text,text) to anon,authenticated;

-- Confirm attendance and milestones automatically; Gold remains a physical-signature workflow.
create function public.rye_issue_digital_milestones() returns trigger
language plpgsql security definer set search_path=public,extensions as $$
declare v record; v_tier text;
begin
 if new.organizer_verified and new.status='completed' then
  select * into v from rye_volunteer_progress where volunteer_profile_id=new.volunteer_profile_id;
  foreach v_tier in array array['bronze','silver'] loop
   if v.credited_minutes>=(case v_tier when 'silver' then 2400 else 1200 end) then
    insert into rye_volunteer_certificates(volunteer_profile_id,period_label,credited_minutes,points,distinct_event_days,tier)
    values(v.volunteer_profile_id,'lifetime-'||v_tier,v.credited_minutes,v.points,v.distinct_event_days,v_tier)
    on conflict(volunteer_profile_id,period_label) do nothing;
   end if;
  end loop;
 end if;
 return new;
end $$;
revoke all on function public.rye_issue_digital_milestones() from public,anon,authenticated;
create trigger rye_digital_milestones after update of organizer_verified,verified_minutes on rye_volunteer_placements for each row execute function rye_issue_digital_milestones();

-- Reserve sponsorship automatically at acceptance. Funds stay attached to the placement,
-- not to a volunteer's public profile. Materials have a separate disclosed budget.
create function public.rye_auto_fund_placement() returns trigger
language plpgsql security definer set search_path=public,extensions as $$
declare v_need uuid; a record; v_used integer;
begin
 if new.status in ('cancelled','declined','no_show') then delete from rye_placement_funding where placement_id=new.id; return new; end if;
 if new.status not in ('accepted','reconfirmed','confirmed') then return new; end if;
 if exists(select 1 from rye_placement_funding where placement_id=new.id) then return new; end if;
 select seasonal_need_id into v_need from rye_volunteer_opportunities where id=new.opportunity_id and activity_format='community';
 if v_need is null then return new; end if;
 for a in select al.* from rye_funding_allocations al join rye_sponsor_campaigns c on c.id=al.campaign_id join rye_volunteer_opportunities o on o.id=new.opportunity_id where al.need_id=v_need and c.status='active' and o.event_day between c.starts_on and c.ends_on order by al.created_at for update of al loop
  select coalesce(sum(fee_cents),0) into v_used from rye_placement_funding where allocation_id=a.id;
  if v_used+1000<=a.amount_cents then insert into rye_placement_funding(placement_id,allocation_id) values(new.id,a.id) on conflict do nothing; exit; end if;
 end loop;
 return new;
end $$;
revoke all on function public.rye_auto_fund_placement() from public,anon,authenticated;
create trigger rye_automatic_funding after insert or update of status on rye_volunteer_placements for each row execute function rye_auto_fund_placement();

-- Sponsor-funded and corporate-project placements must never enter the €10 club fee.
create or replace view public.rye_volunteer_oneoff_billing as
with counts as (
 select r.id organizer_request_id,r.organization_name,r.contact_email,
 count(pl.id) filter(where pl.status='completed' and pl.organizer_verified and pl.verified_minutes>0 and o.activity_format='community' and pf.placement_id is null)::integer successful_placements
 from rye_volunteer_organizer_requests r left join rye_volunteer_opportunities o on o.organizer_request_id=r.id left join rye_volunteer_placements pl on pl.opportunity_id=o.id left join rye_placement_funding pf on pf.placement_id=pl.id where r.pipeline='one_off_event' group by r.id,r.organization_name,r.contact_email
), protection as (
 select r.id organizer_request_id,count(pl.id) filter(where pl.status='completed' and pl.organizer_verified and pl.verified_minutes>0 and o.protection_mode='runyourevent')::integer protection_volunteer_days
 from rye_volunteer_organizer_requests r left join rye_volunteer_opportunities o on o.organizer_request_id=r.id left join rye_volunteer_placements pl on pl.opportunity_id=o.id where r.pipeline='one_off_event' group by r.id
)
select c.organizer_request_id,c.organization_name,c.contact_email,c.successful_placements,case when c.successful_placements>0 then 1000 else 0 end unit_fee_cents,c.successful_placements*1000 placement_amount_cents,coalesce(p.protection_volunteer_days,0) protection_volunteer_days,coalesce(p.protection_volunteer_days,0)*150 protection_amount_cents,c.successful_placements*1000+coalesce(p.protection_volunteer_days,0)*150 total_amount_cents from counts c left join protection p on p.organizer_request_id=c.organizer_request_id;
revoke all on public.rye_volunteer_oneoff_billing from public,anon,authenticated;

-- Retire email-only profile mutation. Existing profiles require a personal session.
revoke all on function public.rye_submit_volunteer_profile(text,text,text,text,text,text,text,text,text,boolean,boolean) from public,anon,authenticated;
create or replace function public.rye_volunteer_respond_invite(p_invite_token text,p_action text)
returns text language plpgsql security definer set search_path=public,extensions as $$
declare v_placement uuid; v_result text;
begin
 select id into v_placement from rye_volunteer_placements where invite_token_hash=encode(extensions.digest(coalesce(p_invite_token,''),'sha256'),'hex');
 if not found then raise exception 'Invalid invitation'; end if;
 perform rye_passport_activity_action(p_invite_token,v_placement,p_action,'');
 select status into v_result from rye_volunteer_placements where id=v_placement;
 return v_result;
end $$;

-- Recovery is authorized by a verified Supabase Auth email, never by an email field alone.
create function public.rye_recover_account(p_role text) returns jsonb
language plpgsql security definer set search_path=public,extensions as $$
declare v_email text; v_account uuid; v_token text:=encode(extensions.gen_random_bytes(24),'hex');
begin
 select lower(email) into v_email from auth.users where id=auth.uid() and email_confirmed_at is not null;
 if auth.uid() is null or coalesce(v_email,'')='' or p_role not in ('volunteer','club') then raise exception 'Verified sign-in required'; end if;
 if p_role='volunteer' then
  update rye_volunteer_profiles set access_token_hash=encode(extensions.digest(v_token,'sha256'),'hex') where email=v_email and status='active' returning id into v_account;
  if v_account is not null then update rye_volunteer_placements set invite_token_hash=null where volunteer_profile_id=v_account; end if;
 else
  select id into v_account from rye_club_accounts where owner_email=v_email order by created_at desc limit 1;
  if v_account is not null then
   update rye_club_accounts set access_token_hash=encode(extensions.digest(v_token,'sha256'),'hex') where id=v_account;
   update rye_seasonal_needs set club_account_id=v_account where club_account_id in (select id from rye_club_accounts where owner_email=v_email);
  end if;
 end if;
 if v_account is null then raise exception 'No active account was found for this verified address'; end if;
 return jsonb_build_object('accessToken',v_token);
end $$;
revoke all on function public.rye_recover_account(text) from public,anon,authenticated;
grant execute on function public.rye_recover_account(text) to authenticated;

alter table public.rye_sponsor_campaigns add column access_token_hash text unique;
create function public.rye_campaign_report(p_token text) returns jsonb
language sql stable security definer set search_path=public,extensions as $$
 select jsonb_build_object('sponsor_name',c.sponsor_name,'budget_cents',c.budget_cents,
 'allocated_cents',coalesce((select sum(amount_cents) from rye_funding_allocations where campaign_id=c.id),0),
 'reserved_cents',coalesce((select sum(pf.fee_cents) from rye_placement_funding pf join rye_funding_allocations a on a.id=pf.allocation_id where a.campaign_id=c.id),0),
 'completed_placements',(select count(*) from rye_placement_funding pf join rye_funding_allocations a on a.id=pf.allocation_id join rye_volunteer_placements pl on pl.id=pf.placement_id where a.campaign_id=c.id and pl.status='completed'),
 'verified_placements',(select count(*) from rye_placement_funding pf join rye_funding_allocations a on a.id=pf.allocation_id join rye_volunteer_placements pl on pl.id=pf.placement_id where a.campaign_id=c.id and pl.status='completed' and pl.organizer_verified),
 'verified_minutes',coalesce((select sum(pl.verified_minutes) from rye_placement_funding pf join rye_funding_allocations a on a.id=pf.allocation_id join rye_volunteer_placements pl on pl.id=pf.placement_id where a.campaign_id=c.id and pl.status='completed' and pl.organizer_verified),0),
 'needs',coalesce((select jsonb_agg(jsonb_build_object('title',n.title,'organization_name',n.organization_name,'allocated_cents',a.amount_cents,
 'completed_placements',(select count(*) from rye_placement_funding pf join rye_volunteer_placements pl on pl.id=pf.placement_id where pf.allocation_id=a.id and pl.status='completed'),
 'verified_minutes',coalesce((select sum(pl.verified_minutes) from rye_placement_funding pf join rye_volunteer_placements pl on pl.id=pf.placement_id where pf.allocation_id=a.id and pl.status='completed' and pl.organizer_verified),0))) from rye_funding_allocations a join rye_seasonal_needs n on n.id=a.need_id where a.campaign_id=c.id),'[]'))
 from rye_sponsor_campaigns c where length(p_token)=48 and c.access_token_hash=encode(extensions.digest(p_token,'sha256'),'hex')
$$;
revoke all on function public.rye_campaign_report(text) from public,anon,authenticated;


-- Gold cannot be manufactured without an explicit physical-signature record.
alter table rye_volunteer_certificates add constraint rye_gold_signature_required check(tier<>'gold' or (hand_signed_at is not null and signer_name is not null and length(trim(signer_name))>=2));
