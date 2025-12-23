// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IGoalLocker
 * @notice Interface for the GoalLocker contract managing savings goals
 */
interface IGoalLocker {
    /// @notice Goal data structure
    struct Goal {
        string name;
        uint256 targetAmount;
        uint256 currentAmount;
        uint256 deadline;
        uint8 lastMilestone; // 0, 25, 50, 75, 100
        bool isCompleted;
        bool isWithdrawn;
    }

    /// @notice Emitted when a new goal is created
    event GoalCreated(
        address indexed user,
        uint256 indexed goalId,
        string name,
        uint256 targetAmount,
        uint256 deadline
    );

    /// @notice Emitted when funds are deposited to a goal
    event GoalDeposit(
        address indexed user,
        uint256 indexed goalId,
        uint256 amount,
        uint256 newTotal
    );

    /// @notice Emitted when a goal is withdrawn
    event GoalWithdrawn(
        address indexed user,
        uint256 indexed goalId,
        uint256 amount
    );

    /// @notice Emitted when a milestone is reached
    event MilestoneReached(
        address indexed user,
        uint256 indexed goalId,
        uint8 milestone
    );

    /// @notice Creates a new savings goal
    function createGoal(
        string calldata name,
        uint256 targetAmount,
        uint256 deadline
    ) external returns (uint256);

    /// @notice Deposits funds to a goal
    function depositToGoal(uint256 goalId, uint256 amount) external;

    /// @notice Withdraws funds from an unlocked goal
    function withdrawGoal(uint256 goalId) external;

    /// @notice Checks if a goal is unlocked and returns progress
    function checkGoalStatus(
        uint256 goalId
    ) external view returns (bool isUnlocked, uint256 progressPercent);

    /// @notice Gets goal data
    function getGoal(
        address user,
        uint256 goalId
    ) external view returns (Goal memory);

    /// @notice Gets the number of goals for a user
    function getGoalCount(address user) external view returns (uint256);
}
