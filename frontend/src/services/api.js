import axios from 'axios'

const API_URL = 'http://localhost:8000/api'

// Create a configured axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Add a request interceptor to include auth token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Authentication services
const auth = {
  login(credentials) {
    return apiClient.post('/auth/login/', credentials)
  },
  register(userData) {
    return apiClient.post('/auth/register/', userData)
  },
  verifyToken(token) {
    return apiClient.post('/auth/verify-token/', { token })
  }
}

// Voter services
const voters = {
  getVoters() {
    return apiClient.get('/voters/')
  },
  getVoter(id) {
    return apiClient.get(`/voters/${id}/`)
  },
  getVoterByAddress(address) {
    return apiClient.get(`/voters/by-address/${address}/`)
  },
  getPendingVoters() {
    return apiClient.get('/voters/pending/')
  },
  registerVoter(data) {
    return apiClient.post('/voters/', data)
  },
  updateVoterStatus(id, status) {
    return apiClient.patch(`/voters/${id}/status/`, { status })
  },
  verifyVoter(address) {
    return apiClient.post('/voters/verify/', { wallet_address: address })
  },
  getVoterVotes(id) {
    return apiClient.get(`/voters/${id}/votes/`)
  }
}

// Election services
const elections = {
  getElections(params) {
    return apiClient.get('/elections/', { params })
  },
  getElection(id) {
    return apiClient.get(`/elections/${id}/`)
  },
  createElection(data) {
    return apiClient.post('/elections/', data)
  },
  updateElection(id, data) {
    return apiClient.put(`/elections/${id}/`, data)
  },
  deleteElection(id) {
    return apiClient.delete(`/elections/${id}/`)
  },
  updateElectionPhase(id, phase) {
    return apiClient.patch(`/elections/${id}/phase/`, { status: phase })
  },
  getElectionStats(id) {
    return apiClient.get(`/elections/${id}/stats/`)
  }
}

// Candidate services
const candidates = {
  getCandidates() {
    return apiClient.get('/candidates/')
  },
  getCandidate(id) {
    return apiClient.get(`/candidates/${id}/`)
  },
  getCandidatesByElection(electionId) {
    return apiClient.get(`/candidates/election/${electionId}/`)
  },
  getCandidatesByPosition(electionId, positionId) {
    return apiClient.get(`/candidates/election/${electionId}/position/${positionId}/`)
  },
  createCandidate(data) {
    return apiClient.post('/candidates/', data)
  },
  updateCandidate(id, data) {
    return apiClient.put(`/candidates/${id}/`, data)
  },
  deleteCandidate(id) {
    return apiClient.delete(`/candidates/${id}/`)
  }
}

// Vote services
const votes = {
  recordVote(data) {
    return apiClient.post('/votes/', data)
  },
  getVotesByElection(electionId) {
    return apiClient.get(`/votes/election/${electionId}/`)
  },
  getVotesByPosition(electionId, positionId) {
    return apiClient.get(`/votes/election/${electionId}/position/${positionId}/`)
  },
  getVoterHasVoted(electionId, positionId, walletAddress) {
    return apiClient.get(
      `/votes/check-vote/?election_id=${electionId}&position_id=${positionId}&wallet_address=${walletAddress}`
    )
  }
}

// Admin services
const admin = {
  getAdminStats() {
    return apiClient.get('/admin/stats/')
  },
  getDashboardData() {
    return apiClient.get('/admin/dashboard/')
  }
}

export default {
  // Re-export all service groups
  ...auth,
  ...voters,
  ...elections,
  ...candidates,
  ...votes,
  ...admin,
  
  // Export the axios instance for direct use if needed
  apiClient
}
