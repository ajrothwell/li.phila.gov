import { describe, it, expect, vi, afterEach } from 'vitest'
import { lookupAddress } from '../ais'
import { sampleProperties, stubAis, stubAisFound } from '@/__tests__/fakeAis'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('lookupAddress', () => {
  it('shapes an AIS feature into an address record', async () => {
    stubAisFound()
    const record = await lookupAddress('1234 market st')
    expect(record).toEqual({
      streetAddress: '1234 MARKET ST',
      opaAddress: '1234 MARKET ST',
      opaAccountNumber: '883309050',
      pwdParcelId: '542611',
      liAddressKeys: ['410516'],
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
