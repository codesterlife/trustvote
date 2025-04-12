import Web3 from 'web3';
import ElectionFactory from '../constants/contractABI';

// Initialize web3
const getWeb3 = () => {
  if (window.ethereum) {
    return new Web3(window.ethereum);
  } else if (window.web3) {
    return new Web3(window.web3.currentProvider);
  } else {
    throw new Error('No web3 provider detected');
  }
};

// Request account access
const requestAccounts = async () => {
  const web3 = getWeb3();
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts;
  } catch (error) {
    throw new Error('User denied account access');
  }
};

// Get accounts
const getAccounts = async () => {
  const web3 = getWeb3();
  try {
    const accounts = await web3.eth.getAccounts();
    return accounts;
  } catch (error) {
    throw new Error('Could not get accounts');
  }
};

// Get factory contract
const getFactory = async (factoryAddress) => {
  const web3 = getWeb3();
  return new web3.eth.Contract(
    ElectionFactory.abi,
    factoryAddress
  );
};

// Get election contract
const getElection = async (electionAddress, electionABI) => {
  const web3 = getWeb3();
  return new web3.eth.Contract(
    electionABI,
    electionAddress
  );
};

// Create a new election via factory
const createElection = async (factoryAddress, electionData, fromAddress) => {
  const web3 = getWeb3();
  const factory = await getFactory(factoryAddress);
  
  const { electionId, title, description, startTime, endTime } = electionData;
  
  try {
    const result = await factory.methods.createElection(
      electionId,
      title,
      description,
      Math.floor(new Date(startTime).getTime() / 1000),
      Math.floor(new Date(endTime).getTime() / 1000)
    ).send({ from: fromAddress });
    
    return result;
  } catch (error) {
    throw new Error(`Error creating election: ${error.message}`);
  }
};

// Add a position to an election
const addPosition = async (electionContract, positionId, title, fromAddress) => {
  try {
    const result = await electionContract.methods.addPosition(
      positionId,
      title
    ).send({ from: fromAddress });
    
    return result;
  } catch (error) {
    throw new Error(`Error adding position: ${error.message}`);
  }
};

// Add a candidate to a position
const addCandidate = async (electionContract, candidateId, name, positionId, partyId, fromAddress) => {
  try {
    const result = await electionContract.methods.addCandidate(
      candidateId,
      name,
      positionId,
      partyId
    ).send({ from: fromAddress });
    
    return result;
  } catch (error) {
    throw new Error(`Error adding candidate: ${error.message}`);
  }
};

// Whitelist a voter
const whitelistVoter = async (electionContract, voterAddress, fromAddress) => {
  try {
    const result = await electionContract.methods.whitelistVoter(
      voterAddress
    ).send({ from: fromAddress });
    
    return result;
  } catch (error) {
    throw new Error(`Error whitelisting voter: ${error.message}`);
  }
};

// Batch whitelist voters
const batchWhitelistVoters = async (electionContract, voterAddresses, fromAddress) => {
  try {
    const result = await electionContract.methods.batchWhitelistVoters(
      voterAddresses
    ).send({ from: fromAddress });
    
    return result;
  } catch (error) {
    throw new Error(`Error batch whitelisting voters: ${error.message}`);
  }
};

// Set election phase
const setElectionPhase = async (electionContract, phase, fromAddress) => {
  try {
    const phaseMap = {
      'init': 0,
      'voting': 1,
      'closed': 2
    };
    
    const result = await electionContract.methods.setPhase(
      phaseMap[phase]
    ).send({ from: fromAddress });
    
    return result;
  } catch (error) {
    throw new Error(`Error setting election phase: ${error.message}`);
  }
};

// Cast a vote
const castVote = async (electionContract, fromAddress, positionId, candidateId) => {
  try {
    const result = await electionContract.methods.vote(
      positionId,
      candidateId
    ).send({ from: fromAddress });
    
    return result.transactionHash;
  } catch (error) {
    throw new Error(`Error casting vote: ${error.message}`);
  }
};

// Check if voter is whitelisted
const isVoterWhitelisted = async (electionContract, voterAddress) => {
  try {
    const result = await electionContract.methods.isWhitelisted(voterAddress).call();
    return result;
  } catch (error) {
    throw new Error(`Error checking whitelist status: ${error.message}`);
  }
};

// Check if voter has voted for a position
const hasVoted = async (electionContract, voterAddress, positionId) => {
  try {
    const result = await electionContract.methods.hasVoted(voterAddress, positionId).call();
    return result;
  } catch (error) {
    throw new Error(`Error checking vote status: ${error.message}`);
  }
};

// Get votes for a candidate
const getVotesForCandidate = async (electionContract, positionId, candidateId) => {
  try {
    const result = await electionContract.methods.getVotesForCandidate(positionId, candidateId).call();
    return result;
  } catch (error) {
    throw new Error(`Error getting votes: ${error.message}`);
  }
};

// Get winner for a position
const getWinner = async (electionContract, positionId) => {
  try {
    const result = await electionContract.methods.getWinner(positionId).call();
    return { candidateId: result[0], votes: result[1] };
  } catch (error) {
    throw new Error(`Error getting winner: ${error.message}`);
  }
};

// Get all results for a position
const getResults = async (electionContract, positionId) => {
  try {
    const result = await electionContract.methods.getResults(positionId).call();
    const candidateIds = result[0];
    const votes = result[1];
    
    // Combine the arrays into an array of objects
    const results = candidateIds.map((candidateId, index) => ({
      candidateId,
      votes: votes[index]
    }));
    
    return results;
  } catch (error) {
    throw new Error(`Error getting results: ${error.message}`);
  }
};

// Get all position ids
const getPositionIds = async (electionContract) => {
  try {
    const result = await electionContract.methods.getPositionIds().call();
    return result;
  } catch (error) {
    throw new Error(`Error getting position IDs: ${error.message}`);
  }
};

// Get candidates for a position
const getCandidatesForPosition = async (electionContract, positionId) => {
  try {
    const result = await electionContract.methods.getCandidatesForPosition(positionId).call();
    return result;
  } catch (error) {
    throw new Error(`Error getting candidates: ${error.message}`);
  }
};

export default {
  getWeb3,
  requestAccounts,
  getAccounts,
  getFactory,
  getElection,
  createElection,
  addPosition,
  addCandidate,
  whitelistVoter,
  batchWhitelistVoters,
  setElectionPhase,
  castVote,
  isVoterWhitelisted,
  hasVoted,
  getVotesForCandidate,
  getWinner,
  getResults,
  getPositionIds,
  getCandidatesForPosition
};
