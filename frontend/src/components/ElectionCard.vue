<template>
  <div class="card h-100">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">{{ election.title }}</h5>
      <span class="badge rounded-pill" :class="phaseClass">
        {{ phaseText }}
      </span>
    </div>
    <div class="card-body">
      <p class="card-text">{{ election.description }}</p>
      
      <div class="mb-3">
        <h6>Positions:</h6>
        <ul class="list-group">
          <li class="list-group-item" v-for="position in election.positions" :key="position.positionId">
            {{ position.title }}
          </li>
        </ul>
      </div>
      
      <div class="d-flex justify-content-between align-items-center text-muted small">
        <div>
          <i class="fas fa-calendar me-1"></i> Starts: {{ formatDate(election.startTime) }}
        </div>
        <div>
          <i class="fas fa-calendar-check me-1"></i> Ends: {{ formatDate(election.endTime) }}
        </div>
      </div>
    </div>
    <div class="card-footer bg-transparent border-top-0">
      <div class="d-grid gap-2">
        <router-link 
          :to="{ name: 'election-detail', params: { id: election.electionId }}" 
          class="btn btn-primary">
          View Details
        </router-link>
        <button 
          v-if="election.status === 'Voting'" 
          class="btn btn-success"
          @click="onVoteClick">
          Vote Now
        </button>
        <router-link 
          v-if="election.status === 'Closed'" 
          :to="{ name: 'results', params: { id: election.electionId }}" 
          class="btn btn-secondary">
          View Results
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ElectionCard',
  props: {
    election: {
      type: Object,
      required: true
    }
  },
  computed: {
    phaseText() {
      return this.election.status || 'Unknown'
    },
    phaseClass() {
      const status = this.election.status?.toLowerCase() || ''
      if (status === 'init') return 'badge-init'
      if (status === 'voting') return 'badge-voting'
      if (status === 'closed') return 'badge-closed'
      return 'bg-secondary'
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    onVoteClick() {
      this.$emit('vote', this.election)
    }
  }
}
</script>

<style scoped>
.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.badge {
  font-size: 0.7rem;
  padding: 0.35rem 0.65rem;
}
</style>
