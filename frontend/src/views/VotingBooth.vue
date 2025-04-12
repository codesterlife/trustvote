<template>
  <div class="voting-booth">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Loading voting booth...</p>
    </div>
    
    <div v-else-if="transactionPending" class="text-center py-5">
      <div class="transaction-processing">
        <div class="loader"></div>
        <h3 class="mt-3">Processing Your Vote</h3>
        <p class="text-muted">Your vote is being recorded on the blockchain. Please do not close this window.</p>
        <div class="transaction-status transaction-pending mt-4">
          <i class="bi bi-hourglass-split me-2"></i>
          Transaction pending. This may take a few moments...
        </div>
      </div>
    </div>
    
    <div v-else-if="voteConfirmed" class="vote-confirmation-container">
      <VoteConfirmation
        :electionId="electionId"
        :electionTitle="election?.title || ''"
        :positionTitle="position?.title || ''"
        :candidateName="selectedCandidate?.name || ''"
        :transactionHash="transactionHash"
        :timestamp="new Date()"
      />
    </div>
    
    <div v-else-if="!isWalletConnected" class="wallet-connection-required text-center py-5">
      <i class="bi bi-wallet2 wallet-icon"></i>
      <h3 class="mt-3">MetaMask Wallet Required</h3>
      <p class="mb-4">You need to connect your MetaMask wallet to cast a vote.</p>
      <MetaMaskButton 
        :alreadyConnected="false" 
        @connected="onWalletConnected" 
      />
    </div>
    
    <div v-else-if="!voter?.is_whitelisted" class="not-whitelisted text-center py-5">
      <i class="bi bi-shield-lock wallet-icon"></i>
      <h3 class="mt-3">Account Not Whitelisted</h3>
      <p>Your account is not whitelisted for voting in this election.</p>
      <p class="mb-4">Please contact an administrator to verify your account.</p>
      <router-link :to="{ name: 'Home' }" class="btn btn-primary">
        Return to Home
      </router-link>
    </div>
    
    <div v-else-if="hasAlreadyVoted" class="already-voted text-center py-5">
      <i class="bi bi-check-circle-fill already-voted-icon"></i>
      <h3 class="mt-3">You've Already Voted</h3>
      <p>You have already cast your vote for this position in the election.</p>
      
      <div class="mt-4">
        <router-link 
          v-if="nextPosition"
          :to="{ name: 'VotingBooth', params: { electionId: electionId, positionId: nextPosition.id } }"
          class="btn btn-primary me-3">
          Vote for Next Position
        </router-link>
        
        <router-link :to="{ name: 'Election', params: { id: electionId } }" class="btn btn-outline-secondary">
          Return to Election
        </router-link>
      </div>
    </div>
    
    <div v-else>
      <div class="voting-header mb-4">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h1 class="mb-2">Cast Your Vote</h1>
            <div class="election-info">
              <span class="election-title">{{ election?.title }}</span>
              <span class="position-title">{{ position?.title }}</span>
            </div>
          </div>
          
          <div v-if="positions.length > 1" class="position-navigation">
            <div class="position-counter">
              Position {{ currentPositionIndex + 1 }} of {{ positions.length }}
            </div>
            <div class="btn-group">
              <button 
                @click="navigatePosition(-1)" 
                class="btn btn-sm btn-outline-primary"
                :disabled="currentPositionIndex === 0">
                <i class="bi bi-arrow-left"></i> Previous
              </button>
              <button 
                @click="navigatePosition(1)" 
                class="btn btn-sm btn-outline-primary"
                :disabled="currentPositionIndex === positions.length - 1">
                Next <i class="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="row">
        <div class="col-md-8">
          <div class="voting-instructions alert alert-info mb-4">
            <i class="bi bi-info-circle-fill me-2"></i>
            Select a candidate below and click "Cast Vote" to record your vote on the blockchain.
            Your vote will be securely stored and cannot be changed once submitted.
          </div>
          
          <div v-if="candidates.length === 0" class="alert alert-warning">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            No candidates are available for this position.
          </div>
          
          <div v-else>
            <div class="candidates-list">
              <div class="row">
                <div v-for="candidate in candidates" :key="candidate.id" class="col-md-6 mb-4">
                  <div 
                    class="candidate-card"
                    :class="{ 'selected': selectedCandidateId === candidate.id }"
                    @click="selectCandidate(candidate.id)">
                    <div class="candidate-photo">
                      <img :src="getCandidateImage(candidate)" alt="Candidate Photo" class="img-fluid rounded">
                    </div>
                    <div class="candidate-details">
                      <h4 class="candidate-name">{{ candidate.name }}</h4>
                      <div v-if="candidate.party_name" class="candidate-party">
                        {{ candidate.party_name }}
                      </div>
                    </div>
                    <div class="selection-indicator">
                      <i class="bi bi-check-circle-fill"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mt-4 d-flex justify-content-center">
              <button 
                @click="castVote" 
                class="btn btn-lg btn-success" 
                :disabled="!selectedCandidateId">
                Cast Your Vote
              </button>
            </div>
          </div>
        </div>
        
        <div class="col-md-4">
          <div class="card voting-sidebar">
            <div class="card-body">
              <h5 class="card-title">Your Voting Information</h5>
              
              <div class="voting-status">
                <div class="status-item">
                  <div class="status-label"><i class="bi bi-person-fill me-2"></i>Voter:</div>
                  <div class="status-value">{{ voter?.user?.username }}</div>
                </div>
                
                <div class="status-item">
                  <div class="status-label"><i class="bi bi-wallet2 me-2"></i>Wallet:</div>
                  <div class="status-value">{{ shortenAddress(web3Account) }}</div>
                </div>
                
                <div class="status-item">
                  <div class="status-label"><i class="bi bi-shield-check me-2"></i>Status:</div>
                  <div class="status-value text-success">
                    Verified and Whitelisted
                  </div>
                </div>
              </div>
              
              <hr>
              
              <div class="positions-progress">
                <h6>Election Progress</h6>
                <div class="progress-tracker">
                  <div v-for="(pos, index) in positions" :key="pos.id" class="position-item">
                    <div 
                      class="position-indicator" 
                      :class="{
                        'current': pos.id === parseInt(positionId),
                        'completed': hasVotedForPosition(pos.id)
                      }"
                      @click="navigateToPosition(pos.id)">
                      {{ index + 1 }}
                    </div>
                    <div class="position-label">{{ pos.title }}</div>
                  </div>
                </div>
              </div>
              
              <div class="mt-4 text-center">
                <router-link :to="{ name: 'Election', params: { id: electionId } }" class="btn btn-outline-secondary">
                  <i class="bi bi-arrow-left me-2"></i> Back to Election
                </router-link>
              </div>
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
import web3Service from '@/services/web3';
import MetaMaskButton from '@/components/MetaMaskButton.vue';
import VoteConfirmation from '@/components/VoteConfirmation.vue';
import candidateImages from '@/constants/candidateImages';

