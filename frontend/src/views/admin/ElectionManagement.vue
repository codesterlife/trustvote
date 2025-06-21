<template>
  <div class="election-management">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Election Management</h2>
      <button @click="showCreateForm" class="btn btn-primary">
        <i class="fas fa-plus me-1"></i>
        Create New Election
      </button>
    </div>
    
    <!-- Election Form -->
    <div v-if="showForm" class="mb-5">
      <ElectionForm 
        :election="selectedElection"
        @create="handleCreateElection"
        @update="handleUpdateElection"
        @cancel="hideForm"
      />
    </div>
    
    <!-- Election List -->
    <div v-else>
      <div class="card">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Elections</h5>
          <div class="filter-group">
            <div class="input-group">
              <input 
                type="text" 
                class="form-control form-control-sm" 
                placeholder="Search elections..." 
                v-model="searchTerm"
              >
              <select v-model="statusFilter" class="form-select form-select-sm">
                <option value="">All Statuses</option>
                <option value="Init">Initialization</option>
                <option value="Voting">Voting</option>
                <option value="Closed">Closed</option>
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
            <p class="mt-2">Loading elections...</p>
          </div>
          
          <div v-else-if="filteredElections.length === 0" class="text-center py-4">
            <div class="alert alert-info m-3">
              <i class="fas fa-info-circle me-2"></i>
              No elections found. Create a new election to get started.
            </div>
          </div>
          
          <div v-else class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th class="text-center">Status</th>
                  <th class="text-center">Positions</th>
                  <th class="text-center">Blockchain</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="election in filteredElections" :key="election.electionId">
                  <td>{{ election.title }}</td>
                  <td>{{ formatDateTime(election.startTime) }}</td>
                  <td>{{ formatDateTime(election.endTime) }}</td>
                  <td class="text-center">
                    <span class="badge" :class="getStatusBadgeClass(election.status)">
                      {{ election.status }}
                    </span>
                  </td>
                  <td class="text-center">{{election.positions.length}}</td>
                  <td class="text-center">
                    <span v-if="election.contractAddress">
                        <i class="fab fa-ethereum me-1"></i>
                        {{ truncateAddress(election.contractAddress) }}
                    </span>
                    <span v-else class="text-muted">
                      <i class="fas fa-times-circle me-1"></i>
                      Not deployed
                    </span>
                  </td>
                  <td class="text-center">
                    <div class="btn-group">
                      <button @click="editElection(election)" class="btn btn-sm btn-outline-primary">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button @click="changePhase(election)" class="btn btn-sm btn-outline-success" :disabled="isProcessing">
                        <i class="fas fa-sync-alt"></i>
                      </button>
                      <router-link :to="`/elections/${election.electionId}/results`" class="btn btn-sm btn-outline-info">
                        <i class="fas fa-chart-pie"></i>
                      </router-link>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Phase Change Modal -->
    <div class="modal fade" id="phaseChangeModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Change Election Phase</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedElection">
              <p>
                Current phase: 
                <span class="badge" :class="getStatusBadgeClass(selectedElection.status)">
                  {{ selectedElection.status }}
                </span>
              </p>
              
              <div class="form-group">
                <label for="newPhase" class="form-label">Select new phase:</label>
                <select id="newPhase" v-model="newPhase" class="form-select">
                  <option value="Init">Initialization</option>
                  <option value="Voting">Voting Open</option>
                  <option value="Closed">Voting Closed</option>
                </select>
              </div>
              
              <div class="alert alert-info mt-3">
                <i class="fas fa-info-circle me-2"></i>
                Changing the election phase will update the status on the blockchain contract.
                This requires a MetaMask transaction.
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button @click="confirmPhaseChange" class="btn btn-primary" :disabled="phaseChangeProcessing">
              <i class="fas" :class="phaseChangeProcessing ? 'fa-spinner fa-spin' : 'fa-check'"></i>
              {{ phaseChangeProcessing ? 'Processing...' : 'Confirm Change' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ElectionForm from '@/components/admin/ElectionForm.vue'

export default {
  name: 'ElectionManagement',
  components: {
    ElectionForm
  },
  data() {
    return {
      showForm: false,
      selectedElection: null,
      isLoading: false,
      isProcessing: false,
      searchTerm: '',
      statusFilter: '',
      phaseChangeModal: null,
      newPhase: '',
      phaseChangeProcessing: false
    }
  },
  computed: {
    ...mapGetters(['allElections', 'networkId']),
    filteredElections() {
      let filtered = [...this.allElections]
      
      // Filter by status if selected
      if (this.statusFilter) {
        filtered = filtered.filter(e => e.status === this.statusFilter)
      }
      
      // Filter by search term if entered
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase()
        filtered = filtered.filter(e => 
          e.title.toLowerCase().includes(term) || 
          e.description.toLowerCase().includes(term)
        )
      }
      
      return filtered
    }
  },
  methods: {
    ...mapActions(['fetchElections', 'createElection', 'updateElection', 'updateElectionPhase']),
    formatDateTime(dateTimeStr) {
      const date = new Date(dateTimeStr)
      return date.toLocaleString()
    },
    truncateAddress(address) {
      if (!address) return ''
      return address.slice(0, 6) + '...' + address.slice(-4)
    },
    getStatusBadgeClass(status) {
      const classes = {
        'Init': 'bg-secondary',
        'Voting': 'bg-success',
        'Closed': 'bg-danger'
      }
      return classes[status] || 'bg-secondary'
    },
    showCreateForm() {
      this.selectedElection = null
      this.showForm = true
    },
    editElection(election) {
      this.selectedElection = election
      this.showForm = true
    },
    hideForm() {
      this.showForm = false
      this.selectedElection = null
    },

    async handleCreateElection(electionData) {
      try {
        // console.log('Received election data - electionData:', electionData);

        // Validate and format dates
        if (!electionData.startTime) throw new Error('Start time is required');
        if (!electionData.endTime) throw new Error('End time is required');

        const startTime = new Date(electionData.startTime);
        const endTime = new Date(electionData.endTime);

        if (isNaN(startTime.getTime())) throw new Error('Invalid start time');
        if (isNaN(endTime.getTime())) throw new Error('Invalid end time');
        if (endTime <= startTime) throw new Error('End time must be after start time');

        // Construct formatted data
        const formattedData = {
          title: electionData.title?.trim(),
          description: electionData.description?.trim(),
          start_time: Math.floor(startTime.getTime() / 1000),
          end_time: Math.floor(endTime.getTime() / 1000),
          positions: electionData.positions,
          status: 'Init',
          address: electionData.address || null
        };

        // console.log('formatted data being sent to vuex - formattedData: ', formattedData);

        // Call the Vuex action to create the election
        await this.createElection(formattedData);
        this.hideForm();
      } catch (error) {
        console.error('Error creating election:', error);
        alert(error.message || 'An error occurred while creating the election.');
      }
    },
    async handleUpdateElection({ id, data }) {
      try {
        // console.log("election id: ", id)
        // console.log("updates: ", data)
        await this.updateElection({ id, data })
        this.hideForm()
      } catch (error) { //NOTE: fixed update election but No more adding new positions during update election. Cause: issues related to backend mode setup.
        console.error('Error updating election:', error)
      }
    },
    changePhase(election) {
      this.selectedElection = election
      this.newPhase = election.status
      
      // Initialize and show the modal
      this.phaseChangeModal = new bootstrap.Modal(document.getElementById('phaseChangeModal'))
      this.phaseChangeModal.show()
    },
    async confirmPhaseChange() {
      if (!this.selectedElection || !this.newPhase || this.phaseChangeProcessing) return

      // console.log('Selected election:', this.selectedElection);
      // console.log('New phase:', this.newPhase);
      
      this.phaseChangeProcessing = true
      // console.log(this.selectedElection.electionId || "no id")
      
      try {
        await this.updateElectionPhase({
          electionId: this.selectedElection.electionId,
          phase: this.newPhase
        })
        
        // Close the modal
        this.phaseChangeModal.hide()
        
        // Refresh elections list
        await this.fetchElections()
      } catch (error) {
        console.error('Error changing election phase:', error)
        alert('Failed to change election phase: ' + (error.message || 'Unknown error'))
      } finally {
        this.phaseChangeProcessing = false
      }
    }
  },
  async created() {
    this.isLoading = true
    try {
      await this.fetchElections()
    } catch (error) {
      console.error('Error fetching elections:', error)
    } finally {
      this.isLoading = false
    }
  }
}
</script>

<style scoped>
.contract-link {
  font-family: monospace;
  font-size: 0.85rem;
  text-decoration: none;
}

contract-link:hover {
  text-decoration: underline;
}

.filter-group {
  width: 350px;
}
</style>
