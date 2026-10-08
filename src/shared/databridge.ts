import { fromZonedTime } from 'date-fns-tz'
import { gatewayClientId } from './gateway'

const DATABRIDGE_URL = 'https://api-prod.phila.gov/databridge-api/v1/get'

/** The gateway caps one reply at this many rows. */
const PAGE_SIZE = 999

/** One row from a databridge table: column name → value. Dataset code turns these into its own records. */
export type DatabridgeRow = Record<string, unknown>

interface DatabridgeResponse {
  data: { features: { properties: DatabridgeRow }[] }
}

/** A table-style query: which table, and a SQL WHERE clause (without the word WHERE). */
export interface TableQuery {
  table: string
  where: string
}

// databridge writes every timestamp as the PHILADELPHIA clock reading with no time zone,
// e.g. '2022-06-15T00:00:00' for a permit issued June 15. A bare reading means "whatever
// zone the reader is in", so it's read as New York time, explicitly, and relabeled as the
// real instant in UTC ('2022-06-15T04:00:00Z'). From there a Date can be compared and
// subtracted safely, and formatDate shows it as a Philadelphia date wherever the viewer is.
const BARE_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/

export const PHILADELPHIA = 'America/New_York'

/** Reads a bare clock reading like "2022-06-15T00:00:00" as Philadelphia time; returns real UTC. */
function philadelphiaClockToUtc(clock: string): string {
  return fromZonedTime(clock, PHILADELPHIA).toISOString().replace('.000Z', 'Z')
}

/**
 * A copy of the row with every timestamp-looking string relabeled from Philadelphia clock
 * time to real UTC. The row passed in is left untouched.
 */
export function normalizeTimestamps(row: DatabridgeRow): DatabridgeRow {
  const normalized: DatabridgeRow = { ...row }
  for (const key of Object.keys(normalized)) {
    const value = normalized[key]
    if (typeof value === 'string' && BARE_TIMESTAMP.test(value)) {
      normalized[key] = philadelphiaClockToUtc(value)
    }
  }
  return normalized
}

/** Fetches one page of rows. Throws if the gateway doesn't answer 2xx. */
async function fetchPage(table: string, where: string): Promise<DatabridgeRow[]> {
  const params = new URLSearchParams({ table, where, limit: String(PAGE_SIZE) })
  if (gatewayClientId) {
    params.set('client_id', gatewayClientId)
  }
  const response = await fetch(`${DATABRIDGE_URL}?${params}`)
  if (!response.ok) {
    throw new Error(`databridge request for ${table} failed with status ${response.status}`)
  }
  const { data } = (await response.json()) as DatabridgeResponse
  return data.features.map((feature) => feature.properties)
}

/**
 * Fetches EVERY row matching the query, however many. The gateway caps one reply at
 * PAGE_SIZE rows, so this walks pages: each one asks for rows with objectid greater than
 * the last one seen, until a short page ends the set. Rows come back objectid-ascending;
 * callers sort them however they like.
 */
export async function fetchAllRows(query: TableQuery): Promise<DatabridgeRow[]> {
  const rows: DatabridgeRow[] = []
  let lastId: number | null = null

  for (;;) {
    const where = lastId === null ? query.where : `(${query.where}) AND objectid > ${lastId}`
    const page = await fetchPage(query.table, where)
    for (const row of page) {
      rows.push(normalizeTimestamps(row))
    }
    if (page.length < PAGE_SIZE) return rows

    const nextId = Number(page[page.length - 1]?.objectid)
    if (!Number.isFinite(nextId)) {
      throw new Error(`databridge rows for ${query.table} have no usable objectid to page on`)
    }
    lastId = nextId
  }
}
