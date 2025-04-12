<template>
  <div class="login-page">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-5">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">
            <h3 class="mb-0">Login to TrustVote</h3>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleLogin">
              <!-- Error Alert -->
              <div v-if="error" class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-circle me-2"></i>
                {{ error }}
              </div>
              
              <!-- Form Fields -->
              <div class="mb-3">
                <label for="email" class="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  v-model="form.email"
                  class="form-control"
                  required
                >
              </div>
              
              <div class="mb-4">
                <label for="password" class="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  v-model="form.password"
                  class="form-control"
                  required
                >
              </div>
              
              <div class="mb-4">
                <div class="blockchain-info alert alert-secondary">
                  <h5 class="mb-2">
                    <i class="fab fa-ethereum me-2"></i>
                    MetaMask Integration
                  </h5>
                  <p class="mb-0">
                    After login, you will need to connect your MetaMask wallet to participate in elections.
                  </p>
                </div>
              </div>
              
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary btn-lg" :disabled="isLoading">
                  <i class="fas" :class="isLoading ? 'fa-spinner fa-spin' : 'fa-sign-in-alt'"></i>
                  {{ isLoading ? 'Logging in...' : 'Login' }}
                </button>
                
                <div class="text-center mt-3">
                  Don't have an account? 
                  <router-link to="/register" class="text-decoration-none">Register</router-link>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        <!-- MetaMask Connection (shown after login) -->
        <div v-if="isLoggedIn" class="mt-4">
          <ConnectWallet />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ConnectWallet from '@/components/ConnectWallet.vue'

export default {
  name: 'Login',
  components: {
    ConnectWallet
  },
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      error: null,
      isLoading: false
    }
  },
  computed: {
    ...mapGetters(['isLoggedIn'])
  },
  methods: {
    ...mapActions(['login']),
    async handleLogin() {
      this.error = null
      this.isLoading = true
      
      try {
        await this.login({
          email: this.form.email,
          password: this.form.password
        })
        
        // Redirect to elections page on successful login
        this.$router.push('/elections')
      } catch (error) {
        console.error('Login error:', error)
        
        if (error.response && error.response.data) {
          // Handle API error messages
          if (error.response.data.non_field_errors) {
            this.error = error.response.data.non_field_errors[0]
          } else if (error.response.data.detail) {
            this.error = error.response.data.detail
          } else {
            this.error = 'Invalid email or password'
          }
        } else {
          this.error = 'Login failed. Please try again.'
        }
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  margin-top: 40px;
}

.blockchain-info {
  border-radius: 8px;
}
</style>
