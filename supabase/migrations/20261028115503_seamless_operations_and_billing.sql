-- Durable automation and billing. Internal workers use service_role, never browser credentials.
alter table rye_volunteer_profiles add column availability_windows jsonb not null default '[]', add column matching_opt_in boolean not null default false, add column email_alerts boolean not null default false, add column preferred_minutes integer not null default 240 check(preferred_minutes between 120 and 480);
create table rye_notifications(id uuid primary key default gen_random_uuid(),volunteer_id uuid references rye_volunteer_profiles(id),club_id uuid references rye_club_accounts(id),kind text not null,title text not null,body text not null,href text not null,dedupe_key text not null unique,read_at timestamptz,created_at timestamptz not null default now(),check(volunteer_id is not null or club_id is not null));
create index on rye_notifications(volunteer_id,created_at);create index on rye_notifications(club_id,created_at);
create table rye_jobs(id uuid primary key default gen_random_uuid(),kind text not null check(kind in ('email','invoice','reconcile')),payload jsonb not null,dedupe_key text not null unique,status text not null default 'pending' check(status in ('pending','running','done','failed')),attempts integer not null default 0,available_at timestamptz not null default now(),lease_token uuid,leased_until timestamptz,last_error text,created_at timestamptz not null default now());
create index on rye_jobs(status,available_at);
create table rye_billing_accounts(id uuid primary key default gen_random_uuid(),club_id uuid unique references rye_club_accounts(id),email text not null,name text not null,address text,created_at timestamptz not null default now());
create table rye_invoices(id uuid primary key default gen_random_uuid(),billing_account_id uuid not null references rye_billing_accounts(id),status text not null default 'draft' check(status in ('draft','open','paid','void','uncollectible','review')),amount_cents integer not null check(amount_cents>0),currency text not null default 'eur',invoice_number text not null unique default ('RYE-'||upper(replace(gen_random_uuid()::text,'-',''))),snapshot jsonb,sent_at timestamptz,due_at timestamptz,paid_at timestamptz,payment_reference text,created_at timestamptz not null default now());
create table rye_charges(id uuid primary key default gen_random_uuid(),placement_id uuid not null references rye_volunteer_placements(id),billing_account_id uuid not null references rye_billing_accounts(id),kind text not null check(kind in ('placement','protection')),amount_cents integer not null check(amount_cents>0),invoice_id uuid references rye_invoices(id),status text not null default 'pending' check(status in ('pending','invoiced','review')),created_at timestamptz not null default now(),unique(placement_id,kind));
create index on rye_charges(billing_account_id,invoice_id);
create table rye_orders(id uuid primary key default gen_random_uuid(),kind text not null check(kind in ('sponsorship','corporate')),need_id uuid references rye_seasonal_needs(id),booking_id uuid references rye_corporate_bookings(id),organization_name text not null,email text not null,billing_address text not null,amount_cents integer not null check(amount_cents>0),status text not null default 'pending' check(status in ('pending','paid','expired','review','refunded')),access_hash text not null unique,campaign_id uuid references rye_sponsor_campaigns(id),expires_at timestamptz not null default now()+interval '30 days',created_at timestamptz not null default now(),paid_at timestamptz);
create index on rye_orders(need_id,status);
create unique index rye_one_corporate_paid_order on rye_orders(booking_id) where status in ('pending','paid') and booking_id is not null;

alter table rye_invoices add column order_id uuid unique references rye_orders(id);
create table rye_employee_invites(id uuid primary key default gen_random_uuid(),booking_id uuid not null references rye_corporate_bookings(id),email text not null,token_hash text not null unique,volunteer_id uuid references rye_volunteer_profiles(id),accepted_at timestamptz,created_at timestamptz not null default now(),unique(booking_id,email));
create table rye_reward_units(id uuid primary key default gen_random_uuid(),reward_id uuid not null references rye_milestone_rewards(id),code text not null unique,volunteer_id uuid references rye_volunteer_profiles(id),claimed_at timestamptz,created_at timestamptz not null default now());
create index on rye_reward_units(reward_id,volunteer_id);
alter table rye_milestone_rewards drop constraint rye_milestone_rewards_delivery_mode_check;
alter table rye_milestone_rewards add constraint rye_milestone_rewards_delivery_mode_check check(delivery_mode in ('manual','reusable_digital','unique_voucher'));
do $$declare n text;begin foreach n in array array['rye_notifications','rye_jobs','rye_billing_accounts','rye_invoices','rye_charges','rye_orders','rye_employee_invites','rye_reward_units'] loop execute format('alter table %I enable row level security',n);execute format('revoke all on %I from public,anon,authenticated',n);execute format('grant all on %I to service_role',n);end loop;end $$;

create function rye_notify(p_volunteer uuid,p_club uuid,p_kind text,p_title text,p_body text,p_href text,p_key text) returns void language plpgsql security definer set search_path=public,extensions as $$
declare v_email text;v_id uuid;
begin
 insert into rye_notifications(volunteer_id,club_id,kind,title,body,href,dedupe_key) values(p_volunteer,p_club,p_kind,p_title,p_body,p_href,p_key) on conflict do nothing returning id into v_id;
 if v_id is null then return;end if;
 if p_volunteer is not null then select email into v_email from rye_volunteer_profiles where id=p_volunteer and email_alerts and status='active';else select owner_email into v_email from rye_club_accounts where id=p_club;end if;
 if v_email is not null then insert into rye_jobs(kind,payload,dedupe_key) values('email',jsonb_build_object('to',v_email,'subject',p_title,'body',p_body,'href',p_href),'notification:'||v_id) on conflict do nothing;end if;
end $$;

create function rye_save_preferences(p_token text,p_windows jsonb,p_matching boolean,p_email boolean,p_minutes integer) returns boolean language plpgsql security definer set search_path=public,extensions as $$
declare v_id uuid:=rye_passport_identity(p_token);w jsonb;
begin
 if v_id is null then raise exception 'Unauthorized';end if;
 if jsonb_typeof(p_windows) is distinct from 'array' or jsonb_array_length(p_windows)>28 or p_minutes is null or p_minutes not between 120 and 480 or p_matching is null or p_email is null then raise exception 'Invalid preferences';end if;
 for w in select value from jsonb_array_elements(p_windows) loop
  if coalesce((w->>'day')::integer,-1) not between 0 and 6 or coalesce(w->>'start','') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' or coalesce(w->>'end','') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' or (w->>'end')::time<=(w->>'start')::time then raise exception 'Choose a valid weekday and time window';end if;
 end loop;
 if p_matching and jsonb_array_length(p_windows)=0 then raise exception 'Add availability before enabling automatic invitations';end if;
 update rye_volunteer_profiles set availability_windows=p_windows,matching_opt_in=p_matching,email_alerts=p_email,preferred_minutes=p_minutes where id=v_id;return true;
