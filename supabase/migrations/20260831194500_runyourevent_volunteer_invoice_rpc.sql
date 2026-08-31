create or replace function public.rye_admin_prepare_volunteer_invoice(p_token text,p_request_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_valid boolean; v_b record; v_id uuid;
begin
  select public.rye_admin_session_valid(p_token) into v_valid; if coalesce(v_valid,false) is not true then raise exception 'unauthorized'; end if;
  select * into v_b from public.rye_volunteer_oneoff_billing where organizer_request_id=p_request_id;
  if not found or v_b.successful_placements<1 then raise exception 'no billable attendance'; end if;
  if exists(select 1 from public.rye_volunteer_billing_runs where organizer_request_id=p_request_id and status in ('invoicing','sent','paid')) then raise exception 'billing already in progress or completed'; end if;
  insert into public.rye_volunteer_billing_runs(organizer_request_id,successful_placements,unit_fee_cents,placement_amount_cents,protection_volunteer_days,protection_amount_cents,total_amount_cents,status)
  values(p_request_id,v_b.successful_placements,v_b.unit_fee_cents,v_b.placement_amount_cents,v_b.protection_volunteer_days,v_b.protection_amount_cents,v_b.total_amount_cents,'invoicing') returning id into v_id;
  return jsonb_build_object('billingRunId',v_id,'requestId',p_request_id,'organizationName',v_b.organization_name,'customerEmail',v_b.contact_email,'successfulPlacements',v_b.successful_placements,'unitFeeCents',v_b.unit_fee_cents,'placementAmountCents',v_b.placement_amount_cents,'protectionVolunteerDays',v_b.protection_volunteer_days,'protectionAmountCents',v_b.protection_amount_cents,'totalAmountCents',v_b.total_amount_cents);
end $$;
grant execute on function public.rye_admin_prepare_volunteer_invoice(text,uuid) to anon,authenticated;

create or replace function public.rye_admin_mark_volunteer_invoice(p_token text,p_billing_run_id uuid,p_status text,p_stripe_invoice_id text)
returns boolean language plpgsql security definer set search_path=public as $$
declare v_valid boolean;
begin
  select public.rye_admin_session_valid(p_token) into v_valid; if coalesce(v_valid,false) is not true then raise exception 'unauthorized'; end if;
  if p_status not in ('sent','paid','failed','cancelled') then raise exception 'invalid billing status'; end if;
  update public.rye_volunteer_billing_runs set status=p_status,stripe_invoice_id=nullif(left(coalesce(p_stripe_invoice_id,''),160),''),updated_at=now() where id=p_billing_run_id;
  return found;
end $$;
grant execute on function public.rye_admin_mark_volunteer_invoice(text,uuid,text,text) to anon,authenticated;
