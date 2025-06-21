<template>
  <form @submit.prevent="handleSubmit">
    <div class="mb-3">
      <label for="firstName" class="form-label">First Name</label>
      <input v-model="form.firstName" type="text" class="form-control" id="firstName" required />
    </div>
    <div class="mb-3">
      <label for="lastName" class="form-label">Last Name</label>
      <input v-model="form.lastName" type="text" class="form-control" id="lastName" required />
    </div>
    <div class="mb-3">
      <label for="studentId" class="form-label">Student ID</label>
      <input v-model="form.studentId" type="text" class="form-control" id="studentId" required />
    </div>
    <div class="mb-3">
      <label for="election" class="form-label">Election</label>
      <select v-model="form.electionId" class="form-select" id="election" required> 
        <option v-for="election in elections" :key="election.electionId" :value="election.electionId">
          {{ election.title }}
        </option>
      </select>
    </div>
    <div class="d-flex justify-content-between">
      <button type="submit" class="btn btn-primary">
        {{ entry ? 'Edit Electoral Roll' : 'Add to Electoral Roll' }}
      </button>
      <button type="button" @click="cancel" class="btn btn-secondary">
        <i class="fas fa-times me-1"></i>
        Cancel
      </button>
    </div>
  </form>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ElectoralRollForm',
  props: {
    entry: {
      type: Object,
      default: null
    },
    elections: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      form: {
        firstName: '',
        lastName: '',
        studentId: '',
        electionId: null
      }
    }
  },
  watch: {
    entry: {
      immediate: true,
      handler(newEntry) {
        if (newEntry) {
          this.form = {
            firstName: newEntry.first_name || '',
            lastName: newEntry.last_name || '',
            studentId: newEntry.student_id || '',
            electionId: newEntry.election || null
          }
        } else {
          this.resetForm()
        }
      }
    }
  },
  methods: {
  handleSubmit() {
    // Map camelCase to snake_case for backend
    const payload = {
      first_name: this.form.firstName,
      last_name: this.form.lastName,
      student_id: this.form.studentId,
      election: this.form.electionId
    }
    if (this.entry) {
      this.$emit('update', { ...payload, id: this.entry.id })
    } else {
      this.$emit('create', payload)
    }
    this.resetForm()
  },
    resetForm() {
      this.form = { firstName: '', lastName: '', studentId: '', electionId: null }
    },
    cancel() {
      this.$emit('cancel')
    }
  }
}
</script>