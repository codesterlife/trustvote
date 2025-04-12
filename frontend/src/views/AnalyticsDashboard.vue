<template>
  <div class="analytics-dashboard">
    <div class="dashboard-header mb-4">
      <h1>Elections Analytics</h1>
      <p class="text-muted">Insights and statistics about election participation and results</p>
    </div>
    
    <div class="row">
      <!-- Key metrics overview -->
      <div class="col-md-4 mb-4">
        <div class="card dashboard-card">
          <div class="card-body">
            <h5 class="card-title">Total Elections</h5>
            <div class="metric-value">{{ metrics.totalElections }}</div>
            <div class="metric-trend">
              <i class="fas fa-arrow-up text-success me-1" v-if="metrics.electionGrowth > 0"></i>
              <i class="fas fa-arrow-down text-danger me-1" v-else-if="metrics.electionGrowth < 0"></i>
              <i class="fas fa-minus text-muted me-1" v-else></i>
              {{ Math.abs(metrics.electionGrowth) }}% from last period
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-4 mb-4">
        <div class="card dashboard-card">
          <div class="card-body">
            <h5 class="card-title">Total Votes</h5>
            <div class="metric-value">{{ metrics.totalVotes }}</div>
            <div class="metric-trend">
              <i class="fas fa-arrow-up text-success me-1" v-if="metrics.voteGrowth > 0"></i>
              <i class="fas fa-arrow-down text-danger me-1" v-else-if="metrics.voteGrowth < 0"></i>
              <i class="fas fa-minus text-muted me-1" v-else></i>
              {{ Math.abs(metrics.voteGrowth) }}% from last period
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-4 mb-4">
        <div class="card dashboard-card">
          <div class="card-body">
            <h5 class="card-title">Average Participation</h5>
            <div class="metric-value">{{ metrics.averageParticipation }}%</div>
            <div class="metric-trend">
              <i class="fas fa-arrow-up text-success me-1" v-if="metrics.participationGrowth > 0"></i>
              <i class="fas fa-arrow-down text-danger me-1" v-else-if="metrics.participationGrowth < 0"></i>
              <i class="fas fa-minus text-muted me-1" v-else></i>
              {{ Math.abs(metrics.participationGrowth) }}% from last period
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row mb-4">
      <!-- Voter participation over time -->
      <div class="col-lg-8 mb-4">
        <div class="card dashboard-card">
          <div class="card-header">
            <h5 class="mb-0">Voter Participation Over Time</h5>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas ref="participationChart"></canvas>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Election Status Distribution -->
      <div class="col-lg-4 mb-4">
        <div class="card dashboard-card">
          <div class="card-header">
            <h5 class="mb-0">Election Status</h5>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas ref="statusChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row">
      <!-- Detailed Elections Table -->
      <div class="col-12">
        <div class="card dashboard-card">
          <div class="card-header">
            <h5 class="mb-0">Recent Elections</h5>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Election</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Participation</th>
                    <th>Contract Address</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="election in recentElections" :key="election.id">
                    <td>
                      <router-link :to="`/elections/${election.id}`">
                        {{ election.title }}
                      </router-link>
                    </td>
                    <td>
                      <span class="badge" 
                            :class="getStatusBadgeClass(election.status)">
                        {{ election.status }}
                      </span>
                    </td>
                    <td>{{ formatDate(election.start_time) }}</td>
                    <td>{{ formatDate(election.end_time) }}</td>
                    <td>
                      <div class="progress" style="height: 8px;">
                        <div class="progress-bar" 
                             :style="`width: ${election.participation}%`"
                             :class="getParticipationColorClass(election.participation)">
                        </div>
                      </div>
                      <small>{{ election.participation }}%</small>
                    </td>
                    <td>
                      <a :href="getEtherscanLink(election.contract_address)" 
                         target="_blank" 
                         class="contract-link">
                        {{ truncateAddress(election.contract_address) }}
                        <i class="fas fa-external-link-alt ms-1"></i>
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'
import { mapGetters, mapState } from 'vuex'
import api from '@/services/api'

