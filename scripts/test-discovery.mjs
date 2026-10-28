import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'
import {createRequire} from 'node:module'
const require=createRequire(import.meta.url)
async function moduleFrom(path,replacements={}){let source=fs.readFileSync(path,'utf8');for(const [from,to] of Object.entries(replacements))source=source.replaceAll(from,to);const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;return import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'))}
const discoverySource=fs.readFileSync('lib/discovery.ts','utf8');const discoveryUrl='data:text/javascript;base64,'+Buffer.from(ts.transpileModule(discoverySource,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText).toString('base64')
const {guides,faqs}=await moduleFrom('lib/volunteering-guides.ts')
const {privatePaths,publicPaths}=await import(discoveryUrl)
const output='.next/server/app/'
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&#x27;',"'").replaceAll('&quot;','"')
const meta=(html,key,field='name')=>decode(html.match(new RegExp(`<meta ${field}="${key}" content="([^"]*)"`))?.[1]||'')
let pages=0;const descriptions=new Set()
for(const path of [...publicPaths,...guides.map(g=>'/'+g.slug)]){
 const file=output+(path?path.slice(1):'index')+'.html'
 // Request-time routes depend on the database; their query behavior has separate integration tests.
 if(!fs.existsSync(file)){assert.ok(['/activities','/opportunities','/champsboard'].includes(path),'Missing built page '+path);continue}
 const html=fs.readFileSync(file,'utf8');const canonical='https://runyourevent.com'+path
 assert.ok(html.includes(`<link rel="canonical" href="${canonical}"`),'Wrong canonical '+path)
 assert.equal(meta(html,'og:url','property'),canonical,'Wrong sharing URL '+path)
 assert.equal(meta(html,'og:description','property'),meta(html,'description'),'Inherited homepage description '+path)
 assert.equal(meta(html,'twitter:description'),meta(html,'description'),'Wrong Twitter description '+path)
 assert.ok(html.includes('<html lang="de"'),'German document language '+path);assert.ok(meta(html,'description').length>35,'Missing description '+path);assert.ok(!descriptions.has(meta(html,'description')),'Duplicate description '+path);descriptions.add(meta(html,'description'))
 assert.equal((html.match(/<h1\b/g)||[]).length,1,'One H1 '+path)
 assert.ok(!meta(html,'robots').includes('noindex'),'Unexpected production noindex '+path)
 const title=decode(html.match(/<title>([^<]*)<\/title>/)?.[1]||'');assert.ok(title.length>10);assert.ok(!/RunYourEvent.*RunYourEvent/.test(title),'Duplicate brand '+path)
 const schemas=[...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m=>JSON.parse(m[1]));assert.ok(schemas.some(s=>s['@graph']?.some(e=>e['@type']==='WebSite')))
 if(path==='/faq'){
 const faq=schemas.find(s=>s['@type']==='FAQPage');assert.equal(faq.mainEntity.length,faqs.length)
 for(const f of faqs){assert.ok(html.includes(f.q));assert.ok(html.includes(f.a));assert.ok(faq.mainEntity.some(q=>q.name===f.q&&q.acceptedAnswer.text===f.a))}
 }
 if(guides.some(g=>'/'+g.slug===path))assert.ok(schemas.some(s=>s['@type']==='BreadcrumbList'))
 pages++
}
console.log(`PASS ${pages} production HTML pages: canonical, unique page metadata, social previews, H1 and valid matching structured data`)
const sitemap=fs.readFileSync(output+'sitemap.xml.body','utf8');const urls=[...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map(m=>m[1]);assert.equal(urls.length,23);assert.equal(new Set(urls).size,urls.length);assert.ok(!sitemap.includes('lastmod'));for(const g of guides)assert.ok(urls.includes('https://runyourevent.com/'+g.slug));assert.ok(!urls.some(u=>u.includes('/admin')||u.includes('/resources')))
const robots=fs.readFileSync(output+'robots.txt.body','utf8')
const groups=robots.split(/\n\s*\n/).filter(g=>g.includes('User-Agent:'))
assert.equal(groups.length,2)
for(const group of groups)for(const path of privatePaths)assert.ok(group.includes('Disallow: '+path),'Private exclusion missing '+path)
assert.ok(robots.includes('User-Agent: OAI-SearchBot'));assert.ok(robots.includes('User-Agent: PerplexityBot'));assert.ok(robots.includes('User-Agent: Claude-SearchBot'));assert.ok(robots.includes('Disallow: /volunteer$'));assert.ok(!robots.includes('Disallow: /volunteer\n'))
console.log('PASS 23 canonical sitemap URLs; no invented freshness; AI search groups repeat all private exclusions')
const config=require('../next.config.js');const redirects=await config.redirects();assert.equal(redirects.length,36)
for(const r of redirects){assert.ok(r.permanent);assert.ok(r.destination.startsWith('/volunteer-engine'))}
const headers=await config.headers();for(const path of ['/api/:path*','/certificates/:path*','/volunteers/:path*','/volunteer-engine/check-in','/volunteer-engine/invite/:path*'])assert.ok(headers.some(h=>h.source===path&&h.headers.some(v=>v.key==='X-Robots-Tag'&&v.value.includes('noindex'))))
process.env.VERCEL_ENV='preview';assert.ok((await config.headers()).some(h=>h.source==='/:path*'))
const previewDiscovery=discoveryUrl+'#preview';const previewRobots=await moduleFrom('app/robots.ts',{'@/lib/discovery':previewDiscovery});assert.deepEqual(previewRobots.default(),{rules:{userAgent:'*',disallow:'/'}})
const {pageMetadata}=await import(previewDiscovery);assert.equal(pageMetadata({title:'Test',alternates:{canonical:'/faq'}}).robots.index,false)
console.log('PASS 36 legacy redirects, private noindex headers and preview crawl/index exclusions')
const llms=await moduleFrom('app/llms.txt/route.ts',{'@/lib/volunteering-guides':'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(fs.readFileSync('lib/volunteering-guides.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText).toString('base64'),'@/lib/discovery':discoveryUrl});const response=llms.GET();const text=await response.text();assert.equal(response.headers.get('Content-Type'),'text/plain; charset=utf-8');for(const g of guides)assert.ok(text.includes('https://runyourevent.com/'+g.slug));assert.ok(!text.includes('/sponsor/'));assert.ok(text.includes('kein Stundenpreis'))
console.log('PASS public AI reading index links current guides and separates fees, quote targets and actual impact')
