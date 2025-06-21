import axios from 'axios'

// Create axios instance with baseURL
const apiClient = axios.create({
  baseURL: 'http://0.0.0.0:8000/api', // Django backend API URL
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false
})

// Request interceptor to attach auth token to requests
apiClient.interceptors.request.use(
  config => {
    // Don't require token for authentication endpoints
    const isAuthEndpoint = config.url.endsWith('/auth/register/') || 
                          config.url.endsWith('/auth/login/')
    
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Token ${token}`
    } else if (!isAuthEndpoint) {
      // Only redirect if not an auth endpoint and token is required
      window.location.href = '/login'
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
    if (error.response && error.response.status === 401 && 
        !error.config.url.endsWith('/auth/register/') && 
        !error.config.url.endsWith('/auth/login/')) {
      // Token expired, clean up and redirect to login
      // But don't redirect for register/login endpoints
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

const api = {
  // Authentication
  register(userData) {
    console.log('Starting registration process...')
    console.log('API Register Request:', {
      url: '/auth/register/',
      data: userData
    })
    
    return apiClient.post('/auth/register/', userData)
      .then(response => {
        // console.log('Registration response received:', response)
        // console.log('Response data:', response.data)
        
        if (response.data && response.data.token) {
          // console.log('Token found in response, saving to localStorage')
          localStorage.setItem('token', response.data.token)
        } else {
          console.warn('No token found in response data')
        }
        
        return response
      })
      .catch(error => {
        console.error('Registration error:', error)
        console.error('Error response:', error.response)
        console.error('Error data:', error.response?.data)
        throw error
      })
  },
  
  login(credentials) {
    return apiClient.post('/auth/login/', credentials)
  },
  
  getCurrentUser() {
    return apiClient.get('/auth/user/')
  },
  
  updateWallet(walletData) {
    return apiClient.post('/auth/update-wallet/', walletData)
  },
  
  // User Profile
  updateProfile(userData) {
    return apiClient.put('/auth/user/profile/', userData)
  },
  
  getUserVotes() {
    return apiClient.get('/auth/user/votes/')
  },
  
  // Elections
  getElections() {
    return apiClient.get('/elections/')
  },
  
  getElection(id) {
    return apiClient.get(`/elections/${id}/`)
  },
  
  createElection(backendData) {
    if (!backendData) throw new Error('Election data is required');

    // console.log('Election data received from Vuex to API - backendData', backendData);

    // console.log('Raw start_time:', electionData.startTime);
    // console.log('Raw end_time:', electionData.endTime);

    // if (!Array.isArray(backendData.positions) || !backendData.positions.length) {
    //   throw new Error('At least one position is required');
    // }

    // console.log(backendData.positions)
    
    backendData.positions.forEach(item => {
      if (isNaN(item.positionId) || item.positionId <= 0 || item.positionId > Number.MAX_SAFE_INTEGER) {
        throw new Error(`Invalid position ID: ${item.positionId}`);
      }
    });

    const requestData = {
      title: backendData.title,
      description: backendData.description,
      start_time: new Date(backendData.startTime * 1000).toISOString(),
      end_time: new Date(backendData.endTime * 1000).toISOString(),
      positions: backendData.positions.map(item => ({
          position_id: item.positionId,
          title: item.title
      })),
      status: backendData.status,
      contract_address: backendData.address
    };

    // console.log('Request data being sent to backend:', requestData);

    // Validate required fields
    const validationErrors = [];
    if (!requestData.title) validationErrors.push('Title is required');
    if (!requestData.description) validationErrors.push('Description is required');
    if (!requestData.start_time) validationErrors.push('Start time is required');
    if (!requestData.end_time) validationErrors.push('End time is required');
    if (!Array.isArray(requestData.positions) || !requestData.positions.length) {
      validationErrors.push('At least one position is required');
    }

    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join('\n'));
    }


    // console.log('Election data being send to backend from API - requestData', requestData);
    // console.log("Creating election using the data...")

    return apiClient.post('/elections/', requestData)
      .then(response => {
        // console.log('Election creation successful.',);
        // console.log('Data received as response from the backend - response.data: ', response.data)
        return response;
      })
      .catch(error => {
        console.error('Election creation failed:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });

        if (error.response?.data) {
          throw new Error(JSON.stringify(error.response.data));
        }
        throw error;
      });
  },
  
  updateElection(id, data) {
    return apiClient.patch(`/elections/${id}/`, data)
  },
  
  updateElectionPhase(id, phase) {
    // console.log('API request to update election phase:', { id, phase });
    return apiClient.patch(`/elections/${id}/phase/`, { status: phase })
  },
  
  // Candidates
  getCandidates() {
    return apiClient.get('/candidates/')
  },

  async getParties() {
    return await apiClient.get('/parties/')
  },
  
  async getCandidatesByElection(electionId) {
    return apiClient.get(`/elections/${electionId}/candidates/`)
  },

  
  getCandidate(id) {
    return apiClient.get(`/candidates/${id}/`)
  },
  
  createCandidate(candidateData) {
    const sentCandidateData = {
      name: candidateData.name,
      election: candidateData.electionId,
      position: candidateData.positionId,
      party: candidateData.partyId,
      bio: candidateData.bio,
      manifesto: candidateData.manifesto,
      candidate_id: candidateData.candidateId //NOTE: temporary ID 
    }
    // console.log('Payload being sent to from API to backend - candidateData: ', sentCandidateData);
    return apiClient.post('/candidates/', sentCandidateData)
  },
  
  updateCandidate(id, data) {
    return apiClient.patch(`/candidates/${id}/`, data)
  },
  
  // Voters
  getVoters() {
    return apiClient.get('/voters/')
  },

  getElectoralRoll(electionId) {
    if (electionId) {
      return apiClient.get(`/electoral-roll/?election=${electionId}`)
    } else {
      return apiClient.get('/electoral-roll/')
    }
  },
  
  addElectoralRollEntry(entry) {
    return apiClient.post('/electoral-roll/', entry)
  },

  updateElectoralRollEntry(entry) {
    return apiClient.put(`/electoral-roll/${entry.id}/`, entry)
  },

  deleteElectoralRollEntry(entryId) {
    return apiClient.delete(`/electoral-roll/${entryId}/`)
  },

  checkElectoralRoll(electionId, studentId) {
    if (!electionId || !studentId) {
      return Promise.resolve({ data: { isVerified: false } });
    }
    return apiClient.get('/electoral-roll/verify/', {
      params: {
        election_id: electionId,
        student_id: studentId
      }
    }).catch(error => {
      console.error('Electoral roll check failed:', error);
      return { data: { isVerified: false } };
    });
  },

  
  whitelistVoter(electionId, voterAddress) {
    return apiClient.post(`/elections/${electionId}/whitelist/`, { 
      wallet_address: voterAddress,
    })
  },

  getVoterElectionWhitelist() {
    return apiClient.get('/voters/election_whitelist/');
  },
  
  // Voting
  recordVote(voteData) {
    console.log("Payload sent to recordVote API:", voteData);
    return apiClient.post('/votes/', voteData)
  },
  
  async getVotesByElection(electionId) {
    return apiClient.get(`/elections/${electionId}/votes/`) 
  },
  
  // Results
  getResults(electionId) {
    return apiClient.get(`/elections/${electionId}/results/`)
  }
}

export default api
