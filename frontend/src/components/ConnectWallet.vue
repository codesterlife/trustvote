<template>
  <div class="connect-wallet-container">
    <div class="card blockchain-bg">
      <div class="card-body">
        <h5 class="card-title mb-3">
          <i class="fas fa-wallet me-2"></i>
          Connect Your Wallet
        </h5>
        
        <div v-if="hasMetaMask">
          <div v-if="!isConnected" class="text-center py-4">
            <p class="mb-4">
              Please connect your MetaMask wallet to participate in elections.
            </p>
            <button @click="handleConnect" class="btn wallet-btn btn-lg">
              <i class="fas fa-plug me-2"></i>
              Connect MetaMask
            </button>
          </div>
          
          <div v-else class="wallet-connected">
            <div class="alert alert-success d-flex align-items-center">
              <i class="fas fa-check-circle me-2"></i>
              <div>
                <strong>Wallet Connected:</strong> {{ truncatedWalletAddress }}
              </div>
            </div>
            <div class="network-info mt-2">
              <span class="badge" :class="networkBadgeClass">
                {{ networkName }}
              </span>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-4">
          <div class="alert alert-warning">
            <i class="fas fa-exclamation-triangle me-2"></i>
            MetaMask not detected!
          </div>
          <p class="mt-3">
            Please install MetaMask browser extension to use TrustVote.
          </p>
          <a href="https://metamask.io/download.html" target="_blank" class="btn btn-primary mt-2">
            <i class="fas fa-download me-2"></i>
            Install MetaMask
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'ConnectWallet',
  computed: {
    ...mapGetters(['hasMetaMask', 'isConnected', 'walletAddress', 'networkId']),
    truncatedWalletAddress() {
      if (!this.walletAddress) return ''
      return this.walletAddress.slice(0, 6) + '...' + this.walletAddress.slice(-4)
    },
    networkName() {
      const networks = {
        1: 'Ethereum Mainnet',
        3: 'Ropsten Testnet',
        4: 'Rinkeby Testnet',
        5: 'Goerli Testnet',
        42: 'Kovan Testnet',
        1337: 'Local Ganache'
      }
      return networks[this.networkId] || `Network ID: ${this.networkId}`
    },
    networkBadgeClass() {
      // Ganache or testnets are fine for development
      const testNets = [3, 4, 5, 42, 1337]
      return testNets.includes(this.networkId) 
        ? 'bg-info' 
        : (this.networkId === 1 ? 'bg-success' : 'bg-warning')
    }
  },
  methods: {
    ...mapActions(['connectWallet']),
    async handleConnect() {
      try {
        await this.connectWallet()
      } catch (error) {
        console.error('Failed to connect wallet:', error)
      }
    }
  }
}
</script>

<style scoped>
.connect-wallet-container {
  margin: 20px 0;
}

.wallet-btn {
  background-color: #6c63ff;
  color: white;
  transition: all 0.3s ease;
}

.wallet-btn:hover {
  background-color: #5a52d5;
  box-shadow: 0 4px 8px rgba(108, 99, 255, 0.2);
}

.wallet-connected {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
