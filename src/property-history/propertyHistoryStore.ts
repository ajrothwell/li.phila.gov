import { ref } from 'vue'
import { defineStore } from 'pinia'
import { lookupAddress, type AddressRecord } from '@/shared/ais'
import { fetchPermits, type Permit } from './permits'

/** The AIS lookup returns one record or nothing, so "nothing" is a state of the search. */
export type AddressSearchStatus = 'idle' | 'loading' | 'found' | 'not-found' | 'error'
/** A dataset returns a list; "nothing" is a loaded, empty list, not a status. */
export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error'

/**
 * The property the user has searched for, and everything loaded about it. One copy for
 * the whole app, so the results page, breadcrumbs, and detail pages all read the same data.
 */
export const usePropertyHistoryStore = defineStore('propertyHistory', () => {
  const address = ref<AddressRecord | null>(null)
  const addressStatus = ref<AddressSearchStatus>('idle')
  /** What the user typed, kept for the "No results found for …" message. */
  const searchedAddress = ref('')

  const permits = ref<Permit[]>([])
  const permitsStatus = ref<LoadStatus>('idle')

  /** Looks up the typed address, then loads everything the app shows for that property. */
  async function loadProperty(query: string) {
    searchedAddress.value = query
    addressStatus.value = 'loading'
    address.value = null
    permits.value = []
    permitsStatus.value = 'idle'
    try {
      const found = await lookupAddress(query)
      // A newer search may have started while we waited; let it win.
      if (query !== searchedAddress.value) return
      address.value = found
      addressStatus.value = found ? 'found' : 'not-found'
      if (found) await loadPermits(found, query)
    } catch {
      if (query !== searchedAddress.value) return
      addressStatus.value = 'error'
    }
  }

  async function loadPermits(found: AddressRecord, query: string) {
    permitsStatus.value = 'loading'
    try {
      const loaded = await fetchPermits(found)
      if (query !== searchedAddress.value) return
      permits.value = loaded
      permitsStatus.value = 'loaded'
    } catch {
      if (query !== searchedAddress.value) return
      permitsStatus.value = 'error'
    }
  }

  return { address, addressStatus, searchedAddress, permits, permitsStatus, loadProperty }
})
