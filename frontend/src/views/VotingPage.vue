<template>
  <div class="voting-page">
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading voting information...</p>
    </div>
    
    <div v-else-if="!election" class="alert alert-danger">
      <i class="fas fa-exclamation-circle me-2"></i>
      Election not found or has been removed.
    </div>
    
    <div v-else-if="!isConnected" class="alert alert-warning mb-4">
      <i class="fas fa-exclamation-triangle me-2"></i>
      <strong>MetaMask not connected.</strong> Please connect your wallet to vote.
      <div class="mt-3">
        <ConnectWallet />
      </div>
    </div>
    
    <div v-else-if="election.status !== 'Voting'" class="alert alert-info">
      <i class="fas fa-info-circle me-2"></i>
      This election is not currently open for voting.
      <div v-if="election.status === 'Init'" class="mt-2">
        Voting has not started yet. It will begin on {{ formatDateTime(election.startTime) }}.
      </div>
      <div v-else-if="election.status === 'Closed'" class="mt-2">
        Voting has ended on {{ formatDateTime(election.endTime) }}.
        <router-link :to="`/elections/${electionId}/results`" class="btn btn-primary mt-3">
          View Results
        </router-link>
      </div>
    </div>
    
    <div v-else-if="showConfirmation" class="vote-confirmation-container">
      <VoteConfirmation 
        :transaction="confirmationData.transaction"
        :election="election"
        :positionId="confirmationData.positionId"
        :candidateId="confirmationData.candidateId"
        :networkId="networkId"
      />
    </div>
    
    <div v-else>
      <!-- Election Voting Information -->
      <div class="voting-header mb-4">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h1>Vote: {{ election.title }}</h1>
            <p class="lead">Cast your vote for the following positions</p>
          </div>
          <span class="timer-badge">
            <i class="fas fa-hourglass-half me-2"></i>
            Ends in: {{ timeRemaining }}
          </span>
        </div>
      </div>
      
      <!-- Blockchain Information -->
      <div class="blockchain-info-card mb-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">
              <i class="fab fa-ethereum me-2"></i>
              Blockchain Voting Information
            </h5>
            <p>
              Your vote will be recorded on the Ethereum blockchain and cannot be altered after submission.
              Each position requires a separate blockchain transaction.
            </p>
            <div class="wallet-info">
              <strong>Your wallet:</strong> {{ truncatedWalletAddress }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Transaction Status -->
      <div v-if="transactionInProgress" class="alert alert-info mb-4">
        <div class="d-flex align-items-center">
          <div class="spinner-border spinner-border-sm me-2" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <div>
            <strong>Transaction in progress...</strong>
            <p class="mb-0">Please confirm the transaction in MetaMask and wait for it to be processed.</p>
          </div>
        </div>
      </div>
      
      <!-- Error Messages -->
      <div v-if="errorMessage" class="alert alert-danger mb-4">
        <i class="fas fa-exclamation-circle me-2"></i>
        <strong>Error:</strong> {{ errorMessage }}
      </div>
      
      <!-- Positions and Candidates for Voting -->
      <div v-for="position in election.positions" :key="position.id" class="position-section mb-5">
        <!-- {{ console.log("Position: ", position) }} -->
        <div class="position-header mb-3">
          <h2>{{ position.title }}</h2>
          <p class="text-muted">Select one candidate for this position</p>
        </div>
        
        <div class="card voting-card">
          <div class="card-body">
            <div class="row">
              <div v-for="candidateId in position.candidates" :key="candidateId" class="col-md-6 col-lg-4 mb-4">
                <CandidateCard 
                  :candidate="getCandidateById(candidateId)" 
                  :showActions="true"
                  :canVote="!hasVoted(position.id)"
                  @vote="selectCandidate(position.id, candidateId)"
                />
              </div>
            </div>
            
            <div v-if="selectedCandidates[position.id]" class="selected-candidate-info mt-3">
              <div class="alert alert-success">
                <strong>Selected:</strong> {{ getCandidateName(selectedCandidates[position.id]) }}
                <button @click="castVoteForPosition(position.id)" class="btn btn-success ms-3" :disabled="transactionInProgress">
                  <i class="fas" :class="transactionInProgress ? 'fa-spinner fa-spin' : 'fa-check'"></i>
                  Confirm Vote
                </button>
              </div>
            </div>
            
            <div v-if="hasVoted(position.id)" class="already-voted mt-3">
              <div class="alert alert-secondary">
                <i class="fas fa-check-circle me-2"></i>
                You have already voted for this position.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import CandidateCard from '@/components/CandidateCard.vue'
import ConnectWallet from '@/components/ConnectWallet.vue'
import VoteConfirmation from '@/components/VoteConfirmation.vue'
import api from '@/services/api.js'

export default {
  name: 'VotingPage',
  components: {
    CandidateCard,
    ConnectWallet,
    VoteConfirmation
  },
  data() {
    return {
      electionId: null,
      isLoading: true,
      selectedCandidates: {},
      votedPositions: new Set(),
      transactionInProgress: false,
      errorMessage: '',
      timeRemaining: '',
      timerInterval: null,
      showConfirmation: false,
      confirmationData: {
        transaction: null,
        positionId: null,
        candidateId: null
      }
    }
  },
  computed: {
    ...mapGetters(['currentElection', 'candidates', 'isConnected', 'walletAddress', 'networkId']),
    election() {
      return this.currentElection
    },
    truncatedWalletAddress() {
      if (!this.walletAddress) return ''
      return this.walletAddress.slice(0, 6) + '...' + this.walletAddress.slice(-4)
    }
  },
  methods: {
    ...mapActions(['fetchElection', 'castVote']),
    formatDateTime(dateTimeStr) {
      const date = new Date(dateTimeStr)
      return date.toLocaleString()
    },
    getCandidateById(candidateId) {
      // console.log("Candidates: ", this.candidates)
      const candidate = this.candidates.find(c => c.candidate_id === candidateId)
      if (!candidate) return { name: 'Unknown Candidate', bio: 'Candidate information not available' }
      return candidate
    },
    getCandidateName(candidateId) {
      const candidate = this.getCandidateById(candidateId)
      return candidate ? candidate.name : 'Unknown Candidate'
    },
    selectCandidate(positionId, candidateId) {
      if (this.hasVoted(positionId)) return
      this.selectedCandidates = {
        ...this.selectedCandidates,
        [positionId]: candidateId
      }
      console.log("postion ID", positionId)
      console.log("candidate ID", candidateId)
    },
    hasVoted(positionId) {
      return this.votedPositions.has(positionId)
    },
    updateTimeRemaining() {
      if (!this.election || !this.election.endTime) return
      
      const now = new Date()
      const endTime = new Date(this.election.endTime)
      
      if (now >= endTime) {
        // Voting has ended
        this.timeRemaining = 'Voting has ended'
        clearInterval(this.timerInterval)
        setTimeout(() => {
          window.location.reload()
        }, 1000)
        return
      }
      
      const difference = endTime - now
      
      // Calculate hours, minutes, seconds
      const hours = Math.floor(difference / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)
      
      // Format time remaining
      this.timeRemaining = `${hours}h ${minutes}m ${seconds}s`
    },
    async castVoteForPosition(positionId) {
      const candidateId = this.selectedCandidates[positionId]
      
      if (!candidateId) {
        this.errorMessage = 'Please select a candidate first'
        return
      }
      
      this.transactionInProgress = true
      this.errorMessage = ''
      
      try {
        const transaction = await this.castVote({
          electionId: this.electionId,
          positionId: positionId,
          candidateId: candidateId
        })
        
        // Mark position as voted
        // this.votedPositions.add(positionId)
        
        // Show confirmation
        this.confirmationData = {
          transaction,
          positionId,
          candidateId
        }
        this.showConfirmation = true
        
      } catch (error) {
        console.error('Error casting vote:', error)
        this.errorMessage = error.message || 'Failed to cast vote. Please try again.'
      } finally {
        this.transactionInProgress = false
      }
    }
  },
  async created() {
    this.electionId = parseInt(this.$route.params.id)
    
    try {
      await this.fetchElection(this.electionId)
      this.isLoading = false
      
      // Start timer for end time
      this.updateTimeRemaining()
      this.timerInterval = setInterval(this.updateTimeRemaining, 1000)
      
      // Fetch user's voting history
      const userVotes = await api.getUserVotes()
      userVotes.data.forEach(vote => {
        if (vote.election_id === this.electionId) {
          this.votedPositions.add(vote.position_id)
        }
      })

    } catch (error) {
      console.error('Error fetching election details:', error)
      this.isLoading = false
    }
  },
  beforeUnmount() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
    }
  }
}
</script>

<style scoped>
.voting-header {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.timer-badge {
  background-color: #6c63ff;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
}

.blockchain-info-card {
  border-left: 4px solid #6c63ff;
}

.wallet-info {
  margin-top: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 5px;
  font-family: monospace;
}

.position-header {
  position: relative;
  padding-bottom: 10px;
}

.position-header:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background-color: #6c63ff;
}

.voting-card {
  border: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.selected-candidate-info {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.vote-confirmation-container {
  animation: slideIn 0.5s ease-in-out;
}

@keyframes slideIn {
  from { 
    transform: translateY(20px);
    opacity: 0;
  }
  to { 
    transform: translateY(0);
    opacity: 1;
  }
}
</style>