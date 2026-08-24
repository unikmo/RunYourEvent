export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-[#fcfbf8]/94 backdrop-blur-xl">
      <div className="shell flex h-[68px] items-center justify-between gap-5">
        <a href="/" className="group inline-flex items-center gap-2.5" aria-label="RunYourEvent home">
          <span className="h-2.5 w-2.5 rounded-[3px] bg-[#d5ad48] transition-transform duration-150 group-hover:rotate-12" aria-hidden="true" />
          <span className="text-[17px] font-black tracking-[-0.04em] text-[#15233f]">RunYourEvent</span>
        </a>

        <nav className="hidden items-center gap-7 text-[13px] font-bold text-[#657184] lg:flex" aria-label="Primary">
          <a href="/#how-it-works" className="transition-colors hover:text-[#15233f]">Product</a>
          <a href="/event-types" className="transition-colors hover:text-[#15233f]">Event types</a>
          <a href="/resources" className="transition-colors hover:text-[#15233f]">Resources</a>
          <a href="/pricing" className="transition-colors hover:text-[#15233f]">Pricing</a>
          <a href="/my-events" className="transition-colors hover:text-[#15233f]">My events</a>
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
