export const DCA_EXECUTOR_ABI = [
    // Events
    {
        type: 'event',
        name: 'StrategyCreated',
        inputs: [
            { name: 'user', type: 'address', indexed: true },
            { name: 'strategyId', type: 'uint256', indexed: true },
            { name: 'tokenOut', type: 'address', indexed: false },
            { name: 'amountPerInterval', type: 'uint256', indexed: false },
            { name: 'intervalSeconds', type: 'uint256', indexed: false },
        ],
    },
    {
        type: 'event',
        name: 'DCAExecuted',
        inputs: [
            { name: 'user', type: 'address', indexed: true },
            { name: 'strategyId', type: 'uint256', indexed: true },
            { name: 'amountIn', type: 'uint256', indexed: false },
            { name: 'amountOut', type: 'uint256', indexed: false },
        ],
    },
    {
        type: 'event',
        name: 'StrategyPaused',
        inputs: [
            { name: 'user', type: 'address', indexed: true },
            { name: 'strategyId', type: 'uint256', indexed: true },
        ],
    },
    {
        type: 'event',
        name: 'StrategyResumed',
        inputs: [
            { name: 'user', type: 'address', indexed: true },
            { name: 'strategyId', type: 'uint256', indexed: true },
        ],
    },
    {
        type: 'event',
        name: 'StrategyCancelled',
        inputs: [
            { name: 'user', type: 'address', indexed: true },
            { name: 'strategyId', type: 'uint256', indexed: true },
            { name: 'refundAmount', type: 'uint256', indexed: false },
        ],
    },
    {
        type: 'event',
        name: 'FundsAllocated',
        inputs: [
            { name: 'user', type: 'address', indexed: true },
            { name: 'amount', type: 'uint256', indexed: false },
        ],
    },
    {
        type: 'event',
        name: 'FundsWithdrawn',
        inputs: [
            { name: 'user', type: 'address', indexed: true },
            { name: 'amount', type: 'uint256', indexed: false },
        ],
    },
    // Read functions
    {
        type: 'function',
        name: 'getStrategy',
        stateMutability: 'view',
        inputs: [
            { name: 'user', type: 'address' },
            { name: 'strategyId', type: 'uint256' },
        ],
        outputs: [
            {
                name: '',
                type: 'tuple',
                components: [
                    { name: 'tokenOut', type: 'address' },
                    { name: 'amountPerInterval', type: 'uint256' },
                    { name: 'intervalSeconds', type: 'uint256' },
                    { name: 'lastExecution', type: 'uint256' },
                    { name: 'totalInvested', type: 'uint256' },
                    { name: 'totalReceived', type: 'uint256' },
                    { name: 'slippageTolerance', type: 'uint16' },
                    { name: 'isActive', type: 'bool' },
                ],
            },
        ],
    },
    {
        type: 'function',
        name: 'getAllStrategies',
        stateMutability: 'view',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [
            {
                name: '',
                type: 'tuple[]',
                components: [
                    { name: 'tokenOut', type: 'address' },
                    { name: 'amountPerInterval', type: 'uint256' },
                    { name: 'intervalSeconds', type: 'uint256' },
                    { name: 'lastExecution', type: 'uint256' },
                    { name: 'totalInvested', type: 'uint256' },
                    { name: 'totalReceived', type: 'uint256' },
                    { name: 'slippageTolerance', type: 'uint16' },
                    { name: 'isActive', type: 'bool' },
                ],
            },
        ],
    },
    {
        type: 'function',
        name: 'getStrategyCount',
        stateMutability: 'view',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        type: 'function',
        name: 'getAllocatedFunds',
        stateMutability: 'view',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        type: 'function',
        name: 'isDue',
        stateMutability: 'view',
        inputs: [
            { name: 'user', type: 'address' },
            { name: 'strategyId', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bool' }],
    },
    {
        type: 'function',
        name: 'getNextExecution',
        stateMutability: 'view',
        inputs: [
            { name: 'user', type: 'address' },
            { name: 'strategyId', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        type: 'function',
        name: 'mneeToken',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'address' }],
    },
    {
        type: 'function',
        name: 'mneeTokenId',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        type: 'function',
        name: 'MIN_INTERVAL',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
    // Write functions
    {
        type: 'function',
        name: 'allocateFunds',
        stateMutability: 'nonpayable',
        inputs: [{ name: 'amount', type: 'uint256' }],
        outputs: [],
    },
    {
        type: 'function',
        name: 'withdrawFunds',
        stateMutability: 'nonpayable',
        inputs: [{ name: 'amount', type: 'uint256' }],
        outputs: [],
    },
    {
        type: 'function',
        name: 'createDCAStrategy',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'tokenOut', type: 'address' },
            { name: 'amountPerInterval', type: 'uint256' },
            { name: 'intervalSeconds', type: 'uint256' },
            { name: 'slippageTolerance', type: 'uint16' },
        ],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        type: 'function',
        name: 'executeDCA',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'user', type: 'address' },
            { name: 'strategyId', type: 'uint256' },
        ],
        outputs: [],
    },
    {
        type: 'function',
        name: 'pauseStrategy',
        stateMutability: 'nonpayable',
        inputs: [{ name: 'strategyId', type: 'uint256' }],
        outputs: [],
    },
    {
        type: 'function',
        name: 'resumeStrategy',
        stateMutability: 'nonpayable',
        inputs: [{ name: 'strategyId', type: 'uint256' }],
        outputs: [],
    },
    {
        type: 'function',
        name: 'cancelStrategy',
        stateMutability: 'nonpayable',
        inputs: [{ name: 'strategyId', type: 'uint256' }],
        outputs: [],
    },
] as const;
