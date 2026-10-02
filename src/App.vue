<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { AppHeader, NavbarBurger } from '@phila/phila-ui-app-header'
import type { NavbarBrandProps } from '@phila/phila-ui-app-header'
import { AppFooter } from '@phila/phila-ui-app-footer'
import { PhilaLink } from '@phila/phila-ui-link'
import { useIsMobile } from '@/shared/useIsMobile'

const isMobile = useIsMobile()
const route = useRoute()

const appTitle = 'L&I Lookup Resources'
const headerTitle = computed(() => route.meta.title ?? appTitle)
const navbarBrand = computed<NavbarBrandProps>(() => ({
  brandingImage: { src: '', href: '/', altText: headerTitle.value },
  logo: { layout: 'single-line', customName: headerTitle.value },
}))

interface FooterLink {
  text: string
  href: string
}

const footerLinks: FooterLink[] = [
  {
    text: 'Department of Licenses & Inspections',
    href: 'https://www.phila.gov/departments/department-of-licenses-and-inspections/',
  },
  { text: 'Terms of Use', href: 'https://www.phila.gov/terms-of-use/' },
  {
    text: 'Right to Know',
    href: 'https://www.phila.gov/documents/pennsylvania-right-to-know-law-and-disclosure-of-public-documents/',
  },
  { text: 'Privacy Policy', href: 'https://www.phila.gov/privacypolicy/' },
]
</script>

<template>
  <AppHeader
    id="li-nav"
    :show-trusted-site="true"
    :compact-mobile="true"
    :navbar-brand="navbarBrand"
  >
    <template #navbar-toggle>
      <NavbarBurger v-if="isMobile" id="mobile-nav-li-nav" visibility-group="li-nav">
        <template #mobile-nav>
          <div class="content has-background-ghost-gray px-6 py-4 is-flex is-flex-column">
            <PhilaLink
              v-for="link in footerLinks"
              :key="link.href"
              size="small"
              :href="link.href"
              target="_blank"
              rel="noopener"
            >
              {{ link.text }}
            </PhilaLink>
          </div>
        </template>
      </NavbarBurger>
    </template>
  </AppHeader>
  <main class="app-main">
    <RouterView />
  </main>
  <AppFooter class="app-footer" :sub-footer-only="true">
    <template #subFooterSlot>
      <PhilaLink
        v-for="link in footerLinks"
        :key="link.href"
        size="small"
        :href="link.href"
        target="_blank"
        rel="noopener"
      >
        {{ link.text }}
      </PhilaLink>
    </template>
  </AppFooter>
</template>

<style scoped>
.app-main {
  flex: 1;
  width: 100%;
  max-width: 60rem;
  margin: 0 auto;
  padding: var(--spacing-l) var(--spacing-m);
  box-sizing: border-box;
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
   where the City's apps use 32px, it leaves single-line app titles at desktop
   size and keeps the desktop column-gap between burger and logo, and AppFooter
   has no hide-on-mobile like phila-ui 2 had. Remove once phila-ui-4 exposes
   these (bead map-core-nhy). */
@media (max-width: 768px), (max-width: 1064px) and (max-height: 600px) {
  #trusted-site {
    height: 2rem !important;
  }

  #app .phila-navbar {
    column-gap: var(--spacing-s);
  }

  #app .phila-navbar-logo.logo--single-line {
    font-size: 1rem;
    white-space: nowrap;
  }

  .app-footer {
    display: none;
  }
}
</style>
