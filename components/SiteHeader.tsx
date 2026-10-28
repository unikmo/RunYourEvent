export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.055] bg-[#f7f5ef]/92 backdrop-blur-2xl">
      <div className="shell flex h-[72px] items-center justify-between gap-5">
        <a href="/" className="group inline-flex items-center gap-3" aria-label="RunYourEvent – Startseite">
          <span className="h-[2px] w-5 bg-[#d5ad48] transition-all duration-150 group-hover:w-7" aria-hidden="true" />
          <span className="text-[17px] font-black tracking-[-0.045em] text-[#101827]">RunYourEvent</span>
        </a>
        <nav className="hidden items-center gap-5 text-[13px] font-bold text-[#657184] xl:flex" aria-label="Hauptnavigation">
          {[['/club',"Für Vereine"],['/activities',"Mitmachen"],['/corporate',"Teameinsätze"],['/sponsors',"Sponsoring"],['/champsboard','Champsboard'],['/pricing',"Preise"]].map(([href,label])=><a key={href} href={href} className="transition-colors hover:text-[#101827]">{label}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <a href="/volunteer" className="hidden px-2 py-2 text-xs font-extrabold text-[#657184] sm:inline-flex">Mein Engagementpass</a>
          <a href="/club" className="btn-primary !min-h-10 !px-4 !py-2.5">Einsatz ausschreiben</a>
        </div>
      </div>
      <details className="shell border-t border-black/[0.06] py-2 xl:hidden"><summary className="cursor-pointer py-2 text-sm font-bold">RunYourEvent entdecken</summary><nav aria-label="Mobile Navigation" className="grid grid-cols-2 gap-4 py-4 text-sm font-bold">{[['/volunteer',"Mein Engagementpass"],['/access',"Anmelden"],['/club',"Mein Vereinsbereich"],['/activities',"Einsätze finden"],['/opportunities',"Vereinsprojekte entdecken"],['/seasonal-needs',"Unterstützung für die Saison"],['/sponsors',"Für Sponsoren"],['/corporate',"Teameinsätze"],['/champsboard','Champsboard'],['/recognition',"Anerkennung"],['/notifications',"Nachrichten & passende Einsätze"],['/billing',"Rechnungen für deinen Verein"],['/pricing',"Preise"]].map(([href,label])=><a key={href} href={href}>{label}</a>)}</nav></details>
    </header>
  )
}