end $$;
create function rye_candidates(p_opportunity uuid) returns table(id uuid,score integer) language sql stable security definer set search_path=public,extensions as $$
 select p.id,(100+case when lower(o.role_description||' '||o.title) like '%'||lower(split_part(coalesce(p.interests,''),',',1))||'%' and length(coalesce(p.interests,''))>2 then 10 else 0 end)::integer score
 from rye_volunteer_profiles p join rye_volunteer_opportunities o on o.id=p_opportunity
 where p.status='active' and lower(trim(p.city))=lower(trim(o.city)) and (p.age_band<>'16_17' or o.min_age<=16) and o.min_age<=18 and extract(epoch from(o.shift_end-o.shift_start))/60<=p.preferred_minutes
 and (jsonb_array_length(p.availability_windows)=0 or exists(select 1 from jsonb_array_elements(p.availability_windows) w where (w->>'day')::integer=extract(dow from o.shift_start at time zone 'Europe/Berlin')::integer and (o.shift_start at time zone 'Europe/Berlin')::time>=(w->>'start')::time and (o.shift_end at time zone 'Europe/Berlin')::time<=(w->>'end')::time and (o.shift_start at time zone 'Europe/Berlin')::date=(o.shift_end at time zone 'Europe/Berlin')::date))
 and not exists(select 1 from rye_volunteer_placements p2 join rye_volunteer_opportunities o2 on o2.id=p2.opportunity_id where p2.volunteer_profile_id=p.id and p2.status in ('accepted','reconfirmed','confirmed','checked_in') and tstzrange(o2.shift_start,o2.shift_end,'[)')&&tstzrange(o.shift_start,o.shift_end,'[)'))
 order by score desc,p.created_at limit 100
$$;
create function rye_auto_match(p_opportunity uuid) returns integer language plpgsql security definer set search_path=public,extensions as $$
declare o rye_volunteer_opportunities%rowtype;c record;v_count integer:=0;v_remaining integer;
begin
 select * into o from rye_volunteer_opportunities where id=p_opportunity for update;
 if not found or o.status<>'open' or o.activity_format<>'community' or o.shift_start<=now() or o.protection_status not in ('active','not_required') then return 0;end if;
 select o.slots_total-count(*) into v_remaining from rye_volunteer_placements where opportunity_id=o.id and status in ('accepted','reconfirmed','confirmed','checked_in','completed');
 if v_remaining<=0 then return 0;end if;
 for c in select x.id from rye_candidates(o.id) x join rye_volunteer_profiles p on p.id=x.id where p.matching_opt_in and not exists(select 1 from rye_volunteer_placements pl where pl.opportunity_id=o.id and pl.volunteer_profile_id=p.id) order by x.score desc limit least(v_remaining*2,40) loop
  insert into rye_volunteer_placements(opportunity_id,volunteer_profile_id,status,event_day,invited_at) values(o.id,c.id,'invited',o.event_day,now()) on conflict do nothing;v_count:=v_count+1;
 end loop;return v_count;
end $$;
create function rye_placement_notice() returns trigger language plpgsql security definer set search_path=public,extensions as $$
declare o rye_volunteer_opportunities%rowtype;v_club uuid;
begin
 select * into o from rye_volunteer_opportunities where id=new.opportunity_id;select club_account_id into v_club from rye_seasonal_needs where id=o.seasonal_need_id;
 if tg_op='INSERT' or new.status is distinct from old.status then
  perform rye_notify(new.volunteer_profile_id,null,'activity','Activity '||replace(new.status,'_',' '),o.title||' · '||o.organization_name,'/volunteer','placement:'||new.id||':'||new.status);
  if v_club is not null and new.status not in ('invited','applied') then perform rye_notify(null,v_club,'activity','Volunteer activity update',o.title||' · '||replace(new.status,'_',' '),'/club','club-placement:'||new.id||':'||new.status);end if;
 end if;
 return new;
end $$;
create trigger rye_placement_notifications after insert or update of status on rye_volunteer_placements for each row execute function rye_placement_notice();
create function rye_activity_notice() returns trigger language plpgsql security definer set search_path=public,extensions as $$
declare pl record;
begin
 if new.status='open' then perform rye_auto_match(new.id);end if;
 if tg_op='UPDATE' and (new.shift_start is distinct from old.shift_start or new.shift_end is distinct from old.shift_end or new.venue is distinct from old.venue or new.status='cancelled' and old.status<>'cancelled') then
  for pl in select * from rye_volunteer_placements where opportunity_id=new.id and status not in ('declined','no_show') loop perform rye_notify(pl.volunteer_profile_id,null,'schedule','Activity details changed',new.title||'. Review the latest arrangements in your passport.','/volunteer','change:'||new.id||':'||new.updated_at||':'||pl.id);end loop;
 end if;return new;
end $$;
create trigger rye_activity_automation after insert or update of status,shift_start,shift_end,venue on rye_volunteer_opportunities for each row execute function rye_activity_notice();
create function rye_message_notice() returns trigger language plpgsql security definer set search_path=public,extensions as $$
declare pl rye_volunteer_placements%rowtype;v_club uuid;
begin
 select * into pl from rye_volunteer_placements where id=new.placement_id;
 select n.club_account_id into v_club from rye_volunteer_opportunities o join rye_seasonal_needs n on n.id=o.seasonal_need_id where o.id=pl.opportunity_id;
 if new.sender_role='club' then perform rye_notify(pl.volunteer_profile_id,null,'message','New message from your club','Open your activity conversation to read and reply.','/conversations/'||pl.id,'message:'||new.id);
 elsif v_club is not null then perform rye_notify(null,v_club,'message','New volunteer message','Open the conversation to read and reply.','/conversations/'||pl.id,'message:'||new.id);end if;return new;
end $$;
create trigger rye_message_notifications after insert on rye_placement_messages for each row execute function rye_message_notice();
create function rye_inbox(p_volunteer_token text,p_club_token text,p_read uuid default null) returns jsonb language plpgsql security definer set search_path=public,extensions as $$
declare v uuid:=rye_passport_identity(p_volunteer_token);c uuid:=rye_club_identity(p_club_token);r jsonb;
begin
 if v is null and c is null then raise exception 'Unauthorized';end if;
 if p_read is not null then update rye_notifications set read_at=now() where id=p_read and (volunteer_id=v or club_id=c);end if;
 select jsonb_build_object('unread',(select count(*) from rye_notifications where (volunteer_id=v or club_id=c) and read_at is null),'items',coalesce((select jsonb_agg(to_jsonb(x) order by created_at desc) from(select id,kind,title,body,href,read_at,created_at from rye_notifications where volunteer_id=v or club_id=c order by created_at desc limit 50)x),'[]'),'preferences',(select jsonb_build_object('windows',availability_windows,'matching',matching_opt_in,'email',email_alerts,'minutes',preferred_minutes) from rye_volunteer_profiles where id=v),'recommendations',coalesce((select jsonb_agg(to_jsonb(x)) from(select o.id,o.title,o.city,o.shift_start,o.shift_end from rye_volunteer_opportunities o join lateral rye_candidates(o.id) m on m.id=v where o.status='open' and o.activity_format='community' and o.shift_start>now() order by o.shift_start limit 12)x),'[]')) into r;return r;
