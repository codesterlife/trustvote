<template>
  <div class="candidate-form">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3>{{ isEdit ? 'Edit Candidate' : 'Add New Candidate' }}</h3>
      <router-link :to="{ name: 'AdminCandidates' }" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left me-1"></i> Back to Candidates
      </router-link>
    </div>
    
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">{{ isEdit ? 'Loading candidate details...' : 'Preparing form...' }}</p>
    </div>
    
    <div v-else class="card">
      <div class="card-body">
        <form @submit.prevent="saveCandidate">
          <div class="row">
            <div class="col-md-8">
              <div class="mb-3">
                <label for="candidate-name" class="form-label">Candidate Name</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="candidate-name" 
                  v-model="formData.name"
                  required
                  placeholder="Full name of the candidate"
                >
              </div>
              
              <div class="mb-3">
                <label for="election-select" class="form-label">Election</label>
                <select 
                  class="form-select" 
                  id="election-select" 
                  v-model="formData.election"
                  required
                  @change="loadPositions"
                >
                  <option value="">Select an Election</option>
                  <option 
                    v-for="election in elections" 
                    :key="election.id" 
                    :value="election.id"
                  >
                    {{ election.title }}
                  </option>
                </select>
              </div>
              
              <div class="mb-3">
                <label for="position-select" class="form-label">Position</label>
                <select 
                  class="form-select" 
                  id="position-select" 
                  v-model="formData.position"
                  required
                  :disabled="!formData.election || positionsLoading"
                >
                  <option value="">{{ positionsLoading ? 'Loading positions...' : 'Select a Position' }}</option>
                  <option 
                    v-for="position in positions" 
                    :key="position.id" 
                    :value="position.id"
                  >
                    {{ position.title }}
                  </option>
                </select>
                
                <div v-if="positions.length === 0 && formData.election && !positionsLoading" class="text-danger mt-1">
                  No positions available for this election. Please add positions first.
                </div>
              </div>
              
              <div class="mb-3">
                <label for="party-select" class="form-label">Party (Optional)</label>
                <select 
                  class="form-select" 
                  id="party-select" 
                  v-model="formData.party"
                >
                  <option value="">No Party / Independent</option>
                  <option 
                    v-for="party in parties" 
                    :key="party.id" 
                    :value="party.id"
                  >
                    {{ party.name }}
                  </option>
                </select>
              </div>
              
              <div class="mb-3">
                <label for="candidate-bio" class="form-label">Bio / Background</label>
                <textarea 
                  class="form-control" 
                  id="candidate-bio" 
                  v-model="formData.bio"
                  rows="3"
                  placeholder="Brief biography or background of the candidate"
                ></textarea>
              </div>
              
              <div class="mb-3">
                <label for="candidate-manifesto" class="form-label">Manifesto / Platform</label>
                <textarea 
                  class="form-control" 
                  id="candidate-manifesto" 
                  v-model="formData.manifesto"
                  rows="5"
                  placeholder="Candidate's promises, goals, and platform points"
                ></textarea>
              </div>
              
              <div class="mb-3">
                <label for="wallet-address" class="form-label">Wallet Address (Optional)</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="wallet-address" 
                  v-model="formData.wallet_address"
                  placeholder="0x..."
                >
                <div class="form-text">
                  Ethereum wallet address associated with this candidate (if applicable)
                </div>
              </div>
            </div>
            
            <div class="col-md-4">
              <div class="card mb-3">
                <div class="card-header">
                  <h5 class="card-title mb-0">Candidate Photo</h5>
                </div>
                <div class="card-body text-center">
                  <div class="candidate-photo-preview mb-3">
                    <img :src="selectedPhoto || getRandomCandidateImage()" alt="Candidate Photo" class="img-fluid rounded">
                  </div>
                  
                  <div class="mb-3">
                    <label for="photo-url" class="form-label">Photo URL</label>
                    <input 
                      type="url" 
                      class="form-control" 
                      id="photo-url" 
                      v-model="formData.photo_url"
                      placeholder="https://example.com/photo.jpg"
                      @input="updatePhotoPreview"
                    >
                  </div>
                  
                  <div class="sample-photos mt-3">
                    <h6 class="mb-2">Or select a sample photo:</h6>
                    <div class="sample-photos-grid">
                      <div 
                        v-for="(photo, index) in candidatePhotos" 
                        :key="index"
                        class="sample-photo"
                        :class="{ 'selected': selectedPhoto === photo }"
                        @click="selectPhoto(photo)"
                      >
                        <img :src="photo" class="img-fluid rounded" alt="Sample candidate photo">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="card mb-3" v-if="formData.party">
                <div class="card-header">
                  <h5 class="card-title mb-0">Party Logo</h5>
                </div>
                <div class="card-body text-center">
                  <div class="party-logo-preview">
                    <img 
                      :src="getPartyLogo(formData.party)" 
                      alt="Party Logo" 
                      class="img-fluid rounded"
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mt-4 d-flex justify-content-between">
            <router-link :to="{ name: 'AdminCandidates' }" class="btn btn-outline-secondary">
              Cancel
            </router-link>
            
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {{ isEdit ? 'Update Candidate' : 'Add Candidate' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import apiService from '@/services/api';
import candidateImages from '@/constants/candidateImages';
import partyLogos from '@/constants/partyLogos';

export default {
  name: 'CandidateForm',
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
      positionsLoading: false,
      formData: {
        name: '',
        position: '',
        election: '',
        party: '',
        bio: '',
        manifesto: '',
        photo_url: '',
        wallet_address: ''
      },
      elections: [],
      positions: [],
      parties: [],
      candidatePhotos: candidateImages,
      selectedPhoto: null
    };
  },
  computed: {
    isEdit() {
      return !!this.id;
    }
  },
  async created() {
    await this.loadInitialData();
  },
  methods: {
    async loadInitialData() {
      try {
        // Load elections
        const electionsResponse = await apiService.getElections();
        this.elections = electionsResponse.data;
        
        // Load parties
        const partiesResponse = await apiService.getParties();
        this.parties = partiesResponse.data;
        
        if (this.isEdit) {
          await this.loadCandidate();
        } else {
          this.loading = false;
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        this.$store.commit('setNotification', {
          message: 'Failed to load required data',
          type: 'danger'
        });
      }
    },
    async loadCandidate() {
      try {
        const response = await apiService.getCandidate(this.id);
        const candidate = response.data;
        
        this.formData = {
          name: candidate.name,
          position: candidate.position,
          election: candidate.position ? this.getElectionIdFromPosition(candidate.position) : '',
          party: candidate.party || '',
          bio: candidate.bio || '',
          manifesto: candidate.manifesto || '',
          photo_url: candidate.photo_url || '',
          wallet_address: candidate.wallet_address || ''
        };
        
        if (this.formData.photo_url) {
          this.selectedPhoto = this.formData.photo_url;
        }
        
        // Load positions for the selected election
        if (this.formData.election) {
          await this.loadPositions();
        }
      } catch (error) {
        console.error('Error loading candidate:', error);
        this.$store.commit('setNotification', {
          message: 'Failed to load candidate details',
          type: 'danger'
        });
        this.$router.push({ name: 'AdminCandidates' });
      } finally {
        this.loading = false;
      }
    },
    getElectionIdFromPosition(positionId) {
      // This is a workaround since we don't have the election ID directly in the candidate data
      // In a real scenario, you might want to fetch this from the backend
      
      // For now, let's fetch it
      this.loadPositionInfo(positionId);
      return '';
    },
    async loadPositionInfo(positionId) {
      try {
        const response = await apiService.getPosition(positionId);
        const position = response.data;
        this.formData.election = position.election;
        await this.loadPositions();
      } catch (error) {
        console.error('Error loading position info:', error);
      }
    },
    async loadPositions() {
      if (!this.formData.election) {
        this.positions = [];
        return;
      }
      
      this.positionsLoading = true;
      
      try {
        const response = await apiService.getPositions(this.formData.election);
        this.positions = response.data;
      } catch (error) {
        console.error('Error loading positions:', error);
        this.$store.commit('setNotification', {
          message: 'Failed to load positions',
          type: 'danger'
        });
        this.positions = [];
      } finally {
        this.positionsLoading = false;
      }
    },
    getRandomCandidateImage() {
      return this.candidatePhotos[Math.floor(Math.random() * this.candidatePhotos.length)];
    },
    getPartyLogo(partyId) {
      const party = this.parties.find(p => p.id === parseInt(partyId));
      if (party && party.logo_url) {
        return party.logo_url;
      }
      
      // Return a default logo based on party ID
      const logoIndex = (partyId % partyLogos.length);
      return partyLogos[logoIndex];
    },
    updatePhotoPreview() {
      this.selectedPhoto = this.formData.photo_url || this.getRandomCandidateImage();
    },
    selectPhoto(photo) {
      this.selectedPhoto = photo;
      this.formData.photo_url = photo;
    },
    async saveCandidate() {
      this.saving = true;
      
      try {
        const candidateData = {
          name: this.formData.name,
          position: this.formData.position,
          party: this.formData.party || null,
          bio: this.formData.bio,
          manifesto: this.formData.manifesto,
          photo_url: this.formData.photo_url,
          wallet_address: this.formData.wallet_address
        };
        
        if (this.isEdit) {
          await apiService.updateCandidate(this.id, candidateData);
          this.$store.commit('setNotification', {
            message: 'Candidate updated successfully',
            type: 'success'
          });
        } else {
          await apiService.createCandidate(candidateData);
          this.$store.commit('setNotification', {
            message: 'Candidate added successfully',
            type: 'success'
          });
        }
        
        this.$router.push({ name: 'AdminCandidates' });
      } catch (error) {
        console.error('Error saving candidate:', error);
        this.$store.commit('setNotification', {
          message: 'Failed to save candidate',
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
.candidate-form {
  margin-bottom: 2rem;
}

.candidate-photo-preview {
  width: 180px;
  height: 180px;
  border-radius: 90px;
  overflow: hidden;
  margin: 0 auto;
  border: 1px solid #ddd;
}

.candidate-photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.party-logo-preview {
  width: 120px;
  height: 120px;
  overflow: hidden;
  margin: 0 auto;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.party-logo-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.sample-photos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 10px;
}

.sample-photo {
  cursor: pointer;
  border-radius: 5px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.sample-photo.selected {
  border-color: #4285f4;
  transform: scale(1.05);
}

.sample-photo:hover {
  transform: scale(1.05);
}
</style>
