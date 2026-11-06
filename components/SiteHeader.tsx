const mobileLinks = [
  ['/volunteer', 'Mein Engagementpass'], ['/access', 'Anmelden'],
  ['/club', 'Mein Vereinsbereich'], ['/activities', 'Einsätze finden'],
  ['/opportunities', 'Vereinsprojekte entdecken'], ['/seasonal-needs', 'Unterstützung für die Saison'],
  ['/sponsors', 'Für Sponsoren'], ['/corporate', 'Teameinsätze'],
  ['/champsboard', 'Champsboard'], ['/recognition', 'Anerkennung'],
  ['/notifications', 'Nachrichten & passende Einsätze'], ['/billing', 'Rechnungen für deinen Verein'],
  ['/pricing', 'Preise'],
]

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.055] bg-[#f7f5ef]/92 backdrop-blur-2xl">
      <div className="shell flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
        <a href="/" className="group inline-flex items-center gap-3" aria-label="RunYourEvent – Startseite">
          <span className="hidden h-[2px] w-5 bg-[#d5ad48] transition-all duration-150 group-hover:w-7 sm:block" aria-hidden="true" />
          <span className="text-base font-black tracking-[-0.03em] text-[#101827] sm:text-[17px]">RunYourEvent</span>
        </a>
        <nav className="hidden items-center gap-5 text-[13px] font-bold text-[#657184] xl:flex" aria-label="Hauptnavigation">
          {[['/club', 'Für Vereine'], ['/activities', 'Mitmachen'], ['/corporate', 'Teameinsätze'], ['/sponsors', 'Sponsoring'], ['/champsboard', 'Champsboard'], ['/pricing', 'Preise']].map(([href,label]) => <a key={href} href={href} className="transition-colors hover:text-[#101827]">{label}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <a href="/volunteer" className="hidden px-2 py-2 text-xs font-extrabold text-[#657184] sm:inline-flex">Mein Engagementpass</a>
          <details className="relative xl:hidden">
            <summary className="cursor-pointer rounded-lg px-2 py-3 text-xs font-bold text-[#536072]">Menü</summary>
            <nav aria-label="Mobile Navigation" className="absolute right-0 top-full z-50 mt-2 grid max-h-[70vh] w-56 max-w-[80vw] gap-1 overflow-y-auto rounded-xl border border-[#ded9cf] bg-white p-2 text-sm font-semibold shadow-lg">
              {mobileLinks.map(([href,label]) => <a key={href} href={href} className="rounded-md px-3 py-3 hover:bg-[#f7f5ef]">{label}</a>)}
            </nav>
          </details>
          <a href="/club" className="btn-primary !min-h-11 !px-3 !py-2 text-xs sm:!px-4 sm:text-sm"><span className="sm:hidden">Einsatz erstellen</span><span className="hidden sm:inline">Einsatz ausschreiben</span></a>
        </div>
      </div>
    </header>
  )
}
