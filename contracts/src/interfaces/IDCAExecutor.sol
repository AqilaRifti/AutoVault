// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IDCAExecutor
 * @notice Interface for the DCAExecutor contract managing DCA strategies
 */
interface IDCAExecutor {
    /// @notice DCA Strategy data structure
    struct Strategy {
        address tokenOut;
        uint256 amountPerInterval;
        uint256 intervalSeconds;
        uint256 lastExecution;
        uint256 totalInvested;
        uint256 totalReceived;
        uint16 slippageTolerance; // basis points (100 = 1%)
        bool isActive;
    }

    /// @notice Emitted when a new strategy is created
    event StrategyCreated(
        address indexed user,
        uint256 indexed strategyId,
        address tokenOut,
        uint256 amountPerInterval,
        uint256 intervalSeconds
    );

    /// @notice Emitted when a DCA is executed
    event DCAExecuted(
        address indexed user,
        uint256 indexed strategyId,
        uint256 amountIn,
        uint256 amountOut
    );

    /// @notice Emitted when a strategy is paused
    event StrategyPaused(address indexed user, uint256 indexed strategyId);

    /// @notice Emitted when a strategy is resumed
    event StrategyResumed(address indexed user, uint256 indexed strategyId);

    /// @notice Emitted when a strategy is cancelled
    event StrategyCancelled(
        address indexed user,
        uint256 indexed strategyId,
        uint256 refundAmount
    );

    /// @notice Creates a new DCA strategy
    function createDCAStrategy(
        address tokenOut,
        uint256 amountPerInterval,
        uint256 intervalSeconds,
        uint16 slippageTolerance
    ) external returns (uint256);

    /// @notice Executes a DCA for a user (called by keeper/automation)
    function executeDCA(address user, uint256 strategyId) external;

    /// @notice Pauses a strategy
    function pauseStrategy(uint256 strategyId) external;

    /// @notice Resumes a paused strategy
    function resumeStrategy(uint256 strategyId) external;

    /// @notice Cancels a strategy and refunds remaining funds
    function cancelStrategy(uint256 strategyId) external;

    /// @notice Gets strategy data
    function getStrategy(
        address user,
        uint256 strategyId
    ) external view returns (Strategy memory);

    /// @notice Gets the number of strategies for a user
    function getStrategyCount(address user) external view returns (uint256);

    /// @notice Checks if a strategy is due for execution
    function isDue(
        address user,
        uint256 strategyId
    ) external view returns (bool);
}
