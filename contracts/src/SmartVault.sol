// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/ISmartVault.sol";

/**
 * @title SmartVault
 * @notice Core contract for managing user buckets and automatic fund distribution
 * @dev Implements programmable savings buckets with percentage-based allocation
 */
contract SmartVault is ISmartVault, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice The MNEE token used for deposits
    IERC20 public immutable mneeToken;

    /// @notice Basis points constant (100% = 10000)
    uint256 public constant BASIS_POINTS = 10000;

    /// @notice Maximum buckets per user
    uint256 public constant MAX_BUCKETS = 20;

    /// @notice User buckets mapping: user => bucketId => Bucket
    mapping(address => mapping(uint256 => Bucket)) private _userBuckets;

    /// @notice Number of buckets per user
    mapping(address => uint256) private _bucketCount;

    /// @notice Total balance per user (sum of all bucket balances)
    mapping(address => uint256) private _totalBalances;

    // Custom errors
    error ZeroAmount();
    error InvalidPercentage();
    error PercentageSumInvalid(uint256 currentSum, uint256 required);
    error BucketNotFound(uint256 bucketId);
    error BucketNotActive(uint256 bucketId);
    error InsufficientBucketBalance(uint256 available, uint256 requested);
    error MaxBucketsReached();
    error NoBucketsExist();
    error SameBucket();

    /**
     * @notice Constructor
     * @param _mneeToken Address of the MNEE token contract
     */
    constructor(address _mneeToken) {
        mneeToken = IERC20(_mneeToken);
    }

    /**
     * @notice Creates default buckets for a new user
     * @dev Called internally on first deposit if user has no buckets
     */
    function _createDefaultBuckets(address user) internal {
        // Savings: 40%
        _createBucketInternal(user, "Savings", 4000, "#22c55e");
        // Bills: 30%
        _createBucketInternal(user, "Bills", 3000, "#f59e0b");
        // Spending: 20%
        _createBucketInternal(user, "Spending", 2000, "#3b82f6");
        // Investment: 10%
        _createBucketInternal(user, "Investment", 1000, "#8b5cf6");
    }

    /**
     * @notice Internal bucket creation
     */
    function _createBucketInternal(
        address user,
        string memory name,
        uint256 percentage,
        string memory color
    ) internal returns (uint256) {
        uint256 bucketId = _bucketCount[user];
        
        _userBuckets[user][bucketId] = Bucket({
            name: name,
            targetPercentage: percentage,
            balance: 0,
            color: color,
            isActive: true
        });

        _bucketCount[user] = bucketId + 1;

        emit BucketCreated(user, bucketId, name, percentage);
        return bucketId;
    }

    /**
     * @inheritdoc ISmartVault
     */
    function createBucket(
        string calldata name,
        uint256 percentage,
        string calldata color
    ) external returns (uint256) {
        if (percentage == 0 || percentage > BASIS_POINTS) {
            revert InvalidPercentage();
        }
        if (_bucketCount[msg.sender] >= MAX_BUCKETS) {
            revert MaxBucketsReached();
        }

        // Calculate current total percentage
        uint256 currentTotal = _getTotalPercentage(msg.sender);
        if (currentTotal + percentage > BASIS_POINTS) {
            revert PercentageSumInvalid(currentTotal + percentage, BASIS_POINTS);
        }

        return _createBucketInternal(msg.sender, name, percentage, color);
    }


    /**
     * @inheritdoc ISmartVault
     */
    function deposit(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();

        // Create default buckets if user has none
        if (_bucketCount[msg.sender] == 0) {
            _createDefaultBuckets(msg.sender);
        }

        // Validate percentages sum to 100%
        uint256 totalPercentage = _getTotalPercentage(msg.sender);
        if (totalPercentage != BASIS_POINTS) {
            revert PercentageSumInvalid(totalPercentage, BASIS_POINTS);
        }

        // Transfer MNEE from user
        mneeToken.safeTransferFrom(msg.sender, address(this), amount);

        // Distribute to buckets based on percentages
        uint256 distributed = 0;
        uint256 bucketCount = _bucketCount[msg.sender];

        for (uint256 i = 0; i < bucketCount; i++) {
            Bucket storage bucket = _userBuckets[msg.sender][i];
            if (bucket.isActive) {
                uint256 bucketShare = (amount * bucket.targetPercentage) / BASIS_POINTS;
                
                // Last active bucket gets remainder to handle rounding
                if (i == bucketCount - 1) {
                    bucketShare = amount - distributed;
                }
                
                bucket.balance += bucketShare;
                distributed += bucketShare;
            }
        }

        _totalBalances[msg.sender] += amount;

        emit Deposited(msg.sender, amount);
    }

    /**
     * @inheritdoc ISmartVault
     */
    function withdrawFromBucket(
        uint256 bucketId,
        uint256 amount
    ) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (bucketId >= _bucketCount[msg.sender]) {
            revert BucketNotFound(bucketId);
        }

        Bucket storage bucket = _userBuckets[msg.sender][bucketId];
        if (!bucket.isActive) revert BucketNotActive(bucketId);
        if (bucket.balance < amount) {
            revert InsufficientBucketBalance(bucket.balance, amount);
        }

        bucket.balance -= amount;
        _totalBalances[msg.sender] -= amount;

        mneeToken.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, bucketId, amount);
    }

    /**
     * @inheritdoc ISmartVault
     */
    function rebalanceBuckets() external nonReentrant {
        uint256 bucketCount = _bucketCount[msg.sender];
        if (bucketCount == 0) revert NoBucketsExist();

        uint256 totalBalance = _totalBalances[msg.sender];
        if (totalBalance == 0) return;

        // Validate percentages sum to 100%
        uint256 totalPercentage = _getTotalPercentage(msg.sender);
        if (totalPercentage != BASIS_POINTS) {
            revert PercentageSumInvalid(totalPercentage, BASIS_POINTS);
        }

        // Redistribute based on target percentages
        uint256 distributed = 0;
        uint256 lastActiveBucket = 0;

        // Find last active bucket for remainder handling
        for (uint256 i = 0; i < bucketCount; i++) {
            if (_userBuckets[msg.sender][i].isActive) {
                lastActiveBucket = i;
            }
        }

        for (uint256 i = 0; i < bucketCount; i++) {
            Bucket storage bucket = _userBuckets[msg.sender][i];
            if (bucket.isActive) {
                uint256 targetBalance = (totalBalance * bucket.targetPercentage) / BASIS_POINTS;
                
                // Last active bucket gets remainder
                if (i == lastActiveBucket) {
                    targetBalance = totalBalance - distributed;
                }
                
                bucket.balance = targetBalance;
                distributed += targetBalance;
            }
        }

        emit Rebalanced(msg.sender, totalBalance);
    }

    /**
     * @inheritdoc ISmartVault
     */
    function transferBetweenBuckets(
        uint256 fromBucketId,
        uint256 toBucketId,
        uint256 amount
    ) external {
        if (amount == 0) revert ZeroAmount();
        if (fromBucketId == toBucketId) revert SameBucket();
        
        uint256 bucketCount = _bucketCount[msg.sender];
        if (fromBucketId >= bucketCount) revert BucketNotFound(fromBucketId);
        if (toBucketId >= bucketCount) revert BucketNotFound(toBucketId);

        Bucket storage fromBucket = _userBuckets[msg.sender][fromBucketId];
        Bucket storage toBucket = _userBuckets[msg.sender][toBucketId];

        if (!fromBucket.isActive) revert BucketNotActive(fromBucketId);
        if (!toBucket.isActive) revert BucketNotActive(toBucketId);
        if (fromBucket.balance < amount) {
            revert InsufficientBucketBalance(fromBucket.balance, amount);
        }

        fromBucket.balance -= amount;
        toBucket.balance += amount;

        emit TransferredBetweenBuckets(msg.sender, fromBucketId, toBucketId, amount);
    }

    /**
     * @inheritdoc ISmartVault
     */
    function getBucket(
        address user,
        uint256 bucketId
    ) external view returns (Bucket memory) {
        if (bucketId >= _bucketCount[user]) revert BucketNotFound(bucketId);
        return _userBuckets[user][bucketId];
    }

    /**
     * @inheritdoc ISmartVault
     */
    function getTotalBalance(address user) external view returns (uint256) {
        return _totalBalances[user];
    }

    /**
     * @inheritdoc ISmartVault
     */
    function getBucketCount(address user) external view returns (uint256) {
        return _bucketCount[user];
    }

    /**
     * @notice Gets all buckets for a user
     * @param user The user address
     * @return buckets Array of all user buckets
     */
    function getAllBuckets(address user) external view returns (Bucket[] memory) {
        uint256 count = _bucketCount[user];
        Bucket[] memory buckets = new Bucket[](count);
        
        for (uint256 i = 0; i < count; i++) {
            buckets[i] = _userBuckets[user][i];
        }
        
        return buckets;
    }

    /**
     * @notice Updates bucket percentage (requires rebalance after)
     * @param bucketId The bucket to update
     * @param newPercentage New target percentage in basis points
     */
    function updateBucketPercentage(
        uint256 bucketId,
        uint256 newPercentage
    ) external {
        if (bucketId >= _bucketCount[msg.sender]) {
            revert BucketNotFound(bucketId);
        }
        if (newPercentage == 0 || newPercentage > BASIS_POINTS) {
            revert InvalidPercentage();
        }

        Bucket storage bucket = _userBuckets[msg.sender][bucketId];
        if (!bucket.isActive) revert BucketNotActive(bucketId);

        uint256 currentTotal = _getTotalPercentage(msg.sender);
        uint256 newTotal = currentTotal - bucket.targetPercentage + newPercentage;
        
        if (newTotal > BASIS_POINTS) {
            revert PercentageSumInvalid(newTotal, BASIS_POINTS);
        }

        bucket.targetPercentage = newPercentage;
    }

    /**
     * @notice Internal helper to get total percentage across all active buckets
     */
    function _getTotalPercentage(address user) internal view returns (uint256) {
        uint256 total = 0;
        uint256 count = _bucketCount[user];
        
        for (uint256 i = 0; i < count; i++) {
            if (_userBuckets[user][i].isActive) {
                total += _userBuckets[user][i].targetPercentage;
            }
        }
        
        return total;
    }

    /**
     * @notice Gets total percentage for a user (external view)
     */
    function getTotalPercentage(address user) external view returns (uint256) {
        return _getTotalPercentage(user);
    }
}
