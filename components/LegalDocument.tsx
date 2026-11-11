import type { ReactNode } from 'react'

// Minimal renderer for the legal texts (headings, paragraphs, lists, tables, bold, links).
// Fields still to be completed are shown in a yellow marker so nothing unfinished goes unnoticed on a preview.
export const PLACEHOLDER = /\[(?:OWNER FILLS|NIKI CONFIRM|NIKI|ANWALT[^:\]]*|WAHL FÜR DEN INHABER[^\]]*|LEO\/NIKI|STRIPE|OPTIONAL[^\]]*|Hinweis)[^\]]*\]/g

function inline(text: string, key: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const re = new RegExp(PLACEHOLDER.source + '|\\*\\*[^*]+\\*\\*|\\[[^\\]]+\\]\\([^)]+\\)|https?://[^\\s)]+', 'g')
  let last = 0, m: RegExpExecArray | null, i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    const t = m[0], k = `${key}-${i++}`
    if (t.startsWith('**')) nodes.push(<strong key={k} className="font-bold text-[#23324a]">{t.slice(2, -2)}</strong>)
    else if (t.startsWith('[') && t.includes('](')) {
      const [label, href] = [t.slice(1, t.indexOf('](')), t.slice(t.indexOf('](') + 2, -1)]
      nodes.push(<a key={k} className="underline" href={href}>{label}</a>)
    } else if (t.startsWith('http')) nodes.push(<a key={k} className="underline break-all" href={t}>{t}</a>)
    else nodes.push(<mark key={k} data-placeholder className="rounded bg-yellow-200 px-1 text-[#3b3200]">{t}</mark>)
    last = m.index + t.length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

function withBreaks(lines: string[], key: string): ReactNode[] {
  return lines.flatMap((l, i) => [i ? <br key={`${key}-br${i}`} /> : null, ...inline(l, `${key}-${i}`)])
}

export default function LegalDocument({ md }: { md: string }) {
  const lines = md.split('\n')
  const out: ReactNode[] = []
  let i = 0, n = 0
  const p = 'mt-3 text-sm leading-7 text-[#5f6d80]'
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) { i++; continue }
    if (line.startsWith('# ')) { i++; continue } // page supplies its own h1
    if (line.startsWith('## ')) { out.push(<h3 key={n++} className="mt-8 text-xl font-black text-[#23324a]">{inline(line.slice(3), `h${n}`)}</h3>); i++; continue }
    if (line.startsWith('### ')) { out.push(<h4 key={n++} className="mt-5 font-bold text-[#23324a]">{inline(line.slice(4), `h${n}`)}</h4>); i++; continue }
    if (line.startsWith('|')) {
      const rows: string[][] = []
      while (i < lines.length && lines[i].startsWith('|')) { if (!/^\|[\s|:-]+\|$/.test(lines[i])) rows.push(lines[i].slice(1, -1).split('|').map(c => c.trim())); i++ }
      const [head, ...body] = rows
      out.push(<div key={n++} className="mt-4 overflow-x-auto"><table className="w-full min-w-[640px] border-collapse text-left text-xs leading-6 text-[#5f6d80]"><thead><tr>{head.map((c, j) => <th key={j} scope="col" className="border-b border-black/10 bg-[#f1eee4] p-3 font-bold text-[#23324a]">{inline(c, `th${n}${j}`)}</th>)}</tr></thead><tbody>{body.map((r, a) => <tr key={a}>{r.map((c, j) => <td key={j} className="border-b border-black/[0.07] p-3 align-top">{inline(c, `td${n}${a}${j}`)}</td>)}</tr>)}</tbody></table></div>)
      continue
    }
    if (/^\s*(- |\d+\. )/.test(line)) {
      const items: { t: string; sub: boolean }[] = []
      while (i < lines.length && /^\s*(- |\d+\. )/.test(lines[i])) { items.push({ t: lines[i].replace(/^\s*(- |\d+\. )/, ''), sub: /^\s{2,}/.test(lines[i]) }); i++ }
      out.push(<ul key={n++} className="mt-3 list-disc space-y-2 pl-6 text-sm leading-7 text-[#5f6d80]">{items.map((it, a) => <li key={a} className={it.sub ? 'ml-6' : ''}>{inline(it.t, `li${n}${a}`)}</li>)}</ul>)
      continue
    }
    const para: string[] = []
    while (i < lines.length && lines[i].trim() && !/^(#|\|)/.test(lines[i]) && !/^\s*(- |\d+\. )/.test(lines[i])) { para.push(lines[i]); i++ }
    out.push(<p key={n++} className={p}>{withBreaks(para, `p${n}`)}</p>)
  }
  return <div>{out}</div>
}
