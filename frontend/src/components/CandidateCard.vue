<template>
  <div class="card candidate-card mb-4">
    <div class="party-badge">
      {{ candidate.party_name }}
    </div>
    <div class="card-body d-flex">
      <!-- <div class="candidate-img-container me-3">
        <div class="placeholder-img d-flex align-items-center justify-content-center bg-light">
          <i class="fas fa-user fa-3x text-secondary"></i>
        </div>
      </div> -->
      <div class="candidate-info">
        <h5 class="card-title">{{ candidate.name }}</h5>
        <p class="position-title mb-2">{{ candidate.party_name.toUpperCase() }}</p>
        <p class="card-text">{{ candidate.bio }}</p>
        
        <div v-if="showActions" class="d-flex justify-content-between mt-3">
          <button @click="showManifesto(candidate.id)" class="btn btn-sm btn-outline-secondary">
            <i class="fas fa-file-alt me-1"></i>
            View Manifesto
          </button>
          
          <button v-if="canVote" @click="$emit('vote', candidate)" class="btn btn-sm btn-primary">
            <i class="fas fa-vote-yea me-1"></i>
            Vote
          </button>
        </div>
      </div>
    </div>
    
    <!-- Manifesto Modal -->
    <div class="modal fade" :id="'manifestoModal-' + candidate.id" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ candidate.name }} - Manifesto</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>{{ candidate.manifesto }}</p>
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
export default {
  name: 'CandidateCard',
  props: {
    candidate: {
      type: Object,
      required: true
    },
    showActions: {
      type: Boolean,
      default: true
    },
    canVote: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    showManifesto(candidateId) {
      // Bootstrap modal
      const modal = new bootstrap.Modal(document.getElementById(`manifestoModal-${candidateId}`))
      modal.show()
    }
  }
}
</script>

<style scoped>
.candidate-card {
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.candidate-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.party-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: bold;
  color: white;
}

.candidate-img-container {
  width: 80px;
  height: 80px;
  overflow: hidden;
}

.placeholder-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.position-title {
  font-size: 0.9rem;
  color: #6c757d;
  font-style: italic;
}

.candidate-info {
  flex: 1;
}
</style>
