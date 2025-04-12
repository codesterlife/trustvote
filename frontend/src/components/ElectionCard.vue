<template>
  <div class="card mb-4 election-card">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <h5 class="card-title">{{ election.title }}</h5>
        <span :class="phaseClass">{{ formattedStatus }}</span>
      </div>
      
      <p class="card-text">{{ election.description }}</p>
      
      <div class="election-details mb-3">
        <div class="row">
          <div class="col-md-6">
            <div class="detail-item">
              <span class="detail-label">Start:</span>
              <span class="detail-value">{{ formatDate(election.start_time) }}</span>
            </div>
          </div>
          <div class="col-md-6">
            <div class="detail-item">
              <span class="detail-label">End:</span>
              <span class="detail-value">{{ formatDate(election.end_time) }}</span>
            </div>
          </div>
        </div>
        
        <div class="detail-item" v-if="election.positions && election.positions.length">
          <span class="detail-label">Positions:</span>
          <span class="detail-value">{{ election.positions.length }}</span>
        </div>
      </div>
      
      <div class="d-flex justify-content-between">
        <router-link :to="{ name: 'Election', params: { id: election.id } }" class="btn btn-primary">
          View Details
        </router-link>
        
        <router-link 
          v-if="election.status === 'closed'"
          :to="{ name: 'Results', params: { id: election.id } }" 
          class="btn btn-outline-primary">
          View Results
        </router-link>
        
        <span v-else-if="election.status === 'voting'" class="btn btn-success" @click="goToVote">
          Vote Now
        </span>
      </div>
    </div>
    
    <div v-if="isContract" class="card-footer text-muted">
      <div class="blockchain-info">
        <i class="bi bi-link-45deg"></i>
        On blockchain: {{ shortenAddress(election.contract_address) }}
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
    formattedStatus() {
      const statusMap = {
        'init': 'Setup',
        'voting': 'Voting Active',
        'closed': 'Closed'
      };
      return statusMap[this.election.status] || this.election.status;
    },
    phaseClass() {
      return `phase-indicator phase-${this.election.status}`;
    },
    isContract() {
      return this.election.contract_address && this.election.contract_address.length > 0;
    }
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    },
    shortenAddress(address) {
      if (!address) return 'Not deployed';
      return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    },
    goToVote() {
      if (this.election.positions && this.election.positions.length > 0) {
        // Go to the first position for voting
        this.$router.push({
          name: 'VotingBooth',
          params: { 
            electionId: this.election.id,
            positionId: this.election.positions[0].id
          }
        });
      } else {
        this.$router.push({
          name: 'Election',
          params: { id: this.election.id }
        });
      }
    }
  }
};
</script>

<style scoped>
.election-card {
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.election-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-weight: 600;
  color: #333;
}

.election-details {
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
}

.detail-item {
  margin-bottom: 5px;
}

.detail-label {
  font-weight: 600;
  color: #666;
  margin-right: 5px;
}

.blockchain-info {
  font-family: monospace;
  font-size: 0.85rem;
}
</style>
