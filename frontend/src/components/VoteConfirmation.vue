<template>
  <div class="vote-confirmation">
    <div class="card vote-success">
      <div class="card-body text-center">
        <div class="success-icon mb-4">
          <i class="fas fa-check-circle fa-5x text-success"></i>
        </div>
        
        <h3 class="mb-3">Vote Cast Successfully!</h3>
        <p class="lead">Your vote has been recorded on the blockchain and cannot be altered.</p>
        
        <div class="transaction-details mt-4 mb-4">
          <div class="alert alert-light">
            <p class="mb-1"><strong>Transaction Hash:</strong></p>
            <p class="transaction-hash mb-0">{{ transaction.transactionHash }}</p>
          </div>
          
          <div class="d-flex justify-content-between mt-3">
            <div>
              <p class="mb-1"><strong>Election:</strong></p>
              <p>{{ election.title }}</p>
            </div>
            <div>
              <p class="mb-1"><strong>Position:</strong></p>
              <p>{{ positionTitle }}</p>
            </div>
          </div>
          
          <div class="alert alert-secondary p-2 mt-2">
            <p class="mb-1"><small>Timestamp: {{ transactionTime }}</small></p>
          </div>
        </div>
        
        <div class="actions mt-4">
          <router-link :to="'/elections'" class="btn btn-outline-primary me-2">
            <i class="fas fa-list me-1"></i>
            Back to Elections
          </router-link>
          
          <a :href="etherscanLink" target="_blank" class="btn btn-secondary">
            <i class="fas fa-external-link-alt me-1"></i>
            View on Etherscan
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VoteConfirmation',
  props: {
    transaction: {
      type: Object,
      required: true
    },
    election: {
      type: Object,
      required: true
    },
    positionId: {
      type: Number,
      required: true
    },
    candidateId: {
      type: Number,
      required: true
    },
    networkId: {
      type: Number,
      required: true
    }
  },
  computed: {
    positionTitle() {
      if (!this.election.positions) return 'Unknown Position'
      const position = this.election.positions.find(p => p.positionId === this.positionId)
      return position ? position.title : 'Unknown Position'
    },
    transactionTime() {
      return new Date().toLocaleString()
    },
    etherscanLink() {
      const networkUrls = {
        1: 'https://etherscan.io',
        3: 'https://ropsten.etherscan.io',
        4: 'https://rinkeby.etherscan.io',
        5: 'https://goerli.etherscan.io',
        42: 'https://kovan.etherscan.io'
      }
      
      const baseUrl = networkUrls[this.networkId] || '#'
      if (baseUrl === '#') return '#'
      
      return `${baseUrl}/tx/${this.transaction.transactionHash}`
    }
  }
}
</script>

<style scoped>
.vote-confirmation {
  max-width: 700px;
  margin: 0 auto;
}

.vote-success {
  animation: pulse 1.5s ease-in-out;
  border: none;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.transaction-details {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 5px;
  text-align: left;
}

.transaction-hash {
  word-break: break-all;
  font-family: monospace;
  font-size: 0.9rem;
  background-color: #e9ecef;
  padding: 5px 10px;
  border-radius: 4px;
}

.success-icon {
  animation: bounceIn 1s;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(40, 167, 69, 0); }
  100% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0); }
}

@keyframes bounceIn {
  0% { transform: scale(0.8); opacity: 0; }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}
</style>
