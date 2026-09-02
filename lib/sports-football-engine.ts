export type SportsEventType = 'heimspiel' | 'familien-spieltag' | 'jugendturnier' | 'vereinsfest' | 'sponsorenspieltag'
export type VolunteerClass = 'club_only' | 'club_supervised' | 'open'

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
  tasks: SportsTaskSeed[]
  shifts: SportsShift[]
  clubTaskCount: number
  helperShiftCount: number
  publicShiftCount: number
  maxShiftHours: number
}

const common: SportsTaskSeed[] = [
  { id: 'venue-check', title: 'Platz- und Anlagencheck', phase: 'Vorbereitung', startOffsetMin: -210, durationHours: 1, helperCount: 1, volunteerClass: 'club_only', briefing: 'Verantwortliche Vereinsrolle prüft Spielfeld, Zugänge und Freigaben.' },
  { id: 'setup-signage', title: 'Beschilderung & Eingangsbereich', phase: 'Aufbau', startOffsetMin: -150, durationHours: 1.5, helperCount: 2, volunteerClass: 'open', briefing: 'Kurze Einweisung vor Ort; Material stellt der Verein.', recognition: 'Essen & Getränk' },
  { id: 'guest-team', title: 'Gastteam & Schiedsrichter empfangen', phase: 'Ankunft', startOffsetMin: -105, durationHours: 1, helperCount: 1, volunteerClass: 'club_only', briefing: 'Vereinsvertretung mit Zugang zu Kabinen und Ansprechpartnern.' },
  { id: 'family-welcome', title: 'Familien willkommen heißen', phase: 'Ankunft', startOffsetMin: -45, durationHours: 2, helperCount: 2, volunteerClass: 'open', briefing: 'Treffpunkt am Eingang; kurze Einweisung in Wege und Familienangebote.', recognition: 'Essen & Getränk' },
  { id: 'kids-challenge', title: 'Kids Challenge betreuen', phase: 'Spielbetrieb', startOffsetMin: -30, durationHours: 2, helperCount: 2, volunteerClass: 'club_supervised', briefing: 'Vereinsansprechpartner bleibt verantwortlich; Helfer betreuen Ablauf und Warteschlange.', recognition: 'Essen & Getränk' },
  { id: 'food-stand', title: 'Grill & Verkauf unterstützen', phase: 'Spielbetrieb', startOffsetMin: -60, durationHours: 6, helperCount: 2, volunteerClass: 'club_supervised', briefing: 'In kurze Schichten teilen; Kasse und verantwortliche Verkaufsleitung bleiben beim Verein.', recognition: 'Essen & Getränk' },
  { id: 'content', title: 'Foto & Social Content', phase: 'Spielbetrieb', startOffsetMin: -20, durationHours: 2, helperCount: 1, volunteerClass: 'open', briefing: 'Motivliste und Freigaberegeln vorab durch den Verein.', recognition: 'Freigetränk' },
  { id: 'security', title: 'Ordner- und Sicherheitsverantwortung', phase: 'Spielbetrieb', startOffsetMin: -60, durationHours: 4, helperCount: 2, volunteerClass: 'club_only', briefing: 'Nur durch geeignete, vom Verein bestimmte Verantwortliche besetzen.' },
  { id: 'cleanup', title: 'Aufräumen & Rückbau', phase: 'Abbau', startOffsetMin: 120, durationHours: 2, helperCount: 3, volunteerClass: 'open', briefing: 'Kurze Aufgabenliste; Material zurück an definierte Stationen.', recognition: 'Essen & Getränk' },
]

