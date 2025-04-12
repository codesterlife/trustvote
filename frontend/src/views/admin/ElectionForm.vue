<template>
  <div class="election-form">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3>{{ isEdit ? 'Edit Election' : 'Create New Election' }}</h3>
      <router-link :to="{ name: 'AdminElections' }" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left me-1"></i> Back to Elections
      </router-link>
    </div>
    
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">{{ isEdit ? 'Loading election details...' : 'Preparing form...' }}</p>
    </div>
    
    <div v-else class="card">
      <div class="card-body">
        <form @submit.prevent="saveElection">
          <div class="mb-3">
            <label for="election-title" class="form-label">Election Title</label>
            <input 
              type="text" 
              class="form-control" 
              id="election-title" 
              v-model="formData.title"
              required
              placeholder="e.g., 2025 Student Council Elections"
            >
          </div>
          
          <div class="mb-3">
            <label for="election-description" class="form-label">Description</label>
            <textarea 
              class="form-control" 
              id="election-description" 
              v-model="formData.description"
              rows="4"
              placeholder="Describe the purpose and details of this election"
            ></textarea>
          </div>
          
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="election-start" class="form-label">Start Time</label>
              <input 
                type="datetime-local" 
                class="form-control" 
                id="election-start" 
                v-model="formData.start_time"
                required
              >
            </div>
            
            <div class="col-md-6 mb-3">
              <label for="election-end" class="form-label">End Time</label>
              <input 
                type="datetime-local" 
                class="form-control" 
                id="election-end" 
                v-model="formData.end_time"
                required
              >
              <div v-if="dateError" class="text-danger mt-1">
                End time must be after start time
              </div>
            </div>
          </div>
          
          <div class="mb-3">
            <label for="election-status" class="form-label">Status</label>
            <select 
              class="form-select" 
              id="election-status" 
              v-model="formData.status"
              required
              :disabled="!isEdit"
            >
              <option value="init">Initialization</option>
              <option value="voting">Voting Active</option>
              <option value="closed">Closed</option>
            </select>
            <div v-if="!isEdit" class="form-text">
              New elections are created in the initialization phase.
            </div>
          </div>
          
          <!-- Positions Section -->
          <div class="positions-section mt-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5>Positions</h5>
              <button 
                type="button" 
                class="btn btn-sm btn-outline-primary"
                @click="addPosition"
              >
                <i class="bi bi-plus-circle me-1"></i> Add Position
              </button>
            </div>
            
            <div v-if="formData.positions.length === 0" class="alert alert-info">
              <i class="bi bi-info-circle-fill me-2"></i>
              No positions added yet. Add positions that candidates can run for in this election.
            </div>
            
            <div v-else>
              <div 
                v-for="(position, index) in formData.positions" 
                :key="index"
                class="position-item card mb-3"
              >
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <h6 class="mb-0">Position #{{ index + 1 }}</h6>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-outline-danger"
                      @click="removePosition(index)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                  
                  <div class="row">
                    <div class="col-md-12 mb-3">
                      <label :for="'position-title-' + index" class="form-label">Position Title</label>
                      <input 
                        type="text" 
                        class="form-control" 
                        :id="'position-title-' + index" 
                        v-model="position.title"
                        required
                        placeholder="e.g., President, Vice President, Secretary"
                      >
                    </div>
                    
                    <div class="col-md-12 mb-3">
                      <label :for="'position-description-' + index" class="form-label">Description</label>
                      <textarea 
                        class="form-control" 
                        :id="'position-description-' + index" 
                        v-model="position.description"
                        rows="2"
                        placeholder="Describe the responsibilities of this position"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="blockchain-warning mt-4" v-if="!isEdit">
            <div class="alert alert-warning">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              <strong>Important:</strong> After saving the election, you will need to deploy it to the blockchain
              before it can be used for voting. This requires a connected MetaMask wallet and ETH for gas fees.
            </div>
          </div>
          
          <div class="blockchain-info mt-4" v-if="isEdit && formData.contract_address">
            <div class="alert alert-info">
              <i class="bi bi-info-circle-fill me-2"></i>
              <strong>Blockchain Status:</strong> This election has been deployed to the blockchain at address:
              <span class="blockchain-address">{{ formData.contract_address }}</span>
            </div>
          </div>
          
          <div class="mt-4 d-flex justify-content-between">
            <router-link :to="{ name: 'AdminElections' }" class="btn btn-outline-secondary">
              Cancel
            </router-link>
            
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {{ isEdit ? 'Update Election' : 'Create Election' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import apiService from '@/services/api';

export default {
  name: 'ElectionForm',
  props: {
    id: {
      type: [Number, String],
      required: false
    }
  },
  data() {
    return {
      loading: true,
      saving: false,
      formData: {
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        status: 'init',
        positions: []
      },
      dateError: false
    };
  },
  computed: {
    isEdit() {
      return !!this.id;
    }
  },
  async created() {
    // Format dates for datetime-local input
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Default dates if creating a new election
    if (!this.isEdit) {
      this.formData.start_time = this.formatDateForInput(now);
      this.formData.end_time = this.formatDateForInput(tomorrow);
      this.loading = false;
      return;
    }
    
    // Load election data if editing
    await this.loadElection();
  },
  methods: {
    async loadElection() {
      try {
        const response = await apiService.getElection(this.id);
        const election = response.data;
        
        this.formData = {
          title: election.title,
          description: election.description,
          start_time: this.formatDateForInput(new Date(election.start_time)),
          end_time: this.formatDateForInput(new Date(election.end_time)),
          status: election.status,
          contract_address: election.contract_address,
          positions: []
        };
        
        // Load positions
        if (election.positions && election.positions.length > 0) {
          this.formData.positions = election.positions.map(position => ({
            id: position.id,
            title: position.title,
            description: position.description || ''
          }));
        }
      } catch (error) {
        console.error('Error loading election:', error);
        this.$store.commit('setNotification', {
          message: 'Failed to load election details',
          type: 'danger'
        });
        this.$router.push({ name: 'AdminElections' });
      } finally {
        this.loading = false;
      }
    },
    formatDateForInput(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    },
    addPosition() {
      this.formData.positions.push({
        title: '',
        description: ''
      });
    },
    removePosition(index) {
      this.formData.positions.splice(index, 1);
    },
    validateDates() {
      const startTime = new Date(this.formData.start_time);
      const endTime = new Date(this.formData.end_time);
      
      if (endTime <= startTime) {
        this.dateError = true;
        return false;
      }
      
      this.dateError = false;
      return true;
    },
    async saveElection() {
      if (!this.validateDates()) {
        return;
      }
      
      this.saving = true;
      
      try {
        let savedElection;
        
        if (this.isEdit) {
          // Update existing election
          const response = await apiService.updateElection(this.id, {
            title: this.formData.title,
            description: this.formData.description,
            start_time: new Date(this.formData.start_time).toISOString(),
            end_time: new Date(this.formData.end_time).toISOString(),
            status: this.formData.status
          });
          savedElection = response.data;
          
          // Update existing positions and create new ones
          for (const position of this.formData.positions) {
            if (position.id) {
              // Update existing position
              await apiService.updatePosition(position.id, {
                title: position.title,
                description: position.description,
                election: savedElection.id
              });
            } else {
              // Create new position
              await apiService.createPosition({
                title: position.title,
                description: position.description,
                election: savedElection.id
              });
            }
          }
          
          this.$store.commit('setNotification', {
            message: 'Election updated successfully',
            type: 'success'
          });
        } else {
          // Create new election
          const response = await apiService.createElection({
            title: this.formData.title,
            description: this.formData.description,
            start_time: new Date(this.formData.start_time).toISOString(),
            end_time: new Date(this.formData.end_time).toISOString(),
            status: 'init'
          });
          savedElection = response.data;
          
          // Create positions
          for (const position of this.formData.positions) {
            await apiService.createPosition({
              title: position.title,
              description: position.description,
              election: savedElection.id
            });
          }
          
          this.$store.commit('setNotification', {
            message: 'Election created successfully',
            type: 'success'
          });
        }
        
        // Navigate back to elections list
        this.$router.push({ name: 'AdminElections' });
      } catch (error) {
        console.error('Error saving election:', error);
        this.$store.commit('setNotification', {
          message: 'Failed to save election',
          type: 'danger'
        });
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>

<style scoped>
.election-form {
  margin-bottom: 2rem;
}

.position-item {
  border: 1px solid #eee;
  transition: all 0.3s ease;
}

.position-item:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.blockchain-address {
  font-family: monospace;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 5px;
  border-radius: 4px;
  margin-left: 5px;
}
</style>
