// Local-only PostgREST-shaped adapter over a disposable synthetic PostgreSQL database.
// Never deployed; production continues to use Supabase.
import http from 'node:http'
import { createTestDb } from './community-test-db.mjs'
const db=await createTestDb()
const scalar=async(sql,args=[])=>Object.values((await db.query(sql,args)).rows[0])[0]
const tomorrow=await scalar("select (current_date+1)::text")
const end=await scalar("select (current_date+60)::text")
const need={organizationName:'Bonn Community Sport',contactName:'Local Organizer',email:'club@fixture.test',city:'Bonn',title:'Saturday sports festival',description:'A welcoming community sports event for everyone.',seasonStart:tomorrow,seasonEnd:end,volunteerCount:5,hoursPerVolunteer:4,activityFormat:'community',materialsBudgetCents:0,materials:'Provided',skills:'Welcoming people',supervision:'Club team lead on site',partialFunding:true,privacyAck:true}
const club=await scalar('select rye_submit_seasonal_need($1,null)',[need])
await scalar('select rye_club_action($1,$2,$3)',[club.accessToken,'publish_activity',{needId:club.needId,title:'Welcome desk with friends',eventDay:tomorrow,shiftStart:tomorrow+'T09:00:00+01:00',shiftEnd:tomorrow+'T13:00:00+01:00',slots:5,venue:'Community sports hall Bonn',roleDescription:'Welcome visitors and show families around the festival.',activityFormat:'community',coverageConfirmed:true,commercialAck:true,safetyNotes:'Briefing and supervision by club team lead',breakMinutes:0,materials:'Provided by club',supervision:'Club team lead at welcome desk'}])
const volunteer=await scalar('select rye_register_volunteer($1)',[{email:'champion@fixture.test',firstName:'Alex',lastName:'Fixture',city:'Bonn',ageBand:'21_25',privacyAck:true}])
await scalar('select rye_save_public_profile($1,$2,$3,true,true,$4)',[volunteer.accessToken,'Alex Champion','alex-champion','DE'])
const profileId=await scalar("select id from rye_volunteer_profiles where email='champion@fixture.test'")
const history=await scalar("insert into rye_volunteer_opportunities(title,organization_name,city,event_day,shift_start,shift_end,min_age,slots_total,role_description,activity_format,protection_mode,protection_status,status) values('Completed garden project','Fixture Club','Bonn',current_date-1,now()-interval '9 hours',now()-interval '1 hour',18,1,'Garden restoration','corporate','organizer_existing','not_required','completed') returning id")
await db.query("insert into rye_volunteer_placements(opportunity_id,volunteer_profile_id,status,event_day,organizer_verified,verified_minutes) values($1,$2,'completed',current_date-1,true,480)",[history,profileId])
let chain=Promise.resolve()
const server=http.createServer(async(req,res)=>{
 res.setHeader('Content-Type','application/json');res.setHeader('Access-Control-Allow-Origin','*')
 if(req.url==='/test-state'){res.end(JSON.stringify({clubToken:club.accessToken,needId:club.needId,volunteerToken:volunteer.accessToken}));return}
 if(!req.url?.startsWith('/rest/v1/rpc/')||req.method!=='POST'){res.writeHead(503);res.end(JSON.stringify({message:'Test authentication email service is not configured',code:'test_fixture'}));return}
 let raw='';for await(const chunk of req)raw+=chunk
 const run=async()=>{
  try{
   const name=req.url.slice('/rest/v1/rpc/'.length).split('?')[0]
   if(!/^rye_[a-z_]+$/.test(name))throw Error('Invalid function')
   const args=JSON.parse(raw||'{}');if(name==='rye_send_message')console.log('Synthetic message identity',!!args.p_volunteer_token,!!args.p_club_token);const keys=Object.keys(args);if(keys.some(k=>!/^p_[a-z_]+$/.test(k)))throw Error('Invalid argument')
   await db.exec('set role anon')
   const value=await scalar(`select ${name}(${keys.map((k,i)=>`${k} => $${i+1}`).join(',')})`,Object.values(args))
   res.end(JSON.stringify(value))
  }catch(error){console.error('Synthetic RPC error:',error.message);res.writeHead(400);res.end(JSON.stringify({message:error.message,code:error.code||'P0001'}))}
  finally{await db.exec('reset role')}
 }
 chain=chain.then(run);await chain
})
server.listen(4011,'127.0.0.1',()=>console.log('Synthetic community database ready on 127.0.0.1:4011'))
