<template>
  <div class="home">
    <!-- Hero Section -->
    <div class="hero-section py-5 mb-5 text-center">
      <div class="container">
        <h1 class="display-4 fw-bold mb-4">Welcome to TrustVote</h1>
        <p class="lead mb-4">
          A secure, transparent, and decentralized voting platform powered by blockchain technology.
          Cast your vote with confidence knowing it's immutable and verifiable.
        </p>
        <div class="d-flex justify-content-center gap-3">
          <router-link to="/register" class="btn btn-primary btn-lg" v-if="!isAuthenticated">
            Get Started
          </router-link>
          <router-link to="/elections" class="btn btn-success btn-lg" v-if="isAuthenticated">
            View Elections
          </router-link>
          <MetaMaskButton v-if="!isAuthenticated" @connected="handleMetaMaskConnect" />
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="container mb-5">
      <h2 class="text-center mb-5">Why Choose TrustVote?</h2>
      <div class="row g-4">
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body text-center">
              <div class="feature-icon mb-3">
                <i class="fas fa-shield-alt fa-3x text-primary"></i>
              </div>
              <h4>Secure</h4>
              <p>Your vote is securely recorded on the Ethereum blockchain, making it tamper-proof.</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body text-center">
              <div class="feature-icon mb-3">
                <i class="fas fa-eye fa-3x text-primary"></i>
              </div>
              <h4>Transparent</h4>
              <p>All votes are publicly verifiable while maintaining voter privacy.</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body text-center">
              <div class="feature-icon mb-3">
                <i class="fas fa-tachometer-alt fa-3x text-primary"></i>
              </div>
              <h4>Efficient</h4>
              <p>Real-time results, no counting delays, and immediate verification.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- How It Works Section -->
    <div class="container mb-5">
      <h2 class="text-center mb-5">How It Works</h2>
      <div class="row">
        <div class="col-lg-8 mx-auto">
          <div class="timeline">
            <div class="timeline-item">
              <div class="timeline-number">1</div>
              <div class="timeline-content">
                <h5>Register & Connect MetaMask</h5>
                <p>Create an account and connect your MetaMask wallet to verify your identity.</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-number">2</div>
              <div class="timeline-content">
                <h5>Browse Active Elections</h5>
                <p>View all available elections and read about the candidates.</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-number">3</div>
              <div class="timeline-content">
                <h5>Cast Your Vote</h5>
                <p>Select your preferred candidate and confirm your vote through MetaMask.</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-number">4</div>
              <div class="timeline-content">
                <h5>Verify & Track</h5>
                <p>Receive confirmation of your vote on the blockchain and view the results.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Latest Elections Section -->
    <div class="container mb-5" v-if="latestElections.length > 0">
      <h2 class="text-center mb-4">Latest Elections</h2>
      <div class="row row-cols-1 row-cols-md-3 g-4">
        <div v-for="election in latestElections" :key="election.electionId" class="col">
          <ElectionCard :election="election" @vote="goToElection" />
        </div>
      </div>
      <div class="text-center mt-4">
        <router-link to="/elections" class="btn btn-outline-primary">
          View All Elections
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import MetaMaskButton from '@/components/MetaMaskButton.vue'
import ElectionCard from '@/components/ElectionCard.vue'
import web3Service from '@/services/web3'
import api from '@/services/api'

export default {
  name: 'Home',
  components: {
    MetaMaskButton,
    ElectionCard
  },
  data() {
    return {
      isAuthenticated: false,
      latestElections: []
    }
  },
  methods: {
    async handleMetaMaskConnect(account) {
      try {
        // After MetaMask connection, check if user is registered
        const response = await api.getVoterByAddress(account)
        if (response.data) {
          // User exists, redirect to elections page
          this.$router.push('/elections')
        } else {
          // User doesn't exist, redirect to registration
          this.$router.push('/register')
        }
      } catch (error) {
        console.error('Error checking voter:', error)
        // If error, likely user not found - redirect to registration
        this.$router.push('/register')
      }
    },
    goToElection(election) {
      this.$router.push({ name: 'election-detail', params: { id: election.electionId }})
    },
    async fetchLatestElections() {
      try {
        const response = await api.getElections({ limit: 3, status: 'active' })
        this.latestElections = response.data
      } catch (error) {
        console.error('Error fetching latest elections:', error)
      }
    }
  },
  async mounted() {
    this.isAuthenticated = await web3Service.isAuthenticated()
    this.fetchLatestElections()
  }
}
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  padding: 80px 0;
  border-radius: 0 0 50px 50px;
}

.feature-icon {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeline {
  position: relative;
  padding-left: 40px;
}

.timeline:before {
  content: '';
  position: absolute;
  left: 20px;
  top: 0;
  height: 100%;
  width: 2px;
  background: var(--primary-color);
}

.timeline-item {
  margin-bottom: 30px;
  position: relative;
}

.timeline-number {
  position: absolute;
  left: -40px;
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.timeline-content {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}
</style>
