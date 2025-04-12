import axios from 'axios'

// Create axios instance with baseURL
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Django backend API URL
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

// Request interceptor to attach auth token to requests
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response && error.response.status === 401) {
      // Token expired, clean up and redirect to login
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

const api = {
  // Authentication
  register(userData) {
    return apiClient.post('/auth/register/', userData)
  },
  
  login(credentials) {
    return apiClient.post('/auth/login/', credentials)
  },
  
  getCurrentUser() {
    return apiClient.get('/auth/user/')
  },
  
  // Elections
  getElections() {
    return apiClient.get('/elections/')
  },
  
  getElection(id) {
    return apiClient.get(`/elections/${id}/`)
  },
  
  createElection(electionData) {
    return apiClient.post('/elections/', electionData)
  },
  
  updateElection(id, data) {
    return apiClient.put(`/elections/${id}/`, data)
  },
  
  updateElectionPhase(id, phase) {
    return apiClient.patch(`/elections/${id}/phase/`, { status: phase })
  },
  
  // Candidates
  getCandidates() {
    return apiClient.get('/candidates/')
  },
  
  getCandidatesByElection(electionId) {
    return apiClient.get(`/elections/${electionId}/candidates/`)
  },
  
  getCandidate(id) {
    return apiClient.get(`/candidates/${id}/`)
  },
  
  createCandidate(candidateData) {
    return apiClient.post('/candidates/', candidateData)
  },
  
  updateCandidate(id, data) {
    return apiClient.put(`/candidates/${id}/`, data)
  },
  
  // Voters
  getVoters() {
    return apiClient.get('/voters/')
  },
  
  whitelistVoter(electionId, voterAddress) {
    return apiClient.post(`/elections/${electionId}/whitelist/`, { 
      wallet_address: voterAddress
    })
  },
  
  // Voting
  recordVote(voteData) {
    return apiClient.post('/votes/', voteData)
  },
  
  getVotesByElection(electionId) {
    return apiClient.get(`/elections/${electionId}/votes/`)
  },
  
  // Results
  getResults(electionId) {
    return apiClient.get(`/elections/${electionId}/results/`)
  }
}

export default api
