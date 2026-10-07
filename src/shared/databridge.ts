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

// databridge writes every timestamp as the table's LOCAL clock reading — sometimes bare
// ('2026-09-10T16:47:51'), sometimes with a false UTC label ('…T16:47:51.000Z'). Trusting
// the label shifts times by 4–5 hours and can roll a date back a day. So every form is
// read as local time and relabeled as real UTC ('2026-09-10T20:47:51Z').
const LOCAL_CLOCK_TIMESTAMP = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.\d{3})?Z?$/

/** Relabels every timestamp-looking string in the row from local clock time to real UTC. */
export function normalizeTimestamps(row: DatabridgeRow): DatabridgeRow {
  for (const key of Object.keys(row)) {
    const value = row[key]
    if (typeof value !== 'string') continue
    const localClock = value.match(LOCAL_CLOCK_TIMESTAMP)?.[1]
    if (localClock) {
      row[key] = new Date(localClock).toISOString().replace('.000Z', 'Z')
    }
  }
  return row
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
