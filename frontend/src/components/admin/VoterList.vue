<template>
  <div class="voter-list">
    <div class="card">
      <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Registered Voters</h5>
        <div class="d-flex align-items-center">
          <div class="input-group me-2">
            <input 
              type="text" 
              class="form-control form-control-sm" 
              placeholder="Search voters..." 
              v-model="searchTerm"
            >
            <button class="btn btn-light btn-sm">
              <i class="fas fa-search"></i>
            </button>
          </div>
          <button @click="showWhitelistModal" class="btn btn-light btn-sm">
            <i class="fas fa-plus me-1"></i>
            Whitelist Voter
          </button>
        </div>
      </div>
      <div class="card-body p-0">
        <div v-if="isLoading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Loading voters...</p>
        </div>
        
        <div v-else-if="filteredVoters.length === 0" class="text-center py-4">
          <div class="alert alert-info m-3">
            <i class="fas fa-info-circle me-2"></i>
            No voters found.
          </div>
        </div>
        
        <div v-else class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Student ID</th>
                <th>Email</th>
                <th>Ethereum Address</th>
                <th class="text-center">Status</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="voter in filteredVoters" :key="voter.id">
                <td>{{ voter.name }}</td>
                <td>{{ voter.studentId }}</td>
                <td>{{ voter.email }}</td>
                <td class="wallet-address">
                  <span v-if="voter.walletAddress">
                    {{ truncateAddress(voter.walletAddress) }}
                  </span>
                  <span v-else class="text-muted">
                    <i class="fas fa-exclamation-circle me-1"></i>
                    Not connected
                  </span>
                </td>
                <td class="text-center">
                  <span 
                    class="badge"
                    :class="voter.isWhitelisted ? 'bg-success' : 'bg-warning'"
                  >
                    {{ voter.isWhitelisted ? 'Whitelisted' : 'Pending' }}
                  </span>
                </td>
                <td class="text-center">
                  <button 
                    v-if="!voter.isWhitelisted && voter.walletAddress" 
                    @click="whitelistVoter(voter)" 
                    class="btn btn-sm btn-success me-1"
                    :disabled="isProcessing"
                  >
                    <i class="fas" :class="isProcessing ? 'fa-spinner fa-spin' : 'fa-check'"></i>
                    Whitelist
                  </button>
                  <button class="btn btn-sm btn-info">
                    <i class="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Whitelist Modal -->
    <div class="modal fade" id="whitelistModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Whitelist Voter</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleWhitelistSubmit">
              <div class="mb-3">
                <label for="voterAddress" class="form-label">Voter's Ethereum Address*</label>
                <input
                  type="text"
                  id="voterAddress"
                  v-model="whitelistForm.voterAddress"
                  class="form-control"
                  :class="{ 'is-invalid': whitelistForm.error }"
                  placeholder="0x..."
                  required
                >
                <div v-if="whitelistForm.error" class="invalid-feedback">
                  {{ whitelistForm.error }}
                </div>
              </div>
              
              <div class="mb-3">
                <label for="electionId" class="form-label">Election*</label>
                <select
                  id="electionId"
                  v-model="whitelistForm.electionId"
                  class="form-select"
                  :class="{ 'is-invalid': whitelistForm.electionError }"
                  required
                >
                  <option value="">-- Select Election --</option>
                  <option v-for="election in elections" :key="election.electionId" :value="election.electionId">
                    {{ election.title }}
                  </option>
                </select>
                <div v-if="whitelistForm.electionError" class="invalid-feedback">
                  {{ whitelistForm.electionError }}
                </div>
              </div>
              
              <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                Whitelisting a voter will add their address to the smart contract's approved voters list.
              </div>
              
              <div class="d-flex justify-content-end">
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="whitelistForm.isSubmitting">
                  <i class="fas" :class="whitelistForm.isSubmitting ? 'fa-spinner fa-spin' : 'fa-check'"></i>
                  {{ whitelistForm.isSubmitting ? 'Processing...' : 'Whitelist Voter' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VoterList',
  props: {
    voters: {
      type: Array,
      required: true
    },
    elections: {
      type: Array,
      required: true
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      searchTerm: '',
      isProcessing: false,
      whitelistForm: {
        voterAddress: '',
        electionId: '',
        error: '',
        electionError: '',
        isSubmitting: false
      },
      whitelistModal: null
    }
  },
  computed: {
    filteredVoters() {
      if (!this.searchTerm) return this.voters
      
      const searchLower = this.searchTerm.toLowerCase()
      return this.voters.filter(voter => 
        voter.name.toLowerCase().includes(searchLower) ||
        voter.email.toLowerCase().includes(searchLower) ||
        voter.studentId.toLowerCase().includes(searchLower) ||
        (voter.walletAddress && voter.walletAddress.toLowerCase().includes(searchLower))
      )
    }
  },
  methods: {
    truncateAddress(address) {
      if (!address) return ''
      return address.slice(0, 6) + '...' + address.slice(-4)
    },
    async whitelistVoter(voter) {
      if (!voter.walletAddress) return
      
      this.isProcessing = true
      try {
        await this.$emit('whitelist', { 
          electionId: this.elections[0]?.electionId, // Default to first election
          voterAddress: voter.walletAddress
        })
      } catch (error) {
        console.error('Error whitelisting voter:', error)
      } finally {
        this.isProcessing = false
      }
    },
    showWhitelistModal() {
      this.resetWhitelistForm()
      this.whitelistModal = new bootstrap.Modal(document.getElementById('whitelistModal'))
      this.whitelistModal.show()
    },
    resetWhitelistForm() {
      this.whitelistForm = {
        voterAddress: '',
        electionId: '',
        error: '',
        electionError: '',
        isSubmitting: false
      }
    },
    validateWhitelistForm() {
      this.whitelistForm.error = ''
      this.whitelistForm.electionError = ''
      
      if (!this.whitelistForm.voterAddress) {
        this.whitelistForm.error = 'Ethereum address is required'
        return false
      }
      
      if (!/^0x[a-fA-F0-9]{40}$/.test(this.whitelistForm.voterAddress)) {
        this.whitelistForm.error = 'Invalid Ethereum address format'
        return false
      }
      
      if (!this.whitelistForm.electionId) {
        this.whitelistForm.electionError = 'Please select an election'
        return false
      }
      
      return true
    },
    async handleWhitelistSubmit() {
      if (!this.validateWhitelistForm()) return
      
      this.whitelistForm.isSubmitting = true
      
      try {
        await this.$emit('whitelist', {
          electionId: this.whitelistForm.electionId,
          voterAddress: this.whitelistForm.voterAddress
        })
        
        // Close modal on success
        this.whitelistModal.hide()
        this.resetWhitelistForm()
      } catch (error) {
        console.error('Error whitelisting voter:', error)
        this.whitelistForm.error = 'Failed to whitelist voter: ' + (error.message || 'Unknown error')
      } finally {
        this.whitelistForm.isSubmitting = false
      }
    }
  }
}
</script>

<style scoped>
.wallet-address {
  font-family: monospace;
  font-size: 0.9rem;
}
</style>
