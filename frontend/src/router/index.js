import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Election from '../views/Election.vue';
import VotingBooth from '../views/VotingBooth.vue';
import Results from '../views/Results.vue';
import Dashboard from '../views/admin/Dashboard.vue';
import AdminElections from '../views/admin/Elections.vue';
import AdminCandidates from '../views/admin/Candidates.vue';
import AdminVoters from '../views/admin/Voters.vue';
import AdminResults from '../views/admin/Results.vue';
import ElectionForm from '../views/admin/ElectionForm.vue';
import CandidateForm from '../views/admin/CandidateForm.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/election/:id',
    name: 'Election',
    component: Election,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/vote/:electionId/:positionId',
    name: 'VotingBooth',
    component: VotingBooth,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/results/:id',
    name: 'Results',
    component: Results,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: 'elections',
        name: 'AdminElections',
        component: AdminElections
      },
      {
        path: 'candidates',
        name: 'AdminCandidates',
        component: AdminCandidates
      },
      {
        path: 'voters',
        name: 'AdminVoters',
        component: AdminVoters
      },
      {
        path: 'results',
        name: 'AdminResults',
        component: AdminResults
      }
    ]
  },
  {
    path: '/admin/election/create',
    name: 'CreateElection',
    component: ElectionForm,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/election/:id/edit',
    name: 'EditElection',
    component: ElectionForm,
    props: true,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/candidate/create',
    name: 'CreateCandidate',
    component: CandidateForm,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/candidate/:id/edit',
    name: 'EditCandidate',
    component: CandidateForm,
    props: true,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router;
