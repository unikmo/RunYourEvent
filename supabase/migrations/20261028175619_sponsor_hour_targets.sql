alter table public.rye_sponsor_enquiries add column enquiry_type text not null default 'sponsorship' check(enquiry_type in ('sponsorship','employee_project')), add column team_size integer check(team_size between 1 and 500), add column hours_per_employee integer check(hours_per_employee between 2 and 8);
-- Enquiry targets are distinct from contracted hours, money and verified delivery.
alter table public.rye_sponsor_enquiries add column requested_hours integer check(requested_hours between 25 and 1000000);
alter table public.rye_sponsor_campaigns add column target_hours integer check(target_hours between 25 and 1000000);
alter function public.rye_submit_community(text,jsonb) rename to rye_submit_community_before_hour_targets;
revoke all on function public.rye_submit_community_before_hour_targets(text,jsonb) from public,anon,authenticated;
create function public.rye_submit_community(p_action text,p_payload jsonb) returns uuid language plpgsql security definer set search_path=public,extensions as $$
declare v_id uuid;v_hours integer;v_kind text:=coalesce(p_payload->>'enquiryType','sponsorship');v_team integer;v_per integer;
begin
 if p_action is null or p_action not in ('seasonal_need','sponsor_enquiry') then raise exception 'Choose a valid enquiry action';end if;
 if p_action='sponsor_enquiry' then
  if v_kind not in ('sponsorship','employee_project') then raise exception 'Choose sponsorship or an employee project';end if;
  if v_kind='employee_project' then
   if jsonb_typeof(p_payload->'teamSize') is distinct from 'number' or coalesce(p_payload->>'teamSize','') !~ '^[0-9]{1,3}$' or jsonb_typeof(p_payload->'hoursPerEmployee') is distinct from 'number' or coalesce(p_payload->>'hoursPerEmployee','') !~ '^[0-9]$' then raise exception 'Enter the team size and hours per employee';end if;
   v_team:=(p_payload->>'teamSize')::integer;v_per:=(p_payload->>'hoursPerEmployee')::integer;
   if v_team not between 1 and 500 or v_per not between 2 and 8 then raise exception 'Choose 1–500 employees and 2–8 hours per employee';end if;
  else
  if jsonb_typeof(p_payload->'requestedHours') is distinct from 'number' or coalesce(p_payload->>'requestedHours','') !~ '^[0-9]{1,7}$' then raise exception 'Choose a whole number of volunteer-hours, starting at 25';end if;
  v_hours:=(p_payload->>'requestedHours')::integer;
  if v_hours not between 25 and 1000000 then raise exception 'Choose 25–1000000 volunteer-hours';end if;
  end if;
 end if;
 v_id:=rye_submit_community_before_hour_targets(p_action,p_payload);
 if p_action='sponsor_enquiry' then update rye_sponsor_enquiries set requested_hours=v_hours,enquiry_type=v_kind,team_size=v_team,hours_per_employee=v_per where id=v_id;end if;
 return v_id;
end $$;
revoke all on function public.rye_submit_community(text,jsonb) from public,anon,authenticated;
grant execute on function public.rye_submit_community(text,jsonb) to anon,authenticated,service_role;

alter function public.rye_admin_community_action(text,text,jsonb) rename to rye_admin_community_action_before_hour_targets;
revoke all on function public.rye_admin_community_action_before_hour_targets(text,text,jsonb) from public,anon,authenticated;
create function public.rye_admin_community_action(p_token text,p_action text,p_payload jsonb) returns jsonb language plpgsql security definer set search_path=public,extensions as $$
declare r jsonb;h integer;
begin
 if rye_admin_session_valid(p_token) is not true then raise exception 'Unauthorized';end if;
 if p_action='create_campaign' and nullif(p_payload->>'targetHours','') is not null then
  if jsonb_typeof(p_payload->'targetHours') is distinct from 'number' or p_payload->>'targetHours' !~ '^[0-9]{1,7}$' then raise exception 'Agreed hour targets must be whole hours';end if;
  h:=(p_payload->>'targetHours')::integer;
  if h not between 25 and 1000000 then raise exception 'An agreed hour target starts at 25 hours';end if;
 end if;
 r:=rye_admin_community_action_before_hour_targets(p_token,p_action,p_payload);
 if p_action='create_campaign' and h is not null then update rye_sponsor_campaigns set target_hours=h where id=(r->>'id')::uuid;end if;
 return r;
end $$;
revoke all on function public.rye_admin_community_action(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.rye_admin_community_action(text,text,jsonb) to anon,authenticated,service_role;

alter function public.rye_sponsor_report(text) rename to rye_sponsor_report_before_hour_targets;
revoke all on function public.rye_sponsor_report_before_hour_targets(text) from public,anon,authenticated;
create function public.rye_sponsor_report(p_token text) returns jsonb language plpgsql stable security definer set search_path=public,extensions as $$
declare r jsonb;h integer;
begin
 r:=rye_sponsor_report_before_hour_targets(p_token);if r is null then return null;end if;
 select target_hours into h from rye_sponsor_campaigns where access_token_hash=encode(extensions.digest(p_token,'sha256'),'hex');
 return r||jsonb_build_object('target_hours',h,'report_kind',case when exists(select 1 from rye_sponsor_campaigns where access_token_hash=encode(extensions.digest(p_token,'sha256'),'hex')) then 'sponsorship' else 'employee_project' end);
end $$;
revoke all on function public.rye_sponsor_report(text) from public,anon,authenticated;
grant execute on function public.rye_sponsor_report(text) to anon,authenticated,service_role;
