<template>
  <button 
    @click="connectMetaMask" 
    class="btn btn-metamask"
    :disabled="isConnecting || !isMetaMaskInstalled">
    <div v-if="isConnecting" class="spinner-border spinner-border-sm me-2" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <i v-else class="fab fa-ethereum me-2"></i>
    {{ buttonText }}
  </button>
</template>

<script>
import web3Service from '@/services/web3'

export default {
  name: 'MetaMaskButton',
  props: {
    onConnected: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      isConnecting: false,
      isMetaMaskInstalled: false,
      account: null
    }
  },
  computed: {
    buttonText() {
      if (!this.isMetaMaskInstalled) return 'MetaMask Not Installed'
      if (this.isConnecting) return 'Connecting...'
      if (this.account) return `Connected: ${this.account.substring(0, 6)}...${this.account.substring(this.account.length - 4)}`
      return 'Connect MetaMask'
    }
  },
  methods: {
    async connectMetaMask() {
      if (!this.isMetaMaskInstalled || this.isConnecting) return
      
      try {
        this.isConnecting = true
        await web3Service.connect()
        this.account = await web3Service.getAccount()
        this.onConnected(this.account)
      } catch (error) {
        console.error('MetaMask connection error:', error)
        alert('Failed to connect to MetaMask: ' + error.message)
      } finally {
        this.isConnecting = false
      }
    },
    async checkConnection() {
      try {
        if (web3Service.isConnected()) {
          this.account = await web3Service.getAccount()
        }
      } catch (error) {
        console.error('Error checking connection:', error)
      }
    }
  },
  async mounted() {
    // Check if MetaMask is installed
    this.isMetaMaskInstalled = web3Service.isMetaMaskInstalled()
    
    // Check if already connected
    this.checkConnection()
    
    // Listen for account changes
    window.ethereum?.on('accountsChanged', (accounts) => {
      if (accounts.length > 0) {
        this.account = accounts[0]
        this.onConnected(this.account)
      } else {
        this.account = null
      }
    })
  }
}
</script>

<style scoped>
.btn-metamask {
  position: relative;
  transition: all 0.3s ease;
}

.btn-metamask:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(246, 133, 27, 0.3);
}

.btn-metamask:disabled {
  background-color: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}
</style>