end $$;

alter table rye_invoices add column needs_review boolean not null default false;
create function rye_accrue_charges() returns trigger language plpgsql security definer set search_path=public,extensions as $$
declare o rye_volunteer_opportunities%rowtype;n rye_seasonal_needs%rowtype;r rye_volunteer_organizer_requests%rowtype;a uuid;
begin
 select * into o from rye_volunteer_opportunities where id=new.opportunity_id;
 if o.activity_format<>'community' then return new;end if;
 if old.organizer_verified and (new.verified_minutes is distinct from old.verified_minutes or new.organizer_verified is distinct from old.organizer_verified or new.status is distinct from old.status) then
  update rye_invoices set needs_review=true where id in(select invoice_id from rye_charges where placement_id=new.id and invoice_id is not null);
  update rye_charges set status='review' where placement_id=new.id;
 end if;
 if new.organizer_verified and new.status='completed' and new.verified_minutes>0 then
  select * into n from rye_seasonal_needs where id=o.seasonal_need_id;select * into r from rye_volunteer_organizer_requests where id=o.organizer_request_id;
  if n.club_account_id is null then return new;end if;
  if exists(select 1 from rye_volunteer_billing_runs br where br.organizer_request_id=o.organizer_request_id and br.status in ('sent','paid') and new.checked_out_at<=br.created_at) then return new;end if;
  insert into rye_billing_accounts(club_id,email,name) select c.id,c.owner_email,n.organization_name from rye_club_accounts c where c.id=n.club_account_id on conflict(club_id) do nothing;
  select id into a from rye_billing_accounts where club_id=n.club_account_id;
  if not exists(select 1 from rye_placement_funding where placement_id=new.id) then insert into rye_charges(placement_id,billing_account_id,kind,amount_cents) values(new.id,a,'placement',1000) on conflict(placement_id,kind) do nothing;end if;
  if o.protection_mode='runyourevent' then insert into rye_charges(placement_id,billing_account_id,kind,amount_cents) values(new.id,a,'protection',150) on conflict(placement_id,kind) do nothing;end if;
 else
  update rye_invoices set needs_review=true where id in(select invoice_id from rye_charges where placement_id=new.id and invoice_id is not null);
  update rye_charges set status='review' where placement_id=new.id;
 end if;return new;
end $$;
create trigger rye_charge_accrual after update of organizer_verified,verified_minutes,status on rye_volunteer_placements for each row execute function rye_accrue_charges();
-- Prevent reassignment after a charge has entered an invoice snapshot.
create function rye_guard_funding_change() returns trigger language plpgsql security definer set search_path=public,extensions as $$
begin
 if exists(select 1 from rye_charges where placement_id=coalesce(new.placement_id,old.placement_id) and invoice_id is not null) then raise exception 'This placement has an invoice; use the billing exception workflow';end if;
 return coalesce(new,old);
end $$;
create trigger rye_funding_invoice_guard before insert or delete or update on rye_placement_funding for each row execute function rye_guard_funding_change();

create function rye_worker_tick() returns jsonb language plpgsql security definer set search_path=public,extensions as $$
declare p record;a record;v_invoice uuid;v_total integer;m integer:=0;
begin
 update rye_orders set status='expired' where status='pending' and expires_at<now() and not exists(select 1 from rye_invoices where order_id=rye_orders.id and sent_at is not null and status<>'void');
 for p in select pl.id,pl.volunteer_profile_id,pl.status,o.id opportunity_id,o.title,o.shift_start,o.shift_end,n.club_account_id from rye_volunteer_placements pl join rye_volunteer_opportunities o on o.id=pl.opportunity_id left join rye_seasonal_needs n on n.id=o.seasonal_need_id where pl.status in ('accepted','reconfirmed','confirmed','checked_in') loop
  if p.shift_start between now() and now()+interval '24 hours' then perform rye_notify(p.volunteer_profile_id,null,'reminder','Your activity is coming up',p.title||'. Check the venue and reconfirm your attendance.','/volunteer','reminder24:'||p.id);end if;
  if p.shift_start between now() and now()+interval '2 hours' then perform rye_notify(p.volunteer_profile_id,null,'reminder','Your activity starts soon',p.title||'. Remember to check in when you arrive.','/volunteer','reminder2:'||p.id);end if;
  if p.shift_end<now()-interval '4 hours' then
   if p.status='checked_in' then
    if p.club_account_id is not null then perform rye_notify(null,p.club_account_id,'exception','Attendance needs review',p.title||' has a check-in without check-out. Review the attendance before crediting hours.','/club','missing-checkout:'||p.id);end if;
   else update rye_volunteer_placements set status='no_show' where id=p.id and status in ('accepted','reconfirmed','confirmed');end if;
  end if;
 end loop;
 for p in select id from rye_volunteer_opportunities where status='open' and activity_format='community' and shift_start>now() loop m:=m+rye_auto_match(p.id);end loop;
 for a in select id from rye_billing_accounts order by id for update skip locked loop
  perform 1 from rye_charges where billing_account_id=a.id and invoice_id is null and status='pending' and created_at<date_trunc('day',now()) for update;
  select sum(amount_cents) into v_total from rye_charges where billing_account_id=a.id and invoice_id is null and status='pending' and created_at<date_trunc('day',now());
  if v_total>0 then
   insert into rye_invoices(billing_account_id,amount_cents) values(a.id,v_total) returning id into v_invoice;
   update rye_charges set invoice_id=v_invoice,status='invoiced' where billing_account_id=a.id and invoice_id is null and status='pending' and created_at<date_trunc('day',now());
   insert into rye_jobs(kind,payload,dedupe_key) values('invoice',jsonb_build_object('invoiceId',v_invoice),'invoice:'||v_invoice) on conflict do nothing;
  end if;
 end loop;
 return jsonb_build_object('invitations',m);
