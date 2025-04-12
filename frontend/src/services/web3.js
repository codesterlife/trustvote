import Web3 from 'web3'
import ElectionFactoryABI from '../contracts/ElectionFactory.json'
import ElectionABI from '../contracts/Election.json'

// Contract addresses (to be set during deployment)
const ELECTION_FACTORY_ADDRESS = process.env.VUE_APP_ELECTION_FACTORY_ADDRESS || ''

const web3Service = {
  /**
   * Initialize Web3 without user interaction
   * Used on app startup to check if user already has MetaMask connected
   */
  async initWeb3() {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum)
      
      try {
        // Get network ID
        const networkId = await web3.eth.net.getId()
        
        // Check if already authorized
        const accounts = await window.ethereum.request({
          method: 'eth_accounts'
        })
        
        if (accounts && accounts.length > 0) {
          return {
            web3,
            address: accounts[0],
            networkId
          }
        }
        
        return { web3, networkId }
      } catch (error) {
        console.error('Error initializing Web3:', error)
        return {}
      }
    } else {
      console.log('MetaMask not detected')
      return {}
    }
  },
  
  /**
   * Connect to MetaMask with user interaction
   */
  async connectWallet() {
    if (!window.ethereum) {
      throw new Error('MetaMask not detected. Please install MetaMask to use this application.')
    }
    
    try {
      const web3 = new Web3(window.ethereum)
      
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your MetaMask wallet.')
      }
      
      const networkId = await web3.eth.net.getId()
      
      return {
        web3,
        address: accounts[0],
        networkId
      }
    } catch (error) {
      console.error('Error connecting to wallet:', error)
      throw error
    }
  },
  
  /**
   * Get the ElectionFactory contract instance
   */
  async getElectionFactoryContract(web3) {
    if (!web3) {
      throw new Error('Web3 not initialized')
    }
    
    try {
      return new web3.eth.Contract(
        ElectionFactoryABI.abi,
        ELECTION_FACTORY_ADDRESS
      )
    } catch (error) {
      console.error('Error getting ElectionFactory contract:', error)
      throw error
    }
  },
  
  /**
   * Get an Election contract instance by address
   */
  async getElectionContract(web3, address) {
    if (!web3) {
      throw new Error('Web3 not initialized')
    }
    
    try {
      return new web3.eth.Contract(
        ElectionABI.abi,
        address
      )
    } catch (error) {
      console.error('Error getting Election contract:', error)
      throw error
    }
  },
  
  /**
   * Deploy a new Election contract via the ElectionFactory
   */
  async deployElectionContract(web3, factoryContract, electionData, fromAddress) {
    if (!web3 || !factoryContract) {
      throw new Error('Web3 or ElectionFactory contract not initialized')
    }
    
    try {
      // Convert election data to format expected by the contract
      const startTime = Math.floor(new Date(electionData.startTime).getTime() / 1000)
      const endTime = Math.floor(new Date(electionData.endTime).getTime() / 1000)
      
      // Get contract positions as array of ids
      const positionIds = electionData.positions.map(p => p.positionId)
      
      // Create election via factory
      const result = await factoryContract.methods.createElection(
        electionData.title,
        startTime,
        endTime,
        positionIds
      ).send({ from: fromAddress })
      
      // Get the address of the deployed election contract
      const electionAddress = result.events.ElectionCreated.returnValues.electionAddress
      
      // Get the new election contract instance
      const electionContract = await this.getElectionContract(web3, electionAddress)
      
      return {
        contract: electionContract,
        address: electionAddress,
        transaction: result
      }
    } catch (error) {
      console.error('Error deploying election contract:', error)
      throw error
    }
  },
  
  /**
   * Add a candidate to an election contract
   */
  async addCandidateToContract(electionContract, candidateId, positionId, fromAddress) {
    if (!electionContract) {
      throw new Error('Election contract not initialized')
    }
    
    try {
      const result = await electionContract.methods.addCandidate(
        candidateId,
        positionId
      ).send({ from: fromAddress })
      
      return result
    } catch (error) {
      console.error('Error adding candidate to contract:', error)
      throw error
    }
  },
  
  /**
   * Whitelist a voter in the election contract
   */
  async whitelistVoter(electionContract, voterAddress, fromAddress) {
    if (!electionContract) {
      throw new Error('Election contract not initialized')
    }
    
    try {
      const result = await electionContract.methods.whitelistVoter(
        voterAddress
      ).send({ from: fromAddress })
      
      return result
    } catch (error) {
      console.error('Error whitelisting voter:', error)
      throw error
    }
  },
  
  /**
   * Cast a vote in the election contract
   */
  async castVote(electionContract, positionId, candidateId, fromAddress) {
    if (!electionContract) {
      throw new Error('Election contract not initialized')
    }
    
    try {
      const result = await electionContract.methods.vote(
        positionId,
        candidateId
      ).send({ from: fromAddress })
      
      return result
    } catch (error) {
      console.error('Error casting vote:', error)
      throw error
    }
  },
  
  /**
   * Get election results from the contract
   */
  async getElectionResults(electionContract) {
    if (!electionContract) {
      throw new Error('Election contract not initialized')
    }
    
    try {
      // First get the position IDs
      const positionCount = await electionContract.methods.getPositionCount().call()
      const positions = []
      
      for (let i = 0; i < positionCount; i++) {
        const positionId = await electionContract.methods.positionIds(i).call()
        positions.push(parseInt(positionId))
      }
      
      // For each position, get the candidates and their vote counts
      const results = {}
      
      for (const positionId of positions) {
        const candidateCount = await electionContract.methods.getCandidateCount(positionId).call()
        const positionResults = []
        
        for (let i = 0; i < candidateCount; i++) {
          const candidateId = await electionContract.methods.getPositionCandidate(positionId, i).call()
          const votes = await electionContract.methods.getCandidateVotes(positionId, candidateId).call()
          
          positionResults.push({
            candidateId: parseInt(candidateId),
            votes: parseInt(votes)
          })
        }
        
        results[positionId] = positionResults
      }
      
      return results
    } catch (error) {
      console.error('Error getting election results:', error)
      throw error
    }
  },
  
  /**
   * Set the election phase in the contract
   */
  async setElectionPhase(electionContract, phase, fromAddress) {
    if (!electionContract) {
      throw new Error('Election contract not initialized')
    }
    
    const phaseMap = {
      'Init': 0,
      'Voting': 1,
      'Closed': 2
    }
    
    if (!(phase in phaseMap)) {
      throw new Error('Invalid election phase')
    }
    
    try {
      const result = await electionContract.methods.setElectionPhase(
        phaseMap[phase]
      ).send({ from: fromAddress })
      
      return result
    } catch (error) {
      console.error('Error setting election phase:', error)
      throw error
    }
  }
}

export default web3Service
