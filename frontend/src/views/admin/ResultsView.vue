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
                  v-if="selectedElection.contract_address" 
                  :href="getEtherscanLink(selectedElection.contract_address)" 
                  target="_blank" 
                  class="contract-link"
                >
                  {{ truncateAddress(selectedElection.contract_address) }}
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
        <div v-for="position in selectedElection.positions" :key="position.positionId" class="mb-5">
          <ResultDisplay 
            :position="position"
            :candidates="filteredCandidates"
            :results="getResultsForPosition(position.positionId)"
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
      return this.candidates.filter(c => c.electionId === this.selectedElectionId)
    },
    hasResults() {
      return Object.keys(this.resultsData).length > 0 &&
        Object.values(this.resultsData).some(results => results.length > 0)
    }
  },
  methods: {
    ...mapActions(['fetchElections', 'fetchCandidates', 'fetchResults']),
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
    getEtherscanLink(address) {
      const networkUrls = {
        1: 'https://etherscan.io',
        3: 'https://ropsten.etherscan.io',
        4: 'https://rinkeby.etherscan.io',
        5: 'https://goerli.etherscan.io',
        42: 'https://kovan.etherscan.io'
      }
      
      const baseUrl = networkUrls[this.networkId] || '#'
      if (baseUrl === '#' || !address) return '#'
      
      return `${baseUrl}/address/${address}`
    },
    getResultsForPosition(positionId) {
      return this.resultsData[positionId] || []
    },
    async selectElection(electionId) {
      this.selectedElectionId = electionId
      await this.loadResults()
    },
    async loadResults() {
      if (!this.selectedElectionId || !this.isConnected) return
      
      this.loadingResults = true
      try {
        const results = await this.fetchResults(this.selectedElectionId)
        
        // Process the results from the blockchain
        this.resultsData = results
        
        // Calculate percentages for each position
        Object.keys(this.resultsData).forEach(positionId => {
          const positionResults = this.resultsData[positionId]
          const totalVotes = positionResults.reduce((sum, result) => sum + result.votes, 0)
          
          // Add percentage to each result
          this.resultsData[positionId] = positionResults.map(result => ({
            ...result,
            percentage: totalVotes > 0 ? (result.votes / totalVotes) * 100 : 0
          }))
        })
        
      } catch (error) {
        console.error('Error loading results:', error)
      } finally {
        this.loadingResults = false
      }
    }
  },
  async created() {
    this.isLoading = true
    try {
      await Promise.all([
        this.fetchElections(),
        this.fetchCandidates()
      ])
      
      // If there's at least one election, select the first one
      if (this.allElections.length > 0) {
        this.selectedElectionId = this.allElections[0].electionId
        
        // If we're connected to MetaMask, load results
        if (this.isConnected) {
          await this.loadResults()
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      this.isLoading = false
    }
  },
  watch: {
    // Watch for MetaMask connection and reload results if needed
    isConnected(newVal) {
      if (newVal && this.selectedElectionId) {
        this.loadResults()
      }
    },
    // Watch for changes in selected election
    selectedElectionId(newVal) {
      if (newVal && this.isConnected) {
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
