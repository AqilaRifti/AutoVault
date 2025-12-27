# AutoVault - MNEE Hackathon Submission

## Inspiration

We noticed that while DeFi offers incredible financial tools, most people still struggle with basic savings habits. Traditional banking apps are passive - you deposit money and hope for the best. Meanwhile, powerful DeFi primitives like automated investing (DCA) and goal-based savings exist but are scattered across complex protocols that intimidate everyday users.

We asked: **What if saving money was as easy as setting up a Spotify playlist?** What if your deposits automatically organized themselves, your investments ran on autopilot, and an AI coach helped you make smarter decisions?

That's AutoVault - programmable savings that works while you sleep.

## What it does

AutoVault is a comprehensive savings platform built on MNEE stablecoin with four core features:

**🪣 Smart Buckets** - Create named savings categories (Emergency Fund, Vacation, Investment) with target percentages. Every deposit automatically splits across your buckets. No more manual transfers between accounts.

**🎯 Goal-Based Savings** - Set savings goals with target amounts and deadlines. Funds are locked until you reach your goal, with celebration animations at 25%, 50%, 75%, and 100% milestones to keep you motivated.

**📈 DCA Strategies** - Set up dollar-cost averaging into any token. Choose your amount and frequency, and AutoVault handles the rest via Uniswap V3 integration. Remove emotion from investing.

**🤖 AI Financial Advisor** - Powered by Cerebras, our AI analyzes your actual portfolio and provides personalized recommendations. Ask "How should I allocate for a house down payment?" and get advice based on your real financial situation.

## How we built it

**Smart Contracts (Solidity)**
- `SmartVault.sol` - Bucket management with percentage-based auto-distribution
- `GoalLocker.sol` - Time-locked savings with milestone event emissions
- `DCAExecutor.sol` - Automated DCA with Uniswap V3 integration
- Built with OpenZeppelin, tested with Hardhat and property-based testing

**Frontend (Next.js 16)**
- TypeScript with strict typing throughout
- Wagmi + Viem for Web3 interactions
- RainbowKit for beautiful wallet connection
- Framer Motion for smooth animations
- Tailwind CSS + shadcn/ui for the UI
- Recharts for data visualization

**AI Integration**
- Cerebras API for fast inference
- Load-balanced across 8 API keys for reliability
- Context-aware prompts that include user's portfolio data

**Infrastructure**
- Deployed on Ethereum Sepolia testnet
- Supabase for transaction history and AI conversation storage
- Vercel-ready deployment configuration

## Challenges we ran into

**Contract-Token Mismatch** - We initially deployed contracts pointing to the real MNEE token address, but needed a mintable test token for demos. Had to redeploy all contracts with a new MockMNEE that has a public mint function.

**Approval Flow UX** - ERC-20 tokens require a two-step process (approve then transfer). Users were confused when their first "deposit" was actually just an approval. We redesigned the UI to clearly show "Approve MNEE" vs "Deposit" states.

**SSR + Web3** - WalletConnect tries to access `indexedDB` during server-side rendering, causing errors. We had to carefully structure our providers to only initialize Web3 on the client side.

**Gas Estimation on Sepolia** - Transactions were getting stuck due to low gas prices. Added a 20% gas price buffer to ensure faster confirmations during demos.

## Accomplishments that we're proud of

✅ **Full working product** - Not just a prototype. Real smart contracts, real transactions, real AI responses.

✅ **Beautiful UX** - Animations, loading states, toast notifications, responsive design. It feels like a real product.

✅ **AI that actually helps** - The advisor sees your real portfolio data and gives contextual advice, not generic tips.

✅ **Clean architecture** - Separation of concerns, typed hooks, reusable components. Code we'd be proud to maintain.

✅ **Test MNEE faucet** - One-click button to get test tokens. No hunting for faucets or bridging from other networks.

## What we learned

- **Property-based testing** catches edge cases unit tests miss. Our bucket percentage validation found bugs we never would have thought to test.

- **Wagmi v2** is a game-changer for Web3 React apps. The hooks-based API with React Query integration makes state management so much cleaner.

- **Cerebras is fast** - Sub-second responses for financial advice. Makes the AI feel like a real conversation, not waiting for ChatGPT.

- **UX matters more than features** - We cut several planned features to polish the core experience. A working demo beats a broken feature list.

## What's next for AutoVault

**Short term (Q1 2025)**
- Mobile app with React Native
- Social savings pools - save together with friends
- Yield optimization - automatically move idle funds to earn interest

**Medium term (Q2 2025)**
- Multi-chain deployment (Arbitrum, Base, Polygon)
- Fiat on-ramp integration
- Recurring deposits from bank accounts
- Enterprise API for fintech integrations

**Long term**
- Credit scoring based on savings behavior
- Micro-loans against locked savings
- Integration with real-world payment systems

---

## Third-Party APIs & SDKs

| API/SDK | Purpose | License |
|---------|---------|---------|
| [Cerebras API](https://cerebras.ai) | AI inference for financial advisor | Commercial API |
| [Supabase](https://supabase.com) | Database & storage | Apache 2.0 |
| [Uniswap V3](https://uniswap.org) | DEX integration for DCA swaps | GPL-2.0 / BSL |
| [OpenZeppelin](https://openzeppelin.com/contracts) | Smart contract libraries | MIT |
| [RainbowKit](https://rainbowkit.com) | Wallet connection UI | MIT |
| [Wagmi](https://wagmi.sh) + [Viem](https://viem.sh) | Web3 React hooks | MIT |
| [shadcn/ui](https://ui.shadcn.com) | UI components | MIT |
| [Framer Motion](https://framer.com/motion) | Animations | MIT |

All licenses are visible in `package.json` dependencies and the project `LICENSE` file.

---

**Links**
- Demo: https://autovaultweb.netlify.app
- Contracts: Sepolia Testnet
- GitHub: https://github.com/AqilaRifti/AutoVault

*AutoVault - Save smarter, not harder.*
