<template>
  <div class="admin-dashboard">
    <div class="admin-header mb-4">
      <h1 class="mb-3">Admin Dashboard</h1>
    </div>
    
    <div class="card mb-4">
      <div class="card-body">
        <ul class="nav nav-tabs">
          <li class="nav-item">
            <router-link :to="{ name: 'AdminElections' }" class="nav-link" active-class="active">
              <i class="bi bi-calendar-event me-1"></i> Elections
            </router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'AdminCandidates' }" class="nav-link" active-class="active">
              <i class="bi bi-person-badge me-1"></i> Candidates
            </router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'AdminVoters' }" class="nav-link" active-class="active">
              <i class="bi bi-people me-1"></i> Voters
            </router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'AdminResults' }" class="nav-link" active-class="active">
              <i class="bi bi-bar-chart me-1"></i> Results
            </router-link>
          </li>
        </ul>
        
        <router-view></router-view>
      </div>
    </div>
    
    <div class="blockchain-info card mb-4">
      <div class="card-body">
        <div class="d-flex align-items-center">
          <div class="blockchain-status me-3">
            <h5 class="mb-2">Blockchain Status</h5>
            <div v-if="web3Available" class="status-badge bg-success">
              <i class="bi bi-check-circle-fill me-1"></i>
              Connected
            </div>
            <div v-else class="status-badge bg-danger">
              <i class="bi bi-exclamation-triangle-fill me-1"></i>
              Not Connected
            </div>
          </div>
          
          <div class="wallet-info" v-if="web3Account">
            <div class="info-label">Admin Wallet Address:</div>
            <div class="info-value">{{ web3Account }}</div>
          </div>
          
          <div class="ms-auto" v-if="!web3Account">
            <MetaMaskButton 
              :alreadyConnected="false"
              @connected="onWalletConnected"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import MetaMaskButton from '@/components/MetaMaskButton.vue';

export default {
  name: 'Dashboard',
  components: {
    MetaMaskButton
  },
  computed: {
    ...mapGetters([
      'isAdmin',
      'isWeb3Available',
      'getWeb3Account'
    ]),
    web3Available() {
      return this.isWeb3Available;
    },
    web3Account() {
      return this.getWeb3Account;
    }
  },
  created() {
    // Redirect if not an admin
    if (!this.isAdmin) {
      this.$router.push('/');
      this.$store.commit('setNotification', {
        message: 'You do not have permission to access the admin area',
        type: 'danger'
      });
    }
  },
  methods: {
    async onWalletConnected(account) {
      await this.$store.dispatch('connectWallet');
    }
  }
};
</script>

<style scoped>
.admin-dashboard {
  margin-top: 2rem;
}

.admin-header {
  border-bottom: 1px solid #eee;
  padding-bottom: 1.5rem;
}

.nav-tabs {
  margin-bottom: 1.5rem;
}

.nav-tabs .nav-link {
  color: #666;
  font-weight: 500;
}

.nav-tabs .nav-link.active {
  font-weight: 600;
  color: #1890ff;
  border-color: #dee2e6 #dee2e6 #fff;
}

.blockchain-info {
  background-color: #f8f9fa;
  border: none;
}

.status-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 15px;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
}

.wallet-info {
  flex: 1;
  margin-left: 20px;
  padding-left: 20px;
  border-left: 1px solid #eee;
}

.info-label {
  font-size: 0.9rem;
  color: #666;
}

.info-value {
  font-family: monospace;
  font-size: 0.9rem;
  word-break: break-all;
}
</style>
