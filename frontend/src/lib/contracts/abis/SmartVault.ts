export const SMART_VAULT_ABI = [
    // Events
    {
        type: 'event',
        name: 'BucketCreated',
        inputs: [
            { name: 'user', type: 'address', indexed: true },
            { name: 'bucketId', type: 'uint256', indexed: true },
            { name: 'name', type: 'string', indexed: false },
            { name: 'targetPercentage', type: 'uint256', indexed: false },
        ],
    },
    {
        type: 'event',
        name: 'Deposited',
        inputs: [
            { name: 'user', type: 'address', indexed: true },
            { name: 'amount', type: 'uint256', indexed: false },
        ],
    },
    {
        type: 'event',
        name: 'Withdrawn',
        inputs: [
            { name: 'user', type: 'address', indexed: true },
            { name: 'bucketId', type: 'uint256', indexed: true },
            { name: 'amount', type: 'uint256', indexed: false },
        ],
    },
    {
        type: 'event',
        name: 'Rebalanced',
        inputs: [
            { name: 'user', type: 'address', indexed: true },
            { name: 'totalBalance', type: 'uint256', indexed: false },
        ],
    },
    {
        type: 'event',
        name: 'TransferredBetweenBuckets',
        inputs: [
            { name: 'user', type: 'address', indexed: true },
            { name: 'fromBucketId', type: 'uint256', indexed: true },
            { name: 'toBucketId', type: 'uint256', indexed: true },
            { name: 'amount', type: 'uint256', indexed: false },
        ],
    },
    // Read functions
    {
        type: 'function',
        name: 'getBucket',
        stateMutability: 'view',
        inputs: [
            { name: 'user', type: 'address' },
            { name: 'bucketId', type: 'uint256' },
        ],
        outputs: [
            {
                name: '',
                type: 'tuple',
                components: [
                    { name: 'name', type: 'string' },
                    { name: 'targetPercentage', type: 'uint256' },
                    { name: 'balance', type: 'uint256' },
                    { name: 'color', type: 'string' },
                    { name: 'isActive', type: 'bool' },
                ],
            },
        ],
    },
    {
        type: 'function',
        name: 'getAllBuckets',
        stateMutability: 'view',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [
            {
                name: '',
                type: 'tuple[]',
                components: [
                    { name: 'name', type: 'string' },
                    { name: 'targetPercentage', type: 'uint256' },
                    { name: 'balance', type: 'uint256' },
                    { name: 'color', type: 'string' },
                    { name: 'isActive', type: 'bool' },
                ],
            },
        ],
    },
    {
        type: 'function',
        name: 'getTotalBalance',
        stateMutability: 'view',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        type: 'function',
        name: 'getBucketCount',
        stateMutability: 'view',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        type: 'function',
        name: 'getTotalPercentage',
        stateMutability: 'view',
        inputs: [{ name: 'user', type: 'address' }],
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
        name: 'BASIS_POINTS',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
    // Write functions
    {
        type: 'function',
        name: 'createBucket',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'name', type: 'string' },
            { name: 'percentage', type: 'uint256' },
            { name: 'color', type: 'string' },
        ],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        type: 'function',
        name: 'deposit',
        stateMutability: 'nonpayable',
        inputs: [{ name: 'amount', type: 'uint256' }],
        outputs: [],
    },
    {
        type: 'function',
        name: 'withdrawFromBucket',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'bucketId', type: 'uint256' },
            { name: 'amount', type: 'uint256' },
        ],
        outputs: [],
    },
    {
        type: 'function',
        name: 'rebalanceBuckets',
        stateMutability: 'nonpayable',
        inputs: [],
        outputs: [],
    },
    {
        type: 'function',
        name: 'transferBetweenBuckets',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'fromBucketId', type: 'uint256' },
            { name: 'toBucketId', type: 'uint256' },
            { name: 'amount', type: 'uint256' },
        ],
        outputs: [],
    },
    {
        type: 'function',
        name: 'updateBucketPercentage',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'bucketId', type: 'uint256' },
            { name: 'newPercentage', type: 'uint256' },
        ],
        outputs: [],
    },
] as const;
