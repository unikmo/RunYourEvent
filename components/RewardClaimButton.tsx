'use client'

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
      if(!response.ok)throw new Error(json.error||'The reward could not be claimed.')
      setClaimed(true);setMessage(json.redemptionDetails||'Reward claimed. Your claim is recorded in your passport.');router.refresh()
    }catch(error){setMessage(error instanceof Error?error.message:'The reward could not be claimed.')}finally{setBusy(false)}
  }
  return <div className="mt-4"><button className="btn-secondary" onClick={claim} disabled={busy||claimed}>{claimed?'Reward claimed':busy?'Claiming…':'Claim your reward'}</button>{message&&<p className="mt-3 text-sm leading-6" role="status">{message}</p>}</div>
}
