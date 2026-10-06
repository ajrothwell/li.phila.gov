import { vi } from 'vitest'

// A trimmed-down AIS reply for 1234 Market St, with the fields we read.
export const sampleProperties = {
  street_address: '1234 MARKET ST',
  opa_address: '1234 MARKET ST',
  opa_account_num: '883309050',
  pwd_parcel_id: '542611',
  li_address_key: '410516',
  eclipse_location_id: '129832656|137826423',
  bin: '1496963|1496964|1530931',
  li_district: 'CENTRAL EAST',
  opa_owners: 'SEPTA',
  unit_type: '',
  unit_num: '',
  zip_code: '19107',
}

/** Pretend AIS answered with this status and body. Undo with vi.unstubAllGlobals(). */
export function stubAis(status: number, body?: unknown) {
  vi.stubGlobal('fetch', async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }))
}

/** Pretend AIS found the sample address. */
export function stubAisFound() {
  stubAis(200, { features: [{ properties: sampleProperties }] })
}
