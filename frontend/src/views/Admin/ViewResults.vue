<template>
  <div class="view-results">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Election Results</h2>
      <div>
        <button 
          v-if="selectedElection" 
          @click="exportResults" 
          class="btn btn-outline-primary">
          <i class="fas fa-download me-2"></i>Export Results
        </button>
      </div>
    </div>
    
    <!-- Admin Navigation Tabs -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <router-link to="/admin" class="nav-link">
          <i class="fas fa-tachometer-alt me-2"></i>Overview
        </router-link>
      </li>
      <li class="nav-item">
        <router-link to="/admin/elections" class="nav-link">
          <i class="fas fa-vote-yea me-2"></i>Elections
        </router-link>
      </li>
      <li class="nav-item">
        <router-link to="/admin/candidates" class="nav-link">
          <i class="fas fa-user-tie me-2"></i>Candidates
        </router-link>
      </li>
      <li class="nav-item">
        <router-link to="/admin/voters" class="nav-link">
          <i class="fas fa-users me-2"></i>Voters
        </router-link>
      </li>
      <li class="nav-item">
        <router-link to="/admin/results" class="nav-link" exact-active-class="active">
          <i class="fas fa-chart-bar me-2"></i>Results
        </router-link>
      </li>
    </ul>
    
    <!-- Election Selector -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-md-4">
            <label class="form-label">Select Election</label>
            <select 
              class="form-select" 
              v-model="selectedElectionId"
              @change="loadElectionResults">
              <option value="">Choose an election...</option>
              <option 
                v-for="election in elections" 
                :key="election.electionId" 
                :value="election.electionId">
                {{ election.title }}
              </option>
            </select>
          </div>
          <div class="col-md-8" v-if="selectedElection">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <span class="badge rounded-pill" :class="getStatusClass(selectedElection.status)">
                  {{ selectedElection.status }}
                </span>
                <span class="ms-2 text-muted small">
                  <i class="fas fa-calendar-check me-1"></i>
                  {{ formatDate(selectedElection.endTime) }}
                </span>
              </div>
              <div v-if="selectedElection.status !== 'Closed'">
                <div class="alert alert-warning mb-0 py-1 px-2">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  Election is still active. Results may change.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="isLoading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Loading election results...</p>
    </div>
    
    <div v-else-if="!selectedElection" class="text-center my-5">
      <div class="empty-state">
        <i class="fas fa-chart-bar fa-4x text-muted mb-3"></i>
        <h4>No Election Selected</h4>
        <p class="text-muted">
          Please select an election from the dropdown above to view results.
        </p>
      </div>
    </div>
    
    <div v-else>
      <!-- Election Summary -->
      <div class="card mb-4">
        <div class="card-header bg-primary text-white">
          <h4 class="mb-0">Election Summary: {{ selectedElection.title }}</h4>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6 mb-3">
              <strong>Total Eligible Voters:</strong> {{ stats.totalEligibleVoters }}
            </div>
            <div class="col-md-6 mb-3">
              <strong>Total Votes Cast:</strong> {{ stats.totalVotesCast }}
            </div>
            <div class="col-md-6 mb-3">
              <strong>Voter Turnout:</strong> {{ stats.voterTurnoutPercentage }}%
            </div>
            <div class="col-md-6 mb-3">
              <strong>Positions Contested:</strong> {{ selectedElection.positions.length }}
            </div>
          </div>
          
          <div class="voter-turnout-chart mt-3">
            <h5 class="mb-3">Voter Turnout</h5>
            <div class="progress" style="height: 25px;">
              <div class="progress-bar bg-success" role="progressbar" 
                   :style="`width: ${stats.voterTurnoutPercentage}%`" 
                   :aria-valuenow="stats.voterTurnoutPercentage" 
                   aria-valuemin="0" 
                   aria-valuemax="100">
                {{ stats.voterTurnoutPercentage }}%
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Results by Position -->
      <div v-for="position in selectedElection.positions" :key="position.positionId" class="card mb-4">
        <div class="card-header bg-light">
          <h5 class="mb-0">{{ position.title }} Results</h5>
        </div>
        <div class="card-body">
          <!-- Winner Section -->
          <div v-if="getWinnerForPosition(position.positionId)" class="winner-section mb-4">
            <div class="alert alert-success">
              <div class="d-flex align-items-center">
                <div class="winner-badge me-3">
                  <i class="fas fa-trophy"></i>
                </div>
                <div class="flex-grow-1">
                  <h5 class="mb-1">Winner</h5>
                  <strong>{{ getWinnerForPosition(position.positionId).name }}</strong>
                  <div class="text-muted small">
                    {{ getWinnerForPosition(position.positionId).voteCount }} votes 
                    ({{ getVotePercentage(position.positionId, getWinnerForPosition(position.positionId).candidateId) }}%)
                  </div>
                </div>
                <div v-if="getPartyName(getWinnerForPosition(position.positionId).partyId)" class="party-badge">
                  {{ getPartyName(getWinnerForPosition(position.positionId).partyId) }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Results Table -->
          <div class="table-responsive mb-4">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Candidate</th>
                  <th>Party</th>
                  <th>Votes</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(candidate, index) in getCandidatesForPosition(position.positionId)" :key="candidate.candidateId">
                  <td>{{ index + 1 }}</td>
                  <td>{{ candidate.name }}</td>
                  <td>{{ getPartyName(candidate.partyId) || 'Independent' }}</td>
                  <td>{{ candidate.voteCount }}</td>
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="progress flex-grow-1 me-2" style="height: 10px;">
                        <div 
                          class="progress-bar" 
                          :class="{ 'bg-success': index === 0, 'bg-primary': index !== 0 }"
                          role="progressbar" 
                          :style="`width: ${getVotePercentage(position.positionId, candidate.candidateId)}%`" 
                          :aria-valuenow="getVotePercentage(position.positionId, candidate.candidateId)" 
                          aria-valuemin="0" 
                          aria-valuemax="100">
                        </div>
                      </div>
                      <span class="text-nowrap">{{ getVotePercentage(position.positionId, candidate.candidateId) }}%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Results Chart -->
          <div class="chart-container">
            <canvas :id="`chart-position-${position.positionId}`"></canvas>
          </div>
        </div>
      </div>
      
      <!-- Voting Activity Timeline -->
      <div class="card mb-4">
        <div class="card-header bg-light">
          <h5 class="mb-0">Voting Activity Timeline</h5>
        </div>
        <div class="card-body">
          <div class="chart-container">
            <canvas id="voting-timeline-chart"></canvas>
          </div>
        </div>
      </div>
      
      <!-- Verification Section -->
      <div class="card mb-4">
        <div class="card-header bg-light">
          <h5 class="mb-0">Blockchain Verification</h5>
        </div>
        <div class="card-body">
          <div class="alert alert-info d-flex align-items-center">
            <i class="fas fa-info-circle me-3 fa-lg"></i>
            <div>
              All votes are securely recorded on the Ethereum blockchain. You can verify the results by checking the contract transactions.
            </div>
          </div>
          
          <div class="mb-3">
            <label class="form-label">Election Contract Address</label>
            <div class="input-group">
              <input 
                type="text" 
                class="form-control" 
                :value="contractAddress"
                readonly>
              <button 
                class="btn btn-outline-secondary" 
                @click="copyContractAddress">
                <i class="fas fa-copy"></i>
              </button>
              <button 
                class="btn btn-outline-primary" 
                @click="viewContractOnExplorer">
                <i class="fas fa-external-link-alt"></i>
              </button>
            </div>
          </div>
          
          <a href="#" class="btn btn-outline-primary" @click.prevent="verifyOnBlockchain">
            <i class="fas fa-shield-alt me-2"></i>
            Verify Results On Blockchain
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'
import contractService from '@/contracts/index'
import Chart from 'chart.js/auto'

export default {
  name: 'ViewResults',
  data() {
    return {
      elections: [],
      selectedElectionId: '',
      selectedElection: null,
      candidates: [],
      results: {},
      isLoading: false,
      stats: {
        totalEligibleVoters: 0,
        totalVotesCast: 0,
        voterTurnoutPercentage: 0
      },
      contractAddress: '',
      charts: {}
    }
  },
  methods: {
    async fetchElections() {
      try {
        const response = await api.getElections()
        this.elections = response.data
        
        // Check if there's an ID in the URL params
        const urlId = this.$route.params.id
        if (urlId && this.elections.some(e => e.electionId === parseInt(urlId))) {
          this.selectedElectionId = parseInt(urlId)
          this.loadElectionResults()
        }
      } catch (error) {
        console.error('Error fetching elections:', error)
        alert('Failed to load elections. Please try again.')
      }
    },
    async loadElectionResults() {
      if (!this.selectedElectionId) {
        this.selectedElection = null
        this.candidates = []
        this.results = {}
        return
      }
      
      try {
        this.isLoading = true
        
        // Fetch election details
        const electionResponse = await api.getElection(this.selectedElectionId)
        this.selectedElection = electionResponse.data
        
        // Fetch all candidates for this election
        const candidatesResponse = await api.getCandidatesByElection(this.selectedElectionId)
        this.candidates = candidatesResponse.data
        
        // Fetch election stats
        const statsResponse = await api.getElectionStats(this.selectedElectionId)
        this.stats = statsResponse.data
        
        // Get contract address
        this.contractAddress = await contractService.getElectionContractAddress(this.selectedElectionId)
        
        // Fetch results from blockchain for each position
        this.results = {}
        for (const position of this.selectedElection.positions) {
          const positionResults = await contractService.getResults(
            this.selectedElectionId,
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
      } catch (error) {
        console.error('Error loading election results:', error)
        alert('Failed to load election results. Please try again.')
      } finally {
        this.isLoading = false
        this.$nextTick(() => {
          this.initCharts()
        })
      }
    },
    getStatusClass(status) {
      status = status.toLowerCase()
      if (status === 'init') return 'badge-init'
      if (status === 'voting') return 'badge-voting'
      if (status === 'closed') return 'badge-closed'
      return 'bg-secondary'
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    getWinnerForPosition(positionId) {
      const candidates = this.getCandidatesForPosition(positionId)
      if (!candidates.length) return null
      
      // Sort by vote count in descending order
      const sorted = [...candidates].sort((a, b) => b.voteCount - a.voteCount)
      return sorted[0]
    },
    getCandidatesForPosition(positionId) {
      // Get candidates for this position and sort by vote count (descending)
      return this.candidates
        .filter(c => c.positionId === positionId)
        .sort((a, b) => b.voteCount - a.voteCount)
    },
    getTotalVotesForPosition(positionId) {
      return this.getCandidatesForPosition(positionId)
        .reduce((sum, candidate) => sum + (candidate.voteCount || 0), 0)
    },
    getVotePercentage(positionId, candidateId) {
      const totalVotes = this.getTotalVotesForPosition(positionId)
      if (!totalVotes) return 0
      
      const candidate = this.candidates.find(c => c.candidateId === candidateId)
      if (!candidate) return 0
      
      return Math.round((candidate.voteCount / totalVotes) * 100)
    },
    getPartyName(partyId) {
      if (!partyId || !this.selectedElection) return ''
      
      const party = this.selectedElection.parties.find(p => p.partyId === partyId)
      return party ? party.name : ''
    },
    copyContractAddress() {
      navigator.clipboard.writeText(this.contractAddress)
        .then(() => {
          alert('Contract address copied to clipboard')
        })
        .catch(err => {
          console.error('Could not copy text: ', err)
        })
    },
    viewContractOnExplorer() {
      // For Ganache, this would typically open a local URL
      // For testnets like Rinkeby, Ropsten, etc. it would open Etherscan
      const baseUrl = 'https://rinkeby.etherscan.io/address/'
      window.open(`${baseUrl}${this.contractAddress}`, '_blank')
    },
    async verifyOnBlockchain() {
      alert('Connecting to blockchain to verify results...')
      
      try {
        const verified = await contractService.verifyElectionResults(this.selectedElectionId)
        
        if (verified) {
          alert('Results successfully verified on the blockchain!')
        } else {
          alert('Warning: Results could not be verified on the blockchain.')
        }
      } catch (error) {
        console.error('Error verifying results:', error)
        alert(`Verification failed: ${error.message}`)
      }
    },
    exportResults() {
      // Prepare data for export
      const positionData = []
      
      for (const position of this.selectedElection.positions) {
        const candidates = this.getCandidatesForPosition(position.positionId)
        
        candidates.forEach((candidate, index) => {
          positionData.push({
            'Position': position.title,
            'Rank': index + 1,
            'Candidate': candidate.name,
            'Party': this.getPartyName(candidate.partyId) || 'Independent',
            'Votes': candidate.voteCount,
            'Percentage': `${this.getVotePercentage(position.positionId, candidate.candidateId)}%`
          })
        })
      }
      
      // Convert to CSV
      const headers = Object.keys(positionData[0]).join(',')
      const rows = positionData.map(row => Object.values(row).join(','))
      const csv = [headers, ...rows].join('\n')
      
      // Create download link
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.setAttribute('href', url)
      a.setAttribute('download', `${this.selectedElection.title.replace(/\s+/g, '_')}_results.csv`)
      a.click()
    },
    initCharts() {
      // Position charts
      for (const position of this.selectedElection.positions) {
        const positionId = position.positionId
        const ctx = document.getElementById(`chart-position-${positionId}`)
        
        if (!ctx) continue
        
        // If a chart already exists for this position, destroy it
        if (this.charts[positionId]) {
          this.charts[positionId].destroy()
        }
        
        // Get candidates for this position
        const candidates = this.getCandidatesForPosition(positionId)
        
        // Create chart data
        const labels = candidates.map(c => c.name)
        const data = candidates.map(c => c.voteCount || 0)
        const backgroundColors = [
          'rgba(75, 192, 192, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(153, 102, 255, 0.7)'
        ]
        
        // Create chart
        this.charts[positionId] = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: backgroundColors.slice(0, candidates.length),
              borderColor: backgroundColors.map(color => color.replace('0.7', '1')).slice(0, candidates.length),
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right'
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const value = context.raw
                    const total = context.dataset.data.reduce((a, b) => a + b, 0)
                    const percentage = total ? Math.round((value / total) * 100) : 0
                    return `${context.label}: ${value} votes (${percentage}%)`
                  }
                }
              }
            }
          }
        })
      }
      
      // Voting timeline chart
      const timelineCtx = document.getElementById('voting-timeline-chart')
      if (timelineCtx) {
        if (this.charts.timeline) {
          this.charts.timeline.destroy()
        }
        
        // Mock timeline data (would be replaced with real data from backend)
        const startDate = new Date(this.selectedElection.startTime)
        const endDate = new Date(this.selectedElection.endTime)
        
        // Generate dates between start and end
        const dates = []
        const currentDate = new Date(startDate)
        while (currentDate <= endDate) {
          dates.push(new Date(currentDate))
          currentDate.setHours(currentDate.getHours() + 1) // Increment by 1 hour
        }
        
        // Generate mock vote counts
        const voteCounts = dates.map((date, index) => {
          // Simulate a voting pattern that peaks in the middle
          const totalVotes = this.stats.totalVotesCast
          const position = index / dates.length
          let factor
          
          if (position < 0.2) {
            factor = position * 2.5 // Ramp up
          } else if (position > 0.8) {
            factor = (1 - position) * 5 // Taper off
          } else {
            factor = 0.5 + Math.sin((position - 0.2) * Math.PI / 0.6) * 0.5 // Bell curve
          }
          
          return Math.floor(totalVotes * factor / dates.length)
        })
        
        // Calculate cumulative votes
        let cumulative = 0
        const cumulativeVotes = voteCounts.map(count => {
          cumulative += count
          return cumulative
        })
        
        this.charts.timeline = new Chart(timelineCtx, {
          type: 'line',
          data: {
            labels: dates.map(date => date.toLocaleString()),
            datasets: [
              {
                label: 'Hourly Votes',
                data: voteCounts,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderWidth: 1,
                yAxisID: 'y',
              },
              {
                label: 'Cumulative Votes',
                data: cumulativeVotes,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                borderWidth: 2,
                fill: true,
                yAxisID: 'y1',
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false,
            },
            scales: {
              x: {
                ticks: {
                  maxTicksLimit: 8
                }
              },
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                  display: true,
                  text: 'Hourly Votes'
                }
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                  display: true,
                  text: 'Cumulative Votes'
                },
                grid: {
                  drawOnChartArea: false,
                },
              }
            }
          }
        })
      }
    }
  },
  mounted() {
    this.fetchElections()
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
.chart-container {
  height: 300px;
  position: relative;
  margin-top: 20px;
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

.party-badge {
  padding: 5px 10px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 15px;
  font-size: 0.8rem;
}

.nav-tabs .nav-link {
  padding: 0.75rem 1.25rem;
}

.nav-tabs .nav-link.active {
  font-weight: bold;
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.empty-state {
  padding: 40px 0;
}

.empty-state i {
  opacity: 0.5;
}
</style>
