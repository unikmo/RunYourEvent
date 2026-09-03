type QueryResult<T = any> = { data: T; error: null | { message: string } }

class FirestoreReadQuery {
  private filterField = ''
  private filterValue = ''
  private orderField = ''

  constructor(private table: string) {}

  select(_columns = '*') { return this }

  eq(field: string, value: unknown) {
    this.filterField = field
    this.filterValue = String(value ?? '')
    return this
  }

  order(field: string, _options?: { ascending?: boolean }) {
    this.orderField = field
    return this
  }

  private async execute(single: boolean): Promise<QueryResult> {
    const params = new URLSearchParams()
    if (this.filterField) {
      params.set('field', this.filterField)
      params.set('value', this.filterValue)
    }
    if (this.orderField) params.set('order', this.orderField)
    if (single) params.set('single', '1')

    try {
      const response = await fetch(`/api/data/${encodeURIComponent(this.table)}?${params.toString()}`, { cache: 'no-store' })
      const body = await response.json()
      return { data: body?.data ?? (single ? null : []), error: body?.error || (response.ok ? null : { message: 'Data could not be loaded.' }) }
    } catch {
      return { data: single ? null : [], error: { message: 'Data could not be loaded.' } }
    }
  }

  single() { return this.execute(true) }
  maybeSingle() { return this.execute(true) }

  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return this.execute(false).then(onfulfilled, onrejected)
  }
}

class FirestoreRpcQuery {
  private maxRows = 20
  constructor(private name: string, private args: Record<string, any>) {}
  limit(value: number) { this.maxRows = Math.max(1, Math.min(50, value)); return this }

  private async execute(): Promise<QueryResult> {
    if (this.name !== 'search_events') return { data: null, error: { message: `Unsupported browser RPC: ${this.name}` } }
    const query = String(this.args?.query || '').trim().toLowerCase()
    if (!query) return { data: [], error: null }
    try {
      const response = await fetch('/api/data/events', { cache: 'no-store' })
      const body = await response.json()
      const rows = Array.isArray(body?.data) ? body.data : []
      const ranked = rows
        .map((row: any) => {
          const name = String(row.name || '').toLowerCase()
          const haystack = `${row.name || ''} ${row.category || ''} ${row.subcategory || ''} ${row.description || ''}`.toLowerCase()
          const score = name === query ? 0 : name.startsWith(query) ? 1 : name.includes(query) ? 2 : haystack.includes(query) ? 3 : 99
          return { row, score }
        })
        .filter((item: any) => item.score < 99)
        .sort((a: any, b: any) => a.score - b.score || String(a.row.name || '').localeCompare(String(b.row.name || '')))
        .slice(0, this.maxRows)
        .map((item: any) => item.row)
      return { data: ranked, error: null }
    } catch {
      return { data: [], error: { message: 'Event search could not be loaded.' } }
    }
  }

  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return this.execute().then(onfulfilled, onrejected)
  }
}

export const supabase = {
  from(table: string) { return new FirestoreReadQuery(table) },
  rpc(name: string, args: Record<string, any> = {}) { return new FirestoreRpcQuery(name, args) },
}

export default supabase
