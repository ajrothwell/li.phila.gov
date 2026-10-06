<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { AppHeader, NavbarBurger } from '@phila/phila-ui-app-header'
import type { NavbarBrandProps } from '@phila/phila-ui-app-header'
import { AppFooter } from '@phila/phila-ui-app-footer'
import { Breadcrumbs } from '@phila/phila-ui-breadcrumbs'
import type { BreadcrumbItem } from '@phila/phila-ui-breadcrumbs'
import { PhilaLink } from '@phila/phila-ui-link'
import { useIsMobile } from '@/shared/useIsMobile'

const isMobile = useIsMobile()
const route = useRoute()
const router = useRouter()

// Where the app lives: '/' normally, '/li.phila.gov/' on the GitHub Pages demo.
const homeHref = import.meta.env.BASE_URL

const appTitle = 'L&I Lookup Resources'
const headerTitle = computed(() => route.meta.title ?? appTitle)
const navbarBrand = computed<NavbarBrandProps>(() => ({
  brandingImage: { src: '', href: homeHref, altText: headerTitle.value },
  logo: { layout: 'single-line', customName: headerTitle.value },
}))

// One crumb per matched route, labelled by its title or worked out from the URL.
// The component adds the home link itself.
const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const trail: BreadcrumbItem[] = []
  for (const record of route.matched) {
    // Most routes have a fixed title. A few (like the search page) work out
    // their crumb from the current URL instead.
    let label = record.meta.title
    if (record.meta.breadcrumb) {
      label = record.meta.breadcrumb(route)
    }
    if (label) {
      // router.resolve adds the base path, so the link is right wherever the app lives.
      trail.push({ label: label, href: router.resolve({ path: record.path }).href })
    }
  }
  return trail
})

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
    <p v-if="route.meta.subtitle" class="content section-subtitle">{{ route.meta.subtitle }}</p>
    <Breadcrumbs v-if="breadcrumbs.length > 0" :items="breadcrumbs" :home-href="homeHref" />
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
