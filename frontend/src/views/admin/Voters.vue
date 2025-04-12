<template>
  <div class="admin-voters mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3>Manage Voters</h3>
      <div class="d-flex">
        <button @click="openWhitelistModal" class="btn btn-success me-2" :disabled="!selectedVoters.length">
          <i class="bi bi-check-circle me-1"></i> Whitelist Selected
        </button>
        <button @click="isFilterOpen = !isFilterOpen" class="btn btn-outline-secondary">
          <i class="bi bi-funnel me-1"></i> Filters
        </button>
      </div>
    </div>
    
    <div v-if="isFilterOpen" class="mb-4">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Filter Voters</h5>
          <div class="row">
            <div class="col-md-3 mb-3">
              <label for="verification-filter" class="form-label">Verification Status</label>
              <select 
                id="verification-filter" 
                class="form-select" 
                v-model="filters.verificationStatus"
                @change="applyFilters">
                <option value="all">All</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
            
            <div class="col-md-3 mb-3">
              <label for="whitelist-filter" class="form-label">Whitelist Status</label>
              <select 
                id="whitelist-filter" 
                class="form-select" 
                v-model="filters.whitelistStatus"
                @change="applyFilters">
                <option value="all">All</option>
                <option value="whitelisted">Whitelisted</option>
                <option value="not-whitelisted">Not Whitelisted</option>
              </select>
            </div>
            
            <div class="col-md-3 mb-3">
              <label for="wallet-filter" class="form-label">Wallet Status</label>
              <select 
                id="wallet-filter" 
                class="form-select" 
                v-model="filters.walletStatus"
                @change="applyFilters">
                <option value="all">All</option>
                <option value="connected">Wallet Connected</option>
                <option value="not-connected">No Wallet</option>
              </select>
            </div>
            
            <div class="col-md-3 mb-3">
              <label for="search-filter" class="form-label">Search</label>
              <input 
                type="text" 
                class="form-control" 
                id="search-filter" 
                placeholder="Student ID or Name" 
                v-model="filters.search"
                @input="applyFilters">
            </div>
          </div>
          
          <div class="text-end mt-2">
            <button @click="resetFilters" class="btn btn-outline-secondary">
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Loading voters...</p>
    </div>
    
    <div v-else-if="filteredVoters.length === 0" class="alert alert-info">
      <i class="bi bi-info-circle-fill me-2"></i>
      No voters found matching your criteria.
    </div>
    
    <div v-else>
      <div class="voters-table">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th width="50">
                <input 
                  type="checkbox" 
                  class="form-check-input" 
                  :checked="selectAll" 
                  @change="toggleSelectAll">
              </th>
              <th>Student ID</th>
              <th>Username</th>
              <th>Name</th>
              <th>Wallet Address</th>
              <th>Verified</th>
              <th>Whitelisted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="voter in filteredVoters" :key="voter.id" :class="{ 'table-selected': isSelected(voter.id) }">
              <td>
                <input 
                  type="checkbox" 
                  class="form-check-input" 
                  :checked="isSelected(voter.id)" 
                  @change="toggleVoterSelection(voter.id)">
              </td>
              <td>{{ voter.student_id }}</td>
              <td>{{ voter.user?.username }}</td>
              <td>{{ formatName(voter.user) }}</td>
              <td>
                <span v-if="voter.wallet_address" class="wallet-address">
                  {{ shortenAddress(voter.wallet_address) }}
                </span>
                <span v-else class="text-muted">
                  <i class="bi bi-dash-circle me-1"></i>
                  Not connected
                </span>
              </td>
              <td>
                <span v-if="voter.is_verified" class="badge bg-success">
                  <i class="bi bi-check-circle-fill me-1"></i>
                  Verified
                </span>
                <span v-else class="badge bg-warning text-dark">
                  <i class="bi bi-exclamation-triangle-fill me-1"></i>
                  Unverified
                </span>
              </td>
              <td>
                <span v-if="voter.is_whitelisted" class="badge bg-success">
                  <i class="bi bi-check-circle-fill me-1"></i>
                  Whitelisted
                </span>
                <span v-else class="badge bg-secondary">
                  <i class="bi bi-x-circle-fill me-1"></i>
                  Not Whitelisted
                </span>
              </td>
              <td>
                <div class="btn-group">
                  <button 
                    @click="verifyVoter(voter)" 
                    class="btn btn-sm btn-outline-primary"
                    :disabled="voter.is_verified">
                    <i class="bi bi-person-check-fill"></i>
                  </button>
                  <button 
                    @click="whitelistVoter(voter)" 
                    class="btn btn-sm btn-outline-success"
                    :disabled="!voter.wallet_address || voter.is_whitelisted">
                    <i class="bi bi-check-circle-fill"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="mt-3 d-flex justify-content-between align-items-center">
        <div>
          <span class="text-muted">{{ filteredVoters.length }} voters</span>
          <span v-if="selectedVoters.length > 0" class="ms-3">
            <span class="badge bg-primary">{{ selectedVoters.length }} selected</span>
          </span>
        </div>
        
        <div>
          <button 
            @click="openWhitelistModal" 
            class="btn btn-success" 
            :disabled="!selectedVoters.length">
            <i class="bi bi-check-circle me-1"></i> 
            Whitelist Selected ({{ selectedVoters.length }})
          </button>
        </div>
      </div>
    </div>
    
    <!-- Whitelist Modal -->
    <div class="modal fade" id="whitelistModal" tabindex="-1" aria-labelledby="whitelistModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="whitelistModalLabel">Whitelist Voters</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>
              You are about to whitelist {{ selectedVoters.length }} voter(s). 
              This will allow them to participate in elections.
            </p>
            
            <div v-if="whitelistStatus === 'checking'" class="alert alert-info">
              <div class="d-flex align-items-center">
                <div class="spinner-border spinner-border-sm me-2" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                Checking selected voters...
              </div>
            </div>
            
            <div v-if="whitelistStatus === 'warning'" class="alert alert-warning">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              {{ votersWithoutWallet }} of {{ selectedVoters.length }} selected voters do not have a wallet address connected.
              Only voters with wallet addresses can be whitelisted.
            </div>
            
            <div v-if="whitelistStatus === 'processing'" class="alert alert-info">
              <div class="d-flex align-items-center">
                <div class="spinner-border spinner-border-sm me-2" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                Processing... This may take a moment.
              </div>
            </div>
            
            <div v-if="whitelistStatus === 'success'" class="alert alert-success">
              <i class="bi bi-check-circle-fill me-2"></i>
              Successfully whitelisted {{ whitelistedCount }} voters!
            </div>
            
            <div v-if="whitelistStatus === 'error'" class="alert alert-danger">
              <i class="bi bi-x-circle-fill me-2"></i>
              {{ whitelistError }}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button 
              type="button" 
              class="btn btn-success"
              @click="whitelistSelectedVoters"
              :disabled="whitelistStatus === 'processing' || whitelistStatus === 'success'">
              Whitelist Voters
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiService from '@/services/api';
import web3Service from '@/services/web3';
import { Modal } from 'bootstrap';

