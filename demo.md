# AutoVault Demo Script

## Setup (Before Demo)

1. Start the frontend: `cd frontend && pnpm dev`
2. Open http://localhost:3000
3. Have MetaMask ready with Sepolia network

---

## Demo Flow (5 minutes)

### 1. Connect Wallet (30s)
- Click "Connect Wallet" button
- Select MetaMask
- Approve connection
- **Talking point**: "AutoVault uses your existing wallet - no new accounts needed"

### 2. Get Test Tokens (30s)
- On dashboard, find "Wallet Balance" card
- Click "Get Test MNEE" button
- Wait for transaction to confirm
- Balance updates to $1,000
- **Talking point**: "For the demo, we have a faucet. In production, this would be real MNEE"

### 3. Create Smart Buckets (1 min)
- Navigate to "Buckets" page
- Click "Create Bucket"
- Create 3 buckets:
  - Emergency Fund - 40% - Green
  - Vacation - 30% - Blue  
  - Investments - 30% - Orange
- **Talking point**: "Smart Buckets let you organize savings by purpose with automatic allocation"

### 4. Deposit to Vault (45s)
- Click "Deposit" button
- Enter 500 MNEE
- Click "Approve MNEE" (first transaction)
- Wait for confirmation
- Click "Deposit" (second transaction)
- Watch funds auto-distribute to buckets
- **Talking point**: "Every deposit automatically splits according to your percentages"

### 5. Create a Savings Goal (45s)
- Navigate to "Goals" page
- Click "Create Goal"
- Name: "New Laptop"
- Target: $1,000
- Deadline: 3 months from now
- Deposit $250 to the goal
- See 25% milestone celebration! 🎉
- **Talking point**: "Goals keep you motivated with milestone celebrations"

### 6. Set Up DCA Strategy (45s)
- Navigate to "DCA" page
- Click "Create Strategy"
- Token: WETH
- Amount: $50 per week
- Show the countdown to next execution
- **Talking point**: "DCA removes emotion from investing - set it and forget it"

### 7. Ask AI Advisor (45s)
- Navigate to "AI Advisor" page
- Click "Optimize my buckets" quick action
- Or type: "How should I allocate my savings for a house down payment?"
- Show AI response with personalized advice
- **Talking point**: "Our AI advisor analyzes your actual portfolio and gives tailored recommendations"

### 8. Dashboard Overview (15s)
- Return to Dashboard
- Show all widgets updating in real-time
- Point out the clean, modern UI
- **Talking point**: "Everything in one place - your complete financial picture"

---

## Key Demo Points

### Technical Highlights
- ✅ Real smart contracts on Sepolia
- ✅ Live blockchain transactions
- ✅ AI integration with Cerebras
- ✅ Responsive design (show mobile view)

### Business Value
- 💰 Makes saving automatic and organized
- 🎯 Goal tracking keeps users engaged
- 📈 DCA removes emotional investing
- 🤖 AI makes finance accessible

### Differentiators
- Built specifically for MNEE ecosystem
- Combines multiple DeFi primitives in one UX
- AI-powered personalization
- Beautiful, intuitive interface

---

## Backup Plans

**If transaction is slow:**
"Sepolia can be slow sometimes - in production on mainnet, this would be much faster"

**If AI is slow:**
"We're using Cerebras for fast inference - sometimes there's a queue"

**If something breaks:**
Show the architecture diagram and explain the technical implementation

---

## Q&A Prep

**Q: How do you make money?**
A: Future plans include premium AI features, yield optimization fees, and enterprise API access

**Q: Is this audited?**
A: This is a hackathon prototype. Production deployment would require full security audit

**Q: Why MNEE?**
A: Stablecoins are perfect for savings - no volatility. MNEE's growing ecosystem makes it ideal

**Q: What about gas fees?**
A: We're on Ethereum L1 now. Future versions could use L2s for lower fees

**Q: How does the AI work?**
A: We use Cerebras API with load-balanced keys. The AI sees your portfolio data and provides contextual advice
