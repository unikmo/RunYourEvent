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
      'confirmedPlacements',(select count(*) from public.rye_volunteer_placements where status in ('accepted','reconfirmed','checked_in','confirmed','completed')),
      'attendedPlacements',(select count(*) from public.rye_volunteer_placements where billable_at is not null),
      'certificateEligible',(select count(*) from public.rye_volunteer_progress where certificate_eligible),
      'protectionRequired',(select count(*) from public.rye_volunteer_organizer_requests where protection_required and status not in ('closed')),
      'billableOneOffCents',(select coalesce(sum(total_amount_cents),0) from public.rye_volunteer_oneoff_billing)
    ),
    'organizers',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from (
      select id,organization_name,contact_name,contact_email,city,pipeline,event_name,event_date,season_label,volunteers_needed,status,created_at,coverage_status,protection_selected,protection_required,protection_status,venue,shift_start_local,shift_end_local,transport_mode,transport_details
      from public.rye_volunteer_organizer_requests order by created_at desc limit 50
    ) x),'[]'::jsonb),
    'volunteers',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from (
      select p.id,p.first_name,p.last_name,p.email,p.city,p.age_band,p.status,p.created_at,coalesce(v.credited_minutes,0) credited_minutes,coalesce(v.points,0) points,coalesce(v.distinct_event_days,0) distinct_event_days,coalesce(v.certificate_eligible,false) certificate_eligible
      from public.rye_volunteer_profiles p left join public.rye_volunteer_progress v on v.volunteer_profile_id=p.id order by p.created_at desc limit 100
    ) x),'[]'::jsonb),
    'opportunities',coalesce((select jsonb_agg(to_jsonb(x) order by x.event_day desc,x.shift_start desc) from (
      select id,organizer_request_id,title,organization_name,event_name,city,venue,event_day,shift_start,shift_end,slots_total,role_description,status,transport_mode,transport_details,event_checkin_code,protection_mode,protection_status
      from public.rye_volunteer_opportunities order by event_day desc,shift_start desc limit 100
    ) x),'[]'::jsonb),
    'placements',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from (
      select pl.id,pl.status,pl.event_day,pl.invited_at,pl.accepted_at,pl.reconfirmed_at,pl.checked_in_at,pl.checked_out_at,pl.billable_at,pl.verified_minutes,pl.organizer_verified,pl.created_at,o.title opportunity_title,o.organization_name,p.first_name,p.last_name
      from public.rye_volunteer_placements pl join public.rye_volunteer_opportunities o on o.id=pl.opportunity_id join public.rye_volunteer_profiles p on p.id=pl.volunteer_profile_id order by pl.created_at desc limit 100
    ) x),'[]'::jsonb),
    'billing',coalesce((select jsonb_agg(to_jsonb(x) order by x.organization_name) from (select * from public.rye_volunteer_oneoff_billing where successful_placements>0) x),'[]'::jsonb)
  ) into v_result;
  return v_result;
end $$;
grant execute on function public.rye_admin_volunteer_dashboard(text) to anon,authenticated;
