import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Register from '@/views/Register.vue'
import Login from '@/views/Login.vue'
import Elections from '@/views/Elections.vue'
import ElectionDetail from '@/views/ElectionDetail.vue'
import VotingPage from '@/views/VotingPage.vue'
import ElectionResults from '@/views/ElectionResults.vue'
import Dashboard from '@/views/admin/Dashboard.vue'
import ElectionManagement from '@/views/admin/ElectionManagement.vue'
import CandidateManagement from '@/views/admin/CandidateManagement.vue'
import VoterManagement from '@/views/admin/VoterManagement.vue'
import ResultsView from '@/views/admin/ResultsView.vue'
import store from '@/store'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/elections',
    name: 'Elections',
    component: Elections,
    meta: { requiresAuth: true }
  },
  {
    path: '/elections/:id',
    name: 'ElectionDetail',
    component: ElectionDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/elections/:id/vote',
    name: 'VotingPage',
    component: VotingPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/elections/:id/results',
    name: 'ElectionResults',
    component: ElectionResults,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAdmin: true },
    children: [
      {
        path: 'elections',
        name: 'ElectionManagement',
        component: ElectionManagement
      },
      {
        path: 'candidates',
        name: 'CandidateManagement',
        component: CandidateManagement
      },
      {
        path: 'voters',
        name: 'VoterManagement',
        component: VoterManagement
      },
      {
        path: 'results',
        name: 'ResultsView',
        component: ResultsView
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Navigation Guards
router.beforeEach((to, from, next) => {
  const isLoggedIn = store.getters.isLoggedIn
  const isAdmin = store.getters.isAdmin
  
  if (to.matched.some(record => record.meta.requiresAuth) && !isLoggedIn) {
    next('/login')
  } else if (to.matched.some(record => record.meta.requiresAdmin) && !isAdmin) {
    next('/')
  } else {
    next()
  }
})

export default router
