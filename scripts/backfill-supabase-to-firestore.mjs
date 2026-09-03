import { createHash, createSign } from 'node:crypto'

const SOURCE_URL = 'https://iemibyzizrvoxdxskfsx.supabase.co'
const SOURCE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllbWlieXppenJ2b3hkeHNrZnN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MDk0MjUsImV4cCI6MjA5ODA4NTQyNX0.o44i3wBcp3fkndBmR9_sBPtQ2IOrmCN0z2l5YGRN1Lk'
const FIREBASE_PROJECT_ID = 'ryevent'
const FIREBASE_DATABASE_ID = '(default)'
const DEFAULT_FIREBASE_CLIENT_EMAIL = 'firebase-adminsdk-fbsvc@ryevent.iam.gserviceaccount.com'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const FIRESTORE_SCOPE = 'https://www.googleapis.com/auth/datastore'

function privateKeyFromServiceAccountJson(value) {
  try {
    const parsed = JSON.parse(value)
    if (parsed?.private_key?.includes('-----BEGIN PRIVATE KEY-----')) {
      return parsed.private_key.replace(/\\n/g, '\n').trim()
    }
  } catch {}
  return null
}

function normalizePrivateKey(value) {
  let candidate = String(value || '').trim()
  if ((candidate.startsWith('"') && candidate.endsWith('"')) || (candidate.startsWith("'") && candidate.endsWith("'"))) {
    candidate = candidate.slice(1, -1).trim()
  }
  if (candidate.startsWith('FIREBASE_PRIVATE_KEY_BASE64=')) {
    candidate = candidate.slice('FIREBASE_PRIVATE_KEY_BASE64='.length).trim()
  }
  const rawJson = candidate.startsWith('{') ? privateKeyFromServiceAccountJson(candidate) : null
  if (rawJson) return rawJson
  if (candidate.startsWith('-----BEGIN PRIVATE KEY-----')) return candidate.replace(/\\n/g, '\n').trim()
  const decoded = Buffer.from(candidate.replace(/\s+/g, ''), 'base64').toString('utf8').trim()
  const decodedJson = decoded.startsWith('{') ? privateKeyFromServiceAccountJson(decoded) : null
  if (decodedJson) return decodedJson
  if (decoded.startsWith('-----BEGIN PRIVATE KEY-----')) return decoded.replace(/\\n/g, '\n').trim()
  throw new Error('Unsupported Firebase private-key format.')
}

function privateKey() {
  const value = process.env.FIREBASE_PRIVATE_KEY_BASE64 || process.env.FIREBASE_PRIVATE_KEY
  if (!value) throw new Error('Firebase private key is missing in the build environment.')
  return normalizePrivateKey(value)
}

function base64Url(value) {
  return Buffer.from(value).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

async function accessToken() {
  const now = Math.floor(Date.now() / 1000)
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = base64Url(JSON.stringify({
    iss: process.env.FIREBASE_CLIENT_EMAIL?.trim() || DEFAULT_FIREBASE_CLIENT_EMAIL,
    scope: FIRESTORE_SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }))
  const unsigned = `${header}.${payload}`
  const signer = createSign('RSA-SHA256')
  signer.update(unsigned)
  signer.end()
  const assertion = `${unsigned}.${base64Url(signer.sign(privateKey()))}`
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  })
  if (!response.ok) throw new Error(`Firebase OAuth failed (${response.status}): ${await response.text()}`)
  const body = await response.json()
  if (!body.access_token) throw new Error('Firebase OAuth returned no access token.')
  return body.access_token
}

async function sourceRows(table) {
  const response = await fetch(`${SOURCE_URL}/rest/v1/${table}?select=*`, {
    headers: { apikey: SOURCE_ANON_KEY, Authorization: `Bearer ${SOURCE_ANON_KEY}`, Prefer: 'count=exact' },
  })
  if (!response.ok) throw new Error(`Supabase read ${table} failed (${response.status}): ${await response.text()}`)
  return response.json()
}

function firestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null }
  if (typeof value === 'string') return { stringValue: value }
  if (typeof value === 'boolean') return { booleanValue: value }
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value }
  if (Array.isArray(value)) return { arrayValue: { values: value.map(firestoreValue) } }
  if (typeof value === 'object') {
    const fields = Object.fromEntries(Object.entries(value).map(([k, v]) => [k, firestoreValue(v)]))
    return { mapValue: { fields } }
  }
  return { stringValue: String(value) }
}

function documentBody(row) {
  return { fields: Object.fromEntries(Object.entries(row).map(([key, value]) => [key, firestoreValue(value)])) }
}

function stableId(value) {
  return createHash('sha256').update(String(value)).digest('hex').slice(0, 40)
}

async function put(token, collection, id, row) {
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/${encodeURIComponent(FIREBASE_DATABASE_ID)}/documents/${collection}/${encodeURIComponent(id)}`
  const response = await fetch(url, {
    method: 'PATCH',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(documentBody(row)),
  })
  if (!response.ok) throw new Error(`Firestore write ${collection}/${id} failed (${response.status}): ${await response.text()}`)
}

async function parallel(items, limit, fn) {
  let index = 0
  const workers = Array.from({ length: Math.min(limit, Math.max(1, items.length)) }, async () => {
    while (index < items.length) {
      const current = items[index++]
      await fn(current)
    }
  })
  await Promise.all(workers)
}

async function main() {
  if (process.env.VERCEL_GIT_COMMIT_REF && process.env.VERCEL_GIT_COMMIT_REF !== 'firebase-volunteer-integration') {
    console.log('[firebase-backfill] skipped outside migration branch')
    return
  }

  const [events, tasks, categories, blueprints] = await Promise.all([
    sourceRows('events'), sourceRows('tasks'), sourceRows('categories'), sourceRows('blueprints'),
  ])
  console.log(`[firebase-backfill] source counts events=${events.length} tasks=${tasks.length} categories=${categories.length} blueprints=${blueprints.length}`)

  const token = await accessToken()
  await parallel(events, 16, row => put(token, 'rye_events', row.id, row))
  await parallel(tasks, 16, row => put(token, 'rye_tasks', row.id, row))
  await parallel(categories, 12, row => put(token, 'rye_categories', stableId(row.name), row))
  await parallel(blueprints, 12, row => put(token, 'rye_blueprints', row.id, row))

  const manifest = {
    source: 'supabase:iemibyzizrvoxdxskfsx',
    migrated_at: new Date().toISOString(),
    events: events.length,
    tasks: tasks.length,
    categories: categories.length,
    blueprints: blueprints.length,
  }
  await put(token, 'rye_migrations', 'eventengine_supabase_backfill_20260903', manifest)
  console.log(`[firebase-backfill] completed events=${events.length} tasks=${tasks.length} categories=${categories.length} blueprints=${blueprints.length}`)
}

main().catch(error => {
  console.error('[firebase-backfill] failed', error)
  process.exit(1)
})
