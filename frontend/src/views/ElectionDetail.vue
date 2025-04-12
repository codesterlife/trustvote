<template>
  <div class="election-detail">
    <div v-if="isLoading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Loading election details...</p>
    </div>
    
    <div v-else-if="!election" class="text-center my-5">
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>
        Election not found
      </div>
      <router-link to="/elections" class="btn btn-primary mt-3">
        Back to Elections
      </router-link>
    </div>
    
    <div v-else>
      <!-- Election Header -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h1 class="mb-0">{{ election.title }}</h1>
            <span class="badge rounded-pill" :class="phaseClass">
              {{ election.status }}
            </span>
          </div>
          
          <p class="lead">{{ election.description }}</p>
          
          <div class="row mt-4">
            <div class="col-md-6">
              <div class="d-flex align-items-center mb-2">
                <i class="fas fa-calendar-alt text-primary me-2"></i>
                <span>
                  <strong>Start:</strong> {{ formatDate(election.startTime) }}
                </span>
              </div>
              <div class="d-flex align-items-center">
                <i class="fas fa-calendar-check text-primary me-2"></i>
                <span>
                  <strong>End:</strong> {{ formatDate(election.endTime) }}
                </span>
              </div>
            </div>
            <div class="col-md-6 text-md-end mt-3 mt-md-0">
              <button 
                v-if="election.status === 'Voting'" 
                class="btn btn-success"
                @click="showPositionSelection = true">
                <i class="fas fa-vote-yea me-2"></i>
                Vote Now
              </button>
              <router-link 
                v-if="election.status === 'Closed'" 
                :to="{ name: 'results', params: { id: election.electionId }}" 
                class="btn btn-primary">
                <i class="fas fa-chart-bar me-2"></i>
                View Results
              </router-link>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Position Selection Modal -->
      <div v-if="showPositionSelection" class="modal-backdrop" @click="showPositionSelection = false">
        <div class="modal-dialog" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Select Position to Vote</h5>
              <button type="button" class="btn-close" @click="showPositionSelection = false"></button>
            </div>
            <div class="modal-body">
              <div class="list-group">
                <button 
                  v-for="position in election.positions" 
                  :key="position.positionId"
                  class="list-group-item list-group-item-action"
                  @click="goToVotingBooth(position.positionId)">
                  {{ position.title }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Positions Tabs -->
      <ul class="nav nav-tabs mb-4">
        <li class="nav-item" v-for="position in election.positions" :key="position.positionId">
          <button 
            class="nav-link" 
            :class="{ active: activeTab === position.positionId }"
            @click="activeTab = position.positionId">
            {{ position.title }}
          </button>
        </li>
      </ul>
      
      <!-- Candidates List -->
      <div v-for="position in election.positions" :key="position.positionId">
        <div v-if="activeTab === position.positionId">
          <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            <div v-for="candidateId in position.candidates" :key="candidateId" class="col">
              <CandidateCard 
                :candidate="getCandidateById(candidateId)" 
                :parties="election.parties" 
                :selectable="false" 
                :showResults="false" />
            </div>
          </div>
          
          <div class="text-center mt-4" v-if="election.status === 'Voting'">
            <button 
              class="btn btn-lg btn-success"
              @click="goToVotingBooth(position.positionId)">
              Vote for {{ position.title }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CandidateCard from '@/components/CandidateCard.vue'
import api from '@/services/api'

export default {
  name: 'ElectionDetail',
  components: {
    CandidateCard
  },
  data() {
    return {
      election: null,
      candidates: [],
      isLoading: true,
      activeTab: null,
      showPositionSelection: false
    }
  },
  computed: {
    phaseClass() {
      const status = this.election?.status?.toLowerCase() || ''
      if (status === 'init') return 'badge-init'
      if (status === 'voting') return 'badge-voting'
      if (status === 'closed') return 'badge-closed'
      return 'bg-secondary'
    }
  },
  methods: {
    async fetchElectionDetails() {
      try {
        this.isLoading = true
        const electionId = this.$route.params.id
        
        // Fetch election details
        const electionResponse = await api.getElection(electionId)
        this.election = electionResponse.data
        
        // Fetch all candidates for this election
        const candidatesResponse = await api.getCandidatesByElection(electionId)
        this.candidates = candidatesResponse.data
        
        // Set default active tab to first position
        if (this.election.positions && this.election.positions.length > 0) {
          this.activeTab = this.election.positions[0].positionId
        }
      } catch (error) {
        console.error('Error fetching election details:', error)
        // Handle error - show notification
      } finally {
        this.isLoading = false
      }
    },
    getCandidateById(candidateId) {
      return this.candidates.find(c => c.candidateId === candidateId) || {}
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    goToVotingBooth(positionId) {
      this.showPositionSelection = false
      this.$router.push({
        name: 'voting-booth',
        params: {
          electionId: this.election.electionId,
          positionId: positionId
        }
      })
    }
  },
  mounted() {
    this.fetchElectionDetails()
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
  max-width: 500px;
  margin: 1.75rem auto;
}

.nav-tabs .nav-link {
  cursor: pointer;
}

.nav-tabs .nav-link.active {
  font-weight: bold;
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}
</style>
