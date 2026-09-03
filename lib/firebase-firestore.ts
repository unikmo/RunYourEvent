import { createHash, createSign } from 'node:crypto'

type FirestorePrimitive = string | number | boolean | null | Date
export interface FirestoreData {
  [key: string]: FirestorePrimitive | FirestorePrimitive[] | FirestoreData | undefined
}

type CachedToken = { value: string; expiresAt: number }
let cachedToken: CachedToken | null = null

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const FIRESTORE_SCOPE = 'https://www.googleapis.com/auth/datastore'
const DEFAULT_FIREBASE_PROJECT_ID = 'ryevent'
const DEFAULT_FIREBASE_DATABASE_ID = '(default)'

function requiredClientEmail() {
  const value = process.env.FIREBASE_CLIENT_EMAIL?.trim()
  if (!value) throw new Error('FIREBASE_CLIENT_EMAIL is not configured.')
  return value
}

function privateKey() {
  const encoded = process.env.FIREBASE_PRIVATE_KEY_BASE64?.trim()
  if (encoded) return Buffer.from(encoded, 'base64').toString('utf8')

  const raw = process.env.FIREBASE_PRIVATE_KEY?.trim()
  if (!raw) throw new Error('FIREBASE_PRIVATE_KEY or FIREBASE_PRIVATE_KEY_BASE64 is not configured.')
  return raw.replace(/\\n/g, '\n')
}

function base64Url(value: string | Buffer) {
  const input = Buffer.isBuffer(value) ? value : Buffer.from(value)
  return input.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value

  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = base64Url(
    JSON.stringify({
      iss: requiredClientEmail(),
      scope: FIRESTORE_SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  )
  const unsigned = `${header}.${payload}`
  const signer = createSign('RSA-SHA256')
  signer.update(unsigned)
  signer.end()
  const assertion = `${unsigned}.${base64Url(signer.sign(privateKey()))}`

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Firebase token exchange failed (${response.status}): ${detail.slice(0, 300)}`)
  }

  const body = (await response.json()) as { access_token?: string; expires_in?: number }
  if (!body.access_token) throw new Error('Firebase token exchange returned no access token.')

  cachedToken = {
    value: body.access_token,
    expiresAt: Date.now() + Math.max(60, body.expires_in || 3600) * 1000,
  }
  return cachedToken.value
}

function firestoreValue(value: unknown): Record<string, unknown> {
  if (value === null) return { nullValue: null }
  if (value instanceof Date) return { timestampValue: value.toISOString() }
  if (typeof value === 'string') return { stringValue: value }
  if (typeof value === 'boolean') return { booleanValue: value }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value }
  }
  if (Array.isArray(value)) return { arrayValue: { values: value.map(firestoreValue) } }
  if (typeof value === 'object') {
    const fields = Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, firestoreValue(item)]),
    )
    return { mapValue: { fields } }
  }
  throw new Error(`Unsupported Firestore value type: ${typeof value}`)
}

function baseUrl() {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim() || DEFAULT_FIREBASE_PROJECT_ID
  const databaseId = process.env.FIREBASE_DATABASE_ID?.trim() || DEFAULT_FIREBASE_DATABASE_ID
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/${encodeURIComponent(databaseId)}/documents`
}

export function firebaseConfigured() {
  return Boolean(
    process.env.FIREBASE_CLIENT_EMAIL?.trim() &&
      (process.env.FIREBASE_PRIVATE_KEY?.trim() || process.env.FIREBASE_PRIVATE_KEY_BASE64?.trim()),
  )
}

export function firebaseMirrorEnabled() {
  const explicit = process.env.RYE_FIREBASE_MIRROR_ENABLED?.trim().toLowerCase()
  if (explicit === 'false') return false
  return firebaseConfigured()
}

export function stableFirestoreId(seed: string) {
  return createHash('sha256').update(seed).digest('hex').slice(0, 40)
}

export async function putFirestoreDocument(collection: string, documentId: string, data: FirestoreData) {
  if (!/^[A-Za-z0-9_-]+$/.test(collection)) throw new Error('Invalid Firestore collection name.')
  if (!/^[A-Za-z0-9_-]+$/.test(documentId)) throw new Error('Invalid Firestore document id.')

  const token = await getAccessToken()
  const fields = Object.fromEntries(
    Object.entries(data)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, firestoreValue(value)]),
  )

  const response = await fetch(`${baseUrl()}/${collection}/${documentId}`, {
    method: 'PATCH',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ fields }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Firestore write failed (${response.status}): ${detail.slice(0, 500)}`)
  }
  return response.json()
}

export async function pingFirebaseFirestore() {
  const token = await getAccessToken()
  const response = await fetch(`${baseUrl()}/rye_volunteer_profiles?pageSize=1`, {
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Firestore health check failed (${response.status}): ${detail.slice(0, 300)}`)
  }
  return true
}
