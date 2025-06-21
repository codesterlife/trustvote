<template>
  <div class="election-form">
    <div class="card">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">{{ isEditing ? 'Edit Election' : 'Create New Election' }}</h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="submitForm">
          <!-- Basic Election Information -->
          <div class="mb-3">
            <label for="title" class="form-label">Election Title*</label>
            <input
              type="text"
              id="title"
              v-model="form.title"
              class="form-control"
              :class="{ 'is-invalid': errors.title }"
              required
            >
            <div v-if="errors.title" class="invalid-feedback">
              {{ errors.title }}
            </div>
          </div>
          
          <div class="mb-3">
            <label for="description" class="form-label">Description*</label>
            <textarea
              id="description"
              v-model="form.description"
              class="form-control"
              :class="{ 'is-invalid': errors.description }"
              rows="3"
              required
            ></textarea>
            <div v-if="errors.description" class="invalid-feedback">
              {{ errors.description }}
            </div>
          </div>
          
          <div class="row mb-3">
            <div class="col-md-6">
              <label for="startTime" class="form-label">Start Time*</label>
              <input
                type="datetime-local"
                id="startTime"
                v-model="form.startTime"
                class="form-control"
                :class="{ 'is-invalid': errors.startTime }"
                required
              >
              <div v-if="errors.startTime" class="invalid-feedback">
                {{ errors.startTime }}
              </div>
            </div>
            
            <div class="col-md-6">
              <label for="endTime" class="form-label">End Time*</label>
              <input
                type="datetime-local"
                id="endTime"
                v-model="form.endTime"
                class="form-control"
                :class="{ 'is-invalid': errors.endTime }"
                required
              >
              <div v-if="errors.endTime" class="invalid-feedback">
                {{ errors.endTime }}
              </div>
            </div>
          </div>
          
          <div class="mb-4">
            <label for="status" class="form-label">Status*</label>
            <select
              id="status"
              v-model="form.status"
              class="form-select"
              :class="{ 'is-invalid': errors.status }"
              required
            >
              <option value="Init">Initialization</option>
              <option value="Voting">Voting Open</option>
              <option value="Closed">Voting Closed</option>
            </select>
            <div v-if="errors.status" class="invalid-feedback">
              {{ errors.status }}
            </div>
            <small class="form-text text-muted">
              This will set the state of the election in the blockchain contract.
            </small>
          </div>
          
          <!-- Positions Management -->
          <div class="mb-4">
            <label class="form-label">Positions</label>
            <div class="position-list">
              <div v-for="(position, index) in form.positions" :key="index" class="position-item card mb-2">
                <div class="card-body py-2">
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="position-input-group flex-grow-1 me-2">
                      <input
                        type="text"
                        v-model="position.title"
                        class="form-control"
                        placeholder="Position Title"
                        required
                      >
                    </div>
                    <button type="button" @click="removePosition(index)" class="btn btn-sm btn-danger">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <button v-if="!isEditing" type="button" @click="addPosition" class="btn btn-sm btn-outline-secondary mt-2">
              <i class="fas fa-plus me-1"></i>
              Add Position
            </button>
          </div>
          
          <!-- Blockchain Integration Warning -->
          <div v-if="!isEditing" class="alert alert-info mb-4">
            <i class="fas fa-info-circle me-2"></i>
            Creating an election will deploy a smart contract to the Ethereum blockchain.
            Make sure you have enough ETH in your wallet for gas fees.
          </div>
          
          <div v-if="isEditing && form.contract_address" class="alert alert-warning mb-4">
            <i class="fas fa-exclamation-triangle me-2"></i>
            Some changes may require blockchain transactions to update the smart contract state.
          </div>
          
          <!-- Submit Buttons -->
          <div class="d-flex justify-content-between">
            <button type="button" @click="cancel" class="btn btn-secondary">
              <i class="fas fa-times me-1"></i>
              Cancel
            </button>
            
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              <i class="fas" :class="isSubmitting ? 'fa-spinner fa-spin' : 'fa-save'"></i>
              {{ isSubmitting ? 'Processing...' : (isEditing ? 'Update Election' : 'Create Election') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ElectionForm',
  props: {
    election: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      form: {
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        status: 'Init',
        positions: [],
        contract_address: ''
      },
      errors: {},
      isSubmitting: false
    }
  },
  computed: {
    isEditing() {
      return !!this.election
    }
  },
  watch: {
    election(newVal) {
      if (newVal) {
        this.initForm(newVal)
      }
    }
  },
  methods: {
    initForm(election) {
      // Format dates for datetime-local input
      const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toISOString().slice(0, 16)
      }
      
      this.form = {
        title: election.title,
        description: election.description,
        startTime: formatDate(election.startTime),
        endTime: formatDate(election.endTime),
        status: election.status,
        positions: election.positions ? [...election.positions] : [],
        contract_address: election.contract_address || ''
      }
    },
    addPosition() {
      const newPosition = {
        positionId: Math.floor(10000000 + Math.random() * 90000000), // Temporary ID
        title: ''
      }
      this.form.positions.push(newPosition)
    },
    removePosition(index) {
      this.form.positions.splice(index, 1)
    },
    validateForm() {
      this.errors = {}
      
      if (!this.form.title.trim()) {
        this.errors.title = 'Title is required'
      }
      
      if (!this.form.description.trim()) {
        this.errors.description = 'Description is required'
      }
      
      if (!this.form.startTime) {
        this.errors.startTime = 'Start time is required'
      }
      
      if (!this.form.endTime) {
        this.errors.endTime = 'End time is required'
      } else if (new Date(this.form.endTime) <= new Date(this.form.startTime)) {
        this.errors.endTime = 'End time must be after start time'
      }
      
      if (!this.form.status) {
        this.errors.status = 'Status is required'
      }
      
      return Object.keys(this.errors).length === 0
    },
    async submitForm() {
      if (!this.validateForm()) return
      
      this.isSubmitting = true
      
      try {
        // Format dates to ISO strings
        const formattedData = {
          ...this.form,
          startTime: new Date(this.form.startTime).toISOString(),
          endTime: new Date(this.form.endTime).toISOString()
        }
        
        if (this.isEditing) {
          await this.$emit('update', { id: this.election.electionId, data: formattedData })
        } else {
          await this.$emit('create', formattedData)
        }
        
        // Reset form if creating a new election
        if (!this.isEditing) {
          this.resetForm()
        }
      } catch (error) {
        console.error('Error submitting form:', error)
      } finally {
        this.isSubmitting = false
      }
    },
    resetForm() {
      this.form = {
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        status: 'Init',
        positions: [],
        contract_address: ''
      }
      this.errors = {}
    },
    cancel() {
      this.$emit('cancel')
    }
  },
  created() {
    if (this.election) {
      this.initForm(this.election)
    }
  }
}
</script>

<style scoped>
.position-item {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
}

.position-input-group {
  display: flex;
  align-items: center;
}
</style>
