<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const address = computed(() => route.query.address)
</script>

<template>
  <div class="results">
    <p>
      Results for <strong>{{ address }}</strong> will appear here.
    </p>
  </div>
</template>

<style scoped>
.results {
  margin-top: var(--spacing-l);
}
</style>