const extras: Record<SportsEventType, SportsTaskSeed[]> = {
  heimspiel: [
    { id: 'raffle', title: 'Verlosung unterstützen', phase: 'Halbzeit', startOffsetMin: 35, durationHours: 1.5, helperCount: 2, volunteerClass: 'open', briefing: 'Ausgabe/Loslogistik nach Vereinsvorgabe; Abrechnung bleibt beim Verein.', recognition: 'Freikarte' },
    { id: 'post-match', title: 'Meet & Greet koordinieren', phase: 'Nachspiel', startOffsetMin: 105, durationHours: 1, helperCount: 2, volunteerClass: 'open', briefing: 'Wege, Wartebereich und Treffpunkt vorab festlegen.', recognition: 'Freigetränk' },
  ],
  'familien-spieltag': [
    { id: 'family-desk', title: 'Familien-Infopunkt', phase: 'Ankunft', startOffsetMin: -60, durationHours: 2, helperCount: 2, volunteerClass: 'open', briefing: 'Fragen beantworten und Familienangebote erklären.', recognition: 'Essen & Getränk' },
    { id: 'young-fans', title: 'Sponsor-a-Young-Fan Empfang', phase: 'Ankunft', startOffsetMin: -75, durationHours: 2, helperCount: 2, volunteerClass: 'club_supervised', briefing: 'Teilnehmerlisten und Betreuungsvorgaben kommen vom Verein.', recognition: 'Essen & Getränk' },
    { id: 'halftime-game', title: 'Halbzeit-Challenge vorbereiten', phase: 'Halbzeit', startOffsetMin: 30, durationHours: 1.5, helperCount: 2, volunteerClass: 'club_supervised', briefing: 'Sportliche Durchführung unter Vereinsaufsicht.', recognition: 'Freikarte' },
  ],
  jugendturnier: [
    { id: 'team-checkin', title: 'Team-Check-in', phase: 'Ankunft', startOffsetMin: -120, durationHours: 2, helperCount: 2, volunteerClass: 'club_supervised', briefing: 'Startunterlagen ausgeben; sportliche Freigaben bleiben beim Turnierteam.', recognition: 'Essen & Getränk' },
    { id: 'pitch-runner', title: 'Platz-Runner', phase: 'Spielbetrieb', startOffsetMin: -15, durationHours: 4, helperCount: 2, volunteerClass: 'open', briefing: 'Bälle, Material und Informationen zwischen Stationen bewegen.', recognition: 'Essen & Getränk' },
    { id: 'results-desk', title: 'Ergebnisanzeige unterstützen', phase: 'Spielbetrieb', startOffsetMin: 0, durationHours: 4, helperCount: 1, volunteerClass: 'club_supervised', briefing: 'Ergebnisse nach Freigabe durch Turnierleitung übertragen.', recognition: 'Essen & Getränk' },
  ],
  vereinsfest: [
    { id: 'festival-setup', title: 'Festbereich aufbauen', phase: 'Aufbau', startOffsetMin: -240, durationHours: 3, helperCount: 4, volunteerClass: 'open', briefing: 'Aufbauplan und Materialzonen vorab festlegen.', recognition: 'Essen & Getränk' },
    { id: 'activity-host', title: 'Mitmachstation betreuen', phase: 'Spielbetrieb', startOffsetMin: 0, durationHours: 4, helperCount: 2, volunteerClass: 'open', briefing: 'Ablaufkarte liegt an der Station; Vereinskontakt ist erreichbar.', recognition: 'Essen & Getränk' },
    { id: 'welcome-stage', title: 'Programm & Gästeführung', phase: 'Spielbetrieb', startOffsetMin: -15, durationHours: 3, helperCount: 2, volunteerClass: 'club_supervised', briefing: 'Programmablauf und Eskalationskontakt müssen klar sein.', recognition: 'Freigetränk' },
  ],
  sponsorenspieltag: [
    { id: 'sponsor-desk', title: 'Sponsor-Infopunkt', phase: 'Ankunft', startOffsetMin: -75, durationHours: 2, helperCount: 2, volunteerClass: 'club_supervised', briefing: 'Sponsor-Material und Ansprechpartner werden vom Verein gestellt.', recognition: 'Essen & Getränk' },
    { id: 'activation', title: 'Sponsor-Aktivierung betreuen', phase: 'Spielbetrieb', startOffsetMin: -30, durationHours: 2, helperCount: 2, volunteerClass: 'open', briefing: 'Klare Aktivierungsanleitung und Materialliste.', recognition: 'Freikarte' },
    { id: 'fan-experience', title: 'Fan-Erlebnis begleiten', phase: 'Nachspiel', startOffsetMin: 90, durationHours: 1.5, helperCount: 2, volunteerClass: 'open', briefing: 'Treffpunkt, Zeitfenster und Abschluss klar kommunizieren.', recognition: 'Freikarte' },
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

export function buildSportsEventPlan(eventType: SportsEventType, kickoffTime = '15:00'): SportsEventPlan {
  const template = sportsEventTemplates.find(item => item.id === eventType) || sportsEventTemplates[0]
  const tasks = [...common, ...extras[eventType]]
  const kickoffMin = parseClock(kickoffTime)
  const shifts = tasks.flatMap(task => splitTask(task, kickoffMin))

  return {
    eventType,
    eventLabel: template.label,
    kickoffTime,
    tasks,
    shifts,
    clubTaskCount: tasks.filter(task => task.volunteerClass === 'club_only').length,
    helperShiftCount: shifts.length,
    publicShiftCount: shifts.filter(shift => shift.volunteerClass === 'open').length,
    maxShiftHours: shifts.reduce((max, shift) => Math.max(max, shift.durationHours), 0),
  }
}
