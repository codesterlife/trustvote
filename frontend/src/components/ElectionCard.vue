<template>
  <div class="card election-card mb-4">
    <div class="status-badge" :class="statusClass">
      {{ election.status }}
    </div>
    <div class="card-body">
      <h5 class="card-title">{{ election.title }}</h5>
      <p class="card-text">{{ election.description }}</p>
      
      <div class="election-details mb-3">
        <div class="detail-item">
          <i class="far fa-calendar-alt me-2"></i>
          <span>Start: {{ formatDateTime(election.startTime) }}</span>
        </div>
        <div class="detail-item">
          <i class="far fa-calendar-check me-2"></i>
          <span>End: {{ formatDateTime(election.endTime) }}</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-users me-2"></i>
          <span>{{ positionsCount }} Position{{ positionsCount !== 1 ? 's' : '' }}</span>
        </div>
      </div>
      
      <div v-if="isBlockchainLinked" class="mb-3 blockchain-info">
        <small class="text-muted d-block mb-1">
          <i class="fab fa-ethereum me-1"></i>
          Contract: {{ truncatedContractAddress }}
        </small>
      </div>
      
      <div class="d-flex justify-content-between">
        <router-link :to="`/elections/${election.electionId}`" class="btn btn-outline-primary mx-1">
          <i class="fas fa-info-circle"></i>
          Details
        </router-link>
        
        <div>
          <router-link v-if="canVote" :to="`/elections/${election.electionId}/vote`" class="btn btn-primary mx-1">
            <i class="fas fa-vote-yea"></i>
            Vote
          </router-link>
          
          <router-link :to="`/elections/${election.electionId}/results`" class="btn btn-outline-secondary mx-1">
            <i class="fas fa-chart-pie"></i>
            Results
          </router-link>
          <router-link :to="`/elections/${election.electionId}/electoral-roll`" class="btn btn-outline-info mx-1">
            <i class="fas fa-list"></i> Electoral Roll
          </router-link>
        </div>
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
    positionsCount() {
      return this.election.positions ? this.election.positions.length : 0
    },
    isBlockchainLinked() {
      return !!this.election.contract_address
    },
    truncatedContractAddress() {
      if (!this.election.contract_address) return ''
      return this.election.contract_address.slice(0, 6) + '...' + this.election.contract_address.slice(-4)
    },
    statusClass() {
      const statusMap = {
        'Init': 'status-init',
        'Voting': 'status-voting',
        'Closed': 'status-closed'
      }
      return statusMap[this.election.status] || 'status-init'
    },
    canVote() {
      return this.election.status === 'Voting' && 
             new Date(this.election.startTime) <= new Date() &&
             new Date(this.election.endTime) >= new Date()
    }
  },
  methods: {
    formatDateTime(dateTimeStr) {
      const date = new Date(dateTimeStr)
      return date.toLocaleString()
    }
  }
}
</script>

<style scoped>
.election-card {
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.election-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.status-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
  color: white;
}

.status-init {
  background-color: #6c757d;
}

.status-voting {
  background-color: #28a745;
}

.status-closed {
  background-color: #dc3545;
}

.detail-item {
  margin-bottom: 5px;
  font-size: 0.9rem;
  color: #666;
}

.blockchain-info {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 8px;
}
</style>
