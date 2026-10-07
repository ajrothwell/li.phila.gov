import { vi } from 'vitest'
import type { DatabridgeRow } from '@/shared/databridge'

/** One page of rows, as the gateway would return it. */
export type Page = DatabridgeRow[]

/** Shapes rows the way the gateway's reply does: each row wrapped in { properties }. */
export function gatewayReply(rows: DatabridgeRow[]) {
  return { data: { features: rows.map((row) => ({ properties: row })) } }
}

/**
 * Pretend the gateway answers each request in turn with these pages of rows.
 * Returns the list of URLs requested, filled in as the fake is called.
 */
export function stubGatewayPages(pages: Page[]) {
  const requests: string[] = []
  let call = 0
  vi.stubGlobal('fetch', async (url: string) => {
    requests.push(url)
    const pageRows = pages[call] ?? []
    call += 1
    return { ok: true, status: 200, json: async () => gatewayReply(pageRows) }
  })
  return requests
}
