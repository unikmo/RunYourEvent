import { NextRequest, NextResponse } from 'next/server'
import { getFirestoreDocument, listFirestoreDocuments } from '@/lib/firebase-firestore'
import { RYE_COLLECTIONS } from '@/lib/rye-firestore-core'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TABLES: Record<string, string> = {
  events: RYE_COLLECTIONS.events,
  tasks: RYE_COLLECTIONS.tasks,
  blueprints: RYE_COLLECTIONS.blueprints,
}

const FILTERS: Record<string, string[]> = {
  events: ['id', 'category'],
  tasks: ['id', 'event_id'],
  blueprints: ['id', 'share_code'],
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ table: string }> }) {
  const { table } = await params
  const collection = TABLES[table]
  if (!collection) return NextResponse.json({ error: 'Unknown data source.' }, { status: 404 })

  const field = req.nextUrl.searchParams.get('field') || ''
  const value = req.nextUrl.searchParams.get('value') || ''
  const single = req.nextUrl.searchParams.get('single') === '1'
  const order = req.nextUrl.searchParams.get('order') || ''

  try {
    if (field === 'id' && value && single) {
      const row = await getFirestoreDocument(collection, value)
      return NextResponse.json({ data: row, error: row ? null : { message: 'Row not found.' } }, { status: row ? 200 : 404 })
    }

    let rows = await listFirestoreDocuments(collection)
    if (field) {
      if (!(FILTERS[table] || []).includes(field)) return NextResponse.json({ error: 'Unsupported filter.' }, { status: 400 })
      rows = rows.filter(row => String(row[field] ?? '') === value)
    }
    if (order) rows.sort((a, b) => Number(a[order] || 0) - Number(b[order] || 0))

    const data = single ? rows[0] || null : rows
    return NextResponse.json({ data, error: data ? null : { message: 'Row not found.' } }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error(`[firebase-data] ${table} read failed`, error)
    return NextResponse.json({ data: single ? null : [], error: { message: 'Data could not be loaded.' } }, { status: 500 })
  }
}
