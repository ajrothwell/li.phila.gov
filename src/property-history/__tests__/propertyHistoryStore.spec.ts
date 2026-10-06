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
    const store = usePropertyHistoryStore()
    expect(store.status).toBe('idle')
    expect(store.address).toBeNull()
    expect(store.searchedFor).toBe('')
  })

  it('holds the address after a successful search', async () => {
    stubAisFound()
    const store = usePropertyHistoryStore()
    await store.search('1234 market st')
    expect(store.status).toBe('found')
    expect(store.address?.streetAddress).toBe('1234 MARKET ST')
    expect(store.searchedFor).toBe('1234 market st')
  })

  it('reports not-found when AIS has no match', async () => {
    stubAis(404)
    const store = usePropertyHistoryStore()
    await store.search('asdfqwerty')
    expect(store.status).toBe('not-found')
    expect(store.address).toBeNull()
  })

  it('reports an error when AIS fails', async () => {
    stubAis(500)
    const store = usePropertyHistoryStore()
    await store.search('1234 market st')
    expect(store.status).toBe('error')
    expect(store.address).toBeNull()
  })
})