end $$;
create function rye_claim_jobs(p_limit integer default 20) returns jsonb language plpgsql security definer set search_path=public,extensions as $$
declare r jsonb;
begin
 update rye_jobs set status='failed',last_error='Retry limit reached' where attempts>=8 and (status='pending' or status='running' and leased_until<now());
 with picked as(select id from rye_jobs where attempts<8 and (status='pending' and available_at<=now() or status='running' and leased_until<now()) order by available_at for update skip locked limit least(greatest(p_limit,1),30)),leased as(update rye_jobs j set status='running',attempts=attempts+1,lease_token=gen_random_uuid(),leased_until=now()+interval '10 minutes' from picked where picked.id=j.id returning j.*)
 select coalesce(jsonb_agg(to_jsonb(leased)),'[]') into r from leased;return r;
end $$;
create function rye_finish_job(p_id uuid,p_lease uuid,p_error text default null) returns boolean language plpgsql security definer set search_path=public,extensions as $$
begin
 update rye_jobs set status=case when p_error is null then 'done' when attempts>=8 then 'failed' else 'pending' end,last_error=left(p_error,300),available_at=now()+interval '1 minute'*least(360,power(2,least(attempts,8))::integer),leased_until=null where id=p_id and lease_token=p_lease and status='running';return found;
end $$;
create function rye_club_billing(p_token text) returns jsonb language plpgsql security definer set search_path=public,extensions as $$
declare c uuid:=rye_club_identity(p_token);
begin
 if c is null then raise exception 'Unauthorized';end if;
 return jsonb_build_object('account',(select jsonb_build_object('id',id,'name',name,'email',email,'address',address) from rye_billing_accounts where club_id=c),'invoices',coalesce((select jsonb_agg(jsonb_build_object('id',i.id,'status',i.status,'amount_cents',i.amount_cents,'invoice_number',i.invoice_number,'sent_at',i.sent_at,'due_at',i.due_at,'paid_at',i.paid_at,'needs_review',i.needs_review,'created_at',i.created_at) order by i.created_at desc) from rye_invoices i join rye_billing_accounts a on a.id=i.billing_account_id where a.club_id=c),'[]'),'unbilled_cents',coalesce((select sum(ch.amount_cents) from rye_charges ch join rye_billing_accounts a on a.id=ch.billing_account_id where a.club_id=c and ch.invoice_id is null and ch.status='pending'),0));
end $$;
create function rye_create_order(p_payload jsonb,p_company_token text default null) returns jsonb language plpgsql security definer set search_path=public,extensions as $$
declare b jsonb:=p_payload;n rye_seasonal_needs%rowtype;bk rye_corporate_bookings%rowtype;v_amount integer;v_used integer;v_raw text:=encode(gen_random_bytes(24),'hex');v_id uuid;
begin
 if length(trim(coalesce(b->>'billingAddress','')))<8 or length(b->>'billingAddress')>2000 then raise exception 'Enter the billing address';end if;
 if b->>'termsAck' is distinct from 'true' then raise exception 'Accept the sponsorship or project terms';end if;
 if p_company_token is not null then
  select * into bk from rye_corporate_bookings where access_token_hash=encode(digest(p_company_token,'sha256'),'hex') for update;
  if not found or bk.status='cancelled' then raise exception 'Corporate booking not found';end if;
  if coalesce(b->>'email','') !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' or length(trim(coalesce(b->>'organizationName','')))<2 then raise exception 'Enter company and billing email';end if;
  v_amount:=bk.agreed_amount_cents;
  insert into rye_orders(kind,booking_id,organization_name,email,billing_address,amount_cents,access_hash) select 'corporate',bk.id,left(trim(b->>'organizationName'),160),lower(trim(b->>'email')),trim(b->>'billingAddress'),v_amount,encode(digest(v_raw,'sha256'),'hex') from rye_volunteer_opportunities o join rye_seasonal_needs sn on sn.id=o.seasonal_need_id where o.id=bk.opportunity_id returning id into v_id;
 else
  select * into n from rye_seasonal_needs where id=(b->>'needId')::uuid and status not in ('pending','cancelled','completed','verified') for update;
  if not found then raise exception 'This club need is not available';end if;
  if coalesce(b->>'email','') !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' or length(trim(coalesce(b->>'organizationName','')))<2 then raise exception 'Enter company and billing email';end if;
  v_amount:=(b->>'amountCents')::integer;
  select coalesce((select sum(amount_cents) from rye_funding_allocations where need_id=n.id),0)+coalesce((select sum(amount_cents) from rye_orders where need_id=n.id and status='pending'),0) into v_used;
  if v_amount is null or v_amount<1000 or v_amount%1000<>0 or v_amount+v_used>n.funding_target_cents or not n.partial_funding and v_amount+v_used<>n.funding_target_cents then raise exception 'Choose a whole number of €10 places within the remaining funding need';end if;
  insert into rye_orders(kind,need_id,organization_name,email,billing_address,amount_cents,access_hash) values('sponsorship',n.id,left(trim(b->>'organizationName'),160),lower(trim(b->>'email')),trim(b->>'billingAddress'),v_amount,encode(digest(v_raw,'sha256'),'hex')) returning id into v_id;
 end if;
 perform rye_invoice_order(v_id);
 return jsonb_build_object('id',v_id,'accessToken',v_raw,'amountCents',v_amount,'expiresAt',(select expires_at from rye_orders where id=v_id));
end $$;
create function rye_order_status(p_id uuid,p_token text) returns jsonb language sql stable security definer set search_path=public,extensions as $$select jsonb_build_object('id',id,'status',status,'amount_cents',amount_cents,'kind',kind,'report_available',status='paid') from rye_orders where id=p_id and access_hash=encode(digest(p_token,'sha256'),'hex')$$;

create function rye_company_workspace(p_token text) returns jsonb language plpgsql stable security definer set search_path=public,extensions as $$
declare b rye_corporate_bookings%rowtype;
begin
 select * into b from rye_corporate_bookings where access_token_hash=encode(digest(p_token,'sha256'),'hex');if not found then return null;end if;
 return jsonb_build_object('booking',jsonb_build_object('id',b.id,'amount_cents',b.agreed_amount_cents,'status',b.status,'title',(select title from rye_volunteer_opportunities where id=b.opportunity_id),'paid',exists(select 1 from rye_orders where booking_id=b.id and status='paid')),'employees',coalesce((select jsonb_agg(jsonb_build_object('id',e.id,'email',e.email,'accepted_at',e.accepted_at,'status',p.status,'verified_minutes',case when p.organizer_verified then p.verified_minutes else 0 end)) from rye_employee_invites e left join rye_volunteer_placements p on p.volunteer_profile_id=e.volunteer_id and p.opportunity_id=b.opportunity_id where e.booking_id=b.id),'[]'));
