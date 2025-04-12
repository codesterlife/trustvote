<template>
  <div class="election-results">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Loading election results...</p>
    </div>
    
    <div v-else-if="!election" class="alert alert-danger">
      Election not found or unable to load results.
    </div>
    
    <div v-else-if="election.status !== 'closed' && !isAdmin" class="results-unavailable text-center py-5">
      <i class="bi bi-lock-fill results-locked-icon"></i>
      <h3 class="mt-3">Results Not Available Yet</h3>
      <p>Election results will be available once the election has concluded.</p>
      <div class="mt-4">
        <router-link :to="{ name: 'Election', params: { id: election.id } }" class="btn btn-primary">
          Return to Election Details
        </router-link>
      </div>
    </div>
    
    <div v-else>
      <div class="results-header mb-4">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h1 class="mb-2">Election Results</h1>
            <h3 class="election-title mb-3">{{ election.title }}</h3>
            <div class="election-meta">
              <span v-if="election.status === 'closed'" class="badge bg-secondary me-2">
                <i class="bi bi-check-circle-fill me-1"></i> Election Closed
              </span>
              <span class="text-muted">
                {{ formatDateRange(election.start_time, election.end_time) }}
              </span>
            </div>
          </div>
          
          <div v-if="election.contract_address" class="blockchain-badge">
            <i class="bi bi-link-45deg"></i>
            Results from Blockchain
            <a :href="'https://etherscan.io/address/' + election.contract_address" 
               target="_blank"
               class="ms-1 contract-link">
              {{ shortenAddress(election.contract_address) }}
              <i class="bi bi-box-arrow-up-right"></i>
            </a>
          </div>
        </div>
      </div>
      
      <div v-if="results.length === 0" class="no-results text-center py-5">
        <p class="mb-0">No results available for this election.</p>
      </div>
      
      <div v-else>
        <div class="mb-4 results-summary card">
          <div class="card-body">
            <h4 class="card-title">Election Summary</h4>
            <div class="row mt-3">
              <div class="col-md-4">
                <div class="summary-item">
                  <div class="summary-value">{{ positions.length }}</div>
                  <div class="summary-label">Positions</div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="summary-item">
                  <div class="summary-value">{{ totalCandidates }}</div>
                  <div class="summary-label">Candidates</div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="summary-item">
                  <div class="summary-value">{{ totalVotes }}</div>
                  <div class="summary-label">Total Votes Cast</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mb-5">
          <div v-for="position in results" :key="position.position_id" class="mb-4">
            <ResultsChart 
              :positionTitle="getPositionTitle(position.position_id)" 
              :results="position.candidates" 
            />
          </div>
        </div>
        
        <div class="mt-5 text-center">
          <router-link :to="{ name: 'Election', params: { id: election.id } }" class="btn btn-outline-primary me-3">
            Back to Election Details
          </router-link>
          <router-link :to="{ name: 'Home' }" class="btn btn-outline-secondary">
            View All Elections
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import apiService from '@/services/api';
import web3Service from '@/services/web3';
import ResultsChart from '@/components/ResultsChart.vue';

export default {
  name: 'Results',
  components: {
    ResultsChart
  },
  props: {
    id: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      loading: true,
      election: null,
      positions: [],
      results: []
    };
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'isAdmin'
    ]),
    totalCandidates() {
      return this.results.reduce((total, position) => total + position.candidates.length, 0);
    },
    totalVotes() {
      return this.results.reduce((total, position) => {
        return total + position.candidates.reduce((votes, candidate) => votes + candidate.vote_count, 0);
      }, 0);
    }
  },
  async created() {
    await this.fetchResultsData();
  },
  methods: {
    async fetchResultsData() {
      this.loading = true;
      try {
        // Load election details
        const electionResponse = await apiService.getElection(this.id);
        this.election = electionResponse.data;
        
        // Load positions
        const positionsResponse = await apiService.getPositions(this.id);
        this.positions = positionsResponse.data;
        
        // If election is closed or user is admin, fetch results
        if (this.election.status === 'closed' || this.isAdmin) {
          const resultsResponse = await apiService.getElectionResults(this.id);
          this.results = resultsResponse.data.results;
        }
      } catch (error) {
        console.error('Error fetching results data:', error);
        this.$store.commit('setNotification', {
          message: 'Failed to load election results',
          type: 'danger'
        });
      } finally {
        this.loading = false;
      }
    },
    getPositionTitle(positionId) {
      const position = this.positions.find(p => p.id === positionId);
      return position ? position.title : `Position ${positionId}`;
    },
    formatDateRange(startDate, endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Format date range
      const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
      return `${start.toLocaleDateString(undefined, dateOptions)} - ${end.toLocaleDateString(undefined, dateOptions)}`;
    },
    shortenAddress(address) {
      if (!address) return '';
      return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }
  }
};
</script>

<style scoped>
.election-results {
  margin-top: 2rem;
}

.results-header {
  border-bottom: 1px solid #eee;
  padding-bottom: 1.5rem;
  margin-bottom: 2rem;
}

.election-title {
  font-weight: 500;
  color: #333;
}

.election-meta {
  display: flex;
  align-items: center;
}

.blockchain-badge {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 20px;
  padding: 5px 12px;
  color: #1890ff;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
}

.contract-link {
  color: #1890ff;
  text-decoration: none;
}

.contract-link:hover {
  text-decoration: underline;
}

.no-results {
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-top: 1rem;
}

.results-summary {
  background-color: #f8f9fa;
  border: none;
  border-radius: 8px;
}

.summary-item {
  text-align: center;
  padding: 10px;
}

.summary-value {
  font-size: 2rem;
  font-weight: 600;
  color: #1890ff;
}

.summary-label {
  color: #666;
  font-size: 0.9rem;
}

.results-locked-icon {
  font-size: 4rem;
  color: #d9d9d9;
  margin-bottom: 1rem;
}

.results-unavailable {
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 30px;
}
</style>
