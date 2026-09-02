export type SportsEventType = 'heimspiel' | 'familien-spieltag' | 'jugendturnier' | 'vereinsfest' | 'sponsorenspieltag'
export type VolunteerClass = 'club_only' | 'club_supervised' | 'open'
export type AttendanceSensitivity = 'none' | 'light' | 'crowd'

export type SportsTaskSeed = {
  id: string
  title: string
  phase: 'Vorbereitung' | 'Aufbau' | 'Ankunft' | 'Spielbetrieb' | 'Halbzeit' | 'Nachspiel' | 'Abbau'
  startOffsetMin: number
  durationHours: number
  helperCount: number
  volunteerClass: VolunteerClass
  briefing: string
  recognition?: string
  attendanceSensitivity?: AttendanceSensitivity
}

export type SportsShift = SportsTaskSeed & {
  shiftId: string
  shiftIndex: number
  startTime: string
  endTime: string
  sourceDurationHours: number
}

export type SportsEventPlan = {
  eventType: SportsEventType
  eventLabel: string
  kickoffTime: string
  expectedVisitors: number
  attendanceBand: string
  tasks: SportsTaskSeed[]
  shifts: SportsShift[]
  clubTaskCount: number
  helperShiftCount: number
  publicShiftCount: number
  maxShiftHours: number
}

const common: SportsTaskSeed[] = [
  { id: 'venue-check', title: 'Platz- und Anlagencheck', phase: 'Vorbereitung', startOffsetMin: -210, durationHours: 1, helperCount: 1, volunteerClass: 'club_only', attendanceSensitivity: 'none', briefing: 'Verantwortliche Vereinsrolle prüft Spielfeld, Zugänge und Freigaben.' },
  { id: 'setup-signage', title: 'Beschilderung & Eingangsbereich', phase: 'Aufbau', startOffsetMin: -150, durationHours: 1.5, helperCount: 2, volunteerClass: 'open', attendanceSensitivity: 'light', briefing: 'Kurze Einweisung vor Ort; Material stellt der Verein.', recognition: 'Essen & Getränk' },
  { id: 'guest-team', title: 'Gastteam & Schiedsrichter empfangen', phase: 'Ankunft', startOffsetMin: -105, durationHours: 1, helperCount: 1, volunteerClass: 'club_only', attendanceSensitivity: 'none', briefing: 'Vereinsvertretung mit Zugang zu Kabinen und Ansprechpartnern.' },
  { id: 'family-welcome', title: 'Familien willkommen heißen', phase: 'Ankunft', startOffsetMin: -45, durationHours: 2, helperCount: 2, volunteerClass: 'open', attendanceSensitivity: 'crowd', briefing: 'Treffpunkt am Eingang; kurze Einweisung in Wege und Familienangebote.', recognition: 'Essen & Getränk' },
  { id: 'kids-challenge', title: 'Kids Challenge betreuen', phase: 'Spielbetrieb', startOffsetMin: -30, durationHours: 2, helperCount: 2, volunteerClass: 'club_supervised', attendanceSensitivity: 'crowd', briefing: 'Vereinsansprechpartner bleibt verantwortlich; Helfer betreuen Ablauf und Warteschlange.', recognition: 'Essen & Getränk' },
  { id: 'food-stand', title: 'Grill & Verkauf unterstützen', phase: 'Spielbetrieb', startOffsetMin: -60, durationHours: 6, helperCount: 2, volunteerClass: 'club_supervised', attendanceSensitivity: 'crowd', briefing: 'In kurze Schichten teilen; Kasse und verantwortliche Verkaufsleitung bleiben beim Verein.', recognition: 'Essen & Getränk' },
  { id: 'content', title: 'Foto & Social Content', phase: 'Spielbetrieb', startOffsetMin: -20, durationHours: 2, helperCount: 1, volunteerClass: 'open', attendanceSensitivity: 'none', briefing: 'Motivliste und Freigaberegeln vorab durch den Verein.', recognition: 'Freigetränk' },
  { id: 'security', title: 'Ordner- und Sicherheitsverantwortung', phase: 'Spielbetrieb', startOffsetMin: -60, durationHours: 4, helperCount: 2, volunteerClass: 'club_only', attendanceSensitivity: 'none', briefing: 'Nur durch geeignete, vom Verein bestimmte Verantwortliche besetzen. Erforderliche Anzahl nach Venue-, Verbands- und Sicherheitsvorgaben prüfen.' },
  { id: 'cleanup', title: 'Aufräumen & Rückbau', phase: 'Abbau', startOffsetMin: 120, durationHours: 2, helperCount: 3, volunteerClass: 'open', attendanceSensitivity: 'crowd', briefing: 'Kurze Aufgabenliste; Material zurück an definierte Stationen.', recognition: 'Essen & Getränk' },
]

