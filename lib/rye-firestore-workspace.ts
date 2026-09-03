import {
  createFirestoreDocument,
  deleteFirestoreDocument,
  getFirestoreDocument,
  listFirestoreDocuments,
  patchFirestoreDocument,
} from '@/lib/firebase-firestore'
import { RYE_COLLECTIONS } from '@/lib/rye-firestore-core'
import { getPaidDraft } from '@/lib/rye-firestore-commerce'

function now() { return new Date().toISOString() }
function text(value: unknown) { return typeof value === 'string' ? value : '' }
function asArray(value: unknown) { return Array.isArray(value) ? value : [] }

function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

function daysBetween(a: string, b: string) {
  const aa = new Date(`${a}T12:00:00Z`).getTime()
  const bb = new Date(`${b}T12:00:00Z`).getTime()
  return Math.round((bb - aa) / 86_400_000)
}

async function activity(workspaceId: string, actor: string, eventName: string, metadata: Record<string, unknown> = {}) {
  return createFirestoreDocument(RYE_COLLECTIONS.workspaceActivity, {
    workspace_id: workspaceId,
    actor,
    event_name: eventName,
    metadata,
    created_at: now(),
  })
}

export async function workspaceRoleForHash(workspaceId: string, accessHash: string) {
  const workspace = await getFirestoreDocument(RYE_COLLECTIONS.workspaces, workspaceId)
  if (!workspace) return null
  if (workspace.owner_access_hash === accessHash) return 'owner'
  const members = await listFirestoreDocuments(RYE_COLLECTIONS.workspaceMembers)
  const member = members.find(row => row.workspace_id === workspaceId && row.access_hash === accessHash && row.accepted_at)
  return member ? String(member.role || 'viewer') : null
}

