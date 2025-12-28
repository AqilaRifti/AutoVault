// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IGoalLocker.sol";

/**
 * @title GoalLocker
 * @notice Contract for managing locked savings goals with milestones
 * @dev Funds are locked until target amount reached OR deadline passed
 *      Updated to support ERC-1155 MNEE token
 */
contract GoalLocker is IGoalLocker, ReentrancyGuard, ERC1155Holder {
    /// @notice The MNEE token contract (ERC-1155)
    IERC1155 public immutable mneeToken;

    /// @notice The MNEE token ID within the ERC-1155 contract
    uint256 public immutable mneeTokenId;

    /// @notice Maximum goals per user
    uint256 public constant MAX_GOALS = 50;

    /// @notice User goals mapping: user => goalId => Goal
    mapping(address => mapping(uint256 => Goal)) private _userGoals;

    /// @notice Number of goals per user
    mapping(address => uint256) private _goalCount;

    // Custom errors
    error ZeroAmount();
    error ZeroTarget();
    error InvalidDeadline();
    error GoalNotFound(uint256 goalId);
    error GoalLocked(uint256 currentAmount, uint256 targetAmount, uint256 deadline);
    error GoalAlreadyWithdrawn();
    error MaxGoalsReached();

    /**
     * @notice Constructor
     * @param _mneeToken Address of the MNEE ERC-1155 token contract
     * @param _mneeTokenId Token ID for MNEE within the ERC-1155 contract
     */
    constructor(address _mneeToken, uint256 _mneeTokenId) {
        mneeToken = IERC1155(_mneeToken);
        mneeTokenId = _mneeTokenId;
    }

    /**
     * @inheritdoc IGoalLocker
     */
    function createGoal(
        string calldata name,
        uint256 targetAmount,
        uint256 deadline
    ) external returns (uint256) {
        if (targetAmount == 0) revert ZeroTarget();
        if (deadline != 0 && deadline <= block.timestamp) {
            revert InvalidDeadline();
        }
        if (_goalCount[msg.sender] >= MAX_GOALS) {
            revert MaxGoalsReached();
        }

        uint256 goalId = _goalCount[msg.sender];

        _userGoals[msg.sender][goalId] = Goal({
            name: name,
            targetAmount: targetAmount,
            currentAmount: 0,
            deadline: deadline,
            lastMilestone: 0,
            isCompleted: false,
            isWithdrawn: false
        });

        _goalCount[msg.sender] = goalId + 1;

        emit GoalCreated(msg.sender, goalId, name, targetAmount, deadline);
        return goalId;
    }


    /**
     * @inheritdoc IGoalLocker
     */
    function depositToGoal(uint256 goalId, uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (goalId >= _goalCount[msg.sender]) {
            revert GoalNotFound(goalId);
        }

        Goal storage goal = _userGoals[msg.sender][goalId];
        if (goal.isWithdrawn) revert GoalAlreadyWithdrawn();

        // Transfer MNEE from user using ERC-1155
        mneeToken.safeTransferFrom(msg.sender, address(this), mneeTokenId, amount, "");

        uint256 previousAmount = goal.currentAmount;
        goal.currentAmount += amount;

        emit GoalDeposit(msg.sender, goalId, amount, goal.currentAmount);

        // Check and emit milestones
        _checkMilestones(msg.sender, goalId, previousAmount, goal.currentAmount, goal.targetAmount);

        // Mark as completed if target reached
        if (goal.currentAmount >= goal.targetAmount && !goal.isCompleted) {
            goal.isCompleted = true;
        }
    }

    /**
     * @inheritdoc IGoalLocker
     */
    function withdrawGoal(uint256 goalId) external nonReentrant {
        if (goalId >= _goalCount[msg.sender]) {
            revert GoalNotFound(goalId);
        }

        Goal storage goal = _userGoals[msg.sender][goalId];
        if (goal.isWithdrawn) revert GoalAlreadyWithdrawn();

        // Check unlock conditions: target reached OR deadline passed
        bool targetReached = goal.currentAmount >= goal.targetAmount;
        bool deadlinePassed = goal.deadline != 0 && block.timestamp >= goal.deadline;

        if (!targetReached && !deadlinePassed) {
            revert GoalLocked(goal.currentAmount, goal.targetAmount, goal.deadline);
        }

        uint256 amount = goal.currentAmount;
        goal.currentAmount = 0;
        goal.isWithdrawn = true;

        // Transfer MNEE back to user using ERC-1155
        mneeToken.safeTransferFrom(address(this), msg.sender, mneeTokenId, amount, "");

        emit GoalWithdrawn(msg.sender, goalId, amount);
    }

    /**
     * @inheritdoc IGoalLocker
     */
    function checkGoalStatus(
        uint256 goalId
    ) external view returns (bool isUnlocked, uint256 progressPercent) {
        if (goalId >= _goalCount[msg.sender]) {
            revert GoalNotFound(goalId);
        }

        Goal storage goal = _userGoals[msg.sender][goalId];

        // Calculate progress percentage (0-100)
        if (goal.targetAmount > 0) {
            progressPercent = (goal.currentAmount * 100) / goal.targetAmount;
            if (progressPercent > 100) progressPercent = 100;
        }

        // Check unlock conditions
        bool targetReached = goal.currentAmount >= goal.targetAmount;
        bool deadlinePassed = goal.deadline != 0 && block.timestamp >= goal.deadline;
        isUnlocked = targetReached || deadlinePassed;
    }

    /**
     * @inheritdoc IGoalLocker
     */
    function getGoal(
        address user,
        uint256 goalId
    ) external view returns (Goal memory) {
        if (goalId >= _goalCount[user]) revert GoalNotFound(goalId);
        return _userGoals[user][goalId];
    }

    /**
     * @inheritdoc IGoalLocker
     */
    function getGoalCount(address user) external view returns (uint256) {
        return _goalCount[user];
    }

    /**
     * @notice Gets all goals for a user
     * @param user The user address
     * @return goals Array of all user goals
     */
    function getAllGoals(address user) external view returns (Goal[] memory) {
        uint256 count = _goalCount[user];
        Goal[] memory goals = new Goal[](count);

        for (uint256 i = 0; i < count; i++) {
            goals[i] = _userGoals[user][i];
        }

        return goals;
    }


    /**
     * @notice Internal function to check and emit milestone events
     * @param user The user address
     * @param goalId The goal ID
     * @param previousAmount Amount before deposit
     * @param currentAmount Amount after deposit
     * @param targetAmount Target amount for the goal
     */
    function _checkMilestones(
        address user,
        uint256 goalId,
        uint256 previousAmount,
        uint256 currentAmount,
        uint256 targetAmount
    ) internal {
        Goal storage goal = _userGoals[user][goalId];

        // Calculate previous and current progress
        uint256 prevProgress = (previousAmount * 100) / targetAmount;
        uint256 currProgress = (currentAmount * 100) / targetAmount;

        // Check each milestone
        uint8[4] memory milestones = [25, 50, 75, 100];

        for (uint256 i = 0; i < 4; i++) {
            uint8 milestone = milestones[i];
            // If we crossed this milestone and haven't emitted it yet
            if (
                prevProgress < milestone &&
                currProgress >= milestone &&
                goal.lastMilestone < milestone
            ) {
                goal.lastMilestone = milestone;
                emit MilestoneReached(user, goalId, milestone);
            }
        }
    }

    /**
     * @notice Calculates the current milestone for a goal
     * @param user The user address
     * @param goalId The goal ID
     * @return milestone Current milestone (0, 25, 50, 75, or 100)
     */
    function getCurrentMilestone(
        address user,
        uint256 goalId
    ) external view returns (uint8) {
        if (goalId >= _goalCount[user]) revert GoalNotFound(goalId);
        
        Goal storage goal = _userGoals[user][goalId];
        
        if (goal.targetAmount == 0) return 0;
        
        uint256 progress = (goal.currentAmount * 100) / goal.targetAmount;
        
        if (progress >= 100) return 100;
        if (progress >= 75) return 75;
        if (progress >= 50) return 50;
        if (progress >= 25) return 25;
        return 0;
    }

    /**
     * @notice Required override for ERC1155Holder
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155Holder) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
