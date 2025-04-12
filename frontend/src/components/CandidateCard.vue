<template>
  <div class="card candidate-card h-100">
    <div class="position-relative">
      <div class="candidate-img-container">
        <img :src="candidateImage" class="card-img-top candidate-img" alt="Candidate Photo">
        <div v-if="candidate.partyId" class="party-badge">
          <span>{{ getPartyName(candidate.partyId) }}</span>
        </div>
      </div>
    </div>
    <div class="card-body">
      <h5 class="card-title">{{ candidate.name }}</h5>
      <p class="card-text text-muted">{{ candidate.bio }}</p>
      
      <div class="accordion accordion-flush" :id="`accordionCandidate${candidate.candidateId}`">
        <div class="accordion-item">
          <h2 class="accordion-header" :id="`headingManifesto${candidate.candidateId}`">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" 
                   :data-bs-target="`#collapseManifesto${candidate.candidateId}`">
              Manifesto
            </button>
          </h2>
          <div :id="`collapseManifesto${candidate.candidateId}`" class="accordion-collapse collapse" 
               :aria-labelledby="`headingManifesto${candidate.candidateId}`">
            <div class="accordion-body">
              {{ candidate.manifesto }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="card-footer bg-transparent text-center">
      <button 
        v-if="selectable" 
        @click="selectCandidate" 
        class="btn btn-primary w-100"
        :class="{ 'btn-success': isSelected }">
        <span v-if="isSelected">
          <i class="fas fa-check me-2"></i>Selected
        </span>
        <span v-else>Select Candidate</span>
      </button>
      <div v-else-if="showResults" class="text-center">
        <div class="progress mb-2">
          <div class="progress-bar" role="progressbar" 
               :style="`width: ${votePercentage}%`" 
               :aria-valuenow="votePercentage" 
               aria-valuemin="0" 
               aria-valuemax="100">
            {{ votePercentage }}%
          </div>
        </div>
        <small class="text-muted">{{ candidate.voteCount || 0 }} votes</small>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CandidateCard',
  props: {
    candidate: {
      type: Object,
      required: true
    },
    selectable: {
      type: Boolean,
      default: false
    },
    selected: {
      type: Boolean,
      default: false
    },
    parties: {
      type: Array,
      default: () => []
    },
    totalVotes: {
      type: Number,
      default: 0
    },
    showResults: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    isSelected() {
      return this.selected
    },
    candidateImage() {
      // Using the candidateId to determine which image to show
      const images = [
        'https://images.unsplash.com/photo-1516534775068-ba3e7458af70',
        'https://images.unsplash.com/photo-1503676382389-4809596d5290',
        'https://images.unsplash.com/photo-1530099486328-e021101a494a',
        'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06',
        'https://images.unsplash.com/photo-1460518451285-97b6aa326961',
        'https://images.unsplash.com/photo-1494883759339-0b042055a4ee'
      ]
      
      // Use modulo to cycle through the images based on candidateId
      const index = (this.candidate.candidateId % images.length)
      return images[index]
    },
    votePercentage() {
      if (!this.totalVotes || !this.candidate.voteCount) return 0
      return Math.round((this.candidate.voteCount / this.totalVotes) * 100)
    }
  },
  methods: {
    selectCandidate() {
      this.$emit('select', this.candidate)
    },
    getPartyName(partyId) {
      const party = this.parties.find(p => p.partyId === partyId)
      return party ? party.name : 'Independent'
    }
  }
}
</script>

<style scoped>
.candidate-card {
  transition: transform 0.2s ease-in-out;
}

.candidate-card:hover {
  transform: translateY(-5px);
}

.candidate-img-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.candidate-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.party-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  font-size: 0.8rem;
  border-top-left-radius: 5px;
}

.progress {
  height: 10px;
  border-radius: 5px;
}
</style>
