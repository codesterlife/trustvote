<template>
  <div class="voting-booth">
    <div v-if="isLoading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Loading voting booth...</p>
    </div>
    
    <div v-else-if="!election || !position" class="text-center my-5">
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>
        Election or position not found
      </div>
      <router-link to="/elections" class="btn btn-primary mt-3">
        Back to Elections
      </router-link>
    </div>
    
    <div v-else-if="showConfirmation" class="vote-success-container">
      <VoteConfirmation 
        :txHash="transactionHash" 
        :voteDetails="voteDetails"
        :txDetails="transactionDetails"
        @close="goToElections" />
    </div>
    
    <div v-else>
      <div class="card mb-4">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h3 class="mb-0">Cast Your Vote</h3>
          <span class="badge badge-voting">{{ election.status }}</span>
        </div>
        <div class="card-body">
          <h4>{{ election.title }}</h4>
          <p>{{ election.description }}</p>
          
          <div class="alert alert-info d-flex align-items-center">
            <i class="fas fa-info-circle me-3 fa-lg"></i>
            <div>
              <strong>Position:</strong> {{ position.title }}<br>
              <small>Select one candidate below to cast your vote.</small>
            </div>
          </div>
        </div>
      </div>
      
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-4">
        <div v-for="candidate in candidates" :key="candidate.candidateId" class="col">
          <CandidateCard 
            :candidate="candidate" 
            :parties="election.parties" 
            :selectable="true"
            :selected="selectedCandidateId === candidate.candidateId"
            @select="selectCandidate" />
        </div>
      </div>
      
      <div class="d-flex justify-content-between mt-4">
        <router-link 
          :to="{ name: 'election-detail', params: { id: election.electionId }}" 
          class="btn btn-outline-secondary">
          <i class="fas fa-arrow-left me-2"></i>
          Back to Election
        </router-link>
        
        <button 
          @click="castVote" 
          class="btn btn-success"
          :disabled="!selectedCandidateId || isVoting">
          <span v-if="isVoting" class="spinner-border spinner-border-sm me-2" role="status"></span>
          <i v-else class="fas fa-vote-yea me-2"></i>
          Cast Vote
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import CandidateCard from '@/components/CandidateCard.vue'
import VoteConfirmation from '@/components/VoteConfirmation.vue'
import api from '@/services/api'
import web3Service from '@/services/web3'
import contractService from '@/contracts/index'

export default {
  name: 'VotingBooth',
  components: {
    CandidateCard,
    VoteConfirmation
  },
  data() {
    return {
      election: null,
      position: null,
      candidates: [],
      selectedCandidateId: null,
      isLoading: true,
      isVoting: false,
      showConfirmation: false,
      transactionHash: '',
      transactionDetails: {
        blockNumber: null,
        timestamp: null,
        status: 'Pending'
      },
      voteDetails: {
        electionTitle: '',
        positionTitle: '',
        candidateName: ''
      }
    }
  },
  methods: {
    async fetchVotingData() {
      try {
        this.isLoading = true
        const electionId = this.$route.params.electionId
        const positionId = this.$route.params.positionId
        
        // Fetch election details
        const electionResponse = await api.getElection(electionId)
        this.election = electionResponse.data
        
        // Find the position
        this.position = this.election.positions.find(p => p.positionId === parseInt(positionId))
        
        if (!this.position) {
          throw new Error('Position not found')
        }
        
        // Fetch candidates for this position
        const candidatesResponse = await api.getCandidatesByPosition(electionId, positionId)
        this.candidates = candidatesResponse.data
        
      } catch (error) {
        console.error('Error fetching voting booth data:', error)
        // Handle error - show notification
      } finally {
        this.isLoading = false
      }
    },
    selectCandidate(candidate) {
      this.selectedCandidateId = candidate.candidateId
    },
    async castVote() {
      if (!this.selectedCandidateId || this.isVoting) return
      
      try {
        this.isVoting = true
        
        // Get selected candidate
        const selectedCandidate = this.candidates.find(c => c.candidateId === this.selectedCandidateId)
        
        // Prepare vote data
        this.voteDetails = {
          electionTitle: this.election.title,
          positionTitle: this.position.title,
          candidateName: selectedCandidate.name
        }
        
        // Get wallet address
        const walletAddress = await web3Service.getAccount()
        
        // Call smart contract to cast vote
        const result = await contractService.castVote(
          this.election.electionId,
          this.position.positionId,
          this.selectedCandidateId,
          walletAddress
        )
        
        // Store transaction hash
        this.transactionHash = result.transactionHash
        
        // Also record vote in backend for backup/verification
        await api.recordVote({
          election_id: this.election.electionId,
          position_id: this.position.positionId,
          candidate_id: this.selectedCandidateId,
          wallet_address: walletAddress,
          tx_hash: this.transactionHash
        })
        
        // Set transaction details
        this.transactionDetails = {
          blockNumber: result.blockNumber,
          timestamp: new Date().toISOString(),
          status: 'Confirmed'
        }
        
        // Show confirmation
        this.showConfirmation = true
        
      } catch (error) {
        console.error('Error casting vote:', error)
        alert(`Failed to cast vote: ${error.message}`)
      } finally {
        this.isVoting = false
      }
    },
    goToElections() {
      this.$router.push('/elections')
    }
  },
  mounted() {
    this.fetchVotingData()
  }
}
</script>

<style scoped>
.voting-booth {
  padding-bottom: 40px;
}

.vote-success-container {
  max-width: 800px;
  margin: 0 auto;
}
</style>
