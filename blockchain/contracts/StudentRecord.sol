// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract StudentRecord {
    address public owner;

    // Mapping from studentId to a cryptographic hash
    mapping(string => string) private records;

    // Event to log when a record is added
    event RecordAdded(string studentId, string dataHash, uint256 timestamp);

    // Modifier to restrict access to the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner (admin) can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Add or update a student record hash.
     * @param studentId The unique identifier for the student.
     * @param dataHash The hash of the student data.
     */
    function addRecord(string memory studentId, string memory dataHash) public onlyOwner {
        records[studentId] = dataHash;
        
        emit RecordAdded(studentId, dataHash, block.timestamp);
    }

    /**
     * @dev Verify a student record hash.
     * @param studentId The unique identifier for the student.
     * @return The stored data hash.
     */
    function verifyRecord(string memory studentId) public view returns (string memory) {
        return records[studentId];
    }
}
