import { randomBytes } from 'node:crypto'
import {
  createFirestoreDocument,
  getFirestoreDocument,
  listFirestoreDocuments,
  patchFirestoreDocument,
  putFirestoreDocument,
  stableFirestoreId,
} from '@/lib/firebase-firestore'
import { RYE_COLLECTIONS } from '@/lib/rye-firestore-core'

function now() { return new Date().toISOString() }
function text(value: unknown) { return typeof value === 'string' ? value : '' }
function docId(row: Record<string, unknown>) { return String(row._firestoreId || row.id || '') }

async function volunteerActivity(type: string, data: Record<string, unknown>) {
  return createFirestoreDocument(RYE_COLLECTIONS.volunteerActivity, { type, ...data, source: 'runyourevent.com', created_at: now() })
}

export async function saveVolunteerProfile(input: {
  firstName: string; lastName: string; email: string; city: string; postalCode?: string | null; ageBand: string;
  schoolOrUniversity?: string | null; interests?: string | null; availability?: string | null;
  guardianConsentReady: boolean; privacyAck: boolean
}) {
  const id = `v_${stableFirestoreId(input.email.toLowerCase())}`
  const existing = await getFirestoreDocument(RYE_COLLECTIONS.volunteerProfiles, id)
  const createdAt = existing?.created_at || now()
  await putFirestoreDocument(RYE_COLLECTIONS.volunteerProfiles, id, {
    id,
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email.toLowerCase(),
    city: input.city,
    postal_code: input.postalCode || null,
    age_band: input.ageBand,
    school_or_university: input.schoolOrUniversity || null,
    interests: input.interests || null,
    availability: input.availability || null,
    guardian_consent_ready: input.guardianConsentReady,
    privacy_ack: input.privacyAck,
    status: 'active',
    created_at: createdAt,
    updated_at: now(),
  })
  return id
}

export async function saveOrganizerRequest(input: Record<string, unknown>) {
  const request = await createFirestoreDocument(RYE_COLLECTIONS.organizerRequests, {
    organization_name: input.organizationName,
    contact_name: input.contactName,
    contact_email: input.contactEmail,
    phone: input.phone || null,
    city: input.city,
    postal_code: input.postalCode || null,
    pipeline: input.pipeline,
    event_type: input.eventType || null,
    event_name: input.eventName || null,
    event_date: input.eventDate || null,
    season_label: input.seasonLabel || null,
    volunteers_needed: Number(input.volunteersNeeded || 0),
    role_examples: input.roleExamples || null,
    notes: input.notes || null,
    responsibility_ack: true,
    coverage_status: input.coverageStatus,
    protection_selected: Boolean(input.protectionSelected),
    protection_required: input.coverageStatus !== 'existing_confirmed',
    protection_ack: Boolean(input.protectionAck),
    protection_price_cents: 150,
    protection_status: input.coverageStatus === 'existing_confirmed' && !input.protectionSelected ? 'existing_coverage' : input.coverageStatus !== 'existing_confirmed' ? 'required_pending' : 'selected_pending',
    venue: input.venue || null,
    shift_start_local: input.shiftStartLocal || null,
    shift_end_local: input.shiftEndLocal || null,
    transport_mode: input.transportMode || 'independent',
    transport_details: input.transportDetails || null,
    transport_ack: Boolean(input.transportAck),
    commercial_ack: true,
    status: 'new',
    created_at: now(),
    updated_at: now(),
  })
  return docId(request)
}

export async function createVolunteerOpportunity(input: {
  requestId: string; title: string; eventDay: string; shiftStart: string; shiftEnd: string; slots: number;
  roleDescription: string; venue?: string | null; transportMode?: string | null; transportDetails?: string | null
}) {
  const request = await getFirestoreDocument(RYE_COLLECTIONS.organizerRequests, input.requestId)
  if (!request) throw new Error('organizer request not found')
  const start = new Date(input.shiftStart).getTime(); const end = new Date(input.shiftEnd).getTime()
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || (end - start) / 3_600_000 < 2 || (end - start) / 3_600_000 > 4) throw new Error('shift must be 2 to 4 hours')
  const opportunity = await createFirestoreDocument(RYE_COLLECTIONS.volunteerOpportunities, {
    organizer_request_id: input.requestId,
    title: input.title,
    organization_name: request.organization_name,
    event_name: request.event_name || null,
    city: request.city,
    venue: input.venue || request.venue || null,
    event_day: input.eventDay,
    shift_start: input.shiftStart,
    shift_end: input.shiftEnd,
    min_age: 16,
    slots_total: input.slots,
    role_description: input.roleDescription,
    transport_mode: input.transportMode || 'independent',
    transport_details: input.transportDetails || null,
    event_checkin_code: randomBytes(12).toString('hex'),
    protection_mode: request.protection_selected ? 'runyourevent' : 'organizer_existing',
    protection_status: request.protection_selected ? 'pending' : 'not_required',
    protection_price_cents: 150,
    status: 'open',
    created_at: now(),
    updated_at: now(),
  })
  await patchFirestoreDocument(RYE_COLLECTIONS.organizerRequests, input.requestId, { status: 'active', updated_at: now() })
  return docId(opportunity)
}

