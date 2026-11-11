import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

// Two overlapping circles (people coming together) on navy, in the brand colours.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#101827', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 32, top: 48, width: 62, height: 62, borderRadius: 31, background: '#d5ad48' }} />
        <div style={{ position: 'absolute', left: 86, top: 48, width: 62, height: 62, borderRadius: 31, background: '#f7f5ef' }} />
        <div style={{ position: 'absolute', left: 36, top: 130, width: 108, height: 10, borderRadius: 5, background: '#d5ad48' }} />
      </div>
    ),
    size,
  )
}
