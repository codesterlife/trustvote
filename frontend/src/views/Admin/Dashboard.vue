<template>
  <div class="admin-dashboard">
    <div class="card mb-4">
      <div class="card-body">
        <h1 class="mb-3">Admin Dashboard</h1>
        <p class="text-muted">
          Welcome to the TrustVote admin dashboard. Here you can manage elections, candidates, and voters.
        </p>
      </div>
    </div>
    
    <!-- Admin Navigation Tabs -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <router-link to="/admin" class="nav-link" exact-active-class="active">
          <i class="fas fa-tachometer-alt me-2"></i>Overview
        </router-link>
      </li>
      <li class="nav-item">
        <router-link to="/admin/elections" class="nav-link">
          <i class="fas fa-vote-yea me-2"></i>Elections
        </router-link>
      </li>
      <li class="nav-item">
        <router-link to="/admin/candidates" class="nav-link">
          <i class="fas fa-user-tie me-2"></i>Candidates
        </router-link>
      </li>
      <li class="nav-item">
        <router-link to="/admin/voters" class="nav-link">
          <i class="fas fa-users me-2"></i>Voters
        </router-link>
      </li>
      <li class="nav-item">
        <router-link to="/admin/results" class="nav-link">
          <i class="fas fa-chart-bar me-2"></i>Results
        </router-link>
      </li>
    </ul>
    
    <!-- Overview Stats -->
    <div class="row g-4 mb-4">
      <div class="col-md-3">
        <div class="card bg-primary text-white h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="card-title">Total Elections</h5>
                <h2 class="mb-0">{{ stats.totalElections }}</h2>
              </div>
              <i class="fas fa-vote-yea fa-2x"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-success text-white h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="card-title">Active Elections</h5>
                <h2 class="mb-0">{{ stats.activeElections }}</h2>
              </div>
              <i class="fas fa-check-circle fa-2x"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-info text-white h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="card-title">Total Candidates</h5>
                <h2 class="mb-0">{{ stats.totalCandidates }}</h2>
              </div>
              <i class="fas fa-user-tie fa-2x"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-warning text-white h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="card-title">Registered Voters</h5>
                <h2 class="mb-0">{{ stats.registeredVoters }}</h2>
              </div>
              <i class="fas fa-users fa-2x"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Recent Elections -->
    <div class="card mb-4">
      <div class="card-header bg-light">
        <h5 class="mb-0">Recent Elections</h5>
      </div>
      <div class="card-body">
        <div v-if="isLoading" class="text-center py-3">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else-if="recentElections.length === 0" class="text-center py-3">
          <p class="text-muted mb-0">No elections found</p>
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="election in recentElections" :key="election.electionId">
                <td>{{ election.title }}</td>
                <td>
                  <span class="badge rounded-pill" :class="getStatusClass(election.status)">
                    {{ election.status }}
                  </span>
                </td>
                <td>{{ formatDate(election.startTime) }}</td>
                <td>{{ formatDate(election.endTime) }}</td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <router-link 
                      :to="{ name: 'election-detail', params: { id: election.electionId }}" 
                      class="btn btn-outline-primary">
                      <i class="fas fa-eye"></i>
                    </router-link>
                    <router-link 
                      :to="{ name: 'manage-elections', query: { edit: election.electionId }}" 
                      class="btn btn-outline-secondary">
                      <i class="fas fa-edit"></i>
                    </router-link>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card-footer text-center">
        <router-link to="/admin/elections" class="btn btn-primary btn-sm">
          Manage All Elections
        </router-link>
      </div>
    </div>
    
    <!-- Pending Voter Approvals -->
    <div class="card">
      <div class="card-header bg-light">
        <h5 class="mb-0">Pending Voter Approvals</h5>
      </div>
      <div class="card-body">
        <div v-if="isLoadingVoters" class="text-center py-3">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else-if="pendingVoters.length === 0" class="text-center py-3">
          <p class="text-muted mb-0">No pending voter approvals</p>
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Wallet Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="voter in pendingVoters" :key="voter.id">
                <td>{{ voter.student_id }}</td>
                <td>{{ voter.full_name }}</td>
                <td>{{ voter.department }}</td>
                <td>
                  <span class="text-monospace small">{{ truncateAddress(voter.wallet_address) }}</span>
                </td>
                <td>
                  <button 
                    @click="approveVoter(voter)" 
                    class="btn btn-success btn-sm me-1"
                    :disabled="voter.isProcessing">
                    <span v-if="voter.isProcessing" class="spinner-border spinner-border-sm" role="status"></span>
                    <i v-else class="fas fa-check"></i>
                  </button>
                  <button 
                    @click="rejectVoter(voter)" 
                    class="btn btn-danger btn-sm"
                    :disabled="voter.isProcessing">
                    <i class="fas fa-times"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card-footer text-center">
        <router-link to="/admin/voters" class="btn btn-primary btn-sm">
          Manage All Voters
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'
import contractService from '@/contracts/index'

