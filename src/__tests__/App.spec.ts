import { describe, it, expect } from 'vitest'

import { flushPromises } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import router from '../router'
import { mountAt } from './helpers'

// The text of the logo in the blue header bar.
function headerTitle(wrapper: VueWrapper) {
  return wrapper.find('.phila-navbar-logo').text()
}

// The breadcrumb labels, in order.
function breadcrumbLabels(wrapper: VueWrapper) {
  return wrapper.findAll('nav[aria-label="breadcrumb"] li.breadcrumb-item').map((li) => li.text())
}

describe('App', () => {
  it('renders the mobile navigation button with the footer links on mobile', async () => {
    const wrapper = await mountAt('/', true)
    const burger = wrapper.find('button[aria-label="Open mobile navigation panel"]')
    expect(burger.exists()).toBe(true)
    const mobileNav = wrapper.find('.phila-mobile-nav')
    expect(mobileNav.text()).toContain('Department of Licenses & Inspections')
  })

  it('does not render the mobile navigation button on desktop', async () => {
    const wrapper = await mountAt('/', false)
    expect(wrapper.find('button[aria-label="Open mobile navigation panel"]').exists()).toBe(false)
  })

  describe('header title', () => {
    it('is the app name on the dashboard', async () => {
      const wrapper = await mountAt('/', false)
      expect(headerTitle(wrapper)).toBe('L&I Lookup Resources')
    })

    it("is the section's title on a section page", async () => {
      const wrapper = await mountAt('/property-history', false)
      expect(headerTitle(wrapper)).toBe('Property History')
    })

    it('is the ZBA title on the ZBA calendar', async () => {
      const wrapper = await mountAt('/zba-appeals-calendar', false)
      expect(headerTitle(wrapper)).toBe('Zoning Board of Adjustment (ZBA) Appeals Calendar')
    })

    it('changes when the user moves to another page', async () => {
      const wrapper = await mountAt('/', false)
      await router.push('/property-history')
      await flushPromises()
      expect(headerTitle(wrapper)).toBe('Property History')
    })
  })

  describe('section subtitle', () => {
    it('is shown under the header on a section page, and not on the dashboard', async () => {
      const section = await mountAt('/property-history', false)
      expect(section.find('.section-subtitle').text()).toBe(
        'Permits, licenses, violations & appeals by address',
      )
      const dashboard = await mountAt('/', false)
      expect(dashboard.find('.section-subtitle').exists()).toBe(false)
    })
  })

  describe('breadcrumbs', () => {
    it('are not shown on the dashboard', async () => {
      const wrapper = await mountAt('/', false)
      expect(wrapper.find('nav[aria-label="breadcrumb"]').exists()).toBe(false)
    })

    it('show the section after a home link', async () => {
      const wrapper = await mountAt('/property-history', false)
      expect(breadcrumbLabels(wrapper)).toEqual(['Property History'])
      const home = wrapper.find('nav[aria-label="breadcrumb"] a[aria-label="Home"]')
      expect(home.attributes('href')).toBe('/')
    })
  })
})
