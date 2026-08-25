export default function SiteFooter() {
  return (
    <footer className="bg-[#0e1729] text-white">
      <div className="shell py-16 sm:py-20">
        <div className="grid gap-14 lg:grid-cols-[1.25fr_.75fr_.85fr_.85fr]">
          <div>
            <a href="/" className="inline-flex items-center gap-3" aria-label="RunYourEvent home">
              <span className="h-[2px] w-5 bg-[#d5ad48]" aria-hidden="true" />
              <span className="text-lg font-black tracking-[-0.04em]">RunYourEvent</span>
            </a>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/52">The control layer between event planning and execution.</p>
            <p className="mt-6 max-w-sm text-xl font-black leading-7 tracking-[-0.03em] text-white/90">Every task.<br />Every owner.<br />Every deadline.</p>
            <p className="mt-6 text-xs text-white/34">A product of PlanetHike OÜ.</p>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/34">Product</p>
            <nav className="mt-5 space-y-3 text-sm font-semibold text-white/60" aria-label="Product links">
              <a className="block transition-colors hover:text-white" href="/custom">Build event plan</a>
              <a className="block transition-colors hover:text-white" href="/event-execution-plan">How it works</a>
              <a className="block transition-colors hover:text-white" href="/templates">Templates</a>
              <a className="block transition-colors hover:text-white" href="/pricing">Pricing</a>
              <a className="block transition-colors hover:text-white" href="/my-events">My events</a>
            </nav>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/34">Popular guides</p>
            <nav className="mt-5 space-y-3 text-sm font-semibold text-white/60" aria-label="Popular guides">
              <a className="block transition-colors hover:text-white" href="/company-event-planning">Company events</a>
              <a className="block transition-colors hover:text-white" href="/wedding-planning-checklist">Weddings</a>
              <a className="block transition-colors hover:text-white" href="/family-reunion-planning">Family reunions</a>
              <a className="block transition-colors hover:text-white" href="/nonprofit-event-planning">Nonprofit events</a>
              <a className="block transition-colors hover:text-white" href="/sports-event-planning">Sports events</a>
            </nav>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/34">Company</p>
            <nav className="mt-5 space-y-3 text-sm font-semibold text-white/60" aria-label="Resources and legal links">
              <a className="block transition-colors hover:text-white" href="/event-types">Event types</a>
              <a className="block transition-colors hover:text-white" href="/resources">Resources</a>
              <a className="block transition-colors hover:text-white" href="/about">About</a>
              <a className="block transition-colors hover:text-white" href="/contact">Contact</a>
              <a className="block transition-colors hover:text-white" href="/privacy">Privacy</a>
              <a className="block transition-colors hover:text-white" href="/terms">Terms</a>
              <a className="block transition-colors hover:text-white" href="/imprint">Imprint</a>
            </nav>
          </div>
        </div>
        <div className="mt-14 border-t border-white/10 pt-6 text-xs text-white/30">© {new Date().getFullYear()} RunYourEvent · PlanetHike OÜ · Event Execution Platform.</div>
      </div>
    </footer>
  )
}
