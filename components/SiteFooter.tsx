export default function SiteFooter() {
  return (
    <footer className="bg-[#0e291a] text-white">
      <div className="shell py-14 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[1.3fr_.7fr_.7fr]">
          <div>
            <a href="/" className="inline-flex items-center gap-3" aria-label="RunYourEvent Startseite">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-[11px] font-black tracking-[-0.04em] text-[#1f7a38]">RYE</span>
              <span className="text-lg font-black tracking-[-0.04em]">RunYourEvent</span>
            </a>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/68">Spieltage strukturieren, Aufgaben aufteilen und Helfer für klare 2-Stunden-Schichten finden.</p>
            <p className="mt-5 text-xs text-white/42">Ein Produkt von PlanetHike OÜ.</p>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/42">RunYourEvent Club</p>
            <nav className="mt-5 space-y-3 text-sm font-semibold text-white/72" aria-label="Produktlinks">
              <a className="block hover:text-white" href="/vereine">Für Vereine</a>
              <a className="block hover:text-white" href="/vereine/spieltag-erstellen">Spieltag erstellen</a>
              <a className="block hover:text-white" href="/helfen">2 Stunden helfen</a>
              <a className="block hover:text-white" href="/#preis">Preis</a>
            </nav>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/42">Rechtliches</p>
            <nav className="mt-5 space-y-3 text-sm font-semibold text-white/72" aria-label="Rechtliche Links">
              <a className="block hover:text-white" href="/about">Über uns</a>
              <a className="block hover:text-white" href="/contact">Kontakt</a>
              <a className="block hover:text-white" href="/privacy">Datenschutz</a>
              <a className="block hover:text-white" href="/terms">Bedingungen</a>
              <a className="block hover:text-white" href="/imprint">Impressum</a>
            </nav>
          </div>
        </div>
        <div className="mt-12 border-t border-white/12 pt-5 text-xs text-white/38">© {new Date().getFullYear()} RunYourEvent · PlanetHike OÜ.</div>
      </div>
    </footer>
  )
}
