'use client'
import {userMessage} from '@/lib/user-message'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RewardClaimButton({rewardId}:{rewardId:string}){
  const router=useRouter()
  const [busy,setBusy]=useState(false)
  const [claimed,setClaimed]=useState(false)
  const [message,setMessage]=useState('')
  async function claim(){
    setBusy(true);setMessage('')
    try{
      const response=await fetch('/api/community',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'claim_reward',rewardId})})
      const json=await response.json()
      if(!response.ok)throw new Error(userMessage(json.error)||"Die Prämie konnte nicht angefordert werden. Bitte versuch es noch einmal.")
      setClaimed(true);setMessage(json.redemptionDetails||"Du hast die Prämie angefordert. Deine Anfrage steht jetzt in deinem Engagementpass.");router.refresh()
    }catch(error){setMessage(error instanceof Error?userMessage(error.message):"Die Prämie konnte nicht angefordert werden. Bitte versuch es noch einmal.")}finally{setBusy(false)}
  }
  return <div className="mt-4"><button className="btn-secondary" onClick={claim} disabled={busy||claimed}>{claimed?"Prämie angefordert":busy?"Wird angefordert …":"Prämie anfordern"}</button>{message&&<p className="mt-3 text-sm leading-6" role="status">{message}</p>}</div>
}
