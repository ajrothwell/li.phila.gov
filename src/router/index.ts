import { createRouter, createWebHistory, type RouteLocationNormalizedLoaded } from 'vue-router'
import DashboardView from '@/dashboard/DashboardView.vue'
import PropertyHistoryView from '@/property-history/PropertyHistoryView.vue'
import PropertyHistoryResults from '@/property-history/PropertyHistoryResults.vue'
import ContractorLookupView from '@/contractor-lookup/ContractorLookupView.vue'
import ContractorPermitLookupView from '@/contractor-permit-lookup/ContractorPermitLookupView.vue'
import AppealsCalendarView from '@/appeals-calendar/AppealsCalendarView.vue'
import { eclipseUrl } from '@/dashboard/sections'

// What our routes are allowed to carry in `meta`.
declare module 'vue-router' {
  interface RouteMeta {
    /** Shown in the app header instead of the app name. */
    title?: string
    /** Shown under the header, above the breadcrumbs. */
    subtitle?: string
    /** Breadcrumb label worked out from the current URL, for routes whose crumb isn't fixed text. */
    breadcrumb?: (route: RouteLocationNormalizedLoaded) => string
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
      meta: {
        title: 'Property History',
        subtitle: 'Permits, licenses, violations & appeals by address',
      },
      children: [
        {
          // /property-history/search?address=…
          path: 'search',
          name: 'property-history-search',
          component: PropertyHistoryResults,
          meta: {
            breadcrumb: (route) =>
              typeof route.query.address === 'string' ? route.query.address : '',
          },
        },
      ],
    },
    {
      path: '/contractor-lookup',
      name: 'contractor-lookup',
      component: ContractorLookupView,
      meta: {
        title: 'Find a Licensed Contractor',
        subtitle: 'Search for contractors and tradespeople',
      },
    },
    {
      path: '/contractor-permit-lookup',
      name: 'contractor-permit-lookup',
      component: ContractorPermitLookupView,
      meta: {
        title: 'Contractor Permit Lookup',
        subtitle: 'View the status of your permits',
      },
    },
    {
      path: '/appeals-calendar',
      name: 'appeals-calendar',
      component: AppealsCalendarView,
      meta: {
        title: 'L&I Appeals Calendar',
        subtitle: 'See dates and agendas for L&I appeal hearings',
      },
    },
    {
      path: '/zba-appeals-calendar',
      name: 'zba-appeals-calendar',
      component: AppealsCalendarView,
      meta: {
        title: 'Zoning Board of Adjustment (ZBA) Appeals Calendar',
        subtitle: 'See dates and agendas for ZBA appeal hearings',
      },
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
