import { describe, it, expect, vi, afterEach } from 'vitest'

import { flushPromises } from '@vue/test-utils'
import router from '@/router'
import { mountAt } from '@/__tests__/helpers'
import { stubAis, stubAisFound } from '@/__tests__/fakeAis'
import { stubAisFoundAndPermits } from '@/__tests__/fakeServices'

const searchInput = 'input[placeholder="Search an address..."]'

afterEach(() => {
  vi.unstubAllGlobals()
})

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
    stubAisFound()
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

  it('fills the box from a search link and hides the prompt', async () => {
    stubAisFound()
    const wrapper = await mountAt('/property-history/search?address=1234 Market St')
    const input = wrapper.find(searchInput).element as HTMLInputElement
    expect(input.value).toBe('1234 Market St')
    expect(wrapper.text()).not.toContain('Enter an address in the search bar')
  })

  describe('results', () => {
    it('show the address, district, and owner when AIS finds it', async () => {
      stubAisFound()
      const wrapper = await mountAt('/property-history/search?address=1234 Market St')
      await flushPromises()
      const text = wrapper.text()
      expect(text).toContain('1234 MARKET ST')
      expect(text).toContain('CENTRAL EAST')
      expect(text).toContain('SEPTA')
    })

    it('say no results when AIS has no match', async () => {
      stubAis(404)
      const wrapper = await mountAt('/property-history/search?address=asdfqwerty')
      await flushPromises()
      expect(wrapper.text()).toContain('No results found for asdfqwerty')
    })

    it('list the permits, newest first, with a count', async () => {
      stubAisFoundAndPermits()
      const wrapper = await mountAt('/property-history/search?address=943 Sigel St')
      await flushPromises()
      expect(wrapper.text()).toContain('2 Permits for this property')
      const cells = wrapper.findAll('tbody td').map((td) => td.text())
      expect(cells).toEqual([
        'Jun 15, 2022',
        'RP-2022-005991',
        'Residential Building Permit',
        'Mar 15, 2022',
        'PP-2022-004106',
        'Plumbing Permit',
      ])
    })

    it('say there are no permits when the gateway returns none', async () => {
      stubAisFoundAndPermits([])
      const wrapper = await mountAt('/property-history/search?address=943 Sigel St')
      await flushPromises()
      expect(wrapper.text()).toContain('No Permits for this property')
      expect(wrapper.find('table').exists()).toBe(false)
    })
  })
})