const extras: Record<SportsEventType, SportsTaskSeed[]> = {
  heimspiel: [
    { id: 'raffle', title: 'Verlosung unterstützen', phase: 'Halbzeit', startOffsetMin: 35, durationHours: 1.5, helperCount: 2, volunteerClass: 'open', attendanceSensitivity: 'crowd', briefing: 'Ausgabe/Loslogistik nach Vereinsvorgabe; Abrechnung bleibt beim Verein.', recognition: 'Freikarte' },
    { id: 'post-match', title: 'Meet & Greet koordinieren', phase: 'Nachspiel', startOffsetMin: 105, durationHours: 1, helperCount: 2, volunteerClass: 'open', attendanceSensitivity: 'light', briefing: 'Wege, Wartebereich und Treffpunkt vorab festlegen.', recognition: 'Freigetränk' },
  ],
  'familien-spieltag': [
    { id: 'family-desk', title: 'Familien-Infopunkt', phase: 'Ankunft', startOffsetMin: -60, durationHours: 2, helperCount: 2, volunteerClass: 'open', attendanceSensitivity: 'crowd', briefing: 'Fragen beantworten und Familienangebote erklären.', recognition: 'Essen & Getränk' },
    { id: 'young-fans', title: 'Sponsor-a-Young-Fan Empfang', phase: 'Ankunft', startOffsetMin: -75, durationHours: 2, helperCount: 2, volunteerClass: 'club_supervised', attendanceSensitivity: 'crowd', briefing: 'Teilnehmerlisten und Betreuungsvorgaben kommen vom Verein.', recognition: 'Essen & Getränk' },
    { id: 'halftime-game', title: 'Halbzeit-Challenge vorbereiten', phase: 'Halbzeit', startOffsetMin: 30, durationHours: 1.5, helperCount: 2, volunteerClass: 'club_supervised', attendanceSensitivity: 'light', briefing: 'Sportliche Durchführung unter Vereinsaufsicht.', recognition: 'Freikarte' },
  ],
  jugendturnier: [
    { id: 'team-checkin', title: 'Team-Check-in', phase: 'Ankunft', startOffsetMin: -120, durationHours: 2, helperCount: 2, volunteerClass: 'club_supervised', attendanceSensitivity: 'light', briefing: 'Startunterlagen ausgeben; sportliche Freigaben bleiben beim Turnierteam.', recognition: 'Essen & Getränk' },
    { id: 'pitch-runner', title: 'Platz-Runner', phase: 'Spielbetrieb', startOffsetMin: -15, durationHours: 4, helperCount: 2, volunteerClass: 'open', attendanceSensitivity: 'light', briefing: 'Bälle, Material und Informationen zwischen Stationen bewegen.', recognition: 'Essen & Getränk' },
    { id: 'results-desk', title: 'Ergebnisanzeige unterstützen', phase: 'Spielbetrieb', startOffsetMin: 0, durationHours: 4, helperCount: 1, volunteerClass: 'club_supervised', attendanceSensitivity: 'none', briefing: 'Ergebnisse nach Freigabe durch Turnierleitung übertragen.', recognition: 'Essen & Getränk' },
  ],
  vereinsfest: [
    { id: 'festival-setup', title: 'Festbereich aufbauen', phase: 'Aufbau', startOffsetMin: -240, durationHours: 3, helperCount: 4, volunteerClass: 'open', attendanceSensitivity: 'light', briefing: 'Aufbauplan und Materialzonen vorab festlegen.', recognition: 'Essen & Getränk' },
    { id: 'activity-host', title: 'Mitmachstation betreuen', phase: 'Spielbetrieb', startOffsetMin: 0, durationHours: 4, helperCount: 2, volunteerClass: 'open', attendanceSensitivity: 'crowd', briefing: 'Ablaufkarte liegt an der Station; Vereinskontakt ist erreichbar.', recognition: 'Essen & Getränk' },
    { id: 'welcome-stage', title: 'Programm & Gästeführung', phase: 'Spielbetrieb', startOffsetMin: -15, durationHours: 3, helperCount: 2, volunteerClass: 'club_supervised', attendanceSensitivity: 'crowd', briefing: 'Programmablauf und Eskalationskontakt müssen klar sein.', recognition: 'Freigetränk' },
  ],
  sponsorenspieltag: [
    { id: 'sponsor-desk', title: 'Sponsor-Infopunkt', phase: 'Ankunft', startOffsetMin: -75, durationHours: 2, helperCount: 2, volunteerClass: 'club_supervised', attendanceSensitivity: 'light', briefing: 'Sponsor-Material und Ansprechpartner werden vom Verein gestellt.', recognition: 'Essen & Getränk' },
    { id: 'activation', title: 'Sponsor-Aktivierung betreuen', phase: 'Spielbetrieb', startOffsetMin: -30, durationHours: 2, helperCount: 2, volunteerClass: 'open', attendanceSensitivity: 'crowd', briefing: 'Klare Aktivierungsanleitung und Materialliste.', recognition: 'Freikarte' },
    { id: 'fan-experience', title: 'Fan-Erlebnis begleiten', phase: 'Nachspiel', startOffsetMin: 90, durationHours: 1.5, helperCount: 2, volunteerClass: 'open', attendanceSensitivity: 'crowd', briefing: 'Treffpunkt, Zeitfenster und Abschluss klar kommunizieren.', recognition: 'Freikarte' },
  ],
}

