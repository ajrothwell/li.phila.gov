import { vi } from 'vitest'
import type { DatabridgeRow } from '@/shared/databridge'
import { sampleProperties } from './fakeAis'
import { gatewayReply } from './fakeGateway'

/** Two sample permit rows for 943 Sigel St, RAW as the gateway sends them (bare local timestamps). */
export const samplePermitRows: DatabridgeRow[] = [
  {
    objectid: 1,
    permitnumber: 'PP-2022-004106',
    permitdescription: 'Plumbing Permit',
    permittype: 'PLUMBING',
    permitissuedate: '2022-03-15T00:00:00',
    status: 'COMPLETED',
    address: '943 SIGEL ST',
  },
  {
    objectid: 2,
    permitnumber: 'RP-2022-005991',
    permitdescription: 'Residential Building Permit',
    permittype: 'RESIDENTIAL BUILDING',
    permitissuedate: '2022-06-15T00:00:00',
    status: 'COMPLETED',
    address: '943 SIGEL ST',
  },
]

/**
 * Pretend both services answer: AIS finds the sample address, and the gateway returns
 * these permit rows. Routes by URL, since both go through fetch.
 */
export function stubAisFoundAndPermits(permitRows: DatabridgeRow[] = samplePermitRows) {
  vi.stubGlobal('fetch', async (url: string) => {
    const body = url.includes('/ais/')
      ? { features: [{ properties: sampleProperties }] }
      : gatewayReply(permitRows)
    return { ok: true, status: 200, json: async () => body }
  })
}
