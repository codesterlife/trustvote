<template>
  <div class="admin-elections mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3>Manage Elections</h3>
      <router-link :to="{ name: 'CreateElection' }" class="btn btn-primary">
        <i class="bi bi-plus-circle me-1"></i> Create New Election
      </router-link>
    </div>
    
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Loading elections...</p>
    </div>
    
    <div v-else-if="elections.length === 0" class="alert alert-info">
      <i class="bi bi-info-circle-fill me-2"></i>
      No elections have been created yet. Click the "Create New Election" button to get started.
    </div>
    
    <div v-else class="elections-table">
      <table class="table table-hover">
        <thead class="table-light">
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Status</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Blockchain Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="election in elections" :key="election.id">
            <td>{{ election.id }}</td>
            <td>
              <router-link :to="{ name: 'Election', params: { id: election.id } }">
                {{ election.title }}
              </router-link>
            </td>
            <td>
              <span :class="getStatusClass(election.status)">
                {{ formatStatus(election.status) }}
              </span>
            </td>
            <td>{{ formatDate(election.start_time) }}</td>
            <td>{{ formatDate(election.end_time) }}</td>
            <td>
              <span v-if="election.contract_address" class="badge bg-success">
                <i class="bi bi-check-circle-fill me-1"></i>
                Deployed
              </span>
              <span v-else class="badge bg-warning text-dark">
                <i class="bi bi-exclamation-triangle-fill me-1"></i>
                Not Deployed
              </span>
            </td>
            <td>
              <div class="btn-group">
                <router-link 
                  :to="{ name: 'EditElection', params: { id: election.id } }" 
                  class="btn btn-sm btn-outline-primary">
                  <i class="bi bi-pencil-fill"></i>
                </router-link>
                
                <button 
                  v-if="election.status === 'init'" 
                  @click="deployToBlockchain(election)" 
                  class="btn btn-sm btn-outline-success"
                  :disabled="!canDeploy || election.contract_address">
                  <i class="bi bi-cloud-upload-fill"></i>
                </button>
                
                <button 
                  v-if="election.status === 'init'" 
                  @click="startVoting(election)" 
                  class="btn btn-sm btn-outline-primary"
                  :disabled="!election.contract_address">
                  <i class="bi bi-play-fill"></i>
                </button>
                
                <button 
                  v-if="election.status === 'voting'" 
                  @click="endVoting(election)" 
                  class="btn btn-sm btn-outline-danger">
                  <i class="bi bi-stop-fill"></i>
                </button>
                
                <router-link 
                  :to="{ name: 'AdminResults', query: { electionId: election.id } }" 
                  class="btn btn-sm btn-outline-info">
                  <i class="bi bi-bar-chart-fill"></i>
                </router-link>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Deployment Modal -->
    <div class="modal fade" id="deploymentModal" tabindex="-1" aria-labelledby="deploymentModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="deploymentModalLabel">Deploy Election to Blockchain</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>
              You are about to deploy this election to the Ethereum blockchain.
              This will create a smart contract that will manage voting for this election.
            </p>
            <p class="text-danger">
              <i class="bi bi-exclamation-triangle-fill me-1"></i>
              This action cannot be undone. Make sure all election details and candidates are set up correctly.
            </p>
            
            <!-- Deployment Progress -->
            <div v-if="deploymentStatus === 'pending'" class="deployment-progress mt-3">
              <div class="spinner-border text-primary spinner-border-sm me-2" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <span>Transaction in progress... Please confirm in MetaMask.</span>
            </div>
            
            <div v-if="deploymentStatus === 'success'" class="alert alert-success mt-3">
              <i class="bi bi-check-circle-fill me-2"></i>
              Election successfully deployed to blockchain!
            </div>
            
            <div v-if="deploymentStatus === 'error'" class="alert alert-danger mt-3">
              <i class="bi bi-x-circle-fill me-2"></i>
              {{ deploymentError }}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="confirmDeploy"
              :disabled="deploymentStatus === 'pending'">
              Deploy Election
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import apiService from '@/services/api';
import web3Service from '@/services/web3';
import { Modal } from 'bootstrap';

