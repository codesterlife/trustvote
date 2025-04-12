<template>
  <div class="login-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card">
            <div class="card-header bg-primary text-white">
              <h3 class="mb-0">Login with MetaMask</h3>
            </div>
            <div class="card-body">
              <div class="text-center mb-4">
                <img src="https://metamask.io/images/metamask-fox.svg" alt="MetaMask Logo" class="metamask-logo mb-3">
                <p class="mb-4">
                  To login, you need to connect your MetaMask wallet. Your address will be verified against our registered users.
                </p>
                
                <div v-if="!isConnected">
                  <MetaMaskButton @connected="handleMetaMaskConnect" />
                </div>
                
                <div v-else-if="isVerifying" class="text-center my-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <p class="mt-3">Verifying your wallet address...</p>
                </div>
                
                <div v-else-if="isError" class="alert alert-danger mt-4">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  {{ errorMessage }}
                </div>
                
                <div v-else-if="isVerified" class="alert alert-success mt-4">
                  <i class="fas fa-check-circle me-2"></i>
                  Successfully verified! Redirecting to elections...
                </div>
              </div>
              
              <div class="text-center mt-4">
                <p>Don't have an account?</p>
                <router-link to="/register" class="btn btn-outline-primary">
                  Register Now
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MetaMaskButton from '@/components/MetaMaskButton.vue'
import web3Service from '@/services/web3'
import api from '@/services/api'

export default {
  name: 'Login',
  components: {
    MetaMaskButton
  },
  data() {
    return {
      isConnected: false,
      isVerifying: false,
      isVerified: false,
      isError: false,
      errorMessage: '',
      walletAddress: ''
    }
  },
  methods: {
    async handleMetaMaskConnect(account) {
      this.isConnected = true
      this.walletAddress = account
      this.verifyWallet(account)
    },
    async verifyWallet(address) {
      this.isVerifying = true
      this.isError = false
      this.errorMessage = ''
      
      try {
        // Check if wallet is registered with backend
        const response = await api.verifyVoter(address)
        
        if (response.data && response.data.verified) {
          // User is verified, store authentication data
          await web3Service.authenticate(response.data.token, response.data.user)
          
          this.isVerified = true
          setTimeout(() => {
            // Redirect based on query param or to elections by default
            const redirectPath = this.$route.query.redirect || '/elections'
            this.$router.push(redirectPath)
          }, 1500)
        } else {
          throw new Error('Your wallet address is not registered or not yet approved.')
        }
      } catch (error) {
        console.error('Login error:', error)
        this.isError = true
        
        if (error.response && error.response.data && error.response.data.detail) {
          this.errorMessage = error.response.data.detail
        } else {
          this.errorMessage = error.message || 'Failed to verify your wallet. Please try again.'
        }
      } finally {
        this.isVerifying = false
      }
    }
  },
  async mounted() {
    // Check if MetaMask is already connected
    if (web3Service.isConnected()) {
      const account = await web3Service.getAccount()
      if (account) {
        this.isConnected = true
        this.walletAddress = account
        this.verifyWallet(account)
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  padding: 40px 0;
}

.card {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  border: none;
  border-radius: 10px;
}

.card-header {
  border-radius: 10px 10px 0 0 !important;
}

.metamask-logo {
  width: 100px;
  height: auto;
}
</style>
