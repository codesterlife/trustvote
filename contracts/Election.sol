// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Election
 * @dev Manages a single election including positions, candidates, votes
 */
contract Election {
    // Election information
    uint256 public electionId;
    string public title;
    string public description;
    uint256 public startTime;
    uint256 public endTime;
    address public admin;
    
    // Enum for election phases
    enum Phase { Init, Voting, Closed }
    Phase public currentPhase;
    
    // Positions and candidates
    struct Position {
        uint256 id;
        string title;
        bool exists;
    }
    
    struct Candidate {
        uint256 id;
        string name;
        uint256 positionId;
        uint256 partyId;
        bool exists;
    }
    
    // Maps for positions, candidates, and votes
    mapping(uint256 => Position) public positions;
    mapping(uint256 => Candidate) public candidates;
    uint256[] public positionIds;
    mapping(uint256 => uint256[]) public positionCandidates;
    
    // Voter management
    mapping(address => bool) public isWhitelisted;
    mapping(address => mapping(uint256 => bool)) public hasVotedForPosition;
    
    // Vote tallying
    mapping(uint256 => mapping(uint256 => uint256)) public votesForCandidate; // positionId => candidateId => vote count
    
    // Events
    event PositionAdded(uint256 positionId, string title);
    event CandidateAdded(uint256 candidateId, string name, uint256 positionId, uint256 partyId);
    event VoterWhitelisted(address voter);
    event VoteCast(address voter, uint256 positionId, uint256 candidateId);
    event PhaseChanged(Phase newPhase);
    
    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier inPhase(Phase phase) {
        require(currentPhase == phase, "Action not allowed in current phase");
        _;
    }
    
    modifier duringVotingPeriod() {
        require(currentPhase == Phase.Voting, "Voting is not active");
        require(block.timestamp >= startTime, "Voting has not started yet");
        require(block.timestamp <= endTime, "Voting has ended");
        _;
    }
    
    constructor(
        uint256 _electionId,
        string memory _title,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        address _admin
    ) {
        electionId = _electionId;
        title = _title;
        description = _description;
        startTime = _startTime;
        endTime = _endTime;
        admin = _admin;
        currentPhase = Phase.Init;
    }
    
    /**
     * @dev Add a new position to the election
     * @param positionId ID of the position
     * @param positionTitle Title of the position
     */
    function addPosition(uint256 positionId, string memory positionTitle) public onlyAdmin inPhase(Phase.Init) {
        require(!positions[positionId].exists, "Position ID already exists");
        
        positions[positionId] = Position({
            id: positionId,
            title: positionTitle,
            exists: true
        });
        
        positionIds.push(positionId);
        emit PositionAdded(positionId, positionTitle);
    }
    
    /**
     * @dev Add a new candidate to a position
     * @param candidateId ID of the candidate
     * @param candidateName Name of the candidate
     * @param positionId Position ID the candidate is running for
     * @param partyId ID of the candidate's party
     */
    function addCandidate(
        uint256 candidateId,
        string memory candidateName,
        uint256 positionId,
        uint256 partyId
    ) public onlyAdmin inPhase(Phase.Init) {
        require(!candidates[candidateId].exists, "Candidate ID already exists");
        require(positions[positionId].exists, "Position does not exist");
        
        candidates[candidateId] = Candidate({
            id: candidateId,
            name: candidateName,
            positionId: positionId,
            partyId: partyId,
            exists: true
        });
        
        positionCandidates[positionId].push(candidateId);
        emit CandidateAdded(candidateId, candidateName, positionId, partyId);
    }
    
    /**
     * @dev Whitelist a voter to participate in the election
     * @param voter Address of the voter to whitelist
     */
    function whitelistVoter(address voter) public onlyAdmin {
        isWhitelisted[voter] = true;
        emit VoterWhitelisted(voter);
    }
    
    /**
     * @dev Whitelist multiple voters in a single transaction
     * @param voters Array of voter addresses to whitelist
     */
    function batchWhitelistVoters(address[] memory voters) public onlyAdmin {
        for (uint i = 0; i < voters.length; i++) {
            isWhitelisted[voters[i]] = true;
            emit VoterWhitelisted(voters[i]);
        }
    }
    
    /**
     * @dev Change the phase of the election
     * @param newPhase Phase to transition to
     */
    function setPhase(Phase newPhase) public onlyAdmin {
        // Cannot go back to Init phase once moved to Voting
        if (currentPhase == Phase.Voting && newPhase == Phase.Init) {
            revert("Cannot return to initialization phase");
        }
        
        // Cannot go from Closed to any other phase
        if (currentPhase == Phase.Closed) {
            revert("Election is closed and cannot be reopened");
        }
        
        currentPhase = newPhase;
        emit PhaseChanged(newPhase);
    }
    
    /**
     * @dev Cast a vote for a candidate
     * @param positionId ID of the position being voted for
     * @param candidateId ID of the candidate being voted for
     */
    function vote(uint256 positionId, uint256 candidateId) public duringVotingPeriod {
        require(isWhitelisted[msg.sender], "Voter is not whitelisted");
        require(!hasVotedForPosition[msg.sender][positionId], "Already voted for this position");
        require(positions[positionId].exists, "Position does not exist");
        require(candidates[candidateId].exists, "Candidate does not exist");
        require(candidates[candidateId].positionId == positionId, "Candidate not in specified position");
        
        hasVotedForPosition[msg.sender][positionId] = true;
        votesForCandidate[positionId][candidateId]++;
        
        emit VoteCast(msg.sender, positionId, candidateId);
    }
    
    /**
     * @dev Get the number of votes for a specific candidate
     * @param positionId ID of the position
     * @param candidateId ID of the candidate
     * @return Number of votes for the candidate
     */
    function getVotesForCandidate(uint256 positionId, uint256 candidateId) public view returns (uint256) {
        return votesForCandidate[positionId][candidateId];
    }
    
    /**
     * @dev Get all candidates for a position
     * @param positionId ID of the position
     * @return Array of candidate IDs for the position
     */
    function getCandidatesForPosition(uint256 positionId) public view returns (uint256[] memory) {
        return positionCandidates[positionId];
    }
    
    /**
     * @dev Get all position IDs in the election
     * @return Array of position IDs
     */
    function getPositionIds() public view returns (uint256[] memory) {
        return positionIds;
    }
    
    /**
     * @dev Get the winner for a position
     * @param positionId ID of the position
     * @return Candidate ID of the winner and the number of votes
     */
    function getWinner(uint256 positionId) public view returns (uint256, uint256) {
        require(currentPhase == Phase.Closed, "Results not available until election is closed");
        require(positions[positionId].exists, "Position does not exist");
        
        uint256[] memory candidateIds = positionCandidates[positionId];
        uint256 maxVotes = 0;
        uint256 winningCandidateId = 0;
        
        for (uint i = 0; i < candidateIds.length; i++) {
            uint256 candidateId = candidateIds[i];
            uint256 votes = votesForCandidate[positionId][candidateId];
            
            if (votes > maxVotes) {
                maxVotes = votes;
                winningCandidateId = candidateId;
            }
        }
        
        return (winningCandidateId, maxVotes);
    }
    
    /**
     * @dev Get results for all candidates in a position
     * @param positionId ID of the position
     * @return Arrays of candidate IDs and vote counts
     */
    function getResults(uint256 positionId) public view returns (uint256[] memory, uint256[] memory) {
        require(positions[positionId].exists, "Position does not exist");
        
        uint256[] memory candidateIds = positionCandidates[positionId];
        uint256[] memory votes = new uint256[](candidateIds.length);
        
        for (uint i = 0; i < candidateIds.length; i++) {
            votes[i] = votesForCandidate[positionId][candidateIds[i]];
        }
        
        return (candidateIds, votes);
    }
    
    /**
     * @dev Check if a voter has already voted for a position
     * @param voter Address of the voter
     * @param positionId ID of the position
     * @return True if voter has already cast a vote for this position
     */
    function hasVoted(address voter, uint256 positionId) public view returns (bool) {
        return hasVotedForPosition[voter][positionId];
    }
}
