import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Users from '../pages/Users.vue'
import RolePermission from '../pages/RolePermission.vue'
import Reports from '../pages/Reports.vue'
import Profile from '../pages/Profile.vue'
import Employees from '../pages/Employees.vue'
import Recruitment from '../pages/Recruitment.vue'
import rolesJson from '../data/roles.json'

const roles = rolesJson.roles || []

function getCurrentRole() {
  try {
    const roleId = localStorage.getItem('rbac-current-role')
    if (roleId) {
      const found = roles.find((r) => r.id === roleId)
      if (found) return found
    }
  } catch (e) {
    // ignore localStorage errors
  }
  return roles[0] || { id: 'guest', name: 'Guest', menus: [] }
}

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/home', name: 'Home', component: Home },
  { path: '/users', name: 'Users', component: Users },
  { path: '/rolePermission', name: 'RolePermission', component: RolePermission },
  { path: '/reports', name: 'Reports', component: Reports },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/employees', name: 'Employees', component: Employees },
  { path: '/recruitment', name: 'Recruitment', component: Recruitment },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.path === '/') {
    return next('/home')
  }

  if (!to.matched.length) {
    // no route matched, let normal 404 handling take place
    return next()
  }

  const role = getCurrentRole()
  const allowedPaths = (role.menus || []).map((m) => m.path)

  // If page is permitted for current role, pass through
  if (allowedPaths.includes(to.path)) {
    return next()
  }

  // Home must always be accessible (if role has home)
  if (to.path === '/home') {
    return next()
  }

  alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้สำหรับบทบาทปัจจุบัน')
  return next('/home')
})

export default router
