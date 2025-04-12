<template>
  <div class="home">
    <div class="jumbotron mb-4 p-5 bg-light rounded-3">
      <div class="container-fluid">
        <h1 class="display-5 fw-bold">🗳️ TrustVote</h1>
        <p class="col-md-8 fs-5">
          A blockchain-based voting system ensuring transparent and secure elections with immutable results.
        </p>
        
        <div v-if="!isAuthenticated" class="mt-4">
          <router-link to="/register" class="btn btn-primary btn-lg me-2">Register</router-link>
          <router-link to="/login" class="btn btn-outline-secondary btn-lg">Login</router-link>
        </div>
        
        <div v-else-if="!web3Connected" class="mt-4">
          <MetaMaskButton :alreadyConnected="false" @connected="onWalletConnected" />
          <p class="text-muted mt-2">
            Connect your MetaMask wallet to participate in elections.
          </p>
        </div>
      </div>
    </div>
    
    <div v-if="isAuthenticated" class="mb-5">
      <h2 class="mb-4">Active Elections</h2>
      
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Loading elections...</p>
      </div>
      
      <div v-else-if="activeElections.length === 0" class="text-center py-5 bg-light rounded">
        <p class="mb-0">No active elections at the moment.</p>
      </div>
      
      <div v-else class="row">
        <div v-for="election in activeElections" :key="election.id" class="col-md-6 col-lg-4">
          <ElectionCard :election="election" />
        </div>
      </div>
      
      <h2 class="mb-4 mt-5">Past Elections</h2>
      
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      
      <div v-else-if="pastElections.length === 0" class="text-center py-5 bg-light rounded">
        <p class="mb-0">No past elections found.</p>
      </div>
      
      <div v-else class="row">
        <div v-for="election in pastElections" :key="election.id" class="col-md-6 col-lg-4">
          <ElectionCard :election="election" />
        </div>
      </div>
    </div>
    
    <div v-if="isAuthenticated && isAdmin" class="mt-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Admin Actions</h2>
        <router-link to="/admin/elections" class="btn btn-primary">
          Go to Admin Dashboard
        </router-link>
      </div>
    </div>
    
    <div v-if="!isAuthenticated" class="mt-5">
      <h2 class="mb-4">How It Works</h2>
      
      <div class="row g-4">
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body text-center py-4">
              <h3 class="card-title mb-3">Register & Connect</h3>
              <p class="card-text">
                Create an account and connect your MetaMask wallet to participate in elections.
              </p>
            </div>
          </div>
        </div>
        
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body text-center py-4">
              <h3 class="card-title mb-3">Vote Securely</h3>
              <p class="card-text">
                Cast your vote using blockchain technology for maximum security and transparency.
              </p>
            </div>
          </div>
        </div>
        
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body text-center py-4">
              <h3 class="card-title mb-3">Verify Results</h3>
              <p class="card-text">
                All votes are recorded on the blockchain, ensuring tamper-proof and verifiable results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import ElectionCard from '@/components/ElectionCard.vue';
import MetaMaskButton from '@/components/MetaMaskButton.vue';
import apiService from '@/services/api';

export default {
  name: 'Home',
  components: {
    ElectionCard,
    MetaMaskButton
  },
  data() {
    return {
      loading: false,
      allElections: []
    };
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'isAdmin',
      'getWeb3Account'
    ]),
    web3Connected() {
      return !!this.getWeb3Account;
    },
    activeElections() {
      return this.allElections.filter(election => 
        election.status === 'voting' && new Date(election.end_time) >= new Date()
      );
    },
    pastElections() {
      return this.allElections.filter(election => 
        election.status === 'closed' || 
        (election.status === 'voting' && new Date(election.end_time) < new Date())
      );
    }
  },
  created() {
    if (this.isAuthenticated) {
      this.fetchElections();
    }
  },
  methods: {
    async fetchElections() {
      this.loading = true;
      try {
        const response = await apiService.getElections();
        this.allElections = response.data;
      } catch (error) {
        console.error('Error fetching elections:', error);
        this.$store.commit('setNotification', {
          message: 'Failed to load elections',
          type: 'danger'
        });
      } finally {
        this.loading = false;
      }
    },
    async onWalletConnected(account) {
      await this.$store.dispatch('connectWallet');
      this.fetchElections();
    }
  }
};
</script>

<style scoped>
.jumbotron {
  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 10px;
  margin-bottom: 2rem;
}

h2 {
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
}
</style>