end $$;
create function rye_invite_employees(p_token text,p_emails jsonb) returns integer language plpgsql security definer set search_path=public,extensions as $$
declare b rye_corporate_bookings%rowtype;e text;t text;i uuid;v_count integer:=0;
begin
 select * into b from rye_corporate_bookings where access_token_hash=encode(digest(p_token,'sha256'),'hex') for update;
 if not found or b.status='cancelled' or not exists(select 1 from rye_orders where booking_id=b.id and status='paid') then raise exception 'Pay the agreed project booking before inviting your team';end if;
 if jsonb_typeof(p_emails) is distinct from 'array' or jsonb_array_length(p_emails) not between 1 and 100 then raise exception 'Enter 1–100 employee email addresses';end if;
 for e in select lower(trim(value)) from jsonb_array_elements_text(p_emails) loop
  if e !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' or length(e)>254 then raise exception 'Invalid employee email';end if;
  t:=encode(gen_random_bytes(24),'hex');i:=null;
  insert into rye_employee_invites(booking_id,email,token_hash) values(b.id,e,encode(digest(t,'sha256'),'hex')) on conflict(booking_id,email) do nothing returning id into i;
  if i is not null then insert into rye_jobs(kind,payload,dedupe_key) values('email',jsonb_build_object('to',e,'subject','Your employee volunteering invitation','body','Your company has invited you to a sports volunteering project. Review the activity and confirm your own participation.','href','/employee/'||t),'employee:'||i) on conflict do nothing;v_count:=v_count+1;end if;
 end loop;return v_count;
end $$;
create function rye_accept_employee(p_invite text,p_volunteer text) returns uuid language plpgsql security definer set search_path=public,extensions as $$
declare e rye_employee_invites%rowtype;b rye_corporate_bookings%rowtype;v uuid:=rye_passport_identity(p_volunteer);p_id uuid;
begin
 if v is null then raise exception 'Sign in to your volunteer account first';end if;
 perform 1 from rye_volunteer_profiles where id=v for update;
 select * into e from rye_employee_invites where token_hash=encode(digest(p_invite,'sha256'),'hex') for update;
 if not found or not exists(select 1 from rye_volunteer_profiles p join auth.users u on lower(u.email)=p.email and u.email_confirmed_at is not null where p.id=v and p.email=e.email) then raise exception 'Verify the email address invited by your employer through sign-in';end if;
 select * into b from rye_corporate_bookings where id=e.booking_id;
 if b.status='cancelled' or not exists(select 1 from rye_orders where booking_id=b.id and status='paid') then raise exception 'This booking is not active';end if;
 insert into rye_volunteer_placements(opportunity_id,volunteer_profile_id,status,event_day,invited_at) select o.id,v,'invited',o.event_day,now() from rye_volunteer_opportunities o where o.id=b.opportunity_id on conflict(opportunity_id,volunteer_profile_id) do nothing;
 perform rye_join_public_activity(p_volunteer,b.opportunity_id,null);
 update rye_employee_invites set volunteer_id=v,accepted_at=now() where id=e.id;
 select id into p_id from rye_volunteer_placements where opportunity_id=b.opportunity_id and volunteer_profile_id=v;return p_id;
end $$;

alter function rye_claim_reward(text,uuid) rename to rye_claim_reward_previous;
revoke all on function rye_claim_reward_previous(text,uuid) from public,anon,authenticated;
create function rye_import_reward_units(p_token text,p_reward uuid,p_codes jsonb) returns integer language plpgsql security definer set search_path=public,extensions as $$
declare c text;v_count integer;added integer:=0;
begin
 if rye_admin_session_valid(p_token) is not true then raise exception 'Unauthorized';end if;
 perform 1 from rye_milestone_rewards where id=p_reward for update;if not found then raise exception 'Reward not found';end if;
 if jsonb_typeof(p_codes) is distinct from 'array' or jsonb_array_length(p_codes) not between 1 and 500 then raise exception 'Import 1–500 individual voucher codes';end if;
 for c in select trim(value) from jsonb_array_elements_text(p_codes) loop
  if length(c) not between 2 and 1000 then raise exception 'Invalid voucher code';end if;
  insert into rye_reward_units(reward_id,code) values(p_reward,c) on conflict do nothing;get diagnostics v_count=row_count;added:=added+v_count;
 end loop;
 if exists(select 1 from rye_reward_redemptions where reward_id=p_reward) and exists(select 1 from rye_milestone_rewards where id=p_reward and delivery_mode<>'unique_voucher') then raise exception 'Use a new reward for individual voucher inventory';end if;
 update rye_milestone_rewards set active=true,delivery_mode='unique_voucher',quantity=(select count(*) from rye_reward_units where reward_id=p_reward) where id=p_reward;
 return added;
end $$;
create function rye_claim_reward(p_invite_token text,p_reward_id uuid) returns jsonb language plpgsql security definer set search_path=public,extensions as $$
declare v uuid:=rye_passport_identity(p_invite_token);r rye_milestone_rewards%rowtype;u rye_reward_units%rowtype;previous jsonb;
begin
 if v is null then raise exception 'Unauthorized';end if;
 select * into r from rye_milestone_rewards where id=p_reward_id for update;
 if not found then raise exception 'Reward not found';end if;
 if r.delivery_mode<>'unique_voucher' then return rye_claim_reward_previous(p_invite_token,p_reward_id);end if;
 previous:=rye_claim_reward_previous(p_invite_token,p_reward_id);
 select * into u from rye_reward_units where reward_id=p_reward_id and volunteer_id=v;
 if not found then
  select * into u from rye_reward_units where reward_id=p_reward_id and volunteer_id is null order by created_at,id for update skip locked limit 1;
  if not found then raise exception 'No individual vouchers remain';end if;
  update rye_reward_units set volunteer_id=v,claimed_at=now() where id=u.id;
 end if;
 update rye_reward_redemptions set status='fulfilled' where reward_id=p_reward_id and volunteer_profile_id=v;
 return jsonb_build_object('claimed',true,'redemptionDetails',u.code);
end $$;
-- Keep an allocated unique code visible only to its owner on subsequent visits.
create function rye_my_reward_codes(p_token text) returns jsonb language plpgsql stable security definer set search_path=public,extensions as $$
declare v uuid:=rye_passport_identity(p_token);
begin if v is null then raise exception 'Unauthorized';end if;return coalesce((select jsonb_agg(jsonb_build_object('reward_id',u.reward_id,'title',r.title,'code',u.code)) from rye_reward_units u join rye_milestone_rewards r on r.id=u.reward_id where u.volunteer_id=v),'[]');end $$;

