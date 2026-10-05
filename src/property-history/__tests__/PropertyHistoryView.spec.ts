import { describe, it, expect } from 'vitest'

import { flushPromises } from '@vue/test-utils'
import router from '@/router'
import { mountAt } from '@/__tests__/helpers'

const searchInput = 'input[placeholder="Search an address..."]'

describe('PropertyHistoryView', () => {
  it('shows an address search box', async () => {
    const wrapper = await mountAt('/property-history')
    const input = wrapper.find(searchInput)
    expect(input.exists()).toBe(true)
    expect(input.attributes('aria-label')).toBe('Search an address...')
    expect(wrapper.find('h2').text()).toBe('Property address search')
  })

  it('shows the prompt before any search', async () => {
    const wrapper = await mountAt('/property-history')
    expect(wrapper.text()).toContain('Enter an address in the search bar')
  })

  it('goes to the search URL when Enter is pressed', async () => {
    const wrapper = await mountAt('/property-history')
    const input = wrapper.find(searchInput)
    await input.setValue('1234 Market St')
    await input.trigger('keydown.enter')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('property-history-search')
    expect(router.currentRoute.value.query.address).toBe('1234 Market St')
  })

  it('stays put when Enter is pressed on an empty box', async () => {
    const wrapper = await mountAt('/property-history')
    await wrapper.find(searchInput).trigger('keydown.enter')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('property-history')
  })

  it('fills the box and shows the address when opened from a search link', async () => {
    const wrapper = await mountAt('/property-history/search?address=1234 Market St')
    const input = wrapper.find(searchInput).element as HTMLInputElement
    expect(input.value).toBe('1234 Market St')
    expect(wrapper.text()).toContain('Results for 1234 Market St')
    expect(wrapper.text()).not.toContain('Enter an address in the search bar')
  })
})
