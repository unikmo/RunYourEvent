import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import {
  createFirestoreDocument,
  deleteFirestoreDocument,
  getFirestoreDocument,
  listFirestoreDocuments,
} from '@/lib/firebase-firestore'
import { RYE_COLLECTIONS } from '@/lib/rye-firestore-core'
import { listConversions, listDrafts, listOrders } from '@/lib/rye-firestore-commerce'
import { listWorkspaces } from '@/lib/rye-firestore-workspace'

function now() { return new Date().toISOString() }
function sessionId(token: string) { return `s_${createHash('sha256').update(token).digest('hex').slice(0, 40)}` }

function adminCredentials() {
  const email = (process.env.RYE_ADMIN_EMAIL || process.env.ADMIN_EMAIL || '').trim().toLowerCase()
  const password = process.env.RYE_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || ''
  const passwordSha256 = (process.env.RYE_ADMIN_PASSWORD_SHA256 || '').trim().toLowerCase()
  return { email, password, passwordSha256 }
}

function passwordMatches(candidate: string) {
  const { password, passwordSha256 } = adminCredentials()
  if (passwordSha256) {
    const actual = createHash('sha256').update(candidate).digest('hex')
    const a = Buffer.from(actual); const b = Buffer.from(passwordSha256)
    return a.length === b.length && timingSafeEqual(a, b)
  }
  if (!password) return false
  const a = Buffer.from(candidate); const b = Buffer.from(password)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function createAdminSession(email: string, password: string) {
  const expected = adminCredentials().email
  if (!expected || email.trim().toLowerCase() !== expected || !passwordMatches(password)) return null
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
  await createFirestoreDocument(RYE_COLLECTIONS.adminSessions, {
    token_hash: createHash('sha256').update(token).digest('hex'),
    email: expected,
    created_at: now(),
    expires_at: expiresAt,
  }, sessionId(token))
  return { sessionToken: token, expiresAt }
}

export async function validateAdminSession(token: string) {
  if (!/^[a-f0-9]{64}$/i.test(token)) return false
  const session = await getFirestoreDocument(RYE_COLLECTIONS.adminSessions, sessionId(token))
  if (!session) return false
  if (session.token_hash !== createHash('sha256').update(token).digest('hex')) return false
  return new Date(String(session.expires_at || 0)).getTime() > Date.now()
}

export async function deleteAdminSession(token: string) {
  if (!token) return false
  return deleteFirestoreDocument(RYE_COLLECTIONS.adminSessions, sessionId(token))
}

function segmentLabelRows(drafts: any[], orders: any[]) {
  const segments = ['company', 'weddings', 'family_reunions', 'secondary', 'other']
  const thirtyDaysAgo = Date.now() - 30 * 86_400_000
  return segments.map(segment => {
    const previews = drafts.filter(d => d.event_segment === segment && new Date(String(d.created_at || 0)).getTime() >= thirtyDaysAgo).length
    const segmentOrders = orders.filter(o => o.event_segment === segment && new Date(String(o.created_at || 0)).getTime() >= thirtyDaysAgo)
    const paid = segmentOrders.filter(o => o.status === 'paid')
    return { segment, previews, orders: segmentOrders.length, paid: paid.length, revenue: paid.reduce((sum, o) => sum + Number(o.amount_cents || 0), 0) }
  })
}

export async function adminDashboard() {
  const [drafts, orders, conversions, workspaces, members] = await Promise.all([
    listDrafts(), listOrders(), listConversions(), listWorkspaces(), listFirestoreDocuments(RYE_COLLECTIONS.workspaceMembers),
  ])
  const nowMs = Date.now(); const seven = nowMs - 7 * 86_400_000; const thirty = nowMs - 30 * 86_400_000
  const paid30 = orders.filter(o => o.status === 'paid' && new Date(String(o.verified_at || o.created_at || 0)).getTime() >= thirty)
  return {
    metrics: {
      previews7d: drafts.filter(d => new Date(String(d.created_at || 0)).getTime() >= seven).length,
      checkouts7d: orders.filter(o => new Date(String(o.created_at || 0)).getTime() >= seven).length,
      paid30d: paid30.length,
      revenue30d: paid30.reduce((sum, o) => sum + Number(o.amount_cents || 0), 0),
      activeWorkspaces: workspaces.filter(w => w.status === 'active').length,
      workspaceMembers: members.filter(m => m.accepted_at).length,
    },
    segments: segmentLabelRows(drafts, orders),
    orders: orders.sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||''))).slice(0,30),
    drafts: drafts.sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||''))).slice(0,30),
    workspaces: workspaces.sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||''))).slice(0,30),
    activity: conversions.sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||''))).slice(0,40),
  }
}
