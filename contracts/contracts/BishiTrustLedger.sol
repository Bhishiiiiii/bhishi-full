// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BishiTrustLedger
 * @notice Immutable record anchoring, schedule hashing & verification contract for Bishi
 * @dev Hybrid trust architecture: Records SHA-256 cryptographic hashes on Ethereum Sepolia
 */
contract BishiTrustLedger {
    address public owner;
    address public relayer;

    struct AnchoredRecord {
        bytes32 recordHash;
        string recordType; // GROUP_CREATED, PAYOUT_SCHEDULE, CONTRIBUTION, PAYOUT_CONFIRMED, DOCUMENT_HASH, DISPUTE_RESOLVED
        string groupId;
        string recordId;
        uint256 timestamp;
        address anchoredBy;
        bool exists;
    }

    struct GroupScheduleLock {
        bytes32 rulesHash;
        bytes32 scheduleHash;
        uint256 registeredAt;
        address registeredBy;
        bool isRegistered;
    }

    // Mapping from recordHash to AnchoredRecord
    mapping(bytes32 => AnchoredRecord) public records;

    // Mapping from recordId to recordHash (for reverse lookup)
    mapping(string => bytes32) public recordIdToHash;

    // Mapping from groupId to GroupScheduleLock
    mapping(string => GroupScheduleLock) public groupSchedules;

    // Array of all anchored hashes for enumeration
    bytes32[] public recordHashes;

    // Events
    event RecordAnchored(
        bytes32 indexed recordHash,
        string groupId,
        string recordId,
        string recordType,
        uint256 timestamp,
        address indexed anchoredBy
    );

    event ScheduleRegistered(
        string indexed groupId,
        bytes32 rulesHash,
        bytes32 scheduleHash,
        uint256 timestamp,
        address indexed registeredBy
    );

    event RelayerUpdated(address indexed previousRelayer, address indexed newRelayer);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier onlyAuthorized() {
        require(msg.sender == owner || msg.sender == relayer, "Unauthorized relayer or owner");
        _;
    }

    constructor(address _relayer) {
        owner = msg.sender;
        relayer = _relayer != address(0) ? _relayer : msg.sender;
    }

    function setRelayer(address _newRelayer) external onlyOwner {
        require(_newRelayer != address(0), "Invalid relayer address");
        emit RelayerUpdated(relayer, _newRelayer);
        relayer = _newRelayer;
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid owner address");
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }

    /**
     * @notice Anchors a single cryptographic hash of a Bishi event on-chain
     */
    function anchorRecord(
        string memory groupId,
        string memory recordId,
        string memory recordType,
        bytes32 recordHash
    ) public onlyAuthorized returns (bool) {
        require(recordHash != bytes32(0), "Invalid record hash");
        require(!records[recordHash].exists, "Record hash already anchored");

        records[recordHash] = AnchoredRecord({
            recordHash: recordHash,
            recordType: recordType,
            groupId: groupId,
            recordId: recordId,
            timestamp: block.timestamp,
            anchoredBy: msg.sender,
            exists: true
        });

        if (bytes(recordId).length > 0) {
            recordIdToHash[recordId] = recordHash;
        }

        recordHashes.push(recordHash);

        emit RecordAnchored(
            recordHash,
            groupId,
            recordId,
            recordType,
            block.timestamp,
            msg.sender
        );

        return true;
    }

    /**
     * @notice Anchors multiple records in a single Sepolia transaction to optimize gas
     */
    function anchorBatchRecords(
        string[] memory groupIds,
        string[] memory recordIds,
        string[] memory recordTypes,
        bytes32[] memory _recordHashes
    ) external onlyAuthorized returns (uint256 count) {
        require(
            groupIds.length == recordIds.length &&
            recordIds.length == recordTypes.length &&
            recordTypes.length == _recordHashes.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < _recordHashes.length; i++) {
            if (_recordHashes[i] != bytes32(0) && !records[_recordHashes[i]].exists) {
                anchorRecord(groupIds[i], recordIds[i], recordTypes[i], _recordHashes[i]);
                count++;
            }
        }
        return count;
    }

    /**
     * @notice Registers and locks the initial agreed rules and payout schedule of a group
     */
    function registerGroupSchedule(
        string memory groupId,
        bytes32 rulesHash,
        bytes32 scheduleHash
    ) external onlyAuthorized returns (bool) {
        require(bytes(groupId).length > 0, "Invalid group ID");
        require(rulesHash != bytes32(0), "Invalid rules hash");
        require(scheduleHash != bytes32(0), "Invalid schedule hash");
        require(!groupSchedules[groupId].isRegistered, "Schedule already locked for this group");

        groupSchedules[groupId] = GroupScheduleLock({
            rulesHash: rulesHash,
            scheduleHash: scheduleHash,
            registeredAt: block.timestamp,
            registeredBy: msg.sender,
            isRegistered: true
        });

        emit ScheduleRegistered(groupId, rulesHash, scheduleHash, block.timestamp, msg.sender);
        return true;
    }

    /**
     * @notice Public verification endpoint for any member, organizer, or auditor
     */
    function verifyRecord(bytes32 recordHash)
        external
        view
        returns (
            bool isValid,
            string memory groupId,
            string memory recordId,
            string memory recordType,
            uint256 timestamp,
            address anchoredBy
        )
    {
        AnchoredRecord memory rec = records[recordHash];
        if (rec.exists) {
            return (true, rec.groupId, rec.recordId, rec.recordType, rec.timestamp, rec.anchoredBy);
        }
        return (false, "", "", "", 0, address(0));
    }

    /**
     * @notice Reverse lookup to verify by recordId
     */
    function verifyRecordById(string memory recordId)
        external
        view
        returns (
            bool isValid,
            bytes32 recordHash,
            string memory groupId,
            string memory recordType,
            uint256 timestamp
        )
    {
        bytes32 hash = recordIdToHash[recordId];
        if (hash != bytes32(0) && records[hash].exists) {
            AnchoredRecord memory rec = records[hash];
            return (true, hash, rec.groupId, rec.recordType, rec.timestamp);
        }
        return (false, bytes32(0), "", "", 0);
    }

    /**
     * @notice Get total number of anchored records
     */
    function totalAnchoredRecords() external view returns (uint256) {
        return recordHashes.length;
    }

    /**
     * @notice Retrieve group schedule lock status
     */
    function getGroupSchedule(string memory groupId)
        external
        view
        returns (
            bytes32 rulesHash,
            bytes32 scheduleHash,
            uint256 registeredAt,
            address registeredBy,
            bool isRegistered
        )
    {
        GroupScheduleLock memory lock = groupSchedules[groupId];
        return (
            lock.rulesHash,
            lock.scheduleHash,
            lock.registeredAt,
            lock.registeredBy,
            lock.isRegistered
        );
    }
}