export async function provisionWorkspace(draftToken: string, plan: any, ownerAccessHash: string) {
  const paid = await getPaidDraft(draftToken)
  if (!paid) throw new Error('paid entitlement required')

  const existing = (await listFirestoreDocuments(RYE_COLLECTIONS.workspaces)).find(row => row.draft_token === draftToken)
  if (existing) {
    const workspaceId = String(existing._firestoreId || existing.id)
    await patchFirestoreDocument(RYE_COLLECTIONS.workspaces, workspaceId, { owner_access_hash: ownerAccessHash, updated_at: now() })
    const members = await listFirestoreDocuments(RYE_COLLECTIONS.workspaceMembers)
    const owner = members.find(row => row.workspace_id === workspaceId && row.role === 'owner')
    if (owner) await patchFirestoreDocument(RYE_COLLECTIONS.workspaceMembers, String(owner._firestoreId || owner.id), { access_hash: ownerAccessHash, accepted_at: owner.accepted_at || now() })
    return workspaceId
  }

  const eventDate = /^\d{4}-\d{2}-\d{2}$/.test(text(plan?.smart?.eventDate)) ? text(plan.smart.eventDate) : null
  const workspace = await createFirestoreDocument(RYE_COLLECTIONS.workspaces, {
    draft_token: draftToken,
    name: text(plan?.event?.name) || 'Your event',
    event_date: eventDate,
    tier: String(paid.paid_tier || 'essential'),
    event_segment: String(paid.event_segment || 'other'),
    status: 'active',
    owner_access_hash: ownerAccessHash,
    created_at: now(),
    updated_at: now(),
  })
  const workspaceId = String(workspace._firestoreId || workspace.id)

  await createFirestoreDocument(RYE_COLLECTIONS.workspaceMembers, {
    workspace_id: workspaceId,
    name: 'Event owner',
    email: null,
    role: 'owner',
    access_hash: ownerAccessHash,
    accepted_at: now(),
    created_at: now(),
  })

  const tasks = asArray(plan?.tasks)
  const createdTasks: Record<string, unknown>[] = []
  for (let index = 0; index < tasks.length; index += 1) {
    const task: any = tasks[index] || {}
    const sourceTaskId = text(task.id) || `T${String(index + 1).padStart(2, '0')}`
    const targetDate = /^\d{4}-\d{2}-\d{2}$/.test(text(task.target_date)) ? text(task.target_date) : null
    const weeksBefore = Number.isFinite(Number(task.weeks_before_event)) ? Number(task.weeks_before_event) : null
    const created = await createFirestoreDocument(RYE_COLLECTIONS.workspaceTasks, {
      workspace_id: workspaceId,
      source_task_id: sourceTaskId,
      sort_order: index + 1,
      layer: text(task.layer) || null,
      workstream: text(task.workstream) || text(task.sub_project) || 'Event Operations',
      title: text(task.title) || 'Execution task',
      description: text(task.description) || null,
      owner_member_id: null,
      owner_label: text(task.who) || null,
      target_date: targetDate,
      baseline_target_date: targetDate,
      weeks_before_event: weeksBefore,
      depends_on: asArray(task.depends_on),
      approval_required: Boolean(task.approval_required),
      approver: text(task.approver) || null,
      completion_criteria: text(task.completion_criteria) || text(task.definition_of_done) || null,
      evidence_required: text(task.evidence_required) || null,
      evidence_note: null,
      risk_level: text(task.risk_level) || null,
      risk_if_missed: text(task.risk_if_missed) || null,
      contingency: text(task.contingency) || null,
      critical_path: Boolean(task.critical_path),
      procurement_category: text(task.procurement_category) || null,
      vendor_scope: text(task.vendor_scope) || null,
      status: 'not_started',
      blocked_reason: null,
      completed_at: null,
      created_at: now(),
      updated_at: now(),
    })
    createdTasks.push(created)
  }

  let rosOrder = 0
  for (const task of createdTasks) {
    if (task.layer !== 'Execution' && Number(task.weeks_before_event) !== 0) continue
    rosOrder += 1
    await createFirestoreDocument(RYE_COLLECTIONS.runOfShow, {
      workspace_id: workspaceId,
      sort_order: rosOrder,
      start_time: null,
      duration_minutes: 15,
      cue: String(task.title || 'Execution task'),
      owner_label: task.owner_label || null,
      location: null,
      source_task_id: task.source_task_id || null,
      technical_cue: null,
      contingency: task.contingency || null,
      notes: null,
      status: 'planned',
      created_at: now(),
      updated_at: now(),
    })
  }

  await activity(workspaceId, 'RunYourEvent', 'workspace_created', { tier: paid.paid_tier, tasks: createdTasks.length })
  return workspaceId
}

export async function getWorkspaceBundle(workspaceId: string, accessHash: string) {
  const role = await workspaceRoleForHash(workspaceId, accessHash)
  if (!role) throw new Error('unauthorized')
  const workspace = await getFirestoreDocument(RYE_COLLECTIONS.workspaces, workspaceId)
  if (!workspace) throw new Error('workspace not found')
  const [membersAll, tasksAll, commentsAll, rosAll, activityAll] = await Promise.all([
    listFirestoreDocuments(RYE_COLLECTIONS.workspaceMembers),
    listFirestoreDocuments(RYE_COLLECTIONS.workspaceTasks),
    listFirestoreDocuments(RYE_COLLECTIONS.taskComments),
    listFirestoreDocuments(RYE_COLLECTIONS.runOfShow),
    listFirestoreDocuments(RYE_COLLECTIONS.workspaceActivity),
  ])
  const members = membersAll.filter(row => row.workspace_id === workspaceId).map(({ access_hash: _secret, ...row }) => row)
  const tasks = tasksAll.filter(row => row.workspace_id === workspaceId).sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
  const comments = commentsAll.filter(row => row.workspace_id === workspaceId).sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || ''))).slice(0, 200)
  const runOfShow = rosAll.filter(row => row.workspace_id === workspaceId).sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
  const recentActivity = activityAll.filter(row => row.workspace_id === workspaceId).sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || ''))).slice(0, 80)
  const today = new Date().toISOString().slice(0, 10)
  const metrics = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
    criticalTotal: tasks.filter(t => t.critical_path).length,
    criticalDone: tasks.filter(t => t.critical_path && t.status === 'done').length,
    overdue: tasks.filter(t => text(t.target_date) && text(t.target_date) < today && t.status !== 'done').length,
    awaitingApproval: tasks.filter(t => t.status === 'awaiting_approval').length,
  }
  const { owner_access_hash: _ownerSecret, ...safeWorkspace } = workspace
  return { role, workspace: safeWorkspace, members, tasks, comments, runOfShow, activity: recentActivity, metrics }
}

