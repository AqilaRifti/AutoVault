// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IDCAExecutor.sol";

/**
 * @title DCAExecutor
 * @notice Contract for managing automated DCA (Dollar Cost Averaging) strategies
 * @dev Integrates with Uniswap V3 for token swaps
 */
contract DCAExecutor is IDCAExecutor, ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    /// @notice The MNEE token used as input for DCA
    IERC20 public immutable mneeToken;

    /// @notice Uniswap V3 Router address (for swaps)
    address public swapRouter;

    /// @notice Maximum strategies per user
    uint256 public constant MAX_STRATEGIES = 20;

    /// @notice Minimum interval between DCA executions (1 hour)
    uint256 public constant MIN_INTERVAL = 1 hours;

    /// @notice Maximum slippage tolerance (10%)
    uint16 public constant MAX_SLIPPAGE = 1000;

    /// @notice Default slippage tolerance (1%)
    uint16 public constant DEFAULT_SLIPPAGE = 100;

    /// @notice User strategies mapping: user => strategyId => Strategy
    mapping(address => mapping(uint256 => Strategy)) private _userStrategies;

    /// @notice Number of strategies per user
    mapping(address => uint256) private _strategyCount;

    /// @notice User allocated funds for DCA
    mapping(address => uint256) private _allocatedFunds;

    /// @notice Authorized keepers who can execute DCA
    mapping(address => bool) public authorizedKeepers;

    // Custom errors
    error ZeroAmount();
    error ZeroAddress();
    error InvalidInterval();
    error InvalidSlippage();
    error StrategyNotFound(uint256 strategyId);
    error StrategyNotActive(uint256 strategyId);
    error StrategyAlreadyActive(uint256 strategyId);
    error NotDueYet(uint256 nextExecution);
    error MaxStrategiesReached();
    error InsufficientFunds(uint256 available, uint256 required);
    error UnauthorizedKeeper();
    error SwapFailed();

    // Events
    event KeeperAuthorized(address indexed keeper, bool authorized);
    event SwapRouterUpdated(address indexed newRouter);
    event FundsAllocated(address indexed user, uint256 amount);
    event FundsWithdrawn(address indexed user, uint256 amount);

    /**
     * @notice Constructor
     * @param _mneeToken Address of the MNEE token contract
     * @param _swapRouter Address of the Uniswap V3 Router
     */
    constructor(
        address _mneeToken,
        address _swapRouter
    ) Ownable(msg.sender) {
        if (_mneeToken == address(0)) revert ZeroAddress();
        mneeToken = IERC20(_mneeToken);
        swapRouter = _swapRouter;
        
        // Owner is authorized keeper by default
        authorizedKeepers[msg.sender] = true;
    }

    /**
     * @notice Authorize or revoke a keeper
     * @param keeper Address of the keeper
     * @param authorized Whether to authorize or revoke
     */
    function setKeeper(address keeper, bool authorized) external onlyOwner {
        authorizedKeepers[keeper] = authorized;
        emit KeeperAuthorized(keeper, authorized);
    }

    /**
     * @notice Update swap router address
     * @param _swapRouter New router address
     */
    function setSwapRouter(address _swapRouter) external onlyOwner {
        swapRouter = _swapRouter;
        emit SwapRouterUpdated(_swapRouter);
    }

    /**
     * @notice Allocate funds for DCA strategies
     * @param amount Amount of MNEE to allocate
     */
    function allocateFunds(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        
        mneeToken.safeTransferFrom(msg.sender, address(this), amount);
        _allocatedFunds[msg.sender] += amount;
        
        emit FundsAllocated(msg.sender, amount);
    }

    /**
     * @notice Withdraw unallocated funds
     * @param amount Amount to withdraw
     */
    function withdrawFunds(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (_allocatedFunds[msg.sender] < amount) {
            revert InsufficientFunds(_allocatedFunds[msg.sender], amount);
        }
        
        _allocatedFunds[msg.sender] -= amount;
        mneeToken.safeTransfer(msg.sender, amount);
        
        emit FundsWithdrawn(msg.sender, amount);
    }


    /**
     * @inheritdoc IDCAExecutor
     */
    function createDCAStrategy(
        address tokenOut,
        uint256 amountPerInterval,
        uint256 intervalSeconds,
        uint16 slippageTolerance
    ) external returns (uint256) {
        if (tokenOut == address(0)) revert ZeroAddress();
        if (amountPerInterval == 0) revert ZeroAmount();
        if (intervalSeconds < MIN_INTERVAL) revert InvalidInterval();
        if (slippageTolerance > MAX_SLIPPAGE) revert InvalidSlippage();
        if (_strategyCount[msg.sender] >= MAX_STRATEGIES) {
            revert MaxStrategiesReached();
        }

        uint16 slippage = slippageTolerance == 0 ? DEFAULT_SLIPPAGE : slippageTolerance;
        uint256 strategyId = _strategyCount[msg.sender];

        _userStrategies[msg.sender][strategyId] = Strategy({
            tokenOut: tokenOut,
            amountPerInterval: amountPerInterval,
            intervalSeconds: intervalSeconds,
            lastExecution: 0,
            totalInvested: 0,
            totalReceived: 0,
            slippageTolerance: slippage,
            isActive: true
        });

        _strategyCount[msg.sender] = strategyId + 1;

        emit StrategyCreated(
            msg.sender,
            strategyId,
            tokenOut,
            amountPerInterval,
            intervalSeconds
        );

        return strategyId;
    }

    /**
     * @inheritdoc IDCAExecutor
     */
    function executeDCA(address user, uint256 strategyId) external nonReentrant {
        // Only authorized keepers or the user themselves can execute
        if (!authorizedKeepers[msg.sender] && msg.sender != user) {
            revert UnauthorizedKeeper();
        }

        if (strategyId >= _strategyCount[user]) {
            revert StrategyNotFound(strategyId);
        }

        Strategy storage strategy = _userStrategies[user][strategyId];
        
        if (!strategy.isActive) {
            revert StrategyNotActive(strategyId);
        }

        // Check if due
        uint256 nextExecution = strategy.lastExecution + strategy.intervalSeconds;
        if (strategy.lastExecution != 0 && block.timestamp < nextExecution) {
            revert NotDueYet(nextExecution);
        }

        // Check sufficient allocated funds
        if (_allocatedFunds[user] < strategy.amountPerInterval) {
            revert InsufficientFunds(_allocatedFunds[user], strategy.amountPerInterval);
        }

        // Deduct from allocated funds
        _allocatedFunds[user] -= strategy.amountPerInterval;

        // Execute swap (simplified - in production would call Uniswap)
        uint256 amountOut = _executeSwap(
            strategy.amountPerInterval,
            strategy.tokenOut,
            strategy.slippageTolerance,
            user
        );

        // Update strategy stats
        strategy.lastExecution = block.timestamp;
        strategy.totalInvested += strategy.amountPerInterval;
        strategy.totalReceived += amountOut;

        emit DCAExecuted(user, strategyId, strategy.amountPerInterval, amountOut);
    }

    /**
     * @notice Internal swap execution
     * @dev In production, this would integrate with Uniswap V3
     */
    function _executeSwap(
        uint256 amountIn,
        address tokenOut,
        uint16 slippageTolerance,
        address recipient
    ) internal returns (uint256 amountOut) {
        // For hackathon demo: simplified swap simulation
        // In production: integrate with Uniswap V3 Router
        
        if (swapRouter == address(0)) {
            // Mock swap for testing - return 1:1 ratio
            // In production, this would revert or use a DEX
            IERC20(tokenOut).safeTransfer(recipient, amountIn);
            return amountIn;
        }

        // Production implementation would:
        // 1. Approve router to spend MNEE
        // 2. Call exactInputSingle on Uniswap V3
        // 3. Verify output meets slippage requirements
        // 4. Transfer output tokens to recipient

        // Placeholder for actual swap logic
        // bytes memory swapData = abi.encodeWithSignature(
        //     "exactInputSingle((address,address,uint24,address,uint256,uint256,uint160))",
        //     address(mneeToken), tokenOut, 3000, recipient, amountIn, minAmountOut, 0
        // );
        
        return amountIn; // Simplified for demo
    }

    /**
     * @inheritdoc IDCAExecutor
     */
    function pauseStrategy(uint256 strategyId) external {
        if (strategyId >= _strategyCount[msg.sender]) {
            revert StrategyNotFound(strategyId);
        }

        Strategy storage strategy = _userStrategies[msg.sender][strategyId];
        if (!strategy.isActive) {
            revert StrategyNotActive(strategyId);
        }

        strategy.isActive = false;
        emit StrategyPaused(msg.sender, strategyId);
    }

    /**
     * @inheritdoc IDCAExecutor
     */
    function resumeStrategy(uint256 strategyId) external {
        if (strategyId >= _strategyCount[msg.sender]) {
            revert StrategyNotFound(strategyId);
        }

        Strategy storage strategy = _userStrategies[msg.sender][strategyId];
        if (strategy.isActive) {
            revert StrategyAlreadyActive(strategyId);
        }

        strategy.isActive = true;
        emit StrategyResumed(msg.sender, strategyId);
    }

    /**
     * @inheritdoc IDCAExecutor
     */
    function cancelStrategy(uint256 strategyId) external nonReentrant {
        if (strategyId >= _strategyCount[msg.sender]) {
            revert StrategyNotFound(strategyId);
        }

        Strategy storage strategy = _userStrategies[msg.sender][strategyId];
        
        // Mark as inactive
        strategy.isActive = false;

        // Refund allocated funds (user can withdraw separately)
        uint256 refundAmount = _allocatedFunds[msg.sender];
        
        emit StrategyCancelled(msg.sender, strategyId, refundAmount);
    }

    /**
     * @inheritdoc IDCAExecutor
     */
    function getStrategy(
        address user,
        uint256 strategyId
    ) external view returns (Strategy memory) {
        if (strategyId >= _strategyCount[user]) {
            revert StrategyNotFound(strategyId);
        }
        return _userStrategies[user][strategyId];
    }

    /**
     * @inheritdoc IDCAExecutor
     */
    function getStrategyCount(address user) external view returns (uint256) {
        return _strategyCount[user];
    }

    /**
     * @inheritdoc IDCAExecutor
     */
    function isDue(address user, uint256 strategyId) external view returns (bool) {
        if (strategyId >= _strategyCount[user]) {
            revert StrategyNotFound(strategyId);
        }

        Strategy storage strategy = _userStrategies[user][strategyId];
        
        if (!strategy.isActive) return false;
        if (strategy.lastExecution == 0) return true;
        
        return block.timestamp >= strategy.lastExecution + strategy.intervalSeconds;
    }

    /**
     * @notice Gets all strategies for a user
     * @param user The user address
     * @return strategies Array of all user strategies
     */
    function getAllStrategies(address user) external view returns (Strategy[] memory) {
        uint256 count = _strategyCount[user];
        Strategy[] memory strategies = new Strategy[](count);

        for (uint256 i = 0; i < count; i++) {
            strategies[i] = _userStrategies[user][i];
        }

        return strategies;
    }

    /**
     * @notice Gets allocated funds for a user
     * @param user The user address
     * @return amount Allocated funds amount
     */
    function getAllocatedFunds(address user) external view returns (uint256) {
        return _allocatedFunds[user];
    }

    /**
     * @notice Gets next execution time for a strategy
     * @param user The user address
     * @param strategyId The strategy ID
     * @return timestamp Next execution timestamp (0 if never executed)
     */
    function getNextExecution(
        address user,
        uint256 strategyId
    ) external view returns (uint256) {
        if (strategyId >= _strategyCount[user]) {
            revert StrategyNotFound(strategyId);
        }

        Strategy storage strategy = _userStrategies[user][strategyId];
        
        if (strategy.lastExecution == 0) {
            return block.timestamp; // Can execute immediately
        }
        
        return strategy.lastExecution + strategy.intervalSeconds;
    }
}
