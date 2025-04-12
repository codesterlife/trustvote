<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <router-link class="navbar-brand" to="/">
        <i class="fas fa-vote-yea me-2"></i>
        TrustVote
      </router-link>
      
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/">Home</router-link>
          </li>
          <li class="nav-item" v-if="isAuthenticated">
            <router-link class="nav-link" to="/elections">Elections</router-link>
          </li>
          <li class="nav-item" v-if="isAdmin">
            <router-link class="nav-link" to="/admin">Admin</router-link>
          </li>
        </ul>
        
        <div class="d-flex align-items-center">
          <div v-if="isAuthenticated" class="d-flex align-items-center">
            <span class="text-light me-3">
              <i class="fas fa-user-circle me-1"></i>
              {{ truncatedAddress }}
            </span>
            <button @click="logout" class="btn btn-outline-light btn-sm">
              Logout
            </button>
          </div>
          <div v-else class="d-flex">
            <router-link to="/login" class="btn btn-outline-light me-2">
              Login
            </router-link>
            <router-link to="/register" class="btn btn-light">
              Register
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import web3Service from '@/services/web3'

export default {
  name: 'Navbar',
  data() {
    return {
      isAuthenticated: false,
      isAdmin: false,
      userAddress: ''
    }
  },
  computed: {
    truncatedAddress() {
      if (!this.userAddress) return ''
      return this.userAddress.substring(0, 6) + '...' + this.userAddress.substring(this.userAddress.length - 4)
    }
  },
  methods: {
    async updateAuthStatus() {
      this.isAuthenticated = await web3Service.isAuthenticated()
      this.isAdmin = await web3Service.isAdmin()
      this.userAddress = await web3Service.getAccount()
    },
    async logout() {
      await web3Service.logout()
      this.updateAuthStatus()
      this.$router.push('/')
    }
  },
  async mounted() {
    // Check authentication status when component mounts
    this.updateAuthStatus()
    
    // Listen for account changes in MetaMask
    window.ethereum?.on('accountsChanged', () => {
      this.updateAuthStatus()
    })
  }
}
</script>

<style scoped>
.navbar {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar-brand {
  font-weight: bold;
  letter-spacing: 1px;
}
</style>
