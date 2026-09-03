import { randomUUID } from 'node:crypto'
import { firebaseMirrorEnabled, putFirestoreDocument, stableFirestoreId } from '@/lib/firebase-firestore'

export type VolunteerProfileMirrorInput = {
  supabaseId: string
  firstName: string
  lastName: string
  email: string
  city: string
  postalCode?: string | null
  ageBand: string
  schoolOrUniversity?: string | null
  interests?: string | null
  availability?: string | null
  guardianConsentReady: boolean
  privacyAck: boolean
}

export type OrganizerRequestMirrorInput = {
  supabaseId: string
  organizationName: string
  contactName: string
  contactEmail: string
  phone?: string | null
  city: string
  postalCode?: string | null
  pipeline: string
  eventType?: string | null
  eventName?: string | null
  eventDate?: string | null
  seasonLabel?: string | null
  volunteersNeeded: number
  roleExamples?: string | null
  notes?: string | null
  responsibilityAck: boolean
  coverageStatus: string
  protectionSelected: boolean
  protectionAck: boolean
  venue?: string | null
  shiftStartLocal?: string | null
  shiftEndLocal?: string | null
  transportMode?: string | null
  transportDetails?: string | null
  transportAck: boolean
  commercialAck: boolean
}

export type OpportunityMirrorInput = {
  supabaseId: string
  organizerRequestId: string
  title: string
  eventDay: string
  shiftStart: string
  shiftEnd: string
  slotsTotal: number
  roleDescription: string
  venue?: string | null
  transportMode?: string | null
  transportDetails?: string | null
}

export async function mirrorVolunteerProfileToFirebase(input: VolunteerProfileMirrorInput) {
  if (!firebaseMirrorEnabled()) return false
  const documentId = `v_${stableFirestoreId(input.email.toLowerCase())}`
  await putFirestoreDocument('rye_volunteer_profiles', documentId, {
    ...input,
    source: 'runyourevent.com',
    syncedAt: new Date(),
  })
  return true
}

export async function mirrorOrganizerRequestToFirebase(input: OrganizerRequestMirrorInput) {
  if (!firebaseMirrorEnabled()) return false
  await putFirestoreDocument('rye_volunteer_organizer_requests', input.supabaseId, {
    ...input,
    source: 'runyourevent.com',
    status: 'new',
    syncedAt: new Date(),
  })
  return true
}

export async function mirrorOpportunityToFirebase(input: OpportunityMirrorInput) {
  if (!firebaseMirrorEnabled()) return false
  await putFirestoreDocument('rye_volunteer_opportunities', input.supabaseId, {
    ...input,
    source: 'runyourevent.com',
    status: 'open',
    syncedAt: new Date(),
  })
  return true
}

export async function mirrorVolunteerActivityToFirebase(
  type: 'invitation_created' | 'invitation_response' | 'attendance',
  data: Record<string, string | number | boolean | null | undefined>,
) {
  if (!firebaseMirrorEnabled()) return false
  const documentId = `a_${Date.now()}_${randomUUID().replace(/-/g, '')}`
  await putFirestoreDocument('rye_volunteer_activity', documentId, {
    type,
    ...data,
    source: 'runyourevent.com',
    syncedAt: new Date(),
  })
  return true
}

export function safeFirebaseMirror(task: Promise<unknown>, label: string) {
  return task.catch((error) => {
    console.error(`Firebase mirror failed: ${label}`, error)
    return false
  })
}
