import { createRouter, createWebHistory } from 'vue-router'
import { jwtDecode } from 'jwt-decode' // ✅ Correct
import Settings from '@/admin-componets/Settings.vue'
import SettingsUser from '@/user-componets/Settings.vue'


import LoginView from '../Login.vue'
import SplashScreen from '../SplashScreen.vue'
import PageNotFound from '../PageNotFound.vue'

// Admin Components
import AdminDashboard from '../admin-componets/AdminDashboard.vue'
import ChargerListing from '../admin-componets/ChargerListing.vue'
import BookingShow from '../admin-componets/BookingShow.vue'

// User Components
import UserDashboard from '../user-componets/UserDashboard.vue'
import AvailableChargers from '../user-componets/AvailableChargers.vue'

// Get user role from JWT
function getUserRole() {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    const decoded = jwtDecode(token)
    return decoded.role
  } catch (err) {
    return null
  }
}

// Route definitions
const routes = [
  { path: '/', name: 'splash', component: SplashScreen },
  { path: '/login', name: 'login', component: LoginView },

  // Admin Routes
  {
    path: '/admin-dashboard',
    name: 'admin-dashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin-dashboard/booking-show',
    name: 'admin-booking-show',
    component: BookingShow,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin-dashboard/charger-listing',
    name: 'charger-listing',
    component: ChargerListing,
    meta: { requiresAuth: true, role: 'admin' }
  },
   {
    path: '/admin-dashboard/settings',
    name: 'admin-settings',
    component: Settings,
    meta: { requiresAuth: true, role: 'admin' }
  },

  // User Routes
  {
    path: '/user-dashboard',
    name: 'UserDashboard',
    component: UserDashboard,
    meta: { requiresAuth: true, role: 'user' }
  },
  {
    path: '/user-dashboard/find-stations',
    name: 'AvailableChargers',
    component: AvailableChargers,
    meta: { requiresAuth: true, role: 'user' }
  },

   {
    path: '/user-dashboard/settings',
    name: 'user-settings',
    component: SettingsUser,
    meta: { requiresAuth: true, role: 'user' }
    
  },
  // Catch-all 404
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: PageNotFound
  }
]

// Create router
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Global Navigation Guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth
  const expectedRole = to.meta.role
  const token = localStorage.getItem('token')

  if (requiresAuth) {
    if (!token) {
      // Not logged in
      return next('/login')
    }

    try {
      const decoded = jwtDecode(token)
      const userRole = decoded.role

      if (userRole !== expectedRole) {
        // Unauthorized access
        return next('/login')
      }

      next()
    } catch (error) {
      console.error('Invalid token:', error)
      return next('/login')
    }

  } else {
    next()
  }
})

export default router
