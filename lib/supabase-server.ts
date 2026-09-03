import { storePreviewDraft, prepareCheckout, getPaidDraft } from '@/lib/rye-firestore-commerce'
import {
  acceptWorkspaceInvite,
  addWorkspaceComment,
  deleteRunOfShow,
  getWorkspaceBundle,
  inviteWorkspaceMember,
  provisionWorkspace,
  replanWorkspaceDate,
  replanWorkspaceTaskDate,
  saveRunOfShow,
  updateWorkspaceTask,
} from '@/lib/rye-firestore-workspace'
import {
  createVolunteerOpportunity,
  inviteVolunteer,
  markVolunteerInvoice,
  prepareVolunteerInvoice,
  respondVolunteerInvite,
  saveOrganizerRequest,
  saveVolunteerProfile,
  volunteerDashboard,
  volunteerEventAction,
  volunteerEventStatus,
  volunteerInviteLookup,
} from '@/lib/rye-firestore-volunteer'
import {
  adminDashboard,
  createAdminSession,
  deleteAdminSession,
  validateAdminSession,
} from '@/lib/rye-firestore-admin'

type RpcResult = { data: any; error: null | { message: string } }

function message(error: unknown) {
  return error instanceof Error ? error.message : 'Firestore operation failed.'
}

async function rpc(name: string, args: Record<string, any> = {}): Promise<RpcResult> {
  try {
    switch (name) {
      case 'dengine_store_preview_draft': {
        await storePreviewDraft({
          draftToken: args.p_draft_token,
          planCiphertext: args.p_plan_ciphertext,
          planIv: args.p_plan_iv,
          planTag: args.p_plan_tag,
          preview: args.p_preview || {},
          eventSummary: args.p_event_summary || {},
          recommendedTier: args.p_recommended_tier,
          expiresAt: args.p_expires_at,
        })
        return { data: null, error: null }
      }
      case 'dengine_prepare_checkout': {
        const order = await prepareCheckout(args.p_draft_token, args.p_tier)
        return { data: order.id || order._firestoreId, error: null }
      }
      case 'dengine_get_paid_draft':
        return { data: await getPaidDraft(args.p_draft_token), error: null }

      case 'rye_provision_workspace':
        return { data: await provisionWorkspace(args.p_draft_token, args.p_plan, args.p_owner_access_hash), error: null }
      case 'rye_get_workspace':
        return { data: await getWorkspaceBundle(args.p_workspace_id, args.p_access_hash), error: null }
      case 'rye_replan_workspace_date':
        return { data: await replanWorkspaceDate(args.p_workspace_id, args.p_access_hash, args.p_new_event_date), error: null }
      case 'rye_replan_task_date':
        return { data: await replanWorkspaceTaskDate(args.p_workspace_id, args.p_task_id, args.p_access_hash, args.p_new_target_date), error: null }
      case 'rye_update_task':
        await updateWorkspaceTask(args.p_workspace_id, args.p_task_id, args.p_access_hash, {
          status: args.p_status,
          ownerMemberId: args.p_owner_member_id,
          evidenceNote: args.p_evidence_note,
          blockedReason: args.p_blocked_reason,
        })
        return { data: null, error: null }
      case 'rye_add_comment':
        return { data: await addWorkspaceComment(args.p_workspace_id, args.p_task_id, args.p_access_hash, args.p_author || '', args.p_body || ''), error: null }
      case 'rye_invite_member':
        return { data: await inviteWorkspaceMember(args.p_workspace_id, args.p_access_hash, {
          name: args.p_name || '', email: args.p_email || '', role: args.p_role, memberAccessHash: args.p_member_access_hash,
        }), error: null }
      case 'rye_accept_invite':
        return { data: await acceptWorkspaceInvite(args.p_member_access_hash), error: null }
      case 'rye_save_run_of_show':
        return { data: await saveRunOfShow(args.p_workspace_id, args.p_access_hash, {
          id: args.p_id, startTime: args.p_start_time, durationMinutes: args.p_duration_minutes, cue: args.p_cue,
          owner: args.p_owner_label, location: args.p_location, technicalCue: args.p_technical_cue,
          contingency: args.p_contingency, notes: args.p_notes, status: args.p_status,
        }), error: null }
      case 'rye_delete_run_of_show':
        await deleteRunOfShow(args.p_workspace_id, args.p_access_hash, args.p_id)
        return { data: null, error: null }

      case 'rye_submit_volunteer_profile':
        return { data: await saveVolunteerProfile({
          firstName: args.p_first_name, lastName: args.p_last_name, email: args.p_email, city: args.p_city,
          postalCode: args.p_postal_code, ageBand: args.p_age_band, schoolOrUniversity: args.p_school_or_university,
          interests: args.p_interests, availability: args.p_availability, guardianConsentReady: Boolean(args.p_guardian_consent_ready),
          privacyAck: Boolean(args.p_privacy_ack),
        }), error: null }
      case 'rye_submit_volunteer_organizer_request_v3':
        return { data: await saveOrganizerRequest({
          organizationName: args.p_organization_name, contactName: args.p_contact_name, contactEmail: args.p_contact_email,
          phone: args.p_phone, city: args.p_city, postalCode: args.p_postal_code, pipeline: args.p_pipeline,
          eventType: args.p_event_type, eventName: args.p_event_name, eventDate: args.p_event_date, seasonLabel: args.p_season_label,
          volunteersNeeded: args.p_volunteers_needed, roleExamples: args.p_role_examples, notes: args.p_notes,
          coverageStatus: args.p_coverage_status, protectionSelected: Boolean(args.p_protection_selected), protectionAck: Boolean(args.p_protection_ack),
          venue: args.p_venue, shiftStartLocal: args.p_shift_start_local, shiftEndLocal: args.p_shift_end_local,
          transportMode: args.p_transport_mode, transportDetails: args.p_transport_details, transportAck: Boolean(args.p_transport_ack),
        }), error: null }
      case 'rye_admin_create_volunteer_opportunity':
        return { data: await createVolunteerOpportunity({
          requestId: args.p_request_id, title: args.p_title, eventDay: args.p_event_day, shiftStart: args.p_shift_start,
          shiftEnd: args.p_shift_end, slots: Number(args.p_slots), roleDescription: args.p_role_description,
          venue: args.p_venue, transportMode: args.p_transport_mode, transportDetails: args.p_transport_details,
        }), error: null }
      case 'rye_admin_invite_volunteer':
        return { data: await inviteVolunteer(args.p_opportunity_id, args.p_volunteer_id), error: null }
      case 'rye_volunteer_invite_lookup':
        return { data: await volunteerInviteLookup(args.p_invite_token), error: null }
      case 'rye_volunteer_respond_invite':
        return { data: await respondVolunteerInvite(args.p_invite_token, args.p_action), error: null }
      case 'rye_volunteer_event_status':
        return { data: await volunteerEventStatus(args.p_invite_token, args.p_event_code), error: null }
      case 'rye_volunteer_event_action':
        return { data: await volunteerEventAction(args.p_invite_token, args.p_event_code, args.p_action), error: null }
      case 'rye_admin_prepare_volunteer_invoice':
        return { data: await prepareVolunteerInvoice(args.p_request_id), error: null }
      case 'rye_admin_mark_volunteer_invoice':
        await markVolunteerInvoice(args.p_billing_run_id, args.p_status, args.p_stripe_invoice_id)
        return { data: true, error: null }
      case 'rye_admin_volunteer_dashboard':
        return { data: await volunteerDashboard(), error: null }

      case 'rye_admin_login': {
        const session = await createAdminSession(args.p_email || '', args.p_password || '')
        if (!session) throw new Error('invalid credentials')
        return { data: { session_token: session.sessionToken, expires_at: session.expiresAt }, error: null }
      }
      case 'rye_admin_session_valid':
        return { data: await validateAdminSession(args.p_token || ''), error: null }
      case 'rye_admin_logout':
        await deleteAdminSession(args.p_token || '')
        return { data: null, error: null }
      case 'rye_admin_dashboard':
        return { data: await adminDashboard(), error: null }
      default:
        throw new Error(`Unsupported legacy RPC after Firebase cutover: ${name}`)
    }
  } catch (error) {
    return { data: null, error: { message: message(error) } }
  }
}

export function createServerClient() {
  return { rpc }
}

export const getServerSupabase = createServerClient
export const createAdminClient = createServerClient
