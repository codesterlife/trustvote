<template>
  <div class="electoral-roll-list">
    <!-- Filter Dropdown -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5>Electoral Roll</h5>
      <div class="d-flex align-items-center">
        <span class="me-2">Filter by Election:</span>
        <select v-model="selectedElectionId" class="form-select form-select-sm" style="width: 250px">
          <option value="">All Elections</option>
          <option v-for="election in elections" :key="election.electionId" :value="election.electionId">
            {{ election.title }}
          </option>
        </select>
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>#</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Student ID</th>
          <th>Election</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(entry, index) in filteredEntries" :key="entry.id">
          <td>{{ index + 1 }}</td>
          <td>{{ entry.first_name }}</td>
          <td>{{ entry.last_name }}</td>
          <td>{{ entry.student_id }}</td>
          <td>{{ entry.election_title }}</td>
          <td>
            <button @click="$emit('edit', entry)" class="btn btn-primary btn-sm me-2">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="$emit('delete', entry.id)" class="btn btn-danger btn-sm">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'ElectoralRollList',
  props: {
    entries: {
      type: Array,
      required: true
    },
    elections: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      selectedElectionId: ''
    }
  },
  computed: {
    filteredEntries() {
      if (!this.selectedElectionId) return this.entries
      // Support both string and number comparison
      return this.entries.filter(
        entry => String(entry.election) === String(this.selectedElectionId) ||
                 String(entry.electionId) === String(this.selectedElectionId)
      )
    }
  }
}
</script>