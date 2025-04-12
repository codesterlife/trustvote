<template>
  <div class="card candidate-card mb-3">
    <div class="card-body">
      <div class="row">
        <div class="col-md-4 text-center mb-3 mb-md-0">
          <div class="candidate-photo">
            <img :src="getCandidateImage()" alt="Candidate Photo" class="img-fluid rounded">
          </div>
          
          <div v-if="candidate.party" class="party-badge mt-2" :style="{ background: getPartyColor(candidate.party) }">
            {{ candidate.party_name }}
          </div>
        </div>
        
        <div class="col-md-8">
          <h5 class="card-title">{{ candidate.name }}</h5>
          
          <div v-if="candidate.position_title" class="position-label mb-2">
            Running for: {{ candidate.position_title }}
          </div>
          
          <div class="candidate-details mb-3">
            <p v-if="candidate.bio" class="card-text">{{ truncateBio(candidate.bio) }}</p>
            
            <div v-if="showManifesto && candidate.manifesto" class="manifesto mt-3">
              <h6>Manifesto:</h6>
              <p>{{ candidate.manifesto }}</p>
            </div>
          </div>
          
          <div class="d-flex justify-content-between">
            <button v-if="!showManifesto && candidate.manifesto" 
                   @click="showManifesto = true" 
                   class="btn btn-sm btn-outline-secondary">
              Read Manifesto
            </button>
            
            <button v-if="showManifesto" 
                   @click="showManifesto = false" 
                   class="btn btn-sm btn-outline-secondary">
              Hide Manifesto
            </button>
            
            <button v-if="canVote" 
                   @click="voteForCandidate" 
                   class="btn btn-success">
              Vote
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import candidateImages from '../constants/candidateImages';

export default {
  name: 'CandidateCard',
  props: {
    candidate: {
      type: Object,
      required: true
    },
    canVote: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showManifesto: false
    };
  },
  computed: {
    ...mapGetters(['getParties'])
  },
  methods: {
    truncateBio(bio) {
      if (bio.length > 150) {
        return bio.substring(0, 147) + '...';
      }
      return bio;
    },
    getCandidateImage() {
      // Use candidate photo_url if available, otherwise use a placeholder
      if (this.candidate.photo_url) {
        return this.candidate.photo_url;
      }
      
      // Use index based on candidate ID to select an image
      const imageIndex = (this.candidate.id % candidateImages.length);
      return candidateImages[imageIndex];
    },
    getPartyColor(partyId) {
      const colors = [
        '#4285f4', // Blue
        '#34a853', // Green
        '#fbbc05', // Yellow
        '#ea4335', // Red
        '#673ab7', // Purple
        '#ff9800'  // Orange
      ];
      
      // Use party ID to select a color
      return colors[partyId % colors.length];
    },
    voteForCandidate() {
      this.$emit('vote', this.candidate.id);
    }
  }
};
</script>

<style scoped>
.candidate-card {
  border-radius: 8px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.candidate-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.candidate-photo {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  border-radius: 60px;
  overflow: hidden;
}

.candidate-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.party-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  color: white;
  font-weight: bold;
}

.position-label {
  color: #555;
  font-size: 0.9rem;
  font-style: italic;
}

.manifesto {
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 5px;
  font-size: 0.9rem;
}
</style>
