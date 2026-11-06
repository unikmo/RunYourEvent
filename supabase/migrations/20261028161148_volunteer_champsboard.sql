-- Public Champsboard uses an explicit, reversible opt-in distinct from a shareable page.
alter table rye_volunteer_profiles add column country_code text check(country_code is null or country_code in ('AD','AE','AF','AG','AI','AL','AM','AO','AQ','AR','AS','AT','AU','AW','AX','AZ','BA','BB','BD','BE','BF','BG','BH','BI','BJ','BL','BM','BN','BO','BQ','BR','BS','BT','BV','BW','BY','BZ','CA','CC','CD','CF','CG','CH','CI','CK','CL','CM','CN','CO','CR','CU','CV','CW','CX','CY','CZ','DE','DJ','DK','DM','DO','DZ','EC','EE','EG','EH','ER','ES','ET','FI','FJ','FK','FM','FO','FR','GA','GB','GD','GE','GF','GG','GH','GI','GL','GM','GN','GP','GQ','GR','GS','GT','GU','GW','GY','HK','HM','HN','HR','HT','HU','ID','IE','IL','IM','IN','IO','IQ','IR','IS','IT','JE','JM','JO','JP','KE','KG','KH','KI','KM','KN','KP','KR','KW','KY','KZ','LA','LB','LC','LI','LK','LR','LS','LT','LU','LV','LY','MA','MC','MD','ME','MF','MG','MH','MK','ML','MM','MN','MO','MP','MQ','MR','MS','MT','MU','MV','MW','MX','MY','MZ','NA','NC','NE','NF','NG','NI','NL','NO','NP','NR','NU','NZ','OM','PA','PE','PF','PG','PH','PK','PL','PM','PN','PR','PS','PT','PW','PY','QA','RE','RO','RS','RU','RW','SA','SB','SC','SD','SE','SG','SH','SI','SJ','SK','SL','SM','SN','SO','SR','SS','ST','SV','SX','SY','SZ','TC','TD','TF','TG','TH','TJ','TK','TL','TM','TN','TO','TR','TT','TV','TW','TZ','UA','UG','UM','US','UY','UZ','VA','VC','VE','VG','VI','VN','VU','WF','WS','YE','YT','ZA','ZM','ZW')), add column champsboard_enabled boolean not null default false;
create index rye_champsboard_location on rye_volunteer_profiles(country_code,lower(trim(city))) where champsboard_enabled and public_enabled and status='active';
create function rye_save_public_profile(p_token text,p_display_name text,p_slug text,p_public boolean,p_champsboard boolean,p_country text) returns boolean language plpgsql security definer set search_path=public,extensions as $$
declare v uuid:=rye_passport_identity(p_token);country text:=nullif(upper(trim(p_country)),'');
begin
 if v is null then raise exception 'Unauthorized';end if;
 if p_champsboard is null or country is not null and country !~ '^[A-Z]{2}$' then raise exception 'Choose a valid country';end if;
 if p_champsboard and (not p_public or country is null) then raise exception 'Publish your profile and choose a country to join the Champsboard';end if;
 perform rye_update_volunteer_visibility(p_token,p_display_name,p_public,p_slug);
 update rye_volunteer_profiles set country_code=country,champsboard_enabled=p_champsboard where id=v;return true;
end $$;
create function rye_champsboard(p_country text default null,p_city text default null,p_period text default 'all',p_page integer default 1) returns jsonb language plpgsql stable security definer set search_path=public,extensions as $$
declare result jsonb;c text:=nullif(upper(trim(p_country)),'');town text:=nullif(trim(p_city),'');
begin
 if c is not null and c !~ '^[A-Z]{2}$' or town is not null and (c is null or length(town)>120) or p_period is null or p_period not in ('all','year') or p_page is null or p_page not between 1 and 10000 then raise exception 'Invalid Champsboard filters';end if;
 with eligible as (
 select p.id,p.display_name,p.public_slug,p.country_code,p.city,g.credited_minutes lifetime_minutes,
 coalesce((select sum(pl.verified_minutes) from rye_volunteer_placements pl where pl.volunteer_profile_id=p.id and pl.organizer_verified and pl.status='completed' and (p_period='all' or extract(year from pl.event_day)=extract(year from now() at time zone 'Europe/Berlin'))),0)::integer minutes
 from rye_volunteer_profiles p join rye_volunteer_progress g on g.volunteer_profile_id=p.id
 where p.status='active' and p.public_enabled and p.champsboard_enabled and p.age_band<>'16_17' and p.public_slug is not null and p.display_name is not null and p.country_code is not null
 and (c is null or p.country_code=c) and (town is null or lower(trim(p.city))=lower(town))
 ),ranked as (
 select dense_rank() over(order by minutes desc) rank,display_name,public_slug,country_code,city,minutes,case when lifetime_minutes>=3600 then 'gold' when lifetime_minutes>=2400 then 'silver' when lifetime_minutes>=1200 then 'bronze' else null end tier from eligible where minutes>0
 ),paged as(select * from ranked order by minutes desc,lower(display_name),public_slug limit 50 offset (p_page-1)*50)
 select jsonb_build_object('total',(select count(*) from ranked),'page',p_page,'items',coalesce((select jsonb_agg(to_jsonb(paged) order by minutes desc,lower(display_name),public_slug) from paged),'[]'),
 'countries',coalesce((select jsonb_agg(x.country_code order by x.country_code) from(select distinct p.country_code from rye_volunteer_profiles p where p.champsboard_enabled and p.public_enabled and p.status='active' and p.age_band<>'16_17' and p.country_code is not null)x),'[]'),
 'cities',coalesce((select jsonb_agg(x.city order by x.city) from(select distinct trim(p.city) city from rye_volunteer_profiles p where p.champsboard_enabled and p.public_enabled and p.status='active' and p.age_band<>'16_17' and p.country_code=c and nullif(trim(p.city),'') is not null)x),'[]')) into result;
 return result;
end $$;
revoke all on function rye_save_public_profile(text,text,text,boolean,boolean,text) from public,anon,authenticated;grant execute on function rye_save_public_profile(text,text,text,boolean,boolean,text) to anon,authenticated,service_role;
revoke all on function rye_champsboard(text,text,text,integer) from public,anon,authenticated;grant execute on function rye_champsboard(text,text,text,integer) to anon,authenticated,service_role;
-- Extend the private passport without changing existing response fields.
alter function rye_my_volunteer_passport(text) rename to rye_my_volunteer_passport_before_champsboard;
revoke all on function rye_my_volunteer_passport_before_champsboard(text) from public,anon,authenticated;
create function rye_my_volunteer_passport(p_invite_token text) returns jsonb language plpgsql stable security definer set search_path=public,extensions as $$
declare r jsonb;v uuid:=rye_passport_identity(p_invite_token);
begin
 r:=rye_my_volunteer_passport_before_champsboard(p_invite_token);if r is null then return null;end if;
 return jsonb_set(r,'{profile}',r->'profile'||(select jsonb_build_object('country_code',country_code,'city',city,'champsboard_enabled',champsboard_enabled) from rye_volunteer_profiles where id=v));
end $$;
revoke all on function rye_my_volunteer_passport(text) from public,anon,authenticated;grant execute on function rye_my_volunteer_passport(text) to anon,authenticated,service_role;
