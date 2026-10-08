<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePropertyHistoryStore } from './propertyHistoryStore'
import { formatDate } from '@/shared/formatDate'

const route = useRoute()
const propertyHistoryStore = usePropertyHistoryStore()

// "2 Permits for this property" / "No Permits for this property", as the old app said it.
const permitsHeading = computed(() => {
  const count = propertyHistoryStore.permits.length
  return count === 0 ? 'No Permits for this property' : `${count} Permits for this property`
})

// Look up the address in the URL now, and again whenever the URL's address changes.
watch(
  () => route.query.address,
  (address) => {
    if (typeof address !== 'string' || address === '') return
    // Already have this one (e.g. coming back from a detail page): don't ask again.
    if (propertyHistoryStore.addressStatus === 'found' && propertyHistoryStore.searchedAddress === address) return
    propertyHistoryStore.loadProperty(address)
  },
  { immediate: true },
)
</script>

<template>
  <div class="results content">
    <p v-if="propertyHistoryStore.addressStatus === 'loading'">Looking up {{ propertyHistoryStore.searchedAddress }}…</p>

    <p v-else-if="propertyHistoryStore.addressStatus === 'not-found'" class="not-found">
      No results found for {{ propertyHistoryStore.searchedAddress }}.
    </p>

    <p v-else-if="propertyHistoryStore.addressStatus === 'error'">
      Something went wrong looking up that address. Please try again.
    </p>

    <dl v-else-if="propertyHistoryStore.addressStatus === 'found' && propertyHistoryStore.address" class="summary">
      <dt>Address</dt>
      <dd>{{ propertyHistoryStore.address.streetAddress }}</dd>
      <dt>L&amp;I district</dt>
      <dd>{{ propertyHistoryStore.address.liDistrict }}</dd>
      <dt>Owner</dt>
      <dd>{{ propertyHistoryStore.address.owners }}</dd>
    </dl>

    <section v-if="propertyHistoryStore.addressStatus === 'found'" class="permits">
      <p v-if="propertyHistoryStore.permitsStatus === 'loading'">Loading permits…</p>
      <p v-else-if="propertyHistoryStore.permitsStatus === 'error'">
        Permits couldn't be loaded. Please try again.
      </p>
      <template v-else-if="propertyHistoryStore.permitsStatus === 'loaded'">
        <h2 class="has-text-heading-6">{{ permitsHeading }}</h2>
        <table v-if="propertyHistoryStore.permits.length > 0">
          <thead>
            <tr>
              <th>Date issued</th>
              <th>Permit #</th>
              <th>Permit type</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="permit in propertyHistoryStore.permits" :key="permit.id">
              <td>{{ formatDate(permit.issuedDate) }}</td>
              <td>{{ permit.permitNumber }}</td>
              <td>{{ permit.description }}</td>
            </tr>
          </tbody>
        </table>
      </template>
    </section>
  </div>
</template>

<style scoped>
.results {
  margin-top: var(--spacing-l);
}

.not-found {
  color: var(--Schemes-Error);
}

.summary {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: var(--spacing-2xs) var(--spacing-m);
}

.summary dt {
  font-weight: 600;
}

.summary dd {
  margin: 0;
}

.permits {
  margin-top: var(--spacing-xl);
}
</style>
