<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePropertyHistoryStore } from './propertyHistoryStore'

const route = useRoute()
const propertyHistoryStore = usePropertyHistoryStore()

// Look up the address in the URL now, and again whenever the URL's address changes.
watch(
  () => route.query.address,
  (address) => {
    if (typeof address !== 'string' || address === '') return
    // Already have this one (e.g. coming back from a detail page): don't ask again.
    if (propertyHistoryStore.status === 'found' && propertyHistoryStore.searchedFor === address) return
    propertyHistoryStore.search(address)
  },
  { immediate: true },
)
</script>

<template>
  <div class="results content">
    <p v-if="propertyHistoryStore.status === 'loading'">Looking up {{ propertyHistoryStore.searchedFor }}…</p>

    <p v-else-if="propertyHistoryStore.status === 'not-found'" class="not-found">
      No results found for {{ propertyHistoryStore.searchedFor }}.
    </p>

    <p v-else-if="propertyHistoryStore.status === 'error'">
      Something went wrong looking up that address. Please try again.
    </p>

    <dl v-else-if="propertyHistoryStore.status === 'found' && propertyHistoryStore.address" class="summary">
      <dt>Address</dt>
      <dd>{{ propertyHistoryStore.address.streetAddress }}</dd>
      <dt>L&amp;I district</dt>
      <dd>{{ propertyHistoryStore.address.liDistrict }}</dd>
      <dt>Owner</dt>
      <dd>{{ propertyHistoryStore.address.owners }}</dd>
    </dl>
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
</style>
