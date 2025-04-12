<template>
  <div class="election-details">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Loading election details...</p>
    </div>
    
    <div v-else-if="!election" class="alert alert-danger">
      Election not found or unable to load details.
    </div>
    
    <div v-else>
      <div class="election-header mb-4">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h1 class="mb-2">{{ election.title }}</h1>
            <div class="d-flex align-items-center">
              <span :class="statusClass" class="me-3">{{ formattedStatus }}</span>
              <span class="text-muted">
                {{ timeRemaining }}
              </span>
            </div>
          </div>
          
          <div v-if="election.contract_address" class="blockchain-badge">
            <i class="bi bi-link-45deg"></i>
            On Blockchain
            <a :href="'https://etherscan.io/address/' + election.contract_address" 
               target="_blank"
               class="ms-1 contract-link">
              {{ shortenAddress(election.contract_address) }}
              <i class="bi bi-box-arrow-up-right"></i>
            </a>
          </div>
        </div>
      </div>
      
      <div class="row">
        <div class="col-md-8">
          <div class="card mb-4">
            <div class="card-body">
              <h5 class="card-title">About this Election</h5>
              <p class="card-text">{{ election.description }}</p>
              
              <div class="election-dates mt-4">
                <div class="row">
                  <div class="col-md-6">
                    <div class="date-item">
                      <div class="date-label">Start Time:</div>
                      <div class="date-value">{{ formatDateTime(election.start_time) }}</div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="date-item">
                      <div class="date-label">End Time:</div>
                      <div class="date-value">{{ formatDateTime(election.end_time) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="positions.length > 0">
            <h3 class="mb-3">Positions & Candidates</h3>
            
            <div v-for="position in positions" :key="position.id" class="card mb-4 position-card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">{{ position.title }}</h5>
                <router-link 
                  v-if="election.status === 'voting' && canVote" 
                  :to="{ name: 'VotingBooth', params: { electionId: election.id, positionId: position.id } }"
                  class="btn btn-primary btn-sm">
                  Vote for this Position
                </router-link>
              </div>
              
              <div class="card-body">
                <p v-if="position.description">{{ position.description }}</p>
                
                <div v-if="position.candidates.length === 0" class="text-center py-3">
                  <p class="text-muted mb-0">No candidates for this position.</p>
                </div>
                
                <div v-else class="position-candidates">
                  <div class="row">
                    <div v-for="candidate in position.candidates" 
                         :key="candidate.id" 
                         class="col-md-6 mb-3">
                      <div class="candidate-summary d-flex align-items-center p-3 border rounded">
                        <div class="candidate-photo">
                          <img :src="getCandidateImage(candidate)" alt="Candidate Photo" class="img-fluid rounded">
                        </div>
                        <div class="candidate-info ms-3">
                          <h6 class="mb-1">{{ candidate.name }}</h6>
                          <div v-if="candidate.party_name" class="party-label">
                            {{ candidate.party_name }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="alert alert-info">
            No positions have been added to this election yet.
          </div>
        </div>
        
        <div class="col-md-4">
          <div class="card mb-4">
            <div class="card-body">
              <h5 class="card-title">Your Voting Status</h5>
              
              <div v-if="!$store.getters.getWeb3Account" class="mb-4">
                <div class="alert alert-warning">
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  You need to connect your MetaMask wallet to vote.
                </div>
                <MetaMaskButton 
                  :alreadyConnected="false" 
                  @connected="onWalletConnected" 
                  class="w-100"
                />
              </div>
              
              <div v-else-if="!$store.getters.getVoter?.is_whitelisted" class="alert alert-info">
                <i class="bi bi-info-circle me-2"></i>
                Your account is not yet whitelisted for voting. Please contact an administrator.
              </div>
              
              <div v-else>
                <div class="mb-3 status-item">
                  <div class="status-label">Wallet Connected:</div>
                  <div class="status-value text-success">
                    <i class="bi bi-check-circle-fill me-1"></i>
                    Yes
                  </div>
                </div>
                
                <div class="mb-3 status-item">
                  <div class="status-label">Wallet Address:</div>
                  <div class="status-value">
                    {{ shortenAddress($store.getters.getWeb3Account) }}
                  </div>
                </div>
                
                <div class="mb-3 status-item">
                  <div class="status-label">Whitelisted:</div>
                  <div class="status-value text-success">
                    <i class="bi bi-check-circle-fill me-1"></i>
                    Yes
                  </div>
                </div>
                
                <div v-if="election.status === 'voting'" class="mt-4">
                  <p class="mb-2">Ready to vote?</p>
                  <router-link 
                    v-if="positions.length > 0"
                    :to="{ name: 'VotingBooth', params: { electionId: election.id, positionId: positions[0].id } }"
                    class="btn btn-success w-100">
                    Start Voting Now
                  </router-link>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="election.status === 'closed'" class="card">
            <div class="card-body">
              <h5 class="card-title">Election Results</h5>
              <p>This election has ended. You can view the final results.</p>
              <router-link 
                :to="{ name: 'Results', params: { id: election.id } }"
                class="btn btn-primary w-100">
                View Results
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import apiService from '@/services/api';
import MetaMaskButton from '@/components/MetaMaskButton.vue';
import candidateImages from '@/constants/candidateImages';

export default {
  name: 'Election',
  components: {
    MetaMaskButton
  },
  props: {
    id: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      loading: true,
      election: null,
      positions: [],
      userVotes: []
    };
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'getWeb3Account',
      'getVoter'
    ]),
    formattedStatus() {
      const statusMap = {
        'init': 'Setup Phase',
        'voting': 'Voting Active',
        'closed': 'Election Closed'
      };
      return this.election ? statusMap[this.election.status] || this.election.status : '';
    },
    statusClass() {
      return `phase-indicator phase-${this.election?.status || 'init'}`;
    },
    timeRemaining() {
      if (!this.election) return '';
      
      const now = new Date();
      const endTime = new Date(this.election.end_time);
      const startTime = new Date(this.election.start_time);
      
      if (this.election.status === 'closed' || now > endTime) {
        return 'Election has ended';
      }
      
      if (now < startTime) {
        const diffInMs = startTime - now;
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const diffInHours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (diffInDays > 0) {
          return `Starts in ${diffInDays} days and ${diffInHours} hours`;
        } else {
          return `Starts in ${diffInHours} hours`;
        }
      } else {
        const diffInMs = endTime - now;
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const diffInHours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (diffInDays > 0) {
          return `${diffInDays} days and ${diffInHours} hours remaining`;
        } else {
          return `${diffInHours} hours remaining`;
        }
      }
    },
    canVote() {
      return this.isAuthenticated && 
             this.getWeb3Account && 
             this.getVoter?.is_whitelisted &&
             this.election?.status === 'voting';
    }
  },
  async created() {
    await this.fetchElectionData();
  },
  methods: {
    async fetchElectionData() {
      this.loading = true;
      try {
        // Load election details
        const response = await apiService.getElection(this.id);
        this.election = response.data;
        
        // Load positions
        const positionsResponse = await apiService.getPositions(this.id);
        this.positions = positionsResponse.data;
        
        // Load user votes if authenticated
        if (this.isAuthenticated) {
          try {
            const votesResponse = await apiService.getVotes();
            this.userVotes = votesResponse.data.filter(vote => vote.election === parseInt(this.id));
          } catch (error) {
            console.error('Error fetching user votes:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching election data:', error);
        this.$store.commit('setNotification', {
          message: 'Failed to load election details',
          type: 'danger'
        });
      } finally {
        this.loading = false;
      }
    },
    formatDateTime(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      }).format(date);
    },
    shortenAddress(address) {
      if (!address) return '';
      return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    },
    getCandidateImage(candidate) {
      // Use candidate photo_url if available, otherwise use a placeholder
      if (candidate.photo_url) {
        return candidate.photo_url;
      }
      
      // Use index based on candidate ID to select an image
      const imageIndex = (candidate.id % candidateImages.length);
      return candidateImages[imageIndex];
    },
    async onWalletConnected(account) {
      await this.$store.dispatch('connectWallet');
      // Refresh the page data
      this.fetchElectionData();
    }
  }
};
</script>

<style scoped>
.election-header {
  border-bottom: 1px solid #eee;
  padding-bottom: 1.5rem;
}

.election-dates {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
}

.date-item {
  margin-bottom: 10px;
}

.date-label {
  font-weight: 600;
  color: #555;
}

.date-value {
  color: #333;
}

.blockchain-badge {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 20px;
  padding: 5px 12px;
  color: #1890ff;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
}

.contract-link {
  color: #1890ff;
  text-decoration: none;
}

.contract-link:hover {
  text-decoration: underline;
}

.position-card {
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
}

.position-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.candidate-photo {
  width: 50px;
  height: 50px;
  border-radius: 25px;
  overflow: hidden;
  flex-shrink: 0;
}

.candidate-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.party-label {
  font-size: 0.8rem;
  color: #666;
}

.status-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.status-label {
  font-weight: 600;
  color: #555;
  margin-right: 10px;
  width: 140px;
}

.status-value {
  flex: 1;
}
</style>
