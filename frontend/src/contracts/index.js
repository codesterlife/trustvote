import ElectionFactoryABI from './ElectionFactory.json'
import ElectionABI from './Election.json'

class ContractService {
  constructor() {
    this.web3 = null
    this.networkId = null
    this.accounts = null
    this.electionFactory = null
    this.elections = {} // Cache for Election contract instances
    this.factoryAddress = process.env.VUE_APP_FACTORY_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3' // Default local address
  }

  async init(web3Instance, networkId) {
    this.web3 = web3Instance
    this.networkId = networkId
    this.accounts = await this.web3.eth.getAccounts()
    
    try {
      // Initialize ElectionFactory contract
      this.electionFactory = new this.web3.eth.Contract(
        ElectionFactoryABI.abi,
        this.factoryAddress
      )
      
      console.log('Contract service initialized with factory at', this.factoryAddress)
    } catch (error) {
      console.error('Failed to initialize contract service:', error)
      throw error
    }
  }

  // Get the contract instance for a specific election
  async getElectionContract(electionId) {
    // Check if we already have this election in cache
    if (this.elections[electionId]) {
      return this.elections[electionId]
    }
    
    try {
      // Get election address from factory
      const electionAddress = await this.electionFactory.methods.getElection(electionId).call()
      
      if (!electionAddress || electionAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error(`Election with ID ${electionId} does not exist`)
      }
      
      // Create contract instance
      const electionContract = new this.web3.eth.Contract(
        ElectionABI.abi,
        electionAddress
      )
      
      // Cache the instance
      this.elections[electionId] = electionContract
      
      return electionContract
    } catch (error) {
      console.error(`Error getting election contract for ID ${electionId}:`, error)
      throw error
    }
  }

  // Get the address of an election contract
  async getElectionContractAddress(electionId) {
    try {
      const address = await this.electionFactory.methods.getElection(electionId).call()
      return address
    } catch (error) {
      console.error(`Error getting election address for ID ${electionId}:`, error)
      throw error
    }
  }

  // Deploy a new election
  async deployElection(electionId, electionData) {
    try {
      const account = this.accounts[0]
      
      // Convert positions and candidates to arrays needed by the contract
      const positionIds = electionData.positions.map(p => p.positionId)
      
      // Deploy the election through the factory
      const result = await this.electionFactory.methods
        .createElection(electionId, positionIds)
        .send({ from: account })
      
      console.log('Election deployed:', result)
      return result
    } catch (error) {
      console.error('Error deploying election:', error)
      throw error
    }
  }

  // Add a candidate to an election
  async addCandidate(electionId, positionId, candidateId, name) {
    try {
      const electionContract = await this.getElectionContract(electionId)
      const account = this.accounts[0]
      
      const result = await electionContract.methods
        .addCandidate(positionId, candidateId, name)
        .send({ from: account })
      
      return result
    } catch (error) {
      console.error('Error adding candidate:', error)
      throw error
    }
  }

  // Update a candidate
  async updateCandidate(electionId, positionId, candidateId, name) {
    try {
      const electionContract = await this.getElectionContract(electionId)
      const account = this.accounts[0]
      
      const result = await electionContract.methods
        .updateCandidate(positionId, candidateId, name)
        .send({ from: account })
      
      return result
    } catch (error) {
      console.error('Error updating candidate:', error)
      throw error
    }
  }

  // Whitelist a voter
  async whitelistVoter(voterAddress) {
    try {
      // In a real implementation, we might need to whitelist the voter for each active election
      // For simplicity, we're using a mock implementation that succeeds
      console.log('Whitelisting voter:', voterAddress)
      return { success: true }
    } catch (error) {
      console.error('Error whitelisting voter:', error)
      throw error
    }
  }

  // Remove a voter from the whitelist
  async removeVoterFromWhitelist(voterAddress) {
    try {
      // Mock implementation
      console.log('Removing voter from whitelist:', voterAddress)
      return { success: true }
    } catch (error) {
      console.error('Error removing voter from whitelist:', error)
      throw error
    }
  }

  // Cast a vote
  async castVote(electionId, positionId, candidateId, voterAddress) {
    try {
      const electionContract = await this.getElectionContract(electionId)
      
      // Cast the vote
      const result = await electionContract.methods
        .vote(positionId, candidateId)
        .send({ from: voterAddress })
      
      return result
    } catch (error) {
      console.error('Error casting vote:', error)
      throw error
    }
  }

  // Get election phase
  async getElectionPhase(electionId) {
    try {
      const electionContract = await this.getElectionContract(electionId)
      const phase = await electionContract.methods.getPhase().call()
      return parseInt(phase)
    } catch (error) {
      console.error('Error getting election phase:', error)
      throw error
    }
  }

