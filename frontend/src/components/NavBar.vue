<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container">
      <router-link class="navbar-brand d-flex align-items-center" to="/">
        <span class="me-2">🗳️</span>
        <span>TrustVote</span>
      </router-link>
      
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
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
            <router-link class="nav-link" to="/admin/elections">Admin</router-link>
          </li>
        </ul>
        
        <div class="d-flex align-items-center">
          <!-- MetaMask Connection Status -->
          <div v-if="isAuthenticated" class="me-3">
            <span v-if="web3Account" class="badge bg-success text-white">
              <i class="bi bi-wallet-fill me-1"></i>
              {{ shortenAddress(web3Account) }}
            </span>
            <button v-else @click="connectWallet" class="btn btn-sm btn-warning">
              <i class="bi bi-wallet me-1"></i>
              Connect Wallet
            </button>
          </div>
          
          <!-- Auth Links -->
          <ul class="navbar-nav">
            <template v-if="isAuthenticated">
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  {{ username }}
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                  <li><a class="dropdown-item" href="#" @click.prevent="logout">Logout</a></li>
                </ul>
              </li>
            </template>
            <template v-else>
              <li class="nav-item">
                <router-link class="nav-link" to="/login">Login</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/register">Register</router-link>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'NavBar',
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'isAdmin',
      'getUser',
      'isWeb3Available',
      'getWeb3Account'
    ]),
    username() {
      return this.getUser ? this.getUser.username : '';
    },
    web3Account() {
      return this.getWeb3Account;
    }
  },
  methods: {
    async logout() {
      await this.$store.dispatch('logout');
      this.$router.push('/login');
    },
    async connectWallet() {
      await this.$store.dispatch('connectWallet');
    },
    shortenAddress(address) {
      if (!address) return '';
      return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }
  }
};
</script>

<style scoped>
.navbar-brand {
  font-weight: bold;
  font-size: 1.5rem;
}

.wallet-address {
  font-family: monospace;
  padding: 5px 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  font-size: 0.9rem;
}
</style>
