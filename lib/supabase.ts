type QueryResult<T = any> = { data: T; error: null | { message: string } }

class FirestoreReadQuery {
  private filterField = ''
  private filterValue = ''
  private orderField = ''

  constructor(private table: string) {}

  select(_columns = '*') {
    return this
  }

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
      return {
        data: body?.data ?? (single ? null : []),
        error: body?.error || (response.ok ? null : { message: 'Data could not be loaded.' }),
      }
    } catch {
      return { data: single ? null : [], error: { message: 'Data could not be loaded.' } }
    }
  }

  single() {
    return this.execute(true)
  }

  maybeSingle() {
    return this.execute(true)
  }

  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return this.execute(false).then(onfulfilled, onrejected)
  }
}

export const supabase = {
  from(table: string) {
    return new FirestoreReadQuery(table)
  },
}

export default supabase