export default {
  name: 'AdminDashboard',
  data() {
    return {
      isLoading: true,
      isLoadingVoters: true,
      stats: {
        totalElections: 0,
        activeElections: 0,
        totalCandidates: 0,
        registeredVoters: 0
      },
      recentElections: [],
      pendingVoters: []
    }
  },
  methods: {
    async fetchDashboardData() {
      try {
        // Fetch statistics
        const statsResponse = await api.getAdminStats()
        this.stats = statsResponse.data
        
        // Fetch recent elections
        const electionsResponse = await api.getElections({ limit: 5 })
        this.recentElections = electionsResponse.data
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        this.isLoading = false
      }
      
      try {
        // Fetch pending voters
        const votersResponse = await api.getPendingVoters()
        this.pendingVoters = votersResponse.data.map(voter => ({
          ...voter,
          isProcessing: false
        }))
      } catch (error) {
        console.error('Error fetching pending voters:', error)
      } finally {
        this.isLoadingVoters = false
      }
    },
    getStatusClass(status) {
      status = status.toLowerCase()
      if (status === 'init') return 'badge-init'
      if (status === 'voting') return 'badge-voting'
      if (status === 'closed') return 'badge-closed'
      return 'bg-secondary'
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString()
    },
    truncateAddress(address) {
      if (!address) return ''
      return address.substring(0, 6) + '...' + address.substring(address.length - 4)
    },
    async approveVoter(voter) {
      try {
        // Set processing flag
        voter.isProcessing = true
        
        // Call smart contract to whitelist voter
        await contractService.whitelistVoter(voter.wallet_address)
        
        // Update voter status in backend
        await api.updateVoterStatus(voter.id, 'approved')
        
        // Remove from pending list
        this.pendingVoters = this.pendingVoters.filter(v => v.id !== voter.id)
        
        // Update stats
        this.stats.registeredVoters++
        
        // Show success message
        alert(`Voter ${voter.student_id} has been approved`)
      } catch (error) {
        console.error('Error approving voter:', error)
        alert(`Failed to approve voter: ${error.message}`)
      } finally {
        voter.isProcessing = false
      }
    },
    async rejectVoter(voter) {
      try {
        if (!confirm(`Are you sure you want to reject ${voter.full_name}?`)) {
          return
        }
        
        // Set processing flag
        voter.isProcessing = true
        
        // Update voter status in backend
        await api.updateVoterStatus(voter.id, 'rejected')
        
        // Remove from pending list
        this.pendingVoters = this.pendingVoters.filter(v => v.id !== voter.id)
        
        // Show success message
        alert(`Voter ${voter.student_id} has been rejected`)
      } catch (error) {
        console.error('Error rejecting voter:', error)
        alert(`Failed to reject voter: ${error.message}`)
      } finally {
        voter.isProcessing = false
      }
    }
  },
  mounted() {
    this.fetchDashboardData()
  }
}
</script>

<style scoped>
.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  margin-bottom: 1.5rem;
}

.nav-tabs .nav-link {
  padding: 0.75rem 1.25rem;
}

.nav-tabs .nav-link.active {
  font-weight: bold;
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}
</style>
