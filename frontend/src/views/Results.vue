<template>
  <div class="results-page">
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading election results...</p>
    </div>
    
    <div v-else-if="!election" class="alert alert-danger">
      <i class="fas fa-exclamation-circle me-2"></i>
      Election not found or has been removed.
    </div>
    
    <div v-else>
      <!-- Results Header -->
      <div class="results-header mb-4">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h1>Results: {{ election.title }}</h1>
            <p class="lead">{{ election.description }}</p>
          </div>
          <span class="status-badge" :class="statusClass">
            {{ election.status }}
          </span>
        </div>
        
        <div class="election-meta my-4">
          <div class="row">
            <div class="col-md-6">
              <div class="meta-item">
                <i class="far fa-calendar-alt me-2"></i>
                <strong>Start:</strong> {{ formatDateTime(election.startTime) }}
              </div>
              <div class="meta-item">
                <i class="far fa-calendar-check me-2"></i>
                <strong>End:</strong> {{ formatDateTime(election.endTime) }}
              </div>
            </div>
            <div class="col-md-6">
              <div class="meta-item">
                <i class="fas fa-users me-2"></i>
                <strong>Positions:</strong> {{ election.positions ? election.positions.length : 0 }}
              </div>
              <div class="meta-item" v-if="election.contract_address">
                <i class="fab fa-ethereum me-2"></i>
                <strong>Contract:</strong> 
                <a href="#" target="_blank" class="contract-link">
                  {{ truncatedContractAddress }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Results Access Warning -->
      <div v-if="election.status !== 'Closed' && !isAdmin" class="alert alert-warning mb-4">
        <i class="fas fa-exclamation-triangle me-2"></i>
        <strong>Note:</strong> Full results are only available after voting has closed.
        <span v-if="election.status === 'Voting'">
          Voting is still in progress until {{ formatDateTime(election.endTime) }}.
        </span>
      </div>
      
      <!-- Blockchain Source Note -->
      <div class="alert alert-info blockchain-info mb-4">
        <i class="fas fa-info-circle me-2"></i>
        <strong>Blockchain-Verified Results:</strong> These results are pulled directly from the Ethereum blockchain and cannot be manipulated.
      </div>
      
      <!-- Results Content -->
      <div v-if="!isConnected" class="mb-4">
        <div class="alert alert-warning">
          <i class="fas fa-wallet me-2"></i>
          <strong>MetaMask not connected.</strong> Please connect your wallet to view blockchain-verified results.
        </div>
        <ConnectWallet />
      </div>
      
      <div v-else-if="!canViewResults && !isAdmin" class="alert alert-info">
        <i class="fas fa-lock me-2"></i>
        Results will be available once the election has ended on {{ formatDateTime(election.endTime) }}.
      </div>
      
      <div v-else>
        <!-- Results Display For Each Position -->
        <div v-for="position in election.positions" :key="position.positionId" class="mb-5">
          <ResultDisplay 
            :position="position"
            :candidates="candidates"
            :results="getResultsForPosition(position.positionId)"
            :isLoading="loadingResults"
          />
        </div>
      </div>
      
      <!-- Return to Elections Button -->
      <div class="text-center mt-5">
        <router-link to="/elections" class="btn btn-outline-primary">
          <i class="fas fa-arrow-left me-2"></i>
          Back to Elections
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ConnectWallet from '@/components/ConnectWallet.vue'
import ResultDisplay from '@/components/ResultDisplay.vue'

export default {
  name: 'Results',
  components: {
    ConnectWallet,
    ResultDisplay
  },
  data() {
    return {
      electionId: null,
      isLoading: true,
      resultsData: {},
      loadingResults: false
    }
  },
  computed: {
    ...mapGetters(['currentElection', 'candidates', 'isConnected', 'isAdmin', 'networkId']),
    election() {
      return this.currentElection
    },
    statusClass() {
      const statusMap = {
        'Init': 'status-init',
        'Voting': 'status-voting',
        'Closed': 'status-closed'
      }
      return this.election ? statusMap[this.election.status] || 'status-init' : ''
    },
    truncatedContractAddress() {
      if (!this.election || !this.election.contract_address) return ''
      return this.election.contract_address.slice(0, 8) + '...' + this.election.contract_address.slice(-6)
    },
    canViewResults() {
      if (!this.election) return false
      
      // Results can be viewed if election is closed or user is admin
      return this.election.status === 'Closed' || 
             new Date() >= new Date(this.election.endTime)
    }
  },
  methods: {
    ...mapActions(['fetchElection', 'fetchResults']),
    formatDateTime(dateTimeStr) {
      const date = new Date(dateTimeStr)
      return date.toLocaleString()
    },
    getResultsForPosition(positionId) {
      return this.resultsData[positionId] || []
    },
    async loadResults() {
      if (!this.election || !this.isConnected) return
      
      this.loadingResults = true
      try {
        const results = await this.fetchResults(this.electionId)
        
        // Process the results from the blockchain
        // Assuming results is an object with positionId as keys and arrays of candidate results as values
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
    this.electionId = parseInt(this.$route.params.id)
    
    try {
      await this.fetchElection(this.electionId)
      this.isLoading = false
      
      // Load results if we're connected to MetaMask
      if (this.isConnected) {
        this.loadResults()
      }
    } catch (error) {
      console.error('Error fetching election details:', error)
      this.isLoading = false
    }
  },
  watch: {
    // Watch for MetaMask connection and reload results if needed
    isConnected(newVal) {
      if (newVal && this.election) {
        this.loadResults()
      }
    }
  }
}
</script>

<style scoped>
.results-header {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
  color: white;
}

.status-init {
  background-color: #6c757d;
}

.status-voting {
  background-color: #28a745;
}

.status-closed {
  background-color: #dc3545;
}

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
  border-left: 4px solid #6c63ff;
}
</style>
