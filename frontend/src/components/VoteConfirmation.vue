<template>
  <div class="vote-confirmation">
    <div class="text-center mb-4">
      <div class="confirmation-icon">
        <i class="fas fa-check-circle text-success vote-animation"></i>
      </div>
      <h3 class="mt-3">Vote Successfully Cast!</h3>
      <p class="text-muted">Your vote has been securely recorded on the blockchain.</p>
    </div>
    
    <div class="card mb-4">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">Transaction Details</h5>
      </div>
      <div class="card-body">
        <div class="mb-3">
          <small class="text-muted d-block mb-1">Transaction Hash</small>
          <div class="d-flex align-items-center">
            <code class="transaction-hash">{{ txHash }}</code>
            <button class="btn btn-sm btn-outline-secondary ms-2" @click="copyTxHash">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
        
        <div class="mb-3">
          <small class="text-muted d-block mb-1">Block Number</small>
          <strong>{{ txDetails.blockNumber || 'Pending...' }}</strong>
        </div>
        
        <div class="mb-3">
          <small class="text-muted d-block mb-1">Timestamp</small>
          <strong>{{ txDetails.timestamp || 'Pending...' }}</strong>
        </div>
        
        <div class="mb-3">
          <small class="text-muted d-block mb-1">Status</small>
          <span class="blockchain-status" :class="statusClass">
            {{ txDetails.status || 'Pending' }}
          </span>
        </div>
      </div>
    </div>
    
    <div class="card mb-4">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">Vote Summary</h5>
      </div>
      <div class="card-body">
        <div class="mb-3">
          <small class="text-muted d-block mb-1">Election</small>
          <strong>{{ voteDetails.electionTitle }}</strong>
        </div>
        
        <div class="mb-3">
          <small class="text-muted d-block mb-1">Position</small>
          <strong>{{ voteDetails.positionTitle }}</strong>
        </div>
        
        <div class="mb-3">
          <small class="text-muted d-block mb-1">Selected Candidate</small>
          <strong>{{ voteDetails.candidateName }}</strong>
        </div>
      </div>
    </div>
    
    <div class="d-grid gap-2 mt-4">
      <button @click="viewBlockExplorer" class="btn btn-outline-primary">
        <i class="fas fa-external-link-alt me-2"></i>
        View on Block Explorer
      </button>
      <button @click="$emit('close')" class="btn btn-primary">
        <i class="fas fa-arrow-left me-2"></i>
        Back to Elections
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VoteConfirmation',
  props: {
    txHash: {
      type: String,
      required: true
    },
    voteDetails: {
      type: Object,
      required: true
    },
    txDetails: {
      type: Object,
      default: () => ({
        blockNumber: null,
        timestamp: null,
        status: 'Pending'
      })
    }
  },
  computed: {
    statusClass() {
      const status = this.txDetails.status?.toLowerCase() || ''
      if (status === 'confirmed' || status === 'success') return 'status-confirmed'
      if (status === 'failed' || status === 'error') return 'status-failed'
      return 'status-pending'
    }
  },
  methods: {
    copyTxHash() {
      navigator.clipboard.writeText(this.txHash)
        .then(() => {
          alert('Transaction hash copied to clipboard')
        })
        .catch(err => {
          console.error('Could not copy text: ', err)
        })
    },
    viewBlockExplorer() {
      // For Ganache, this would typically open a local URL
      // For testnets like Rinkeby, Ropsten, etc. it would open Etherscan
      const baseUrl = 'https://rinkeby.etherscan.io/tx/'
      window.open(`${baseUrl}${this.txHash}`, '_blank')
    }
  }
}
</script>

<style scoped>
.vote-confirmation {
  max-width: 600px;
  margin: 0 auto;
}

.confirmation-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
}

.vote-animation {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.transaction-hash {
  word-break: break-all;
  background-color: #f8f9fa;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
