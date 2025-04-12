<template>
  <div class="manage-candidates">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Manage Candidates</h2>
      <button @click="showCreateForm = true" class="btn btn-primary" :disabled="!selectedElection">
        <i class="fas fa-plus me-2"></i>Add New Candidate
      </button>
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
        <router-link to="/admin/candidates" class="nav-link" exact-active-class="active">
          <i class="fas fa-user-tie me-2"></i>Candidates
        </router-link>
      </li>
      <li class="nav-item">
        <router-link to="/admin/voters" class="nav-link">
          <i class="fas fa-users me-2"></i>Voters
        </router-link>
      </li>
      <li class="nav-item">
        <router-link to="/admin/results" class="nav-link">
          <i class="fas fa-chart-bar me-2"></i>Results
        </router-link>
      </li>
    </ul>
    
    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-4 mb-3 mb-md-0">
            <label class="form-label">Election</label>
            <select 
              class="form-select" 
              v-model="filters.electionId"
              @change="onElectionChange">
              <option value="">All Elections</option>
              <option 
                v-for="election in elections" 
                :key="election.electionId" 
                :value="election.electionId">
                {{ election.title }}
              </option>
            </select>
          </div>
          <div class="col-md-4 mb-3 mb-md-0">
            <label class="form-label">Position</label>
            <select 
              class="form-select" 
              v-model="filters.positionId"
              :disabled="!selectedElection || !selectedElection.positions.length">
              <option value="">All Positions</option>
              <option 
                v-for="position in selectedElection?.positions || []" 
                :key="position.positionId" 
                :value="position.positionId">
                {{ position.title }}
              </option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Search</label>
            <div class="input-group">
              <input 
                type="text" 
                class="form-control" 
                placeholder="Search candidates..." 
                v-model="filters.search">
              <span class="input-group-text">
                <i class="fas fa-search"></i>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Candidates Grid -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Loading candidates...</p>
    </div>
    
    <div v-else-if="!selectedElection && !filters.electionId" class="text-center py-5">
      <div class="alert alert-info d-inline-block">
        <i class="fas fa-info-circle me-2"></i>
        Please select an election to manage candidates
      </div>
    </div>
    
    <div v-else-if="filteredCandidates.length === 0" class="text-center py-5">
      <div class="empty-state">
        <i class="fas fa-user-tie fa-4x text-muted mb-3"></i>
        <h4>No Candidates Found</h4>
        <p class="text-muted mb-4">
          {{ getEmptyMessage() }}
        </p>
        <button @click="showCreateForm = true" class="btn btn-primary">
          <i class="fas fa-plus me-2"></i>Add Candidate
        </button>
      </div>
    </div>
    
    <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-4">
      <div v-for="candidate in filteredCandidates" :key="candidate.candidateId" class="col">
        <div class="card h-100">
          <img :src="getCandidateImage(candidate.candidateId)" class="card-img-top candidate-img" alt="Candidate Photo">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="card-title mb-0">{{ candidate.name }}</h5>
              <span 
                v-if="getPartyName(candidate.partyId)" 
                class="badge bg-primary">
                {{ getPartyName(candidate.partyId) }}
              </span>
            </div>
            <p class="text-muted small mb-2">{{ getPositionTitle(candidate.positionId) }}</p>
            <p class="card-text">{{ candidate.bio }}</p>
            
            <div class="accordion accordion-flush" :id="`accordion${candidate.candidateId}`">
              <div class="accordion-item">
                <h2 class="accordion-header" :id="`heading${candidate.candidateId}`">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                          :data-bs-target="`#collapse${candidate.candidateId}`">
                    Manifesto
                  </button>
                </h2>
                <div :id="`collapse${candidate.candidateId}`" class="accordion-collapse collapse"
                     :aria-labelledby="`heading${candidate.candidateId}`">
                  <div class="accordion-body">
                    {{ candidate.manifesto }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="card-footer bg-transparent d-flex justify-content-between">
            <button 
              @click="editCandidate(candidate)" 
              class="btn btn-sm btn-outline-primary">
              <i class="fas fa-edit me-1"></i>Edit
            </button>
            <button 
              @click="deleteCandidate(candidate)" 
              class="btn btn-sm btn-outline-danger">
              <i class="fas fa-trash me-1"></i>Delete
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Create/Edit Candidate Modal -->
    <div v-if="showCreateForm || showEditForm" class="modal-backdrop" @click="closeModal">
      <div class="modal-dialog modal-lg" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ showEditForm ? 'Edit' : 'Add' }} Candidate</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitCandidateForm">
              <div class="mb-3">
                <label for="name" class="form-label">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  class="form-control" 
                  v-model="candidateForm.name"
                  required>
              </div>
              
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="electionId" class="form-label">Election</label>
                  <select 
                    id="electionId" 
                    class="form-select" 
                    v-model="candidateForm.electionId"
                    required
                    @change="onFormElectionChange">
                    <option value="" disabled>Select an election</option>
                    <option 
                      v-for="election in elections" 
                      :key="election.electionId" 
                      :value="election.electionId">
                      {{ election.title }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label for="positionId" class="form-label">Position</label>
                  <select 
                    id="positionId" 
                    class="form-select" 
                    v-model="candidateForm.positionId"
                    required
                    :disabled="!formElection">
                    <option value="" disabled>Select a position</option>
                    <option 
                      v-for="position in formElection?.positions || []" 
                      :key="position.positionId" 
                      :value="position.positionId">
                      {{ position.title }}
                    </option>
                  </select>
                </div>
              </div>
              
              <div class="mb-3">
                <label for="partyId" class="form-label">Party</label>
                <select 
                  id="partyId" 
                  class="form-select" 
                  v-model="candidateForm.partyId"
                  :disabled="!formElection">
                  <option value="">Independent (No Party)</option>
                  <option 
                    v-for="party in formElection?.parties || []" 
                    :key="party.partyId" 
                    :value="party.partyId">
                    {{ party.name }}
                  </option>
                </select>
              </div>
              
              <div class="mb-3">
                <label for="bio" class="form-label">Short Bio</label>
                <input 
                  type="text" 
                  id="bio" 
                  class="form-control" 
                  v-model="candidateForm.bio"
                  placeholder="e.g. 3rd-year Computer Science student"
                  required>
              </div>
              
              <div class="mb-3">
                <label for="manifesto" class="form-label">Manifesto</label>
                <textarea 
                  id="manifesto" 
                  class="form-control" 
                  v-model="candidateForm.manifesto"
                  rows="3"
                  required></textarea>
              </div>
              
              <div class="mb-3">
                <label for="photoUrl" class="form-label">Photo URL</label>
                <div class="input-group">
                  <input 
                    type="text" 
                    id="photoUrl" 
                    class="form-control" 
                    v-model="candidateForm.photoUrl"
                    required>
                  <button 
                    class="btn btn-outline-secondary" 
                    type="button"
                    @click="selectCandidatePhoto">
                    Browse Photos
                  </button>
                </div>
                <div class="form-text">URL to candidate's photo</div>
              </div>
              
              <div class="mb-3">
                <label for="wallet" class="form-label">Wallet Address</label>
                <input 
                  type="text" 
                  id="wallet" 
                  class="form-control" 
                  v-model="candidateForm.wallet"
                  placeholder="0x...">
                <div class="form-text">Optional Ethereum address for the candidate</div>
              </div>
              
              <div class="d-grid gap-2">
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="isSubmitting">
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ showEditForm ? 'Update' : 'Add' }} Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'
import contractService from '@/contracts/index'

