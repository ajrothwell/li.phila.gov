import { describe, it, expect, vi } from 'vitest'

import { mount, flushPromises } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import App from '../App.vue'
import router from '../router'

// jsdom has no matchMedia; pretend the window is or isn't mobile-sized.
function stubViewport(isMobile: boolean) {
  vi.stubGlobal('matchMedia', () => ({
    matches: isMobile,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

function mountApp() {
  return mount(App, { global: { plugins: [router] } })
}

// Go to a URL first, then mount, so the app starts on that page.
async function mountAppAt(path: string) {
  await router.push(path)
  await flushPromises()
  return mountApp()
}

// The text of the logo in the blue header bar.
function headerTitle(wrapper: VueWrapper) {
  return wrapper.find('.phila-navbar-logo').text()
}

describe('App', () => {
  it('renders the mobile navigation button with the footer links on mobile', () => {
    stubViewport(true)
    const wrapper = mountApp()
    const burger = wrapper.find('button[aria-label="Open mobile navigation panel"]')
    expect(burger.exists()).toBe(true)
    const mobileNav = wrapper.find('.phila-mobile-nav')
    expect(mobileNav.text()).toContain('Department of Licenses & Inspections')
  })

  it('does not render the mobile navigation button on desktop', () => {
    stubViewport(false)
    const wrapper = mountApp()
    expect(wrapper.find('button[aria-label="Open mobile navigation panel"]').exists()).toBe(false)
  })

  describe('header title', () => {
    it('is the app name on the dashboard', async () => {
      stubViewport(false)
      const wrapper = await mountAppAt('/')
      expect(headerTitle(wrapper)).toBe('L&I Lookup Resources')
    })

    it("is the section's title on a section page", async () => {
      stubViewport(false)
      const wrapper = await mountAppAt('/property-history')
      expect(headerTitle(wrapper)).toBe('Property History')
    })

    it('is the ZBA title on the ZBA calendar', async () => {
      stubViewport(false)
      const wrapper = await mountAppAt('/zba-appeals-calendar')
      expect(headerTitle(wrapper)).toBe('Zoning Board of Adjustment (ZBA) Appeals Calendar')
    })

    it('changes when the user moves to another page', async () => {
      stubViewport(false)
      const wrapper = await mountAppAt('/')
      await router.push('/property-history')
      await flushPromises()
      expect(headerTitle(wrapper)).toBe('Property History')
    })
  })
})
