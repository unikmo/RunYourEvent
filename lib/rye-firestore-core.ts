import {
  getFirestoreDocument,
  listFirestoreDocuments,
  putFirestoreDocument,
  stableFirestoreId,
} from '@/lib/firebase-firestore'

export const RYE_COLLECTIONS = {
  events: 'rye_events',
  tasks: 'rye_tasks',
  categories: 'rye_categories',
  blueprints: 'rye_blueprints',
  drafts: 'rye_plan_drafts',
  orders: 'rye_orders',
  conversions: 'rye_conversion_events',
  workspaces: 'rye_workspaces',
  workspaceMembers: 'rye_workspace_members',
  workspaceTasks: 'rye_workspace_tasks',
  taskComments: 'rye_task_comments',
  runOfShow: 'rye_run_of_show',
  workspaceActivity: 'rye_workspace_activity',
  volunteerProfiles: 'rye_volunteer_profiles',
  organizerRequests: 'rye_volunteer_organizer_requests',
  volunteerOpportunities: 'rye_volunteer_opportunities',
  volunteerPlacements: 'rye_volunteer_placements',
  volunteerActivity: 'rye_volunteer_activity',
  volunteerBilling: 'rye_volunteer_billing_runs',
  adminSessions: 'rye_admin_sessions',
} as const

function text(value: unknown) {
  return typeof value === 'string' ? value : ''
}

export async function listEventCategories() {
  const rows = await listFirestoreDocuments(RYE_COLLECTIONS.categories)
  if (rows.length) {
    return rows
      .map(row => ({
        name: text(row.name),
        event_count: Number(row.event_count || 0),
        events_with_tasks: Number(row.events_with_tasks || 0),
      }))
      .filter(row => row.name)
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  const events = await listFirestoreDocuments(RYE_COLLECTIONS.events)
  const counts = new Map<string, number>()
  for (const event of events) {
    const name = text(event.category)
    if (name) counts.set(name, (counts.get(name) || 0) + 1)
  }
  return [...counts.entries()].map(([name, event_count]) => ({ name, event_count, events_with_tasks: 0 })).sort((a, b) => a.name.localeCompare(b.name))
}

export async function listEventsByCategory(category: string) {
  const events = await listFirestoreDocuments(RYE_COLLECTIONS.events)
  return events.filter(event => text(event.category) === category).sort((a, b) => text(a.name).localeCompare(text(b.name)))
}

export async function getEventById(id: string) {
  return getFirestoreDocument(RYE_COLLECTIONS.events, id)
}

export async function getTasksByEventId(eventId: string) {
  const tasks = await listFirestoreDocuments(RYE_COLLECTIONS.tasks)
  return tasks
    .filter(task => text(task.event_id) === eventId)
    .sort((a, b) => Number(a.slot || 0) - Number(b.slot || 0))
}

export async function getEventWithTasks(id: string) {
  const event = await getEventById(id)
  if (!event) return null
  const tasks = event.has_tasks ? await getTasksByEventId(id) : []
  return { event, tasks }
}

export async function getBlueprintByShareCode(code: string) {
  const blueprints = await listFirestoreDocuments(RYE_COLLECTIONS.blueprints)
  return blueprints.find(row => text(row.share_code) === code) || null
}

export async function saveBlueprint(blueprint: Record<string, unknown>) {
  const id = text(blueprint.id) || `bp_${stableFirestoreId(`${blueprint.share_code || ''}:${Date.now()}`)}`
  await putFirestoreDocument(RYE_COLLECTIONS.blueprints, id, { ...blueprint, id, updated_at: new Date().toISOString() })
  return id
}
