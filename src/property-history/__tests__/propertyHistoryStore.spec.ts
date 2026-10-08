import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePropertyHistoryStore } from '../propertyHistoryStore'
import { stubAis, stubAisFound } from '@/__tests__/fakeAis'

// A store needs a Pinia to live in. In the app, main.ts provides one; here we make a
// fresh one before each test so no test sees another's leftovers.
beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('property history store', () => {
  it('starts with no address and nothing searched', () => {
    const propertyHistoryStore = usePropertyHistoryStore()
    expect(propertyHistoryStore.addressStatus).toBe('idle')
    expect(propertyHistoryStore.address).toBeNull()
    expect(propertyHistoryStore.searchedAddress).toBe('')
  })

  it('holds the address after a successful search', async () => {
    stubAisFound()
    const propertyHistoryStore = usePropertyHistoryStore()
    await propertyHistoryStore.loadProperty('1234 market st')
    expect(propertyHistoryStore.addressStatus).toBe('found')
    expect(propertyHistoryStore.address?.streetAddress).toBe('1234 MARKET ST')
    expect(propertyHistoryStore.searchedAddress).toBe('1234 market st')
  })

  it('reports not-found when AIS has no match', async () => {
    stubAis(404)
    const propertyHistoryStore = usePropertyHistoryStore()
    await propertyHistoryStore.loadProperty('asdfqwerty')
    expect(propertyHistoryStore.addressStatus).toBe('not-found')
    expect(propertyHistoryStore.address).toBeNull()
  })

  it('reports an error when AIS fails', async () => {
    stubAis(500)
    const propertyHistoryStore = usePropertyHistoryStore()
    await propertyHistoryStore.loadProperty('1234 market st')
    expect(propertyHistoryStore.addressStatus).toBe('error')
    expect(propertyHistoryStore.address).toBeNull()
  })
})
