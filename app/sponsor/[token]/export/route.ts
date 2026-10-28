import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export const dynamic='force-dynamic'
const headers={'Cache-Control':'private, no-store, max-age=0','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow, noarchive'}
function cell(value:unknown) {
  let text=String(value??'')
  if(/^[\s]*[=+@-]/.test(text))text="'"+text
  return '"'+text.replaceAll('"','""')+'"'
}
export async function GET(_req:Request,{params}:{params:Promise<{token:string}>}) {
  const {token}=await params
  if(!/^[a-f0-9]{48}$/.test(token))return new NextResponse('Report not found',{status:404,headers})
  try {
    const {data,error}=await createServerClient().rpc('rye_sponsor_report',{p_token:token})
    if(error)return new NextResponse('Report temporarily unavailable',{status:503,headers});if(!data)return new NextResponse('Report not found',{status:404,headers})
    const employee=data.report_kind==='employee_project'
    const rows:unknown[][]=[[employee?'RunYourEvent employee-project report':'RunYourEvent sponsor report'],[employee?'Project':'Sponsor',data.sponsor_name],['Agreed target hours',data.target_hours??'Not recorded'],['Campaign budget EUR',Number(data.budget_cents||0)/100],['Allocated EUR',Number(data.allocated_cents||0)/100],['Reserved EUR',Number(data.reserved_cents||0)/100],['Completed placements',data.completed_placements||0],['Verified placements',data.verified_placements||0],['Verified hours',Number(data.verified_minutes||0)/60],[],['Club','Activity','Allocated EUR','Completed placements','Verified hours']]
    for(const need of Array.isArray(data.needs)?data.needs:[])rows.push([need.organization_name,need.title,Number(need.allocated_cents||0)/100,need.completed_placements||0,Number(need.verified_minutes||0)/60])
    return new NextResponse('\uFEFF'+rows.map(row=>row.map(cell).join(',')).join('\r\n'),{headers:{...headers,'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="runyourevent-sponsor-report.csv"'}})
  } catch {return new NextResponse('Report temporarily unavailable',{status:503,headers})}
}
