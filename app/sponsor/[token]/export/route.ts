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
  if(!/^[a-f0-9]{48}$/.test(token))return new NextResponse("Bericht nicht gefunden",{status:404,headers})
  try {
    const {data,error}=await createServerClient().rpc('rye_sponsor_report',{p_token:token})
    if(error)return new NextResponse("Der Bericht lässt sich gerade nicht laden",{status:503,headers});if(!data)return new NextResponse("Bericht nicht gefunden",{status:404,headers})
    const employee=data.report_kind==='employee_project'
    const rows:unknown[][]=[[employee?"RunYourEvent-Bericht zum Teameinsatz":"RunYourEvent-Sponsoringbericht"],[employee?"Projekt":'Sponsor',data.sponsor_name],["Vereinbarte Stundenzahl",data.target_hours??"Nicht erfasst"],["Sponsoringbudget EUR",Number(data.budget_cents||0)/100],["Zugeordnet EUR",Number(data.allocated_cents||0)/100],["Reserviert EUR",Number(data.reserved_cents||0)/100],["Abgeschlossene Einsätze",data.completed_placements||0],["Bestätigte Einsätze",data.verified_placements||0],["Bestätigte Stunden",Number(data.verified_minutes||0)/60],[],["Verein","Einsatz","Zugeordnet EUR","Abgeschlossene Einsätze","Bestätigte Stunden"]]
    if(!employee&&data.agreement)rows.splice(10,0,["Angebots- / Vertragsnummer",data.agreement.reference],["Leistungen",data.agreement.scope],["Nicht geleistete Stunden / ungenutzte Mittel",data.agreement.shortfallTerms],["Steuerliche Behandlung",data.agreement.taxTerms])
    for(const need of Array.isArray(data.needs)?data.needs:[])rows.push([need.organization_name,need.title,Number(need.allocated_cents||0)/100,need.completed_placements||0,Number(need.verified_minutes||0)/60])
    return new NextResponse('\uFEFF'+rows.map(row=>row.map(cell).join(',')).join('\r\n'),{headers:{...headers,'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="runyourevent-sponsor-report.csv"'}})
  } catch {return new NextResponse("Der Bericht lässt sich gerade nicht laden",{status:503,headers})}
}
