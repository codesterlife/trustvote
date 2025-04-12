import axios from 'axios';

// Base URL for API calls
const API_URL = 'http://localhost:8000/api/';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token to requests if it exists
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default {
  // Auth
  login(credentials) {
    return apiClient.post('auth/login/', credentials);
  },
  
  register(userData) {
    return apiClient.post('register/', userData);
  },
  
  getUserInfo() {
    return apiClient.get('auth/user/');
  },
  
  // Voter
  getVoterStatus() {
    return apiClient.get('voter-status/');
  },
  
  connectWallet(walletAddress) {
    return apiClient.post('connect-wallet/', { wallet_address: walletAddress });
  },
  
  // Elections
  getElections() {
    return apiClient.get('elections/');
  },
  
  getElection(id) {
    return apiClient.get(`elections/${id}/`);
  },
  
  createElection(electionData) {
    return apiClient.post('elections/', electionData);
  },
  
  updateElection(id, electionData) {
    return apiClient.put(`elections/${id}/`, electionData);
  },
  
  updateElectionStatus(id, status) {
    return apiClient.post(`update-election-status/${id}/`, { status });
  },
  
  getActiveElections() {
    return apiClient.get('active-elections/');
  },
  
  // Positions
  getPositions(electionId) {
    return apiClient.get(`positions/?election=${electionId}`);
  },
  
  createPosition(positionData) {
    return apiClient.post('positions/', positionData);
  },
  
  updatePosition(id, positionData) {
    return apiClient.put(`positions/${id}/`, positionData);
  },
  
  // Candidates
  getCandidates(filter = {}) {
    let url = 'candidates/';
    const params = new URLSearchParams();
    
    if (filter.election) {
      params.append('election', filter.election);
    }
    
    if (filter.position) {
      params.append('position', filter.position);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return apiClient.get(url);
  },
  
  createCandidate(candidateData) {
    return apiClient.post('candidates/', candidateData);
  },
  
  updateCandidate(id, candidateData) {
    return apiClient.put(`candidates/${id}/`, candidateData);
  },
  
  // Parties
  getParties() {
    return apiClient.get('parties/');
  },
  
  createParty(partyData) {
    return apiClient.post('parties/', partyData);
  },
  
  // Votes
  castVote(voteData) {
    return apiClient.post('votes/', voteData);
  },
  
  getElectionResults(electionId) {
    return apiClient.get(`election-results/${electionId}/`);
  },
  
  // Voters (admin)
  getVoters() {
    return apiClient.get('voters/');
  },
  
  whitelistVoter(voterId) {
    return apiClient.post(`whitelist-voter/${voterId}/`);
  }
};
