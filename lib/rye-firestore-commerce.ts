import {
  createFirestoreDocument,
  getFirestoreDocument,
  listFirestoreDocuments,
  patchFirestoreDocument,
  putFirestoreDocument,
} from '@/lib/firebase-firestore'
import { RYE_COLLECTIONS } from '@/lib/rye-firestore-core'

export type PaidTier = 'essential' | 'professional'

export function classifyEventSegment(summary: Record<string, unknown>) {
  const s = `${summary.name || ''} ${summary.category || ''} ${summary.objective || ''}`.toLowerCase()
  if (/(wedding|bride|groom|ceremony|reception)/.test(s)) return 'weddings'
  if (/(family reunion|family gathering|family homecoming|kinship reunion)/.test(s)) return 'family_reunions'
  if (/(birthday|baby shower|graduation|anniversary|class reunion)/.test(s)) return 'secondary'
  if (/(company|corporate|conference|customer|partner|executive|team retreat|workshop|training|product launch|grand opening|association|fundraising|gala|donor|business)/.test(s)) return 'company'
  return 'other'
}

export async function recordConversion(eventName: string, draftToken: string | null, metadata: Record<string, unknown> = {}, eventSegment = 'other') {
  return createFirestoreDocument(RYE_COLLECTIONS.conversions, {
    event_name: eventName,
    draft_token: draftToken,
    metadata,
    event_segment: eventSegment,
    created_at: new Date().toISOString(),
  })
}

export async function storePreviewDraft(input: {
  draftToken: string
  planCiphertext: string
  planIv: string
  planTag: string
  preview: Record<string, unknown>
  eventSummary: Record<string, unknown>
  recommendedTier: PaidTier
  expiresAt: string
}) {
  const eventSegment = classifyEventSegment(input.eventSummary)
  await putFirestoreDocument(RYE_COLLECTIONS.drafts, input.draftToken, {
    id: input.draftToken,
    draft_token: input.draftToken,
    plan_ciphertext: input.planCiphertext,
    plan_iv: input.planIv,
    plan_tag: input.planTag,
    preview: input.preview,
    event_summary: input.eventSummary,
    recommended_tier: input.recommendedTier,
    event_segment: eventSegment,
    expires_at: input.expiresAt,
    created_at: new Date().toISOString(),
  })
  await Promise.all([
    recordConversion('preview_generated', input.draftToken, (input.preview.summary as Record<string, unknown>) || {}, eventSegment),
    recordConversion('tier_recommended', input.draftToken, { tier: input.recommendedTier }, eventSegment),
  ])
  return eventSegment
}

export async function getDraft(draftToken: string) {
  return getFirestoreDocument(RYE_COLLECTIONS.drafts, draftToken)
}

export async function prepareCheckout(draftToken: string, tier: PaidTier) {
  const draft = await getDraft(draftToken)
  if (!draft || !draft.expires_at || new Date(String(draft.expires_at)).getTime() <= Date.now()) {
    throw new Error('preview expired or unavailable')
  }
  const amountCents = tier === 'essential' ? 1900 : 3900
  const order = await createFirestoreDocument(RYE_COLLECTIONS.orders, {
    draft_token: draftToken,
    tier,
    amount_cents: amountCents,
    currency: 'usd',
    status: 'checkout_created',
    accepted_terms_at: new Date().toISOString(),
    immediate_performance_consent_at: new Date().toISOString(),
    event_segment: String(draft.event_segment || 'other'),
    created_at: new Date().toISOString(),
  })
  await recordConversion('checkout_started', draftToken, { tier }, String(draft.event_segment || 'other'))
  return order
}

export async function getPaidDraft(draftToken: string) {
  const [draft, orders] = await Promise.all([
    getDraft(draftToken),
    listFirestoreDocuments(RYE_COLLECTIONS.orders),
  ])
  if (!draft) return null
  const paid = orders
    .filter(order => order.draft_token === draftToken && order.status === 'paid')
    .sort((a, b) => String(b.verified_at || b.created_at || '').localeCompare(String(a.verified_at || a.created_at || '')))[0]
  if (!paid) return null
  return { ...draft, paid_tier: paid.tier, order: paid }
}

export async function markCheckoutPaid(input: {
  draftToken: string
  tier: PaidTier
  stripeSessionId: string
  paymentIntentId?: string | null
  customerEmail?: string | null
}) {
  const orders = await listFirestoreDocuments(RYE_COLLECTIONS.orders)
  const prepared = orders
    .filter(row => row.draft_token === input.draftToken && row.tier === input.tier && row.status === 'checkout_created')
    .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))[0]

  if (!prepared) {
    const alreadyPaid = orders.find(row => row.stripe_checkout_session_id === input.stripeSessionId && row.status === 'paid')
    if (alreadyPaid) return alreadyPaid
    throw new Error('Prepared order not found')
  }

  const orderId = String(prepared._firestoreId || prepared.id)
  const verifiedAt = new Date().toISOString()
  const updated = await patchFirestoreDocument(RYE_COLLECTIONS.orders, orderId, {
    status: 'paid',
    stripe_checkout_session_id: input.stripeSessionId,
    stripe_payment_intent_id: input.paymentIntentId || null,
    customer_email: input.customerEmail || null,
    verified_at: verifiedAt,
  })
  await patchFirestoreDocument(RYE_COLLECTIONS.drafts, input.draftToken, {
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  })
  await recordConversion('purchase_completed', input.draftToken, { tier: input.tier, session: input.stripeSessionId }, String(prepared.event_segment || 'other'))
  return updated
}

export async function markCheckoutExpired(draftToken: string, tier: PaidTier) {
  const orders = await listFirestoreDocuments(RYE_COLLECTIONS.orders)
  const order = orders
    .filter(row => row.draft_token === draftToken && row.tier === tier && row.status === 'checkout_created')
    .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))[0]
  if (!order) return false
  await patchFirestoreDocument(RYE_COLLECTIONS.orders, String(order._firestoreId || order.id), { status: 'expired' })
  return true
}

export async function markRefundedByPaymentIntent(paymentIntentId: string) {
  const orders = await listFirestoreDocuments(RYE_COLLECTIONS.orders)
  const matches = orders.filter(row => row.stripe_payment_intent_id === paymentIntentId)
  await Promise.all(matches.map(row => patchFirestoreDocument(RYE_COLLECTIONS.orders, String(row._firestoreId || row.id), { status: 'refunded' })))
  return matches.length
}

export async function listDrafts() {
  return listFirestoreDocuments(RYE_COLLECTIONS.drafts)
}

export async function listOrders() {
  return listFirestoreDocuments(RYE_COLLECTIONS.orders)
}

export async function listConversions() {
  return listFirestoreDocuments(RYE_COLLECTIONS.conversions)
}
