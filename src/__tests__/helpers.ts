import { vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import router from '@/router'

/* jsdom has no matchMedia; pretend the window is or isn't mobile-sized */
export function stubViewport(isMobile: boolean) {
  vi.stubGlobal('matchMedia', () => ({
    matches: isMobile,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

/** Go to a URL, then mount the whole app showing that page, with a fresh Pinia. */
export async function mountAt(path: string, isMobile = false) {
  stubViewport(isMobile)
  await router.push(path)
  await flushPromises()
  return mount(App, { global: { plugins: [router, createPinia()] } })
}