export const sportsEventTemplates = [
  { id: 'heimspiel' as const, label: 'Heimspiel', description: 'Regulärer Spieltag mit klaren Club- und Helferrollen.' },
  { id: 'familien-spieltag' as const, label: 'Familien-Spieltag', description: 'Mehr Familienangebote, Kids-Aktivitäten und zusätzliche Betreuung.' },
  { id: 'jugendturnier' as const, label: 'Jugendturnier', description: 'Mehr Teams, längerer Betrieb und wiederkehrende Stationsaufgaben.' },
  { id: 'vereinsfest' as const, label: 'Vereinsfest', description: 'Aufbau, Mitmachangebote, Gästewege und Rückbau.' },
  { id: 'sponsorenspieltag' as const, label: 'Sponsorenspieltag', description: 'Zusätzliche Aktivierungen und Fan-Erlebnisse rund um den Spieltag.' },
]

function parseClock(value: string) {
  const [h, m] = value.split(':').map(Number)
  return (Number.isFinite(h) ? h : 15) * 60 + (Number.isFinite(m) ? m : 0)
}

function formatClock(total: number) {
  const day = 24 * 60
  const normalized = ((total % day) + day) % day
  const h = Math.floor(normalized / 60)
  const m = normalized % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function normalizeVisitors(value: number) {
  if (!Number.isFinite(value)) return 250
  return Math.min(50000, Math.max(1, Math.round(value)))
}

function getAttendanceBand(visitors: number) {
  if (visitors <= 100) return 'kleiner Spieltag'
  if (visitors <= 300) return 'mittlerer Spieltag'
  if (visitors <= 750) return 'größerer Spieltag'
  if (visitors <= 1500) return 'großer Spieltag'
  return 'sehr großer Spieltag'
}

function staffingMultiplier(visitors: number, sensitivity: AttendanceSensitivity = 'none') {
  if (sensitivity === 'none') return 1

  if (sensitivity === 'light') {
    if (visitors <= 250) return 1
    if (visitors <= 600) return 1.25
    if (visitors <= 1200) return 1.5
    if (visitors <= 2500) return 2
    return 2.5
  }

  if (visitors <= 100) return 0.75
  if (visitors <= 250) return 1
  if (visitors <= 500) return 1.5
  if (visitors <= 1000) return 2
  if (visitors <= 2000) return 3
  return 4
}

function scaleTaskForAttendance(task: SportsTaskSeed, visitors: number): SportsTaskSeed {
  const multiplier = staffingMultiplier(visitors, task.attendanceSensitivity)
  return {
    ...task,
    helperCount: Math.max(1, Math.ceil(task.helperCount * multiplier)),
  }
}

function splitTask(task: SportsTaskSeed, kickoffMin: number): SportsShift[] {
  if (task.volunteerClass === 'club_only') return []
  const parts = Math.max(1, Math.ceil(task.durationHours / 2))
  const duration = task.durationHours > 4 ? task.durationHours / parts : task.durationHours
  const safeDuration = Math.min(4, Math.max(0.5, duration))

  if (task.durationHours <= 4) {
    const start = kickoffMin + task.startOffsetMin
    return [{ ...task, shiftId: `${task.id}-1`, shiftIndex: 1, startTime: formatClock(start), endTime: formatClock(start + safeDuration * 60), sourceDurationHours: task.durationHours, durationHours: safeDuration }]
  }

  return Array.from({ length: parts }, (_, index) => {
    const start = kickoffMin + task.startOffsetMin + index * safeDuration * 60
    return { ...task, shiftId: `${task.id}-${index + 1}`, shiftIndex: index + 1, startTime: formatClock(start), endTime: formatClock(start + safeDuration * 60), sourceDurationHours: task.durationHours, durationHours: safeDuration }
  })
}

export function buildSportsEventPlan(eventType: SportsEventType, kickoffTime = '15:00', expectedVisitors = 250): SportsEventPlan {
  const template = sportsEventTemplates.find(item => item.id === eventType) || sportsEventTemplates[0]
  const visitors = normalizeVisitors(expectedVisitors)
  const tasks = [...common, ...extras[eventType]].map(task => scaleTaskForAttendance(task, visitors))
  const kickoffMin = parseClock(kickoffTime)
  const shifts = tasks.flatMap(task => splitTask(task, kickoffMin))

  return {
    eventType,
    eventLabel: template.label,
    kickoffTime,
    expectedVisitors: visitors,
    attendanceBand: getAttendanceBand(visitors),
    tasks,
    shifts,
    clubTaskCount: tasks.filter(task => task.volunteerClass === 'club_only').length,
    helperShiftCount: shifts.length,
    publicShiftCount: shifts.filter(shift => shift.volunteerClass === 'open').length,
    maxShiftHours: shifts.reduce((max, shift) => Math.max(max, shift.durationHours), 0),
  }
}
