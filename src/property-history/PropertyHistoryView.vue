<script setup lang="ts">
import { ref } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { Search } from '@phila/phila-ui-search'
import { eclipseUrl } from '@/dashboard/sections'

const route = useRoute()
const router = useRouter()

// Start with the address from the URL, so a shared or reloaded link fills the box.
const addressInUrl = route.query.address
const address = ref(typeof addressInUrl === 'string' ? addressInUrl : '')

function search() {
  const typed = address.value.trim()
  if (!typed) return
  router.push({ name: 'property-history-search', query: { address: typed } })
}
</script>

<template>
  <div class="content">
    <h1 class="screen-reader-only">Property History</h1>

    <div class="search-panel">
      <h2 class="has-text-heading-6">Property address search</h2>
      <!-- No aria-label: in search 1.2.3 passing one removes the input's label
           instead of setting it. Without it the placeholder is used as the label. -->
      <Search v-model="address" placeholder="Search an address..." @search="search" />
    </div>

    <RouterView />

    <div v-if="route.name === 'property-history'" class="search-prompt">
      <p class="has-text-body-large">
        Enter an address in the search bar to see permits, licenses, violations, and appeals.
      </p>
      <p class="has-text-body-small">
        For additional license and permit searches,
        <a :href="eclipseUrl" target="_blank" rel="noopener">view in eCLIPSE</a>.
      </p>
    </div>
  </div>
</template>

<style scoped>
/* The old app's light-blue search band, in the same blue as the dashboard cards. */
.search-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-s);
  padding: var(--spacing-m);
  border-radius: var(--border-radius-l);
  background-color: var(--Schemes-Info-Container);
}

.search-prompt {
  margin-top: var(--spacing-2xl);
  text-align: center;
}
</style>
