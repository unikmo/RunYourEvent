import { NextResponse } from 'next/server'
import { listEventsByCategory } from '@/lib/rye-firestore-core'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const category = url.searchParams.get('category')
  if (!category) return NextResponse.json({ error: 'Missing category' }, { status: 400 })

  try {
    const events = await listEventsByCategory(category)
    return NextResponse.json({ events }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[browse-events] Firestore error', error)
    return NextResponse.json({ error: 'Events could not be loaded.', events: [] }, { status: 500 })
  }
}
