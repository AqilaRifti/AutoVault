# AutoVault 🏦

**Programmable Savings for the MNEE Economy**

AutoVault transforms how you save with smart buckets, automated DCA, goal tracking, and AI-powered financial advice - all built on MNEE stablecoin.

![AutoVault Dashboard](https://via.placeholder.com/800x400?text=AutoVault+Dashboard)

## Features

🪣 **Smart Buckets** - Auto-split deposits into customizable categories  
📈 **DCA Strategies** - Automated dollar-cost averaging via Uniswap V3  
🎯 **Goal-Based Savings** - Lock funds with milestone celebrations  
🤖 **AI Advisor** - Cerebras-powered personalized financial guidance  

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- MetaMask wallet

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/autovault.git
cd autovault

# Install frontend dependencies
cd frontend
pnpm install

# Set up environment
cp env.example.txt .env
# Edit .env with your keys

# Run development server
pnpm dev
```

Open http://localhost:3000

### Smart Contracts

```bash
cd contracts
pnpm install

# Set up environment
cp .env.example .env
# Add your PRIVATE_KEY and RPC URL

# Run tests
pnpm hardhat test

# Deploy to Sepolia
pnpm hardhat run scripts/deploy.ts --network sepolia
```

## Environment Variables

### Frontend (`frontend/.env`)

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
CEREBRAS_API_KEYS=key1,key2,key3
```

### Contracts (`contracts/.env`)

```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-key
PRIVATE_KEY=your-private-key
MNEE_ADDRESS=0xB69a340155d16D963A8173Cb3A6cBF4093aB26E9
```

## Deployed Contracts (Sepolia)

| Contract | Address |
|----------|---------|
| MNEE (ERC-1155) | `0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF` |
| SmartVault | *Redeploy needed* |
| GoalLocker | *Redeploy needed* |
| DCAExecutor | *Redeploy needed* |

> **Note:** Contracts need to be redeployed to use the official MNEE ERC-1155 token.

## Tech Stack

**Frontend**
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Wagmi + Viem + RainbowKit
- Framer Motion

**Smart Contracts**
- Solidity 0.8.20
- Hardhat
- OpenZeppelin (ERC-1155 support)

**AI**
- Cerebras API

**Database**
- Supabase

## Project Structure

```
autovault/
├── frontend/           # Next.js app
│   ├── src/
│   │   ├── app/       # Pages and routes
│   │   ├── components/# React components
│   │   ├── hooks/     # Custom hooks
│   │   └── lib/       # Utilities
│   └── package.json
├── contracts/          # Solidity contracts
│   ├── src/           # Contract source
│   ├── test/          # Tests
│   └── scripts/       # Deploy scripts
├── architecture.md    # Technical docs
├── demo.md           # Demo script
└── pitch.md          # Pitch deck
```

## Usage

1. **Connect Wallet** - Click connect and select MetaMask
2. **Get Test MNEE** - Click "Get Test MNEE" on dashboard
3. **Create Buckets** - Set up savings categories with percentages
4. **Deposit** - Approve and deposit MNEE (auto-distributes)
5. **Create Goals** - Set savings targets with deadlines
6. **Set Up DCA** - Configure automated investing
7. **Ask AI** - Get personalized financial advice

## Contributing

PRs welcome! Please read our contributing guidelines first.

## License

MIT

---

Built with ❤️ for the MNEE Hackathon
