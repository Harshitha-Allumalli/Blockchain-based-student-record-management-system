// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AttendanceTracker {
    address public owner;

    struct AttendanceRecord {
        string batchId;
        string subjectId;
        string facultyId;
        string attendanceDate;
        string attendanceHash;
        uint256 timestamp;
        address recorder;
        bool exists;
    }

    // Mapping from batchId to AttendanceRecord
    mapping(string => AttendanceRecord) private records;
    
    // Array of all batch IDs for logging/iteration
    string[] private batchIds;

    // Event emitted when attendance is recorded
    event AttendanceRecorded(
        string indexed batchId,
        string subjectId,
        string facultyId,
        string attendanceDate,
        string attendanceHash,
        uint256 timestamp,
        address indexed recorder
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Record attendance hash and metadata for a batch.
     */
    function recordAttendance(
        string memory batchId,
        string memory subjectId,
        string memory facultyId,
        string memory attendanceDate,
        string memory attendanceHash
    ) public {
        require(bytes(batchId).length > 0, "Batch ID cannot be empty");
        require(bytes(attendanceHash).length > 0, "Attendance hash cannot be empty");

        if (!records[batchId].exists) {
            batchIds.push(batchId);
        }

        records[batchId] = AttendanceRecord({
            batchId: batchId,
            subjectId: subjectId,
            facultyId: facultyId,
            attendanceDate: attendanceDate,
            attendanceHash: attendanceHash,
            timestamp: block.timestamp,
            recorder: msg.sender,
            exists: true
        });

        emit AttendanceRecorded(
            batchId,
            subjectId,
            facultyId,
            attendanceDate,
            attendanceHash,
            block.timestamp,
            msg.sender
        );
    }

    /**
     * @dev Verify if a given hash matches the stored hash for a batch.
     */
    function verifyAttendance(string memory batchId, string memory inputHash) public view returns (bool) {
        if (!records[batchId].exists) return false;
        return keccak256(abi.encodePacked(records[batchId].attendanceHash)) == keccak256(abi.encodePacked(inputHash));
    }

    /**
     * @dev Get stored hash for a batch ID.
     */
    function getAttendanceHash(string memory batchId) public view returns (string memory) {
        require(records[batchId].exists, "Record does not exist");
        return records[batchId].attendanceHash;
    }

    /**
     * @dev Get detailed transaction record for a batch ID.
     */
    function getTransactionDetails(string memory batchId) public view returns (
        string memory subjectId,
        string memory facultyId,
        string memory attendanceDate,
        string memory attendanceHash,
        uint256 timestamp,
        address recorder
    ) {
        require(records[batchId].exists, "Record does not exist");
        AttendanceRecord memory rec = records[batchId];
        return (
            rec.subjectId,
            rec.facultyId,
            rec.attendanceDate,
            rec.attendanceHash,
            rec.timestamp,
            rec.recorder
        );
    }

    /**
     * @dev Get total recorded attendance batches count.
     */
    function getTotalBatches() public view returns (uint256) {
        return batchIds.length;
    }
}
