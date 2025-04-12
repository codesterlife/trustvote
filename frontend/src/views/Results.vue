<template>
  <div class="results-page">
    <div v-if="isLoading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Loading election results...</p>
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
            <h1 class="mb-0">{{ election.title }} - Results</h1>
            <span class="badge rounded-pill badge-closed">
              {{ election.status }}
            </span>
          </div>
          
          <p class="lead">{{ election.description }}</p>
          
          <div class="d-flex align-items-center text-muted">
            <i class="fas fa-clock me-2"></i>
            <span>
              Election ended on {{ formatDate(election.endTime) }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Results Tabs -->
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
      
      <!-- Results Content -->
      <div v-for="position in election.positions" :key="position.positionId">
        <div v-if="activeTab === position.positionId">
          <div class="card mb-4">
            <div class="card-header bg-primary text-white">
              <h4 class="mb-0">{{ position.title }} - Results</h4>
            </div>
            <div class="card-body">
              <div v-if="getWinnerForPosition(position.positionId)" class="winner-section mb-4">
                <div class="alert alert-success">
                  <div class="d-flex align-items-center">
                    <div class="winner-badge me-3">
                      <i class="fas fa-trophy"></i>
                    </div>
                    <div>
                      <h5 class="mb-1">Winner</h5>
                      <strong>{{ getWinnerForPosition(position.positionId).name }}</strong>
                      <div class="text-muted small">
                        {{ getWinnerForPosition(position.positionId).voteCount }} votes
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Candidates Results -->
              <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                <div v-for="candidateId in position.candidates" :key="candidateId" class="col">
                  <CandidateCard 
                    :candidate="getCandidateWithVotes(candidateId)" 
                    :parties="election.parties" 
                    :selectable="false" 
                    :showResults="true"
                    :totalVotes="getTotalVotesForPosition(position.positionId)" />
                </div>
              </div>
            </div>
          </div>
          
          <!-- Results Chart -->
          <div class="card">
            <div class="card-header bg-light">
              <h5 class="mb-0">Vote Distribution</h5>
            </div>
            <div class="card-body">
              <div class="chart-container">
                <canvas :id="`chart-position-${position.positionId}`"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="text-center mt-4">
        <div class="alert alert-info d-inline-block">
          <i class="fas fa-info-circle me-2"></i>
          Results are retrieved directly from the blockchain
        </div>
      </div>
      
      <div class="text-center mt-4">
        <router-link to="/elections" class="btn btn-primary">
          Back to Elections
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import CandidateCard from '@/components/CandidateCard.vue'
import api from '@/services/api'
import contractService from '@/contracts/index'
import Chart from 'chart.js/auto'

export default {
  name: 'Results',
  components: {
    CandidateCard
  },
  data() {
    return {
      election: null,
      candidates: [],
      results: {},
      isLoading: true,
      activeTab: null,
      charts: {}
    }
  },
  methods: {
    async fetchElectionResults() {
      try {
        this.isLoading = true
        const electionId = this.$route.params.id
        
        // Fetch election details
        const electionResponse = await api.getElection(electionId)
        this.election = electionResponse.data
        
        // Fetch all candidates for this election
        const candidatesResponse = await api.getCandidatesByElection(electionId)
        this.candidates = candidatesResponse.data
        
        // Fetch results from blockchain
        for (const position of this.election.positions) {
          const positionResults = await contractService.getResults(
            this.election.electionId,
            position.positionId
          )
          
          this.results[position.positionId] = positionResults
          
          // Apply vote counts to candidates
          for (let candidate of this.candidates) {
            if (position.candidates.includes(candidate.candidateId)) {
              const votes = positionResults.votes.find(
                v => v.candidateId === candidate.candidateId
              )
              candidate.voteCount = votes ? votes.count : 0
            }
          }
        }
        
        // Set default active tab to first position
        if (this.election.positions && this.election.positions.length > 0) {
          this.activeTab = this.election.positions[0].positionId
        }
      } catch (error) {
        console.error('Error fetching election results:', error)
        // Handle error - show notification
      } finally {
        this.isLoading = false
        this.$nextTick(() => {
          this.initCharts()
        })
      }
    },
    getCandidateWithVotes(candidateId) {
      return this.candidates.find(c => c.candidateId === candidateId) || {}
    },
    getWinnerForPosition(positionId) {
      const positionCandidates = this.candidates.filter(c => {
        return this.election.positions.find(
          p => p.positionId === positionId && p.candidates.includes(c.candidateId)
        )
      })
      
      if (positionCandidates.length === 0) return null
      
      return positionCandidates.reduce((prev, current) => {
        return (prev.voteCount > current.voteCount) ? prev : current
      })
    },
    getTotalVotesForPosition(positionId) {
      const positionCandidates = this.candidates.filter(c => {
        return this.election.positions.find(
          p => p.positionId === positionId && p.candidates.includes(c.candidateId)
        )
      })
      
      return positionCandidates.reduce((sum, candidate) => {
        return sum + (candidate.voteCount || 0)
      }, 0)
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    initCharts() {
      for (const position of this.election.positions) {
        const positionId = position.positionId
        const ctx = document.getElementById(`chart-position-${positionId}`)
        
        if (!ctx) continue
        
        // If a chart already exists for this position, destroy it
        if (this.charts[positionId]) {
          this.charts[positionId].destroy()
        }
        
        // Get candidates for this position
        const positionCandidates = this.candidates.filter(c => {
          return position.candidates.includes(c.candidateId)
        })
        
        // Create chart data
        const labels = positionCandidates.map(c => c.name)
        const data = positionCandidates.map(c => c.voteCount || 0)
        const backgroundColors = [
          'rgba(75, 192, 192, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(153, 102, 255, 0.7)'
        ]
        
        // Create chart
        this.charts[positionId] = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Votes',
              data: data,
              backgroundColor: backgroundColors,
              borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0 // Only show integers
                }
              }
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const votes = context.raw
                    const total = data.reduce((a, b) => a + b, 0)
                    const percentage = total ? Math.round((votes / total) * 100) : 0
                    return `${votes} votes (${percentage}%)`
                  }
                }
              }
            }
          }
        })
      }
    }
  },
  mounted() {
    this.fetchElectionResults()
  },
  beforeUnmount() {
    // Clean up charts when component is destroyed
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy()
    })
  }
}
</script>

<style scoped>
.results-page {
  padding-bottom: 40px;
}

.chart-container {
  height: 300px;
  position: relative;
}

.winner-badge {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffc107;
  color: white;
  font-size: 1.5rem;
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