export async function inviteVolunteer(opportunityId: string, volunteerId: string) {
  const [opportunity, volunteer] = await Promise.all([
    getFirestoreDocument(RYE_COLLECTIONS.volunteerOpportunities, opportunityId),
    getFirestoreDocument(RYE_COLLECTIONS.volunteerProfiles, volunteerId),
  ])
  if (!opportunity || !volunteer) throw new Error('shift or volunteer not found')
  const raw = randomBytes(24).toString('hex')
  const hash = stableFirestoreId(raw)
  const placements = await listFirestoreDocuments(RYE_COLLECTIONS.volunteerPlacements)
  const existing = placements.find(row => row.opportunity_id === opportunityId && row.volunteer_profile_id === volunteerId)
  const fields = {
    opportunity_id: opportunityId,
    volunteer_profile_id: volunteerId,
    status: 'invited',
    event_day: opportunity.event_day,
    invite_token_hash: hash,
    invited_at: now(),
    accepted_at: null,
    reconfirmed_at: null,
    checked_in_at: null,
    checked_out_at: null,
    verified_minutes: 0,
    organizer_verified: false,
    billable_at: null,
    updated_at: now(),
  }
  if (existing) await putFirestoreDocument(RYE_COLLECTIONS.volunteerPlacements, docId(existing), { ...existing, ...fields, id: docId(existing) })
  else await createFirestoreDocument(RYE_COLLECTIONS.volunteerPlacements, { ...fields, created_at: now() })
  await volunteerActivity('invitation_created', { opportunityId, volunteerId, status: 'invited' })
  return raw
}

async function placementByInviteToken(inviteToken: string) {
  const hash = stableFirestoreId(inviteToken)
  const placements = await listFirestoreDocuments(RYE_COLLECTIONS.volunteerPlacements)
  return placements.find(row => row.invite_token_hash === hash) || null
}

export async function volunteerInviteLookup(inviteToken: string) {
  const placement = await placementByInviteToken(inviteToken)
  if (!placement) throw new Error('invalid invitation')
  const [volunteer, opportunity] = await Promise.all([
    getFirestoreDocument(RYE_COLLECTIONS.volunteerProfiles, String(placement.volunteer_profile_id)),
    getFirestoreDocument(RYE_COLLECTIONS.volunteerOpportunities, String(placement.opportunity_id)),
  ])
  if (!volunteer || !opportunity) throw new Error('invalid invitation')
  return {
    placementId: docId(placement), status: placement.status, acceptedAt: placement.accepted_at || null, reconfirmedAt: placement.reconfirmed_at || null,
    checkedInAt: placement.checked_in_at || null, checkedOutAt: placement.checked_out_at || null, eventDay: placement.event_day,
    volunteer: { firstName: volunteer.first_name, lastName: volunteer.last_name },
    opportunity: {
      id: docId(opportunity), title: opportunity.title, organizationName: opportunity.organization_name, eventName: opportunity.event_name,
      city: opportunity.city, venue: opportunity.venue, eventDay: opportunity.event_day, shiftStart: opportunity.shift_start, shiftEnd: opportunity.shift_end,
      roleDescription: opportunity.role_description, transportMode: opportunity.transport_mode, transportDetails: opportunity.transport_details,
    },
  }
}

export async function respondVolunteerInvite(inviteToken: string, action: 'accept' | 'decline' | 'reconfirm') {
  const placement = await placementByInviteToken(inviteToken)
  if (!placement) throw new Error('invalid invitation')
  const id = docId(placement); const status = String(placement.status || '')
  let next = ''
  if (action === 'accept' && ['invited', 'applied'].includes(status)) next = 'accepted'
  else if (action === 'decline' && !['completed', 'cancelled'].includes(status)) next = 'declined'
  else if (action === 'reconfirm' && ['accepted', 'reconfirmed'].includes(status)) next = 'reconfirmed'
  if (!next) throw new Error('invitation state does not allow this action')
  await patchFirestoreDocument(RYE_COLLECTIONS.volunteerPlacements, id, {
    status: next,
    accepted_at: action === 'accept' ? now() : placement.accepted_at || null,
    reconfirmed_at: action === 'reconfirm' ? now() : placement.reconfirmed_at || null,
    updated_at: now(),
  })
  await volunteerActivity('invitation_response', { inviteTokenHash: stableFirestoreId(inviteToken), action, resultingStatus: next })
  return next
}

