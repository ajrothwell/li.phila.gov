import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchPermits, propertyRecordsWhere } from '../permits'
import { lookupAddress, type AddressRecord } from '@/shared/ais'
import { stubGatewayPages } from '@/__tests__/fakeGateway'
import { samplePermitRows } from '@/__tests__/fakeServices'

const sampleAddress: AddressRecord = {
  streetAddress: '943 SIGEL ST',
  opaAddress: '943 SIGEL ST',
  opaAccountNumber: '393258100',
  pwdParcelId: '174268',
  liAddressKeys: ['414957'],
  eclipseLocationIds: ['137837580', '15492636'],
  bins: ['1203648'],
  liDistrict: 'SOUTH',
  owners: 'SOMEONE',
  unitType: '',
  unitNumber: '',
  zipCode: '19148',
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('propertyRecordsWhere', () => {
  it('matches HANSEN rows by address or L&I key and eCLIPSE rows by location id or parcel', () => {
    const where = propertyRecordsWhere(sampleAddress)
    expect(where).toContain("address = '943 SIGEL ST'")
    expect(where).toContain("addressobjectid IN ('414957') AND systemofrecord IN ('HANSEN')")
    expect(where).toContain("addressobjectid IN ('137837580', '15492636')")
    expect(where).toContain("parcel_id_num IN ('174268') AND systemofrecord IN ('ECLIPSE')")
    expect(where).toContain("opa_account_num IN ('393258100')")
  })

  it("doubles apostrophes so an address like O'NEILL ST is valid SQL", () => {
    const where = propertyRecordsWhere({ ...sampleAddress, streetAddress: "100 O'NEILL ST" })
    expect(where).toContain("address = '100 O''NEILL ST'")
  })

  it('matches nothing on a key the property lacks, instead of writing invalid SQL', () => {
    const where = propertyRecordsWhere({ ...sampleAddress, eclipseLocationIds: [] })
    expect(where).toContain("addressobjectid IN ('')")
    expect(where).not.toContain('IN ()')
  })
})

describe('fetchPermits', () => {
  it('shapes gateway rows into permits, newest first', async () => {
    stubGatewayPages([samplePermitRows])
    const permits = await fetchPermits(sampleAddress)
    expect(permits.map((p) => p.permitNumber)).toEqual(['RP-2022-005991', 'PP-2022-004106'])
    expect(permits[0]).toMatchObject({
      id: 2,
      description: 'Residential Building Permit',
      issuedDate: '2022-06-15T04:00:00Z',
      status: 'COMPLETED',
    })
  })

  // Runs only where a client id is set (a developer's .env.local), so it stands down in CI.
  it.skipIf(!import.meta.env.VITE_GATEWAY_CLIENT_ID)(
    'finds the two known permits for 943 Sigel St on the real services',
    async () => {
      const address = await lookupAddress('943 Sigel St')
      expect(address).not.toBeNull()
      const permits = await fetchPermits(address!)
      const byNumber = Object.fromEntries(permits.map((p) => [p.permitNumber, p.issuedDate]))
      expect(byNumber['RP-2022-005991']).toBe('2022-06-15T04:00:00Z')
      expect(byNumber['PP-2022-004106']).toBe('2022-03-15T04:00:00Z')
    },
  )
})
