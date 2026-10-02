import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/dashboard/DashboardView.vue'
import PropertyHistoryView from '@/property-history/PropertyHistoryView.vue'
import ContractorLookupView from '@/contractor-lookup/ContractorLookupView.vue'
import ContractorPermitLookupView from '@/contractor-permit-lookup/ContractorPermitLookupView.vue'
import AppealsCalendarView from '@/appeals-calendar/AppealsCalendarView.vue'
import { eclipseUrl } from '@/dashboard/sections'

// What our routes are allowed to carry in `meta`.
declare module 'vue-router' {
  interface RouteMeta {
    /** Shown in the app header instead of the app name. */
    title?: string
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/property-history',
      name: 'property-history',
      component: PropertyHistoryView,
      meta: { title: 'Property History' },
    },
    {
      path: '/contractor-lookup',
      name: 'contractor-lookup',
      component: ContractorLookupView,
      meta: { title: 'Find a Licensed Contractor' },
    },
    {
      path: '/contractor-permit-lookup',
      name: 'contractor-permit-lookup',
      component: ContractorPermitLookupView,
      meta: { title: 'Contractor Permit Lookup' },
    },
    {
      path: '/appeals-calendar',
      name: 'appeals-calendar',
      component: AppealsCalendarView,
      meta: { title: 'L&I Appeals Calendar' },
    },
    {
      path: '/zba-appeals-calendar',
      name: 'zba-appeals-calendar',
      component: AppealsCalendarView,
      meta: { title: 'Zoning Board of Adjustment (ZBA) Appeals Calendar' },
    },
    {
      // Kept for old bookmarks; the dashboard section links to eCLIPSE directly.
      path: '/eclipse-dashboard',
      component: DashboardView,
      beforeEnter: () => {
        window.location.assign(eclipseUrl)
        return false
      },
    },
  ],
})

export default router
