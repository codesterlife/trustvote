// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Election
 * @dev Contract for managing a single election
 */
contract Election {
    // Enum for election phases
    enum ElectionPhase { Init, Voting, Closed }
    
    // Election details
    string public title;
    uint256 public startTime;
    uint256 public endTime;
    ElectionPhase public phase;
    address public admin;
    
    // Position and candidate management
    uint256[] public positionIds;
    mapping(uint256 => uint256[]) public positionToCandidates; // positionId => candidateIds
    
    // Voter management
    mapping(address => bool) public isWhitelisted;
    mapping(address => mapping(uint256 => bool)) public hasVotedForPosition; // voter => positionId => hasVoted
    
    // Vote counting
    mapping(uint256 => mapping(uint256 => uint256)) public candidateVotes; // positionId => candidateId => voteCount
    
    // Events
    event VoterWhitelisted(address indexed voter);
    event CandidateAdded(uint256 indexed positionId, uint256 indexed candidateId);
    event VoteCast(address indexed voter, uint256 indexed positionId, uint256 indexed candidateId);
    event PhaseChanged(ElectionPhase newPhase);
    
    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    modifier inPhase(ElectionPhase _phase) {
        require(phase == _phase, "Election is not in the required phase");
        _;
    }
    
    /**
     * @dev Constructor to create a new election
     * @param _title Title of the election
     * @param _startTime Start time of the election as Unix timestamp
     * @param _endTime End time of the election as Unix timestamp
     * @param _positionIds Array of position IDs to include in the election
     * @param _admin Address of the election administrator
     */
    constructor(
        string memory _title,
        uint256 _startTime,
        uint256 _endTime,
        uint256[] memory _positionIds,
        address _admin
    ) {
        require(_startTime < _endTime, "End time must be after start time");
        
        title = _title;
        startTime = _startTime;
        endTime = _endTime;
        positionIds = _positionIds;
        admin = _admin;
        phase = ElectionPhase.Init; // Initial phase
    }
    
    /**
     * @dev Whitelist a voter to participate in the election
     * @param _voter Address of the voter to whitelist
     */
    function whitelistVoter(address _voter) public onlyAdmin {
        require(!isWhitelisted[_voter], "Voter is already whitelisted");
        isWhitelisted[_voter] = true;
        emit VoterWhitelisted(_voter);
    }
    
    /**
     * @dev Batch whitelist multiple voters
     * @param _voters Array of voter addresses to whitelist
     */
    function whitelistVoters(address[] memory _voters) public onlyAdmin {
        for (uint256 i = 0; i < _voters.length; i++) {
            if (!isWhitelisted[_voters[i]]) {
                isWhitelisted[_voters[i]] = true;
                emit VoterWhitelisted(_voters[i]);
            }
        }
    }
    
    /**
     * @dev Add a candidate to a position
     * @param _candidateId ID of the candidate to add
     * @param _positionId ID of the position the candidate is running for
     */
    function addCandidate(uint256 _candidateId, uint256 _positionId) public onlyAdmin inPhase(ElectionPhase.Init) {
        require(isValidPosition(_positionId), "Invalid position ID");
        
        // Check if candidate already exists for this position
        uint256[] memory candidates = positionToCandidates[_positionId];
        for (uint256 i = 0; i < candidates.length; i++) {
            require(candidates[i] != _candidateId, "Candidate already exists for this position");
        }
        
        // Add candidate to position
        positionToCandidates[_positionId].push(_candidateId);
        emit CandidateAdded(_positionId, _candidateId);
    }
    
    /**
     * @dev Cast a vote for a candidate in a position
     * @param _positionId ID of the position to vote for
     * @param _candidateId ID of the candidate to vote for
     */
    function vote(uint256 _positionId, uint256 _candidateId) public inPhase(ElectionPhase.Voting) {
        require(isWhitelisted[msg.sender], "Voter is not whitelisted");
        require(isValidPosition(_positionId), "Invalid position ID");
        require(!hasVotedForPosition[msg.sender][_positionId], "Voter has already voted for this position");
        require(isCandidateInPosition(_candidateId, _positionId), "Candidate is not running for this position");
        
        // Record vote
        hasVotedForPosition[msg.sender][_positionId] = true;
        candidateVotes[_positionId][_candidateId]++;
        
        emit VoteCast(msg.sender, _positionId, _candidateId);
    }
    
    /**
     * @dev Change the phase of the election
     * @param _phase New phase to set
     */
    function setElectionPhase(ElectionPhase _phase) public onlyAdmin {
        require(_phase != phase, "Already in this phase");
        
        // Additional validation based on the requested phase
        if (_phase == ElectionPhase.Voting) {
            // Can only start voting if there's at least one candidate per position
            for (uint256 i = 0; i < positionIds.length; i++) {
                require(positionToCandidates[positionIds[i]].length > 0, "All positions must have at least one candidate");
            }
        }
        
        phase = _phase;
        emit PhaseChanged(_phase);
    }
    
    /**
     * @dev Get the winner for a specific position
     * @param _positionId ID of the position to check
     * @return The ID of the winning candidate (or 0 if no votes)
     */
    function getWinner(uint256 _positionId) public view returns (uint256) {
        require(isValidPosition(_positionId), "Invalid position ID");
        
        uint256[] memory candidates = positionToCandidates[_positionId];
        uint256 winningCandidateId = 0;
        uint256 winningVoteCount = 0;
        
        for (uint256 i = 0; i < candidates.length; i++) {
            uint256 candidateId = candidates[i];
            uint256 voteCount = candidateVotes[_positionId][candidateId];
            
            if (voteCount > winningVoteCount) {
                winningVoteCount = voteCount;
                winningCandidateId = candidateId;
            }
        }
        
        return winningCandidateId;
    }
    
    /**
     * @dev Get the vote count for a specific candidate in a position
     * @param _positionId ID of the position
     * @param _candidateId ID of the candidate
     * @return The number of votes received by the candidate
     */
    function getCandidateVotes(uint256 _positionId, uint256 _candidateId) public view returns (uint256) {
        require(isValidPosition(_positionId), "Invalid position ID");
        require(isCandidateInPosition(_candidateId, _positionId), "Candidate is not running for this position");
        
        return candidateVotes[_positionId][_candidateId];
    }
    
    /**
     * @dev Check if a position ID is valid for this election
     * @param _positionId ID of the position to check
     * @return True if the position ID is valid
     */
    function isValidPosition(uint256 _positionId) public view returns (bool) {
        for (uint256 i = 0; i < positionIds.length; i++) {
            if (positionIds[i] == _positionId) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev Check if a candidate is running for a specific position
     * @param _candidateId ID of the candidate to check
     * @param _positionId ID of the position to check
     * @return True if the candidate is running for the position
     */
    function isCandidateInPosition(uint256 _candidateId, uint256 _positionId) public view returns (bool) {
        uint256[] memory candidates = positionToCandidates[_positionId];
        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i] == _candidateId) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev Get all candidates for a specific position
     * @param _positionId ID of the position
     * @return Array of candidate IDs for the position
     */
    function getCandidatesForPosition(uint256 _positionId) public view returns (uint256[] memory) {
        require(isValidPosition(_positionId), "Invalid position ID");
        return positionToCandidates[_positionId];
    }
    
    /**
     * @dev Get the number of positions in the election
     * @return The number of positions
     */
    function getPositionCount() public view returns (uint256) {
        return positionIds.length;
    }
    
    /**
     * @dev Get the candidate count for a specific position
     * @param _positionId ID of the position
     * @return The number of candidates for the position
     */
    function getCandidateCount(uint256 _positionId) public view returns (uint256) {
        require(isValidPosition(_positionId), "Invalid position ID");
        return positionToCandidates[_positionId].length;
    }
    
    /**
     * @dev Get a candidate ID for a position by index
     * @param _positionId ID of the position
     * @param _index Index of the candidate in the position's candidate array
     * @return The ID of the candidate at the specified index
     */
    function getPositionCandidate(uint256 _positionId, uint256 _index) public view returns (uint256) {
        require(isValidPosition(_positionId), "Invalid position ID");
        require(_index < positionToCandidates[_positionId].length, "Index out of bounds");
        return positionToCandidates[_positionId][_index];
    }
    
    /**
     * @dev Check if a voter has voted for a specific position
     * @param _voter Address of the voter to check
     * @param _positionId ID of the position to check
     * @return True if the voter has voted for the position
     */
    function hasVoted(address _voter, uint256 _positionId) public view returns (bool) {
        require(isValidPosition(_positionId), "Invalid position ID");
        return hasVotedForPosition[_voter][_positionId];
    }
}
