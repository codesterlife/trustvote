<template>
  <div class="elections-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Elections</h1>
      
      <div v-if="!isConnected" class="alert alert-warning d-flex align-items-center">
        <i class="fas fa-exclamation-triangle me-2"></i>
        <div>
          <strong>Please connect your MetaMask wallet</strong> to participate in voting.
        </div>
      </div>
    </div>
    
    <div v-if="!isConnected" class="mb-5">
      <ConnectWallet />
    </div>
    
    <!-- Active Elections Section -->
    <section class="mb-5">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2>Active Elections</h2>
        <div class="input-group w-auto">
          <input 
            type="text" 
            class="form-control" 
            placeholder="Search elections..." 
            v-model="searchTerm"
          >
          <button class="btn btn-outline-secondary">
            <i class="fas fa-search"></i>
          </button>
        </div>
      </div>
      
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading elections...</p>
      </div>
      
      <div v-else-if="filteredActiveElections.length === 0" class="alert alert-info">
        <i class="fas fa-info-circle me-2"></i>
        No active elections found.
      </div>
      
      <div v-else class="row">
        <div v-for="election in filteredActiveElections" :key="election.electionId" class="col-md-6 col-lg-4">
          <ElectionCard :election="election" />
        </div>
      </div>
    </section>
    
    <!-- Past Elections Section -->
    <section>
      <h2 class="mb-3">Past Elections</h2>
      
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading past elections...</p>
      </div>
      
      <div v-else-if="filteredPastElections.length === 0" class="alert alert-info">
        <i class="fas fa-info-circle me-2"></i>
        No past elections found.
      </div>
      
      <div v-else class="row">
        <div v-for="election in filteredPastElections" :key="election.electionId" class="col-md-6 col-lg-4">
          <ElectionCard :election="election" />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ElectionCard from '@/components/ElectionCard.vue'
import ConnectWallet from '@/components/ConnectWallet.vue'

export default {
  name: 'Elections',
  components: {
    ElectionCard,
    ConnectWallet
  },
  data() {
    return {
      searchTerm: '',
      isLoading: false
    }
  },
  computed: {
    ...mapGetters(['allElections', 'activeElections', 'pastElections', 'isConnected']),
    filteredActiveElections() {
      if (!this.searchTerm) return this.activeElections
      
      const searchLower = this.searchTerm.toLowerCase()
      return this.activeElections.filter(election => 
        election.title.toLowerCase().includes(searchLower) || 
        election.description.toLowerCase().includes(searchLower)
      )
    },
    filteredPastElections() {
      if (!this.searchTerm) return this.pastElections
      
      const searchLower = this.searchTerm.toLowerCase()
      return this.pastElections.filter(election => 
        election.title.toLowerCase().includes(searchLower) || 
        election.description.toLowerCase().includes(searchLower)
      )
    }
  },
  methods: {
    ...mapActions(['fetchElections'])
  },
  async created() {
    this.isLoading = true
    try {
      await this.fetchElections()
    } catch (error) {
      console.error('Error fetching elections:', error)
    } finally {
      this.isLoading = false
    }
  }
}
</script>

<style scoped>
.elections-page {
  margin-bottom: 40px;
}

h2 {
  color: #333;
  position: relative;
  padding-bottom: 10px;
}

h2:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background-color: #6c63ff;
}
</style>
