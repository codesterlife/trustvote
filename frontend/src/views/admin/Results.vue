<template>
  <div class="admin-results mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3>Election Results</h3>
      <div class="election-select-container">
        <select 
          v-model="selectedElectionId" 
          class="form-select election-select" 
          @change="loadElectionResults">
          <option value="">Select an Election</option>
          <option v-for="election in elections" :key="election.id" :value="election.id">
            {{ election.title }}
          </option>
        </select>
      </div>
    </div>
    
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Loading election results...</p>
    </div>
    
    <div v-else-if="!selectedElectionId" class="alert alert-info text-center">
      <i class="bi bi-info-circle-fill me-2"></i>
      Please select an election to view its results.
    </div>
    
    <div v-else-if="!selectedElection" class="alert alert-danger">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      Error loading election details.
    </div>
    
    <div v-else>
      <div class="election-info card mb-4">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h4 class="card-title">{{ selectedElection.title }}</h4>
              <p class="card-text">{{ selectedElection.description }}</p>
              
              <div class="election-meta">
                <div class="meta-item">
                  <span class="meta-label">Start Time:</span>
                  <span class="meta-value">{{ formatDate(selectedElection.start_time) }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">End Time:</span>
                  <span class="meta-value">{{ formatDate(selectedElection.end_time) }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Status:</span>
                  <span :class="getStatusClass(selectedElection.status)">
                    {{ formatStatus(selectedElection.status) }}
                  </span>
                </div>
              </div>
            </div>
            
            <div v-if="selectedElection.contract_address" class="blockchain-badge">
              <i class="bi bi-link-45deg me-1"></i>
              Blockchain Contract:
              <a :href="'https://etherscan.io/address/' + selectedElection.contract_address" 
                 target="_blank"
                 class="ms-1 contract-link">
                {{ shortenAddress(selectedElection.contract_address) }}
                <i class="bi bi-box-arrow-up-right"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="resultsData.length === 0" class="alert alert-warning">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        No results available for this election yet.
      </div>
      
      <div v-else>
        <div class="mb-4 results-summary card">
          <div class="card-body">
            <h5 class="card-title">Election Summary</h5>
            <div class="row mt-3">
              <div class="col-md-4">
                <div class="summary-item">
                  <div class="summary-value">{{ resultsData.length }}</div>
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
          <div v-for="position in resultsData" :key="position.position_id" class="mb-4">
            <ResultsChart 
              :positionTitle="position.position_title" 
              :results="position.candidates" 
            />
          </div>
        </div>
        
        <div class="mt-4 text-center" v-if="selectedElection.status === 'voting'">
          <div class="alert alert-info">
            <i class="bi bi-info-circle-fill me-2"></i>
            This election is still active. Results may change as more votes are cast.
          </div>
        </div>
        
        <div class="mt-4 export-section">
          <h5>Export Results</h5>
          <div class="btn-group">
            <button @click="exportJSON" class="btn btn-outline-primary">
              <i class="bi bi-filetype-json me-1"></i> Export as JSON
            </button>
            <button @click="exportCSV" class="btn btn-outline-primary">
              <i class="bi bi-filetype-csv me-1"></i> Export as CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiService from '@/services/api';
import ResultsChart from '@/components/ResultsChart.vue';

export default {
  name: 'AdminResults',
  components: {
    ResultsChart
  },
  data() {
    return {
      loading: false,
      elections: [],
      selectedElectionId: '',
      selectedElection: null,
      resultsData: []
    };
  },
  computed: {
    totalCandidates() {
      return this.resultsData.reduce((total, position) => {
        return total + position.candidates.length;
      }, 0);
    },
    totalVotes() {
      return this.resultsData.reduce((total, position) => {
        return total + position.candidates.reduce((votes, candidate) => {
          return votes + candidate.vote_count;
        }, 0);
      }, 0);
    }
  },
  async created() {
    await this.fetchElections();
    
    // Check if an election ID was passed in the query params
    const queryElectionId = this.$route.query.electionId;
    if (queryElectionId) {
      this.selectedElectionId = queryElectionId;
      this.loadElectionResults();
    }
  },
  methods: {
    async fetchElections() {
      this.loading = true;
      try {
        const response = await apiService.getElections();
        this.elections = response.data;
      } catch (error) {
        console.error('Error fetching elections:', error);
        this.$store.commit('setNotification', {
          message: 'Failed to load elections',
          type: 'danger'
        });
      } finally {
        this.loading = false;
      }
    },
    async loadElectionResults() {
      if (!this.selectedElectionId) {
        this.selectedElection = null;
        this.resultsData = [];
        return;
      }
      
      this.loading = true;
      
      try {
        // Get election details
        const electionResponse = await apiService.getElection(this.selectedElectionId);
        this.selectedElection = electionResponse.data;
        
        // Get results
        const resultsResponse = await apiService.getElectionResults(this.selectedElectionId);
        this.resultsData = resultsResponse.data.results;
      } catch (error) {
        console.error('Error loading election results:', error);
        this.$store.commit('setNotification', {
          message: 'Failed to load election results',
          type: 'danger'
        });
        this.selectedElection = null;
        this.resultsData = [];
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString();
    },
    formatStatus(status) {
      const statusMap = {
        'init': 'Setup',
        'voting': 'Voting Active',
        'closed': 'Closed'
      };
      return statusMap[status] || status;
    },
    getStatusClass(status) {
      const classMap = {
        'init': 'badge bg-secondary',
        'voting': 'badge bg-success',
        'closed': 'badge bg-dark'
      };
      return classMap[status] || 'badge bg-secondary';
    },
    shortenAddress(address) {
      if (!address) return '';
      return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    },
    exportJSON() {
      if (!this.selectedElection || this.resultsData.length === 0) return;
      
      const exportData = {
        election: {
          id: this.selectedElection.id,
          title: this.selectedElection.title,
          status: this.selectedElection.status,
          start_time: this.selectedElection.start_time,
          end_time: this.selectedElection.end_time,
          contract_address: this.selectedElection.contract_address
        },
        results: this.resultsData
      };
      
      const jsonStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonStr);
      
      const fileName = `election_results_${this.selectedElection.id}.json`;
      this.downloadFile(dataUri, fileName);
    },
    exportCSV() {
      if (!this.selectedElection || this.resultsData.length === 0) return;
      
      let csvContent = 'Position,Candidate,Party,Votes\n';
      
      this.resultsData.forEach(position => {
        position.candidates.forEach(candidate => {
          csvContent += `"${position.position_title}","${candidate.candidate_name}","${candidate.party_name || ''}",${candidate.vote_count}\n`;
        });
      });
      
      const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
      const fileName = `election_results_${this.selectedElection.id}.csv`;
      this.downloadFile(dataUri, fileName);
    },
    downloadFile(dataUri, fileName) {
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};
</script>

<style scoped>
.admin-results {
  min-height: 400px;
}

.election-select-container {
  width: 300px;
}

.election-meta {
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
}

.meta-item {
  margin-right: 20px;
  margin-bottom: 5px;
}

.meta-label {
  font-weight: 600;
  color: #555;
  margin-right: 5px;
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

.export-section {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}
</style>
