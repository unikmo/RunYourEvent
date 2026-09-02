export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.055] bg-white/94 backdrop-blur-2xl">
      <div className="shell flex h-[70px] items-center justify-between gap-5">
        <a href="/" className="group inline-flex items-center gap-3" aria-label="RunYourEvent Startseite">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#25823d] text-[11px] font-black tracking-[-0.04em] text-white" aria-hidden="true">RYE</span>
          <span>
            <span className="block text-[17px] font-black tracking-[-0.045em] text-[#102218]">RunYourEvent</span>
            <span className="hidden text-[10px] font-bold text-[#78847b] sm:block">Spieltage planen. Helfer finden.</span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 text-[13px] font-bold text-[#617067] lg:flex" aria-label="Hauptnavigation">
          <a href="/vereine" className="transition-colors hover:text-[#102218]">Für Vereine</a>
          <a href="/helfen" className="transition-colors hover:text-[#102218]">2 Stunden helfen</a>
          <a href="/#so-funktionierts" className="transition-colors hover:text-[#102218]">So funktioniert’s</a>
          <a href="/#preis" className="transition-colors hover:text-[#102218]">Preis</a>
          <a href="/my-events" className="transition-colors hover:text-[#102218]">Anmelden</a>
        </nav>

        <a href="/vereine/spieltag-erstellen" className="btn-primary !min-h-10 !px-4 !py-2.5">
          <span className="hidden sm:inline">Spieltag erstellen</span>
          <span className="sm:hidden">Starten</span>
        </a>
      </div>
    </header>
  )
}