create function rye_automation_dashboard(p_token text) returns jsonb language plpgsql stable security definer set search_path=public,extensions as $$
begin
 if rye_admin_session_valid(p_token) is not true then raise exception 'Unauthorized';end if;
 return jsonb_build_object('jobs',coalesce((select jsonb_agg(to_jsonb(x)) from(select id,kind,status,attempts,last_error,available_at from rye_jobs where status<>'done' order by available_at limit 100)x),'[]'),'invoices',coalesce((select jsonb_agg(to_jsonb(x)) from(select i.*,a.name,a.email from rye_invoices i join rye_billing_accounts a on a.id=i.billing_account_id order by i.created_at desc limit 100)x),'[]'),'orders',coalesce((select jsonb_agg(to_jsonb(x)) from(select id,kind,organization_name,amount_cents,status,created_at from rye_orders order by created_at desc limit 100)x),'[]'),'exception_count',(select count(*) from rye_jobs where status='failed')+(select count(*) from rye_invoices where needs_review)+(select count(*) from rye_orders where status='review'));
end $$;
create function rye_retry_failed_jobs(p_token text) returns integer language plpgsql security definer set search_path=public,extensions as $$declare n integer;begin if rye_admin_session_valid(p_token) is not true then raise exception 'Unauthorized';end if;update rye_jobs set status='pending',attempts=0,available_at=now() where status='failed';get diagnostics n=row_count;return n;end $$;

-- Supabase pg_cron dispatch is configured only after the production URL and worker secret exist.
create function rye_dispatch_worker() returns void language plpgsql security definer set search_path=public,extensions as $$declare u text;s text;begin
 execute 'select decrypted_secret from vault.decrypted_secrets where name=''rye_worker_url'' limit 1' into u;
 execute 'select decrypted_secret from vault.decrypted_secrets where name=''rye_worker_secret'' limit 1' into s;
 if u is null or s is null then raise exception 'Worker scheduling is not configured';end if;
 execute 'select net.http_post(url:=$1,headers:=$2,body:=''{}''::jsonb,timeout_milliseconds:=300000)' using u,jsonb_build_object('Authorization','Bearer '||s,'Content-Type','application/json');
end $$;
create function rye_configure_worker(p_url text,p_secret text) returns boolean language plpgsql security definer set search_path=public,extensions as $$declare i uuid;begin
 if p_url !~ '^https://[^/]+/api/automation/run$' or length(p_secret)<32 then raise exception 'Invalid scheduler configuration';end if;
 if not exists(select 1 from pg_extension where extname='pg_cron') or not exists(select 1 from pg_extension where extname='pg_net') then raise exception 'Enable pg_cron and pg_net before activating the scheduler';end if;
 execute 'select id from vault.secrets where name=''rye_worker_url'' limit 1' into i;
 if i is null then execute 'select vault.create_secret($1,''rye_worker_url'')' using p_url;else execute 'select vault.update_secret($1,$2)' using i,p_url;end if;
 execute 'select id from vault.secrets where name=''rye_worker_secret'' limit 1' into i;
 if i is null then execute 'select vault.create_secret($1,''rye_worker_secret'')' using p_secret;else execute 'select vault.update_secret($1,$2)' using i,p_secret;end if;
 execute 'select cron.schedule(''rye_worker'',''*/5 * * * *'',''select public.rye_dispatch_worker()'')';return true;
end $$;

-- Explicit allowlist: no internal job, financial event or scheduler RPC is public.
do $$declare f record;begin
 for f in select p.oid::regprocedure signature,p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('rye_notify','rye_save_preferences','rye_candidates','rye_auto_match','rye_placement_notice','rye_activity_notice','rye_message_notice','rye_inbox','rye_accrue_charges','rye_guard_funding_change','rye_worker_tick','rye_claim_jobs','rye_finish_job','rye_club_billing','rye_create_order','rye_order_status','rye_company_workspace','rye_invite_employees','rye_accept_employee','rye_import_reward_units','rye_claim_reward','rye_my_reward_codes','rye_automation_dashboard','rye_retry_failed_jobs','rye_dispatch_worker','rye_configure_worker') loop
  execute format('revoke all on function %s from public,anon,authenticated',f.signature);
  execute format('grant execute on function %s to service_role',f.signature);
  if f.proname in ('rye_save_preferences','rye_inbox','rye_club_billing','rye_create_order','rye_order_status','rye_company_workspace','rye_invite_employees','rye_accept_employee','rye_import_reward_units','rye_claim_reward','rye_my_reward_codes','rye_automation_dashboard','rye_retry_failed_jobs') then execute format('grant execute on function %s to anon,authenticated',f.signature);end if;
 end loop;
end $$;

-- The legacy manual invoice path must not compete with the per-placement ledger.
revoke all on function rye_admin_prepare_volunteer_invoice(text,uuid) from public,anon,authenticated;
revoke all on function rye_admin_finalize_volunteer_billing(text,uuid) from public,anon,authenticated;
revoke all on function rye_admin_mark_volunteer_invoice(text,uuid,text,text) from public,anon,authenticated;
-- Only the server may create a financial reservation. Browser calls use the checked API.
revoke all on function rye_create_order(jsonb,text) from public,anon,authenticated;
create table rye_request_limits(bucket text primary key,window_at timestamptz not null default now(),attempts integer not null default 0);
alter table rye_request_limits enable row level security;revoke all on rye_request_limits from public,anon,authenticated;grant all on rye_request_limits to service_role;
create function rye_invoice_request_rate(p_bucket text) returns boolean language plpgsql security definer set search_path=public,extensions as $$declare n integer;begin
 insert into rye_request_limits(bucket,attempts) values(p_bucket,1) on conflict(bucket) do update set attempts=case when rye_request_limits.window_at<now()-interval '1 hour' then 1 else rye_request_limits.attempts+1 end,window_at=case when rye_request_limits.window_at<now()-interval '1 hour' then now() else rye_request_limits.window_at end returning attempts into n;return n<=15;
end $$;revoke all on function rye_invoice_request_rate(text) from public,anon,authenticated;grant execute on function rye_invoice_request_rate(text) to service_role;
create function rye_employee_preview(p_token text) returns jsonb language sql stable security definer set search_path=public,extensions as $$select jsonb_build_object('title',o.title,'organization_name',o.organization_name,'venue',o.venue,'shift_start',o.shift_start,'shift_end',o.shift_end,'role_description',o.role_description,'break_minutes',o.break_minutes) from rye_employee_invites e join rye_corporate_bookings b on b.id=e.booking_id join rye_volunteer_opportunities o on o.id=b.opportunity_id where e.token_hash=encode(digest(p_token,'sha256'),'hex') and b.status<>'cancelled'$$;
revoke all on function rye_employee_preview(text) from public,anon,authenticated;grant execute on function rye_employee_preview(text) to anon,authenticated;
create function rye_reward_stock_gate() returns trigger language plpgsql security definer set search_path=public,extensions as $$begin if new.delivery_mode='unique_voucher' then new.active=false;end if;return new;end $$;
revoke all on function rye_reward_stock_gate() from public,anon,authenticated;
create trigger rye_unique_reward_stock before insert on rye_milestone_rewards for each row execute function rye_reward_stock_gate();
create function rye_enqueue_ops_alert(p_email text) returns void language plpgsql security definer set search_path=public,extensions as $$declare n integer;begin
 select (select count(*) from rye_jobs where status='failed')+(select count(*) from rye_invoices where needs_review or status='uncollectible')+(select count(*) from rye_orders where status='review') into n;
 if n>0 then insert into rye_jobs(kind,payload,dedupe_key) values('email',jsonb_build_object('to',p_email,'subject','RunYourEvent operations need attention','body',n||' delivery or billing exception(s) need review. Routine matching and coordination continue automatically.','href','/admin/automation'),'ops-alert:'||to_char(now(),'YYYY-MM-DD-HH24')) on conflict do nothing;end if;
