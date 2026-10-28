export default function NotFound() {
  return (
    <main className="bg-[#fbfaf7]">
      <div className="shell grid min-h-[64vh] place-items-center py-20 text-center">
        <div>
          <p className="eyebrow">404</p>
          <h1 className="display mt-4 text-5xl font-black text-[#15233f]">Diese Seite wurde nicht gefunden.</h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#6f7a8b]">
            Die Seite wurde vielleicht verschoben oder der Link ist nicht mehr aktuell.
          </p>
          <a href="/" className="btn-primary mt-7">Zurück zu RunYourEvent</a>
        </div>
      </div>
    </main>
  )
}
