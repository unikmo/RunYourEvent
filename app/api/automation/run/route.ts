import {NextRequest,NextResponse} from 'next/server'
import {timingSafeEqual} from 'node:crypto'
import {runAutomation} from '@/lib/automation'
export const runtime='nodejs';export const dynamic='force-dynamic';export const maxDuration=300
async function run(req:NextRequest){
 const secret=process.env.CRON_SECRET;const supplied=req.headers.get('authorization')||''
 if(!secret||secret.length<32)return NextResponse.json({error:'Automation credentials are not configured'},{status:503})
 const expected=Buffer.from('Bearer '+secret);const received=Buffer.from(supplied)
 if(expected.length!==received.length||!timingSafeEqual(expected,received))return NextResponse.json({error:'Unauthorized'},{status:401})
 try{return NextResponse.json(await runAutomation())}catch{return NextResponse.json({error:'Automation dependency unavailable'},{status:503})}
}
export const GET=run;export const POST=run
