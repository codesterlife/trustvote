<template>
  <div class="results-display">
    <div class="card mb-4">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">
          <i class="fas fa-chart-bar me-2"></i>
          {{ position.title }} Results
        </h5>
      </div>
      <div class="card-body">
        <div v-if="isLoading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Loading results from blockchain...</p>
        </div>
        
        <div v-else-if="results.length === 0" class="text-center py-4">
          <div class="alert alert-info">
            <i class="fas fa-info-circle me-2"></i>
            No votes have been cast for this position yet.
          </div>
        </div>
        
        <div v-else>
          <!-- Results Chart -->
          <div class="chart-container mb-4">
            <canvas :id="`chart-${position.position_id}`"></canvas>
          </div>
          
          <!-- Results Table -->
          <div class="table-responsive">
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
                <tr v-for="(result, index) in sortedResults" :key="result.candidateId">
                  <td>{{ index + 1 }}</td>
                  <td>{{ getCandidateName(result.candidateId) }}</td>
                  <td>{{ getCandidateParty(result.candidateId) }}</td>
                  <td>{{ result.votes }}</td>
                  <td>
                    <div class="progress">
                      <div class="progress-bar" 
                           :style="{ width: `${result.percentage}%`}">
                        {{ result.percentage.toFixed(1) }}%
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="table-light">
                  <td colspan="3"><strong>Total</strong></td>
                  <td><strong>{{ totalVotes }}</strong></td>
                  <td>100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <!-- Winner Information -->
          <div v-if="winners && winners.length > 0" class="alert alert-success mt-3">
            <strong>Winner{{ winners.length > 1 ? 's' : '' }}:</strong>
            <ul>
              <li v-for="winner in winners" :key="winner.candidateId">
                {{ getCandidateName(winner.candidateId) }} - {{ winner.votes }} votes
              </li>
            </ul>
          </div>
          <p v-if="winners.length > 1" class="alert alert-warning mt-3"><strong>It's a tie!</strong> You can either proceed with this result or conduct a Runoff Election to find a winner.</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'

export default {
  name: 'ResultDisplay',
  props: {
    position: {
      type: Object,
      required: true
    },
    candidates: {
      type: Array,
      required: true
    },
    results: {
      type: Array,
      required: true
    },
    winners: {
      type: Array,
      required: true
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    sortedResults() {
      // console.log("results", this.results)
      return [...this.results].sort((a, b) => b.votes - a.votes)
    },
    totalVotes() {
      return this.results.reduce((sum, result) => sum + result.votes, 0)
    }
  },
  methods: {
    getCandidateName(candidateId) {
      // console.log("Candidates: ", this.candidates)
      const candidate = this.candidates.find(c => c.candidate_id === candidateId)
      return candidate ? candidate.name : 'Unknown Candidate' 
    },
    getCandidateParty(candidateId) {
      const candidate = this.candidates.find(c => c.candidate_id === candidateId)
      return candidate ? candidate.party_name : 'Independent'
    },
    renderChart() {
      if (this.results.length === 0) return
      
      const ctx = document.getElementById(`chart-${this.position.position_id}`)
      if (!ctx) return
      
      // Destroy existing chart if it exists
      if (this.chart) {
        this.chart.destroy()
      }
      
      const labels = this.sortedResults.map(result => this.getCandidateName(result.candidateId))
      const data = this.sortedResults.map(result => result.votes)
      
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Votes',
            data: data,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              precision: 0
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: (tooltipItem) => {
                  const index = tooltipItem.dataIndex
                  const votes = this.sortedResults[index].votes
                  const percentage = this.sortedResults[index].percentage.toFixed(1)
                  return `Votes: ${votes} (${percentage}%)`
                }
              }
            }
          }
        }
      })
    }
  },
  mounted() {
    this.renderChart()
  },
  updated() {
    this.$nextTick(() => {
      this.renderChart()
    })
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy()
    }
  }
}
</script>

<style scoped>
.chart-container {
  height: 300px;
  margin-bottom: 20px;
}

.party-badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  color: white;
}

.progress {
  height: 20px;
}

.progress-bar {
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
}
</style>
