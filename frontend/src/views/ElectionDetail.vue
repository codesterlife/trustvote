<template>
  <div class="election-detail">
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading election details...</p>
    </div>
    
    <div v-else-if="!election" class="alert alert-danger">
      <i class="fas fa-exclamation-circle me-2"></i>
      Election not found or has been removed.
    </div>
    
    <div v-else>
      <!-- Election Header -->
      <div class="election-header mb-4">
        <div class="d-flex justify-content-between align-items-start">
          <h1>{{ election.title }}</h1>
          <span class="status-badge" :class="statusClass">
            {{ election.status }}
          </span>
        </div>
        <p class="lead mb-4">{{ election.description }}</p>
        
        <div class="row election-meta mb-4">
          <div class="col-md-6">
            <div class="meta-item">
              <i class="far fa-calendar-alt me-2"></i>
              <strong>Start:</strong> {{ formatDateTime(election.startTime) }}
            </div>
            <div class="meta-item">
              <i class="far fa-calendar-check me-2"></i>
              <strong>End:</strong> {{ formatDateTime(election.endTime) }}
            </div>
            <div class="meta-item" v-if="election.contractAddress">
              <i class="fab fa-ethereum me-2"></i>
              <strong>Contract:</strong> 
              <a href="#" target="_blank" class="contract-link">
                {{ truncatedContractAddress }}
              </a>
            </div>
          </div>
          <div class="col-md-6">
            <div class="meta-item">
              <i class="fas fa-users me-2"></i>
              <strong>Positions:</strong> {{ election.positions ? election.positions.length : 0 }}
            </div>
            <div class="meta-item">
              <i class="fas fa-user-check me-2"></i>
              <strong>Eligibility:</strong> Registered and whitelisted voters
            </div>
            <div class="election-timer meta-item" v-if="election.status === 'Voting'">
              <i class="fas fa-hourglass-half me-2"></i>
              <strong>{{ timerLabel }}:</strong> {{ timerValue }}
            </div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="election-actions mb-5">
          <button 
            v-if="canVote" 
            @click="goToVote" 
            class="btn btn-primary btn-lg me-2"
          >
            <i class="fas fa-vote-yea me-2"></i>
            Vote Now
          </button>
          
          <router-link :to="`/elections/${electionId}/results`" class="btn btn-outline-secondary btn-lg">
            <i class="fas fa-chart-pie me-2"></i>
            View Results
          </router-link>
        </div>
      </div>
      
      <!-- Positions and Candidates -->
      <div v-for="position in election.positions" :key="position.positionId" class="position-section mb-5">
        <div class="position-header mb-3">
          <h2>{{ position.title }}</h2>
          <p class="text-muted">Select candidates for this position</p>
        </div>
        
        <div class="row">
          <div v-for="candidate in position.candidates" :key="candidate" class="col-md-6 col-lg-4 mb-4">
            <CandidateCard 
              :candidate="getCandidateById(candidate)" 
              :showActions="false"
            />
          </div>
        </div>
      </div>
      
      <!-- Election Parties -->
      <div v-if="election.parties && election.parties.length > 0" class="parties-section mb-5">
        <h2 class="mb-4">Participating Parties</h2>
        <div class="row">
          <div v-for="party in election.parties" :key="party.partyId" class="col-md-3 mb-4">
            <div class="card party-card h-100">
              <div class="card-body text-center">
                <div class="party-logo mb-6">
                  <img :src="party.logo_url" alt="" width="64px" height="64px">
                </div>
                <br><br><br>
                <h5 class="card-title">{{ party.name }}</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import CandidateCard from '@/components/CandidateCard.vue'

export default {
  name: 'ElectionDetail',
  components: {
    CandidateCard
  },
  data() {
    return {
      electionId: null,
      isLoading: true,
      timer: null,
      timerValue: '',
      timerLabel: ''
    }
  },
  computed: {
    ...mapGetters(['currentElection', 'candidates', 'networkId']),
    election() {
      return this.currentElection
    },
    canVote() {
      if (!this.election) return false
      
      return this.election.status === 'Voting' && 
             new Date(this.election.startTime) <= new Date() &&
             new Date(this.election.endTime) >= new Date()
    },
    statusClass() {
      const statusMap = {
        'Init': 'status-init',
        'Voting': 'status-voting',
        'Closed': 'status-closed'
      }
      return this.election ? statusMap[this.election.status] || 'status-init' : ''
    },
    truncatedContractAddress() {
      if (!this.election || !this.election.contractAddress) return ''
      return this.election.contractAddress.slice(0, 8) + '...' + this.election.contractAddress.slice(-6)
    }
  },
  methods: {
    ...mapActions(['fetchElection']),
    formatDateTime(dateTimeStr) {
      const date = new Date(dateTimeStr)
      return date.toLocaleString()
    },
    getCandidateById(candidateId) {
      const candidate = this.candidates.find(c => c.candidate_id === candidateId)
      if (!candidate) return { name: 'Unknown Candidate', bio: 'Candidate information not available' }
      return candidate
    },
    goToVote() {
      this.$router.push(`/elections/${this.electionId}/vote`)
    },
    updateTimer() {
      if (!this.election) return
      
      const now = new Date()
      let targetDate, label
      
      if (now < new Date(this.election.startTime)) {
        // Election hasn't started yet
        targetDate = new Date(this.election.startTime)
        label = 'Starts in'
      } else if (now < new Date(this.election.endTime)) {
        // Election is ongoing
        targetDate = new Date(this.election.endTime)
        label = 'Ends in'
      } else {
        // Election has ended
        this.timerValue = 'Election has ended'
        this.timerLabel = 'Status'
        return
      }
      
      const difference = targetDate - now
      
      if (difference <= 0) {
        // Refresh the page to update status
        window.location.reload()
        return
      }
      
      // Calculate days, hours, minutes, seconds
      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)
      
      // Format timer value
      this.timerValue = `${days}d ${hours}h ${minutes}m ${seconds}s`
      this.timerLabel = label
    }
  },
  async created() {
    this.electionId = parseInt(this.$route.params.id)
    
    try {
      await this.fetchElection(this.electionId)
      this.isLoading = false
      
      // Start the timer
      this.updateTimer()
      this.timer = setInterval(this.updateTimer, 1000)
    } catch (error) {
      console.error('Error fetching election details:', error)
      this.isLoading = false
    }
  },
  beforeUnmount() {
    // Clear the timer when component is unmounted
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}
</script>

<style scoped>
.election-header {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
  color: white;
}

.status-init {
  background-color: #6c757d;
}

.status-voting {
  background-color: #28a745;
}

.status-closed {
  background-color: #dc3545;
}

.election-meta {
  font-size: 1rem;
}

.meta-item {
  margin-bottom: 10px;
}

.contract-link {
  font-family: monospace;
  text-decoration: none;
}

.contract-link:hover {
  text-decoration: underline;
}

.position-header {
  position: relative;
  padding-bottom: 10px;
}

.position-header:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background-color: #6c63ff;
}

.party-card {
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.party-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.party-logo {
  display: inline-block;
  width: 70px;
  height: 70px;
  line-height: 70px;
  border-radius: 50%;
  background-color: #f8f9fa;
}

.election-timer {
  font-weight: bold;
  color: #6c63ff;
}
</style>
