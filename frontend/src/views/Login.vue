<template>
  <div class="login">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <h3 class="card-title mb-0">Login to TrustVote</h3>
          </div>
          
          <div class="card-body">
            <div v-if="error" class="alert alert-danger">
              {{ error }}
            </div>
            
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input
                  type="text"
                  class="form-control"
                  id="username"
                  v-model="credentials.username"
                  required
                  autofocus
                >
              </div>
              
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="credentials.password"
                  required
                >
              </div>
              
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Login
                </button>
              </div>
            </form>
            
            <div class="mt-4 text-center">
              <p>Don't have an account? <router-link to="/register">Register</router-link></p>
            </div>
          </div>
        </div>
        
        <div class="mt-4 card blockchain-info">
          <div class="card-body">
            <h5 class="card-title">
              <i class="bi bi-info-circle me-2"></i>
              Important Note
            </h5>
            <p class="card-text">
              After logging in, you'll need to connect your MetaMask wallet to participate 
              in blockchain-based voting.
            </p>
          </div>
        </div>
      </div>
      
      <div class="col-md-6 d-none d-md-block">
        <div class="login-info">
          <h2>Secure Blockchain Voting</h2>
          <p class="lead">TrustVote uses Ethereum blockchain technology to ensure:</p>
          
          <ul class="feature-list">
            <li><i class="bi bi-shield-check"></i> Tamper-proof voting records</li>
            <li><i class="bi bi-lock"></i> Secure identity verification</li>
            <li><i class="bi bi-eye"></i> Transparent and verifiable results</li>
            <li><i class="bi bi-person-check"></i> One person, one vote enforcement</li>
          </ul>
          
          <div class="mt-4">
            <h5>How it works:</h5>
            <p>
              Login with your credentials, connect your MetaMask wallet, and cast your vote. 
              Your vote is securely recorded on the Ethereum blockchain, ensuring it cannot 
              be altered or deleted.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      credentials: {
        username: '',
        password: ''
      },
      loading: false,
      error: null
    };
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.error = null;
      
      try {
        const success = await this.$store.dispatch('login', this.credentials);
        
        if (success) {
          this.$router.push('/');
        }
      } catch (error) {
        this.error = error.response?.data?.detail || 'Login failed. Please check your credentials.';
      } finally {
        this.loading = false;
      }
    }
  },
  created() {
    // Redirect if already logged in
    if (this.$store.getters.isAuthenticated) {
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.login {
  margin-top: 2rem;
}

.card {
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.card-header {
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  padding: 1rem;
}

.login-info {
  background-color: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  height: 100%;
}

.feature-list {
  list-style: none;
  padding-left: 0;
  margin-top: 1.5rem;
}

.feature-list li {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.feature-list li i {
  margin-right: 10px;
  color: #4285f4;
  font-size: 1.2rem;
}

.blockchain-info {
  background-color: #e6f7ff;
  border-left: 4px solid #1890ff;
}
</style>
