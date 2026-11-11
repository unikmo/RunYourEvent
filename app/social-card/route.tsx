import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'

// 1200x630 share image used for og:image and twitter:image on every page.
export function GET() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 96px', background: '#f7f5ef', color: '#101827', position: 'relative' }}>
        <div style={{ position: 'absolute', right: 96, top: 72, width: 150, height: 150, borderRadius: 75, background: '#d5ad48', opacity: 0.9 }} />
        <div style={{ position: 'absolute', right: 176, top: 72, width: 150, height: 150, borderRadius: 75, background: '#101827', opacity: 0.92 }} />
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 34, fontWeight: 800, letterSpacing: -1 }}>
          <div style={{ width: 44, height: 4, background: '#d5ad48', marginRight: 16 }} />
          RunYourEvent
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 40, fontSize: 76, fontWeight: 800, lineHeight: 1.08, letterSpacing: -2 }}>
          <span>Gemeinsam anpacken.</span>
          <span>Dem Sport Zeit schenken.</span>
        </div>
        <div style={{ display: 'flex', marginTop: 40, fontSize: 32, color: '#536072' }}>
          Freiwillig im Sportverein helfen, 2 bis 4 Stunden, mit Freunden.
        </div>
        <div style={{ position: 'absolute', left: 96, bottom: 56, display: 'flex', fontSize: 26, fontWeight: 700, color: '#8a6a14' }}>runyourevent.com</div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
