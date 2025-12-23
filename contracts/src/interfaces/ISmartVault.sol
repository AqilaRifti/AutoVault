// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ISmartVault
 * @notice Interface for the SmartVault contract managing user buckets
 */
interface ISmartVault {
    /// @notice Bucket data structure
    struct Bucket {
        string name;
        uint256 targetPercentage; // basis points (10000 = 100%)
        uint256 balance;
        string color;
        bool isActive;
    }

    /// @notice Emitted when a new bucket is created
    event BucketCreated(
        address indexed user,
        uint256 indexed bucketId,
        string name,
        uint256 targetPercentage
    );

    /// @notice Emitted when funds are deposited
    event Deposited(address indexed user, uint256 amount);

    /// @notice Emitted when funds are withdrawn from a bucket
    event Withdrawn(
        address indexed user,
        uint256 indexed bucketId,
        uint256 amount
    );

    /// @notice Emitted when buckets are rebalanced
    event Rebalanced(address indexed user, uint256 totalBalance);

    /// @notice Emitted when funds are transferred between buckets
    event TransferredBetweenBuckets(
        address indexed user,
        uint256 indexed fromBucketId,
        uint256 indexed toBucketId,
        uint256 amount
    );

    /// @notice Creates a new bucket for the caller
    function createBucket(
        string calldata name,
        uint256 percentage,
        string calldata color
    ) external returns (uint256);

    /// @notice Deposits MNEE and distributes to buckets
    function deposit(uint256 amount) external;

    /// @notice Withdraws from a specific bucket
    function withdrawFromBucket(uint256 bucketId, uint256 amount) external;

    /// @notice Rebalances all buckets to target percentages
    function rebalanceBuckets() external;

    /// @notice Transfers funds between buckets
    function transferBetweenBuckets(
        uint256 fromBucketId,
        uint256 toBucketId,
        uint256 amount
    ) external;

    /// @notice Gets bucket data for a user
    function getBucket(
        address user,
        uint256 bucketId
    ) external view returns (Bucket memory);

    /// @notice Gets total balance across all buckets
    function getTotalBalance(address user) external view returns (uint256);

    /// @notice Gets the number of buckets for a user
    function getBucketCount(address user) external view returns (uint256);
}
