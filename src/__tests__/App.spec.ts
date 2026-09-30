import { describe, it, expect, vi } from 'vitest'

import { mount } from '@vue/test-utils'
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

describe('App', () => {
  it('renders the header title', () => {
    stubViewport(false)
    const wrapper = mountApp()
    expect(wrapper.text()).toContain('L&I Lookup Resources')
  })

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
})
