<template>
  <div class="admin-dashboard">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Admin Dashboard</h1>
      <div class="blockchain-status">
        <span v-if="isConnected" class="badge bg-success">
          <i class="fab fa-ethereum me-1"></i>
          {{ networkName }}
        </span>
        <span v-else class="badge bg-warning">
          <i class="fas fa-exclamation-triangle me-1"></i>
          Not Connected to Blockchain
        </span>
      </div>
    </div>
    
    <div v-if="!isConnected" class="mb-4">
      <div class="alert alert-warning">
        <i class="fas fa-wallet me-2"></i>
        <strong>MetaMask not connected.</strong> Please connect your wallet to manage blockchain functionality.
      </div>
      <ConnectWallet />
    </div>
    
    <!-- Dashboard Navigation -->
    <div class="admin-nav mb-4">
      <ul class="nav nav-tabs">
        <li class="nav-item">
          <router-link class="nav-link" :to="'/admin/elections'" active-class="active">
            <i class="fas fa-vote-yea me-1"></i>
            Elections
          </router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" :to="'/admin/candidates'" active-class="active">
            <i class="fas fa-user-tie me-1"></i>
            Candidates
          </router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" :to="'/admin/voters'" active-class="active">
            <i class="fas fa-users me-1"></i>
            Voters
          </router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" :to="'/admin/results'" active-class="active">
            <i class="fas fa-chart-pie me-1"></i>
            Results
          </router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" :to="'/analytics'" active-class="active">
            <i class="fas fa-chart-line me-1"></i>
            Analytics
          </router-link>
        </li>
      </ul>
    </div>
    
    <!-- Dashboard Stats Cards -->
    <div class="stats-cards mb-4">
      <div class="row">
        <div class="col-md-3 mb-3">
          <div class="card stats-card h-100">
            <div class="card-body">
              <div class="stats-icon mb-3">
                <i class="fas fa-vote-yea fa-2x text-primary"></i>
              </div>
              <h5 class="card-title">Total Elections</h5>
              <p class="stats-number">{{ stats.totalElections }}</p>
              <div class="stats-label" :class="getStatusClass('active')">
                {{ stats.activeElections }} Active
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 mb-3">
          <div class="card stats-card h-100">
            <div class="card-body">
              <div class="stats-icon mb-3">
                <i class="fas fa-user-tie fa-2x text-success"></i>
              </div>
              <h5 class="card-title">Candidates</h5>
              <p class="stats-number">{{ stats.totalCandidates }}</p>
              <div class="stats-label" :class="getStatusClass('pending')">
                {{ stats.pendingApprovals }} Pending
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 mb-3">
          <div class="card stats-card h-100">
            <div class="card-body">
              <div class="stats-icon mb-3">
                <i class="fas fa-users fa-2x text-info"></i>
              </div>
              <h5 class="card-title">Registered Voters</h5>
              <p class="stats-number">{{ stats.registeredVoters }}</p>
              <div class="stats-label" :class="getStatusClass('whitelisted')">
                {{ stats.whitelistedVoters }} Whitelisted
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 mb-3">
          <div class="card stats-card h-100">
            <div class="card-body">
              <div class="stats-icon mb-3">
                <i class="fas fa-check-double fa-2x text-warning"></i>
              </div>
              <h5 class="card-title">Total Votes</h5>
              <p class="stats-number">{{ stats.totalVotes }}</p>
              <div class="stats-label" :class="getStatusClass('today')">
                {{ stats.todayVotes }} Today
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Dashboard Content -->
    <div class="dashboard-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ConnectWallet from '@/components/ConnectWallet.vue'

export default {
  name: 'Dashboard',
  components: {
    ConnectWallet
  },
  data() {
    return {
      stats: {
        totalElections: 0,
        activeElections: 0,
        totalCandidates: 0,
        pendingApprovals: 0,
        registeredVoters: 0,
        whitelistedVoters: 0,
        totalVotes: 0,
        todayVotes: 0
      }
    }
  },
  computed: {
    ...mapGetters(['isConnected', 'networkId']),
    networkName() {
      const networks = {
        1: 'Ethereum Mainnet',
        3: 'Ropsten Testnet',
        4: 'Rinkeby Testnet',
        5: 'Goerli Testnet',
        42: 'Kovan Testnet',
        1337: 'Local Ganache'
      }
      return networks[this.networkId] || `Network ID: ${this.networkId}`
    }
  },
  methods: {
    getStatusClass(type) {
      const classes = {
        'active': 'text-success',
        'pending': 'text-warning',
        'whitelisted': 'text-info',
        'today': 'text-primary'
      }
      return classes[type] || ''
    },
    async loadDashboardStats() {
      try {
        // Fetch real data from the API
        const [electionsResponse, candidatesResponse, votersResponse, votesResponse] = await Promise.all([
          this.$store.dispatch('fetchElections'),
          this.$store.dispatch('fetchCandidates'),
          this.$store.dispatch('fetchVoters'),
          Promise.resolve([]) // We don't have a direct API call for all votes yet
        ]);
        
        // Calculate statistics from the fetched data
        const elections = this.$store.getters.allElections || [];
        const activeElections = elections.filter(e => e.status === 'Voting').length;
        
        const candidates = this.$store.getters.candidates || [];
        // For the pending approvals, we're using a placeholder since there's no direct way to track this
        const pendingApprovals = 0;
        
        const voters = this.$store.getters.voters || [];
        const whitelistedVoters = voters.filter(v => v.is_whitelisted).length;
        
        // For votes, we need to fetch from each election
        let totalVotes = 0;
        let todayVotes = 0;
        
        // Simplified calculation for today's votes
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Update the stats with real data
        this.stats = {
          totalElections: elections.length,
          activeElections,
          totalCandidates: candidates.length,
          pendingApprovals,
          registeredVoters: voters.length,
          whitelistedVoters,
          totalVotes, // This would be calculated from real vote data
          todayVotes // This would be calculated from real vote data
        };
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      }
    }
  },
  created() {
    this.loadDashboardStats()
  }
}
</script>

<style scoped>
.admin-dashboard {
  margin-bottom: 40px;
}

.stats-card {
  border: none;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.stats-icon {
  display: inline-block;
  width: 60px;
  height: 60px;
  line-height: 60px;
  text-align: center;
  border-radius: 50%;
  background-color: rgba(108, 99, 255, 0.1);
}

.stats-number {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.stats-label {
  font-size: 0.9rem;
  font-weight: 500;
}

.blockchain-status {
  font-size: 0.9rem;
}
</style>