export default {
  name: 'VotingBooth',
  components: {
    MetaMaskButton,
    VoteConfirmation
  },
  props: {
    electionId: {
      type: [Number, String],
      required: true
    },
    positionId: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      loading: true,
      election: null,
      position: null,
      positions: [],
      candidates: [],
      selectedCandidateId: null,
      userVotes: [],
      transactionPending: false,
      voteConfirmed: false,
      transactionHash: '',
      selectedCandidate: null
    };
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'getWeb3Account',
      'getVoter'
    ]),
    isWalletConnected() {
      return !!this.getWeb3Account;
    },
    web3Account() {
      return this.getWeb3Account;
    },
    voter() {
      return this.getVoter;
    },
    hasAlreadyVoted() {
      return this.userVotes.some(vote => 
        vote.position === parseInt(this.positionId) && 
        vote.election === parseInt(this.electionId)
      );
    },
    currentPositionIndex() {
      return this.positions.findIndex(pos => pos.id === parseInt(this.positionId));
    },
    nextPosition() {
      const nextIndex = this.currentPositionIndex + 1;
      return nextIndex < this.positions.length ? this.positions[nextIndex] : null;
    }
  },
  async created() {
    if (!this.isAuthenticated) {
      this.$router.push('/login');
      return;
    }
    
    await this.fetchVotingData();
  },
  methods: {
    async fetchVotingData() {
      this.loading = true;
      try {
        // Load election details
        const electionResponse = await apiService.getElection(this.electionId);
        this.election = electionResponse.data;
        
        if (this.election.status !== 'voting') {
          this.$store.commit('setNotification', {
            message: 'This election is not currently in the voting phase',
            type: 'warning'
          });
          this.$router.push(`/election/${this.electionId}`);
          return;
        }
        
        // Load all positions for this election
        const positionsResponse = await apiService.getPositions(this.electionId);
        this.positions = positionsResponse.data;
        
        // Load current position details
        this.position = this.positions.find(pos => pos.id === parseInt(this.positionId));
        
        if (!this.position) {
          throw new Error('Position not found');
        }
        
        // Load candidates for this position
        const candidatesResponse = await apiService.getCandidates({ position: this.positionId });
        this.candidates = candidatesResponse.data;
        
        // Load user votes
        const votesResponse = await apiService.getVotes();
        this.userVotes = votesResponse.data.filter(vote => 
          vote.election === parseInt(this.electionId)
        );
        
      } catch (error) {
        console.error('Error fetching voting data:', error);
        this.$store.commit('setNotification', {
          message: 'Failed to load voting information',
          type: 'danger'
        });
        this.$router.push('/');
      } finally {
        this.loading = false;
      }
    },
    selectCandidate(candidateId) {
      this.selectedCandidateId = candidateId;
      this.selectedCandidate = this.candidates.find(c => c.id === candidateId);
    },
    async castVote() {
      if (!this.selectedCandidateId || !this.isWalletConnected) {
        return;
      }
      
      this.transactionPending = true;
      
      try {
        // Get the election contract address
        const electionAddress = this.election.contract_address;
        
        if (!electionAddress) {
          throw new Error('Election contract address not found');
        }
        
        // TODO: In a real implementation, we would need to load the contract ABI
        // For demo purposes, assume we have the ABI
        const electionContract = await web3Service.getElection(electionAddress, 'electionABI');
        
        // Cast vote on blockchain
        const txHash = await this.$store.dispatch('castVote', {
          electionId: this.electionId,
          positionId: this.positionId,
          candidateId: this.selectedCandidateId,
          electionContract
        });
        
        if (txHash) {
          this.transactionHash = txHash;
          this.voteConfirmed = true;
        } else {
          throw new Error('Transaction failed');
        }
      } catch (error) {
        console.error('Voting error:', error);
        this.$store.commit('setNotification', {
          message: `Voting failed: ${error.message || 'Unknown error'}`,
          type: 'danger'
        });
        this.transactionPending = false;
      }
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
    shortenAddress(address) {
      if (!address) return '';
      return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    },
    navigatePosition(step) {
      const newIndex = this.currentPositionIndex + step;
      if (newIndex >= 0 && newIndex < this.positions.length) {
        this.$router.push({
          name: 'VotingBooth',
          params: {
            electionId: this.electionId,
            positionId: this.positions[newIndex].id
          }
        });
      }
    },
    navigateToPosition(positionId) {
      this.$router.push({
        name: 'VotingBooth',
        params: {
          electionId: this.electionId,
          positionId
        }
      });
    },
    hasVotedForPosition(positionId) {
      return this.userVotes.some(vote => vote.position === positionId);
    },
    async onWalletConnected(account) {
      await this.$store.dispatch('connectWallet');
      await this.fetchVotingData();
    }
  },
  watch: {
    positionId() {
      this.fetchVotingData();
      this.selectedCandidateId = null;
      this.voteConfirmed = false;
      this.transactionPending = false;
    }
  }
};
</script>

