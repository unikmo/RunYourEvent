export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.055] bg-[#f7f5ef]/92 backdrop-blur-2xl">
      <div className="shell flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
        <a href="/" className="group inline-flex items-center gap-3" aria-label="RunYourEvent home">
          <span className="hidden h-[2px] w-5 bg-[#d5ad48] transition-all duration-150 group-hover:w-7 sm:block" aria-hidden="true" />
          <span className="text-base font-black tracking-[-0.03em] text-[#101827] sm:text-[17px]">RunYourEvent</span>
        </a>
        <nav className="hidden items-center gap-7 text-[13px] font-bold text-[#657184] lg:flex" aria-label="Primary">
          <a href="/volunteer-engine/organizers" className="transition-colors hover:text-[#101827]">For clubs</a>
          <a href="/volunteer-engine/volunteers" className="transition-colors hover:text-[#101827]">For volunteers</a>
          <a href="/volunteer-engine" className="transition-colors hover:text-[#101827]">How it works</a>
          <a href="/pricing" className="transition-colors hover:text-[#101827]">Pricing</a>
          <a href="/about" className="transition-colors hover:text-[#101827]">About</a>
        </nav>
        <div className="flex items-center gap-2">
          <details className="relative lg:hidden">
            <summary className="cursor-pointer rounded-lg px-2 py-3 text-xs font-bold text-[#536072]">Menu</summary>
            <nav aria-label="Mobile" className="absolute right-0 top-full z-50 mt-2 grid w-52 gap-1 rounded-xl border border-[#ded9cf] bg-white p-2 text-sm font-semibold shadow-lg">
              <a className="rounded-md px-3 py-3 hover:bg-[#f7f5ef]" href="/volunteer-engine/organizers">For clubs</a>
              <a className="rounded-md px-3 py-3 hover:bg-[#f7f5ef]" href="/volunteer-engine/volunteers">For volunteers</a>
              <a className="rounded-md px-3 py-3 hover:bg-[#f7f5ef]" href="/volunteer-engine">How it works</a>
              <a className="rounded-md px-3 py-3 hover:bg-[#f7f5ef]" href="/pricing">Pricing</a>
              <a className="rounded-md px-3 py-3 hover:bg-[#f7f5ef]" href="/about">About</a>
              <a className="rounded-md px-3 py-3 hover:bg-[#f7f5ef]" href="/contact">Contact</a>
            </nav>
          </details>
          <a href="/volunteer-engine/organizers" className="btn-primary !min-h-11 !px-3 !py-2 text-xs sm:!px-4 sm:text-sm">Post activity</a>
        </div>
      </div>
    </header>
  )
}
