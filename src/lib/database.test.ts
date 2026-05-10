import { describe, it, expect } from 'vitest'
import { filterRows, sortRows } from './database'
import type { DatabaseRow, PropertyDef } from '@/types'

function makeRow(id: string, props: Record<string, string | number | boolean | null>): DatabaseRow {
  return { id, databaseId: 'db1', properties: props, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
}

const schema: PropertyDef[] = [
  { id: 'name', name: 'Name', type: 'text' },
  { id: 'age', name: 'Age', type: 'number' },
  { id: 'status', name: 'Status', type: 'select', options: ['active', 'done'] },
  { id: 'done', name: 'Done', type: 'checkbox' },
  { id: 'date', name: 'Date', type: 'date' },
]

const rows: DatabaseRow[] = [
  makeRow('1', { name: 'Alice', age: 30, status: 'active', done: false, date: '2024-03-01' }),
  makeRow('2', { name: 'Bob', age: 25, status: 'done', done: true, date: '2024-01-15' }),
  makeRow('3', { name: 'Charlie', age: 35, status: 'active', done: false, date: '2024-06-20' }),
]

// ─── filterRows ──────────────────────────────────────────────────────────────

describe('filterRows', () => {
  it('returns all rows when no filters given', () => {
    expect(filterRows(rows, [], schema)).toHaveLength(3)
  })

  it('filters text property by substring (case-insensitive)', () => {
    const result = filterRows(rows, [{ columnId: 'name', value: 'ali' }], schema)
    expect(result.map(r => r.id)).toEqual(['1'])
  })

  it('filters number property by exact match', () => {
    const result = filterRows(rows, [{ columnId: 'age', value: '25' }], schema)
    expect(result.map(r => r.id)).toEqual(['2'])
  })

  it('filters select property by exact value', () => {
    const result = filterRows(rows, [{ columnId: 'status', value: 'active' }], schema)
    expect(result.map(r => r.id)).toEqual(['1', '3'])
  })

  it('filters checkbox by "true"/"false" string', () => {
    const result = filterRows(rows, [{ columnId: 'done', value: 'true' }], schema)
    expect(result.map(r => r.id)).toEqual(['2'])
  })

  it('applies multiple filters (AND logic)', () => {
    const result = filterRows(
      rows,
      [{ columnId: 'status', value: 'active' }, { columnId: 'name', value: 'char' }],
      schema
    )
    expect(result.map(r => r.id)).toEqual(['3'])
  })

  it('returns empty when nothing matches', () => {
    expect(filterRows(rows, [{ columnId: 'name', value: 'xyz' }], schema)).toHaveLength(0)
  })

  it('skips filter if columnId does not match any schema column', () => {
    expect(filterRows(rows, [{ columnId: 'ghost', value: 'x' }], schema)).toHaveLength(3)
  })
})

// ─── sortRows ────────────────────────────────────────────────────────────────

describe('sortRows', () => {
  it('returns rows unchanged when sort is null', () => {
    expect(sortRows(rows, null, schema).map(r => r.id)).toEqual(['1', '2', '3'])
  })

  it('sorts text property ascending', () => {
    const result = sortRows(rows, { columnId: 'name', direction: 'asc' }, schema)
    expect(result.map(r => r.properties.name)).toEqual(['Alice', 'Bob', 'Charlie'])
  })

  it('sorts text property descending', () => {
    const result = sortRows(rows, { columnId: 'name', direction: 'desc' }, schema)
    expect(result.map(r => r.properties.name)).toEqual(['Charlie', 'Bob', 'Alice'])
  })

  it('sorts number property ascending', () => {
    const result = sortRows(rows, { columnId: 'age', direction: 'asc' }, schema)
    expect(result.map(r => r.properties.age)).toEqual([25, 30, 35])
  })

  it('sorts number property descending', () => {
    const result = sortRows(rows, { columnId: 'age', direction: 'desc' }, schema)
    expect(result.map(r => r.properties.age)).toEqual([35, 30, 25])
  })

  it('sorts by checkbox (false < true) ascending', () => {
    const result = sortRows(rows, { columnId: 'done', direction: 'asc' }, schema)
    // false rows first, true last
    expect(result.map(r => r.properties.done)).toEqual([false, false, true])
  })

  it('sorts by date ascending', () => {
    const result = sortRows(rows, { columnId: 'date', direction: 'asc' }, schema)
    expect(result.map(r => r.properties.date)).toEqual(['2024-01-15', '2024-03-01', '2024-06-20'])
  })

  it('does not mutate the original array', () => {
    const original = [...rows]
    sortRows(rows, { columnId: 'age', direction: 'desc' }, schema)
    expect(rows).toEqual(original)
  })

  it('sorts null values last regardless of direction', () => {
    const withNull = [
      makeRow('a', { age: null }),
      makeRow('b', { age: 10 }),
      makeRow('c', { age: 5 }),
    ]
    const asc = sortRows(withNull, { columnId: 'age', direction: 'asc' }, schema)
    expect(asc.map(r => r.id)).toEqual(['c', 'b', 'a'])
    const desc = sortRows(withNull, { columnId: 'age', direction: 'desc' }, schema)
    expect(desc.map(r => r.id)).toEqual(['b', 'c', 'a'])
  })
})
