<template>
  <div class="candidate-management">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Candidate Management</h2>
      <button @click="showCreateForm" class="btn btn-primary">
        <i class="fas fa-plus me-1"></i>
        Add New Candidate
      </button>
    </div>
    
    <!-- Candidate Form -->
    <div v-if="showForm" class="mb-5">
      <CandidateForm 
        :candidate="selectedCandidate"
        :elections="allElections"
        :parties="parties"
        @create="handleCreateCandidate"
        @update="handleUpdateCandidate"
        @cancel="hideForm"
      />
    </div>
    
    <!-- Candidate List -->
    <div v-else>
      <div class="card">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Candidates</h5>
          <div class="filter-group">
            <div class="input-group">
              <input 
                type="text" 
                class="form-control form-control-sm" 
                placeholder="Search candidates..." 
                v-model="searchTerm"
              >
              <select v-model="electionFilter" class="form-select form-select-sm">
                <option value="">All Elections</option>
                <option v-for="election in allElections" :key="election.electionId" :value="election.electionId">
                  {{ election.title }}
                </option>
              </select>
              <button class="btn btn-light btn-sm">
                <i class="fas fa-search"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="card-body p-0">
          <div v-if="isLoading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading candidates...</p>
          </div>
          
          <div v-else-if="filteredCandidates.length === 0" class="text-center py-4">
            <div class="alert alert-info m-3">
              <i class="fas fa-info-circle me-2"></i>
              No candidates found matching your criteria.
            </div>
          </div>
          
          <div v-else class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Election</th>
                  <th>Position</th>
                  <th>Party</th>
                  <th>Bio</th>
                  <th class="text-center">Wallet</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="candidate in filteredCandidates" :key="candidate.candidateId">
                  <td>{{ candidate.name }}</td>
                  <td>{{ getElectionName(candidate.electionId) }}</td>
                  <td>{{ getPositionName(candidate.electionId, candidate.positionId) }}</td>
                  <td>
                    <span v-if="candidate.partyId" class="party-badge" :style="getPartyStyle(candidate.partyId)">
                      {{ getPartyName(candidate.partyId) }}
                    </span>
                    <span v-else class="text-muted">Independent</span>
                  </td>
                  <td>
                    <span class="text-truncate d-inline-block" style="max-width: 150px;">
                      {{ candidate.bio }}
                    </span>
                  </td>
                  <td class="text-center">
                    <span v-if="candidate.wallet" class="wallet-address">
                      {{ truncateAddress(candidate.wallet) }}
                    </span>
                    <span v-else class="text-muted">
                      <i class="fas fa-times-circle me-1"></i>
                      Not set
                    </span>
                  </td>
                  <td class="text-center">
                    <div class="btn-group">
                      <button @click="editCandidate(candidate)" class="btn btn-sm btn-outline-primary">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button @click="viewManifesto(candidate)" class="btn btn-sm btn-outline-info">
                        <i class="fas fa-file-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Manifesto Modal -->
    <div class="modal fade" id="manifestoModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" v-if="selectedCandidate">{{ selectedCandidate.name }} - Manifesto</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedCandidate">
            <p>{{ selectedCandidate.manifesto }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import CandidateForm from '@/components/admin/CandidateForm.vue'

export default {
  name: 'CandidateManagement',
  components: {
    CandidateForm
  },
  data() {
    return {
      showForm: false,
      selectedCandidate: null,
      isLoading: false,
      searchTerm: '',
      electionFilter: '',
      manifestoModal: null,
      parties: [
        { partyId: 1, name: 'Unity Party', color: '#4CAF50' },
        { partyId: 2, name: 'Green Future', color: '#2196F3' },
        { partyId: 3, name: 'Student Voice', color: '#FF9800' },
        { partyId: 4, name: 'Progress Alliance', color: '#9C27B0' }
      ]
    }
  },
  computed: {
    ...mapGetters(['allElections', 'candidates']),
    filteredCandidates() {
      let filtered = [...this.candidates]
      
      // Filter by election if selected
      if (this.electionFilter) {
        const electionId = parseInt(this.electionFilter)
        filtered = filtered.filter(c => c.electionId === electionId)
      }
      
      // Filter by search term if entered
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase()
        filtered = filtered.filter(c => 
          c.name.toLowerCase().includes(term) || 
          c.bio.toLowerCase().includes(term) || 
          (c.manifesto && c.manifesto.toLowerCase().includes(term))
        )
      }
      
      return filtered
    }
  },
  methods: {
    ...mapActions(['fetchCandidates', 'createCandidate', 'updateElection']),
    truncateAddress(address) {
      if (!address) return ''
      return address.slice(0, 6) + '...' + address.slice(-4)
    },
    getElectionName(electionId) {
      const election = this.allElections.find(e => e.electionId === electionId)
      return election ? election.title : 'Unknown Election'
    },
    getPositionName(electionId, positionId) {
      const election = this.allElections.find(e => e.electionId === electionId)
      if (!election || !election.positions) return 'Unknown Position'
      
      const position = election.positions.find(p => p.positionId === positionId)
      return position ? position.title : 'Unknown Position'
    },
    getPartyName(partyId) {
      const party = this.parties.find(p => p.partyId === partyId)
      return party ? party.name : 'Unknown Party'
    },
    getPartyStyle(partyId) {
      const party = this.parties.find(p => p.partyId === partyId)
      return party ? { backgroundColor: party.color, color: 'white' } : {}
    },
    showCreateForm() {
      this.selectedCandidate = null
      this.showForm = true
    },
    editCandidate(candidate) {
      this.selectedCandidate = candidate
      this.showForm = true
    },
    hideForm() {
      this.showForm = false
      this.selectedCandidate = null
    },
    viewManifesto(candidate) {
      this.selectedCandidate = candidate
      
      // Initialize and show the modal
      this.manifestoModal = new bootstrap.Modal(document.getElementById('manifestoModal'))
      this.manifestoModal.show()
    },
    async handleCreateCandidate(candidateData) {
      try {
        await this.createCandidate(candidateData)
        this.hideForm()
      } catch (error) {
        console.error('Error creating candidate:', error)
      }
    },
    async handleUpdateCandidate({ id, data }) {
      try {
        // Call the API to update candidate
        await this.updateCandidate({ id, data })
        this.hideForm()
      } catch (error) {
        console.error('Error updating candidate:', error)
      }
    }
  },
  async created() {
    this.isLoading = true
    try {
      await this.fetchCandidates()
    } catch (error) {
      console.error('Error fetching candidates:', error)
    } finally {
      this.isLoading = false
    }
  }
}
</script>

<style scoped>
.party-badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
}

.wallet-address {
  font-family: monospace;
  font-size: 0.85rem;
}

.filter-group {
  width: 350px;
}
</style>
