/** @type {import('next').NextConfig} */
const legacy = [
  '/browse/:path*','/weddings','/family-reunions','/custom','/event-types','/templates','/browse','/resources','/agencies','/venues','/my-events',
  '/company-event-planning','/event-planning-checklist','/event-planning-template','/event-planning-timeline',
  '/wedding-planning-checklist','/wedding-planning-timeline','/family-reunion-planning','/class-reunion-planning',
  '/company-retreat-planning','/event-execution-plan','/destination-wedding-planning','/family-reunion-checklist',
  '/nonprofit-event-planning','/volunteer-event-planning','/sports-event-planning','/birthday-party-planning-checklist',
  '/graduation-party-planning-checklist','/charity-event-planning','/church-event-planning','/community-event-planning',
  '/small-business-event-planning','/offsite-event-planning','/product-launch-event-planning',
  '/corporate-event-planning-checklist','/fundraising-event-planning-checklist'
]
// Baseline security headers for every response. CSP keeps 'unsafe-inline' for scripts and styles because
// Next.js inlines its bootstrap code; tighten with nonces later if wanted.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' },
  { key: 'Content-Security-Policy', value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'" + (process.env.NODE_ENV === 'production' ? '' : " 'unsafe-eval'") + (process.env.VERCEL_ENV === 'preview' ? ' https://vercel.live' : ''),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co" + (process.env.VERCEL_ENV === 'preview' ? ' https://vercel.live wss://ws-us3.pusher.com' : ''),
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ') },
]
const nextConfig = {
  async headers() {
    const headers = [{key:'Cache-Control',value:'private, no-store'},{key:'Referrer-Policy',value:'no-referrer'},{key:'X-Robots-Tag',value:'noindex, nofollow, noarchive'}]
    return [{source:'/:path*',headers:securityHeaders}, ...(process.env.VERCEL_ENV === 'preview' ? [{source:'/:path*',headers:[{key:'X-Robots-Tag',value:'noindex, nofollow, noarchive'}]}] : []), ...['/sponsor/:path*','/volunteer','/club','/conversations/:path*','/access','/admin/:path*','/billing','/notifications','/company/:path*','/employee/:path*','/sponsorship/:path*','/events/:path*','/share/:path*','/workspace/:path*','/checkout/:path*','/api/:path*','/certificates/:path*','/volunteers/:path*','/volunteer-engine/check-in','/volunteer-engine/invite/:path*'].map(source=>({source,headers}))]
  },
  async redirects() {
    return legacy.map(source => ({
      source,
      destination: source === '/custom' ? '/volunteer-engine/organizers' : '/volunteer-engine',
      permanent: true,
    }))
  },
}
module.exports = nextConfig