export default {
  name: 'AnalyticsDashboard',
  data() {
    return {
      participationChart: null,
      statusChart: null,
      metrics: {
        totalElections: 0,
        totalVotes: 0,
        averageParticipation: 0,
        electionGrowth: 0,
        voteGrowth: 0,
        participationGrowth: 0
      },
      recentElections: [],
      participationData: [],
      statusData: { 
        labels: ['Init', 'Voting', 'Closed'],
        data: [0, 0, 0]
      },
      isLoading: false,
      errorMessage: ''
    }
  },
  computed: {
    ...mapGetters(['isConnected', 'walletAddress', 'networkId']),
    ...mapState({
      currentUser: state => state.user
    })
  },
  methods: {
    async loadAnalyticsData() {
      this.isLoading = true
      
      try {
        // Load all elections
        const response = await api.getElections()
        const elections = response.data
        
        // Calculate metrics
        this.metrics.totalElections = elections.length
        
        // Process elections for the table display (most recent first)
        const electionList = [...elections]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 10); // Only show 10 most recent
          
        // Create array of promises for processing each election with participation data
        const electionPromises = electionList.map(async election => {
          try {
            const votesResponse = await api.getVotesByElection(election.id)
            const voteCount = votesResponse.data.length
            
            // Get the total number of whitelisted voters for this election
            // For now, we'll use a simplified calculation
            const votersResponse = await api.getVoters()
            const eligibleVoters = votersResponse.data.filter(v => v.is_whitelisted).length || 1
            
            // Calculate participation rate
            const participation = Math.min(Math.floor((voteCount / eligibleVoters) * 100), 100)
            
            return { ...election, participation }
          } catch (error) {
            console.error(`Error getting data for election ${election.id}:`, error)
            return { ...election, participation: 0 }
          }
        })
        
        // Wait for all election promises to resolve
        this.recentElections = await Promise.all(electionPromises)
          
        // Fetch vote counts for all elections
        const votePromises = elections.map(election => 
          api.getVotesByElection(election.id)
        )
        
        const voteResults = await Promise.all(votePromises)
        const totalVotes = voteResults.reduce((sum, result) => sum + result.data.length, 0)
        this.metrics.totalVotes = totalVotes
        
        // Calculate average participation (simplified example)
        this.metrics.averageParticipation = elections.length > 0 
          ? Math.floor(totalVotes / elections.length / 2) // Simplified calculation
          : 0
          
        // For demo purposes - growth metrics would be calculated from historical data
        this.metrics.electionGrowth = 15
        this.metrics.voteGrowth = 22
        this.metrics.participationGrowth = 8
        
        // Generate chart data
        this.generateChartData(elections, voteResults)
        this.renderCharts()
        
      } catch (error) {
        console.error('Error loading analytics data:', error)
        this.errorMessage = 'Failed to load analytics data'
      } finally {
        this.isLoading = false
      }
    },
    
    generateChartData(elections, voteResults) {
      // Status distribution
      const statusCounts = {
        'Init': 0,
        'Voting': 0,
        'Closed': 0
      }
      
      elections.forEach(election => {
        statusCounts[election.status] = (statusCounts[election.status] || 0) + 1
      })
      
      this.statusData.data = [
        statusCounts['Init'], 
        statusCounts['Voting'], 
        statusCounts['Closed']
      ]
      
      // Participation over time (for simplicity, just using months as labels)
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const now = new Date()
      
      // Generate last 6 months
      const labels = []
      const monthlyVotes = []
      
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
        labels.push(monthNames[month.getMonth()])
        
        // Count votes for this month
        const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)
        
        let votesThisMonth = 0
        voteResults.forEach(result => {
          result.data.forEach(vote => {
            const voteDate = new Date(vote.timestamp)
            if (voteDate >= monthStart && voteDate <= monthEnd) {
              votesThisMonth++
            }
          })
        })
        
        monthlyVotes.push(votesThisMonth)
      }
      
      this.participationData = {
        labels,
        votes: monthlyVotes
      }
    },
    
    renderCharts() {
      // Destroy previous chart instances if they exist
      if (this.participationChart) {
        this.participationChart.destroy()
      }
      
      if (this.statusChart) {
        this.statusChart.destroy()
      }
      
      // Participation chart
      const participationCtx = this.$refs.participationChart.getContext('2d')
      this.participationChart = new Chart(participationCtx, {
        type: 'line',
        data: {
          labels: this.participationData.labels,
          datasets: [{
            label: 'Votes per Month',
            data: this.participationData.votes,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Votes'
              }
            }
          }
        }
      })
      
      // Status distribution chart
      const statusCtx = this.$refs.statusChart.getContext('2d')
      this.statusChart = new Chart(statusCtx, {
        type: 'doughnut',
        data: {
          labels: this.statusData.labels,
          datasets: [{
            data: this.statusData.data,
            backgroundColor: [
              'rgba(255, 206, 86, 0.7)',  // Init - Yellow
              'rgba(75, 192, 192, 0.7)',   // Voting - Green
              'rgba(153, 102, 255, 0.7)'   // Closed - Purple
            ],
            borderColor: [
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right'
            }
          }
        }
      })
    },
    
    getStatusBadgeClass(status) {
      const classes = {
        'Init': 'bg-warning',
        'Voting': 'bg-success',
        'Closed': 'bg-secondary'
      }
      return classes[status] || 'bg-light'
    },
    
    getParticipationColorClass(percentage) {
      if (percentage >= 70) return 'bg-success'
      if (percentage >= 40) return 'bg-info'
      if (percentage >= 20) return 'bg-warning'
      return 'bg-danger'
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    },
    
    truncateAddress(address) {
      if (!address) return ''
      return address.slice(0, 6) + '...' + address.slice(-4)
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
    }
  },
  mounted() {
    this.loadAnalyticsData()
  }
}
</script>

<style scoped>
.dashboard-card {
  border: none;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  overflow: hidden;
}

.dashboard-card .card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-weight: 600;
}

.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}

.metric-value {
  font-size: 2.5rem;
  font-weight: 700;
  margin-top: 10px;
  margin-bottom: 5px;
  color: #495057;
}

.metric-trend {
  font-size: 0.9rem;
  color: #6c757d;
}

.contract-link {
  font-family: monospace;
  color: #6c757d;
  text-decoration: none;
}

.contract-link:hover {
  color: #6c63ff;
  text-decoration: underline;
}

.dashboard-header {
  margin-bottom: 30px;
}

.dashboard-header h1 {
  margin-bottom: 5px;
}
</style>