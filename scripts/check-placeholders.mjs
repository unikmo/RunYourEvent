// Go-live gate: fails while the legal texts still contain unresolved markers such as [OWNER FILLS ...].
import fs from 'node:fs'
const src = fs.readFileSync(new URL('../lib/legal-content.ts', import.meta.url), 'utf8')
const re = /\[(?:OWNER FILLS|NIKI CONFIRM|NIKI|ANWALT[^:\]]*|WAHL FÜR DEN INHABER[^\]]*|LEO\/NIKI|STRIPE|OPTIONAL[^\]]*|Hinweis)[^\]]*\]/g
const found = src.match(re) || []
if (found.length) { console.error(`${found.length} unresolved legal placeholder(s):`); for (const f of found) console.error(' - ' + f.slice(0, 110)); process.exit(1) }
console.log('No unresolved legal placeholders.')
