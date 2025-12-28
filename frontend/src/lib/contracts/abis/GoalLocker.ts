export const GOAL_LOCKER_ABI = [
    // Events
    {
        type: 'event',
        name: 'GoalCreated',
        inputs: [
            { name: 'user', type: 'address', indexed: true },
            { name: 'goalId', type: 'uint256', indexed: true },
            { name: 'name', type: 'string', indexed: false },
            { name: 'targetAmount', type: 'uint256', indexed: false },
            { name: 'deadline', type: 'uint256', indexed: false },
        ],
    },
    {
        type: 'event',
        name: 'GoalDeposit',
        inputs: [
            { name: 'user', type: 'address', indexed: true },
            { name: 'goalId', type: 'uint256', indexed: true },
            { name: 'amount', type: 'uint256', indexed: false },
            { name: 'newTotal', type: 'uint256', indexed: false },
        ],
    },
    {
        type: 'event',
        name: 'GoalWithdrawn',
        inputs: [
            { name: 'user', type: 'address', indexed: true },
            { name: 'goalId', type: 'uint256', indexed: true },
            { name: 'amount', type: 'uint256', indexed: false },
        ],
    },
    {
        type: 'event',
        name: 'MilestoneReached',
        inputs: [
            { name: 'user', type: 'address', indexed: true },
            { name: 'goalId', type: 'uint256', indexed: true },
            { name: 'milestone', type: 'uint8', indexed: false },
        ],
    },
    // Read functions
    {
        type: 'function',
        name: 'getGoal',
        stateMutability: 'view',
        inputs: [
            { name: 'user', type: 'address' },
            { name: 'goalId', type: 'uint256' },
        ],
        outputs: [
            {
                name: '',
                type: 'tuple',
                components: [
                    { name: 'name', type: 'string' },
                    { name: 'targetAmount', type: 'uint256' },
                    { name: 'currentAmount', type: 'uint256' },
                    { name: 'deadline', type: 'uint256' },
                    { name: 'lastMilestone', type: 'uint8' },
                    { name: 'isCompleted', type: 'bool' },
                    { name: 'isWithdrawn', type: 'bool' },
                ],
            },
        ],
    },
    {
        type: 'function',
        name: 'getAllGoals',
        stateMutability: 'view',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [
            {
                name: '',
                type: 'tuple[]',
                components: [
                    { name: 'name', type: 'string' },
                    { name: 'targetAmount', type: 'uint256' },
                    { name: 'currentAmount', type: 'uint256' },
                    { name: 'deadline', type: 'uint256' },
                    { name: 'lastMilestone', type: 'uint8' },
                    { name: 'isCompleted', type: 'bool' },
                    { name: 'isWithdrawn', type: 'bool' },
                ],
            },
        ],
    },
    {
        type: 'function',
        name: 'getGoalCount',
        stateMutability: 'view',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        type: 'function',
        name: 'checkGoalStatus',
        stateMutability: 'view',
        inputs: [{ name: 'goalId', type: 'uint256' }],
        outputs: [
            { name: 'isUnlocked', type: 'bool' },
            { name: 'progressPercent', type: 'uint256' },
        ],
    },
    {
        type: 'function',
        name: 'getCurrentMilestone',
        stateMutability: 'view',
        inputs: [
            { name: 'user', type: 'address' },
            { name: 'goalId', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'uint8' }],
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
    // Write functions
    {
        type: 'function',
        name: 'createGoal',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'name', type: 'string' },
            { name: 'targetAmount', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        type: 'function',
        name: 'depositToGoal',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'goalId', type: 'uint256' },
            { name: 'amount', type: 'uint256' },
        ],
        outputs: [],
    },
    {
        type: 'function',
        name: 'withdrawGoal',
        stateMutability: 'nonpayable',
        inputs: [{ name: 'goalId', type: 'uint256' }],
        outputs: [],
    },
] as const;
