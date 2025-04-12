<template>
  <div class="manage-elections">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Manage Elections</h2>
      <button @click="showCreateForm = true" class="btn btn-primary">
        <i class="fas fa-plus me-2"></i>Create New Election
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
        <router-link to="/admin/elections" class="nav-link" exact-active-class="active">
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
        <router-link to="/admin/results" class="nav-link">
          <i class="fas fa-chart-bar me-2"></i>Results
        </router-link>
      </li>
    </ul>
    
    <!-- Elections Table -->
    <div class="card mb-4">
      <div class="card-header bg-light">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">All Elections</h5>
          <div class="input-group" style="max-width: 300px;">
            <input 
              type="text" 
              class="form-control" 
              placeholder="Search elections..." 
              v-model="searchQuery">
            <span class="input-group-text">
              <i class="fas fa-search"></i>
            </span>
          </div>
        </div>
      </div>
      <div class="card-body">
        <div v-if="isLoading" class="text-center py-3">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else-if="filteredElections.length === 0" class="text-center py-3">
          <p class="text-muted mb-0">No elections found</p>
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="election in filteredElections" :key="election.electionId">
                <td>{{ election.electionId }}</td>
                <td>{{ election.title }}</td>
                <td>
                  <span class="badge rounded-pill" :class="getStatusClass(election.status)">
                    {{ election.status }}
                  </span>
                </td>
                <td>{{ formatDate(election.startTime) }}</td>
                <td>{{ formatDate(election.endTime) }}</td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button 
                      @click="editElection(election)" 
                      class="btn btn-outline-primary">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      @click="viewPositions(election)" 
                      class="btn btn-outline-info">
                      <i class="fas fa-tasks"></i>
                    </button>
                    <button 
                      @click="changePhase(election)" 
                      class="btn btn-outline-warning"
                      v-if="canChangePhase(election)">
                      <i class="fas fa-sync-alt"></i>
                    </button>
                    <router-link 
                      :to="{ name: 'view-results', params: { id: election.electionId }}" 
                      class="btn btn-outline-success">
                      <i class="fas fa-chart-bar"></i>
                    </router-link>
                    <button 
                      @click="deleteElection(election)" 
                      class="btn btn-outline-danger"
                      v-if="canDeleteElection(election)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Create/Edit Election Modal -->
    <div v-if="showCreateForm || showEditForm" class="modal-backdrop" @click="closeModal">
      <div class="modal-dialog modal-lg" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ showEditForm ? 'Edit' : 'Create' }} Election</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitElectionForm">
              <div class="mb-3">
                <label for="title" class="form-label">Title</label>
                <input 
                  type="text" 
                  id="title" 
                  class="form-control" 
                  v-model="electionForm.title"
                  required>
              </div>
              <div class="mb-3">
                <label for="description" class="form-label">Description</label>
                <textarea 
                  id="description" 
                  class="form-control" 
                  v-model="electionForm.description"
                  rows="3"
                  required></textarea>
              </div>
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="startTime" class="form-label">Start Time</label>
                  <input 
                    type="datetime-local" 
                    id="startTime" 
                    class="form-control" 
                    v-model="electionForm.startTime"
                    required>
                </div>
                <div class="col-md-6">
                  <label for="endTime" class="form-label">End Time</label>
                  <input 
                    type="datetime-local" 
                    id="endTime" 
                    class="form-control" 
                    v-model="electionForm.endTime"
                    required>
                </div>
              </div>
              
              <!-- Positions -->
              <div class="mb-3">
                <label class="form-label">Positions</label>
                <div 
                  v-for="(position, index) in electionForm.positions" 
                  :key="index"
                  class="card mb-2">
                  <div class="card-body">
                    <div class="d-flex justify-content-between mb-2">
                      <h6 class="mb-0">Position #{{ index + 1 }}</h6>
                      <button 
                        type="button" 
                        @click="removePosition(index)" 
                        class="btn btn-outline-danger btn-sm">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                    <div class="mb-2">
                      <label :for="`position-title-${index}`" class="form-label">Title</label>
                      <input 
                        :id="`position-title-${index}`" 
                        type="text" 
                        class="form-control" 
                        v-model="position.title"
                        required>
                    </div>
                  </div>
                </div>
                <button 
                  type="button" 
                  @click="addPosition" 
                  class="btn btn-outline-primary btn-sm w-100 mt-2">
                  <i class="fas fa-plus me-2"></i>Add Position
                </button>
              </div>
              
              <!-- Parties -->
              <div class="mb-3">
                <label class="form-label">Parties</label>
                <div 
                  v-for="(party, index) in electionForm.parties" 
                  :key="index"
                  class="card mb-2">
                  <div class="card-body">
                    <div class="d-flex justify-content-between mb-2">
                      <h6 class="mb-0">Party #{{ index + 1 }}</h6>
                      <button 
                        type="button" 
                        @click="removeParty(index)" 
                        class="btn btn-outline-danger btn-sm">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                    <div class="mb-2">
                      <label :for="`party-name-${index}`" class="form-label">Name</label>
                      <input 
                        :id="`party-name-${index}`" 
                        type="text" 
                        class="form-control" 
                        v-model="party.name"
                        required>
                    </div>
                    <div class="mb-2">
                      <label :for="`party-logo-${index}`" class="form-label">Logo URL</label>
                      <div class="input-group">
                        <input 
                          :id="`party-logo-${index}`" 
                          type="text" 
                          class="form-control" 
                          v-model="party.logoUrl"
                          required>
                        <button 
                          class="btn btn-outline-secondary" 
                          type="button"
                          @click="selectPartyLogo(index)">
                          Browse
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  type="button" 
                  @click="addParty" 
                  class="btn btn-outline-primary btn-sm w-100 mt-2">
                  <i class="fas fa-plus me-2"></i>Add Party
                </button>
              </div>
              
              <div class="d-grid gap-2">
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="isSubmitting">
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ showEditForm ? 'Update' : 'Create' }} Election
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    
    <!-- View Positions Modal -->
    <div v-if="showPositionsModal" class="modal-backdrop" @click="closeModal">
      <div class="modal-dialog" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Positions for {{ selectedElection.title }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <div class="list-group">
              <div 
                v-for="position in selectedElection.positions" 
                :key="position.positionId"
                class="list-group-item list-group-item-action">
                <div class="d-flex justify-content-between align-items-center">
                  <h6 class="mb-0">{{ position.title }}</h6>
                  <router-link 
                    :to="{ name: 'manage-candidates', query: { 
                      election: selectedElection.electionId, 
                      position: position.positionId 
                    }}" 
                    class="btn btn-outline-primary btn-sm">
                    Manage Candidates
                  </router-link>
                </div>
                <small class="text-muted">
                  {{ position.candidates?.length || 0 }} candidates assigned
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Phase Change Modal -->
    <div v-if="showPhaseModal" class="modal-backdrop" @click="closeModal">
      <div class="modal-dialog" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Change Phase for {{ selectedElection.title }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-warning">
              <i class="fas fa-exclamation-triangle me-2"></i>
              Changing the phase of an election is a blockchain operation that cannot be reversed.
            </div>
            
            <div class="mb-3">
              <label class="form-label">Current Phase</label>
              <div>
                <span class="badge rounded-pill" :class="getStatusClass(selectedElection.status)">
                  {{ selectedElection.status }}
                </span>
              </div>
            </div>
            
            <div class="mb-3">
              <label class="form-label">New Phase</label>
              <select class="form-select" v-model="newPhase">
                <option value="Init" :disabled="selectedElection.status === 'Init'">Initialization</option>
                <option value="Voting" :disabled="selectedElection.status === 'Voting'">Voting Active</option>
                <option value="Closed" :disabled="selectedElection.status === 'Closed'">Voting Closed</option>
              </select>
            </div>
            
            <div class="d-grid gap-2">
              <button 
                @click="confirmPhaseChange" 
                class="btn btn-warning"
                :disabled="isPhaseChanging">
                <span v-if="isPhaseChanging" class="spinner-border spinner-border-sm me-2" role="status"></span>
                Confirm Phase Change
              </button>
            </div>
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
  name: 'ManageElections',
  data() {
    return {
      elections: [],
      isLoading: true,
      isSubmitting: false,
      isPhaseChanging: false,
      searchQuery: '',
      showCreateForm: false,
      showEditForm: false,
      showPositionsModal: false,
      showPhaseModal: false,
      selectedElection: null,
      newPhase: '',
      electionForm: {
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        positions: [],
        parties: []
      },
      partyLogos: [
        'https://images.unsplash.com/photo-1738855494164-64614836175f',
        'https://images.unsplash.com/photo-1530103862676-de8c9debad1d',
        'https://images.unsplash.com/photo-1513151233558-d860c5398176',
        'https://images.unsplash.com/photo-1438557068880-c5f474830377'
      ]
    }
  },
  computed: {
    filteredElections() {
      if (!this.searchQuery) return this.elections
      
      const query = this.searchQuery.toLowerCase()
      return this.elections.filter(election => {
        return election.title.toLowerCase().includes(query) || 
               election.description.toLowerCase().includes(query)
      })
    }
  },
  methods: {
    async fetchElections() {
      try {
        this.isLoading = true
        const response = await api.getElections()
        this.elections = response.data
      } catch (error) {
        console.error('Error fetching elections:', error)
        alert('Failed to load elections. Please try again.')
      } finally {
        this.isLoading = false
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
    resetForm() {
      this.electionForm = {
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        positions: [],
        parties: []
      }
    },
    addPosition() {
      this.electionForm.positions.push({
        title: '',
        candidates: []
      })
    },
    removePosition(index) {
      this.electionForm.positions.splice(index, 1)
    },
    addParty() {
      this.electionForm.parties.push({
        name: '',
        logoUrl: ''
      })
    },
    removeParty(index) {
      this.electionForm.parties.splice(index, 1)
    },
    selectPartyLogo(index) {
      // For simplicity, just cycle through the available logos
      const logoIndex = index % this.partyLogos.length
      this.electionForm.parties[index].logoUrl = this.partyLogos[logoIndex]
    },
    editElection(election) {
      this.selectedElection = election
      this.showEditForm = true
      
      // Format dates for datetime-local input
      const formatForInput = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toISOString().slice(0, 16)
      }
      
      this.electionForm = {
        title: election.title,
        description: election.description,
        startTime: formatForInput(election.startTime),
        endTime: formatForInput(election.endTime),
        positions: JSON.parse(JSON.stringify(election.positions || [])),
        parties: JSON.parse(JSON.stringify(election.parties || []))
      }
    },
    viewPositions(election) {
      this.selectedElection = election
      this.showPositionsModal = true
    },
    canChangePhase(election) {
      // Only allow phase changes for non-closed elections
      return election.status !== 'Closed'
    },
    changePhase(election) {
      this.selectedElection = election
      this.newPhase = this.getNextPhase(election.status)
      this.showPhaseModal = true
    },
    getNextPhase(currentPhase) {
      if (currentPhase === 'Init') return 'Voting'
      if (currentPhase === 'Voting') return 'Closed'
      return 'Init' // shouldn't happen, but just in case
    },
    async confirmPhaseChange() {
      try {
        this.isPhaseChanging = true
        
        // Call smart contract to change phase
        await contractService.changeElectionPhase(
          this.selectedElection.electionId,
          this.newPhase
        )
        
        // Update election in backend
        await api.updateElectionPhase(this.selectedElection.electionId, this.newPhase)
        
        // Update in local state
        const index = this.elections.findIndex(e => e.electionId === this.selectedElection.electionId)
        if (index !== -1) {
          this.elections[index].status = this.newPhase
        }
        
        // Close modal and show success
        this.closeModal()
        alert(`Election phase changed to ${this.newPhase}`)
      } catch (error) {
        console.error('Error changing election phase:', error)
        alert(`Failed to change election phase: ${error.message}`)
      } finally {
        this.isPhaseChanging = false
      }
    },
    canDeleteElection(election) {
      // Only allow deletion of elections in Init phase
      return election.status === 'Init'
    },
    async deleteElection(election) {
      if (!confirm(`Are you sure you want to delete "${election.title}"? This cannot be undone.`)) {
        return
      }
      
      try {
        await api.deleteElection(election.electionId)
        
        // Remove from local state
        this.elections = this.elections.filter(e => e.electionId !== election.electionId)
        
        alert('Election deleted successfully')
      } catch (error) {
        console.error('Error deleting election:', error)
        alert(`Failed to delete election: ${error.message}`)
      }
    },
    closeModal() {
      this.showCreateForm = false
      this.showEditForm = false
      this.showPositionsModal = false
      this.showPhaseModal = false
      this.selectedElection = null
      this.resetForm()
    },
    async submitElectionForm() {
      try {
        this.isSubmitting = true
        
        // Format form data
        const formData = {
          title: this.electionForm.title,
          description: this.electionForm.description,
          startTime: new Date(this.electionForm.startTime).toISOString(),
          endTime: new Date(this.electionForm.endTime).toISOString(),
          positions: this.electionForm.positions,
          parties: this.electionForm.parties
        }
        
        let response
        if (this.showEditForm) {
          // Update existing election
          response = await api.updateElection(this.selectedElection.electionId, formData)
          
          // Update in local state
          const index = this.elections.findIndex(e => e.electionId === this.selectedElection.electionId)
          if (index !== -1) {
            this.elections[index] = response.data
          }
        } else {
          // Create new election
          response = await api.createElection(formData)
          
          // Deploy smart contract
          await contractService.deployElection(response.data.electionId, formData)
          
          // Add to local state
          this.elections.push(response.data)
        }
        
        // Close modal and show success
        this.closeModal()
        alert(`Election ${this.showEditForm ? 'updated' : 'created'} successfully`)
      } catch (error) {
        console.error('Error submitting election:', error)
        alert(`Failed to ${this.showEditForm ? 'update' : 'create'} election: ${error.message}`)
      } finally {
        this.isSubmitting = false
      }
    }
  },
  mounted() {
    this.fetchElections()
    
    // Check if there's an edit parameter in the URL
    const editId = this.$route.query.edit
    if (editId) {
      // Find the election by ID
      const election = this.elections.find(e => e.electionId === parseInt(editId))
      if (election) {
        this.editElection(election)
      }
    }
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
</style>
