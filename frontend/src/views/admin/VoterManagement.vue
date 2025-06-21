....<template>
  <div class="voter-management">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Voter Management</h2>
    </div>
    
    <!-- Connection Warning -->
    <div v-if="!isConnected" class="alert alert-warning mb-4">
      <i class="fas fa-exclamation-triangle me-2"></i>
      <strong>MetaMask not connected.</strong> Please connect your wallet to whitelist voters.
    </div>
    
    <!-- Voter List Component -->
    <VoterList 
      :voters="voters"
      :elections="allElections" 
      :isLoading="isLoading"
      @whitelist="handleWhitelistVoter"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import VoterList from '@/components/admin/VoterList.vue'

export default {
  name: 'VoterManagement',
  components: {
    VoterList
  },
  data() {
    return {
      isLoading: true
    }
  },
  computed: {
    ...mapGetters(['allElections', 'voters', 'isConnected']),
    logVoters() {
      // console.log(this.voters); // Log the voters array
      return this.voters;
    }
  },
  methods: {
    ...mapActions(['fetchVoters', 'whitelistVoter']),
    async handleWhitelistVoter({ electionId, voterAddress }) {
      if (!this.isConnected) {
        alert('Please connect your MetaMask wallet first')
        return
      }
      
      try {
        // console.log("Whitelist data received at VoterManagement.vue", { electionId, voterAddress })
        await this.whitelistVoter({ electionId, voterAddress })
        // Refresh voters list
        await this.fetchVoters()
        return true
      } catch (error) {
        console.error('Error whitelisting voter:', error)
        alert('Failed to whitelist voter: ' + (error.message || 'Unknown error'))
        throw error
      }
    }
  },
  async created() {
    try {
      await this.fetchVoters()
    } catch (error) {
      console.error('Error fetching voters:', error)
    } finally {
      this.isLoading = false
    }
  }
}
</script>

<style scoped>
/* Component-specific styles here */
</style>
