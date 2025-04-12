// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Election.sol";

/**
 * @title ElectionFactory
 * @dev Factory contract for deploying new Election contracts
 */
contract ElectionFactory {
    event ElectionCreated(address electionAddress, string title, uint256 timestamp);
    
    // Array to store all created elections
    address[] public elections;
    
    /**
     * @dev Create a new election contract and store its address
     * @param _title Title of the election
     * @param _startTime Start time of the election as Unix timestamp
     * @param _endTime End time of the election as Unix timestamp
     * @param _positionIds Array of position IDs to include in the election
     * @return The address of the created election contract
     */
    function createElection(
        string memory _title,
        uint256 _startTime,
        uint256 _endTime,
        uint256[] memory _positionIds
    ) public returns (address) {
        // Create a new Election contract
        Election newElection = new Election(
            _title,
            _startTime,
            _endTime,
            _positionIds,
            msg.sender
        );
        
        // Store the address of the new election
        address electionAddress = address(newElection);
        elections.push(electionAddress);
        
        // Emit event
        emit ElectionCreated(electionAddress, _title, block.timestamp);
        
        return electionAddress;
    }
    
    /**
     * @dev Get the number of elections created
     * @return The total number of elections
     */
    function getElectionCount() public view returns (uint256) {
        return elections.length;
    }
    
    /**
     * @dev Get an election address by index
     * @param _index Index in the elections array
     * @return The address of the election at the specified index
     */
    function getElection(uint256 _index) public view returns (address) {
        require(_index < elections.length, "Index out of bounds");
        return elections[_index];
    }
    
    /**
     * @dev Get all election addresses
     * @return An array of all election addresses
     */
    function getAllElections() public view returns (address[] memory) {
        return elections;
    }
}
