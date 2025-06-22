import Web3 from 'web3'
import ElectionFactoryABI from '../contracts/ElectionFactory.json'
import ElectionABI from '../contracts/Election.json'
import WalletConnectProvider from '@walletconnect/web3-provider'

// Contract addresses (to be set during deployment)
const ELECTION_FACTORY_ADDRESS = process.env.VUE_APP_ELECTION_FACTORY_ADDRESS

const web3Service = {
  /**
   * Initialize Web3 without user interaction
   * Used on app startup to check if user already has MetaMask connected
   */
  async initWeb3() {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum)
      
      try {
        // Wait for provider to be ready
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Get network ID
        const networkId = await web3.eth.net.getId()
        // console.log('Connected to network:', networkId)
        
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
        // Check if MetaMask is locked
        if (error.code === -32002) {
          throw new Error('Please unlock your MetaMask wallet')
        }
        // Check if user rejected request
        if (error.code === 4001) {
          throw new Error('Please connect your MetaMask wallet')
        }
        throw error
      }
    } else {
      console.log('MetaMask not detected')
      return {}
    }
  },
  
  /**
   * Connect to MetaMask with user interaction
   */
  // async connectWallet() {
  //   if (!window.ethereum) {
  //     throw new Error('MetaMask not detected. Please install MetaMask to use this application.')
  //   }
    
  //   try {
  //     const web3 = new Web3(window.ethereum)
      
  //     // Request account access
  //     const accounts = await window.ethereum.request({
  //       method: 'eth_requestAccounts'
  //     })
      
  //     if (!accounts || accounts.length === 0) {
  //       throw new Error('No accounts found. Please unlock your MetaMask wallet.')
  //     }
      
  //     const networkId = await web3.eth.net.getId()
      
  //     return {
  //       web3,
  //       address: accounts[0],
  //       networkId
  //     }
  //   } catch (error) {
  //     console.error('Error connecting to wallet:', error)
  //     throw error
  //   }
  // },

  async connectWallet() {
    // 1. Create WalletConnect Provider
    const provider = new WalletConnectProvider({
      rpc: {
        5777: "192.168.1.7:7545", // Replace with your network
      },
      chainId: 5777,
    });

    // 2. Enable session (triggers QR Code modal)
    await provider.enable();

    // 3. Create Web3 instance
    const web3 = new Web3(provider);

    // 4. Now you can use web3 as usual
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);
  },
  
  /**
   * Get the ElectionFactory contract instance
   */
  async getElectionFactoryContract(web3) {
    if (!web3) {
      throw new Error('Web3 not initialized')
    }
    
    if (!ELECTION_FACTORY_ADDRESS) {
      throw new Error('Election factory contract address not configured')
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
  async deployElectionContract(web3, factoryContract, formattedData, account) {
    // console.log('received data from Vuex to Web3Service - formattedData: ', formattedData );
    try {
        // // Validate and convert position IDs to numbers
        // const positionIds = (electionData.positions || []).map(id => {
        //     const num = Number(id);
        //     if (isNaN(num) || num <= 0) {
        //         throw new Error(`Invalid position ID: ${id}`);
        //     }
        //     return num;
        // });

        const params = {
            title: String(formattedData.title),
            startTime: Number(formattedData.start_time),
            endTime: Number(formattedData.end_time),
            positions: formattedData.positions.map(pos => pos.positionId)
        };

        // console.log("Position data length retreived from the params: ", params.positions.length)
        // console.log("Position data retreived from the params: ", params.positions)
        // console.log("Extracting position ids from the data received: ", params.positions)

        // Debug logging
        // console.log('Creating election with params:', params);
        // console.log('Original election data:', electionData);

        // Validate required data
        if (!params.title) {
            throw new Error('Election title is required');
        }
        if (!params.positions.length) {
            throw new Error('At least one position is required');
        }
        if (params.endTime <= params.startTime) {
            throw new Error('End time must be after start time');
        }

        // Send transaction
        const tx = await factoryContract.methods.createElection(
            params.title,
            params.startTime,
            params.endTime,
            params.positions // Pass only the positionId values
        ).send({ 
            from: account,
            gas: 5000000
        });

        // Debug transaction receipt
        // console.log('Transaction receipt:', tx);
        if (!tx.status) {
          throw new Error('Transaction failed or was reverted');
        }
        // console.log('Transaction events:', tx.events);

        // Safely access the event
        const electionEvent = tx.events?.ElectionCreated;
        if (!electionEvent) {
            throw new Error('ElectionCreated event not found in transaction receipt');
        }

        const contractAddress = electionEvent.returnValues.electionAddress;

        if (!web3.utils.isAddress(contractAddress)) {
          throw new Error('Invalid contract address');
        }

        // console.log('Contract deployed successfully at:', contractAddress);

        // Update the backend with the contract address
        // const response = await apiClient.patch(`/elections/${formattedData.electionId}/update_contract_address/`, {
        //     address: contractAddress
        // });

      // console.log('Backend updated with contract address:', response.data);

        // Create contract instance
        const electionContract = new web3.eth.Contract(
            ElectionABI.abi,
            contractAddress
        );

        return {
            contract: electionContract,
            address: contractAddress,
            backendData: {
                address: contractAddress,
                title: params.title,
                description: formattedData.description,
                startTime: params.startTime,
                endTime: params.endTime,
                positions: formattedData.positions,
                status: 'Init',
                // electionId: formattedData.electionId //included election id
            }
        };
    } catch (error) {
        console.error('Deployment error:', error);
        throw error;
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
      console.log('Calling addCandidate with:', { candidateId, positionId, fromAddress }); // Debug log
      const result = await electionContract.methods.addCandidate(
        candidateId,
        positionId
      ).send({ from: fromAddress })
      
      console.log('Candidate added to contract successfully:', result); // Debug log
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
  async getElectionResults(electionContract) { //NOTE: Avoided using this function. Instead pulled data from the backend directly.
    if (!electionContract) {
      throw new Error('Election contract not initialized')
    }
    
    try {
      // First get the position IDs
      console.log("Election contract received at Web.js", electionContract)
      const positionCount = await electionContract.methods.getPositionCount().call()
      console.log("Positions Count: ", positionCount)
      const positions = []
      
      for (let i = 0; i < positionCount; i++) {
        const positionId = await electionContract.methods.positionIds(i).call()
        console.log("position IDs: ", positionId)
        positions.push(parseInt(positionId))
      }

      console.log("Positions: ", positions)
      
      // For each position, get the candidates and their vote counts
      const results = {}
      
      for (const positionId of positions) {
        const candidateCount = await electionContract.methods.getCandidateCount(positionId).call()
        const positionResults = []
        
        for (let i = 0; i < candidateCount; i++) {
          const candidateId = await electionContract.methods.getPositionCandidate(positionId, i).call()
          console.log("Candidate Ids: ", candidateId)
          const votes = await electionContract.methods.getCandidateVotes(positionId, candidateId).call()
          console.log("Votes: ", votes)
          
          positionResults.push({
            candidateId: parseInt(candidateId),
            votes: parseInt(votes)
          })
          console.log("Position Results: ", positionResults)
        }
        
        results[positionId] = positionResults

      }
      console.log(results)      
      return results
    } catch (error) {
      console.error('Error getting election results:', error)
      throw error
    }
  },
  
  /**
   * Set the election phase in the contract
   */
  async validatePositionsHaveCandidates(electionContract) {
    const positionCount = await electionContract.methods.getPositionCount().call();
    for (let i = 0; i < positionCount; i++) {
      const candidateCount = await electionContract.methods.getCandidateCount(i).call();
      if (candidateCount === 0) {
        throw new Error(`Position ${i} does not have any candidates.`);
      } //NOTE: Continue here.
    }
  },

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