export async function inviteWorkspaceMember(workspaceId: string, accessHash: string, input: { name: string; email: string; role: 'editor' | 'viewer'; memberAccessHash: string }) {
  const role = await workspaceRoleForHash(workspaceId, accessHash)
  if (role !== 'owner') throw new Error('owner access required')
  const member = await createFirestoreDocument(RYE_COLLECTIONS.workspaceMembers, {
    workspace_id: workspaceId,
    name: input.name || input.email || 'Collaborator',
    email: input.email ? input.email.toLowerCase() : null,
    role: input.role,
    access_hash: input.memberAccessHash,
    accepted_at: null,
    created_at: now(),
  })
  const memberId = String(member._firestoreId || member.id)
  await activity(workspaceId, 'owner', 'member_invited', { memberId, role: input.role, email: input.email })
  return memberId
}

export async function acceptWorkspaceInvite(memberAccessHash: string) {
  const members = await listFirestoreDocuments(RYE_COLLECTIONS.workspaceMembers)
  const member = members.find(row => row.access_hash === memberAccessHash)
  if (!member) throw new Error('invite not found')
  const memberId = String(member._firestoreId || member.id)
  await patchFirestoreDocument(RYE_COLLECTIONS.workspaceMembers, memberId, { accepted_at: member.accepted_at || now() })
  await activity(String(member.workspace_id), String(member.name || member.email || 'Collaborator'), 'member_joined', { memberId, role: member.role })
  return { workspaceId: String(member.workspace_id), memberId, name: member.name, role: member.role }
}

export async function replanWorkspaceDate(workspaceId: string, accessHash: string, newEventDate: string) {
  const role = await workspaceRoleForHash(workspaceId, accessHash)
  if (!['owner', 'editor'].includes(String(role))) throw new Error('write access required')
  const workspace = await getFirestoreDocument(RYE_COLLECTIONS.workspaces, workspaceId)
  if (!workspace) throw new Error('workspace not found')
  const oldDate = text(workspace.event_date)
  await patchFirestoreDocument(RYE_COLLECTIONS.workspaces, workspaceId, { event_date: newEventDate, updated_at: now() })
  const tasks = (await listFirestoreDocuments(RYE_COLLECTIONS.workspaceTasks)).filter(row => row.workspace_id === workspaceId && Number.isFinite(Number(row.weeks_before_event)))
  await Promise.all(tasks.map(task => {
    const target = addDays(newEventDate, -Number(task.weeks_before_event) * 7)
    return patchFirestoreDocument(RYE_COLLECTIONS.workspaceTasks, String(task._firestoreId || task.id), { target_date: target, baseline_target_date: target, updated_at: now() })
  }))
  await activity(workspaceId, String(role), 'event_date_replanned', { oldDate, newDate: newEventDate, tasksReplanned: tasks.length })
  return { oldDate, newDate: newEventDate, tasksReplanned: tasks.length }
}

