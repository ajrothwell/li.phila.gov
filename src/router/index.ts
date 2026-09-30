import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/dashboard/DashboardView.vue'
import { eclipseUrl } from '@/dashboard/sections'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
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
