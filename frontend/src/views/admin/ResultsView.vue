<template>
  <div class="results-view">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Election Results</h2>
      <div v-if="selectedElection" class="election-selector d-flex align-items-center">
        <span class="me-2">Viewing:</span>
        <select v-model="selectedElectionId" class="form-select form-select-sm" style="width: 250px">
          <option v-for="election in allElections" :key="election.electionId" :value="election.electionId">
            {{ election.title }}
          </option>
        </select>
      </div>
    </div>
    
    <!-- Connection Warning -->
    <div v-if="!isConnected" class="alert alert-warning mb-4">
      <i class="fas fa-exclamation-triangle me-2"></i>
      <strong>MetaMask not connected.</strong> Please connect your wallet to view blockchain results.
      <div class="mt-3">
        <ConnectWallet />
      </div>
    </div>
    
    <!-- Election Selector (if no election is selected) -->
    <div v-else-if="!selectedElection" class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Select an Election</h5>
        <p class="card-text">Choose an election to view its results:</p>
        <div class="list-group">
          <button 
            v-for="election in allElections" 
            :key="election.electionId"
            @click="selectElection(election.electionId)"
            class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
          >
            {{ election.title }}
            <span class="badge" :class="getStatusBadgeClass(election.status)">
              {{ election.status }}
            </span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Selected Election Results -->
    <div v-else-if="isLoading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading election results...</p>
    </div>
    
    <div v-else>
      <!-- Election Overview Card -->
      <div class="card mb-4">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">Election Overview</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-8">
              <h3>{{ selectedElection.title }}</h3>
              <p>{{ selectedElection.description }}</p>
              
              <div class="election-meta my-3">
                <div class="row">
                  <div class="col-md-6">
                    <div class="meta-item">
                      <i class="far fa-calendar-alt me-2"></i>
                      <strong>Start:</strong> {{ formatDateTime(selectedElection.startTime) }}
                    </div>
                    <div class="meta-item">
                      <i class="far fa-calendar-check me-2"></i>
                      <strong>End:</strong> {{ formatDateTime(selectedElection.endTime) }}
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="meta-item">
                      <i class="fas fa-users me-2"></i>
                      <strong>Positions:</strong> {{ selectedElection.positions ? selectedElection.positions.length : 0 }}
                    </div>
                    <div class="meta-item">
                      <i class="fas fa-check-double me-2"></i>
                      <strong>Status:</strong> 
                      <span class="badge" :class="getStatusBadgeClass(selectedElection.status)">
                        {{ selectedElection.status }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-4 d-flex align-items-center justify-content-center">
              <div class="blockchain-info text-center">
                <i class="fab fa-ethereum fa-3x mb-2 text-primary"></i>
                <p class="mb-1"><strong>Blockchain Contract:</strong></p>
                <a 
                  v-if="selectedElection.contractAddress" 
                  target="_blank" 
                  class="contract-link"
                >
                  {{ truncateAddress(selectedElection.contractAddress) }}
                  <i class="fas fa-external-link-alt ms-1"></i>
                </a>
                <p v-else class="text-muted">No contract deployed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Results Display -->
      <div v-if="selectedElection.status !== 'Closed' && selectedElection.status !== 'Voting'" class="alert alert-info mb-4">
        <i class="fas fa-info-circle me-2"></i>
        This election is not yet open for voting or results viewing.
      </div>
      
      <div v-else-if="!hasResults" class="alert alert-info mb-4">
        <i class="fas fa-info-circle me-2"></i>
        No votes have been recorded for this election yet.
      </div>
      
      <div v-else>
        <!-- Results For Each Position -->
        <div v-for="position in selectedElection.positions" :key="position.id" class="mb-5">
          <!-- {{ console.log("Position ID", position.id) }} -->
          <ResultDisplay 
            :position="position"
            :candidates="filteredCandidates"
            :results="getResultsForPosition(position.position_id)"
            :winners="getResultsForPosition(position.position_id).winners"
            :isLoading="loadingResults"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ConnectWallet from '@/components/ConnectWallet.vue'
import ResultDisplay from '@/components/ResultDisplay.vue'
import api from '@/services/api.js'

export default {
  name: 'ResultsView',
  components: {
    ConnectWallet,
    ResultDisplay
  },
  data() {
    return {
      selectedElectionId: null,
      isLoading: false,
      loadingResults: false,
      resultsData: {}
    }
  },
  computed: {
    ...mapGetters(['allElections', 'candidates', 'isConnected', 'networkId']),
    selectedElection() {
      if (!this.selectedElectionId) return null
      return this.allElections.find(e => e.electionId === this.selectedElectionId)
    },
    filteredCandidates() {
      if (!this.selectedElectionId) return []
      // console.log("Candidates:", this.candidates)
      // console.log("election ID ", this.selectedElectionId)
      return this.candidates.filter(c => c.election === this.selectedElectionId)
    },
    hasResults() {
      return Object.keys(this.resultsData).length > 0 &&
        Object.values(this.resultsData).some(results => results.length > 0)
    }
  },
  methods: {
    ...mapActions(['fetchElections', 'fetchCandidates']),
    formatDateTime(dateTimeStr) {
      const date = new Date(dateTimeStr)
      return date.toLocaleString()
    },
    truncateAddress(address) {
      if (!address) return ''
      return address.slice(0, 8) + '...' + address.slice(-6)
    },
    getStatusBadgeClass(status) {
      const classes = {
        'Init': 'bg-secondary',
        'Voting': 'bg-success',
        'Closed': 'bg-danger'
      }
      return classes[status] || 'bg-secondary'
    },
    getResultsForPosition(positionId) {
      // console.log("Position Results for : ", positionId, ":: ", this.resultsData[positionId] )
      return this.resultsData[positionId] || []
    },
    async loadResults() {
      if (!this.selectedElectionId) return
      this.loadingResults = true
      try {
        const response = await api.getResults(this.selectedElectionId)
        this.resultsData = response.data

        // Calculate percentages for each position
        Object.keys(this.resultsData).forEach(positionId => {
          const positionResults = this.resultsData[positionId]
          // console.log("Position Results: ", positionResults)
          const totalVotes = positionResults.reduce((sum, result) => sum + result.votes, 0)
          // console.log("Total Votes:", totalVotes)

          // Add percentage to each result
          this.resultsData[positionId] = positionResults.map(result => ({
            ...result,
            percentage: totalVotes > 0 ? (result.votes / totalVotes) * 100 : 0
          }))

          // Determine the winner(s)
          const maxVotes = Math.max(...positionResults.map(result => result.votes))
          const winners = positionResults.filter(result => result.votes === maxVotes)
          this.resultsData[positionId].winners = winners

        })
      } catch (error) {
        console.error('Error loading results:', error)
      } finally {
        this.loadingResults = false
      }
    },
    async selectElection(electionId) {
      this.selectedElectionId = electionId
      await this.loadResults()
    }
  },
  async created() {
    this.isLoading = true
    try {
      await Promise.all([
        this.fetchElections(),
        this.fetchCandidates()
      ])
      if (this.allElections.length > 0) {
        this.selectedElectionId = this.allElections[0].electionId
        await this.loadResults()
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      this.isLoading = false
    }
  },
  watch: {
    selectedElectionId(newVal) {
      if (newVal) {
        this.loadResults()
      }
    }
  }
}
</script>

<style scoped>
.meta-item {
  margin-bottom: 10px;
}

.contract-link {
  font-family: monospace;
  text-decoration: none;
}

.contract-link:hover {
  text-decoration: underline;
}

.blockchain-info {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}
</style>
