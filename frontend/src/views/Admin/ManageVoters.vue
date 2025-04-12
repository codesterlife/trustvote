<template>
  <div class="manage-voters">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Manage Voters</h2>
      <button 
        @click="exportVoters" 
        class="btn btn-outline-primary">
        <i class="fas fa-download me-2"></i>Export Voters
      </button>
    </div>
    
    <!-- Admin Navigation Tabs -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <router-link to="/admin" class="nav-link">
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
        <router-link to="/admin/voters" class="nav-link" exact-active-class="active">
          <i class="fas fa-users me-2"></i>Voters
        </router-link>
      </li>
      <li class="nav-item">
        <router-link to="/admin/results" class="nav-link">
          <i class="fas fa-chart-bar me-2"></i>Results
        </router-link>
      </li>
    </ul>
    
    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-3 mb-3 mb-md-0">
            <label class="form-label">Status</label>
            <select class="form-select" v-model="filters.status">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div class="col-md-3 mb-3 mb-md-0">
            <label class="form-label">Department</label>
            <select class="form-select" v-model="filters.department">
              <option value="">All Departments</option>
              <option v-for="dept in departments" :key="dept" :value="dept">
                {{ dept }}
              </option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Search</label>
            <div class="input-group">
              <input 
                type="text" 
                class="form-control" 
                placeholder="Search by name, ID, or email..." 
                v-model="filters.search">
              <span class="input-group-text">
                <i class="fas fa-search"></i>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Stats -->
    <div class="row g-4 mb-4">
      <div class="col-md-3">
        <div class="card bg-primary text-white h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="card-title">Total Voters</h5>
                <h2 class="mb-0">{{ stats.total }}</h2>
              </div>
              <i class="fas fa-users fa-2x"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-success text-white h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="card-title">Approved</h5>
                <h2 class="mb-0">{{ stats.approved }}</h2>
              </div>
              <i class="fas fa-check-circle fa-2x"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-warning text-white h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="card-title">Pending</h5>
                <h2 class="mb-0">{{ stats.pending }}</h2>
              </div>
              <i class="fas fa-clock fa-2x"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-danger text-white h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="card-title">Rejected</h5>
                <h2 class="mb-0">{{ stats.rejected }}</h2>
              </div>
              <i class="fas fa-times-circle fa-2x"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Voters Table -->
    <div class="card">
      <div class="card-header bg-light">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Voters</h5>
          <span class="badge bg-secondary">
            {{ filteredVoters.length }} results
          </span>
        </div>
      </div>
      <div class="card-body p-0">
        <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3">Loading voters...</p>
        </div>
        
        <div v-else-if="filteredVoters.length === 0" class="text-center py-5">
          <div class="empty-state">
            <i class="fas fa-users fa-4x text-muted mb-3"></i>
            <h4>No Voters Found</h4>
            <p class="text-muted mb-4">
              {{ getEmptyMessage() }}
            </p>
          </div>
        </div>
        
        <div v-else class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Wallet Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="voter in filteredVoters" :key="voter.id">
                <td>{{ voter.student_id }}</td>
                <td>{{ voter.full_name }}</td>
                <td>{{ voter.email }}</td>
                <td>{{ voter.department }}</td>
                <td>
                  <span class="text-monospace small">{{ truncateAddress(voter.wallet_address) }}</span>
                </td>
                <td>
                  <span 
                    class="badge rounded-pill" 
                    :class="getStatusClass(voter.status)">
                    {{ voter.status }}
                  </span>
                </td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button 
                      v-if="voter.status === 'pending'"
                      @click="approveVoter(voter)" 
                      class="btn btn-success"
                      :disabled="voter.isProcessing">
                      <span v-if="voter.isProcessing" class="spinner-border spinner-border-sm" role="status"></span>
                      <i v-else class="fas fa-check"></i>
                    </button>
                    <button 
                      v-if="voter.status === 'pending'"
                      @click="rejectVoter(voter)" 
                      class="btn btn-danger"
                      :disabled="voter.isProcessing">
                      <i class="fas fa-times"></i>
                    </button>
                    <button 
                      v-if="voter.status === 'rejected'"
                      @click="approveVoter(voter)" 
                      class="btn btn-outline-success"
                      :disabled="voter.isProcessing">
                      <span v-if="voter.isProcessing" class="spinner-border spinner-border-sm" role="status"></span>
                      <i v-else class="fas fa-redo"></i>
                    </button>
                    <button 
                      v-if="voter.status === 'approved'"
                      @click="revokeVoter(voter)" 
                      class="btn btn-outline-danger"
                      :disabled="voter.isProcessing">
                      <i class="fas fa-ban"></i>
                    </button>
                    <button 
                      @click="viewVoterDetails(voter)" 
                      class="btn btn-outline-primary">
                      <i class="fas fa-eye"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Voter Details Modal -->
    <div v-if="showDetailsModal" class="modal-backdrop" @click="closeModal">
      <div class="modal-dialog" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Voter Details</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedVoter">
              <div class="mb-3">
                <strong>Student ID:</strong> {{ selectedVoter.student_id }}
              </div>
              <div class="mb-3">
                <strong>Full Name:</strong> {{ selectedVoter.full_name }}
              </div>
              <div class="mb-3">
                <strong>Email:</strong> {{ selectedVoter.email }}
              </div>
              <div class="mb-3">
                <strong>Department:</strong> {{ selectedVoter.department }}
              </div>
              <div class="mb-3">
                <strong>Wallet Address:</strong> 
                <div class="input-group mt-1">
                  <input 
                    type="text" 
                    class="form-control form-control-sm" 
                    :value="selectedVoter.wallet_address" 
                    readonly>
                  <button 
                    class="btn btn-outline-secondary btn-sm" 
                    @click="copyWalletAddress">
                    <i class="fas fa-copy"></i>
                  </button>
                </div>
              </div>
              <div class="mb-3">
                <strong>Registration Date:</strong> {{ formatDate(selectedVoter.created_at) }}
              </div>
              <div class="mb-3">
                <strong>Status:</strong> 
                <span 
                  class="badge rounded-pill" 
                  :class="getStatusClass(selectedVoter.status)">
                  {{ selectedVoter.status }}
                </span>
              </div>
              
              <div v-if="selectedVoter.votes && selectedVoter.votes.length > 0">
                <h6 class="mt-4 mb-3">Voting History</h6>
                <div class="list-group">
                  <div
                    v-for="vote in selectedVoter.votes"
                    :key="vote.id"
                    class="list-group-item list-group-item-action">
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{{ vote.election_title }}</strong>
                        <div class="text-muted small">{{ vote.position_title }}</div>
                      </div>
                      <div class="text-end">
                        <div>{{ vote.candidate_name }}</div>
                        <small class="text-muted">{{ formatDate(vote.timestamp) }}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <div class="btn-group w-100">
              <button 
                v-if="selectedVoter?.status === 'pending'"
                @click="approveVoter(selectedVoter)" 
                class="btn btn-success"
                :disabled="selectedVoter?.isProcessing">
                <span v-if="selectedVoter?.isProcessing" class="spinner-border spinner-border-sm me-2" role="status"></span>
                Approve Voter
              </button>
              <button 
                v-if="selectedVoter?.status === 'pending'"
                @click="rejectVoter(selectedVoter)" 
                class="btn btn-danger"
                :disabled="selectedVoter?.isProcessing">
                Reject Voter
              </button>
              <button 
                v-if="selectedVoter?.status === 'rejected'"
                @click="approveVoter(selectedVoter)" 
                class="btn btn-success"
                :disabled="selectedVoter?.isProcessing">
                Approve Voter
              </button>
              <button 
                v-if="selectedVoter?.status === 'approved'"
                @click="revokeVoter(selectedVoter)" 
                class="btn btn-danger"
                :disabled="selectedVoter?.isProcessing">
                Revoke Approval
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'
import contractService from '@/contracts/index'

