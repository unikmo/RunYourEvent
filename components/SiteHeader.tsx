export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.055] bg-[#f7f5ef]/92 backdrop-blur-2xl">
      <div className="shell flex h-[72px] items-center justify-between gap-5">
        <a href="/" className="group inline-flex items-center gap-3" aria-label="RunYourEvent home">
          <span className="h-[2px] w-5 bg-[#d5ad48] transition-all duration-150 group-hover:w-7" aria-hidden="true" />
          <span className="text-[17px] font-black tracking-[-0.045em] text-[#101827]">RunYourEvent</span>
        </a>

        <nav className="hidden items-center gap-7 text-[13px] font-bold text-[#657184] lg:flex" aria-label="Primary">
          <a href="/#product" className="transition-colors hover:text-[#101827]">Product</a>
          <a href="/volunteer-engine" className="transition-colors hover:text-[#101827]">Volunteer Engine</a>
          <a href="/event-types" className="transition-colors hover:text-[#101827]">Event types</a>
          <a href="/resources" className="transition-colors hover:text-[#101827]">Resources</a>
          <a href="/pricing" className="transition-colors hover:text-[#101827]">Pricing</a>
          <a href="/my-events" className="transition-colors hover:text-[#101827]">My events</a>
        </nav>

        <div className="flex items-center gap-2">
          <a href="/my-events" className="px-2 py-2 text-xs font-extrabold text-[#657184] lg:hidden">My events</a>
          <a href="/custom" className="btn-primary !min-h-10 !px-4 !py-2.5">
            <span className="hidden sm:inline">Build my plan</span>
            <span className="sm:hidden">Build plan</span>
          </a>
        </div>
      </div>
    </header>
  )
}