export default {
  name: 'ManageCandidates',
  data() {
    return {
      candidates: [],
      elections: [],
      isLoading: true,
      isSubmitting: false,
      showCreateForm: false,
      showEditForm: false,
      selectedElection: null,
      formElection: null,
      filters: {
        electionId: '',
        positionId: '',
        search: ''
      },
      candidateForm: {
        name: '',
        electionId: '',
        positionId: '',
        partyId: '',
        bio: '',
        manifesto: '',
        photoUrl: '',
        wallet: ''
      },
      editCandidateId: null,
      candidateImages: [
        'https://images.unsplash.com/photo-1516534775068-ba3e7458af70',
        'https://images.unsplash.com/photo-1503676382389-4809596d5290',
        'https://images.unsplash.com/photo-1530099486328-e021101a494a',
        'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06',
        'https://images.unsplash.com/photo-1460518451285-97b6aa326961',
        'https://images.unsplash.com/photo-1494883759339-0b042055a4ee'
      ]
    }
  },
  computed: {
    filteredCandidates() {
      return this.candidates.filter(candidate => {
        // Filter by election
        if (this.filters.electionId && candidate.electionId !== parseInt(this.filters.electionId)) {
          return false
        }
        
        // Filter by position
        if (this.filters.positionId && candidate.positionId !== parseInt(this.filters.positionId)) {
          return false
        }
        
        // Filter by search term
        if (this.filters.search) {
          const searchTerm = this.filters.search.toLowerCase()
          return candidate.name.toLowerCase().includes(searchTerm) || 
                 candidate.bio.toLowerCase().includes(searchTerm) ||
                 candidate.manifesto.toLowerCase().includes(searchTerm)
        }
        
        return true
      })
    }
  },
  methods: {
    async fetchData() {
      try {
        this.isLoading = true
        
        // Fetch elections
        const electionsResponse = await api.getElections()
        this.elections = electionsResponse.data
        
        // Check if election ID is in URL params
        const urlElectionId = this.$route.query.election
        if (urlElectionId) {
          this.filters.electionId = parseInt(urlElectionId)
          this.onElectionChange()
          
          // Also check for position ID in URL params
          const urlPositionId = this.$route.query.position
          if (urlPositionId) {
            this.filters.positionId = parseInt(urlPositionId)
          }
        }
        
        // Fetch candidates
        if (this.filters.electionId) {
          // Fetch candidates for specific election
          const candidatesResponse = await api.getCandidatesByElection(this.filters.electionId)
          this.candidates = candidatesResponse.data
        } else {
          // Fetch all candidates
          const candidatesResponse = await api.getCandidates()
          this.candidates = candidatesResponse.data
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        alert('Failed to load data. Please try again.')
      } finally {
        this.isLoading = false
      }
    },
    onElectionChange() {
      if (this.filters.electionId) {
        this.selectedElection = this.elections.find(e => e.electionId === parseInt(this.filters.electionId))
        
        // Reset position filter if the selected position isn't in this election
        if (this.filters.positionId && !this.selectedElection.positions.some(p => p.positionId === parseInt(this.filters.positionId))) {
          this.filters.positionId = ''
        }
      } else {
        this.selectedElection = null
        this.filters.positionId = ''
      }
      
      // Refresh candidates based on the new election
      this.fetchData()
    },
    onFormElectionChange() {
      // Update formElection when the election in the form changes
      this.formElection = this.elections.find(e => e.electionId === parseInt(this.candidateForm.electionId))
      
      // Reset position if it's not available in the new election
      if (this.candidateForm.positionId && !this.formElection.positions.some(p => p.positionId === parseInt(this.candidateForm.positionId))) {
        this.candidateForm.positionId = ''
      }
      
      // Reset party if it's not available in the new election
      if (this.candidateForm.partyId && !this.formElection.parties.some(p => p.partyId === parseInt(this.candidateForm.partyId))) {
        this.candidateForm.partyId = ''
      }
    },
    getPositionTitle(positionId) {
      for (const election of this.elections) {
        const position = election.positions.find(p => p.positionId === positionId)
        if (position) return position.title
      }
      return 'Unknown Position'
    },
    getPartyName(partyId) {
      if (!partyId) return ''
      
      for (const election of this.elections) {
        const party = election.parties.find(p => p.partyId === partyId)
        if (party) return party.name
      }
      return 'Independent'
    },
    getCandidateImage(candidateId) {
      // Use modulo to cycle through the images based on candidateId
      const index = (candidateId % this.candidateImages.length)
      return this.candidateImages[index]
    },
    selectCandidatePhoto() {
      // For simplicity, just cycle through the available images
      const index = Math.floor(Math.random() * this.candidateImages.length)
      this.candidateForm.photoUrl = this.candidateImages[index]
    },
    resetForm() {
      // Preserve election and position if filters are applied
      const electionId = this.filters.electionId || ''
      const positionId = this.filters.positionId || ''
      
      this.candidateForm = {
        name: '',
        electionId: electionId,
        positionId: positionId,
        partyId: '',
        bio: '',
        manifesto: '',
        photoUrl: '',
        wallet: ''
      }
      
      // Update form election based on the selected election
      if (electionId) {
        this.formElection = this.elections.find(e => e.electionId === parseInt(electionId))
      } else {
        this.formElection = null
      }
    },
    editCandidate(candidate) {
      this.editCandidateId = candidate.candidateId
      this.candidateForm = {
        name: candidate.name,
        electionId: candidate.electionId,
        positionId: candidate.positionId,
        partyId: candidate.partyId || '',
        bio: candidate.bio,
        manifesto: candidate.manifesto,
        photoUrl: candidate.photoUrl,
        wallet: candidate.wallet || ''
      }
      
      // Set form election
      this.formElection = this.elections.find(e => e.electionId === candidate.electionId)
      
      this.showEditForm = true
    },
    async deleteCandidate(candidate) {
      if (!confirm(`Are you sure you want to delete ${candidate.name}? This cannot be undone.`)) {
        return
      }
      
      try {
        await api.deleteCandidate(candidate.candidateId)
        
        // Remove from local state
        this.candidates = this.candidates.filter(c => c.candidateId !== candidate.candidateId)
        
        alert('Candidate deleted successfully')
      } catch (error) {
        console.error('Error deleting candidate:', error)
        alert(`Failed to delete candidate: ${error.message}`)
      }
    },
    closeModal() {
      this.showCreateForm = false
      this.showEditForm = false
      this.editCandidateId = null
      this.resetForm()
    },
    getEmptyMessage() {
      if (this.filters.search) {
        return `No candidates found matching "${this.filters.search}".`
      } else if (this.filters.positionId) {
        const position = this.selectedElection.positions.find(p => p.positionId === parseInt(this.filters.positionId))
        return `No candidates found for ${position?.title || 'this position'}.`
      } else if (this.filters.electionId) {
        return `No candidates found for ${this.selectedElection?.title || 'this election'}.`
      } else {
        return 'No candidates found. Add one to get started.'
      }
    },
    async submitCandidateForm() {
      try {
        this.isSubmitting = true
        
        // Format form data
        const formData = {
          name: this.candidateForm.name,
          electionId: parseInt(this.candidateForm.electionId),
          positionId: parseInt(this.candidateForm.positionId),
          partyId: this.candidateForm.partyId ? parseInt(this.candidateForm.partyId) : null,
          bio: this.candidateForm.bio,
          manifesto: this.candidateForm.manifesto,
          photoUrl: this.candidateForm.photoUrl,
          wallet: this.candidateForm.wallet || null
        }
        
        let response
        if (this.showEditForm) {
          // Update existing candidate
          response = await api.updateCandidate(this.editCandidateId, formData)
          
          // Update in local state
          const index = this.candidates.findIndex(c => c.candidateId === this.editCandidateId)
          if (index !== -1) {
            this.candidates[index] = response.data
          }
          
          // Update candidate in blockchain
          await contractService.updateCandidate(
            formData.electionId,
            formData.positionId,
            this.editCandidateId,
            formData.name
          )
        } else {
          // Create new candidate
          response = await api.createCandidate(formData)
          
          // Add to local state
          this.candidates.push(response.data)
          
          // Add candidate to blockchain
          await contractService.addCandidate(
            formData.electionId,
            formData.positionId,
            response.data.candidateId,
            formData.name
          )
        }
        
        // Close modal and show success
        this.closeModal()
        alert(`Candidate ${this.showEditForm ? 'updated' : 'added'} successfully`)
      } catch (error) {
        console.error('Error submitting candidate:', error)
        alert(`Failed to ${this.showEditForm ? 'update' : 'add'} candidate: ${error.message}`)
      } finally {
        this.isSubmitting = false
      }
    }
  },
  mounted() {
    this.fetchData()
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-dialog {
  width: 100%;
  max-width: 800px;
  margin: 1.75rem auto;
}

.nav-tabs .nav-link {
  padding: 0.75rem 1.25rem;
}

.nav-tabs .nav-link.active {
  font-weight: bold;
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.candidate-img {
  height: 200px;
  object-fit: cover;
}

.empty-state {
  padding: 40px 0;
}

.empty-state i {
  opacity: 0.5;
}
</style>
