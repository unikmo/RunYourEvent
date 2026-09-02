import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase-server'
import { hashWorkspaceToken, WORKSPACE_COOKIE_PREFIX } from '@/lib/workspace-auth'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Meine Spieltage | RunYourEvent',
  robots: { index: false, follow: false },
}

export default async function MyEventsPage() {
  const store = await cookies()
  const db = createServerClient()
  const entries = store.getAll().filter(cookie => cookie.name.startsWith(WORKSPACE_COOKIE_PREFIX))
  const workspaces: any[] = []

  for (const entry of entries) {
    const id = entry.name.slice(WORKSPACE_COOKIE_PREFIX.length)
    const { data, error } = await db.rpc('rye_get_workspace', {
      p_workspace_id: id,
      p_access_hash: hashWorkspaceToken(entry.value),
    })
    if (!error && data?.workspace) workspaces.push(data)
  }

  return (
    <main className="min-h-[72vh] bg-[#f7faf6]">
      <section className="shell py-14 sm:py-18 lg:py-20">
        <div className="max-w-3xl">
          <p className="club-eyebrow">Dein RunYourEvent Bereich</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.055em] text-[#102218] sm:text-5xl">Meine Spieltage</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#657269]">
            Hier findest du die Spieltage und Vereinsveranstaltungen, die in diesem Browser geöffnet wurden. Sichere Team-Links können weitere Event-Workspaces hinzufügen.
          </p>
        </div>

        {workspaces.length > 0 ? (
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {workspaces.map((item: any) => {
              const metrics = item.metrics || {}
              const readiness = metrics.total ? Math.round((metrics.done / metrics.total) * 100) : 0
              return (
                <a
                  key={item.workspace.id}
                  href={`/workspace/${item.workspace.id}`}
                  className="rounded-[22px] border border-black/[0.065] bg-white p-6 shadow-[0_14px_38px_rgba(21,62,31,0.035)] transition hover:-translate-y-0.5 hover:border-[#b9cbbb]"
                >
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.13em] text-[#25823d]">{item.workspace.tier} · {item.role}</p>
                      <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-[#173020]">{item.workspace.name}</h2>
                      <p className="mt-2 text-sm text-[#68756c]">
                        {item.workspace.event_date || 'Datum noch offen'} · {metrics.done || 0}/{metrics.total || 0} Aufgaben erledigt
                      </p>
                    </div>
                    <p className="text-3xl font-black tracking-[-0.04em] text-[#25823d]">{readiness}%</p>
                  </div>
                </a>
              )
            })}
          </div>
        ) : (
          <div className="mt-10 rounded-[24px] border border-black/[0.065] bg-white p-7 shadow-[0_18px_48px_rgba(21,62,31,0.04)] sm:p-8">
            <p className="club-eyebrow">Noch kein Spieltag geöffnet</p>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.035em] text-[#173020]">Erstelle euren ersten Spieltag.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#68756c]">
              RYE teilt das Event in Aufgaben und Verantwortlichkeiten auf und macht passende Aufgaben zu kurzen Helferschichten.
            </p>
            <a href="/vereine/spieltag-erstellen" className="btn-primary mt-6">Spieltag erstellen</a>
          </div>
        )}
      </section>
    </main>
  )
}
