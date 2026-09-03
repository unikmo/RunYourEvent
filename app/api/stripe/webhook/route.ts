import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import {
  markCheckoutExpired,
  markCheckoutPaid,
  markRefundedByPaymentIntent,
  type PaidTier,
} from '@/lib/rye-firestore-commerce'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ESSENTIAL_LINK = 'plink_1U3Ty6CIFQh1oigOkto4hWGI'
const PROFESSIONAL_LINK = 'plink_1U3TyCCIFQh1oigOv909vWmb'

function tierForSession(session: any): PaidTier | null {
  const link = typeof session?.payment_link === 'string' ? session.payment_link : session?.payment_link?.id
  if (link === ESSENTIAL_LINK) return 'essential'
  if (link === PROFESSIONAL_LINK) return 'professional'
  return null
}

function safeEqualHex(a: string, b: string) {
  if (!/^[a-f0-9]+$/i.test(a) || !/^[a-f0-9]+$/i.test(b) || a.length !== b.length) return false
  const aa = Buffer.from(a, 'hex'); const bb = Buffer.from(b, 'hex')
  return aa.length === bb.length && timingSafeEqual(aa, bb)
}

function verifyStripeSignature(body: string, header: string, secret: string) {
  const fields = header.split(',').map(part => part.trim().split('=', 2))
  const timestamp = fields.find(([key]) => key === 't')?.[1]
  const signatures = fields.filter(([key]) => key === 'v1').map(([, value]) => value)
  if (!timestamp || !signatures.length) return false
  const seconds = Number(timestamp)
  if (!Number.isFinite(seconds) || Math.abs(Math.floor(Date.now() / 1000) - seconds) > 300) return false
  const expected = createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')
  return signatures.some(candidate => safeEqualHex(candidate, expected))
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) return new NextResponse('Server configuration error', { status: 500 })
  const signature = req.headers.get('stripe-signature')
  if (!signature) return new NextResponse('Missing signature', { status: 400 })
  const rawBody = await req.text()
  if (!verifyStripeSignature(rawBody, signature, secret)) return new NextResponse('Invalid signature', { status: 400 })

  let event: any
  try { event = JSON.parse(rawBody) } catch { return new NextResponse('Invalid payload', { status: 400 }) }

  try {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data?.object || {}
      if (event.type === 'checkout.session.completed' && session.payment_status !== 'paid') return NextResponse.json({ received: true, pending: true })
      const draftToken = String(session.client_reference_id || '')
      const tier = tierForSession(session)
      const expectedSubtotal = tier === 'essential' ? 1900 : tier === 'professional' ? 3900 : null
      if (!draftToken || !tier || String(session.currency || '').toLowerCase() !== 'usd' || Number(session.amount_subtotal) !== expectedSubtotal) {
        return new NextResponse('Unmatched checkout', { status: 400 })
      }
      const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null
      await markCheckoutPaid({
        draftToken,
        tier,
        stripeSessionId: String(session.id),
        paymentIntentId,
        customerEmail: session.customer_details?.email || session.customer_email || null,
      })
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data?.object || {}
      const draftToken = String(session.client_reference_id || '')
      const tier = tierForSession(session)
      if (draftToken && tier) await markCheckoutExpired(draftToken, tier)
    }

    if (event.type === 'charge.refunded') {
      const charge = event.data?.object || {}
      const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id
      if (paymentIntentId) await markRefundedByPaymentIntent(String(paymentIntentId))
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('RunYourEvent Stripe webhook failed', error)
    return new NextResponse('Webhook processing failed', { status: 500 })
  }
}
