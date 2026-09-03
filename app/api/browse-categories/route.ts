import { NextResponse } from 'next/server'
import { listEventCategories } from '@/lib/rye-firestore-core'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const categories = await listEventCategories()
    return NextResponse.json({ categories }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[browse-categories] Firestore error', error)
    return NextResponse.json({ error: 'Event categories could not be loaded.', categories: [] }, { status: 500 })
  }
}
