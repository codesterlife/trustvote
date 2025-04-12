<template>
  <div class="register">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <h3 class="card-title mb-0">Register for TrustVote</h3>
          </div>
          
          <div class="card-body">
            <div v-if="error" class="alert alert-danger">
              {{ error }}
            </div>
            
            <form @submit.prevent="handleRegister">
              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input
                  type="text"
                  class="form-control"
                  id="username"
                  v-model="formData.username"
                  required
                  autofocus
                >
              </div>
              
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="formData.email"
                >
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="first_name" class="form-label">First Name</label>
                  <input
                    type="text"
                    class="form-control"
                    id="first_name"
                    v-model="formData.first_name"
                  >
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="last_name" class="form-label">Last Name</label>
                  <input
                    type="text"
                    class="form-control"
                    id="last_name"
                    v-model="formData.last_name"
                  >
                </div>
              </div>
              
              <div class="mb-3">
                <label for="student_id" class="form-label">Student ID</label>
                <input
                  type="text"
                  class="form-control"
                  id="student_id"
                  v-model="formData.student_id"
                  required
                >
                <small class="text-muted">Your student ID will be verified by administrators</small>
              </div>
              
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="formData.password"
                  required
                >
              </div>
              
              <div class="mb-3">
                <label for="confirm_password" class="form-label">Confirm Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="confirm_password"
                  v-model="confirmPassword"
                  required
                >
                <div v-if="passwordMismatch" class="text-danger mt-1">
                  Passwords do not match
                </div>
              </div>
              
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary" :disabled="loading || passwordMismatch">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Register
                </button>
              </div>
            </form>
            
            <div class="mt-4 text-center">
              <p>Already have an account? <router-link to="/login">Login</router-link></p>
            </div>
          </div>
        </div>
        
        <div class="mt-4 card blockchain-info">
          <div class="card-body">
            <h5 class="card-title">
              <i class="bi bi-info-circle me-2"></i>
              Next Steps After Registration
            </h5>
            <p class="card-text">
              After registering, you'll need to:
            </p>
            <ol>
              <li>Wait for admin verification of your student ID</li>
              <li>Log in to your account</li>
              <li>Connect your MetaMask wallet</li>
              <li>Participate in active elections</li>
            </ol>
          </div>
        </div>
      </div>
      
      <div class="col-md-6 d-none d-md-block">
        <div class="registration-info">
          <h2>Join the Blockchain Voting Revolution</h2>
          <p class="lead">TrustVote brings several benefits to the election process:</p>
          
          <ul class="feature-list">
            <li><i class="bi bi-check-circle"></i> Immutability: Votes cannot be altered once cast</li>
            <li><i class="bi bi-shield-lock"></i> Security: Cryptographic protection of your vote</li>
            <li><i class="bi bi-eye"></i> Transparency: Public verification of results</li>
            <li><i class="bi bi-arrow-repeat"></i> No double-voting: Smart contracts prevent multiple votes</li>
          </ul>
          
          <div class="mt-4">
            <h5>What You'll Need:</h5>
            <p>
              <i class="bi bi-wallet2 me-2"></i> MetaMask Wallet - A browser extension that allows you to interact with the Ethereum blockchain
            </p>
            <p>
              <i class="bi bi-person-badge me-2"></i> Valid Student ID - To verify your eligibility to vote
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiService from '@/services/api';

export default {
  name: 'Register',
  data() {
    return {
      formData: {
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        student_id: '',
        password: '',
        wallet_address: ''
      },
      confirmPassword: '',
      loading: false,
      error: null
    };
  },
  computed: {
    passwordMismatch() {
      return this.formData.password && this.confirmPassword && 
             this.formData.password !== this.confirmPassword;
    }
  },
  methods: {
    async handleRegister() {
      if (this.passwordMismatch) {
        return;
      }
      
      this.loading = true;
      this.error = null;
      
      try {
        await apiService.register(this.formData);
        this.$store.commit('setNotification', {
          message: 'Registration successful! Please log in.',
          type: 'success'
        });
        this.$router.push('/login');
      } catch (error) {
        this.error = error.response?.data?.detail || 
                    'Registration failed. Please check your information and try again.';
        console.error('Registration error:', error);
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
.register {
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

.registration-info {
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
