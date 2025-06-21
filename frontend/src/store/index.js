import { createStore } from 'vuex'
import api from '@/services/api'
import web3Service from '@/services/web3'
import router from '@/router'

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
    parties: [],
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
    allParties: state => state.parties,
    currentElection: state => state.currentElection,
    isConnected: state => !!state.web3 && !!state.wallet,
    networkId: state => state.networkId,
    voters: state => state.voters
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
    SET_PARTIES(state, parties) {
      state.parties = parties
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
    },
    UPDATE_ELECTION_STATUS(state, { electionId, status }) {
      const election = state.elections.find(e => e.electionId === electionId);
      if (election) {
        election.status = status;
      }
    }
  },
  actions: {
    // Auth actions
    async register({ commit }, userData) {
      try {
        commit('SET_LOADING', true)
        const response = await api.register(userData)
        
        // Save token to localStorage immediately after registration
        if (response.data && response.data.token) {
          console.log("User registered Successfully.")
          localStorage.setItem('token', response.data.token)
          commit('SET_USER', response.data.user)
        }
        
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
        if (response)
          console.log("User logged in Successfully.")
          window.location.href = "/"
        
        // Extract token and user from response data
        const { token, user } = response.data
        
        // Save token to localStorage
        if (token) {
          localStorage.setItem('token', token)
          commit('SET_USER', user)
        } else {
          throw new Error('No token received from server')
        }
        
        commit('SET_LOADING', false)
        return response.data
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
        window.location.reload(true)
        
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
            
            // Start the election phase watcher
            dispatch('startElectionPhaseWatcher');
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
      // Clear auth data
      localStorage.removeItem('token')
      
      // Reset store state
      commit('SET_USER', null)
      commit('SET_WALLET', null)
      commit('SET_ELECTIONS', [])
      commit('SET_CURRENT_ELECTION', null)
      commit('SET_CANDIDATES', [])
      commit('SET_VOTERS', [])
      
      // Handle navigation
      await router.push('/elections')
    },
    
    // Election actions
    async fetchElections({ commit }) {
      try {
        commit('SET_LOADING', true)
        const response = await api.getElections()
        if (response)
          console.log('Received Election Data received from the backend successfully. ', response.data)
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
        console.log("Election data for ID: ", id, " received from backend successfully. ", response.data)
        commit('SET_CURRENT_ELECTION', response.data)
        
        // Also fetch candidates for this election
        const candidatesResponse = await api.getCandidatesByElection(id)
        console.log("Candidates Data received from Backend successfully. ", candidatesResponse)
        commit('SET_CANDIDATES', candidatesResponse.data) 
        
        commit('SET_LOADING', false)
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data || 'Failed to fetch election details')
      }
    },
    async createElection({ commit, state, dispatch }, formattedData) {
      try {
        commit('SET_LOADING', true);
        
        if (!state.web3 || !state.contracts.electionFactory || !state.wallet) {
            throw new Error('Web3 or contracts not initialized');
        }

        // console.log('Data being sent from Vuex to Web3Service - formattedData:', formattedData);
        
        // Deploy the smart contract
        const deployResult = await web3Service.deployElectionContract(
            state.web3,
            state.contracts.electionFactory,
            formattedData,
            state.wallet
        );

        if (!deployResult || !deployResult.address) {
            throw new Error('Failed to deploy election contract');
        }
        else {
          console.log("Election Deployed to Blockchain Successfully. ", deployResult)
        }

        // Save the election in the backendata
        // console.log('Data being sent from Web3Service to API - backendData: ', deployResult.backendData)

        const response = await api.createElection(deployResult.backendData);
        if (response)
          console.log('Election Saved in the backend Successfully. ', response.data)
        
        // Register the new contract
        commit('SET_CONTRACT', { 
            name: deployResult.address, 
            contract: deployResult.contract 
        });
        
        // Refresh elections list
        await dispatch('fetchElections');

        // Start the phase watcher again to include the new election
        dispatch('startElectionPhaseWatcher');
        
        commit('SET_LOADING', false);
        return response.data;
        
      } catch (error) {
        commit('SET_LOADING', false);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create election';
        commit('SET_ERROR', errorMessage);
        throw error;
      }
    },
    async updateElection({ commit, state, dispatch }, { id, data },) {
      try {
        commit('SET_LOADING', true)
        const electionContractAddress = state.elections[0].contractAddress
        data.contract_address = electionContractAddress
        const response = await api.updateElection(id, data)
        if (response)
          console.log("Election updated in the backend Successfully. ", response)
        
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
        if (response)
          console.log("Candidates data received from the backend succesfully. ", response.data)
        commit('SET_CANDIDATES', response.data)
        commit('SET_LOADING', false)
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data || 'Failed to fetch candidates')
      }
    },

    async fetchParties({ commit }) {
      try {
        commit('SET_LOADING', true)
        const response = await api.getParties() // Ensure `getParties` is defined in your API service
        commit('SET_PARTIES', response.data)
        commit('SET_LOADING', false)
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data || 'Failed to fetch parties')
      }
    },

    async createCandidate({ commit, dispatch, state }, candidateData) {

      const { electionId, candidateId, positionId } = candidateData;

      await dispatch('fetchElection', electionId);
      console.log('Candidate Data:', candidateData); // Debug log
      console.log('Election ID:', electionId);
      console.log('Candidate ID:', candidateId);
      console.log('Position ID:', positionId);

      try {
        commit('SET_LOADING', true)
        
        // Add candidate to the election contract
        if (state.currentElection && state.currentElection.contractAddress) {

          const electionContract = await web3Service.getElectionContract(
              state.web3,
              state.currentElection.contractAddress
            )

          if (electionContract) {

            console.log('Adding candidate to contract:', { candidateId, positionId }); // Debug log

            const deployCandidate = await web3Service.addCandidateToContract(
              electionContract,
              candidateId,
              positionId,
              state.wallet
            )
            if (!deployCandidate || !deployCandidate.transactionHash) {
              throw new Error('Failed to add Candidate to Contract');
            }
            else {
              console.log("Candidate deployed to contract successfully. ", deployCandidate)
            }
          }
          
        }
        
        // Save candidate in the backend
        // console.log("Candidate Data being sent from Vuex to API: candidateData", candidateData)
        const response = await api.createCandidate(candidateData)
        if (response)
          console.log("Candidate Saved in the backend successfully. ", response.data)
        
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

    async updateCandidate({ commit, dispatch, state }, { id, data }) {
      try {
        commit('SET_LOADING', true);
    
        // console.log("Candidate Data in the state", [...state.candidates])
    
        // Update candidate in the backend
        // console.log("Candidate ID: ", id)
        // console.log("Candidate Data being sent from Vuex to API for update: data", data);
        const response = await api.updateCandidate(id, data);
        console.log("Candidate updated in the backend successfully. ", response.data);
    
        // Refresh the candidates list
        await dispatch('fetchCandidates');
    
        commit('SET_LOADING', false);
        return response.data;
      } catch (error) {
        commit('SET_LOADING', false);
        commit('SET_ERROR', error.response?.data || error.message || 'Failed to update candidate');
        throw error;
      }
    },
    
    // Voter actions
    async fetchVoters({ commit }) {
      try {
        commit('SET_LOADING', true)
        const response = await api.getVoters();
        if (response)
          console.log("Voters data received from backend successfully. ", response.data)
        commit('SET_VOTERS', response.data)
        commit('SET_LOADING', false)
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data || 'Failed to fetch voters')
      }
    },
    async whitelistVoter({ commit, state }, { electionId, voterAddress}) {
      try {
        // console.log("Whitelist data received at vuex", { electionId, voterAddress })
        commit('SET_LOADING', true)
        console.log("Whitelist payload:", { electionId, voterAddress})

        // First find the election
        const election = state.elections.find(e => e.electionId === electionId)
        if (election && election.contractAddress) {
          // const electionContract = state.contracts.elections[election.contractAddress] //NOTE: this does not work so loading election contract dynamically.
          const electionContract = await web3Service.getElectionContract(
            state.web3,
            election.contractAddress
          );
          // console.log("Election Contract: ", electionContract)
          // console.log("Wallet: ", state.wallet)
          if (electionContract) {
            // Whitelist the voter in the contract
            const whitelistResponse = await web3Service.whitelistVoter(
                electionContract,
                voterAddress,
                state.wallet
              )
            console.log("Voter whitelisted for ",election.title," in the contract successfully. ", whitelistResponse)
            
            // Also update in backend
            const backendResponse = await api.whitelistVoter(electionId, voterAddress)
            if (backendResponse)
              console.log("Voter whitelisted for ",election.title," in the backend successfully. ", backendResponse.data.message)
              window.location.href = "/admin/voters"
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
        if (!election || !election.contractAddress) {
          throw new Error('Election not found or invalid')
        }

        console.log("election in state: ", election)

        console.log("position ID", positionId)

        // Find the Candidate
        const candidates = await api.getCandidatesByElection(electionId)

        console.log("candidates: ", candidates)

        const candidate_id = candidates.data.find(item => item.candidate_id === candidateId).id
        
        console.log("Candidate ID: ", candidate_id)

        // Get the election contract
        let electionContract = state.contracts.elections[election.contractAddress]
        if (!electionContract) {
          // If not already loaded, load it now
          electionContract = await web3Service.getElectionContract(
            state.web3,
            election.contractAddress
          )
          console.log("Election Contract received Successfully. ", electionContract)
          commit('SET_CONTRACT', { name: election.contractAddress, contract: electionContract })
        }
        
        // Cast the vote via the smart contract
        const tx = await web3Service.castVote(
          electionContract,
          positionId,
          candidateId,
          state.wallet
        )
        console.log("Vote Casted via the smart contract successfully. ", tx)
        
        // Record the vote in the backend as well


        const recordVoteResponse = await api.recordVote({
          election: electionId,
          position: positionId,
          candidate: candidate_id,
          wallet: state.wallet,
          transaction_hash: tx.transactionHash
        })
        if (recordVoteResponse)
          console.log("Vote Recorded in the backend Successfully. ", recordVoteResponse.data)
        
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
        // console.log(state.elections[0])
        const election = state.elections.find(e => e.electionId === electionId)
        // console.log(election.contractAddress)
        if (!election || !election.contractAddress) {
          throw new Error('Election not found or invalid')
        }
        
        // Get the election contract
        const electionContract = await web3Service.getElectionContract(
            state.web3,
            election.contractAddress
          )
        console.log("Election Contract received Successfully. ", electionContract)
        commit('SET_CONTRACT', { name: election.contractAddress, contract: electionContract })
        
        // Get results from the contract
        const contract = await web3Service.getElectionResults(electionContract)
        if (contract)
          console.log("Election result received from the contract successfully. ", contract)

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
        // console.log("electionId from state: ", state.elections.find(e => e.electionId === electionId))
        // Find the election
        const election = state.elections.find(e => e.electionId === electionId)
        if (!election || !election.contractAddress) {
          throw new Error('Election not found or invalid')
        }
        
        // Get the election contract
        let electionContract = state.contracts.elections[election.contractAddress]
        if (!electionContract) {
          electionContract = await web3Service.getElectionContract(
            state.web3,
            election.contractAddress
          )
          console.log("Election Contract received Successfully. ", electionContract)

          commit('SET_CONTRACT', { name: election.contractAddress, contract: electionContract })
        }
        
        // Update the phase in the contract
        const setElectionPhase = await web3Service.setElectionPhase(
          electionContract,
          phase,
          state.wallet
        )
        if (setElectionPhase)
          console.log('Election Phase updated in the contract successfully. ', setElectionPhase);

        // Update in backend as well
        const response = await api.updateElectionPhase(electionId, phase)

        if (response)
          console.log("Election Phase updated in the backend successfully. ", response)
          window.location.reload()

        // Update the election status in Vuex state
        commit('UPDATE_ELECTION_STATUS', { electionId, status: phase });

        commit('SET_LOADING', false)
        return true
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.message || 'Failed to update election phase')
        throw error
      }
    },
    async startElectionPhaseWatcher({ state, dispatch }) {
      for (const election of state.elections) {
        const now = new Date();
    
        // Schedule transition to "Voting" phase
        if (election.startTime && new Date(election.startTime) > now && election.status === 'Init') {
          const timeUntilStart = new Date(election.startTime) - now;
          setTimeout(async () => {
            console.log(`Updating phase for election: ${election.title} to "Voting"`);
            try {
              // Ensure all positions have candidates before transitioning
              const candidates = await api.getCandidatesByElection(election.electionId);
              if (!candidates || candidates.length === 0) {
                throw new Error('All positions must have at least one candidate');
              }
              await dispatch('updateElectionPhase', { electionId: election.electionId, phase: 'Voting' });
            } catch (error) {
              console.error(`Failed to update phase for election: ${election.title}`, error);
            }
          }, timeUntilStart);
        }
    
        // Schedule transition to "Closed" phase
        if (election.endTime && new Date(election.endTime) > now && election.status === 'Voting') {
          const timeUntilEnd = new Date(election.endTime) - now;
          setTimeout(async () => {
            console.log(`Updating phase for election: ${election.title} to "Closed"`);
            try {
              await dispatch('updateElectionPhase', { electionId: election.electionId, phase: 'Closed' });
            } catch (error) {
              console.error(`Failed to update phase for election: ${election.title}`, error);
            }
          }, timeUntilEnd);
        }
      }
    },
    async fetchElectoralRoll({ commit }, electionId) {
      // console.log("Fetching electoral roll for electionId:", electionId);
      const response = await api.getElectoralRoll(electionId)
      console.log("Electoral Roll: ", response)
      return response.data
    },
    async addElectoralRollEntry({ commit }, entry) {
      await api.addElectoralRollEntry(entry)
    },
    async updateElectoralRollEntry({ commit }, entry) {
      await api.updateElectoralRollEntry(entry)
    },
    async deleteElectoralRollEntry({ commit }, entryId) {
      await api.deleteElectoralRollEntry(entryId)
    }
  }
})
