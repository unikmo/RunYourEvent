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
const nextConfig = {
  async headers() {
    const headers = [{key:'Cache-Control',value:'private, no-store'},{key:'Referrer-Policy',value:'no-referrer'},{key:'X-Robots-Tag',value:'noindex, nofollow, noarchive'}]
    return [...(process.env.VERCEL_ENV === 'preview' ? [{source:'/:path*',headers:[{key:'X-Robots-Tag',value:'noindex, nofollow, noarchive'}]}] : []), ...['/sponsor/:path*','/volunteer','/club','/conversations/:path*','/access','/admin/:path*','/billing','/notifications','/company/:path*','/employee/:path*','/sponsorship/:path*','/events/:path*','/share/:path*','/workspace/:path*','/checkout/:path*','/api/:path*','/certificates/:path*','/volunteers/:path*','/volunteer-engine/check-in','/volunteer-engine/invite/:path*'].map(source=>({source,headers}))]
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