export async function replanWorkspaceTaskDate(workspaceId: string, taskId: string, accessHash: string, newTargetDate: string) {
  const role = await workspaceRoleForHash(workspaceId, accessHash)
  if (!['owner', 'editor'].includes(String(role))) throw new Error('write access required')
  const tasks = (await listFirestoreDocuments(RYE_COLLECTIONS.workspaceTasks)).filter(row => row.workspace_id === workspaceId)
  const task = tasks.find(row => String(row._firestoreId || row.id) === taskId)
  if (!task || !task.target_date || !task.source_task_id) throw new Error('task cannot be replanned')
  const workspace = await getFirestoreDocument(RYE_COLLECTIONS.workspaces, workspaceId)
  const eventDate = text(workspace?.event_date)
  const oldDate = text(task.target_date)
  const deltaDays = daysBetween(oldDate, newTargetDate)
  await patchFirestoreDocument(RYE_COLLECTIONS.workspaceTasks, taskId, { target_date: newTargetDate, updated_at: now() })

  const sourceToTask = new Map(tasks.map(row => [String(row.source_task_id), row]))
  const queue = [String(task.source_task_id)]
  const affected = new Set<string>()
  for (let depth = 0; depth < 40 && queue.length; depth += 1) {
    const source = queue.shift()!
    for (const candidate of tasks) {
      const candidateId = String(candidate._firestoreId || candidate.id)
      if (candidateId === taskId || affected.has(candidateId) || candidate.status === 'done') continue
      const deps = asArray(candidate.depends_on).map(String)
      if (deps.includes(source)) {
        affected.add(candidateId)
        queue.push(String(candidate.source_task_id || ''))
      }
    }
  }
  await Promise.all([...affected].map(async id => {
    const candidate = tasks.find(row => String(row._firestoreId || row.id) === id)
    if (!candidate || !candidate.target_date) return
    let shifted = addDays(text(candidate.target_date), deltaDays)
    if (eventDate && shifted > eventDate) shifted = eventDate
    await patchFirestoreDocument(RYE_COLLECTIONS.workspaceTasks, id, { target_date: shifted, updated_at: now() })
  }))
  await activity(workspaceId, String(role), 'dependency_replanned', { taskId, sourceTaskId: task.source_task_id, oldDate, newDate: newTargetDate, deltaDays, downstreamTasks: affected.size })
  return { oldDate, newDate: newTargetDate, deltaDays, downstreamTasks: affected.size }
}

export async function updateWorkspaceTask(workspaceId: string, taskId: string, accessHash: string, input: { status: string; ownerMemberId?: string | null; evidenceNote?: string | null; blockedReason?: string | null }) {
  const role = await workspaceRoleForHash(workspaceId, accessHash)
  if (!['owner', 'editor'].includes(String(role))) throw new Error('write access required')
  const allowed = ['not_started', 'in_progress', 'blocked', 'awaiting_approval', 'done']
  if (!allowed.includes(input.status)) throw new Error('invalid status')
  const task = await getFirestoreDocument(RYE_COLLECTIONS.workspaceTasks, taskId)
  if (!task || task.workspace_id !== workspaceId) throw new Error('task not found')
  if (input.ownerMemberId) {
    const member = await getFirestoreDocument(RYE_COLLECTIONS.workspaceMembers, input.ownerMemberId)
    if (!member || member.workspace_id !== workspaceId) throw new Error('invalid owner')
  }
  await patchFirestoreDocument(RYE_COLLECTIONS.workspaceTasks, taskId, {
    status: input.status,
    owner_member_id: input.ownerMemberId || task.owner_member_id || null,
    evidence_note: input.evidenceNote ?? task.evidence_note ?? null,
    blocked_reason: input.status === 'blocked' ? input.blockedReason || null : null,
    completed_at: input.status === 'done' ? task.completed_at || now() : null,
    updated_at: now(),
  })
  await activity(workspaceId, String(role), 'task_updated', { taskId, title: task.title, status: input.status })
}

