<template>
  <div class="elections-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Available Elections</h1>
      <div class="d-flex gap-2">
        <div class="btn-group">
          <button 
            class="btn" 
            :class="{'btn-primary': filter === 'all', 'btn-outline-primary': filter !== 'all'}"
            @click="filter = 'all'">
            All
          </button>
          <button 
            class="btn" 
            :class="{'btn-primary': filter === 'active', 'btn-outline-primary': filter !== 'active'}"
            @click="filter = 'active'">
            Active
          </button>
          <button 
            class="btn" 
            :class="{'btn-primary': filter === 'upcoming', 'btn-outline-primary': filter !== 'upcoming'}"
            @click="filter = 'upcoming'">
            Upcoming
          </button>
          <button 
            class="btn" 
            :class="{'btn-primary': filter === 'past', 'btn-outline-primary': filter !== 'past'}"
            @click="filter = 'past'">
            Past
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="isLoading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Loading elections...</p>
    </div>
    
    <div v-else-if="filteredElections.length === 0" class="text-center my-5">
      <div class="empty-state">
        <i class="fas fa-ballot fa-4x text-muted mb-3"></i>
        <h3>No Elections Found</h3>
        <p class="text-muted">
          {{ getEmptyMessage() }}
        </p>
      </div>
    </div>
    
    <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      <div v-for="election in filteredElections" :key="election.electionId" class="col">
        <ElectionCard :election="election" @vote="goToVotingBooth" />
      </div>
    </div>
  </div>
</template>

<script>
import ElectionCard from '@/components/ElectionCard.vue'
import api from '@/services/api'

export default {
  name: 'Elections',
  components: {
    ElectionCard
  },
  data() {
    return {
      elections: [],
      isLoading: true,
      filter: 'active'
    }
  },
  computed: {
    filteredElections() {
      if (this.filter === 'all') {
        return this.elections
      }
      
      if (this.filter === 'active') {
        return this.elections.filter(e => e.status === 'Voting')
      }
      
      if (this.filter === 'upcoming') {
        return this.elections.filter(e => e.status === 'Init')
      }
      
      if (this.filter === 'past') {
        return this.elections.filter(e => e.status === 'Closed')
      }
      
      return this.elections
    }
  },
  methods: {
    async fetchElections() {
      try {
        this.isLoading = true
        const response = await api.getElections()
        this.elections = response.data
      } catch (error) {
        console.error('Error fetching elections:', error)
        // Handle error - show notification
      } finally {
        this.isLoading = false
      }
    },
    goToVotingBooth(election) {
      // Check if the election has positions first
      if (election.positions && election.positions.length > 0) {
        // If only one position, go directly to voting booth
        if (election.positions.length === 1) {
          this.$router.push({
            name: 'voting-booth',
            params: {
              electionId: election.electionId,
              positionId: election.positions[0].positionId
            }
          })
        } else {
          // If multiple positions, go to election details page
          this.$router.push({
            name: 'election-detail',
            params: { id: election.electionId }
          })
        }
      } else {
        // Fallback to election details
        this.$router.push({
          name: 'election-detail',
          params: { id: election.electionId }
        })
      }
    },
    getEmptyMessage() {
      if (this.filter === 'active') {
        return 'There are no active elections at the moment. Check back later or view upcoming elections.'
      } else if (this.filter === 'upcoming') {
        return 'There are no upcoming elections scheduled. Check the active or past elections.'
      } else if (this.filter === 'past') {
        return 'There are no past elections to display.'
      } else {
        return 'No elections are available at this time.'
      }
    }
  },
  mounted() {
    this.fetchElections()
  }
}
</script>

<style scoped>
.elections-page {
  padding-bottom: 40px;
}

.empty-state {
  padding: 40px 0;
}

.empty-state i {
  opacity: 0.5;
}
</style>
