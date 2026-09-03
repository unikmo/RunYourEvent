import { NextResponse } from 'next/server'
import { firebaseConfigured, firebaseMirrorEnabled, pingFirebaseFirestore } from '@/lib/firebase-firestore'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const configured = firebaseConfigured()
  const mirrorEnabled = firebaseMirrorEnabled()

  if (!configured) {
    return NextResponse.json(
      { ok: false, configured: false, mirrorEnabled, reason: 'firebase_credentials_missing' },
      { status: 503 },
    )
  }

  try {
    await pingFirebaseFirestore()
    return NextResponse.json({ ok: true, configured: true, mirrorEnabled })
  } catch (error) {
    console.error('Firebase health check failed', error)
    return NextResponse.json(
      { ok: false, configured: true, mirrorEnabled, reason: 'firestore_unreachable' },
      { status: 503 },
    )
  }
}
