export default function SiteFooter() {
  return (
    <footer className="bg-[#0e1729] text-white">
      <div className="shell py-16 sm:py-20">
        <div className="grid gap-14 lg:grid-cols-[1.35fr_.8fr_.8fr]">
          <div>
            <a href="/" className="inline-flex items-center gap-3" aria-label="RunYourEvent home"><span className="h-[2px] w-5 bg-[#d5ad48]" aria-hidden="true" /><span className="text-lg font-black tracking-[-0.04em]">RunYourEvent</span></a>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/52">Short community activities. Full-day corporate projects. A lasting contribution to local sport.</p>
            <p className="mt-6 max-w-sm text-xl font-black leading-7 tracking-[-0.03em] text-white/90">Give a few hours.<br/>Help sport happen.</p>
            <p className="mt-6 text-xs text-white/34">A product of PlanetHike OÜ.</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/34">Platform</p>
            <nav className="mt-5 space-y-3 text-sm font-semibold text-white/60">
              <a className="block hover:text-white" href="/club">Club workspace</a>
              <a className="block hover:text-white" href="/volunteer-engine/volunteers">Join as a volunteer</a>
              <a className="block hover:text-white" href="/volunteer-engine">How it works</a>
              <a className="block hover:text-white" href="/activities">Find activities</a>
              <a className="block hover:text-white" href="/volunteer">My volunteer passport</a>
              <a className="block hover:text-white" href="/access">Sign in</a>
              <a className="block hover:text-white" href="/recognition">Recognition & rewards</a>
              <a className="block hover:text-white" href="/seasonal-needs">Publish seasonal needs</a>
              <a className="block hover:text-white" href="/opportunities">Sponsor club needs</a>
              <a className="block hover:text-white" href="/sponsors">For sponsors</a>
              <a className="block hover:text-white" href="/corporate">For companies</a>
              <a className="block hover:text-white" href="/pricing">Pricing</a>
            </nav>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/34">Company</p>
            <nav className="mt-5 space-y-3 text-sm font-semibold text-white/60">
              <a className="block hover:text-white" href="/about">About</a>
              <a className="block hover:text-white" href="/contact">Contact</a>
              <a className="block hover:text-white" href="/privacy">Privacy</a>
              <a className="block hover:text-white" href="/terms">Terms</a>
              <a className="block hover:text-white" href="/imprint">Imprint</a>
            </nav>
          </div>
        </div>
        <div className="mt-14 border-t border-white/10 pt-6 text-xs text-white/30">© {new Date().getFullYear()} RunYourEvent · PlanetHike OÜ · Sports Volunteer Platform.</div>
      </div>
    </footer>
  )
}