end $$;revoke all on function rye_enqueue_ops_alert(text) from public,anon,authenticated;grant execute on function rye_enqueue_ops_alert(text) to service_role;
create function rye_unbilled_funding_adjustment() returns trigger language plpgsql security definer set search_path=public,extensions as $$begin update rye_charges set status='review' where placement_id=new.placement_id and kind='placement' and invoice_id is null;return new;end $$;
revoke all on function rye_unbilled_funding_adjustment() from public,anon,authenticated;
create trigger rye_remove_sponsored_unbilled_fee after insert on rye_placement_funding for each row execute function rye_unbilled_funding_adjustment();

-- Employee membership requires a capability minted after a confirmed-email sign-in.
alter table rye_volunteer_profiles add column email_verified_at timestamptz;
create or replace function rye_recover_account(p_role text) returns jsonb language plpgsql security definer set search_path=public,extensions as $$
declare v_email text;v_account uuid;v_token text:=encode(gen_random_bytes(24),'hex');
begin
 select lower(email) into v_email from auth.users where id=auth.uid() and email_confirmed_at is not null;
 if auth.uid() is null or coalesce(v_email,'')='' or p_role not in ('volunteer','club') then raise exception 'Verified sign-in required';end if;
 if p_role='volunteer' then
  update rye_volunteer_profiles set email_verified_at=now(),access_token_hash=encode(digest(v_token,'sha256'),'hex') where email=v_email and status='active' returning id into v_account;
  if v_account is not null then update rye_volunteer_placements set invite_token_hash=null where volunteer_profile_id=v_account;end if;
 else
  select id into v_account from rye_club_accounts where owner_email=v_email order by created_at desc limit 1;
  if v_account is not null then update rye_club_accounts set access_token_hash=encode(digest(v_token,'sha256'),'hex') where id=v_account;update rye_seasonal_needs set club_account_id=v_account where club_account_id in(select id from rye_club_accounts where owner_email=v_email);end if;
 end if;
 if v_account is null then raise exception 'No active account was found for this verified address';end if;return jsonb_build_object('accessToken',v_token);
end $$;
do $$declare definition text;begin
 definition:=pg_get_functiondef('public.rye_accept_employee(text,text)'::regprocedure);
 definition:=replace(definition,'where p.id=v and p.email=e.email','where p.id=v and p.email_verified_at is not null and p.email=e.email');execute definition;
end $$;
create function rye_certificate_notice() returns trigger language plpgsql security definer set search_path=public,extensions as $$
begin
 perform rye_notify(new.volunteer_profile_id,null,'recognition',case when new.revoked_at is not null then 'Certificate record updated' else initcap(new.tier)||' certificate ready' end,'Your verified contribution record has been updated.','/volunteer','certificate:'||new.id||':'||coalesce(new.revoked_at::text,'issued'));
 return new;
end $$;
revoke all on function rye_certificate_notice() from public,anon,authenticated;
create trigger rye_certificate_notifications after insert or update of revoked_at on rye_volunteer_certificates for each row execute function rye_certificate_notice();

-- Invoice-only billing: no payment processor, saved cards or automatic collection.
create table rye_billing_audit(id uuid primary key default gen_random_uuid(),invoice_id uuid not null references rye_invoices(id),action text not null,reference text not null,created_at timestamptz not null default now());
alter table rye_billing_audit enable row level security;
revoke all on rye_billing_audit from public,anon,authenticated;grant all on rye_billing_audit to service_role;
create function rye_invoice_order(p_id uuid) returns uuid language plpgsql security definer set search_path=public,extensions as $$
declare o rye_orders%rowtype;a uuid;i uuid;
begin
 select * into o from rye_orders where id=p_id for update;
 if not found or o.status<>'pending' then raise exception 'Order is not awaiting invoicing';end if;
 select id into i from rye_invoices where order_id=o.id;if found then return i;end if;
 insert into rye_billing_accounts(email,name,address) values(o.email,o.organization_name,o.billing_address) returning id into a;
 insert into rye_invoices(billing_account_id,amount_cents,order_id) values(a,o.amount_cents,o.id) returning id into i;
 insert into rye_jobs(kind,payload,dedupe_key) values('invoice',jsonb_build_object('invoiceId',i),'invoice:'||i);
 return i;
end $$;
create function rye_store_invoice_snapshot(p_id uuid,p_snapshot jsonb) returns jsonb language plpgsql security definer set search_path=public,extensions as $$
declare i rye_invoices%rowtype;
begin
 select * into i from rye_invoices where id=p_id for update;
 if not found or i.needs_review or i.status not in ('draft','open') then raise exception 'Invoice is not issuable';end if;
 if i.snapshot is null then update rye_invoices set snapshot=p_snapshot,due_at=(p_snapshot->>'dueAt')::timestamptz where id=i.id;end if;
 return (select snapshot from rye_invoices where id=i.id);
end $$;
create function rye_mark_invoice_sent(p_id uuid) returns boolean language plpgsql security definer set search_path=public,extensions as $$
begin update rye_invoices set status='open',sent_at=coalesce(sent_at,now()) where id=p_id and status in ('draft','open') and snapshot is not null and not needs_review;return found;end $$;
create function rye_record_invoice_payment(p_token text,p_id uuid,p_reference text) returns boolean language plpgsql security definer set search_path=public,extensions as $$
declare i rye_invoices%rowtype;o rye_orders%rowtype;c uuid;used integer;
begin
 if rye_admin_session_valid(p_token) is not true then raise exception 'Unauthorized';end if;
 if length(trim(p_reference)) not between 4 and 240 then raise exception 'Enter the bank transaction reference';end if;
 select * into i from rye_invoices where id=p_id for update;
 if not found then raise exception 'Invoice not found';end if;
 if i.status='paid' then return true;end if;
 if i.status<>'open' or i.needs_review or i.sent_at is null then raise exception 'Only issued invoices without disputes can be settled';end if;
 if i.order_id is not null then
  select * into o from rye_orders where id=i.order_id for update;
  if o.status<>'pending' then raise exception 'Order needs review before recording payment';end if;
  if o.kind='sponsorship' then
   perform 1 from rye_seasonal_needs where id=o.need_id for update;
   select coalesce(sum(amount_cents),0) into used from rye_funding_allocations where need_id=o.need_id;
   if used+o.amount_cents>(select funding_target_cents from rye_seasonal_needs where id=o.need_id) then raise exception 'Sponsorship capacity changed; resolve this payment as an exception';end if;
   insert into rye_sponsor_campaigns(sponsor_name,budget_cents,starts_on,ends_on,access_token_hash) select o.organization_name,o.amount_cents,current_date,greatest(current_date,season_end),o.access_hash from rye_seasonal_needs where id=o.need_id returning id into c;
   insert into rye_funding_allocations(campaign_id,need_id,amount_cents) values(c,o.need_id,o.amount_cents);
   update rye_orders set campaign_id=c where id=o.id;
  end if;
  update rye_orders set status='paid',paid_at=now() where id=o.id;
 end if;
 update rye_invoices set status='paid',paid_at=now(),payment_reference=trim(p_reference) where id=i.id;
 insert into rye_billing_audit(invoice_id,action,reference) values(i.id,'payment_recorded',trim(p_reference));return true;
