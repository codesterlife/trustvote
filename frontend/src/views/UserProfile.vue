<template>
  <div class="user-profile">
    <div class="profile-header mb-4">
      <h1>Your Profile</h1>
    </div>
    
    <div class="row">
      <!-- Profile Information -->
      <div class="col-lg-6 mb-4">
        <div class="card profile-card">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">Personal Information</h5>
          </div>
          <div class="card-body">
            <div v-if="isEditing">
              <form @submit.prevent="saveProfile">
                <div class="form-group mb-3">
                  <label for="firstName" class="form-label">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    v-model="editForm.firstName"
                    class="form-control"
                    required
                  >
                </div>
                
                <div class="form-group mb-3">
                  <label for="lastName" class="form-label">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    v-model="editForm.lastName"
                    class="form-control"
                    required
                  >
                </div>
                
                <div class="form-group mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    v-model="editForm.email"
                    class="form-control"
                    required
                  >
                </div>
                
                <div class="form-group mb-3">
                  <label for="studentId" class="form-label">Student ID</label>
                  <input
                    type="text"
                    id="studentId"
                    v-model="editForm.studentId"
                    class="form-control"
                    required
                  >
                </div>
                
                <div class="form-buttons mt-4">
                  <button type="submit" class="btn btn-primary me-2" :disabled="isSaving">
                    <i class="fas" :class="isSaving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                    {{ isSaving ? 'Saving...' : 'Save Changes' }}
                  </button>
                  <button type="button" @click="cancelEdit" class="btn btn-secondary">
                    <i class="fas fa-times"></i>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
            
            <div v-else>
              <div class="profile-info">
                <div class="info-item">
                  <div class="info-label">First Name:</div>
                  <div class="info-value">{{ currentUser.first_name }}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">Last Name:</div>
                  <div class="info-value">{{ currentUser.last_name }}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">Email:</div>
                  <div class="info-value">{{ currentUser.email }}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">Student ID:</div>
                  <div class="info-value">{{ currentUser.student_id || 'Not set' }}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">Account Type:</div>
                  <div class="info-value">
                    <span class="badge" :class="currentUser.is_admin ? 'bg-danger' : 'bg-success'">
                      {{ currentUser.is_admin ? 'Administrator' : 'Voter' }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="mt-4">
                <button @click="startEdit" class="btn btn-outline-primary">
                  <i class="fas fa-edit me-1"></i>
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Blockchain Information -->
      <div class="col-lg-6 mb-4">
        <div class="card profile-card">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">Blockchain Identity</h5>
          </div>
          <div class="card-body">
            <div class="blockchain-status mb-4">
              <div v-if="!isConnected" class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>MetaMask not connected.</strong> Please connect your wallet to participate in elections.
                <div class="mt-3">
                  <ConnectWallet />
                </div>
              </div>
              
              <div v-else class="wallet-info">
                <div class="info-item">
                  <div class="info-label">Wallet Address:</div>
                  <div class="info-value crypto-address">
                    {{ walletAddress }}
                    <button @click="copyWalletAddress" class="btn btn-sm btn-outline-secondary ms-2">
                      <i class="far fa-copy"></i>
                    </button>
                  </div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">Network:</div>
                  <div class="info-value">
                    <span class="badge" :class="getNetworkBadgeClass()">
                      {{ getNetworkName() }}
                    </span>
                  </div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">Account Status:</div>
                  <div class="info-value">
                    <span class="badge" :class="isWalletLinked ? 'bg-success' : 'bg-warning'">
                      {{ isWalletLinked ? 'Linked to Account' : 'Not Linked' }}
                    </span>
                  </div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">Voting Status:</div>
                  <div class="info-value">
                    <div v-if="whitelistedElections.length > 0">
                      <span class="badge bg-success">Whitelisted for the following elections:</span>
                      <ul class="mt-1">
                        <li v-for="election in whitelistedElections" :key="election.election">
                          {{ election.election_title }}
                        </li>
                      </ul>
                    </div>
                    <div v-else>
                      <span class="badge bg-warning">Not Whitelisted for any elections</span>
                    </div>
                  </div>
                </div>
                
                <div v-if="!isWalletLinked" class="mt-4">
                  <button @click="linkWallet" class="btn btn-primary" :disabled="isLinking">
                    <i class="fas me-1" :class="isLinking ? 'fa-spinner fa-spin' : 'fa-link'"></i>
                    {{ isLinking ? 'Linking...' : 'Link Wallet to Account' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Voting History -->
    <div class="row">
      <div class="col-12">
        <div class="card profile-card">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">Voting History</h5>
          </div>
          <div class="card-body">
            <div v-if="isLoadingHistory" class="text-center py-3">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2">Loading your voting history...</p>
            </div>
             
            <div v-else-if="votingHistory.length === 0" class="text-center py-3">
              <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                You have not participated in any elections yet.
              </div>
            </div>
            
            <div v-else>
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Election</th>
                      <th>Position</th>
                      <th>Candidate</th>
                      <th>Date</th>
                      <th class="text-center">Transaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="vote in votingHistory" :key="vote.id">
                      <td>{{ vote.election_title }}</td>
                      <td>{{ vote.position_title }}</td>
                      <td>{{ vote.candidate_name }}</td>
                      <td>{{ formatDateTime(vote.timestamp) }}</td>
                      <td class="text-center">
                        <span v-if="vote.transaction_hash" class="badge bg-light text-black">
                          <i class="fab fa-ethereum me-2"></i>
                          {{ vote.transaction_hash.slice(0, 8) + '...' + vote.transaction_hash.slice(-6) }}
                        </span>
                        <span v-else class="text-muted">
                          <i class="fas fa-times-circle me-1"></i>
                          Not available
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Notifications -->
    <div v-if="errorMessage" class="alert alert-danger mt-3">
      <i class="fas fa-exclamation-circle me-2"></i>
      {{ errorMessage }}
    </div>
    
    <div v-if="successMessage" class="alert alert-success mt-3">
      <i class="fas fa-check-circle me-2"></i>
      {{ successMessage }}
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import ConnectWallet from '@/components/ConnectWallet.vue'
import api from '@/services/api'

export default {
  name: 'UserProfile',
  components: {
    ConnectWallet
  },
  data() {
    return {
      isEditing: false,
      isSaving: false,
      isLinking: false,
      isLoadingHistory: false,
      errorMessage: '',
      successMessage: '',
      editForm: {
        firstName: '',
        lastName: '',
        email: '',
        studentId: ''
      },
      votingHistory: [],
      whitelistedElections: []
    }
  },
  computed: {
    ...mapGetters(['isConnected', 'walletAddress', 'networkId']),
    ...mapState({
      currentUser: state => state.user
    }),
    isWalletLinked() {
      return this.currentUser && 
             this.currentUser.wallet_address && 
             this.walletAddress && 
             this.currentUser.wallet_address.toLowerCase() === this.walletAddress.toLowerCase()
    }
  },
  methods: {
    startEdit() {
      this.editForm = {
        firstName: this.currentUser.first_name,
        lastName: this.currentUser.last_name,
        email: this.currentUser.email,
        studentId: this.currentUser.student_id || ''
      }
      this.isEditing = true
      this.clearMessages()
    },
    cancelEdit() {
      this.isEditing = false
      this.clearMessages()
    },
    async saveProfile() {
      this.clearMessages()
      this.isSaving = true
      
      try {
        const userData = {
          first_name: this.editForm.firstName,
          last_name: this.editForm.lastName,
          email: this.editForm.email,
          student_id: this.editForm.studentId
        }
        
        // Call API to update user profile
        const response = await api.updateProfile(userData)
        
        // Update store with new user data
        this.$store.commit('SET_USER', response.data)
        
        this.successMessage = 'Profile updated successfully'
        this.isEditing = false
      } catch (error) {
        console.error('Error updating profile:', error)
        this.errorMessage = error.response?.data?.error || 'Failed to update profile'
      } finally {
        this.isSaving = false
      }
    },
    async linkWallet() {
      if (!this.isConnected || !this.walletAddress) {
        this.errorMessage = 'Please connect your MetaMask wallet first'
        return
      }
      
      this.clearMessages()
      this.isLinking = true
      
      try {
        // Call API to update wallet address for current user
        await api.updateWallet({ wallet_address: this.walletAddress })
        
        // Refresh user data
        const response = await api.getCurrentUser()
        this.$store.commit('SET_USER', response.data)
        
        this.successMessage = 'Wallet linked to your account successfully'
      } catch (error) {
        console.error('Failed to link wallet to account:', error)
        this.errorMessage = error.response?.data?.error || 'Failed to link wallet to your account'
      } finally {
        this.isLinking = false
      }
    },
    getNetworkName() {
      const networks = {
        1: 'Ethereum Mainnet',
        3: 'Ropsten Testnet',
        4: 'Rinkeby Testnet',
        5: 'Goerli Testnet',
        42: 'Kovan Testnet',
        1337: 'Local Ganache'
      }
      return networks[this.networkId] || `Network ID: ${this.networkId}`
    },
    getNetworkBadgeClass() {
      // Ganache or testnets are fine for development
      const testNets = [3, 4, 5, 42, 1337]
      return testNets.includes(this.networkId) 
        ? 'bg-info' 
        : (this.networkId === 1 ? 'bg-success' : 'bg-warning')
    },
    async loadVotingHistory() {
      this.isLoadingHistory = true
      
      try {
        // Get the user's voting history from the API
        const response = await api.getUserVotes()
        this.votingHistory = response.data
        console.log("Voting History: ", this.votingHistory)
      } catch (error) {
        console.error('Error loading voting history:', error)
        this.errorMessage = 'Failed to load your voting history'
      } finally {
        this.isLoadingHistory = false
      }
    },
    copyWalletAddress() {
      navigator.clipboard.writeText(this.walletAddress).then(() => {
        this.successMessage = 'Wallet address copied to clipboard'
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          if (this.successMessage === 'Wallet address copied to clipboard') {
            this.successMessage = ''
          }
        }, 3000)
      })
    },
    formatDateTime(dateTimeStr) {
      const date = new Date(dateTimeStr)
      return date.toLocaleString()
    },
    clearMessages() {
      this.errorMessage = ''
      this.successMessage = ''
    },
    async loadWhitelistedElections() {
      try {
        const response = await api.getVoterElectionWhitelist()
        this.whitelistedElections = response.data.filter(
          item => item.is_whitelisted && item.voter_name === this.currentUser.username
        )
      } catch (error) {
        console.error('Error fetching whitelisted elections:', error)
        this.errorMessage = 'Failed to load whitelisted elections'
      }
    },
  },
  async created() {
    // Load user voting history
    await this.loadVotingHistory()
    await this.loadWhitelistedElections()
  }
}
</script>

<style scoped>
.profile-header {
  padding-bottom: 15px;
  border-bottom: 1px solid #e7e7e7;
}

.profile-card {
  border: none;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.info-item {
  display: flex;
  margin-bottom: 15px;
  align-items: center;
}

.info-label {
  font-weight: bold;
  width: 120px;
  color: #495057;
}

.info-value {
  flex-grow: 1;
}

.crypto-address {
  font-family: monospace;
  font-size: 0.9rem;
  word-break: break-all;
}

.badge {
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
}

.wallet-info {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  background-color: #f8f9fa;
}
</style>