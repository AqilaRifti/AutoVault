# AutoVault Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │Dashboard │ │ Buckets  │ │  Goals   │ │   DCA    │           │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │
│       │            │            │            │                   │
│  ┌────┴────────────┴────────────┴────────────┴────┐             │
│  │              React Hooks Layer                  │             │
│  │  useSmartVault | useGoals | useDCA | useMNEE   │             │
│  └────────────────────┬───────────────────────────┘             │
│                       │                                          │
│  ┌────────────────────┴───────────────────────────┐             │
│  │           Wagmi + Viem (Web3 Layer)            │             │
│  └────────────────────┬───────────────────────────┘             │
└───────────────────────┼─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Ethereum (Sepolia)                            │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ SmartVault  │  │ GoalLocker  │  │ DCAExecutor │              │
│  │             │  │             │  │             │              │
│  │ • Buckets   │  │ • Goals     │  │ • Strategies│              │
│  │ • Deposits  │  │ • Deadlines │  │ • Intervals │              │
│  │ • Rebalance │  │ • Milestones│  │ • Execution │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          │                                       │
│                   ┌──────┴──────┐                                │
│                   │    MNEE     │                                │
│                   │  (ERC-20)   │                                │
│                   └─────────────┘                                │
└─────────────────────────────────────────────────────────────────┘
```

## Smart Contracts

### SmartVault.sol
Primary savings contract managing bucket-based deposits.

```solidity
struct Bucket {
    string name;
    uint256 targetPercentage;  // Basis points (100 = 1%)
    uint256 balance;
    string color;
    bool isActive;
}

// Key Functions
- createBucket(name, percentage, color)
- deposit(amount)  // Auto-distributes to buckets
- withdrawFromBucket(bucketId, amount)
- rebalanceBuckets()
- transferBetweenBuckets(from, to, amount)
```

### GoalLocker.sol
Time-locked savings with milestone tracking.

```solidity
struct Goal {
    string name;
    uint256 targetAmount;
    uint256 currentAmount;
    uint256 deadline;
    bool isCompleted;
    bool isWithdrawn;
}

// Key Functions
- createGoal(name, target, deadline)
- depositToGoal(goalId, amount)
- withdrawGoal(goalId)  // Only if completed or past deadline
- checkGoalStatus(goalId)

// Events
- MilestoneReached(user, goalId, milestone)  // 25%, 50%, 75%, 100%
```

### DCAExecutor.sol
Automated dollar-cost averaging strategies.

```solidity
struct Strategy {
    address tokenOut;
    uint256 amountPerInterval;
    uint256 intervalSeconds;
    uint256 lastExecution;
    uint256 totalInvested;
    bool isActive;
}

// Key Functions
- createStrategy(tokenOut, amount, interval)
- executeDCA(strategyId)  // Called by keepers
- pauseStrategy(strategyId)
- cancelStrategy(strategyId)  // Refunds remaining
```

## Frontend Architecture

### Directory Structure
```
frontend/src/
├── app/
│   ├── (autovault)/      # Main app routes
│   │   ├── page.tsx      # Dashboard
│   │   ├── buckets/      # Bucket management
│   │   ├── goals/        # Goal tracking
│   │   ├── dca/          # DCA strategies
│   │   ├── advisor/      # AI chat
│   │   └── history/      # Transactions
│   └── api/
│       └── ai/           # Cerebras API route
├── components/
│   ├── autovault/        # Feature components
│   ├── ui/               # shadcn/ui components
│   └── animations/       # Framer Motion
├── hooks/
│   ├── use-smart-vault.ts
│   ├── use-goals.ts
│   ├── use-dca.ts
│   ├── use-mnee.ts
│   └── use-transactions.ts
└── lib/
    ├── contracts/        # ABIs & addresses
    ├── web3/             # Wagmi config
    ├── ai/               # Cerebras client
    └── supabase/         # Database client
```

### State Management
- **Wagmi**: Contract reads/writes with React Query caching
- **React Query**: Server state management
- **Zustand**: Client-side transaction history

### AI Integration
```typescript
// Load-balanced Cerebras API
const apiKeys = process.env.CEREBRAS_API_KEYS.split(',');
let currentKeyIndex = 0;

function getNextApiKey() {
    const key = apiKeys[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    return key;
}
```

## Security Considerations

1. **Smart Contracts**
   - OpenZeppelin base contracts
   - Reentrancy guards on all external calls
   - Owner-only admin functions
   - Slippage protection on DCA swaps

2. **Frontend**
   - No private keys stored
   - All transactions signed by user wallet
   - API keys server-side only

3. **Data**
   - Supabase RLS policies
   - Wallet-based authentication

## Deployment

### Contracts (Sepolia)
- MNEE: `0xB69a340155d16D963A8173Cb3A6cBF4093aB26E9`
- SmartVault: `0x47846df5e07ffd869C50871de328AF21D3CEF4D3`
- GoalLocker: `0xCDFdCdBbf3a11e9FA661F8DF3D1B2c6825F12252`
- DCAExecutor: `0x6602c410F6aB155BA7fBaB056CB394F21D19927C`

### Frontend
- Next.js 16 with Turbopack
- Vercel-ready deployment
