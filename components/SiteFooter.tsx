export default function SiteFooter() {
  return (
    <footer className="bg-[#15233f] text-white">
      <div className="shell py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_.85fr_.95fr_.95fr]">
          <div>
            <a href="/" className="inline-flex items-center gap-2.5" aria-label="RunYourEvent home">
              <span className="h-2.5 w-2.5 rounded-[3px] bg-[#d5ad48]" aria-hidden="true" />
              <span className="text-lg font-black tracking-[-0.035em]">RunYourEvent</span>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/58">Turn a fixed-date event into a connected operating plan—and keep the work accountable through delivery.</p>
            <p className="mt-5 text-sm font-black text-[#e7c66f]">Every task. Every owner. Every deadline.</p>
            <p className="mt-3 text-xs text-white/40">A product of PlanetHike OÜ.</p>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/42">Product</p>
            <nav className="mt-5 space-y-3 text-sm font-semibold text-white/68" aria-label="Product links">
              <a className="block transition-colors hover:text-white" href="/custom">Build execution plan</a>
              <a className="block transition-colors hover:text-white" href="/event-execution-plan">How it works</a>
              <a className="block transition-colors hover:text-white" href="/templates">Templates</a>
              <a className="block transition-colors hover:text-white" href="/pricing">Pricing</a>
              <a className="block transition-colors hover:text-white" href="/my-events">My events</a>
            </nav>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/42">Popular guides</p>
            <nav className="mt-5 space-y-3 text-sm font-semibold text-white/68" aria-label="Popular guides">
              <a className="block transition-colors hover:text-white" href="/company-event-planning">Company events</a>
              <a className="block transition-colors hover:text-white" href="/wedding-planning-checklist">Weddings</a>
              <a className="block transition-colors hover:text-white" href="/family-reunion-planning">Family reunions</a>
              <a className="block transition-colors hover:text-white" href="/nonprofit-event-planning">Nonprofit events</a>
              <a className="block transition-colors hover:text-white" href="/volunteer-event-planning">Volunteer-led events</a>
              <a className="block transition-colors hover:text-white" href="/sports-event-planning">Sports events</a>
            </nav>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/42">Resources & legal</p>
            <nav className="mt-5 space-y-3 text-sm font-semibold text-white/68" aria-label="Resources and legal links">
              <a className="block transition-colors hover:text-white" href="/event-types">All event types</a>
              <a className="block transition-colors hover:text-white" href="/resources">All guides</a>
              <a className="block transition-colors hover:text-white" href="/about">About</a>
              <a className="block transition-colors hover:text-white" href="/contact">Contact</a>
              <a className="block transition-colors hover:text-white" href="/imprint">Imprint</a>
              <a className="block transition-colors hover:text-white" href="/privacy">Privacy</a>
              <a className="block transition-colors hover:text-white" href="/terms">Terms</a>
            </nav>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-white/38">© {new Date().getFullYear()} RunYourEvent · PlanetHike OÜ · Event Execution Platform.</div>
      </div>
    </footer>
  )
}
