create or replace function public.rye_admin_invite_volunteer(p_token text,p_opportunity_id uuid,p_volunteer_id uuid)
returns text language plpgsql security definer set search_path=public as $$
declare v_valid boolean; v_raw text; v_hash text;
begin
  select public.rye_admin_session_valid(p_token) into v_valid; if coalesce(v_valid,false) is not true then raise exception 'unauthorized'; end if;
  v_raw:=encode(gen_random_bytes(24),'hex'); v_hash:=encode(extensions.digest(v_raw,'sha256'),'hex');
  insert into public.rye_volunteer_placements(opportunity_id,volunteer_profile_id,status,event_day,invite_token_hash,invited_at)
  select o.id,p_volunteer_id,'invited',o.event_day,v_hash,now() from public.rye_volunteer_opportunities o where o.id=p_opportunity_id
  on conflict(opportunity_id,volunteer_profile_id) do update set status='invited',invite_token_hash=v_hash,invited_at=now(),accepted_at=null,reconfirmed_at=null,checked_in_at=null,checked_out_at=null,billable_at=null,updated_at=now();
  return v_raw;
end $$;

create or replace function public.rye_volunteer_invite_lookup(p_invite_token text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_hash text; v_result jsonb;
begin
  v_hash:=encode(extensions.digest(coalesce(p_invite_token,''),'sha256'),'hex');
  select jsonb_build_object('placementId',pl.id,'status',pl.status,'acceptedAt',pl.accepted_at,'reconfirmedAt',pl.reconfirmed_at,'checkedInAt',pl.checked_in_at,'checkedOutAt',pl.checked_out_at,'eventDay',pl.event_day,
    'volunteer',jsonb_build_object('firstName',p.first_name,'lastName',p.last_name),
    'opportunity',jsonb_build_object('id',o.id,'title',o.title,'organizationName',o.organization_name,'eventName',o.event_name,'city',o.city,'venue',o.venue,'eventDay',o.event_day,'shiftStart',o.shift_start,'shiftEnd',o.shift_end,'roleDescription',o.role_description,'transportMode',o.transport_mode,'transportDetails',o.transport_details))
  into v_result from public.rye_volunteer_placements pl join public.rye_volunteer_profiles p on p.id=pl.volunteer_profile_id join public.rye_volunteer_opportunities o on o.id=pl.opportunity_id where pl.invite_token_hash=v_hash;
  if v_result is null then raise exception 'invalid invitation'; end if; return v_result;
end $$;

create or replace function public.rye_volunteer_respond_invite(p_invite_token text,p_action text)
returns text language plpgsql security definer set search_path=public as $$
declare v_hash text; v_status text;
begin
  if p_action not in ('accept','decline','reconfirm') then raise exception 'invalid action'; end if;
  v_hash:=encode(extensions.digest(coalesce(p_invite_token,''),'sha256'),'hex');
  if p_action='accept' then update public.rye_volunteer_placements set status='accepted',accepted_at=now(),updated_at=now() where invite_token_hash=v_hash and status in ('invited','applied') returning status into v_status;
  elsif p_action='decline' then update public.rye_volunteer_placements set status='declined',updated_at=now() where invite_token_hash=v_hash and status not in ('completed','cancelled') returning status into v_status;
  else update public.rye_volunteer_placements set status='reconfirmed',reconfirmed_at=now(),updated_at=now() where invite_token_hash=v_hash and status in ('accepted','reconfirmed') returning status into v_status; end if;
  if v_status is null then raise exception 'invitation state does not allow this action'; end if; return v_status;
end $$;

create or replace function public.rye_volunteer_event_status(p_invite_token text,p_event_code text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_hash text; v_result jsonb;
begin
  v_hash:=encode(extensions.digest(coalesce(p_invite_token,''),'sha256'),'hex');
  select jsonb_build_object('placementId',pl.id,'status',pl.status,'checkedInAt',pl.checked_in_at,'checkedOutAt',pl.checked_out_at,'title',o.title,'organizationName',o.organization_name,'shiftStart',o.shift_start,'shiftEnd',o.shift_end,'venue',o.venue)
  into v_result from public.rye_volunteer_placements pl join public.rye_volunteer_opportunities o on o.id=pl.opportunity_id where pl.invite_token_hash=v_hash and o.event_checkin_code=p_event_code;
  if v_result is null then raise exception 'shift not found'; end if; return v_result;
end $$;

create or replace function public.rye_volunteer_event_action(p_invite_token text,p_event_code text,p_action text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_hash text; v_pl public.rye_volunteer_placements%rowtype; v_now timestamptz:=now(); v_minutes integer;
begin
  if p_action not in ('check_in','check_out') then raise exception 'invalid action'; end if;
  v_hash:=encode(extensions.digest(coalesce(p_invite_token,''),'sha256'),'hex');
  select pl.* into v_pl from public.rye_volunteer_placements pl join public.rye_volunteer_opportunities o on o.id=pl.opportunity_id where pl.invite_token_hash=v_hash and o.event_checkin_code=p_event_code for update of pl;
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
