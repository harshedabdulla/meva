# MEVA Protocol Documentation

Welcome to MEVA — the MEV capture and redistribution protocol.

---

## Quick Navigation

| Section | Description |
|---------|-------------|
| [Overview](#overview) | What is MEVA? (2 min read) |
| [How It Works](#how-it-works) | Simple explanation (5 min read) |
| [Getting Started](#getting-started) | Run locally in 5 minutes |
| [Core Concepts](#core-concepts) | Understanding MEV and hooks |
| [Smart Contracts](#smart-contracts) | Technical deep dive |
| [API Reference](#api-reference) | Backend endpoints |
| [Integration Guide](#integration-guide) | Add MEVA to your protocol |
| [Resources](#resources) | Learn more |

---

# Overview

## The One-Liner

> **MEVA captures value from MEV bots and returns it to the community.**

## The Problem (30 seconds)

Every time you swap tokens on a DEX, bots may be watching:

```
You: Swap 10 ETH → USDC

Bot sees your transaction...
  1. Bot buys USDC first (price goes up)
  2. Your swap executes at worse price
  3. Bot sells USDC (profits from your loss)

Result: You lost ~$50, bot gained ~$50
```

This is called a **sandwich attack**. It happens thousands of times daily, extracting millions from regular users.

## The Solution (30 seconds)

MEVA is a Uniswap V4 hook that:

1. **Detects** bots before they swap
2. **Taxes** their profits (10-50%)
3. **Redistributes** to victims, LPs, and stakers

```
Without MEVA:
  User Loss → Bot Profit

With MEVA:
  User Loss → Bot Taxed → User Gets Rebate
```

## Key Numbers

| Metric | Value |
|--------|-------|
| Bot tax (unlicensed) | 50% |
| Bot tax (licensed) | 10% |
| LP share | 50% |
| Victim rebate | 30% |
| Staker rewards | 20% |

---

# How It Works

## Step 1: Detection

When a swap comes into a MEVA-enabled pool, the hook analyzes the transaction:

```
Incoming Swap
     │
     ▼
┌─────────────────────────────────────┐
│         Bot Detection               │
│                                     │
│  ✓ Known bot registry?    (+100)    │
│  ✓ High gas price?        (+35)     │
│  ✓ Contract caller?       (+25)     │
│  ✓ Large swap?            (+15)     │
│  ✓ Rapid-fire swaps?      (+20)     │
│  ✓ High frequency?        (+10)     │
│                                     │
│  Confidence Score: 0-100            │
└─────────────────────────────────────┘
     │
     ▼
  Tax Rate Applied
```

## Step 2: Classification

| Confidence | Classification | Tax Rate |
|------------|---------------|----------|
| 80-100 | Confirmed Bot (unlicensed) | **50%** |
| 80-100 | Confirmed Bot (licensed) | **10%** |
| 60-79 | Suspicious | **25%** |
| 0-59 | Normal User | **0.3%** |

## Step 3: Tax Collection

```solidity
// Simplified flow
function beforeSwap(sender, params) {
    confidence = analyzeTransaction(sender);
    taxRate = getTaxRate(confidence);
    return taxRate; // Applied as dynamic fee
}
```

The tax is collected automatically as part of the swap via Uniswap V4's dynamic fee mechanism.

## Step 4: Distribution

Collected taxes flow to the MevaVault:

```
Total Collected: 100 ETH
        │
        ├── 50 ETH → LP Pool (50%)
        │             └── Distributed proportionally to liquidity providers
        │
        ├── 30 ETH → Victim Pool (30%)
        │             └── Claimable by identified sandwich victims
        │
        └── 20 ETH → Staker Pool (20%)
                      └── Rewards for protocol stakers
```

## Step 5: Claiming

Users connect their wallet and claim their share:

- **LPs**: Claim based on their liquidity share
- **Victims**: Claim rebates from identified sandwich attacks
- **Stakers**: Claim based on staked amount

---

# Getting Started

## Prerequisites

- Node.js 18+
- Git
- Foundry (for contracts)

## Quick Start (5 minutes)

### 1. Clone the repo

```bash
git clone https://github.com/your-org/meva.git
cd meva
```

### 2. Run the contracts tests

```bash
cd contracts
forge install
forge test
```

Expected output: `61 tests passing`

### 3. Start the backend

```bash
cd apps/backend
npm install
npm run dev
```

Server starts at `http://localhost:3001`

### 4. Start the frontend

```bash
cd apps/frontend
npm install
npm run dev
```

Dashboard at `http://localhost:5173`

## Project Structure

```
meva/
├── contracts/              # Smart contracts (Foundry)
│   ├── src/
│   │   ├── MevaHook.sol    # Uniswap V4 hook
│   │   ├── MevaVault.sol   # Dividend distribution
│   │   └── BotRegistry.sol # Bot tracking
│   └── test/               # 61 tests
│
├── apps/
│   ├── frontend/           # React dashboard
│   │   └── src/
│   │       ├── components/
│   │       └── lib/
│   │
│   └── backend/            # Express API
│       └── src/
│           ├── index.ts    # Server + WebSocket
│           └── indexer.ts  # Event indexing
│
├── docs/                   # Documentation
├── learn.md               # MEV education
└── resources.md           # Learning resources
```

---

# Core Concepts

## What is MEV?

**MEV (Maximal Extractable Value)** is profit extracted by reordering, inserting, or censoring transactions within a block.

### Common MEV Types

| Type | Description | Who Profits |
|------|-------------|-------------|
| **Sandwich** | Front-run + back-run a user's swap | Bot |
| **Arbitrage** | Exploit price differences across DEXes | Bot (neutral) |
| **Liquidation** | Liquidate underwater positions | Bot |
| **JIT Liquidity** | Add/remove liquidity around large swaps | Bot |

### Why It Matters

- **$600M+** extracted on Ethereum since 2020
- **$1-5M** extracted daily
- Regular users pay an invisible "MEV tax"

## What is a Uniswap V4 Hook?

Hooks are smart contracts that run at specific points during pool operations:

```
Pool Lifecycle
      │
      ├── beforeInitialize()
      ├── afterInitialize()
      │
      ├── beforeAddLiquidity()
      ├── afterAddLiquidity()
      │
      ├── beforeRemoveLiquidity()
      ├── afterRemoveLiquidity()
      │
      ├── beforeSwap()        ← MEVA detects bots here
      ├── afterSwap()         ← MEVA records captures here
      │
      └── beforeDonate()
          afterDonate()
```

MEVA uses `beforeSwap` to analyze transactions and apply dynamic fees.

## Bot Detection Signals

MEVA uses multiple heuristics to identify bots:

### 1. Registry Lookup
```solidity
if (botRegistry.isKnownBot(sender)) {
    return 100; // 100% confidence
}
```

### 2. Gas Price Analysis
```solidity
if (tx.gasprice > averageGasPrice * 3) {
    confidence += 35; // Bots pay premium for priority
}
```

### 3. Contract Detection
```solidity
if (sender.code.length > 0) {
    confidence += 25; // Bots typically use contracts
}
```

### 4. Swap Pattern Analysis
```solidity
if (recentSwaps[sender] > 0) {
    confidence += 20; // Same-block swaps = suspicious
}
```

## Licensed vs Unlicensed Bots

MEVA offers a licensing system:

| Status | Tax Rate | Fee |
|--------|----------|-----|
| Unlicensed | 50% | - |
| Licensed | 10% | 0.1 ETH one-time |

**Why would a bot get licensed?**

- Predictable costs
- Lower tax rate
- Legitimacy signal

---

# Smart Contracts

## Contract Addresses

> Note: Update after deployment

| Contract | Sepolia | Mainnet |
|----------|---------|---------|
| MevaHook | `0x...` | `0x...` |
| MevaVault | `0x...` | `0x...` |
| BotRegistry | `0x...` | `0x...` |

## MevaHook.sol

The core hook that integrates with Uniswap V4.

### Key Functions

```solidity
// Called before every swap
function beforeSwap(
    address sender,
    PoolKey calldata key,
    IPoolManager.SwapParams calldata params,
    bytes calldata hookData
) external returns (bytes4, BeforeSwapDelta, uint24)
```

### Bot Analysis

```solidity
function analyzeTransaction(address sender)
    internal view returns (uint256 confidence, bool isBot)
{
    // 1. Check registry
    if (botRegistry.isKnownBot(sender)) {
        return (100, true);
    }

    // 2. Gas price check
    if (tx.gasprice > averageGasPrice * 3) {
        confidence += 35;
    }

    // 3. Contract check
    if (sender.code.length > 0) {
        confidence += 25;
    }

    // 4. Large swap check
    if (swapAmount > LARGE_THRESHOLD) {
        confidence += 15;
    }

    // 5. Rapid-fire check
    if (lastSwapBlock[sender] == block.number) {
        confidence += 20;
    }

    // 6. Frequency check
    if (swapCount[sender] > 100) {
        confidence += 10;
    }

    isBot = confidence >= 60;
}
```

### Tax Calculation

```solidity
function calculateTaxRate(uint256 confidence, bool isLicensed)
    internal pure returns (uint24)
{
    if (confidence >= 80) {
        return isLicensed ? 1000 : 5000; // 10% or 50%
    }
    if (confidence >= 60) {
        return 2500; // 25%
    }
    return 30; // 0.3%
}
```

## MevaVault.sol

Handles dividend distribution.

### Distribution Ratios

```solidity
uint256 public constant LP_SHARE = 50;      // 50%
uint256 public constant VICTIM_SHARE = 30;  // 30%
uint256 public constant STAKER_SHARE = 20;  // 20%
```

### Key Functions

```solidity
// Receive tax from hook
function receiveTax(address bot, address token, uint256 amount) external

// Claim functions
function claimLPDividend() external returns (uint256)
function claimRebate() external returns (uint256)
function claimStakerReward() external returns (uint256)

// View functions
function pendingLPDividend(address lp) external view returns (uint256)
function pendingRebate(address victim) external view returns (uint256)
function pendingStakerReward(address staker) external view returns (uint256)

// Stats
function getStats() external view returns (
    uint256 totalCollected,
    uint256 totalDistributed,
    uint256 currentEpoch
)
```

### Dividend Calculation (MasterChef pattern)

```solidity
// Accumulated dividend per share (scaled by 1e12)
uint256 public accDividendPerLPShare;

// Calculate pending dividend
function pendingLPDividend(address lp) public view returns (uint256) {
    uint256 lpShare = lpShares[lp];
    uint256 pending = (lpShare * accDividendPerLPShare / 1e12) - lpDebt[lp];
    return pending;
}
```

## BotRegistry.sol

Tracks known bots and licenses.

### Key Functions

```solidity
// Query functions
function isKnownBot(address bot) external view returns (bool)
function isLicensed(address bot) external view returns (bool)
function botCount() external view returns (uint256)

// Registration
function registerAsLicensed() external payable // 0.1 ETH fee

// Admin functions (owner only)
function addBot(address bot) external
function removeBot(address bot) external
function addBotsBatch(address[] calldata bots) external
function revokeLicense(address bot) external
```

### Events

```solidity
event BotAdded(address indexed bot);
event BotRemoved(address indexed bot);
event BotLicensed(address indexed bot, uint256 fee);
event LicenseRevoked(address indexed bot);
```

---

# API Reference

## Base URL

```
http://localhost:3001
```

## Endpoints

### Health Check

```
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": 1738765432000
}
```

### Protocol Stats

```
GET /api/stats
```

Response:
```json
{
  "totalCaptured": "125.4532",
  "totalDistributed": "98.2100",
  "currentEpoch": 12,
  "captureCount": 1543,
  "botCount": 47
}
```

### Recent Captures

```
GET /api/captures?limit=50
```

Response:
```json
[
  {
    "id": "0xabc...-0",
    "bot": "0x1234...",
    "confidence": 85,
    "taxRate": 5000,
    "taxAmount": "0.2341",
    "txHash": "0xabc...",
    "blockNumber": "18543210",
    "timestamp": 1738765432000
  }
]
```

### Bot Leaderboard

```
GET /api/bots
```

Response:
```json
[
  {
    "address": "0x1234...",
    "isLicensed": true,
    "totalTaxPaid": "12.4532",
    "captureCount": 342
  }
]
```

### Specific Bot

```
GET /api/bots/:address
```

Response:
```json
{
  "address": "0x1234...",
  "isLicensed": true,
  "totalTaxPaid": "12.4532",
  "captureCount": 342
}
```

### User Dividends

```
GET /api/dividends/:address?chain=sepolia
```

Response:
```json
{
  "lpDividend": "0.5432",
  "victimRebate": "0.1234",
  "stakerReward": "0.0821"
}
```

## WebSocket

```
ws://localhost:3001/ws
```

### Connection

On connect, receives recent captures:
```json
{
  "type": "init",
  "data": [/* recent captures */]
}
```

### Events

New capture:
```json
{
  "type": "capture",
  "data": {
    "id": "...",
    "bot": "0x...",
    "confidence": 85,
    "taxRate": 5000,
    "taxAmount": "0.2341",
    "txHash": "0x...",
    "blockNumber": "18543210",
    "timestamp": 1738765432000
  }
}
```

Bot licensed:
```json
{
  "type": "botLicensed",
  "data": {
    "bot": "0x..."
  }
}
```

---

# Integration Guide

## For Pool Creators

Deploy a pool with MEVA hook:

```solidity
import {IPoolManager} from "v4-core/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/types/PoolKey.sol";

// Create pool with MEVA hook
PoolKey memory key = PoolKey({
    currency0: Currency.wrap(address(token0)),
    currency1: Currency.wrap(address(token1)),
    fee: 3000,
    tickSpacing: 60,
    hooks: IHooks(mevaHookAddress)
});

poolManager.initialize(key, sqrtPriceX96);
```

## For Frontend Developers

### Read Stats

```typescript
import { useReadContract } from 'wagmi';
import { MEVA_VAULT_ABI, CONTRACTS } from './contracts';

function Stats() {
  const { data: stats } = useReadContract({
    address: CONTRACTS.sepolia.mevaVault,
    abi: MEVA_VAULT_ABI,
    functionName: 'getStats',
  });

  return (
    <div>
      <p>Total: {formatEther(stats[0])} ETH</p>
      <p>Epoch: {stats[2].toString()}</p>
    </div>
  );
}
```

### Claim Dividends

```typescript
import { useWriteContract } from 'wagmi';

function ClaimButton() {
  const { writeContract } = useWriteContract();

  const handleClaim = () => {
    writeContract({
      address: CONTRACTS.sepolia.mevaVault,
      abi: MEVA_VAULT_ABI,
      functionName: 'claimLPDividend',
    });
  };

  return <button onClick={handleClaim}>Claim</button>;
}
```

### WebSocket for Live Feed

```typescript
useEffect(() => {
  const ws = new WebSocket('ws://localhost:3001/ws');

  ws.onmessage = (event) => {
    const { type, data } = JSON.parse(event.data);
    if (type === 'capture') {
      setCaptures(prev => [data, ...prev.slice(0, 19)]);
    }
  };

  return () => ws.close();
}, []);
```

## For Bot Operators

### Check License Status

```typescript
const isLicensed = await botRegistry.read.isLicensed([botAddress]);
```

### Register as Licensed

```typescript
await botRegistry.write.registerAsLicensed({
  value: parseEther('0.1'),
});
```

---

# Resources

## Learn About MEV

| Resource | Level | Link |
|----------|-------|------|
| Ethereum.org MEV | Beginner | [Link](https://ethereum.org/developers/docs/mev/) |
| Chainlink MEV Explainer | Beginner | [Link](https://chain.link/education-hub/maximal-extractable-value-mev) |
| Flashbots Writings | Intermediate | [Link](https://writings.flashbots.net/) |
| Flash Boys 2.0 Paper | Advanced | [Link](https://arxiv.org/abs/1904.05234) |

## Learn Solidity

| Resource | Level | Link |
|----------|-------|------|
| CryptoZombies | Beginner | [Link](https://cryptozombies.io/) |
| Cyfrin Updraft | Beginner-Intermediate | [Link](https://updraft.cyfrin.io/) |
| Alchemy University | Intermediate | [Link](https://www.alchemy.com/university) |

## Learn Uniswap V4

| Resource | Level | Link |
|----------|-------|------|
| V4 Overview | Beginner | [Link](https://docs.uniswap.org/contracts/v4/overview) |
| Hooks Concept | Beginner | [Link](https://docs.uniswap.org/contracts/v4/concepts/hooks) |
| Your First Hook | Intermediate | [Link](https://docs.uniswap.org/contracts/v4/guides/hooks/your-first-hook) |
| Awesome V4 Hooks | All levels | [Link](https://github.com/johnsonstephan/awesome-uniswap-v4-hooks) |

## Tools

| Tool | Purpose | Link |
|------|---------|------|
| EigenPhi | MEV analysis | [Link](https://eigenphi.io/) |
| Flashbots Explorer | MEV dashboard | [Link](https://explore.flashbots.net/) |
| Foundry | Smart contract dev | [Link](https://getfoundry.sh/) |
| Tenderly | Transaction simulation | [Link](https://tenderly.co/) |

## Communities

| Community | Platform | Link |
|-----------|----------|------|
| Flashbots | Discord | [Link](https://discord.gg/flashbots) |
| Uniswap | Discord | [Link](https://discord.gg/uniswap) |
| Ethereum R&D | Discord | [Link](https://discord.gg/ethereum) |

---

## Full Documentation

For deeper learning:

- [`learn.md`](../learn.md) — Complete MEV education
- [`resources.md`](../resources.md) — Curated learning resources
- [`contracts/README.md`](../contracts/README.md) — Contract documentation

---

## Support

- GitHub Issues: [Report bugs](https://github.com/your-org/meva/issues)
- Discord: Join our community
- Twitter: [@meva_protocol](https://twitter.com/meva_protocol)

---

*MEVA Protocol — Redistributing MEV to the People*