export async function addWorkspaceComment(workspaceId: string, taskId: string, accessHash: string, author: string, body: string) {
  const role = await workspaceRoleForHash(workspaceId, accessHash)
  if (!role) throw new Error('unauthorized')
  const task = await getFirestoreDocument(RYE_COLLECTIONS.workspaceTasks, taskId)
  if (!task || task.workspace_id !== workspaceId) throw new Error('task not found')
  if (!body.trim() || body.length > 2000) throw new Error('invalid comment')
  const comment = await createFirestoreDocument(RYE_COLLECTIONS.taskComments, {
    workspace_id: workspaceId,
    task_id: taskId,
    author_name: author.trim().slice(0, 100) || role,
    body: body.trim().slice(0, 2000),
    created_at: now(),
  })
  const commentId = String(comment._firestoreId || comment.id)
  await activity(workspaceId, author.trim() || role, 'comment_added', { taskId })
  return commentId
}

export async function saveRunOfShow(workspaceId: string, accessHash: string, input: any) {
  const role = await workspaceRoleForHash(workspaceId, accessHash)
  if (!['owner', 'editor'].includes(String(role))) throw new Error('write access required')
  const status = ['planned', 'ready', 'live', 'complete', 'at_risk'].includes(input.status) ? input.status : 'planned'
  const cue = text(input.cue).trim().slice(0, 220)
  if (!cue) throw new Error('cue required')
  let id = text(input.id)
  if (id) {
    const existing = await getFirestoreDocument(RYE_COLLECTIONS.runOfShow, id)
    if (!existing || existing.workspace_id !== workspaceId) throw new Error('run of show item not found')
    await patchFirestoreDocument(RYE_COLLECTIONS.runOfShow, id, {
      start_time: input.startTime || null,
      duration_minutes: Math.max(0, Math.min(1440, Number(input.durationMinutes) || 15)),
      cue,
      owner_label: text(input.owner).slice(0, 120) || null,
      location: text(input.location).slice(0, 160) || null,
      technical_cue: text(input.technicalCue).slice(0, 500) || null,
      contingency: text(input.contingency).slice(0, 1200) || null,
      notes: text(input.notes).slice(0, 1200) || null,
      status,
      updated_at: now(),
    })
  } else {
    const rows = (await listFirestoreDocuments(RYE_COLLECTIONS.runOfShow)).filter(row => row.workspace_id === workspaceId)
    const created = await createFirestoreDocument(RYE_COLLECTIONS.runOfShow, {
      workspace_id: workspaceId,
      sort_order: Math.max(0, ...rows.map(row => Number(row.sort_order || 0))) + 1,
      start_time: input.startTime || null,
      duration_minutes: Math.max(0, Math.min(1440, Number(input.durationMinutes) || 15)),
      cue,
      owner_label: text(input.owner).slice(0, 120) || null,
      location: text(input.location).slice(0, 160) || null,
      technical_cue: text(input.technicalCue).slice(0, 500) || null,
      contingency: text(input.contingency).slice(0, 1200) || null,
      notes: text(input.notes).slice(0, 1200) || null,
      status,
      created_at: now(),
      updated_at: now(),
    })
    id = String(created._firestoreId || created.id)
  }
  await activity(workspaceId, String(role), 'run_of_show_saved', { itemId: id, status })
  return id
}

export async function deleteRunOfShow(workspaceId: string, accessHash: string, id: string) {
  const role = await workspaceRoleForHash(workspaceId, accessHash)
  if (!['owner', 'editor'].includes(String(role))) throw new Error('write access required')
  const existing = await getFirestoreDocument(RYE_COLLECTIONS.runOfShow, id)
  if (!existing || existing.workspace_id !== workspaceId) return false
  await deleteFirestoreDocument(RYE_COLLECTIONS.runOfShow, id)
  await activity(workspaceId, String(role), 'run_of_show_deleted', { itemId: id })
  return true
}

export async function listWorkspaces() {
  return listFirestoreDocuments(RYE_COLLECTIONS.workspaces)
}
