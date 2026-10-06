import { ref } from 'vue'
import { defineStore } from 'pinia'
import { lookupAddress } from '@/shared/ais'
import type { AddressRecord } from '@/shared/ais'

export type SearchStatus = 'idle' | 'loading' | 'found' | 'not-found' | 'error'

/**
 * The property the user has searched for. One copy for the whole app, so the
 * results page, breadcrumbs, and detail pages all read the same address.
 */
export const usePropertyHistoryStore = defineStore('propertyHistory', () => {
  const address = ref<AddressRecord | null>(null)
  const status = ref<SearchStatus>('idle')
  /** What the user typed, kept for the "No results found for …" message. */
  const searchedFor = ref('')

  async function search(query: string) {
    searchedFor.value = query
    status.value = 'loading'
    address.value = null
    try {
      const found = await lookupAddress(query)
      // A newer search may have started while we waited; let it win.
      if (query !== searchedFor.value) return
      address.value = found
      status.value = found ? 'found' : 'not-found'
    } catch {
      if (query !== searchedFor.value) return
      status.value = 'error'
    }
  }

  return { address, status, searchedFor, search }
})