export default {
  name: 'AdminElections',
  data() {
    return {
      loading: true,
      elections: [],
      deploymentStatus: null, // null, 'pending', 'success', 'error'
      deploymentError: '',
      selectedElection: null,
      deployModal: null
    };
  },
  computed: {
    ...mapGetters([
      'getWeb3Account'
    ]),
    canDeploy() {
      return !!this.getWeb3Account;
    }
  },
  async created() {
    await this.fetchElections();
  },
  mounted() {
    this.deployModal = new Modal(document.getElementById('deploymentModal'));
  },
  methods: {
    async fetchElections() {
      this.loading = true;
      try {
        const response = await apiService.getElections();
        this.elections = response.data;
      } catch (error) {
        console.error('Error fetching elections:', error);
        this.$store.commit('setNotification', {
          message: 'Failed to load elections',
          type: 'danger'
        });
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString();
    },
    formatStatus(status) {
      const statusMap = {
        'init': 'Setup',
        'voting': 'Voting Active',
        'closed': 'Closed'
      };
      return statusMap[status] || status;
    },
    getStatusClass(status) {
      const classMap = {
        'init': 'badge bg-secondary',
        'voting': 'badge bg-success',
        'closed': 'badge bg-dark'
      };
      return classMap[status] || 'badge bg-secondary';
    },
    deployToBlockchain(election) {
      this.selectedElection = election;
      this.deploymentStatus = null;
      this.deploymentError = '';
      this.deployModal.show();
    },
    async confirmDeploy() {
      if (!this.selectedElection) return;
      
      this.deploymentStatus = 'pending';
      
      try {
        // Get factory contract address from ENV or use a default for demo
        const factoryAddress = process.env.VUE_APP_FACTORY_ADDRESS || '0xYourFactoryAddressHere';
        
        // Get the admin wallet address
        const fromAddress = this.getWeb3Account;
        
        if (!fromAddress) {
          throw new Error('No wallet connected. Please connect your MetaMask wallet.');
        }
        
        // Create election on blockchain
        const result = await web3Service.createElection(
          factoryAddress,
          {
            electionId: this.selectedElection.id,
            title: this.selectedElection.title,
            description: this.selectedElection.description,
            startTime: this.selectedElection.start_time,
            endTime: this.selectedElection.end_time
          },
          fromAddress
        );
        
        // Extract contract address from transaction receipt
        const electionAddress = result.events.ElectionCreated.returnValues.electionAddress;
        
        // Update the election with the contract address
        await apiService.updateElection(this.selectedElection.id, {
          ...this.selectedElection,
          contract_address: electionAddress
        });
        
        this.deploymentStatus = 'success';
        this.$store.commit('setNotification', {
          message: 'Election successfully deployed to blockchain',
          type: 'success'
        });
        
        // Refresh elections list
        await this.fetchElections();
      } catch (error) {
        this.deploymentStatus = 'error';
        this.deploymentError = error.message || 'Failed to deploy election to blockchain';
        console.error('Deployment error:', error);
      }
    },
    async startVoting(election) {
      try {
        await apiService.updateElectionStatus(election.id, 'voting');
        
        // TODO: Update blockchain status as well
        // This would involve calling the setPhase method on the smart contract
        
        this.$store.commit('setNotification', {
          message: 'Election status updated to Voting Active',
          type: 'success'
        });
        
        // Refresh elections list
        await this.fetchElections();
      } catch (error) {
        console.error('Error starting voting:', error);
        this.$store.commit('setNotification', {
          message: 'Failed to start voting phase',
          type: 'danger'
        });
      }
    },
    async endVoting(election) {
      try {
        await apiService.updateElectionStatus(election.id, 'closed');
        
        // TODO: Update blockchain status as well
        // This would involve calling the setPhase method on the smart contract
        
        this.$store.commit('setNotification', {
          message: 'Election status updated to Closed',
          type: 'success'
        });
        
        // Refresh elections list
        await this.fetchElections();
      } catch (error) {
        console.error('Error ending voting:', error);
        this.$store.commit('setNotification', {
          message: 'Failed to end voting phase',
          type: 'danger'
        });
      }
    }
  }
};
</script>

<style scoped>
.admin-elections {
  min-height: 400px;
}

.elections-table {
  overflow-x: auto;
}

.table th {
  font-weight: 600;
}

.table td {
  vertical-align: middle;
}

.btn-group .btn {
  margin: 0 2px;
}

.deployment-progress {
  display: flex;
  align-items: center;
  color: #666;
}
</style>
