'use client'
import {usePathname} from 'next/navigation'
import Link from 'next/link'
export default function LegacyProductNotice(){
 const path=usePathname()
 if(!['/events/','/share/','/workspace/','/checkout/success'].some(prefix=>path.startsWith(prefix)))return null
 return <aside className="border-b border-[#d5ad48]/40 bg-[#eee7d3] px-5 py-4 text-center text-sm leading-6"><b>Legacy event-planning records.</b> This area preserves earlier plans and purchases. Its plans, prices and task hours are separate from current sports volunteering. <Link className="font-bold underline" href="/">Go to sports volunteering</Link></aside>
}
