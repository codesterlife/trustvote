<template>
  <div class="admin-candidates mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3>Manage Candidates</h3>
      <router-link :to="{ name: 'CreateCandidate' }" class="btn btn-primary">
        <i class="bi bi-plus-circle me-1"></i> Add New Candidate
      </router-link>
    </div>
    
    <div class="mb-4">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Filter Candidates</h5>
          <div class="row">
            <div class="col-md-5">
              <label for="election-filter" class="form-label">Election</label>
              <select 
                id="election-filter" 
                class="form-select" 
                v-model="filters.electionId"
                @change="loadCandidates">
                <option value="">All Elections</option>
                <option v-for="election in elections" :key="election.id" :value="election.id">
                  {{ election.title }}
                </option>
              </select>
            </div>
            
            <div class="col-md-5">
              <label for="position-filter" class="form-label">Position</label>
              <select 
                id="position-filter" 
                class="form-select" 
                v-model="filters.positionId"
                @change="loadCandidates">
                <option value="">All Positions</option>
                <option v-for="position in filteredPositions" :key="position.id" :value="position.id">
                  {{ position.title }}
                </option>
              </select>
            </div>
            
            <div class="col-md-2 d-flex align-items-end">
              <button @click="resetFilters" class="btn btn-outline-secondary w-100">
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Loading candidates...</p>
    </div>
    
    <div v-else-if="candidates.length === 0" class="alert alert-info">
      <i class="bi bi-info-circle-fill me-2"></i>
      No candidates found for the selected filters.
    </div>
    
    <div v-else>
      <div class="row">
        <div v-for="candidate in candidates" :key="candidate.id" class="col-md-6 col-lg-4 mb-4">
          <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0 candidate-name">{{ candidate.name }}</h5>
              <div class="btn-group">
                <router-link 
                  :to="{ name: 'EditCandidate', params: { id: candidate.id } }" 
                  class="btn btn-sm btn-outline-primary">
                  <i class="bi bi-pencil-fill"></i>
                </router-link>
                <button 
                  @click="confirmDeleteCandidate(candidate)" 
                  class="btn btn-sm btn-outline-danger">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </div>
            </div>
            
            <div class="card-body">
              <div class="candidate-details">
                <div class="detail-item">
                  <span class="detail-label">Position:</span>
                  <span class="detail-value">{{ candidate.position_title }}</span>
                </div>
                
                <div class="detail-item" v-if="candidate.party_name">
                  <span class="detail-label">Party:</span>
                  <span class="detail-value">{{ candidate.party_name }}</span>
                </div>
                
                <div class="detail-item" v-if="candidate.wallet_address">
                  <span class="detail-label">Wallet:</span>
                  <span class="detail-value wallet-address">{{ shortenAddress(candidate.wallet_address) }}</span>
                </div>
                
                <div class="detail-item bio-item" v-if="candidate.bio">
                  <span class="detail-label">Bio:</span>
                  <span class="detail-value">{{ truncateBio(candidate.bio) }}</span>
                </div>
              </div>
              
              <div class="candidate-photo mt-3">
                <img :src="getCandidateImage(candidate)" alt="Candidate Photo" class="img-fluid rounded">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="deleteModalLabel">Confirm Deletion</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete the candidate: <strong>{{ selectedCandidate?.name }}</strong>?</p>
            <p class="text-danger">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="deleteCandidate">
              Delete Candidate
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiService from '@/services/api';
import candidateImages from '@/constants/candidateImages';
import { Modal } from 'bootstrap';

export default {
  name: 'AdminCandidates',
  data() {
    return {
      loading: true,
      candidates: [],
      elections: [],
      positions: [],
      filters: {
        electionId: '',
        positionId: ''
      },
      selectedCandidate: null,
      deleteModal: null
    };
  },
  computed: {
    filteredPositions() {
      if (!this.filters.electionId) {
        return this.positions;
      }
      return this.positions.filter(position => 
        position.election === parseInt(this.filters.electionId)
      );
    }
  },
  async created() {
    await this.loadInitialData();
  },
  mounted() {
    this.deleteModal = new Modal(document.getElementById('deleteModal'));
  },
  methods: {
    async loadInitialData() {
      this.loading = true;
      try {
        // Load all elections
        const electionsResponse = await apiService.getElections();
        this.elections = electionsResponse.data;
        
        // Load all positions
        const positionsResponse = await apiService.getPositions('');
        this.positions = positionsResponse.data;
        
        // Load candidates based on initial filters
        await this.loadCandidates();
      } catch (error) {
        console.error('Error loading initial data:', error);
        this.$store.commit('setNotification', {
          message: 'Failed to load data',
          type: 'danger'
        });
      }
    },
    async loadCandidates() {
      this.loading = true;
      try {
        const filter = {};
        
        if (this.filters.electionId) {
          filter.election = this.filters.electionId;
        }
        
        if (this.filters.positionId) {
          filter.position = this.filters.positionId;
        }
        
        const response = await apiService.getCandidates(filter);
        this.candidates = response.data;
      } catch (error) {
        console.error('Error loading candidates:', error);
        this.$store.commit('setNotification', {
          message: 'Failed to load candidates',
          type: 'danger'
        });
      } finally {
        this.loading = false;
      }
    },
    resetFilters() {
      this.filters.electionId = '';
      this.filters.positionId = '';
      this.loadCandidates();
    },
    getCandidateImage(candidate) {
      // Use candidate photo_url if available, otherwise use a placeholder
      if (candidate.photo_url) {
        return candidate.photo_url;
      }
      
      // Use index based on candidate ID to select an image
      const imageIndex = (candidate.id % candidateImages.length);
      return candidateImages[imageIndex];
    },
    truncateBio(bio) {
      if (!bio) return '';
      return bio.length > 100 ? bio.substring(0, 100) + '...' : bio;
    },
    shortenAddress(address) {
      if (!address) return '';
      return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    },
    confirmDeleteCandidate(candidate) {
      this.selectedCandidate = candidate;
      this.deleteModal.show();
    },
    async deleteCandidate() {
      if (!this.selectedCandidate) return;
      
      try {
        await apiService.deleteCandidate(this.selectedCandidate.id);
        
        this.deleteModal.hide();
        this.$store.commit('setNotification', {
          message: 'Candidate deleted successfully',
          type: 'success'
        });
        
        // Reload candidates
        await this.loadCandidates();
      } catch (error) {
        console.error('Error deleting candidate:', error);
        this.$store.commit('setNotification', {
          message: 'Failed to delete candidate',
          type: 'danger'
        });
      }
    }
  }
};
</script>

<style scoped>
.admin-candidates {
  min-height: 400px;
}

.card {
  transition: all 0.3s ease;
  height: 100%;
}

.card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.candidate-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.detail-item {
  margin-bottom: 8px;
}

.detail-label {
  font-weight: 600;
  color: #555;
  margin-right: 5px;
}

.bio-item {
  margin-top: 10px;
}

.wallet-address {
  font-family: monospace;
  font-size: 0.9rem;
}

.candidate-photo {
  max-width: 120px;
  margin: 0 auto;
}
</style>
