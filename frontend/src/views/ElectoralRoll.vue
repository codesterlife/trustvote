<template>
  <div class="electoral-roll-view">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Electoral Roll for {{ election?.title || 'Loading...' }}</h2>
      <router-link :to="`/elections/${$route.params.id}`" class="btn btn-outline-secondary">
        <i class="fas fa-arrow-left me-2"></i>Back to Election
      </router-link>
    </div>

    <div class="card">
      <div class="card-body">
        <div v-if="isLoading" class="text-center py-4">
          <div class="spinner-border text-primary"></div>
          <p class="mt-2">Loading electoral roll...</p>
        </div>

        <div v-else-if="!electoralRoll.length" class="alert alert-info">
          No entries found in the electoral roll for this election.
        </div>

        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in electoralRoll" :key="entry.id">
                  <td>{{ entry.student_id }}</td>
                  <td>{{ entry.first_name }} {{ entry.last_name }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'

export default {
  name: 'ElectoralRoll',
  setup() {
    const route = useRoute()
    const electoralRoll = ref([])
    const election = ref(null)
    const isLoading = ref(true)

    const loadData = async () => {
      try {
        const [electionResponse, rollResponse] = await Promise.all([
          api.getElection(route.params.id),
          api.getElectoralRoll(route.params.id)
        ])
        
        election.value = electionResponse.data
        electoralRoll.value = rollResponse.data
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        isLoading.value = false
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString()
    }

    onMounted(loadData)

    return {
      electoralRoll,
      election,
      isLoading,
      formatDate
    }
  }
}
</script>