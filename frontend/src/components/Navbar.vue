<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container">
      <router-link class="navbar-brand d-flex align-items-center" to="/">
        <i class="fas fa-vote-yea me-2 text-primary"></i>
        <span class="fw-bold">TrustVote</span>
      </router-link>
      
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/">Home</router-link>
          </li>
          <li class="nav-item" v-if="isLoggedIn">
            <router-link class="nav-link" to="/elections">Elections</router-link>
          </li>
          <li class="nav-item" v-if="isLoggedIn">
            <router-link class="nav-link" to="/profile">
              <i class="fas fa-user-circle me-1"></i>Profile
            </router-link>
          </li>
          <li class="nav-item" v-if="isAdmin">
            <router-link class="nav-link" to="/admin">Admin Dashboard</router-link>
          </li>
        </ul>
        
        <div class="d-flex align-items-center">
          <!-- Wallet Connection Status -->
          <div v-if="isLoggedIn" class="me-3">
            <span v-if="walletAddress" class="badge bg-success">
              <i class="fas fa-wallet me-1"></i>
              {{ truncatedWalletAddress }}
            </span>
            <span v-else class="badge bg-warning">
              <i class="fas fa-exclamation-triangle me-1"></i>
              Wallet Not Connected
            </span>
          </div>
          
          <!-- Connect Wallet Button -->
          <button v-if="isLoggedIn && !walletAddress" 
                  @click="connectWallet" 
                  class="btn btn-sm wallet-btn me-2">
            <i class="fas fa-wallet me-1"></i>
            Connect MetaMask
          </button>
          
          <!-- Auth Buttons -->
          <template v-if="!isLoggedIn">
            <router-link to="/login" class="btn btn-outline-primary me-2">Login</router-link>
            <router-link to="/register" class="btn btn-primary">Register</router-link>
          </template>
          <button v-else @click="logout" class="btn btn-outline-danger">
            <i class="fas fa-sign-out-alt me-1"></i>
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Navbar',
  computed: {
    ...mapGetters(['isLoggedIn', 'isAdmin', 'walletAddress']),
    truncatedWalletAddress() {
      if (!this.walletAddress) return ''
      return this.walletAddress.slice(0, 6) + '...' + this.walletAddress.slice(-4)
    }
  },
  methods: {
    ...mapActions(['connectWallet', 'logout']),
    async handleConnectWallet() {
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
.navbar-brand {
  font-size: 1.5rem;
}

.wallet-btn {
  background-color: #6c63ff;
  color: white;
}

.wallet-btn:hover {
  background-color: #5a52d5;
}
</style>
