// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Election.sol";

/**
 * @title ElectionFactory
 * @dev Handles the creation of new elections
 */
contract ElectionFactory {
    // Array to store all created election addresses
    address[] public deployedElections;
    
    // Mapping to link election IDs to contract addresses
    mapping(uint256 => address) public electionAddresses;
    
    // Admin addresses that can create elections
    mapping(address => bool) public admins;
    
    // Owner of the factory
    address public owner;
    
    // Events
    event ElectionCreated(address electionAddress, uint256 electionId, string title);
    event AdminAdded(address admin);
    event AdminRemoved(address admin);
    
    constructor() {
        owner = msg.sender;
        admins[msg.sender] = true;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    modifier onlyAdmin() {
        require(admins[msg.sender], "Only admins can perform this action");
        _;
    }
    
    /**
     * @dev Add a new admin
     * @param admin Address of the new admin
     */
    function addAdmin(address admin) public onlyOwner {
        admins[admin] = true;
        emit AdminAdded(admin);
    }
    
    /**
     * @dev Remove an admin
     * @param admin Address of the admin to remove
     */
    function removeAdmin(address admin) public onlyOwner {
        require(admin != owner, "Cannot remove owner as admin");
        admins[admin] = false;
        emit AdminRemoved(admin);
    }
    
    /**
     * @dev Create a new election
     * @param electionId ID of the election (from Django backend)
     * @param title Title of the election
     * @param description Description of the election
     * @param startTime Start timestamp for the voting period
     * @param endTime End timestamp for the voting period
     */
    function createElection(
        uint256 electionId,
        string memory title,
        string memory description,
        uint256 startTime,
        uint256 endTime
    ) public onlyAdmin {
        require(electionAddresses[electionId] == address(0), "Election ID already exists");
        require(endTime > startTime, "End time must be after start time");
        
        // Create new election contract
        Election newElection = new Election(
            electionId,
            title,
            description,
            startTime,
            endTime,
            msg.sender
        );
        
        // Store the election address
        address electionAddress = address(newElection);
        deployedElections.push(electionAddress);
        electionAddresses[electionId] = electionAddress;
        
        emit ElectionCreated(electionAddress, electionId, title);
    }
    
    /**
     * @dev Get all deployed elections
     * @return Array of election contract addresses
     */
    function getDeployedElections() public view returns (address[] memory) {
        return deployedElections;
    }
    
    /**
     * @dev Get election address by ID
     * @param electionId ID of the election
     * @return Election contract address
     */
    function getElectionAddress(uint256 electionId) public view returns (address) {
        return electionAddresses[electionId];
    }
    
    /**
     * @dev Check if address is an admin
     * @param admin Address to check
     * @return True if address is an admin
     */
    function isAdmin(address admin) public view returns (bool) {
        return admins[admin];
    }
}
