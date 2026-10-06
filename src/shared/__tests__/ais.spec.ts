import { describe, it, expect, vi, afterEach } from 'vitest'
import { lookupAddress } from '../ais'

// A trimmed-down AIS reply for 1234 Market St, with the fields we read.
const sampleProperties = {
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

// Pretend AIS answered with this status and body.
function stubAis(status: number, body?: unknown) {
  vi.stubGlobal('fetch', async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('lookupAddress', () => {
  it('shapes an AIS feature into an address record', async () => {
    stubAis(200, { features: [{ properties: sampleProperties }] })
    const record = await lookupAddress('1234 market st')
    expect(record).toEqual({
      streetAddress: '1234 MARKET ST',
      opaAddress: '1234 MARKET ST',
      opaAccountNumber: '883309050',
      pwdParcelId: '542611',
      liAddressKey: '410516',
      eclipseLocationIds: ['129832656', '137826423'],
      bins: ['1496963', '1496964', '1530931'],
      liDistrict: 'CENTRAL EAST',
      owners: 'SEPTA',
      unitType: '',
      unitNumber: '',
      zipCode: '19107',
    })
  })

  it('gives empty lists when the pipe-separated ids are missing', async () => {
    stubAis(200, {
      features: [{ properties: { ...sampleProperties, eclipse_location_id: null, bin: '' } }],
    })
    const record = await lookupAddress('1234 market st')
    expect(record?.eclipseLocationIds).toEqual([])
    expect(record?.bins).toEqual([])
  })

  it('returns null when AIS has no match', async () => {
    stubAis(404)
    expect(await lookupAddress('asdfqwerty')).toBeNull()
  })

  it('throws when AIS fails for any other reason', async () => {
    stubAis(500)
    await expect(lookupAddress('1234 market st')).rejects.toThrow('status 500')
  })

  // Runs only where a client id is set (a developer's .env.local), so it stands down in CI.
  it.skipIf(!import.meta.env.VITE_GATEWAY_CLIENT_ID)(
    'finds 1234 Market St on the real service',
    async () => {
      const record = await lookupAddress('1234 Market St')
      expect(record?.streetAddress).toBe('1234 MARKET ST')
      expect(record?.liDistrict).toBe('CENTRAL EAST')
      expect(record?.bins.length).toBeGreaterThan(0)
    },
  )
})
