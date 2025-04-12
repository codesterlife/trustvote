<template>
  <div class="register-page">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">
            <h3 class="mb-0">Register for TrustVote</h3>
          </div>
          <div class="card-body">
            <div v-if="registrationSuccess" class="registration-success">
              <div class="text-center mb-4">
                <i class="fas fa-check-circle text-success fa-5x"></i>
                <h4 class="mt-3">Registration Successful!</h4>
                <p class="lead">Your account has been created and is pending admin approval.</p>
              </div>
              <div class="alert alert-info">
                <p><strong>What happens next?</strong></p>
                <ol>
                  <li>An admin will verify your details</li>
                  <li>Once approved, you'll be able to connect your MetaMask wallet</li>
                  <li>You can then participate in eligible elections</li>
                </ol>
              </div>
              <div class="text-center mt-4">
                <router-link to="/login" class="btn btn-primary">
                  Proceed to Login
                </router-link>
              </div>
            </div>
            
            <form v-else @submit.prevent="register">
              <div class="alert alert-info mb-4">
                <i class="fas fa-info-circle me-2"></i>
                Please provide your details to register. After registration, an admin will verify your account.
              </div>
              
              <!-- Form Fields -->
              <div class="mb-3">
                <label for="name" class="form-label">Full Name*</label>
                <input
                  type="text"
                  id="name"
                  v-model="form.name"
                  class="form-control"
                  :class="{ 'is-invalid': errors.name }"
                  required
                >
                <div v-if="errors.name" class="invalid-feedback">
                  {{ errors.name }}
                </div>
              </div>
              
              <div class="mb-3">
                <label for="studentId" class="form-label">Student ID*</label>
                <input
                  type="text"
                  id="studentId"
                  v-model="form.studentId"
                  class="form-control"
                  :class="{ 'is-invalid': errors.studentId }"
                  required
                >
                <div v-if="errors.studentId" class="invalid-feedback">
                  {{ errors.studentId }}
                </div>
              </div>
              
              <div class="mb-3">
                <label for="email" class="form-label">Email Address*</label>
                <input
                  type="email"
                  id="email"
                  v-model="form.email"
                  class="form-control"
                  :class="{ 'is-invalid': errors.email }"
                  required
                >
                <div v-if="errors.email" class="invalid-feedback">
                  {{ errors.email }}
                </div>
              </div>
              
              <div class="mb-3">
                <label for="password" class="form-label">Password*</label>
                <input
                  type="password"
                  id="password"
                  v-model="form.password"
                  class="form-control"
                  :class="{ 'is-invalid': errors.password }"
                  required
                >
                <div v-if="errors.password" class="invalid-feedback">
                  {{ errors.password }}
                </div>
              </div>
              
              <div class="mb-4">
                <label for="confirmPassword" class="form-label">Confirm Password*</label>
                <input
                  type="password"
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  class="form-control"
                  :class="{ 'is-invalid': errors.confirmPassword }"
                  required
                >
                <div v-if="errors.confirmPassword" class="invalid-feedback">
                  {{ errors.confirmPassword }}
                </div>
              </div>
              
              <div class="blockchain-info mb-4">
                <div class="alert alert-secondary">
                  <h5 class="mb-2"><i class="fab fa-ethereum me-2"></i>Blockchain Integration</h5>
                  <p class="mb-0">
                    After registration, you'll need to connect your MetaMask wallet to participate in elections.
                    <br>
                    <small>Your wallet address will be linked to your account for secure voting.</small>
                  </p>
                </div>
              </div>
              
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                  <i class="fas" :class="isSubmitting ? 'fa-spinner fa-spin' : 'fa-user-plus'"></i>
                  {{ isSubmitting ? 'Registering...' : 'Register' }}
                </button>
                <div class="text-center mt-3">
                  Already have an account? 
                  <router-link to="/login" class="text-decoration-none">Login</router-link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'Register',
  data() {
    return {
      form: {
        name: '',
        studentId: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      errors: {},
      isSubmitting: false,
      registrationSuccess: false
    }
  },
  methods: {
    ...mapActions(['register']),
    validateForm() {
      this.errors = {}
      
      if (!this.form.name.trim()) {
        this.errors.name = 'Name is required'
      }
      
      if (!this.form.studentId.trim()) {
        this.errors.studentId = 'Student ID is required'
      }
      
      if (!this.form.email.trim()) {
        this.errors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) {
        this.errors.email = 'Invalid email format'
      }
      
      if (!this.form.password) {
        this.errors.password = 'Password is required'
      } else if (this.form.password.length < 8) {
        this.errors.password = 'Password must be at least 8 characters'
      }
      
      if (this.form.password !== this.form.confirmPassword) {
        this.errors.confirmPassword = 'Passwords do not match'
      }
      
      return Object.keys(this.errors).length === 0
    },
    async handleRegister() {
      if (!this.validateForm()) return
      
      this.isSubmitting = true
      
      try {
        await this.register({
          name: this.form.name,
          student_id: this.form.studentId,
          email: this.form.email,
          password: this.form.password
        })
        
        this.registrationSuccess = true
      } catch (error) {
        console.error('Registration error:', error)
        
        // Handle API validation errors
        if (error.response && error.response.data) {
          const apiErrors = error.response.data
          
          if (apiErrors.email) {
            this.errors.email = apiErrors.email[0]
          }
          
          if (apiErrors.student_id) {
            this.errors.studentId = apiErrors.student_id[0]
          }
          
          if (apiErrors.non_field_errors) {
            this.errors.general = apiErrors.non_field_errors[0]
          }
        } else {
          // General error
          this.errors.general = 'Registration failed. Please try again.'
        }
      } finally {
        this.isSubmitting = false
      }
    }
  }
}
</script>

<style scoped>
.register-page {
  margin-top: 20px;
}

.registration-success {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.blockchain-info {
  border-radius: 8px;
}
</style>
