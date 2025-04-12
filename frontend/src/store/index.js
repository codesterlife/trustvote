import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import web3Service from '../services/web3';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
    token: localStorage.getItem('token') || null,
    isAdmin: false,
    voter: null,
    elections: [],
    currentElection: null,
    positions: [],
    candidates: [],
    parties: [],
    web3Available: false,
    web3Account: null,
    loadingStatus: false,
    notificationMessage: null,
    notificationType: 'info' // success, info, warning, danger
  },
  getters: {
    isAuthenticated(state) {
      return !!state.token;
    },
    isAdmin(state) {
      return state.isAdmin;
    },
    getUser(state) {
      return state.user;
    },
    getVoter(state) {
      return state.voter;
    },
    getElections(state) {
      return state.elections;
    },
    getCurrentElection(state) {
      return state.currentElection;
    },
    getPositions(state) {
      return state.positions;
    },
    getCandidates(state) {
      return state.candidates;
    },
    getParties(state) {
      return state.parties;
    },
    isWeb3Available(state) {
      return state.web3Available;
    },
    getWeb3Account(state) {
      return state.web3Account;
    },
    isLoading(state) {
      return state.loadingStatus;
    },
    getNotification(state) {
      return {
        message: state.notificationMessage,
        type: state.notificationType
      };
    }
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
      state.isAdmin = user ? user.is_staff : false;
    },
    setToken(state, token) {
      state.token = token;
      if (token) {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      }
    },
    setVoter(state, voter) {
      state.voter = voter;
    },
    setElections(state, elections) {
      state.elections = elections;
    },
    setCurrentElection(state, election) {
      state.currentElection = election;
    },
    setPositions(state, positions) {
      state.positions = positions;
    },
    setCandidates(state, candidates) {
      state.candidates = candidates;
    },
    setParties(state, parties) {
      state.parties = parties;
    },
    setWeb3Status(state, status) {
      state.web3Available = status;
    },
    setWeb3Account(state, account) {
      state.web3Account = account;
    },
    setLoadingStatus(state, status) {
      state.loadingStatus = status;
    },
    setNotification(state, { message, type }) {
      state.notificationMessage = message;
      state.notificationType = type || 'info';
    },
    clearNotification(state) {
      state.notificationMessage = null;
    }
  },
  actions: {
    async login({ commit, dispatch }, credentials) {
      try {
        commit('setLoadingStatus', true);
        const response = await axios.post('auth/login/', credentials);
        commit('setToken', response.data.token);
        await dispatch('fetchUserData');
        commit('setLoadingStatus', false);
        commit('setNotification', { 
          message: 'Successfully logged in!', 
          type: 'success' 
        });
        return true;
      } catch (error) {
        commit('setLoadingStatus', false);
        commit('setNotification', { 
          message: error.response ? error.response.data.message : 'Login failed', 
          type: 'danger' 
        });
        return false;
      }
    },
    logout({ commit }) {
      commit('setToken', null);
      commit('setUser', null);
      commit('setVoter', null);
      commit('setWeb3Account', null);
      commit('setNotification', { 
        message: 'You have been logged out', 
        type: 'info' 
      });
    },
    async register({ commit }, userData) {
      try {
        commit('setLoadingStatus', true);
        await axios.post('register/', userData);
        commit('setLoadingStatus', false);
        commit('setNotification', { 
          message: 'Registration successful! Please login.', 
          type: 'success' 
        });
        return true;
      } catch (error) {
        commit('setLoadingStatus', false);
        commit('setNotification', { 
          message: error.response ? error.response.data.message : 'Registration failed', 
          type: 'danger' 
        });
        return false;
      }
    },
    async fetchUserData({ commit }) {
      try {
        commit('setLoadingStatus', true);
        const userResponse = await axios.get('auth/user/');
        commit('setUser', userResponse.data);
        
        // Try to get voter information
        try {
          const voterResponse = await axios.get('voter-status/');
          if (voterResponse.data.is_registered) {
            commit('setVoter', voterResponse.data);
          }
        } catch (error) {
          console.error('Error fetching voter data:', error);
        }
        
        commit('setLoadingStatus', false);
        return true;
      } catch (error) {
        commit('setLoadingStatus', false);
        commit('setToken', null);
        commit('setUser', null);
        return false;
      }
    },
    async fetchElections({ commit }) {
      try {
        commit('setLoadingStatus', true);
        const response = await axios.get('elections/');
        commit('setElections', response.data);
        commit('setLoadingStatus', false);
        return true;
      } catch (error) {
        commit('setLoadingStatus', false);
        commit('setNotification', { 
          message: 'Failed to fetch elections', 
          type: 'danger' 
        });
        return false;
      }
    },
    async fetchElection({ commit }, electionId) {
      try {
        commit('setLoadingStatus', true);
        const response = await axios.get(`elections/${electionId}/`);
        commit('setCurrentElection', response.data);
        commit('setLoadingStatus', false);
        return response.data;
      } catch (error) {
        commit('setLoadingStatus', false);
        commit('setNotification', { 
          message: 'Failed to fetch election details', 
          type: 'danger' 
        });
        return null;
      }
    },
    async fetchPositions({ commit }, electionId) {
      try {
        commit('setLoadingStatus', true);
        const response = await axios.get(`positions/?election=${electionId}`);
        commit('setPositions', response.data);
        commit('setLoadingStatus', false);
        return true;
      } catch (error) {
        commit('setLoadingStatus', false);
        commit('setNotification', { 
          message: 'Failed to fetch positions', 
          type: 'danger' 
        });
        return false;
      }
    },
    async fetchCandidates({ commit }, { electionId, positionId }) {
      try {
        commit('setLoadingStatus', true);
        let url = 'candidates/';
        if (positionId) {
          url += `?position=${positionId}`;
        } else if (electionId) {
          url += `?election=${electionId}`;
        }
        const response = await axios.get(url);
        commit('setCandidates', response.data);
        commit('setLoadingStatus', false);
        return true;
      } catch (error) {
        commit('setLoadingStatus', false);
        commit('setNotification', { 
          message: 'Failed to fetch candidates', 
          type: 'danger' 
        });
        return false;
      }
    },
    async fetchParties({ commit }) {
      try {
        commit('setLoadingStatus', true);
        const response = await axios.get('parties/');
        commit('setParties', response.data);
        commit('setLoadingStatus', false);
        return true;
      } catch (error) {
        commit('setLoadingStatus', false);
        commit('setNotification', { 
          message: 'Failed to fetch parties', 
          type: 'danger' 
        });
        return false;
      }
    },
    async connectWallet({ commit, state }) {
      try {
        commit('setLoadingStatus', true);
        if (!state.web3Available) {
          throw new Error('MetaMask not available');
        }
        
        const accounts = await web3Service.getAccounts();
        if (accounts.length === 0) {
          throw new Error('No accounts found');
        }
        
        const account = accounts[0];
        commit('setWeb3Account', account);
        
        // Update voter record with wallet address
        if (state.user) {
          await axios.post('connect-wallet/', {
            wallet_address: account
          });
        }
        
        commit('setLoadingStatus', false);
        commit('setNotification', { 
          message: 'Wallet connected successfully!', 
          type: 'success' 
        });
        return true;
      } catch (error) {
        commit('setLoadingStatus', false);
        commit('setNotification', { 
          message: error.message || 'Failed to connect wallet', 
          type: 'danger' 
        });
        return false;
      }
    },
    async castVote({ commit, state }, { electionId, positionId, candidateId, electionContract }) {
      try {
        commit('setLoadingStatus', true);
        
        if (!state.web3Available || !state.web3Account) {
          throw new Error('Wallet not connected');
        }
        
        // Cast vote on blockchain
        const txHash = await web3Service.castVote(
          electionContract,
          state.web3Account,
          positionId,
          candidateId
        );
        
        // Record vote in backend
        await axios.post('votes/', {
          election: electionId,
          position: positionId,
          candidate: candidateId,
          transaction_hash: txHash
        });
        
        commit('setLoadingStatus', false);
        commit('setNotification', { 
          message: 'Vote cast successfully!', 
          type: 'success' 
        });
        return txHash;
      } catch (error) {
        commit('setLoadingStatus', false);
        commit('setNotification', { 
          message: error.message || 'Failed to cast vote', 
          type: 'danger' 
        });
        return null;
      }
    }
  }
});
