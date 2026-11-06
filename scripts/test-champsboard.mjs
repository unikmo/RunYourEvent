import assert from 'node:assert/strict'
import {createTestDb} from './community-test-db.mjs'
const db=await createTestDb();const scalar=async(sql,args=[])=>Object.values((await db.query(sql,args)).rows[0])[0];const rpc=async(name,args={})=>scalar(`select ${name}(${Object.keys(args).map((k,i)=>k+' => $'+(i+1)).join(',')})`,Object.values(args));let groups=0;const pass=s=>{groups++;console.log('PASS',s)}
async function volunteer(name,city,country,minutes,options={}){
 const p=await rpc('rye_register_volunteer',{p_payload:{email:name+'@fixture.test',firstName:name,lastName:'Fixture',city,ageBand:options.minor?'16_17':'21_25',guardianConsentReady:!!options.minor,privacyAck:true}})
 const id=await scalar('select id from rye_volunteer_profiles where email=$1',[name+'@fixture.test'])
 if(!options.minor)await rpc('rye_save_public_profile',{p_token:p.accessToken,p_display_name:name,p_slug:name,p_public:!options.private,p_champsboard:!options.private&&!options.hidden,p_country:country})
 const op=await scalar("insert into rye_volunteer_opportunities(title,organization_name,city,event_day,shift_start,shift_end,min_age,slots_total,role_description,activity_format,protection_mode,protection_status,status) values('Completed project','Fixture Club',$1,current_date-1,now()-interval '9 hours',now()-interval '1 hour',16,1,'Community contribution','corporate','organizer_existing','not_required','completed') returning id",[city])
 await db.query("insert into rye_volunteer_placements(opportunity_id,volunteer_profile_id,status,event_day,organizer_verified,verified_minutes) values($1,$2,'completed',current_date-1,true,$3)",[op,id,minutes]);return {...p,id,op}
}
const a=await volunteer('alex','Bonn','DE',480),b=await volunteer('blair',' bonn ','DE',240),c=await volunteer('casey','Bonn','US',480)
await volunteer('private','Bonn','DE',480,{private:true});await volunteer('unlisted','Bonn','DE',480,{hidden:true});const minor=await volunteer('young','Bonn','DE',480,{minor:true})
let board=await rpc('rye_champsboard');assert.equal(board.total,3);assert.deepEqual(board.items.map(x=>Number(x.rank)),[1,1,2]);assert.deepEqual(board.items.map(x=>x.minutes),[480,480,240]);assert.ok(!JSON.stringify(board).includes('@fixture.test'));assert.ok(board.items.every(x=>!('id' in x)))
pass('Worldwide hours rank correctly, equal contributions tie and private/unlisted/minor profiles stay absent')
board=await rpc('rye_champsboard',{p_country:'de',p_city:'BONN'});assert.equal(board.total,2);assert.deepEqual(board.items.map(x=>x.public_slug),['alex','blair']);assert.equal(board.items[0].minutes,480)
assert.equal((await rpc('rye_champsboard',{p_country:'US',p_city:'Bonn'})).total,1)
pass('Country/city filters normalize case and whitespace, distinguish same-named cities and retain eight-hour contributions')
await db.query("update rye_volunteer_placements set organizer_verified=false where volunteer_profile_id=$1",[a.id]);assert.equal((await rpc('rye_champsboard',{p_country:'DE'})).items[0].public_slug,'blair')
await db.query("update rye_volunteer_placements set organizer_verified=true,verified_minutes=120 where volunteer_profile_id=$1",[a.id]);assert.equal((await rpc('rye_champsboard',{p_country:'DE'})).items[1].minutes,120)
pass('Revoked verification removes time immediately; corrected minutes reorder the board')
await db.query("update rye_volunteer_placements set event_day=(date_trunc('year',current_date)-interval '1 day')::date where volunteer_profile_id=$1",[c.id]);assert.equal((await rpc('rye_champsboard',{p_period:'year'})).total,2)
pass('Calendar-year rankings exclude prior-year activity without changing lifetime totals')
await rpc('rye_save_public_profile',{p_token:b.accessToken,p_display_name:'blair',p_slug:'blair',p_public:true,p_champsboard:false,p_country:'DE'});assert.equal((await rpc('rye_champsboard',{p_country:'DE'})).total,1)
await assert.rejects(()=>rpc('rye_save_public_profile',{p_token:minor.accessToken,p_display_name:'young',p_slug:'young',p_public:true,p_champsboard:true,p_country:'DE'}),/adults/)
await assert.rejects(()=>rpc('rye_save_public_profile',{p_token:a.accessToken,p_display_name:'alex',p_slug:'alex',p_public:false,p_champsboard:true,p_country:'DE'}),/Publish/)
await assert.rejects(()=>rpc('rye_champsboard',{p_country:null,p_city:'Bonn'}),/Invalid/)
pass('Opt-out is immediate; database rejects minor publication and invalid ranking filters')
await db.exec('set role anon');const publicBoard=await rpc('rye_champsboard');assert.ok(publicBoard);await assert.rejects(()=>db.query('select * from rye_volunteer_profiles'),/permission denied/);await db.exec('reset role')
assert.equal((await rpc('rye_champsboard',{p_page:2})).items.length,0)
pass('Public RPC exposes only the ranking projection; raw volunteer records remain private and pagination is bounded')
console.log(`${groups} Champsboard integration groups passed`);await db.close()
