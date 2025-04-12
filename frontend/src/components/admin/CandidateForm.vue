<template>
  <div class="candidate-form">
    <div class="card">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">{{ isEditing ? 'Edit Candidate' : 'Add New Candidate' }}</h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="submitForm">
          <!-- Basic Candidate Information -->
          <div class="mb-3">
            <label for="name" class="form-label">Full Name*</label>
            <input
              type="text"
              id="name"
              v-model="form.name"
              class="form-control"
              :class="{ 'is-invalid': errors.name }"
              required
            >
            <div v-if="errors.name" class="invalid-feedback">
              {{ errors.name }}
            </div>
          </div>
          
          <div class="row mb-3">
            <div class="col-md-6">
              <label for="electionId" class="form-label">Election*</label>
              <select
                id="electionId"
                v-model="form.electionId"
                class="form-select"
                :class="{ 'is-invalid': errors.electionId }"
                required
                :disabled="isEditing"
              >
                <option value="">-- Select Election --</option>
                <option v-for="election in elections" :key="election.electionId" :value="election.electionId">
                  {{ election.title }}
                </option>
              </select>
              <div v-if="errors.electionId" class="invalid-feedback">
                {{ errors.electionId }}
              </div>
            </div>
            
            <div class="col-md-6">
              <label for="positionId" class="form-label">Position*</label>
              <select
                id="positionId"
                v-model="form.positionId"
                class="form-select"
                :class="{ 'is-invalid': errors.positionId }"
                required
                :disabled="!selectedElection || isEditing"
              >
                <option value="">-- Select Position --</option>
                <option v-for="position in positions" :key="position.positionId" :value="position.positionId">
                  {{ position.title }}
                </option>
              </select>
              <div v-if="errors.positionId" class="invalid-feedback">
                {{ errors.positionId }}
              </div>
            </div>
          </div>
          
          <div class="mb-3">
            <label for="partyId" class="form-label">Party Affiliation</label>
            <select
              id="partyId"
              v-model="form.partyId"
              class="form-select"
              :class="{ 'is-invalid': errors.partyId }"
            >
              <option value="">-- Independent Candidate --</option>
              <option v-for="party in parties" :key="party.partyId" :value="party.partyId">
                {{ party.name }}
              </option>
            </select>
            <div v-if="errors.partyId" class="invalid-feedback">
              {{ errors.partyId }}
            </div>
          </div>
          
          <div class="mb-3">
            <label for="bio" class="form-label">Short Bio*</label>
            <textarea
              id="bio"
              v-model="form.bio"
              class="form-control"
              :class="{ 'is-invalid': errors.bio }"
              rows="2"
              required
            ></textarea>
            <div v-if="errors.bio" class="invalid-feedback">
              {{ errors.bio }}
            </div>
          </div>
          
          <div class="mb-3">
            <label for="manifesto" class="form-label">Manifesto*</label>
            <textarea
              id="manifesto"
              v-model="form.manifesto"
              class="form-control"
              :class="{ 'is-invalid': errors.manifesto }"
              rows="4"
              required
            ></textarea>
            <div v-if="errors.manifesto" class="invalid-feedback">
              {{ errors.manifesto }}
            </div>
          </div>
          
          <div class="mb-3">
            <label for="wallet" class="form-label">Ethereum Wallet (Optional)</label>
            <input
              type="text"
              id="wallet"
              v-model="form.wallet"
              class="form-control"
              :class="{ 'is-invalid': errors.wallet }"
              placeholder="0x..."
            >
            <div v-if="errors.wallet" class="invalid-feedback">
              {{ errors.wallet }}
            </div>
            <small class="form-text text-muted">
              Ethereum wallet address for the candidate (if applicable)
            </small>
          </div>
          
          <!-- Blockchain Integration Warning -->
          <div v-if="!isEditing" class="alert alert-info mb-4">
            <i class="fas fa-info-circle me-2"></i>
            Adding a candidate will register them in the blockchain smart contract.
          </div>
          
          <!-- Submit Buttons -->
          <div class="d-flex justify-content-between">
            <button type="button" @click="cancel" class="btn btn-secondary">
              <i class="fas fa-times me-1"></i>
              Cancel
            </button>
            
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              <i class="fas" :class="isSubmitting ? 'fa-spinner fa-spin' : 'fa-save'"></i>
              {{ isSubmitting ? 'Processing...' : (isEditing ? 'Update Candidate' : 'Add Candidate') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CandidateForm',
  props: {
    candidate: {
      type: Object,
      default: null
    },
    elections: {
      type: Array,
      required: true
    },
    parties: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      form: {
        candidateId: null,
        name: '',
        electionId: '',
        positionId: '',
        partyId: '',
        bio: '',
        manifesto: '',
        wallet: ''
      },
      errors: {},
      isSubmitting: false
    }
  },
  computed: {
    isEditing() {
      return !!this.candidate
    },
    selectedElection() {
      return this.elections.find(e => e.electionId === this.form.electionId)
    },
    positions() {
      if (!this.selectedElection) return []
      return this.selectedElection.positions || []
    }
  },
  watch: {
    candidate(newVal) {
      if (newVal) {
        this.initForm(newVal)
      }
    }
  },
  methods: {
    initForm(candidate) {
      this.form = {
        candidateId: candidate.candidateId,
        name: candidate.name,
        electionId: candidate.electionId,
        positionId: candidate.positionId,
        partyId: candidate.partyId || '',
        bio: candidate.bio,
        manifesto: candidate.manifesto,
        wallet: candidate.wallet || ''
      }
    },
    validateForm() {
      this.errors = {}
      
      if (!this.form.name.trim()) {
        this.errors.name = 'Name is required'
      }
      
      if (!this.form.electionId) {
        this.errors.electionId = 'Election is required'
      }
      
      if (!this.form.positionId) {
        this.errors.positionId = 'Position is required'
      }
      
      if (!this.form.bio.trim()) {
        this.errors.bio = 'Bio is required'
      }
      
      if (!this.form.manifesto.trim()) {
        this.errors.manifesto = 'Manifesto is required'
      }
      
      if (this.form.wallet && !/^0x[a-fA-F0-9]{40}$/.test(this.form.wallet)) {
        this.errors.wallet = 'Invalid Ethereum wallet address'
      }
      
      return Object.keys(this.errors).length === 0
    },
    async submitForm() {
      if (!this.validateForm()) return
      
      this.isSubmitting = true
      
      try {
        if (this.isEditing) {
          await this.$emit('update', { id: this.candidate.candidateId, data: this.form })
        } else {
          await this.$emit('create', this.form)
        }
        
        // Reset form if creating a new candidate
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
        candidateId: null,
        name: '',
        electionId: '',
        positionId: '',
        partyId: '',
        bio: '',
        manifesto: '',
        wallet: ''
      }
      this.errors = {}
    },
    cancel() {
      this.$emit('cancel')
    }
  },
  created() {
    if (this.candidate) {
      this.initForm(this.candidate)
    }
  }
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
