import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchAllRows, normalizeTimestamps } from '../databridge'
import { stubGatewayPages } from '@/__tests__/fakeGateway'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('normalizeTimestamps', () => {
  it('reads a bare clock reading as Philadelphia time and writes real UTC', () => {
    expect(normalizeTimestamps({ when: '2022-06-15T00:00:00' }).when).toBe('2022-06-15T04:00:00Z') // summer
    expect(normalizeTimestamps({ when: '2022-01-15T00:00:00' }).when).toBe('2022-01-15T05:00:00Z') // winter
  })

  it('leaves a string that already carries a zone alone', () => {
    expect(normalizeTimestamps({ when: '2022-06-15T04:00:00Z' }).when).toBe('2022-06-15T04:00:00Z')
  })

  it('leaves everything that is not a timestamp alone', () => {
    const row = normalizeTimestamps({
      permitnumber: 'P-2026-001',
      objectid: 42,
      note: null,
      date: '2026-09-10',
    })
    expect(row).toEqual({ permitnumber: 'P-2026-001', objectid: 42, note: null, date: '2026-09-10' })
  })
})

describe('fetchAllRows', () => {
  it('returns the rows of a single short page', async () => {
    const requests = stubGatewayPages([[{ objectid: 1, permitnumber: 'A' }, { objectid: 2, permitnumber: 'B' }]])
    const rows = await fetchAllRows({ table: 'permits', where: "address = '1234 MARKET ST'" })
    expect(rows.map((row) => row.permitnumber)).toEqual(['A', 'B'])
    expect(requests).toHaveLength(1)
    expect(requests[0]).toContain('table=permits')
    expect(requests[0]).toContain('limit=999')
  })

  it('walks a full page by asking for objectids after the last one seen', async () => {
    const fullPage = Array.from({ length: 999 }, (_, i) => ({ objectid: i + 1 }))
    const requests = stubGatewayPages([fullPage, [{ objectid: 1000 }]])
    const rows = await fetchAllRows({ table: 'permits', where: 'x = 1' })
    expect(rows).toHaveLength(1000)
    expect(requests).toHaveLength(2)
    const secondWhere = new URL(requests[1]!).searchParams.get('where')
    expect(secondWhere).toBe('(x = 1) AND objectid > 999')
  })

  it('throws when the gateway fails', async () => {
    vi.stubGlobal('fetch', async () => ({ ok: false, status: 502, json: async () => ({}) }))
    await expect(fetchAllRows({ table: 'permits', where: 'x = 1' })).rejects.toThrow('status 502')
  })

  // Runs only where a client id is set (a developer's .env.local), so it stands down in CI.
  it.skipIf(!import.meta.env.VITE_GATEWAY_CLIENT_ID)(
    'fetches real permit rows for 1234 Market St',
    async () => {
      const rows = await fetchAllRows({ table: 'permits', where: "opa_account_num = '883309050'" })
      expect(rows.length).toBeGreaterThan(0)
      expect(rows[0]).toHaveProperty('permitnumber')
      expect(rows[0]).toHaveProperty('objectid')
    },
  )
})
