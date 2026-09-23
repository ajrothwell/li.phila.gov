<script setup lang="ts">
import { RouterView } from 'vue-router'
import { AppHeader } from '@phila/phila-ui-app-header'
import type { NavbarBrandProps } from '@phila/phila-ui-app-header'
import { AppFooter } from '@phila/phila-ui-app-footer'

const appTitle = 'L&I Lookup Resources'

const navbarBrand: NavbarBrandProps = {
  brandingImage: { src: '', href: '/', altText: appTitle },
  logo: { layout: 'single-line', customName: appTitle },
}
</script>

<template>
  <AppHeader
    id="li-nav"
    :show-trusted-site="true"
    :compact-mobile="true"
    :navbar-brand="navbarBrand"
  />
  <main class="app-main">
    <RouterView />
  </main>
  <AppFooter :sub-footer-only="true" />
</template>

<style scoped>
.app-main {
  flex: 1;
}
</style>

<style>
body {
  margin: 0;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

/* Mirrors pinboard-3's PinboardShell. AppHeader's compact-mobile banner is 40px
   where the City's apps use 32px, and it leaves single-line app titles at desktop
   size. Remove once phila-ui-4 exposes both (bead map-core-nhy). */
@media (max-width: 768px), (max-width: 1064px) and (max-height: 600px) {
  #trusted-site {
    height: 2rem !important;
  }

  .phila-navbar-logo.logo--single-line {
    font-size: 1rem;
    white-space: nowrap;
  }
}
</style>
