import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Users from '../pages/Users.vue'
import RolePermission from '../pages/RolePermission.vue'
import Reports from '../pages/Reports.vue'
import Profile from '../pages/Profile.vue'
import Employees from '../pages/Employees.vue'
import Recruitment from '../pages/Recruitment.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/home', name: 'Home', component: Home },
  { path: '/users', name: 'Users', component: Users },
  { path: '/role-permission', name: 'RolePermission', component: RolePermission },
  { path: '/reports', name: 'Reports', component: Reports },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/employees', name: 'Employees', component: Employees },
  { path: '/recruitment', name: 'Recruitment', component: Recruitment },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
