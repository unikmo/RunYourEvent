import {NextResponse} from 'next/server'
import {getAdminSession} from '@/lib/admin-auth'
export async function POST(){if(!await getAdminSession())return NextResponse.json({error:'Unauthorized'},{status:401});return NextResponse.json({error:'Billing is now automatic. Review invoices and retry exceptions in Automation & billing.'},{status:409})}