export async function volunteerEventStatus(inviteToken: string, eventCode: string) {
  const placement = await placementByInviteToken(inviteToken)
  if (!placement) throw new Error('shift not found')
  const opportunity = await getFirestoreDocument(RYE_COLLECTIONS.volunteerOpportunities, String(placement.opportunity_id))
  if (!opportunity || opportunity.event_checkin_code !== eventCode) throw new Error('shift not found')
  return {
    placementId: docId(placement), status: placement.status, checkedInAt: placement.checked_in_at || null, checkedOutAt: placement.checked_out_at || null,
    title: opportunity.title, organizationName: opportunity.organization_name, shiftStart: opportunity.shift_start, shiftEnd: opportunity.shift_end, venue: opportunity.venue,
  }
}

export async function volunteerEventAction(inviteToken: string, eventCode: string, action: 'check_in' | 'check_out') {
  const placement = await placementByInviteToken(inviteToken)
  if (!placement) throw new Error('shift not found')
  const opportunity = await getFirestoreDocument(RYE_COLLECTIONS.volunteerOpportunities, String(placement.opportunity_id))
  if (!opportunity || opportunity.event_checkin_code !== eventCode) throw new Error('shift not found')
  const id = docId(placement); const stamp = now()
  if (action === 'check_in') {
    if (!['accepted', 'reconfirmed', 'confirmed'].includes(String(placement.status)) || placement.checked_in_at) throw new Error('check-in not available')
    await patchFirestoreDocument(RYE_COLLECTIONS.volunteerPlacements, id, { status: 'checked_in', checked_in_at: stamp, billable_at: stamp, updated_at: stamp })
  } else {
    if (!placement.checked_in_at || placement.checked_out_at) throw new Error('check-out not available')
    const minutes = Math.max(1, Math.min(720, Math.floor((Date.now() - new Date(String(placement.checked_in_at)).getTime()) / 60_000)))
    await patchFirestoreDocument(RYE_COLLECTIONS.volunteerPlacements, id, { status: 'completed', checked_out_at: stamp, verified_minutes: minutes, organizer_verified: true, updated_at: stamp })
  }
  await volunteerActivity('attendance', { inviteTokenHash: stableFirestoreId(inviteToken), eventCodeHash: stableFirestoreId(eventCode), action, recorded: true })
  return volunteerEventStatus(inviteToken, eventCode)
}

export async function prepareVolunteerInvoice(requestId: string) {
  const request = await getFirestoreDocument(RYE_COLLECTIONS.organizerRequests, requestId)
  if (!request || request.pipeline !== 'one_off_event') throw new Error('no billable attendance')
  const [opportunities, placements, billingRuns] = await Promise.all([
    listFirestoreDocuments(RYE_COLLECTIONS.volunteerOpportunities),
    listFirestoreDocuments(RYE_COLLECTIONS.volunteerPlacements),
    listFirestoreDocuments(RYE_COLLECTIONS.volunteerBilling),
  ])
  if (billingRuns.some(row => row.organizer_request_id === requestId && ['invoicing', 'sent', 'paid'].includes(String(row.status)))) throw new Error('billing already in progress or completed')
  const opportunityIds = new Set(opportunities.filter(row => row.organizer_request_id === requestId).map(docId))
  const successful = placements.filter(row => opportunityIds.has(String(row.opportunity_id)) && row.billable_at)
  if (!successful.length) throw new Error('no billable attendance')
  const unitFeeCents = successful.length <= 5 ? 2500 : successful.length <= 15 ? 2000 : 1500
  const protectionDays = successful.filter(row => {
    const o = opportunities.find(item => docId(item) === String(row.opportunity_id))
    return o?.protection_mode === 'runyourevent'
  }).length
  const placementAmountCents = successful.length * unitFeeCents
  const protectionAmountCents = protectionDays * 150
  const totalAmountCents = placementAmountCents + protectionAmountCents
  const run = await createFirestoreDocument(RYE_COLLECTIONS.volunteerBilling, {
    organizer_request_id: requestId, successful_placements: successful.length, unit_fee_cents: unitFeeCents,
    placement_amount_cents: placementAmountCents, protection_volunteer_days: protectionDays, protection_amount_cents: protectionAmountCents,
    total_amount_cents: totalAmountCents, status: 'invoicing', stripe_invoice_id: null, created_at: now(), updated_at: now(),
  })
  return {
    billingRunId: docId(run), requestId, organizationName: request.organization_name, customerEmail: request.contact_email,
    successfulPlacements: successful.length, unitFeeCents, placementAmountCents, protectionVolunteerDays: protectionDays, protectionAmountCents, totalAmountCents,
  }
}

