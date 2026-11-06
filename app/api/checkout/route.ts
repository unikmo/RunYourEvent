import {NextResponse} from 'next/server'
export async function POST(){return NextResponse.json({error:'New purchases of legacy event plans are no longer available. Current volunteering fees are invoiced; existing paid records remain accessible.'},{status:410})}
