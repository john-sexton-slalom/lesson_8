import type { RouteRecordRaw } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
  },
]

export default routes
