import { describe, it, expect } from 'vitest'

import { mount, flushPromises } from '@vue/test-utils'
import DashboardView from '../DashboardView.vue'
import { eclipseUrl } from '../sections'
import router from '@/router'

function mountDashboard() {
  return mount(DashboardView, { global: { plugins: [router] } })
}

describe('DashboardView', () => {
  it('renders five sections', () => {
    const wrapper = mountDashboard()
    expect(wrapper.findAll('.phila-card')).toHaveLength(5)
  })

  it('links the eCLIPSE section straight to eCLIPSE', () => {
    const wrapper = mountDashboard()
    const eclipse = wrapper.find(`a[href="${eclipseUrl}"]`)
    expect(eclipse.exists()).toBe(true)
    expect(eclipse.text()).toContain('eCLIPSE Dashboard')
  })

  it('navigates in the app when an internal section is clicked', async () => {
    const wrapper = mountDashboard()
    await wrapper.findAll('.phila-card')[0]!.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/property-history')
  })
})
