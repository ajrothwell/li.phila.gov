<script setup lang="ts">
import { useRouter } from 'vue-router'
import { InfoCard } from '@phila/phila-ui-cards'
import { sections, isInternal, type Section } from './sections'

const router = useRouter()

function open(section: Section) {
  if (isInternal(section.href)) router.push(section.href)
}
</script>

<template>
  <div class="dashboard">
    <InfoCard
      v-for="section in sections"
      :key="section.href"
      :href="isInternal(section.href) ? undefined : section.href"
      :tabindex="isInternal(section.href) ? 0 : undefined"
      @click="open(section)"
      @keydown.enter="open(section)"
    >
      <template #header>
        <h2 class="has-text-heading-6">{{ section.title }}</h2>
      </template>
      <template #body>
        <p class="has-text-body-small section-description">{{ section.description }}</p>
      </template>
    </InfoCard>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-s);
}

/* phila-ui gives card body text a bottom margin for stacking paragraphs;
   each section has one paragraph, so it would only be dead space. */
.dashboard .section-description {
  margin: 0;
}
</style>
