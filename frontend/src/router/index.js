import { createRouter, createWebHistory } from 'vue-router'
import web3Service from '@/services/web3'

// Views
import Home from '@/views/Home.vue'
import Register from '@/views/Register.vue'
import Login from '@/views/Login.vue'
import Elections from '@/views/Elections.vue'
import ElectionDetail from '@/views/ElectionDetail.vue'
import VotingBooth from '@/views/VotingBooth.vue'
import Results from '@/views/Results.vue'

// Admin views
import AdminDashboard from '@/views/Admin/Dashboard.vue'
import ManageElections from '@/views/Admin/ManageElections.vue'
import ManageCandidates from '@/views/Admin/ManageCandidates.vue'
import ManageVoters from '@/views/Admin/ManageVoters.vue'
import ViewResults from '@/views/Admin/ViewResults.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/register',
    name: 'register',
    component: Register
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/elections',
    name: 'elections',
    component: Elections,
    meta: { requiresAuth: true }
  },
  {
    path: '/election/:id',
    name: 'election-detail',
    component: ElectionDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/vote/:electionId/:positionId',
    name: 'voting-booth',
    component: VotingBooth,
    meta: { requiresAuth: true }
  },
  {
    path: '/results/:id',
    name: 'results',
    component: Results,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/elections',
    name: 'manage-elections',
    component: ManageElections,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/candidates',
    name: 'manage-candidates',
    component: ManageCandidates,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/voters',
    name: 'manage-voters',
    component: ManageVoters,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/results',
    name: 'view-results',
    component: ViewResults,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: 'active'
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Check if user is connected to MetaMask
    if (!web3Service.isConnected()) {
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }
    
    // Check if user is authenticated
    const isAuthenticated = await web3Service.isAuthenticated()
    if (!isAuthenticated) {
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }
    
    // Check if route requires admin role
    if (to.matched.some(record => record.meta.requiresAdmin)) {
      const isAdmin = await web3Service.isAdmin()
      if (!isAdmin) {
        next({ name: 'elections' })
        return
      }
    }
    
    next()
  } else {
    next()
  }
})

export default router