export default {
  name: 'AdminVoters',
  data() {
    return {
      loading: true,
      voters: [],
      filteredVoters: [],
      selectedVoters: [],
      selectAll: false,
      isFilterOpen: false,
      filters: {
        verificationStatus: 'all',
        whitelistStatus: 'all',
        walletStatus: 'all',
        search: ''
      },
      whitelistModal: null,
      whitelistStatus: null, // null, checking, warning, processing, success, error
      votersWithoutWallet: 0,
      whitelistedCount: 0,
      whitelistError: ''
    };
  },
  async created() {
    await this.fetchVoters();
  },
  mounted() {
    this.whitelistModal = new Modal(document.getElementById('whitelistModal'));
  },
  methods: {
    async fetchVoters() {
      this.loading = true;
      try {
        const response = await apiService.getVoters();
        this.voters = response.data;
        this.filteredVoters = [...this.voters];
      } catch (error) {
        console.error('Error fetching voters:', error);
        this.$store.commit('setNotification', {
          message: 'Failed to load voters',
          type: 'danger'
        });
      } finally {
        this.loading = false;
      }
    },
    applyFilters() {
      this.filteredVoters = this.voters.filter(voter => {
        // Verification status filter
        if (this.filters.verificationStatus === 'verified' && !voter.is_verified) {
          return false;
        }
        if (this.filters.verificationStatus === 'unverified' && voter.is_verified) {
          return false;
        }
        
        // Whitelist status filter
        if (this.filters.whitelistStatus === 'whitelisted' && !voter.is_whitelisted) {
          return false;
        }
        if (this.filters.whitelistStatus === 'not-whitelisted' && voter.is_whitelisted) {
          return false;
        }
        
        // Wallet status filter
        if (this.filters.walletStatus === 'connected' && !voter.wallet_address) {
          return false;
        }
        if (this.filters.walletStatus === 'not-connected' && voter.wallet_address) {
          return false;
        }
        
        // Search filter
        if (this.filters.search) {
          const searchLower = this.filters.search.toLowerCase();
          const studentId = voter.student_id.toLowerCase();
          const username = voter.user?.username?.toLowerCase() || '';
          const firstName = voter.user?.first_name?.toLowerCase() || '';
          const lastName = voter.user?.last_name?.toLowerCase() || '';
          
          if (!studentId.includes(searchLower) && 
              !username.includes(searchLower) && 
              !firstName.includes(searchLower) && 
              !lastName.includes(searchLower)) {
            return false;
          }
        }
        
        return true;
      });
      
      // Reset selection when filters change
      this.selectedVoters = [];
      this.selectAll = false;
    },
    resetFilters() {
      this.filters = {
        verificationStatus: 'all',
        whitelistStatus: 'all',
        walletStatus: 'all',
        search: ''
      };
      this.filteredVoters = [...this.voters];
      this.selectedVoters = [];
      this.selectAll = false;
    },
    toggleSelectAll() {
      this.selectAll = !this.selectAll;
      
      if (this.selectAll) {
        this.selectedVoters = this.filteredVoters.map(voter => voter.id);
      } else {
        this.selectedVoters = [];
      }
    },
    isSelected(voterId) {
      return this.selectedVoters.includes(voterId);
    },
    toggleVoterSelection(voterId) {
      const index = this.selectedVoters.indexOf(voterId);
      
      if (index === -1) {
        this.selectedVoters.push(voterId);
      } else {
        this.selectedVoters.splice(index, 1);
      }
      
      // Update selectAll status
      this.selectAll = this.selectedVoters.length === this.filteredVoters.length;
    },
    formatName(user) {
      if (!user) return '';
      if (user.first_name || user.last_name) {
        return `${user.first_name || ''} ${user.last_name || ''}`.trim();
      }
      return user.username;
    },
    shortenAddress(address) {
      if (!address) return '';
      return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    },
    async verifyVoter(voter) {
      try {
        const updatedVoter = {
          ...voter,
          is_verified: true
        };
        
        await apiService.updateVoter(voter.id, updatedVoter);
        
        this.$store.commit('setNotification', {
          message: 'Voter verified successfully',
          type: 'success'
        });
        
        // Update local data
        const index = this.voters.findIndex(v => v.id === voter.id);
        if (index !== -1) {
          this.voters[index].is_verified = true;
          this.applyFilters(); // Re-apply filters to update the view
        }
      } catch (error) {
        console.error('Error verifying voter:', error);
        this.$store.commit('setNotification', {
          message: 'Failed to verify voter',
          type: 'danger'
        });
      }
    },
    async whitelistVoter(voter) {
      if (!voter.wallet_address) {
        this.$store.commit('setNotification', {
          message: 'Voter must have a connected wallet to be whitelisted',
          type: 'warning'
        });
        return;
      }
      
      try {
        await apiService.whitelistVoter(voter.id);
        
        this.$store.commit('setNotification', {
          message: 'Voter whitelisted successfully',
          type: 'success'
        });
        
        // Update local data
        const index = this.voters.findIndex(v => v.id === voter.id);
        if (index !== -1) {
          this.voters[index].is_whitelisted = true;
          this.applyFilters(); // Re-apply filters to update the view
        }
      } catch (error) {
        console.error('Error whitelisting voter:', error);
        this.$store.commit('setNotification', {
          message: 'Failed to whitelist voter',
          type: 'danger'
        });
      }
    },
    openWhitelistModal() {
      if (this.selectedVoters.length === 0) return;
      
      this.whitelistStatus = 'checking';
      this.whitelistModal.show();
      
      // Check if all selected voters have wallet addresses
      const selectedVoterObjects = this.voters.filter(voter => this.selectedVoters.includes(voter.id));
      this.votersWithoutWallet = selectedVoterObjects.filter(voter => !voter.wallet_address).length;
      
      if (this.votersWithoutWallet > 0) {
        this.whitelistStatus = 'warning';
      } else {
        this.whitelistStatus = null;
      }
    },
    async whitelistSelectedVoters() {
      this.whitelistStatus = 'processing';
      this.whitelistedCount = 0;
      
      try {
        // Get selected voters that have wallet addresses
        const votersToWhitelist = this.voters.filter(voter => 
          this.selectedVoters.includes(voter.id) && voter.wallet_address
        );
        
        if (votersToWhitelist.length === 0) {
          this.whitelistStatus = 'error';
          this.whitelistError = 'No eligible voters to whitelist. All selected voters must have wallet addresses.';
          return;
        }
        
        // Whitelist each voter
        for (const voter of votersToWhitelist) {
          await apiService.whitelistVoter(voter.id);
          
          // Update local data
          const index = this.voters.findIndex(v => v.id === voter.id);
          if (index !== -1) {
            this.voters[index].is_whitelisted = true;
          }
          
          this.whitelistedCount++;
        }
        
        this.whitelistStatus = 'success';
        this.$store.commit('setNotification', {
          message: `Successfully whitelisted ${this.whitelistedCount} voters`,
          type: 'success'
        });
        
        // Re-apply filters to update the view
        this.applyFilters();
        
        // Clear selection
        this.selectedVoters = [];
        this.selectAll = false;
      } catch (error) {
        this.whitelistStatus = 'error';
        this.whitelistError = error.message || 'An error occurred while whitelisting voters';
        console.error('Error whitelisting voters:', error);
      }
    }
  }
};
</script>

<style scoped>
.admin-voters {
  min-height: 400px;
}

.voters-table {
  overflow-x: auto;
}

.table th, .table td {
  vertical-align: middle;
}

.table-selected {
  background-color: #e6f7ff;
}

.wallet-address {
  font-family: monospace;
  font-size: 0.9rem;
}

.btn-group .btn {
  margin: 0 2px;
}
</style>
