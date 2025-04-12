<template>
  <div class="election-results">
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
            <p class="lead">
              Election ran from {{ formatDateTime(election.startTime) }} to {{ formatDateTime(election.endTime) }}
            </p>
          </div>
          <div class="status-badge">
            <span class="badge" :class="getStatusBadgeClass(election.status)">
              {{ election.status }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Blockchain Warning -->
      <div v-if="!isConnected" class="alert alert-warning mb-4">
        <i class="fas fa-exclamation-triangle me-2"></i>
        <strong>MetaMask not connected.</strong> Results are being loaded from the API. 
        For real-time blockchain verification, please connect your wallet.
        <div class="mt-3">
          <ConnectWallet />
        </div>
      </div>
      
      <!-- Error Messages -->
      <div v-if="errorMessage" class="alert alert-danger mb-4">
        <i class="fas fa-exclamation-circle me-2"></i>
        <strong>Error:</strong> {{ errorMessage }}
      </div>
      
      <!-- Election Not Closed Warning -->
      <div v-if="election.status !== 'Closed'" class="alert alert-info mb-4">
        <i class="fas fa-info-circle me-2"></i>
        This election is not yet closed. Results are preliminary and may change.
      </div>
      
      <!-- Results by Position -->
      <div v-if="!resultsLoaded" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Fetching results from blockchain...</p>
      </div>
      
      <div v-else>
        <div v-for="position in election.positions" :key="position.positionId" class="position-results mb-5">
          <div class="position-header mb-3">
            <h2>{{ position.title }}</h2>
          </div>
          
          <div class="card result-card">
            <div class="card-body">
              <div class="winner-section mb-4" v-if="getWinner(position.positionId)">
                <div class="winner-badge">
                  <i class="fas fa-trophy"></i> Winner
                </div>
                <div class="winner-card">
                  <div class="row align-items-center">
                    <div class="col-md-2 text-center">
                      <div class="winner-icon">
                        <i class="fas fa-user-circle fa-4x"></i>
                      </div>
                    </div>
                    <div class="col-md-7">
                      <h3 class="winner-name">{{ getWinner(position.positionId).name }}</h3>
                      <p class="winner-info mb-0">
                        <span class="badge bg-secondary me-2">{{ getWinner(position.positionId).partyName || 'Independent' }}</span>
                        <strong>{{ getWinner(position.positionId).voteCount }}</strong> votes
                        ({{ getVotePercentage(position.positionId, getWinner(position.positionId).candidateId) }}%)
                      </p>
                    </div>
                    <div class="col-md-3 text-center">
                      <div class="vote-percentage">
                        {{ getVotePercentage(position.positionId, getWinner(position.positionId).candidateId) }}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Vote Chart -->
              <div class="chart-container mb-4">
                <canvas :id="`chart-${position.positionId}`"></canvas>
              </div>
              
              <!-- Results Table -->
              <div class="table-responsive">
                <table class="table table-hover results-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Candidate</th>
                      <th>Party</th>
                      <th class="text-center">Votes</th>
                      <th class="text-center">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(candidate, index) in getCandidatesWithResults(position.positionId)" 
                        :key="candidate.candidateId"
                        :class="{ 'table-success': index === 0 }">
                      <td>{{ index + 1 }}</td>
                      <td>{{ candidate.name }}</td>
                      <td>{{ candidate.partyName || 'Independent' }}</td>
                      <td class="text-center">{{ candidate.voteCount }}</td>
                      <td class="text-center">
                        <div class="progress">
                          <div class="progress-bar"
                               :class="index === 0 ? 'bg-success' : 'bg-primary'"
                               :style="`width: ${getVotePercentage(position.positionId, candidate.candidateId)}%`">
                            {{ getVotePercentage(position.positionId, candidate.candidateId) }}%
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Go Back Button -->
      <div class="d-grid d-md-flex justify-content-md-center mt-3">
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
import Chart from 'chart.js/auto'

export default {
  name: 'ElectionResults',
  components: {
    ConnectWallet
  },
  data() {
    return {
      electionId: null,
      isLoading: true,
      errorMessage: '',
      results: {},
      charts: {},
      resultsLoaded: false
    }
  },
  computed: {
    ...mapGetters(['currentElection', 'candidates', 'isConnected', 'walletAddress']),
    election() {
      return this.currentElection
    }
  },
  methods: {
    ...mapActions(['fetchElection', 'fetchResults']),
    formatDateTime(dateTimeStr) {
      const date = new Date(dateTimeStr)
      return date.toLocaleString()
    },
    getStatusBadgeClass(status) {
      const classes = {
        'Init': 'bg-secondary',
        'Voting': 'bg-success',
        'Closed': 'bg-danger'
      }
      return classes[status] || 'bg-secondary'
    },
    async loadResults() {
      this.resultsLoaded = false
      
      try {
        const results = await this.fetchResults(this.electionId)
        this.results = results
        this.resultsLoaded = true
        
        // After results are loaded, create charts
        this.$nextTick(() => {
          this.createCharts()
        })
      } catch (error) {
        console.error('Error loading results:', error)
        this.errorMessage = error.message || 'Failed to load results from the blockchain'
        this.resultsLoaded = true
      }
    },
    getCandidateById(candidateId) {
      return this.candidates.find(c => c.candidateId === candidateId) || { name: 'Unknown Candidate' }
    },
    getTotalVotesForPosition(positionId) {
      if (!this.results[positionId]) return 0
      
      return Object.values(this.results[positionId]).reduce((total, candidate) => {
        return total + candidate.votes
      }, 0)
    },
    getVotePercentage(positionId, candidateId) {
      const totalVotes = this.getTotalVotesForPosition(positionId)
      if (totalVotes === 0) return 0
      
      const candidateVotes = this.getCandidateVotes(positionId, candidateId)
      return Math.round((candidateVotes / totalVotes) * 100)
    },
    getCandidateVotes(positionId, candidateId) {
      if (!this.results[positionId]) return 0
      
      const candidateResult = this.results[positionId].find(c => c.candidateId === candidateId)
      return candidateResult ? candidateResult.votes : 0
    },
    getCandidatesWithResults(positionId) {
      if (!this.results[positionId]) return []
      
      // Map results to candidates with details
      const candidatesWithResults = this.results[positionId].map(result => {
        const candidate = this.getCandidateById(result.candidateId)
        return {
          ...candidate,
          voteCount: result.votes,
          candidateId: result.candidateId
        }
      })
      
      // Sort by vote count descending
      return candidatesWithResults.sort((a, b) => b.voteCount - a.voteCount)
    },
    getWinner(positionId) {
      const candidates = this.getCandidatesWithResults(positionId)
      if (candidates.length === 0) return null
      
      return candidates[0]
    },
    createCharts() {
      // Clear any existing charts
      Object.values(this.charts).forEach(chart => chart.destroy())
      this.charts = {}
      
      // For each position, create a chart
      this.election.positions.forEach(position => {
        const candidates = this.getCandidatesWithResults(position.positionId)
        if (candidates.length === 0) return
        
        const canvas = document.getElementById(`chart-${position.positionId}`)
        if (!canvas) return
        
        const ctx = canvas.getContext('2d')
        
        const labels = candidates.map(c => c.name)
        const data = candidates.map(c => c.voteCount)
        const backgroundColors = [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)'
        ]
        
        this.charts[position.positionId] = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Votes',
              data: data,
              backgroundColor: backgroundColors.slice(0, candidates.length),
              borderColor: backgroundColors.map(color => color.replace('0.6', '1')),
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const value = context.raw
                    const total = context.dataset.data.reduce((a, b) => a + b, 0)
                    const percentage = Math.round((value / total) * 100)
                    return `${value} votes (${percentage}%)`
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0
                }
              }
            }
          }
        })
      })
    }
  },
  async created() {
    this.electionId = parseInt(this.$route.params.id)
    
    try {
      // Fetch the election details
      await this.fetchElection(this.electionId)
      this.isLoading = false
      
      // Then load the results
      await this.loadResults()
    } catch (error) {
      console.error('Error fetching election details:', error)
      this.errorMessage = error.message || 'Failed to fetch election details'
      this.isLoading = false
    }
  },
  beforeUnmount() {
    // Destroy all charts
    Object.values(this.charts).forEach(chart => chart.destroy())
  }
}
</script>

<style scoped>
.results-header {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.status-badge {
  font-size: 1.1rem;
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

.result-card {
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.winner-card {
  background-color: #f8f9fa;
  border-left: 4px solid #28a745;
  padding: 15px;
  border-radius: 8px;
  position: relative;
  margin-top: 25px;
}

.winner-badge {
  position: absolute;
  top: -15px;
  left: 20px;
  background-color: #28a745;
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-weight: bold;
  z-index: 1;
}

.winner-icon {
  color: #28a745;
}

.winner-name {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.vote-percentage {
  font-size: 2.5rem;
  font-weight: bold;
  color: #28a745;
}

.chart-container {
  height: 300px;
  margin-top: 30px;
}

.results-table {
  margin-top: 20px;
}

.progress {
  height: 25px;
}

.progress-bar {
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
}
</style>