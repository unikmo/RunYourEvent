-- Store the terms behind an hour package; no guessed hourly selling price.
alter table public.rye_sponsor_campaigns add column agreement_reference text, add column agreed_scope text, add column shortfall_terms text, add column tax_terms text;
alter function public.rye_admin_community_action(text,text,jsonb) rename to rye_admin_community_action_before_agreement;
revoke all on function public.rye_admin_community_action_before_agreement(text,text,jsonb) from public,anon,authenticated;
create function public.rye_admin_community_action(p_token text,p_action text,p_payload jsonb) returns jsonb language plpgsql security definer set search_path=public,extensions as $$
declare r jsonb;k text;
begin
 if rye_admin_session_valid(p_token) is not true then raise exception 'Unauthorized';end if;
 if p_action='create_campaign' and nullif(p_payload->>'targetHours','') is not null then
  foreach k in array array['agreementReference','agreedScope','shortfallTerms','taxTerms'] loop
   if jsonb_typeof(p_payload->k) is distinct from 'string' or length(trim(coalesce(p_payload->>k,'')))<(case when k in ('agreedScope','shortfallTerms') then 20 else 5 end) or length(p_payload->>k)>4000 then
    raise exception 'Record the written agreement reference, scope, tax treatment and undelivered-hours terms before creating an hour package';
   end if;
  end loop;
 end if;
 r:=rye_admin_community_action_before_agreement(p_token,p_action,p_payload);
 if p_action='create_campaign' and nullif(p_payload->>'targetHours','') is not null then
  update rye_sponsor_campaigns set agreement_reference=trim(p_payload->>'agreementReference'),agreed_scope=trim(p_payload->>'agreedScope'),shortfall_terms=trim(p_payload->>'shortfallTerms'),tax_terms=trim(p_payload->>'taxTerms') where id=(r->>'id')::uuid;
 end if;
 return r;
end $$;
revoke all on function public.rye_admin_community_action(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.rye_admin_community_action(text,text,jsonb) to anon,authenticated,service_role;
alter function public.rye_sponsor_report(text) rename to rye_sponsor_report_before_agreement;
revoke all on function public.rye_sponsor_report_before_agreement(text) from public,anon,authenticated;
create function public.rye_sponsor_report(p_token text) returns jsonb language plpgsql stable security definer set search_path=public,extensions as $$
declare r jsonb;agreement jsonb;
begin
 r:=rye_sponsor_report_before_agreement(p_token);if r is null then return null;end if;
 select jsonb_build_object('reference',agreement_reference,'scope',agreed_scope,'shortfallTerms',shortfall_terms,'taxTerms',tax_terms) into agreement from rye_sponsor_campaigns where access_token_hash=encode(digest(p_token,'sha256'),'hex') and agreement_reference is not null;
 return r||jsonb_build_object('agreement',agreement);
end $$;
revoke all on function public.rye_sponsor_report(text) from public,anon,authenticated;
grant execute on function public.rye_sponsor_report(text) to anon,authenticated,service_role;