end $$;
create function rye_invoice_reminders() returns void language plpgsql security definer set search_path=public,extensions as $$
declare i record;d integer;
begin
 for i in select * from rye_invoices where status='open' and not needs_review and sent_at is not null and due_at<now() loop
 d:=floor(extract(epoch from now()-i.due_at)/86400)::integer;
 if d>=1 then insert into rye_jobs(kind,payload,dedupe_key) values('invoice',jsonb_build_object('invoiceId',i.id,'reminder',true),'invoice-reminder:'||i.id||':'||case when d>=14 then 14 when d>=7 then 7 else 1 end) on conflict do nothing;end if;
 end loop;
end $$;
do $$declare f record;begin
 for f in select p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('rye_invoice_order','rye_store_invoice_snapshot','rye_mark_invoice_sent','rye_record_invoice_payment','rye_invoice_reminders') loop
 execute format('revoke all on function %s from public,anon,authenticated',f.signature);execute format('grant execute on function %s to service_role',f.signature);
 end loop;
end $$;
create function rye_update_billing_address(p_token text,p_address text) returns boolean language plpgsql security definer set search_path=public,extensions as $$
declare c uuid:=rye_club_identity(p_token);
begin
 if c is null then raise exception 'Unauthorized';end if;
 if length(trim(p_address)) not between 8 and 2000 then raise exception 'Enter a complete billing address';end if;
 insert into rye_billing_accounts(club_id,email,name,address) select c,owner_email,coalesce((select organization_name from rye_seasonal_needs where club_account_id=c limit 1),'Sports club'),trim(p_address) from rye_club_accounts where id=c on conflict(club_id) do update set address=excluded.address;
 update rye_jobs set status='pending',attempts=0,available_at=now() where status='failed' and kind='invoice' and payload->>'invoiceId' in (select i.id::text from rye_invoices i join rye_billing_accounts a on a.id=i.billing_account_id where a.club_id=c and i.sent_at is null and not i.needs_review);return true;
end $$;
revoke all on function rye_update_billing_address(text,text) from public,anon,authenticated;grant execute on function rye_update_billing_address(text,text) to anon,authenticated,service_role;
create function rye_void_invoice(p_token text,p_id uuid,p_reason text) returns boolean language plpgsql security definer set search_path=public,extensions as $$
declare i rye_invoices%rowtype;
begin
 if rye_admin_session_valid(p_token) is not true then raise exception 'Unauthorized';end if;
 if length(trim(p_reason)) not between 10 and 500 then raise exception 'Enter the cancellation reason';end if;
 select * into i from rye_invoices where id=p_id for update;
 if not found or i.status='paid' then raise exception 'Paid invoices require a credit-note review';end if;
 if i.status='void' then return true;end if;
 update rye_invoices set status='void' where id=i.id;
 update rye_orders set status='expired' where id=i.order_id and status='pending';
 update rye_jobs set status='done',leased_until=null where kind='invoice' and payload->>'invoiceId'=i.id::text and status='pending';
 insert into rye_billing_audit(invoice_id,action,reference) values(i.id,'voided',trim(p_reason));return true;
end $$;
revoke all on function rye_void_invoice(text,uuid,text) from public,anon,authenticated;grant execute on function rye_void_invoice(text,uuid,text) to service_role;
alter table rye_milestone_rewards add column auto_deliver boolean not null default false;
create function rye_set_reward_automation(p_token text,p_reward uuid,p_enabled boolean) returns boolean language plpgsql security definer set search_path=public,extensions as $$
begin
 if rye_admin_session_valid(p_token) is not true then raise exception 'Unauthorized';end if;
 update rye_milestone_rewards set auto_deliver=p_enabled where id=p_reward and delivery_mode='unique_voucher';return found;
end $$;
create function rye_deliver_milestone_rewards() returns integer language plpgsql security definer set search_path=public,extensions as $$
declare r record;v record;u uuid;cnt integer:=0;
begin
 for r in select * from rye_milestone_rewards where active and auto_deliver and delivery_mode='unique_voucher' and expires_on>=current_date order by created_at,id for update skip locked loop
  for v in select p.id from rye_volunteer_profiles p join rye_volunteer_progress g on g.volunteer_profile_id=p.id where p.status='active' and g.credited_minutes>=case r.tier when 'gold' then 3600 when 'silver' then 2400 else 1200 end order by p.created_at,p.id for update of p skip locked loop
   if exists(select 1 from rye_reward_redemptions d join rye_milestone_rewards m on m.id=d.reward_id where d.volunteer_profile_id=v.id and m.tier=r.tier and d.status<>'cancelled') then continue;end if;
   select id into u from rye_reward_units where reward_id=r.id and volunteer_id is null order by created_at,id for update skip locked limit 1;
   if u is null then exit;end if;
   insert into rye_reward_redemptions(reward_id,volunteer_profile_id,status) values(r.id,v.id,'fulfilled');
   update rye_reward_units set volunteer_id=v.id,claimed_at=now() where id=u;
   perform rye_notify(v.id,null,'reward','Your milestone reward is ready',r.title||' has been assigned to you. Open your passport to see your private voucher.','/volunteer','auto-reward:'||v.id||':'||r.tier);cnt:=cnt+1;
  end loop;
 end loop;return cnt;
end $$;
revoke all on function rye_set_reward_automation(text,uuid,boolean) from public,anon,authenticated;grant execute on function rye_set_reward_automation(text,uuid,boolean) to service_role;
revoke all on function rye_deliver_milestone_rewards() from public,anon,authenticated;grant execute on function rye_deliver_milestone_rewards() to service_role;

