export default function SiteFooter() {
  return (
    <footer className="bg-[#0e1729] text-white">
      <div className="shell py-16 sm:py-20">
        <div className="grid gap-14 lg:grid-cols-[1.35fr_.8fr_.8fr]">
          <div>
            <a href="/" className="inline-flex items-center gap-3" aria-label="RunYourEvent – Startseite"><span className="h-[2px] w-5 bg-[#d5ad48]" aria-hidden="true" /><span className="text-lg font-black tracking-[-0.04em]">RunYourEvent</span></a>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/52">Ein paar Stunden helfen oder als Team einen ganzen Tag anpacken. Gemeinsam unterstützt ihr den Sport vor Ort.</p>
            <p className="mt-6 max-w-sm text-xl font-black leading-7 tracking-[-0.03em] text-white/90">Schenk ein paar Stunden.<br/>Mach Sport vor Ort möglich.</p>
            <p className="mt-6 text-xs text-white/34">Ein Angebot von PlanetHike OÜ.</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/34">Plattform</p>
            <nav className="mt-5 space-y-3 text-sm font-semibold text-white/60">
              <a className="block hover:text-white" href="/club">Mein Vereinsbereich</a>
              <a className="block hover:text-white" href="/volunteer-engine/volunteers">Als Freiwilliger mitmachen</a>
              <a className="block hover:text-white" href="/volunteer-engine">So funktioniert’s</a>
              <a className="block hover:text-white" href="/activities">Einsätze finden</a>
              <a className="block hover:text-white" href="/volunteer">Mein Engagementpass</a>
              <a className="block hover:text-white" href="/access">Anmelden</a>
              <a className="block hover:text-white" href="/recognition">Anerkennung &amp; Prämien</a>
              <a className="block hover:text-white" href="/seasonal-needs">Saisonbedarf veröffentlichen</a>
              <a className="block hover:text-white" href="/opportunities">Vereinsprojekte entdecken</a>
              <a className="block hover:text-white" href="/sponsors">Für Sponsoren</a>
              <a className="block hover:text-white" href="/corporate">Teameinsätze</a>
              <a className="block hover:text-white" href="/pricing">Preise</a>
            </nav>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/34">Unternehmen</p>
            <nav className="mt-5 space-y-3 text-sm font-semibold text-white/60">
              <a className="block hover:text-white" href="/guides">Tipps für dein Engagement</a>
              <a className="block hover:text-white" href="/faq">Häufige Fragen</a>
              <a className="block hover:text-white" href="/about">Über uns</a>
              <a className="block hover:text-white" href="/contact">Kontakt</a>
              <a className="block hover:text-white" href="/privacy">Datenschutz</a>
              <a className="block hover:text-white" href="/terms">Nutzungsbedingungen</a>
              <a className="block hover:text-white" href="/imprint">Impressum</a>
            </nav>
          </div>
        </div>
        <div className="mt-14 border-t border-white/10 pt-6 text-xs text-white/30">© {new Date().getFullYear()} RunYourEvent · PlanetHike OÜ · Freiwilliges Engagement im Sport.</div>
      </div>
    </footer>
  )
}