export async function markVolunteerInvoice(billingRunId: string, status: string, stripeInvoiceId?: string | null) {
  if (!['sent', 'paid', 'failed', 'cancelled'].includes(status)) throw new Error('invalid billing status')
  await patchFirestoreDocument(RYE_COLLECTIONS.volunteerBilling, billingRunId, { status, stripe_invoice_id: stripeInvoiceId || null, updated_at: now() })
}

export async function volunteerDashboard() {
  const [organizers, volunteers, opportunities, placements, billing] = await Promise.all([
    listFirestoreDocuments(RYE_COLLECTIONS.organizerRequests), listFirestoreDocuments(RYE_COLLECTIONS.volunteerProfiles),
    listFirestoreDocuments(RYE_COLLECTIONS.volunteerOpportunities), listFirestoreDocuments(RYE_COLLECTIONS.volunteerPlacements), listFirestoreDocuments(RYE_COLLECTIONS.volunteerBilling),
  ])
  const nowMs = Date.now(); const day = 86_400_000
  const progress = new Map<string, { credited_minutes: number; days: Set<string> }>()
  for (const placement of placements) {
    if (!(placement.organizer_verified && placement.status === 'completed')) continue
    const volunteerId = String(placement.volunteer_profile_id); const key = String(placement.event_day || '')
    const item = progress.get(volunteerId) || { credited_minutes: 0, days: new Set<string>() }
    const currentDayCredit = placements.filter(p => p.volunteer_profile_id === volunteerId && p.event_day === key && p.organizer_verified && p.status === 'completed').reduce((sum, p) => sum + Number(p.verified_minutes || 0), 0)
    if (!item.days.has(key)) { item.credited_minutes += Math.min(240, currentDayCredit); item.days.add(key) }
    progress.set(volunteerId, item)
  }
  const volunteerRows = volunteers.map(v => {
    const p = progress.get(docId(v)) || { credited_minutes: 0, days: new Set<string>() }
    return { ...v, credited_minutes: p.credited_minutes, points: Math.floor(p.credited_minutes * 100 / 60), distinct_event_days: p.days.size, certificate_eligible: p.credited_minutes >= 1800 }
  })
  const placementRows = placements.map(pl => {
    const o = opportunities.find(x => docId(x) === String(pl.opportunity_id)); const v = volunteers.find(x => docId(x) === String(pl.volunteer_profile_id))
    return { ...pl, opportunity_title: o?.title, organization_name: o?.organization_name, first_name: v?.first_name, last_name: v?.last_name }
  })
  const metrics = {
    organizerLeads7d: organizers.filter(x => nowMs - new Date(String(x.created_at || 0)).getTime() <= 7 * day).length,
    volunteers30d: volunteers.filter(x => nowMs - new Date(String(x.created_at || 0)).getTime() <= 30 * day).length,
    openOpportunities: opportunities.filter(x => x.status === 'open').length,
    confirmedPlacements: placements.filter(x => ['accepted', 'reconfirmed', 'checked_in', 'confirmed', 'completed'].includes(String(x.status))).length,
    attendedPlacements: placements.filter(x => x.billable_at).length,
    protectionRequired: organizers.filter(x => x.protection_required && x.status !== 'closed').length,
    certificateEligible: volunteerRows.filter(x => x.certificate_eligible).length,
    billableOneOffCents: billing.filter(x => !['cancelled', 'failed'].includes(String(x.status))).reduce((sum, x) => sum + Number(x.total_amount_cents || 0), 0),
  }
  return {
    metrics,
    organizers: organizers.sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||''))).slice(0,30),
    volunteers: volunteerRows.sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||''))).slice(0,30),
    opportunities: opportunities.sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||''))).slice(0,30),
    placements: placementRows.sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||''))).slice(0,30),
    billing: billing.sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||''))).slice(0,30),
  }
}