  // Change election phase
  async changeElectionPhase(electionId, newPhase) {
    try {
      const electionContract = await this.getElectionContract(electionId)
      const account = this.accounts[0]
      
      let phaseValue
      switch (newPhase) {
        case 'Init':
          phaseValue = 0
          break
        case 'Voting':
          phaseValue = 1
          break
        case 'Closed':
          phaseValue = 2
          break
        default:
          throw new Error(`Invalid phase: ${newPhase}`)
      }
      
      const result = await electionContract.methods
        .setPhase(phaseValue)
        .send({ from: account })
      
      return result
    } catch (error) {
      console.error('Error changing election phase:', error)
      throw error
    }
  }

  // Check if voter has voted for a specific position
  async hasVoted(electionId, positionId, voterAddress) {
    try {
      const electionContract = await this.getElectionContract(electionId)
      
      const result = await electionContract.methods
        .hasVoted(positionId, voterAddress)
        .call()
      
      return result
    } catch (error) {
      console.error('Error checking if voter has voted:', error)
      throw error
    }
  }

  // Get results for a position
  async getResults(electionId, positionId) {
    try {
      const electionContract = await this.getElectionContract(electionId)
      
      // Get candidate IDs for this position
      const candidateIds = await electionContract.methods
        .getCandidateIds(positionId)
        .call()
      
      // Get vote counts for each candidate
      const votes = []
      for (const candidateId of candidateIds) {
        const count = await electionContract.methods
          .getVoteCount(positionId, candidateId)
          .call()
        
        votes.push({
          candidateId: parseInt(candidateId),
          count: parseInt(count)
        })
      }
      
      return {
        positionId: parseInt(positionId),
        votes: votes
      }
    } catch (error) {
      console.error('Error getting results:', error)
      throw error
    }
  }

  // Get winner for a position
  async getWinner(electionId, positionId) {
    try {
      const electionContract = await this.getElectionContract(electionId)
      
      const result = await electionContract.methods
        .getWinner(positionId)
        .call()
      
      return {
        candidateId: parseInt(result.candidateId),
        name: result.name,
        voteCount: parseInt(result.voteCount)
      }
    } catch (error) {
      console.error('Error getting winner:', error)
      throw error
    }
  }

  // Verify election results on blockchain
  async verifyElectionResults(electionId) {
    try {
      // This would perform a validation check against the blockchain data
      // For simplicity, we're just returning true
      return true
    } catch (error) {
      console.error('Error verifying election results:', error)
      throw error
    }
  }

  // Helper to create ABIs folder and files if they don't exist
  createMockABIs() {
    // This is a placeholder function that would be used in development
    // to create mock ABI files if they don't exist
    console.log('Creating mock ABIs')
    
    // ElectionFactory mock ABI
    const factoryABI = {
      abi: [
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_electionId",
              "type": "uint256"
            },
            {
              "internalType": "uint256[]",
              "name": "_positionIds",
              "type": "uint256[]"
            }
          ],
          "name": "createElection",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_electionId",
              "type": "uint256"
            }
          ],
          "name": "getElection",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }
      ]
    }
    
    // Election mock ABI
    const electionABI = {
      abi: [
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_positionId",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "_candidateId",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "_name",
              "type": "string"
            }
          ],
          "name": "addCandidate",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_positionId",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "_candidateId",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "_name",
              "type": "string"
            }
          ],
          "name": "updateCandidate",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_positionId",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "_candidateId",
              "type": "uint256"
            }
          ],
          "name": "vote",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getPhase",
          "outputs": [
            {
              "internalType": "uint8",
              "name": "",
              "type": "uint8"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint8",
              "name": "_phase",
              "type": "uint8"
            }
          ],
          "name": "setPhase",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_positionId",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "_voter",
              "type": "address"
            }
          ],
          "name": "hasVoted",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_positionId",
              "type": "uint256"
            }
          ],
          "name": "getCandidateIds",
          "outputs": [
            {
              "internalType": "uint256[]",
              "name": "",
              "type": "uint256[]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_positionId",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "_candidateId",
              "type": "uint256"
            }
          ],
          "name": "getVoteCount",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_positionId",
              "type": "uint256"
            }
          ],
          "name": "getWinner",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "candidateId",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "voteCount",
                  "type": "uint256"
                }
              ],
              "internalType": "struct Election.Candidate",
              "name": "",
              "type": "tuple"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }
      ]
    }
    
    // Return the mock ABIs
    return {
      ElectionFactoryABI: factoryABI,
      ElectionABI: electionABI
    }
  }
}

// During development, we need to ensure the ABIs are available
// For production, these would be properly built from the compiled contracts
const mockABIs = () => {
  // This is just a placeholder that would create ABI files in development
  // In a real app, we'd use the actual compiled ABIs
  
  // For this example, we'll mock them in memory
  const service = new ContractService()
  
  // Override the imported ABIs with our mock data
  const mock = service.createMockABIs()
  ElectionFactoryABI.abi = mock.ElectionFactoryABI.abi
  ElectionABI.abi = mock.ElectionABI.abi
}

// Create the ABIs if needed
try {
  // Check if the ABIs exist, if not create them
  if (!ElectionFactoryABI.abi || !ElectionABI.abi) {
    mockABIs()
  }
} catch (e) {
  // If imports failed, create mock ABIs
  mockABIs()
}

export default new ContractService()
