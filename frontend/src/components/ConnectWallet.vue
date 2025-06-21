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
            <button @click="handleConnect" class="btn wallet-btn btn-lg" :disabled="isLoading">
              <i class="fas me-2" :class="isLoading ? 'fa-spinner fa-spin' : 'fa-plug'"></i>
              {{ isLoading ? 'Connecting...' : 'Connect MetaMask' }}
            </button>
          </div>
          
          <div v-else class="wallet-connected">
            <div class="alert alert-success d-flex align-items-center">
              <i class="fas fa-check-circle me-2"></i>
              <div>
                <strong>Wallet Connected:</strong> {{ truncatedWalletAddress }}
              </div>
            </div>
            <div class="network-info mt-2 mb-3">
              <span class="badge" :class="networkBadgeClass">
                {{ networkName }}
              </span>
            </div>
            
            <!-- Whitelisting Status -->
            <div class="mt-3" v-if="isLoggedIn">
              <div v-if="isWalletLinked">
                <div class="alert alert-info">
                  <i class="fas fa-info-circle me-2"></i>
                  Your wallet is connected and linked to your account.
                </div>

                <div v-if="whitelistedElections.length > 0" class="alert alert-success">
                  <i class="fas fa-user-check me-2"></i>
                  Your wallet is whitelisted for the following elections:
                  <ul class="mt-2">
                    <li v-for="election in whitelistedElections" :key="election.id">
                      {{ election.election_title }}
                    </li>
                  </ul>
                </div>
                <div v-else class="alert alert-info">
                  <i class="fas fa-info-circle me-2"></i>
                  Your wallet is linked to your account but not yet whitelisted for voting. 
                  Please wait for an admin to approve your account.
                </div>
              </div>
              <div v-else>
                <div class="alert alert-warning">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  Your wallet is connected but not linked to your account.
                </div>
                <button @click="linkWalletToAccount" class="btn btn-primary" :disabled="isLinking">
                  <i class="fas me-2" :class="isLinking ? 'fa-spinner fa-spin' : 'fa-link'"></i>
                  {{ isLinking ? 'Linking...' : 'Link Wallet to Account' }}
                </button>
              </div>
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
        
        <!-- Error messages -->
        <div v-if="error" class="mt-3 alert alert-danger">
          <i class="fas fa-exclamation-circle me-2"></i>
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex'
import api from '@/services/api'

export default {
  name: 'ConnectWallet',
  data() {
    return {
      isLoading: false,
      isLinking: false,
      error: null,
      whitelistedElections: []
    }
  },
  computed: {
    ...mapGetters(['hasMetaMask', 'isConnected', 'walletAddress', 'networkId', 'isLoggedIn']),
    ...mapState({
      currentUser: state => state.user
    }),
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
    },
    isWalletLinked() {
      return this.currentUser && 
             this.currentUser.wallet_address && 
             this.walletAddress && 
             this.currentUser.wallet_address.toLowerCase() === this.walletAddress.toLowerCase()
    },
    isWhitelisted() {
      return this.currentUser && this.currentUser.is_whitelisted
    }
  },
  methods: {
    ...mapActions(['connectWallet']),
    async handleConnect() {
      this.isLoading = true
      this.error = null
      
      try {
        await this.connectWallet()
      } catch (error) {
        console.error('Failed to connect wallet:', error)
        this.error = error.message || 'Failed to connect MetaMask. Please make sure MetaMask is unlocked.'
      } finally {
        this.isLoading = false
      }
    },
    async linkWalletToAccount() {
      if (!this.isConnected || !this.walletAddress) {
        this.error = 'Please connect your MetaMask wallet first'
        return
      }
      
      this.isLinking = true
      this.error = null
      
      try {
        // Call API to update wallet address for current user
        await api.updateWallet({ wallet_address: this.walletAddress })
        window.location.reload(true)
        
        // Refresh user data to update the UI
        const response = await api.getCurrentUser()
        this.$store.commit('SET_USER', response.data)
        
      } catch (error) {
        console.error('Failed to link wallet to account:', error)
        this.error = error.response?.data?.error || 'Failed to link wallet to your account'
      } finally {
        this.isLinking = false
      }
    }, 
    async loadWhitelistedElections() {
      try {
        const response = await api.getVoterElectionWhitelist()
        this.whitelistedElections = response.data.filter(
          item => item.is_whitelisted && item.voter_name === this.currentUser.username
        )
      } catch (error) {
        console.error('Error fetching whitelisted elections:', error)
        this.error = 'Failed to load whitelisted elections'
      }
    }
  },
  async created() {
    if (this.isLoggedIn && this.isWalletLinked) {
      await this.loadWhitelistedElections()
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

.network-info {
  display: flex;
  justify-content: center;
}

.badge {
  font-size: 0.85rem;
  padding: 0.5rem 0.75rem;
}
</style>
