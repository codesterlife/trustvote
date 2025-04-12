<template>
  <div class="vote-confirmation">
    <div class="text-center mb-4">
      <div class="confirmation-icon">
        <i class="bi bi-check-circle-fill text-success"></i>
      </div>
      <h3 class="mt-3">Vote Successfully Recorded!</h3>
      <p class="text-muted">Your vote has been securely recorded on the blockchain.</p>
    </div>
    
    <div class="confirmation-details">
      <div class="detail-item">
        <div class="detail-label">Election:</div>
        <div class="detail-value">{{ electionTitle }}</div>
      </div>
      
      <div class="detail-item">
        <div class="detail-label">Position:</div>
        <div class="detail-value">{{ positionTitle }}</div>
      </div>
      
      <div class="detail-item">
        <div class="detail-label">Candidate:</div>
        <div class="detail-value">{{ candidateName }}</div>
      </div>
      
      <div class="detail-item">
        <div class="detail-label">Transaction Hash:</div>
        <div class="detail-value transaction-hash">
          {{ transactionHash }}
          <a :href="'https://etherscan.io/tx/' + transactionHash" target="_blank" class="ms-2">
            <i class="bi bi-box-arrow-up-right"></i>
          </a>
        </div>
      </div>
      
      <div class="detail-item">
        <div class="detail-label">Timestamp:</div>
        <div class="detail-value">{{ formatDate(timestamp) }}</div>
      </div>
    </div>
    
    <div class="text-center mt-4">
      <button @click="goToResults" class="btn btn-primary me-2">
        View Results
      </button>
      <button @click="goToElections" class="btn btn-outline-secondary">
        Back to Elections
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VoteConfirmation',
  props: {
    electionId: {
      type: [Number, String],
      required: true
    },
    electionTitle: {
      type: String,
      required: true
    },
    positionTitle: {
      type: String,
      required: true
    },
    candidateName: {
      type: String,
      required: true
    },
    transactionHash: {
      type: String,
      required: true
    },
    timestamp: {
      type: [Date, String],
      default: () => new Date()
    }
  },
  methods: {
    formatDate(date) {
      const d = new Date(date);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(d);
    },
    goToResults() {
      this.$router.push({ name: 'Results', params: { id: this.electionId } });
    },
    goToElections() {
      this.$router.push({ name: 'Home' });
    }
  }
};
</script>

<style scoped>
.vote-confirmation {
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.confirmation-icon {
  font-size: 5rem;
  color: #28a745;
}

.confirmation-details {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.detail-item {
  display: flex;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.detail-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.detail-label {
  font-weight: bold;
  width: 150px;
  color: #555;
}

.detail-value {
  flex: 1;
}

.transaction-hash {
  font-family: monospace;
  word-break: break-all;
}
</style>
