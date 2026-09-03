// Legacy compatibility shim.
// Volunteer Engine now writes directly to Firestore through lib/rye-firestore-volunteer.ts.
// Existing route calls are retained temporarily so the cutover can remain a small, reversible diff.

export type VolunteerProfileMirrorInput = Record<string, unknown>
export type OrganizerRequestMirrorInput = Record<string, unknown>
export type OpportunityMirrorInput = Record<string, unknown>

export async function mirrorVolunteerProfileToFirebase(_input: VolunteerProfileMirrorInput) {
  return true
}

export async function mirrorOrganizerRequestToFirebase(_input: OrganizerRequestMirrorInput) {
  return true
}

export async function mirrorOpportunityToFirebase(_input: OpportunityMirrorInput) {
  return true
}

export async function mirrorVolunteerActivityToFirebase(
  _type: 'invitation_created' | 'invitation_response' | 'attendance',
  _data: Record<string, string | number | boolean | null | undefined>,
) {
  return true
}

export function safeFirebaseMirror(task: Promise<unknown>, _label: string) {
  return task.catch(() => false)
}