export default {
  name: 'ManageVoters',
  data() {
    return {
      voters: [],
      isLoading: true,
      showDetailsModal: false,
      selectedVoter: null,
      filters: {
        status: '',
        department: '',
        search: ''
      },
      departments: [
        'Computer Science',
        'Engineering',
        'Business',
        'Arts & Humanities',
        'Sciences'
      ],
      stats: {
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0
      }
    }
  },
  computed: {
    filteredVoters() {
      return this.voters.filter(voter => {
        // Filter by status
        if (this.filters.status && voter.status !== this.filters.status) {
          return false
        }
        
        // Filter by department
        if (this.filters.department && voter.department !== this.filters.department) {
          return false
        }
        
        // Filter by search term
        if (this.filters.search) {
          const search = this.filters.search.toLowerCase()
          return voter.full_name.toLowerCase().includes(search) ||
                 voter.student_id.toLowerCase().includes(search) ||
                 voter.email.toLowerCase().includes(search) ||
                 voter.wallet_address.toLowerCase().includes(search)
        }
        
        return true
      })
    }
  },
  methods: {
    async fetchVoters() {
      try {
        this.isLoading = true
        const response = await api.getVoters()
        
        // Add isProcessing flag to each voter
        this.voters = response.data.map(voter => ({
          ...voter,
          isProcessing: false
        }))
        
        // Calculate stats
        this.calculateStats()
      } catch (error) {
        console.error('Error fetching voters:', error)
        alert('Failed to load voters. Please try again.')
      } finally {
        this.isLoading = false
      }
    },
    calculateStats() {
      this.stats = {
        total: this.voters.length,
        approved: this.voters.filter(v => v.status === 'approved').length,
        pending: this.voters.filter(v => v.status === 'pending').length,
        rejected: this.voters.filter(v => v.status === 'rejected').length
      }
    },
    getStatusClass(status) {
      if (status === 'approved') return 'bg-success'
      if (status === 'pending') return 'bg-warning'
      if (status === 'rejected') return 'bg-danger'
      return 'bg-secondary'
    },
    truncateAddress(address) {
      if (!address) return ''
      return address.substring(0, 6) + '...' + address.substring(address.length - 4)
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    getEmptyMessage() {
      if (this.filters.search) {
        return `No voters found matching "${this.filters.search}".`
      } else if (this.filters.department && this.filters.status) {
        return `No ${this.filters.status} voters found in the ${this.filters.department} department.`
      } else if (this.filters.department) {
        return `No voters found in the ${this.filters.department} department.`
      } else if (this.filters.status) {
        return `No ${this.filters.status} voters found.`
      } else {
        return 'No voters found in the system.'
      }
    },
    viewVoterDetails(voter) {
      this.selectedVoter = voter
      this.showDetailsModal = true
      
      // Fetch voting history for this voter
      this.fetchVoterVotes(voter)
    },
    async fetchVoterVotes(voter) {
      try {
        const response = await api.getVoterVotes(voter.id)
        this.selectedVoter = {
          ...this.selectedVoter,
          votes: response.data
        }
      } catch (error) {
        console.error('Error fetching voter votes:', error)
      }
    },
    copyWalletAddress() {
      if (!this.selectedVoter) return
      
      navigator.clipboard.writeText(this.selectedVoter.wallet_address)
        .then(() => {
          alert('Wallet address copied to clipboard')
        })
        .catch(err => {
          console.error('Could not copy text: ', err)
        })
    },
    async approveVoter(voter) {
      try {
        // Set processing flag
        voter.isProcessing = true
        
        // Call smart contract to whitelist voter
        await contractService.whitelistVoter(voter.wallet_address)
        
        // Update voter status in backend
        await api.updateVoterStatus(voter.id, 'approved')
        
        // Update in local state
        voter.status = 'approved'
        
        // Update stats
        this.calculateStats()
        
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
        
        // Update in local state
        voter.status = 'rejected'
        
        // Update stats
        this.calculateStats()
        
        // Show success message
        alert(`Voter ${voter.student_id} has been rejected`)
      } catch (error) {
        console.error('Error rejecting voter:', error)
        alert(`Failed to reject voter: ${error.message}`)
      } finally {
        voter.isProcessing = false
      }
    },
    async revokeVoter(voter) {
      try {
        if (!confirm(`Are you sure you want to revoke approval for ${voter.full_name}?`)) {
          return
        }
        
        // Set processing flag
        voter.isProcessing = true
        
        // Call smart contract to remove voter from whitelist
        await contractService.removeVoterFromWhitelist(voter.wallet_address)
        
        // Update voter status in backend
        await api.updateVoterStatus(voter.id, 'rejected')
        
        // Update in local state
        voter.status = 'rejected'
        
        // Update stats
        this.calculateStats()
        
        // Show success message
        alert(`Approval for voter ${voter.student_id} has been revoked`)
      } catch (error) {
        console.error('Error revoking voter approval:', error)
        alert(`Failed to revoke voter approval: ${error.message}`)
      } finally {
        voter.isProcessing = false
      }
    },
    exportVoters() {
      // Prepare data for export
      const exportData = this.filteredVoters.map(voter => ({
        'Student ID': voter.student_id,
        'Full Name': voter.full_name,
        'Email': voter.email,
        'Department': voter.department,
        'Wallet Address': voter.wallet_address,
        'Status': voter.status,
        'Registration Date': new Date(voter.created_at).toLocaleDateString()
      }))
      
      // Convert to CSV
      const headers = Object.keys(exportData[0]).join(',')
      const rows = exportData.map(row => Object.values(row).join(','))
      const csv = [headers, ...rows].join('\n')
      
      // Create download link
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.setAttribute('href', url)
      a.setAttribute('download', `voters_export_${new Date().toISOString().split('T')[0]}.csv`)
      a.click()
    },
    closeModal() {
      this.showDetailsModal = false
      this.selectedVoter = null
    }
  },
  mounted() {
    this.fetchVoters()
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-dialog {
  width: 100%;
  max-width: 600px;
  margin: 1.75rem auto;
}

.nav-tabs .nav-link {
  padding: 0.75rem 1.25rem;
}

.nav-tabs .nav-link.active {
  font-weight: bold;
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.empty-state {
  padding: 40px 0;
}

.empty-state i {
  opacity: 0.5;
}

.table td {
  vertical-align: middle;
}
</style>
