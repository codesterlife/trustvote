<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero-section mb-5">
      <div class="row align-items-center">
        <div class="col-lg-6">
          <h1 class="display-4 fw-bold mb-3">
            Secure Elections with Blockchain Technology
          </h1>
          <p class="lead mb-4">
            TrustVote delivers trustless voting using Ethereum smart contracts for transparent,
            tamper-proof elections with real-time results.
          </p>
          <div class="d-flex flex-wrap gap-2">
            <router-link to="/register" class="btn btn-primary btn-lg me-2">
              <i class="fas fa-user-plus me-2"></i>
              Register to Vote
            </router-link>
            <router-link to="/elections" class="btn btn-outline-primary btn-lg">
              <i class="fas fa-list me-2"></i>
              View Elections
            </router-link>
          </div>
        </div>
        <div class="col-lg-6 mt-5 mt-lg-0">
          <div class="blockchain-visual p-4 text-center">
            <div class="blockchain-animation">
              <i class="fas fa-cubes fa-5x text-primary mb-3"></i>
            </div>
            <div class="blockchain-tagline">
              <h3 class="mb-3">Blockchain-Powered Voting</h3>
              <p class="mb-0">End-to-end verifiable elections</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Features Section -->
    <section class="features-section mb-5">
      <h2 class="section-title mb-4">Key Features</h2>
      <div class="row">
        <div class="col-md-4 mb-4">
          <div class="feature-card card h-100">
            <div class="card-body">
              <div class="feature-icon mb-3">
                <i class="fas fa-shield-alt fa-2x text-primary"></i>
              </div>
              <h3 class="card-title h5">Secure Authentication</h3>
              <p class="card-text">
                Login with MetaMask wallet for secure, blockchain-based authentication.
              </p>
            </div>
          </div>
        </div>
        
        <div class="col-md-4 mb-4">
          <div class="feature-card card h-100">
            <div class="card-body">
              <div class="feature-icon mb-3">
                <i class="fas fa-check-double fa-2x text-primary"></i>
              </div>
              <h3 class="card-title h5">Tamper-Proof Voting</h3>
              <p class="card-text">
                Votes are recorded on the Ethereum blockchain, making them immutable and verifiable.
              </p>
            </div>
          </div>
        </div>
        
        <div class="col-md-4 mb-4">
          <div class="feature-card card h-100">
            <div class="card-body">
              <div class="feature-icon mb-3">
                <i class="fas fa-chart-pie fa-2x text-primary"></i>
              </div>
              <h3 class="card-title h5">Real-Time Results</h3>
              <p class="card-text">
                View election results in real-time once voting has ended, directly from the blockchain.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- How It Works Section -->
    <section class="how-it-works-section mb-5">
      <h2 class="section-title mb-4">How It Works</h2>
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-icon">
            <i class="fas fa-user-plus"></i>
          </div>
          <div class="timeline-content">
            <h3>Register & Connect Wallet</h3>
            <p>
              Create an account and connect your MetaMask wallet to verify your identity.
            </p>
          </div>
        </div>
        
        <div class="timeline-item">
          <div class="timeline-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="timeline-content">
            <h3>Get Whitelisted</h3>
            <p>
              Admins verify your eligibility and whitelist your Ethereum address to vote.
            </p>
          </div>
        </div>
        
        <div class="timeline-item">
          <div class="timeline-icon">
            <i class="fas fa-vote-yea"></i>
          </div>
          <div class="timeline-content">
            <h3>Cast Your Vote</h3>
            <p>
              Browse active elections, review candidates, and cast your vote securely.
            </p>
          </div>
        </div>
        
        <div class="timeline-item">
          <div class="timeline-icon">
            <i class="fas fa-chart-bar"></i>
          </div>
          <div class="timeline-content">
            <h3>View Results</h3>
            <p>
              Once voting has ended, view the transparent, blockchain-verified results.
            </p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- MetaMask Connection -->
    <section class="metamask-section mb-5">
      <h2 class="section-title mb-4">Connect with MetaMask</h2>
      <div class="row">
        <div class="col-lg-6 offset-lg-3">
          <ConnectWallet />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import ConnectWallet from '@/components/ConnectWallet.vue'

export default {
  name: 'Home',
  components: {
    ConnectWallet
  }
}
</script>

<style scoped>
.hero-section {
  padding: 40px 0;
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 30px;
}

.section-title {
  position: relative;
  padding-bottom: 15px;
  margin-bottom: 25px;
  text-align: center;
}

.section-title:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 70px;
  height: 3px;
  background-color: #6c63ff;
}

.feature-card {
  border-radius: 10px;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  display: inline-block;
  width: 60px;
  height: 60px;
  line-height: 60px;
  text-align: center;
  border-radius: 50%;
  background-color: rgba(108, 99, 255, 0.1);
}

.blockchain-visual {
  background-color: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.blockchain-animation {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

/* Timeline Styling */
.timeline {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
}

.timeline:before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 3px;
  background: #e9ecef;
  transform: translateX(-50%);
}

.timeline-item {
  display: flex;
  margin-bottom: 40px;
  position: relative;
}

.timeline-item:nth-child(even) {
  flex-direction: row-reverse;
}

.timeline-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #6c63ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
}

.timeline-content {
  width: 45%;
  padding: 20px;
  background: white;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.timeline-item:nth-child(odd) .timeline-content {
  margin-right: 55%;
}

.timeline-item:nth-child(even) .timeline-content {
  margin-left: 55%;
}

@media (max-width: 767px) {
  .timeline:before {
    left: 20px;
  }
  
  .timeline-item,
  .timeline-item:nth-child(even) {
    flex-direction: row;
  }
  
  .timeline-icon {
    left: 20px;
    transform: none;
  }
  
  .timeline-content,
  .timeline-item:nth-child(odd) .timeline-content,
  .timeline-item:nth-child(even) .timeline-content {
    width: calc(100% - 60px);
    margin-left: 60px;
    margin-right: 0;
  }
}
</style>
