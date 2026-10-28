export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.055] bg-[#f7f5ef]/92 backdrop-blur-2xl">
      <div className="shell flex h-[72px] items-center justify-between gap-5">
        <a href="/" className="group inline-flex items-center gap-3" aria-label="RunYourEvent home">
          <span className="h-[2px] w-5 bg-[#d5ad48] transition-all duration-150 group-hover:w-7" aria-hidden="true" />
          <span className="text-[17px] font-black tracking-[-0.045em] text-[#101827]">RunYourEvent</span>
        </a>
        <nav className="hidden items-center gap-5 text-[13px] font-bold text-[#657184] xl:flex" aria-label="Primary">
          {[['/club','For clubs'],['/activities','Volunteer'],['/corporate','Employee volunteering'],['/sponsors','Sponsors'],['/champsboard','Champsboard'],['/pricing','Pricing']].map(([href,label])=><a key={href} href={href} className="transition-colors hover:text-[#101827]">{label}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <a href="/volunteer" className="hidden px-2 py-2 text-xs font-extrabold text-[#657184] sm:inline-flex">My passport</a>
          <a href="/club" className="btn-primary !min-h-10 !px-4 !py-2.5">Post activity</a>
        </div>
      </div>
      <details className="shell border-t border-black/[0.06] py-2 xl:hidden"><summary className="cursor-pointer py-2 text-sm font-bold">Explore RunYourEvent</summary><nav aria-label="Mobile" className="grid grid-cols-2 gap-4 py-4 text-sm font-bold">{[['/volunteer','My volunteer passport'],['/access','Sign in'],['/club','Club workspace'],['/activities','Find activities'],['/opportunities','Browse needs to sponsor'],['/seasonal-needs','Seasonal club needs'],['/sponsors','For sponsors'],['/corporate','Employee volunteering'],['/champsboard','Champsboard'],['/recognition','Recognition'],['/notifications','Updates & matching'],['/billing','Club billing'],['/pricing','Pricing']].map(([href,label])=><a key={href} href={href}>{label}</a>)}</nav></details>
    </header>
  )
}
