import type { DatabaseRow, PropertyDef } from '@/types'

export interface PropertyFilter {
  columnId: string
  value: string
}

export interface SortConfig {
  columnId: string
  direction: 'asc' | 'desc'
}

function getColType(columnId: string, schema: PropertyDef[]): PropertyDef['type'] | undefined {
  return schema.find(c => c.id === columnId)?.type
}

function matchesFilter(row: DatabaseRow, filter: PropertyFilter, schema: PropertyDef[]): boolean {
  const type = getColType(filter.columnId, schema)
  if (!type) return true // unknown column → skip

  const raw = row.properties[filter.columnId]

  if (type === 'checkbox') {
    return String(raw) === filter.value
  }
  if (type === 'number') {
    return String(raw) === filter.value
  }
  if (type === 'select') {
    return String(raw ?? '').toLowerCase() === filter.value.toLowerCase()
  }
  // text and date: substring match
  return String(raw ?? '').toLowerCase().includes(filter.value.toLowerCase())
}

export function filterRows(
  rows: DatabaseRow[],
  filters: PropertyFilter[],
  schema: PropertyDef[]
): DatabaseRow[] {
  if (filters.length === 0) return rows
  return rows.filter(row => filters.every(f => matchesFilter(row, f, schema)))
}

function compareValues(
  a: string | number | boolean | null,
  b: string | number | boolean | null,
  type: PropertyDef['type'],
  direction: 'asc' | 'desc'
): number {
  const sign = direction === 'asc' ? 1 : -1

  if (a === null || a === undefined) return 1   // nulls always last
  if (b === null || b === undefined) return -1  // nulls always last

  if (type === 'number') {
    return (Number(a) - Number(b)) * sign
  }
  if (type === 'checkbox') {
    const av = a === true ? 1 : 0
    const bv = b === true ? 1 : 0
    return (av - bv) * sign
  }
  // text, select, date: string comparison
  return String(a).localeCompare(String(b)) * sign
}

export function sortRows(
  rows: DatabaseRow[],
  sort: SortConfig | null,
  schema: PropertyDef[]
): DatabaseRow[] {
  if (!sort) return rows
  const type = getColType(sort.columnId, schema)
  if (!type) return rows

  return [...rows].sort((a, b) =>
    compareValues(
      a.properties[sort.columnId] ?? null,
      b.properties[sort.columnId] ?? null,
      type,
      sort.direction
    )
  )
}
