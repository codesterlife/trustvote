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
                <th class="text-center">Actions</th>
                <th class="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="voter in filteredVoters" :key="voter.id">
                <td>{{ voter.first_name }} {{ voter.last_name }}</td>
                <td>{{ voter.student_id}}</td>
                <td>{{ voter.email }}</td>
                <td class="wallet-address">
                  <span v-if="voter.wallet_address" class="badge bg-light text-black">
                    <i class="fab fa-ethereum me-2"></i>
                    {{ truncateAddress(voter.wallet_address) }}
                  </span>
                  <span v-else class="text-muted">
                    <i class="fas fa-exclamation-circle me-1"></i>
                    Not connected
                  </span>
                </td>
                <td class="text-center">
                  <button 
                    @click="whitelistVoter(voter)" 
                    class="btn btn-sm btn-success me-1"
                    :disabled="isProcessing"
                  >
                    <i class="fas" :class="isProcessing ? 'fa-spinner fa-spin' : 'fa-plus'"></i>
                    Whitelist
                  </button>
                </td>
                <td class="text-center">
                  <div v-if="whitelistedElections[voter.id] && whitelistedElections[voter.id].length > 0">
                    <span class="badge bg-success">Whitelisted for: 
                      <span v-for="election in whitelistedElections[voter.id]" :key="election" class="badge bg-light text-black me-1">
                        <!-- {{ whitelistedElections[voter.id].length > 1 ? election + ', ' : election }} -->
                          {{ election }}&nbsp;
                      </span>
                    </span>
                  </div>
                  <div v-else>
                    <span class="badge bg-warning">Not Whitelisted for any election. </span>
                  </div>
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
                <label for="electionDropdown" class="form-label">
                  <span v-if="isVoterInElectoralRoll" class="badge bg-success ms-2">Voter verified in Electoral Roll</span>
                  <span v-else-if="!isVoterInElectoralRoll" class="badge bg-danger ms-2">Voter not present in Electoral Roll. Contact Election Officials.</span>
                </label>      
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
                <div v-if="!isVoterInElectoralRoll && whitelistForm.electionId" class="alert alert-warning">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  This voter must be verified in the Electoral Roll before they can be whitelisted. Please contact Election Officials.
                </div>
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
                <button type="submit" class="btn btn-primary" :disabled="whitelistForm.isSubmitting || !isVoterInElectoralRoll" :title="!isVoterInElectoralRoll ? 'Voter must be verified in Electoral Roll' : ''">
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
import api from '@/services/api'

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
      isVerified: false,
      whitelistModal: null,
      whitelistedElections: [],
      selectedElectionId: '',
      electoralRoll: [],
      selectedVoter: null, // for modal
    }
  },
  watch: {
    async 'whitelistForm.electionId'(newElectionId) {
      if (!newElectionId || !this.selectedVoter?.student_id) {
        this.isVerified = false;
        return;
      }

      try {
        const response = await api.checkElectoralRoll(
          newElectionId,
          this.selectedVoter.student_id
        );
        
        console.log('Electoral roll verification response:', response);
        this.isVerified = response.data?.isVerified || false;
        
        if (this.isVerified) {
          this.whitelistForm.error = '';
        }
      } catch (error) {
        console.error('Error checking electoral roll:', error);
        this.isVerified = false;
      }
    }
  },
  computed: {
    filteredVoters() {
      if (!this.searchTerm) return this.voters
      const searchLower = this.searchTerm.toLowerCase()
      return this.voters.filter(voter => !voter.is_admin).filter(voter => 
        voter.name.toLowerCase().includes(searchLower) ||
        voter.email.toLowerCase().includes(searchLower) ||
        voter.studentId.toLowerCase().includes(searchLower) ||
        (voter.walletAddress && voter.walletAddress.toLowerCase().includes(searchLower))
      )
    },
    isVoterInElectoralRoll() {
      return this.isVerified;
    }
  },
  methods: {
    truncateAddress(address) {
      if (!address) return ''
      return address.slice(0, 6) + '...' + address.slice(-4)
    },
    async loadWhitelistedElections() {
      try {
        const response = await api.getVoterElectionWhitelist()
        // Group whitelist data by voter ID
        response.data.forEach(item => {
          if (item.is_whitelisted) {
            if (!this.whitelistedElections[item.voter]) {
              this.whitelistedElections[item.voter] = []
            }
            this.whitelistedElections[item.voter].push(item.election_title)
          }
        })
      } catch (error) {
        console.error('Error fetching whitelisted elections:', error)
      }
    },
    async fetchElectoralRoll(electionId) {
      try {
        // Use your Vuex action or API directly
        const data = await this.$store.dispatch('fetchElectoralRoll', electionId)
        this.electoralRoll = data
      } catch (error) {
        this.electoralRoll = []
        console.error('Failed to fetch electoral roll:', error)
      }
    },
    showWhitelistModal(voter = null) {
      this.resetWhitelistForm()
      if (voter && voter.wallet_address){
        this.whitelistForm.voterAddress = voter.wallet_address
      }
      this.whitelistModal = new bootstrap.Modal(document.getElementById('whitelistModal'))
      this.whitelistModal.show()
      this.selectedVoter = voter
      // Reset verification status when modal opens
      this.isVerified = false;
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
    },
    async whitelistVoter(voter) {
      if (!voter.wallet_address) return
      this.showWhitelistModal(voter) // Open modal and pre-fill address
    }
  },
  async created() {
    await this.loadWhitelistedElections() // Load whitelist data on component creation
  }
}

</script>

<style scoped>
.wallet-address {
  font-family: monospace;
  font-size: 0.9rem;
}
</style>
  