<style scoped>
.voting-booth {
  margin-top: 2rem;
}

.voting-header {
  border-bottom: 1px solid #eee;
  padding-bottom: 1.5rem;
  margin-bottom: 2rem;
}

.election-info {
  display: flex;
  align-items: center;
  color: #666;
}

.election-title {
  font-weight: 500;
}

.election-title::after {
  content: '•';
  margin: 0 8px;
}

.position-title {
  font-style: italic;
}

.position-navigation {
  text-align: right;
}

.position-counter {
  color: #666;
  margin-bottom: 5px;
}

.voting-instructions {
  border-left: 4px solid #1890ff;
}

.candidate-card {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 2px solid #eee;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.candidate-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border-color: #a0d7ff;
}

.candidate-card.selected {
  border-color: #1890ff;
  background-color: #e6f7ff;
}

.candidate-photo {
  width: 80px;
  height: 80px;
  border-radius: 40px;
  overflow: hidden;
  margin-right: 15px;
}

.candidate-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.candidate-details {
  flex: 1;
}

.candidate-name {
  font-weight: 600;
  margin-bottom: 5px;
}

.candidate-party {
  color: #666;
  font-size: 0.9rem;
}

.selection-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  color: #1890ff;
  font-size: 1.5rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.candidate-card.selected .selection-indicator {
  opacity: 1;
}

.voting-sidebar {
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.voting-status {
  margin: 1rem 0;
}

.status-item {
  display: flex;
  margin-bottom: 10px;
}

.status-label {
  font-weight: 600;
  color: #555;
  width: 80px;
}

.status-value {
  flex: 1;
}

.progress-tracker {
  margin-top: 15px;
}

.position-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.position-indicator {
  width: 30px;
  height: 30px;
  border-radius: 15px;
  background-color: #eee;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  cursor: pointer;
  font-weight: 600;
  border: 2px solid transparent;
}

.position-indicator.current {
  background-color: #1890ff;
  color: white;
}

.position-indicator.completed {
  background-color: #52c41a;
  color: white;
}

.position-indicator:hover {
  border-color: #1890ff;
}

.position-label {
  flex: 1;
  font-size: 0.9rem;
}

.transaction-processing {
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  background-color: white;
  max-width: 600px;
  margin: 0 auto;
}

.wallet-icon, .already-voted-icon {
  font-size: 4rem;
  color: #1890ff;
  margin-bottom: 1rem;
}

.already-voted-icon {
  color: #52c41a;
}

.vote-confirmation-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
</style>
