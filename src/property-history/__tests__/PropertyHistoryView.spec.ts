import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import PropertyHistoryView from '../PropertyHistoryView.vue'
import router from '@/router'

function mountPropertyHistory() {
  return mount(PropertyHistoryView, { global: { plugins: [router] } })
}

describe('PropertyHistoryView', () => {
  it('shows an address search box', () => {
    const wrapper = mountPropertyHistory()
    const input = wrapper.find('input[placeholder="Search an address..."]')
    expect(input.exists()).toBe(true)
    expect(input.attributes('aria-label')).toBe('Search an address...')
    expect(wrapper.find('h2').text()).toBe('Property address search')
  })
})
