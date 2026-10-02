<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@phila/phila-ui-search'
import { eclipseUrl } from '@/dashboard/sections'

const address = ref('')
</script>

<template>
  <div class="content">
    <h1 class="screen-reader-only">Property History</h1>
    <p>Permits, licenses, violations &amp; appeals by address</p>

    <div class="search-panel">
      <h2 class="has-text-heading-6">Property address search</h2>
      <!-- No aria-label: in search 1.2.3 passing one removes the input's label
           instead of setting it. Without it the placeholder is used as the label. -->
      <Search v-model="address" placeholder="Search an address..." />
    </div>

    <div class="search-prompt">
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
