import { createStore } from 'vuex'
import api from '@/services/api'
import web3Service from '@/services/web3'

export default createStore({
  state: {
    user: null,
    isAdmin: false,
    isLoggedIn: false,
    wallet: null,
    web3: null,
    contracts: {
      electionFactory: null,
      elections: {}
    },
    elections: [],
    currentElection: null,
    candidates: [],
    voters: [],
    loading: false,
    error: null,
    networkId: null
  },
  getters: {
    isLoggedIn: state => !!state.user,
    isAdmin: state => state.isAdmin,
    currentUser: state => state.user,
    walletAddress: state => state.wallet,
    hasMetaMask: state => !!window.ethereum,
    allElections: state => state.elections,
    activeElections: state => state.elections.filter(e => 
      e.status === 'Voting' && new Date(e.endTime) > new Date()),
    pastElections: state => state.elections.filter(e => 
      e.status === 'Closed' || new Date(e.endTime) < new Date()),
    candidates: state => state.candidates,
    currentElection: state => state.currentElection,
    isConnected: state => !!state.web3 && !!state.wallet,
    networkId: state => state.networkId
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
      state.isLoggedIn = !!user
      state.isAdmin = user ? user.is_admin : false
    },
    SET_WALLET(state, address) {
      state.wallet = address
    },
    SET_WEB3(state, web3) {
      state.web3 = web3
    },
    SET_CONTRACT(state, { name, contract }) {
      if (name === 'electionFactory') {
        state.contracts.electionFactory = contract
      } else {
        state.contracts.elections[name] = contract
      }
    },
    SET_NETWORK_ID(state, id) {
      state.networkId = id
    },
    SET_ELECTIONS(state, elections) {
      state.elections = elections
    },
    SET_CURRENT_ELECTION(state, election) {
      state.currentElection = election
    },
    SET_CANDIDATES(state, candidates) {
      state.candidates = candidates
    },
    SET_VOTERS(state, voters) {
      state.voters = voters
    },
    SET_LOADING(state, status) {
      state.loading = status
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    CLEAR_ERROR(state) {
      state.error = null
    }
  },
  actions: {
    // Auth actions
    async register({ commit }, userData) {
      try {
        commit('SET_LOADING', true)
        const response = await api.register(userData)
        commit('SET_LOADING', false)
        return response.data
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data || 'Registration failed')
        throw error
      }
    },
    async login({ commit }, credentials) {
      try {
        commit('SET_LOADING', true)
        const response = await api.login(credentials)
        const user = response.data
        commit('SET_USER', user)
        commit('SET_LOADING', false)
        return user
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data || 'Login failed')
        throw error
      }
    },
    async connectWallet({ commit, dispatch }) {
      try {
        commit('SET_LOADING', true)
        const { web3, address, networkId } = await web3Service.connectWallet()
        commit('SET_WEB3', web3)
        commit('SET_WALLET', address)
        commit('SET_NETWORK_ID', networkId)
        
        // After connecting to wallet, initialize contracts
        await dispatch('initContracts')
        
        commit('SET_LOADING', false)
        return address
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.message || 'Failed to connect wallet')
        throw error
      }
    },
    async initWeb3({ commit, dispatch }) {
      if (window.ethereum) {
        try {
          const { web3, address, networkId } = await web3Service.initWeb3()
          if (web3 && address) {
            commit('SET_WEB3', web3)
            commit('SET_WALLET', address)
            commit('SET_NETWORK_ID', networkId)
            await dispatch('initContracts')
          }
        } catch (error) {
          console.error('Web3 initialization error:', error)
        }
      }
    },
    async initContracts({ commit, state }) {
      if (!state.web3) return
      
      try {
        // Initialize ElectionFactory contract
        const electionFactory = await web3Service.getElectionFactoryContract(state.web3)
        commit('SET_CONTRACT', { name: 'electionFactory', contract: electionFactory })
      } catch (error) {
        console.error('Contract initialization error:', error)
        commit('SET_ERROR', 'Failed to initialize blockchain contracts')
      }
    },
    async checkAuthState({ commit }) {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const response = await api.getCurrentUser()
          commit('SET_USER', response.data)
        }
      } catch (error) {
        localStorage.removeItem('token')
        commit('SET_USER', null)
      }
    },
    async logout({ commit }) {
      localStorage.removeItem('token')
      commit('SET_USER', null)
      commit('SET_WALLET', null)
    },
    
    // Election actions
    async fetchElections({ commit }) {
      try {
        commit('SET_LOADING', true)
        const response = await api.getElections()
        commit('SET_ELECTIONS', response.data)
        commit('SET_LOADING', false)
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data || 'Failed to fetch elections')
      }
    },
    async fetchElection({ commit }, id) {
      try {
        commit('SET_LOADING', true)
        const response = await api.getElection(id)
        commit('SET_CURRENT_ELECTION', response.data)
        
        // Also fetch candidates for this election
        const candidatesResponse = await api.getCandidatesByElection(id)
        commit('SET_CANDIDATES', candidatesResponse.data)
        
        commit('SET_LOADING', false)
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data || 'Failed to fetch election details')
      }
    },
    async createElection({ commit, state, dispatch }, electionData) {
      try {
        commit('SET_LOADING', true)
        
        // First, deploy the smart contract for this election
        const { contract, address } = await web3Service.deployElectionContract(
          state.web3,
          state.contracts.electionFactory,
          electionData,
          state.wallet
        )
        
        // Store the contract address in the election data
        electionData.contract_address = address
        
        // Then, save the election in the backend
        const response = await api.createElection(electionData)
        
        // Register the new contract in the store
        commit('SET_CONTRACT', { name: address, contract })
        
        // Refresh the elections list
        await dispatch('fetchElections')
        
        commit('SET_LOADING', false)
        return response.data
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data || error.message || 'Failed to create election')
        throw error
      }
    },
    async updateElection({ commit, dispatch }, { id, data }) {
      try {
        commit('SET_LOADING', true)
        const response = await api.updateElection(id, data)
        
        // Refresh the elections list
        await dispatch('fetchElections')
        
        commit('SET_LOADING', false)
        return response.data
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data || 'Failed to update election')
        throw error
      }
    },
    
    // Candidate actions
    async fetchCandidates({ commit }) {
      try {
        commit('SET_LOADING', true)
        const response = await api.getCandidates()
        commit('SET_CANDIDATES', response.data)
        commit('SET_LOADING', false)
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data || 'Failed to fetch candidates')
      }
    },
    async createCandidate({ commit, dispatch, state }, candidateData) {
      try {
        commit('SET_LOADING', true)
        
        // Add candidate to the election contract
        if (state.currentElection && state.currentElection.contract_address) {
          const electionContract = state.contracts.elections[state.currentElection.contract_address]
          if (electionContract) {
            await web3Service.addCandidateToContract(
              electionContract,
              candidateData.candidateId,
              candidateData.positionId,
              state.wallet
            )
          }
        }
        
        // Save candidate in the backend
        const response = await api.createCandidate(candidateData)
        
        // Refresh the candidates list
        await dispatch('fetchCandidates')
        
        commit('SET_LOADING', false)
        return response.data
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data || error.message || 'Failed to create candidate')
        throw error
      }
    },
    
    // Voter actions
    async fetchVoters({ commit }) {
      try {
        commit('SET_LOADING', true)
        const response = await api.getVoters()
        commit('SET_VOTERS', response.data)
        commit('SET_LOADING', false)
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data || 'Failed to fetch voters')
      }
    },
    async whitelistVoter({ commit, state }, { electionId, voterAddress }) {
      try {
        commit('SET_LOADING', true)
        
        // First find the election
        const election = state.elections.find(e => e.electionId === electionId)
        if (election && election.contract_address) {
          const electionContract = state.contracts.elections[election.contract_address]
          
          if (electionContract) {
            // Whitelist the voter in the contract
            await web3Service.whitelistVoter(
              electionContract,
              voterAddress,
              state.wallet
            )
            
            // Also update in backend
            await api.whitelistVoter(electionId, voterAddress)
          }
        }
        
        commit('SET_LOADING', false)
        return true
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.message || 'Failed to whitelist voter')
        throw error
      }
    },
    
    // Voting actions
    async castVote({ commit, state }, { electionId, positionId, candidateId }) {
      try {
        commit('SET_LOADING', true)
        
        // Find the election
        const election = state.elections.find(e => e.electionId === electionId)
        if (!election || !election.contract_address) {
          throw new Error('Election not found or invalid')
        }
        
        // Get the election contract
        let electionContract = state.contracts.elections[election.contract_address]
        if (!electionContract) {
          // If not already loaded, load it now
          electionContract = await web3Service.getElectionContract(
            state.web3,
            election.contract_address
          )
          commit('SET_CONTRACT', { name: election.contract_address, contract: electionContract })
        }
        
        // Cast the vote via the smart contract
        const tx = await web3Service.castVote(
          electionContract,
          positionId,
          candidateId,
          state.wallet
        )
        
        // Record the vote in the backend as well
        await api.recordVote({
          electionId,
          positionId,
          candidateId,
          wallet: state.wallet,
          transactionHash: tx.transactionHash
        })
        
        commit('SET_LOADING', false)
        return tx
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.message || 'Failed to cast vote')
        throw error
      }
    },
    
    // Results actions
    async fetchResults({ commit, state }, electionId) {
      try {
        commit('SET_LOADING', true)
        
        // Find the election
        const election = state.elections.find(e => e.electionId === electionId)
        if (!election || !election.contract_address) {
          throw new Error('Election not found or invalid')
        }
        
        // Get the election contract
        let electionContract = state.contracts.elections[election.contract_address]
        if (!electionContract) {
          electionContract = await web3Service.getElectionContract(
            state.web3,
            election.contract_address
          )
          commit('SET_CONTRACT', { name: election.contract_address, contract: electionContract })
        }
        
        // Get results from the contract
        const results = await web3Service.getElectionResults(electionContract)
        
        commit('SET_LOADING', false)
        return results
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.message || 'Failed to fetch results')
        throw error
      }
    },
    
    // Election phase management
    async updateElectionPhase({ commit, state }, { electionId, phase }) {
      try {
        commit('SET_LOADING', true)
        
        // Find the election
        const election = state.elections.find(e => e.electionId === electionId)
        if (!election || !election.contract_address) {
          throw new Error('Election not found or invalid')
        }
        
        // Get the election contract
        let electionContract = state.contracts.elections[election.contract_address]
        if (!electionContract) {
          electionContract = await web3Service.getElectionContract(
            state.web3,
            election.contract_address
          )
          commit('SET_CONTRACT', { name: election.contract_address, contract: electionContract })
        }
        
        // Update the phase in the contract
        await web3Service.setElectionPhase(
          electionContract,
          phase,
          state.wallet
        )
        
        // Update in backend as well
        await api.updateElectionPhase(electionId, phase)
        
        commit('SET_LOADING', false)
        return true
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.message || 'Failed to update election phase')
        throw error
      }
    }
  }
})
