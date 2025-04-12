<template>
  <div class="register-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card">
            <div class="card-header bg-primary text-white">
              <h3 class="mb-0">Register as a Voter</h3>
            </div>
            <div class="card-body">
              <div v-if="!isMetaMaskConnected" class="text-center mb-4">
                <p class="mb-3">First, connect your MetaMask wallet to continue:</p>
                <MetaMaskButton @connected="handleMetaMaskConnect" />
              </div>
              
              <form v-else @submit.prevent="registerUser" class="needs-validation" novalidate>
                <div class="alert alert-info mb-4">
                  <div class="d-flex align-items-center">
                    <i class="fas fa-info-circle me-2"></i>
                    <div>
                      <strong>Connected Wallet:</strong> {{ truncatedWalletAddress }}
                    </div>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="studentId" class="form-label">Student ID</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="studentId" 
                    v-model="form.studentId" 
                    required
                    :class="{ 'is-invalid': errors.studentId }"
                  >
                  <div class="invalid-feedback">{{ errors.studentId }}</div>
                </div>
                
                <div class="mb-3">
                  <label for="fullName" class="form-label">Full Name</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="fullName" 
                    v-model="form.fullName" 
                    required
                    :class="{ 'is-invalid': errors.fullName }"
                  >
                  <div class="invalid-feedback">{{ errors.fullName }}</div>
                </div>
                
                <div class="mb-3">
                  <label for="email" class="form-label">Email Address</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="email" 
                    v-model="form.email" 
                    required
                    :class="{ 'is-invalid': errors.email }"
                  >
                  <div class="invalid-feedback">{{ errors.email }}</div>
                </div>
                
                <div class="mb-3">
                  <label for="department" class="form-label">Department</label>
                  <select 
                    class="form-select" 
                    id="department" 
                    v-model="form.department"
                    required
                    :class="{ 'is-invalid': errors.department }"
                  >
                    <option value="" disabled>Select your department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Business">Business</option>
                    <option value="Arts & Humanities">Arts & Humanities</option>
                    <option value="Sciences">Sciences</option>
                  </select>
                  <div class="invalid-feedback">{{ errors.department }}</div>
                </div>
                
                <div class="mb-4">
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      id="terms" 
                      v-model="form.termsAccepted"
                      required
                      :class="{ 'is-invalid': errors.termsAccepted }"
                    >
                    <label class="form-check-label" for="terms">
                      I accept the terms and conditions and understand that my wallet address will be
                      used for voting verification.
                    </label>
                    <div class="invalid-feedback">{{ errors.termsAccepted }}</div>
                  </div>
                </div>
                
                <div class="d-grid gap-2">
                  <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                    <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                    Register
                  </button>
                  <router-link to="/login" class="btn btn-outline-secondary">
                    Already registered? Login
                  </router-link>
                </div>
              </form>
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
  name: 'Register',
  components: {
    MetaMaskButton
  },
  data() {
    return {
      isMetaMaskConnected: false,
      walletAddress: '',
      isSubmitting: false,
      form: {
        studentId: '',
        fullName: '',
        email: '',
        department: '',
        termsAccepted: false
      },
      errors: {
        studentId: '',
        fullName: '',
        email: '',
        department: '',
        termsAccepted: ''
      }
    }
  },
  computed: {
    truncatedWalletAddress() {
      if (!this.walletAddress) return ''
      return this.walletAddress.substring(0, 6) + '...' + this.walletAddress.substring(this.walletAddress.length - 4)
    }
  },
  methods: {
    async handleMetaMaskConnect(account) {
      this.isMetaMaskConnected = true
      this.walletAddress = account
    },
    validateForm() {
      let isValid = true
      this.errors = {
        studentId: '',
        fullName: '',
        email: '',
        department: '',
        termsAccepted: ''
      }
      
      if (!this.form.studentId) {
        this.errors.studentId = 'Student ID is required'
        isValid = false
      }
      
      if (!this.form.fullName) {
        this.errors.fullName = 'Full name is required'
        isValid = false
      }
      
      if (!this.form.email) {
        this.errors.email = 'Email is required'
        isValid = false
      } else if (!/^\S+@\S+\.\S+$/.test(this.form.email)) {
        this.errors.email = 'Please enter a valid email address'
        isValid = false
      }
      
      if (!this.form.department) {
        this.errors.department = 'Please select your department'
        isValid = false
      }
      
      if (!this.form.termsAccepted) {
        this.errors.termsAccepted = 'You must accept the terms to continue'
        isValid = false
      }
      
      return isValid
    },
    async registerUser() {
      if (!this.validateForm()) return
      
      try {
        this.isSubmitting = true
        
        // Prepare registration data
        const registrationData = {
          student_id: this.form.studentId,
          full_name: this.form.fullName,
          email: this.form.email,
          department: this.form.department,
          wallet_address: this.walletAddress
        }
        
        // Send registration request to API
        await api.registerVoter(registrationData)
        
        // Show success message
        alert('Registration successful! An admin will verify your account soon.')
        
        // Redirect to login page
        this.$router.push('/login')
      } catch (error) {
        console.error('Registration error:', error)
        
        // Handle API errors
        if (error.response && error.response.data) {
          const responseErrors = error.response.data
          
          // Map API errors to form fields
          if (responseErrors.student_id) this.errors.studentId = responseErrors.student_id[0]
          if (responseErrors.email) this.errors.email = responseErrors.email[0]
          if (responseErrors.wallet_address) alert(`Wallet error: ${responseErrors.wallet_address[0]}`)
          
          // Generic error
          if (responseErrors.detail) alert(`Error: ${responseErrors.detail}`)
        } else {
          alert('Registration failed. Please try again later.')
        }
      } finally {
        this.isSubmitting = false
      }
    }
  },
  async mounted() {
    // Check if MetaMask is already connected
    if (web3Service.isConnected()) {
      this.isMetaMaskConnected = true
      this.walletAddress = await web3Service.getAccount()
    }
  }
}
</script>

<style scoped>
.register-page {
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
</style>
