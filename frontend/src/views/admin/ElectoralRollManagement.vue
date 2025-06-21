<template>
  <div class="electoral-roll-management">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Electoral Roll Management</h2>
      <button @click="showCreateForm" class="btn btn-primary">
        <i class="fas fa-plus me-1"></i>
        Add New Entry
      </button>
    </div>

    <!-- Electoral Roll Form -->
    <div v-if="showForm" class="mb-5">
      <ElectoralRollForm 
        :entry="selectedEntry"
        :elections="allElections"
        @create="handleCreateEntry"
        @update="handleUpdateEntry"
        @cancel="hideForm"
      />
    </div>

    <!-- Electoral Roll List -->
    <div v-else>
      <ElectoralRollList 
        :elections="allElections"
        :entries="filteredEntries"
        @edit="editEntry"
        @delete="deleteEntry"
      />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ElectoralRollForm from '@/components/admin/ElectoralRollForm.vue'
import ElectoralRollList from '@/components/admin/ElectoralRollList.vue'

export default {
  name: 'ElectoralRollManagement',
  components: {
    ElectoralRollForm,
    ElectoralRollList
  },
  data() {
    return {
      showForm: false,
      selectedEntry: null,
      searchTerm: '',
      electionFilter: '',
      electoralRoll: []
    }
  },
  computed: {
    ...mapGetters(['allElections']),
    filteredEntries() {
      let filtered = [...this.electoralRoll]
      if (this.electionFilter) {
        filtered = filtered.filter(entry => entry.electionId === parseInt(this.electionFilter))
      }
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase()
        filtered = filtered.filter(entry =>
          entry.firstName.toLowerCase().includes(term) ||
          entry.lastName.toLowerCase().includes(term) ||
          entry.studentId.toLowerCase().includes(term)
        )
      }
      return filtered
    }
  },
  watch: {
    electionFilter(newElectionId) {
      this.loadElectoralRollByElection(newElectionId)
    }
  },
  methods: {
    ...mapActions(['fetchElectoralRoll', 'addElectoralRollEntry', 'deleteElectoralRollEntry', 'updateElectoralRollEntry']),
    async loadElectoralRollByElection(electionId) {
      try {
        if (electionId) {
          console.log("election ID in ElectionRollManagement: ", electionId)
          this.electoralRoll = await this.fetchElectoralRoll(electionId)
        } else {
          console.log("Loading all electoral roll entries")
          this.electoralRoll = await this.fetchElectoralRoll()
        }
      } catch (error) {
        console.error('Error loading electoral roll:', error)
      }
    },
    showCreateForm() {
      this.selectedEntry = null
      this.showForm = true
    },
    editEntry(entry) {
      this.selectedEntry = entry
      this.showForm = true
    },
    hideForm() {
      this.showForm = false
      this.selectedEntry = null
    },
    async handleCreateEntry(entryData) {
      try {
        await this.addElectoralRollEntry(entryData)
        this.hideForm()
        this.loadElectoralRollByElection(this.electionFilter)
      } catch (error) {
        console.error('Error creating electoral roll entry:', error)
      }
    },
    async handleUpdateEntry(entryData) {
      try {
        await this.updateElectoralRollEntry(entryData)
        this.hideForm()
        this.loadElectoralRollByElection(this.electionFilter)
      } catch (error) {
        console.error('Error updating electoral roll entry:', error)
      }
    },
    async deleteEntry(entryId) {
      try {
        await this.deleteElectoralRollEntry(entryId)
        this.loadElectoralRollByElection(this.electionFilter)
      } catch (error) {
        console.error('Error deleting electoral roll entry:', error)
      }
    }
  },
  async created() {
    await this.loadElectoralRollByElection()
  }
}
</script>